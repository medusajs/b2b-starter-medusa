#!/bin/bash
# extract-publishable-key.sh
# Extrai publishable key dos logs do ECS task e atualiza Secrets Manager

set -e

TASK_ID=$1
LOG_GROUP="/ecs/ysh-b2b-backend-migrations-with-seed"
LOG_STREAM="ecs/migrations-and-seed/${TASK_ID}"
REGION="us-east-1"

if [ -z "$TASK_ID" ]; then
  echo "❌ Uso: $0 <TASK_ID>"
  echo "Exemplo: $0 66935a4c2b7742cbb5dd332fab40b85e"
  exit 1
fi

echo "📋 Obtendo logs do task ${TASK_ID}..."
echo "   Log Group: ${LOG_GROUP}"
echo "   Log Stream: ${LOG_STREAM}"
echo ""

# Obter logs e extrair token pk_*
LOGS=$(aws logs get-log-events \
  --log-group-name "${LOG_GROUP}" \
  --log-stream-name "${LOG_STREAM}" \
  --limit 500 \
  --region ${REGION} \
  --query 'events[*].message' \
  --output text 2>&1)

# Verificar se comando foi bem-sucedido
if [ $? -ne 0 ]; then
  echo "❌ Erro ao obter logs!"
  echo "Possíveis causas:"
  echo "  - Task ainda não criou log stream (aguarde ~60s após RUNNING)"
  echo "  - Log group não existe"
  echo "  - Task ID incorreto"
  echo ""
  echo "Saída do comando:"
  echo "$LOGS"
  exit 1
fi

# Extrair token (pk_ seguido de 64 caracteres hexadecimais)
TOKEN=$(echo "$LOGS" | grep -oP 'pk_[a-f0-9]{64}' | head -1)

if [ -z "$TOKEN" ]; then
  echo "❌ Publishable key não encontrada nos logs!"
  echo ""
  echo "📋 Logs completos (últimas 50 linhas):"
  echo "$LOGS" | tail -50
  echo ""
  echo "💡 Dicas:"
  echo "  - Verifique se task completou seed script"
  echo "  - Procure por 'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY' nos logs"
  echo "  - Se seed falhou, publishable key não foi criada"
  exit 1
fi

echo "✅ Publishable Key encontrada: $TOKEN"
echo ""

# Atualizar Secrets Manager
echo "📝 Atualizando Secrets Manager..."
aws secretsmanager update-secret \
  --secret-id /ysh-b2b/publishable-key \
  --secret-string "$TOKEN" \
  --region ${REGION} \
  --output json

if [ $? -eq 0 ]; then
  echo "✅ Secret atualizado com sucesso!"
  echo ""
  echo "🎯 Próximos passos:"
  echo ""
  echo "1. Redeploy backend service (para pegar novo secret):"
  echo "   aws ecs update-service \\"
  echo "     --cluster production-ysh-b2b-cluster \\"
  echo "     --service ysh-b2b-backend \\"
  echo "     --force-new-deployment \\"
  echo "     --region ${REGION}"
  echo ""
  echo "2. Aguardar backend healthy (2/2 tasks):"
  echo "   aws ecs describe-services \\"
  echo "     --cluster production-ysh-b2b-cluster \\"
  echo "     --services ysh-b2b-backend \\"
  echo "     --region ${REGION} \\"
  echo "     --query 'services[0].[runningCount,desiredCount]'"
  echo ""
  echo "3. Testar endpoint /store/products:"
  echo "   curl -H \"x-publishable-api-key: $TOKEN\" \\"
  echo "     https://BACKEND_ALB_URL/store/products?limit=5"
  echo ""
  echo "4. Deploy storefront (já usa mesmo secret)"
else
  echo "❌ Erro ao atualizar secret!"
  exit 1
fi
