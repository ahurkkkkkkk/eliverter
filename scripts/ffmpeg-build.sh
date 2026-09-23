#!/usr/bin/env bash
# Cross-build the external codec libraries FFmpeg needs, then FFmpeg itself,
# for one Android ABI.
#
#   scripts/ffmpeg-build.sh arm64-v8a
#   scripts/ffmpeg-build.sh x86_64
#
# Why this exists at all: the taxonomy in internal/registry promises real
# encoders for VP8/VP9, H.264, AV1, MP3, Opus, Vorbis, WebP and PNG. A plain
# FFmpeg cross-build with --disable-autodetect ships decoders only for those,
# and every conversion into them then dies at spawn time with a bare
# "Unknown encoder". Each library here is independent: one that fails costs one
# codec family and is reported, it must not abort the build.
#
# zlib is not built here. The NDK sysroot already ships libz.a plus zlib.h, and
# without it FFmpeg drops the PNG encoder entirely -- the most used target in
# the sticker packs.
set -uo pipefail
export PATH=/usr/bin:/bin:/usr/local/bin

ABI=${1:-arm64-v8a}
NDK=${NDK:-/root/android-sdk/ndk/27.2.12479018}
API=${API:-24}
FFMPEG_VER=${FFMPEG_VER:-7.1}
ROOT=${ROOT:-/root/eliverter}
JOBS=${JOBS:-5}

case "$ABI" in
  arm64-v8a)   TRIPLE=aarch64-linux-android ARCH=aarch64 VPX=arm64-android-gcc
               MESON_CPU=aarch64 MESON_FAMILY=aarch64 FFCPU=armv8-a ;;
  x86_64)      TRIPLE=x86_64-linux-android  ARCH=x86_64 VPX=x86_64-android-gcc
               MESON_CPU=x86_64 MESON_FAMILY=x86_64 FFCPU=haswell ;;
  armeabi-v7a) TRIPLE=arm-linux-androideabi ARCH=arm VPX=armv7-android-gcc
               MESON_CPU=arm MESON_FAMILY=arm FFCPU=armv7-a ;;
  *) echo "unknown ABI: $ABI (want arm64-v8a | x86_64 | armeabi-v7a)"; exit 2 ;;
esac

# Per-ABI source trees. Sharing one clone across ABIs leaves the previous
# architecture's objects and config.mk in place, and the symptom is a link test
# that looks like a broken toolchain -- which is exactly how a host-built
# libmp3lame.a ended up installed into the x86_64 Android prefix.
SRC=$ROOT/third_party/src/$ABI
WORK=$ROOT/third_party/work/$ABI
PREFIX=$ROOT/third_party/prefix/$ABI
# Downloads are architecture-neutral, so they are fetched once and unpacked into
# whichever per-ABI source tree needs them.
DL=$ROOT/third_party/dl
TC=$NDK/toolchains/llvm/prebuilt/linux-x86_64
SYSROOT=$TC/sysroot
LOG=$WORK/logs

CC=$TC/bin/${TRIPLE}${API}-clang
CXX=$TC/bin/${TRIPLE}${API}-clang++
# Exported, not just assigned. lame's configure falls back to the host gcc when
# CC is unset, which silently produces a glibc archive that cannot link against
# bionic -- and FFmpeg then reports it as "libmp3lame >= 3.98.3 not found".
export CC CXX
# AS is deliberately NOT exported: it means "the assembler" to x264's configure,
# so pointing it at clang makes its nasm capability test run a GAS-syntax snippet
# through the C compiler and abort with "Minimum version is nasm-2.13".
export AR=$TC/bin/llvm-ar NM=$TC/bin/llvm-nm RANLIB=$TC/bin/llvm-ranlib STRIP=$TC/bin/llvm-strip

# libc++'s static archives sit in the per-triple sysroot dir, next to libz.a.
# have <file...> is true when every artifact exists, so a re-run adds one
# library instead of rebuilding nine.
CXXLIBDIR=$SYSROOT/usr/lib/$TRIPLE
have() { for f in "$@"; do [ -e "$f" ] || return 1; done; return 0; }
[ -f "$CXXLIBDIR/libc++_static.a" ] || CXXLIBDIR=""

