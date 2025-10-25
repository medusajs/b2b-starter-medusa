# ==========================================
# ECR Image Scan Results Monitor
# Verifica vulnerabilidades nas imagens
# ==========================================

param(
    [Parameter(Mandatory = $false, HelpMessage = "Repository name (leave empty for all active repos)")]
    [string]$Repository = "",
    
    [Parameter(Mandatory = $false, HelpMessage = "Image tag to check")]
    [string]$Tag = "latest",
    
    [Parameter(Mandatory = $false, HelpMessage = "AWS Profile")]
    [string]$Profile = "ysh-production",
    
    [Parameter(Mandatory = $false, HelpMessage = "AWS Region")]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory = $false, HelpMessage = "Show only critical and high vulnerabilities")]
    [switch]$CriticalOnly
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
║         ECR Image Scan Results Monitor                    ║
╚═══════════════════════════════════════════════════════════╝

"@ $InfoColor

Write-ColorOutput "Profile:    $Profile" $InfoColor
Write-ColorOutput "Region:     $Region" $InfoColor
Write-ColorOutput "Tag:        $Tag" $InfoColor
if ($CriticalOnly) {
    Write-ColorOutput "Filter:     CRITICAL/HIGH only" $WarningColor
}
Write-ColorOutput ""

# Validation
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-ColorOutput "❌ AWS CLI is not installed" $ErrorColor
    exit 1
}

# Get repositories to check
if ($Repository) {
    $repositories = @($Repository)
}
else {
    # Active repositories only
    $repositories = @('ysh-backend', 'ysh-storefront')
}

Write-ColorOutput "🔍 Checking $($repositories.Count) repository/repositories...`n" $InfoColor

$totalCritical = 0
$totalHigh = 0
$totalMedium = 0
$totalLow = 0
$totalInformational = 0
$reposChecked = 0
$reposFailed = 0

foreach ($repo in $repositories) {
    Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" $InfoColor
    Write-ColorOutput "Repository: $repo" $InfoColor
    Write-ColorOutput "Tag: $Tag" "Gray"
    
    try {
        # Get scan findings
        $findings = aws ecr describe-image-scan-findings `
            --repository-name $repo `
            --image-id imageTag=$Tag `
            --profile $Profile `
            --region $Region `
            --output json 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "  ⚠️  No scan results available (image may not exist or not scanned yet)" $WarningColor
            $reposFailed++
            Write-ColorOutput ""
            continue
        }
        
        $scanData = $findings | ConvertFrom-Json
        $scanStatus = $scanData.imageScanStatus.status
        $scanFindings = $scanData.imageScanFindings
        
        Write-ColorOutput "  Scan Status: $scanStatus" $(if ($scanStatus -eq "COMPLETE") { $SuccessColor } else { $WarningColor })
        
        if ($scanStatus -eq "COMPLETE" -and $scanFindings) {
            $findingSummary = $scanFindings.findingSeverityCounts
            
            $critical = if ($findingSummary.CRITICAL) { $findingSummary.CRITICAL } else { 0 }
            $high = if ($findingSummary.HIGH) { $findingSummary.HIGH } else { 0 }
            $medium = if ($findingSummary.MEDIUM) { $findingSummary.MEDIUM } else { 0 }
            $low = if ($findingSummary.LOW) { $findingSummary.LOW } else { 0 }
            $informational = if ($findingSummary.INFORMATIONAL) { $findingSummary.INFORMATIONAL } else { 0 }
            
            $totalCritical += $critical
            $totalHigh += $high
            $totalMedium += $medium
            $totalLow += $low
            $totalInformational += $informational
            
            Write-ColorOutput "`n  Vulnerabilities Summary:" $InfoColor
            if ($critical -gt 0) {
                Write-ColorOutput "    🔴 CRITICAL:      $critical" $ErrorColor
            }
            else {
                Write-ColorOutput "    ✅ CRITICAL:      0" $SuccessColor
            }
            
            if ($high -gt 0) {
                Write-ColorOutput "    🟠 HIGH:          $high" "DarkRed"
            }
            else {
                Write-ColorOutput "    ✅ HIGH:          0" $SuccessColor
            }
            
            if (-not $CriticalOnly) {
                Write-ColorOutput "    🟡 MEDIUM:        $medium" $WarningColor
                Write-ColorOutput "    🔵 LOW:           $low" "Blue"
                Write-ColorOutput "    ℹ️  INFORMATIONAL: $informational" "Gray"
            }
            
            # Show top critical/high vulnerabilities
            if (($critical -gt 0 -or $high -gt 0) -and $scanFindings.findings) {
                Write-ColorOutput "`n  Top Vulnerabilities:" $WarningColor
                
                $topFindings = $scanFindings.findings | 
                Where-Object { $_.severity -eq "CRITICAL" -or $_.severity -eq "HIGH" } |
                Select-Object -First 5
                
                foreach ($finding in $topFindings) {
                    $severity = $finding.severity
                    $name = $finding.name
                    $uri = if ($finding.uri) { $finding.uri } else { "N/A" }
                    
                    $severityColor = if ($severity -eq "CRITICAL") { $ErrorColor } else { "DarkRed" }
                    Write-ColorOutput "    [$severity] $name" $severityColor
                    Write-ColorOutput "      URI: $uri" "Gray"
                }
                
                if ($scanFindings.findings.Count -gt 5) {
                    $remaining = $scanFindings.findings.Count - 5
                    Write-ColorOutput "    ... and $remaining more" "Gray"
                }
            }
            
            $reposChecked++
        }
        elseif ($scanStatus -eq "IN_PROGRESS") {
            Write-ColorOutput "  ⏳ Scan in progress..." $WarningColor
            $reposFailed++
        }
        else {
            Write-ColorOutput "  ℹ️  No findings available" "Gray"
            $reposChecked++
        }
        
    }
    catch {
        Write-ColorOutput "  ❌ Error checking scan results: $_" $ErrorColor
        $reposFailed++
    }
    
    Write-ColorOutput ""
}

