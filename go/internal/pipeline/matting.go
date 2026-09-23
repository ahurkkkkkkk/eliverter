package pipeline

import (
	"context"
	"errors"
	"fmt"
	"io"
	"math"
	"strconv"
	"strings"

	"github.com/TenOFSwordsr/eliverter/internal/registry"
)

// Erase modes.
const (
	EraseAuto  = "auto"  // sample the border ring and key what dominates it
	EraseColor = "color" // key an explicit colour
)

// DefaultSimilarity and DefaultBlend are colorkey tolerances used when the
// caller wants no fine control. Measured on flat sprite sheets: lower leaves a
// halo of backdrop around the subject, higher starts eating pale clothing.
const (
	DefaultSimilarity = 0.18
	DefaultBlend      = 0.10
	// minBorderCoverage is how much of the sampled ring must agree on one colour
	// before auto-keying is trusted. Below that the "background" is really scene
	// content and keying it would punch holes in the subject.
	minBorderCoverage = 0.35
	// maxFrameBytes bounds a decoded RGBA frame: 64 MB is 4 megapixels, past
	// which the byte count is not a frame we asked for.
	maxFrameBytes = 64 << 20
)

// ErrNoAlpha means the target cannot store transparency, so erasing the
// background would quietly produce an opaque file.
var ErrNoAlpha = errors.New("pipeline: that target format cannot store transparency")

// Erase describes a background removal. This is keying, not ML matting: the app
// is fully offline and ships no inference runtime, so the subject is separated by
// colour. That is exactly right for solid-backdrop photos, sprite sheets and
// green screen, and it is the wrong tool for a cluttered photograph -- which is
// why auto mode refuses to guess rather than returning confetti.
type Erase struct {
	Mode       string  `json:"mode"`
	Color      string  `json:"color"` // 0xRRGGBB; resolved from the frame when Mode is auto
	Similarity float64 `json:"similarity"`
	Blend      float64 `json:"blend"`
	Despill    bool    `json:"despill"`
}

// normalized returns a defaulted copy. It never mutates the caller's value.
func (e *Erase) normalized() (*Erase, error) {
	if e == nil {
		return nil, nil
	}
	out := *e
	if out.Mode == "" {
		out.Mode = EraseAuto
	}
	if out.Mode != EraseAuto && out.Mode != EraseColor {
		return nil, fmt.Errorf("pipeline: unknown erase mode %q (want auto or color)", out.Mode)
	}
	if out.Similarity <= 0 {
		out.Similarity = DefaultSimilarity
	}
	if out.Blend <= 0 {
		out.Blend = DefaultBlend
	}
	if out.Similarity > 1 || out.Blend > 1 {
		return nil, errors.New("pipeline: erase similarity and blend must be between 0 and 1")
	}
	if out.Mode == EraseColor {
		if _, err := parseHexColor(out.Color); err != nil {
			return nil, err
		}
	}
	return &out, nil
}

// parseHexColor accepts 0xRRGGBB, #RRGGBB or a bare RRGGBB.
func parseHexColor(s string) (uint32, error) {
	t := strings.TrimPrefix(strings.TrimPrefix(strings.TrimSpace(s), "0x"), "#")
	if len(t) != 6 {
		return 0, fmt.Errorf("pipeline: %q is not a 6-digit hex colour", s)
	}
	v, err := strconv.ParseUint(t, 16, 32)
	if err != nil {
		return 0, fmt.Errorf("pipeline: %q is not a hex colour", s)
	}
	return uint32(v), nil
}

func hexColor(c uint32) string { return fmt.Sprintf("0x%06X", c&0xFFFFFF) }

// Filters returns the video filters that key the background out. They run before
// geometry so scaling and padding operate on already-transparent pixels, and
// format=rgba leads because colorkey needs an alpha plane to write into.
//
// It normalises first so a spec that skipped PrepareErase cannot emit
// "colorkey=...@0.000@0.000", which keys nothing at all.
func (e *Erase) Filters() []string {
	if e == nil {
		return nil
	}
	n, err := e.normalized()
	if err != nil {
		return nil
	}
	f := []string{
		"format=rgba",
		// Colon-separated: colorkey parses "colour:similarity:blend", and "@" is
		// its alpha-specifier syntax, so "0x00FF00@0.18@0.1" is a parse error.
		fmt.Sprintf("colorkey=%s:%s:%s", hexColor(mustColor(n.Color)),
			strconv.FormatFloat(n.Similarity, 'f', 3, 64),
			strconv.FormatFloat(n.Blend, 'f', 3, 64)),
	}
	if n.Despill {
		f = append(f, "despill=type="+despillType(mustColor(n.Color)))
	}
	return f
}

func mustColor(s string) uint32 {
	v, err := parseHexColor(s)
	if err != nil {
		return 0
	}
	return v
}

// despillType names the channel a key colour bleeds into, so the colour cast is
// pulled from the right one instead of always assuming green.
func despillType(c uint32) string {
	r, g, b := int(c>>16&0xFF), int(c>>8&0xFF), int(c&0xFF)
	switch {
	case g >= r && g >= b:
		return "green"
	case b >= r && b >= g:
		return "blue"
	default:
		return "red"
	}
}

