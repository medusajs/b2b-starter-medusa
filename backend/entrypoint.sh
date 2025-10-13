#!/bin/bash
set -e

echo "🚀 Medusa Backend Entrypoint"
echo "============================"
echo "Environment: ${NODE_ENV:-development}"
echo ""

# Função para aguardar o banco de dados
wait_for_db() {
  echo "⏳ Waiting for database to be ready..."
  max_attempts=60
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if node -e "
      const { Client } = require('pg');
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
      });
      client.connect()
        .then(() => { client.end(); process.exit(0); })
        .catch(() => process.exit(1));
    " 2>/dev/null; then
      echo "✅ Database is ready!"
      return 0
    fi
    
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts - waiting 2s..."
    sleep 2
  done
  
  echo "❌ Database connection timeout after $max_attempts attempts"
  return 1
}

# Função para executar migrações
run_migrations() {
  echo ""
  echo "🔄 Running database migrations..."
  
  if npm run migrate; then
    echo "✅ Migrations completed successfully"
    return 0
  else
    echo "⚠️  Migration command failed"
    return 1
  fi
}

# Aguardar banco de dados
if ! wait_for_db; then
  echo "❌ Cannot proceed without database connection"
  exit 1
fi

# Executar migrações
if [ "${SKIP_MIGRATIONS}" != "true" ]; then
  if ! run_migrations; then
    if [ "${FAIL_ON_MIGRATION_ERROR}" = "true" ]; then
      echo "❌ Exiting due to migration failure"
      exit 1
    else
      echo "⚠️  Continuing despite migration failure (FAIL_ON_MIGRATION_ERROR not set)"
    fi
  fi
else
  echo "⏭️  Skipping migrations (SKIP_MIGRATIONS=true)"
fi

# Executar comando passado como argumento
echo ""
echo "🎯 Starting application: $@"
exec "$@"
