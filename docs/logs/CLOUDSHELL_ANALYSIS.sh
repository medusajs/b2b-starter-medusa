#!/bin/bash
# Script de Análise Backend via AWS CloudShell
# Execute este script no AWS CloudShell para analisar os erros do backend
# Data: 12 de outubro de 2025

set -e

echo "=================================================="
echo "🔍 ANÁLISE BACKEND - AWS CloudShell"
echo "=================================================="
echo ""

# Configurações
CLUSTER="production-ysh-b2b-cluster"
SERVICE="ysh-b2b-backend"
LOG_GROUP="/ecs/ysh-b2b-backend"
REGION="us-east-1"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}📊 1. VERIFICANDO STATUS DO SERVIÇO${NC}"
echo "=================================================="
SERVICE_INFO=$(aws ecs describe-services \
  --cluster $CLUSTER \
  --services $SERVICE \
  --region $REGION \
  --query 'services[0].[serviceName,status,runningCount,desiredCount,deployments[0].status]' \
  --output text)

echo -e "${YELLOW}Service: ${NC}$SERVICE_INFO"
echo ""

echo -e "${CYAN}📋 2. LISTANDO ÚLTIMAS 3 TASKS PARADAS${NC}"
echo "=================================================="
STOPPED_TASKS=$(aws ecs list-tasks \
  --cluster $CLUSTER \
  --service-name $SERVICE \
  --desired-status STOPPED \
  --max-items 3 \
  --region $REGION \
  --query 'taskArns[]' \
  --output text)

if [ -z "$STOPPED_TASKS" ]; then
  echo -e "${RED}Nenhuma task parada encontrada${NC}"
  exit 1
fi

# Pegar a primeira (mais recente)
LATEST_TASK=$(echo $STOPPED_TASKS | awk '{print $1}')
TASK_ID=$(echo $LATEST_TASK | awk -F/ '{print $NF}')

echo -e "${GREEN}Task mais recente:${NC} $TASK_ID"
echo ""

echo -e "${CYAN}🔎 3. DETALHES DA TASK${NC}"
echo "=================================================="
TASK_DETAILS=$(aws ecs describe-tasks \
  --cluster $CLUSTER \
  --tasks $LATEST_TASK \
  --region $REGION \
  --query 'tasks[0].[stopCode,stoppedReason,containers[0].exitCode,containers[0].reason,createdAt,startedAt,stoppedAt]' \
  --output table)

echo "$TASK_DETAILS"
echo ""

echo -e "${CYAN}📝 4. EXTRAINDO LOGS (ÚLTIMAS 50 MENSAGENS)${NC}"
echo "=================================================="
LOG_STREAM="ecs/ysh-b2b-backend/$TASK_ID"

echo -e "${YELLOW}Log Stream:${NC} $LOG_STREAM"
echo ""

# Buscar logs
echo -e "${GREEN}Buscando logs...${NC}"
echo ""

aws logs get-log-events \
  --log-group-name $LOG_GROUP \
  --log-stream-name $LOG_STREAM \
  --region $REGION \
  --limit 50 \
  --query 'events[*].message' \
  --output text

echo ""
echo -e "${CYAN}🔍 5. FILTRANDO APENAS ERROS${NC}"
echo "=================================================="

aws logs get-log-events \
  --log-group-name $LOG_GROUP \
  --log-stream-name $LOG_STREAM \
  --region $REGION \
  --limit 100 \
  --query 'events[*].message' \
  --output text | grep -i -E "error|failed|exception|refused" || echo "Nenhum erro explícito encontrado nos logs"

echo ""
echo -e "${CYAN}📊 6. VERIFICANDO SECRETS${NC}"
echo "=================================================="

echo -e "${YELLOW}Listando secrets disponíveis:${NC}"
aws secretsmanager list-secrets \
  --region $REGION \
  --query 'SecretList[?contains(Name, `ysh-b2b`)].[Name,LastChangedDate]' \
  --output table

echo ""
echo -e "${YELLOW}DATABASE_URL atual:${NC}"
DATABASE_URL=$(aws secretsmanager get-secret-value \
  --secret-id "/ysh-b2b/database-url" \
  --region $REGION \
  --query 'SecretString' \
  --output text)

