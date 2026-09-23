// Package pipeline drives FFmpeg/FFprobe: probing, capability discovery,
// transcode execution and the adaptive size limiters used by the sticker packs.
package pipeline

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
)

var (
	ErrFFmpegMissing   = errors.New("pipeline: ffmpeg binary not found")
	ErrFFprobeMissing  = errors.New("pipeline: ffprobe binary not found")
	ErrNothingToEncode = errors.New("pipeline: input has no supported stream")
)

// Binaries resolves the FFmpeg tool paths.
//
// Order of precedence: explicit override, ELI_FFMPEG/ELI_FFPROBE, a native
// library directory (Android ships the CLI as libffmpeg_cli.so because only
// files extracted into the app's native lib dir stay executable), then PATH.
type Binaries struct {
	FFmpeg  string
	FFprobe string
}

// DiscoverBinaries locates ffmpeg and ffprobe, or reports the missing tool.
func DiscoverBinaries(nativeLibDir string) (Binaries, error) {
	b := Binaries{
		FFmpeg:  os.Getenv("ELI_FFMPEG"),
		FFprobe: os.Getenv("ELI_FFPROBE"),
	}
	if b.FFmpeg == "" && nativeLibDir != "" {
		candidate := filepath.Join(nativeLibDir, "libffmpeg_cli.so")
		if st, err := os.Stat(candidate); err == nil && !st.IsDir() {
			b.FFmpeg = candidate
			probe := filepath.Join(nativeLibDir, "libffprobe_cli.so")
			if st, err := os.Stat(probe); err == nil && !st.IsDir() {
				b.FFprobe = probe
			} else {
				b.FFprobe = b.FFmpeg
			}
		}
	}
	if b.FFmpeg == "" {
		b.FFmpeg = lookPathOr("ffmpeg", "/usr/bin/ffmpeg")
	}
	if b.FFprobe == "" {
		b.FFprobe = lookPathOr("ffprobe", "/usr/bin/ffprobe")
	}
	if b.FFmpeg == "" {
		return b, ErrFFmpegMissing
	}
	if b.FFprobe == "" {
		b.FFprobe = b.FFmpeg
	}
	return b, nil
}

func lookPathOr(name, fallback string) string {
	if p, err := exec.LookPath(name); err == nil {
		return p
	}
	if _, err := os.Stat(fallback); err == nil {
		return fallback
	}
	return ""
}

// ---------------------------------------------------------------------------
// Probe results
// ---------------------------------------------------------------------------

// flexInt absorbs ffprobe's habit of encoding numbers as JSON strings
// ("sample_rate":"44100") while still accepting real JSON numbers.
type flexInt int

func (f *flexInt) UnmarshalJSON(b []byte) error {
	s := strings.TrimSpace(string(b))
	if s == "null" || s == `""` || s == "N/A" {
		*f = 0
		return nil
	}
	if len(s) > 1 && s[0] == '"' {
		s = strings.Trim(s, `"`)
	}
	if s == "" {
		*f = 0
		return nil
	}
	if v, err := strconv.ParseFloat(s, 64); err == nil {
		*f = flexInt(v)
		return nil
	}
	return fmt.Errorf("pipeline: cannot read %q as a number", string(b))
}

func (f flexInt) Int() int { return int(f) }

// flexBool handles ffprobe reporting booleans as 0/1 integers in some builds
// and as true/false in others.
type flexBool bool

func (f *flexBool) UnmarshalJSON(b []byte) error {
	s := strings.TrimSpace(strings.Trim(string(b), `"`))
	switch s {
	case "1", "true", "yes", "":
		*f = s != ""
		return nil
	case "0", "false", "no":
		*f = false
		return nil
	}
	return fmt.Errorf("pipeline: cannot read %q as a boolean", string(b))
}

func (f flexBool) MarshalJSON() ([]byte, error) {
	if f {
		return []byte("true"), nil
	}
	return []byte("false"), nil
}

func (f flexBool) Bool() bool { return bool(f) }

type Stream struct {
	Index        int                 `json:"index"`
	CodecType    string              `json:"codec_type"`
	CodecName    string              `json:"codec_name"`
	Profile      string              `json:"profile"`
	Width        flexInt             `json:"width"`
	Height       flexInt             `json:"height"`
	PixFmt       string              `json:"pix_fmt"`
	AvgFrameRate string              `json:"avg_frame_rate"`
	RFrameRate   string              `json:"r_frame_rate"`
	Channels     flexInt             `json:"channels"`
	SampleRate   flexInt             `json:"sample_rate"`
	BitDepth     flexInt             `json:"bits_per_raw_sample"`
	Duration     flexFloat           `json:"duration"`
	NBFrames     flexInt             `json:"nb_frames"`
	DurationSec  float64             `json:"duration_seconds"`
	Tags         map[string]string   `json:"tags"`
	Disposition  map[string]flexBool `json:"disposition"`
}

