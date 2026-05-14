#!/bin/bash
# deploy-frost.sh — Build and deploy mymicroworkouts to frost (10.0.27.50 Unraid)
#
# What this does:
#   1. Builds the auth-sidecar Docker image locally
#   2. Ships the image to frost via docker save | docker load
#   3. rsyncs the app source to frost at /home/venura/mymicroworkouts
#   4. Starts postgres + auth-sidecar containers on frost
#   5. Installs npm deps, wipes D1 state, inits the DB, starts wrangler pages dev
#
# Prerequisites on frogjump:
#   - docker compose (for building the image)
#   - auth-sidecar/.env must exist (gitignored — you maintain this manually)
#   - .dev.vars must exist (gitignored — you maintain this manually)
#
# App will be accessible at: http://frost:8788
# Auth sidecar runs on frost:8787

set -e

FROST_HOST=frost
DEPLOY_DIR=/home/venura/mymicroworkouts
APP_PORT=8788
SIDECAR_PORT=8787

echo "=== mymicroworkouts deploy to frost ==="
echo ""

# 1. Build the auth-sidecar image
echo "[ 1/6 ] Building auth-sidecar image..."
docker compose build auth-sidecar
echo ""

# 2. Save and ship the image to frost
echo "[ 2/6 ] Shipping Docker image to frost..."
docker save mymicroworkouts-auth-sidecar:latest | ssh $FROST_HOST "docker load"
echo ""

# 3. rsync app source
echo "[ 3/6 ] Syncing app files to frost:$DEPLOY_DIR..."
rsync -av --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.wrangler' \
  --exclude='auth-sidecar/jgf-auth' \
  --exclude='auth-sidecar/.env' \
  --exclude='.dev.vars' \
  --exclude='deploy-frost.sh' \
  ./ $FROST_HOST:$DEPLOY_DIR/
echo ""

# 4. Sync secrets — frost-specific .dev.vars if present, else the regular one
echo "[ 4/6 ] Syncing secrets..."
if [ -f ".dev.vars.frost" ]; then
  rsync -av .dev.vars.frost $FROST_HOST:$DEPLOY_DIR/.dev.vars
  echo "  Used .dev.vars.frost"
else
  # Patch the regular .dev.vars: update BASE_URL and ALLOWED_ORIGINS for frost
  TMP_DEVVARS=$(mktemp)
  sed "s|BASE_URL=.*|BASE_URL=http://frost:$APP_PORT|g" .dev.vars > "$TMP_DEVVARS"
  rsync -av "$TMP_DEVVARS" $FROST_HOST:$DEPLOY_DIR/.dev.vars
  rm "$TMP_DEVVARS"
  echo "  Used .dev.vars (with BASE_URL patched for frost)"
fi
# Sync the auth-sidecar .env, patching ALLOWED_ORIGINS for frost
TMP_ENV=$(mktemp)
grep -v '^ALLOWED_ORIGINS=' auth-sidecar/.env > "$TMP_ENV"
echo "ALLOWED_ORIGINS=http://frost:$APP_PORT" >> "$TMP_ENV"
rsync -av "$TMP_ENV" $FROST_HOST:$DEPLOY_DIR/auth-sidecar/.env
rm "$TMP_ENV"
echo "  auth-sidecar/.env synced with ALLOWED_ORIGINS=http://frost:$APP_PORT"
echo ""

# 5. On frost: ensure postgres container is running
echo "[ 5/6 ] Starting postgres on frost..."
ssh $FROST_HOST "
  set -e
  if docker inspect mw-postgres >/dev/null 2>&1; then
    echo '  postgres container already exists — starting it'
    docker start mw-postgres 2>/dev/null || true
  else
    echo '  Creating postgres container...'
    docker run -d \
      --name mw-postgres \
      --restart unless-stopped \
      -e POSTGRES_USER=mwauth \
      -e POSTGRES_PASSWORD=mwauth \
      -e POSTGRES_DB=mwauth \
      -v mw-pgdata:/var/lib/postgresql/data \
      postgres:16-alpine
    echo '  Waiting for postgres to be ready...'
    for i in \$(seq 1 20); do
      docker exec mw-postgres pg_isready -U mwauth >/dev/null 2>&1 && break
      sleep 1
    done
  fi
  echo '  postgres ready'
"
echo ""

# 6. On frost: start auth-sidecar (always recreate to pick up new image)
echo "[ 5/6 ] Starting auth-sidecar on frost..."
ssh $FROST_HOST "
  set -e
  docker rm -f mw-auth-sidecar 2>/dev/null || true
  docker run -d \
    --name mw-auth-sidecar \
    --restart unless-stopped \
    --link mw-postgres:postgres \
    -p ${SIDECAR_PORT}:8787 \
    --env-file $DEPLOY_DIR/auth-sidecar/.env \
    -e DATABASE_URL=postgresql://mwauth:mwauth@postgres:5432/mwauth \
    mymicroworkouts-auth-sidecar:latest
  echo '  auth-sidecar started on port ${SIDECAR_PORT}'
  sleep 3
  docker logs mw-auth-sidecar --tail 10
"
echo ""

# 7. On frost: install deps, init DB, start wrangler pages dev
echo "[ 6/6 ] Starting wrangler app on frost..."
ssh $FROST_HOST "
  set -e
  cd $DEPLOY_DIR

  echo '  Installing npm dependencies...'
  npm install --silent

  echo '  Initialising local D1 database...'
  rm -rf .wrangler/state/v3/d1
  ./scripts/init-db.sh local 2>&1 | grep -E '(✓|✅|❌|error|Error)' || true

  echo '  Stopping any previous wrangler process...'
  pkill -f 'wrangler pages dev' 2>/dev/null || true
  sleep 1

  echo '  Starting wrangler pages dev on 0.0.0.0:${APP_PORT}...'
  nohup ./node_modules/.bin/wrangler pages dev public \
    --ip 0.0.0.0 --port ${APP_PORT} \
    > /tmp/mymicroworkouts-app.log 2>&1 &
  echo \"  App PID: \$!\"
  sleep 3
  echo '  Last lines of app log:'
  tail -5 /tmp/mymicroworkouts-app.log
"

echo ""
echo "=== Deploy complete! ==="
echo ""
echo "  App:         http://frost:$APP_PORT"
echo "  Auth sidecar: http://frost:$SIDECAR_PORT"
echo "  App log:     ssh frost 'tail -f /tmp/mymicroworkouts-app.log'"
echo "  Sidecar log: ssh frost 'docker logs -f mw-auth-sidecar'"
