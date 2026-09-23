package pipeline

import (
	"testing"

	"github.com/TenOFSwordsr/eliverter/internal/registry"
)

// The Android FFmpeg is configured --disable-external, so libopus and libvorbis
// are absent and the only encoder left for those codecs is FFmpeg's native one,
// which is flagged experimental and rejected with exit status 88 unless the
// command line also carries -strict.

func nativeOnlyCaps() *Caps {
	return &Caps{
		Encoders:     map[string]bool{"libvpx-vp9": true, "opus": true, "vorbis": true, "aac": true},
		Experimental: map[string]bool{"opus": true, "vorbis": true},
	}
}

func externalCaps() *Caps {
	return &Caps{
		Encoders:     map[string]bool{"libvpx-vp9": true, "libopus": true, "libvorbis": true, "aac": true},
		Experimental: map[string]bool{},
	}
}

func capResolver(caps *Caps) *Resolver {
	return &Resolver{Reg: registry.New(), Caps: caps}
}

func webm(t *testing.T, r *Resolver) *registry.Container {
	t.Helper()
	c, ok := r.Reg.ContainerByKey("webm")
	if !ok {
		t.Fatal("registry lost the webm container")
	}
	return c
}

func TestPickEncoderPrefersTheOfficialBuild(t *testing.T) {
	r := capResolver(externalCaps())
	enc, exp, err := r.pickEncoder("opus", webm(t, r), false)
	if err != nil {
		t.Fatal(err)
	}
	if enc != "libopus" || exp {
		t.Errorf("pickEncoder = %q experimental=%v, want libopus/false", enc, exp)
	}
}

func TestPickEncoderFallsBackToTheExperimentalOne(t *testing.T) {
	r := capResolver(nativeOnlyCaps())
	enc, exp, err := r.pickEncoder("opus", webm(t, r), false)
	if err != nil {
		t.Fatalf("an experimental encoder is still an encoder: %v", err)
	}
	if enc != "opus" || !exp {
		t.Errorf("pickEncoder = %q experimental=%v, want opus/true", enc, exp)
	}
}

func TestPlanCarriesStrictOnlyForExperimentalEncoders(t *testing.T) {
	req := &Request{Input: "in.mp4", Output: "out.webm", VideoCodec: "vp9", AudioCodec: "opus"}

	plan, err := capResolver(nativeOnlyCaps()).BuildPlan(req, nil)
	if err != nil {
		t.Fatal(err)
	}
	if !plan.ExperimentalEncoder {
		t.Fatal("plan built from a native-only build should be flagged experimental")
	}
	if !adjacentArgs(plan.Args, "-strict", "-2") {
		t.Errorf("missing -strict -2 in %v", plan.Args)
	}

	desktop, err := capResolver(externalCaps()).BuildPlan(req, nil)
	if err != nil {
		t.Fatal(err)
	}
	if desktop.ExperimentalEncoder {
		t.Error("libopus is not experimental")
	}
	if containsValue(desktop.Args, "-strict") {
		t.Errorf("unexpected -strict in %v", desktop.Args)
	}
}

