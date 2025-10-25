# Script de Normalização Next.js 15 - Yello Solar Hub
# Outubro 2025

param(
    [Parameter(Mandatory = $true)]
    [string]$Workspace,

    [switch]$DryRun,

    [string]$OutputFile
)

# Configurações
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $Root
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

# Cores para output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"
$White = "White"

function Write-ColoredOutput {
    param([string]$Message, [string]$Color = $White)
    if ($DryRun) {
        Write-Host "[DRY-RUN] $Message" -ForegroundColor $Color
    }
    else {
        Write-Host $Message -ForegroundColor $Color
    }
}

function Test-AppRouterStructure {
    param([string]$WorkspacePath)

    $issues = @()
    $appDir = Join-Path $WorkspacePath "src\app"

    if (-not (Test-Path $appDir)) {
        $issues += @{
            Type     = "structure"
            Severity = "error"
            Message  = "Diretorio src/app nao encontrado"
            Fix      = "Criar estrutura App Router em src/app"
        }
        return $issues
    }

    # Verificar route groups
    $mainGroup = Join-Path $appDir "[countryCode]\(main)"
    $checkoutGroup = Join-Path $appDir "[countryCode]\(checkout)"

    if (-not (Test-Path $mainGroup)) {
        $issues += @{
            Type     = "structure"
            Severity = "warning"
            Message  = "Route group (main) nao encontrado"
            Fix      = "Criar $mainGroup"
        }
    }

    if (-not (Test-Path $checkoutGroup)) {
        $issues += @{
            Type     = "structure"
            Severity = "warning"
            Message  = "Route group (checkout) nao encontrado"
            Fix      = "Criar $checkoutGroup"
        }
    }

    return $issues
}

