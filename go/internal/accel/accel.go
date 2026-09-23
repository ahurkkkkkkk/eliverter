// Package accel exposes the vectorised media analysis kernels to Go.
//
// It is deliberately pure-C rather than Mojo: the same source has to build for
// linux/amd64 on the desktop and android/arm64, and Mojo has no Android target.
package accel

/*
#cgo CFLAGS: -O3 -std=c11 -D_GNU_SOURCE
#cgo LDFLAGS: -lm
#include "accel.h"
*/
import "C"

import (
	"image"
	"unsafe"
)

// Backend reports which instruction set the kernels were compiled for.
func Backend() string { return C.GoString(C.eli_backend()) }

// AlphaBounds returns the tight bounding box of visible pixels in an RGBA
// buffer, so transparent padding can be cropped before sticker scaling.
func AlphaBounds(rgba []byte, width, height, stride int, threshold uint8) (image.Rectangle, bool) {
	if len(rgba) == 0 || width <= 0 || height <= 0 {
		return image.Rectangle{}, false
	}
	r := C.eli_alpha_bounds(
		(*C.uint8_t)(unsafe.Pointer(&rgba[0])),
		C.int(width), C.int(height), C.int(stride), C.uint8_t(threshold))
	if r.w <= 0 || r.h <= 0 {
		return image.Rectangle{}, false
	}
	return image.Rect(int(r.x), int(r.y), int(r.x+r.w), int(r.y+r.h)), true
}

// Waveform reduces interleaved int16 PCM into bucket peak and RMS levels in 0..1.
func Waveform(pcm []int16, frames int64, channels, buckets int) (peaks, rms []float32, err error) {
	if len(pcm) == 0 || frames <= 0 || channels <= 0 || buckets <= 0 {
		return nil, nil, ErrEmptyInput
	}
	peaks = make([]float32, buckets)
	rms = make([]float32, buckets)
	rc := C.eli_waveform_peaks(
		(*C.int16_t)(unsafe.Pointer(&pcm[0])),
		C.int64_t(frames), C.int(channels), C.int(buckets),
		(*C.float)(unsafe.Pointer(&peaks[0])), (*C.float)(unsafe.Pointer(&rms[0])))
	if rc != 0 {
		return nil, nil, ErrEmptyInput
	}
	return peaks, rms, nil
}

// PHash64 computes a perceptual hash over a single-byte-per-pixel grey frame.
func PHash64(gray []byte, width, height, stride int) uint64 {
	if len(gray) == 0 {
		return 0
	}
	return uint64(C.eli_phash64((*C.uint8_t)(unsafe.Pointer(&gray[0])),
		C.int(width), C.int(height), C.int(stride)))
}

// Hamming64 counts differing hash bits; 0 means visually identical frames.
func Hamming64(a, b uint64) int {
	return int(C.eli_hamming64(C.uint64_t(a), C.uint64_t(b)))
}
