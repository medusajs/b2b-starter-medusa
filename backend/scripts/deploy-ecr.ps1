# ==========================================
# Script de Deploy para AWS ECR
# Build, Tag e Push de imagem Docker
# ==========================================

param(
    [Parameter(Mandatory = $true, HelpMessage = "Version tag (e.g., v1.0.3)")]
    [ValidatePattern("^v\d+\.\d+\.\d+$")]
    [string]$Version,
    
    [Parameter(Mandatory = $false, HelpMessage = "AWS Region")]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory = $false, HelpMessage = "AWS Account ID")]
    [string]$AccountId = "773235999227",
    
    [Parameter(Mandatory = $false, HelpMessage = "Repository name")]
    [string]$Repository = "ysh-backend",
    
    [Parameter(Mandatory = $false, HelpMessage = "Dockerfile to use")]
    [string]$Dockerfile = "Dockerfile",
    
    [Parameter(Mandatory = $false, HelpMessage = "Skip build (only tag and push)")]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory = $false, HelpMessage = "Skip push (only build and tag)")]
    [switch]$SkipPush,
    
    [Parameter(Mandatory = $false, HelpMessage = "Use BuildKit for faster builds")]
    [switch]$UseBuildKit,
    
    [Parameter(Mandatory = $false, HelpMessage = "Build without cache")]
    [switch]$NoCache
)

# Colors for output
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

# Configuration
$ECR_REGISTRY = "${AccountId}.dkr.ecr.${Region}.amazonaws.com"
$ECR_REPOSITORY = "${ECR_REGISTRY}/${Repository}"
$LOCAL_IMAGE = "${Repository}:${Version}"

# Functions
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n==> $Message" $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" $SuccessColor
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" $ErrorColor
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" $WarningColor
}

# Header
Write-ColorOutput @"

╔═══════════════════════════════════════════════════════════╗
║           AWS ECR Deploy Script - YSH Backend             ║
╚═══════════════════════════════════════════════════════════╝

"@ $InfoColor

Write-ColorOutput "Version:    $Version" $InfoColor
Write-ColorOutput "Region:     $Region" $InfoColor
Write-ColorOutput "Repository: $ECR_REPOSITORY" $InfoColor
Write-ColorOutput "Dockerfile: $Dockerfile" $InfoColor
Write-ColorOutput ""

# Validation
Write-Step "Validating prerequisites..."

# Check Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker is not installed or not in PATH"
    exit 1
}

# Check AWS CLI
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Error "AWS CLI is not installed or not in PATH"
    exit 1
}

# Check Dockerfile exists
if (-not (Test-Path $Dockerfile)) {
    Write-Error "Dockerfile not found: $Dockerfile"
    exit 1
}

Write-Success "Prerequisites validated"

# AWS ECR Login
Write-Step "Authenticating with AWS ECR..."

try {
    $loginCommand = aws ecr get-login-password --region $Region
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to get ECR login password"
        exit 1
    }
    
    $loginCommand | docker login --username AWS --password-stdin $ECR_REGISTRY
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to login to ECR"
        exit 1
    }
    
    Write-Success "Authenticated with ECR"
}
catch {
    Write-Error "Authentication failed: $_"
    exit 1
}

# Build Image
if (-not $SkipBuild) {
    Write-Step "Building Docker image: $LOCAL_IMAGE"
    
    $buildArgs = @("build", "-t", $LOCAL_IMAGE, "-f", $Dockerfile)
    
    if ($NoCache) {
        $buildArgs += "--no-cache"
        Write-Warning "Building without cache (slower but clean)"
    }
    
    if ($UseBuildKit) {
        $env:DOCKER_BUILDKIT = "1"
        Write-ColorOutput "Using BuildKit for faster builds" $InfoColor
    }
    
    $buildArgs += "."
    
    Write-ColorOutput "Command: docker $($buildArgs -join ' ')" "Gray"
    
    $startTime = Get-Date
    & docker $buildArgs
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Docker build failed"
        exit 1
    }
    
    $buildDuration = (Get-Date) - $startTime
    Write-Success "Image built successfully in $($buildDuration.TotalSeconds.ToString('F1'))s"
    
    # Get image size
    $imageSize = (docker images $LOCAL_IMAGE --format "{{.Size}}")
    Write-ColorOutput "Image size: $imageSize" $InfoColor
}
else {
    Write-Warning "Skipping build (using existing local image)"
}

