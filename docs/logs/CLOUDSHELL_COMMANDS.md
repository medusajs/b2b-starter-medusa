# Comandos Rápidos para AWS CloudShell
# Análise Backend YSH B2B - 12 de outubro de 2025

## 📋 Como usar

1. Acesse AWS CloudShell: https://console.aws.amazon.com/cloudshell/home?region=us-east-1
2. Copie e cole os comandos abaixo conforme necessário

---

## 🚀 Comando 1: Análise Completa (Recomendado)

```bash
# Baixar e executar script completo
curl -o analysis.sh https://raw.githubusercontent.com/own-boldsbrain/ysh-b2b/main/CLOUDSHELL_ANALYSIS.sh
chmod +x analysis.sh
./analysis.sh
```

**OU copie o script CLOUDSHELL_ANALYSIS.sh manualmente**

---

## 🔍 Comandos Individuais

### 1. Status do Serviço Backend

```bash
aws ecs describe-services \
  --cluster production-ysh-b2b-cluster \
  --services ysh-b2b-backend \
  --region us-east-1 \
  --query 'services[0].[serviceName,status,runningCount,desiredCount]' \
  --output table
```

### 2. Listar Últimas Tasks Paradas

```bash
aws ecs list-tasks \
  --cluster production-ysh-b2b-cluster \
  --service-name ysh-b2b-backend \
  --desired-status STOPPED \
  --max-items 5 \
  --region us-east-1 \
  --output table
```

### 3. Detalhes da Última Task

```bash
# Obter ARN da última task
LATEST_TASK=$(aws ecs list-tasks \
  --cluster production-ysh-b2b-cluster \
  --service-name ysh-b2b-backend \
  --desired-status STOPPED \
  --max-items 1 \
  --region us-east-1 \
  --query 'taskArns[0]' \
  --output text)

# Ver detalhes
aws ecs describe-tasks \
  --cluster production-ysh-b2b-cluster \
  --tasks $LATEST_TASK \
  --region us-east-1 \
  --query 'tasks[0].[stopCode,stoppedReason,containers[0].exitCode,createdAt,stoppedAt]' \
  --output table
```

### 4. Extrair Logs da Última Task (SEM ENCODING ISSUES!)

```bash
# Obter task ID
TASK_ID=$(aws ecs list-tasks \
  --cluster production-ysh-b2b-cluster \
  --service-name ysh-b2b-backend \
  --desired-status STOPPED \
  --max-items 1 \
  --region us-east-1 \
  --query 'taskArns[0]' \
  --output text | awk -F/ '{print $NF}')

echo "Task ID: $TASK_ID"

# Buscar TODOS os logs
aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend" \
  --log-stream-name "ecs/ysh-b2b-backend/$TASK_ID" \
  --region us-east-1 \
  --limit 100 \
  --query 'events[*].message' \
  --output text
```

### 5. Filtrar APENAS Erros dos Logs

```bash
TASK_ID=$(aws ecs list-tasks \
  --cluster production-ysh-b2b-cluster \
  --service-name ysh-b2b-backend \
  --desired-status STOPPED \
  --max-items 1 \
  --region us-east-1 \
  --query 'taskArns[0]' \
  --output text | awk -F/ '{print $NF}')

aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend" \
  --log-stream-name "ecs/ysh-b2b-backend/$TASK_ID" \
  --region us-east-1 \
  --limit 200 \
  --query 'events[*].message' \
  --output text | grep -i -E "error|failed|exception|refused|ssl|pg_hba"
```

### 6. Verificar DATABASE_URL Atual

```bash
aws secretsmanager get-secret-value \
  --secret-id "/ysh-b2b/database-url" \
  --region us-east-1 \
  --query 'SecretString' \
  --output text

# Verificar se tem SSL
aws secretsmanager get-secret-value \
  --secret-id "/ysh-b2b/database-url" \
  --region us-east-1 \
  --query 'SecretString' \
  --output text | grep -o "sslmode=[^&]*"
```

### 7. Listar Todos os Secrets

```bash
aws secretsmanager list-secrets \
  --region us-east-1 \
  --query 'SecretList[?contains(Name, `ysh-b2b`)].[Name,LastChangedDate]' \
  --output table
```

