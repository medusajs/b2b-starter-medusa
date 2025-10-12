#!/bin/bash
# Script para executar no bastion EC2

# 1. Instalar PostgreSQL client
sudo dnf install -y postgresql15

# 2. Conectar ao RDS e criar database
PGPASSWORD='bJwPx-g-u9?lt!O[[EG2:Kzj[cs~' psql \
  -h production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com \
  -U medusa_user \
  -d postgres \
  -c "CREATE DATABASE medusa_db;"

echo "Database medusa_db criado com sucesso!"
