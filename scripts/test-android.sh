#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Require a single device, or select one with ANDROID_SERIAL.
adb get-state >/dev/null
metro_pid=""
metro_log=$(mktemp -t accessibility-metro)
cleanup() {
  if [ -n "$metro_pid" ]; then
    kill "$metro_pid" 2>/dev/null || true
    wait "$metro_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT

metro_ready() {
  [ "$(curl --max-time 2 -fsS http://127.0.0.1:8081/status 2>/dev/null)" = "packager-status:running" ]
}

if ! metro_ready; then
  echo "Starting Metro (log: $metro_log)"
  CI=1 ./node_modules/.bin/expo start --localhost --port 8081 >"$metro_log" 2>&1 &
  metro_pid=$!
  for ((attempt = 0; attempt < 60; attempt++)); do
    if metro_ready; then break; fi
    if ! kill -0 "$metro_pid" 2>/dev/null; then
      cat "$metro_log"
      exit 1
    fi
    sleep 1
  done
  if ! metro_ready; then
    cat "$metro_log"
    echo "Metro did not become ready on port 8081." >&2
    exit 1
  fi
fi

adb reverse tcp:8081 tcp:8081
cd android
./gradlew :app:connectedDebugAndroidTest --console=plain "$@"
