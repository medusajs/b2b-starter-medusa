<#
.SYNOPSIS
      Configura um ambiente de desenvolvimento Node.js no Windows ajustando exclusoes do Windows Defender
      e desativando a indexacao de busca para o repositorio atual.
.DESCRIPTION
      Execute este script a partir da raiz do repositorio (nao use terminal elevado). Ele aplica exclusoes
      de antivirus para o diretorio do projeto, diretorios de cache Yarn/NPM e diretorio do Node gerenciado
      via nvm-windows. Tambem sinaliza as pastas para nao serem indexadas pelo Windows Search.
.PARAMETER YarnCachePath
      Caminho opcional para o cache do Yarn. Caso nao informado, o script tenta descobrir
  via `corepack yarn cache dir`.
.PARAMETER NpmCachePath
      Caminho opcional para o cache do npm. Valor padrao: $env:APPDATA\npm-cache.
.PARAMETER NodeInstallPath
      Caminho opcional para a instalacao do Node (nvm-windows). Valor padrao: $env:LOCALAPPDATA\nvm.
.EXAMPLE
  pwsh -ExecutionPolicy Bypass -File infra/scripts/windows/setup-dev-environment.ps1
#>
[CmdletBinding()]
param(
      [string]$YarnCachePath,
      [string]$NpmCachePath = (Join-Path $env:APPDATA "npm-cache"),
      [string]$NodeInstallPath = (Join-Path $env:LOCALAPPDATA "nvm"),
      [switch]$SkipDefender,
      [switch]$SkipIndexing
)

function Assert-NotElevated {
      $principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
      if ($principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
            throw "Nao execute este script como Administrador. Abra um terminal comum e tente novamente."
      }
}

function Resolve-YarnCachePath {
      param([string]$ProvidedPath)
      if ($ProvidedPath) {
            return (Resolve-Path -LiteralPath $ProvidedPath).Path
      }
      try {
            $result = corepack yarn cache dir 2>$null
            if ($LASTEXITCODE -eq 0 -and $result) {
                  return (Resolve-Path -LiteralPath $result.Trim()).Path
            }
      }
      catch {
            Write-Warning "Nao foi possivel descobrir o cache do Yarn automaticamente. Informe via parametro -YarnCachePath."
      }
      return $null
}

function Add-DefenderExclusion {
      param([string]$Path)
      try {
            if (-not (Test-Path -LiteralPath $Path)) {
                  return
            }
            Write-Host "Adicionando exclusao do Defender em: $Path"
            Add-MpPreference -ExclusionPath $Path
      }
      catch {
            Write-Warning ("Falha ao adicionar exclusao para {0}: {1}" -f $Path, $_)
      }
}

function Disable-Indexing {
      param([string]$Path)
      if (-not (Test-Path -LiteralPath $Path)) {
            return
      }
      Write-Host "Desativando indexacao para: $Path"
      $item = Get-Item -LiteralPath $Path -Force
      if (-not ($item.Attributes -band [System.IO.FileAttributes]::NotContentIndexed)) {
            $item.Attributes = $item.Attributes -bor [System.IO.FileAttributes]::NotContentIndexed
      }
      Get-ChildItem -LiteralPath $Path -Directory -Recurse -Force -ErrorAction SilentlyContinue |
      ForEach-Object {
            if (-not ($_.Attributes -band [System.IO.FileAttributes]::NotContentIndexed)) {
                  $_.Attributes = $_.Attributes -bor [System.IO.FileAttributes]::NotContentIndexed
            }
      }
}

try {
      Assert-NotElevated

      $repoRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..\..")).Path
      Write-Host "Raiz do repositorio detectada: $repoRoot"

      $resolvedYarnCache = Resolve-YarnCachePath -ProvidedPath $YarnCachePath
      if (-not $resolvedYarnCache) {
            Write-Warning "Cache do Yarn nao definido. Voce pode defini-lo com -YarnCachePath."
      }

      if (-not $SkipDefender) {
            Add-DefenderExclusion -Path $repoRoot
            if ($resolvedYarnCache) {
                  Add-DefenderExclusion -Path $resolvedYarnCache
            }
            if ($NpmCachePath) {
                  Add-DefenderExclusion -Path (Resolve-Path -LiteralPath $NpmCachePath -ErrorAction SilentlyContinue)
            }
            if ($NodeInstallPath) {
                  $nodePath = Resolve-Path -LiteralPath $NodeInstallPath -ErrorAction SilentlyContinue
                  if ($nodePath) {
                        Add-DefenderExclusion -Path $nodePath
                  }
            }
      }

      if (-not $SkipIndexing) {
            Disable-Indexing -Path $repoRoot
      }

      Write-Host "Configuracao concluida." -ForegroundColor Green
}
catch {
      Write-Error $_
      exit 1
}
*** End File