# ==========================================
# AWS DEPLOYMENT SCRIPT WITH CUSTOM DOMAIN
# Medusa.js 2.10.3 B2B E-commerce
# ==========================================

param(
    [Parameter(Mandatory = $false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory = $false)]
    [string]$DomainName = "yellosolar.com.br",
    
    [Parameter(Mandatory = $false)]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory = $false)]
    [string]$SSOProfile = "ysh-production",
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipSSO,
    
    [Parameter(Mandatory = $false)]
    [switch]$CreateHostedZone,
    
    [Parameter(Mandatory = $false)]
    [switch]$RequestCertificate,
    
    [Parameter(Mandatory = $false)]
    [switch]$DeployStack
)

# Colors for output
$Host.UI.RawUI.ForegroundColor = "White"
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Banner
Write-Host "
==========================================
🚀 AWS DEPLOYMENT WITH CUSTOM DOMAIN
==========================================
Environment: $Environment
Domain: $DomainName
Region: $Region
SSO Profile: $SSOProfile
==========================================
" -ForegroundColor Magenta

# ==========================================
# PREREQUISITES CHECK
# ==========================================

Write-Info "`n[1/8] Checking prerequisites..."

# Check AWS CLI
try {
    $awsVersion = aws --version 2>&1
    Write-Success "✓ AWS CLI installed: $awsVersion"
}
catch {
    Write-Error "✗ AWS CLI not found. Install from: https://aws.amazon.com/cli/"
    exit 1
}

# Check CloudFormation template
$cfnTemplate = Join-Path $PSScriptRoot "cloudformation-with-domain.yml"
if (-not (Test-Path $cfnTemplate)) {
    Write-Error "✗ CloudFormation template not found: $cfnTemplate"
    exit 1
}
Write-Success "✓ CloudFormation template found"

# ==========================================
# AWS SSO CONFIGURATION
# ==========================================

if (-not $SkipSSO) {
    Write-Info "`n[2/8] Configuring AWS SSO..."
    
    # Check if profile exists
    $profileExists = aws configure list-profiles | Select-String -Pattern "^$SSOProfile$" -Quiet
    
    if (-not $profileExists) {
        Write-Warning "Profile '$SSOProfile' not found. Starting SSO configuration..."
        Write-Host "`nPlease provide your AWS SSO details:" -ForegroundColor Yellow
        
        $ssoStartUrl = Read-Host "SSO Start URL (e.g., https://d-xxxxxxxxxx.awsapps.com/start)"
        $ssoRegion = Read-Host "SSO Region (e.g., us-east-1)"
        $accountId = Read-Host "AWS Account ID"
        $roleName = Read-Host "IAM Role Name (e.g., AdministratorAccess)"
        
        Write-Info "Configuring SSO profile..."
        aws configure sso `
            --profile $SSOProfile `
            --sso-start-url $ssoStartUrl `
            --sso-region $ssoRegion `
            --sso-account-id $accountId `
            --sso-role-name $roleName `
            --region $Region
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error "✗ SSO configuration failed"
            exit 1
        }
        Write-Success "✓ SSO profile configured"
    }
    else {
        Write-Success "✓ Profile '$SSOProfile' found"
    }
    
    # Login via SSO
    Write-Info "Logging in via AWS SSO..."
    aws sso login --profile $SSOProfile
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "✗ SSO login failed"
        exit 1
    }
    Write-Success "✓ SSO login successful"
    
    # Verify credentials
    Write-Info "Verifying credentials..."
    $identity = aws sts get-caller-identity --profile $SSOProfile --output json | ConvertFrom-Json
    Write-Success "✓ Authenticated as: $($identity.Arn)"
    Write-Info "  Account ID: $($identity.Account)"
    Write-Info "  User ID: $($identity.UserId)"
}
else {
    Write-Warning "Skipping SSO configuration (--SkipSSO flag)"
}

