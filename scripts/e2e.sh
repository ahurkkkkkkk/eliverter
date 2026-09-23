#!/usr/bin/env bash
# End-to-end pipeline test: generate samples, run a conversion and the animated
# sticker pack through the live HTTP API, and report what actually came out.
set -uo pipefail
export PATH=/usr/local/go/bin:/usr/bin:/bin
export GOPATH=/root/go GOFLAGS=-buildvcs=false

ROOT=/root/eliverter
BIN=$ROOT/bin/eliverter
DATA=${DATA:-/tmp/eli-e2e}
PORT=${PORT:-8422}

cd "$ROOT/go" || exit 1
go build -o "$BIN" ./cmd/eliverter || exit 1

rm -rf "$DATA"; mkdir -p "$DATA/samples"
"$BIN" -addr 127.0.0.1:"$PORT" -data "$DATA" > "$DATA/server.log" 2>&1 &
PID=$!
trap 'kill $PID 2>/dev/null' EXIT
sleep 2
kill -0 $PID || { cat "$DATA/server.log"; exit 1; }

S=$DATA/samples
echo "=== generating samples ==="
# 3s 640x480 test video with audio, plus a transparent PNG and a wav.
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "testsrc2=size=640x480:rate=30:duration=3" \
       -f lavfi -i "sine=frequency=440:duration=3" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest "$S/clip.mp4" && echo "  clip.mp4 ok"
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "gradients=size=400x300:duration=1" \
       -vf "format=rgba,colorchannelmixer=aa=0.6" -frames:v 1 "$S/sticker.png" && echo "  sticker.png ok"
ffmpeg -hide_banner -loglevel error -y -f lavfi -i "sine=frequency=440:duration=2" "$S/tone.wav" && echo "  tone.wav  ok"
# A deliberately not-a-media file for the rejection path.
head -c 4096 /dev/urandom > "$S/junk.bin"

API=http://127.0.0.1:$PORT
submit () { # name, extra args...
  local name=$1; shift
  curl -sS -X POST "$API/api/jobs" -F "file=@$1" -F "target_format=$2" "${@:3}"
  echo
}

echo
echo "=== 1. mp4 -> webm (vp9/opus) ==="
R=$(curl -sS -X POST "$API/api/jobs" -F "file=@$S/clip.mp4" -F "target_format=webm" \
      -F "video_codec=vp9" -F "audio_codec=opus" -F "crf=32")
echo "$R"
ID=$(echo "$R" | python3 -c 'import json,sys;print(json.load(sys.stdin)["id"])')

for i in $(seq 1 40); do
  ST=$(curl -sS "$API/api/jobs/$ID" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["status"],int(d["progress_pct"]),d["output_size"],d["error"])')
  case "$ST" in completed*|failed*) break;; esac
  sleep 2
done
echo "  final: $ST"

OUT="$DATA/outputs/$ID.webm"
if [ -f "$OUT" ]; then
  echo "  size: $(stat -c%s "$OUT") bytes"
  ffprobe -v error -show_entries stream=codec_name,width,height,pix_fmt -of csv=p=0 "$OUT" | sed 's/^/  stream: /'
fi

echo
echo "=== 2. telegram_animated sticker from clip.mp4 ==="
R=$(curl -sS -X POST "$API/api/sticker-packs" -F "file=@$S/clip.mp4" -F "pack=telegram_animated")
echo "$R"
SID=$(echo "$R" | python3 -c 'import json,sys;print(json.load(sys.stdin)["id"])')
for i in $(seq 1 60); do
  ST=$(curl -sS "$API/api/jobs/$SID" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["status"],d["output_size"],d["error"])')
  case "$ST" in completed*|failed*) break;; esac
  sleep 2
done
echo "  final: $ST"
for f in "$DATA"/outputs/*telegram_animated*; do
  [ -e "$f" ] || continue
  echo "  artifact: $(basename "$f")  $(stat -c%s "$f") bytes"
  ffprobe -v error -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate,nb_frames \
          -show_entries format=duration -of default=nw=1 "$f" | tr '\n' ' ' | sed 's/^/  probe: /'; echo
done

echo
echo "=== 3. whatsapp_static sticker from sticker.png ==="
R=$(curl -sS -X POST "$API/api/sticker-packs" -F "file=@$S/sticker.png" -F "pack=whatsapp_static")
WID=$(echo "$R" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("id",""))')
sleep 4
curl -sS "$API/api/jobs/$WID" | head -c 400; echo
for f in "$DATA"/outputs/*whatsapp_static*; do
  [ -e "$f" ] || continue
  echo "  artifact: $(basename "$f")  $(stat -c%s "$f") bytes (limit 102400)"
  ffprobe -v error -show_entries stream=width,height,pix_fmt -of csv=p=0 "$f" | sed 's/^/  geom: /'
done

echo
echo "=== 4. probe rejection on a non-media file ==="
curl -sS -o /dev/null -w "  http=%{http_code}\n" -X POST "$API/api/probe" -F "file=@$S/junk.bin"
curl -sS -X POST "$API/api/probe" -F "file=@$S/junk.bin" | head -c 260; echo

echo
echo "=== 5. wav -> flac, and an illegal mux request ==="
curl -sS -X POST "$API/api/jobs" -F "file=@$S/tone.wav" -F "target_format=flac" | head -c 220; echo
echo "  expecting 422 for h264-into-webm:"
curl -sS -o /dev/null -w "  http=%{http_code}\n" -X POST "$API/api/jobs" \
     -F "file=@$S/clip.mp4" -F "target_format=webm" -F "video_codec=h264"
