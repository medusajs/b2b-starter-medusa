# 🔐 AWS Secrets Management - Guia Prático

**Data:** 13 de Outubro, 2025  
**Status:** ✅ Produção Ready

---

## 📋 Visão Geral

Este guia documenta como gerenciar secrets de forma segura usando AWS Secrets Manager para o YSH Backend.

---

## 🎯 Estratégia de Secrets

### Hierarquia de Secrets

```
ysh-backend/
├── production/
│   ├── database       # Credenciais do RDS PostgreSQL
│   ├── api-keys       # JWT, Cookie, OpenAI, Qdrant
│   ├── s3             # AWS S3 credentials
│   └── redis          # Redis credentials (opcional)
├── staging/
│   └── ... (mesma estrutura)
└── development/
    └── ... (mesma estrutura)
```

---

## 🔑 Secrets Necessários

### 1. Database Credentials

**Nome:** `ysh-backend/{environment}/database`

```json
{
  "host": "ysh-db-production.xxxxx.us-east-1.rds.amazonaws.com",
  "port": "5432",
  "database": "yshdb",
  "username": "ysh_app",
  "password": "GENERATED_STRONG_PASSWORD"
}
```

**Geração de Password Segura:**

```bash
# Gerar password de 32 caracteres
openssl rand -base64 32
```

### 2. API Keys & Secrets

**Nome:** `ysh-backend/{environment}/api-keys`

```json
{
  "jwt_secret": "GENERATED_JWT_SECRET_64_CHARS",
  "cookie_secret": "GENERATED_COOKIE_SECRET_64_CHARS",
  "openai_api_key": "sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "qdrant_api_key": "YOUR_QDRANT_API_KEY_OR_EMPTY_FOR_LOCAL",
  "qdrant_url": "https://your-cluster.qdrant.io"
}
```

**Geração de JWT/Cookie Secrets:**

```bash
# Gerar JWT secret (64 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Gerar Cookie secret (64 caracteres)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**OpenAI API Key:**

- Obter em: <https://platform.openai.com/api-keys>
- Formato: `sk-proj-...` (48+ caracteres)

**Qdrant API Key:**

- Cloud: <https://cloud.qdrant.io/> (criar cluster e API key)
- Self-hosted: Deixar vazio ou usar seu próprio sistema de auth

### 3. S3 Credentials

**Nome:** `ysh-backend/{environment}/s3`

```json
{
  "access_key_id": "AKIAIOSFODNN7EXAMPLE",
  "secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "bucket": "ysh-media-production",
  "region": "us-east-1",
  "public_url": "https://ysh-media-production.s3.us-east-1.amazonaws.com"
}
```

**Criar IAM User para S3:**

```bash
# 1. Criar user
aws iam create-user --user-name ysh-s3-backend

# 2. Criar policy
cat > ysh-s3-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::ysh-media-production",
        "arn:aws:s3:::ysh-media-production/*"
      ]
    }
  ]
}
EOF

aws iam create-policy \
  --policy-name YSHBackendS3Access \
  --policy-document file://ysh-s3-policy.json

# 3. Anexar policy ao user
aws iam attach-user-policy \
  --user-name ysh-s3-backend \
  --policy-arn arn:aws:iam::ACCOUNT_ID:policy/YSHBackendS3Access

# 4. Criar access key
aws iam create-access-key --user-name ysh-s3-backend

# Output será access_key_id e secret_access_key - SALVE COM SEGURANÇA!
```

### 4. Redis Credentials (Opcional)

**Nome:** `ysh-backend/{environment}/redis`

```json
{
  "host": "ysh-redis.xxxxx.cache.amazonaws.com",
  "port": "6379",
  "password": "REDIS_AUTH_TOKEN",
  "tls": "true"
}
```

---

## 🚀 Criar Secrets no AWS

### Script Automatizado

Use o script `scripts/aws/create-secrets.sh`:

```bash
# Production
./scripts/aws/create-secrets.sh production

# Staging
./scripts/aws/create-secrets.sh staging

