# YSH Data Pipeline - Comandos Essenciais

Referência rápida de comandos para operação do pipeline.

---

## 🐳 Docker & Docker Compose

### Airflow

```powershell
# Iniciar Airflow (6 serviços)
cd workflows/airflow
docker-compose up -d

# Parar
docker-compose stop

# Reiniciar
docker-compose restart

# Ver logs
docker-compose logs -f
docker logs -f ysh-airflow-scheduler
docker logs -f ysh-airflow-webserver

# Resetar (limpar tudo)
docker-compose down -v
docker-compose up -d

# Status dos containers
docker-compose ps

# Executar comando no container
docker exec ysh-airflow-webserver airflow dags list
docker exec ysh-airflow-webserver airflow tasks list daily_full_ingestion
```

### Node-RED

```powershell
# Iniciar Node-RED
cd workflows/node-red
docker-compose up -d

# Ver logs
docker logs -f ysh-node-red

# Parar
docker-compose stop

# Resetar
docker-compose down -v
docker-compose up -d

# Backup flows
docker cp ysh-node-red:/data/flows.json ./flows-backup.json
```

### Rede Docker

```powershell
# Criar rede compartilhada
docker network create ysh-pipeline-network

# Listar redes
docker network ls

# Inspecionar rede
docker network inspect ysh-pipeline-network

# Remover rede
docker network rm ysh-pipeline-network
```

---

## ✈️ Airflow CLI

### DAGs

```powershell
# Listar DAGs
docker exec ysh-airflow-webserver airflow dags list

# Trigger DAG manualmente
docker exec ysh-airflow-webserver airflow dags trigger daily_full_ingestion

# Pausar DAG
docker exec ysh-airflow-webserver airflow dags pause daily_full_ingestion

# Ativar DAG
docker exec ysh-airflow-webserver airflow dags unpause daily_full_ingestion

# Ver próximas execuções
docker exec ysh-airflow-webserver airflow dags next-execution daily_full_ingestion
```

### Tasks

```powershell
# Listar tasks de um DAG
docker exec ysh-airflow-webserver airflow tasks list daily_full_ingestion

# Testar task (sem executar)
docker exec ysh-airflow-webserver airflow tasks test daily_full_ingestion fetch_aneel_data 2025-01-15

# Ver logs de task
docker exec ysh-airflow-webserver airflow tasks logs daily_full_ingestion fetch_aneel_data 2025-01-15

# Estado de task
docker exec ysh-airflow-webserver airflow tasks state daily_full_ingestion fetch_aneel_data 2025-01-15
```

### Database

```powershell
# Inicializar database
docker exec ysh-airflow-webserver airflow db init

# Resetar database
docker exec ysh-airflow-webserver airflow db reset

# Upgrade database
docker exec ysh-airflow-webserver airflow db upgrade
```

### Usuários

```powershell
# Criar admin user
docker exec ysh-airflow-webserver airflow users create `
  --username admin `
  --password admin `
  --firstname Admin `
  --lastname User `
  --role Admin `
  --email admin@ysh.com

# Listar usuários
docker exec ysh-airflow-webserver airflow users list

# Deletar usuário
docker exec ysh-airflow-webserver airflow users delete --username admin
```

---

## ☁️ AWS CLI

### Lambda

```powershell
# Listar functions
aws lambda list-functions --query 'Functions[*].[FunctionName,Runtime,LastModified]'

# Invocar function
aws lambda invoke `
  --function-name ysh-pipeline-aneel-fetcher `
  --payload '{"action":"fetch_all"}' `
  output.json

# Ver resultado
Get-Content output.json | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Ver logs
aws logs tail /aws/lambda/ysh-pipeline-aneel-fetcher --follow

# Update código
cd workflows/aws/lambda/aneel_fetcher
pip install -r requirements.txt -t .
Compress-Archive -Path * -Force -DestinationPath ../aneel_fetcher.zip
aws lambda update-function-code `
  --function-name ysh-pipeline-aneel-fetcher `
  --zip-file fileb://../aneel_fetcher.zip

# Ver configuração
aws lambda get-function-configuration `
  --function-name ysh-pipeline-aneel-fetcher
```

### Step Functions

```powershell
# Listar state machines
aws stepfunctions list-state-machines

# Iniciar execução
$stateMachine = "arn:aws:states:us-east-1:123456789012:stateMachine:ysh-pipeline-ingestion-workflow"
aws stepfunctions start-execution `
  --state-machine-arn $stateMachine `
  --input '{"action":"fetch_all"}'

# Listar execuções
aws stepfunctions list-executions `
  --state-machine-arn $stateMachine `
  --max-results 10

# Ver status de execução
aws stepfunctions describe-execution `
  --execution-arn "arn:aws:states:..."

