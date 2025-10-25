# Script PowerShell para exportar OPENAI_API_KEY
# Uso: .\export-openai-key.ps1

Write-Host "Exportando OPENAI_API_KEY para a sessao do PowerShell" -ForegroundColor Cyan
Write-Host ""

# Definir a variavel de ambiente para a sessao atual
$env:OPENAI_API_KEY = "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"

# Verificar se foi configurada corretamente
$keyLength = $env:OPENAI_API_KEY.Length
$previewLength = 20
if ($keyLength -lt 20) { $previewLength = $keyLength }
$maskedKey = $env:OPENAI_API_KEY.Substring(0, $previewLength) + "..."

Write-Host "OPENAI_API_KEY exportado com sucesso!" -ForegroundColor Green
Write-Host "Chave mascarada: $maskedKey" -ForegroundColor Cyan
Write-Host ""
Write-Host "A variavel esta disponivel para:" -ForegroundColor Yellow
Write-Host "  - Esta sessao do PowerShell" -ForegroundColor White
Write-Host "  - Processos iniciados a partir desta sessao" -ForegroundColor White
Write-Host ""
Write-Host "Para tornar permanente (opcional):" -ForegroundColor Yellow
Write-Host "  [System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'SUA_CHAVE_AQUI', 'User')" -ForegroundColor Gray
Write-Host ""
Write-Host "Para testar, execute:" -ForegroundColor Cyan
Write-Host "  yarn validate:api-keys" -ForegroundColor White
Write-Host ""
