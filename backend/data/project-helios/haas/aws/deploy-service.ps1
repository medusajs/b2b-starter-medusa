# HaaS Platform - ECS Service Deployment Script
# PowerShell script to build, push Docker image and deploy ECS service

param(
    [Parameter(Mandatory = $false)]
    [ValidateSet('development', 'staging', 'production')]
    [string]$Environment = 'development',
    
    [Parameter(Mandatory = $false)]
    [string]$AWSProfile = 'default',
    
    [Parameter(Mandatory = $false)]
    [string]$AWSRegion = 'us-east-1',
    
    [Parameter(Mandatory = $false)]
    [string]$ImageTag = 'latest',
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory = $false)]
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

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

# Set AWS profile
$env:AWS_PROFILE = $AWSProfile
$env:AWS_DEFAULT_REGION = $AWSRegion

Write-Info "Environment: $Environment"
Write-Info "Image Tag: $ImageTag"

# Load deployment configuration
$configFile = "deployment-config-$Environment.json"
if (-not (Test-Path $configFile)) {
    Write-Error "Configuration file not found: $configFile"
    Write-Info "Run deploy-infrastructure.ps1 first"
    exit 1
}

Write-Step "Loading deployment configuration..."
$config = Get-Content $configFile | ConvertFrom-Json
Write-Success "Configuration loaded"

# Get AWS Account ID
Write-Step "Getting AWS account information..."
$accountId = aws sts get-caller-identity --query Account --output text
Write-Success "Account ID: $accountId"

# ECR repository name
$ecrRepo = "haas-api"
$ecrUri = "$accountId.dkr.ecr.$AWSRegion.amazonaws.com/$ecrRepo"

# Create ECR repository if it doesn't exist
Write-Step "Checking ECR repository..."
$repoExists = aws ecr describe-repositories `
    --repository-names $ecrRepo `
    --region $AWSRegion 2>$null

if (-not $?) {
    Write-Info "Creating ECR repository: $ecrRepo"
    aws ecr create-repository `
        --repository-name $ecrRepo `
        --image-scanning-configuration scanOnPush=true `
        --encryption-configuration encryptionType=AES256 `
        --region $AWSRegion
    Write-Success "ECR repository created"
}
else {
    Write-Success "ECR repository already exists"
}

if (-not $SkipBuild) {
    # Build Docker image
    Write-Step "Building Docker image..."
    $dockerfilePath = "..\Dockerfile"
    
    if (-not (Test-Path $dockerfilePath)) {
        Write-Error "Dockerfile not found at: $dockerfilePath"
        exit 1
    }
    
    if ($DryRun) {
        Write-Info "DRY RUN MODE - Would build Docker image"
    }
    else {
        docker build -t $ecrRepo`:$ImageTag -f $dockerfilePath ..
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker build failed"
            exit 1
        }
        Write-Success "Docker image built successfully"
    }
    
    # Tag image for ECR
    Write-Step "Tagging image for ECR..."
    docker tag $ecrRepo`:$ImageTag $ecrUri`:$ImageTag
    docker tag $ecrRepo`:$ImageTag $ecrUri`:latest
    Write-Success "Image tagged"
    
    # Login to ECR
    Write-Step "Logging in to ECR..."
    aws ecr get-login-password --region $AWSRegion | docker login --username AWS --password-stdin $ecrUri
    if ($LASTEXITCODE -ne 0) {
        Write-Error "ECR login failed"
        exit 1
    }
    Write-Success "Logged in to ECR"
    
    # Push image to ECR
    Write-Step "Pushing image to ECR..."
    if ($DryRun) {
        Write-Info "DRY RUN MODE - Would push to: $ecrUri`:$ImageTag"
    }
    else {
        docker push $ecrUri`:$ImageTag
        docker push $ecrUri`:latest
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker push failed"
            exit 1
        }
        Write-Success "Image pushed to ECR"
    }
}
else {
    Write-Info "Skipping Docker build (--SkipBuild flag)"
}

# Update task definition with actual values
Write-Step "Preparing ECS task definition..."
$taskDefFile = "haas-api-task-definition.json"
$taskDef = Get-Content $taskDefFile -Raw | ConvertFrom-Json

# Update image URI
$taskDef.containerDefinitions[0].image = "$ecrUri`:$ImageTag"

