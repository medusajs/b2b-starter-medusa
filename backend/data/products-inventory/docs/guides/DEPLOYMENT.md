# YSH Solar as a Service - Production Deployment Guide

## 📋 Overview

Complete production deployment guide for the Yello Solar Hub ecosystem on AWS ECS Fargate with unified API gateway.

## 🏗️ Architecture

```tsx
┌─────────────────────────────────────────────────────────────────┐
│                        Internet Traffic                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                    ┌───────▼──────┐
                    │  Route 53    │ (DNS)
                    └───────┬──────┘
                            │
                    ┌───────▼──────┐
                    │  CloudFront  │ (CDN - optional)
                    └───────┬──────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
┌───────▼──────┐                       ┌───────▼──────┐
│  ALB (Port   │                       │  ALB (Port   │
│  80/443)     │                       │  8080)       │
└───────┬──────┘                       └───────┬──────┘
        │                                       │
        │  ┌────────────────────────────────────┘
        │  │
        │  │    ┌────────────────────────────────┐
        │  │    │   Unified API Gateway (8080)   │
        │  │    │   - Route management           │
        │  │    │   - JWT validation             │
        │  │    │   - Rate limiting              │
        │  │    └────────┬───────────────────────┘
        │  │             │
        │  │    ┌────────┴───────────┬────────────┐
        │  │    │                    │            │
        │  │    │                    │            │
┌───────▼──▼────▼─┐      ┌───────────▼──┐   ┌────▼──────────┐
│  Medusa Backend │      │   HaaS API   │   │ Data Platform │
│  (Port 9000)    │      │  (Port 8000) │   │  (Port 8001)  │
│  ECS Fargate    │      │ ECS Fargate  │   │  ECS Fargate  │
└─────────────────┘      └──────────────┘   └───────────────┘
        │                        │                    │
        │                        │                    │
        └────────────┬───────────┴─────┬──────────────┘
                     │                 │
         ┌───────────▼──┐    ┌─────────▼──────┐
         │  RDS         │    │  ElastiCache   │
         │  PostgreSQL  │    │  Redis         │
         │  (Port 5432) │    │  (Port 6379)   │
         └──────────────┘    └────────────────┘
```

## 🚀 Quick Start

### Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Docker** installed locally
4. **PowerShell** 5.1+ (Windows) or PowerShell Core (cross-platform)
5. **Git** for version control

### Step 1: Clone Repositories

```powershell
# Clone all YSH repositories
git clone https://github.com/yellosolar/ysh-store.git
git clone https://github.com/yellosolar/project-helios.git
git clone https://github.com/yellosolar/data-platform.git
```

### Step 2: Configure Environment Variables

Create `.env` file in project root:

```env
# Environment
ENVIRONMENT=production

# AWS Configuration
AWS_PROFILE=default
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012

# Database
DB_USERNAME=haas_admin
DB_PASSWORD=<generate-secure-password>

# JWT Configuration
JWT_SECRET=<generate-secure-secret>
JWT_ALGORITHM=HS256

# Service URLs (internal)
MEDUSA_URL=http://medusa-backend:9000
HAAS_URL=http://haas-api:8000
DATA_PLATFORM_URL=http://data-platform:8001

# CORS Origins
CORS_ORIGINS=https://yellosolar.com,https://haas.yellosolar.com

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
NEW_RELIC_LICENSE_KEY=<your-newrelic-key>
```

### Step 3: Deploy Infrastructure

```powershell
cd project-helios/haas/aws

# Deploy VPC, RDS, ElastiCache, ECS Cluster, ALB
.\deploy-infrastructure.ps1 -Environment production -AWSProfile default -AWSRegion us-east-1

# Output will show:
# - VPC ID
# - ECS Cluster name
# - ALB DNS name
# - RDS endpoint
# - Redis endpoint
# - S3 bucket name
```

This creates:

- ✅ VPC with public/private subnets across 2 AZs
- ✅ RDS PostgreSQL 15 (Multi-AZ)
- ✅ ElastiCache Redis 7
- ✅ Application Load Balancer
- ✅ ECS Fargate cluster
- ✅ S3 bucket for documents
- ✅ Security groups and IAM roles
- ✅ CloudWatch log groups
- ✅ Secrets Manager entries

### Step 4: Deploy Services

```powershell
# Deploy HaaS API
cd project-helios/haas/aws
.\deploy-service.ps1 -Environment production -ImageTag v1.0.0

# Deploy Medusa Backend (similar process)
cd ysh-store/backend
# ... deploy medusa service

# Deploy Data Platform (similar process)
cd data-platform
# ... deploy data platform service
```

### Step 5: Deploy Unified API Gateway

```powershell
cd products-inventory

# Build and run with Docker Compose
docker-compose -f docker-compose.gateway.yml up -d

# Or deploy to ECS (recommended for production)
# Similar to deploy-service.ps1 but for gateway
```

### Step 6: Configure DNS (Optional)

```powershell
# Point your domain to ALB
# Example with Route 53:
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "api.yellosolar.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "<ALB-HOSTED-ZONE-ID>",
          "DNSName": "<ALB-DNS-NAME>",
          "EvaluateTargetHealth": true
        }
      }
    }]
  }'
```

### Step 7: Run Database Migrations

```powershell
# HaaS Platform migrations
docker run --rm \
  -e DATABASE_URL=<rds-connection-string> \
  haas-api:latest \
  alembic upgrade head

# Medusa migrations
docker run --rm \
  -e DATABASE_URL=<rds-connection-string> \
  medusajs/medusa:latest \
  medusa migrations run
```

