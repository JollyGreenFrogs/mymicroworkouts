#!/bin/bash
# Start the wrangler dev server for e2e testing on port 8789.
# Uses a fixed test JWT secret so Playwright can mint its own tokens.
# This script is ONLY used by playwright — never in production.
set -e
cd "$(dirname "$0")/.."
./scripts/init-db.sh local 2>&1 | grep -E '(Done|✅|error|Error)' || true
./scripts/seed-e2e-user.sh
exec ./node_modules/.bin/wrangler pages dev public \
  --port 8789 \
  --binding JWT_SECRET_KEY=e2e-test-jwt-secret-mymicroworkouts \
  --binding AUTH_SIDECAR_URL=http://localhost:8787 \
  --binding BASE_URL=http://localhost:8789
