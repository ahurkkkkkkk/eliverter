package pipeline

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/TenOFSwordsr/eliverter/internal/accel"
	"github.com/TenOFSwordsr/eliverter/internal/registry"
)

// Request describes one conversion. Every field is optional except Input and
// Output; unset codec fields are resolved from the target container defaults.
type Request struct {
	Input  string
	Output string

	TargetContainer string // registry key, e.g. "webm"
	VideoCodec      string // registry key, e.g. "vp9"
	AudioCodec      string // registry key, e.g. "opus"

	StreamCopy bool // mux without re-encoding when codecs already fit the container
	NoVideo    bool
	NoAudio    bool

	CRF              int
	BitrateKbps      int
	TwoPass          bool
	FPS              float64
	Width            int
	Height           int
	PixelFormat      string
	Preset           string // encoder speed preset
	AudioBitrateKbps int
	SampleRate       int
	Channels         int

	StartTime     float64
	Duration      float64
	ExtraFilters  []string
	CustomFilters string
	// FilterComplex is a full graph taking [0:v] and emitting one labeled or
	// implicit output. It replaces -vf when set, and is how single-pass palette
	// quantisation for GIF and indexed WebP is expressed.
	FilterComplex string

	StripMetadata bool // drop EXIF/XMP/ICC so sticker parsers do not reject the file
	// Erase keys the background out of the video stream. Nil leaves the frame
	// alone. Its Color must already be resolved: BuildPlan runs no subprocess.
	Erase *Erase
}

// Plan is a resolved, executable argument set plus the reasoning behind it.
type Plan struct {
	Args         []string
	VideoEncoder string
	AudioEncoder string
	Muxer        string
	PixelFormat  string
	FilterGraph  string
	Notes        []string
	TwoPass      bool
	// ExperimentalEncoder records that a selected encoder is gated behind
	// -strict -2. FFmpeg refuses it with exit status 88 otherwise.
	ExperimentalEncoder bool
}

// Resolver binds a Registry and discovered Caps to a binary set.
type Resolver struct {
	Bin  Binaries
	Reg  *registry.Registry
	Caps *Caps
}

// ErrNoEncoder means the local FFmpeg cannot produce the requested output at all.
var ErrNoEncoder = errors.New("pipeline: no usable encoder in this FFmpeg build")

