# ==========================================
# Multi-stage Dockerfile para Storefront Next.js
# Otimizado para performance e Vercel compatibility
# ==========================================

# Stage 1: Base com Node.js otimizado
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app

# Configurações de performance para Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Stage 2: Dependency installer
FROM base AS deps
COPY package*.json ./
COPY .npmrc* ./

# Desabilitar husky git hooks no Docker
ENV DOCKER=true

# Cache otimizado para dependências
RUN --mount=type=cache,target=/root/.npm \
      npm ci --only=production --no-audit --no-fund --legacy-peer-deps && \
      npm cache clean --force

# Instalar dependências de desenvolvimento em stage separado
FROM base AS dev-deps
COPY package*.json ./
COPY .npmrc* ./

# Desabilitar husky git hooks no Docker
ENV DOCKER=true

# Instalar TODAS as dependências (production + dev)
RUN --mount=type=cache,target=/root/.npm \
      npm ci --include=dev --no-audit --no-fund --legacy-peer-deps

# Stage 3: Build stage
FROM base AS builder

# Aceitar build args para variáveis NEXT_PUBLIC_*
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://backend:9000
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_build_placeholder
ARG NEXT_PUBLIC_BASE_URL=http://localhost:8000
ARG NEXT_PUBLIC_DEFAULT_REGION=br

# Desabilitar husky no builder também
ENV DOCKER=true
ENV NEXT_TELEMETRY_DISABLED=1

# Definir as variáveis de ambiente para o build (Next.js precisa delas em build time)
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=${NEXT_PUBLIC_MEDUSA_BACKEND_URL}
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
ENV NEXT_PUBLIC_DEFAULT_REGION=${NEXT_PUBLIC_DEFAULT_REGION}

COPY package*.json ./
COPY --from=dev-deps /app/node_modules ./node_modules

# Copiar o workspace packages/ui para que @ysh/ui seja resolvido
COPY packages ./packages

# Copiar o resto do código
COPY . .

# Build do @ysh/ui primeiro
RUN cd packages/ui && npm run build

# Build otimizado do Next.js
RUN npm run build

# Stage 4: Production runner
FROM base AS runner

# Criar usuário não-root
RUN addgroup --system --gid 1001 nextjs && \
      adduser --system --uid 1001 nextjs

# Copiar arquivos de produção do standalone (já inclui node_modules otimizados)
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./

# Copiar static assets que não estão no standalone
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static

# Copiar pasta public (Next.js standalone precisa dela copiada explicitamente)
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

# Configurações de runtime
USER nextjs
EXPOSE 8000
ENV PORT=8000
ENV HOSTNAME="0.0.0.0"

# Health check para Next.js (sem dependência de curl)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
      CMD node -e "require('http').get('http://localhost:8000/', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Usar dumb-init para gerenciamento de sinais
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]