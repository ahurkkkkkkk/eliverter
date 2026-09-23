package pipeline

import (
	"context"
	"errors"
	"fmt"
	"os"
	"sort"
	"strconv"
	"strings"
)

// SizeBudget is one rung of the search used to force an output under a hard cap.
type SizeBudget struct {
	CRF         int
	BitrateKbps int
	Scale       int     // longest edge in pixels; 0 keeps the planned geometry
	FPS         float64 // 0 keeps the planned frame rate
	Duration    float64 // 0 keeps the planned duration
	Colors      int     // palette entries for indexed output; 0 keeps 256
	Palette     bool    // re-quantise with palettegen/paletteuse for GIF/WebP
}

// FitOptions configures the adaptive limiter.
type FitOptions struct {
	// Hard cap in bytes the finished file must stay under.
	LimitBytes int64
	// SafetyMargin keeps a little headroom so a re-mux cannot tip the file over.
	SafetyMargin float64
	// CRF range walked from best quality to worst.
	CRFFrom, CRFTo int
	// MaxAttempts bounds the search so a pathological input still returns.
	MaxAttempts int
	// AllowGeometryShrink permits the ladder to reduce the canvas as a last
	// resort. Sticker packs set this false: Telegram and WhatsApp mandate an
	// exact 512x512, so shrinking produces a file the platform rejects.
	AllowGeometryShrink bool
}

// DefaultFit mirrors the spec: start at CRF 28, degrade to 45.
func DefaultFit(limit int64) FitOptions {
	return FitOptions{
		LimitBytes:          limit,
		SafetyMargin:        0.96,
		CRFFrom:             28,
		CRFTo:               45,
		MaxAttempts:         9,
		AllowGeometryShrink: true,
	}
}

// FitResult reports how the budget was met.
type FitResult struct {
	Attempts     int
	Budget       SizeBudget
	SizeBytes    int64
	LastProgress Progress
	ExactMatch   bool // the very first plan already fit
}

// ErrOverBudget means every rung of the search still exceeded the cap.
var ErrOverBudget = errors.New("pipeline: could not fit output under the size limit")

// FitUnderSize encodes repeatedly, degrading quality, then frame rate, then
// geometry, until the artifact is under LimitBytes.
//
// The ladder is ordered cheapest-first, so the common case exits on the first
// or second rung instead of burning the whole search on a phone CPU.
func (e *Engine) FitUnderSize(ctx context.Context, req *Request, opts FitOptions,
	onProgress func(Progress)) (*FitResult, error) {
	if opts.LimitBytes <= 0 {
		return nil, errors.New("pipeline: size limit must be positive")
	}
	if opts.MaxAttempts <= 0 {
		opts.MaxAttempts = 9
	}
	if opts.SafetyMargin <= 0 || opts.SafetyMargin > 1 {
		opts.SafetyMargin = 0.96
	}
	target := int64(float64(opts.LimitBytes) * opts.SafetyMargin)

	base := *req
	budgets := e.ladder(&base, opts)

	var smallest int64

	for i, b := range budgets {
		if err := ctx.Err(); err != nil {
			return nil, err
		}
		// Each rung starts from the caller's request: degrading one rung must not
		// leak into the next and silently compound every previous reduction.
		plan := base
		apply(&plan, b)
		prog, err := e.Convert(ctx, &plan, onProgress)
		if err != nil {
			// A rejected encoder setting degrades the search rather than aborting it.
			if i == len(budgets)-1 {
				return nil, err
			}
			continue
		}
		size := SizeOnDisk(plan.Output)
		if size > 0 && (smallest == 0 || size < smallest) {
			smallest = size
		}
		if size > 0 && size <= target {
			return &FitResult{Attempts: i + 1, Budget: b, SizeBytes: size,
				LastProgress: prog, ExactMatch: i == 0}, nil
		}
	}
	return nil, fmt.Errorf("%w: smallest attempt was %s against a %s cap",
		ErrOverBudget, humanBytes(smallest), humanBytes(opts.LimitBytes))
}