// PrepareErase resolves an auto key colour by decoding one frame, and stores the
// normalised spec back on the request. BuildPlan deliberately runs no
// subprocesses, so this has to happen first -- which also means the API can call
// it while validating an upload and return a real error instead of queueing a job
// that cannot succeed.
func (e *Engine) PrepareErase(ctx context.Context, req *Request) error {
	erase, err := req.Erase.normalized()
	if err != nil || erase == nil {
		return err
	}
	if erase.Mode == EraseAuto && erase.Color == "" {
		color, _, err := e.Bin.SampleBackground(ctx, req.Input)
		if err != nil {
			return err
		}
		erase.Color = color
	}
	req.Erase = erase
	return nil
}

// SupportsAlphaTarget reports whether a container can keep an erased background.
func SupportsAlphaTarget(reg *registry.Registry, key string) bool {
	c, ok := reg.ContainerByKey(key)
	if !ok {
		return false
	}
	// Video containers declare alpha in the taxonomy; image containers need the
	// explicit list, because a muxer like image2 will happily write a name that
	// has no alpha plane at all.
	return reg.SupportsAlpha(c.Key) || (c.Kind == registry.KindImage && alphaImageContainers[c.Key])
}

var alphaImageContainers = map[string]bool{
	"png": true, "webp": true, "apng": true, "gif": true, "tga": true, "ico": true,
}

// ---------------------------------------------------------------------------
// Border sampling
// ---------------------------------------------------------------------------

// SampleBackground decodes one frame and returns the colour dominating its border
// ring plus the share of the ring that agreed. Looking only at the ring keeps the
// subject's own colours from winning the vote.
func (b Binaries) SampleBackground(ctx context.Context, path string) (string, float64, error) {
	rc, wait, err := b.RunRaw(ctx, []string{
		"-i", path, "-frames:v", "1", "-map", "v:0?",
		"-f", "rawvideo", "-pix_fmt", "rgba", "-",
	})
	if err != nil {
		return "", 0, err
	}
	raw, rerr := io.ReadAll(io.LimitReader(rc, maxFrameBytes))
	rc.Close()
	werr := wait()
	if len(raw) < 16*16*4 {
		if rerr != nil {
			return "", 0, rerr
		}
		return "", 0, werr
	}
	w, h, err := guessFrameSize(len(raw))
	if err != nil {
		return "", 0, err
	}
	return borderColor(raw, w, h)
}

// guessFrameSize recovers dimensions from the byte count, because rawvideo
// carries no header. The most 16:9-ish factorisation wins; video is landscape far
// more often than not.
func guessFrameSize(n int) (int, int, error) {
	const bpp = 4
	if n < bpp*16 || n%bpp != 0 {
		return 0, 0, fmt.Errorf("pipeline: %d bytes is not an RGBA frame", n)
	}
	pixels := n / bpp
	bestW, bestH := 0, 0
	bestScore := math.Inf(1)
	for h := 16; h*h <= pixels; h++ {
		if pixels%h != 0 {
			continue
		}
		w := pixels / h
		if w < h {
			continue
		}
		aspect := float64(w) / float64(h)
		score := math.Min(math.Abs(aspect-16.0/9.0), math.Abs(aspect-4.0/3.0))
		if score < bestScore {
			bestScore, bestW, bestH = score, w, h
		}
	}
	if bestW == 0 {
		return 0, 0, fmt.Errorf("pipeline: cannot infer frame size from %d bytes", n)
	}
	return bestW, bestH, nil
}

type colorBucket struct {
	count   int
	r, g, b int
}

// borderColor votes on the dominant border colour quantised to 5 bits a channel,
// so backdrop noise from compression still counts as one candidate, then averages
// the exact pixels in the winning bucket to get a precise key.
func borderColor(raw []byte, w, h int) (string, float64, error) {
	if w < 4 || h < 4 || len(raw) < w*h*4 {
		return "", 0, fmt.Errorf("pipeline: frame %dx%d is too small to sample", w, h)
	}
	ring := max(2, min(w, h)/32)
	buckets := map[uint32]*colorBucket{}
	visit := func(x, y int) {
		i := (y*w + x) * 4
		if raw[i+3] < 8 {
			return // already transparent: voting on it would key to nothing
		}
		key := uint32(raw[i]>>3)<<10 | uint32(raw[i+1]>>3)<<5 | uint32(raw[i+2]>>3)
		b := buckets[key]
		if b == nil {
			b = &colorBucket{}
			buckets[key] = b
		}
		b.count++
		b.r += int(raw[i])
		b.g += int(raw[i+1])
		b.b += int(raw[i+2])
	}
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			if x < ring || y < ring || x >= w-ring || y >= h-ring {
				visit(x, y)
			}
		}
	}
	var win *colorBucket
	total := 0
	for _, b := range buckets {
		total += b.count
		if win == nil || b.count > win.count {
			win = b
		}
	}
	if win == nil || total == 0 {
		return "", 0, errors.New("pipeline: the frame has no opaque border pixels")
	}
	coverage := float64(win.count) / float64(total)
	if coverage < minBorderCoverage {
		return "", coverage, fmt.Errorf(
			"%w: only %d%% of the border is one colour, so there is no flat background to key; "+
				"name the colour yourself with key_color", ErrNoAlpha, int(coverage*100))
	}
	return hexColor(uint32(win.r/win.count)<<16 |
		uint32(win.g/win.count)<<8 |
		uint32(win.b/win.count)), coverage, nil
}
