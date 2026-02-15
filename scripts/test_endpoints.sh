#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:8080}"

echo "Testing: $BASE_URL"

echo "1) GET /health"
curl -fsS "$BASE_URL/health" | jq .

echo "2) GET /api/leads"
curl -fsS "$BASE_URL/api/leads" | jq .

echo "3) POST /api/leads"
curl -fsS -X POST "$BASE_URL/api/leads" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Jane Doe","email":"jane@example.com"}' | jq .

echo "4) GET /api/leads (after insert)"
curl -fsS "$BASE_URL/api/leads" | jq .

echo "All endpoint checks passed."