mkdir -p "$SRC" "$WORK" "$DL" "$PREFIX/lib/pkgconfig" "$PREFIX/include" "$PREFIX/bin" "$LOG"

# CLEAN=1 discards the install prefix. An installed archive cannot be proven to
# have come from this toolchain -- a host-built libmp3lame.a and a bionic one are
# both "ELF 64-bit relocatable" -- so when anything looks off, rebuild rather
# than debug a stale artifact.
if [ "${CLEAN:-0}" = "1" ]; then
  echo "CLEAN=1: removing $PREFIX"
  rm -rf "$PREFIX"
  mkdir -p "$PREFIX/lib/pkgconfig" "$PREFIX/include" "$PREFIX/bin"
fi

[ -x "$CC" ] || { echo "NDK clang missing at $CC"; exit 1; }
echo "=== $ABI ($TRIPLE, API $API) -> $PREFIX"
echo "    libc++ static dir: ${CXXLIBDIR:-NOT FOUND, x265 will be skipped}"

export PKG_CONFIG_LIBDIR=$PREFIX/lib/pkgconfig
export PKG_CONFIG_PATH=$PREFIX/lib/pkgconfig
export CFLAGS="-O3 -fPIC -DANDROID -D__ANDROID_API__=$API -I$PREFIX/include"
export CXXFLAGS="$CFLAGS -std=c++17"
export LDFLAGS="-L$PREFIX/lib"

# bionic folds pthread into libc, so a build system that link-tests -lpthread
# against a nonexistent flag fails. An empty archive on the search path settles it.
for d in "$PREFIX/lib" "$SYSROOT/usr/lib/$TRIPLE"; do
  mkdir -p "$d"
  [ -f "$d/libpthread.a" ] || : > "$d/libpthread.a"
done

FAILED=()
ok()   { printf '  \033[32mOK\033[0m    %s\n' "$1"; }
bad()  { printf '  \033[31mFAILED\033[0m %s (%s)\n' "$1" "$2"; FAILED+=("$1"); }
skip() { printf '  \033[33mbuilt\033[0m  %s\n' "$1"; }

# pc <name> <version> <desc> <extra-libs> — synthesize a pkg-config file. Some of
# these builds install an archive and headers but advertise nothing, and FFmpeg
# probes with pkg-config, so without this it silently skips the library. The
# version matters beyond the lookup: FFmpeg asserts "mp3lame >= 3.98.3", so a
# placeholder version fails configure even with a perfectly good archive present.
pc() {
  local name=$1 version=$2 desc=$3 priv=${4:-}
  cat > "$PREFIX/lib/pkgconfig/$name.pc" <<EOF
prefix=$PREFIX
exec_prefix=\${prefix}
libdir=\${exec_prefix}/lib
includedir=\${prefix}/include

Name: $name
Description: $desc
Version: $version
Cflags: -I\${includedir}
Libs: -L\${libdir} -l$name ${priv}
Libs.private: -L\${libdir} -l$name ${priv}
EOF
}

fetch_git() { # dir url [ref]
  local dir=$1 url=$2 ref=${3:-}
  [ -d "$SRC/$dir/.git" ] && return 0
  if [ -n "$ref" ]; then
    git clone --quiet --depth 1 -b "$ref" "$url" "$SRC/$dir" 2>>"$LOG/$dir.log"
  else
    git clone --quiet --depth 1 "$url" "$SRC/$dir" 2>>"$LOG/$dir.log"
  fi
}

# The autotools route is unavailable in this image: autoreconf needs libtoolize
# and libtool is not installed. Anything without a CMake or meson build is
# therefore built with its own configure script only if it vendors ltmain.sh
# (lame does).
meson_cross_file=$WORK/meson-cross.txt
write_meson_cross() {
  # Meson inherits $CFLAGS/$LDFLAGS from the environment, so the cross file only
  # has to name the toolchain and the machine.
  cat > "$meson_cross_file" <<EOF
[binaries]
c = '$CC'
cpp = '$CXX'
ar = '$AR'
strip = '$STRIP'
pkgconfig = '$(command -v pkg-config)'

[host_machine]
system = 'android'
cpu_family = '$MESON_FAMILY'
cpu = '$MESON_CPU'
endian = 'little'
EOF
}

