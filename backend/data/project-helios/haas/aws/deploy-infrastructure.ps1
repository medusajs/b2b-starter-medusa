# HaaS Platform - AWS Infrastructure Deployment Script
# PowerShell script to deploy complete AWS ECS infrastructure

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'development',
    
    [Parameter(Mandatory = $false)]
    [string]$AWSProfile = 'default',
    
    [Parameter(Mandatory = $false)]
    [string]$AWSRegion = 'us-east-1',
    
    [Parameter(Mandatory = $false)]
    [switch]$DryRun
)

# Set error action preference
$ErrorActionPreference = 'Stop'

# Colors for output
function Write-Step {
    param([string]$Message)
    Write-Host "`n[STEP] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Yellow
}

# Validate AWS CLI installation
Write-Step "Validating prerequisites..."
try {
    $awsVersion = aws --version
    Write-Success "AWS CLI found: $awsVersion"
}
catch {
    Write-Error "AWS CLI not found. Please install AWS CLI first."
    exit 1
}

# Set AWS profile
$env:AWS_PROFILE = $AWSProfile
$env:AWS_DEFAULT_REGION = $AWSRegion

Write-Info "Environment: $Environment"
Write-Info "AWS Profile: $AWSProfile"
Write-Info "AWS Region: $AWSRegion"

# Generate secure database password
Write-Step "Generating secure database password..."
$DBPassword = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 24 | ForEach-Object { [char]$_ })
Write-Success "Database password generated"

# Generate JWT secret
Write-Step "Generating JWT secret..."
$JWTSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object { [char]$_ })
Write-Success "JWT secret generated"

# CloudFormation stack name
$StackName = "$Environment-haas-infrastructure"

# Deploy CloudFormation stack
Write-Step "Deploying CloudFormation stack: $StackName"

if ($DryRun) {
    Write-Info "DRY RUN MODE - Would deploy with these parameters:"
    Write-Info "  Stack Name: $StackName"
    Write-Info "  Environment: $Environment"
    Write-Info "  Template: cloudformation-haas-infrastructure.yml"
    exit 0
}

try {
    $deployResult = aws cloudformation deploy `
        --template-file cloudformation-haas-infrastructure.yml `
        --stack-name $StackName `
        --parameter-overrides `
        Environment=$Environment `
        DBPassword=$DBPassword `
        --capabilities CAPABILITY_IAM `
        --region $AWSRegion `
        --no-fail-on-empty-changeset
    
    Write-Success "CloudFormation stack deployed successfully"
}
catch {
    Write-Error "Failed to deploy CloudFormation stack: $_"
    exit 1
}

# Wait for stack to be ready
Write-Step "Waiting for stack to complete..."
aws cloudformation wait stack-create-complete --stack-name $StackName --region $AWSRegion
Write-Success "Stack is ready"

# Get stack outputs
Write-Step "Retrieving stack outputs..."
$outputs = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --query 'Stacks[0].Outputs' `
    --output json `
    --region $AWSRegion | ConvertFrom-Json

# Parse outputs
$vpcId = ($outputs | Where-Object { $_.OutputKey -eq 'VPCId' }).OutputValue
$clusterName = ($outputs | Where-Object { $_.OutputKey -eq 'ClusterName' }).OutputValue
$albDns = ($outputs | Where-Object { $_.OutputKey -eq 'ALBDNSName' }).OutputValue
$rdsEndpoint = ($outputs | Where-Object { $_.OutputKey -eq 'RDSEndpoint' }).OutputValue
$redisEndpoint = ($outputs | Where-Object { $_.OutputKey -eq 'RedisEndpoint' }).OutputValue
$documentsBucket = ($outputs | Where-Object { $_.OutputKey -eq 'DocumentsBucketName' }).OutputValue
$ecsSecurityGroup = ($outputs | Where-Object { $_.OutputKey -eq 'ECSSecurityGroupId' }).OutputValue
$targetGroupArn = ($outputs | Where-Object { $_.OutputKey -eq 'TargetGroupArn' }).OutputValue
$taskExecutionRoleArn = ($outputs | Where-Object { $_.OutputKey -eq 'TaskExecutionRoleArn' }).OutputValue
$taskRoleArn = ($outputs | Where-Object { $_.OutputKey -eq 'TaskRoleArn' }).OutputValue

Write-Success "Retrieved all stack outputs"

# Store secrets in AWS Secrets Manager
Write-Step "Storing secrets in AWS Secrets Manager..."

