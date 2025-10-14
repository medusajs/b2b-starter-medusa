# 🔄 YSH Data Pipeline Workflows & Automation

Complete workflow automation strategy with Node-RED, Apache Airflow, and AWS Free Tier integration.

## 📋 Overview

This workflow system provides:

- **Scheduled Data Ingestion**: Daily/hourly updates from ANEEL, utilities
- **Fallback Management**: Automatic retry with exponential backoff
- **API Gateway**: REST/GraphQL endpoints for data access
- **Monitoring**: Real-time alerts and dashboards
- **Cost Optimization**: AWS Free Tier maximization

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW ORCHESTRATION                    │
├──────────────────┬──────────────────┬───────────────────────┤
│   Apache Airflow │     Node-RED     │   AWS Step Functions  │
│  (Complex DAGs)  │  (Quick Flows)   │    (Serverless)       │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA PIPELINES                           │
├────────────┬──────────────┬──────────────┬──────────────────┤
│   ANEEL    │   Utilities  │     PDF      │     Ollama       │
│  Fetcher   │   Scraper    │  Extractor   │   Enrichment     │
└────────┬───┴──────┬───────┴──────┬───────┴──────┬───────────┘
         │          │               │               │
         └──────────┼───────────────┼───────────────┘
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE & CACHE                           │
├────────────┬──────────────┬──────────────┬──────────────────┤
│   Redis    │  PostgreSQL  │   Qdrant     │   S3 Glacier     │
│  (Cache)   │   (RDBMS)    │  (Vectors)   │   (Archive)      │
└────────────┴──────────────┴──────────────┴──────────────────┘
         │                                         │
         └─────────────────┬───────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                             │
├────────────┬──────────────┬──────────────────────────────────┤
│  REST API  │  GraphQL     │  WebSocket (Real-time)          │
│  (FastAPI) │  (Hasura)    │  (AWS API Gateway)              │
└────────────┴──────────────┴──────────────────────────────────┘
```

## 🔧 Component Selection

### Option 1: Apache Airflow (Recommended for Complex Workflows)

**Best For**:

- Complex DAGs with many dependencies
- Data science pipelines
- Production-grade scheduling
- Advanced monitoring

**Deployment**: Docker Compose (local) or AWS MWAA (managed)

### Option 2: Node-RED (Recommended for Quick Development)

**Best For**:

- Visual flow programming
- Rapid prototyping
- IoT/event-driven workflows
- Simple integrations

**Deployment**: Docker container or AWS EC2 t2.micro

### Option 3: AWS Step Functions (Serverless)

**Best For**:

- Serverless architecture
- Pay-per-use model
- AWS-native integrations
- Auto-scaling

**Cost**: 4,000 state transitions/month FREE

## 📊 Workflow Strategies

### Strategy 1: Hybrid Approach (Recommended)

```
Node-RED          → Quick prototyping, testing
     ↓
Airflow (Local)   → Development & staging
     ↓
AWS Step Functions → Production (cost-effective)
```

### Strategy 2: All-in-One Airflow

```
Apache Airflow → All workflows
     ↓
AWS RDS Free Tier → Metadata DB (PostgreSQL)
     ↓
AWS EC2 t2.micro → Airflow scheduler/webserver
```

### Strategy 3: Node-RED + Lambda

```
Node-RED → Workflow designer
     ↓
AWS Lambda → Execution (Python functions)
     ↓
EventBridge → Scheduling
```

## 🎯 Implementation Plan

### Phase 1: Local Development (Week 1)

1. **Setup Node-RED** (Days 1-2)
   - Visual flow designer
   - Test all pipeline components
   - Create reusable subflows

2. **Setup Airflow** (Days 3-5)
   - Convert Node-RED flows to DAGs
   - Add error handling
   - Configure retries

3. **Testing** (Days 6-7)
   - End-to-end testing
   - Fallback scenarios
   - Performance tuning

### Phase 2: AWS Migration (Week 2)

1. **Infrastructure** (Days 1-3)
   - Deploy to AWS Free Tier
   - Setup networking
   - Configure security

2. **API Gateway** (Days 4-5)
   - REST endpoints
   - Authentication
   - Rate limiting

3. **Monitoring** (Days 6-7)
   - CloudWatch dashboards
   - Alarms
   - Cost tracking

## 💰 AWS Free Tier Strategy

### Always Free Services

| Service | Free Tier Limit | Usage Plan |
|---------|----------------|------------|
| Lambda | 1M requests/month | Pipeline execution |
| S3 | 5GB storage | PDF archives |
| DynamoDB | 25GB storage | Metadata cache |
| CloudWatch | 10 metrics | Monitoring |
| API Gateway | 1M calls/month | API endpoints |
| Step Functions | 4,000 transitions | Workflows |
| EventBridge | 14M events/month | Scheduling |
| SNS | 1M publishes | Alerts |

### 12-Month Free Services

| Service | Free Tier | Usage After |
|---------|-----------|-------------|
| EC2 t2.micro | 750 hours/month | Spot instances |
| RDS db.t2.micro | 750 hours/month | Self-hosted DB |
| Elastic Load Balancer | 750 hours/month | Not needed initially |

### Cost Optimization

```python
# Estimated Monthly Cost (After free tier)
LAMBDA_EXECUTIONS = 2_000_000  # $0.20/month
S3_STORAGE = 50_GB              # $1.15/month  
DYNAMODB_STORAGE = 25_GB        # $0 (free)
CLOUDWATCH_LOGS = 5_GB          # $2.50/month
API_GATEWAY = 2_000_000         # $3.50/month
TOTAL_ESTIMATED = $7.35/month   # ~$88/year
```

## 🔄 Workflow Patterns

### Pattern 1: Daily Full Ingestion

```yaml
Schedule: 0 2 * * *  # 2 AM daily
Steps:
  1. Fetch ANEEL data
  2. Scrape utilities
  3. Process PDFs
  4. Enrich with Ollama
  5. Index in vector store
  6. Update API cache
  7. Send summary email