### 8. Verificar VPC Endpoints

```bash
aws ec2 describe-vpc-endpoints \
  --region us-east-1 \
  --filters "Name=vpc-id,Values=vpc-096abb11405bb44af" \
  --query 'VpcEndpoints[*].[ServiceName,State,VpcEndpointId]' \
  --output table
```

### 9. Verificar Security Group do Backend

```bash
aws ec2 describe-security-groups \
  --group-ids sg-06563301eba0427b2 \
  --region us-east-1 \
  --query 'SecurityGroups[0].IpPermissions[*].[FromPort,ToPort,IpProtocol,IpRanges[*].CidrIp]' \
  --output table
```

### 10. Verificar Security Group do RDS

```bash
aws ec2 describe-security-groups \
  --group-ids sg-0ed77cd5394f86cad \
  --region us-east-1 \
  --query 'SecurityGroups[0].IpPermissions[*].[FromPort,ToPort,IpProtocol,IpRanges[*].CidrIp,UserIdGroupPairs[*].GroupId]' \
  --output table
```

### 11. Verificar Parâmetros SSL do RDS

```bash
# Obter parameter group do RDS
PARAM_GROUP=$(aws rds describe-db-instances \
  --db-instance-identifier production-ysh-b2b-postgres \
  --region us-east-1 \
  --query 'DBInstances[0].DBParameterGroups[0].DBParameterGroupName' \
  --output text)

echo "Parameter Group: $PARAM_GROUP"

# Verificar se SSL é obrigatório
aws rds describe-db-parameters \
  --db-parameter-group-name $PARAM_GROUP \
  --region us-east-1 \
  --query 'Parameters[?ParameterName==`rds.force_ssl`].[ParameterName,ParameterValue,Description]' \
  --output table
```

### 12. Status do RDS Instance

```bash
aws rds describe-db-instances \
  --db-instance-identifier production-ysh-b2b-postgres \
  --region us-east-1 \
  --query 'DBInstances[0].[DBInstanceStatus,EngineVersion,Endpoint.Address,Endpoint.Port,PubliclyAccessible]' \
  --output table
```

### 13. Monitorar Backend em Tempo Real (Loop)

```bash
echo "Monitorando backend por 5 minutos..."
for i in {1..20}; do
  TIMESTAMP=$(date '+%H:%M:%S')
  STATUS=$(aws ecs describe-services \
    --cluster production-ysh-b2b-cluster \
    --services ysh-b2b-backend \
    --region us-east-1 \
    --query 'services[0].[runningCount,desiredCount]' \
    --output text)
  echo "[$TIMESTAMP] Backend: $STATUS tasks"
  sleep 15
done
```

### 14. Buscar Logs em Tempo Real (últimos 10 min)

```bash
# Últimos 10 minutos
START_TIME=$(($(date +%s) * 1000 - 600000))

aws logs filter-log-events \
  --log-group-name "/ecs/ysh-b2b-backend" \
  --start-time $START_TIME \
  --region us-east-1 \
  --query 'events[*].[timestamp,message]' \
  --output text | tail -50
```

### 15. Forçar Redeploy do Backend

```bash
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-backend \
  --force-new-deployment \
  --region us-east-1 \
  --query 'service.[serviceName,status,desiredCount]' \
  --output table
```

---

## 🔧 Comandos de Correção

### Adicionar SSL à DATABASE_URL (se necessário)

```bash
# Obter URL atual
CURRENT_URL=$(aws secretsmanager get-secret-value \
  --secret-id "/ysh-b2b/database-url" \
  --region us-east-1 \
  --query 'SecretString' \
  --output text)

# Verificar se já tem sslmode
if echo "$CURRENT_URL" | grep -q "sslmode"; then
  echo "✅ SSL já configurado: $CURRENT_URL"
else
  echo "❌ SSL NÃO configurado"
  echo "URL atual: $CURRENT_URL"
  echo ""
  echo "Para adicionar SSL, execute no PowerShell:"
  echo 'aws secretsmanager put-secret-value --secret-id "/ysh-b2b/database-url" --secret-string "CURRENT_URL?sslmode=require"'
fi
```

