#!/bin/bash
# ─────────────────────────────────────────────────────────
# Rydo Production Deployment Script
# Usage: ./scripts/deploy.sh [--no-pull] [--migrate-only]
# ─────────────────────────────────────────────────────────
set -euo pipefail

CYAN='\033[0;36m'; GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'

log()  { echo -e "${CYAN}[deploy]${NC} $1"; }
ok()   { echo -e "${GREEN}[  ok  ]${NC} $1"; }
fail() { echo -e "${RED}[ fail ]${NC} $1"; exit 1; }

NO_PULL=false
MIGRATE_ONLY=false
for arg in "$@"; do
  [[ "$arg" == "--no-pull"      ]] && NO_PULL=true
  [[ "$arg" == "--migrate-only" ]] && MIGRATE_ONLY=true
done

log "Starting Rydo deployment..."
echo ""

# Check required files
[ -f "backend/.env"       ] || fail "Missing backend/.env"
[ -f "frontend/.env.local" ] || fail "Missing frontend/.env.local"

if [[ "$MIGRATE_ONLY" == true ]]; then
  log "Running migrations only..."
  docker compose -f docker-compose.prod.yml exec -T backend npm run migration:run
  ok "Migrations applied."
  exit 0
fi

# Pull latest images
if [[ "$NO_PULL" == false ]]; then
  log "Pulling latest Docker images..."
  docker compose -f docker-compose.prod.yml pull
  ok "Images updated."
fi

# Restart services
log "Restarting services..."
docker compose -f docker-compose.prod.yml up -d --remove-orphans
ok "Services restarted."

# Wait for backend
log "Waiting for backend to be ready..."
for i in {1..30}; do
  if curl -sf http://localhost:4000/api/health > /dev/null 2>&1; then
    ok "Backend is healthy."; break
  fi
  [[ $i -eq 30 ]] && fail "Backend did not become healthy in time."
  sleep 2
done

# Run migrations
log "Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T backend npm run migration:run
ok "Migrations applied."

# Show status
echo ""
log "Deployment summary:"
docker compose -f docker-compose.prod.yml ps
echo ""
ok "🚗 Rydo deployed successfully!"
echo ""
echo "  Frontend: http://localhost:3000"
echo "  API:      http://localhost:4000/api"
echo "  Swagger:  http://localhost:4000/api/docs"