// flexFloat is the floating-point twin of flexInt: ffprobe emits "duration"
// quoted, and occasionally as "N/A".
type flexFloat float64

func (f *flexFloat) UnmarshalJSON(b []byte) error {
	s := strings.TrimSpace(strings.Trim(string(b), `"`))
	if s == "" || s == "null" || s == "N/A" {
		*f = 0
		return nil
	}
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return fmt.Errorf("pipeline: cannot read %q as a number", string(b))
	}
	*f = flexFloat(v)
	return nil
}

func (f flexFloat) Float() float64 { return float64(f) }

// Format carries the container-level report. Every numeric here is typed
// leniently: different FFmpeg builds emit these as JSON numbers in some
// versions and quoted strings in others.
type Format struct {
	Filename   string            `json:"filename"`
	FormatName string            `json:"format_name"`
	FormatLong string            `json:"format_long_name"`
	Duration   flexFloat         `json:"duration"`
	BitRate    flexInt           `json:"bit_rate"`
	Size       flexInt           `json:"size"`
	NBStreams  flexInt           `json:"nb_streams"`
	ProbeScore flexInt           `json:"probe_score"`
	StartTime  flexFloat         `json:"start_time"`
	Tags       map[string]string `json:"tags"`
}

// MediaInfo is the normalised view of a probed asset.
type MediaInfo struct {
	Format          Format            `json:"format"`
	Streams         []Stream          `json:"streams"`
	DurationSeconds float64           `json:"duration_seconds"`
	SizeBytes       int64             `json:"size_bytes"`
	Bitrate         int64             `json:"bitrate"`
	Width           int               `json:"width"`
	Height          int               `json:"height"`
	FPS             float64           `json:"fps"`
	PixelFormat     string            `json:"pixel_format"`
	VideoCodec      string            `json:"video_codec"`
	AudioCodec      string            `json:"audio_codec"`
	Channels        int               `json:"channels"`
	SampleRate      int               `json:"sample_rate"`
	HasAlpha        bool              `json:"has_alpha"`
	FrameCount      int               `json:"frame_count"`
	IsAnimatedImage bool              `json:"is_animated_image"`
	ContainerKey    string            `json:"container"`
	VideoKey        string            `json:"video_codec_key"`
	AudioKey        string            `json:"audio_codec_key"`
	Extra           map[string]string `json:"extra,omitempty"`
}

// Probe runs ffprobe and normalises the JSON into a MediaInfo.
// A malformed or unparseable file yields an error, never a panic.
func (b Binaries) Probe(ctx context.Context, path string) (*MediaInfo, error) {
	if _, err := os.Stat(path); err != nil {
		return nil, fmt.Errorf("pipeline: input unreadable: %w", err)
	}
	args := []string{"-v", "quiet", "-print_format", "json",
		"-show_format", "-show_streams", "-show_error", path}
	out, err := b.run(ctx, b.FFprobe, args, nil)
	if err != nil && len(out) == 0 {
		return nil, fmt.Errorf("pipeline: ffprobe failed: %w", err)
	}

	var payload struct {
		Format  Format   `json:"format"`
		Streams []Stream `json:"streams"`
		Error   *struct {
			Code   int    `json:"code"`
			String string `json:"string"`
		} `json:"error"`
	}
	if jerr := json.Unmarshal(out, &payload); jerr != nil {
		return nil, fmt.Errorf("pipeline: unparseable ffprobe output: %w", jerr)
	}
	if payload.Format.NBStreams.Int() == 0 && len(payload.Streams) == 0 {
		msg := "no streams"
		if payload.Error != nil {
			msg = payload.Error.String
		}
		return nil, fmt.Errorf("pipeline: not a media file (%s)", msg)
	}
	info := normalise(&payload.Format, payload.Streams)
	if payload.Error != nil {
		info.Extra["probe_warning"] = payload.Error.String
	}
	return info, nil
}

