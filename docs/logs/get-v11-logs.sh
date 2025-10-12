#!/bin/bash
# Script para obter logs da task v11 (b802e5ac6a444e4bb134848af3192b67)
# Executar no AWS CloudShell

aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend" \
  --log-stream-name "ecs/ysh-b2b-backend/b802e5ac6a444e4bb134848af3192b67" \
  --limit 100 \
  --region us-east-1 \
  > task-v11-logs.json

echo "Logs salvos em task-v11-logs.json"
echo ""
echo "Últimas 30 linhas:"
cat task-v11-logs.json | jq -r '.events[] | .message' | tail -30
