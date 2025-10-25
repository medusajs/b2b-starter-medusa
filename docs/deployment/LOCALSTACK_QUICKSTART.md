# 🏗️ LocalStack Pro Quick Start

**Objetivo**: Emular AWS localmente para dev/staging  
**Economia**: $200-500/mês vs. AWS real  
**Tempo**: 15 minutos

---

## 1) Pré-requisitos

```bash
# Docker + Docker Compose
docker --version  # >= 24.0
docker-compose --version  # >= 2.20

# LocalStack CLI
pip install localstack[pro]

# AWS CLI (para testes)
pip install awscli awscli-local
```

---

## 2) Obter Licença LocalStack Pro

1. Cadastre-se em: <https://localstack.cloud/pricing>
2. Escolha plano **Pro** ($35-45/user/month)
3. Copie `LOCALSTACK_AUTH_TOKEN` do dashboard

---

## 3) Configurar Token

**Windows (PowerShell)**:

```powershell
# Adicionar ao perfil ou .env
$env:LOCALSTACK_AUTH_TOKEN="ls-xxxx-yyyy-zzzz"

# Ou criar .env na raiz do projeto
@"
LOCALSTACK_AUTH_TOKEN=ls-xxxx-yyyy-zzzz
"@ | Out-File -FilePath .env -Encoding utf8
```

**Linux/Mac**:

```bash
# Adicionar ao ~/.bashrc ou ~/.zshrc
export LOCALSTACK_AUTH_TOKEN="ls-xxxx-yyyy-zzzz"

# Ou criar .env
echo 'LOCALSTACK_AUTH_TOKEN=ls-xxxx-yyyy-zzzz' > .env
```

---

## 4) Iniciar LocalStack

```bash
# Start services
docker-compose -f docker-compose.localstack.yml up -d

# Verificar status
docker-compose -f docker-compose.localstack.yml ps

# Logs
docker-compose -f docker-compose.localstack.yml logs -f localstack
```

**Esperar ~30 segundos** até ver:

```
Ready. ✓
```

---

## 5) Verificar Health

```bash
# Health check
curl http://localhost:4566/_localstack/health

# Deve retornar:
{
  "services": {
    "s3": "available",
    "rds": "available",
    "elasticache": "available",
    "secretsmanager": "available",
    ...
  }
}
```

---

## 6) Comandos Úteis

### 6.1 S3

```bash
# Criar bucket
awslocal s3 mb s3://ysh-uploads

# Listar buckets
awslocal s3 ls

# Upload file
awslocal s3 cp image.jpg s3://ysh-uploads/products/

# Download file
awslocal s3 cp s3://ysh-uploads/products/image.jpg ./
```

### 6.2 Secrets Manager

```bash
# Criar secret
awslocal secretsmanager create-secret \
  --name /ysh-b2b/database-url \
  --secret-string "postgres://user:pass@postgres:5432/medusa_db"

# Listar secrets
awslocal secretsmanager list-secrets

# Get secret value
awslocal secretsmanager get-secret-value \
  --secret-id /ysh-b2b/database-url \
  --query SecretString \
  --output text
```

### 6.3 ECR

```bash
# Login to ECR
awslocal ecr get-login-password | docker login \
  --username AWS \
  --password-stdin \
  localhost:4510

# Tag image
docker tag ysh-b2b-backend:latest \
  localhost:4510/ysh-b2b-backend:latest

# Push image
docker push localhost:4510/ysh-b2b-backend:latest
```

### 6.4 CloudWatch Logs

```bash
# Create log group
awslocal logs create-log-group --log-group-name /ecs/ysh-b2b-backend

# List log streams
awslocal logs describe-log-streams \
  --log-group-name /ecs/ysh-b2b-backend

# Tail logs
awslocal logs tail /ecs/ysh-b2b-backend --follow
```

### 6.5 SNS/SQS

```bash
# Create topic
awslocal sns create-topic --name ysh-alerts

# Create queue
awslocal sqs create-queue --queue-name ysh-jobs

# Send message
awslocal sqs send-message \
  --queue-url http://localhost:4566/000000000000/ysh-jobs \
  --message-body "Test job"

# Receive message
awslocal sqs receive-message \
  --queue-url http://localhost:4566/000000000000/ysh-jobs
```

