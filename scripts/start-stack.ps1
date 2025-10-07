#!/usr/bin/env pwsh
# ==========================================
# YSH B2B - Stack Startup Script
# Inicia toda a stack FOSS otimizada
# ==========================================

param(
    [switch]$Dev,
    [switch]$Prod,
    [switch]$Clean,
    [switch]$NoPull,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "🚀 YSH B2B - Starting FOSS Stack" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Determine environment
$env:NODE_ENV = if ($Prod) { "production" } else { "development" }
$composeFile = "docker-compose.optimized.yml"

Write-Host "Environment: $($env:NODE_ENV)" -ForegroundColor Yellow
Write-Host "Compose File: $composeFile" -ForegroundColor Yellow
Write-Host ""

# Navigate to project root
$scriptDir = Split-Path -Parent $PSCommandPath
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

# Check if docker is running
Write-Host "🔍 Checking Docker..." -NoNewline
try {
    docker info | Out-Null
    Write-Host " ✅" -ForegroundColor Green
}
catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check for required files
Write-Host "🔍 Checking required files..." -NoNewline
$requiredFiles = @(
    $composeFile,
    ".env",
    "backend/Dockerfile",
    "storefront/Dockerfile",
    "data-platform/dagster/Dockerfile"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host ""
    Write-Host "Missing required files:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    
    if (".env" -in $missingFiles) {
        Write-Host ""
        Write-Host "Creating .env from .env.example..." -ForegroundColor Yellow
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Host "Created .env file. Please edit it with your configuration." -ForegroundColor Green
        }
    }
    
    exit 1
}
else {
    Write-Host " ✅" -ForegroundColor Green
}

# Clean volumes if requested
if ($Clean) {
    Write-Host ""
    Write-Host "🧹 Cleaning volumes..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "WARNING: This will delete all data!" -ForegroundColor Red
    $confirm = Read-Host "Are you sure? (yes/no)"
    
    if ($confirm -eq "yes") {
        Write-Host "Stopping containers..." -ForegroundColor Gray
        docker-compose -f $composeFile down -v
        Write-Host "Volumes cleaned!" -ForegroundColor Green
    }
    else {
        Write-Host "Aborted." -ForegroundColor Yellow
        exit 0
    }
}

# Pull images if not disabled
if (-not $NoPull) {
    Write-Host ""
    Write-Host "📦 Pulling latest images..." -ForegroundColor Cyan
    docker-compose -f $composeFile pull
    Write-Host ""
}

# Build custom images
Write-Host "🔨 Building custom images..." -ForegroundColor Cyan
Write-Host ""

$buildArgs = @("-f", $composeFile, "build")
if (-not $Verbose) {
    $buildArgs += "--quiet"
}

& docker-compose @buildArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build complete!" -ForegroundColor Green

# Start services
Write-Host ""
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
Write-Host ""

$upArgs = @("-f", $composeFile, "up", "-d", "--remove-orphans")
if ($Verbose) {
    $upArgs = $upArgs[0..($upArgs.Length - 2)] + "up" + "--remove-orphans"  # Remove -d for verbose
}

& docker-compose @upArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Failed to start services!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Services started!" -ForegroundColor Green
Write-Host ""

# Wait for services to be healthy
Write-Host "⏳ Waiting for services to be healthy (60s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

Write-Host ""

# Run health check
Write-Host "🏥 Running health check..." -ForegroundColor Cyan
Write-Host ""

& "$scriptDir/health-check.ps1"

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🎉 Stack is ready!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Service URLs:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  🛍️  Storefront:        http://localhost:8000" -ForegroundColor White
Write-Host "  🔧 Admin Panel:       http://localhost:9000/admin" -ForegroundColor White
Write-Host "  📡 API:               http://localhost:9000/store" -ForegroundColor White
Write-Host "  📊 Dagster UI:        http://localhost:3001" -ForegroundColor White
Write-Host "  🗄️  MinIO Console:     http://localhost:9002" -ForegroundColor White
Write-Host "  🔍 Qdrant Dashboard:  http://localhost:6333/dashboard" -ForegroundColor White
Write-Host "  ☁️  Kafka Admin:       http://localhost:9644" -ForegroundColor White
Write-Host ""

Write-Host "🔐 Default Credentials:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Admin Panel:  admin@test.com / supersecret" -ForegroundColor Gray
Write-Host "  MinIO:        minioadmin / minioadmin" -ForegroundColor Gray
Write-Host ""

Write-Host "📝 Useful Commands:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  View logs:       docker-compose -f $composeFile logs -f <service>" -ForegroundColor Gray
Write-Host "  Stop stack:      docker-compose -f $composeFile down" -ForegroundColor Gray
Write-Host "  Restart service: docker-compose -f $composeFile restart <service>" -ForegroundColor Gray
Write-Host "  Health check:    .\scripts\health-check.ps1" -ForegroundColor Gray
Write-Host "  Resource usage:  docker stats" -ForegroundColor Gray
Write-Host ""

Write-Host "Happy coding! 🚀" -ForegroundColor Cyan
Write-Host ""
