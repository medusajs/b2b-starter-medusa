# ==========================================
# PRE-DEPLOYMENT VALIDATION SCRIPT
# Tests prerequisites before AWS deployment
# ==========================================

param(
    [Parameter(Mandatory = $false)]
    [string]$SSOProfile = "ysh-production",
    
    [Parameter(Mandatory = $false)]
    [string]$DomainName = "yellosolar.com.br"
)

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Host "
==========================================
✅ PRE-DEPLOYMENT VALIDATION
==========================================
Domain: $DomainName
Profile: $SSOProfile
==========================================
" -ForegroundColor Magenta

$allPassed = $true

# ==========================================
# 1. AWS CLI
# ==========================================

Write-Info "`n[1/10] Checking AWS CLI..."
try {
    $awsVersion = aws --version 2>&1
    $versionMatch = $awsVersion -match "aws-cli/([\d\.]+)"
    if ($matches[1] -ge "2.0.0") {
        Write-Success "✓ AWS CLI v$($matches[1]) installed"
    }
    else {
        Write-Warning "⚠ AWS CLI v$($matches[1]) detected. v2.0.0+ recommended"
    }
}
catch {
    Write-Error "✗ AWS CLI not found"
    Write-Info "  Install from: https://aws.amazon.com/cli/"
    $allPassed = $false
}

# ==========================================
# 2. PowerShell Version
# ==========================================

Write-Info "`n[2/10] Checking PowerShell version..."
$psVersion = $PSVersionTable.PSVersion
if ($psVersion.Major -ge 5) {
    Write-Success "✓ PowerShell v$($psVersion.Major).$($psVersion.Minor) (OK)"
}
else {
    Write-Warning "⚠ PowerShell v$($psVersion.Major).$($psVersion.Minor) detected. v5.1+ recommended"
}

# ==========================================
# 3. CloudFormation Template
# ==========================================

Write-Info "`n[3/10] Checking CloudFormation template..."
$cfnTemplate = Join-Path $PSScriptRoot "cloudformation-with-domain.yml"
if (Test-Path $cfnTemplate) {
    $lines = (Get-Content $cfnTemplate).Count
    Write-Success "✓ Template found: $cfnTemplate ($lines lines)"
}
else {
    Write-Error "✗ Template not found: $cfnTemplate"
    $allPassed = $false
}

# ==========================================
# 4. Deployment Script
# ==========================================

Write-Info "`n[4/10] Checking deployment script..."
$deployScript = Join-Path $PSScriptRoot "deploy-with-domain.ps1"
if (Test-Path $deployScript) {
    Write-Success "✓ Deployment script found: $deployScript"
}
else {
    Write-Error "✗ Deployment script not found: $deployScript"
    $allPassed = $false
}

# ==========================================
# 5. AWS Profile
# ==========================================

Write-Info "`n[5/10] Checking AWS profile..."
$profiles = aws configure list-profiles 2>&1
if ($profiles -match $SSOProfile) {
    Write-Success "✓ Profile '$SSOProfile' exists"
}
else {
    Write-Warning "⚠ Profile '$SSOProfile' not found"
    Write-Info "  Will be created during deployment"
}

# ==========================================
# 6. AWS SSO Session
# ==========================================

Write-Info "`n[6/10] Checking AWS SSO session..."
try {
    $identity = aws sts get-caller-identity --profile $SSOProfile 2>&1 | ConvertFrom-Json
    Write-Success "✓ SSO session active"
    Write-Info "  Account: $($identity.Account)"
    Write-Info "  User: $($identity.Arn)"
}
catch {
    Write-Warning "⚠ SSO session expired or not configured"
    Write-Info "  Run: aws sso login --profile $SSOProfile"
}

# ==========================================
# 7. Route53 Hosted Zone
# ==========================================

Write-Info "`n[7/10] Checking Route53 hosted zone..."
try {
    $zones = aws route53 list-hosted-zones-by-name `
        --dns-name $DomainName `
        --profile $SSOProfile `
        --output json 2>&1 | ConvertFrom-Json
    
    $zone = $zones.HostedZones | Where-Object { $_.Name -eq "$DomainName." } | Select-Object -First 1
    
    if ($zone) {
        $zoneId = $zone.Id -replace "/hostedzone/", ""
        Write-Success "✓ Hosted zone exists: $zoneId"
        
        # Get nameservers
        $nsDetails = aws route53 get-hosted-zone `
            --id $zoneId `
            --profile $SSOProfile `
            --output json 2>&1 | ConvertFrom-Json
        
        Write-Info "  Nameservers:"
        $nsDetails.DelegationSet.NameServers | ForEach-Object {
            Write-Host "    • $_" -ForegroundColor Gray
        }
    }
    else {
        Write-Warning "⚠ Hosted zone not found for $DomainName"
        Write-Info "  Will be created with -CreateHostedZone flag"
    }
}
catch {
    Write-Warning "⚠ Cannot check hosted zone (SSO required)"
}