# Development
./scripts/aws/create-secrets.sh development
```

### Comandos Manuais

#### Production Environment

```bash
# 1. Database
aws secretsmanager create-secret \
  --name ysh-backend/production/database \
  --description "YSH Backend Production Database Credentials" \
  --secret-string '{
    "host": "ysh-db-production.xxxxx.us-east-1.rds.amazonaws.com",
    "port": "5432",
    "database": "yshdb",
    "username": "ysh_app",
    "password": "CHANGE_ME"
  }' \
  --tags Key=Environment,Value=production Key=Application,Value=ysh-backend

# 2. API Keys
aws secretsmanager create-secret \
  --name ysh-backend/production/api-keys \
  --description "YSH Backend Production API Keys" \
  --secret-string '{
    "jwt_secret": "GENERATE_64_CHAR_HEX",
    "cookie_secret": "GENERATE_64_CHAR_HEX",
    "openai_api_key": "sk-proj-...",
    "qdrant_api_key": "YOUR_KEY",
    "qdrant_url": "https://xxxxx.qdrant.io"
  }' \
  --tags Key=Environment,Value=production Key=Application,Value=ysh-backend

# 3. S3
aws secretsmanager create-secret \
  --name ysh-backend/production/s3 \
  --description "YSH Backend Production S3 Credentials" \
  --secret-string '{
    "access_key_id": "AKIAXXXXXXXXXX",
    "secret_access_key": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "bucket": "ysh-media-production",
    "region": "us-east-1",
    "public_url": "https://ysh-media-production.s3.us-east-1.amazonaws.com"
  }' \
  --tags Key=Environment,Value=production Key=Application,Value=ysh-backend
```

---

## 📥 Carregar Secrets no EC2

### Script de Load (Integrado ao Deployment)

O arquivo `/opt/ysh/load-secrets.sh` já está integrado ao entrypoint:

```bash
#!/bin/bash
set -e

echo "🔐 Loading secrets from AWS Secrets Manager..."

# Configurar região
export AWS_DEFAULT_REGION=us-east-1

# Função helper
get_secret() {
    aws secretsmanager get-secret-value \
        --secret-id "$1" \
        --query SecretString \
        --output text 2>/dev/null
}

# Buscar secrets
DB_SECRET=$(get_secret "ysh-backend/production/database")
API_SECRET=$(get_secret "ysh-backend/production/api-keys")
S3_SECRET=$(get_secret "ysh-backend/production/s3")

# Parse JSON e exportar
if [ -n "$DB_SECRET" ]; then
    export DATABASE_HOST=$(echo $DB_SECRET | jq -r .host)
    export DATABASE_PORT=$(echo $DB_SECRET | jq -r .port)
    export DATABASE_NAME=$(echo $DB_SECRET | jq -r .database)
    export DATABASE_USER=$(echo $DB_SECRET | jq -r .username)
    export DATABASE_PASS=$(echo $DB_SECRET | jq -r .password)
    export DATABASE_URL="postgresql://${DATABASE_USER}:${DATABASE_PASS}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}"
    export DATABASE_SSL="true"
fi

if [ -n "$API_SECRET" ]; then
    export JWT_SECRET=$(echo $API_SECRET | jq -r .jwt_secret)
    export COOKIE_SECRET=$(echo $API_SECRET | jq -r .cookie_secret)
    export OPENAI_API_KEY=$(echo $API_SECRET | jq -r .openai_api_key)
    export QDRANT_API_KEY=$(echo $API_SECRET | jq -r .qdrant_api_key)
    export QDRANT_URL=$(echo $API_SECRET | jq -r .qdrant_url)
fi

if [ -n "$S3_SECRET" ]; then
    export FILE_S3_ACCESS_KEY_ID=$(echo $S3_SECRET | jq -r .access_key_id)
    export FILE_S3_SECRET_ACCESS_KEY=$(echo $S3_SECRET | jq -r .secret_access_key)
    export FILE_S3_BUCKET=$(echo $S3_SECRET | jq -r .bucket)
    export FILE_S3_REGION=$(echo $S3_SECRET | jq -r .region)
    export FILE_S3_URL=$(echo $S3_SECRET | jq -r .public_url)
