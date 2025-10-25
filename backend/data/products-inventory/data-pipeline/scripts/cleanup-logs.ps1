# ============================================================================
# Log Cleanup Script - PowerShell
# ============================================================================
# Purpose: Clean old logs and monitor log sizes
# Usage: .\cleanup-logs.ps1 [-DaysToKeep 7] [-DryRun]
# ============================================================================

param(
    [int]$DaysToKeep = 7,
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

# Configuration
$LogDir = "logs"
$ProcessedDataDir = "processed_data"
$MaxLogSizeMB = 100
$MaxTotalSizeMB = 500

Write-Host "🧹 YSH Log Cleanup Script" -ForegroundColor Cyan
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

# Function to get directory stats
function Get-DirectoryStats {
    param([string]$Path)
    
    if (!(Test-Path $Path)) {
        return @{
            Files     = 0
            TotalSize = 0
            OldFiles  = 0
        }
    }
    
    $files = Get-ChildItem $Path -Recurse -File -ErrorAction SilentlyContinue
    $oldFiles = $files | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$DaysToKeep) }
    
    return @{
        Files     = $files.Count
        TotalSize = ($files | Measure-Object -Property Length -Sum).Sum
        OldFiles  = $oldFiles.Count
        OldSize   = ($oldFiles | Measure-Object -Property Length -Sum).Sum
    }
}

# Analyze logs directory
Write-Host "`n📊 Current Status:" -ForegroundColor Yellow
Write-Host ""

if (Test-Path $LogDir) {
    $logStats = Get-DirectoryStats -Path $LogDir
    Write-Host "Logs Directory ($LogDir):"
    Write-Host "  • Total files: $($logStats.Files)"
    Write-Host "  • Total size: $(Format-FileSize $logStats.TotalSize)"
    Write-Host "  • Files older than $DaysToKeep days: $($logStats.OldFiles)"
    Write-Host "  • Space to free: $(Format-FileSize $logStats.OldSize)"
}
else {
    Write-Host "Logs Directory: Not found" -ForegroundColor Gray
    $logStats = @{ OldFiles = 0; OldSize = 0 }
}

if (Test-Path $ProcessedDataDir) {
    $processedStats = Get-DirectoryStats -Path $ProcessedDataDir
    Write-Host "`nProcessed Data Directory ($ProcessedDataDir):"
    Write-Host "  • Total files: $($processedStats.Files)"
    Write-Host "  • Total size: $(Format-FileSize $processedStats.TotalSize)"
    Write-Host "  • Files older than $DaysToKeep days: $($processedStats.OldFiles)"
    Write-Host "  • Space to free: $(Format-FileSize $processedStats.OldSize)"
}
else {
    Write-Host "`nProcessed Data Directory: Not found" -ForegroundColor Gray
    $processedStats = @{ OldFiles = 0; OldSize = 0 }
}

$totalOldFiles = $logStats.OldFiles + $processedStats.OldFiles
$totalSpaceToFree = $logStats.OldSize + $processedStats.OldSize

# Check if cleanup is needed
if ($totalOldFiles -eq 0) {
    Write-Host "`n✅ No cleanup needed! All files are within retention period." -ForegroundColor Green
    exit 0
}

# Perform cleanup
Write-Host "`n🗑️  Cleanup Plan:" -ForegroundColor Yellow
Write-Host "  • Files to delete: $totalOldFiles"
Write-Host "  • Space to free: $(Format-FileSize $totalSpaceToFree)"

if ($DryRun) {
    Write-Host "`n⚠️  DRY RUN - No files will be deleted" -ForegroundColor Yellow
}
else {
    Write-Host "`n⚠️  This will permanently delete files!" -ForegroundColor Red
    $confirm = Read-Host "Continue? (y/N)"
    
    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
        Write-Host "❌ Cleanup cancelled" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "`n🔄 Processing..." -ForegroundColor Cyan

$deletedCount = 0
$freedSpace = 0

# Clean logs directory
if (Test-Path $LogDir) {
    Get-ChildItem $LogDir -Recurse -File -ErrorAction SilentlyContinue | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$DaysToKeep) } | 
    ForEach-Object {
        if ($Verbose) {
            Write-Host "  Deleting: $($_.FullName)" -ForegroundColor Gray
        }
            
        $size = $_.Length
            
        if (!$DryRun) {
            Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
        }
            
        $deletedCount++
        $freedSpace += $size
    }
}

# Clean processed_data directory
if (Test-Path $ProcessedDataDir) {
    Get-ChildItem $ProcessedDataDir -Recurse -File -ErrorAction SilentlyContinue | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$DaysToKeep) } | 
    ForEach-Object {
        if ($Verbose) {
            Write-Host "  Deleting: $($_.FullName)" -ForegroundColor Gray
        }
            
        $size = $_.Length
            
        if (!$DryRun) {
            Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
        }
            
        $deletedCount++
        $freedSpace += $size
    }
}

# Clean empty directories
if (!$DryRun) {
    Get-ChildItem $LogDir -Recurse -Directory -ErrorAction SilentlyContinue | 
    Where-Object { (Get-ChildItem $_.FullName -Recurse -File).Count -eq 0 } | 
    ForEach-Object {
        if ($Verbose) {
            Write-Host "  Removing empty directory: $($_.FullName)" -ForegroundColor Gray
        }
        Remove-Item $_.FullName -Force -Recurse -ErrorAction SilentlyContinue
    }
}

# Summary
Write-Host "`n✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "  • Files deleted: $deletedCount"
Write-Host "  • Space freed: $(Format-FileSize $freedSpace)"

if ($DryRun) {
    Write-Host "`n💡 Run without -DryRun to actually delete files" -ForegroundColor Yellow
}

# Check for large log files
Write-Host "`n📏 Large Log Files (>$MaxLogSizeMB MB):" -ForegroundColor Yellow

if (Test-Path $LogDir) {
    $largeFiles = Get-ChildItem $LogDir -Recurse -File -ErrorAction SilentlyContinue | 
    Where-Object { $_.Length -gt ($MaxLogSizeMB * 1MB) } | 
    Sort-Object Length -Descending
    
    if ($largeFiles.Count -gt 0) {
        $largeFiles | ForEach-Object {
            Write-Host "  • $($_.Name): $(Format-FileSize $_.Length)" -ForegroundColor Red
        }
        Write-Host "`n  Consider rotating these files manually"
    }
    else {
        Write-Host "  None found ✅" -ForegroundColor Green
    }
}

Write-Host ""