# Ver histórico
aws stepfunctions get-execution-history `
  --execution-arn "arn:aws:states:..." `
  --max-results 100
```

### S3

```powershell
# Listar buckets
aws s3 ls

# Listar arquivos no bucket
aws s3 ls s3://ysh-pipeline-data-dev/ingestion/ --recursive

# Download arquivo
aws s3 cp s3://ysh-pipeline-data-dev/ingestion/2025/01/15/aneel-data.json ./

# Upload arquivo
aws s3 cp ./local-file.json s3://ysh-pipeline-data-dev/test/

# Sync diretório
aws s3 sync ./local-data/ s3://ysh-pipeline-data-dev/backup/

# Deletar arquivo
aws s3 rm s3://ysh-pipeline-data-dev/test/local-file.json

# Esvaziar bucket (cuidado!)
aws s3 rm s3://ysh-pipeline-data-dev/ --recursive
```

### DynamoDB

```powershell
# Listar tabelas
aws dynamodb list-tables

# Descrever tabela
aws dynamodb describe-table --table-name ysh-pipeline-cache

# Get item
aws dynamodb get-item `
  --table-name ysh-pipeline-cache `
  --key '{"pk":{"S":"latest"},"sk":{"S":"ingestion"}}'

# Put item
aws dynamodb put-item `
  --table-name ysh-pipeline-cache `
  --item '{"pk":{"S":"test"},"sk":{"S":"item"},"data":{"S":"value"}}'

# Query items
aws dynamodb query `
  --table-name ysh-pipeline-cache `
  --key-condition-expression "pk = :pk" `
  --expression-attribute-values '{":pk":{"S":"latest"}}'

# Scan table (cuidado com custo!)
aws dynamodb scan --table-name ysh-pipeline-cache --max-items 10
```

### CloudWatch

```powershell
# Ver logs de Lambda
aws logs tail /aws/lambda/ysh-pipeline-aneel-fetcher --follow --since 1h

# Ver grupos de logs
aws logs describe-log-groups

# Ver streams de log
aws logs describe-log-streams --log-group-name /aws/lambda/ysh-pipeline-aneel-fetcher

# Get métricas
aws cloudwatch get-metric-statistics `
  --namespace AWS/Lambda `
  --metric-name Invocations `
  --dimensions Name=FunctionName,Value=ysh-pipeline-aneel-fetcher `
  --start-time 2025-01-15T00:00:00Z `
  --end-time 2025-01-15T23:59:59Z `
  --period 3600 `
  --statistics Sum

# Listar alarmes
aws cloudwatch describe-alarms

# Criar alarme
aws cloudwatch put-metric-alarm `
  --alarm-name ysh-lambda-errors `
  --alarm-description "Lambda errors > 5" `
  --metric-name Errors `
  --namespace AWS/Lambda `
  --statistic Sum `
  --period 300 `
  --threshold 5 `
  --comparison-operator GreaterThanThreshold `
  --evaluation-periods 1
```

---

## 🏗️ Terraform

```powershell
# Navegar para diretório
cd workflows/aws/terraform

# Inicializar
terraform init

# Validar configuração
terraform validate

# Formatar código
terraform fmt

# Ver plano
terraform plan

# Aplicar (criar recursos)
terraform apply

# Aplicar sem confirmação
terraform apply -auto-approve

# Destruir tudo
terraform destroy

# Ver outputs
terraform output

# Ver output específico
terraform output s3_bucket_name
terraform output api_gateway_url

# Ver estado
terraform show

# Listar recursos
terraform state list

# Ver recurso específico
terraform state show aws_lambda_function.aneel_fetcher

# Refresh estado
terraform refresh

# Importar recurso existente
terraform import aws_s3_bucket.pipeline_data ysh-pipeline-data-dev
```

---

## 🔌 API Gateway (FastAPI)

### Desenvolvimento

```powershell
# Instalar dependências
cd workflows/api-gateway/fastapi
pip install -r requirements.txt

# Iniciar servidor (dev)
uvicorn main:app --reload --port 8000

# Iniciar com workers (prod)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Ver logs
# Logs aparecem no terminal
```

### Testes

```powershell
# Health check
Invoke-RestMethod http://localhost:8000/health

# Root
Invoke-RestMethod http://localhost:8000/

# Get datasets
Invoke-RestMethod "http://localhost:8000/api/v1/datasets?limit=5"

# Search
$body = @{
    query = "solar"
    limit = 10
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
  -Uri "http://localhost:8000/api/v1/search" `
  -ContentType "application/json" `
  -Body $body

# Status
Invoke-RestMethod http://localhost:8000/api/v1/status

# Trigger ingestion
Invoke-RestMethod -Method Post http://localhost:8000/api/v1/ingest
```

