# ==========================================
# Script PowerShell para Ambiente Dev Podman  
# Configuração avançada para desenvolvimento
# ==========================================

param(
      [Parameter(Mandatory = $false)]
      [ValidateSet("start", "stop", "restart", "logs", "build", "clean")]
      [string]$Action = "start"
)

# Cores para output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

function Write-Info {
      param([string]$Message)
      Write-Host "${Blue}[INFO]${Reset} $Message"
}

function Write-Success {
      param([string]$Message)
      Write-Host "${Green}[SUCCESS]${Reset} $Message"
}

function Write-Warning {
      param([string]$Message)
      Write-Host "${Yellow}[WARNING]${Reset} $Message"
}

function Write-Error {
      param([string]$Message)
      Write-Host "${Red}[ERROR]${Reset} $Message"
}

function Test-PodmanInstallation {
      Write-Info "Verificando instalação do Podman..."
    
      try {
            $version = podman --version
            Write-Success "Podman encontrado: $version"
            return $true
      }
      catch {
            Write-Error "Podman não encontrado. Instale Podman Desktop: https://podman-desktop.io/downloads"
            return $false
      }
}

function Start-PodmanMachine {
      Write-Info "Verificando status da máquina Podman..."
    
      $machineStatus = podman machine list --format "{{.Running}}" 2>$null
    
      if ($machineStatus -notcontains "true") {
            Write-Info "Iniciando máquina Podman..."
            podman machine start
        
            if ($LASTEXITCODE -ne 0) {
                  Write-Error "Falha ao iniciar máquina Podman"
                  return $false
            }
        
            Start-Sleep -Seconds 10
      }
    
      # Configurar DOCKER_HOST para compatibilidade
      $env:DOCKER_HOST = "npipe:////./pipe/podman-machine-default"
    
      Write-Success "Máquina Podman está rodando"
      return $true
}

function Build-DevImages {
      Write-Info "Construindo imagens de desenvolvimento..."
    
      # Build backend
      Write-Info "Construindo imagem backend..."
      podman build -f backend/Containerfile.dev -t ysh-b2b-backend-dev ./backend
    
      if ($LASTEXITCODE -ne 0) {
            Write-Error "Falha no build da imagem backend"
            return $false
      }
    
      # Build storefront
      Write-Info "Construindo imagem storefront..."
      podman build -f storefront/Containerfile.dev -t ysh-b2b-storefront-dev ./storefront
    
      if ($LASTEXITCODE -ne 0) {
            Write-Error "Falha no build da imagem storefront"
            return $false
      }
    
      Write-Success "Build das imagens concluído"
      return $true
}

function Start-DevEnvironment {
      Write-Info "Iniciando ambiente de desenvolvimento..."
    
      # Criar rede se não existir
      $networkExists = podman network exists ysh-b2b-dev-network 2>$null
      if ($LASTEXITCODE -ne 0) {
            Write-Info "Criando rede de desenvolvimento..."
            podman network create ysh-b2b-dev-network --subnet 172.25.0.0/16
      }
    
      # Criar volumes persistentes
      Write-Info "Criando volumes persistentes..."
      podman volume create postgres_dev_data 2>$null
      podman volume create redis_dev_data 2>$null
      podman volume create backend_dev_uploads 2>$null
    
      # Iniciar serviços
      Write-Info "Iniciando serviços..."
    
      # Tentar com podman-compose primeiro
      if (Get-Command podman-compose -ErrorAction SilentlyContinue) {
            podman-compose -f podman-compose.dev.yml up -d
      }
      else {
            # Fallback para docker-compose
            Write-Warning "podman-compose não encontrado, usando docker-compose"
            docker-compose -f podman-compose.dev.yml up -d
      }
    
      if ($LASTEXITCODE -ne 0) {
            Write-Error "Falha ao iniciar serviços"
            return $false
      }
    
      Write-Success "Serviços iniciados com sucesso"
      return $true
}