# ==========================================
# HOSTED ZONE CREATION
# ==========================================

Write-Info "`n[3/8] Checking Route53 Hosted Zone..."

$hostedZones = aws route53 list-hosted-zones-by-name `
    --dns-name $DomainName `
    --profile $SSOProfile `
    --output json | ConvertFrom-Json

$hostedZone = $hostedZones.HostedZones | Where-Object { $_.Name -eq "$DomainName." } | Select-Object -First 1

if ($hostedZone) {
    $hostedZoneId = $hostedZone.Id -replace "/hostedzone/", ""
    Write-Success "✓ Hosted zone found: $hostedZoneId"
    
    # Get nameservers
    $nameservers = aws route53 get-hosted-zone `
        --id $hostedZoneId `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    Write-Info "`nNameservers for GoDaddy configuration:"
    $nameservers.DelegationSet.NameServers | ForEach-Object {
        Write-Host "  • $_" -ForegroundColor Yellow
    }
    
    Write-Warning "`n⚠️  ACTION REQUIRED:"
    Write-Warning "Update nameservers in GoDaddy DNS Management:"
    Write-Warning "1. Login to GoDaddy: https://dcc.godaddy.com/manage/$DomainName/dns"
    Write-Warning "2. Change nameservers to 'Custom'"
    Write-Warning "3. Add all nameservers listed above"
    Write-Warning "4. Wait 24-48 hours for DNS propagation"
    
    $continue = Read-Host "`nHave you updated GoDaddy nameservers? (y/n)"
    if ($continue -ne "y") {
        Write-Warning "Exiting. Update nameservers and run script again."
        exit 0
    }
    
}
elseif ($CreateHostedZone) {
    Write-Info "Creating hosted zone for $DomainName..."
    
    $callerReference = [guid]::NewGuid().ToString()
    $hostedZoneConfig = @{
        Name             = $DomainName
        CallerReference  = $callerReference
        HostedZoneConfig = @{
            Comment     = "YSH B2B E-commerce - $Environment"
            PrivateZone = $false
        }
    } | ConvertTo-Json -Depth 10
    
    $result = aws route53 create-hosted-zone `
        --cli-input-json $hostedZoneConfig `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    $hostedZoneId = $result.HostedZone.Id -replace "/hostedzone/", ""
    Write-Success "✓ Hosted zone created: $hostedZoneId"
    
    Write-Info "`nNameservers for GoDaddy:"
    $result.DelegationSet.NameServers | ForEach-Object {
        Write-Host "  • $_" -ForegroundColor Yellow
    }
    
    Write-Warning "`n⚠️  ACTION REQUIRED: Update GoDaddy nameservers (see above)"
    Write-Warning "Wait 24-48 hours for DNS propagation before continuing"
    exit 0
    
}
else {
    Write-Error "✗ Hosted zone not found. Run with --CreateHostedZone to create it."
    exit 1
}

# ==========================================
# SSL CERTIFICATE REQUEST
# ==========================================

Write-Info "`n[4/8] Checking ACM Certificate..."

