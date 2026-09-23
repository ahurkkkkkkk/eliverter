package pipeline

import (
	"context"
	"errors"
	"io"
	"path/filepath"
	"strings"
	"testing"
)

// samplePath names a file in the shared sample dir without going through
// sample(), whose switch only knows the fixtures it generates itself.
func samplePath(name string) string {
	return filepath.Join(samplesDir, name)
}

// keyingSource makes the canonical case for colour keying: a flat green
// backdrop with a magenta subject, so "is the background gone" has one answer.
func keyingSource(t *testing.T, name string) string {
	t.Helper()
	p := samplePath(name)
	mustRun(t, "-hide_banner", "-loglevel", "error", "-y",
		"-f", "lavfi", "-i", "color=c=green:size=200x200:duration=1",
		"-vf", "drawbox=x=70:y=70:w=60:h=60:color=magenta:t=fill",
		"-frames:v", "1", p)
	return p
}

func keyingClip(t *testing.T, name string) string {
	t.Helper()
	p := samplePath(name)
	mustRun(t, "-hide_banner", "-loglevel", "error", "-y",
		"-f", "lavfi", "-i", "color=c=green:size=200x200:rate=25:duration=1",
		"-vf", "drawbox=x=70:y=70:w=60:h=60:color=magenta:t=fill",
		"-pix_fmt", "yuv420p", p)
	return p
}

// rgbaAt decodes one frame of a file to raw RGBA so a test can ask about pixels
// rather than trusting a filter string. WebM VP9 alpha lives in a side-car block
// that FFmpeg's native vp9 decoder drops on the floor, so those files are read
// back through libvpx-vp9 -- the same way any real decoder app reads them.
func rgbaAt(t *testing.T, path string) ([]byte, int, int) {
	t.Helper()
	args := []string{"-i", path, "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgba", "-"}
	if strings.HasSuffix(path, ".webm") {
		args = []string{"-c:v", "libvpx-vp9", "-i", path,
			"-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgba", "-"}
	}
	rc, wait, err := testBin.RunRaw(context.Background(), args)
	if err != nil {
		t.Fatalf("decode %s: %v", path, err)
	}
	raw, rerr := io.ReadAll(rc)
	rc.Close()
	if werr := wait(); werr != nil && len(raw) < 4 {
		t.Fatalf("decode %s: %v", path, werr)
	}
	if rerr != nil && len(raw) < 4 {
		t.Fatalf("decode %s: %v", path, rerr)
	}
	w, h, err := guessFrameSize(len(raw))
	if err != nil {
		t.Fatalf("%s: %v", path, err)
	}
	return raw, w, h
}

func alphaAt(raw []byte, w, x, y int) int { return int(raw[(y*w+x)*4+3]) }

// ---------------------------------------------------------------------------
// Unit level
// ---------------------------------------------------------------------------

func TestBorderColorFindsFlatBackdrop(t *testing.T) {
	const w, h = 64, 48
	raw := make([]byte, w*h*4)
	for i := 0; i < w*h; i++ {
		raw[i*4+0], raw[i*4+1], raw[i*4+2], raw[i*4+3] = 0, 200, 0, 255
	}
	// A subject that is not the backdrop must not win the vote.
	for y := 16; y < 32; y++ {
		for x := 20; x < 44; x++ {
			i := (y*w + x) * 4
			raw[i], raw[i+1], raw[i+2] = 255, 0, 255
		}
	}
	color, coverage, err := borderColor(raw, w, h)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(color, "0x00C") {
		t.Errorf("sampled %s, want the green border", color)
	}
	if coverage < 0.9 {
		t.Errorf("coverage %v, want the border to be almost all one colour", coverage)
	}
}

