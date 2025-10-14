# ==========================================

# YSH B2B Platform - Full Stack OSS

# Quick Start Guide

# ==========================================

## 🚀 Stack Completa

### Serviços Incluídos

- **PostgreSQL 15** - Database (porta 5432)
- **Redis 7** - Cache & Sessions (porta 6379)
- **Medusa Backend** - API & Admin (portas 9000-9002)
- **Next.js Storefront** - Frontend (porta 8000)
- **Nginx** - Reverse Proxy (porta 80)
- **Adminer** - DB Management UI (porta 8080)
- **Redis Commander** - Redis UI (porta 8081)

### Recursos AWS Free Tier Equivalentes

- RDS db.t4g.micro (750h/mês)
- ElastiCache cache.t4g.micro (750h/mês)
- S3 Standard (5GB + 20k GET + 2k PUT)
- ALB (750h/mês + 15GB processado)
- ECS Fargate Spot (até 70% economia)

## 📋 Pré-requisitos

- Docker 24.0+ com Docker Compose
- 8GB RAM mínimo (16GB recomendado)
- 20GB espaço em disco

## 🔧 Instalação e Configuração

### 1. Clonar e Configurar Variáveis de Ambiente

```powershell
# Copiar arquivo de exemplo
Copy-Item .env.example .env

# Editar .env com suas configurações
notepad .env
```

### 2. Gerar Secrets de Produção

```powershell
# JWT Secret (mínimo 32 caracteres)
$JWT_SECRET = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "JWT_SECRET=$JWT_SECRET"

# Cookie Secret (mínimo 32 caracteres)
$COOKIE_SECRET = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host "COOKIE_SECRET=$COOKIE_SECRET"

# Adicionar ao .env
Add-Content .env "JWT_SECRET=$JWT_SECRET"
Add-Content .env "COOKIE_SECRET=$COOKIE_SECRET"
```

### 3. Iniciar Stack Completa

```powershell
# Iniciar todos os serviços
docker-compose -f docker-compose.full-stack.yml up -d

# Ver logs
docker-compose -f docker-compose.full-stack.yml logs -f

# Ver status
docker-compose -f docker-compose.full-stack.yml ps
```

### 4. Aguardar Inicialização

```powershell
# Verificar health checks
docker-compose -f docker-compose.full-stack.yml ps

# Aguardar até todos mostrarem "healthy"
# Backend: ~60s
# Storefront: ~60s
# PostgreSQL: ~10s
# Redis: ~5s
```

### 5. Executar Migrações e Seed

```powershell
# Executar migrações do Medusa
docker-compose -f docker-compose.full-stack.yml exec backend npm run medusa db:migrate

# Executar seed (dados de exemplo)
docker-compose -f docker-compose.full-stack.yml exec backend npm run seed

# Criar usuário admin
docker-compose -f docker-compose.full-stack.yml exec backend npm run medusa user -- -e admin@yellosolar.com -p supersecret123 -i admin
```

### 6. Obter Publishable Key

```powershell
# Conectar ao banco e pegar a key
docker-compose -f docker-compose.full-stack.yml exec postgres psql -U yshuser -d yshdb -c "SELECT id FROM publishable_api_key LIMIT 1;"

# Ou usar Adminer: http://localhost:8080
# Server: postgres
# Username: yshuser
# Password: yshpass
# Database: yshdb
# Query: SELECT id FROM publishable_api_key;

# Adicionar ao .env
# NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx
```

## 🌐 Acessar Aplicação

### URLs Locais

- **Storefront**: <http://localhost:8000> ou <http://localhost>
- **Backend API**: <http://localhost:9000>
- **Admin Dashboard**: <http://localhost:9000/app>
- **Adminer (DB)**: <http://localhost:8080>
- **Redis Commander**: <http://localhost:8081>

### Credenciais Padrão

- **Admin**: <admin@yellosolar.com> / supersecret123
- **Adminer**: postgres / yshuser / yshpass
- **Redis Commander**: admin / admin

## 🛠️ Comandos Úteis

### Gerenciamento de Serviços

```powershell
# Parar todos os serviços
docker-compose -f docker-compose.full-stack.yml stop

# Iniciar serviços parados
docker-compose -f docker-compose.full-stack.yml start

# Reiniciar serviço específico
docker-compose -f docker-compose.full-stack.yml restart backend

# Parar e remover containers (preserva volumes)
docker-compose -f docker-compose.full-stack.yml down

# Parar e remover tudo (incluindo volumes)
docker-compose -f docker-compose.full-stack.yml down -v
```

### Logs e Debugging

```powershell
# Ver logs de todos os serviços
docker-compose -f docker-compose.full-stack.yml logs -f

# Logs de serviço específico
docker-compose -f docker-compose.full-stack.yml logs -f backend

# Últimas 100 linhas
docker-compose -f docker-compose.full-stack.yml logs --tail=100 backend

# Executar comando no container
docker-compose -f docker-compose.full-stack.yml exec backend sh
docker-compose -f docker-compose.full-stack.yml exec storefront sh
```

### Database Operations

```powershell
# Conectar ao PostgreSQL
docker-compose -f docker-compose.full-stack.yml exec postgres psql -U yshuser -d yshdb

# Backup do banco
docker-compose -f docker-compose.full-stack.yml exec postgres pg_dump -U yshuser yshdb > backup.sql

# Restaurar backup
Get-Content backup.sql | docker-compose -f docker-compose.full-stack.yml exec -T postgres psql -U yshuser -d yshdb

# Ver tabelas
docker-compose -f docker-compose.full-stack.yml exec postgres psql -U yshuser -d yshdb -c "\dt"
```

