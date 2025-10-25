# ============================================================================
# Log Monitor Script - PowerShell
# ============================================================================
# Purpose: Real-time log monitoring and statistics
# Usage: .\monitor-logs.ps1 [-Watch] [-Tail 50]
# ============================================================================

param(
    [switch]$Watch = $false,
    [int]$Tail = 50,
    [string]$LogFile = "",
    [string]$Filter = ""
)

$LogDir = "logs"

Write-Host "📊 YSH Log Monitor" -ForegroundColor Cyan
Write-Host "=" * 60

# Function to format bytes
function Format-FileSize {
    param([long]$Size)
    
    if ($Size -gt 1GB) {
        return "{0:N2} GB" -f ($Size / 1GB)
    }
    elseif ($Size -gt 1MB) {
        return "{0:N2} MB" -f ($Size / 1MB)
    }
    elseif ($Size -gt 1KB) {
        return "{0:N2} KB" -f ($Size / 1KB)
    }
    else {
        return "{0} bytes" -f $Size
    }
}

# List available log files
if (!$LogFile) {
    Write-Host "`n📁 Available Log Files:" -ForegroundColor Yellow
    
    if (Test-Path $LogDir) {
        $logFiles = Get-ChildItem $LogDir -Filter "*.log" -File | Sort-Object LastWriteTime -Descending
        
        if ($logFiles.Count -eq 0) {
            Write-Host "  No log files found" -ForegroundColor Gray
            exit 0
        }
        
        $index = 1
        foreach ($file in $logFiles) {
            $size = Format-FileSize $file.Length
            $age = (Get-Date) - $file.LastWriteTime
            $ageStr = if ($age.TotalDays -gt 1) {
                "{0:N0} days ago" -f $age.TotalDays
            }
            elseif ($age.TotalHours -gt 1) {
                "{0:N0} hours ago" -f $age.TotalHours
            }
            else {
                "{0:N0} minutes ago" -f $age.TotalMinutes
            }
            
            Write-Host "  $index. $($file.Name)" -ForegroundColor Cyan
            Write-Host "     Size: $size | Modified: $ageStr" -ForegroundColor Gray
            $index++
        }
        
        Write-Host ""
        $selection = Read-Host "Select log file number (or press Enter to show all)"
        
        if ($selection) {
            $selectedIndex = [int]$selection - 1
            if ($selectedIndex -ge 0 -and $selectedIndex -lt $logFiles.Count) {
                $LogFile = $logFiles[$selectedIndex].Name
            }
            else {
                Write-Host "❌ Invalid selection" -ForegroundColor Red
                exit 1
            }
        }
    }
    else {
        Write-Host "  Logs directory not found: $LogDir" -ForegroundColor Red
        exit 1
    }
}

# Display log content
if ($LogFile) {
    $logPath = Join-Path $LogDir $LogFile
    
    if (!(Test-Path $logPath)) {
        Write-Host "❌ Log file not found: $logPath" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n📄 Viewing: $LogFile" -ForegroundColor Yellow
    Write-Host ""
    
    if ($Watch) {
        Write-Host "👁️  Watching for new entries... (Press Ctrl+C to stop)" -ForegroundColor Cyan
        Write-Host ""
        
        if ($Filter) {
            Get-Content $logPath -Tail $Tail -Wait | Where-Object { $_ -match $Filter }
        }
        else {
            Get-Content $logPath -Tail $Tail -Wait
        }
    }
    else {
        if ($Filter) {
            Get-Content $logPath -Tail $Tail | Where-Object { $_ -match $Filter }
        }
        else {
            Get-Content $logPath -Tail $Tail
        }
    }
}
else {
    # Show statistics for all logs
    Write-Host "`n📈 Log Statistics:" -ForegroundColor Yellow
    Write-Host ""
    
    $allLogs = Get-ChildItem $LogDir -Filter "*.log" -File -Recurse
    $totalSize = ($allLogs | Measure-Object -Property Length -Sum).Sum
    $totalLines = 0
    
    foreach ($log in $allLogs) {
        $lines = (Get-Content $log.FullName -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
        $totalLines += $lines
        
        Write-Host "$($log.Name):" -ForegroundColor Cyan
        Write-Host "  • Lines: $lines"
        Write-Host "  • Size: $(Format-FileSize $log.Length)"
        Write-Host "  • Modified: $($log.LastWriteTime)"
        Write-Host ""
    }
    
    Write-Host "Total:" -ForegroundColor Green
    Write-Host "  • Files: $($allLogs.Count)"
    Write-Host "  • Lines: $totalLines"
    Write-Host "  • Size: $(Format-FileSize $totalSize)"
    Write-Host ""
    
    # Analyze log levels
    Write-Host "🔍 Log Level Distribution:" -ForegroundColor Yellow
    
    $errorCount = 0
    $warnCount = 0
    $infoCount = 0
    
    foreach ($log in $allLogs) {
        $content = Get-Content $log.FullName -ErrorAction SilentlyContinue
        $errorCount += ($content | Select-String -Pattern " ERROR " -SimpleMatch).Count
        $warnCount += ($content | Select-String -Pattern " WARNING " -SimpleMatch).Count
        $infoCount += ($content | Select-String -Pattern " INFO " -SimpleMatch).Count
    }
    
    Write-Host "  • ERROR: $errorCount" -ForegroundColor Red
    Write-Host "  • WARNING: $warnCount" -ForegroundColor Yellow
    Write-Host "  • INFO: $infoCount" -ForegroundColor Green
    
    if ($errorCount -gt 0) {
        Write-Host "`n⚠️  Recent errors found! Use -LogFile to investigate." -ForegroundColor Red
    }
}

Write-Host "`n💡 Tips:" -ForegroundColor Cyan
Write-Host "  • Use -Watch to follow logs in real-time"
Write-Host "  • Use -Filter 'ERROR' to filter by keyword"
Write-Host "  • Use -Tail 100 to show more lines"
Write-Host ""
