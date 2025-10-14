# YSH AWS Infrastructure - Deployment Guide

## 🚀 Quick Start

### 1. Prerequisites

```powershell
# Install Terraform
choco install terraform

# Verify installation
terraform --version

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1)
```

### 2. Initialize Terraform

```powershell
cd workflows/aws/terraform

# Initialize
terraform init

# Validate configuration
terraform validate
```

### 3. Plan Deployment

```powershell
# See what will be created
terraform plan

# Save plan to file
terraform plan -out=tfplan
```

### 4. Deploy Infrastructure

```powershell
# Apply configuration
terraform apply

# Or use saved plan
terraform apply tfplan
```

### 5. Verify Deployment

```powershell
# Show outputs
terraform output

# Test API Gateway
$apiUrl = terraform output -raw api_gateway_url
Invoke-RestMethod "$apiUrl/health"
```

## 📦 Resources Created

### Free Tier Resources

1. **S3 Bucket** (`ysh-pipeline-data-dev`)
   - Storage: 5 GB FREE
   - Requests: 20k GET, 2k PUT FREE
   - Lifecycle: Delete after 30 days

2. **DynamoDB Table** (`ysh-pipeline-cache`)
   - Storage: 25 GB FREE
   - Capacity: 25 RCU/WCU FREE
   - TTL: Automatic cleanup

3. **Lambda Functions** (2 functions)
   - Requests: 1M FREE/month
   - Compute: 400k GB-seconds FREE
   - `aneel-fetcher`: 512 MB, 5 min timeout
   - `ai-processor`: 1024 MB, 5 min timeout

4. **Step Functions** (2 state machines)
   - Transitions: 4,000 FREE/month
   - `ingestion-workflow`: Daily pipeline
   - `fallback-workflow`: Recovery logic

5. **EventBridge Scheduler**
   - Rules: FREE (unlimited)
   - Daily trigger at 2 AM

6. **SNS Topic** (`ysh-pipeline-notifications`)
   - Publishes: 1M FREE/month
   - Emails: 1,000 FREE/month

7. **API Gateway** (`ysh-pipeline-api`)
   - Calls: 1M FREE/month
   - REST API

8. **CloudWatch Alarms** (2 alarms)
   - Metrics: 10 FREE custom metrics
   - Lambda errors
   - DynamoDB throttling

## 💰 Cost Optimization

### Free Tier Strategy

```hcl
# Stay within free tier limits:

# Lambda: Limit invocations
- Daily: 1 execution (ingestion)
- Hourly: 24 executions (checks)
- Monthly: ~750 executions << 1M limit ✅

# S3: Keep only 30 days
- ~1 GB of data << 5 GB limit ✅

# DynamoDB: On-demand pricing
- Low traffic << 25 GB storage ✅

# Step Functions: Optimize transitions
- Daily workflow: ~10 transitions
- Monthly: 300 transitions << 4,000 limit ✅
```

### Beyond Free Tier

```
If usage exceeds free tier:

Lambda (extra 100k requests): $0.20
S3 (extra 5 GB): $0.115/GB = $0.575
DynamoDB (extra 1M reads): $0.25
Data Transfer (1 GB out): $0.09

Total: ~$1-2/month extra
```

## 🔧 Configuration

### Environment Variables

```powershell
# Set variables
$env:TF_VAR_aws_region="us-east-1"
$env:TF_VAR_environment="dev"
$env:TF_VAR_notification_email="admin@ysh.com"
$env:TF_VAR_ollama_endpoint="http://ollama:11434"

# Or create terraform.tfvars
```

### terraform.tfvars Example

```hcl
aws_region         = "us-east-1"
environment        = "dev"
project_name       = "ysh-pipeline"
notification_email = "admin@ysh.com"
ollama_endpoint    = "http://ollama:11434"
```

## 📋 Lambda Deployment

### Package Lambda Functions

```powershell
# Create directories
mkdir lambda_packages

# Package ANEEL fetcher
cd ../lambda/aneel_fetcher
pip install -r requirements.txt -t .
Compress-Archive -Path * -DestinationPath ../../terraform/lambda_packages/aneel_fetcher.zip

# Package AI processor
cd ../ai_processor
pip install -r requirements.txt -t .
Compress-Archive -Path * -DestinationPath ../../terraform/lambda_packages/ai_processor.zip

cd ../../terraform
```

### Update Lambda Code

```powershell
# Update function code
aws lambda update-function-code `
  --function-name ysh-pipeline-aneel-fetcher `
  --zip-file fileb://lambda_packages/aneel_fetcher.zip

# Verify update
aws lambda get-function `
  --function-name ysh-pipeline-aneel-fetcher `
  --query 'Configuration.[FunctionName,LastModified]'
```

