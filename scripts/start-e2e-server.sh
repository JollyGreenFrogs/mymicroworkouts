#!/bin/bash
# Start the e2e test stack (nginx + sidecar + postgres) for Playwright tests.
# Uses docker-compose.e2e.yml — isolated from the dev stack (port 8789, separate DB).
# This script is ONLY used by playwright — never in production.
set -e
cd "$(dirname "$0")/.."

DC="docker compose -f docker-compose.e2e.yml"

# Bring the stack up (build if images are stale)
$DC up -d --build 2>&1 | grep -E '(Starting|Created|Building|done|error|Error)' || true

# Wait for the sidecar to be healthy (up to 60s)
echo "Waiting for auth-sidecar-e2e to be ready..."
for i in $(seq 1 30); do
  if $DC exec -T auth-sidecar-e2e python -c "import urllib.request; urllib.request.urlopen('http://localhost:8787/health')" 2>/dev/null; then
    break
  fi
  sleep 2
done

# Run Alembic migrations against the e2e DB
$DC exec -T auth-sidecar-e2e alembic upgrade head

# Seed the e2e test user (code matches JWT sub in e2e/helpers/auth.ts)
$DC exec -T auth-sidecar-e2e python - <<'PYEOF'
from jgf_auth.database_models.connection import get_engine
from sqlalchemy import text
import uuid

engine = get_engine()
with engine.connect() as conn:
    conn.execute(text("""
        INSERT INTO admin.users
            (id, code, role, email, email_hash, is_active, is_email_verified,
             failed_login_attempts, mfa_enabled, created_at, updated_at)
        VALUES
            (:id, :code, 'parent', NULL, NULL, TRUE, TRUE, 0, FALSE, NOW(), NOW())
        ON CONFLICT (code) DO NOTHING
    """), {"id": str(uuid.uuid4()), "code": "e2euser001ab"})
    conn.commit()
PYEOF

echo "✓ E2E stack ready at http://localhost:8789"