# Summary
Write-ColorOutput "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" $InfoColor
Write-ColorOutput @"

╔═══════════════════════════════════════════════════════════╗
║                   Overall Summary                         ║
╚═══════════════════════════════════════════════════════════╝

"@ $InfoColor

Write-ColorOutput "Repositories Checked:  $reposChecked" $InfoColor
Write-ColorOutput "Repositories Failed:   $reposFailed" $(if ($reposFailed -gt 0) { $WarningColor } else { $SuccessColor })
Write-ColorOutput ""

Write-ColorOutput "Total Vulnerabilities:" $InfoColor
if ($totalCritical -gt 0) {
    Write-ColorOutput "  🔴 CRITICAL:      $totalCritical" $ErrorColor
}
else {
    Write-ColorOutput "  ✅ CRITICAL:      0" $SuccessColor
}

if ($totalHigh -gt 0) {
    Write-ColorOutput "  🟠 HIGH:          $totalHigh" "DarkRed"
}
else {
    Write-ColorOutput "  ✅ HIGH:          0" $SuccessColor
}
else {
    Write-ColorOutput "  ✅ HIGH:          0" $SuccessColor
}

if (-not $CriticalOnly) {
    Write-ColorOutput "  🟡 MEDIUM:        $totalMedium" $WarningColor
    Write-ColorOutput "  🔵 LOW:           $totalLow" "Blue"
    Write-ColorOutput "  ℹ️  INFORMATIONAL: $totalInformational" "Gray"
}

Write-ColorOutput ""

# Recommendations
if ($totalCritical -gt 0 -or $totalHigh -gt 0) {
    Write-ColorOutput "⚠️  ACTION REQUIRED:" $ErrorColor
    Write-ColorOutput "   Critical or High severity vulnerabilities found!" $ErrorColor
    Write-ColorOutput "   Recommended actions:" $WarningColor
    Write-ColorOutput "   1. Review vulnerability details in AWS Console" "Gray"
    Write-ColorOutput "   2. Update base images and dependencies" "Gray"
    Write-ColorOutput "   3. Rebuild and redeploy affected images" "Gray"
    Write-ColorOutput ""
}
else {
    Write-ColorOutput "✅ No critical or high severity vulnerabilities found!" $SuccessColor
    Write-ColorOutput ""
}

# Commands
Write-ColorOutput "📝 Useful Commands:" $InfoColor
Write-ColorOutput ""
Write-ColorOutput "View detailed findings for specific image:" "Gray"
Write-ColorOutput "  aws ecr describe-image-scan-findings \" "Gray"
Write-ColorOutput "    --repository-name REPO_NAME \" "Gray"
Write-ColorOutput "    --image-id imageTag=TAG \" "Gray"
Write-ColorOutput "    --profile $Profile --region $Region" "Gray"
Write-ColorOutput ""

Write-ColorOutput "Trigger manual scan:" "Gray"
Write-ColorOutput "  aws ecr start-image-scan \" "Gray"
Write-ColorOutput "    --repository-name REPO_NAME \" "Gray"
Write-ColorOutput "    --image-id imageTag=TAG \" "Gray"
Write-ColorOutput "    --profile $Profile --region $Region" "Gray"
Write-ColorOutput ""
