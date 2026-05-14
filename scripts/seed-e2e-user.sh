#!/bin/bash
# Seed a test user into the local D1 database for e2e tests.
# This runs once before Playwright starts.
# The user ID matches the JWT sub claim minted by e2e/helpers/auth.ts.

set -e
cd "$(dirname "$0")/.."

WRANGLER=./node_modules/.bin/wrangler

$WRANGLER d1 execute mymicroworkouts-db --local --command="
  INSERT OR IGNORE INTO users (id, email, name)
  VALUES ('e2e-user-001', 'e2e@test.local', 'E2E Test User');
" 2>&1 | grep -v '^\s*$' || true

echo "✓ E2E test user seeded"