# build_meson <dir> <url> <ref> <installed .a> [meson options...]
build_meson() {
  local dir=$1 url=$2 ref=$3 artifact=$4; shift 4
  have "$PREFIX/lib/$artifact" && { skip "$dir"; return 0; }
  fetch_git "$dir" "$url" "$ref" || { bad "$dir" "clone, see $LOG/$dir.log"; return 1; }
  write_meson_cross
  rm -rf "$WORK/$dir-out"
  meson setup "$WORK/$dir-out" "$SRC/$dir" --cross-file "$meson_cross_file" \
    --prefix="$PREFIX" --default-library=static --buildtype=release "$@" \
    >"$LOG/$dir.log" 2>&1 || { bad "$dir" "configure, see $LOG/$dir.log"; return 1; }
  ninja -C "$WORK/$dir-out" >>"$LOG/$dir.log" 2>&1 \
    && ninja -C "$WORK/$dir-out" install >>"$LOG/$dir.log" 2>&1 \
    && ok "$dir" || { bad "$dir" "build, see $LOG/$dir.log"; return 1; }
}

# build_cmake <dir> <url> <ref> <subsource-dir> <installed .a> [cmake args...]
build_cmake() {
  local dir=$1 url=$2 ref=$3 sub=$4 artifact=$5; shift 5
  have "$PREFIX/lib/$artifact" && { skip "$dir"; return 0; }
  fetch_git "$dir" "$url" "$ref" || { bad "$dir" "clone, see $LOG/$dir.log"; return 1; }
  rm -rf "$WORK/$dir-out"
  cmake -S "$SRC/$dir${sub:+/$sub}" -B "$WORK/$dir-out" -G "Unix Makefiles" \
    -DCMAKE_TOOLCHAIN_FILE="$NDK/build/cmake/android.toolchain.cmake" \
    -DANDROID_ABI="$ABI" -DANDROID_PLATFORM=android-$API \
    -DCMAKE_INSTALL_PREFIX="$PREFIX" -DCMAKE_PREFIX_PATH="$PREFIX" \
    -DCMAKE_FIND_ROOT_PATH="$PREFIX" \
    -DBUILD_SHARED_LIBS=OFF \
    -DCMAKE_POSITION_INDEPENDENT_CODE=ON -DCMAKE_BUILD_TYPE=Release "$@" \
    >"$LOG/$dir.log" 2>&1 || { bad "$dir" "configure, see $LOG/$dir.log"; return 1; }
  cmake --build "$WORK/$dir-out" -j$JOBS >>"$LOG/$dir.log" 2>&1 \
    && cmake --install "$WORK/$dir-out" >>"$LOG/$dir.log" 2>&1 \
    && ok "$dir" || { bad "$dir" "build, see $LOG/$dir.log"; return 1; }
}

# ---------------------------------------------------------------------------
# x264 — H.264 for mp4/mov/mkv. Its configure accepts only --host, the path
# dirs and the enable/disable booleans; every tool comes from the environment.
# Handing it --cc/--ar/--strip produces "Unknown option, ignored" and then an
# unexplained nasm failure, because --cc is silently dropped.
# ---------------------------------------------------------------------------
build_x264() {
  have "$PREFIX/lib/libx264.a" "$PREFIX/include/x264.h" && { skip x264; return 0; }
  fetch_git x264 https://code.videolan.org/videolan/x264.git stable || { bad x264 clone; return 1; }
  cd "$SRC/x264" || { bad x264 cd; return 1; }
  CC="$CC" ./configure --host="$TRIPLE" --sysroot="$SYSROOT" \
    --prefix="$PREFIX" --libdir="$PREFIX/lib" --includedir="$PREFIX/include" \
    --enable-static --enable-pic --disable-cli --disable-opencl \
    --disable-lavf --disable-swscale --disable-avs --disable-ffms --disable-gpac \
    --extra-cflags="-DANDROID -fPIC" >"$LOG/x264.log" 2>&1 || { bad x264 configure; return 1; }
  make -j$JOBS >>"$LOG/x264.log" 2>&1 && make install >>"$LOG/x264.log" 2>&1 \
    && ok x264 || { bad x264 "build, see $LOG/x264.log"; return 1; }
}

