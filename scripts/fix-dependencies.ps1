# ==========================================
# Script de Limpeza e Reinstalação de Dependências
# Corrige problemas de dependências corrompidas
# ==========================================

param(
      [switch]$Backend,
      [switch]$Storefront,
      [switch]$All
)

# Se nenhum parâmetro específico foi fornecido, executar tudo
if (-not $Backend -and -not $Storefront) {
      $All = $true
}

# Cores para output
$Colors = @{
      Red    = "`e[31m"
      Green  = "`e[32m"
      Yellow = "`e[33m"
      Blue   = "`e[34m"
      Reset  = "`e[0m"
}

function Write-ColorOutput {
      param([string]$Message, [string]$Color = "Blue")
      Write-Host "$($Colors[$Color])$Message$($Colors.Reset)"
}

function Remove-Dependencies {
      param([string]$Directory)
    
      Write-ColorOutput "[INFO] Limpando dependências em $Directory..." "Blue"
    
      Push-Location $Directory
    
      try {
            # Remover node_modules
            if (Test-Path "node_modules") {
                  Write-ColorOutput "  Removendo node_modules..." "Yellow"
                  Remove-Item -Recurse -Force "node_modules" -ErrorAction Stop
            }
        
            # Remover package-lock.json
            if (Test-Path "package-lock.json") {
                  Write-ColorOutput "  Removendo package-lock.json..." "Yellow"
                  Remove-Item -Force "package-lock.json" -ErrorAction Stop
            }
        
            # Remover yarn.lock
            if (Test-Path "yarn.lock") {
                  Write-ColorOutput "  Removendo yarn.lock..." "Yellow"
                  Remove-Item -Force "yarn.lock" -ErrorAction Stop
            }
        
            # Limpar cache do npm
            Write-ColorOutput "  Limpando cache do npm..." "Yellow"
            npm cache clean --force 2>$null
        
            Write-ColorOutput "[SUCCESS] Limpeza concluída em $Directory" "Green"
        
      }
      catch {
            Write-ColorOutput "[ERROR] Erro na limpeza: $($_.Exception.Message)" "Red"
      }
    
      Pop-Location
}

function Install-Dependencies {
      param([string]$Directory)
    
      Write-ColorOutput "[INFO] Instalando dependências em $Directory..." "Blue"
    
      Push-Location $Directory
    
      try {
            # Configurações do npm para melhor compatibilidade
            Write-ColorOutput "  Configurando npm..." "Yellow"
            npm config set legacy-peer-deps true
            npm config set fund false
            npm config set audit false
        
            # Instalar dependências
            Write-ColorOutput "  Instalando dependências..." "Yellow"
            npm install --legacy-peer-deps --no-fund --no-audit
        
            Write-ColorOutput "[SUCCESS] Instalação concluída em $Directory" "Green"
        
      }
      catch {
            Write-ColorOutput "[ERROR] Erro na instalação: $($_.Exception.Message)" "Red"
            throw
      }
    
      Pop-Location
}

# Função principal
Write-ColorOutput "🧹 Iniciando limpeza e reinstalação de dependências..." "Blue"

try {
      if ($Backend -or $All) {
            Remove-Dependencies "backend"
            Install-Dependencies "backend"
      }
    
      if ($Storefront -or $All) {
            Remove-Dependencies "storefront"
            Install-Dependencies "storefront"
      }      Write-ColorOutput "✅ Processo concluído com sucesso!" "Green"
      Write-ColorOutput "Agora você pode executar: .\scripts\podman-dev.ps1 start" "Blue"
    
}
catch {
      Write-ColorOutput "❌ Erro durante o processo: $($_.Exception.Message)" "Red"
      exit 1
}