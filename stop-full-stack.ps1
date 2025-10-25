# ==========================================
# Stop Full Stack
# ==========================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "YSH B2B - Stopping Full Stack OSS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$action = Read-Host "Stop services? (keep data) [Y] or Remove everything including volumes? [N]"

if ($action -eq "N" -or $action -eq "n") {
    Write-Host ""
    Write-Host "⚠️  WARNING: This will delete ALL data including database!" -ForegroundColor Red
    $confirm = Read-Host "Are you absolutely sure? Type 'DELETE' to confirm"
    
    if ($confirm -eq "DELETE") {
        Write-Host ""
        Write-Host "🗑️  Removing all services and volumes..." -ForegroundColor Yellow
        docker-compose -f docker-compose.full-stack.yml down -v
        Write-Host "✅ All services and data removed" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Aborted" -ForegroundColor Red
        exit 0
    }
}
else {
    Write-Host ""
    Write-Host "⏸️  Stopping services (keeping data)..." -ForegroundColor Yellow
    docker-compose -f docker-compose.full-stack.yml down
    Write-Host "✅ Services stopped. Data preserved." -ForegroundColor Green
    Write-Host "   Run .\start-full-stack.ps1 to start again" -ForegroundColor Gray
}
