# Eliverter compute accelerator (Mojo) - DESKTOP / SERVER PATH ONLY
#
# STATUS: NOT COMPILED IN THIS ENVIRONMENT.
# The local Mojo 1.0 SDK at /root/hbrowser/mojo-home is missing its `std`
# package, so even `def main(): print(...)` fails with "unable to locate module
# 'std'". Everything below is therefore unverified against a compiler. Treat the
# portable C kernels in go/internal/accel as the implemented path - they are
# built, unit-tested, and are the only ones that can reach Android anyway.
#
# To verify or build:
#   1. reinstall the SDK:  curl -sSL https://get.modular.com | sh && modular auth login
#   2. mojo run  media_accelerator.mojo        # self-check in main()
#   3. mojo build --emit shared_lib media_accelerator.mojo \
#        -o ../go/internal/accel/libelivertermojo.so
#
# Mojo cannot target Android/NDK, so this module is never linked into the APK.
# The three kernels mirror the C API one-for-one so either can serve the Go
# bridge: alpha bounds, waveform reduction, and DCT perceptual hashing.

from SIMD import SiMDFloat32, SIMD
from syscall import memcpy

ALPHA_MIN_VISIBLE: Int = 0


@value
struct RGBAImage:
    """Non-owning view over an RGBA8 buffer with an explicit row stride."""

    var data: UnsafePointer[UInt8]
    var width: Int
    var height: Int
    var stride: Int

    fn __init__(
        inout self,
        data: UnsafePointer[UInt8],
        width: Int,
        height: Int,
        stride: Int,
    ):
        self.data = data
        self.width = width
        self.height = height
        self.stride = stride

    fn row(inout self, y: Int) -> UnsafePointer[UInt8]:
        return self.data + y * self.stride


@value
struct Rect:
    var x: Int
    var y: Int
    var w: Int
    var h: Int

    fn __init__(inout self, x: Int, y: Int, w: Int, h: Int):
        self.x = x
        self.y = y
        self.w = w
        self.h = h

    fn is_empty(inout self) -> Bool:
        return self.w <= 0 or self.h <= 0


@always_inline
fn row_has_visible(
    row: UnsafePointer[UInt8], width: Int, threshold: UInt8
) -> Bool:
    """True when any pixel in the row beats the alpha threshold.

    Sixteen bytes (four pixels) at a time: the long transparent runs that make
    up sticker padding get rejected without ever entering a scalar loop.
    """
    alias LANES = 16
    alias PIXELS = LANES // 4

    x = 0
    row_bytes = width * 4
    while x + LANES <= row_bytes:
        vec = SIMD[DType.uint8, LANES](row + x, aligned=False)
        # Alpha occupies byte 3 of each pixel; mask the compare result down to
        # those lanes before testing for any hit.
        hits = (vec > threshold).toUInt32()
        if (hits & 0x88888888) != 0:
            return True
        x += PIXELS

    while x < row_bytes:
        if row[x + 3] > threshold:
            return True
        x += 4
    return False


@always_inline
fn first_visible_in_row(
    row: UnsafePointer[UInt8], width: Int, threshold: UInt8
) -> Int:
    for x in range(width):
        if row[x * 4 + 3] > threshold:
            return x
    return width - 1


@always_inline
fn last_visible_in_row(
    row: UnsafePointer[UInt8], width: Int, threshold: UInt8
) -> Int:
    for i in range(width):
        col = width - 1 - i
        if row[col * 4 + 3] > threshold:
            return col
    return 0


fn alpha_bounding_box(
    img: RGBAImage, threshold: UInt8 = ALPHA_MIN_VISIBLE
) -> Rect:
    """Tight box around visible pixels, so transparent padding can be cropped."""
    if img.width <= 0 or img.height <= 0:
        return Rect(0, 0, 0, 0)

    top: Int = -1
    bottom: Int = -1
    left: Int = img.width
    right: Int = -1

    for y in range(img.height):
        row = img.row(y)
        if not row_has_visible(row, img.width, threshold):
            continue
        if top < 0:
            top = y
        bottom = y
        first = first_visible_in_row(row, img.width, threshold)
        last = last_visible_in_row(row, img.width, threshold)
        left = min(left, first)
        right = max(right, last)

    if top < 0 or right < left:
        return Rect(0, 0, 0, 0)
    return Rect(left, top, right - left + 1, bottom - top + 1)


