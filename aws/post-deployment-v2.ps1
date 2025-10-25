# ==========================================
# POST-DEPLOYMENT ORCHESTRATOR
# Executes all post-deployment tasks in sequence
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
    [string]$AlertEmail,
    
    [Parameter(Mandatory = $false)]
    [string]$PublishableKey,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipECSDeploy,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipDatabase,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipMonitoring,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipEnvConfig,
    
    [Parameter(Mandatory = $false)]
    [switch]$InteractiveMode
)

# Colors






Write-Host "
==========================================
🚀 POST-DEPLOYMENT ORCHESTRATOR
==========================================
Environment: $Environment
Region: $Region
Profile: $SSOProfile
==========================================
" -ForegroundColor Magenta

Write-Host "
This script will execute the following steps:
  1. Deploy ECS tasks (backend + storefront)
  2. Setup database (migrations, seed, admin user)
  3. Configure monitoring (CloudWatch + billing)
  4. Update environment (publishable key)

" -ForegroundColor White

# ==========================================
# INTERACTIVE MODE CONFIRMATION
# ==========================================

if ($InteractiveMode) {
    $confirm = Read-Host "Continue with post-deployment setup? (y/n)"
    if ($confirm -ne "y") {
        Write-Host " -ForegroundColor YellowAborted by user"
        exit 0
    }
}

$startTime = Get-Date
$errors = @()
$warnings = @()

# ==========================================
# STEP 1: DEPLOY ECS TASKS
# ==========================================

if (-not $SkipECSDeploy) {
    Write-Host "`n" " "`n" -ForegroundColor Magenta==========================================
STEP 1/4: DEPLOYING ECS TASKS
=========================================="
    
    try {
        $deployScript = Join-Path $PSScriptRoot "1-deploy-ecs-tasks.ps1"
        
        if (-not (Test-Path $deployScript)) {
            throw "Deploy script not found: $deployScript"
        }
        
        & $deployScript `
            -Environment $Environment `
            -SSOProfile $SSOProfile `
            -Region $Region
        
        if ($LASTEXITCODE -ne 0) {
            throw "ECS deployment failed with exit code $LASTEXITCODE"
        }
        
        Write-Host " -ForegroundColor Green`n✓ ECS tasks deployed successfully"
        
    }
    catch {
        $errorMsg = "ECS deployment failed: $_"
        Write-Err $errorMsg
        $errors += $errorMsg
        
        if ($InteractiveMode) {
            $continue = Read-Host "Continue to next step? (y/n)"
            if ($continue -ne "y") { exit 1 }
        }
    }
    
}
else {
    Write-Host " -ForegroundColor YellowSkipping ECS deployment (-SkipECSDeploy)"
}

# Wait for tasks to stabilize
if (-not $SkipECSDeploy) {
    Write-Host " -ForegroundColor Cyan`nWaiting 30 seconds for tasks to stabilize..."
    Start-Sleep -Seconds 30
}

# ==========================================
# STEP 2: SETUP DATABASE
# ==========================================

if (-not $SkipDatabase) {
    Write-Host "`n" " "`n" -ForegroundColor Magenta==========================================
STEP 2/4: SETTING UP DATABASE
=========================================="
    
    try {
        $dbScript = Join-Path $PSScriptRoot "2-setup-database.ps1"
        
        if (-not (Test-Path $dbScript)) {
            throw "Database script not found: $dbScript"
        }
        
        & $dbScript `
            -Environment $Environment `
            -SSOProfile $SSOProfile `
            -Region $Region `
            -AdminEmail $AdminEmail
        
        if ($LASTEXITCODE -ne 0) {
            $warnings += "Database setup had warnings. Check logs above."
            Write-Host " -ForegroundColor Yellow`n⚠ Database setup completed with warnings"
        }
        else {
            Write-Host " -ForegroundColor Green`n✓ Database setup completed successfully"
        }
        
    }
    catch {
        $errorMsg = "Database setup failed: $_"
        Write-Err $errorMsg
        $errors += $errorMsg
        
        if ($InteractiveMode) {
            $continue = Read-Host "Continue to next step? (y/n)"
            if ($continue -ne "y") { exit 1 }
        }
    }
    
}
else {
    Write-Host " -ForegroundColor YellowSkipping database setup (-SkipDatabase)"
}

# ==========================================
# STEP 3: CONFIGURE MONITORING
# ==========================================

if (-not $SkipMonitoring) {
    Write-Host "`n" " "`n" -ForegroundColor Magenta==========================================
STEP 3/4: CONFIGURING MONITORING
=========================================="
    
    try {
        $monitorScript = Join-Path $PSScriptRoot "3-setup-monitoring.ps1"
        
        if (-not (Test-Path $monitorScript)) {
            throw "Monitoring script not found: $monitorScript"
        }
        
        # Get alert email if not provided
        if (-not $AlertEmail) {
            Write-Host "`nEnter email for CloudWatch alerts:" -ForegroundColor Yellow
            $AlertEmail = Read-Host "Email address"
        }
        
        & $monitorScript `
            -Environment $Environment `
            -SSOProfile $SSOProfile `
            -Region $Region `
            -AlertEmail $AlertEmail
        
        if ($LASTEXITCODE -ne 0) {
            throw "Monitoring setup failed with exit code $LASTEXITCODE"
        }
        
        Write-Host " -ForegroundColor Green`n✓ Monitoring configured successfully"
        Write-Host " -ForegroundColor Yellow⚠ Don't forget to confirm email subscription!"
        
    }
    catch {
        $errorMsg = "Monitoring setup failed: $_"
        Write-Err $errorMsg
        $errors += $errorMsg
        
        if ($InteractiveMode) {
            $continue = Read-Host "Continue to next step? (y/n)"
            if ($continue -ne "y") { exit 1 }
        }
    }
    
}
else {
    Write-Host " -ForegroundColor YellowSkipping monitoring setup (-SkipMonitoring)"
}

