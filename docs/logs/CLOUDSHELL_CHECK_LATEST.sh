#!/bin/bash
# CloudShell - Verificar Task Mais Recente
# Execute no CloudShell para ver logs sem encoding issues

CLUSTER="production-ysh-b2b-cluster"
SERVICE="ysh-b2b-backend"
LOG_GROUP="/ecs/ysh-b2b-backend"
REGION="us-east-1"

echo "=== OBTENDO TASK MAIS RECENTE ==="
LATEST_TASK=$(aws ecs list-tasks \
  --cluster $CLUSTER \
  --service-name $SERVICE \
  --desired-status STOPPED \
  --max-items 1 \
  --region $REGION \
  --query 'taskArns[0]' \
  --output text)

TASK_ID=$(echo $LATEST_TASK | awk -F/ '{print $NF}')
echo "Task ID: $TASK_ID"
echo ""

echo "=== DETALHES DA TASK ==="
aws ecs describe-tasks \
  --cluster $CLUSTER \
  --tasks $LATEST_TASK \
  --region $REGION \
  --query 'tasks[0].[stopCode,stoppedReason,containers[0].exitCode,containers[0].reason,startedAt,stoppedAt]' \
  --output table

echo ""
echo "=== VERIFICANDO SE LOG STREAM EXISTE ==="
aws logs describe-log-streams \
  --log-group-name $LOG_GROUP \
  --log-stream-name-prefix "ecs/ysh-b2b-backend/$TASK_ID" \
  --region $REGION \
  --query 'logStreams[*].[logStreamName,creationTime]' \
  --output table

echo ""
echo "=== TENTANDO BUSCAR LOGS ==="
LOG_STREAM="ecs/ysh-b2b-backend/$TASK_ID"

aws logs get-log-events \
  --log-group-name $LOG_GROUP \
  --log-stream-name $LOG_STREAM \
  --region $REGION \
  --limit 100 \
  --query 'events[*].message' \
  --output text 2>&1

echo ""
echo "=== EVENTOS DO SERVIÇO (ÚLTIMOS 5) ==="
aws ecs describe-services \
  --cluster $CLUSTER \
  --services $SERVICE \
  --region $REGION \
  --query 'services[0].events[:5].[createdAt,message]' \
  --output table

echo ""
echo "=== VERIFICANDO VPC ENDPOINTS ==="
aws ec2 describe-vpc-endpoints \
  --region $REGION \
  --filters "Name=vpc-id,Values=vpc-096abb11405bb44af" \
  --query 'VpcEndpoints[?State!=`available`].[ServiceName,State]' \
  --output table

echo ""
echo "Se log stream não existir, container falha ANTES de enviar logs."
echo "Possíveis causas:"
echo "  1. Task não consegue buscar secrets (IAM permissions)"
echo "  2. Task não consegue puxar imagem do ECR"
echo "  3. Health check matando task muito rápido"
echo "  4. Aplicação crashando imediatamente ao iniciar"