# ---------------------------------------------------------------------------
# libvpx — VP8 + VP9 for WebM. MediaCodec covers these on a real phone, but the
# emulator exposes no VP9 encoder and software is the portable path.
# ---------------------------------------------------------------------------
build_libvpx() {
  have "$PREFIX/lib/libvpx.a" "$PREFIX/include/vpx/vpx_encoder.h" && { skip libvpx; return 0; }
  fetch_git libvpx https://github.com/webmproject/libvpx.git v1.14.1 || { bad libvpx clone; return 1; }
  cd "$SRC/libvpx" || { bad libvpx cd; return 1; }
  make distclean >/dev/null 2>&1
  # --extra-cflags is probed flag-by-flag and libvpx aborts on a definition of
  # __ANDROID_API__ that the driver triple already implies, so pass the flags it
  # accepts through the environment instead.
  # libvpx links its configure probes with $LD, which defaults to the host gcc:
  # on x86_64 that happens to succeed, and on aarch64 it dies with "Relocations in
  # generic ELF (EM: 183)" read as "Toolchain is unable to link executables".
  # --disable-realtime-only matters: the android targets enable it by default,
  # which compiles out libvpx's good/best VP8 rate-control profiles. FFmpeg then
  # asks for a quality mode that no longer exists and libvpx refuses to open with
  # "g_lag_in_frames out of range [..0]" -- an error that looks like bad arguments.
  CC="$CC" AR="$AR" RANLIB="$RANLIB" LD="$CC" \
  CFLAGS="-O3 -fPIC -DANDROID -I$PREFIX/include" \
  LDFLAGS="-L$PREFIX/lib" \
  ./configure --target="$VPX" --prefix="$PREFIX" --libdir="$PREFIX/lib" \
    --disable-examples --disable-unit-tests --disable-docs --disable-tools \
    --disable-shared --enable-pic --disable-realtime-only \
    >"$LOG/libvpx.log" 2>&1 || {
      bad libvpx configure
      { echo "--- config.err ---"; tail -20 "$SRC/libvpx/config.err" 2>/dev/null; } >>"$LOG/libvpx.log"
      tail -6 "$SRC/libvpx/config.log" 2>/dev/null >>"$LOG/libvpx.log"
      return 1; }
  make -j$JOBS >>"$LOG/libvpx.log" 2>&1 \
    && make install >>"$LOG/libvpx.log" 2>&1 \
    && ok libvpx || { bad libvpx "build, see $LOG/libvpx.log"; return 1; }
  # Assert the flag took. A libvpx built realtime_only compiles out VP8's quality
  # profiles, and every FFmpeg VP8 encode then fails at open with
  # "g_lag_in_frames out of range [..0]" -- a message that blames the arguments.
  if grep -q 'CONFIG_REALTIME_ONLY=yes' "$SRC/libvpx/config.mk" 2>/dev/null; then
    bad libvpx "still realtime_only: VP8 cannot encode"
    return 1
  fi
}

# ---------------------------------------------------------------------------
# lame — MP3 encoding. FFmpeg has no native MP3 encoder at all, so without this
# the .mp3 target is decode-only and every "make me an MP3" fails.
# lame vendors ltmain.sh, so the absent system libtool does not matter.
# ---------------------------------------------------------------------------
build_lame() {
  have "$PREFIX/lib/libmp3lame.a" "$PREFIX/include/lame/lame.h" && { skip lame; return 0; }
  if [ ! -d "$SRC/lame-3.100" ]; then
    [ -f "$DL/lame-3.100.tar.gz" ] || {
      curl -sSL --retry 3 -o "$DL/lame.tar.gz.part" \
        "https://sourceforge.net/projects/lame/files/lame/3.100/lame-3.100.tar.gz/download" \
        || { bad lame download; return 1; }
      mv "$DL/lame.tar.gz.part" "$DL/lame-3.100.tar.gz"
    }
    tar -xzf "$DL/lame-3.100.tar.gz" -C "$SRC" || { bad lame extract; return 1; }
  fi
  cd "$SRC/lame-3.100" || { bad lame cd; return 1; }
  ./configure --host="$TRIPLE" --build="$(uname -m)-linux" --prefix="$PREFIX" \
    --enable-static --disable-shared --disable-frontend --disable-gtktest \
    --with-sysroot="$SYSROOT" >"$LOG/lame.log" 2>&1 || { bad lame configure; return 1; }
  make -j$JOBS >>"$LOG/lame.log" 2>&1 && make install >>"$LOG/lame.log" 2>&1 \
    && ok lame || { bad lame "build, see $LOG/lame.log"; return 1; }
}

