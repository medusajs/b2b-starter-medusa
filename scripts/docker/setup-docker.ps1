#!/usr/bin/env pwsh
# =============================================================================
# Setup Docker Environment for Development
# Configures BuildKit, validates Docker, and prepares for resilient development
# =============================================================================

param(
    [switch]$EnableBuildKit,
    [switch]$ValidateOnly,
    [switch]$Force
)

# Cores para output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"
$Blue = "Blue"

Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor $Cyan
Write-Host " YSH B2B - DOCKER SETUP" -ForegroundColor White
Write-Host ("=" * 80) -ForegroundColor $Cyan

# =============================================================================
# 1. VALIDAÇÃO DO AMBIENTE
# =============================================================================

Write-Host "`n[1/5] Validando ambiente Docker..." -ForegroundColor $Yellow

# Verificar se Docker está instalado
try {
    $dockerVersion = docker version --format "{{.Server.Version}}" 2>$null
    if ($dockerVersion) {
        Write-Host "  ✓ Docker instalado: v$dockerVersion" -ForegroundColor $Green
    }
    else {
        Write-Host "  ✗ Docker não está rodando" -ForegroundColor $Red
        Write-Host "    Execute: docker desktop" -ForegroundColor $Yellow
        exit 1
    }
}
catch {
    Write-Host "  ✗ Docker não encontrado" -ForegroundColor $Red
    Write-Host "    Instale Docker Desktop: https://docker.com/products/docker-desktop" -ForegroundColor $Yellow
    exit 1
}

# Verificar se Docker Compose está disponível
try {
    $composeVersion = docker compose version --short 2>$null
    if ($composeVersion) {
        Write-Host "  ✓ Docker Compose: v$composeVersion" -ForegroundColor $Green
    }
    else {
        Write-Host "  ✗ Docker Compose não encontrado" -ForegroundColor $Red
        exit 1
    }
}
catch {
    Write-Host "  ✗ Docker Compose não encontrado" -ForegroundColor $Red
    exit 1
}

# Verificar containerd
$containerdInfo = docker info --format "{{.Runtimes}}" 2>$null
if ($containerdInfo -match "containerd") {
    Write-Host "  ✓ containerd.io runtime ativo" -ForegroundColor $Green
}
else {
    Write-Host "  ⚠ containerd.io não detectado" -ForegroundColor $Yellow
}

# Verificar BuildKit
$buildkitEnabled = $env:DOCKER_BUILDKIT -eq "1"
if ($buildkitEnabled) {
    Write-Host "  ✓ BuildKit habilitado (env)" -ForegroundColor $Green
}
else {
    Write-Host "  ⚠ BuildKit não habilitado" -ForegroundColor $Yellow
}

# =============================================================================
# 2. HABILITAR BUILDKIT
# =============================================================================

if ($EnableBuildKit -or -not $buildkitEnabled) {
    Write-Host "`n[2/5] Habilitando Docker BuildKit..." -ForegroundColor $Yellow
    
    # Verificar se buildx está disponível
    try {
        $buildxVersion = docker buildx version 2>$null
        if ($buildxVersion) {
            Write-Host "  ✓ Docker Buildx disponível: $buildxVersion" -ForegroundColor $Green
        }
    }
    catch {
        Write-Host "  ✗ Docker Buildx não encontrado" -ForegroundColor $Red
    }
    
    # Configurar variáveis de ambiente
    $env:DOCKER_BUILDKIT = "1"
    $env:COMPOSE_DOCKER_CLI_BUILD = "1"
    
    Write-Host "  ✓ BuildKit habilitado para esta sessão" -ForegroundColor $Green
    
    # Verificar se PowerShell profile existe
    if (-not (Test-Path $PROFILE)) {
        Write-Host "  → Criando PowerShell profile..." -ForegroundColor $Blue
        New-Item -Path $PROFILE -ItemType File -Force | Out-Null
    }
    
    # Adicionar ao profile (se não existir)
    $profileContent = Get-Content $PROFILE -Raw -ErrorAction SilentlyContinue
    $buildkitConfig = @"

# Docker BuildKit Configuration (YSH B2B)
`$env:DOCKER_BUILDKIT = "1"
`$env:COMPOSE_DOCKER_CLI_BUILD = "1"
"@
    
    if ($profileContent -notmatch "DOCKER_BUILDKIT") {
        if ($Force -or (Read-Host "Adicionar BuildKit ao profile permanentemente? (S/N)") -eq "S") {
            Add-Content -Path $PROFILE -Value $buildkitConfig
            Write-Host "  ✓ BuildKit adicionado ao PowerShell profile" -ForegroundColor $Green
            Write-Host "    Reinicie o terminal para aplicar permanentemente" -ForegroundColor $Yellow
        }
    }
    else {
        Write-Host "  ✓ BuildKit já configurado no profile" -ForegroundColor $Green
    }
}
else {
    Write-Host "`n[2/5] BuildKit check..." -ForegroundColor $Yellow
    Write-Host "  ✓ BuildKit já habilitado" -ForegroundColor $Green
}

