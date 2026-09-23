# Eliverter

Pastel neon media sanctuary and conversion playground. Go + Gin backend, embedded
SQLite, FFmpeg pipeline, SIMD analysis kernels, Svelte 5 frontend, packaged as a
**fully on-device Android app**: no server, no uploads.

Named **Eliverter** (the original brief spelled it "Ehliverter"). Made by
[ahura](https://ahura.site/resume), for my love eghlima, to make her life easier.
The same dedication is in the app's footer.

## Where files go

Tapping save on a finished job writes to **`Downloads/ELIVERSE`**, which the app
creates on first use. From Android 10 up that goes through the media provider
(`MediaStore.Downloads` with a `RELATIVE_PATH`), so it needs no permission and
the file shows up in any file manager, Samsung's My Files included. Only Android
7 to 9 ask anything, because on those releases the app writes the file itself and
needs `WRITE_EXTERNAL_STORAGE`; the manifest caps that permission at API 28 so
newer versions never see a prompt.

`DownloadManager` is deliberately not used. Its
`setDestinationInExternalPublicDir` is rejected once the app targets SDK 29 or
later, so the previous implementation appeared to work and silently saved nothing
on Samsung devices. Re-saving the same file never overwrites: the media provider
returns `savetest (1).webm`, `savetest (2).webm` and so on.

## Background erasure

Any conversion into an alpha-capable target (`webm`, `gif`, `webp`, `png`,
`apng`) can key the backdrop out:

```bash
curl -F file=@sprite.png -F target_format=webp -F erase_background=true $B/api/jobs
curl -F file=@clip.mp4 -F target_format=webm -F erase_background=true \
     -F erase_mode=color -F key_color=0x00FF00 -F despill=true $B/api/jobs
```

`erase_mode=auto` (the default) decodes one frame and votes on the dominant
colour in the border ring, then keys exactly that. Sampling matters: a "green
screen" is really `0x007F00` once it has been through YUV, and keying the nominal
`0x00FF00` with a tight tolerance removes nothing. If the ring does not agree on
one colour the request is rejected with 422 and a suggestion to name the colour
yourself, rather than returning a file with holes punched in the subject.

This is colour keying, not ML matting. The app is fully offline and ships no
inference runtime, so there is no segmentation model. A flat or single-colour
backdrop works, a cluttered photograph will not. Adding real matting means an
ONNX runtime plus model weights in the APK, which is a separate decision.

The ready sticker packs take the same fields on `/api/sticker-packs`, because a
sprite cut out of a clip is most of the point: the keying runs before the pack's
own scale and pad, and for a GIF pack it is woven into the palette graph rather
than left on a `-vf` chain the graph would replace.

In the UI the switch is "pop the background out". It only appears for targets
that can store transparency; pick `mp4` while it is on and the panel says so
plainly instead of queueing a job that would quietly return an opaque file.

## Sprites keep their pixels

A GIF or paletted still that already carries transparency is resampled with
`flags=neighbor` after clamping its alpha to fully transparent or fully opaque,
instead of the `lanczos` used for footage. Smooth filters average across the
silhouette, and because the pixels just inside a sprite's edge are near-white,
that average spreads a visible halo outward.

Measured on a 48x48 test sprite scaled into a 512x512 canvas and encoded at the
same CRF: the old chain left 107,758 semi-transparent pixels of which 63,876 were
translucent white; the new chain leaves 7,036 and 4,303, in half the bytes. A
GIF pack comes out with 0 semi-transparent pixels. Encoding the same clamped
frames losslessly gives 0 too, so what remains on the WebM path is VP9's lossy
alpha plane rather than the filter chain.

`IsPixelArt` keys off the probe (a `gif`/`apng` stream or a `pal8` format that
has alpha), so footage is untouched. Background erasure deliberately skips the
clamp: keying leaves a soft blended edge on purpose, and hardening it would undo
the blend the user just asked for.

## Build

Everything happens in WSL Ubuntu-24.04 at `/root/eliverter`.

```bash
# once per ABI, ~30 min each: cross-build the codec libraries + FFmpeg + FFprobe
bash scripts/ffmpeg-build.sh arm64-v8a
bash scripts/ffmpeg-build.sh x86_64

# every time: tests -> web bundle -> Go server for both ABIs -> signed APK
bash scripts/build.sh
bash scripts/build.sh --quick     # skip the Go suite
```

Output: `android/build/eliverter-debug.apk` (~81 MB, both ABIs; also copied to
`C:\Users\Administrator\Desktop\apps\`).

`ffmpeg-build.sh` builds x264, libvpx, lame, opus, ogg, vorbis, libwebp, dav1d
and aom before FFmpeg, and enables zlib from the NDK sysroot. Each library is
independent: one that fails costs one codec family and is reported at the end as
`DEGRADED`, it does not abort the build. Set `CLEAN=1` to discard an install
prefix that cannot be trusted.

Desktop/dev server:

```bash
cd go && go run ./cmd/eliverter -addr 127.0.0.1:8420
cd web && npm run dev            # Vite on :5173, proxies to :8420
cd web && npm run check          # svelte-check; needs web/svelte.config.js
```

Tests: `cd go && go test ./...`

## How the Android app works

The APK is a WebView over a Go process, not a watered-down on-device clone:

1. `libeliverter_srv.so` is the ordinary server binary, cross-compiled for
   `android/arm64` and `android/amd64`. It ships under a `lib*.so` name so
   Android extracts it into `nativeLibraryDir`, the only app-owned path still
   executable under Android 10+ W^X rules.
2. `MainActivity` execs it with `-addr 127.0.0.1:0` and reads the
   `ELIVERTER_URL` line to learn the port the kernel chose. A daemon thread keeps
   draining the child's stdout for its whole life: the Go runtime kills a
   process whose stdout pipe is closed, so a naive reader that stops early takes
   the server down with it.
3. The WebView loads that loopback URL. The Svelte bundle is embedded in the Go
   binary via `go:embed`, so there is nothing to fetch.
4. `libffmpeg_cli.so` / `libffprobe_cli.so` are the same trick applied to two
   FFmpeg binaries per ABI, located via `ELI_FFMPEG` / `ELI_FFPROBE` or the
   native library directory.

SQLite uses the cgo `mattn/go-sqlite3` driver: `modernc.org/sqlite` panics under
bionic. Packaging uses `aapt2 -> javac -> d8 -> zipalign -> apksigner` directly
rather than Gradle, so the whole path is one inspectable script.

## Layout

```
go/internal/registry   media taxonomy: 65 containers, 118 codecs, 24 pixel formats
go/internal/pipeline   probe, capability index, transcode, sticker packs, size limiter
go/internal/accel      portable SIMD kernels (SSE2 + NEON + scalar)
go/internal/store      embedded SQLite via cgo, WAL, foreign keys
go/internal/hub        WebSocket fan-out
go/internal/service    worker pool, cancellation, artifact pruning
go/internal/api        Gin routes + /ws/jobs
go/internal/webui      go:embed of the built frontend
mojo/                  desktop-only SIMD module (see status below)
web/                   Svelte 5 + Tailwind v4 + Lucide frontend
android/               WebView host, manifest, resources
scripts/               ffmpeg-build.sh, cross-go-all.sh, build-apk.sh, build.sh,
                       smoke.sh, e2e.sh
```

## Design system

`web/src/app.css` carries the tokens: marshmallow bases, seven neon accents, the
two specified card underglows, `cubic-bezier(0.34, 1.56, 0.64, 1)` as the single
spring curve, the idle bob / dragover squash / drop wobble keyframes, and the
candy-cane animated border for the dropzone. All motion is disabled under
`prefers-reduced-motion`.

Sound is generated at call time by `web/src/lib/audio.ts`: oscillator sweeps
only, zero audio files. Confetti, hearts and sparkles are drawn in
`web/src/lib/fx.ts`.

## Verified

On an Android 15 (API 35) x86_64 emulator, with the APK installed and running:

- App installs, launches, the Go server comes up on a kernel-chosen loopback
  port, and the WebView renders the full UI (screenshot-confirmed).
- `/api/health` reports **194 encoders, 514 decoders, 180 muxers** and SSE2
  kernels linked.
- Every format the UI offers converts on the phone and the downloaded artifact
  probes back as valid media with the expected codec and duration:
  mp4, webm, mkv, mov, gif, mp3, m4a, opus, flac, wav, png, webp, avif.
- All six ready packs render within their section 3 ceilings: Telegram static
  512x384 / 71 KB, Telegram animated 512x512 VP9+alpha / 145 KB, WhatsApp static
  512x512 / 4.6 KB, WhatsApp animated 512x512 (59 verified `ANMF` frames) /
  301 KB, Discord emote 128x128 GIF / 178 KB, Discord reaction 128x96 / 6.9 KB.
- Completion events reach the WebView over the WebSocket while it is open.
- Background erasure on the phone: a green-backdrop clip keyed to WebM, GIF and
  PNG decodes back with `corner_alpha=0, centre_alpha=255`: backdrop gone,
  subject intact. Asking for `mp4` is rejected with an explanation instead of
  quietly returning an opaque file.
- Background erasure driven from the WebView, not just the API: the panel sends
  `erase_background`/`erase_mode`/`key_color` with the upload, and the artifacts
  come back keyed. A GIF erase keeps the source canvas (320x240 in, 320x240 out,
  60000 transparent pixels against 16800 subject pixels) instead of being
  upscaled into the pack box.
- Format chooser on the phone: the bubble opens above the card that follows it
  (`.card` sets `backdrop-filter`, so every sibling card is its own stacking
  context and the later one used to swallow the menu), stops short of the
  floating status line, and flips upward when there is more room above than
  below.
- Erased ready packs: `discord_emote` renders a 128x128 GIF with a transparent
  corner and an opaque subject, and `telegram_animated` a 512x512 WebM with
  `alpha_mode` set, both under their size ceilings.
- `go test ./...` green, including end-to-end FFmpeg conversions, every pack's
  size ceiling, exact canvas, frame rate and alpha rules, and pixel-level
  assertions that the erased alpha is real rather than just requested.
- Saving on the phone: tapping the download control on a finished job created
  `/sdcard/Download/ELIVERSE/savetest.webm` at the exact output size, indexed by
  the media provider at `/storage/emulated/0/Download/ELIVERSE/`, and the pulled
  file probes back as VP9 320x240 + Opus, 2.028s. Two more taps produced
  `savetest (1).webm` and `savetest (2).webm` rather than overwriting, and the
  status line reported "saved savetest.webm to Downloads/ELIVERSE".
- APK signed and verified (v2 + v3), `classes.dex` at archive root, three `.so`
  files per ABI.

## Not verified / known limits

- **No physical device has run this.** Everything above is an emulator. Real
  phone risk that remains: OEM battery managers killing the child process when
  the app is backgrounded. There is no foreground service yet, only
  `WAKE_LOCK`/`FOREGROUND_SERVICE` permissions.
- **The erase panel's native colour dialog was never opened on Android.** The
  `<input type="color">` behind "this colour" is rendered by the system, and the
  emulator runs headless, so only the web build's picker was exercised. Auto
  mode, the default and the one that avoids that dialog, is verified on the
  phone.
- **JPEG XL cannot be encoded**: no libjxl. The API rejects it at submit time
  with `no usable encoder in this FFmpeg build`, which is the intended
  behaviour, and JXL still decodes.
- **HEVC has no software encoder.** x265 is deliberately not built: it is the
  only C++ dependency in the set, and linking static libc++ under FFmpeg's C
  driver produces a binary that dies in `soinfo::call_constructors` before
  `main()` on Android. HEVC encodes route to `hevc_mediacodec` instead.
- **Mojo could not be compiled.** The local SDK is a partial install with no
  `std` package, so even `print()` fails. `mojo/media_accelerator.mojo` was
  rewritten for Mojo 1.0 syntax (`fn` was removed in favour of `def`, which the
  compiler confirmed) but its SIMD intrinsics are **unverified**. The portable C
  kernels are the implemented path, and the only one that can reach Android,
  since Mojo has no Android target.
- `cmd/eliverter-mobile` (the c-shared JNI entry point) builds but is unused by
  the APK, which uses the child-process model.
- FFmpeg's WebP demuxer reads only the first chunk of a multi-frame file, so an
  animated WebP cannot be re-probed for dimensions. The sticker result reports
  the intended canvas in that case rather than the probe's zeros.
