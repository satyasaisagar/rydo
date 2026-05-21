#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Rydo — Vercel Postgres (Neon) Setup Script
# Run this ONCE after creating a Vercel Postgres database
# to pull the connection strings and write them to .env files
# ─────────────────────────────────────────────────────────────
set -euo pipefail

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${CYAN}[vercel-db]${NC} $1"; }
ok()   { echo -e "${GREEN}[   ok   ]${NC} $1"; }
warn() { echo -e "${YELLOW}[  warn  ]${NC} $1"; }

echo ""
echo "  🐘  Rydo — Vercel Postgres Setup"
echo "  ══════════════════════════════════"
echo ""

# Check vercel CLI is installed and logged in
command -v vercel >/dev/null 2>&1 || { warn "Vercel CLI not found. Run: npm install -g vercel"; exit 1; }

# Pull env vars from Vercel into backend/.env
log "Pulling Vercel environment variables for backend..."
cd backend

# Link to Vercel project if not already linked
if [ ! -f .vercel/project.json ]; then
  log "Linking to Vercel project..."
  vercel link --yes
fi

# Pull production env
vercel env pull .env --environment=production --yes 2>/dev/null || true
vercel env pull .env.local --yes 2>/dev/null || true

ok "Environment variables pulled to backend/.env"
cd ..

# Pull for frontend
log "Pulling Vercel environment variables for frontend..."
cd frontend
if [ ! -f .vercel/project.json ]; then
  vercel link --yes
fi
vercel env pull .env.local --yes 2>/dev/null || true
ok "Environment variables pulled to frontend/.env.local"
cd ..

echo ""
echo "  ══════════════════════════════════════════"
ok "Vercel Postgres env vars are set!"
echo ""
echo "  The following vars are now in backend/.env:"
echo "    POSTGRES_URL"
echo "    POSTGRES_URL_NON_POOLING"
echo "    POSTGRES_HOST / USER / PASSWORD / DATABASE"
echo ""
echo "  Now run migrations:"
echo "    cd backend && npm run migration:run"
echo "    cd backend && npm run seed"
echo "  ══════════════════════════════════════════"
echo ""