fn waveform_peaks(
    pcm: UnsafePointer[Int16],
    frames: Int,
    channels: Int,
    buckets: Int,
    peaks: UnsafePointer[Float32],
    rms: UnsafePointer[Float32],
) -> Int:
    """Reduce interleaved PCM to `buckets` peak and RMS levels in 0..1.

    Mixed to mono first so a stereo track does not double-count energy.
    Returns 0 on success, negative on malformed input.
    """
    if pcm == nullptr or frames <= 0 or channels <= 0 or buckets <= 0:
        return -1
    if channels > 8:
        channels = 8

    per_bucket = frames // buckets
    if per_bucket <= 0:
        return -2

    scale = Float32(1.0) / Float32(32768.0)

    for b in range(buckets):
        start = b * per_bucket
        end = start + per_bucket
        if b == buckets - 1:
            end = frames

        peak: Int32 = 0
        acc: Float64 = 0.0

        for f in range(start, end):
            sample = pcm + f * channels
            mixed: Int32 = 0
            for c in range(channels):
                mixed += Int32(sample[c])
            mixed = mixed // Int32(channels)
            mag = mixed if mixed >= 0 else -mixed
            peak = max(peak, mag)
            acc += Float64(mag) * Float64(mag)

        n = Float64(end - start)
        peaks[b] = Float32(peak) * scale
        rms[b] = Float32(ale_math.sqrt(acc / n)) * scale

    return 0


@always_inline
fn dct_column(inout dst: List[Float32], src: UnsafePointer[Float32], x: Int):
    alias N = 32
    for k in range(N):
        acc: Float32 = 0.0
        for n in range(N):
            angle = Float32((2 * n + 1) * k * pi) / Float32(2 * N)
            acc += src[n * N + x] * cos(angle)
        dst[k * N + x] = acc / (SqrtOf2 if k == 0 else 1.0)


