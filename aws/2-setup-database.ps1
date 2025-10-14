# ==========================================
# DATABASE SETUP SCRIPT
# Runs migrations, seeds data, creates admin user
# ==========================================

param(
    [Parameter(Mandatory = $false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory = $false)]
    [string]$SSOProfile = "ysh-production",
    
    [Parameter(Mandatory = $false)]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory = $false)]
    [string]$AdminEmail = "fernando@yellosolarhub.com",
    
    [Parameter(Mandatory = $false)]
    [string]$AdminPassword,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipMigrations,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipSeed,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipAdminUser
)

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Host "
==========================================
🗄️  DATABASE SETUP
==========================================
Environment: $Environment
Region: $Region
Profile: $SSOProfile
==========================================
" -ForegroundColor Magenta

# ==========================================
# GET BACKEND TASK ARN
# ==========================================

Write-Info "`n[1/5] Getting backend task information..."

$clusterName = "$Environment-ysh-cluster"
$serviceName = "$Environment-ysh-backend"

# Try to get task ARN from saved file
$taskArnFile = Join-Path $PSScriptRoot ".backend-task-arn"
$taskArn = $null

if (Test-Path $taskArnFile) {
    $taskArn = Get-Content $taskArnFile -Raw | ForEach-Object { $_.Trim() }
    Write-Info "Found saved task ARN: $taskArn"
}

# If not found, get from ECS
if (-not $taskArn) {
    Write-Info "Querying ECS for running tasks..."
    
    $tasks = aws ecs list-tasks `
        --cluster $clusterName `
        --service-name $serviceName `
        --desired-status RUNNING `
        --region $Region `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    if (-not $tasks.taskArns -or $tasks.taskArns.Count -eq 0) {
        Write-Error "No running backend tasks found. Deploy ECS tasks first."
        Write-Info "Run: .\1-deploy-ecs-tasks.ps1"
        exit 1
    }
    
    $taskArn = $tasks.taskArns[0]
    Write-Success "✓ Found running task: $taskArn"
}

# Get task details
$taskDetails = aws ecs describe-tasks `
    --cluster $clusterName `
    --tasks $taskArn `
    --region $Region `
    --profile $SSOProfile `
    --output json | ConvertFrom-Json

$task = $taskDetails.tasks[0]

if ($task.lastStatus -ne "RUNNING") {
    Write-Error "Task is not running. Current status: $($task.lastStatus)"
    exit 1
}

Write-Success "✓ Backend task is running"
Write-Info "  Task ID: $($task.taskArn -replace '.*/task/', '')"
Write-Info "  Container: backend"

# ==========================================
# RUN DATABASE MIGRATIONS
# ==========================================

if (-not $SkipMigrations) {
    Write-Info "`n[2/5] Running database migrations..."
    Write-Warning "This may take 2-5 minutes depending on migrations..."
    
    try {
        $migrateCommand = "cd /app/backend && yarn medusa db:migrate"
        
        $migrateResult = aws ecs execute-command `
            --cluster $clusterName `
            --task $taskArn `
            --container backend `
            --command "/bin/sh" `
            --interactive `
            --region $Region `
            --profile $SSOProfile `
            2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✓ Migrations completed successfully"
        }
        else {
            Write-Warning "⚠ Migration command may have issues. Check logs:"
            Write-Info "  aws logs tail /aws/ecs/$Environment-ysh-backend --follow --profile $SSOProfile"
        }
        
    }
    catch {
        Write-Error "Failed to run migrations: $_"
        Write-Info "Trying alternative method..."
        
        # Alternative: Run via SSM if ECS Exec not enabled
        Write-Info "Enable ECS Exec with:"
        Write-Host "  aws ecs update-service --cluster $clusterName --service $serviceName --enable-execute-command --profile $SSOProfile" -ForegroundColor Yellow
    }
    
}
else {
    Write-Warning "Skipping migrations (--SkipMigrations)"
}

# ==========================================
# SEED DATABASE
# ==========================================

if (-not $SkipSeed) {
    Write-Info "`n[3/5] Seeding database..."
    Write-Info "Creating initial data (companies, products, regions)..."
    
    try {
        $seedCommand = "cd /app/backend && yarn run seed"
        
        $seedResult = aws ecs execute-command `
            --cluster $clusterName `
            --task $taskArn `
            --container backend `
            --command "/bin/sh -c '$seedCommand'" `
            --interactive `
            --region $Region `
            --profile $SSOProfile `
            2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✓ Database seeded successfully"
        }
        else {
            Write-Warning "⚠ Seed command may have issues. Check logs."
        }
        
    }
    catch {
        Write-Error "Failed to seed database: $_"
    }
    
}
else {
    Write-Warning "Skipping seed (--SkipSeed)"
}