# ==========================================
# STEP 4: CONFIGURE ENVIRONMENT
# ==========================================

if (-not $SkipEnvConfig) {
    Write-Host "`n" " "`n" -ForegroundColor Magenta==========================================
STEP 4/4: CONFIGURING ENVIRONMENT
=========================================="
    
    try {
        $envScript = Join-Path $PSScriptRoot "4-configure-env.ps1"
        
        if (-not (Test-Path $envScript)) {
            throw "Environment script not found: $envScript"
        }
        
        # Get publishable key if not provided
        if (-not $PublishableKey) {
            Write-Host "`nTo get the publishable key:" -ForegroundColor Yellow
            Write-Host "1. Open admin dashboard (URL shown below)"
            Write-Host "2. Login with admin credentials"
            Write-Host "3. Go to Settings → Publishable API Keys"
            Write-Host "4. Copy the key starting with 'pk_'`n"
            
            $PublishableKey = Read-Host "Enter publishable API key"
        }
        
        & $envScript `
            -Environment $Environment `
            -SSOProfile $SSOProfile `
            -Region $Region `
            -PublishableKey $PublishableKey `
            -UpdateSecretsManager `
            -RestartStorefront
        
        if ($LASTEXITCODE -ne 0) {
            throw "Environment configuration failed with exit code $LASTEXITCODE"
        }
        
        Write-Host " -ForegroundColor Green`n✓ Environment configured successfully"
        
    }
    catch {
        $errorMsg = "Environment configuration failed: $_"
        Write-Err $errorMsg
        $errors += $errorMsg
    }
    
}
else {
    Write-Host " -ForegroundColor YellowSkipping environment configuration (-SkipEnvConfig)"
}

# ==========================================
# FINAL SUMMARY
# ==========================================

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "

==========================================
📊 POST-DEPLOYMENT SUMMARY
==========================================
" -ForegroundColor Magenta

Write-Host " -ForegroundColor CyanExecution time: $($duration.ToString('mm\:ss'))"
Write-Host " -ForegroundColor CyanEnvironment: $Environment"
Write-Host " -ForegroundColor CyanRegion: $Region"

Write-Host "`n✅ COMPLETED STEPS:" -ForegroundColor Green

if (-not $SkipECSDeploy) {
    Write-Host "  ✓ ECS tasks deployed (backend + storefront)" -ForegroundColor White
}
if (-not $SkipDatabase) {
    Write-Host "  ✓ Database setup (migrations, seed, admin user)" -ForegroundColor White
}
if (-not $SkipMonitoring) {
    Write-Host "  ✓ Monitoring configured (CloudWatch + billing)" -ForegroundColor White
}
if (-not $SkipEnvConfig) {
    Write-Host "  ✓ Environment configured (publishable key)" -ForegroundColor White
}

if ($errors.Count -gt 0) {
    Write-Host "`n❌ ERRORS:" -ForegroundColor Red
    foreach ($errorMsg in $errors) {
        Write-Host "  • $errorMsg" -ForegroundColor Red
    }
}

if ($warnings.Count -gt 0) {
    Write-Host "`n⚠️  WARNINGS:" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  • $warning" -ForegroundColor Yellow
    }
}

# Get final URLs
try {
    $stackName = "$Environment-ysh-stack"
    $stack = aws cloudformation describe-stacks `
        --stack-name $stackName `
        --region $Region `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    $outputs = @{}
    foreach ($output in $stack.Stacks[0].Outputs) {
        $outputs[$output.OutputKey] = $output.OutputValue
    }
    
    Write-Host "`n
==========================================
🌐 ACCESS URLS
==========================================
" -ForegroundColor Cyan
    
    Write-Host " -ForegroundColor CyanStorefront:"
    Write-Host "  $($outputs['DomainURL'])" -ForegroundColor White
    
    Write-Host " -ForegroundColor Cyan`nAdmin Dashboard:"
    Write-Host "  $($outputs['APIURL'])/app" -ForegroundColor White
    
    Write-Host " -ForegroundColor Cyan`nAPI Health:"
    Write-Host "  $($outputs['APIURL'])/health" -ForegroundColor White
    
    Write-Host " -ForegroundColor Cyan`nCloudWatch Dashboard:"
    Write-Host "  https://$Region.console.aws.amazon.com/cloudwatch/home?region=$Region#dashboards:name=$Environment-ysh-monitoring" -ForegroundColor White
    
}
catch {
    Write-Host " -ForegroundColor YellowCould not retrieve URLs. Check CloudFormation stack outputs."
}

Write-Host "

==========================================
✅ POST-DEPLOYMENT COMPLETE
==========================================

Next steps:
1. Confirm email subscription for alerts
2. Test storefront functionality
3. Configure payment providers (if needed)
4. Set up shipping options
5. Add products and inventory

Monitoring:
  • CloudWatch alarms active
  • Billing alerts configured
  • Logs streaming to CloudWatch

Support:
  • View logs: aws logs tail /aws/ecs/$Environment-ysh-backend --follow
  • Check health: curl $($outputs['APIURL'])/health
  • Dashboard: CloudWatch console

" -ForegroundColor Green

if ($errors.Count -eq 0) {
    Write-Host "🎉 YSH B2B Platform is ready for production!" -ForegroundColor Magenta
    exit 0
}
else {
    Write-Host "⚠️  Deployment completed with errors. Review above." -ForegroundColor Yellow
    exit 1
}