func TestBorderColorRefusesABusyFrame(t *testing.T) {
	const w, h = 64, 64
	raw := make([]byte, w*h*4)
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			i := (y*w + x) * 4
			// A smooth ramp in all three channels: every quantised bucket holds a
			// pixel or two, so there is no backdrop here to key and it must say so.
			raw[i], raw[i+1], raw[i+2], raw[i+3] = byte(x*4), byte(y*4), byte((x+y)*2), 255
		}
	}
	_, _, err := borderColor(raw, w, h)
	if !errors.Is(err, ErrNoAlpha) {
		t.Fatalf("err = %v, want it to explain there is no flat background", err)
	}
	if !strings.Contains(err.Error(), "key_color") {
		t.Errorf("error should name the way out: %v", err)
	}
}

func TestGuessFrameSizeRecoversDimensions(t *testing.T) {
	for _, want := range [][2]int{{320, 240}, {200, 200}, {1920, 1080}} {
		n := want[0] * want[1] * 4
		w, h, err := guessFrameSize(n)
		if err != nil {
			t.Errorf("%dx%d: %v", want[0], want[1], err)
			continue
		}
		if w*h*4 != n {
			t.Errorf("%d bytes -> %dx%d, area does not match", n, w, h)
		}
	}
	if _, _, err := guessFrameSize(7); err == nil {
		t.Error("7 bytes is not an RGBA frame")
	}
}

func TestEraseFiltersLeadWithAlphaFormat(t *testing.T) {
	e := &Erase{Mode: EraseColor, Color: "#00FF00"}
	got := strings.Join(e.Filters(), ",")
	if !strings.HasPrefix(got, "format=rgba,colorkey=0x00FF00:") {
		t.Errorf("filters = %q", got)
	}
	if strings.Contains(got, "despill") {
		t.Error("despill is off by default and should stay off unless asked")
	}
	if !strings.Contains(got, ":0.180:0.100") {
		t.Errorf("Filters() must apply the default tolerances itself: %q", got)
	}
	e.Despill = true
	if got := strings.Join(e.Filters(), ","); !strings.Contains(got, "despill=type=green") {
		t.Errorf("green key should despill green: %q", got)
	}
	if got := despillType(0x0000FF); got != "blue" {
		t.Errorf("despillType(blue) = %q", got)
	}
	if _, err := (&Erase{Mode: "nonsense"}).normalized(); err == nil {
		t.Error("an unknown mode must be rejected")
	}
	if _, err := (&Erase{Mode: EraseColor, Color: "chartreuse"}).normalized(); err == nil {
		t.Error("a colour that is not hex must be rejected")
	}
}

// ---------------------------------------------------------------------------
// Plan level
// ---------------------------------------------------------------------------

func eraseResolver() *Resolver {
	return &Resolver{Reg: testReg, Caps: &Caps{
		Encoders: map[string]bool{"libvpx-vp9": true, "libopus": true, "libwebp": true,
			"gif": true, "png": true, "libx264": true, "aac": true},
	}}
}

func TestEraseRejectedForOpaqueTarget(t *testing.T) {
	_, err := eraseResolver().BuildPlan(&Request{
		Input: "in.png", Output: "out.mp4", TargetContainer: "mp4", NoAudio: true,
		Erase: &Erase{Mode: EraseColor, Color: "0x00FF00"},
	}, nil)
	if !errors.Is(err, ErrNoAlpha) {
		t.Fatalf("err = %v, want ErrNoAlpha", err)
	}
}

func TestEraseNeedsAResolvedColour(t *testing.T) {
	_, err := eraseResolver().BuildPlan(&Request{
		Input: "in.png", Output: "out.webp", TargetContainer: "webp", NoAudio: true,
		Erase: &Erase{Mode: EraseAuto},
	}, nil)
	if err == nil || !strings.Contains(err.Error(), "never resolved") {
		t.Fatalf("err = %v, want the auto colour to be resolved before planning", err)
	}
}

