# 🚀 Deployment Scripts - Guia de Configuração

## 📋 Visão Geral

Este guia documenta os scripts de deployment e inicialização do backend para garantir execução automática de migrações em todos os ambientes.

---

## 📁 Scripts Disponíveis

### 1. `entrypoint.sh` - Script Universal de Inicialização

**Localização:** `/app/entrypoint.sh` (dentro do container)  
**Uso:** Docker (desenvolvimento e produção), AWS EC2

**Características:**

- ✅ Aguarda conexão com banco de dados (retry com timeout)
- ✅ Executa migrações automaticamente antes de iniciar o servidor
- ✅ Suporta flags de controle via variáveis de ambiente
- ✅ Logs detalhados de cada etapa
- ✅ Tratamento de erros com exit codes apropriados

**Variáveis de Ambiente:**

```bash
# Pular migrações (útil para debug)
SKIP_MIGRATIONS=true

# Falhar se migrações falharem (padrão: continua mesmo com falha)
FAIL_ON_MIGRATION_ERROR=true

# URL de conexão do banco
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Ativar SSL (AWS RDS)
DATABASE_SSL=true
```

**Exemplo de Uso:**

```bash
# Execução padrão (com migrações)
./entrypoint.sh npm start

# Desenvolvimento
./entrypoint.sh npm run dev

# Pular migrações
SKIP_MIGRATIONS=true ./entrypoint.sh npm start
```

---

### 2. `start-prod.sh` - Script Simplificado para Produção

**Localização:** `/app/start-prod.sh`  
**Uso:** Alternativa ao entrypoint.sh para deployments simples

**Características:**

- ✅ Aguarda banco de dados
- ✅ Executa migrações
- ✅ Inicia servidor automaticamente
- ✅ Mais simples que entrypoint.sh (sem flags configuráveis)

**Exemplo de Uso:**

```bash
./start-prod.sh
```

---

### 3. `start-dev.sh` - Script de Desenvolvimento

**Localização:** `/app/start-dev.sh`  
**Uso:** Desenvolvimento local (quando não usar Docker)

**Características:**

- ✅ Aguarda PostgreSQL e Redis
- ✅ Instala dependências se necessário
- ✅ Executa `medusa db:setup`
- ✅ Suporta seeders opcionais
- ✅ Inicia servidor em modo desenvolvimento

**Variáveis de Ambiente:**

```bash
# Executar seeders após migrações
RUN_SEED=true

# Desabilitar SSL do PostgreSQL
PGSSLMODE=disable
```

---

## 🐳 Configuração Docker

### Dockerfile (Produção)

**Mudanças Implementadas:**

```dockerfile
# Copiar script de entrypoint e tornar executável
COPY --chown=medusa:medusa entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Comando para produção com migrações automáticas
ENTRYPOINT ["dumb-init", "--", "/app/entrypoint.sh"]
CMD ["npm", "start"]
```

**Como Funciona:**

1. Container inicia → `dumb-init` executa `entrypoint.sh`
2. `entrypoint.sh` aguarda banco de dados (até 60 tentativas)
3. `entrypoint.sh` executa `npm run migrate`
4. `entrypoint.sh` executa comando CMD (`npm start`)

---

### Dockerfile.dev (Desenvolvimento)

**Mudanças Implementadas:**

```dockerfile
# Copiar script de entrypoint e tornar executável
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Comando para desenvolvimento com migrações automáticas
ENTRYPOINT ["dumb-init", "--", "/app/entrypoint.sh"]
CMD ["npm", "run", "dev"]
```

---

### Build e Execução

```bash
# Build da imagem de produção
docker build -t ysh-backend:latest -f Dockerfile .

# Build da imagem de desenvolvimento
docker build -t ysh-backend:dev -f Dockerfile.dev .

# Executar produção
docker run -p 9000:9000 \
  -e DATABASE_URL="postgresql://..." \
  -e DATABASE_SSL="true" \
  ysh-backend:latest

# Executar desenvolvimento
docker run -p 9000:9000 \
  -e DATABASE_URL="postgresql://..." \
  -v $(pwd):/app \
  ysh-backend:dev

# Pular migrações (debug)
docker run -p 9000:9000 \
  -e SKIP_MIGRATIONS="true" \
  -e DATABASE_URL="postgresql://..." \
  ysh-backend:latest
```