## 🧪 Testing

### Test Lambda Functions

```powershell
# Invoke ANEEL fetcher
aws lambda invoke `
  --function-name ysh-pipeline-aneel-fetcher `
  --payload '{"action":"fetch_all"}' `
  output.json

# View result
Get-Content output.json | ConvertFrom-Json
```

### Test Step Functions

```powershell
# Start execution
$stateMachineArn = terraform output -raw step_functions | ConvertFrom-Json | Select-Object -ExpandProperty ingestion_workflow

aws stepfunctions start-execution `
  --state-machine-arn $stateMachineArn `
  --input '{"action":"fetch_all"}'

# Check status
aws stepfunctions describe-execution `
  --execution-arn <execution-arn>
```

### Test API Gateway

```powershell
# Get API URL
$apiUrl = terraform output -raw api_gateway_url

# Health check
Invoke-RestMethod "$apiUrl/health"

# Get datasets
Invoke-RestMethod "$apiUrl/api/v1/datasets?limit=5"
```

## 📊 Monitoring

### CloudWatch Logs

```powershell
# Lambda logs
aws logs tail /aws/lambda/ysh-pipeline-aneel-fetcher --follow

# Step Functions logs
aws logs tail /aws/vendedlogs/states/ysh-pipeline-ingestion-workflow --follow
```

### CloudWatch Metrics

```powershell
# Lambda invocations
aws cloudwatch get-metric-statistics `
  --namespace AWS/Lambda `
  --metric-name Invocations `
  --dimensions Name=FunctionName,Value=ysh-pipeline-aneel-fetcher `
  --start-time 2025-01-15T00:00:00Z `
  --end-time 2025-01-15T23:59:59Z `
  --period 3600 `
  --statistics Sum

# DynamoDB consumed capacity
aws cloudwatch get-metric-statistics `
  --namespace AWS/DynamoDB `
  --metric-name ConsumedReadCapacityUnits `
  --dimensions Name=TableName,Value=ysh-pipeline-cache `
  --start-time 2025-01-15T00:00:00Z `
  --end-time 2025-01-15T23:59:59Z `
  --period 3600 `
  --statistics Sum
```

## 🔄 Updates

### Update Infrastructure

```powershell
# Modify main.tf
# Then apply changes
terraform plan
terraform apply

# Target specific resource
terraform apply -target=aws_lambda_function.aneel_fetcher
```

### Rollback Changes

```powershell
# View state
terraform show

# Rollback to previous version
terraform state pull > backup.tfstate
terraform state push backup.tfstate
```

## 🗑️ Cleanup

### Destroy All Resources

```powershell
# Preview deletion
terraform plan -destroy

# Destroy infrastructure
terraform destroy

# Confirm with 'yes'
```

### Delete S3 Bucket

```powershell
# Empty bucket first
aws s3 rm s3://ysh-pipeline-data-dev --recursive

# Then destroy
terraform destroy
```

## 🔐 Security

### IAM Best Practices

```hcl
# Principle of least privilege
- Lambda can only access S3/DynamoDB
- Step Functions can only invoke Lambda
- API Gateway has no admin access

# Implement in production:
- Enable MFA
- Use IAM roles
- Add API keys
- Enable VPC
- Encrypt S3 buckets
```

### Secrets Management

```powershell
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret `
  --name ysh-pipeline/ollama-endpoint `
  --secret-string "http://ollama:11434"

# Reference in Lambda
$secret = aws secretsmanager get-secret-value `
  --secret-id ysh-pipeline/ollama-endpoint
```

## 📈 Scaling

### Auto-scaling

```hcl
# DynamoDB auto-scaling
resource "aws_appautoscaling_target" "dynamodb_table_read" {
  max_capacity       = 100
  min_capacity       = 5
  resource_id        = "table/${aws_dynamodb_table.pipeline_cache.name}"
  scalable_dimension = "dynamodb:table:ReadCapacityUnits"
  service_namespace  = "dynamodb"
}

# Lambda concurrency
resource "aws_lambda_function" "aneel_fetcher" {
  reserved_concurrent_executions = 10
  # ...
}
```

## 🚀 Production Deployment

### Checklist

- [ ] Enable S3 encryption
- [ ] Add API Gateway authentication
- [ ] Configure VPC for Lambda
- [ ] Enable CloudTrail logging
- [ ] Set up backup policies
- [ ] Configure WAF rules
- [ ] Enable X-Ray tracing
- [ ] Add custom domain
- [ ] Configure SSL certificates
- [ ] Set up monitoring dashboards

---

**Infrastructure Ready!** 🎯 AWS resources deployed with free tier optimization.
