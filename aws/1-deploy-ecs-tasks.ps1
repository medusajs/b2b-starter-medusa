# ==========================================
# ECS TASK DEPLOYMENT SCRIPT
# Deploys backend and storefront to ECS Fargate
# ==========================================

param(
    [Parameter(Mandatory = $false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory = $false)]
    [string]$SSOProfile = "ysh-production",
    
    [Parameter(Mandatory = $false)]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory = $false)]
    [string]$BackendImage = "public.ecr.aws/docker/library/node:20-alpine",
    
    [Parameter(Mandatory = $false)]
    [string]$StorefrontImage = "public.ecr.aws/docker/library/node:20-alpine",
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipBackend,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipStorefront
)

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Host "
==========================================
🚀 ECS TASK DEPLOYMENT
==========================================
Environment: $Environment
Region: $Region
Profile: $SSOProfile
==========================================
" -ForegroundColor Magenta

# ==========================================
# GET STACK OUTPUTS
# ==========================================

Write-Info "`n[1/6] Getting CloudFormation stack outputs..."

$stackName = "$Environment-ysh-stack"

try {
    $stack = aws cloudformation describe-stacks `
        --stack-name $stackName `
        --region $Region `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    if (-not $stack.Stacks -or $stack.Stacks.Count -eq 0) {
        Write-Error "Stack '$stackName' not found"
        exit 1
    }
    
    $outputs = @{}
    foreach ($output in $stack.Stacks[0].Outputs) {
        $outputs[$output.OutputKey] = $output.OutputValue
    }
    
    Write-Success "✓ Stack outputs retrieved"
    
}
catch {
    Write-Error "Failed to get stack outputs: $_"
    exit 1
}

# Extract required values
$clusterName = $outputs["ECSClusterName"]
$vpcId = $outputs["VPCId"]
$backendTargetGroupArn = $outputs["BackendTargetGroupArn"]
$storefrontTargetGroupArn = $outputs["StorefrontTargetGroupArn"]
$secretsArn = $outputs["SecretsManagerARN"]

Write-Info "  Cluster: $clusterName"
Write-Info "  VPC: $vpcId"

# Get subnets and security groups
Write-Info "`nGetting VPC resources..."

$subnets = aws ec2 describe-subnets `
    --filters "Name=vpc-id,Values=$vpcId" "Name=tag:Name,Values=*private*" `
    --region $Region `
    --profile $SSOProfile `
    --output json | ConvertFrom-Json

$subnetIds = ($subnets.Subnets | Select-Object -ExpandProperty SubnetId) -join ","

$securityGroups = aws ec2 describe-security-groups `
    --filters "Name=vpc-id,Values=$vpcId" "Name=tag:Name,Values=*ecs*" `
    --region $Region `
    --profile $SSOProfile `
    --output json | ConvertFrom-Json

$sgId = $securityGroups.SecurityGroups[0].GroupId

Write-Success "✓ VPC resources found"
Write-Info "  Subnets: $subnetIds"
Write-Info "  Security Group: $sgId"

# ==========================================
# CREATE BACKEND TASK DEFINITION
# ==========================================

if (-not $SkipBackend) {
    Write-Info "`n[2/6] Creating backend task definition..."
    
    $backendTaskDef = @{
        family                  = "$Environment-ysh-backend"
        networkMode             = "awsvpc"
        requiresCompatibilities = @("FARGATE")
        cpu                     = "256"
        memory                  = "512"
        executionRoleArn        = "arn:aws:iam::${AWS::AccountId}:role/$Environment-ysh-ecs-execution-role"
        taskRoleArn             = "arn:aws:iam::${AWS::AccountId}:role/$Environment-ysh-ecs-task-role"
        containerDefinitions    = @(
            @{
                name             = "backend"
                image            = $BackendImage
                essential        = $true
                portMappings     = @(
                    @{
                        containerPort = 9000
                        protocol      = "tcp"
                    }
                )
                environment      = @(
                    @{ name = "NODE_ENV"; value = "production" }
                    @{ name = "PORT"; value = "9000" }
                )
                secrets          = @(
                    @{ name = "DATABASE_URL"; valueFrom = "$secretsArn:DATABASE_URL::" }
                    @{ name = "REDIS_URL"; valueFrom = "$secretsArn:REDIS_URL::" }
                    @{ name = "JWT_SECRET"; valueFrom = "$secretsArn:JWT_SECRET::" }
                    @{ name = "COOKIE_SECRET"; valueFrom = "$secretsArn:COOKIE_SECRET::" }
                    @{ name = "S3_BUCKET"; valueFrom = "$secretsArn:S3_BUCKET::" }
                    @{ name = "AWS_REGION"; valueFrom = "$secretsArn:AWS_REGION::" }
                    @{ name = "STORE_CORS"; valueFrom = "$secretsArn:STORE_CORS::" }
                    @{ name = "ADMIN_CORS"; valueFrom = "$secretsArn:ADMIN_CORS::" }
                )
                healthCheck      = @{
                    command     = @("CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:9000/health || exit 1")
                    interval    = 30
                    timeout     = 5
                    retries     = 3
                    startPeriod = 60
                }
                logConfiguration = @{
                    logDriver = "awslogs"
                    options   = @{
                        "awslogs-group"         = "/aws/ecs/$Environment-ysh-backend"
                        "awslogs-region"        = $Region
                        "awslogs-stream-prefix" = "ecs"
                    }
                }
            }
        )
    } | ConvertTo-Json -Depth 10
    
    # Register task definition
    $backendTask = aws ecs register-task-definition `
        --cli-input-json $backendTaskDef `
        --region $Region `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    $backendTaskArn = $backendTask.taskDefinition.taskDefinitionArn
    Write-Success "✓ Backend task definition registered: $backendTaskArn"
    
}
else {
    Write-Warning "Skipping backend deployment (--SkipBackend)"
}

# ==========================================
# CREATE STOREFRONT TASK DEFINITION
# ==========================================

if (-not $SkipStorefront) {
    Write-Info "`n[3/6] Creating storefront task definition..."
    
    $storefrontTaskDef = @{
        family                  = "$Environment-ysh-storefront"
        networkMode             = "awsvpc"
        requiresCompatibilities = @("FARGATE")
        cpu                     = "256"
        memory                  = "512"
        executionRoleArn        = "arn:aws:iam::${AWS::AccountId}:role/$Environment-ysh-ecs-execution-role"
        taskRoleArn             = "arn:aws:iam::${AWS::AccountId}:role/$Environment-ysh-ecs-task-role"
        containerDefinitions    = @(
            @{
                name             = "storefront"
                image            = $StorefrontImage
                essential        = $true
                portMappings     = @(
                    @{
                        containerPort = 8000
                        protocol      = "tcp"
                    }
                )
                environment      = @(
                    @{ name = "NODE_ENV"; value = "production" }
                    @{ name = "PORT"; value = "8000" }
                )
                secrets          = @(
                    @{ name = "NEXT_PUBLIC_MEDUSA_BACKEND_URL"; valueFrom = "$secretsArn:DOMAIN_NAME::" }
                )
                healthCheck      = @{
                    command     = @("CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:8000 || exit 1")
                    interval    = 30
                    timeout     = 5
                    retries     = 3
                    startPeriod = 60
                }
                logConfiguration = @{
                    logDriver = "awslogs"
                    options   = @{
                        "awslogs-group"         = "/aws/ecs/$Environment-ysh-storefront"
                        "awslogs-region"        = $Region
                        "awslogs-stream-prefix" = "ecs"
                    }
                }
            }
        )
    } | ConvertTo-Json -Depth 10
    
    # Register task definition
    $storefrontTask = aws ecs register-task-definition `
        --cli-input-json $storefrontTaskDef `
        --region $Region `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    $storefrontTaskArn = $storefrontTask.taskDefinition.taskDefinitionArn
    Write-Success "✓ Storefront task definition registered: $storefrontTaskArn"
    
}
else {
    Write-Warning "Skipping storefront deployment (--SkipStorefront)"
}

# ==========================================
# CREATE BACKEND SERVICE
# ==========================================

if (-not $SkipBackend) {
    Write-Info "`n[4/6] Creating backend ECS service..."
    
    # Check if service exists
    $existingServices = aws ecs describe-services `
        --cluster $clusterName `
        --services "$Environment-ysh-backend" `
        --region $Region `
        --profile $SSOProfile `
        --output json 2>&1 | ConvertFrom-Json
    
    if ($existingServices.services -and $existingServices.services[0].status -ne "INACTIVE") {
        Write-Warning "Backend service already exists. Updating..."
        
        aws ecs update-service `
            --cluster $clusterName `
            --service "$Environment-ysh-backend" `
            --task-definition $backendTaskArn `
            --force-new-deployment `
            --region $Region `
            --profile $SSOProfile | Out-Null
        
        Write-Success "✓ Backend service updated"
        
    }
    else {
        Write-Info "Creating new backend service..."
        
        $backendServiceConfig = @{
            cluster                       = $clusterName
            serviceName                   = "$Environment-ysh-backend"
            taskDefinition                = $backendTaskArn
            desiredCount                  = 1
            launchType                    = "FARGATE"
            platformVersion               = "LATEST"
            networkConfiguration          = @{
                awsvpcConfiguration = @{
                    subnets        = $subnetIds -split ","
                    securityGroups = @($sgId)
                    assignPublicIp = "DISABLED"
                }
            }
            loadBalancers                 = @(
                @{
                    targetGroupArn = $backendTargetGroupArn
                    containerName  = "backend"
                    containerPort  = 9000
                }
            )
            healthCheckGracePeriodSeconds = 60
            deploymentConfiguration       = @{
                maximumPercent        = 200
                minimumHealthyPercent = 100
            }
        } | ConvertTo-Json -Depth 10
        
        aws ecs create-service `
            --cli-input-json $backendServiceConfig `
            --region $Region `
            --profile $SSOProfile | Out-Null
        
        Write-Success "✓ Backend service created"
    }
}