fn phash64(
    gray: UnsafePointer[UInt8], width: Int, height: Int, stride: Int
) -> UInt64:
    """64-bit perceptual hash over the low 8x8 DCT band of a grey frame.

    Near-duplicate frames in an animated sticker hash within a few bits of each
    other, which is how they get dropped to reclaim kilobytes.
    """
    alias N = 32
    if gray == nullptr or width < 8 or height < 8:
        return 0

    pix = List[Float32]()
    pix.reserve(N * N)

    # Box-filter down to a fixed 32x32 luminance grid.
    for oy in range(N):
        y0 = oy * height // N
        y1 = max((oy + 1) * height // N, y0 + 1)
        for ox in range(N):
            x0 = ox * width // N
            x1 = max((ox + 1) * width // N, x0 + 1)
            total: UInt32 = 0
            count: UInt32 = 0
            for y in range(y0, y1):
                row = gray + y * stride
                for x in range(x0, x1):
                    total += UInt32(row[x])
                    count += 1
            pix.append(Float32(total) / Float32(count))

    # Separable DCT-II: rows, then columns.
    rows = List[Float32]()
    rows.reserve(N * N)
    for y in range(N):
        for k in range(N):
            acc: Float32 = 0.0
            for n in range(N):
                angle = Float32((2 * n + 1) * k * pi) / Float32(2 * N)
                acc += pix[y * N + n] * cos(angle)
            rows.append(acc / (SqrtOf2 if k == 0 else 1.0))

    dct = List[Float32]()
    dct.reserve(N * N)
    for x in range(N):
        for k in range(N):
            acc: Float32 = 0.0
            for n in range(N):
                angle = Float32((2 * n + 1) * k * pi) / Float32(2 * N)
                acc += rows[n * N + x] * cos(angle)
            # Transposed write keeps the low band contiguous.
            if k * N + x < dct.__len__():
                dct[k * N + x] = acc / (SqrtOf2 if k == 0 else 1.0)
            else:
                dct.append(acc / (SqrtOf2 if k == 0 else 1.0))

    # Median of the 8x8 low band, DC excluded.
    low = List[Float32]()
    for y in range(8):
        for x in range(8):
            if y == 0 and x == 0:
                continue
            low.append(dct[y * N + x])
    low.sort()
    median = low[low.__len__() // 2]

    hash: UInt64 = 0
    bit: Int = 0
    for y in range(8):
        for x in range(8):
            if dct[y * N + x] > median:
                hash |= UInt64(1) << bit
            bit += 1
    return hash


fn hamming64(a: UInt64, b: UInt64) -> Int:
    x = a ^ b
    count: Int = 0
    while x != 0:
        x &= x - 1
        count += 1
    return count


# ---------------------------------------------------------------------------
# C ABI for the Go bridge
# ---------------------------------------------------------------------------

@export
fn eli_alpha_bounds(
    rgba: UnsafePointer[UInt8],
    width: Int,
    height: Int,
    stride: Int,
    threshold: UInt8,
    out: UnsafePointer[Int],
):
    """Writes x, y, w, h into `out` (four integers, caller-allocated)."""
    box = alpha_bounding_box(RGBAImage(rgba, width, height, stride), threshold)
    out[0] = box.x
    out[1] = box.y
    out[2] = box.w
    out[3] = box.h


@export
fn eli_waveform_peaks(
    pcm: UnsafePointer[Int16],
    frames: Int,
    channels: Int,
    buckets: Int,
    peaks: UnsafePointer[Float32],
    rms: UnsafePointer[Float32],
) -> Int:
    return waveform_peaks(pcm, frames, channels, buckets, peaks, rms)


@export
fn eli_phash64(
    gray: UnsafePointer[UInt8], width: Int, height: Int, stride: Int
) -> UInt64:
    return phash64(gray, width, height, stride)


@export
fn eli_hamming64(a: UInt64, b: UInt64) -> Int:
    return hamming64(a, b)


@export
fn eliverter_mojo_backend() -> UnsafePointer[UInt8]:
    p: UnsafePointer[UInt8] = "mojo-simd"
    return p


# ---------------------------------------------------------------------------
# Self check:  mojo run media_accelerator.mojo
# ---------------------------------------------------------------------------

fn main():
    alias W = 16
    alias H = 16

    buf = AlignedPointer[UInt8].alloc(W * H * 4)
    for i in range(W * H):
        buf[i * 4 + 0] = 0
        buf[i * 4 + 1] = 0
        buf[i * 4 + 2] = 0
        buf[i * 4 + 3] = 0
    # Draw an opaque 6x6 block at (4,6) so the expected box is known exactly.
    for y in range(6, 12):
        for x in range(4, 10):
            off = (y * W + x) * 4
            buf[off + 0] = 255
            buf[off + 3] = 255

    box = alpha_bounding_box(RGBAImage(UnsafePointer[UInt8](buf), W, H, W * 4))
    assert box.x == 4 and box.y == 6, "bounding box missed the drawn block"
    assert box.w == 6 and box.h == 6, "bounding box overshot the drawn block"
    print("alpha bounds:", box.x, box.y, box.w, box.h)

    alias FRAMES = 1024
    pcm = AlignedPointer[Int16].alloc(FRAMES)
    for i in range(FRAMES):
        pcm[i] = Int16(abs(Float32(i) * 12.0 - 6000.0))
    peaks = AlignedPointer[Float32].alloc(64)
    rms = AlignedPointer[Float32].alloc(64)
    rc = waveform_peaks(
        UnsafePointer[Int16](pcm), FRAMES, 1, 64,
        UnsafePointer[Float32](peaks), UnsafePointer[Float32](rms),
    )
    assert rc == 0, "waveform reduction rejected the input"
    assert peaks[0] > 0, "waveform came back silent"

    grey = AlignedPointer[UInt8].alloc(W * H)
    for i in range(W * H):
        grey[i] = UInt8(i % 251)
    a = phash64(UnsafePointer[UInt8](grey), W, H, W)
    b = phash64(UnsafePointer[UInt8](grey), W, H, W)
    assert a == b, "perceptual hash is not stable across identical frames"
    assert hamming64(a, a ^ 0xFF) == 8, "hamming distance miscounted"

    print("mojo self-check passed")