// BuildPlan turns a Request into concrete ffmpeg arguments.
func (r *Resolver) BuildPlan(req *Request, info *MediaInfo) (*Plan, error) {
	if req.Input == "" || req.Output == "" {
		return nil, errors.New("pipeline: input and output paths are required")
	}
	notes := make([]string, 0, 4)

	cont, inferenceNote, err := r.resolveContainer(req)
	if err != nil {
		return nil, err
	}
	if inferenceNote != "" {
		notes = append(notes, inferenceNote)
	}
	plan := &Plan{Muxer: cont.Key, Notes: notes}
	// complexGraph starts as the caller's graph and may be replaced below when a
	// format needs its filters arranged a particular way.
	complexGraph := req.FilterComplex

	wantVideo := !req.NoVideo && (info == nil || info.VideoCodec != "")
	// Image containers cannot hold an audio track: PNG, GIF, WebP and the still
	// formats are silent by definition, so a source's audio is dropped here
	// rather than reaching a muxer that would reject the whole output.
	wantAudio := !req.NoAudio && cont.Kind != registry.KindImage &&
		(info == nil || info.AudioCodec != "")
	// Mirror case: an audio-only container has nowhere to put a video track.
	wantVideo = wantVideo && cont.Kind != registry.KindAudio

	if wantVideo {
		vk := req.VideoCodec
		if vk == "" {
			vk = r.Reg.DefaultVideoCodec(cont.Key)
		}
		enc, exp, err := r.pickEncoder(vk, cont, true)
		switch {
		case err == nil:
			plan.VideoEncoder = enc
			plan.ExperimentalEncoder = plan.ExperimentalEncoder || exp
		case wantAudio:
			plan.Notes = append(plan.Notes, "video track dropped: "+err.Error())
			wantVideo = false
		default:
			return nil, err
		}
	}
	if wantAudio {
		ak := req.AudioCodec
		if ak == "" {
			ak = r.Reg.DefaultAudioCodec(cont.Key)
		}
		enc, exp, err := r.pickEncoder(ak, cont, false)
		switch {
		case err == nil:
			plan.AudioEncoder = enc
			plan.ExperimentalEncoder = plan.ExperimentalEncoder || exp
		default:
			plan.Notes = append(plan.Notes, "audio track dropped: "+err.Error())
			wantAudio = false
		}
	}
	if !wantVideo && !wantAudio {
		return nil, ErrNothingToEncode
	}

	// A raw audio stream has nowhere to live without its track.
	if info != nil && info.VideoCodec == "" && !wantAudio {
		return nil, ErrNothingToEncode
	}

	erase, err := req.Erase.normalized()
	if err != nil {
		return nil, err
	}
	if erase != nil {
		if !wantVideo {
			return nil, errors.New("pipeline: there is no video track to erase a background from")
		}
		if !SupportsAlphaTarget(r.Reg, cont.Key) {
			return nil, fmt.Errorf("%w: %s cannot keep it -- try webm, gif, webp or png",
				ErrNoAlpha, cont.Name)
		}
		if erase.Color == "" {
			return nil, errors.New("pipeline: erase colour was never resolved")
		}
		// A GIF's transparency comes from its palette, so keying must happen inside
		// the quantiser graph: handing the gif encoder rgba produces a matte of the
		// backdrop colour instead of an alpha index.
		if cont.Key == "gif" && req.FilterComplex == "" {
			complexGraph = paletteGraphWith(erase.Filters(), req.Width, req.Height,
				graphFPS(req, info), 0)
		}
	}

	args := make([]string, 0, 24)
	if req.StartTime > 0 {
		args = append(args, "-ss", formatSeconds(req.StartTime))
	}
	if req.Duration > 0 {
		args = append(args, "-t", formatSeconds(req.Duration))
	}
	args = append(args, "-i", req.Input)

	// A complex graph labels its own output, so the bare stream map is skipped:
	// emitting both would hand the muxer two video tracks.
	useComplex := wantVideo && complexGraph != ""

	switch {
	case useComplex:
	case wantVideo:
		args = append(args, "-map", "v:0?")
	default:
		args = append(args, "-vn")
	}
	if wantAudio {
		args = append(args, "-map", "a:0?")
	} else {
		args = append(args, "-an")
	}

	if req.StreamCopy && r.canCopy(cont, plan, req) {
		args = append(args, "-c", "copy")
		plan.Args = append(args, movflagsFor(cont.Key)...)
		plan.Notes = append(plan.Notes, "stream copy: codecs already legal for target")
		if req.StripMetadata {
			plan.Args = append(plan.Args, "-map_metadata", "-1")
		}
		plan.Args = append(plan.Args, req.Output)
		return plan, nil
	}
	if req.StreamCopy {
		plan.Notes = append(plan.Notes, "stream copy unavailable: re-encoding")
	}

	// Keying leads the chain: scale and pad should operate on pixels that are
	// already transparent, or a backdrop gets resampled into the subject's edge.
	filters := erase.Filters()
	filters = append(filters, r.videoFilters(req, info)...)
	if req.CustomFilters != "" {
		filters = append(filters, strings.TrimSpace(req.CustomFilters))
	}
	filters = append(filters, req.ExtraFilters...)
	if wantVideo && complexGraph == "" && len(filters) > 0 {
		plan.FilterGraph = strings.Join(filters, ",")
	}

	if wantVideo {
		args = append(args, "-c:v", plan.VideoEncoder)
		switch {
		case complexGraph != "":
			args = append(args, "-filter_complex", complexGraph, "-map", "[out]")
		case plan.FilterGraph != "":
			args = append(args, "-vf", plan.FilterGraph)
		}
		if pix := r.pixelFormatFor(cont, plan.VideoEncoder, req); pix != "" {
			plan.PixelFormat = pix
			args = append(args, "-pix_fmt", pix)
			// Both libvpx encoders discard the alpha plane when alternate
			// reference frames are on: VP9 does it silently, VP8 refuses to open.
			if altRefIncompatible(plan.VideoEncoder) && strings.HasPrefix(pix, "yuva") {
				args = append(args, "-auto-alt-ref", "0")
			}
		}
		// FFmpeg hands libvpx's VP8 encoder a 25-frame lookahead by default and
		// this build rejects it outright -- "g_lag_in_frames out of range [..0]" --
		// so every plain VP8 encode died at open. VP9 accepts the default. Measured
		// on the emulator: no flag produces 0 bytes, -lag-in-frames 0 produces a
		// valid stream.
		if plan.VideoEncoder == "libvpx" {
			args = append(args, "-lag-in-frames", "0")
		}
		if req.FPS > 0 {
			args = append(args, "-r", strconv.FormatFloat(req.FPS, 'f', -1, 64))
		}
		// A still-image muxer (image2 and friends) refuses to write several
		// frames to one filename, so a video source must collapse to one frame.
		// Animation-capable containers keep every frame only when the caller asked
		// for animation or the format is understood to mean animation: a 2-second
		// clip into WebP is a photo, a 2-second clip into GIF is a clip. Without
		// this, video-to-WebP produced a 50-frame file that reads as corrupt.
		wantsAnimation := req.FPS > 0 || req.Duration > 0 ||
			(info != nil && info.IsAnimatedImage) || animatesByDefault[cont.Key]
		if cont.Kind == registry.KindImage && (!animationCapable[cont.Key] || !wantsAnimation) {
			args = append(args, "-frames:v", "1")
		}
		args = append(args, rateArgs(req, plan.VideoEncoder, r.Reg)...)
		if p := encoderPreset(plan.VideoEncoder, req.Preset); p != nil {
			args = append(args, p...)
		}
	}
	if wantAudio {
		args = append(args, "-c:a", plan.AudioEncoder)
		ab := req.AudioBitrateKbps
		if ab <= 0 {
			ab = defaultAudioKbps(plan.AudioEncoder)
		}
		if ab > 0 {
			args = append(args, "-b:a", strconv.Itoa(ab)+"k")
		}
		if req.SampleRate > 0 {
			args = append(args, "-ar", strconv.Itoa(req.SampleRate))
		}
		// FFmpeg's native Vorbis encoder implements stereo only and fails when it
		// opens a mono track; libvorbis has no such limit, so this only bites on a
		// build that fell back to the experimental encoder. Otherwise -ac stays
		// exactly as optional as it was: the source layout is left alone.
		ch := req.Channels
		if ch == 0 && plan.AudioEncoder == "vorbis" && info != nil && info.Channels == 1 {
			ch = 2
			plan.Notes = append(plan.Notes,
				"vorbis: mono widened to stereo, the native encoder is stereo-only")
		}
		if ch > 0 {
			args = append(args, "-ac", strconv.Itoa(ch))
		}
	}

	if req.StripMetadata {
		args = append(args, "-map_metadata", "-1", "-map_chapters", "-1", "-dn")
	}
	// Only the native Vorbis/Opus encoders can write these streams in a build
	// without libvorbis/libopus, and FFmpeg gates them behind -strict.
	if plan.ExperimentalEncoder {
		args = append(args, "-strict", "-2")
	}
	args = append(args, movflagsFor(cont.Key)...)
	args = append(args, req.Output)

	plan.Args = args
	plan.TwoPass = req.TwoPass && wantVideo && req.BitrateKbps > 0 && supportsTwoPass(plan.VideoEncoder)
	return plan, nil
}