# Tag Images
Write-Step "Tagging images for ECR..."

# Tag with version
$versionTag = "${ECR_REPOSITORY}:${Version}"
docker tag $LOCAL_IMAGE $versionTag
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to tag image with version"
    exit 1
}
Write-Success "Tagged: $versionTag"

# Tag with 'latest'
$latestTag = "${ECR_REPOSITORY}:latest"
docker tag $LOCAL_IMAGE $latestTag
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to tag image as latest"
    exit 1
}
Write-Success "Tagged: $latestTag"

# Tag with 'previous' (for rollback)
# First, pull current 'latest' and re-tag as 'previous'
try {
    Write-ColorOutput "Updating 'previous' tag for rollback..." $InfoColor
    docker pull $latestTag 2>$null
    if ($LASTEXITCODE -eq 0) {
        $previousTag = "${ECR_REPOSITORY}:previous"
        docker tag $latestTag $previousTag
        Write-Success "Tagged previous version for rollback: $previousTag"
    }
}
catch {
    Write-Warning "Could not create 'previous' tag (first deployment?)"
}

# Push Images
if (-not $SkipPush) {
    Write-Step "Pushing images to ECR..."
    
    # Push version tag
    Write-ColorOutput "Pushing: $versionTag" $InfoColor
    docker push $versionTag
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push version tag"
        exit 1
    }
    Write-Success "Pushed: $versionTag"
    
    # Push latest tag
    Write-ColorOutput "Pushing: $latestTag" $InfoColor
    docker push $latestTag
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push latest tag"
        exit 1
    }
    Write-Success "Pushed: $latestTag"
    
    # Push previous tag (if exists)
    $previousTag = "${ECR_REPOSITORY}:previous"
    $previousExists = docker images $previousTag --format "{{.ID}}" 2>$null
    if ($previousExists) {
        Write-ColorOutput "Pushing: $previousTag" $InfoColor
        docker push $previousTag 2>$null
        Write-Success "Pushed: $previousTag"
    }
}
else {
    Write-Warning "Skipping push (images only tagged locally)"
}

# Summary
Write-ColorOutput @"

╔═══════════════════════════════════════════════════════════╗
║                   Deployment Summary                      ║
╚═══════════════════════════════════════════════════════════╝

"@ $SuccessColor

Write-ColorOutput "✅ Version:     $Version" $SuccessColor
Write-ColorOutput "✅ Registry:    $ECR_REGISTRY" $SuccessColor
Write-ColorOutput "✅ Repository:  $Repository" $SuccessColor
Write-ColorOutput "✅ Image Size:  $(docker images $LOCAL_IMAGE --format '{{.Size}}')" $SuccessColor
Write-ColorOutput ""

if (-not $SkipPush) {
    Write-ColorOutput "📦 Images pushed to ECR:" $InfoColor
    Write-ColorOutput "   - $versionTag" "Gray"
    Write-ColorOutput "   - $latestTag" "Gray"
    Write-ColorOutput ""
    
    Write-ColorOutput "🚀 Deploy on EC2 with:" $InfoColor
    Write-ColorOutput "   docker pull $latestTag" "Gray"
    Write-ColorOutput "   docker run -d --name ysh-backend -p 9000:9000 $latestTag" "Gray"
}
else {
    Write-Warning "Images not pushed to ECR (use without -SkipPush to push)"
}

Write-ColorOutput ""
Write-ColorOutput "🔄 To rollback to previous version:" $InfoColor
Write-ColorOutput "   docker pull ${ECR_REPOSITORY}:previous" "Gray"
Write-ColorOutput ""

# Cleanup option
Write-ColorOutput "🧹 To cleanup old local images:" $InfoColor
Write-ColorOutput "   docker image prune -f" "Gray"
Write-ColorOutput ""

Write-Success "Deployment completed successfully!"
