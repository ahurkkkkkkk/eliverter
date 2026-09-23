#!/usr/bin/env bash
# Build the desktop server and run a live API smoke test against real FFmpeg.
#
#   scripts/smoke.sh              rebuild, start, probe, stop
#   scripts/smoke.sh --no-build   reuse the existing binary
set -uo pipefail
export PATH=/usr/local/go/bin:/usr/bin:/bin
export GOPATH=/root/go GOFLAGS=-buildvcs=false

ROOT=/root/eliverter
BIN=$ROOT/bin/eliverter
cd "$ROOT/go" || exit 1

if [ "${1:-}" != "--no-build" ]; then
  echo "=== build ==="
  mkdir -p "$ROOT/bin"
  go build -o "$BIN" ./cmd/eliverter || exit 1
  echo "build ok"
fi

DATA=${DATA:-/tmp/eli-smoke}
PORT=${PORT:-8421}
rm -rf "$DATA"; mkdir -p "$DATA"

"$BIN" -addr 127.0.0.1:"$PORT" -data "$DATA" > "$DATA/server.log" 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null' EXIT
sleep 3

if ! kill -0 $PID 2>/dev/null; then
  echo "SERVER DIED:"; cat "$DATA/server.log"; exit 1
fi

echo "=== /api/health ==="
curl -sS "http://127.0.0.1:$PORT/api/health" | head -c 1200
echo

echo
echo "=== /api/taxonomy summary ==="
curl -sS "http://127.0.0.1:$PORT/api/taxonomy" > /tmp/eli-taxonomy.json
python3 - <<'PY'
import json
d = json.load(open("/tmp/eli-taxonomy.json"))
c, a = d["counts"], d["available"]
print("taxonomy   :", c)
print("ffmpeg     :", a["ffmpeg_version"][:70])
print("simd       :", a["simd_backend"])
print("ffmpeg has :", a["encoders"], "encoders /", a["decoders"], "decoders /", a["muxers"], "muxers")
print("containers :", len(d["containers"]), "  codecs:", len(d["codecs"]))
PY

echo
echo "=== /api/packs ==="
curl -sS "http://127.0.0.1:$PORT/api/packs" > /tmp/eli-packs.json
python3 - <<'PY'
import json
for p in json.load(open("/tmp/eli-packs.json")):
    print(f'  {p["id"]:<22} {p["container"]:<5} {p["codec"]:<5} edge={p["edge"]:<4} limit={p["limit"]}')
PY
