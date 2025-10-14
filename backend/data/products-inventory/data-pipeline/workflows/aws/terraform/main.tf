# YSH Data Pipeline - AWS Infrastructure
# Optimized for AWS Free Tier

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "ysh-terraform-state"
    key    = "pipeline/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "YSH Data Pipeline"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# =============== Variables ===============

variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"  # Free tier eligible
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "ysh-pipeline"
}

# =============== S3 Buckets ===============

# Data storage bucket (5 GB free)
resource "aws_s3_bucket" "pipeline_data" {
  bucket = "${var.project_name}-data-${var.environment}"
  
  tags = {
    Name = "YSH Pipeline Data"
  }
}

resource "aws_s3_bucket_versioning" "pipeline_data" {
  bucket = aws_s3_bucket.pipeline_data.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "pipeline_data" {
  bucket = aws_s3_bucket.pipeline_data.id
  
  rule {
    id     = "delete_old_data"
    status = "Enabled"
    
    # Keep only 30 days (stay within free tier)
    expiration {
      days = 30
    }
    
    # Move to Glacier after 7 days (cheaper)
    transition {
      days          = 7
      storage_class = "GLACIER"
    }
  }
}

# =============== DynamoDB Tables ===============

# Pipeline cache (25 GB free, 25 WCU/RCU free)
resource "aws_dynamodb_table" "pipeline_cache" {
  name           = "${var.project_name}-cache"
  billing_mode   = "PAY_PER_REQUEST"  # Free tier eligible
  hash_key       = "pk"
  range_key      = "sk"
  
  attribute {
    name = "pk"
    type = "S"
  }
  
  attribute {
    name = "sk"
    type = "S"
  }
  
  # TTL for automatic cleanup
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }
  
  tags = {
    Name = "YSH Pipeline Cache"
  }
}

# =============== Lambda Functions ===============

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "${var.project_name}-lambda-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "${var.project_name}-lambda-policy"
  role = aws_iam_role.lambda_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.pipeline_data.arn,
          "${aws_s3_bucket.pipeline_data.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query"
        ]
        Resource = aws_dynamodb_table.pipeline_cache.arn
      },
      {
        Effect = "Allow"
        Action = [
          "states:StartExecution"
        ]
        Resource = aws_sfn_state_machine.ingestion_workflow.arn
      }
    ]
  })
}

# ANEEL Fetcher Lambda
resource "aws_lambda_function" "aneel_fetcher" {
  filename      = "lambda_packages/aneel_fetcher.zip"
  function_name = "${var.project_name}-aneel-fetcher"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handler.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300  # 5 minutes
  memory_size   = 512  # MB (1M requests free, 400k GB-seconds free)
  
  environment {
    variables = {
      S3_BUCKET      = aws_s3_bucket.pipeline_data.id
      DYNAMODB_TABLE = aws_dynamodb_table.pipeline_cache.name
    }
  }
  
  tags = {
    Name = "ANEEL Data Fetcher"
  }
}

# AI Processor Lambda
resource "aws_lambda_function" "ai_processor" {
  filename      = "lambda_packages/ai_processor.zip"
  function_name = "${var.project_name}-ai-processor"
  role          = aws_iam_role.lambda_role.arn
  handler       = "handler.lambda_handler"
  runtime       = "python3.11"
  timeout       = 300
  memory_size   = 1024  # More memory for AI processing
  
  environment {
    variables = {
      S3_BUCKET       = aws_s3_bucket.pipeline_data.id
      OLLAMA_ENDPOINT = var.ollama_endpoint
    }
  }
  
  tags = {
    Name = "AI Data Processor"
  }
}

variable "ollama_endpoint" {
  description = "Ollama API endpoint"
  type        = string
  default     = "http://ollama:11434"
}

# =============== Step Functions ===============

# IAM Role for Step Functions
resource "aws_iam_role" "sfn_role" {
  name = "${var.project_name}-sfn-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "states.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "sfn_policy" {
  name = "${var.project_name}-sfn-policy"
  role = aws_iam_role.sfn_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = [
          aws_lambda_function.aneel_fetcher.arn,
          aws_lambda_function.ai_processor.arn
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem"
        ]
        Resource = aws_dynamodb_table.pipeline_cache.arn
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.pipeline_notifications.arn
      }
    ]
  })
}

# Ingestion Workflow (4,000 transitions free/month)
resource "aws_sfn_state_machine" "ingestion_workflow" {
  name     = "${var.project_name}-ingestion-workflow"
  role_arn = aws_iam_role.sfn_role.arn
  
  definition = file("${path.module}/../step-functions/ingestion-workflow.asl.json")
  
  tags = {
    Name = "YSH Ingestion Workflow"
  }
}

# Fallback Workflow
resource "aws_sfn_state_machine" "fallback_workflow" {
  name     = "${var.project_name}-fallback-workflow"
  role_arn = aws_iam_role.sfn_role.arn
  
  definition = file("${path.module}/../step-functions/fallback-workflow.asl.json")
  
  tags = {
    Name = "YSH Fallback Workflow"
  }
}

# =============== EventBridge Scheduler ===============

