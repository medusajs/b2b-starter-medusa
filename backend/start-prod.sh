#!/bin/bash
set -e

echo "🚀 Starting Medusa Backend (Production)"
echo "========================================"

# Aguardar conexão com o banco de dados
echo "⏳ Waiting for database connection..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if npm run migrate -- --help &> /dev/null; then
    echo "✅ Database connection established"
    break
  fi
  attempt=$((attempt + 1))
  echo "   Attempt $attempt/$max_attempts..."
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ Failed to connect to database after $max_attempts attempts"
  exit 1
fi

# Executar migrações do banco de dados
echo ""
echo "🔄 Running database migrations..."
npm run migrate

if [ $? -eq 0 ]; then
  echo "✅ Migrations completed successfully"
else
  echo "❌ Migration failed"
  exit 1
fi

# Iniciar o servidor
echo ""
echo "🎯 Starting Medusa server..."
exec npm start