# ---------------------------------------------------------------------------
# opus — Opus encoding, which is the default audio track for every WebM.
# Built from the release tarball, not git: the repository expects the DNN
# weights (dnn/fargan_data.h) to be generated by a separate source, so meson
# aborts on a missing file. The tarball ships them plus a pre-generated
# configure, so the absent system libtool never matters.
# ---------------------------------------------------------------------------
build_opus() {
  have "$PREFIX/lib/libopus.a" "$PREFIX/include/opus/opus.h" && { skip opus; return 0; }
  # Two statements: one `local a=1 b=$a` reads the outer, still-unset $a.
  local ver=1.5.2
  local dir="$SRC/opus-$ver"
  if [ ! -d "$dir" ]; then
    [ -f "$DL/opus-$ver.tar.gz" ] || {
      curl -sSL --retry 3 -o "$DL/opus.tar.gz.part" \
        "https://downloads.xiph.org/releases/opus/opus-$ver.tar.gz" || { bad opus download; return 1; }
      mv "$DL/opus.tar.gz.part" "$DL/opus-$ver.tar.gz"
    }
    tar -xzf "$DL/opus-$ver.tar.gz" -C "$SRC" || { bad opus extract; return 1; }
  fi
  cd "$dir" || { bad opus cd; return 1; }
  CC="$CC" ./configure --host="$TRIPLE" --build="$(uname -m)-linux" --prefix="$PREFIX" \
    --libdir="$PREFIX/lib" --includedir="$PREFIX/include" \
    --enable-static --disable-shared --with-pic --disable-doc \
    --disable-extra-programs --disable-stack-protector \
    >"$LOG/opus.log" 2>&1 || { bad opus configure; return 1; }
  make -j$JOBS >>"$LOG/opus.log" 2>&1 && make install >>"$LOG/opus.log" 2>&1 \
    && ok opus || { bad opus "build, see $LOG/opus.log"; return 1; }
}

echo "=== external codec libraries for $ABI ==="
build_x264
build_libvpx
build_lame
build_opus
build_cmake webp https://github.com/webmproject/libwebp.git v1.5.0 "" libwebp.a \
  -DWEBP_BUILD_CWEBP=OFF -DWEBP_BUILD_DWEBP=OFF -DWEBP_BUILD_GIF2WEBP=OFF \
  -DWEBP_BUILD_IMG2WEBP=OFF -DWEBP_BUILD_VWEBP=OFF -DWEBP_BUILD_ANIM_UTILS=OFF \
  -DWEBP_BUILD_WEBPINFO=OFF -DWEBP_BUILD_WEBPUX=OFF -DWEBP_BUILD_EXTRAS=OFF \
  -DWEBP_BUILD_LIBWEBPMUX=ON
build_meson dav1d https://code.videolan.org/videolan/dav1d.git 1.5.1 libdav1d.a \
  -Denable_tools=false -Denable_tests=false
build_cmake ogg https://gitlab.xiph.org/xiph/ogg.git v1.3.5 "" libogg.a \
  -DBUILD_TESTING=OFF -DBUILD_EXAMPLES=OFF
# vorbis ships its own FindOgg.cmake module that probes OGG_LIBRARY /
# OGG_INCLUDE_DIR rather than the Ogg CMake package, so name both explicitly.
build_cmake vorbis https://gitlab.xiph.org/xiph/vorbis.git v1.3.7 "" libvorbis.a \
  -DBUILD_TESTING=OFF -DBUILD_EXAMPLES=OFF \
  -DOGG_LIBRARY="$PREFIX/lib/libogg.a" -DOGG_INCLUDE_DIR="$PREFIX/include"