### Redis Operations

```powershell
# Conectar ao Redis CLI
docker-compose -f docker-compose.full-stack.yml exec redis redis-cli

# Ver todas as keys
docker-compose -f docker-compose.full-stack.yml exec redis redis-cli KEYS "*"

# Limpar cache
docker-compose -f docker-compose.full-stack.yml exec redis redis-cli FLUSHALL
```

### Build e Atualização

```powershell
# Rebuild de serviço específico
docker-compose -f docker-compose.full-stack.yml up -d --build backend

# Rebuild completo
docker-compose -f docker-compose.full-stack.yml up -d --build

# Pull de imagens atualizadas
docker-compose -f docker-compose.full-stack.yml pull
```

## 📊 Monitoramento

### Health Checks

```powershell
# Verificar status de todos os serviços
docker-compose -f docker-compose.full-stack.yml ps

# Health check manual
curl http://localhost:9000/health
curl http://localhost:8000/
curl http://localhost/health
```

### Resource Usage

```powershell
# Ver uso de recursos
docker stats

# Uso de disco
docker system df

# Limpar recursos não utilizados
docker system prune -a
```

## 🚀 Deploy para AWS (Free Tier)

### 1. Configurar AWS CLI

```powershell
# Instalar AWS CLI
winget install Amazon.AWSCLI

# Configurar credenciais
aws configure
```

### 2. Deploy com CloudFormation

```powershell
# Validar template
aws cloudformation validate-template --template-body file://aws/cloudformation-free-tier.yml

# Criar stack
aws cloudformation create-stack `
  --stack-name ysh-b2b-production `
  --template-body file://aws/cloudformation-free-tier.yml `
  --parameters `
    ParameterKey=Environment,ParameterValue=production `
    ParameterKey=DBMasterUsername,ParameterValue=medusa_user `
    ParameterKey=DBMasterPassword,ParameterValue=YourSecurePassword123 `
    ParameterKey=MedusaJWTSecret,ParameterValue=$JWT_SECRET `
    ParameterKey=MedusaCookieSecret,ParameterValue=$COOKIE_SECRET `
  --capabilities CAPABILITY_NAMED_IAM

# Acompanhar criação
aws cloudformation describe-stacks --stack-name ysh-b2b-production
aws cloudformation wait stack-create-complete --stack-name ysh-b2b-production
```

### 3. Deploy de Containers no ECS

```powershell
# Build e push das imagens
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Backend
docker build -t ysh-backend:latest -f backend/Dockerfile backend/
docker tag ysh-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest

# Storefront
docker build -t ysh-storefront:latest -f storefront/Dockerfile storefront/
docker tag ysh-storefront:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:latest
```

## 🔒 Segurança

### Checklist de Produção

- [ ] Alterar senhas padrão do .env
- [ ] Gerar JWT_SECRET e COOKIE_SECRET únicos
- [ ] Configurar HTTPS com certificado SSL
- [ ] Habilitar firewall e limitar portas
- [ ] Configurar backup automático do PostgreSQL
- [ ] Habilitar monitoring com CloudWatch
- [ ] Configurar alertas de erro
- [ ] Revisar CORS domains
- [ ] Habilitar rate limiting no Nginx
- [ ] Configurar AWS WAF (opcional, fora do free tier)

## 📈 Otimizações de Performance

### PostgreSQL

```sql
-- Ver queries lentas
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Vacuum e análise
VACUUM ANALYZE;
```

### Redis

```bash
# Ver estatísticas
redis-cli INFO stats

# Ver memória
redis-cli INFO memory
```

### Next.js

```powershell
# Build otimizado
cd storefront
npm run build
npm run start
```

## 🆘 Troubleshooting

### Backend não inicia

```powershell
# Ver logs detalhados
docker-compose -f docker-compose.full-stack.yml logs backend

# Verificar conexão com DB
docker-compose -f docker-compose.full-stack.yml exec backend npm run medusa db:migrate

# Limpar cache e reiniciar
docker-compose -f docker-compose.full-stack.yml down
docker volume rm ysh-postgres-data
docker-compose -f docker-compose.full-stack.yml up -d
```

### Storefront com erro 500

```powershell
# Verificar variáveis de ambiente
docker-compose -f docker-compose.full-stack.yml exec storefront env | grep NEXT_PUBLIC

# Verificar publishable key
docker-compose -f docker-compose.full-stack.yml exec postgres psql -U yshuser -d yshdb -c "SELECT * FROM publishable_api_key;"

# Rebuild
docker-compose -f docker-compose.full-stack.yml up -d --build storefront
```

### Porta em uso

```powershell
# Encontrar processo usando porta
Get-NetTCPConnection -LocalPort 8000

# Matar processo
Stop-Process -Id <PID> -Force
```

## 📚 Recursos Adicionais

- [Documentação Medusa.js](https://docs.medusajs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [AWS Free Tier](https://aws.amazon.com/free)
- [Docker Documentation](https://docs.docker.com)

## 🤝 Suporte

Para problemas ou dúvidas:

1. Verificar logs: `docker-compose logs -f`
2. Consultar documentação
3. Abrir issue no repositório