$certificates = aws acm list-certificates `
    --region $Region `
    --profile $SSOProfile `
    --output json | ConvertFrom-Json

$cert = $certificates.CertificateSummaryList | Where-Object { 
    $_.DomainName -eq $DomainName -and $_.Status -eq "ISSUED" 
} | Select-Object -First 1

if ($cert) {
    $certificateArn = $cert.CertificateArn
    Write-Success "✓ Certificate found: $certificateArn"
    
}
elseif ($RequestCertificate) {
    Write-Info "Requesting ACM certificate..."
    
    $certRequest = aws acm request-certificate `
        --domain-name $DomainName `
        --subject-alternative-names "*.$DomainName" `
        --validation-method DNS `
        --region $Region `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    $certificateArn = $certRequest.CertificateArn
    Write-Success "✓ Certificate requested: $certificateArn"
    
    # Wait for certificate details
    Write-Info "Waiting for DNS validation records..."
    Start-Sleep -Seconds 5
    
    $certDetails = aws acm describe-certificate `
        --certificate-arn $certificateArn `
        --region $Region `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    # Create DNS validation records
    Write-Info "`nCreating DNS validation records in Route53..."
    
    foreach ($validation in $certDetails.Certificate.DomainValidationOptions) {
        $recordName = $validation.ResourceRecord.Name
        $recordValue = $validation.ResourceRecord.Value
        
        $changeSet = @{
            ChangeBatch = @{
                Changes = @(
                    @{
                        Action            = "UPSERT"
                        ResourceRecordSet = @{
                            Name            = $recordName
                            Type            = "CNAME"
                            TTL             = 300
                            ResourceRecords = @(
                                @{ Value = $recordValue }
                            )
                        }
                    }
                )
            }
        } | ConvertTo-Json -Depth 10
        
        aws route53 change-resource-record-sets `
            --hosted-zone-id $hostedZoneId `
            --cli-input-json $changeSet `
            --profile $SSOProfile | Out-Null
        
        Write-Success "✓ Created validation record for $($validation.DomainName)"
    }
    
    # Wait for certificate validation
    Write-Info "`nWaiting for certificate validation (this may take 5-30 minutes)..."
    aws acm wait certificate-validated `
        --certificate-arn $certificateArn `
        --region $Region `
        --profile $SSOProfile
    
    Write-Success "✓ Certificate validated successfully"
    
}
else {
    Write-Error "✗ Certificate not found. Run with --RequestCertificate to request it."
    exit 1
}

# ==========================================
# COLLECT DEPLOYMENT PARAMETERS
# ==========================================

Write-Info "`n[5/8] Collecting deployment parameters..."

# Generate secrets
Add-Type -AssemblyName System.Web
$jwtSecret = [System.Web.Security.Membership]::GeneratePassword(64, 20)
$cookieSecret = [System.Web.Security.Membership]::GeneratePassword(64, 20)

Write-Host "`nPlease provide database credentials:" -ForegroundColor Yellow
$dbUsername = Read-Host "Database master username (default: medusa_user)"
if ([string]::IsNullOrWhiteSpace($dbUsername)) { $dbUsername = "medusa_user" }

$dbPassword = Read-Host "Database master password (min 8 chars)" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
)

if ($dbPasswordPlain.Length -lt 8) {
    Write-Error "✗ Password must be at least 8 characters"
    exit 1
}

# Prepare parameters
$stackName = "$Environment-ysh-stack"
$parameters = @(
    @{ ParameterKey = "Environment"; ParameterValue = $Environment }
    @{ ParameterKey = "DomainName"; ParameterValue = $DomainName }
    @{ ParameterKey = "HostedZoneId"; ParameterValue = $hostedZoneId }
    @{ ParameterKey = "CertificateArn"; ParameterValue = $certificateArn }
    @{ ParameterKey = "DBMasterUsername"; ParameterValue = $dbUsername }
    @{ ParameterKey = "DBMasterPassword"; ParameterValue = $dbPasswordPlain }
    @{ ParameterKey = "MedusaJWTSecret"; ParameterValue = $jwtSecret }
    @{ ParameterKey = "MedusaCookieSecret"; ParameterValue = $cookieSecret }
)

Write-Success "✓ Parameters collected"

# ==========================================
# VALIDATE CLOUDFORMATION TEMPLATE
# ==========================================

Write-Info "`n[6/8] Validating CloudFormation template..."

