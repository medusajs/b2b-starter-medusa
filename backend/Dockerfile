# ==========================================
# Dockerfile de Produção para Backend Medusa
# Otimizado para performance e segurança
# ==========================================

FROM node:20-alpine

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat dumb-init python3 make g++

# Configurar diretório de trabalho
WORKDIR /app

# Configurações de ambiente para produção
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NPM_CONFIG_LOGLEVEL=warn

# Copiar arquivos de dependências
COPY package*.json ./
COPY .npmrc* ./

# Instalar dependências (incluindo dev dependencies para build)
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Workaround para problema do Rollup e SWC no Alpine Linux
RUN npm install --force @rollup/rollup-linux-x64-musl @swc/core-linux-x64-musl || true

# Copiar código fonte e dados do catálogo
COPY . .

# Build da aplicação
RUN npm run build

# Criar diretório de uploads
RUN mkdir -p uploads

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 medusa && \
      adduser --system --uid 1001 medusa && \
      chown -R medusa:medusa /app

# Mudar para usuário não-root
USER medusa

# Expor portas (principal + admin + store)
EXPOSE 9000 9001 9002

# Health check otimizado (sem dependência de curl)
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
      CMD node -e "require('http').get('http://localhost:9000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Comando para produção
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]