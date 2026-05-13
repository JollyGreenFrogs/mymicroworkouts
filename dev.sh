#!/bin/bash
# dev.sh — Start mymicroworkouts locally
# Usage: ./dev.sh
#
# PREREQUISITE: The jgf-auth sidecar must be running first:
#   docker compose up --build

set -e

cd "$(dirname "$0")"

echo "=== mymicroworkouts local dev ==="
echo ""
echo "NOTE: The jgf-auth sidecar must be running (docker compose up --build)"
echo "      before login will work."
echo ""

# 1. Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install
    echo ""
fi

# 2. Ensure .dev.vars exists
if [ ! -f ".dev.vars" ]; then
    echo "No .dev.vars found — copying from .dev.vars.example"
    cp .dev.vars.example .dev.vars
    echo ""
    echo "  ACTION REQUIRED: Edit .dev.vars and fill in your OAuth credentials"
    echo "  before the app's login flow will work."
    echo ""
    echo "  File: $(pwd)/.dev.vars"
    echo ""
    read -rp "Press Enter to continue anyway (app will start, auth will fail until creds are set)..."
    echo ""
fi

# 3. Initialize local D1 database (idempotent)
echo "Initialising local D1 database..."
chmod +x scripts/init-db.sh
./scripts/init-db.sh local
echo ""

# 4. Start the dev server
echo "Starting dev server at http://localhost:8788"
echo "Press Ctrl+C to stop."
echo ""
./node_modules/.bin/wrangler pages dev public --d1=DB