// resolveContainer finds the target container, reporting how it was chosen.
// The second result is a note for the caller's plan, empty unless the container
// had to be guessed from the output extension.
func (r *Resolver) resolveContainer(req *Request) (*registry.Container, string, error) {
	if req.TargetContainer != "" {
		if c, ok := r.Reg.ContainerByKey(req.TargetContainer); ok {
			return c, "", nil
		}
		// Accept a raw ffmpeg muxer id that is not in the taxonomy.
		return &registry.Container{Key: req.TargetContainer}, "", nil
	}
	ext := registry.NormalizeExt(req.Output)
	if ext == "" {
		return nil, "", errors.New("pipeline: cannot infer a target container, set target_format")
	}
	if c, ok := r.Reg.ContainerForExtension(ext); ok {
		return c, "", nil
	}
	return &registry.Container{Key: strings.TrimPrefix(ext, ".")},
		"target container inferred from extension " + ext, nil
}

// graphFPS is the frame rate to bake into a palette graph. An fps filter ahead
// of palettegen on a single-frame source makes the quantiser emit nothing at
// all -- the conversion "succeeds" with a 0-byte file -- so a still source keeps
// its own rate and the graph goes without one.
func graphFPS(req *Request, info *MediaInfo) float64 {
	if info != nil && info.FrameCount <= 1 && info.DurationSeconds <= 0 {
		return 0
	}
	return req.FPS
}

