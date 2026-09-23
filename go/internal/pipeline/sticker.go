package pipeline

import (
	"context"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// PackID names a one-click ready pack from Section 3 of the specification.
type PackID string

const (
	PackTelegramStatic   PackID = "telegram_static"
	PackTelegramAnimated PackID = "telegram_animated"
	PackWhatsAppStatic   PackID = "whatsapp_static"
	PackWhatsAppAnimated PackID = "whatsapp_animated"
	PackDiscordEmote     PackID = "discord_emote"
	PackDiscordReaction  PackID = "discord_reaction"
)

// Pack is the complete rule set for one sticker target.
type Pack struct {
	ID          PackID
	Label       string
	Container   string  // registry container key
	VideoCodec  string  // registry codec key
	AudioCodec  string  // empty means the audio track is dropped
	Edge        int     // required longest edge in px
	Square      bool    // force an exact Edge x Edge canvas
	FPS         float64 // 0 leaves the source frame rate alone
	MaxDuration float64 // 0 leaves the source duration alone
	LimitBytes  int64
	CRFFrom     int
	CRFTo       int
	StripMeta   bool
	KeepAlpha   bool
	// CropAlpha runs the vectorised alpha bounds kernel and crops the dead
	// transparent border before scaling, so the subject fills the canvas.
	CropAlpha  bool
	LosslessOK bool
	FitFirst   bool // skip CRF search when the naive encode already fits
	Notes      string
}

var packs = []Pack{
	{
		ID: PackTelegramStatic, Label: "Telegram static sticker",
		Container: "png", VideoCodec: "png", Edge: 512,
		LimitBytes: 512 * 1024, CRFFrom: 26, CRFTo: 40,
		StripMeta: true, KeepAlpha: true, CropAlpha: true, LosslessOK: true, FitFirst: true,
		Notes: "one edge exactly 512, the other 512 or less; hard ceiling 512 KB",
	},
	{
		ID: PackTelegramAnimated, Label: "Telegram animated sticker",
		Container: "webm", VideoCodec: "vp9", Edge: 512, Square: true,
		FPS: 30, MaxDuration: 3.0,
		LimitBytes: 256 * 1024, CRFFrom: 28, CRFTo: 45,
		StripMeta: true, KeepAlpha: true,
		Notes: "VP9 in WebM, yuva420p alpha, no audio, exactly 30 fps, under 256.0 KB",
	},
	{
		ID: PackWhatsAppStatic, Label: "WhatsApp static sticker",
		Container: "webp", VideoCodec: "webp", Edge: 512, Square: true,
		LimitBytes: 100 * 1024, CRFFrom: 30, CRFTo: 60,
		StripMeta: true, KeepAlpha: true,
		Notes: "512x512 exactly, EXIF/XMP/ICC removed, under 100 KB",
	},
	{
		ID: PackWhatsAppAnimated, Label: "WhatsApp animated sticker",
		Container: "webp", VideoCodec: "webp", Edge: 512, Square: true,
		FPS: 30, MaxDuration: 3.0,
		LimitBytes: 500 * 1024, CRFFrom: 30, CRFTo: 64,
		StripMeta: true, KeepAlpha: true,
		Notes: "animated WebP, 512x512, under 500 KB",
	},
	{
		ID: PackDiscordEmote, Label: "Discord emote",
		Container: "gif", VideoCodec: "gif", Edge: 128,
		FPS: 20, MaxDuration: 5.0,
		LimitBytes: 256 * 1024, CRFFrom: 24, CRFTo: 40,
		StripMeta: true, KeepAlpha: true,
		Notes: "128x128 bounding box, animated GIF or WebP, under 256 KB",
	},
	{
		ID: PackDiscordReaction, Label: "Discord reaction",
		Container: "png", VideoCodec: "png", Edge: 128,
		LimitBytes: 256 * 1024, CRFFrom: 24, CRFTo: 40,
		StripMeta: true, KeepAlpha: true, CropAlpha: true, LosslessOK: true, FitFirst: true,
		Notes: "128x128 static PNG, under 256 KB",
	},
}

// ListPacks returns every ready pack, ordered by label.
func ListPacks() []Pack {
	out := append([]Pack(nil), packs...)
	sort.Slice(out, func(i, j int) bool { return out[i].Label < out[j].Label })
	return out
}

// LookupPack resolves a pack id.
func LookupPack(id string) (Pack, error) {
	for _, p := range packs {
		if p.ID == PackID(id) {
			return p, nil
		}
	}
	return Pack{}, fmt.Errorf("pipeline: unknown sticker pack %q", id)
}

// StickerResult describes a finished pack item.
type StickerResult struct {
	Pack        PackID  `json:"pack"`
	Label       string  `json:"label"`
	OutputPath  string  `json:"output_path"`
	Filename    string  `json:"filename"`
	SizeBytes   int64   `json:"size_bytes"`
	LimitBytes  int64   `json:"limit_bytes"`
	WithinLimit bool    `json:"within_limit"`
	Attempts    int     `json:"attempts"`
	Encoder     string  `json:"encoder"`
	PixelFormat string  `json:"pixel_format"`
	Width       int     `json:"width"`
	Height      int     `json:"height"`
	Duration    float64 `json:"duration_seconds"`
	Notes       string  `json:"notes"`
	ElapsedMs   int64   `json:"elapsed_ms"`
}

// ErrPackRejected means the pack's own rules cannot be satisfied by this input.
var ErrPackRejected = errors.New("pipeline: input cannot satisfy the sticker pack rules")

// ValidatePack probes an upload and resolves it against a pack's rules without
// writing anything, so the HTTP layer can reject an impossible request with a
// 422 instead of queueing a job that is guaranteed to fail.
func (e *Engine) ValidatePack(ctx context.Context, input string, id PackID, erase *Erase) error {
	pack, err := LookupPack(string(id))
	if err != nil {
		return err
	}
	info, err := e.Bin.Probe(ctx, input)
	if err != nil {
		return err
	}
	if info.Width == 0 && info.Height == 0 {
		return fmt.Errorf("%w: %s has no video track", ErrPackRejected, info.Format.Filename)
	}
	resolved, err := e.resolveErase(ctx, input, erase)
	if err != nil {
		return err
	}
	req := e.packRequest(pack, input, "preview"+packExtension(pack), info, resolved)
	_, err = e.BuildPlan(req, info)
	return err
}

// resolveErase pins a key colour before a request is built, because a GIF pack
// carries its geometry inside the palette graph and the keying filters have to be
// woven into that graph rather than bolted on afterwards.
func (e *Engine) resolveErase(ctx context.Context, input string, erase *Erase) (*Erase, error) {
	if erase == nil {
		return nil, nil
	}
	probe := &Request{Input: input, Erase: erase}
	if err := e.PrepareErase(ctx, probe); err != nil {
		return nil, err
	}
	return probe.Erase, nil
}

// Sticker renders one ready-pack item, applying the adaptive size limiter.
func (e *Engine) Sticker(ctx context.Context, input string, id PackID, outDir string,
	erase *Erase, onProgress func(Progress)) (*StickerResult, error) {

	pack, err := LookupPack(string(id))
	if err != nil {
		return nil, err
	}
	if err := os.MkdirAll(outDir, 0o755); err != nil {
		return nil, fmt.Errorf("pipeline: output dir: %w", err)
	}

	info, err := e.Bin.Probe(ctx, input)
	if err != nil {
		return nil, err
	}
	if info.Width == 0 && info.Height == 0 {
		return nil, fmt.Errorf("%w: %s has no video track", ErrPackRejected, info.Format.Filename)
	}
	if pack.MaxDuration > 0 && info.DurationSeconds > 0 && info.DurationSeconds < 0.2 {
		return nil, fmt.Errorf("%w: clip is %.2fs, too short for a 30fps sticker",
			ErrPackRejected, info.DurationSeconds)
	}

	stem := strings.TrimSuffix(filepath.Base(input), filepath.Ext(input))
	ext := packExtension(pack)
	output := filepath.Join(outDir, fmt.Sprintf("%s_%s%s", sanitize(stem), pack.ID, ext))

	resolved, err := e.resolveErase(ctx, input, erase)
	if err != nil {
		return nil, err
	}
	req := e.packRequest(pack, input, output, info, resolved)
	if pack.CropAlpha {
		// Still images only: a single frame cannot describe a clip.
		if crop, err := e.AlphaCropHint(ctx, input, info.DurationSeconds > 0); err == nil && crop != "" {
			req.ExtraFilters = append([]string{crop}, req.ExtraFilters...)
		}
	}
	started := time.Now()

	res := &StickerResult{Pack: pack.ID, Label: pack.Label, OutputPath: output,
		Filename: filepath.Base(output), LimitBytes: pack.LimitBytes, Notes: pack.Notes}

	if pack.FitFirst {
		_, ferr := e.Convert(ctx, req, onProgress)
		if ferr == nil {
			size := SizeOnDisk(output)
			if size > 0 && size <= pack.LimitBytes {
				e.fillGeometry(res, output, info, req, pack)
				res.WithinLimit, res.Attempts = true, 1
				res.ElapsedMs = time.Since(started).Milliseconds()
				return res, nil
			}
			res.Notes = pack.Notes + "; naive encode was " + humanBytes(size) + ", running the size search"
		}
	}

	opts := DefaultFit(pack.LimitBytes)
	opts.CRFFrom, opts.CRFTo = pack.CRFFrom, pack.CRFTo
	// Every ready pack pins its canvas, and the animated ones pin their frame
	// rate, so the ladder may only trade quality against duration.
	opts.AllowGeometryShrink = false
	if opts.CRFFrom == 0 {
		opts.CRFFrom = 28
	}
	if opts.CRFTo <= opts.CRFFrom {
		opts.CRFTo = opts.CRFFrom + 17
	}
	opts.MaxAttempts = 8

	fit, err := e.FitUnderSize(ctx, req, opts, onProgress)
	if err != nil {
		return nil, err
	}
	e.fillGeometry(res, output, info, req, pack)
	res.SizeBytes = fit.SizeBytes
	res.WithinLimit = fit.SizeBytes <= pack.LimitBytes
	res.Attempts = fit.Attempts
	if !res.WithinLimit {
		return res, fmt.Errorf("%w: %s stayed at %s over a %s cap",
			ErrPackRejected, pack.Label, humanBytes(fit.SizeBytes), humanBytes(pack.LimitBytes))
	}
	res.ElapsedMs = time.Since(started).Milliseconds()
	return res, nil
}

// packRequest encodes the geometry rules of a pack into a conversion request.
//
// Canvas dimensions go into Width/Height rather than only into filter strings,
// because the size ladder rewrites filters when it degrades geometry and needs
// to see the intended box to rebuild them correctly.
func (e *Engine) packRequest(p Pack, input, output string, info *MediaInfo, erase *Erase) *Request {
	req := &Request{
		Input:           input,
		Output:          output,
		TargetContainer: p.Container,
		VideoCodec:      p.VideoCodec,
		NoAudio:         p.AudioCodec == "",
		CRF:             p.CRFFrom,
		FPS:             p.FPS,
		StripMetadata:   p.StripMeta,
		Erase:           erase,
	}
	if p.AudioCodec != "" {
		req.AudioCodec = p.AudioCodec
	}
	// Stickers are where sprites actually land, so the source decides whether the
	// scaler may smooth anything.
	req.KeepPixels = IsPixelArt(info)
	if p.MaxDuration > 0 {
		req.Duration = p.MaxDuration
	}

	switch {
	case p.Square:
		// Exact canvas: fit inside the box, then pad with transparent colour so
		// non-square sources are not stretched.
		req.Width, req.Height = p.Edge, p.Edge
		req.ExtraFilters = []string{
			fmt.Sprintf("pad=%d:%d:(ow-iw)/2:(oh-ih)/2:color=black@0.0", p.Edge, p.Edge),
			"format=rgba",
		}
	case p.ID == PackTelegramStatic:
		// The spec pins this exact expression: one edge becomes 512, the other
		// scales down proportionally and never exceeds it.
		req.ExtraFilters = []string{
			fmt.Sprintf("scale='if(gt(a,1),%d,-1)':'if(gt(a,1),-1,%d)'", p.Edge, p.Edge),
		}
	default:
		// Plain bounding box.
		req.Width, req.Height = p.Edge, p.Edge
	}

	if p.KeepAlpha && p.Container == "webm" {
		req.PixelFormat = "yuva420p"
	}
	if p.Container == "gif" {
		// The palette graph carries its own geometry, so the plain chain is
		// dropped rather than applied twice. A still source must not get an fps
		// filter here or the quantiser produces an empty file. Keying belongs in
		// the same graph: a GIF's transparency is a palette entry, so filters on a
		// separate -vf chain never reach paletteuse.
		req.FilterComplex = paletteGraphWith(erase.Filters(), req.Width, req.Height,
			graphFPS(req, info), 0, req.KeepPixels)
		req.ExtraFilters = nil
	}
	return req
}

func packExtension(p Pack) string {
	switch p.Container {
	case "png":
		return ".png"
	case "webp":
		return ".webp"
	case "webm":
		return ".webm"
	case "gif":
		return ".gif"
	}
	return "." + p.Container
}

func (e *Engine) fillGeometry(res *StickerResult, output string, info *MediaInfo, req *Request, p Pack) {
	res.SizeBytes = SizeOnDisk(output)
	res.Width, res.Height, res.Duration = req.Width, req.Height, req.Duration
	// FFmpeg's WebP demuxer reads only the first chunk of a multi-frame file, so
	// probing an animated sticker succeeds with no usable geometry. Trust the
	// probe only where it actually reports something.
	if probed, err := e.Bin.Probe(context.Background(), output); err == nil {
		res.PixelFormat = probed.PixelFormat
		if probed.Width > 0 && probed.Height > 0 {
			res.Width, res.Height = probed.Width, probed.Height
		}
		if probed.DurationSeconds > 0 {
			res.Duration = probed.DurationSeconds
		}
	}
	res.Encoder = p.VideoCodec
}

func sanitize(name string) string {
	name = filepath.Base(name)
	var b strings.Builder
	lastUnderscore := false
	for _, r := range name {
		switch {
		case r >= 'a' && r <= 'z', r >= 'A' && r <= 'Z', r >= '0' && r <= '9', r == '-':
			b.WriteRune(r)
			lastUnderscore = false
		default:
			if !lastUnderscore {
				b.WriteByte('_')
				lastUnderscore = true
			}
		}
	}
	out := strings.Trim(b.String(), "_")
	if out == "" {
		return "sticker"
	}
	if len(out) > 48 {
		out = out[:48]
	}
	return out
}
