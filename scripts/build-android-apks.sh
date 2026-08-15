#!/usr/bin/env bash
# Builds the five role-specific Krishi-Yatra APKs.
# Requires: JDK 17, Android SDK (ANDROID_HOME), Node 20+.
# Usage: APP_URL=https://<your-domain> ./scripts/build-android-apks.sh
set -euo pipefail

: "${APP_URL:=https://smartkrishiyatra.noxverse.in}"
ROLES=(farmer driver fleet buyer admin)
OUT="$(pwd)/apks"
mkdir -p "$OUT"

npm run build

for role in "${ROLES[@]}"; do
  echo "=== Building $role ==="
  rm -rf android
  APP_ROLE="$role" APP_URL="$APP_URL" npx cap add android
  APP_ROLE="$role" APP_URL="$APP_URL" npx cap sync android
  (cd android && ./gradlew assembleRelease)
  cp android/app/build/outputs/apk/release/app-release*.apk "$OUT/krishi-yatra-$role.apk"
  echo "--- identity check ---"
  "$ANDROID_HOME"/build-tools/*/aapt dump badging "$OUT/krishi-yatra-$role.apk" | grep -E "^package|application-label"
done

echo "APKs written to $OUT"