func TestEraseKeyLeadsTheFilterChain(t *testing.T) {
	plan, err := eraseResolver().BuildPlan(&Request{
		Input: "in.mp4", Output: "out.webm", TargetContainer: "webm", NoAudio: true,
		Width: 100, Erase: &Erase{Mode: EraseColor, Color: "0x00FF00"},
	}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(plan.FilterGraph, "format=rgba,colorkey=") {
		t.Errorf("keying must run before geometry: %q", plan.FilterGraph)
	}
	if !strings.Contains(plan.FilterGraph, "scale=100:-2") {
		t.Errorf("the caller's scale should survive after the key: %q", plan.FilterGraph)
	}
	if plan.PixelFormat != "yuva420p" {
		t.Errorf("pixel format = %q, want yuva420p so the alpha plane survives", plan.PixelFormat)
	}
}

func TestGifEraseKeysInsideThePaletteGraph(t *testing.T) {
	plan, err := eraseResolver().BuildPlan(&Request{
		Input: "in.mp4", Output: "out.gif", TargetContainer: "gif", NoAudio: true,
		FPS: 12, Erase: &Erase{Mode: EraseColor, Color: "0x00FF00"},
	}, nil)
	if err != nil {
		t.Fatal(err)
	}
	graph := argAfter(plan.Args, "-filter_complex")
	key := strings.Index(graph, "colorkey")
	pal := strings.Index(graph, "palettegen")
	if key < 0 || pal < 0 {
		t.Fatalf("gif erase needs both in one graph: %v", plan.Args)
	}
	if key > pal {
		t.Errorf("the key must be derived before the palette is built: %s", graph)
	}
	if !strings.Contains(strings.Join(plan.Args, " "), `-map [out]`) {
		t.Errorf("a complex graph must map its label: %v", plan.Args)
	}
}

// A GIF pack carries its geometry inside the palette graph, so keying has to be
// woven into that graph rather than appended to a -vf chain that the graph
// replaces. Asserted twice on purpose: once on the plan, once on the pixels.
func TestGifPackWeavesKeyingIntoItsCanvas(t *testing.T) {
	pack, err := LookupPack(string(PackDiscordEmote))
	if err != nil {
		t.Fatal(err)
	}
	src := samplePath("keying.mp4")
	mustRun(t, "-hide_banner", "-loglevel", "error", "-y",
		"-f", "lavfi", "-i", "color=c=green:size=200x200:duration=1",
		"-vf", "drawbox=x=70:y=70:w=60:h=60:color=magenta:t=fill",
		"-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "25", src)

	erase, err := testEng.resolveErase(context.Background(), src, &Erase{Mode: EraseAuto})
	if err != nil {
		t.Fatal(err)
	}
	req := testEng.packRequest(pack, src, outPath(t, "keyed-pack.gif"),
		&MediaInfo{Width: 200, Height: 200, FPS: 25, DurationSeconds: 1}, erase)

	graph := req.FilterComplex
	key, pal := strings.Index(graph, "colorkey"), strings.Index(graph, "palettegen")
	if key < 0 || pal < 0 {
		t.Fatalf("the pack graph needs both keying and a quantiser: %q", graph)
	}
	if key > pal {
		t.Errorf("the key must be derived before the palette is built: %s", graph)
	}
	if !strings.Contains(graph, "scale=128:128") {
		t.Errorf("the pack canvas was dropped: %q", graph)
	}

	res, err := testEng.Sticker(context.Background(), src, PackDiscordEmote, t.TempDir(), erase, nil)
	if err != nil {
		t.Fatalf("pack render: %v", err)
	}
	raw, w, _ := rgbaAt(t, res.OutputPath)
	if a := alphaAt(raw, w, 1, 1); a > 40 {
		t.Errorf("corner alpha = %d, want the backdrop keyed out of the sprite", a)
	}
}

func argAfter(args []string, flag string) string {
	for i, a := range args {
		if a == flag && i+1 < len(args) {
			return args[i+1]
		}
	}
	return ""
}

// ---------------------------------------------------------------------------
// End to end: do the pixels actually become transparent?
// ---------------------------------------------------------------------------

func TestEraseProducesRealAlphaStill(t *testing.T) {
	src := keyingSource(t, "keying.png")
	if _, _, err := testBin.SampleBackground(context.Background(), src); err != nil {
		t.Fatalf("sampling a flat green backdrop should work: %v", err)
	}

	out := outPath(t, "keyed.webp")
	if _, err := testEng.Convert(context.Background(), &Request{
		Input: src, Output: out, TargetContainer: "webp", NoAudio: true,
		Erase: &Erase{Mode: EraseAuto},
	}, nil); err != nil {
		t.Fatal(err)
	}

	raw, w, h := rgbaAt(t, out)
	if corner := alphaAt(raw, w, 2, 2); corner > 40 {
		t.Errorf("corner alpha = %d, want the green backdrop keyed out", corner)
	}
	if centre := alphaAt(raw, w, w/2, h/2); centre < 200 {
		t.Errorf("centre alpha = %d, want the magenta subject left opaque", centre)
	}
}

func TestEraseProducesRealAlphaVideo(t *testing.T) {
	src := keyingClip(t, "keying.mp4")
	out := outPath(t, "keyed.webm")
	if _, err := testEng.Convert(context.Background(), &Request{
		Input: src, Output: out, TargetContainer: "webm", NoAudio: true,
		Erase: &Erase{Mode: EraseAuto, Despill: true},
	}, nil); err != nil {
		t.Fatal(err)
	}
	raw, w, h := rgbaAt(t, out)
	if corner := alphaAt(raw, w, 1, 1); corner > 60 {
		t.Errorf("video corner alpha = %d, want the backdrop keyed out", corner)
	}
	if centre := alphaAt(raw, w, w/2, h/2); centre < 180 {
		t.Errorf("video centre alpha = %d, want the subject kept", centre)
	}
}

// Keying is a colour comparison, so naming the wrong colour has to fail loudly
// rather than quietly return the original frame. The clip's green is 0x007F00
// after the YUV round trip; asking for 0x00FF00 with a tight tolerance keys
// nothing, which is the honest outcome and the reason auto mode samples.
func TestEraseWithAWrongColourKeysNothing(t *testing.T) {
	src := keyingClip(t, "keying.mp4")
	out := outPath(t, "keyed-tight.webm")
	if _, err := testEng.Convert(context.Background(), &Request{
		Input: src, Output: out, TargetContainer: "webm", NoAudio: true,
		Erase: &Erase{Mode: EraseColor, Color: "0xFF0000", Similarity: 0.01, Blend: 0.01},
	}, nil); err != nil {
		t.Fatal(err)
	}
	raw, w, _ := rgbaAt(t, out)
	if corner := alphaAt(raw, w, 1, 1); corner < 200 {
		t.Errorf("corner alpha = %d, want an unrelated key colour to leave the frame alone", corner)
	}
}

func TestEraseGifStaysPlayable(t *testing.T) {
	src := keyingSource(t, "keying.png")
	out := outPath(t, "keyed.gif")
	if _, err := testEng.Convert(context.Background(), &Request{
		Input: src, Output: out, TargetContainer: "gif", NoAudio: true,
		FPS: 5, Erase: &Erase{Mode: EraseAuto},
	}, nil); err != nil {
		t.Fatal(err)
	}
	info, err := testBin.Probe(context.Background(), out)
	if err != nil {
		t.Fatal(err)
	}
	if info.VideoCodec != "gif" {
		t.Errorf("codec = %q, want gif", info.VideoCodec)
	}
}

func TestSampleBackgroundOnARealFile(t *testing.T) {
	src := keyingSource(t, "keying.png")
	color, coverage, err := testBin.SampleBackground(context.Background(), src)
	if err != nil {
		t.Fatal(err)
	}
	r, g, b := int(mustColor(color)>>16&0xFF), int(mustColor(color)>>8&0xFF), int(mustColor(color)&0xFF)
	// The nominal backdrop is 0x00FF00, but the clip round-trips through YUV, so
	// the honest sample is a darker green. Keying the value the pixels actually
	// hold is the whole point of sampling instead of asking.
	if g <= r || g <= b {
		t.Errorf("sampled %s (%d,%d,%d), want green to dominate", color, r, g, b)
	}
	if coverage < 0.8 {
		t.Errorf("coverage %v, want most of the border to be backdrop", coverage)
	}
}
