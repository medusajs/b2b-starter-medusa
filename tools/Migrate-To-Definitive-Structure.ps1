# Script de Migração para Estrutura Definitiva Medusa.js v2
# YSH B2B - Outubro 2025

param(
    [switch]$WhatIf,
    [switch]$Force
)

# Configurações
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
        Write-Host "[$Color]$Message[$Color]" -ForegroundColor $Color
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

function Copy-File {
    param([string]$Source, [string]$Destination)
    if (Test-Path $Source) {
        if ($WhatIf) {
            Write-ColoredOutput "[DRY] COPY: $Source → $Destination" $Cyan
        }
        else {
            Copy-Item -Path $Source -Destination $Destination -Force
            Write-ColoredOutput "[COPY] $Source → $Destination" $Green
        }
    }
    else {
        Write-ColoredOutput "[ERROR] Source not found: $Source" $Red
    }
}

function Move-File {
    param([string]$Source, [string]$Destination)
    if (Test-Path $Source) {
        if ($WhatIf) {
            Write-ColoredOutput "[DRY] MOVE: $Source → $Destination" $Cyan
        }
        else {
            Move-Item -Path $Source -Destination $Destination -Force
            Write-ColoredOutput "[MOVE] $Source → $Destination" $Green
        }
    }
    else {
        Write-ColoredOutput "[ERROR] Source not found: $Source" $Red
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
            Write-ColoredOutput "[DRY] BACKUP: $File → $BackupPath" $Yellow
        }
        else {
            Copy-Item -Path $File -Destination $BackupPath -Force
            Write-ColoredOutput "[BACKUP] $File → $BackupPath" $Yellow
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

# Storefront (já existe, garantir estrutura)
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
Write-ColoredOutput "`n=== FASE 2: MIGRANDO BACKEND (server/ → backend/) ===" $White

# Migrar estrutura src/ do server
$ServerSrc = Join-Path $ProjectRoot "server\src"
$BackendSrc = Join-Path $ProjectRoot "backend\src"

if (Test-Path $ServerSrc) {
    # Copiar módulos
    if (Test-Path (Join-Path $ServerSrc "modules")) {
        Get-ChildItem (Join-Path $ServerSrc "modules") -Recurse | ForEach-Object {
            $RelativePath = $_.FullName.Replace($ServerSrc, "").TrimStart("\")
            $DestPath = Join-Path $BackendSrc $RelativePath
            if ($_.PSIsContainer) {
                New-Dir $DestPath
            }
            else {
                Copy-File $_.FullName $DestPath
            }
        }
    }

    # Copiar workflows
    if (Test-Path (Join-Path $ServerSrc "workflows")) {
        Get-ChildItem (Join-Path $ServerSrc "workflows") -Recurse | ForEach-Object {
            $RelativePath = $_.FullName.Replace($ServerSrc, "").TrimStart("\")
            $DestPath = Join-Path $BackendSrc $RelativePath
            if ($_.PSIsContainer) {
                New-Dir $DestPath
            }
            else {
                Copy-File $_.FullName $DestPath
            }
        }
    }

    # Copiar links
    if (Test-Path (Join-Path $ServerSrc "links")) {
        Get-ChildItem (Join-Path $ServerSrc "links") -Recurse | ForEach-Object {
            $RelativePath = $_.FullName.Replace($ServerSrc, "").TrimStart("\")
            $DestPath = Join-Path $BackendSrc $RelativePath
            if ($_.PSIsContainer) {
                New-Dir $DestPath
            }
            else {
                Copy-File $_.FullName $DestPath
            }
        }
    }

    # Copiar admin
    if (Test-Path (Join-Path $ServerSrc "admin")) {
        Get-ChildItem (Join-Path $ServerSrc "admin") -Recurse | ForEach-Object {
            $RelativePath = $_.FullName.Replace($ServerSrc, "").TrimStart("\")
            $DestPath = Join-Path $BackendSrc $RelativePath
            if ($_.PSIsContainer) {
                New-Dir $DestPath
            }
            else {
                Copy-File $_.FullName $DestPath
            }
        }
    }

    # Copiar API
    if (Test-Path (Join-Path $ServerSrc "api")) {
        Get-ChildItem (Join-Path $ServerSrc "api") -Recurse | ForEach-Object {
            $RelativePath = $_.FullName.Replace($ServerSrc, "").TrimStart("\")
            $DestPath = Join-Path $BackendSrc $RelativePath
            if ($_.PSIsContainer) {
                New-Dir $DestPath
            }
            else {
                Copy-File $_.FullName $DestPath
            }
        }
    }

    # Copiar subscribers, jobs, scripts, types, utils
    @("subscribers", "jobs", "scripts", "types", "utils") | ForEach-Object {
        $SourcePath = Join-Path $ServerSrc $_
        if (Test-Path $SourcePath) {
            Get-ChildItem $SourcePath -Recurse | ForEach-Object {
                $RelativePath = $_.FullName.Replace($ServerSrc, "").TrimStart("\")
                $DestPath = Join-Path $BackendSrc $RelativePath
                if ($_.PSIsContainer) {
                    New-Dir $DestPath
                }
                else {
                    Copy-File $_.FullName $DestPath
                }
            }
        }
    }
}

# Migrar arquivos de configuração do server
$ServerConfigFiles = @("medusa-config.ts", "package.json", "tsconfig.json", ".env.example")
$ServerConfigFiles | ForEach-Object {
    $SourceFile = Join-Path (Join-Path $ProjectRoot "server") $_
    $DestFile = Join-Path (Join-Path $ProjectRoot "backend") $_
    if (Test-Path $SourceFile) {
        Copy-File $SourceFile $DestFile
    }
}

# Fase 3: Migrar arquivos do backend antigo (se necessário)
Write-ColoredOutput "`n=== FASE 3: MIGRANDO ARQUIVOS DO BACKEND ANTIGO ===" $White

$OldBackendSrc = Join-Path $ProjectRoot "backend\src"

# Migrar módulos B2B se existirem no backend antigo
$B2BModules = @("company", "quote", "approval")
$B2BModules | ForEach-Object {
    $OldModulePath = Join-Path $OldBackendSrc "modules\$_"
    $NewModulePath = Join-Path $BackendSrc "modules\$_"

    if ((Test-Path $OldModulePath) -and (-not (Test-Path $NewModulePath))) {
        Write-ColoredOutput "Migrando módulo $_ do backend antigo..." $Cyan
        Get-ChildItem $OldModulePath -Recurse | ForEach-Object {
            $RelativePath = $_.FullName.Replace($OldModulePath, "").TrimStart("\")
            $DestPath = Join-Path $NewModulePath $RelativePath
            if ($_.PSIsContainer) {
                New-Dir $DestPath
            }
            else {
                Copy-File $_.FullName $DestPath
            }
        }
    }
}

# Fase 4: Limpar duplicatas
Write-ColoredOutput "`n=== FASE 4: LIMPANDO DUPLICATAS ===" $White

if (-not $WhatIf) {
    # Criar backup antes de remover
    New-Dir $BackupDir
    Write-ColoredOutput "Criando backup em: $BackupDir" $Yellow
}

# Backup e remoção do diretório client (duplicata do storefront)
$ClientDir = Join-Path $ProjectRoot "client"
if (Test-Path $ClientDir) {
    if (-not $WhatIf) {
        # Fazer backup dos arquivos importantes
        Get-ChildItem $ClientDir -Recurse -File | ForEach-Object {
            Backup-File $_.FullName
        }
    }
    Remove-Dir $ClientDir
}

# Backup e remoção do diretório server (migrado para backend)
$ServerDir = Join-Path $ProjectRoot "server"
if (Test-Path $ServerDir) {
    if (-not $WhatIf) {
        # Fazer backup dos arquivos importantes
        Get-ChildItem $ServerDir -Recurse -File | ForEach-Object {
            Backup-File $_.FullName
        }
    }
    Remove-Dir $ServerDir
}

# Fase 5: Atualizar configurações
Write-ColoredOutput "`n=== FASE 5: ATUALIZANDO CONFIGURAÇÕES ===" $White

# Atualizar package.json raiz se necessário
$RootPackageJson = Join-Path $ProjectRoot "package.json"
if (Test-Path $RootPackageJson) {
    $PackageContent = Get-Content $RootPackageJson -Raw | ConvertFrom-Json

    # Adicionar workspaces se não existir
    if (-not $PackageContent.workspaces) {
        $PackageContent | Add-Member -MemberType NoteProperty -Name "workspaces" -Value @("backend", "storefront", "packages/*")

        if (-not $WhatIf) {
            $PackageContent | ConvertTo-Json -Depth 10 | Set-Content $RootPackageJson -Encoding UTF8
            Write-ColoredOutput "[UPDATE] package.json raiz - adicionados workspaces" $Green
        }
        else {
            Write-ColoredOutput "[DRY] UPDATE package.json raiz - adicionados workspaces" $Cyan
        }
    }
}

# Criar docker-compose.yml se não existir
$DockerComposePath = Join-Path $ProjectRoot "docker-compose.yml"
if (-not (Test-Path $DockerComposePath)) {
    $DockerComposeContent = @"
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "9000:9000"
    environment:
      - NODE_ENV=development
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis

  storefront:
    build:
      context: ./storefront
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
    volumes:
      - ./storefront:/app
      - /app/node_modules
      - /app/.next

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: medusa
      POSTGRES_USER: medusa
      POSTGRES_PASSWORD: medusa
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
"@

    if ($WhatIf) {
        Write-ColoredOutput "[DRY] CREATE: docker-compose.yml" $Cyan
    }
    else {
        $DockerComposeContent | Out-File -FilePath $DockerComposePath -Encoding UTF8
        Write-ColoredOutput "[CREATE] docker-compose.yml" $Green
    }
}

# Fase 6: Validação final
Write-ColoredOutput "`n=== FASE 6: VALIDAÇÃO FINAL ===" $White

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
        Write-ColoredOutput "[ERROR] Diretório faltando: $_" $Red
    }
}

Write-ColoredOutput "`n✅ Estrutura definitiva criada com sucesso!" $Green
if (-not $WhatIf) {
    Write-ColoredOutput "📁 Backup criado em: $BackupDir" $Yellow
}
Write-ColoredOutput "`n📋 PRÓXIMOS PASSOS:" $White
Write-ColoredOutput "1. Verificar arquivos migrados" $White
Write-ColoredOutput "2. Atualizar imports relativos se necessário" $White
Write-ColoredOutput "3. Testar build: cd backend; yarn build" $White
Write-ColoredOutput "4. Testar storefront: cd storefront; yarn dev" $White
Write-ColoredOutput "5. Atualizar documentação" $White

Write-ColoredOutput "=== MIGRACAO CONCLUIDA ===" $White