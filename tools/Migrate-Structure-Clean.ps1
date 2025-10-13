# Script de Migracao para Estrutura Definitiva Medusa.js v2
# YSH B2B - Outubro 2025

param(
    [switch]$WhatIf,
    [switch]$Force
)

# Configuracoes
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $Root
$Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupDir = Join-Path $ProjectRoot ".backup_$Timestamp"

# Cores para output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"
$White = "White"

function Write-ColoredOutput {
    param([string]$Message, [string]$Color = $White)
    if ($WhatIf) {
        Write-Host "[DRY-RUN] $Message" -ForegroundColor $Color
    }
    else {
        Write-Host $Message -ForegroundColor $Color
    }
}

function New-Dir {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        if ($WhatIf) {
            Write-ColoredOutput "[DRY] CREATE DIR: $Path" $Cyan
        }
        else {
            New-Item -ItemType Directory -Path $Path -Force | Out-Null
            Write-ColoredOutput "[CREATE] DIR: $Path" $Green
        }
    }
    else {
        Write-ColoredOutput "[SKIP] DIR exists: $Path" $Yellow
    }
}

function Copy-FileItem {
    param([string]$Source, [string]$Destination)
    if (Test-Path $Source) {
        if ($WhatIf) {
            Write-ColoredOutput "[DRY] COPY: $Source" $Cyan
        }
        else {
            $DestDir = Split-Path $Destination -Parent
            if (-not (Test-Path $DestDir)) {
                New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
            }
            Copy-Item -Path $Source -Destination $Destination -Force
            Write-ColoredOutput "[COPY] $Source" $Green
        }
    }
}

function Remove-Dir {
    param([string]$Path)
    if (Test-Path $Path) {
        if ($WhatIf) {
            Write-ColoredOutput "[DRY] REMOVE DIR: $Path" $Red
        }
        else {
            Remove-Item -Path $Path -Recurse -Force
            Write-ColoredOutput "[REMOVE] DIR: $Path" $Red
        }
    }
    else {
        Write-ColoredOutput "[SKIP] DIR not found: $Path" $Yellow
    }
}