// Dropping the video track must not drop the -strict that the surviving audio
// track still needs, and vice versa.
func TestExperimentalFlagSurvivesTrackDrop(t *testing.T) {
	r := &Resolver{Reg: registry.New(), Caps: &Caps{
		Encoders:     map[string]bool{"opus": true},
		Experimental: map[string]bool{"opus": true},
	}}
	plan, err := r.BuildPlan(&Request{
		Input: "in.mp4", Output: "out.webm", VideoCodec: "vp9", AudioCodec: "opus",
	}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if plan.VideoEncoder != "" {
		t.Fatalf("video should have been dropped, got %q", plan.VideoEncoder)
	}
	if plan.AudioEncoder != "opus" || !plan.ExperimentalEncoder {
		t.Errorf("audio = %q experimental=%v, want opus/true", plan.AudioEncoder, plan.ExperimentalEncoder)
	}
	if !adjacentArgs(plan.Args, "-strict", "-2") {
		t.Errorf("missing -strict -2 in %v", plan.Args)
	}
	if !containsValue(plan.Args, "-vn") {
		t.Errorf("dropped video should still emit -vn: %v", plan.Args)
	}
	dropped := false
	for _, n := range plan.Notes {
		if len(n) > 5 && n[:5] == "video" {
			dropped = true
		}
	}
	if !dropped {
		t.Errorf("plan notes lost the drop reason: %v", plan.Notes)
	}
}

// An extension the taxonomy does not know still has to be reported as inferred.
func TestInferredContainerNoteSurvives(t *testing.T) {
	r := capResolver(externalCaps())
	plan, err := r.BuildPlan(&Request{
		Input: "in.mp4", Output: "out.weirdcontainer", TargetContainer: "",
		VideoCodec: "vp9", NoAudio: true,
	}, nil)
	if err != nil {
		t.Fatalf("an unknown muxer is ffmpeg's problem, not ours: %v", err)
	}
	if plan.Muxer != "weirdcontainer" {
		t.Errorf("muxer = %q", plan.Muxer)
	}
	found := false
	for _, n := range plan.Notes {
		if n == "target container inferred from extension .weirdcontainer" {
			found = true
		}
	}
	if !found {
		t.Errorf("inference note was dropped: %v", plan.Notes)
	}
}

func TestDiscoverCapsReadsTheExperimentalFlag(t *testing.T) {
	out := []byte("Encoders:\n" +
		" V..... = Video\n" +
		" A..... = Audio\n" +
		" ...X.. = Codec is experimental\n" +
		" -------\n" +
		" V..... libvpx-vp9           libvpx VP9\n" +
		" A..X.. opus                 Opus\n" +
		" A..... aac                  AAC (Advanced Audio Coding)\n")
	caps := &Caps{Encoders: map[string]bool{}, Experimental: map[string]bool{}}
	parseEncoderLines(string(out), caps)

	if !caps.Encoders["libvpx-vp9"] || !caps.Encoders["opus"] || !caps.Encoders["aac"] {
		t.Fatalf("encoder index = %v", caps.Encoders)
	}
	if !caps.Experimental["opus"] {
		t.Error("opus should be flagged experimental")
	}
	if caps.Experimental["libvpx-vp9"] || caps.Experimental["aac"] {
		t.Error("a non-experimental encoder was flagged")
	}
	if caps.Encoders["="] {
		t.Error("the legend block leaked into the encoder index")
	}
	if ok, exp := caps.UsableEncoder("opus"); !ok || !exp {
		t.Errorf("UsableEncoder(opus) = %v/%v", ok, exp)
	}
	if ok, exp := caps.UsableEncoder("nope"); ok || exp {
		t.Errorf("UsableEncoder(nope) = %v/%v, want false/false", ok, exp)
	}
}

// The native Vorbis encoder refuses a mono track when it opens, which is only
// reachable on a build without libvorbis -- and the emulator proved it.
func TestNativeVorbisWidensMonoToStereo(t *testing.T) {
	r := &Resolver{Reg: registry.New(), Caps: &Caps{
		Encoders:     map[string]bool{"vorbis": true},
		Experimental: map[string]bool{"vorbis": true},
	}}
	info := &MediaInfo{AudioCodec: "vorbis", Channels: 1}
	plan, err := r.BuildPlan(&Request{
		Input: "in.m4a", Output: "out.ogg", TargetContainer: "oga",
		AudioCodec: "vorbis", NoVideo: true,
	}, info)
	if err != nil {
		t.Fatal(err)
	}
	if !adjacentArgs(plan.Args, "-ac", "2") {
		t.Errorf("mono vorbis should be widened, got %v", plan.Args)
	}
	if !adjacentArgs(plan.Args, "-strict", "-2") {
		t.Errorf("missing -strict -2 in %v", plan.Args)
	}

	// Stereo must pass through untouched, and an explicit request wins.
	stereo := &MediaInfo{AudioCodec: "vorbis", Channels: 2}
	p2, err := r.BuildPlan(&Request{Input: "in.m4a", Output: "out.ogg",
		TargetContainer: "oga", AudioCodec: "vorbis", NoVideo: true}, stereo)
	if err != nil {
		t.Fatal(err)
	}
	if containsValue(p2.Args, "-ac") {
		t.Errorf("stereo should not be rewritten: %v", p2.Args)
	}
}

// Naming only a container must land on the codec the UI promises. WebM used to
// resolve to VP8 because the registry lists legal codecs first and the default is
// simply the first entry -- and on the device VP8 was both slower and broken.
func TestWebMDefaultsToVP9AndOpus(t *testing.T) {
	reg := registry.New()
	if got := reg.DefaultVideoCodec("webm"); got != "vp9" {
		t.Errorf("default webm video = %q, want vp9", got)
	}
	if got := reg.DefaultAudioCodec("webm"); got != "opus" {
		t.Errorf("default webm audio = %q, want opus", got)
	}

	plan, err := capResolver(externalCaps()).BuildPlan(&Request{
		Input: "in.mp4", Output: "out.webm",
	}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if plan.VideoEncoder != "libvpx-vp9" {
		t.Errorf("video encoder = %q, want libvpx-vp9", plan.VideoEncoder)
	}
	if plan.AudioEncoder != "libopus" {
		t.Errorf("audio encoder = %q, want libopus", plan.AudioEncoder)
	}
	if !reg.LegalVideoCodec("webm", "vp8") {
		t.Error("VP8 must stay legal for webm, it is only no longer the default")
	}
}

// Both were measured on the emulator: VP8 with FFmpeg's default lookahead
// produces a 0-byte file and "g_lag_in_frames out of range", and VP8 with alpha
// refuses to open unless alternate reference frames are off.
func TestVP8GetsLagAndAlphaFlags(t *testing.T) {
	r := &Resolver{Reg: registry.New(), Caps: &Caps{
		Encoders: map[string]bool{"libvpx": true, "libvpx-vp9": true},
	}}
	plan, err := r.BuildPlan(&Request{
		Input: "in.mp4", Output: "out.webm", VideoCodec: "vp8", NoAudio: true,
	}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if plan.VideoEncoder != "libvpx" {
		t.Fatalf("encoder = %q, want libvpx", plan.VideoEncoder)
	}
	if !adjacentArgs(plan.Args, "-lag-in-frames", "0") {
		t.Errorf("VP8 needs its lookahead pinned: %v", plan.Args)
	}
	if !adjacentArgs(plan.Args, "-pix_fmt", "yuva420p") {
		t.Errorf("VP8 in webm should keep an alpha plane: %v", plan.Args)
	}
	if !adjacentArgs(plan.Args, "-auto-alt-ref", "0") {
		t.Errorf("alpha + alt-ref cannot coexist: %v", plan.Args)
	}

	// VP9 accepts the default lookahead, so it must not be pinned.
	vp9, err := r.BuildPlan(&Request{
		Input: "in.mp4", Output: "out.webm", VideoCodec: "vp9", NoAudio: true,
	}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if containsValue(vp9.Args, "-lag-in-frames") {
		t.Errorf("VP9 should keep FFmpeg's default lookahead: %v", vp9.Args)
	}
	if !adjacentArgs(vp9.Args, "-auto-alt-ref", "0") {
		t.Errorf("VP9 alpha still needs alt-ref off: %v", vp9.Args)
	}
}

// A video source into an animation-capable image container used to keep every
// frame: a 2-second clip became a 50-frame WebP that ffprobe reports as
// "image data not found" and that blew through the 100 KB WhatsApp cap.
func TestImageOutputsCollapseToOneFrame(t *testing.T) {
	r := &Resolver{Reg: registry.New(), Caps: &Caps{
		Encoders: map[string]bool{"libwebp": true, "libwebp_anim": true, "libvpx-vp9": true},
	}}

	still, err := r.BuildPlan(&Request{
		Input: "in.mp4", Output: "s.webp", VideoCodec: "webp", NoAudio: true,
	}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if !adjacentArgs(still.Args, "-frames:v", "1") {
		t.Errorf("no animation requested, so one frame expected: %v", still.Args)
	}

	animated, err := r.BuildPlan(&Request{
		Input: "in.mp4", Output: "s.webp", VideoCodec: "webp", NoAudio: true, FPS: 30,
	}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if containsValue(animated.Args, "-frames:v") {
		t.Errorf("an explicit frame rate asks for animation: %v", animated.Args)
	}

	// A source that is already an animated image keeps its frames even without an
	// explicit frame rate: converting animated WebP to animated WebP must not
	// flatten it.
	src := &MediaInfo{VideoCodec: "webp", IsAnimatedImage: true}
	kept, err := r.BuildPlan(&Request{
		Input: "in.webp", Output: "s.webp", VideoCodec: "webp", NoAudio: true,
	}, src)
	if err != nil {
		t.Fatal(err)
	}
	if containsValue(kept.Args, "-frames:v") {
		t.Errorf("an animated source should stay animated: %v", kept.Args)
	}

	// GIF is the counter-case: a video-to-GIF request means an animation even
	// with no frame rate given, so collapsing it would be wrong.
	r2 := &Resolver{Reg: registry.New(), Caps: &Caps{
		Encoders: map[string]bool{"gif": true},
	}}
	gif, err := r2.BuildPlan(&Request{
		Input: "in.mp4", Output: "c.gif", VideoCodec: "gif", NoAudio: true,
	}, nil)
	if err != nil {
		t.Fatal(err)
	}
	if containsValue(gif.Args, "-frames:v") {
		t.Errorf("a video converted to GIF must keep animating: %v", gif.Args)
	}
}

func TestQuickTimeDefaultsToH264(t *testing.T) {
	reg := registry.New()
	if got := reg.DefaultVideoCodec("mov"); got != "h264" {
		t.Errorf("default mov video = %q, want h264", got)
	}
	if !reg.LegalVideoCodec("mov", "prores") {
		t.Error("ProRes must stay selectable for QuickTime")
	}
}

func adjacentArgs(args []string, a, b string) bool {
	for i := 0; i+1 < len(args); i++ {
		if args[i] == a && args[i+1] == b {
			return true
		}
	}
	return false
}

func containsValue(args []string, want string) bool {
	for _, a := range args {
		if a == want {
			return true
		}
	}
	return false
}
