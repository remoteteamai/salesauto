#!/usr/bin/env bash
set -euo pipefail

DEFAULT_URL="$(sed -n "s/^window.__API_BASE_URL__ = '\(.*\)';$/\1/p" frontend/runtime-config.js 2>/dev/null || true)"
BASE_URL="${1:-$DEFAULT_URL}"

if [[ -z "$BASE_URL" ]]; then
  echo "ERROR: No API URL provided and none found in frontend/runtime-config.js"
  echo "Usage: $0 https://your-api-domain"
  exit 2
fi

if [[ "$BASE_URL" != https://* ]]; then
  echo "ERROR: API must be HTTPS for production-live checks: $BASE_URL"
  exit 2
fi

check_get() {
  local path="$1"
  local url="${BASE_URL}${path}"
  local code
  code=$(curl -sS -o /tmp/salesauto_live_body.txt -w '%{http_code}' --max-time 20 "$url" || true)

  if [[ "$code" =~ ^2[0-9][0-9]$ ]]; then
    echo "PASS GET ${path} -> HTTP ${code}"
    head -c 300 /tmp/salesauto_live_body.txt; echo
    return 0
  fi

  echo "FAIL GET ${path} -> HTTP ${code}"
  if [[ -s /tmp/salesauto_live_body.txt ]]; then
    echo "Response:"
    head -c 300 /tmp/salesauto_live_body.txt; echo
  fi
  return 1
}

check_post() {
  local path="$1"
  local url="${BASE_URL}${path}"
  local code
  code=$(curl -sS -o /tmp/salesauto_live_post_body.txt -w '%{http_code}' --max-time 20 \
    -X POST "$url" \
    -H 'Content-Type: application/json' \
    -d '{"name":"Live Check","email":"live-check@example.com"}' || true)

  if [[ "$code" =~ ^2[0-9][0-9]$ ]]; then
    echo "PASS POST ${path} -> HTTP ${code}"
    head -c 300 /tmp/salesauto_live_post_body.txt; echo
    return 0
  fi

  echo "FAIL POST ${path} -> HTTP ${code}"
  if [[ -s /tmp/salesauto_live_post_body.txt ]]; then
    echo "Response:"
    head -c 300 /tmp/salesauto_live_post_body.txt; echo
  fi
  return 1
}

echo "Checking production-live API: ${BASE_URL}"
failures=0

check_get "/health" || failures=$((failures + 1))
check_get "/api/leads" || failures=$((failures + 1))
check_post "/api/leads" || failures=$((failures + 1))

if (( failures == 0 )); then
  echo "LIVE CHECK PASSED: API appears production-live."
  exit 0
fi

echo "LIVE CHECK FAILED: ${failures} endpoint check(s) failed."
exit 1
