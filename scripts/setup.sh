#!/bin/bash
# scripts/setup.sh — One-command local dev setup

set -e

echo "🚗 Setting up Rydo development environment..."
echo ""

# Check dependencies
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required. Install: https://docker.com"; exit 1; }
command -v node   >/dev/null 2>&1 || { echo "❌ Node.js 18+ is required."; exit 1; }
command -v npm    >/dev/null 2>&1 || { echo "❌ npm is required."; exit 1; }

echo "✅ Dependencies OK"
echo ""

# Create .env files if missing
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "📝 Created backend/.env — please fill in your credentials"
fi

if [ ! -f frontend/.env.local ]; then
  cp frontend/.env.example frontend/.env.local
  echo "📝 Created frontend/.env.local"
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install --silent && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm install --silent && cd ..

echo ""
echo "🐳 Starting Docker services (PostgreSQL + Redis)..."
docker compose up -d postgres redis

echo "⏳ Waiting for database..."
sleep 5

echo "🗄️  Running database migrations..."
cd backend && npm run build > /dev/null 2>&1 && npx typeorm migration:run -d src/config/database.config.ts 2>/dev/null || true && cd ..

echo "🌱 Seeding database..."
cd backend && npx ts-node database/seeds/index.ts 2>/dev/null || echo "  (Seed skipped or already done)" && cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Run the app:"
echo "  Backend:  cd backend  && npm run start:dev"
echo "  Frontend: cd frontend && npm run dev"
echo "  Docker:   docker compose up"
echo ""
echo "URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:4000"
echo "  Swagger:  http://localhost:4000/api/docs"
