# ==========================================
# ENVIRONMENT CONFIGURATION SCRIPT
# Updates storefront with publishable key and domain
# ==========================================

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [string]$SSOProfile = "ysh-production",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory=$false)]
    [string]$PublishableKey,
    
    [Parameter(Mandatory=$false)]
    [switch]$UpdateSecretsManager,
    
    [Parameter(Mandatory=$false)]
    [switch]$RestartStorefront
)

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Host "
==========================================
⚙️  ENVIRONMENT CONFIGURATION
==========================================
Environment: $Environment
Region: $Region
Profile: $SSOProfile
==========================================
" -ForegroundColor Magenta

# ==========================================
# GET STACK OUTPUTS
# ==========================================

Write-Info "`n[1/4] Getting CloudFormation outputs..."

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

$domainUrl = $outputs["DomainURL"]
$apiUrl = $outputs["APIURL"]
$secretsArn = $outputs["SecretsManagerARN"]

Write-Success "✓ Stack outputs retrieved"
Write-Info "  Domain: $domainUrl"
Write-Info "  API: $apiUrl"
Write-Info "  Secrets: $secretsArn"

# ==========================================
# GET PUBLISHABLE KEY
# ==========================================

Write-Info "`n[2/4] Getting Medusa publishable key..."

if (-not $PublishableKey) {
    Write-Host "
To get the publishable key:
1. Open admin dashboard: $apiUrl/app
2. Login with admin credentials
3. Go to Settings → Publishable API Keys
4. Copy the key starting with 'pk_'
" -ForegroundColor Yellow
    
    $PublishableKey = Read-Host "Enter publishable API key"
    
    if (-not ($PublishableKey -match "^pk_")) {
        Write-Error "Invalid publishable key format. Must start with 'pk_'"
        exit 1
    }
}

Write-Success "✓ Publishable key: $PublishableKey"

# ==========================================
# UPDATE SECRETS MANAGER
# ==========================================

if ($UpdateSecretsManager) {
    Write-Info "`n[3/4] Updating Secrets Manager..."
    
    # Get current secrets
    $currentSecrets = aws secretsmanager get-secret-value `
        --secret-id $secretsArn `
        --region $Region `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    $secretsObject = $currentSecrets.SecretString | ConvertFrom-Json
    
    # Add/update publishable key
    $secretsObject | Add-Member -MemberType NoteProperty -Name "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY" -Value $PublishableKey -Force
    $secretsObject | Add-Member -MemberType NoteProperty -Name "NEXT_PUBLIC_MEDUSA_BACKEND_URL" -Value $apiUrl -Force
    
    $updatedSecrets = $secretsObject | ConvertTo-Json -Compress
    
    # Update Secrets Manager
    aws secretsmanager put-secret-value `
        --secret-id $secretsArn `
        --secret-string $updatedSecrets `
        --region $Region `
        --profile $SSOProfile | Out-Null
    
    Write-Success "✓ Secrets Manager updated with storefront configuration"
    
} else {
    Write-Info "`n[3/4] Skipping Secrets Manager update"
    Write-Info "Use --UpdateSecretsManager flag to update automatically"
}

# ==========================================
# RESTART STOREFRONT SERVICE
# ==========================================

if ($RestartStorefront) {
    Write-Info "`n[4/4] Restarting storefront service..."
    
    $clusterName = $outputs["ECSClusterName"]
    $serviceName = "$Environment-ysh-storefront"
    
    aws ecs update-service `
        --cluster $clusterName `
        --service $serviceName `
        --force-new-deployment `
        --region $Region `
        --profile $SSOProfile | Out-Null
    
    Write-Success "✓ Storefront service restarted"
    Write-Info "New deployment will pick up updated environment variables"
    Write-Info "This may take 3-5 minutes..."
    
} else {
    Write-Info "`n[4/4] Skipping service restart"
    Write-Warning "Restart storefront manually to apply changes:"
    Write-Host "  aws ecs update-service --cluster $($outputs['ECSClusterName']) --service $Environment-ysh-storefront --force-new-deployment --profile $SSOProfile`n" -ForegroundColor Gray
}

