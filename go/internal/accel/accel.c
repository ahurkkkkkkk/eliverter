/* Portable SIMD kernels for Eliverter. See accel.h for the contract. */
#include "accel.h"

#include <math.h>
#include <stdlib.h>
#include <string.h>

#if defined(__SSE2__)
#include <emmintrin.h>
#define ELI_SSE2 1
#endif
#if defined(__ARM_NEON) || defined(__ARM_NEON__)
#include <arm_neon.h>
#define ELI_NEON 1
#endif

const char *eli_backend(void)
{
#if defined(ELI_NEON)
    return "neon";
#elif defined(ELI_SSE2)
    return "sse2";
#else
    return "scalar";
#endif
}

/* ------------------------------------------------------------------------- */
/* Alpha bounding box                                                        */
/* ------------------------------------------------------------------------- */

/* True when any pixel in [0,width) of this row has alpha above threshold. */
static int row_has_visible(const uint8_t *row, int width, uint8_t threshold)
{
    const int stride4 = width * 4;
    int i = 0;

#if defined(ELI_NEON)
    /* vld4q_u8 deinterleaves 16 RGBA pixels; plane 3 is the alpha bytes.
       Named "lower" because `floor` is a math.h function on glibc. */
    const uint8x16_t lower = vdupq_n_u8(threshold);
    for (; i + 64 <= stride4; i += 64) {
        uint8x16x4_t px = vld4q_u8(row + i);
        if (vmaxvq_u8(vcgtq_u8(px.val[3], lower)) != 0) {
            return 1;
        }
    }
#elif defined(ELI_SSE2)
    /*
     * Alpha sits at byte 3 of each pixel, i.e. an odd byte offset inside every
     * 16-bit word. srli_epi16 moves each word's high byte down, so the odd
     * source bytes land in result lanes 0,2,4,...  Mask 0x4444 selects exactly
     * the four alpha lanes per 16-byte group.
     *
     * XOR 0x80 biases the unsigned compare into the signed _mm_cmpgt_epi8.
     */
    const __m128i flip = _mm_set1_epi8((char)0x80);
    const __m128i key = _mm_set1_epi8((char)(threshold ^ 0x80));
    for (; i + 16 <= stride4; i += 16) {
        __m128i v = _mm_loadu_si128((const __m128i *)(row + i));
        __m128i t = _mm_xor_si128(_mm_srli_epi16(v, 8), flip);
        if (_mm_movemask_epi8(_mm_cmpgt_epi8(t, key)) & 0x4444) {
            return 1;
        }
    }
#endif

    for (; i < stride4; i += 4) {
        if (row[i + 3] > threshold) {
            return 1;
        }
    }
    return 0;
}

static int first_visible_col(const uint8_t *row, int width, uint8_t threshold)
{
    for (int x = 0; x < width; x++) {
        if (row[x * 4 + 3] > threshold) {
            return x;
        }
    }
    return width - 1;
}

static int last_visible_col(const uint8_t *row, int width, uint8_t threshold)
{
    for (int x = width - 1; x >= 0; x--) {
        if (row[x * 4 + 3] > threshold) {
            return x;
        }
    }
    return 0;
}

eli_rect eli_alpha_bounds(const uint8_t *rgba, int width, int height, int stride,
                          uint8_t alpha_threshold)
{
    eli_rect out = {0, 0, 0, 0};
    if (!rgba || width <= 0 || height <= 0 || stride < width * 4) {
        return out;
    }

    int top = -1, bottom = -1, left = width, right = -1;
    for (int y = 0; y < height; y++) {
        const uint8_t *row = rgba + (size_t)y * (size_t)stride;
        /* Whole-row SIMD reject is the win here: sticker padding is transparent
         * for long stretches, so we only pay the scalar edge scan on real rows. */
        if (!row_has_visible(row, width, alpha_threshold)) {
            continue;
        }
        if (top < 0) {
            top = y;
        }
        bottom = y;
        int f = first_visible_col(row, width, alpha_threshold);
        int l = last_visible_col(row, width, alpha_threshold);
        if (f < left) {
            left = f;
        }
        if (l > right) {
            right = l;
        }
    }

    if (top < 0 || right < left) {
        return out;
    }
    out.x = left;
    out.y = top;
    out.w = right - left + 1;
    out.h = bottom - top + 1;
    return out;
}

/* ------------------------------------------------------------------------- */
/* Waveform                                                                  */
/* ------------------------------------------------------------------------- */

static int16_t abs16(int16_t v) { return v < 0 ? (int16_t)-v : v; }

int eli_waveform_peaks(const int16_t *pcm, int64_t frames, int channels,
                       int buckets, float *peaks, float *rms)
{
    if (!pcm || frames <= 0 || channels <= 0 || buckets <= 0 || !peaks || !rms) {
        return -1;
    }
    if (channels > 8) {
        channels = 8;
    }

    const int64_t per = frames / buckets;
    if (per <= 0) {
        return -2;
    }

    for (int b = 0; b < buckets; b++) {
        int64_t start = (int64_t)b * per;
        int64_t end = (b == buckets - 1) ? frames : start + per;
        int64_t n = end - start;

        int32_t peak = 0;
        double acc = 0.0;

        for (int64_t f = start; f < end; f++) {
            const int16_t *sample = pcm + f * channels;
            /* Mix to mono before measuring so a stereo track does not double count. */
            int32_t mixed = 0;
            for (int c = 0; c < channels; c++) {
                mixed += sample[c];
            }
            mixed /= channels;
            int32_t a = mixed < 0 ? -mixed : mixed;
            if (a > peak) {
                peak = a;
            }
            acc += (double)mixed * (double)mixed;
        }

        peaks[b] = (float)peak / 32768.0f;
        double mean = acc / (double)(n * channels > 0 ? n : 1);
        rms[b] = (float)(sqrt(mean) / 32768.0);
    }
    (void)abs16;
    return 0;
}