// pickEncoder resolves a codec key to an encoder id actually present in this
// build. A normal encoder always beats an experimental one: FFmpeg refuses
// experimental encoders with exit status 88 unless -strict -2 is also passed,
// and the native Vorbis/Opus encoders are experimental in every build today.
func (r *Resolver) pickEncoder(codecKey string, cont *registry.Container, video bool) (string, bool, error) {
	kind := registry.KindAudio
	if video {
		kind = registry.KindVideo
	}
	codec, ok := r.Reg.CodecByKey(codecKey)
	if !ok {
		// Not in the taxonomy: accept it if the build claims to have it.
		if usable, exp := r.Caps.UsableEncoder(codecKey); usable {
			return codecKey, exp, nil
		}
		return "", false, fmt.Errorf("%w: %q", ErrNoEncoder, codecKey)
	}
	if codec.Kind != kind && codec.Kind != registry.KindImage {
		return "", false, fmt.Errorf("pipeline: %s is a %s codec, not %s", codec.Name, codec.Kind, kind)
	}
	if video && !r.Reg.LegalVideoCodec(cont.Key, codec.Key) {
		return "", false, fmt.Errorf("pipeline: %s cannot be muxed into %s", codec.Name, cont.Name)
	}
	if !video && !r.Reg.LegalAudioCodec(cont.Key, codec.Key) {
		return "", false, fmt.Errorf("pipeline: %s cannot be muxed into %s", codec.Name, cont.Name)
	}
	candidates := dedupe(append(append([]string{}, codec.Encoders...), codec.FFmpegNames...))
	if len(r.Caps.UsableEncoders()) == 0 {
		if len(codec.Encoders) > 0 {
			return codec.Encoders[0], false, nil
		}
		return "", false, fmt.Errorf("%w: %s is decode-only here", ErrNoEncoder, codec.Name)
	}
	for _, c := range candidates {
		if usable, exp := r.Caps.UsableEncoder(c); usable && !exp {
			return c, false, nil
		}
	}
	for _, c := range candidates {
		if usable, exp := r.Caps.UsableEncoder(c); usable && exp {
			return c, true, nil
		}
	}
	return "", false, fmt.Errorf("%w: %s (build lacks %s)", ErrNoEncoder, codec.Name,
		strings.Join(candidates, "/"))
}

// canCopy reports whether every stream already satisfies the target container.
func (r *Resolver) canCopy(cont *registry.Container, plan *Plan, req *Request) bool {
	if req.CustomFilters != "" || len(req.ExtraFilters) > 0 || req.Width > 0 || req.Height > 0 ||
		req.FPS > 0 || req.StartTime > 0 || req.Duration > 0 {
		return false
	}
	return plan.VideoEncoder == "" || r.Reg.LegalVideoCodec(cont.Key, vCodecKey(plan.VideoEncoder))
}

// animationCapable lists the image containers that legitimately hold more than
// one frame; every other still-image muxer gets a single frame.
var animationCapable = map[string]bool{
	"gif": true, "webp": true, "avif": true, "heif": true, "jxl": true,
}

// animatesByDefault narrows that set to the formats a caller means to animate
// when they only say "make me one of these": nobody converts a video to GIF to
// get one frame. WebP, AVIF, HEIF and JXL are stills first.
var animatesByDefault = map[string]bool{"gif": true}

func (r *Resolver) videoFilters(req *Request, info *MediaInfo) []string {
	f := make([]string, 0, 3)
	if req.Width > 0 || req.Height > 0 {
		f = append(f, scaleFilter(req))
	}
	if req.FPS > 0 {
		f = append(f, "fps="+strconv.FormatFloat(req.FPS, 'f', -1, 64))
	}
	return f
}

func scaleFilter(req *Request) string {
	switch {
	case req.Width > 0 && req.Height > 0:
		return fmt.Sprintf("scale=%d:%d:force_original_aspect_ratio=decrease", req.Width, req.Height)
	case req.Width > 0:
		return fmt.Sprintf("scale=%d:-2", req.Width)
	default:
		return fmt.Sprintf("scale=-2:%d", req.Height)
	}
}