# Database URL
$databaseUrl = "postgresql://haas_admin:$DBPassword@$rdsEndpoint:5432/haas_platform"
aws secretsmanager create-secret `
    --name "haas/database-url" `
    --secret-string $databaseUrl `
    --region $AWSRegion `
    --tags Key=Environment, Value=$Environment 2>$null

if ($?) {
    Write-Success "Database URL stored in Secrets Manager"
}
else {
    Write-Info "Database URL secret may already exist, updating..."
    aws secretsmanager update-secret `
        --secret-id "haas/database-url" `
        --secret-string $databaseUrl `
        --region $AWSRegion
    Write-Success "Database URL updated"
}

# Redis URL
$redisUrl = "redis://$redisEndpoint:6379/0"
aws secretsmanager create-secret `
    --name "haas/redis-url" `
    --secret-string $redisUrl `
    --region $AWSRegion `
    --tags Key=Environment, Value=$Environment 2>$null

if ($?) {
    Write-Success "Redis URL stored in Secrets Manager"
}
else {
    Write-Info "Redis URL secret may already exist, updating..."
    aws secretsmanager update-secret `
        --secret-id "haas/redis-url" `
        --secret-string $redisUrl `
        --region $AWSRegion
    Write-Success "Redis URL updated"
}

# JWT Secret
aws secretsmanager create-secret `
    --name "haas/jwt-secret" `
    --secret-string $JWTSecret `
    --region $AWSRegion `
    --tags Key=Environment, Value=$Environment 2>$null

if ($?) {
    Write-Success "JWT secret stored in Secrets Manager"
}
else {
    Write-Info "JWT secret may already exist, updating..."
    aws secretsmanager update-secret `
        --secret-id "haas/jwt-secret" `
        --secret-string $JWTSecret `
        --region $AWSRegion
    Write-Success "JWT secret updated"
}

# S3 Bucket name
aws secretsmanager create-secret `
    --name "haas/s3-bucket" `
    --secret-string $documentsBucket `
    --region $AWSRegion `
    --tags Key=Environment, Value=$Environment 2>$null

if ($?) {
    Write-Success "S3 bucket name stored in Secrets Manager"
}
else {
    Write-Info "S3 bucket secret may already exist, updating..."
    aws secretsmanager update-secret `
        --secret-id "haas/s3-bucket" `
        --secret-string $documentsBucket `
        --region $AWSRegion
    Write-Success "S3 bucket name updated"
}

# Save configuration to file
Write-Step "Saving deployment configuration..."
$config = @{
    Environment          = $Environment
    Region               = $AWSRegion
    StackName            = $StackName
    VPCId                = $vpcId
    ClusterName          = $clusterName
    ALBDNSName           = $albDns
    RDSEndpoint          = $rdsEndpoint
    RedisEndpoint        = $redisEndpoint
    DocumentsBucket      = $documentsBucket
    ECSSecurityGroup     = $ecsSecurityGroup
    TargetGroupArn       = $targetGroupArn
    TaskExecutionRoleArn = $taskExecutionRoleArn
    TaskRoleArn          = $taskRoleArn
    DeploymentDate       = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
} | ConvertTo-Json -Depth 10

$configFile = "deployment-config-$Environment.json"
$config | Out-File -FilePath $configFile -Encoding UTF8
Write-Success "Configuration saved to: $configFile"

# Display summary
Write-Step "Deployment Summary"
Write-Host @"

========================================
HaaS Platform Infrastructure Deployed
========================================

Environment:          $Environment
Region:               $AWSRegion
Stack Name:           $StackName

VPC ID:               $vpcId
ECS Cluster:          $clusterName
Load Balancer:        $albDns

RDS Endpoint:         $rdsEndpoint
Redis Endpoint:       $redisEndpoint
Documents Bucket:     $documentsBucket

Target Group ARN:     $targetGroupArn
ECS Security Group:   $ecsSecurityGroup

Task Execution Role:  $taskExecutionRoleArn
Task Role:            $taskRoleArn

========================================

Application URL:      http://$albDns

Next Steps:
1. Build and push Docker image to ECR
2. Deploy ECS service using deploy-service.ps1
3. Run database migrations
4. Configure DNS (optional)

Configuration saved to: $configFile
Secrets stored in AWS Secrets Manager

========================================
"@ -ForegroundColor Cyan

Write-Success "Deployment completed successfully!"
