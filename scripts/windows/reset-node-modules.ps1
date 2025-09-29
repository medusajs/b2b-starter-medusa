<#
.SYNOPSIS
  Limpa node_modules e reinstala dependencias com determinismo em um workspace Yarn 4.
.DESCRIPTION
  O script remove node_modules, limpa o cache do Yarn via Corepack e executa `yarn install --frozen-lockfile`.
  Deve ser executado a partir da pasta alvo (ex.: backend ou storefront) em terminal nao elevado.
.PARAMETER WorkspacePath
  Diretoria do workspace onde o reset sera aplicado. Padrao: diretorio atual.
.EXAMPLE
  pwsh -File scripts/windows/reset-node-modules.ps1 -WorkspacePath ../backend
#>
[CmdletBinding()]
param(
      [string]$WorkspacePath = "."
)

. "$PSScriptRoot/assert-non-admin.ps1"

$resolvedPath = Resolve-Path -LiteralPath $WorkspacePath
Push-Location -LiteralPath $resolvedPath

if (-not (Test-Path -LiteralPath "package.json")) {
      Pop-Location
      throw "Nenhum package.json encontrado em $resolvedPath. Informe -WorkspacePath apontando para um workspace valido (ex.: backend ou storefront)."
}

function Remove-NodeModulesSafely {
      if (-not (Test-Path -LiteralPath "node_modules")) {
            return
      }

      Write-Host "Removendo node_modules em $resolvedPath" -ForegroundColor Yellow
      $maxAttempts = 3

      for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
            try {
                  Remove-Item -LiteralPath "node_modules" -Recurse -Force -ErrorAction Stop
                  return
            }
            catch {
                  Write-Warning "Tentativa $attempt falhou ao remover node_modules: $($_.Exception.Message)"

                  Write-Host "Executando fallback via cmd.exe" -ForegroundColor Yellow
                  try {
                        cmd.exe /d /c "attrib -R -S -H node_modules /S /D"
                        cmd.exe /d /c "rmdir /s /q node_modules"
                  }
                  catch {
                        Write-Warning "Falha no fallback: $($_.Exception.Message)"
                  }

                  if (-not (Test-Path -LiteralPath "node_modules")) {
                        return
                  }

                  if ($attempt -lt $maxAttempts) {
                        Start-Sleep -Seconds 1
                        continue
                  }

                  throw "Nao foi possivel remover node_modules. Feche processos que estejam usando a pasta (por exemplo VSCode, servidores em execucao, antivirus) e tente novamente."
            }
      }
}

Remove-NodeModulesSafely

Write-Host "Limpando cache do Yarn" -ForegroundColor Yellow
corepack yarn cache clean
if ($LASTEXITCODE -ne 0) {
      Pop-Location
      throw "Falha ao limpar o cache do Yarn. Veja o log acima."
}

Write-Host "Reinstalando dependencias" -ForegroundColor Yellow
corepack yarn install --immutable
if ($LASTEXITCODE -ne 0) {
      Pop-Location
      throw "Falha ao reinstalar as dependencias. Ajuste os avisos exibidos e tente novamente."
}

Write-Host "Reset concluido." -ForegroundColor Green
Pop-Location