### Desabilitar SSL Obrigatório no RDS (se necessário)

```bash
# CUIDADO: Isso desabilita SSL obrigatório (não recomendado para produção)

PARAM_GROUP=$(aws rds describe-db-instances \
  --db-instance-identifier production-ysh-b2b-postgres \
  --region us-east-1 \
  --query 'DBInstances[0].DBParameterGroups[0].DBParameterGroupName' \
  --output text)

echo "Modificando parameter group: $PARAM_GROUP"

aws rds modify-db-parameter-group \
  --db-parameter-group-name $PARAM_GROUP \
  --parameters "ParameterName=rds.force_ssl,ParameterValue=0,ApplyMethod=immediate" \
  --region us-east-1

echo "⚠️  RDS precisa reiniciar para aplicar. Execute:"
echo "aws rds reboot-db-instance --db-instance-identifier production-ysh-b2b-postgres --region us-east-1"
```

---

## 📊 Análise de Logs JSON (mais detalhado)

```bash
TASK_ID=$(aws ecs list-tasks \
  --cluster production-ysh-b2b-cluster \
  --service-name ysh-b2b-backend \
  --desired-status STOPPED \
  --max-items 1 \
  --region us-east-1 \
  --query 'taskArns[0]' \
  --output text | awk -F/ '{print $NF}')

aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend" \
  --log-stream-name "ecs/ysh-b2b-backend/$TASK_ID" \
  --region us-east-1 \
  --limit 200 \
  --output json | jq -r '.events[] | .message' | jq -r 'select(.level == "error")'
```

---

## 🎯 Workflow Completo de Diagnóstico

```bash
#!/bin/bash
# Execute este workflow completo

echo "=== 1. STATUS DO SERVIÇO ==="
aws ecs describe-services --cluster production-ysh-b2b-cluster --services ysh-b2b-backend --region us-east-1 --query 'services[0].[runningCount,desiredCount]' --output text

echo ""
echo "=== 2. ÚLTIMA TASK PARADA ==="
LATEST_TASK=$(aws ecs list-tasks --cluster production-ysh-b2b-cluster --service-name ysh-b2b-backend --desired-status STOPPED --max-items 1 --region us-east-1 --query 'taskArns[0]' --output text)
echo "Task: $LATEST_TASK"

echo ""
echo "=== 3. EXIT CODE ==="
aws ecs describe-tasks --cluster production-ysh-b2b-cluster --tasks $LATEST_TASK --region us-east-1 --query 'tasks[0].containers[0].[exitCode,reason]' --output text

echo ""
echo "=== 4. LOGS COM ERROS ==="
TASK_ID=$(echo $LATEST_TASK | awk -F/ '{print $NF}')
aws logs get-log-events --log-group-name "/ecs/ysh-b2b-backend" --log-stream-name "ecs/ysh-b2b-backend/$TASK_ID" --region us-east-1 --limit 100 --query 'events[*].message' --output text | grep -i "error" | head -10

echo ""
echo "=== 5. VERIFICANDO SSL ==="
aws secretsmanager get-secret-value --secret-id "/ysh-b2b/database-url" --region us-east-1 --query 'SecretString' --output text | grep -o "sslmode=[^&]*" || echo "❌ SSL NÃO CONFIGURADO"

echo ""
echo "=== ANÁLISE COMPLETA ==="
```

---

## 💡 Dicas

1. **CloudShell não tem problemas de encoding UTF-8** - todos os logs serão exibidos corretamente
2. **Use `jq` para parsing JSON** - já vem instalado no CloudShell
3. **Combine com `grep`, `awk`, `sed`** para filtrar saídas
4. **Salve saídas longas**: `comando > output.txt`
5. **CloudShell tem 1GB de storage persistente** em `~/`

---

## 🚨 O que procurar nos logs

- `no pg_hba.conf entry` → Problema de SSL/TLS
- `ECONNREFUSED` → Database não acessível
- `relation does not exist` → Migrations não executadas
- `MODULE_NOT_FOUND` → Dependência npm faltando
- `timeout` → Network ou health check
