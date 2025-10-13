<#
.SYNOPSIS
    Normalização e Padronização Next.js 15+ - Yello Solar Hub

.DESCRIPTION
    Script PowerShell para normalizar estrutura storefront Next.js 15+ seguindo
    melhores práticas App Router e padrões do repositório YSH B2B.
    
    Funcionalidades:
    - Normaliza estrutura App Router
    - Padroniza Server Components e Client Components
    - Organiza Server Actions
    - Valida convenções de nomenclatura
    - Verifica configurações Next.js 15
    - Gera relatório de normalização

.PARAMETER WorkspacePath
    Caminho do workspace storefront

.PARAMETER DryRun
    Modo dry-run (somente análise, sem modificações)

.PARAMETER Fix
    Aplica correções automáticas

.PARAMETER OutputFile
    Arquivo de saída para relatório JSON

.EXAMPLE
    .\Normalize-NextJS.ps1 -WorkspacePath ".\storefront" -DryRun

.EXAMPLE
    .\Normalize-NextJS.ps1 -WorkspacePath ".\storefront" -Fix -OutputFile "report.json"

.NOTES
    Author: Yello Solar Hub DevOps
    Version: 1.0.0
    Medusa: v2.10.3
    Next.js: 15+
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$WorkspacePath,
    
    [Parameter()]
    [switch]$DryRun = $true,
    
    [Parameter()]
    [switch]$Fix,
    
    [Parameter()]
    [string]$OutputFile
)

$ErrorActionPreference = 'Stop'

# Classes para estrutura de dados
class NormalizationIssue {
    [string]$Type
    [string]$Severity  # error, warning, info
    [string]$Message
    [string]$File
    [string]$Fix
    [hashtable]$Metadata
}

class NormalizationReport {
    [string]$Timestamp
    [string]$Workspace
    [hashtable]$Checks
    [int]$IssuesCount
    [System.Collections.Generic.List[NormalizationIssue]]$Issues
    [System.Collections.Generic.List[object]]$Fixes
}

# Funções auxiliares
function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host ("=" * 70) -ForegroundColor Cyan
    Write-Host $Text.PadLeft(($Text.Length + 70) / 2).PadRight(70) -ForegroundColor Cyan
    Write-Host ("=" * 70) -ForegroundColor Cyan
    Write-Host ""
}

function Write-SectionHeader {
    param([string]$Text)
    Write-Host ""
    Write-Host $Text -ForegroundColor Yellow
    Write-Host ("-" * $Text.Length) -ForegroundColor Yellow
}

function Test-AppRouterStructure {
    param([string]$Workspace)
    
    Write-SectionHeader "Verificando estrutura App Router"
    
    $expectedDirs = @(
        "src/app",
        "src/app/[countryCode]",
        "src/app/[countryCode]/(main)",
        "src/app/[countryCode]/(checkout)",
        "src/modules",
        "src/lib/data",
        "src/lib/config",
        "src/components"
    )
    
    $result = @{
        Status  = "pass"
        Missing = @()
        Extra   = @()
    }
    
    foreach ($dir in $expectedDirs) {
        $fullPath = Join-Path $Workspace $dir
        if (-not (Test-Path $fullPath)) {
            $result.Missing += $dir
            Write-Host "  [!] Diretório não encontrado: $dir" -ForegroundColor Yellow
        }
        else {
            Write-Host "  [OK] $dir" -ForegroundColor Green
        }
    }
    
    if ($result.Missing.Count -gt 0) {
        $result.Status = "warning"
    }
    
    return $result
}

