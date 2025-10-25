#!/bin/bash

# Backend Initialization Script for Medusa B2B
set -e

export PGSSLMODE="${PGSSLMODE:-disable}"

echo "🚀 Iniciando Backend Medusa B2B..."

# Wait for database to be ready
echo "⏳ Aguardando PostgreSQL..."
until pg_isready -h postgres-dev -p 5432 -U medusa_user; do
  echo "PostgreSQL não está pronto - aguardando..."
  sleep 2
done
echo "✅ PostgreSQL conectado!"

# Wait for Redis to be ready
echo "⏳ Aguardando Redis..."
until redis-cli -h redis-dev -p 6379 ping | grep PONG; do
  echo "Redis não está pronto - aguardando..."
  sleep 2
done
echo "✅ Redis conectado!"

# Install dependencies if node_modules doesn't exist or package.json is newer
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.yarn-integrity" ]; then
    echo "📦 Instalando dependências..."
    npm install --legacy-peer-deps
fi

# Run database migrations
echo "🗄️ Configurando banco de dados..."
PGSSLMODE=disable npx medusa db:setup <<< "medusa_db" || {
    echo "❌ Erro na configuração. Tentando migrações manuais..."
    PGSSLMODE=disable npx medusa db:migrate
}

# Run seeders if specified
if [ "$RUN_SEED" = "true" ]; then
    echo "🌱 Executando seeders..."
    npm run seed || echo "⚠️ Seeders falharam, mas continuando..."
fi

# Start the development server
echo "🎯 Iniciando servidor de desenvolvimento..."
exec npm run dev