build_cmake aom https://aomedia.googlesource.com/aom "" "" libaom.a \
  -DENABLE_EXAMPLES=OFF -DENABLE_TESTS=OFF -DENABLE_TOOLS=OFF -DCONFIGURE_AOM_EXEC=OFF
# x265 is deliberately NOT built. It is the only C++ dependency in the set, and
# static libc++ linked under FFmpeg's C driver crashes on Android before main():
# the binary dies in soinfo::call_constructors with a null dereference, so it
# never even reaches "-encoders". HEVC encoding still works through
# hevc_mediacodec, which is what a real phone exposes anyway. Losing one codec
# family is a far better trade than an executable that will not start.
if [ "${WITH_X265:-0}" = "1" ]; then
  build_cmake x265 https://github.com/videolan/x265.git "" source libx265.a \
    -DENABLE_SHARED=OFF -DENABLE_STATIC=ON -DENABLE_CLI=OFF
else
  echo "  skipped  x265 (static libc++ aborts before main; see comment above)"
  rm -f "$PREFIX/lib/libx265.a" "$PREFIX/lib/pkgconfig/x265.pc"
fi

# ---------------------------------------------------------------------------
# Guard: a library configured without a cross compiler silently builds against
# the host glibc, and file(1) cannot tell the two archives apart -- both are
# "ELF 64-bit relocatable". The undefined symbols can, so check those and drop
# any archive that would fail at FFmpeg's link test with a misleading
# "library not found".
# ---------------------------------------------------------------------------
GLIBC_ONLY='__isoc23_|__ctype_tolower_loc|__ctype_toupper_loc|gnu_get_libc_version|__libc_start_main'
echo
echo "=== host-libc contamination check ==="
for a in "$PREFIX"/lib/*.a; do
  [ -f "$a" ] || continue
  name=$(basename "$a" .a)
  if "$NM" -u "$a" 2>/dev/null | grep -qE "$GLIBC_ONLY"; then
    echo "  \033[31m$a was built against the host libc; excluding it\033[0m"
    rm -f "$a" "$PREFIX/lib/pkgconfig/$name.pc"
    bad "$name" "host libc, not bionic"
  fi
done
[ ${#FAILED[@]} -eq 0 ] && echo "  clean"

# ---------------------------------------------------------------------------
# pkg-config wiring for the archives that ship no .pc of their own. A stale
# placeholder from an earlier run has to be repaired, not just skipped.
# ---------------------------------------------------------------------------
pc_or_repair() { # name version desc extra-libs
  local f=$PREFIX/lib/pkgconfig/$1.pc
  if [ -f "$f" ] && ! grep -q '^Version: 0.0$' "$f"; then return 0; fi
  pc "$@"
}
[ -f "$PREFIX/lib/libx264.a" ]    && pc_or_repair x264 0.164 "x264 H.264" "-lm -llog"
[ -f "$PREFIX/lib/libmp3lame.a" ] && pc_or_repair mp3lame 3.100 "LAME MP3" "-lm"

# ---------------------------------------------------------------------------
# FFmpeg
# ---------------------------------------------------------------------------
BUILD_SRC=$SRC/ffmpeg-$FFMPEG_VER
if [ ! -d "$BUILD_SRC" ]; then
  [ -f "$DL/ffmpeg-$FFMPEG_VER.tar.xz" ] || {
    curl -sSL --retry 3 -o "$DL/ffmpeg.tar.xz.part" \
      "https://ffmpeg.org/releases/ffmpeg-$FFMPEG_VER.tar.xz" || exit 1
    mv "$DL/ffmpeg.tar.xz.part" "$DL/ffmpeg-$FFMPEG_VER.tar.xz"
  }
  tar -xf "$DL/ffmpeg-$FFMPEG_VER.tar.xz" -C "$SRC" || exit 1
fi
cd "$BUILD_SRC" || exit 1
if [ -f ffbuild/config.mak ] && ! grep -q "TARGET_ARCH=$ARCH\$" ffbuild/config.mak; then
  make distclean >/dev/null 2>&1 || true
fi

conf=(
  --enable-cross-compile --target-os=android --arch="$ARCH" --cpu="$FFCPU"
  --cc="$CC" --strip="$STRIP" --ranlib="$RANLIB"
  --pkg-config="$(command -v pkg-config)" \
  --pkg-config-flags=--static \
  --sysroot="$SYSROOT" --prefix="$PREFIX"
  --enable-static --disable-shared
  --disable-debug --disable-doc
  --disable-network --disable-autodetect --enable-small
  --optflags=-O3
  --enable-gpl --enable-version3
  --enable-mediacodec --enable-jni --enable-hwaccels
  # zlib lives in the NDK sysroot and is what makes the PNG encoder exist.
  --enable-zlib
)
# --extra-libs lands on every configure link test and on the final link, which
# is what several of these packages need and fail to declare: the Ogg Vorbis
# CMake config omits -lm from Libs.private, so its probe dies with undefined
# floor/cos and FFmpeg blames "vorbis not found".
conf+=(--extra-ldflags="-L$PREFIX/lib"
       --extra-cflags="-I$PREFIX/include"
       --extra-libs="-lm -llog")

# Enable exactly what installed cleanly. The mapping is configure-flag:pkg-name.
# The flag and the encoder id differ for AV1: --enable-libaom is the option while
# the encoder it produces is named libaom-av1, and passing the encoder name makes
# configure abort with "Unknown option". libvpx backs both VP8 and VP9, and
# libwebp both the still and the animated encoder, so each needs one flag only.
enable_from_pkgconfig() { # flag pc-name
  pkg-config --exists "$2" 2>/dev/null || return 1
  conf+=("--enable-$1")
}
for pair in "libx264:x264" "libx265:x265" "libvpx:vpx" "libopus:opus" \
            "libvorbis:vorbis" "libmp3lame:mp3lame" "libdav1d:dav1d" \
            "libaom:aom" "libwebp:libwebp"; do
  enable_from_pkgconfig "${pair%%:*}" "${pair##*:}" \
    || echo "  (skipped: no ${pair##*:} pkg-config)"
done

echo
echo "=== ffmpeg configure ==="
printf '%s\n' "${conf[@]}" | grep -- '--enable-lib' | tr '\n' ' '
echo " +zlib"

./configure "${conf[@]}" >"$LOG/ffmpeg-configure.log" 2>&1 || {
  echo "  FFMPEG CONFIGURE FAILED"; tail -40 "$LOG/ffmpeg-configure.log"; exit 1; }
make -j$JOBS >"$LOG/ffmpeg-build.log" 2>&1 && make install >>"$LOG/ffmpeg-build.log" 2>&1 || {
  echo "  FFMPEG BUILD FAILED"; tail -60 "$LOG/ffmpeg-build.log"; exit 1; }

echo
echo "=== result for $ABI ==="
for b in ffmpeg ffprobe; do
  f=$PREFIX/bin/$b
  [ -x "$f" ] && printf '  %-8s %s\n' "$b" "$(du -h "$f" | cut -f1)" || echo "  MISSING: $f"
done
# The installed binaries are stripped, so symbols are useless for verification.
# ffbuild/config.mak records exactly what was compiled in, as NAME_ENCODER=yes.
echo "  encoders compiled in:"
grep -oE 'CONFIG_(PNG|APNG|GIF|LIBWEBP|LIBWEBP_ANIM|LIBX264|LIBVPX|LIBVPX_VP9|LIBOPUS|LIBVORBIS|LIBMP3LAME|LIBAOM_AV1|VP8_MEDIACODEC|VP9_MEDIACODEC|H264_MEDIACODEC|HEVC_MEDIACODEC|AV1_MEDIACODEC|AC3|FLAC|ALAC|MPEG4|MP2)_ENCODER=yes' \
  ffbuild/config.mak 2>/dev/null | sed 's/CONFIG_//; s/_ENCODER=yes//' \
  | tr 'A-Z_' 'a-z-' | tr '\n' ' '
echo
grep -q 'CONFIG_ZLIB=yes' ffbuild/config.mak 2>/dev/null && echo "  zlib: yes" || echo "  zlib: NO (no PNG encoder)"
[ ${#FAILED[@]} -gt 0 ] && echo "  DEGRADED (no encoder behind these): ${FAILED[*]}"
exit 0
