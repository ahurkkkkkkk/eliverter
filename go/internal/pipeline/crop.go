package pipeline

import (
	"context"
	"fmt"
	"io"

	"github.com/TenOFSwordsr/eliverter/internal/accel"
)

// AlphaCropHint decodes one frame and returns a crop filter that strips the
// redundant transparent padding around the artwork, so the sticker's subject
// fills the allowed canvas instead of shrinking inside an opaque border.
//
// Returns "" when the frame is fully transparent, has no padding to remove, or
// the input is a video (where a single frame would not represent the clip).
func (e *Engine) AlphaCropHint(ctx context.Context, input string, isVideo bool) (string, error) {
	if isVideo {
		return "", nil
	}
	info, err := e.Bin.Probe(ctx, input)
	if err != nil {
		return "", err
	}
	if info.Width <= 0 || info.Height <= 0 {
		return "", nil
	}

	rc, wait, err := e.Bin.RunRaw(ctx, []string{
		"-i", input, "-frames:v", "1", "-vf", "format=rgba", "-f", "rawvideo", "-",
	})
	if err != nil {
		return "", err
	}
	raw, rerr := io.ReadAll(rc)
	rc.Close()
	if werr := wait(); werr != nil {
		return "", werr
	}
	if rerr != nil {
		return "", rerr
	}

	want := info.Width * info.Height * 4
	if len(raw) < want {
		return "", nil
	}
	box, ok := accel.AlphaBounds(raw[:want], info.Width, info.Height, info.Width*4, 0)
	if !ok {
		return "", nil
	}
	// Cropping a frame that already fills itself only risks a bad geometry.
	if box.Dx() >= info.Width && box.Dy() >= info.Height {
		return "", nil
	}
	// Odd crops break subsampled downstream filters; keep the box even.
	w := evenAtLeast(box.Dx(), 2)
	h := evenAtLeast(box.Dy(), 2)
	if w >= info.Width && h >= info.Height {
		return "", nil
	}
	return fmt.Sprintf("crop=%d:%d:%d:%d", w, h, evenDown(box.Min.X), evenDown(box.Min.Y)), nil
}

func evenDown(v int) int {
	if v < 0 {
		return 0
	}
	return v &^ 1
}

func evenAtLeast(v, min int) int {
	if v < min {
		return min
	}
	return v &^ 1
}