func normalise(f *Format, streams []Stream) *MediaInfo {
	info := &MediaInfo{Format: *f, Streams: streams, Extra: map[string]string{}}
	info.DurationSeconds = f.Duration.Float()
	info.SizeBytes = int64(f.Size.Int())
	info.Bitrate = int64(f.BitRate.Int())

	for i := range info.Streams {
		s := &info.Streams[i]
		s.DurationSec = s.Duration.Float()
		switch s.CodecType {
		case "video":
			if info.VideoCodec == "" {
				info.VideoCodec = s.CodecName
				info.Width, info.Height = s.Width.Int(), s.Height.Int()
				info.PixelFormat = s.PixFmt
				info.FPS = parseRate(s.AvgFrameRate, s.RFrameRate)
			}
			if hasAlphaPlane(s.PixFmt) || tagFold(s.Tags, "alpha_mode") == "1" {
				info.HasAlpha = true
			}
			if n := s.NBFrames.Int(); n > info.FrameCount {
				info.FrameCount = n
			}
		case "audio":
			if info.AudioCodec == "" {
				info.AudioCodec = s.CodecName
				info.Channels = s.Channels.Int()
				info.SampleRate = s.SampleRate.Int()
			}
		}
	}

	if info.DurationSeconds <= 0 {
		for _, s := range info.Streams {
			if s.DurationSec > info.DurationSeconds {
				info.DurationSeconds = s.DurationSec
			}
		}
	}
	// A multi-frame image container (APNG, animated WebP, GIF) reports as a video
	// stream with no container duration.
	info.IsAnimatedImage = info.FrameCount > 1 && info.DurationSeconds <= 0 &&
		(strings.Contains(f.FormatName, "image") || strings.Contains(f.FormatName, "pipe") ||
			strings.Contains(f.FormatName, "gif") || strings.Contains(f.FormatName, "webp"))
	return info
}

func parseRate(candidates ...string) float64 {
	for _, c := range candidates {
		c = strings.TrimSpace(c)
		if c == "" || c == "0/0" {
			continue
		}
		if num, den, ok := strings.Cut(c, "/"); ok {
			n, e1 := strconv.ParseFloat(num, 64)
			d, e2 := strconv.ParseFloat(den, 64)
			if e1 == nil && e2 == nil && d != 0 {
				return n / d
			}
			continue
		}
		if f, err := strconv.ParseFloat(c, 64); err == nil {
			return f
		}
	}
	return 0
}

// tagFold reads a stream tag case-insensitively: ffprobe lower-covers some
// metadata keys and not others depending on the muxer.
func tagFold(tags map[string]string, key string) string {
	for k, v := range tags {
		if strings.EqualFold(k, key) {
			return v
		}
	}
	return ""
}

func hasAlphaPlane(pix string) bool {
	if pix == "" {
		return false
	}
	if strings.HasPrefix(pix, "yuva") || strings.HasPrefix(pix, "rgba") ||
		strings.HasPrefix(pix, "bgra") || strings.HasPrefix(pix, "argb") ||
		strings.HasPrefix(pix, "abgr") || strings.HasPrefix(pix, "gbrap") {
		return true
	}
	return strings.Contains(pix, "a16le") || strings.Contains(pix, "a16be") ||
		strings.Contains(pix, "pal8")
}

// ---------------------------------------------------------------------------
// Capability index
// ---------------------------------------------------------------------------

// Caps records what the local FFmpeg build actually supports, so the registry
// never promises an encoder that would fail at spawn time.
type Caps struct {
	Encoders map[string]bool
	Decoders map[string]bool
	Muxers   map[string]bool
	Demuxers map[string]bool
	Filters  map[string]bool
	PixelFmt map[string]bool
	Version  string
	// Experimental holds encoders whose flags column carries an 'X'. FFmpeg
	// refuses these with exit status 88 unless -strict -2 is also passed, and
	// native Vorbis/Opus encoders are experimental in every build today.
	Experimental map[string]bool
}

func (c *Caps) HasEncoder(name string) bool { return c != nil && c.Encoders[name] }

// UsableEncoders exposes the encoder index so callers can tell "this build has
// no encoders listed" from "this build has none of the ones I want".
func (c *Caps) UsableEncoders() map[string]bool {
	if c == nil {
		return nil
	}
	return c.Encoders
}

// UsableEncoder reports whether an encoder exists and, if so, whether it is
// gated behind -strict -2. An unset capability index reports (true, false):
// with no evidence to the contrary, assume the encoder is usable.
func (c *Caps) UsableEncoder(name string) (ok, experimental bool) {
	if c == nil || len(c.Encoders) == 0 {
		return true, false
	}
	if !c.Encoders[name] {
		return false, false
	}
	return true, c.Experimental[name]
}