---

## ☁️ Configuração AWS EC2

### Opção 1: Usar Docker no EC2 (Recomendado)

**Vantagens:**

- ✅ Mesmo ambiente que desenvolvimento
- ✅ Scripts já configurados
- ✅ Fácil rollback e versionamento

**Setup:**

```bash
# 1. SSH no EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# 2. Instalar Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# 3. Pull da imagem (se usando registry)
docker pull your-registry/ysh-backend:latest

# Ou build local
git clone your-repo
cd ysh-store/backend
docker build -t ysh-backend:latest .

# 4. Executar com variáveis de ambiente
docker run -d \
  --name ysh-backend \
  --restart unless-stopped \
  -p 9000:9000 \
  -e DATABASE_URL="postgresql://user:pass@rds-endpoint:5432/yshdb" \
  -e DATABASE_SSL="true" \
  -e NODE_ENV="production" \
  -e JWT_SECRET="your-secret" \
  -e COOKIE_SECRET="your-cookie-secret" \
  ysh-backend:latest

# 5. Verificar logs
docker logs -f ysh-backend
```

**Logs Esperados:**

```
🚀 Medusa Backend Entrypoint
============================
Environment: production

⏳ Waiting for database to be ready...
   Attempt 1/60 - waiting 2s...
   Attempt 2/60 - waiting 2s...
✅ Database is ready!

🔄 Running database migrations...
[Medusa] Running migrations...
[Medusa] ✔ Migrations completed
✅ Migrations completed successfully

🎯 Starting application: npm start
[Medusa] Server started on port 9000
```

---

### Opção 2: Node.js Direto no EC2

**Setup:**

```bash
# 1. Instalar Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 2. Clone e install
git clone your-repo
cd ysh-store/backend
npm install --legacy-peer-deps

# 3. Build
npm run build

# 4. Configurar variáveis de ambiente
cat > .env.production <<EOF
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@rds:5432/yshdb
DATABASE_SSL=true
JWT_SECRET=your-secret
COOKIE_SECRET=your-cookie-secret
PORT=9000
EOF

# 5. Usar entrypoint.sh
chmod +x entrypoint.sh
./entrypoint.sh npm start

# Ou usar PM2 (recomendado para produção)
npm install -g pm2

pm2 start entrypoint.sh --name ysh-backend -- npm start
pm2 save
pm2 startup
```

---

### Opção 3: Usar PM2 com Ecosystem File

**Criar `ecosystem.config.js`:**

```javascript
module.exports = {
  apps: [{
    name: 'ysh-backend',
    script: './entrypoint.sh',
    args: 'npm start',
    interpreter: '/bin/bash',
    env: {
      NODE_ENV: 'production',
      PORT: 9000,
      DATABASE_URL: 'postgresql://user:pass@rds:5432/yshdb',
      DATABASE_SSL: 'true',
      FAIL_ON_MIGRATION_ERROR: 'true'
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '2G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true
  }]
}
```

**Executar:**

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 🔍 Troubleshooting

### Problema: Migrações Falhando

**Sintomas:**

```
⚠️ Migration command failed
```

**Soluções:**

1. **Verificar conexão com banco:**

```bash
# Dentro do container
npm run migrate -- --help
# Deve retornar help text se conectar
```

2. **Verificar credenciais:**

```bash
echo $DATABASE_URL
# Deve estar no formato correto
```

3. **Executar manualmente:**

```bash
# Debug mode
npm run migrate -- --debug
```

4. **Pular migrações temporariamente:**

```bash
docker run -e SKIP_MIGRATIONS=true ...
```

---

### Problema: Database Connection Timeout

