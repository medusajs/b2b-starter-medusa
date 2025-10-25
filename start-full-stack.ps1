# ==========================================
# YSH Full Stack Management Scripts
# PowerShell Automation
# ==========================================

# Script 1: Start Full Stack
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "YSH B2B - Starting Full Stack OSS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
$dockerRunning = docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker is running" -ForegroundColor Green

# Check if .env exists
if (!(Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file. Please edit it with your configuration." -ForegroundColor Green
    Write-Host ""
    Write-Host "Run this script again after configuring .env" -ForegroundColor Yellow
    exit 0
}

Write-Host "✅ .env file found" -ForegroundColor Green
Write-Host ""

# Start services
Write-Host "🚀 Starting services..." -ForegroundColor Cyan
docker-compose -f docker-compose.full-stack.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All services started successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Service Status:" -ForegroundColor Cyan
    docker-compose -f docker-compose.full-stack.yml ps
    Write-Host ""
    Write-Host "🌐 Access URLs:" -ForegroundColor Cyan
    Write-Host "   Storefront:      http://localhost:8000" -ForegroundColor White
    Write-Host "   Backend API:     http://localhost:9000" -ForegroundColor White
    Write-Host "   Admin Panel:     http://localhost:9000/app" -ForegroundColor White
    Write-Host "   Database UI:     http://localhost:8080" -ForegroundColor White
    Write-Host "   Redis UI:        http://localhost:8081" -ForegroundColor White
    Write-Host "   Nginx Proxy:     http://localhost" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Wait ~60s for services to be healthy"
    Write-Host "   2. Run migrations: .\scripts\run-migrations.ps1"
    Write-Host "   3. Create admin user: .\scripts\create-admin.ps1"
    Write-Host "   4. Get publishable key: .\scripts\get-publishable-key.ps1"
    Write-Host ""
    Write-Host "📝 View logs: docker-compose -f docker-compose.full-stack.yml logs -f" -ForegroundColor Gray
}
else {
    Write-Host ""
    Write-Host "❌ Failed to start services. Check logs:" -ForegroundColor Red
    Write-Host "   docker-compose -f docker-compose.full-stack.yml logs" -ForegroundColor Yellow
}
