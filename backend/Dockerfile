# ==========================================
# Multi-stage Dockerfile para Backend Medusa
# Otimizado para performance e segurança
# ==========================================

# Stage 1: Base com Node.js otimizado
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app

# Configurações de performance para Node.js
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048 --enable-source-maps"
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_PROGRESS=false

# Stage 2: Dependency installer
FROM base AS deps

# Adicionar dependências necessárias para @swc/core no Alpine
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY .npmrc* ./

# Cache bust para otimização de build
RUN --mount=type=cache,target=/root/.npm \
      npm ci --only=production --no-audit --no-fund --legacy-peer-deps && \
      npm install --force @rollup/rollup-linux-x64-musl @swc/core-linux-x64-musl || true && \
      npm cache clean --force

# Stage 3: Build stage
FROM base AS builder

# Adicionar dependências necessárias para build
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY .npmrc* ./

# Install all dependencies including devDependencies
RUN --mount=type=cache,target=/root/.npm \
      npm ci --no-audit --no-fund --legacy-peer-deps && \
      npm install --force @rollup/rollup-linux-x64-musl @swc/core-linux-x64-musl || true

COPY . .

# Build da aplicação
RUN npm run build

# Stage 4: Production runner
FROM base AS runner

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 medusa && \
      adduser --system --uid 1001 medusa

# Copiar dependências de produção
COPY --from=deps --chown=medusa:medusa /app/node_modules ./node_modules

# Copiar código compilado e dados do catálogo
COPY --from=builder --chown=medusa:medusa /app/dist ./dist
COPY --from=builder --chown=medusa:medusa /app/package.json ./package.json
COPY --from=builder --chown=medusa:medusa /app/medusa-config.ts ./medusa-config.ts
COPY --from=builder --chown=medusa:medusa /app/data ./data

# Configurações de runtime
USER medusa
EXPOSE 9000

# Health check otimizado (sem dependência de curl)
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
      CMD node -e "require('http').get('http://localhost:9000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Usar dumb-init para gerenciamento correto de sinais
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]