# Update secrets ARNs
$taskDef.containerDefinitions[0].secrets = @(
    @{
        name      = "DATABASE_URL"
        valueFrom = "arn:aws:secretsmanager:$AWSRegion`:$accountId`:secret:haas/database-url"
    },
    @{
        name      = "REDIS_URL"
        valueFrom = "arn:aws:secretsmanager:$AWSRegion`:$accountId`:secret:haas/redis-url"
    },
    @{
        name      = "JWT_SECRET"
        valueFrom = "arn:aws:secretsmanager:$AWSRegion`:$accountId`:secret:haas/jwt-secret"
    },
    @{
        name      = "S3_BUCKET"
        valueFrom = "arn:aws:secretsmanager:$AWSRegion`:$accountId`:secret:haas/s3-bucket"
    }
)

# Update task/execution role ARNs
$taskDef.taskRoleArn = $config.TaskRoleArn
$taskDef.executionRoleArn = $config.TaskExecutionRoleArn

# Update log group
$taskDef.containerDefinitions[0].logConfiguration.options.'awslogs-group' = "/ecs/$Environment-haas-api"

# Save updated task definition
$updatedTaskDefFile = "haas-api-task-definition-$Environment.json"
$taskDef | ConvertTo-Json -Depth 10 | Out-File -FilePath $updatedTaskDefFile -Encoding UTF8
Write-Success "Task definition prepared: $updatedTaskDefFile"

# Register task definition
Write-Step "Registering task definition..."
if ($DryRun) {
    Write-Info "DRY RUN MODE - Would register task definition"
    $taskDefArn = "arn:aws:ecs:$AWSRegion`:$accountId`:task-definition/haas-api-production:1"
}
else {
    $registerResult = aws ecs register-task-definition `
        --cli-input-json "file://$updatedTaskDefFile" `
        --region $AWSRegion | ConvertFrom-Json
    
    $taskDefArn = $registerResult.taskDefinition.taskDefinitionArn
    Write-Success "Task definition registered: $taskDefArn"
}

# Get subnet IDs from VPC
Write-Step "Getting subnet information..."
$subnets = aws ec2 describe-subnets `
    --filters "Name=vpc-id,Values=$($config.VPCId)" "Name=tag:Name,Values=*private*" `
    --query 'Subnets[*].SubnetId' `
    --output json `
    --region $AWSRegion | ConvertFrom-Json

$subnetIds = $subnets -join ','
Write-Success "Found subnets: $subnetIds"

# Check if service exists
$serviceName = "haas-api-service"
Write-Step "Checking if ECS service exists..."
$serviceExists = aws ecs describe-services `
    --cluster $config.ClusterName `
    --services $serviceName `
    --region $AWSRegion `
    --query 'services[?status==`ACTIVE`]' `
    --output json | ConvertFrom-Json

if ($serviceExists -and $serviceExists.Count -gt 0) {
    Write-Info "Service exists, updating..."
    
    if ($DryRun) {
        Write-Info "DRY RUN MODE - Would update service"
    }
    else {
        aws ecs update-service `
            --cluster $config.ClusterName `
            --service $serviceName `
            --task-definition $taskDefArn `
            --desired-count 2 `
            --region $AWSRegion
        
        Write-Success "Service updated"
    }
}
else {
    Write-Info "Creating new ECS service..."
    
    if ($DryRun) {
        Write-Info "DRY RUN MODE - Would create service"
    }
    else {
        aws ecs create-service `
            --cluster $config.ClusterName `
            --service-name $serviceName `
            --task-definition $taskDefArn `
            --desired-count 2 `
            --launch-type FARGATE `
            --network-configuration "awsvpcConfiguration={subnets=[$subnetIds],securityGroups=[$($config.ECSSecurityGroup)],assignPublicIp=DISABLED}" `
            --load-balancers "targetGroupArn=$($config.TargetGroupArn),containerName=haas-api,containerPort=8000" `
            --health-check-grace-period-seconds 60 `
            --region $AWSRegion
        
        Write-Success "Service created"
    }
}

# Display summary
Write-Step "Deployment Summary"
Write-Host @"

========================================
HaaS API Service Deployed
========================================

Environment:          $Environment
Image Tag:            $ImageTag
ECR URI:              $ecrUri`:$ImageTag

Cluster:              $($config.ClusterName)
Service:              $serviceName
Task Definition:      $taskDefArn

Load Balancer:        $($config.ALBDNSName)
Application URL:      http://$($config.ALBDNSName)

========================================

Health Check:         http://$($config.ALBDNSName)/health
API Docs:             http://$($config.ALBDNSName)/docs

To monitor deployment:
aws ecs describe-services --cluster $($config.ClusterName) --services $serviceName --region $AWSRegion

To view logs:
aws logs tail /ecs/$Environment-haas-api --follow --region $AWSRegion

========================================
"@ -ForegroundColor Cyan

Write-Success "Service deployment completed!"