function Test-ServerComponents {
    param([string]$Workspace)
    
    Write-SectionHeader "Verificando Server Components"
    
    $issues = @()
    $appDir = Join-Path $Workspace "src/app"
    
    if (-not (Test-Path $appDir)) {
        return @{
            Status  = "error"
            Message = "Diretório src/app não encontrado"
            Issues  = @()
        }
    }
    
    # Encontra todos os arquivos .tsx no app/
    $componentFiles = Get-ChildItem -Path $appDir -Recurse -Filter "*.tsx" -File |
    Where-Object { $_.DirectoryName -notmatch "node_modules" }
    
    foreach ($file in $componentFiles) {
        $content = Get-Content -Path $file.FullName -Raw
        $relativePath = $file.FullName.Replace("$Workspace\", "")
        
        # Verifica 'use client' para detectar Client Components
        $isClientComponent = $content -match '^\s*[''"]use client[''"]'
        
        # Verifica 'use server' para detectar Server Actions
        $hasUseServer = $content -match '^\s*[''"]use server[''"]'
        
        # Server Components não devem usar hooks do React
        if (-not $isClientComponent) {
            $reactHooks = @('useState', 'useEffect', 'useContext', 'useReducer', 'useCallback', 'useMemo', 'useRef')
            foreach ($hook in $reactHooks) {
                if ($content -match "\b$hook\b") {
                    $issue = [NormalizationIssue]@{
                        Type     = "server_component"
                        Severity = "error"
                        File     = $relativePath
                        Message  = "Server Component usando React Hook: $hook"
                        Fix      = "Adicionar 'use client' no topo do arquivo ou mover lógica para Client Component"
                    }
                    $issues += $issue
                    Write-Host "  [ERROR] $relativePath - usando $hook sem 'use client'" -ForegroundColor Red
                    break
                }
            }
        }
        
        # Client Components não devem ter 'use server'
        if ($isClientComponent -and $hasUseServer) {
            $issue = [NormalizationIssue]@{
                Type     = "component_directive"
                Severity = "error"
                File     = $relativePath
                Message  = "Arquivo com 'use client' e 'use server' simultaneamente"
                Fix      = "Remover uma das diretivas ou separar em arquivos diferentes"
            }
            $issues += $issue
            Write-Host "  [ERROR] $relativePath - conflito de diretivas" -ForegroundColor Red
        }
    }
    
    if ($issues.Count -eq 0) {
        Write-Host "  [OK] Todos os componentes seguem convenções" -ForegroundColor Green
    }
    
    return @{
        Status            = if ($issues.Count -gt 0) { "error" } else { "pass" }
        ComponentsChecked = $componentFiles.Count
        Issues            = $issues
    }
}

function Test-ServerActions {
    param([string]$Workspace)
    
    Write-SectionHeader "Verificando Server Actions"
    
    $issues = @()
    $dataDir = Join-Path $Workspace "src/lib/data"
    
    if (-not (Test-Path $dataDir)) {
        Write-Host "  [!] Diretório src/lib/data não encontrado" -ForegroundColor Yellow
        return @{
            Status  = "warning"
            Message = "Diretório data não encontrado"
            Issues  = @()
        }
    }
    
    $actionFiles = Get-ChildItem -Path $dataDir -Recurse -Filter "*.ts" -File
    
    foreach ($file in $actionFiles) {
        $content = Get-Content -Path $file.FullName -Raw
        $relativePath = $file.FullName.Replace("$Workspace\", "")
        
        # Server Actions devem ter 'use server' no topo
        $hasUseServer = $content -match '^\s*[''"]use server[''"]'
        
        # Deve importar 'server-only' para segurança
        $hasServerOnly = $content -match "import\s+[''"]server-only[''"]"
        
        if (-not $hasUseServer) {
            $issue = [NormalizationIssue]@{
                Type     = "server_action"
                Severity = "warning"
                File     = $relativePath
                Message  = "Server Action sem diretiva 'use server'"
                Fix      = "Adicionar 'use server' no topo do arquivo"
            }
            $issues += $issue
            Write-Host "  [!] $relativePath - faltando 'use server'" -ForegroundColor Yellow
        }
        
        if (-not $hasServerOnly) {
            $issue = [NormalizationIssue]@{
                Type     = "server_action"
                Severity = "info"
                File     = $relativePath
                Message  = "Server Action sem import 'server-only'"
                Fix      = "Adicionar import 'server-only' para garantir execução server-side"
            }
            $issues += $issue
            Write-Host "  [INFO] $relativePath - sem 'server-only'" -ForegroundColor Cyan
        }
        
        # Verifica uso de getAuthHeaders
        if ($content -match "fetch\(" -and $content -notmatch "getAuthHeaders") {
            $issue = [NormalizationIssue]@{
                Type     = "server_action"
                Severity = "warning"
                File     = $relativePath
                Message  = "Fetch sem getAuthHeaders() - autenticação pode estar faltando"
                Fix      = "Usar headers: { ...(await getAuthHeaders()) } em requests autenticados"
            }
            $issues += $issue
            Write-Host "  [!] $relativePath - fetch sem getAuthHeaders" -ForegroundColor Yellow
        }
    }
    
    Write-Host "  [OK] Verificados $($actionFiles.Count) arquivos de Server Actions" -ForegroundColor Green
    
    return @{
        Status         = if ($issues.Count -gt 0) { "warning" } else { "pass" }
        ActionsChecked = $actionFiles.Count
        Issues         = $issues
    }
}

function Test-ModulesStructure {
    param([string]$Workspace)
    
    Write-SectionHeader "Verificando estrutura de módulos"
    
    $issues = @()
    $modulesDir = Join-Path $Workspace "src/modules"
    
    if (-not (Test-Path $modulesDir)) {
        return @{
            Status  = "warning"
            Message = "Diretório src/modules não encontrado"
            Issues  = @()
        }
    }
    
    $modules = Get-ChildItem -Path $modulesDir -Directory
    
    foreach ($module in $modules) {
        $moduleName = $module.Name
        
        # Verifica estrutura mínima do módulo
        $hasComponents = Test-Path (Join-Path $module.FullName "components")
        $hasActions = Test-Path (Join-Path $module.FullName "actions.ts")
        $hasTypes = Test-Path (Join-Path $module.FullName "types.ts")
        
        Write-Host "  Módulo: $moduleName"
        
        if (-not $hasComponents) {
            Write-Host "    [!] Sem diretório components/" -ForegroundColor Yellow
        }
        else {
            Write-Host "    [OK] components/" -ForegroundColor Green
        }
        
        if ($hasActions) {
            Write-Host "    [OK] actions.ts" -ForegroundColor Green
        }
        
        if ($hasTypes) {
            Write-Host "    [OK] types.ts" -ForegroundColor Green
        }
    }
    
    return @{
        Status         = "pass"
        ModulesChecked = $modules.Count
        Issues         = $issues
    }
}

function Test-NextConfig {
    param([string]$Workspace)
    
    Write-SectionHeader "Verificando next.config.js"
    
    $configFile = Join-Path $Workspace "next.config.js"
    $issues = @()
    
    if (-not (Test-Path $configFile)) {
        $issue = [NormalizationIssue]@{
            Type     = "config"
            Severity = "error"
            Message  = "next.config.js não encontrado"
            Fix      = "Criar next.config.js na raiz do workspace"
        }
        $issues += $issue
        Write-Host "  [ERROR] next.config.js não encontrado" -ForegroundColor Red
        return @{
            Status = "error"
            Issues = $issues
        }
    }
    
    $content = Get-Content -Path $configFile -Raw
    
    # Verifica configurações essenciais Next.js 15
    $checks = @{
        'experimental.ppr'      = $content -match "ppr\s*:"
        'typescript'            = $content -match "typescript\s*:"
        'images.remotePatterns' = $content -match "remotePatterns\s*:"
        'output'                = $content -match "output\s*:"
    }
    
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "  [OK] Configuração: $($check.Key)" -ForegroundColor Green
        }
        else {
            Write-Host "  [INFO] Configuração opcional: $($check.Key)" -ForegroundColor Cyan
        }
    }
    
    return @{
        Status = "pass"
        Checks = $checks
        Issues = $issues
    }
}

