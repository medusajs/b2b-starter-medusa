#!/bin/bash
# ==========================================
# LocalStack Initialization Script
# Creates S3 buckets, secrets, and initial AWS resources
# ==========================================

set -e

echo "🚀 Initializing LocalStack resources..."

# Wait for LocalStack to be ready
echo "⏳ Waiting for LocalStack to be ready..."
until curl -s http://localstack:4566/_localstack/health | grep -q '"s3": "available"'; do
  sleep 2
done
echo "✅ LocalStack is ready!"

# Configure AWS CLI
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

# Function to run AWS commands with LocalStack endpoint
aws_local() {
  aws --endpoint-url=http://localstack:4566 "$@"
}

echo ""
echo "📦 Creating S3 Buckets..."
aws_local s3 mb s3://ysh-uploads || echo "Bucket ysh-uploads already exists"
aws_local s3 mb s3://ysh-backups || echo "Bucket ysh-backups already exists"
aws_local s3 mb s3://ysh-terraform-state || echo "Bucket ysh-terraform-state already exists"

echo ""
echo "🔐 Creating Secrets Manager secrets..."
aws_local secretsmanager create-secret \
  --name /ysh-b2b/database-url \
  --secret-string "postgres://medusa_user:medusa_password@postgres:5432/medusa_db" \
  2>/dev/null || echo "Secret /ysh-b2b/database-url already exists"

aws_local secretsmanager create-secret \
  --name /ysh-b2b/redis-url \
  --secret-string "redis://redis:6379" \
  2>/dev/null || echo "Secret /ysh-b2b/redis-url already exists"

aws_local secretsmanager create-secret \
  --name /ysh-b2b/jwt-secret \
  --secret-string "dev-jwt-secret-localstack-$(date +%s)" \
  2>/dev/null || echo "Secret /ysh-b2b/jwt-secret already exists"

aws_local secretsmanager create-secret \
  --name /ysh-b2b/cookie-secret \
  --secret-string "dev-cookie-secret-localstack-$(date +%s)" \
  2>/dev/null || echo "Secret /ysh-b2b/cookie-secret already exists"

echo ""
echo "🔑 Creating KMS keys..."
KEY_ID=$(aws_local kms create-key \
  --description "YSH B2B encryption key" \
  --query 'KeyMetadata.KeyId' \
  --output text 2>/dev/null) || echo "KMS key might already exist"

if [ ! -z "$KEY_ID" ]; then
  aws_local kms create-alias \
    --alias-name alias/ysh-b2b \
    --target-key-id "$KEY_ID" 2>/dev/null || echo "Alias already exists"
  echo "KMS Key ID: $KEY_ID"
fi

echo ""
echo "📋 Creating ECR repositories..."
aws_local ecr create-repository \
  --repository-name ysh-b2b-backend \
  --image-scanning-configuration scanOnPush=true \
  2>/dev/null || echo "Repository ysh-b2b-backend already exists"

aws_local ecr create-repository \
  --repository-name ysh-b2b-storefront \
  --image-scanning-configuration scanOnPush=true \
  2>/dev/null || echo "Repository ysh-b2b-storefront already exists"

echo ""
echo "📊 Creating CloudWatch Log Groups..."
aws_local logs create-log-group --log-group-name /ecs/ysh-b2b-backend 2>/dev/null || echo "Log group /ecs/ysh-b2b-backend already exists"
aws_local logs create-log-group --log-group-name /ecs/ysh-b2b-storefront 2>/dev/null || echo "Log group /ecs/ysh-b2b-storefront already exists"

echo ""
echo "📬 Creating SNS topics..."
aws_local sns create-topic --name ysh-alerts 2>/dev/null || echo "Topic ysh-alerts already exists"
aws_local sns create-topic --name ysh-deployments 2>/dev/null || echo "Topic ysh-deployments already exists"

echo ""
echo "📨 Creating SQS queues..."
aws_local sqs create-queue --queue-name ysh-jobs 2>/dev/null || echo "Queue ysh-jobs already exists"
aws_local sqs create-queue --queue-name ysh-dlq 2>/dev/null || echo "Queue ysh-dlq already exists"

echo ""
echo "✅ LocalStack initialization complete!"
echo ""
echo "📝 Summary:"
echo "  - S3 Buckets: ysh-uploads, ysh-backups, ysh-terraform-state"
echo "  - Secrets: /ysh-b2b/* (database, redis, jwt, cookie)"
echo "  - ECR: ysh-b2b-backend, ysh-b2b-storefront"
echo "  - CloudWatch Logs: /ecs/ysh-b2b-*"
echo "  - SNS: ysh-alerts, ysh-deployments"
echo "  - SQS: ysh-jobs, ysh-dlq"
echo ""
echo "🔗 Access LocalStack:"
echo "  - Gateway: http://localhost:4566"
echo "  - Health: http://localhost:4566/_localstack/health"
echo "  - Dashboard: http://localhost:4566/_localstack/dashboard (Pro only)"
echo ""
echo "📚 Usage:"
echo "  awslocal s3 ls"
echo "  awslocal secretsmanager get-secret-value --secret-id /ysh-b2b/database-url"
echo "  awslocal logs tail /ecs/ysh-b2b-backend --follow"
