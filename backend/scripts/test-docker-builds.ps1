# ==========================================
# Docker Build & Test Script
# Testa builds de todas as variantes
# ==========================================

param(
    [Parameter(Mandatory = $false, HelpMessage = "Which Dockerfile to build")]
    [ValidateSet("all", "production", "optimized", "dev")]
    [string]$Target = "all",
    
    [Parameter(Mandatory = $false, HelpMessage = "Run tests after build")]
    [switch]$RunTests,
    
    [Parameter(Mandatory = $false, HelpMessage = "Compare image sizes")]
    [switch]$Compare,
    
    [Parameter(Mandatory = $false, HelpMessage = "Use BuildKit")]
    [switch]$UseBuildKit
)

$ErrorActionPreference = "Stop"

# Colors
function Write-Step { param([string]$msg) Write-Host "`n==> $msg" -ForegroundColor Cyan }
function Write-Success { param([string]$msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Error { param([string]$msg) Write-Host "❌ $msg" -ForegroundColor Red }

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║         Docker Build & Test - YSH Backend                 ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# BuildKit
if ($UseBuildKit) {
    $env:DOCKER_BUILDKIT = "1"
    Write-Host "🚀 Using BuildKit for faster builds" -ForegroundColor Cyan
}

# Build configurations
$builds = @()

if ($Target -eq "all" -or $Target -eq "production") {
    $builds += @{
        Name = "Production"
        File = "Dockerfile"
        Tag  = "ysh-backend:production-test"
    }
}

if ($Target -eq "all" -or $Target -eq "optimized") {
    $builds += @{
        Name = "Optimized Multi-Stage"
        File = "Dockerfile.optimized"
        Tag  = "ysh-backend:optimized-test"
    }
}

if ($Target -eq "all" -or $Target -eq "dev") {
    $builds += @{
        Name = "Development"
        File = "Dockerfile.dev"
        Tag  = "ysh-backend:dev-test"
    }
}

# Results tracking
$results = @()

# Build each configuration
foreach ($build in $builds) {
    Write-Step "Building: $($build.Name)"
    Write-Host "Dockerfile: $($build.File)" -ForegroundColor Gray
    Write-Host "Tag: $($build.Tag)" -ForegroundColor Gray
    
    $startTime = Get-Date
    
    try {
        docker build -t $build.Tag -f $build.File . 2>&1 | Out-Host
        
        if ($LASTEXITCODE -eq 0) {
            $buildTime = (Get-Date) - $startTime
            $imageSize = (docker images $build.Tag --format "{{.Size}}")
            $imageId = (docker images $build.Tag --format "{{.ID}}")
            
            $results += @{
                Name      = $build.Name
                Tag       = $build.Tag
                File      = $build.File
                Success   = $true
                BuildTime = $buildTime.TotalSeconds
                Size      = $imageSize
                Id        = $imageId
            }
            
            Write-Success "Built successfully in $($buildTime.TotalSeconds.ToString('F1'))s"
            Write-Host "Size: $imageSize" -ForegroundColor Green
        }
        else {
            $results += @{
                Name    = $build.Name
                Tag     = $build.Tag
                File    = $build.File
                Success = $false
                Error   = "Build failed"
            }
            Write-Error "Build failed"
        }
    }
    catch {
        $results += @{
            Name    = $build.Name
            Tag     = $build.Tag
            File    = $build.File
            Success = $false
            Error   = $_.Exception.Message
        }
        Write-Error "Build error: $_"
    }
}

# Summary
Write-Step "Build Summary"
Write-Host ("=" * 90) -ForegroundColor Gray
Write-Host ("{0,-30} {1,-15} {2,-12} {3}" -f "Configuration", "Size", "Build Time", "Status") -ForegroundColor Gray
Write-Host ("=" * 90) -ForegroundColor Gray

foreach ($result in $results) {
    if ($result.Success) {
        $status = "✅ Success"
        $color = "Green"
        Write-Host ("{0,-30} {1,-15} {2,-12} {3}" -f 
            $result.Name, 
            $result.Size, 
            "$($result.BuildTime.ToString('F1'))s",
            $status
        ) -ForegroundColor $color
    }
    else {
        $status = "❌ Failed"
        $color = "Red"
        Write-Host ("{0,-30} {1,-15} {2,-12} {3}" -f 
            $result.Name, 
            "N/A", 
            "N/A",
            $status
        ) -ForegroundColor $color
    }
}
Write-Host ("=" * 90) -ForegroundColor Gray

# Comparison
if ($Compare -and ($results | Where-Object { $_.Success }).Count -gt 1) {
    Write-Step "Size Comparison"
    
    $successResults = $results | Where-Object { $_.Success } | Sort-Object { 
        # Convert size to bytes for sorting
        $size = $_.Size
        $value = [double]($size -replace '[^0-9.]', '')
        $unit = $size -replace '[0-9.]', ''
        
        switch ($unit) {
            "GB" { $value * 1024 * 1024 * 1024 }
            "MB" { $value * 1024 * 1024 }
            "KB" { $value * 1024 }
            default { $value }
        }
    }
    
    $smallest = $successResults[0]
    Write-Host "🏆 Smallest: $($smallest.Name) - $($smallest.Size)" -ForegroundColor Green
    
    if ($successResults.Count -gt 1) {
        Write-Host ""
        Write-Host "Comparison to smallest:" -ForegroundColor Cyan
        
        foreach ($result in $successResults[1..($successResults.Count - 1)]) {
            Write-Host "  $($result.Name): $($result.Size)" -ForegroundColor Yellow
        }
    }
}

# Run tests
if ($RunTests) {
    Write-Step "Running Tests"
    
    foreach ($result in $results | Where-Object { $_.Success }) {
        Write-Host "Testing: $($result.Name)" -ForegroundColor Cyan
        
        # Start container
        $containerName = "test-$($result.Tag -replace ':', '-')"
        
        try {
            Write-Host "  Starting container..." -ForegroundColor Gray
            docker run -d --name $containerName `
                -e DATABASE_URL=postgresql://test:test@localhost:5432/test `
                -e SKIP_MIGRATIONS=true `
                -e JWT_SECRET=test-secret `
                -e COOKIE_SECRET=test-secret `
                $result.Tag 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Container started" -ForegroundColor Green
                
                # Wait a bit
                Start-Sleep -Seconds 5
                
                # Check if running
                $running = docker ps --filter "name=$containerName" --format "{{.Names}}"
                if ($running) {
                    Write-Host "  ✅ Container is running" -ForegroundColor Green
                    
                    # Check logs
                    $logs = docker logs $containerName 2>&1
                    if ($logs -match "error|Error|ERROR") {
                        Write-Host "  ⚠️  Errors found in logs" -ForegroundColor Yellow
                    }
                    else {
                        Write-Host "  ✅ No errors in logs" -ForegroundColor Green
                    }
                }
                else {
                    Write-Host "  ❌ Container stopped" -ForegroundColor Red
                }
            }
            else {
                Write-Host "  ❌ Failed to start container" -ForegroundColor Red
            }
        }
        finally {
            # Cleanup
            docker rm -f $containerName 2>&1 | Out-Null
        }
    }
}

# Final message
Write-Host ""
Write-Success "Build process completed!"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review build results above" -ForegroundColor Gray
Write-Host "  2. Test the images manually:" -ForegroundColor Gray
Write-Host "     docker run -it --rm ysh-backend:optimized-test /bin/sh" -ForegroundColor Gray
Write-Host "  3. Deploy to ECR:" -ForegroundColor Gray
Write-Host "     .\scripts\deploy-ecr.ps1 -Version v1.0.4" -ForegroundColor Gray
Write-Host ""
