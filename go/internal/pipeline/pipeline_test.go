package pipeline

import (
	"context"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"

	"github.com/TenOFSwordsr/eliverter/internal/registry"
)

var (
	testBin    Binaries
	testReg    = registry.New()
	testEng    *Engine
	samplesDir string
)

// TestMain generates a small media corpus once so every test runs against real
// FFmpeg output rather than fixtures that can drift from the codec table.
func TestMain(m *testing.M) {
	ctx := context.Background()
	bin, err := DiscoverBinaries("")
	if err != nil {
		fmt.Println("SKIP: ffmpeg not available:", err)
		os.Exit(0)
	}
	testBin = bin
	if _, err := testBin.DiscoverCaps(ctx); err != nil {
		fmt.Println("SKIP: capability discovery failed:", err)
		os.Exit(0)
	}
	testEng, _ = NewEngine(ctx, bin, testReg)

	dir, err := os.MkdirTemp("", "eliverter-samples")
	if err != nil {
		fmt.Println("SKIP: temp dir:", err)
		os.Exit(0)
	}
	samplesDir = dir
	code := m.Run()
	os.RemoveAll(dir)
	os.Exit(code)
}

func mustRun(t *testing.T, args ...string) {
	t.Helper()
	cmd := exec.Command(testBin.FFmpeg, args...)
	cmd.Env = append(os.Environ(), "LC_ALL=C")
	if out, err := cmd.CombinedOutput(); err != nil {
		t.Fatalf("ffmpeg %v: %v\n%s", args, err, out)
	}
}

func sample(t *testing.T, name string) string {
	t.Helper()
	p := filepath.Join(samplesDir, name)
	if _, err := os.Stat(p); err == nil {
		return p
	}
	switch name {
	case "clip.mp4":
		mustRun(t, "-hide_banner", "-loglevel", "error", "-y",
			"-f", "lavfi", "-i", "testsrc2=size=320x240:rate=30:duration=2",
			"-f", "lavfi", "-i", "sine=frequency=440:duration=2",
			"-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", p)
	case "square.png":
		mustRun(t, "-hide_banner", "-loglevel", "error", "-y",
			"-f", "lavfi", "-i", "gradients=size=200x120:duration=1",
			"-vf", "format=rgba", "-frames:v", "1", p)
	case "tall.png":
		mustRun(t, "-hide_banner", "-loglevel", "error", "-y",
			"-f", "lavfi", "-i", "gradients=size=100x400:duration=1",
			"-vf", "format=rgba", "-frames:v", "1", p)
	case "tone.wav":
		mustRun(t, "-hide_banner", "-loglevel", "error", "-y",
			"-f", "lavfi", "-i", "sine=frequency=440:duration=1", p)
	case "anim.gif":
		mustRun(t, "-hide_banner", "-loglevel", "error", "-y",
			"-f", "lavfi", "-i", "testsrc=size=160x160:rate=10:duration=1", p)
	case "alpha.webm":
		// A transparent animated source, to prove yuva420p survives the round
		// trip. colorchannelmixer cannot read yuva420p, so alpha is applied in
		// rgba and only converted last; and libvpx-vp9 needs auto-alt-ref off.
		mustRun(t, "-hide_banner", "-loglevel", "error", "-y",
			"-f", "lavfi", "-i", "gradients=size=200x120:rate=30:duration=1",
			"-vf", "format=rgba,colorchannelmixer=aa=0.5,format=yuva420p",
			"-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0", "-an", p)
		info, err := testBin.Probe(context.Background(), p)
		if err != nil {
			t.Fatalf("alpha fixture: %v", err)
		}
		if !info.HasAlpha {
			t.Fatalf("alpha fixture came out opaque (pix_fmt=%s), the generator is wrong",
				info.PixelFormat)
		}
	case "junk.bin":
		if err := os.WriteFile(p, []byte("this is definitely not a media file"), 0o644); err != nil {
			t.Fatal(err)
		}
	default:
		t.Fatalf("no generator for sample %q", name)
	}
	return p
}

