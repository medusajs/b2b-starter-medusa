# ==========================================
# Docker Images Monitor - Terminal Dedicado
# Monitora builds, pushes e scans de imagens Docker
# Uso: .\scripts\docker-monitor.ps1
# ==========================================

param(
    [int]$RefreshInterval = 30
)

$Host.UI.RawUI.WindowTitle = "Docker Images Monitor - YSH B2B"

Write-Host "`n" + "="*80 -ForegroundColor Blue
Write-Host "  DOCKER IMAGES MONITOR - YSH B2B" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Blue

while ($true) {
    Clear-Host
    Write-Host "`n" + "="*80 -ForegroundColor Blue
    Write-Host "  DOCKER IMAGES STATUS - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor White
    Write-Host "="*80 -ForegroundColor Blue
    
    # Local images
    Write-Host "`n📦 Imagens Locais:" -ForegroundColor Cyan
    docker images | Select-String "ysh-b2b|REPOSITORY" | ForEach-Object {
        if ($_ -match "REPOSITORY") {
            Write-Host $_ -ForegroundColor Yellow
        }
        else {
            Write-Host $_ -ForegroundColor White
        }
    }
    
    # ECR images
    Write-Host "`n☁️  Imagens no ECR:" -ForegroundColor Cyan
    try {
        Write-Host "`nBackend Repository:" -ForegroundColor Yellow
        aws ecr describe-images `
            --repository-name ysh-b2b/backend `
            --profile ysh-production `
            --region us-east-1 `
            --output json 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            $backend = aws ecr describe-images `
                --repository-name ysh-b2b/backend `
                --profile ysh-production `
                --region us-east-1 `
                --output json | ConvertFrom-Json
            
            $backend.imageDetails | Select-Object -First 3 | ForEach-Object {
                $tags = $_.imageTags -join ", "
                $size = [math]::Round($_.imageSizeInBytes / 1MB, 2)
                Write-Host "  Tags: $tags | Size: ${size}MB | Pushed: $($_.imagePushedAt)" -ForegroundColor Gray
            }
        }
        
        Write-Host "`nStorefront Repository:" -ForegroundColor Yellow
        aws ecr describe-images `
            --repository-name ysh-b2b/storefront `
            --profile ysh-production `
            --region us-east-1 `
            --output json 2>&1 | Out-Null
        
        if ($LASTEXITCODE -eq 0) {
            $storefront = aws ecr describe-images `
                --repository-name ysh-b2b/storefront `
                --profile ysh-production `
                --region us-east-1 `
                --output json | ConvertFrom-Json
            
            $storefront.imageDetails | Select-Object -First 3 | ForEach-Object {
                $tags = $_.imageTags -join ", "
                $size = [math]::Round($_.imageSizeInBytes / 1MB, 2)
                Write-Host "  Tags: $tags | Size: ${size}MB | Pushed: $($_.imagePushedAt)" -ForegroundColor Gray
            }
        }
    }
    catch {
        Write-Host "  ⚠️  Erro ao consultar ECR" -ForegroundColor Yellow
    }
    
    # Container status
    Write-Host "`n🐳 Containers Rodando:" -ForegroundColor Cyan
    $containers = docker ps --filter "name=ysh" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($containers) {
        Write-Host $containers -ForegroundColor White
    }
    else {
        Write-Host "  Nenhum container ysh rodando" -ForegroundColor Gray
    }
    
    Write-Host "`n⏰ Próxima atualização em ${RefreshInterval}s (Ctrl+C para sair)" -ForegroundColor Gray
    Start-Sleep -Seconds $RefreshInterval
}