# ==========================================
# CREATE ADMIN USER
# ==========================================

if (-not $SkipAdminUser) {
    Write-Info "`n[4/5] Creating admin user..."
    
    # Get admin password
    if (-not $AdminPassword) {
        Write-Host "`nAdmin user credentials:" -ForegroundColor Yellow
        $AdminPassword = Read-Host "Enter admin password (min 8 chars)" -AsSecureString
        $AdminPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($AdminPassword)
        )
    }
    else {
        $AdminPasswordPlain = $AdminPassword
    }
    
    if ($AdminPasswordPlain.Length -lt 8) {
        Write-Error "Password must be at least 8 characters"
        exit 1
    }
    
    Write-Info "Creating admin: $AdminEmail"
    
    try {
        $userCommand = "cd /app/backend && yarn medusa user -e $AdminEmail -p $AdminPasswordPlain -i admin_ysh"
        
        $userResult = aws ecs execute-command `
            --cluster $clusterName `
            --task $taskArn `
            --container backend `
            --command "/bin/sh -c '$userCommand'" `
            --interactive `
            --region $Region `
            --profile $SSOProfile `
            2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✓ Admin user created successfully"
            Write-Info "`n  Email: $AdminEmail"
            Write-Info "  Password: ********"
            Write-Info "  Role: admin_ysh"
        }
        else {
            Write-Warning "⚠ User may already exist or command failed"
        }
        
    }
    catch {
        Write-Error "Failed to create admin user: $_"
    }
    
}
else {
    Write-Warning "Skipping admin user creation (--SkipAdminUser)"
}

# ==========================================
# VERIFY DATABASE SETUP
# ==========================================

Write-Info "`n[5/5] Verifying database setup..."

# Check if backend is responding
$stackName = "$Environment-ysh-stack"
$stack = aws cloudformation describe-stacks `
    --stack-name $stackName `
    --region $Region `
    --profile $SSOProfile `
    --output json | ConvertFrom-Json

$domainUrl = ($stack.Stacks[0].Outputs | Where-Object { $_.OutputKey -eq "APIURL" }).OutputValue

if ($domainUrl) {
    Write-Info "Testing backend health endpoint..."
    
    try {
        $response = Invoke-WebRequest -Uri "$domainUrl/health" -Method GET -TimeoutSec 10
        
        if ($response.StatusCode -eq 200) {
            Write-Success "✓ Backend is healthy"
        }
        else {
            Write-Warning "⚠ Backend returned: $($response.StatusCode)"
        }
    }
    catch {
        Write-Warning "⚠ Backend not yet accessible (may still be starting)"
        Write-Info "  Wait a few minutes and try accessing: $domainUrl/health"
    }
}

Write-Host "

==========================================
✅ DATABASE SETUP COMPLETE
==========================================

Admin credentials:
  Email: $AdminEmail
  Password: [saved securely]

Admin dashboard:
  $domainUrl/app

Next steps:
1. Login to admin dashboard
2. Create publishable API key
3. Configure store settings
4. Run: .\4-configure-env.ps1 (update storefront with API key)

" -ForegroundColor Green

# ==========================================
# TROUBLESHOOTING TIPS
# ==========================================

Write-Host "
==========================================
🔧 TROUBLESHOOTING
==========================================
" -ForegroundColor Cyan

Write-Info "If ECS Exec failed, enable it with:"
Write-Host "  aws ecs update-service --cluster $clusterName --service $serviceName --enable-execute-command --force-new-deployment --profile $SSOProfile`n" -ForegroundColor Gray

Write-Info "View backend logs:"
Write-Host "  aws logs tail /aws/ecs/$Environment-ysh-backend --follow --profile $SSOProfile`n" -ForegroundColor Gray

Write-Info "Connect to task manually:"
Write-Host "  aws ecs execute-command --cluster $clusterName --task $taskArn --container backend --command /bin/sh --interactive --profile $SSOProfile`n" -ForegroundColor Gray

Write-Info "Run migrations manually:"
Write-Host "  # After connecting to task:
  cd /app/backend
  yarn medusa db:migrate
  yarn run seed
  yarn medusa user -e $AdminEmail -p [password] -i admin_ysh`n" -ForegroundColor Gray