### cURL (alternativa)

```bash
# Health
curl http://localhost:8000/health

# Datasets
curl "http://localhost:8000/api/v1/datasets?limit=5"

# Search
curl -X POST http://localhost:8000/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query":"solar","limit":10}'
```

---

## 🐍 Python Scripts

### Executar Pipeline Local

```powershell
cd data-pipeline

# Executar pipeline integrado
python integrated_data_pipeline.py

# Executar fetcher ANEEL
python aneel_data_fetcher.py

# Executar scraper
python crawlee_scraper.py

# Executar processador AI
python realtime_processor.py
```

### Redis

```powershell
# Conectar ao Redis
docker exec -it ysh-redis-cache redis-cli

# Ver todas as keys
KEYS *

# Get valor
GET pipeline:aneel:latest

# Set valor
SET test:key "test value" EX 3600

# Ver TTL
TTL pipeline:aneel:latest

# Deletar key
DEL test:key

# Flush tudo (cuidado!)
FLUSHALL
```

### PostgreSQL

```powershell
# Conectar ao PostgreSQL
docker exec -it ysh-postgres-db psql -U ysh_user -d ysh_pipeline

# Listar tabelas
\dt

# Ver schema
\d table_name

# Query
SELECT * FROM datasets LIMIT 10;

# Sair
\q
```

---

## 📊 Monitoramento

### Verificar Status Geral

```powershell
# Airflow
start http://localhost:8080

# Node-RED
start http://localhost:1880

# API docs
start http://localhost:8000/api/docs

# Health checks
Invoke-RestMethod http://localhost:8000/health

# Docker status
docker ps

# Verificar recursos
docker stats
```

### Logs Consolidados

```powershell
# Todos os logs Airflow
docker-compose -f workflows/airflow/docker-compose.yml logs -f

# Apenas scheduler
docker logs -f ysh-airflow-scheduler

# Apenas webserver
docker logs -f ysh-airflow-webserver

# Node-RED
docker logs -f ysh-node-red

# Redis
docker logs -f ysh-redis-cache

# PostgreSQL
docker logs -f ysh-postgres-db
```

---

## 🧹 Limpeza

### Local (Docker)

```powershell
# Parar tudo
docker stop $(docker ps -aq)

# Remover containers
docker rm $(docker ps -aq)

# Remover volumes (cuidado!)
docker volume prune -f

# Remover imagens não usadas
docker image prune -a

# Limpeza completa (cuidado!)
docker system prune -a --volumes -f
```

### AWS

```powershell
# Destruir tudo via Terraform
cd workflows/aws/terraform
terraform destroy

# Ou manual:

# Deletar Lambda
aws lambda delete-function --function-name ysh-pipeline-aneel-fetcher

# Deletar S3 (esvaziar primeiro)
aws s3 rm s3://ysh-pipeline-data-dev --recursive
aws s3 rb s3://ysh-pipeline-data-dev

# Deletar DynamoDB
aws dynamodb delete-table --table-name ysh-pipeline-cache

# Deletar Step Functions
aws stepfunctions delete-state-machine --state-machine-arn <arn>
```

---

## 🔑 Variáveis de Ambiente

### Airflow

```powershell
$env:AIRFLOW__CORE__EXECUTOR="LocalExecutor"
$env:AIRFLOW__DATABASE__SQL_ALCHEMY_CONN="postgresql+psycopg2://airflow:airflow@ysh-airflow-postgres:5433/airflow"
$env:AIRFLOW__CORE__LOAD_EXAMPLES="False"
```

### AWS

```powershell
$env:AWS_ACCESS_KEY_ID="your-key"
$env:AWS_SECRET_ACCESS_KEY="your-secret"
$env:AWS_DEFAULT_REGION="us-east-1"
```

### API Gateway

```powershell
$env:REDIS_HOST="localhost"
$env:REDIS_PORT="6379"
$env:DYNAMODB_TABLE="ysh-pipeline-cache"
$env:S3_BUCKET="ysh-pipeline-data-dev"
```

---

## 📝 Atalhos Úteis

```powershell
# Aliases (adicionar ao perfil PowerShell)
function air { docker exec ysh-airflow-webserver airflow $args }
function air-logs { docker logs -f ysh-airflow-scheduler }
function nr-logs { docker logs -f ysh-node-red }
function api-test { Invoke-RestMethod http://localhost:8000/health }

# Usar:
air dags list
air-logs
nr-logs
api-test
```

---

**Comandos prontos para uso! 🚀**
