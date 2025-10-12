#!/bin/bash
# Script para executar no AWS CloudShell
# Buscar logs da task v9 que falhou

TASK_ID="9a2162ef9a9645faa68e8fa1fbbf51e0"
LOG_GROUP="/ecs/ysh-b2b-backend"
LOG_STREAM="ecs/ysh-b2b-backend/$TASK_ID"

echo "=== LOGS DA TASK v9 (com ca-certificates) ==="
echo ""
echo "Task ID: $TASK_ID"
echo ""

aws logs get-log-events \
  --log-group-name "$LOG_GROUP" \
  --log-stream-name "$LOG_STREAM" \
  --limit 100 \
  --region us-east-1 \
  --query 'events[*].message' \
  --output text