// ladder builds the degradation sequence.
//
// For a fixed-canvas pack the only legal levers are quality and duration:
// Telegram demands exactly 30 fps on a 512x512 canvas, so dropping frames or
// shrinking the box would produce a file the platform rejects. Free-form
// conversion also gets frame-rate and geometry rungs.
func (e *Engine) ladder(plan *Request, opts FitOptions) []SizeBudget {
	leaf := lsbFor(plan.Output)
	palette, rateless := leaf.palette, leaf.rateless
	steps := crfLadder(opts.CRFFrom, opts.CRFTo, opts.MaxAttempts)
	if rateless {
		// Every CRF resolves to the same ffmpeg arguments for a rateless codec, so
		// eight rungs means eight byte-identical encodes on a phone CPU.
		steps = steps[:1]
	}
	edge := plan.Width
	if plan.Height > edge {
		edge = plan.Height
	}
	if edge <= 0 {
		edge = 512
	}

	budgets := make([]SizeBudget, 0, opts.MaxAttempts*4)
	for _, crf := range steps {
		budgets = append(budgets, SizeBudget{CRF: crf, Palette: palette})
	}

	if opts.AllowGeometryShrink && plan.FPS > 0 {
		for _, fps := range []float64{24, 20, 15, 12, 10} {
			if fps >= plan.FPS {
				continue
			}
			for _, crf := range steps[len(steps)/2:] {
				budgets = append(budgets, SizeBudget{CRF: crf, FPS: fps, Palette: palette})
			}
		}
	}

	if plan.Duration > 0 {
		for _, frac := range []float64{0.8, 0.6, 0.45, 0.3} {
			for _, crf := range steps[len(steps)/2:] {
				budgets = append(budgets, SizeBudget{CRF: crf, Duration: plan.Duration * frac, Palette: palette})
			}
		}
	}

	if palette {
		// Indexed output has no rate control, so after the sweep above the only
		// levers left are palette entries, canvas size, or both.
		scales := []int{0}
		if opts.AllowGeometryShrink {
			scales = halvingLadder(edge, 64)
		}
		for _, colors := range []int{128, 64, 32, 16} {
			for _, scale := range scales {
				budgets = append(budgets, SizeBudget{Colors: colors, Scale: scale, Palette: true})
			}
		}
	}

	if opts.AllowGeometryShrink {
		for _, scale := range halvingLadder(edge, 64) {
			if scale == 0 {
				continue
			}
			for _, crf := range []int{opts.CRFTo, opts.CRFTo + 3} {
				budgets = append(budgets, SizeBudget{CRF: crf, Scale: scale, Palette: palette})
			}
		}
	}
	if max := opts.MaxAttempts * 6; len(budgets) > max {
		budgets = budgets[:max]
	}
	return budgets
}

func crfLadder(from, to int, n int) []int {
	if n <= 1 || to <= from {
		return []int{from}
	}
	steps := make([]int, 0, n)
	span := float64(to - from)
	for i := 0; i < n; i++ {
		steps = append(steps, from+int(span*float64(i)/float64(n-1)))
	}
	return dedupeInts(steps)
}

func halvingLadder(edge, floor int) []int {
	out := []int{0}
	for e := edge / 2; e >= floor; e /= 2 {
		out = append(out, e)
	}
	return out
}

func dedupeInts(in []int) []int {
	seen := map[int]bool{}
	out := make([]int, 0, len(in))
	for _, v := range in {
		if !seen[v] {
			seen[v] = true
			out = append(out, v)
		}
	}
	sort.Ints(out)
	return out
}

func apply(plan *Request, b SizeBudget) {
	if b.CRF > 0 {
		plan.CRF = b.CRF
		plan.BitrateKbps = 0
		plan.TwoPass = false
	}
	if b.BitrateKbps > 0 {
		plan.BitrateKbps = b.BitrateKbps
		plan.CRF = 0
	}
	if b.FPS > 0 {
		plan.FPS = b.FPS
	}
	if b.Scale > 0 {
		if plan.Width == 0 || plan.Height == 0 || plan.Width >= plan.Height {
			plan.Width = b.Scale
			plan.Height = 0
		} else {
			plan.Height = b.Scale
			plan.Width = 0
		}
	}
	if b.Duration > 0 {
		plan.Duration = b.Duration
	}
	// Only the palette graph is owned by the budget rung. ExtraFilters carries
	// the caller's geometry (sticker scale and pad rules) and must survive, and
	// so must any keying filters - dropping them would hand back an opaque
	// background on the rung that finally fits.
	if b.Palette {
		plan.FilterComplex = paletteGraphWith(plan.Erase.Filters(), plan.Width, plan.Height,
			plan.FPS, b.Colors, plan.KeepPixels)
	} else {
		plan.FilterComplex = ""
	}
}

