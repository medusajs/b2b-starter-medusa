Param(
    [string]$CsvPath = "logos_manifest.csv",
    [string]$OutDir = "logos"
)
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# Download function
function Download-File {
    param([string]$Url, [string]$Dest)
    try {
        Invoke-WebRequest -Uri $Url -OutFile $Dest -UseBasicParsing -MaximumRedirection 5 -ErrorAction Stop
        return $true
    } catch {
        Write-Warning ("Falha ao baixar: {0}" -f $Url)
        return $false
    }
}

# Read CSV and process rows
Import-Csv -Path $CsvPath | ForEach-Object {
    $name = $_.manufacturer -replace '[\\/:*?"<>|]', '-' -replace '\s+', '_'
    $dir = Join-Path $OutDir $name
    New-Item -ItemType Directory -Force -Path $dir | Out-Null

    if ($_.svg_url -and $_.svg_url.Trim().Length -gt 0) {
        Write-Host ("→ SVG: {0}" -f $_.manufacturer)
        Download-File -Url $_.svg_url -Dest (Join-Path $dir "logo.svg") | Out-Null
    }
    if ($_.png_url -and $_.png_url.Trim().Length -gt 0) {
        Write-Host ("→ PNG: {0}" -f $_.manufacturer)
        Download-File -Url $_.png_url -Dest (Join-Path $dir "logo.png") | Out-Null
    }
}
Write-Host ("Concluído. Logos em {0}" -f (Resolve-Path $OutDir))
