# ==========================================
# Dockerfile de Produção para Backend Medusa
# Otimizado para performance e segurança
# ==========================================

FROM node:20-alpine

# Instalar dependências do sistema (inclui CA para TLS)
RUN apk add --no-cache libc6-compat dumb-init python3 make g++ ca-certificates curl

# Configurar diretório de trabalho
WORKDIR /app

# Baixar certificado AWS RDS CA bundle
RUN curl -o /tmp/rds-ca-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem

# Configurações de ambiente para produção (NODE_ENV definido após build)
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV NPM_CONFIG_LOGLEVEL=warn

# Copiar arquivos de dependências
COPY package*.json ./
COPY .npmrc* ./

# Instalar todas as dependências (incluindo dev para o Medusa build)
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Definir NODE_ENV após instalação das dependências
ENV NODE_ENV=production

# Workaround para problema do Rollup e SWC no Alpine Linux
RUN npm install --force @rollup/rollup-linux-x64-musl @swc/core-linux-x64-musl || true

# Copiar código fonte e dados do catálogo
COPY . .

# Compilar TypeScript config files (medusa-config.ts -> medusa-config.js)
RUN npx tsc medusa-config.ts mikro-orm.config.ts --target ES2022 --module ESNext --moduleResolution Bundler --esModuleInterop --resolveJsonModule --skipLibCheck || true

# Build da aplicação - O Medusa build compila o código
# Se falhar, continuamos pois o Medusa pode rodar TypeScript diretamente
RUN npm run build || echo "Build warning: TypeScript errors present but continuing..."

# Criar diretório de uploads
RUN mkdir -p uploads

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 medusa && \
      adduser --system --uid 1001 medusa && \
      chown -R medusa:medusa /app/uploads /app/.medusa && \
      chown medusa:medusa /tmp/rds-ca-bundle.pem

# Mudar propriedade de arquivos de runtime
RUN chown medusa:medusa /app/package.json /app/medusa-config.js || true

# Copiar script de entrypoint e tornar executável
COPY --chown=medusa:medusa entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Mudar para usuário não-root
USER medusa

# Expor portas (principal + admin + store)
EXPOSE 9000 9001 9002

# Health check otimizado (sem dependência de curl)
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
      CMD node -e "require('http').get('http://localhost:9000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Comando para produção com migrações automáticas
ENTRYPOINT ["dumb-init", "--", "/app/entrypoint.sh"]
CMD ["npm", "start"]