```

### Pattern 2: Hourly Incremental Updates

```yaml
Schedule: 0 * * * *  # Every hour
Steps:
  1. Check for new ANEEL datasets
  2. If found:
     - Fetch new data
     - Process with AI
     - Update indexes
     - Trigger webhook
  3. If not found:
     - Skip (save resources)
```

### Pattern 3: Real-time Event Processing

```yaml
Trigger: S3 Object Created (new PDF)
Steps:
  1. Extract formulas with LaTeX-OCR
  2. Translate if needed
  3. Extract technical parameters
  4. Index in Qdrant
  5. Notify subscribers
```

### Pattern 4: Fallback Management

```yaml
On Failure:
  1. Log error to CloudWatch
  2. Wait 60 seconds
  3. Retry (max 3 attempts)
  4. If still failing:
     - Switch to backup source
     - Alert admin via SNS
     - Use cached data
```

## 📁 Directory Structure

```
workflows/
├── README.md                      # This file
├── airflow/
│   ├── dags/
│   │   ├── daily_full_ingestion.py
│   │   ├── hourly_incremental.py
│   │   ├── pdf_processing.py
│   │   └── fallback_recovery.py
│   ├── docker-compose.yml
│   ├── requirements.txt
│   └── README.md
├── node-red/
│   ├── flows.json
│   ├── docker-compose.yml
│   └── README.md
├── aws/
│   ├── step-functions/
│   │   ├── ingestion-workflow.asl.json
│   │   └── fallback-workflow.asl.json
│   ├── lambda/
│   │   ├── aneel_fetcher/
│   │   ├── pdf_processor/
│   │   └── api_handlers/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   └── README.md
├── api-gateway/
│   ├── fastapi/
│   │   ├── main.py
│   │   ├── routers/
│   │   └── requirements.txt
│   ├── graphql/
│   │   └── schema.graphql
│   └── README.md
└── monitoring/
    ├── cloudwatch-dashboards.json
    ├── grafana-dashboards.json
    └── alerts.yml
```

## 🚀 Quick Start Commands

### Node-RED

```powershell
# Start Node-RED
cd workflows/node-red
docker-compose up -d

# Access UI
start http://localhost:1880

# Import flows
# UI → Menu → Import → flows.json
```

### Apache Airflow

```powershell
# Start Airflow
cd workflows/airflow
docker-compose up -d

# Access UI
start http://localhost:8080
# User: airflow / Pass: airflow

# Trigger DAG manually
docker exec airflow-scheduler airflow dags trigger daily_full_ingestion
```

### AWS Deployment

```powershell
# Deploy infrastructure
cd workflows/aws/terraform
terraform init
terraform plan
terraform apply

# Deploy Lambda functions
cd ../lambda
./deploy.sh

# Test API
curl https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/datasets
```

## 📈 Monitoring & Alerts

### CloudWatch Metrics

```yaml
Custom Metrics:
  - pipeline.execution.duration
  - pipeline.items.processed
  - pipeline.errors.count
  - api.requests.count
  - api.latency.p99

Alarms:
  - PipelineFailureRate > 10%
  - APILatency > 1000ms
  - ErrorCount > 100/hour
  - CostAnomaly > $10/day
```

### Grafana Dashboards

- Pipeline Execution Status
- Data Freshness Monitor
- API Performance
- Cost Tracking
- Error Rate Trends

## 🔐 Security Best Practices

1. **Secrets Management**: AWS Secrets Manager (30k API calls FREE)
2. **API Authentication**: JWT tokens with AWS Cognito
3. **Network Security**: VPC with private subnets
4. **Encryption**: S3 encryption at rest, TLS in transit
5. **Access Control**: IAM roles with least privilege

## 📝 Next Steps

1. **Choose Orchestrator**: Node-RED (quick) or Airflow (robust)
2. **Setup Development Environment**: Docker Compose locally
3. **Create First Workflow**: Daily ANEEL ingestion
4. **Test Fallbacks**: Simulate failures
5. **Deploy to AWS**: Use Terraform
6. **Create API Gateway**: FastAPI + AWS API Gateway
7. **Setup Monitoring**: CloudWatch + Grafana
8. **Document Runbooks**: Operations procedures

## 🤝 Integration Points

### With Existing Pipeline

```python
# Import pipeline components
from integrated_data_pipeline import DataPipelineOrchestrator

# Use in Airflow DAG
orchestrator = DataPipelineOrchestrator()
results = await orchestrator.run_full_ingestion()
```

### With API Gateway

```python
# FastAPI endpoint
@app.get("/api/v1/datasets")
async def get_datasets():
    return await fetch_from_cache_or_db()
```

### With Monitoring

```python
# CloudWatch metrics
import boto3
cloudwatch = boto3.client('cloudwatch')
cloudwatch.put_metric_data(
    Namespace='YSH/Pipeline',
    MetricData=[{
        'MetricName': 'ItemsProcessed',
        'Value': len(results),
        'Unit': 'Count'
    }]
)
```

---

**Status**: 📋 Ready for Implementation  
**Estimated Setup Time**: 2 weeks  
**Monthly Cost**: $0-10 (AWS Free Tier optimized)
