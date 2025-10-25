# ==========================================
# Enable ECR Image Scanning
# Ativa scan automático de vulnerabilidades
# ==========================================

param(
    [Parameter(Mandatory = $false, HelpMessage = "Repository name (leave empty for all)")]
    [string]$Repository = "",
    
    [Parameter(Mandatory = $false, HelpMessage = "AWS Profile")]
    [string]$Profile = "ysh-production",
    
    [Parameter(Mandatory = $false, HelpMessage = "AWS Region")]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory = $false, HelpMessage = "Enable or disable scanning")]
    [ValidateSet("enable", "disable")]
    [string]$Action = "enable"
)

# Colors
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"
$ErrorColor = "Red"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Header
Write-ColorOutput @"

╔═══════════════════════════════════════════════════════════╗
║         ECR Image Scanning Configuration Tool             ║
╚═══════════════════════════════════════════════════════════╝

"@ $InfoColor

Write-ColorOutput "Profile:    $Profile" $InfoColor
Write-ColorOutput "Region:     $Region" $InfoColor
Write-ColorOutput "Action:     $($Action.ToUpper())" $(if ($Action -eq "enable") { $SuccessColor } else { $WarningColor })
Write-ColorOutput ""

# Validation
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-ColorOutput "❌ AWS CLI is not installed" $ErrorColor
    exit 1
}

# Test authentication
try {
    $identity = aws sts get-caller-identity --profile $Profile 2>&1 | ConvertFrom-Json
    Write-ColorOutput "✅ Authenticated as: $($identity.Arn)" $SuccessColor
}
catch {
    Write-ColorOutput "❌ Failed to authenticate" $ErrorColor
    Write-ColorOutput "   Run: aws sso login --profile $Profile" $InfoColor
    exit 1
}

# Get repositories
Write-ColorOutput "`n🔍 Fetching ECR repositories..." $InfoColor

if ($Repository) {
    $repositories = @($Repository)
    Write-ColorOutput "Target: $Repository" $InfoColor
}
else {
    try {
        $repoData = aws ecr describe-repositories `
            --profile $Profile `
            --region $Region `
            --output json 2>&1 | ConvertFrom-Json
        
        $repositories = $repoData.repositories | ForEach-Object { $_.repositoryName }
        Write-ColorOutput "Found $($repositories.Count) repositories" $InfoColor
    }
    catch {
        Write-ColorOutput "❌ Failed to list repositories: $_" $ErrorColor
        exit 1
    }
}

Write-ColorOutput ""

# Configure scanning for each repository
$scanValue = if ($Action -eq "enable") { "true" } else { "false" }
$updated = 0
$failed = 0

foreach ($repo in $repositories) {
    Write-ColorOutput "Processing: $repo" $InfoColor
    
    try {
        $result = aws ecr put-image-scanning-configuration `
            --repository-name $repo `
            --image-scanning-configuration "scanOnPush=$scanValue" `
            --profile $Profile `
            --region $Region `
            --output json 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $updated++
            if ($Action -eq "enable") {
                Write-ColorOutput "  ✅ Scan on push ENABLED" $SuccessColor
            }
            else {
                Write-ColorOutput "  ✅ Scan on push DISABLED" $WarningColor
            }
        }
        else {
            $failed++
            Write-ColorOutput "  ❌ Failed to update" $ErrorColor
        }
    }
    catch {
        $failed++
        Write-ColorOutput "  ❌ Error: $_" $ErrorColor
    }
}

# Summary
Write-ColorOutput @"

╔═══════════════════════════════════════════════════════════╗
║                    Configuration Summary                  ║
╚═══════════════════════════════════════════════════════════╝

"@ $InfoColor

Write-ColorOutput "Action:         $($Action.ToUpper())" $InfoColor
Write-ColorOutput "Total repos:    $($repositories.Count)" $InfoColor
Write-ColorOutput "Updated:        $updated" $SuccessColor
Write-ColorOutput "Failed:         $failed" $(if ($failed -gt 0) { $ErrorColor } else { $SuccessColor })
Write-ColorOutput ""

if ($updated -gt 0) {
    Write-ColorOutput "✅ Configuration completed successfully!" $SuccessColor
    
    if ($Action -eq "enable") {
        Write-ColorOutput @"

📊 Image Scanning Information:
   - New images will be automatically scanned on push
   - Scan results available in AWS Console
   - Vulnerabilities will be categorized by severity
   - No additional cost for scanning

🔍 To view scan results:
   aws ecr describe-image-scan-findings \
     --repository-name REPO_NAME \
     --image-id imageTag=TAG \
     --profile $Profile \
     --region $Region

"@ $InfoColor
    }
}

if ($failed -gt 0) {
    Write-ColorOutput "⚠️  Some repositories could not be updated" $WarningColor
    Write-ColorOutput "   Check AWS permissions" $InfoColor
}

Write-ColorOutput ""