# ==========================================
# CREATE LOCAL .env FILE
# ==========================================

Write-Info "`nCreating local .env.production file..."

$envContent = @"
# YSH B2B E-commerce - Production Environment
# Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Backend API
NEXT_PUBLIC_MEDUSA_BACKEND_URL=$apiUrl
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$PublishableKey

# Domain
NEXT_PUBLIC_BASE_URL=$domainUrl
NEXT_PUBLIC_STORE_URL=$domainUrl

# Environment
NODE_ENV=production
"@

$envFile = Join-Path $PSScriptRoot "..\storefront\.env.production"
$envContent | Out-File -FilePath $envFile -Encoding utf8

Write-Success "✓ Local .env.production file created"
Write-Info "  Location: $envFile"

# ==========================================
# VERIFY CONFIGURATION
# ==========================================

Write-Info "`nVerifying storefront accessibility..."

try {
    $response = Invoke-WebRequest -Uri $domainUrl -Method GET -TimeoutSec 10
    
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 301 -or $response.StatusCode -eq 302) {
        Write-Success "✓ Storefront is accessible"
    } else {
        Write-Warning "⚠ Storefront returned: $($response.StatusCode)"
    }
} catch {
    Write-Warning "⚠ Storefront not yet accessible"
    Write-Info "Wait a few minutes if you just deployed"
}

Write-Info "`nVerifying backend API..."

try {
    $response = Invoke-WebRequest -Uri "$apiUrl/health" -Method GET -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        Write-Success "✓ Backend API is healthy"
    } else {
        Write-Warning "⚠ Backend returned: $($response.StatusCode)"
    }
} catch {
    Write-Warning "⚠ Backend not yet accessible"
}

# ==========================================
# SUMMARY
# ==========================================

Write-Host "

==========================================
✅ ENVIRONMENT CONFIGURATION COMPLETE
==========================================

Storefront Configuration:
  Domain: $domainUrl
  Backend API: $apiUrl
  Publishable Key: $PublishableKey

Local Environment File:
  $envFile

Admin Dashboard:
  $apiUrl/app

Next steps:
1. Test storefront: $domainUrl
2. Verify products load correctly
3. Test checkout flow
4. Monitor CloudWatch logs for errors

" -ForegroundColor Green

Write-Host "
==========================================
🧪 TESTING CHECKLIST
==========================================
" -ForegroundColor Cyan

Write-Info "1. Homepage loads:"
Write-Host "   curl -I $domainUrl`n" -ForegroundColor Gray

Write-Info "2. Products endpoint works:"
Write-Host "   curl -H 'x-publishable-api-key: $PublishableKey' $apiUrl/store/products`n" -ForegroundColor Gray

Write-Info "3. Backend health check:"
Write-Host "   curl $apiUrl/health`n" -ForegroundColor Gray

Write-Info "4. Admin dashboard accessible:"
Write-Host "   Open: $apiUrl/app`n" -ForegroundColor Gray

Write-Host "
==========================================
🔧 TROUBLESHOOTING
==========================================
" -ForegroundColor Cyan

Write-Info "If storefront shows errors:"
Write-Host "  1. Check CloudWatch logs:
     aws logs tail /aws/ecs/$Environment-ysh-storefront --follow --profile $SSOProfile
  
  2. Verify publishable key is correct in admin
  
  3. Check CORS configuration in backend
  
  4. Restart storefront service:
     aws ecs update-service --cluster $($outputs['ECSClusterName']) --service $Environment-ysh-storefront --force-new-deployment --profile $SSOProfile
" -ForegroundColor Gray

Write-Info "If products don't load:"
Write-Host "  1. Verify publishable key is active in admin
  
  2. Check backend logs for errors:
     aws logs tail /aws/ecs/$Environment-ysh-backend --follow --profile $SSOProfile
  
  3. Test API directly:
     curl -H 'x-publishable-api-key: $PublishableKey' $apiUrl/store/products
" -ForegroundColor Gray