### Step 8: Verify Deployment

```powershell
# Test gateway health
curl http://<gateway-alb-dns>/gateway/health

# Test HaaS API through gateway
curl http://<gateway-alb-dns>/api/haas/health

# Test Medusa through gateway
curl http://<gateway-alb-dns>/api/ecommerce/health

# Test Data Platform through gateway
curl http://<gateway-alb-dns>/api/data/health
```

## 📊 Monitoring & Observability

### CloudWatch Dashboards

```powershell
# Create CloudWatch dashboard
aws cloudwatch put-dashboard \
  --dashboard-name YSH-Production \
  --dashboard-body file://cloudwatch-dashboard.json
```

### Log Aggregation

```powershell
# View ECS logs
aws logs tail /ecs/production-haas-api --follow

# View gateway logs
aws logs tail /ecs/production-gateway --follow

# Query logs with Logs Insights
aws logs start-query \
  --log-group-name /ecs/production-haas-api \
  --start-time $(date -u -d '1 hour ago' +%s) \
  --end-time $(date -u +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 20'
```

### Alerts (CloudWatch Alarms)

```powershell
# High error rate alert
aws cloudwatch put-metric-alarm \
  --alarm-name haas-api-high-error-rate \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name 5XXError \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 300 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

## 🔐 Security Best Practices

### 1. Secrets Management

- ✅ All secrets stored in AWS Secrets Manager
- ✅ Automatic rotation enabled for database credentials
- ✅ No hardcoded secrets in code or Docker images
- ✅ IAM roles for service-to-service communication

### 2. Network Security

- ✅ Services in private subnets (no direct internet access)
- ✅ ALB in public subnets only
- ✅ Security groups restrict traffic to necessary ports
- ✅ VPC Flow Logs enabled

### 3. Application Security

- ✅ JWT authentication on all endpoints
- ✅ Rate limiting (100 req/min per IP)
- ✅ CORS configured for allowed origins only
- ✅ HTTPS enforced (redirect HTTP to HTTPS)

### 4. Data Security

- ✅ RDS encryption at rest (AES-256)
- ✅ S3 bucket encryption enabled
- ✅ Redis encryption in transit
- ✅ Regular automated backups

## 📈 Scaling Configuration

### Auto Scaling

```yaml
# ECS Service Auto Scaling
TargetTrackingScaling:
  TargetValue: 75.0  # CPU utilization
  ScaleInCooldown: 300
  ScaleOutCooldown: 60
  
MinCapacity: 2
MaxCapacity: 10
```

### Load Testing

```powershell
# Install k6
choco install k6

# Run load test
k6 run --vus 100 --duration 30s load-test.js
```

## 🛠️ Troubleshooting

### Service Not Starting

```powershell
# Check ECS service events
aws ecs describe-services \
  --cluster production-haas-cluster \
  --services haas-api-service \
  --query 'services[0].events[0:5]'

# Check task logs
aws logs tail /ecs/production-haas-api --since 10m
```

### High Latency

```powershell
# Check ALB target health
aws elbv2 describe-target-health \
  --target-group-arn <target-group-arn>

# Check RDS performance
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=production-haas-postgres \
  --start-time $(date -u -d '1 hour ago' +%s) \
  --end-time $(date -u +%s) \
  --period 300 \
  --statistics Average
```

### Database Connection Issues

```powershell
# Test database connectivity from ECS task
aws ecs execute-command \
  --cluster production-haas-cluster \
  --task <task-id> \
  --container haas-api \
  --command "psql $DATABASE_URL -c 'SELECT 1'"
```

## 🔄 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          pip install -r requirements-dev.txt
          pytest --cov --cov-fail-under=80
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to ECS
        run: |
          ./aws/deploy-service.ps1 -Environment production -ImageTag ${{ github.sha }}
```

## 📝 Maintenance

### Regular Tasks

1. **Weekly**:
   - Review CloudWatch alarms and logs
   - Check ECS service health
   - Verify backup completion

2. **Monthly**:
   - Review and optimize costs
   - Update dependencies (security patches)
   - Rotate secrets

3. **Quarterly**:
   - Load testing
   - Disaster recovery drills
   - Architecture review

### Backup & Restore

```powershell
# Manual RDS snapshot
aws rds create-db-snapshot \
  --db-instance-identifier production-haas-postgres \
  --db-snapshot-identifier manual-snapshot-$(date +%Y%m%d)

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier production-haas-postgres-restored \
  --db-snapshot-identifier manual-snapshot-20240101
```

## 🎯 Performance Targets

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| API Response Time (p95) | < 500ms | > 1000ms |
| Error Rate | < 0.1% | > 1% |
| Availability | 99.9% | < 99.5% |
| Database CPU | < 70% | > 85% |
| ECS CPU | < 75% | > 90% |
| ECS Memory | < 80% | > 95% |

## 🔗 Useful Links

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Medusa.js Documentation](https://docs.medusajs.com/)
- [YSH Integration Guide](./YSH-SOLAR-AS-A-SERVICE-INTEGRATION.md)
- [INTEGRATION SUMMARY](./INTEGRATION-SUMMARY.md)

## 📞 Support

For deployment issues or questions:

- Email: <devops@yellosolar.com>
- Slack: #ysh-infrastructure
- On-call: Check PagerDuty

---

**Last Updated**: 2024-01-15  
**Version**: 1.0.0  
**Maintained by**: YSH DevOps Team
