# ==========================================
# Script de Limpeza de Imagens Docker
# Remove imagens antigas mantendo as essenciais
# ==========================================

param(
    [Parameter(Mandatory = $false, HelpMessage = "Dry run (show what would be deleted)")]
    [switch]$DryRun,
    
    [Parameter(Mandatory = $false, HelpMessage = "Keep images with these tags")]
    [string[]]$KeepTags = @("latest", "v1.0.3", "stable", "previous"),
    
    [Parameter(Mandatory = $false, HelpMessage = "Image prefix to filter")]
    [string]$ImagePrefix = "ysh-backend",
    
    [Parameter(Mandatory = $false, HelpMessage = "Also cleanup dangling images")]
    [switch]$CleanupDangling,
    
    [Parameter(Mandatory = $false, HelpMessage = "Also cleanup unused volumes")]
    [switch]$CleanupVolumes,
    
    [Parameter(Mandatory = $false, HelpMessage = "Force removal without confirmation")]
    [switch]$Force
)

# Colors
$ErrorColor = "Red"
$SuccessColor = "Green"
$InfoColor = "Cyan"
$WarningColor = "Yellow"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

# Header
Write-ColorOutput @"

╔═══════════════════════════════════════════════════════════╗
║         Docker Cleanup Script - YSH Backend               ║
╚═══════════════════════════════════════════════════════════╝

"@ $InfoColor

if ($DryRun) {
    Write-ColorOutput "🔍 DRY RUN MODE - No images will be deleted" $WarningColor
    Write-ColorOutput ""
}

# Get all images
Write-ColorOutput "📋 Scanning Docker images..." $InfoColor
$allImages = docker images --format "{{.Repository}}:{{.Tag}}`t{{.ID}}`t{{.Size}}`t{{.CreatedAt}}" | Where-Object { $_ -match $ImagePrefix }

if (-not $allImages) {
    Write-ColorOutput "✅ No images found matching prefix: $ImagePrefix" $SuccessColor
    exit 0
}

# Parse images
$imagesToDelete = @()
$imagesToKeep = @()
$totalSize = 0

Write-ColorOutput ""
Write-ColorOutput "Images found:" $InfoColor
Write-ColorOutput ("=" * 80) "Gray"
Write-ColorOutput ("{0,-50} {1,-15} {2,-10}" -f "Image", "Size", "Status") "Gray"
Write-ColorOutput ("=" * 80) "Gray"

foreach ($line in $allImages) {
    $parts = $line -split "`t"
    $imageTag = $parts[0]
    $imageId = $parts[1]
    $imageSize = $parts[2]
    $createdAt = $parts[3]
    
    # Extract just the tag
    $tag = ($imageTag -split ":")[-1]
    
    # Check if should keep
    $shouldKeep = $false
    foreach ($keepTag in $KeepTags) {
        if ($tag -eq $keepTag) {
            $shouldKeep = $true
            break
        }
    }
    
    if ($shouldKeep) {
        $imagesToKeep += @{
            Tag     = $imageTag
            Id      = $imageId
            Size    = $imageSize
            Created = $createdAt
        }
        Write-ColorOutput ("{0,-50} {1,-15} {2}" -f $imageTag, $imageSize, "✅ Keep") $SuccessColor
    }
    else {
        $imagesToDelete += @{
            Tag     = $imageTag
            Id      = $imageId
            Size    = $imageSize
            Created = $createdAt
        }
        Write-ColorOutput ("{0,-50} {1,-15} {2}" -f $imageTag, $imageSize, "❌ Delete") $WarningColor
    }
}

Write-ColorOutput ("=" * 80) "Gray"
Write-ColorOutput ""

# Summary
Write-ColorOutput "📊 Summary:" $InfoColor
Write-ColorOutput "   Keep:   $($imagesToKeep.Count) images" $SuccessColor
Write-ColorOutput "   Delete: $($imagesToDelete.Count) images" $WarningColor
Write-ColorOutput ""