# ==========================================
# CREATE STOREFRONT SERVICE
# ==========================================

if (-not $SkipStorefront) {
    Write-Info "`n[5/6] Creating storefront ECS service..."
    
    # Check if service exists
    $existingServices = aws ecs describe-services `
        --cluster $clusterName `
        --services "$Environment-ysh-storefront" `
        --region $Region `
        --profile $SSOProfile `
        --output json 2>&1 | ConvertFrom-Json
    
    if ($existingServices.services -and $existingServices.services[0].status -ne "INACTIVE") {
        Write-Warning "Storefront service already exists. Updating..."
        
        aws ecs update-service `
            --cluster $clusterName `
            --service "$Environment-ysh-storefront" `
            --task-definition $storefrontTaskArn `
            --force-new-deployment `
            --region $Region `
            --profile $SSOProfile | Out-Null
        
        Write-Success "✓ Storefront service updated"
        
    }
    else {
        Write-Info "Creating new storefront service..."
        
        $storefrontServiceConfig = @{
            cluster                       = $clusterName
            serviceName                   = "$Environment-ysh-storefront"
            taskDefinition                = $storefrontTaskArn
            desiredCount                  = 1
            launchType                    = "FARGATE"
            platformVersion               = "LATEST"
            networkConfiguration          = @{
                awsvpcConfiguration = @{
                    subnets        = $subnetIds -split ","
                    securityGroups = @($sgId)
                    assignPublicIp = "DISABLED"
                }
            }
            loadBalancers                 = @(
                @{
                    targetGroupArn = $storefrontTargetGroupArn
                    containerName  = "storefront"
                    containerPort  = 8000
                }
            )
            healthCheckGracePeriodSeconds = 60
            deploymentConfiguration       = @{
                maximumPercent        = 200
                minimumHealthyPercent = 100
            }
        } | ConvertTo-Json -Depth 10
        
        aws ecs create-service `
            --cli-input-json $storefrontServiceConfig `
            --region $Region `
            --profile $SSOProfile | Out-Null
        
        Write-Success "✓ Storefront service created"
    }
}

