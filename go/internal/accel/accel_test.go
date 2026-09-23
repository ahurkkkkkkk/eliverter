package accel

import (
	"bytes"
	"image"
	"testing"
)

// rgba builds a width x height buffer that is fully transparent except for the
// rectangle at (x, y, w, h), which is opaque.
func rgba(width, height, x, y, w, h int) []byte {
	buf := make([]byte, width*height*4)
	for row := y; row < y+h; row++ {
		for col := x; col < x+w; col++ {
			off := (row*width + col) * 4
			buf[off+0], buf[off+1], buf[off+2], buf[off+3] = 255, 80, 160, 255
		}
	}
	return buf
}

func TestBackendIsNamed(t *testing.T) {
	switch Backend() {
	case "neon", "sse2", "scalar":
	default:
		t.Fatalf("unexpected backend %q", Backend())
	}
}

func TestAlphaBoundsFindsDrawnBlock(t *testing.T) {
	const W, H = 32, 24
	box, ok := AlphaBounds(rgba(W, H, 5, 6, 9, 7), W, H, W*4, 0)
	if !ok {
		t.Fatal("reported fully transparent")
	}
	want := image.Rect(5, 6, 5+9, 6+7)
	if box != want {
		t.Errorf("bounds = %v, want %v", box, want)
	}
}

// The vectorised reject must agree with a brute-force scan, or the SIMD path is
// quietly cropping artwork.
func TestAlphaBoundsMatchesBruteForce(t *testing.T) {
	const W, H = 40, 17
	buf := rgba(W, H, 3, 2, 20, 11)
	// Sprinkle isolated semi-visible pixels at awkward offsets.
	for _, p := range [][2]int{{0, 0}, {W - 1, 0}, {0, H - 1}, {W - 1, H - 1}, {37, 5}} {
		off := (p[1]*W + p[0]) * 4
		buf[off+3] = 40
	}
	box, ok := AlphaBounds(buf, W, H, W*4, 0)
	if !ok {
		t.Fatal("reported fully transparent")
	}
	want := image.Rect(0, 0, W, H)
	if box != want {
		t.Errorf("bounds = %v, want %v (corner pixels were missed)", box, want)
	}
}

func TestAlphaBoundsEmptyImage(t *testing.T) {
	const W, H = 16, 16
	if _, ok := AlphaBounds(make([]byte, W*H*4), W, H, W*4, 0); ok {
		t.Error("a fully transparent image reported a bounding box")
	}
	if _, ok := AlphaBounds(nil, 0, 0, 0, 0); ok {
		t.Error("nil input reported a bounding box")
	}
}

func TestAlphaThresholdIsHonoured(t *testing.T) {
	const W, H = 16, 16
	buf := rgba(W, H, 2, 2, 4, 4)
	for i := range buf {
		if i%4 == 3 && buf[i] != 0 {
			buf[i] = 10 // dim the block below a threshold of 20
		}
	}
	if _, ok := AlphaBounds(buf, W, H, W*4, 20); ok {
		t.Error("pixels at alpha 10 survived a threshold of 20")
	}
	if _, ok := AlphaBounds(buf, W, H, W*4, 5); !ok {
		t.Error("pixels at alpha 10 were dropped by a threshold of 5")
	}
}

func TestWaveformPeaksOfTone(t *testing.T) {
	const frames = 4096
	pcm := make([]int16, frames)
	for i := range pcm {
		v := int16(12000)
		if i%2 == 0 {
			v = -v
		}
		pcm[i] = v
	}
	peaks, rms, err := Waveform(pcm, frames, 1, 64)
	if err != nil {
		t.Fatal(err)
	}
	if len(peaks) != 64 || len(rms) != 64 {
		t.Fatalf("bucket count mismatch: %d/%d", len(peaks), len(rms))
	}
	for i, p := range peaks {
		if p <= 0 || p > 1 {
			t.Fatalf("peak[%d] = %v, want 0 < p <= 1", i, p)
		}
	}
}

func TestWaveformRejectsBadInput(t *testing.T) {
	if _, _, err := Waveform(nil, 0, 0, 10); err != ErrEmptyInput {
		t.Errorf("err = %v, want ErrEmptyInput", err)
	}
	if _, _, err := Waveform(make([]int16, 8), 4, 1, 100); err != ErrEmptyInput {
		t.Errorf("more buckets than frames should fail, got %v", err)
	}
}

func TestPHashStabilityAndDistance(t *testing.T) {
	const W, H = 64, 64
	frame := make([]byte, W*H)
	for i := range frame {
		frame[i] = byte((i * 7) % 256)
	}
	a := PHash64(frame, W, H, W)
	b := PHash64(frame, W, H, W)
	if a != b {
		t.Error("identical frames hashed differently")
	}
	if Hamming64(a, b) != 0 {
		t.Error("distance to self is not zero")
	}
	if Hamming64(0, 0xFF) != 8 {
		t.Error("hamming miscounted")
	}

	modified := bytes.Clone(frame)
	for i := range modified {
		modified[i] = byte(255 - int(modified[i]))
	}
	if Hamming64(a, PHash64(modified, W, H, W)) == 0 {
		t.Error("an inverted frame hashed identically")
	}
}