**Sintomas:**

```
❌ Database connection timeout after 60 attempts
```

**Soluções:**

1. **Verificar que RDS/PostgreSQL está rodando**
2. **Verificar security groups do AWS**
3. **Verificar DATABASE_URL está correto**
4. **Aumentar timeout em `entrypoint.sh`:**

```bash
# Linha 10 de entrypoint.sh
max_attempts=120  # era 60
```

---

### Problema: SSL Certificate Error (AWS RDS)

**Sintomas:**

```
Error: self signed certificate in certificate chain
```

**Solução:**

```bash
# Adicionar variável de ambiente
-e DATABASE_SSL=true

# Ou no medusa-config.ts, garantir:
databaseDriverOptions: {
  connection: {
    ssl: process.env.DATABASE_SSL === "true" ? {
      rejectUnauthorized: false,
      ca: fs.readFileSync('/tmp/rds-ca-bundle.pem').toString()
    } : false
  }
}
```

---

## ✅ Checklist de Deployment

### Pré-Deploy

- [ ] Build da imagem Docker testado localmente
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados acessível do EC2
- [ ] Security groups configurados (porta 9000, PostgreSQL)
- [ ] Certificado SSL do RDS baixado (se usando SSL)

### Deploy

- [ ] Container/processo iniciado
- [ ] Logs mostram "✅ Database is ready!"
- [ ] Logs mostram "✅ Migrations completed successfully"
- [ ] Logs mostram "Server started on port 9000"
- [ ] Health check respondendo: `curl http://localhost:9000/health`

### Pós-Deploy

- [ ] Verificar que APIs estão respondendo
- [ ] Verificar logs não têm erros críticos
- [ ] Configurar monitoramento (CloudWatch, PM2, etc)
- [ ] Configurar backup automático de logs

---

## 📊 Monitoramento

### Verificar Status

```bash
# Docker
docker logs -f ysh-backend --tail 100

# PM2
pm2 logs ysh-backend --lines 100

# Journalctl (systemd)
journalctl -u ysh-backend -f
```

### Health Checks

```bash
# Basic health
curl http://localhost:9000/health

# Detalhado (se disponível)
curl http://localhost:9000/store/health
```

---

## 🔄 Rollback

### Se deployment falhar

```bash
# Docker - voltar para versão anterior
docker stop ysh-backend
docker rm ysh-backend
docker run -d --name ysh-backend ysh-backend:previous-tag

# PM2 - restart
pm2 restart ysh-backend

# Node direto - reverter git
git checkout previous-commit
npm install
./entrypoint.sh npm start
```

---

## 📝 Logs Importantes

### Durante Inicialização (Sucesso)

```
🚀 Medusa Backend Entrypoint
============================
Environment: production

⏳ Waiting for database to be ready...
✅ Database is ready!

🔄 Running database migrations...
✅ Migrations completed successfully

🎯 Starting application: npm start
```

### Durante Inicialização (Com Warning)

```
🔄 Running database migrations...
⚠️  Migration command failed
⚠️  Continuing despite migration failure (FAIL_ON_MIGRATION_ERROR not set)

🎯 Starting application: npm start
```

---

## 🎯 Melhores Práticas

1. **Sempre usar `FAIL_ON_MIGRATION_ERROR=true` em produção**
   - Previne servidor iniciar com schema desatualizado

2. **Monitorar logs de migração**
   - Configurar alertas se migrações falharem

3. **Testar migrações antes de deploy**
   - Rodar em staging environment primeiro

4. **Manter backups do banco antes de deploy**
   - Permite rollback rápido se necessário

5. **Usar tags de versão nas imagens Docker**
   - Facilita rollback e tracking

---

**Última atualização:** 2025-10-13  
**Documentos relacionados:**

- `Dockerfile` - Container de produção
- `Dockerfile.dev` - Container de desenvolvimento  
- `entrypoint.sh` - Script universal de inicialização
- `package.json` - Scripts npm disponíveis