# ==========================================
# WAIT FOR SERVICES TO STABILIZE
# ==========================================

Write-Info "`n[6/6] Waiting for services to become stable..."
Write-Info "This may take 3-5 minutes..."

$services = @()
if (-not $SkipBackend) { $services += "$Environment-ysh-backend" }
if (-not $SkipStorefront) { $services += "$Environment-ysh-storefront" }

foreach ($service in $services) {
    Write-Info "`nWaiting for $service..."
    
    aws ecs wait services-stable `
        --cluster $clusterName `
        --services $service `
        --region $Region `
        --profile $SSOProfile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✓ $service is stable"
    }
    else {
        Write-Error "✗ $service failed to stabilize"
    }
}

# ==========================================
# VERIFY DEPLOYMENT
# ==========================================

Write-Info "`n==========================================
📊 DEPLOYMENT STATUS
==========================================
"

foreach ($service in $services) {
    $serviceDetails = aws ecs describe-services `
        --cluster $clusterName `
        --services $service `
        --region $Region `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    $svc = $serviceDetails.services[0]
    
    Write-Host "`n$($svc.serviceName):" -ForegroundColor Cyan
    Write-Host "  Status: $($svc.status)" -ForegroundColor White
    Write-Host "  Running Tasks: $($svc.runningCount)" -ForegroundColor White
    Write-Host "  Desired Tasks: $($svc.desiredCount)" -ForegroundColor White
    Write-Host "  Task Definition: $($svc.taskDefinition)" -ForegroundColor Gray
}

# Get task ARNs for next steps
Write-Info "`n==========================================
📝 TASK INFORMATION
==========================================
"

if (-not $SkipBackend) {
    $backendTasks = aws ecs list-tasks `
        --cluster $clusterName `
        --service-name "$Environment-ysh-backend" `
        --region $Region `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    if ($backendTasks.taskArns) {
        Write-Success "`nBackend Task ARN (for migrations):"
        Write-Host "  $($backendTasks.taskArns[0])" -ForegroundColor Yellow
        
        # Save to file for next script
        $backendTasks.taskArns[0] | Out-File -FilePath "$PSScriptRoot\.backend-task-arn" -Encoding utf8
    }
}

Write-Host "

==========================================
✅ ECS DEPLOYMENT COMPLETE
==========================================

Next steps:
1. Run database migrations: .\2-setup-database.ps1
2. Configure monitoring: .\3-setup-monitoring.ps1
3. Update storefront env: .\4-configure-env.ps1

View logs:
  aws logs tail /aws/ecs/$Environment-ysh-backend --follow --profile $SSOProfile
  aws logs tail /aws/ecs/$Environment-ysh-storefront --follow --profile $SSOProfile

" -ForegroundColor Green