if ($imagesToDelete.Count -eq 0) {
    Write-ColorOutput "✅ Nothing to cleanup!" $SuccessColor
    exit 0
}

# Confirmation
if (-not $Force -and -not $DryRun) {
    Write-ColorOutput "⚠️  This will delete $($imagesToDelete.Count) images!" $WarningColor
    $confirmation = Read-Host "Continue? (yes/no)"
    if ($confirmation -ne "yes") {
        Write-ColorOutput "❌ Aborted by user" $ErrorColor
        exit 0
    }
}

# Delete images
if (-not $DryRun) {
    Write-ColorOutput ""
    Write-ColorOutput "🗑️  Deleting images..." $InfoColor
    
    $deletedCount = 0
    $failedCount = 0
    
    foreach ($image in $imagesToDelete) {
        try {
            Write-ColorOutput "   Removing: $($image.Tag)" "Gray"
            docker rmi $image.Id -f 2>$null | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                $deletedCount++
                Write-ColorOutput "   ✅ Deleted: $($image.Tag)" $SuccessColor
            }
            else {
                $failedCount++
                Write-ColorOutput "   ⚠️  Failed: $($image.Tag) (may be in use)" $WarningColor
            }
        }
        catch {
            $failedCount++
            Write-ColorOutput "   ❌ Error: $($image.Tag) - $_" $ErrorColor
        }
    }
    
    Write-ColorOutput ""
    Write-ColorOutput "📊 Deletion summary:" $InfoColor
    Write-ColorOutput "   Deleted: $deletedCount images" $SuccessColor
    if ($failedCount -gt 0) {
        Write-ColorOutput "   Failed:  $failedCount images" $WarningColor
    }
}

# Cleanup dangling images
if ($CleanupDangling) {
    Write-ColorOutput ""
    Write-ColorOutput "🧹 Cleaning up dangling images..." $InfoColor
    
    if ($DryRun) {
        $danglingCount = (docker images -f "dangling=true" -q | Measure-Object).Count
        Write-ColorOutput "   Would delete $danglingCount dangling images" $WarningColor
    }
    else {
        docker image prune -f | Out-Null
        Write-ColorOutput "   ✅ Dangling images cleaned" $SuccessColor
    }
}

# Cleanup volumes
if ($CleanupVolumes) {
    Write-ColorOutput ""
    Write-ColorOutput "🧹 Cleaning up unused volumes..." $InfoColor
    
    if ($DryRun) {
        $unusedVolumes = (docker volume ls -q -f "dangling=true" | Measure-Object).Count
        Write-ColorOutput "   Would delete $unusedVolumes unused volumes" $WarningColor
    }
    else {
        if (-not $Force) {
            Write-ColorOutput "⚠️  This will delete ALL unused volumes!" $WarningColor
            $confirmation = Read-Host "Continue? (yes/no)"
            if ($confirmation -ne "yes") {
                Write-ColorOutput "   Skipped volume cleanup" $InfoColor
            }
            else {
                docker volume prune -f | Out-Null
                Write-ColorOutput "   ✅ Unused volumes cleaned" $SuccessColor
            }
        }
        else {
            docker volume prune -f | Out-Null
            Write-ColorOutput "   ✅ Unused volumes cleaned" $SuccessColor
        }
    }
}

# Final summary
Write-ColorOutput ""
Write-ColorOutput @"
╔═══════════════════════════════════════════════════════════╗
║                   Cleanup Complete                        ║
╚═══════════════════════════════════════════════════════════╝
"@ $SuccessColor

if (-not $DryRun) {
    # Show disk space saved
    Write-ColorOutput ""
    Write-ColorOutput "💾 Docker disk usage:" $InfoColor
    docker system df
}

Write-ColorOutput ""
Write-ColorOutput "✅ Cleanup completed!" $SuccessColor
