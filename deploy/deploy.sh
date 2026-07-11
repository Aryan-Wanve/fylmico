#!/usr/bin/env bash
# Runs ON the VPS (invoked over SSH by .github/workflows/deploy-vps.yml).
# Assumes the repo is already cloned at $DEPLOY_DIR with `origin` pointing
# at GitHub, and that $DEPLOY_DIR/.env exists (see deploy/api.env.example).
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/fylmico}"
cd "$DEPLOY_DIR"

echo "==> Fetching latest main"
git fetch origin main
git reset --hard origin/main

echo "==> Building and starting containers"
docker compose -f docker-compose.prod.yml --env-file .env up -d --build

echo "==> Applying database migrations"
docker compose -f docker-compose.prod.yml exec -T api npx prisma migrate deploy \
  --schema packages/database/prisma/schema.prisma

echo "==> Pruning old images"
docker image prune -f

echo "==> Deploy complete"