/* ------------------------------------------------------------------------- */
/* Perceptual hash                                                           */
/* ------------------------------------------------------------------------- */

#define ELI_PHASH_WORK 32

/* Box-filter the grey frame down to an 8-bit 32x32 luminance grid. */
static void downsample32(const uint8_t *gray, int width, int height, int stride,
                         float *out)
{
    for (int oy = 0; oy < ELI_PHASH_WORK; oy++) {
        int y0 = (int)((int64_t)oy * height / ELI_PHASH_WORK);
        int y1 = (int)((int64_t)(oy + 1) * height / ELI_PHASH_WORK);
        if (y1 <= y0) {
            y1 = y0 + 1;
        }
        for (int ox = 0; ox < ELI_PHASH_WORK; ox++) {
            int x0 = (int)((int64_t)ox * width / ELI_PHASH_WORK);
            int x1 = (int)((int64_t)(ox + 1) * width / ELI_PHASH_WORK);
            if (x1 <= x0) {
                x1 = x0 + 1;
            }
            uint32_t sum = 0;
            int32_t cnt = 0;
            for (int y = y0; y < y1; y++) {
                const uint8_t *row = gray + (size_t)y * (size_t)stride;
                for (int x = x0; x < x1; x++) {
                    sum += row[x];
                    cnt++;
                }
            }
            out[oy * ELI_PHASH_WORK + ox] = (float)sum / (float)cnt;
        }
    }
}

/* Separable 32x32 DCT-II with precomputed cosines. */
static void dct32(const float *in, float *out)
{
    static float cos_table[ELI_PHASH_WORK][ELI_PHASH_WORK];
    static int ready = 0;
    if (!ready) {
        for (int k = 0; k < ELI_PHASH_WORK; k++) {
            for (int n = 0; n < ELI_PHASH_WORK; n++) {
                cos_table[k][n] = cosf((float)((2 * n + 1) * k * M_PI) / 64.0f);
            }
        }
        ready = 1;
    }

    float tmp[ELI_PHASH_WORK * ELI_PHASH_WORK];
    const float scale0 = 0.35355339059327373f; /* 1/sqrt(32) */
    const float scaleN = 0.5f;                 /* sqrt(2/32) */

    for (int y = 0; y < ELI_PHASH_WORK; y++) {
        const float *row = in + y * ELI_PHASH_WORK;
        for (int k = 0; k < ELI_PHASH_WORK; k++) {
            float acc = 0.0f;
            const float *c = cos_table[k];
            for (int n = 0; n < ELI_PHASH_WORK; n++) {
                acc += row[n] * c[n];
            }
            tmp[y * ELI_PHASH_WORK + k] = acc * (k == 0 ? scale0 : scaleN);
        }
    }
    for (int x = 0; x < ELI_PHASH_WORK; x++) {
        for (int k = 0; k < ELI_PHASH_WORK; k++) {
            float acc = 0.0f;
            const float *c = cos_table[k];
            for (int n = 0; n < ELI_PHASH_WORK; n++) {
                acc += tmp[n * ELI_PHASH_WORK + x] * c[n];
            }
            out[k * ELI_PHASH_WORK + x] = acc * (k == 0 ? scale0 : scaleN);
        }
    }
}

static int cmp_float(const void *a, const void *b)
{
    float fa = *(const float *)a, fb = *(const float *)b;
    return (fa > fb) - (fa < fb);
}

uint64_t eli_phash64(const uint8_t *gray, int width, int height, int stride)
{
    if (!gray || width < 8 || height < 8 || stride < width) {
        return 0;
    }

    float pix[ELI_PHASH_WORK * ELI_PHASH_WORK];
    float dct[ELI_PHASH_WORK * ELI_PHASH_WORK];
    downsample32(gray, width, height, stride, pix);
    dct32(pix, dct);

    /* Low 8x8 block minus DC carries the structural signal. */
    float low[64];
    int idx = 0;
    for (int y = 0; y < 8; y++) {
        for (int x = 0; x < 8; x++) {
            if (y == 0 && x == 0) {
                continue;
            }
            low[idx++] = dct[y * ELI_PHASH_WORK + x];
        }
    }

    float sorted[63];
    memcpy(sorted, low, sizeof(sorted));
    qsort(sorted, 63, sizeof(float), cmp_float);
    float median = sorted[31];

    uint64_t hash = 0;
    int bit = 0;
    for (int y = 0; y < 8; y++) {
        for (int x = 0; x < 8; x++) {
            if (y == 0 && x == 0) {
                hash |= 1ULL << bit++;
                continue;
            }
            if (dct[y * ELI_PHASH_WORK + x] > median) {
                hash |= 1ULL << bit;
            }
            bit++;
        }
    }
    return hash;
}

int eli_hamming64(uint64_t a, uint64_t b)
{
    uint64_t x = a ^ b;
    int count = 0;
    while (x) {
        x &= x - 1;
        count++;
    }
    return count;
}
