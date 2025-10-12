#!/bin/bash
# Script para obter logs da task v12 (9d9f144aef0d4ed8b753aaa7723fe047)
# Executar no AWS CloudShell

echo "=== Obtendo logs da Task v12 ==="
echo "Task ID: 9d9f144aef0d4ed8b753aaa7723fe047"
echo ""

aws logs get-log-events \
  --log-group-name "/ecs/ysh-b2b-backend" \
  --log-stream-name "ecs/ysh-b2b-backend/9d9f144aef0d4ed8b753aaa7723fe047" \
  --limit 50 \
  --region us-east-1 \
  --query 'events[*].message' \
  --output text

echo ""
echo "=== Fim dos logs ==="