---

## 7) Acessar Aplicação

```bash
# Backend (Medusa.js)
curl http://localhost:9000/health

# Storefront (Next.js)
curl http://localhost:8000

# Admin (Medusa Admin)
open http://localhost:9000/app
```

---

## 8) Testar Integração Backend → LocalStack

```bash
# Entrar no container backend
docker exec -it ysh-backend-localstack sh

# Testar S3
npm install @aws-sdk/client-s3
node -e "
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
const client = new S3Client({
  endpoint: 'http://localstack:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
});
client.send(new ListBucketsCommand({})).then(console.log);
"

# Testar Secrets Manager
node -e "
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const client = new SecretsManagerClient({
  endpoint: 'http://localstack:4566',
  region: 'us-east-1',
  credentials: { accessKeyId: 'test', secretAccessKey: 'test' }
});
client.send(new GetSecretValueCommand({ SecretId: '/ysh-b2b/database-url' })).then(console.log);
"
```

---

## 9) Parar e Limpar

```bash
# Parar containers
docker-compose -f docker-compose.localstack.yml down

# Limpar volumes (CUIDADO: apaga dados)
docker-compose -f docker-compose.localstack.yml down -v

# Remover tudo (containers + volumes + networks)
docker-compose -f docker-compose.localstack.yml down -v --remove-orphans
```

---

## 10) Troubleshooting

### Problema: "Token inválido"

```bash
# Verificar token
echo $LOCALSTACK_AUTH_TOKEN

# Re-login
localstack auth login
```

### Problema: "Service not available"

```bash
# Verificar serviços habilitados
docker-compose -f docker-compose.localstack.yml logs localstack | grep SERVICES

# Adicionar serviço faltante (ex.: lambda)
# Editar docker-compose.localstack.yml:
# SERVICES=s3,rds,elasticache,secretsmanager,ecs,ecr,cloudwatch,sns,sqs,lambda
```

### Problema: "Out of memory"

```bash
# Aumentar memória Docker (Docker Desktop)
# Settings → Resources → Memory: 8GB

# Ou reduzir serviços LocalStack:
# SERVICES=s3,secretsmanager
```

### Problema: "Postgres connection refused"

```bash
# Verificar container rodando
docker ps | grep postgres

# Testar conexão
docker exec -it ysh-postgres-localstack psql -U medusa_user -d medusa_db -c '\l'

# Verificar DATABASE_URL no backend
docker exec -it ysh-backend-localstack env | grep DATABASE_URL
```

---

## 11) LocalStack vs. AWS Real

| Feature | LocalStack Pro | AWS Real |
|---------|---------------|----------|
| **S3** | ✅ Full support | ✅ Full support |
| **RDS** | ⚠️ Postgres via Docker | ✅ Managed RDS |
| **ElastiCache** | ⚠️ Redis via Docker | ✅ Managed ElastiCache |
| **Secrets Manager** | ✅ Full support | ✅ Full support |
| **ECS** | ⚠️ Limited (local containers) | ✅ Full ECS Fargate |
| **Lambda** | ✅ Full support | ✅ Full support |
| **CloudWatch** | ✅ Logs + Metrics | ✅ Full monitoring |
| **Cost** | $35-45/user/month | $200-500+/month |
| **Performance** | Local (fast) | Network latency |
| **Offline** | ✅ Works offline | ❌ Requires internet |

**Recomendação**: LocalStack Pro para **dev/staging**, AWS Real para **production**.

---

## 12) Próximos Passos

1. ✅ LocalStack rodando localmente
2. ✅ Backend + Storefront conectados
3. ✅ S3, Secrets Manager, ECR disponíveis
4. ⏭️ Configurar Terraform para provisionar LocalStack
5. ⏭️ Criar CI/CD para deploy em LocalStack (staging)
6. ⏭️ Migrar para AWS real (production)

---

**Links Úteis**:

- [LocalStack Docs](https://docs.localstack.cloud)
- [LocalStack Pro Features](https://localstack.cloud/pricing)
- [AWS CLI Local (awslocal)](https://github.com/localstack/awscli-local)
- [LocalStack Samples](https://github.com/localstack/localstack-pro-samples)

**Dúvidas?** Verifique logs: `docker-compose -f docker-compose.localstack.yml logs -f`