// DiscoverCaps asks the binary what it was built with.
func (b Binaries) DiscoverCaps(ctx context.Context) (*Caps, error) {
	caps := &Caps{
		Encoders: map[string]bool{}, Decoders: map[string]bool{},
		Muxers: map[string]bool{}, Demuxers: map[string]bool{},
		Filters: map[string]bool{}, PixelFmt: map[string]bool{},
		Experimental: map[string]bool{},
	}
	ver, err := b.run(ctx, b.FFmpeg, []string{"-version"}, nil)
	if err != nil && len(ver) == 0 {
		return nil, err
	}
	if line := firstLine(string(ver)); strings.Contains(line, "version") {
		caps.Version = line
	}

	parseList := func(args []string, col int, into map[string]bool) {
		out, err := b.run(ctx, b.FFmpeg, args, nil)
		if err != nil && len(out) == 0 {
			return
		}
		for _, line := range strings.Split(string(out), "\n") {
			fields := strings.Fields(line)
			if len(fields) <= col {
				continue
			}
			name := fields[col]
			if name == "-" || name == "" {
				continue
			}
			into[name] = true
		}
	}
	parseList([]string{"-hide_banner", "-decoders"}, 1, caps.Decoders)
	parseList([]string{"-hide_banner", "-muxers"}, 1, caps.Muxers)
	parseList([]string{"-hide_banner", "-demuxers"}, 1, caps.Demuxers)
	parseList([]string{"-hide_banner", "-filters"}, 2, caps.Filters)

	// Encoders carry a six-character flags column (type, video, audio, s,
	// experimental, draw-horiz) where position 3 is 'X' for experimental.
	if out, err := b.run(ctx, b.FFmpeg, []string{"-hide_banner", "-encoders"}, nil); err == nil || len(out) > 0 {
		parseEncoderLines(string(out), caps)
	}

	pix, err := b.run(ctx, b.FFmpeg, []string{"-hide_banner", "-pix_fmts"}, nil)
	if err == nil {
		for _, line := range strings.Split(string(pix), "\n") {
			if !strings.HasPrefix(line, " ") || len(line) < 10 {
				continue
			}
			f := strings.Fields(line)
			if len(f) >= 2 {
				caps.PixelFmt[f[1]] = true
			}
		}
	}
	return caps, nil
}

// parseEncoderLines reads the -encoders table. Each entry starts with a
// six-character flags column: stream type, then frame/slice threading,
// experimental, and draw-horiz-band support.
func parseEncoderLines(out string, caps *Caps) {
	for _, line := range strings.Split(out, "\n") {
		fields := strings.Fields(line)
		if len(fields) < 2 {
			continue
		}
		flags, name := fields[0], fields[1]
		if name == "" || name == "-" || len(flags) != 6 {
			continue
		}
		// The legend block above the table has the same shape as an entry
		// ("A..X.. = Codec is experimental"); its name column is a '='.
		if name == "=" {
			continue
		}
		caps.Encoders[name] = true
		if flags[3] == 'X' {
			caps.Experimental[name] = true
		}
	}
}

func firstLine(s string) string {
	if i := strings.IndexByte(s, '\n'); i >= 0 {
		return strings.TrimSpace(s[:i])
	}
	return strings.TrimSpace(s)
}

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------

// Progress is a transcoding milestone streamed to the WebSocket hub.
type Progress struct {
	Frame       int64   `json:"frame"`
	OutTimeMs   int64   `json:"out_time_ms"`
	SizeBytes   int64   `json:"size_bytes"`
	BitrateKbps float64 `json:"bitrate_kbps"`
	Speed       float64 `json:"speed"`
	Pct         float64 `json:"pct"`
	Phase       string  `json:"phase"`
	Done        bool    `json:"done"`
}

// RunFFmpeg executes ffmpeg with -progress parsing.
//
// onProgress may be nil. Returns combined stderr for error reporting.
func (b Binaries) RunFFmpeg(ctx context.Context, args []string, stdin io.Reader,
	onProgress func(Progress)) (Progress, string, error) {

	full := append([]string{"-hide_banner", "-y", "-nostdin", "-progress", "pipe:1", "-nostats"}, args...)
	cmd := exec.CommandContext(ctx, b.FFmpeg, full...)
	cmd.Env = append(os.Environ(), "LC_ALL=C")
	if stdin != nil {
		cmd.Stdin = stdin
	}

	var stderr bytes.Buffer
	cmd.Stderr = &stderr

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return Progress{}, stderr.String(), err
	}
	if err := cmd.Start(); err != nil {
		return Progress{}, stderr.String(), fmt.Errorf("pipeline: spawn ffmpeg: %w", err)
	}

	var last Progress
	sc := bufio.NewScanner(stdout)
	sc.Buffer(make([]byte, 0, 64*1024), 1024*1024)
	kv := map[string]string{}
	for sc.Scan() {
		line := strings.TrimSpace(sc.Text())
		switch {
		case line == "":
			continue
		case strings.HasPrefix(line, "progress="):
			last = buildProgress(kv)
			last.Done = line == "progress=end"
			if onProgress != nil {
				onProgress(last)
			}
			if last.Done {
				kv = map[string]string{}
			}
		default:
			if k, v, ok := strings.Cut(line, "="); ok {
				kv[k] = v
			}
		}
	}
	scanErr := sc.Err()
	waitErr := cmd.Wait()

	if waitErr != nil {
		return last, stderr.String(), encodeError(waitErr, stderr.String())
	}
	if scanErr != nil && !errors.Is(scanErr, io.EOF) {
		return last, stderr.String(), scanErr
	}
	return last, stderr.String(), nil
}

