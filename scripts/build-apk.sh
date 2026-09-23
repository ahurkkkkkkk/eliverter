#!/usr/bin/env bash
# Assemble and sign the Eliverter APK using Android build-tools directly.
#
# Gradle and AGP are deliberately avoided: the app has no Kotlin, no annotation
# processing and no resource merging beyond what aapt2 does natively, so driving
# aapt2 -> javac -> d8 -> zipalign -> apksigner costs no downloads and keeps the
# whole packaging path inspectable in one file.
set -uo pipefail
export PATH=/usr/bin:/bin:/usr/local/bin

SDK=${SDK:-/root/android-sdk}
BUILD_TOOLS=${BUILD_TOOLS:-35.0.0}
PLATFORM=${PLATFORM:-android-35}
ROOT=${ROOT:-/root/eliverter}
ANDROID_HOME=$SDK
BT=$SDK/build-tools/$BUILD_TOOLS
ANDROID_JAR=$SDK/platforms/$PLATFORM/android.jar

APP=$ROOT/android/app/src/main
OUT=$ROOT/android/build
STAGE=$OUT/stage
UNSIGNED=$OUT/unsigned.apk
ALIGNED=$OUT/aligned.apk
FINAL=$OUT/eliverter-debug.apk

for tool in aapt2 d8 zipalign apksigner javac keytool; do
  command -v "$tool" >/dev/null 2>&1 || {
    case $tool in
      aapt2|d8|zipalign|apksigner) [ -x "$BT/$tool" ] || { echo "missing $tool in $BT"; exit 1; };;
      javac|keytool) command -v "$tool" >/dev/null || { echo "missing $tool (JDK 17+)"; exit 1; };;
    esac
  }
done
AAPT2=$BT/aapt2; D8=$BT/d8; ZIPALIGN=$BT/zipalign; APKSIGNER=$BT/apksigner
JAVAC=$(command -v javac); KEYTOOL=$(command -v keytool)
command -v zip >/dev/null || { echo "missing zip (apt-get install zip)"; exit 1; }
[ -f "$ANDROID_JAR" ] || { echo "missing $ANDROID_JAR"; exit 1; }

rm -rf "$OUT"; mkdir -p "$STAGE/res" "$STAGE/java" "$STAGE/dex" "$STAGE/classes" "$STAGE/lib/arm64-v8a"

echo "=== 1. Go server + FFmpeg into jniLibs ==="
shopt -s nullglob
abis=()
for d in "$APP"/libs/*/; do
  abi=$(basename "$d")
  so_files=("$d"*.so)
  if [ ${#so_files[@]} -eq 0 ]; then
    echo "  skipping empty abi dir: $abi"
    continue
  fi
  mkdir -p "$STAGE/lib/$abi"
  cp "${so_files[@]}" "$STAGE/lib/$abi/"
  abis+=("$abi")
  printf '  %-12s %s\n' "$abi" "$(ls "$STAGE/lib/$abi" | tr '\n' ' ')"
done
if [ ${#abis[@]} -eq 0 ]; then
  echo "  no .so files under $APP/libs — run scripts/cross-go-all.sh first"
  exit 1
fi
for required in libeliverter_srv.so libffmpeg_cli.so; do
  for abi in "${abis[@]}"; do
    [ -e "$STAGE/lib/$abi/$required" ] || \
      echo "  WARNING: $abi is missing $required; the app will install but cannot convert"
  done
done
echo "  ABIs packaged: ${abis[*]}"

echo "=== 2. compile resources ==="
"$AAPT2" compile --dir "$APP/res" -o "$STAGE/res/" || exit 1
# -R is single-valued: one flag per compiled resource, or aapt2 reads the second
# path as an option and dumps its usage.
RFLAGS=()
while IFS= read -r flat; do
  RFLAGS+=(-R "$flat")
done < <(find "$STAGE/res" -name '*.flat' | sort)
echo "  ${#RFLAGS[@]} resource args from $(find "$STAGE/res" -name '*.flat' | wc -l) compiled files"
"$AAPT2" link \
  --auto-add-overlay \
  -I "$ANDROID_JAR" \
  --manifest "$APP/AndroidManifest.xml" \
  "${RFLAGS[@]}" \
  --min-sdk-version 24 \
  --target-sdk-version 35 \
  --java "$STAGE/java" \
  -o "$UNSIGNED" || exit 1
echo "  linked; R.java at $(find "$STAGE/java" -name R.java | head -1)"

echo "=== 3. compile java ==="
find "$APP/java" "$STAGE/java" -name '*.java' > "$OUT/sources.txt"
# JDK 21 rejects -bootclasspath with a modern -target, so let --release supply
# the platform classes and take the Android API from the classpath.
"$JAVAC" --release 11 -nowarn \
  -classpath "$ANDROID_JAR" \
  -d "$STAGE/classes" @"$OUT/sources.txt" || exit 1
echo "  $(find "$STAGE/classes" -name '*.class' | wc -l) classes"

echo "=== 4. dex ==="
find "$STAGE/classes" -name '*.class' > "$OUT/classes.txt"
"$D8" --lib "$ANDROID_JAR" --min-api 24 --output "$STAGE/dex" \
  $(find "$STAGE/classes" -name '*.class') || exit 1
echo "  $(ls "$STAGE/dex")"

echo "=== 5. inject dex + native libs ==="
# classes.dex must sit at the archive root; zipping from $STAGE would store it
# as dex/classes.dex and the runtime loader would find no code at all.
cd "$STAGE/dex" || exit 1
zip -q "$UNSIGNED" classes.dex
cd "$STAGE" || exit 1
zip -qr "$UNSIGNED" lib
cd "$OUT" || exit 1

echo "=== 6. align ==="
"$ZIPALIGN" -f 4 "$UNSIGNED" "$ALIGNED" || exit 1

echo "=== 7. sign ==="
KEYSTORE=$ROOT/android/eliverter-debug.keystore
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -v -keystore "$KEYSTORE" -storepass eliverter \
    -keypass eliverter -alias eliverter -keyalg RSA -keysize 2048 \
    -validity 10000 -dname "CN=Eliverter Debug, OU=dev, O=TenOFSwordsr, L=unknown, S=none, C=IR" >/dev/null 2>&1
fi
"$APKSIGNER" sign --ks "$KEYSTORE" --ks-pass pass:eliverter \
  --v2-signing-enabled true --v3-signing-enabled true \
  --out "$FINAL" "$ALIGNED" || exit 1

echo
echo "=== APK ==="
ls -la "$FINAL"
"$APKSIGNER" verify --verbose --print-certs "$FINAL" 2>&1 | head -8
"$AAPT2" dump badging "$FINAL" 2>/dev/null | head -8
unzip -l "$FINAL" | grep -E "classes.dex|lib/|\.so" | head -10
