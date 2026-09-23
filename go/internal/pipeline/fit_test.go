package pipeline

import (
	"path/filepath"
	"strings"
	"testing"

	"github.com/TenOFSwordsr/eliverter/internal/registry"
)

func fitEngine() *Engine {
	return &Engine{Resolver{Reg: registry.New(), Caps: externalCaps()}}
}

// budgetsFor builds the degradation ladder for a representative sticker request
// ending in `output`. Only the extension matters to ladder(); the rest mirrors
// what a fixed-canvas pack would hand it.
func budgetsFor(t *testing.T, output string, opts FitOptions) []SizeBudget {
	t.Helper()
	e := fitEngine()
	req := &Request{
		Input: "in.mp4", Output: output,
		TargetContainer: strings.TrimSuffix(filepath.Base(output), filepath.Ext(output)),
		Width:           128, Height: 128, FPS: 20, Duration: 5, NoAudio: true,
	}
	return e.ladder(req, opts)
}

func defaultOpts() FitOptions {
	o := DefaultFit(256 * 1024)
	o.CRFFrom, o.CRFTo, o.MaxAttempts = 24, 40, 8
	return o
}

// A GIF encoder exposes no rate control, so the eight-rung quality sweep used to
// re-encode the identical file eight times before reaching the levers that do
// work. On a phone CPU that was the difference between a snappy sticker and a
// stalled one.
func TestLadderCollapsesCRFForRatelessCodecs(t *testing.T) {
	for _, out := range []string{"sticker.gif", "sticker.png"} {
		count := 0
		for _, b := range budgetsFor(t, out, defaultOpts()) {
			if b.Colors == 0 && b.Scale == 0 && b.FPS == 0 && b.Duration == 0 && b.CRF != 0 {
				count++
			}
		}
		if count != 1 {
			t.Errorf("%s: %d quality-only rungs, want exactly 1", out, count)
		}
	}

	// A codec with real rate control must keep the full sweep.
	full := 0
	for _, b := range budgetsFor(t, "clip.webm", defaultOpts()) {
		if b.Colors == 0 && b.Scale == 0 && b.FPS == 0 && b.Duration == 0 && b.CRF != 0 {
			full++
		}
	}
	if full < 2 {
		t.Errorf("webm: %d quality rungs, want the whole CRF sweep", full)
	}
}

// The GIF size lever is the colour table; WebP and MP4 must not be dragged into
// the palette graph, which would quantise a sticker to 256 colours and discard
// the pack's own pad and format filters.
func TestPaletteGraphOnlyForIndexedOutputs(t *testing.T) {
	for _, tc := range []struct {
		output string
		want   bool
	}{
		{"sticker.gif", true},
		{"sticker.png", true},
		{"sticker.webp", false},
		{"clip.webm", false},
		{"clip.mp4", false},
	} {
		leaf := lsbFor(tc.output)
		if leaf.palette != tc.want {
			t.Errorf("%s: palette=%v want %v", tc.output, leaf.palette, tc.want)
		}
		swept := false
		for _, b := range budgetsFor(t, tc.output, defaultOpts()) {
			if b.Colors > 0 {
				swept = true
			}
		}
		if swept != tc.want {
			t.Errorf("%s: colour sweep present=%v want %v", tc.output, swept, tc.want)
		}
	}
}

// apply() owns only the palette graph. Everything in ExtraFilters is the
// caller's geometry contract -- the Telegram exact-edge expression, the alpha
// crop -- and a rung must never quietly take it away.
func TestApplyPreservesCallerFilters(t *testing.T) {
	req := Request{Input: "in.mp4", Output: "s.webp", ExtraFilters: []string{"format=rgba"}}
	apply(&req, SizeBudget{CRF: 34})
	if len(req.ExtraFilters) != 1 || req.ExtraFilters[0] != "format=rgba" {
		t.Errorf("ExtraFilters = %v, want the caller's chain untouched", req.ExtraFilters)
	}
	if req.FilterComplex != "" {
		t.Errorf("a non-palette rung injected a graph: %q", req.FilterComplex)
	}

	apply(&req, SizeBudget{CRF: 34, Palette: true})
	if req.FilterComplex == "" {
		t.Error("a palette rung must install the palette graph")
	}
	if len(req.ExtraFilters) != 1 {
		t.Errorf("palette rung clobbered ExtraFilters: %v", req.ExtraFilters)
	}
}

func TestHardwareEncodersGetNoCRF(t *testing.T) {
	for _, enc := range []string{"h264_mediacodec", "vp9_mediacodec", "hevc_mediacodec", "av1_mediacodec", "h264_nvenc"} {
		if acceptsCRF(enc) {
			t.Errorf("%s does not expose -crf", enc)
		}
		if got := crfFlag(enc, 23); got != nil {
			t.Errorf("crfFlag(%s) = %v, want nil", enc, got)
		}
	}
	for _, enc := range []string{"libx264", "libvpx-vp9", "libopus"} {
		if !acceptsCRF(enc) {
			t.Errorf("%s does take -crf", enc)
		}
	}
	// The software encoder is preferred, so the hardware name must resolve back
	// to its codec key for the default-CRF lookup to work at all.
	if k := vCodecKey("h264_mediacodec"); k != "h264" {
		t.Errorf("vCodecKey(h264_mediacodec) = %q", k)
	}
}

// A phone build with no software VP9 still has to produce WebM: MediaCodec is
// the only encoder, and handing it -crf would fail the whole job.
func TestPlanFallsBackToMediaCodecWithoutCrf(t *testing.T) {
	r := &Resolver{Reg: registry.New(), Caps: &Caps{
		Encoders: map[string]bool{"vp9_mediacodec": true, "aac": true},
	}}
	plan, err := r.BuildPlan(&Request{
		Input: "in.mp4", Output: "out.webm", VideoCodec: "vp9", NoAudio: true, CRF: 32,
	}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if plan.VideoEncoder != "vp9_mediacodec" {
		t.Fatalf("encoder = %q, want vp9_mediacodec", plan.VideoEncoder)
	}
	if containsValue(plan.Args, "-crf") {
		t.Errorf("mediacodec has no -crf option: %v", plan.Args)
	}
	if !containsValue(plan.Args, "vp9_mediacodec") {
		t.Errorf("-c:v missing from %v", plan.Args)
	}
}