# =============================================================================
# 3. VALIDAÇÃO DE ARQUIVOS
# =============================================================================

Write-Host "`n[3/5] Validando arquivos de configuração..." -ForegroundColor $Yellow

$requiredFiles = @(
    "docker-compose.dev.yml",
    "docker-compose.dev.resilient.yml",
    "docker-compose.yml",
    "docker-compose.optimized.yml",
    ".dockerignore",
    "backend/.dockerignore",
    "storefront/.dockerignore",
    "nginx.conf"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor $Green
    }
    else {
        Write-Host "  ✗ $file (FALTANDO)" -ForegroundColor $Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`n  ⚠ Arquivos faltando: $($missingFiles.Count)" -ForegroundColor $Yellow
    Write-Host "    Alguns recursos podem não funcionar" -ForegroundColor $Yellow
}

# =============================================================================
# 4. VERIFICAÇÃO DE RECURSOS DO SISTEMA
# =============================================================================

Write-Host "`n[4/5] Verificando recursos do sistema..." -ForegroundColor $Yellow

# Memória disponível
$availableMemoryGB = [math]::Round((Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory / 1MB, 2)
$totalMemoryGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 2)

Write-Host "  → Memória: $availableMemoryGB GB disponível / $totalMemoryGB GB total" -ForegroundColor $Blue

if ($availableMemoryGB -lt 4) {
    Write-Host "  ⚠ Memória baixa (< 4GB disponível)" -ForegroundColor $Yellow
    Write-Host "    Recomendado: Fechar aplicações ou reduzir limites de containers" -ForegroundColor $Yellow
}
else {
    Write-Host "  ✓ Memória adequada para desenvolvimento" -ForegroundColor $Green
}

# Espaço em disco
$disk = Get-PSDrive -Name C
$freeSpaceGB = [math]::Round($disk.Free / 1GB, 2)

Write-Host "  → Disco C:: $freeSpaceGB GB disponível" -ForegroundColor $Blue

if ($freeSpaceGB -lt 10) {
    Write-Host "  ⚠ Espaço em disco baixo (< 10GB)" -ForegroundColor $Yellow
    Write-Host "    Limpe volumes Docker: docker system prune -a --volumes" -ForegroundColor $Yellow
}
else {
    Write-Host "  ✓ Espaço em disco adequado" -ForegroundColor $Green
}

# =============================================================================
# 5. VERIFICAÇÃO DE CONTAINERS EXISTENTES
# =============================================================================

Write-Host "`n[5/5] Verificando containers existentes..." -ForegroundColor $Yellow

$runningContainers = docker ps --format "{{.Names}}" 2>$null
$allContainers = docker ps -a --format "{{.Names}}" 2>$null

if ($runningContainers) {
    Write-Host "  → Containers rodando:" -ForegroundColor $Blue
    foreach ($container in $runningContainers) {
        if ($container -match "ysh-b2b") {
            Write-Host "    ✓ $container" -ForegroundColor $Green
        }
    }
}
else {
    Write-Host "  → Nenhum container rodando" -ForegroundColor $Blue
}

if ($allContainers) {
    $stoppedCount = ($allContainers | Where-Object { $_ -notin $runningContainers }).Count
    if ($stoppedCount -gt 0) {
        Write-Host "  → $stoppedCount containers parados" -ForegroundColor $Blue
    }
}

# =============================================================================
# RELATÓRIO FINAL
# =============================================================================

Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor $Cyan
Write-Host " RESULTADO DA VALIDAÇÃO" -ForegroundColor White
Write-Host ("=" * 80) -ForegroundColor $Cyan

Write-Host "`nDocker:" -ForegroundColor $Yellow
Write-Host "  Engine:    v$dockerVersion" -ForegroundColor $Cyan
Write-Host "  Compose:   v$composeVersion" -ForegroundColor $Cyan
Write-Host "  Runtime:   containerd.io" -ForegroundColor $Cyan
Write-Host "  BuildKit:  $(if ($env:DOCKER_BUILDKIT -eq '1') { 'Habilitado' } else { 'Desabilitado' })" -ForegroundColor $Cyan

Write-Host "`nSistema:" -ForegroundColor $Yellow
Write-Host "  Memória:   $availableMemoryGB GB / $totalMemoryGB GB" -ForegroundColor $Cyan
Write-Host "  Disco:     $freeSpaceGB GB disponível" -ForegroundColor $Cyan

Write-Host "`nArquivos:" -ForegroundColor $Yellow
Write-Host "  Configs:   $($requiredFiles.Count - $missingFiles.Count)/$($requiredFiles.Count) encontrados" -ForegroundColor $Cyan

# =============================================================================
# PRÓXIMOS PASSOS
# =============================================================================

Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor $Cyan
Write-Host " PRÓXIMOS PASSOS" -ForegroundColor White
Write-Host ("=" * 80) -ForegroundColor $Cyan

if ($ValidateOnly) {
    Write-Host "`nModo validação completo. Nenhuma ação tomada." -ForegroundColor $Blue
}
else {
    Write-Host "`nPara iniciar o ambiente de desenvolvimento:" -ForegroundColor $Yellow
    Write-Host ""
    Write-Host "  # Opção 1: Configuração original" -ForegroundColor $Cyan
    Write-Host "  docker-compose -f docker-compose.dev.yml up -d" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  # Opção 2: Configuração resiliente (RECOMENDADO)" -ForegroundColor $Cyan
    Write-Host "  docker-compose -f docker-compose.dev.resilient.yml up -d" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  # Opção 3: Via script PowerShell" -ForegroundColor $Cyan
    Write-Host "  .\start-dev.ps1 -Both" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "Para verificar status dos containers:" -ForegroundColor $Yellow
    Write-Host "  docker-compose -f docker-compose.dev.resilient.yml ps" -ForegroundColor $Cyan
    Write-Host ""
    
    Write-Host "Para ver logs:" -ForegroundColor $Yellow
    Write-Host "  docker-compose -f docker-compose.dev.resilient.yml logs -f" -ForegroundColor $Cyan
    Write-Host ""
    
    Write-Host "Para parar tudo:" -ForegroundColor $Yellow
    Write-Host "  docker-compose -f docker-compose.dev.resilient.yml down" -ForegroundColor $Cyan
}

Write-Host "`n" -NoNewline
Write-Host ("=" * 80) -ForegroundColor $Cyan
Write-Host ""

# Se tudo OK, retornar sucesso
if ($missingFiles.Count -eq 0 -and $availableMemoryGB -ge 4 -and $freeSpaceGB -ge 10) {
    Write-Host "✓ Sistema pronto para desenvolvimento!" -ForegroundColor $Green
    exit 0
}
elseif ($missingFiles.Count -gt 0) {
    Write-Host "⚠ Sistema parcialmente pronto (arquivos faltando)" -ForegroundColor $Yellow
    exit 0
}
else {
    Write-Host "⚠ Sistema com recursos limitados" -ForegroundColor $Yellow
    exit 0
}