function Test-ServerComponents {
    param([string]$WorkspacePath)

    $issues = @()
    $appDir = Join-Path $WorkspacePath "src\app"

    if (-not (Test-Path $appDir)) {
        return $issues
    }

    Get-ChildItem $appDir -Recurse -Filter "page.tsx" | ForEach-Object {
        $content = Get-Content -LiteralPath $_.FullName -ErrorAction Stop | Out-String
        $relativePath = $_.FullName.Replace($WorkspacePath, "").TrimStart("\")

        # Verificar se usa "use client" desnecessariamente
        if ($content -match "use client" -and $content -notmatch "useState|useEffect|onClick|onChange") {
            $issues += @{
                Type     = "component"
                Severity = "info"
                File     = $relativePath
                Message  = "Page component usando 'use client' sem interatividade"
                Fix      = "Remover 'use client' se nao necessario"
            }
        }
    }

    return $issues
}

function Test-ServerActions {
    param([string]$WorkspacePath)

    $issues = @()
    $libDir = Join-Path $WorkspacePath "src\lib"

    if (-not (Test-Path $libDir)) {
        $issues += @{
            Type     = "structure"
            Severity = "warning"
            Message  = "Diretorio src/lib nao encontrado"
            Fix      = "Criar src/lib para Server Actions"
        }
        return $issues
    }

    # Verificar arquivos de dados
    $dataDir = Join-Path $libDir "data"
    if (-not (Test-Path $dataDir)) {
        $issues += @{
            Type     = "structure"
            Severity = "warning"
            Message  = "Diretorio src/lib/data nao encontrado"
            Fix      = "Criar src/lib/data para Server Actions"
        }
    }
    else {
        # Verificar Server Actions
        Get-ChildItem $dataDir -Recurse -Filter "*.ts" | ForEach-Object {
            $content = Get-Content -LiteralPath $_.FullName -ErrorAction Stop | Out-String
            $relativePath = $_.FullName.Replace($WorkspacePath, "").TrimStart("\")

            if ($content -match "use server") {
                # Verificar import server-only
                if ($content -notmatch "server-only") {
                    $issues += @{
                        Type     = "server-action"
                        Severity = "warning"
                        File     = $relativePath
                        Message  = "Server Action sem import 'server-only'"
                        Fix      = "Adicionar import 'server-only'"
                    }
                }
            }
        }
    }

    return $issues
}

function Test-ModulesStructure {
    param([string]$WorkspacePath)

    $issues = @()
    $modulesDir = Join-Path $WorkspacePath "src\modules"

    if (-not (Test-Path $modulesDir)) {
        $issues += @{
            Type     = "structure"
            Severity = "warning"
            Message  = "Diretorio src/modules nao encontrado"
            Fix      = "Criar src/modules para organizacao por feature"
        }
        return $issues
    }

    # Verificar estrutura de modulos
    Get-ChildItem $modulesDir -Directory | ForEach-Object {
        $moduleName = $_.Name
        $modulePath = $_.FullName

        # Verificar se tem index.ts
        $indexFile = Join-Path $modulePath "index.ts"
        if (-not (Test-Path $indexFile)) {
            $issues += @{
                Type     = "module"
                Severity = "warning"
                File     = "src\modules\$moduleName"
                Message  = "Modulo sem index.ts"
                Fix      = "Criar src/modules/$moduleName/index.ts"
            }
        }
    }

    return $issues
}

function Invoke-Normalization {
    param([string]$WorkspacePath, [bool]$IsDryRun)

    Write-ColoredOutput "=== NORMALIZACAO NEXT.JS 15 ===" $White
    Write-ColoredOutput "Workspace: $WorkspacePath" $White
    Write-ColoredOutput "Modo: $(if ($IsDryRun) { 'DRY-RUN' } else { 'EXECUCAO' })" $White
    Write-ColoredOutput "" $White

    $allIssues = @()

    # Executar verificacoes
    Write-ColoredOutput "Verificando estrutura App Router..." $Cyan
    $allIssues += Test-AppRouterStructure -WorkspacePath $WorkspacePath

    Write-ColoredOutput "Verificando Server Components..." $Cyan
    $allIssues += Test-ServerComponents -WorkspacePath $WorkspacePath

    Write-ColoredOutput "Verificando Server Actions..." $Cyan
    $allIssues += Test-ServerActions -WorkspacePath $WorkspacePath

    Write-ColoredOutput "Verificando estrutura de modulos..." $Cyan
    $allIssues += Test-ModulesStructure -WorkspacePath $WorkspacePath

    # Gerar relatorio
    $report = @{
        Timestamp   = Get-Date -Format "yyyy-MM-ddTHH:mm:ss"
        Workspace   = $WorkspacePath
        IssuesCount = $allIssues.Count
        Issues      = $allIssues
    }

    return $report
}

function Write-Report {
    param([hashtable]$Report, [string]$OutputFile)

    # Salvar JSON se especificado
    if ($OutputFile) {
        $Report | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding UTF8
        Write-ColoredOutput "Relatorio salvo em: $OutputFile" $Green
    }

    # Output console
    Write-Host ""
    Write-Host ("=" * 70) -ForegroundColor Cyan
    Write-Host "RELATORIO DE NORMALIZACAO NEXT.JS 15".PadLeft(45) -ForegroundColor Cyan
    Write-Host ("=" * 70) -ForegroundColor Cyan
    Write-Host "Workspace: $($Report.Workspace)"
    Write-Host "Timestamp: $($Report.Timestamp)"
    Write-Host ""
    Write-Host "Total de Issues: $($Report.IssuesCount)"

    # Agrupar por severidade
    $bySeverity = $Report.Issues | Group-Object -Property Severity
    Write-Host ""
    Write-Host "Por Severidade:"
    foreach ($group in $bySeverity) {
        $icon = switch ($group.Name) {
            "error" { "[ERROR]" }
            "warning" { "[WARN]" }
            "info" { "[INFO]" }
            default { "[UNKNOWN]" }
        }
        Write-Host "  $icon $($group.Name.ToUpper()): $($group.Count)"
    }

    # Agrupar por tipo
    $byType = $Report.Issues | Group-Object -Property Type
    Write-Host ""
    Write-Host "Por Tipo:"
    foreach ($group in $byType) {
        Write-Host "  • $($group.Name): $($group.Count)"
    }

    # Top 10 issues
    if ($Report.IssuesCount -gt 0) {
        Write-Host ""
        Write-Host "Top 10 Issues:" -ForegroundColor Yellow

        $topIssues = $Report.Issues | Select-Object -First 10
        $i = 1
        foreach ($issue in $topIssues) {
            $icon = switch ($issue.Severity) {
                "error" { "[ERROR]" }
                "warning" { "[WARN]" }
                "info" { "[INFO]" }
                default { "[UNKNOWN]" }
            }
            Write-Host ""
            Write-Host "$i. $icon [$($issue.Type)] $($issue.Message)"
            if ($issue.File) {
                Write-Host "   Arquivo: $($issue.File)" -ForegroundColor Gray
            }
            if ($issue.Fix) {
                Write-Host "   Fix: $($issue.Fix)" -ForegroundColor Gray
            }
            $i++
        }
    }

    Write-Host ""
    Write-Host ("=" * 70) -ForegroundColor Cyan
    Write-Host ""
}

# Execução principal
try {
    $isDryRun = if ($DryRun) { $true } else { $false }

    $report = Invoke-Normalization -WorkspacePath $Workspace -IsDryRun $isDryRun

    $outputPath = if ($OutputFile) {
        $OutputFile
    }
    else {
        "normalization-nextjs-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    }

    Write-Report -Report $report -OutputFile $outputPath

    # Exit code baseado em severidade
    $hasErrors = $report.Issues | Where-Object { $_.Severity -eq "error" }
    if ($hasErrors) {
        exit 1
    }
    else {
        exit 0
    }
}
catch {
    Write-Host ""
    Write-Host "ERRO: $_" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}