// PaletteGraph quantises to 256 colours in a single pass, which is how GIF and
// indexed WebP stickers stay legible at a fraction of the naive size.
//
// Geometry is normalised once, then the stream is split so the palette is
// derived from the same frames that consume it.
func PaletteGraph(width, height int, fps float64, keepPixels bool) string {
	return paletteGraph(width, height, fps, 0, keepPixels)
}

// paletteGraph builds the single-pass quantiser. colors caps the palette, which
// is the real size lever for indexed output: a GIF has no quality knob, so the
// only way down after geometry is fewer entries.
func paletteGraph(width, height int, fps float64, colors int, keepPixels bool) string {
	return paletteGraphWith(nil, width, height, fps, colors, keepPixels)
}

// paletteGraphWith prepends extra filters -- background keying, for instance --
// so they run before the split. A GIF's alpha comes from its palette, so
// anything that creates an alpha channel has to be inside this graph rather than
// on a separate -vf chain.
func paletteGraphWith(prefix []string, width, height int, fps float64, colors int,
	keepPixels bool) string {
	smooth := "lanczos"
	if keepPixels {
		smooth = "neighbor"
	}
	var scale string
	switch {
	case width > 0 && height > 0:
		// Both edges given means an exact canvas: fit inside it, then pad with
		// transparent colour instead of stretching the artwork.
		scale = fmt.Sprintf(
			"scale=%d:%d:force_original_aspect_ratio=decrease:flags=%s,"+
				"pad=%d:%d:(ow-iw)/2:(oh-ih)/2:color=black@0.0",
			width, height, smooth, width, height)
	case width > 0:
		scale = fmt.Sprintf("scale=%d:-2:flags=%s", width, smooth)
	case height > 0:
		scale = fmt.Sprintf("scale=-2:%d:flags=%s", height, smooth)
	}

	steps := make([]string, 0, len(prefix)+3)
	if fps > 0 {
		steps = append(steps, "fps="+strconv.FormatFloat(fps, 'f', -1, 64))
	}
	steps = append(steps, prefix...)
	// A keying pass already decides alpha per pixel and may leave a deliberate
	// soft edge behind, so only clamp when nothing else touched the alpha.
	if keepPixels && len(prefix) == 0 {
		steps = append(steps, alphaClampFilters...)
	}
	if scale != "" {
		steps = append(steps, scale)
	}
	chain := strings.Join(steps, ",")
	if chain == "" {
		chain = "null"
	}

	gen := "palettegen=stats_mode=diff"
	if colors > 0 {
		gen = fmt.Sprintf("palettegen=stats_mode=diff:max_colors=%d", colors)
	}
	return fmt.Sprintf(
		"[0:v]%s,split[pal][src];[pal]%s[p];"+
			"[src][p]paletteuse=dither=bayer:bayer_scale=4:alpha_threshold=128[out]",
		chain, gen)
}

// SizeOnDisk returns the file size, or 0 when the path is missing.
func SizeOnDisk(path string) int64 {
	st, err := os.Stat(path)
	if err != nil || st.IsDir() {
		return 0
	}
	return st.Size()
}

type leafInfo struct {
	// palette marks an output whose size lever is the colour table, so the ladder
	// sweeps max_colors after quality runs out.
	palette bool
	// rateless marks a codec that exposes no rate control at all. Sweeping CRF on
	// those produces byte-identical files, so the quality rungs are collapsed.
	rateless bool
}

func lsbFor(path string) leafInfo {
	switch strings.ToLower(extOf(path)) {
	case ".gif":
		// The gif encoder takes neither -crf nor -b:v; palette entries, canvas and
		// frame count are the only levers it has.
		return leafInfo{palette: true, rateless: true}
	case ".png":
		// PNG is lossless, so -crf is dropped by crfFlag. Colour depth is the lever.
		return leafInfo{palette: true, rateless: true}
	}
	// WebP keeps its own -q:v sweep: quantising a sticker to 256 colours here would
	// be wrong, and the palette graph discards the pack's pad and format filters.
	return leafInfo{}
}

func extOf(p string) string {
	for i := len(p) - 1; i >= 0 && p[i] != '/'; i-- {
		if p[i] == '.' {
			return p[i:]
		}
	}
	return ""
}

func humanBytes(n int64) string {
	switch {
	case n >= 1<<20:
		return strconv.FormatFloat(float64(n)/(1<<20), 'f', 2, 64) + " MiB"
	case n >= 1<<10:
		return strconv.FormatFloat(float64(n)/(1<<10), 'f', 1, 64) + " KiB"
	default:
		return strconv.FormatInt(n, 10) + " B"
	}
}