fi

# Variáveis fixas
export NODE_ENV="production"
export PORT="9000"
export HOST="0.0.0.0"

echo "✅ Secrets loaded successfully"
```

### Uso em Docker

```bash
# Build with secrets loading
docker run -d \
  --name ysh-backend \
  -p 9000:9000 \
  -v /opt/ysh/load-secrets.sh:/load-secrets.sh:ro \
  --entrypoint /bin/bash \
  ysh-backend:latest \
  -c "source /load-secrets.sh && exec /app/entrypoint.sh npm start"
```

### Uso em Systemd

Já configurado em `/etc/systemd/system/ysh-backend.service`:

```ini
[Service]
ExecStartPre=/opt/ysh/load-secrets.sh
```

---

## 🔄 Atualizar Secrets

### Via Console AWS

1. Acesse AWS Secrets Manager
2. Selecione o secret
3. Clique em "Retrieve secret value"
4. Clique em "Edit"
5. Atualize os valores
6. Salve

### Via CLI

```bash
# Atualizar secret completo
aws secretsmanager update-secret \
  --secret-id ysh-backend/production/database \
  --secret-string '{
    "host": "new-host.rds.amazonaws.com",
    "port": "5432",
    "database": "yshdb",
    "username": "ysh_app",
    "password": "NEW_PASSWORD"
  }'

# Atualizar apenas password
CURRENT=$(aws secretsmanager get-secret-value \
  --secret-id ysh-backend/production/database \
  --query SecretString --output text)

NEW=$(echo $CURRENT | jq '.password = "NEW_PASSWORD"')

aws secretsmanager update-secret \
  --secret-id ysh-backend/production/database \
  --secret-string "$NEW"
```

### Rotação Automática (RDS)

```bash
# Habilitar rotação automática para RDS
aws secretsmanager rotate-secret \
  --secret-id ysh-backend/production/database \
  --rotation-lambda-arn arn:aws:lambda:us-east-1:123456789:function:SecretsManagerRDSPostgreSQLRotationSingleUser \
  --rotation-rules AutomaticallyAfterDays=30
```

---

## 🔍 Verificar Secrets

### Listar Secrets

```bash
# Listar todos os secrets do backend
aws secretsmanager list-secrets \
  --filters Key=name,Values=ysh-backend/

# Listar secrets de production
aws secretsmanager list-secrets \
  --filters Key=tag-key,Values=Environment Key=tag-value,Values=production
```

### Ver Valor de Secret

```bash
# Ver secret completo
aws secretsmanager get-secret-value \
  --secret-id ysh-backend/production/database

# Ver apenas o valor (JSON)
aws secretsmanager get-secret-value \
  --secret-id ysh-backend/production/database \
  --query SecretString \
  --output text | jq .

# Extrair campo específico
aws secretsmanager get-secret-value \
  --secret-id ysh-backend/production/database \
  --query SecretString \
  --output text | jq -r .password
```

### Testar Secrets no EC2

```bash
# SSH no EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Carregar secrets manualmente
source /opt/ysh/load-secrets.sh

# Verificar variáveis
echo $DATABASE_URL
echo $JWT_SECRET
echo $FILE_S3_BUCKET

# Testar conexão com database
psql "$DATABASE_URL" -c "SELECT version();"

# Testar acesso S3
aws s3 ls s3://$FILE_S3_BUCKET/
```

---

## 🔒 Segurança e Boas Práticas

### 1. Princípio do Menor Privilégio

**IAM Policy para EC2:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": [
        "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:ysh-backend/production/*"
      ]
    }
  ]
}
```

**Não permitir:**

- ❌ `secretsmanager:*` (muito permissivo)
- ❌ `secretsmanager:CreateSecret`
- ❌ `secretsmanager:DeleteSecret`
- ❌ `secretsmanager:PutSecretValue`