func outPath(t *testing.T, name string) string {
	t.Helper()
	return filepath.Join(samplesDir, "out-"+name)
}

// ---------------------------------------------------------------------------

func TestProbeVideo(t *testing.T) {
	info, err := testEng.ProbeAndResolve(context.Background(), sample(t, "clip.mp4"))
	if err != nil {
		t.Fatal(err)
	}
	if info.Width != 320 || info.Height != 240 {
		t.Errorf("geometry = %dx%d, want 320x240", info.Width, info.Height)
	}
	if info.VideoKey != "h264" {
		t.Errorf("VideoKey = %q, want h264", info.VideoKey)
	}
	if info.AudioKey != "aac" {
		t.Errorf("AudioKey = %q, want aac", info.AudioKey)
	}
	if info.DurationSeconds < 1.5 || info.DurationSeconds > 2.5 {
		t.Errorf("duration = %v, want ~2", info.DurationSeconds)
	}
	if info.SampleRate == 0 || info.Channels == 0 {
		t.Errorf("audio params missing: rate=%d channels=%d", info.SampleRate, info.Channels)
	}
}

func TestProbeAudioOnly(t *testing.T) {
	info, err := testEng.ProbeAndResolve(context.Background(), sample(t, "tone.wav"))
	if err != nil {
		t.Fatal(err)
	}
	if info.VideoCodec != "" {
		t.Errorf("expected no video track, got %q", info.VideoCodec)
	}
	if info.AudioKey != "pcm_s" {
		t.Errorf("AudioKey = %q, want pcm_s", info.AudioKey)
	}
}

func TestProbeRejectsNonMedia(t *testing.T) {
	_, err := testEng.ProbeAndResolve(context.Background(), sample(t, "junk.bin"))
	if err == nil {
		t.Fatal("expected an error for a non-media file")
	}
}

func TestProbeMissingFile(t *testing.T) {
	if _, err := testEng.ProbeAndResolve(context.Background(), filepath.Join(samplesDir, "nope.mp4")); err == nil {
		t.Fatal("expected an error for a missing file")
	}
}

// ---------------------------------------------------------------------------

func TestPlanPrefersLegalEncoders(t *testing.T) {
	info, err := testEng.ProbeAndResolve(context.Background(), sample(t, "clip.mp4"))
	if err != nil {
		t.Fatal(err)
	}
	plan, err := testEng.BuildPlan(&Request{
		Input: sample(t, "clip.mp4"), Output: outPath(t, "a.webm"),
		TargetContainer: "webm", CRF: 32,
	}, info)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(plan.VideoEncoder, "libvpx") && plan.VideoEncoder != "vp9" {
		t.Errorf("video encoder = %q, want a VP9-family encoder for webm", plan.VideoEncoder)
	}
	if !contains([]string{"libopus", "opus", "vorbis", "libvorbis"}, plan.AudioEncoder) {
		t.Errorf("audio encoder = %q, want opus or vorbis", plan.AudioEncoder)
	}
}

func TestPlanRejectsIllegalMux(t *testing.T) {
	info, err := testEng.ProbeAndResolve(context.Background(), sample(t, "clip.mp4"))
	if err != nil {
		t.Fatal(err)
	}
	// H.264 is not a legal WebM video codec; only audio should survive, which
	// makes the plan incomplete and therefore an explicit error.
	_, err = testEng.BuildPlan(&Request{
		Input: sample(t, "clip.mp4"), Output: outPath(t, "b.webm"),
		TargetContainer: "webm", VideoCodec: "h264", NoAudio: true,
	}, info)
	if err == nil {
		t.Fatal("expected h264-into-webm to be rejected")
	}
}

