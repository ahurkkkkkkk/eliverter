/* Eliverter compute layer: vectorised alpha bounds, waveform peaks and DCT pHash.
 *
 * The desktop build can additionally use the Mojo module in ../mojo; this C file
 * is the portable implementation that also cross-compiles for Android arm64,
 * which Mojo does not target.
 */
#ifndef ELI_ACCEL_H
#define ELI_ACCEL_H

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
    int x;
    int y;
    int w;
    int h;
} eli_rect;

/* Which SIMD path was compiled in: "neon", "sse2" or "scalar". */
const char *eli_backend(void);

/* Tight bounding box of pixels whose alpha exceeds alpha_threshold.
 * rgba is width x height, 4 bytes per pixel; stride is bytes per row.
 * Returns {0,0,0,0} when the image is fully transparent. */
eli_rect eli_alpha_bounds(const uint8_t *rgba, int width, int height, int stride,
                          uint8_t alpha_threshold);

/* Downsample interleaved int16 PCM into `buckets` visual peaks in 0..1.
 * peaks and rms must each hold `buckets` floats. Returns 0 on success. */
int eli_waveform_peaks(const int16_t *pcm, int64_t frames, int channels,
                       int buckets, float *peaks, float *rms);

/* 64-bit perceptual hash of an 8x8-low-frequency DCT of the supplied grey frame.
 * gray is width x height, one byte per pixel. */
uint64_t eli_phash64(const uint8_t *gray, int width, int height, int stride);

/* Population count of differing bits between two hashes. */
int eli_hamming64(uint64_t a, uint64_t b);

#ifdef __cplusplus
}
#endif

#endif /* ELI_ACCEL_H */