### 2. Encryption at Rest

Todos os secrets são automaticamente encriptados com AWS KMS:

```bash
# Usar KMS key customizada (opcional)
aws secretsmanager create-secret \
  --name ysh-backend/production/database \
  --kms-key-id arn:aws:kms:us-east-1:123456789:key/xxxxx \
  --secret-string '...'
```

### 3. Auditoria com CloudTrail

```bash
# Ver quem acessou secrets
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=ResourceName,AttributeValue=ysh-backend/production/database \
  --max-items 50
```

### 4. Rotação Regular

**Cronograma recomendado:**

- 🔄 Database passwords: 30 dias
- 🔄 API keys: 90 dias
- 🔄 JWT/Cookie secrets: 180 dias

### 5. Backup de Secrets

```bash
# Backup de todos os secrets
for secret in $(aws secretsmanager list-secrets \
  --filters Key=name,Values=ysh-backend/ \
  --query 'SecretList[].Name' --output text); do
  
  echo "Backing up $secret..."
  aws secretsmanager get-secret-value \
    --secret-id "$secret" \
    --query SecretString \
    --output text > "backup-$(basename $secret).json"
done

# Encriptar backups
tar czf secrets-backup-$(date +%Y%m%d).tar.gz backup-*.json
gpg --encrypt --recipient your-email@example.com secrets-backup-*.tar.gz

# Deletar arquivos não encriptados
rm backup-*.json secrets-backup-*.tar.gz
```

### 6. Alertas de Acesso

```bash
# Criar alarme para acessos incomuns
aws cloudwatch put-metric-alarm \
  --alarm-name ysh-secrets-high-access \
  --alarm-description "Alert on high number of secret accesses" \
  --metric-name SecretsManagerApiCallCount \
  --namespace AWS/SecretsManager \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold
```

---

## 🆘 Troubleshooting

### Erro: Access Denied

```bash
# Verificar IAM role do EC2
aws sts get-caller-identity

# Verificar permissões
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789:role/YSHBackendEC2Role \
  --action-names secretsmanager:GetSecretValue \
  --resource-arns arn:aws:secretsmanager:us-east-1:123456789:secret:ysh-backend/production/database
```

**Solução:** Anexar policy correta ao role do EC2

### Erro: Secret Not Found

```bash
# Listar secrets disponíveis
aws secretsmanager list-secrets

# Verificar nome exato
aws secretsmanager describe-secret \
  --secret-id ysh-backend/production/database
```

**Solução:** Criar secret ou corrigir nome

### Erro: Invalid JSON in Secret

```bash
# Validar JSON
aws secretsmanager get-secret-value \
  --secret-id ysh-backend/production/database \
  --query SecretString \
  --output text | jq .
```

**Solução:** Corrigir formato JSON no secret

### Secrets Não Carregando no Container

```bash
# Debug mode
docker run --rm \
  -v /opt/ysh/load-secrets.sh:/load-secrets.sh:ro \
  ysh-backend:latest \
  /bin/bash -c "set -x; source /load-secrets.sh; env | grep -E '(DATABASE|JWT|S3)'"
```

---

## 📚 Referências

### AWS Documentation

- [Secrets Manager Best Practices](https://docs.aws.amazon.com/secretsmanager/latest/userguide/best-practices.html)
- [Rotating Secrets](https://docs.aws.amazon.com/secretsmanager/latest/userguide/rotating-secrets.html)
- [IAM Policies for Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/reference_iam-permissions.html)

### Arquivos Relacionados

- `docs/AWS_DEPLOYMENT_COMPLETE_GUIDE.md` - Guia completo de deployment
- `scripts/aws/create-secrets.sh` - Script para criar secrets
- `scripts/aws/load-secrets.sh` - Script para carregar secrets
- `.env.template` - Template de variáveis de ambiente

---

**Última atualização:** 13/10/2025  
**Versão:** 1.0  
**Autor:** DevOps Team