// altRefEncoders lists the encoders whose alternate-reference-frame mode fights
// an alpha plane. Both libvpx paths need -auto-alt-ref 0 to keep transparency,
// and both are asked for by name in the taxonomy.
var altRefEncoders = map[string]bool{"libvpx": true, "libvpx-vp9": true}

func altRefIncompatible(encoder string) bool { return altRefEncoders[encoder] }

func (r *Resolver) pixelFormatFor(cont *registry.Container, encoder string, req *Request) string {
	if req.PixelFormat != "" {
		return req.PixelFormat
	}
	if cont.Kind == registry.KindImage {
		return ""
	}
	if altRefIncompatible(encoder) && r.Reg.SupportsAlpha(cont.Key) {
		return "yuva420p"
	}
	return "yuv420p"
}

func rateArgs(req *Request, encoder string, reg *registry.Registry) []string {
	switch {
	case req.BitrateKbps > 0:
		return []string{
			"-b:v", strconv.Itoa(req.BitrateKbps) + "k",
			"-maxrate", strconv.Itoa(int(float64(req.BitrateKbps)*1.45)) + "k",
			"-bufsize", strconv.Itoa(req.BitrateKbps*2) + "k",
		}
	case req.CRF > 0:
		return crfFlag(encoder, req.CRF)
	default:
		if c, ok := reg.CodecByKey(vCodecKey(encoder)); ok && c.DefaultCRF > 0 {
			return crfFlag(encoder, c.DefaultCRF)
		}
	}
	return nil
}

func crfFlag(encoder string, crf int) []string {
	if !acceptsCRF(encoder) {
		return nil
	}
	switch encoder {
	case "libmp3lame":
		return []string{"-q:a", strconv.Itoa(clamp(crf, 0, 9))}
	case "mjpeg", "libwebp", "webp":
		return []string{"-q:v", strconv.Itoa(clamp(crf, 1, 31))}
	case "gif":
		// The GIF encoder exposes no quality option; size is driven by palette
		// entries, canvas and frame count, so emitting -crf here only fails.
		return nil
	case "flac", "alac", "png", "bmp", "utvideo", "ffv1", "ffvhuff":
		return nil
	}
	return []string{"-crf", strconv.Itoa(crf)}
}

func encoderPreset(encoder, wanted string) []string {
	p := wanted
	if p == "" {
		p = "medium"
	}
	switch encoder {
	case "libx264":
		return []string{"-preset", p, "-profile:v", "high"}
	case "libx265":
		return []string{"-preset", p, "-profile:v", "main"}
	case "libsvtav1":
		return []string{"-preset", strconv.Itoa(presetToAv1Preset(p))}
	case "rav1e":
		return []string{"-speed", strconv.Itoa(presetToRav1eSpeed(p))}
	}
	return nil
}

func presetToAv1Preset(p string) int {
	order := []string{"ultrafast", "superfast", "veryfast", "faster", "fast", "medium", "slow", "slower", "veryslow", "placebo"}
	for i, name := range order {
		if strings.EqualFold(name, p) {
			return 12 - i
		}
	}
	return 8
}

func presetToRav1eSpeed(p string) int {
	order := []string{"ultrafast", "superfast", "veryfast", "faster", "fast", "medium", "slow", "slower", "veryslow", "placebo"}
	for i, name := range order {
		if strings.EqualFold(name, p) {
			return 10 - i
		}
	}
	return 6
}

func defaultAudioKbps(encoder string) int {
	switch encoder {
	case "libopus", "opus":
		return 128
	case "libvorbis", "vorbis":
		return 160
	case "aac", "libfdk_aac":
		return 128
	case "libmp3lame", "mp3":
		return 192
	case "flac", "alac", "wavpack", "pcm_s16le", "pcm_f32le":
		return 0
	}
	return 128
}