# Mascarar senha para segurança
MASKED_URL=$(echo "$DATABASE_URL" | sed 's/:[^@]*@/:***@/')
echo "$MASKED_URL"

# Verificar se tem sslmode
if echo "$DATABASE_URL" | grep -q "sslmode"; then
  echo -e "${GREEN}✅ SSL mode configurado${NC}"
else
  echo -e "${RED}❌ SSL mode NÃO configurado${NC}"
fi

echo ""
echo -e "${CYAN}🌐 7. VERIFICANDO VPC ENDPOINTS${NC}"
echo "=================================================="

VPC_ID="vpc-096abb11405bb44af"

aws ec2 describe-vpc-endpoints \
  --region $REGION \
  --filters "Name=vpc-id,Values=$VPC_ID" \
  --query 'VpcEndpoints[*].[ServiceName,State,VpcEndpointId]' \
  --output table

echo ""
echo -e "${CYAN}🔒 8. VERIFICANDO SECURITY GROUP DO BACKEND${NC}"
echo "=================================================="

SG_ID="sg-06563301eba0427b2"

echo -e "${YELLOW}Regras de entrada:${NC}"
aws ec2 describe-security-groups \
  --group-ids $SG_ID \
  --region $REGION \
  --query 'SecurityGroups[0].IpPermissions[*].[FromPort,ToPort,IpProtocol,IpRanges[*].CidrIp,UserIdGroupPairs[*].GroupId]' \
  --output table

echo ""
echo -e "${CYAN}💾 9. VERIFICANDO SECURITY GROUP DO RDS${NC}"
echo "=================================================="

RDS_SG="sg-0ed77cd5394f86cad"

echo -e "${YELLOW}Regras de entrada para RDS:${NC}"
aws ec2 describe-security-groups \
  --group-ids $RDS_SG \
  --region $REGION \
  --query 'SecurityGroups[0].IpPermissions[*].[FromPort,ToPort,IpProtocol,IpRanges[*].CidrIp,UserIdGroupPairs[*].GroupId]' \
  --output table

echo ""
echo -e "${CYAN}🏥 10. VERIFICANDO RDS INSTANCE${NC}"
echo "=================================================="

RDS_INSTANCE="production-ysh-b2b-postgres"

aws rds describe-db-instances \
  --db-instance-identifier $RDS_INSTANCE \
  --region $REGION \
  --query 'DBInstances[0].[DBInstanceStatus,Engine,EngineVersion,Endpoint.Address,Endpoint.Port,PubliclyAccessible,VpcSecurityGroups[*].Status]' \
  --output table

echo ""
echo -e "${CYAN}🔐 11. VERIFICANDO PARÂMETROS SSL DO RDS${NC}"
echo "=================================================="

# Obter parameter group
PARAM_GROUP=$(aws rds describe-db-instances \
  --db-instance-identifier $RDS_INSTANCE \
  --region $REGION \
  --query 'DBInstances[0].DBParameterGroups[0].DBParameterGroupName' \
  --output text)

echo -e "${YELLOW}Parameter Group:${NC} $PARAM_GROUP"

# Verificar configuração SSL
aws rds describe-db-parameters \
  --db-parameter-group-name $PARAM_GROUP \
  --region $REGION \
  --query 'Parameters[?ParameterName==`rds.force_ssl`].[ParameterName,ParameterValue,Description]' \
  --output table

echo ""
echo -e "${GREEN}=================================================="
echo "✅ ANÁLISE COMPLETA"
echo "==================================================${NC}"
echo ""
echo -e "${YELLOW}📋 Resumo:${NC}"
echo "1. Verifique os logs acima para erros específicos"
echo "2. Confirme se SSL está configurado corretamente"
echo "3. Valide se VPC Endpoints estão 'available'"
echo "4. Verifique se Security Groups permitem tráfego necessário"
echo ""
echo -e "${CYAN}💡 Próximos passos recomendados:${NC}"
echo "- Se erro SSL persistir: ajustar rds.force_ssl no parameter group"
echo "- Se erro de conexão: verificar Security Groups"
echo "- Se erro de aplicação: executar migrations via bastion"
echo ""
