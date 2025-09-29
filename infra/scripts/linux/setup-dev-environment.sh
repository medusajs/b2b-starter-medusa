#!/usr/bin/env bash
set -euo pipefail

# Fedora local dev setup for ysh-b2b (Podman + Node + Yarn + Postgres/Redis)
# Usage: bash infra/scripts/linux/setup-dev-environment.sh

RED="\033[0;31m"; GREEN="\033[0;32m"; YELLOW="\033[0;33m"; NC="\033[0m"

log() { echo -e "${GREEN}==>${NC} $1"; }
warn() { echo -e "${YELLOW}==>${NC} $1"; }
err() { echo -e "${RED}==>${NC} $1"; }

ROOT_DIR=$(cd "$(dirname "$0")/../../.." && pwd)
cd "$ROOT_DIR"

# 1) Packages básicos
log "Instalando pacotes base (Podman, plugins, build tools)..."
sudo dnf -y install podman podman-plugins podman-compose jq git curl gcc-c++ make python3 python3-pip > /dev/null

# 2) Garantir cgroups e rootless habilitados (Fedora padrão já ok)
log "Versões:"
podman --version
podman info --format '{{ .Host.NetworkBackend }}' || true

# 3) Node via NVM (user scope)
if ! command -v nvm >/dev/null 2>&1; then
  warn "Instalando NVM..."
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  # shellcheck disable=SC1090
  . "$HOME/.nvm/nvm.sh"
fi
# shellcheck disable=SC1090
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"

log "Instalando Node 20 LTS via nvm..."
nvm install 20
nvm use 20

log "Habilitando Corepack (Yarn)..."
corepack enable || true

# 4) Rede Podman com DNS habilitado
NET_NAME="ysh-b2b-dev"
if ! podman network inspect "$NET_NAME" >/dev/null 2>&1; then
  log "Criando rede $NET_NAME (DNS habilitado por padrão em redes custom)"
  podman network create "$NET_NAME" >/dev/null
else
  warn "Rede $NET_NAME já existe"
fi

# 5) Subir Postgres/Redis do compose (mapeados para host)
log "Subindo Postgres e Redis com podman-compose.dev.yml..."
PODMAN_COMPOSE=$(command -v podman-compose || true)
if [ -z "$PODMAN_COMPOSE" ]; then
  warn "podman-compose não encontrado; usando docker-compose se disponível"
  COMPOSE_BIN=$(command -v docker-compose || true)
else
  COMPOSE_BIN=$PODMAN_COMPOSE
fi

if [ -z "$COMPOSE_BIN" ]; then
  err "Nem podman-compose nem docker-compose encontrados. Instale um deles."
  exit 1
fi

$COMPOSE_BIN -f podman-compose.dev.yml up -d postgres-dev redis-dev

# 6) Esperar serviços
log "Aguardando Postgres na 15432..."
for i in {1..60}; do
  if bash -c "</dev/tcp/127.0.0.1/15432" 2>/dev/null; then
    echo "ok"; break
  fi
  sleep 1
  [ "$i" -eq 60 ] && { err "Timeout esperando Postgres"; exit 1; }
done

log "Aguardando Redis na 16379..."
for i in {1..30}; do
  if bash -c "</dev/tcp/127.0.0.1/16379" 2>/dev/null; then
    echo "ok"; break
  fi
  sleep 1
  [ "$i" -eq 30 ] && { err "Timeout esperando Redis"; exit 1; }
done

# 7) Backend env
if [ ! -f backend/.env ]; then
  warn "Criando backend/.env padrão..."
  cat > backend/.env << 'EOF'
# Database Configuration
DATABASE_URL=postgres://postgres:postgres@localhost:15432/medusa_db
DATABASE_SSL=false

# Redis Configuration
REDIS_URL=redis://localhost:16379
MEDUSA_REDIS_URL=redis://localhost:16379

# CORS Configuration
STORE_CORS=http://localhost:8000,http://localhost:3000
ADMIN_CORS=http://localhost:9000,http://localhost:7001,http://localhost:7000
AUTH_CORS=http://localhost:9000,http://localhost:7001,http://localhost:7000

# JWT & Cookie Secrets
JWT_SECRET=dev-secret-change-me
COOKIE_SECRET=dev-cookie-change-me

# Server Configuration
NODE_ENV=development
PORT=9000
HOST=0.0.0.0

# Medusa Admin
MEDUSA_ADMIN_ONBOARDING_TYPE=nextjs
MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY=../storefront

# Performance & Memory
NODE_OPTIONS="--max-old-space-size=4096"
DB_NAME=medusa_db
EOF
fi

# 8) Instalar deps (Yarn 4) e preparar apps
log "Instalando dependências (backend/storefront)..."
( cd backend && corepack yarn install --immutable )
( cd storefront && corepack yarn install --immutable )

# 9) Storefront env sample
if [ ! -f storefront/.env.local ]; then
  warn "Criando storefront/.env.local a partir do exemplo..."
  cp storefront/.env.local.example storefront/.env.local
fi

# 10) Dicas de execução
log "Setup concluído. Próximos passos:"
echo "  1) Em um terminal: (cd backend && corepack yarn dev)"
echo "  2) Em outro:       (cd storefront && corepack yarn dev)"
echo "  3) Backend:      http://localhost:9000"
echo "  4) Storefront:   http://localhost:8000"
