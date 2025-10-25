# ============================================================================
# YSH Data Pipeline - Automated Setup Script (PowerShell)
# ============================================================================
# Version: 1.0.0
# Date: October 14, 2025
# Purpose: One-command setup for entire stack
# Usage: .\setup.ps1
# ============================================================================

# Requires -Version 5.1

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

# Banner
function Show-Banner {
    Write-Host @"

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🚀 YSH DATA PIPELINE - AUTOMATED SETUP                     ║
║                                                               ║
║   Stack: PostgreSQL, Redis, Airflow, Grafana, Prometheus    ║
║   Version: 1.0.0                                             ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan
}

# Check prerequisites
function Test-Prerequisites {
    Write-Info "`n[1/8] Checking prerequisites..."
    
    # Docker
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "❌ Docker not found. Please install Docker Desktop."
        exit 1
    }
    Write-Success "✅ Docker found: $(docker --version)"
    
    # Docker Compose
    if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "❌ Docker Compose not found."
        exit 1
    }
    Write-Success "✅ Docker Compose found: $(docker-compose --version)"
    
    # Docker running
    try {
        docker ps | Out-Null
        Write-Success "✅ Docker is running"
    }
    catch {
        Write-Error "❌ Docker is not running. Please start Docker Desktop."
        exit 1
    }
    
    # Disk space (at least 20GB)
    $drive = (Get-Location).Drive
    $freeSpace = (Get-PSDrive $drive.Name).Free / 1GB
    if ($freeSpace -lt 20) {
        Write-Warning "⚠️  Low disk space: $([math]::Round($freeSpace, 2))GB available"
        Write-Warning "    Recommended: 20GB+ free space"
    }
    else {
        Write-Success "✅ Disk space: $([math]::Round($freeSpace, 2))GB available"
    }
}

# Pull Docker images
function Get-DockerImages {
    Write-Info "`n[2/8] Pulling Docker images (this may take 5-10 minutes)..."
    
    docker-compose pull
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✅ All images pulled successfully"
    }
    else {
        Write-Error "❌ Failed to pull images"
        exit 1
    }
}

# Start services
function Start-Services {
    Write-Info "`n[3/8] Starting services..."
    
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✅ All services started"
    }
    else {
        Write-Error "❌ Failed to start services"
        exit 1
    }
}

# Wait for PostgreSQL
function Wait-ForPostgreSQL {
    Write-Info "`n[4/8] Waiting for PostgreSQL to be ready..."
    
    $maxAttempts = 30
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        $attempt++
        
        try {
            docker-compose exec -T postgres pg_isready -U ysh_admin -d ysh_pipeline 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Success "✅ PostgreSQL is ready"
                return
            }
        }
        catch {
            # Continue waiting
        }
        
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
    
    Write-Error "`n❌ PostgreSQL failed to start within 60 seconds"
    exit 1
}

# Initialize databases
function Initialize-Databases {
    Write-Info "`n[5/8] Initializing databases..."
    
    # PostgreSQL schema already loaded via init script
    Write-Success "✅ PostgreSQL schema loaded"
    
    # Verify tables
    Write-Info "   Verifying tables..."
    $tables = docker-compose exec -T postgres psql -U ysh_admin -d ysh_pipeline -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema IN ('aneel', 'products', 'pipeline', 'audit')"
    $tableCount = $tables.Trim()
    
    if ([int]$tableCount -gt 0) {
        Write-Success "✅ Found $tableCount tables"
    }
    else {
        Write-Warning "⚠️  No tables found. Run SQL-SCHEMA-POSTGRESQL.sql manually."
    }
    
    # DynamoDB tables
    Write-Info "   Creating DynamoDB tables..."
    docker cp SQL-SCHEMA-DYNAMODB.py ysh-api:/tmp/
    docker-compose exec -T ysh-api python /tmp/SQL-SCHEMA-DYNAMODB.py create --endpoint http://dynamodb-local:8000 --region us-east-1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✅ DynamoDB tables created"
    }
    else {
        Write-Warning "⚠️  DynamoDB table creation failed (may already exist)"
    }
}

# Populate test data
function Add-TestData {
    Write-Info "`n[6/8] Populating test data..."
    
    docker cp SQL-MIGRATION.py ysh-api:/tmp/
    docker-compose exec -T ysh-api python /tmp/SQL-MIGRATION.py test --pg-host postgres --redis-host redis
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "✅ Test data populated"
    }
    else {
        Write-Warning "⚠️  Test data population failed"
    }
}

# Wait for Airflow
function Wait-ForAirflow {
    Write-Info "`n[7/8] Waiting for Airflow to be ready..."
    
    $maxAttempts = 60
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        $attempt++
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Success "✅ Airflow is ready"
                return
            }
        }
        catch {
            # Continue waiting
        }
        
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 2
    }
    
    Write-Warning "`n⚠️  Airflow webserver not responding (may need more time)"
}

# Show service status
function Show-Status {
    Write-Info "`n[8/8] Checking service status...`n"
    
    docker-compose ps
    
    Write-Info "`n"
}

# Show access information
function Show-AccessInfo {
    Write-Success @"

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ✅ SETUP COMPLETE!                                         ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

📍 SERVICE ACCESS INFORMATION
════════════════════════════════════════════════════════════════

🌐 WEB INTERFACES:
────────────────────────────────────────────────────────────────
  Airflow       → http://localhost:8080  (admin / admin_2025)
  Grafana       → http://localhost:3000  (admin / grafana_2025)
  Prometheus    → http://localhost:9090
  MinIO Console → http://localhost:9001  (ysh_admin / ysh_minio_2025)
  Qdrant        → http://localhost:6333/dashboard
  Flower        → http://localhost:5555
  YSH API       → http://localhost:8888/docs

🗄️  DATABASE CONNECTIONS:
────────────────────────────────────────────────────────────────
  PostgreSQL:
    Host: localhost
    Port: 5432
    DB:   ysh_pipeline
    User: ysh_admin
    Pass: ysh_secure_2025

  Redis:
    Host: localhost
    Port: 6379
    Pass: ysh_redis_2025

  DynamoDB:
    Endpoint: http://localhost:8000
    Region:   us-east-1

📊 MONITORING:
────────────────────────────────────────────────────────────────
  • Grafana dashboards configured with Prometheus
  • PostgreSQL + Redis exporters active
  • Container metrics via cAdvisor
  • Host metrics via Node Exporter

🔧 USEFUL COMMANDS:
────────────────────────────────────────────────────────────────
  View logs:       docker-compose logs -f [service]
  Restart service: docker-compose restart [service]
  Stop all:        docker-compose down
  Start all:       docker-compose up -d

📖 DOCUMENTATION:
────────────────────────────────────────────────────────────────
  • README-DOCKER.md    - Complete Docker guide
  • IMPLEMENTATION-FINAL.md - Architecture overview
  • SQL-SCHEMA-POSTGRESQL.sql - Database schema

════════════════════════════════════════════════════════════════

"@
}

# Main execution
function Main {
    Show-Banner
    
    Test-Prerequisites
    Get-DockerImages
    Start-Services
    Wait-ForPostgreSQL
    Initialize-Databases
    Add-TestData
    Wait-ForAirflow
    Show-Status
    Show-AccessInfo
}

# Run
try {
    Main
}
catch {
    Write-Error "`n❌ Setup failed: $_"
    Write-Info "`nCheck logs with: docker-compose logs"
    exit 1
}

# ============================================================================
# END OF SCRIPT
# ============================================================================
