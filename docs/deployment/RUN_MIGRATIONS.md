# Execute Database Migrations - ECS Fargate Task

Este script executa `medusa db:migrate` em uma task ECS Fargate one-time.

## 🎯 Objetivo

Criar as tabelas do banco de dados PostgreSQL RDS antes de iniciar o serviço backend.

## 📋 Pré-requisitos

1. ✅ Task definition `ysh-b2b-backend-migrations` registrada no ECS
2. ✅ Image v1.0.2 disponível no ECR
3. ✅ Secrets Manager configurado
4. ✅ Security Groups permitem acesso PostgreSQL (5432) e Redis (6379)

## 🚀 Execução

### Passo 1: Registrar Task Definition

```bash
aws ecs register-task-definition \
  --cli-input-json file://aws/backend-migrations-task-definition.json \
  --region us-east-1 \
  --profile ysh-production
```

**Resultado esperado**:

```json
{
  "taskDefinition": {
    "family": "ysh-b2b-backend-migrations",
    "revision": 1,
    "status": "ACTIVE",
    ...
  }
}
```

### Passo 2: Obter Network Configuration

```bash
# Listar serviço backend para obter subnets e security groups
aws ecs describe-services \
  --cluster production-ysh-b2b-cluster \
  --services ysh-b2b-backend \
  --region us-east-1 \
  --profile ysh-production \
  --query 'services[0].networkConfiguration.awsvpcConfiguration.[subnets,securityGroups]' \
  --output json
```

**Exemplo de resultado**:

```json
[
  ["subnet-0123456789abcdef0", "subnet-0fedcba9876543210"],
  ["sg-0123456789abcdef0"]
]
```

### Passo 3: Executar Migrations Task

**Substituir `SUBNET_1`, `SUBNET_2`, e `SECURITY_GROUP_ID` com valores do Passo 2**:

```bash
aws ecs run-task \
  --cluster production-ysh-b2b-cluster \
  --task-definition ysh-b2b-backend-migrations:1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[SUBNET_1,SUBNET_2],securityGroups=[SECURITY_GROUP_ID],assignPublicIp=DISABLED}" \
  --region us-east-1 \
  --profile ysh-production
```

**Resultado esperado**:

```json
{
  "tasks": [
    {
      "taskArn": "arn:aws:ecs:us-east-1:773235999227:task/production-ysh-b2b-cluster/abcd1234...",
      "lastStatus": "PROVISIONING",
      ...
    }
  ]
}
```

**Anotar o Task ARN** para monitoramento.

### Passo 4: Monitorar Task

```bash
# Extrair Task ID do ARN (últimos caracteres após última /)
TASK_ID="abcd1234..."  # Substituir com task ID real

# Verificar status
aws ecs describe-tasks \
  --cluster production-ysh-b2b-cluster \
  --tasks $TASK_ID \
  --region us-east-1 \
  --profile ysh-production \
  --query 'tasks[0].[lastStatus,stoppedReason,containers[0].exitCode]' \
  --output json
```

**Status esperados**:

- `PROVISIONING` → Task sendo criada
- `PENDING` → Aguardando recursos
- `RUNNING` → Migrations executando
- `STOPPED` → Completado (verificar exitCode)

### Passo 5: Verificar Logs

**Aguardar 30-60 segundos após STOPPED**, então:

```bash
TASK_ID="abcd1234..."  # Substituir com task ID real

aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend-migrations" \
  --log-stream-name "ecs/migrations/$TASK_ID" \
  --limit 100 \
  --region us-east-1 \
  --query 'events[*].message' \
  --output text
```

**Executar no AWS CloudShell se PowerShell apresentar encoding issues.**

### Passo 6: Validar Sucesso

**Migrations bem-sucedidas devem mostrar**:

```
✅ Migration completed: create-tax-provider.ts
✅ Migration completed: create-payment-provider.ts
✅ Migration completed: create-currency.ts
✅ Migration completed: create-region.ts
...
Migrations completed successfully
```

**Se exitCode = 0**, migrations completaram!

## 📦 Após Migrations

### Opção A: Usar Task Definition v11 (Recomendado)

v11 **já provou** que SSL funciona (logs mostram conexão bem-sucedida).

```bash
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-backend \
  --task-definition ysh-b2b-backend:11 \
  --force-new-deployment \
  --region us-east-1 \
  --profile ysh-production
```

### Opção B: Tentar v12 (Se v11 não funcionar)

```bash
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-backend \
  --task-definition ysh-b2b-backend:12 \
  --region us-east-1 \
  --profile ysh-production
```

## 🔍 Troubleshooting

### Task falha com SELF_SIGNED_CERT_IN_CHAIN

**Problema**: CA bundle não encontrado ou NODE_EXTRA_CA_CERTS incorreto.

**Solução**: Verificar Dockerfile garante download do bundle:

```dockerfile
RUN curl -o /tmp/rds-ca-bundle.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
```

### Task falha com "relation already exists"

**Problema**: Migrations já foram executadas.

**Solução**: Normal! Significa banco já está migrado. Pode deployar serviço.

### Task fica em PENDING indefinidamente

**Problema**: Recursos insuficientes ou security group bloqueando.

**Solução**:

1. Verificar CPU/memory disponível no cluster
2. Confirmar security group permite PostgreSQL 5432 inbound

### Logs vazios ou stream não existe

**Problema**: Task falhou antes de criar logs.

**Solução**: Verificar exitCode e stoppedReason em `describe-tasks`.

## 📈 Network Configuration Completa

**Se não conseguir obter do serviço, usar esta template**:

```json
{
  "awsvpcConfiguration": {
    "subnets": ["subnet-XXXXX", "subnet-YYYYY"],
    "securityGroups": ["sg-ZZZZZ"],
    "assignPublicIp": "DISABLED"
  }
}
```

**Requisitos**:

- Subnets **privadas** com NAT Gateway (ou públicas com assignPublicIp=ENABLED)
- Security Group permite:
  - Outbound: PostgreSQL 5432 → RDS Security Group
  - Outbound: HTTPS 443 → Internet (para ECR image pull)
  - Outbound: Redis 6379 → ElastiCache Security Group (se necessário)

## ✅ Success Criteria

1. ✅ Task completa com `exitCode: 0`
2. ✅ Logs mostram migrations bem-sucedidas
3. ✅ Nenhum erro SSL (SELF_SIGNED_CERT_IN_CHAIN)
4. ✅ Tabelas criadas no PostgreSQL RDS

Após validar todos os critérios, deployar serviço backend com v11 ou v12! 🚀