func TestPlanUnknownTargetInferredFromExtension(t *testing.T) {
	plan, err := testEng.BuildPlan(&Request{
		Input: sample(t, "clip.mp4"), Output: outPath(t, "c.mkv"),
		VideoCodec: "h264", AudioCodec: "aac", CRF: 23,
	}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if plan.Muxer != "mkv" {
		t.Errorf("muxer = %q, want mkv", plan.Muxer)
	}
}

func TestPlanRequiresPaths(t *testing.T) {
	if _, err := testEng.BuildPlan(&Request{}, nil); err == nil {
		t.Fatal("expected an error when input/output are empty")
	}
}

// ---------------------------------------------------------------------------

func TestConvertRoundTrip(t *testing.T) {
	req := &Request{
		Input: sample(t, "clip.mp4"), Output: outPath(t, "round.webm"),
		TargetContainer: "webm", CRF: 34, Width: 160, Height: 120,
	}
	if _, err := testEng.Convert(context.Background(), req, nil); err != nil {
		t.Fatal(err)
	}
	info, err := testEng.ProbeAndResolve(context.Background(), req.Output)
	if err != nil {
		t.Fatal(err)
	}
	if info.Width > 170 {
		t.Errorf("output width %d ignored the 160px cap", info.Width)
	}
	if SizeOnDisk(req.Output) == 0 {
		t.Error("output file is empty")
	}
}

func TestConvertCancelStopsWork(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	cancel()
	_, err := testEng.Convert(ctx, &Request{
		Input: sample(t, "clip.mp4"), Output: outPath(t, "cancel.webm"),
		TargetContainer: "webm",
	}, nil)
	if err == nil {
		t.Fatal("expected a cancelled context to abort the encode")
	}
}

// ---------------------------------------------------------------------------

func TestStickerRespectsHardSizeLimits(t *testing.T) {
	cases := []struct {
		pack  PackID
		input string
	}{
		{PackTelegramStatic, "square.png"},
		{PackWhatsAppStatic, "square.png"},
		{PackDiscordReaction, "tall.png"},
		{PackDiscordEmote, "clip.mp4"},
	}
	for _, tc := range cases {
		t.Run(string(tc.pack), func(t *testing.T) {
			pack, err := LookupPack(string(tc.pack))
			if err != nil {
				t.Fatal(err)
			}
			dir := t.TempDir()
			res, err := testEng.Sticker(context.Background(), sample(t, tc.input), tc.pack, dir, nil, nil)
			if err != nil {
				t.Fatalf("render: %v", err)
			}
			if res.SizeBytes > pack.LimitBytes {
				t.Errorf("size %d exceeds the %d byte ceiling", res.SizeBytes, pack.LimitBytes)
			}
			if !res.WithinLimit {
				t.Error("WithinLimit is false for an in-budget result")
			}
			if res.Width == 0 || res.Height == 0 {
				t.Errorf("geometry not reported: %dx%d", res.Width, res.Height)
			}
			if pack.Square && res.Width != pack.Edge {
				t.Errorf("square pack produced %dx%d, want %d x %d",
					res.Width, res.Height, pack.Edge, pack.Edge)
			}
			if !pack.Square && (res.Width > pack.Edge || res.Height > pack.Edge) {
				t.Errorf("%dx%d overflows the %dpx bounding box", res.Width, res.Height, pack.Edge)
			}
		})
	}
}

func TestStickerAnimatedTelegramRules(t *testing.T) {
	pack, err := LookupPack(string(PackTelegramAnimated))
	if err != nil {
		t.Fatal(err)
	}
	dir := t.TempDir()
	// An alpha source, so the transparent canvas requirement is actually tested
	// rather than assumed: FFmpeg downgrades to yuv420p when the input is opaque.
	res, err := testEng.Sticker(context.Background(), sample(t, "alpha.webm"), PackTelegramAnimated, dir, nil, nil)
	if err != nil {
		t.Fatalf("render: %v", err)
	}
	if res.SizeBytes > pack.LimitBytes {
		t.Errorf("animated sticker is %d bytes over the 256 KB ceiling", res.SizeBytes)
	}
	info, err := testEng.ProbeAndResolve(context.Background(), res.OutputPath)
	if err != nil {
		t.Fatal(err)
	}
	if info.VideoCodec != "vp9" {
		t.Errorf("codec = %q, want vp9", info.VideoCodec)
	}
	if len(info.Streams) != 1 {
		t.Errorf("got %d streams, want 1 (the audio track must be gone)", len(info.Streams))
	}
	// Container-level transparency signal (alpha_mode) survives the round trip.
	if !info.HasAlpha {
		t.Errorf("alpha was dropped: no alpha_mode tag on the output")
	}
	// The pixel-level check is deliberately a plan assertion: libvpx-vp9 silently
	// discards the alpha plane unless auto-alt-ref is off, so that is the part
	// Eliverter is responsible for getting right.
	plan, err := testEng.BuildPlan(testEng.packRequest(pack, sample(t, "alpha.webm"),
		outPath(t, "plan-only.webm"), info, nil), info)
	if err != nil {
		t.Fatalf("plan: %v", err)
	}
	if plan.PixelFormat != "yuva420p" {
		t.Errorf("pixel format = %q, want yuva420p", plan.PixelFormat)
	}
	if !adjacent(plan.Args, "-auto-alt-ref", "0") {
		t.Errorf("vp9 alpha needs -auto-alt-ref 0; args were %v", plan.Args)
	}
	if info.Width != 512 || info.Height != 512 {
		t.Errorf("geometry = %dx%d, want exactly 512x512", info.Width, info.Height)
	}
	if info.FPS < 29 || info.FPS > 31 {
		t.Errorf("fps = %v, want exactly 30", info.FPS)
	}
	if info.DurationSeconds > 3.05 {
		t.Errorf("duration = %v, want at most 3.0 seconds", info.DurationSeconds)
	}
}

func TestStickerUnknownPack(t *testing.T) {
	_, err := testEng.Sticker(context.Background(), sample(t, "clip.mp4"), "not_a_pack", t.TempDir(), nil, nil)
	if err == nil {
		t.Fatal("expected an unknown pack to be rejected")
	}
}

func TestStickerRejectsAudioOnlyInput(t *testing.T) {
	_, err := testEng.Sticker(context.Background(), sample(t, "tone.wav"), PackTelegramStatic, t.TempDir(), nil, nil)
	if !errors.Is(err, ErrPackRejected) {
		t.Fatalf("err = %v, want ErrPackRejected", err)
	}
}

// ---------------------------------------------------------------------------

func TestFitUnderSizeEscalatesUntilCompliant(t *testing.T) {
	out := outPath(t, "fit.gif")
	req := &Request{Input: sample(t, "clip.mp4"), Output: out,
		TargetContainer: "gif", VideoCodec: "gif", Width: 320, Height: 240, FPS: 20}
	// testsrc2 is maximum-entropy synthetic noise, the worst case for a palette
	// codec. The cap sits low enough that the first CRF rungs cannot meet it, so
	// the ladder has to reach palette entries and canvas size.
	fit, err := testEng.FitUnderSize(context.Background(), req,
		FitOptions{LimitBytes: 20 * 1024, SafetyMargin: 0.96, CRFFrom: 28, CRFTo: 45,
			MaxAttempts: 8, AllowGeometryShrink: true}, nil)
	if err != nil {
		t.Fatalf("fit: %v", err)
	}
	if fit.SizeBytes > 20*1024 {
		t.Errorf("size %d over a 20 KiB cap", fit.SizeBytes)
	}
	if fit.Attempts < 2 {
		t.Errorf("complied on attempt %d, so the escalation path was never exercised", fit.Attempts)
	}
}

func TestFitUnderSizeReportsWhenImpossible(t *testing.T) {
	out := outPath(t, "impossible.gif")
	req := &Request{Input: sample(t, "clip.mp4"), Output: out,
		TargetContainer: "gif", VideoCodec: "gif", Width: 640, Height: 480, FPS: 30}
	_, err := testEng.FitUnderSize(context.Background(), req,
		FitOptions{LimitBytes: 64, SafetyMargin: 0.96, CRFFrom: 40, CRFTo: 44,
			MaxAttempts: 2, AllowGeometryShrink: true}, nil)
	if !errors.Is(err, ErrOverBudget) {
		t.Fatalf("err = %v, want ErrOverBudget", err)
	}
}

// ---------------------------------------------------------------------------

func TestPaletteGraphIsAcceptedByFFmpeg(t *testing.T) {
	out := outPath(t, "palette.gif")
	req := &Request{Input: sample(t, "clip.mp4"), Output: out,
		TargetContainer: "gif", VideoCodec: "gif", Width: 128, Height: 128, FPS: 12,
		FilterComplex: PaletteGraph(128, 128, 12, false)}
	if _, err := testEng.Convert(context.Background(), req, nil); err != nil {
		t.Fatalf("the palette filter graph was rejected: %v", err)
	}
	if SizeOnDisk(out) == 0 {
		t.Fatal("palette encode produced an empty file")
	}
}

func TestAudioPeaksReduction(t *testing.T) {
	peaks, _, err := testEng.Peaks(context.Background(), sample(t, "tone.wav"), 50)
	if err != nil {
		t.Fatalf("peaks: %v", err)
	}
	if len(peaks) != 50 {
		t.Fatalf("got %d buckets, want 50", len(peaks))
	}
	var max float32
	for _, p := range peaks {
		if p > max {
			max = p
		}
		if p < 0 || p > 1 {
			t.Fatalf("peak %v outside 0..1", p)
		}
	}
	if max == 0 {
		t.Error("a 440 Hz tone produced an all-zero waveform")
	}
}

func TestStreamCopyWhenCodecsAlreadyLegal(t *testing.T) {
	info, err := testEng.ProbeAndResolve(context.Background(), sample(t, "clip.mp4"))
	if err != nil {
		t.Fatal(err)
	}
	plan, err := testEng.BuildPlan(&Request{
		Input: sample(t, "clip.mp4"), Output: outPath(t, "copy.mkv"),
		TargetContainer: "mkv", StreamCopy: true,
	}, info)
	if err != nil {
		t.Fatal(err)
	}
	if !contains(plan.Args, "copy") {
		t.Errorf("expected -c copy, args were %v", plan.Args)
	}
}

// adjacent reports whether flag and value appear next to each other in an
// ffmpeg argument list.
func adjacent(args []string, flag, value string) bool {
	for i := 0; i < len(args)-1; i++ {
		if args[i] == flag && args[i+1] == value {
			return true
		}
	}
	return false
}

func TestAlphaCropHintStripsTransparentBorder(t *testing.T) {
	// A 400x100 canvas with a 100x100 subject centred in it.
	src := filepath.Join(samplesDir, "bordered.png")
	mustRun(t, "-hide_banner", "-loglevel", "error", "-y",
		"-f", "lavfi", "-i", "gradients=size=100x100:duration=1",
		"-vf", "format=rgba,pad=400:100:150:0:color=black@0.0",
		"-frames:v", "1", src)

	hint, err := testEng.AlphaCropHint(context.Background(), src, false)
	if err != nil {
		t.Fatal(err)
	}
	if hint == "" {
		t.Fatal("no crop hint for an image that is 75% transparent padding")
	}
	if !strings.HasPrefix(hint, "crop=100:100:150:0") {
		t.Errorf("crop hint = %q, want crop=100:100:150:0", hint)
	}
}

func TestAlphaCropHintSkipsVideo(t *testing.T) {
	hint, err := testEng.AlphaCropHint(context.Background(), sample(t, "clip.mp4"), true)
	if err != nil {
		t.Fatal(err)
	}
	if hint != "" {
		t.Errorf("video input produced %q, want no crop", hint)
	}
}

func contains(list []string, want string) bool {
	for _, s := range list {
		if s == want {
			return true
		}
	}
	return false
}