function Test-ServicesHealth {
      Write-Info "Aguardando inicialização dos serviços..."
      Start-Sleep -Seconds 30
    
      Write-Info "Verificando saúde dos serviços..."
    
      # Verificar PostgreSQL
      try {
            podman exec ysh-b2b-postgres-dev pg_isready -U medusa_user -d medusa_db 2>$null
            if ($LASTEXITCODE -eq 0) {
                  Write-Success "PostgreSQL respondendo"
            }
            else {
                  Write-Warning "PostgreSQL pode não estar respondendo"
            }
      }
      catch {
            Write-Warning "Não foi possível verificar PostgreSQL"
      }
    
      # Verificar Redis
      try {
            podman exec ysh-b2b-redis-dev redis-cli ping 2>$null
            if ($LASTEXITCODE -eq 0) {
                  Write-Success "Redis respondendo"
            }
            else {
                  Write-Warning "Redis pode não estar respondendo"
            }
      }
      catch {
            Write-Warning "Não foi possível verificar Redis"
      }
    
      # Verificar backend
      Start-Sleep -Seconds 20
      try {
            $response = Invoke-WebRequest -Uri "http://localhost:9000/health" -TimeoutSec 5 2>$null
            if ($response.StatusCode -eq 200) {
                  Write-Success "Backend respondendo em http://localhost:9000"
            }
            else {
                  Write-Warning "Backend ainda inicializando"
            }
      }
      catch {
            Write-Warning "Backend ainda inicializando - aguarde mais alguns segundos"
      }
    
      # Verificar storefront
      try {
            $response = Invoke-WebRequest -Uri "http://localhost:8000" -TimeoutSec 5 2>$null
            if ($response.StatusCode -eq 200) {
                  Write-Success "Storefront respondendo em http://localhost:8000"
            }
            else {
                  Write-Warning "Storefront ainda inicializando"
            }
      }
      catch {
            Write-Warning "Storefront ainda inicializando - aguarde mais alguns segundos"
      }
}

function Stop-DevEnvironment {
      Write-Info "Parando ambiente de desenvolvimento..."
    
      if (Get-Command podman-compose -ErrorAction SilentlyContinue) {
            podman-compose -f podman-compose.dev.yml down
      }
      else {
            docker-compose -f podman-compose.dev.yml down
      }
    
      Write-Success "Ambiente parado"
}

function Show-DevInfo {
      Write-Host ""
      Write-Host "${Blue}========================================${Reset}"
      Write-Host "${Blue} AMBIENTE DE DESENVOLVIMENTO INICIADO! ${Reset}"
      Write-Host "${Blue}========================================${Reset}"
      Write-Host "${Green}Storefront Dev:${Reset} http://localhost:8000"
      Write-Host "${Green}Backend API:${Reset} http://localhost:9000"
      Write-Host "${Green}Admin Panel:${Reset} http://localhost:9000/admin"
      Write-Host "${Green}Adminer DB:${Reset} http://localhost:8080"
      Write-Host "${Green}MailHog:${Reset} http://localhost:8025"
      Write-Host "${Blue}========================================${Reset}"
      Write-Host ""
      Write-Host "${Yellow}COMANDOS ÚTEIS:${Reset}"
      Write-Host "Ver logs: ${Green}.\scripts\podman-dev.ps1 logs${Reset}"
      Write-Host "Parar: ${Green}.\scripts\podman-dev.ps1 stop${Reset}"
      Write-Host "Restart: ${Green}.\scripts\podman-dev.ps1 restart${Reset}"
      Write-Host "Rebuild: ${Green}.\scripts\podman-dev.ps1 build${Reset}"
      Write-Host "Clean: ${Green}.\scripts\podman-dev.ps1 clean${Reset}"
      Write-Host ""
}

# Função principal
function Main {
      switch ($Action) {
            "start" {
                  if (-not (Test-PodmanInstallation)) { exit 1 }
                  if (-not (Start-PodmanMachine)) { exit 1 }
                  if (-not (Build-DevImages)) { exit 1 }
                  if (-not (Start-DevEnvironment)) { exit 1 }
                  Test-ServicesHealth
                  Show-DevInfo
            }
            "stop" {
                  Stop-DevEnvironment
            }
            "restart" {
                  Stop-DevEnvironment
                  Start-Sleep -Seconds 5
                  & $MyInvocation.MyCommand.Path -Action start
            }
            "logs" {
                  if (Get-Command podman-compose -ErrorAction SilentlyContinue) {
                        podman-compose -f podman-compose.dev.yml logs -f
                  }
                  else {
                        docker-compose -f podman-compose.dev.yml logs -f
                  }
            }
            "build" {
                  if (-not (Test-PodmanInstallation)) { exit 1 }
                  if (-not (Start-PodmanMachine)) { exit 1 }
                  Build-DevImages
            }
            "clean" {
                  Write-Info "Limpando ambiente..."
                  Stop-DevEnvironment
                  podman system prune -a -f
                  podman volume prune -f
                  Write-Success "Limpeza concluída"
            }
            default {
                  Write-Error "Ação inválida. Use: start, stop, restart, logs, build, clean"
                  exit 1
            }
      }
}

# Executar função principal
Main