var encoderToCodecKey = map[string]string{
	"libx264": "h264", "h264_nvenc": "h264", "h264_amf": "h264", "h264_qsv": "h264",
	"libopenh264": "h264", "libx265": "hevc", "hevc_nvenc": "hevc", "hevc_amf": "hevc",
	"hevc_qsv": "hevc", "libvpx": "vp8", "libvpx-vp9": "vp9", "libaom-av1": "av1",
	"libsvtav1": "av1", "rav1e": "av1", "libtheora": "theora", "libxvid": "mpeg4",
	"mpeg4": "mpeg4", "libwebp": "webp", "webp": "webp", "libmp3lame": "mp3",
	"libfdk_aac": "aac", "aac": "aac", "libopus": "opus", "libvorbis": "vorbis",
	"h264_mediacodec": "h264", "hevc_mediacodec": "hevc", "vp8_mediacodec": "vp8",
	"vp9_mediacodec": "vp9", "av1_mediacodec": "av1", "mpeg4_mediacodec": "mpeg4",
}

// acceptsCRF reports whether an encoder exposes a -crf AVOption. Hardware
// encoders do not: they take rc/cq-level style options, and an unknown -crf
// makes ffmpeg exit rather than fall back. Quality then rides on the encoder's
// own defaults unless the caller asked for a bitrate.
func acceptsCRF(encoder string) bool {
	switch {
	case strings.HasSuffix(encoder, "_mediacodec"),
		strings.HasSuffix(encoder, "_nvenc"),
		strings.HasSuffix(encoder, "_amf"),
		strings.HasSuffix(encoder, "_qsv"),
		strings.HasSuffix(encoder, "_videotoolbox"):
		return false
	}
	return true
}

func vCodecKey(encoder string) string {
	if k, ok := encoderToCodecKey[encoder]; ok {
		return k
	}
	return encoder
}

func supportsTwoPass(encoder string) bool {
	switch encoder {
	case "libx264", "libx265", "libvpx", "libvpx-vp9", "mpeg4", "libxvid", "libaom-av1", "libsvtav1":
		return true
	}
	return false
}

func movflagsFor(container string) []string {
	switch container {
	case "mp4", "m4a", "mov", "3gp":
		return []string{"-movflags", "+faststart"}
	case "webm":
		return []string{"-dash", "off"}
	}
	return nil
}

func formatSeconds(s float64) string { return strconv.FormatFloat(s, 'f', 3, 64) }

func clamp(v, lo, hi int) int {
	if v < lo {
		return lo
	}
	if v > hi {
		return hi
	}
	return v
}