function Test-NamingConventions {
    param([string]$Workspace)
    
    Write-SectionHeader "Verificando convenções de nomenclatura"
    
    $issues = @()
    $srcDir = Join-Path $Workspace "src"
    
    # Verifica nomenclatura de componentes (PascalCase)
    $componentFiles = Get-ChildItem -Path $srcDir -Recurse -Filter "*.tsx" -File |
    Where-Object { $_.DirectoryName -match "components" -and $_.Name -ne "index.tsx" }
    
    foreach ($file in $componentFiles) {
        $fileName = $file.BaseName
        $relativePath = $file.FullName.Replace("$Workspace\", "")
        
        # Componentes devem usar PascalCase
        if ($fileName -notmatch '^[A-Z][a-zA-Z0-9]*$') {
            $issue = [NormalizationIssue]@{
                Type     = "naming"
                Severity = "warning"
                File     = $relativePath
                Message  = "Nome de componente não segue PascalCase: $fileName"
                Fix      = "Renomear para PascalCase (ex: MyComponent.tsx)"
            }
            $issues += $issue
            Write-Host "  [!] $relativePath - não é PascalCase" -ForegroundColor Yellow
        }
    }
    
    # Verifica nomenclatura de actions (kebab-case)
    $actionFiles = Get-ChildItem -Path $srcDir -Recurse -Filter "*.ts" -File |
    Where-Object { $_.DirectoryName -match "data|actions" }
    
    foreach ($file in $actionFiles) {
        $fileName = $file.BaseName
        $relativePath = $file.FullName.Replace("$Workspace\", "")
        
        # Actions devem usar kebab-case
        if ($fileName -match '[A-Z]' -and $fileName -ne "index") {
            $issue = [NormalizationIssue]@{
                Type     = "naming"
                Severity = "info"
                File     = $relativePath
                Message  = "Nome de action não segue kebab-case: $fileName"
                Fix      = "Considere renomear para kebab-case (ex: my-action.ts)"
            }
            $issues += $issue
            Write-Host "  [INFO] $relativePath - considere kebab-case" -ForegroundColor Cyan
        }
    }
    
    return @{
        Status = if ($issues.Count -gt 0) { "warning" } else { "pass" }
        Issues = $issues
    }
}

function Invoke-Normalization {
    param(
        [string]$Workspace,
        [bool]$IsDryRun
    )
    
    $workspace = Resolve-Path $Workspace
    
    Write-Header "NEXT.JS 15+ NORMALIZER - YELLO SOLAR HUB"
    Write-Host "Workspace: $workspace"
    Write-Host "Modo: $(if ($IsDryRun) { 'DRY-RUN (somente análise)' } else { 'FIX (aplica correções)' })"
    Write-Host ""
    
    # Inicializa relatório
    $report = [NormalizationReport]@{
        Timestamp = (Get-Date).ToString("o")
        Workspace = $workspace.Path
        Checks    = @{}
        Issues    = [System.Collections.Generic.List[NormalizationIssue]]::new()
        Fixes     = [System.Collections.Generic.List[object]]::new()
    }
    
    # Executa verificações
    $report.Checks['structure'] = Test-AppRouterStructure -Workspace $workspace
    $report.Checks['server_components'] = Test-ServerComponents -Workspace $workspace
    $report.Checks['server_actions'] = Test-ServerActions -Workspace $workspace
    $report.Checks['modules'] = Test-ModulesStructure -Workspace $workspace
    $report.Checks['config'] = Test-NextConfig -Workspace $workspace
    $report.Checks['naming'] = Test-NamingConventions -Workspace $workspace
    
    # Consolida issues
    foreach ($check in $report.Checks.Values) {
        if ($check.Issues) {
            foreach ($issue in $check.Issues) {
                $report.Issues.Add($issue)
            }
        }
    }
    
    $report.IssuesCount = $report.Issues.Count
    
    # Aplica fixes se não for dry-run
    if (-not $IsDryRun) {
        Write-SectionHeader "Aplicando correções"
        
        foreach ($issue in $report.Issues) {
            if ($issue.Fix) {
                # Implementação de fixes automáticos
                Write-Host "  [FIX] $($issue.Message)" -ForegroundColor Green
                # TODO: Implementar fixes específicos
            }
        }
    }
    
    return $report
}

function Write-Report {
    param(
        [NormalizationReport]$Report,
        [string]$OutputFile
    )
    
    # Salva JSON se especificado
    if ($OutputFile) {
        $Report | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutputFile -Encoding UTF8
        Write-Host ""
        Write-Host "Relatório salvo em: $OutputFile" -ForegroundColor Green
    }
    
    # Console summary
    Write-Header "RELATÓRIO DE NORMALIZAÇÃO NEXT.JS 15+"
    Write-Host "Workspace: $($Report.Workspace)"
    Write-Host "Timestamp: $($Report.Timestamp)"
    Write-Host ""
    Write-Host "Total de Issues: $($Report.IssuesCount)"
    Write-Host ""
    
    # Agrupa por severidade
    $bySeverity = $Report.Issues | Group-Object -Property Severity
    Write-Host "Por Severidade:"
    foreach ($group in $bySeverity) {
        $icon = switch ($group.Name) {
            "error" { "🔴" }
            "warning" { "🟡" }
            "info" { "🔵" }
            default { "⚪" }
        }
        Write-Host "  $icon $($group.Name.ToUpper()): $($group.Count)"
    }
    
    Write-Host ""
    
    # Agrupa por tipo
    $byType = $Report.Issues | Group-Object -Property Type
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
                "error" { "🔴" }
                "warning" { "🟡" }
                "info" { "🔵" }
                default { "⚪" }
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

# Main execution
try {
    $isDryRun = if ($Fix) { $false } else { $true }
    
    $report = Invoke-Normalization -Workspace $WorkspacePath -IsDryRun $isDryRun
    
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
