#!/bin/bash
# dev.sh — Start mymicroworkouts locally
# Usage: ./dev.sh
#
# Starts the full stack (postgres + auth-sidecar + nginx) via docker compose.
# The app will be available at http://localhost:8788
#
# PREREQUISITE: Copy auth-sidecar/.env.example to auth-sidecar/.env and fill in values.

set -e

cd "$(dirname "$0")"

echo "=== mymicroworkouts local dev ==="
echo ""

# Ensure auth-sidecar .env exists
if [ ! -f "auth-sidecar/.env" ]; then
    echo "No auth-sidecar/.env found — copying from auth-sidecar/.env.example"
    cp auth-sidecar/.env.example auth-sidecar/.env
    echo ""
    echo "  ACTION REQUIRED: Edit auth-sidecar/.env and fill in JWT_SECRET_KEY"
    echo "  and DATA_ENCRYPTION_KEY before the app will work."
    echo ""
    echo "  File: $(pwd)/auth-sidecar/.env"
    echo ""
    read -rp "Press Enter to continue anyway (app will start, auth will fail until keys are set)..."
    echo ""
fi

# Export env vars for docker compose variable substitution
set -a
# shellcheck disable=SC1091
source auth-sidecar/.env
set +a

echo "Starting stack at http://localhost:8788"
echo "Press Ctrl+C to stop."
echo ""
docker compose up --build