# ==========================================
# 8. ACM Certificate
# ==========================================

Write-Info "`n[8/10] Checking ACM certificate..."
try {
    $certs = aws acm list-certificates `
        --region us-east-1 `
        --profile $SSOProfile `
        --output json 2>&1 | ConvertFrom-Json
    
    $cert = $certs.CertificateSummaryList | Where-Object { 
        $_.DomainName -eq $DomainName -and $_.Status -eq "ISSUED" 
    } | Select-Object -First 1
    
    if ($cert) {
        Write-Success "✓ Certificate exists: $($cert.CertificateArn)"
        Write-Info "  Status: $($cert.Status)"
    }
    else {
        Write-Warning "⚠ Certificate not found for $DomainName"
        Write-Info "  Will be created with -RequestCertificate flag"
    }
}
catch {
    Write-Warning "⚠ Cannot check certificate (SSO required)"
}

# ==========================================
# 9. CloudFormation Stack
# ==========================================

Write-Info "`n[9/10] Checking CloudFormation stack..."
try {
    $stacks = aws cloudformation describe-stacks `
        --stack-name production-ysh-stack `
        --profile $SSOProfile `
        --output json 2>&1 | ConvertFrom-Json
    
    $stack = $stacks.Stacks[0]
    
    if ($stack.StackStatus -eq "CREATE_COMPLETE") {
        Write-Success "✓ Stack exists and is healthy"
        Write-Info "  Status: $($stack.StackStatus)"
        Write-Info "  Created: $($stack.CreationTime)"
    }
    elseif ($stack.StackStatus -match "PROGRESS") {
        Write-Warning "⚠ Stack creation in progress"
        Write-Info "  Status: $($stack.StackStatus)"
    }
    else {
        Write-Warning "⚠ Stack exists but not healthy"
        Write-Info "  Status: $($stack.StackStatus)"
    }
}
catch {
    Write-Info "ℹ Stack not found (this is OK for first deployment)"
}

# ==========================================
# 10. DNS Propagation
# ==========================================

Write-Info "`n[10/10] Checking DNS propagation..."
try {
    $dnsResult = nslookup -type=NS $DomainName 8.8.8.8 2>&1
    
    if ($dnsResult -match "awsdns") {
        Write-Success "✓ DNS propagated to AWS nameservers"
        Write-Info "  Domain: $DomainName"
    }
    else {
        Write-Warning "⚠ DNS not yet using AWS nameservers"
        Write-Info "  Current nameservers may be GoDaddy defaults"
        Write-Info "  Update after creating hosted zone"
    }
}
catch {
    Write-Warning "⚠ Cannot resolve DNS (domain may not exist yet)"
}

# ==========================================
# SUMMARY
# ==========================================

Write-Host "`n
==========================================
📊 VALIDATION SUMMARY
==========================================
" -ForegroundColor Magenta

if ($allPassed) {
    Write-Success "✓ All critical checks passed!"
    Write-Info "`nYou're ready to deploy. Run:"
    Write-Host "  .\deploy-with-domain.ps1 -DeployStack" -ForegroundColor Yellow
}
else {
    Write-Error "✗ Some critical checks failed"
    Write-Info "`nFix the errors above before deploying"
}

Write-Host "`n
==========================================
🚀 NEXT STEPS
==========================================
" -ForegroundColor Cyan

Write-Info "1. If SSO expired, login:"
Write-Host "   aws sso login --profile $SSOProfile" -ForegroundColor Gray

Write-Info "`n2. If hosted zone missing, create:"
Write-Host "   .\deploy-with-domain.ps1 -CreateHostedZone" -ForegroundColor Gray

Write-Info "`n3. Update GoDaddy nameservers (if needed)"

Write-Info "`n4. If certificate missing, request:"
Write-Host "   .\deploy-with-domain.ps1 -RequestCertificate" -ForegroundColor Gray

Write-Info "`n5. Deploy full stack:"
Write-Host "   .\deploy-with-domain.ps1 -DeployStack" -ForegroundColor Gray

Write-Info "`n6. Or run all steps at once:"
Write-Host "   .\deploy-with-domain.ps1 -CreateHostedZone -RequestCertificate -DeployStack" -ForegroundColor Yellow

Write-Host "`n==========================================`n"