# IAM Role for EventBridge
resource "aws_iam_role" "eventbridge_role" {
  name = "${var.project_name}-eventbridge-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "scheduler.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "eventbridge_policy" {
  name = "${var.project_name}-eventbridge-policy"
  role = aws_iam_role.eventbridge_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "states:StartExecution"
      ]
      Resource = aws_sfn_state_machine.ingestion_workflow.arn
    }]
  })
}

# Daily ingestion at 2 AM (FREE)
resource "aws_scheduler_schedule" "daily_ingestion" {
  name       = "${var.project_name}-daily-ingestion"
  group_name = "default"
  
  flexible_time_window {
    mode = "OFF"
  }
  
  schedule_expression = "cron(0 2 * * ? *)"  # 2 AM daily
  
  target {
    arn      = aws_sfn_state_machine.ingestion_workflow.arn
    role_arn = aws_iam_role.eventbridge_role.arn
    
    input = jsonencode({
      action      = "fetch_all"
      include_rss = true
    })
  }
}

# =============== SNS Topics ===============

# Notifications (1M publishes free, 1k emails free)
resource "aws_sns_topic" "pipeline_notifications" {
  name = "${var.project_name}-notifications"
  
  tags = {
    Name = "YSH Pipeline Notifications"
  }
}

resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.pipeline_notifications.arn
  protocol  = "email"
  endpoint  = var.notification_email
}

variable "notification_email" {
  description = "Email for notifications"
  type        = string
  default     = "admin@ysh.com"
}

# =============== API Gateway ===============

# REST API (1M calls free/month)
resource "aws_api_gateway_rest_api" "pipeline_api" {
  name        = "${var.project_name}-api"
  description = "YSH Data Pipeline API"
  
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# Lambda proxy integration
resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.pipeline_api.id
  parent_id   = aws_api_gateway_rest_api.pipeline_api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.pipeline_api.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
}

# Deploy API
resource "aws_api_gateway_deployment" "pipeline_api" {
  depends_on = [
    aws_api_gateway_method.proxy
  ]
  
  rest_api_id = aws_api_gateway_rest_api.pipeline_api.id
  stage_name  = var.environment
}

# =============== CloudWatch Alarms ===============

# Lambda errors (FREE)
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project_name}-lambda-errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Lambda errors > 5 in 5 minutes"
  alarm_actions       = [aws_sns_topic.pipeline_notifications.arn]
  
  dimensions = {
    FunctionName = aws_lambda_function.aneel_fetcher.function_name
  }
}

# DynamoDB throttling
resource "aws_cloudwatch_metric_alarm" "dynamodb_throttles" {
  alarm_name          = "${var.project_name}-dynamodb-throttles"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "UserErrors"
  namespace           = "AWS/DynamoDB"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "DynamoDB throttling detected"
  alarm_actions       = [aws_sns_topic.pipeline_notifications.arn]
  
  dimensions = {
    TableName = aws_dynamodb_table.pipeline_cache.name
  }
}

# =============== Outputs ===============

output "s3_bucket_name" {
  description = "S3 bucket for data storage"
  value       = aws_s3_bucket.pipeline_data.id
}

output "dynamodb_table_name" {
  description = "DynamoDB table for caching"
  value       = aws_dynamodb_table.pipeline_cache.name
}

output "lambda_functions" {
  description = "Lambda function ARNs"
  value = {
    aneel_fetcher = aws_lambda_function.aneel_fetcher.arn
    ai_processor  = aws_lambda_function.ai_processor.arn
  }
}

output "step_functions" {
  description = "Step Functions state machine ARNs"
  value = {
    ingestion_workflow = aws_sfn_state_machine.ingestion_workflow.arn
    fallback_workflow  = aws_sfn_state_machine.fallback_workflow.arn
  }
}

output "api_gateway_url" {
  description = "API Gateway endpoint"
  value       = aws_api_gateway_deployment.pipeline_api.invoke_url
}

output "sns_topic_arn" {
  description = "SNS topic for notifications"
  value       = aws_sns_topic.pipeline_notifications.arn
}

# =============== Cost Estimation ===============

output "estimated_monthly_cost" {
  description = "Estimated monthly AWS cost (USD)"
  value = <<-EOT
  
  FREE TIER USAGE:
  - Lambda: 1M requests/month FREE (400k GB-seconds)
  - S3: 5 GB storage FREE
  - DynamoDB: 25 GB storage FREE, 25 WCU/RCU FREE
  - API Gateway: 1M API calls FREE
  - Step Functions: 4,000 transitions FREE
  - SNS: 1M publishes FREE, 1k emails FREE
  - CloudWatch: 10 custom metrics FREE
  - EventBridge: All rules FREE
  
  ESTIMATED COST (beyond free tier):
  - Lambda (extra): ~$2.00/month
  - S3 (extra): ~$1.15/month
  - DynamoDB (extra): ~$2.50/month
  - Data transfer: ~$1.70/month
  
  TOTAL: ~$7.35/month (assuming moderate usage)
  
  With optimization:
  - Keep within free tier limits: $0/month
  - Use scheduled scaling
  - Implement caching
  - Compress data in S3
  EOT
}