function Backup-File {
    param([string]$File)
    if (Test-Path $File) {
        $RelativePath = $File.Replace($ProjectRoot, "").TrimStart("\")
        $BackupPath = Join-Path $BackupDir $RelativePath

        if (-not (Test-Path (Split-Path $BackupPath -Parent))) {
            New-Item -ItemType Directory -Path (Split-Path $BackupPath -Parent) -Force | Out-Null
        }

        if ($WhatIf) {
            Write-ColoredOutput "[DRY] BACKUP: $File" $Yellow
        }
        else {
            Copy-Item -Path $File -Destination $BackupPath -Force
            Write-ColoredOutput "[BACKUP] $File" $Yellow
        }
    }
}

# Fase 1: Criar estrutura definitiva
Write-ColoredOutput "`n=== FASE 1: CRIANDO ESTRUTURA DEFINITIVA ===" $White

# Backend consolidado
New-Dir (Join-Path $ProjectRoot "backend")
New-Dir (Join-Path $ProjectRoot "backend\src")
New-Dir (Join-Path $ProjectRoot "backend\src\admin")
New-Dir (Join-Path $ProjectRoot "backend\src\api")
New-Dir (Join-Path $ProjectRoot "backend\src\api\store")
New-Dir (Join-Path $ProjectRoot "backend\src\api\admin")
New-Dir (Join-Path $ProjectRoot "backend\src\api\health")
New-Dir (Join-Path $ProjectRoot "backend\src\modules")
New-Dir (Join-Path $ProjectRoot "backend\src\workflows")
New-Dir (Join-Path $ProjectRoot "backend\src\links")
New-Dir (Join-Path $ProjectRoot "backend\src\subscribers")
New-Dir (Join-Path $ProjectRoot "backend\src\jobs")
New-Dir (Join-Path $ProjectRoot "backend\src\scripts")
New-Dir (Join-Path $ProjectRoot "backend\src\types")
New-Dir (Join-Path $ProjectRoot "backend\src\utils")

# Storefront (ja existe, garantir estrutura)
New-Dir (Join-Path $ProjectRoot "storefront\src\app\[countryCode]\(main)")
New-Dir (Join-Path $ProjectRoot "storefront\src\app\[countryCode]\(checkout)")
New-Dir (Join-Path $ProjectRoot "storefront\src\modules")
New-Dir (Join-Path $ProjectRoot "storefront\src\lib\config")
New-Dir (Join-Path $ProjectRoot "storefront\src\lib\data")
New-Dir (Join-Path $ProjectRoot "storefront\src\lib\hooks")
New-Dir (Join-Path $ProjectRoot "storefront\src\lib\utils")

# Shared e packages
New-Dir (Join-Path $ProjectRoot "shared")
New-Dir (Join-Path $ProjectRoot "shared\types")
New-Dir (Join-Path $ProjectRoot "shared\utils")
New-Dir (Join-Path $ProjectRoot "shared\constants")

New-Dir (Join-Path $ProjectRoot "packages")
New-Dir (Join-Path $ProjectRoot "packages\ui")
New-Dir (Join-Path $ProjectRoot "packages\config")
New-Dir (Join-Path $ProjectRoot "packages\types")

# Fase 2: Migrar arquivos do backend
Write-ColoredOutput "`n=== FASE 2: MIGRANDO BACKEND (server/ -> backend/) ===" $White

# Migrar estrutura src/ do server
$ServerSrc = Join-Path $ProjectRoot "server\src"
$BackendSrc = Join-Path $ProjectRoot "backend\src"

if (Test-Path $ServerSrc) {
    # Copiar modulos
    if (Test-Path (Join-Path $ServerSrc "modules")) {
        Write-ColoredOutput "Copiando modulos..." $Cyan
        Get-ChildItem (Join-Path $ServerSrc "modules") -Recurse | ForEach-Object {
            $RelativePath = $_.FullName.Replace($ServerSrc, "").TrimStart("\")
            $DestPath = Join-Path $BackendSrc $RelativePath
            if ($_.PSIsContainer) {
                New-Dir $DestPath
            }
            else {
                Copy-FileItem $_.FullName $DestPath
            }
        }
    }

    # Copiar workflows
    if (Test-Path (Join-Path $ServerSrc "workflows")) {
        Write-ColoredOutput "Copiando workflows..." $Cyan
        Get-ChildItem (Join-Path $ServerSrc "workflows") -Recurse | ForEach-Object {
            $RelativePath = $_.FullName.Replace($ServerSrc, "").TrimStart("\")
            $DestPath = Join-Path $BackendSrc $RelativePath
            if ($_.PSIsContainer) {
                New-Dir $DestPath
            }
            else {
                Copy-FileItem $_.FullName $DestPath
            }
        }
    }

    # Copiar links
    if (Test-Path (Join-Path $ServerSrc "links")) {
        Write-ColoredOutput "Copiando links..." $Cyan
        Get-ChildItem (Join-Path $ServerSrc "links") -Recurse | ForEach-Object {
            $RelativePath = $_.FullName.Replace($ServerSrc, "").TrimStart("\")
            $DestPath = Join-Path $BackendSrc $RelativePath
            if ($_.PSIsContainer) {
                New-Dir $DestPath
            }
            else {
                Copy-FileItem $_.FullName $DestPath
            }
        }
    }

    # Copiar admin
    if (Test-Path (Join-Path $ServerSrc "admin")) {
        Write-ColoredOutput "Copiando admin..." $Cyan
        Get-ChildItem (Join-Path $ServerSrc "admin") -Recurse | ForEach-Object {
            $RelativePath = $_.FullName.Replace($ServerSrc, "").TrimStart("\")
            $DestPath = Join-Path $BackendSrc $RelativePath
            if ($_.PSIsContainer) {
                New-Dir $DestPath
            }
            else {
                Copy-FileItem $_.FullName $DestPath
            }
        }
    }

    # Copiar API
    if (Test-Path (Join-Path $ServerSrc "api")) {
        Write-ColoredOutput "Copiando API routes..." $Cyan
        Get-ChildItem (Join-Path $ServerSrc "api") -Recurse | ForEach-Object {
            $RelativePath = $_.FullName.Replace($ServerSrc, "").TrimStart("\")
            $DestPath = Join-Path $BackendSrc $RelativePath
            if ($_.PSIsContainer) {
                New-Dir $DestPath
            }
            else {
                Copy-FileItem $_.FullName $DestPath
            }
        }
    }

    # Copiar subscribers, jobs, scripts
    @("subscribers", "jobs", "scripts") | ForEach-Object {
        $SourcePath = Join-Path $ServerSrc $_
        if (Test-Path $SourcePath) {
            Write-ColoredOutput "Copiando $_..." $Cyan
            Get-ChildItem $SourcePath -Recurse | ForEach-Object {
                $RelativePath = $_.FullName.Replace($ServerSrc, "").TrimStart("\")
                $DestPath = Join-Path $BackendSrc $RelativePath
                if ($_.PSIsContainer) {
                    New-Dir $DestPath
                }
                else {
                    Copy-FileItem $_.FullName $DestPath
                }
            }
        }
    }
}

# Migrar arquivos de configuracao do server
$ServerConfigFiles = @("medusa-config.ts", "package.json", "tsconfig.json", ".env.example")
$ServerConfigFiles | ForEach-Object {
    $SourceFile = Join-Path (Join-Path $ProjectRoot "server") $_
    $DestFile = Join-Path (Join-Path $ProjectRoot "backend") $_
    if (Test-Path $SourceFile) {
        Copy-FileItem $SourceFile $DestFile
    }
}

# Fase 3: Validacao final
Write-ColoredOutput "`n=== FASE 3: VALIDACAO FINAL ===" $White

# Verificar estrutura criada
$RequiredDirs = @(
    "backend\src\api\store",
    "backend\src\api\admin",
    "backend\src\api\health",
    "backend\src\modules",
    "backend\src\workflows",
    "storefront\src\app\[countryCode]\(main)",
    "storefront\src\app\[countryCode]\(checkout)",
    "shared\types",
    "packages\ui"
)

$RequiredDirs | ForEach-Object {
    $DirPath = Join-Path $ProjectRoot $_
    if (-not (Test-Path $DirPath)) {
        Write-ColoredOutput "[ERROR] Diretorio faltando: $_" $Red
    }
}

Write-ColoredOutput "`n[OK] Estrutura definitiva criada com sucesso!" $Green
if (-not $WhatIf) {
    Write-ColoredOutput "[BACKUP] Backup criado em: $BackupDir" $Yellow
}
Write-ColoredOutput "`n[PROXIMO] PROXIMOS PASSOS:" $White
Write-ColoredOutput "1. Verificar arquivos migrados" $White
Write-ColoredOutput "2. Atualizar imports relativos se necessario" $White
Write-ColoredOutput "3. Testar build: cd backend; yarn build" $White
Write-ColoredOutput "4. Testar storefront: cd storefront; yarn dev" $White
Write-ColoredOutput "5. Atualizar documentacao" $White

Write-ColoredOutput "`n=== MIGRACAO CONCLUIDA ===" $White