func dedupe(in []string) []string {
	seen := map[string]bool{}
	out := make([]string, 0, len(in))
	for _, s := range in {
		if s == "" || seen[s] {
			continue
		}
		seen[s] = true
		out = append(out, s)
	}
	return out
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

// Engine executes plans against a binary set.
type Engine struct {
	Resolver
}

// NewEngine wires binaries to the taxonomy and capability index.
func NewEngine(ctx context.Context, bin Binaries, reg *registry.Registry) (*Engine, error) {
	caps, err := bin.CachedCaps(ctx)
	if err != nil {
		return nil, err
	}
	return &Engine{Resolver{Bin: bin, Reg: reg, Caps: caps}}, nil
}

// ProbeAndResolve probes a file and fills in the registry keys, so a client can
// see both what FFmpeg reported ("vp9") and what Eliverter calls it ("vp9").
func (r *Resolver) ProbeAndResolve(ctx context.Context, path string) (*MediaInfo, error) {
	info, err := r.Bin.Probe(ctx, path)
	if err != nil {
		return nil, err
	}
	if c, ok := r.Reg.ContainerForFFmpeg(info.Format.FormatName, filepath.Ext(path)); ok {
		info.ContainerKey = c.Key
	}
	if c, ok := r.Reg.CodecForFFmpeg(info.VideoCodec); ok {
		info.VideoKey = c.Key
	}
	if c, ok := r.Reg.CodecForFFmpeg(info.AudioCodec); ok {
		info.AudioKey = c.Key
	}
	return info, nil
}

// Convert runs one request end to end, applying two-pass encoding when asked.
func (e *Engine) Convert(ctx context.Context, req *Request, onProgress func(Progress)) (Progress, error) {
	info, err := e.Bin.Probe(ctx, req.Input)
	if err != nil {
		return Progress{}, err
	}
	if err := e.PrepareErase(ctx, req); err != nil {
		return Progress{}, err
	}
	plan, err := e.BuildPlan(req, info)
	if err != nil {
		return Progress{}, err
	}

	emit := func(p Progress) {
		if onProgress == nil {
			return
		}
		p.Pct = PctFor(p.OutTimeMs, info.DurationSeconds)
		onProgress(p)
	}

	if !plan.TwoPass {
		last, stderr, err := e.Bin.RunFFmpeg(ctx, plan.Args, nil, emit)
		if err != nil {
			return last, fmt.Errorf("%w\n%s", err, tailLines(stderr, 10))
		}
		return last, nil
	}

	logBase := strings.TrimSuffix(req.Output, filepath.Ext(req.Output)) + "-pass"
	pass1 := withPassFlag(plan.Args, 1, logBase, true)
	if _, stderr, err := e.Bin.RunFFmpeg(ctx, pass1, nil, nil); err != nil {
		return Progress{}, fmt.Errorf("pipeline: pass 1 failed: %w\n%s", err, tailLines(stderr, 10))
	}
	defer os.Remove(logBase + "-0.log")
	defer os.Remove(logBase + "-0.log.mbtree")

	pass2 := withPassFlag(plan.Args, 2, logBase, false)
	last, stderr, err := e.Bin.RunFFmpeg(ctx, pass2, nil, emit)
	if err != nil {
		return last, fmt.Errorf("pipeline: pass 2 failed: %w\n%s", err, tailLines(stderr, 10))
	}
	return last, nil
}

// withPassFlag splices -pass N into the argument list, before the trailing path.
// The analysis pass reuses the exact same filter and encoder so the collected
// stats match the real encode; only the output sinks to /dev/null.
func withPassFlag(args []string, pass int, logBase string, analysisOnly bool) []string {
	out := make([]string, 0, len(args)+4)
	for i := 0; i < len(args); i++ {
		if args[i] == "-pass" || args[i] == "-passlogfile" {
			i++
			continue
		}
		if i == len(args)-1 {
			out = append(out, "-pass", strconv.Itoa(pass), "-passlogfile", logBase)
			if analysisOnly {
				out = append(out, "-an", os.DevNull)
				continue
			}
		}
		out = append(out, args[i])
	}
	return out
}

// Peaks decodes the audio track of input to mono PCM and reduces it to visual
// buckets, returning peak and RMS levels normalised to 0..1.
func (e *Engine) Peaks(ctx context.Context, input string, buckets int) (peaks, rms []float32, err error) {
	if buckets <= 0 {
		buckets = 100
	}
	rc, wait, err := e.Bin.RunRaw(ctx, []string{
		"-i", input, "-vn", "-ac", "1", "-acodec", "pcm_s16le", "-f", "s16le", "-",
	})
	if err != nil {
		return nil, nil, err
	}
	raw, rerr := io.ReadAll(rc)
	rc.Close()
	werr := wait()
	if len(raw) < 2 {
		if rerr != nil {
			return nil, nil, rerr
		}
		if werr != nil {
			return nil, nil, werr
		}
		return nil, nil, ErrNothingToEncode
	}
	pcm := make([]int16, len(raw)/2)
	for i := range pcm {
		pcm[i] = int16(uint16(raw[2*i]) | uint16(raw[2*i+1])<<8)
	}
	return accel.Waveform(pcm, int64(len(pcm)), 1, buckets)
}

// RunRaw executes ffmpeg with stdout piped straight through, used for PCM and
// frame extraction where -progress framing would corrupt the byte stream.
func (b Binaries) RunRaw(ctx context.Context, args []string) (io.ReadCloser, func() error, error) {
	full := append([]string{"-hide_banner", "-y", "-nostdin", "-loglevel", "error"}, args...)
	cmd := exec.CommandContext(ctx, b.FFmpeg, full...)
	cmd.Env = append(os.Environ(), "LC_ALL=C")
	var stderr strings.Builder
	cmd.Stderr = &stderr
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return nil, nil, err
	}
	if err := cmd.Start(); err != nil {
		return nil, nil, fmt.Errorf("pipeline: spawn: %w", err)
	}
	wait := func() error {
		if err := cmd.Wait(); err != nil {
			return fmt.Errorf("pipeline: %w: %s", err, strings.TrimSpace(stderr.String()))
		}
		return nil
	}
	return stdout, wait, nil
}
