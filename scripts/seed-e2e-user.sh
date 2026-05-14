#!/bin/bash
# Seed a test user into the isolated e2e D1 database.
# This runs once before Playwright starts.
# The user ID matches the JWT sub claim minted by e2e/helpers/auth.ts.
# E2E_STATE env var controls which state directory is used; defaults to
# .wrangler/state-e2e to avoid touching the dev database.

set -e
cd "$(dirname "$0")/.."

WRANGLER=./node_modules/.bin/wrangler
E2E_STATE=${E2E_STATE:-.wrangler/state-e2e}

$WRANGLER d1 execute mymicroworkouts-db \
  --local \
  --persist-to "$E2E_STATE" \
  --command="
  INSERT OR IGNORE INTO users (id, email, name)
  VALUES ('e2e-user-001', 'e2e@test.local', 'E2E Test User');
" 2>&1 | grep -v '^\s*$' || true

echo "✓ E2E test user seeded"
