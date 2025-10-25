<#
.SYNOPSIS
  Interrompe a execucao caso o terminal esteja em modo Administrador.
.DESCRIPTION
  Utilize este script antes de tarefas como `yarn install` para garantir que voce nao esta em um
  PowerShell elevado. Ele retorna codigo de saida 1 se for detectado privilegio de administrador.
.EXAMPLE
  pwsh -File infra/scripts/windows/assert-non-admin.ps1
#>
$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if ($principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
      Write-Error "Terminal em modo Administrador detectado. Abra um shell comum e tente novamente." -ErrorAction Stop
      exit 1
}
Write-Host "Terminal sem privilegios elevados." -ForegroundColor Green
