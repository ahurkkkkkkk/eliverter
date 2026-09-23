#!/usr/bin/env bash
# Cross-compile the Go server for Android x86_64 so it matches an x86_64
# emulator ABI, and assemble a multi-ABI debug APK.
set -uo pipefail
export PATH=/usr/local/go/bin:/usr/bin:/bin
export GOPATH=/root/go GOFLAGS=-buildvcs=false

NDK=${NDK:-/root/android-sdk/ndk/27.2.12479018}
API=${API:-24}
TC=$NDK/toolchains/llvm/prebuilt/linux-x86_64
ROOT=/root/eliverter
LIBS=$ROOT/android/app/src/main/libs

cd "$ROOT/go" || exit 1

build_one() { # goarch  ndk-triple  abi-dir
  local goarch=$1 triple=$2 abi=$3
  local out="$LIBS/$abi"
  mkdir -p "$out"
  echo "=== $abi ==="
  CGO_ENABLED=1 GOOS=android GOARCH=$goarch \
    CC="$TC/bin/${triple}${API}-clang" \
    CXX="$TC/bin/${triple}${API}-clang++" \
    go build -trimpath -ldflags="-s -w -linkmode external" \
      -o "$out/libeliverter_srv.so" ./cmd/eliverter || return 1
  file "$out/libeliverter_srv.so" | sed 's/^/  /'
}

build_one arm64 aarch64-linux-android arm64-v8a || exit 1
build_one amd64 x86_64-linux-android  x86_64    || exit 1

# Ship the matching FFmpeg per ABI. A missing one has to stop the build: an APK
# without libffmpeg_cli.so installs, launches and then cannot convert anything,
# which is exactly the failure a silent cp -f would hide.
missing=0
for abi in arm64-v8a x86_64; do
  for tool in ffmpeg ffprobe; do
    src="$ROOT/third_party/prefix/$abi/bin/$tool"
    if [ ! -x "$src" ]; then
      echo "  MISSING $src -- run: scripts/ffmpeg-build.sh $abi"
      missing=1
      continue
    fi
    cp -f "$src" "$LIBS/$abi/lib${tool}_cli.so"
  done
done
[ $missing -eq 0 ] || exit 1

echo "=== jniLibs ==="
for d in "$LIBS"/*/; do
  printf '  %s: %s\n' "$(basename "$d")" "$(ls "$d" | tr '\n' ' ')"
done
