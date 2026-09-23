#!/usr/bin/env bash
# One-command build for Eliverter: tests, frontend, arm64 server, APK.
#
#   scripts/build.sh            full pipeline -> android/build/eliverter-debug.apk
#   scripts/build.sh --quick    skip the Go test suite
#
# FFmpeg is NOT rebuilt here: scripts/ffmpeg-build.sh <abi> takes ~30 minutes per
# ABI because it cross-builds x264, libvpx, lame, opus, vorbis, webp, dav1d, aom
# and x265 first. Run it once per ABI before using this script.
set -uo pipefail
export PATH=/usr/local/go/bin:/usr/local/node22/bin:/usr/bin:/bin
export GOPATH=/root/go GOFLAGS=-buildvcs=false

ROOT=/root/eliverter
FAILED=0

step() { printf '\n\033[1m=== %s ===\033[0m\n' "$1"; }

step "Go tests"
if [ "${1:-}" = "--quick" ]; then
  echo "  skipped (--quick)"
else
  (cd "$ROOT/go" && go test ./... -count=1 -timeout 25m 2>&1 | grep -vE "no test files" | tail -20) || FAILED=1
fi

step "Svelte frontend -> go/internal/webui/dist"
(cd "$ROOT/web" && npm run build 2>&1 | grep -E "dist/|error|✓ built" | tail -8) || FAILED=1

step "cross-compile Go for both ABIs -> jniLibs"
bash "$ROOT/scripts/cross-go-all.sh" 2>&1 | tail -12 || FAILED=1

step "package APK"
bash "$ROOT/scripts/build-apk.sh" 2>&1 | grep -avE "^ +[A-Za-z0-9-]" | tail -22 || FAILED=1

step "artifacts"
APK=$ROOT/android/build/eliverter-debug.apk
if [ -f "$APK" ]; then
  ls -la "$APK"
  unzip -l "$APK" | grep -E "classes.dex|\.so$|resources.arsc"
  OUT=/mnt/c/Users/Administrator/Desktop/apps
  if [ -d "$OUT" ]; then
    cp -f "$APK" "$OUT/eliverter-debug.apk" && echo "  copied to Desktop/apps/eliverter-debug.apk"
  fi
else
  echo "  NO APK PRODUCED"
  FAILED=1
fi

exit $FAILED
