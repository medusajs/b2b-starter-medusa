# ==========================================
# Cleanup Untagged ECR Images
# Remove imagens sem tag dos repositórios ECR
# ==========================================

param(
    [Parameter(Mandatory = $true, HelpMessage = "Repository name")]
    [string]$Repository,
    
    [Parameter(Mandatory = $false, HelpMessage = "AWS Profile")]
    [string]$Profile = "ysh-production",
    
    [Parameter(Mandatory = $false, HelpMessage = "AWS Region")]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory = $false, HelpMessage = "Dry run mode")]
    [switch]$DryRun
)

# Colors
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Header
Write-ColorOutput @"

╔═══════════════════════════════════════════════════════════╗
║         ECR Untagged Images Cleanup - YSH Backend         ║
╚═══════════════════════════════════════════════════════════╝

"@ $InfoColor

Write-ColorOutput "Repository: $Repository" $InfoColor
Write-ColorOutput "Profile:    $Profile" $InfoColor
Write-ColorOutput "Region:     $Region" $InfoColor
if ($DryRun) {
    Write-ColorOutput "Mode:       DRY RUN (no changes)" $WarningColor
}
else {
    Write-ColorOutput "Mode:       LIVE (will delete)" $ErrorColor
}
Write-ColorOutput ""

# Validation
Write-ColorOutput "🔍 Validating AWS CLI..." $InfoColor

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-ColorOutput "❌ AWS CLI is not installed or not in PATH" $ErrorColor
    exit 1
}

# Test AWS authentication
try {
    $identity = aws sts get-caller-identity --profile $Profile 2>&1 | ConvertFrom-Json
    Write-ColorOutput "✅ Authenticated as: $($identity.Arn)" $SuccessColor
}
catch {
    Write-ColorOutput "❌ Failed to authenticate with AWS" $ErrorColor
    Write-ColorOutput "   Run: aws sso login --profile $Profile" $InfoColor
    exit 1
}

# List untagged images
Write-ColorOutput "`n🔍 Searching for untagged images in: $Repository" $InfoColor

try {
    $result = aws ecr list-images `
        --repository-name $Repository `
        --filter "tagStatus=UNTAGGED" `
        --profile $Profile `
        --region $Region `
        --output json 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "❌ Failed to list images. Repository may not exist." $ErrorColor
        exit 1
    }
    
    $imageData = $result | ConvertFrom-Json
    $untaggedImages = $imageData.imageIds
}
catch {
    Write-ColorOutput "❌ Error listing images: $_" $ErrorColor
    exit 1
}

$count = if ($untaggedImages) { $untaggedImages.Count } else { 0 }

if ($count -eq 0) {
    Write-ColorOutput "✅ No untagged images found. Repository is clean!" $SuccessColor
    exit 0
}

Write-ColorOutput "Found $count untagged image(s)" $WarningColor
Write-ColorOutput ""

# Display images to be deleted
Write-ColorOutput "Images to be deleted:" $InfoColor
$untaggedImages | ForEach-Object {
    $shortDigest = $_.imageDigest.Substring(7, 12)
    Write-ColorOutput "  - sha256:$shortDigest..." "Gray"
}
Write-ColorOutput ""

if ($DryRun) {
    Write-ColorOutput "🔍 DRY RUN - Would delete $count image(s)" $WarningColor
    Write-ColorOutput "   Run without -DryRun to actually delete" $InfoColor
    exit 0
}

# Confirmation
Write-ColorOutput "⚠️  WARNING: You are about to delete $count untagged image(s)" $WarningColor
Write-ColorOutput "   This action cannot be undone!" $ErrorColor
Write-ColorOutput ""
$confirmation = Read-Host "Type 'DELETE' to confirm"

if ($confirmation -ne 'DELETE') {
    Write-ColorOutput "❌ Deletion cancelled" $WarningColor
    exit 0
}

# Delete untagged images
Write-ColorOutput "`n🗑️  Deleting $count untagged image(s)..." $InfoColor

$deleted = 0
$failed = 0

foreach ($image in $untaggedImages) {
    try {
        $shortDigest = $image.imageDigest.Substring(7, 12)
        Write-ColorOutput "  Deleting sha256:$shortDigest..." "Gray"
        
        $deleteResult = aws ecr batch-delete-image `
            --repository-name $Repository `
            --image-ids imageDigest=$($image.imageDigest) `
            --profile $Profile `
            --region $Region `
            --output json 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $deleted++
            Write-ColorOutput "    ✅ Deleted" $SuccessColor
        }
        else {
            $failed++
            Write-ColorOutput "    ❌ Failed" $ErrorColor
        }
    }
    catch {
        $failed++
        Write-ColorOutput "    ❌ Error: $_" $ErrorColor
    }
}

# Summary
Write-ColorOutput @"

╔═══════════════════════════════════════════════════════════╗
║                      Cleanup Summary                      ║
╚═══════════════════════════════════════════════════════════╝

"@ $InfoColor

Write-ColorOutput "Repository:     $Repository" $InfoColor
Write-ColorOutput "Total found:    $count" $InfoColor
Write-ColorOutput "Deleted:        $deleted" $SuccessColor
Write-ColorOutput "Failed:         $failed" $(if ($failed -gt 0) { $ErrorColor } else { $SuccessColor })
Write-ColorOutput ""

if ($deleted -gt 0) {
    $savedSpace = $deleted * 50  # Rough estimate: 50MB per layer
    Write-ColorOutput "✅ Cleanup completed successfully!" $SuccessColor
    Write-ColorOutput "   Estimated space freed: ~$savedSpace MB" $InfoColor
}

if ($failed -gt 0) {
    Write-ColorOutput "⚠️  Some images could not be deleted" $WarningColor
    Write-ColorOutput "   Check AWS permissions and try again" $InfoColor
}

Write-ColorOutput ""
