#!/usr/bin/env pwsh
# ==========================================
# YSH B2B - Health Check Script
# Verifica saúde de todos os serviços Docker
# ==========================================

param(
    [switch]$Verbose,
    [switch]$Fix
)

Write-Host "🏥 YSH B2B - Health Check" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

# Counters
$totalServices = 0
$healthyServices = 0
$unhealthyServices = 0

# Function to check service health
function Test-ServiceHealth {
    param(
        [string]$Name,
        [string]$Container,
        [string]$HealthUrl,
        [int]$ExpectedStatus = 200
    )
    
    $script:totalServices++
    
    Write-Host "[$Name]" -ForegroundColor Cyan -NoNewline
    Write-Host " Checking... " -NoNewline
    
    # Check if container exists and is running
    $containerStatus = docker ps --filter "name=$Container" --format "{{.Status}}" 2>$null
    
    if (-not $containerStatus) {
        Write-Host "❌ Container not found or not running" -ForegroundColor $Red
        $script:unhealthyServices++
        return $false
    }
    
    if ($containerStatus -like "*unhealthy*") {
        Write-Host "❌ Unhealthy" -ForegroundColor $Red
        $script:unhealthyServices++
        
        if ($Verbose) {
            Write-Host "   Status: $containerStatus" -ForegroundColor Gray
            $logs = docker logs $Container --tail 10 2>&1
            Write-Host "   Recent logs:" -ForegroundColor Gray
            Write-Host "   $($logs -join "`n   ")" -ForegroundColor Gray
        }
        
        return $false
    }
    
    # Check health endpoint if provided
    if ($HealthUrl) {
        try {
            $response = Invoke-WebRequest -Uri $HealthUrl -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            
            if ($response.StatusCode -eq $ExpectedStatus) {
                Write-Host "✅ Healthy" -ForegroundColor $Green
                $script:healthyServices++
                
                if ($Verbose) {
                    Write-Host "   Status: $containerStatus" -ForegroundColor Gray
                    Write-Host "   Response: $($response.StatusCode)" -ForegroundColor Gray
                }
                
                return $true
            }
            else {
                Write-Host "⚠️  Unexpected response ($($response.StatusCode))" -ForegroundColor $Yellow
                $script:unhealthyServices++
                return $false
            }
        }
        catch {
            Write-Host "❌ Cannot reach endpoint" -ForegroundColor $Red
            $script:unhealthyServices++
            
            if ($Verbose) {
                Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
            }
            
            return $false
        }
    }
    else {
        # No health endpoint, check if running with healthy status
        if ($containerStatus -like "*healthy*" -or ($containerStatus -like "Up *" -and $containerStatus -notlike "*unhealthy*")) {
            Write-Host "✅ Running" -ForegroundColor $Green
            $script:healthyServices++
            return $true
        }
        else {
            Write-Host "⚠️  Running (no health check)" -ForegroundColor $Yellow
            return $true
        }
    }
}

# Function to check port availability
function Test-PortAvailable {
    param(
        [string]$Host = "localhost",
        [int]$Port
    )
    
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect($Host, $Port)
        $tcpClient.Close()
        return $true
    }
    catch {
        return $false
    }
}

Write-Host "🔍 Checking Core Infrastructure..." -ForegroundColor Cyan
Write-Host ""

# PostgreSQL
Test-ServiceHealth -Name "PostgreSQL (Medusa)" -Container "ysh-postgres" -HealthUrl $null

# Redis
Test-ServiceHealth -Name "Redis (Cache)" -Container "ysh-redis" -HealthUrl $null

Write-Host ""
Write-Host "🔍 Checking Application Layer..." -ForegroundColor Cyan
Write-Host ""

# Backend
Test-ServiceHealth -Name "Medusa Backend" -Container "ysh-backend" -HealthUrl "http://localhost:9000/health"

# Storefront
Test-ServiceHealth -Name "Next.js Storefront" -Container "ysh-storefront" -HealthUrl "http://localhost:8000"

Write-Host ""
Write-Host "🔍 Checking Data Platform..." -ForegroundColor Cyan
Write-Host ""

# Kafka
Test-ServiceHealth -Name "Kafka (Redpanda)" -Container "ysh-kafka" -HealthUrl "http://localhost:9644/v1/status/ready"

# MinIO
Test-ServiceHealth -Name "MinIO (S3)" -Container "ysh-minio" -HealthUrl "http://localhost:9001/minio/health/live"

# Qdrant
Test-ServiceHealth -Name "Qdrant (Vector DB)" -Container "ysh-qdrant" -HealthUrl "http://localhost:6333/health"

# Ollama
Test-ServiceHealth -Name "Ollama (LLM)" -Container "ysh-ollama" -HealthUrl "http://localhost:11434/api/tags"

Write-Host ""
Write-Host "🔍 Checking Orchestration..." -ForegroundColor Cyan
Write-Host ""

# Dagster Postgres
Test-ServiceHealth -Name "PostgreSQL (Dagster)" -Container "ysh-dagster-postgres" -HealthUrl $null

# Dagster Daemon
Test-ServiceHealth -Name "Dagster Daemon" -Container "ysh-dagster-daemon" -HealthUrl $null

# Dagster Webserver
Test-ServiceHealth -Name "Dagster UI" -Container "ysh-dagster-webserver" -HealthUrl "http://localhost:3001"

Write-Host ""
Write-Host "🔍 Checking Infrastructure..." -ForegroundColor Cyan
Write-Host ""

# Nginx
Test-ServiceHealth -Name "Nginx (Reverse Proxy)" -Container "ysh-nginx" -HealthUrl "http://localhost:80"

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "📊 Summary" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

$healthPercentage = [math]::Round(($healthyServices / $totalServices) * 100, 1)

Write-Host "Total Services: $totalServices" -ForegroundColor White
Write-Host "Healthy: $healthyServices" -ForegroundColor $Green
Write-Host "Unhealthy: $unhealthyServices" -ForegroundColor $Red
Write-Host "Health Score: $healthPercentage%" -ForegroundColor $(if ($healthPercentage -ge 90) { $Green } elseif ($healthPercentage -ge 70) { $Yellow } else { $Red })

Write-Host ""

# Check resource usage
Write-Host "📈 Resource Usage" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" | Select-String "ysh-" | ForEach-Object {
    Write-Host $_ -ForegroundColor Gray
}

Write-Host ""

# Recommendations
if ($unhealthyServices -gt 0) {
    Write-Host "⚠️  Recommendations:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Check container logs: docker logs <container-name>" -ForegroundColor Gray
    Write-Host "2. Restart unhealthy services: docker restart <container-name>" -ForegroundColor Gray
    Write-Host "3. Check disk space: docker system df" -ForegroundColor Gray
    Write-Host "4. Review environment variables in .env file" -ForegroundColor Gray
    
    if ($Fix) {
        Write-Host ""
        Write-Host "🔧 Auto-fixing unhealthy services..." -ForegroundColor Yellow
        
        # Restart unhealthy containers
        docker ps -a --filter "health=unhealthy" --format "{{.Names}}" | ForEach-Object {
            Write-Host "   Restarting $_..." -ForegroundColor Gray
            docker restart $_ | Out-Null
        }
        
        Write-Host "   Done! Wait 30 seconds and run health check again." -ForegroundColor Green
    }
    else {
        Write-Host ""
        Write-Host "Run with -Fix flag to automatically restart unhealthy services." -ForegroundColor Gray
    }
}
else {
    Write-Host "✅ All services are healthy!" -ForegroundColor $Green
}

Write-Host ""

# Check important ports
Write-Host "🔌 Port Status" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

$ports = @{
    "Backend (Medusa)"     = 9000
    "Storefront (Next.js)" = 8000
    "PostgreSQL"           = 5432
    "Redis"                = 6379
    "Kafka"                = 9092
    "MinIO API"            = 9001
    "MinIO Console"        = 9002
    "Qdrant HTTP"          = 6333
    "Ollama"               = 11434
    "Dagster UI"           = 3001
    "Nginx"                = 80
}

foreach ($service in $ports.Keys) {
    $port = $ports[$service]
    $available = Test-PortAvailable -Port $port
    
    $status = if ($available) { "✅ Open" } else { "❌ Closed" }
    $color = if ($available) { $Green } else { $Red }
    
    Write-Host "$service" -NoNewline
    Write-Host " (Port $port): " -NoNewline -ForegroundColor Gray
    Write-Host $status -ForegroundColor $color
}

Write-Host ""
Write-Host "🎉 Health check complete!" -ForegroundColor Cyan
Write-Host ""

# Exit code
exit $(if ($unhealthyServices -eq 0) { 0 } else { 1 })