aws cloudformation validate-template `
    --template-body file://$cfnTemplate `
    --profile $SSOProfile `
    --region $Region | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Error "✗ Template validation failed"
    exit 1
}
Write-Success "✓ Template validated successfully"

# ==========================================
# DEPLOY CLOUDFORMATION STACK
# ==========================================

if ($DeployStack) {
    Write-Info "`n[7/8] Deploying CloudFormation stack..."
    Write-Warning "This will create AWS resources (FREE TIER optimized)"
    
    $confirm = Read-Host "Continue with deployment? (y/n)"
    if ($confirm -ne "y") {
        Write-Warning "Deployment cancelled"
        exit 0
    }
    
    # Convert parameters to JSON
    $parametersJson = $parameters | ConvertTo-Json -Compress
    
    # Deploy stack
    Write-Info "Creating stack: $stackName"
    aws cloudformation create-stack `
        --stack-name $stackName `
        --template-body file://$cfnTemplate `
        --parameters $parametersJson `
        --capabilities CAPABILITY_NAMED_IAM `
        --region $Region `
        --profile $SSOProfile `
        --tags "Key=Environment,Value=$Environment" "Key=Domain,Value=$DomainName" | Out-Null
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "✗ Stack creation failed"
        exit 1
    }
    Write-Success "✓ Stack creation initiated"
    
    # Wait for completion
    Write-Info "`nWaiting for stack creation (this may take 15-30 minutes)..."
    Write-Info "You can monitor progress in AWS Console:"
    Write-Info "https://console.aws.amazon.com/cloudformation/home?region=$Region#/stacks"
    
    aws cloudformation wait stack-create-complete `
        --stack-name $stackName `
        --region $Region `
        --profile $SSOProfile
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "✗ Stack creation failed or timed out"
        Write-Info "Check AWS Console for details"
        exit 1
    }
    Write-Success "✓ Stack created successfully"
    
}
else {
    Write-Warning "`nDry-run mode (--DeployStack not specified)"
    Write-Info "Parameters that would be used:"
    $parameters | ForEach-Object {
        if ($_.ParameterKey -match "Password|Secret") {
            Write-Host "  $($_.ParameterKey): ********" -ForegroundColor Gray
        }
        else {
            Write-Host "  $($_.ParameterKey): $($_.ParameterValue)" -ForegroundColor Gray
        }
    }
    Write-Info "`nTo deploy, run: .\deploy-with-domain.ps1 -DeployStack"
    exit 0
}

# ==========================================
# VERIFY DEPLOYMENT
# ==========================================

Write-Info "`n[8/8] Verifying deployment..."

# Get stack outputs
$outputs = aws cloudformation describe-stacks `
    --stack-name $stackName `
    --region $Region `
    --profile $SSOProfile `
    --output json | ConvertFrom-Json

$stack = $outputs.Stacks[0]

Write-Success "`n✓ DEPLOYMENT SUCCESSFUL!"
Write-Host "`n==========================================
📊 STACK OUTPUTS
==========================================
" -ForegroundColor Magenta

foreach ($output in $stack.Outputs) {
    Write-Host "$($output.OutputKey):" -ForegroundColor Cyan
    Write-Host "  $($output.OutputValue)" -ForegroundColor White
}

# Test domain
Write-Info "`n==========================================
🧪 TESTING DOMAIN
==========================================
"

$testUrls = @(
    "https://$DomainName"
    "https://www.$DomainName"
    "https://api.$DomainName/health"
)

foreach ($url in $testUrls) {
    Write-Info "Testing: $url"
    try {
        $response = Invoke-WebRequest -Uri $url -Method HEAD -TimeoutSec 10
        Write-Success "  ✓ Status: $($response.StatusCode)"
    }
    catch {
        Write-Warning "  ⚠ Not yet accessible (DNS may still be propagating)"
    }
}

Write-Host "`n==========================================
✅ DEPLOYMENT COMPLETE
==========================================
" -ForegroundColor Green

Write-Info "Next steps:"
Write-Info "1. Deploy ECS tasks (backend & storefront)"
Write-Info "2. Run database migrations"
Write-Info "3. Configure Medusa admin"
Write-Info "4. Test application functionality"

Write-Host "`n🎉 YSH B2B Platform is ready on $DomainName" -ForegroundColor Magenta
