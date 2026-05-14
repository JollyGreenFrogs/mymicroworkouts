#!/bin/bash
# Start the wrangler dev server for e2e testing on port 8789.
# Uses a fixed test JWT secret so Playwright can mint its own tokens.
# Runs against an isolated state directory (.wrangler/state-e2e) so the
# developer's local dev data (.wrangler/state) is never touched.
# This script is ONLY used by playwright — never in production.
set -e
cd "$(dirname "$0")/.."

E2E_STATE=.wrangler/state-e2e

# Apply DB schema to the isolated e2e state directory
./node_modules/.bin/wrangler d1 execute mymicroworkouts-db \
  --local \
  --persist-to "$E2E_STATE" \
  --file=./db/schema.sql 2>&1 | grep -E '(Done|✅|error|Error)' || true

# Seed the e2e test user into the isolated DB
E2E_STATE="$E2E_STATE" ./scripts/seed-e2e-user.sh

exec ./node_modules/.bin/wrangler pages dev public \
  --port 8789 \
  --persist-to "$E2E_STATE" \
  --binding JWT_SECRET_KEY=e2e-test-jwt-secret-mymicroworkouts \
  --binding AUTH_SIDECAR_URL=http://localhost:8787 \
  --binding BASE_URL=http://localhost:8789