func buildProgress(kv map[string]string) Progress {
	p := Progress{Phase: "encoding"}
	p.Frame, _ = strconv.ParseInt(kv["frame"], 10, 64)
	// -progress reports out_time_ms in microseconds despite the name.
	if us, err := strconv.ParseInt(kv["out_time_us"], 10, 64); err == nil {
		p.OutTimeMs = us / 1000
	} else if ms, err := strconv.ParseInt(kv["out_time_ms"], 10, 64); err == nil {
		p.OutTimeMs = ms / 1000
	}
	p.SizeBytes, _ = strconv.ParseInt(kv["total_size"], 10, 64)
	p.BitrateKbps, _ = strconv.ParseFloat(strings.TrimSuffix(kv["bitrate"], "kbits/s"), 64)
	p.Speed, _ = strconv.ParseFloat(strings.TrimSuffix(kv["speed"], "x"), 64)
	if tot, err := strconv.ParseFloat(kv["out_time_ms"], 64); err == nil && tot > 0 {
		p.Pct = 0
	}
	return p
}

// pctFor converts elapsed output time into a percentage of the known duration.
func PctFor(elapsedMs int64, durationSeconds float64) float64 {
	if durationSeconds <= 0 || elapsedMs <= 0 {
		return 0
	}
	pct := (float64(elapsedMs) / 1000.0) / durationSeconds * 100.0
	if pct > 99.5 {
		pct = 99.5
	}
	return pct
}

func encodeError(waitErr error, stderr string) error {
	tail := tailLines(stderr, 6)
	if i := strings.LastIndex(tail, "Error while opening encoder"); i >= 0 {
		return fmt.Errorf("pipeline: encoder rejected the request: %s", strings.TrimSpace(tail[i:]))
	}
	if i := strings.LastIndex(tail, "Invalid data found"); i >= 0 {
		return fmt.Errorf("pipeline: corrupt or unsupported input: %s", strings.TrimSpace(tail[i:]))
	}
	return fmt.Errorf("pipeline: ffmpeg exited: %w: %s", waitErr, tail)
}

func tailLines(s string, n int) string {
	lines := strings.Split(strings.TrimSpace(s), "\n")
	if len(lines) > n {
		lines = lines[len(lines)-n:]
	}
	return strings.Join(lines, "\n")
}

func (b Binaries) run(ctx context.Context, bin string, args []string, stdin io.Reader) ([]byte, error) {
	if bin == "" {
		return nil, ErrFFprobeMissing
	}
	cmd := exec.CommandContext(ctx, bin, args...)
	cmd.Env = append(os.Environ(), "LC_ALL=C")
	cmd.Stdin = stdin
	var out, errBuf bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &errBuf
	err := cmd.Run()
	if err != nil && out.Len() == 0 {
		return out.Bytes(), fmt.Errorf("%w: %s", err, strings.TrimSpace(errBuf.String()))
	}
	return out.Bytes(), nil
}

// EnsureFile makes sure a directory exists for ephemeral artifacts.
func EnsureFile(dir string) error {
	if dir == "" {
		return errors.New("pipeline: empty directory")
	}
	return os.MkdirAll(dir, 0o755)
}

var onceMu sync.Mutex
var cachedCaps *Caps

// Caps_cached memoises capability discovery; spawning ffmpeg four times per
// request would dominate latency for a phone-class CPU.
func (b Binaries) CachedCaps(ctx context.Context) (*Caps, error) {
	onceMu.Lock()
	defer onceMu.Unlock()
	if cachedCaps != nil {
		return cachedCaps, nil
	}
	c, err := b.DiscoverCaps(ctx)
	if err != nil {
		return nil, err
	}
	cachedCaps = c
	return c, nil
}

// ResetCapabilityCache is used by tests.
func ResetCapabilityCache() {
	onceMu.Lock()
	cachedCaps = nil
	onceMu.Unlock()
}
