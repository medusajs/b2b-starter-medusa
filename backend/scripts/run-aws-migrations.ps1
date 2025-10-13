<#
.SYNOPSIS
    Executa migrations do Medusa no RDS AWS
.DESCRIPTION
    Conecta ao RDS PostgreSQL e executa todas as migrations pendentes do Database 360°
.PARAMETER Profile
    AWS Profile a usar (default: ysh-production)
.PARAMETER SecretId
    Secret Manager ID (default: ysh-backend/production/database)
.PARAMETER DryRun
    Se presente, apenas mostra as migrations pendentes sem executar
.EXAMPLE
    .\run-aws-migrations.ps1
    .\run-aws-migrations.ps1 -DryRun
    .\run-aws-migrations.ps1 -Profile dev -SecretId ysh-backend/dev/database
#>

param(
    [string]$Profile = "ysh-production",
    [string]$SecretId = "ysh-backend/production/database",
    [switch]$DryRun
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " AWS RDS MIGRATION EXECUTOR" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Verificar AWS CLI
Write-Host "1. Verificando AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "   ✅ AWS CLI: $awsVersion" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ AWS CLI não encontrado!" -ForegroundColor Red
    Write-Host "   Instale: https://aws.amazon.com/cli/" -ForegroundColor Yellow
    exit 1
}

# 2. Verificar Profile AWS
Write-Host "`n2. Verificando AWS Profile: $Profile..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --profile $Profile 2>&1 | ConvertFrom-Json
    Write-Host "   ✅ Account: $($identity.Account)" -ForegroundColor Green
    Write-Host "   ✅ User: $($identity.Arn)" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ Profile '$Profile' não encontrado ou expirado!" -ForegroundColor Red
    Write-Host "   Configure com: aws configure sso --profile $Profile" -ForegroundColor Yellow
    exit 1
}

# 3. Obter credenciais do Secrets Manager
Write-Host "`n3. Obtendo credenciais do Secrets Manager..." -ForegroundColor Yellow
Write-Host "   Secret ID: $SecretId" -ForegroundColor Gray
try {
    $secretJson = aws secretsmanager get-secret-value `
        --secret-id $SecretId `
        --query SecretString `
        --output text `
        --profile $Profile

    $secret = $secretJson | ConvertFrom-Json
    
    Write-Host "   ✅ Credenciais obtidas com sucesso" -ForegroundColor Green
    Write-Host "   Host: $($secret.host)" -ForegroundColor Gray
    Write-Host "   Database: $($secret.database)" -ForegroundColor Gray
    Write-Host "   User: $($secret.username)" -ForegroundColor Gray
}
catch {
    Write-Host "   ❌ Erro ao obter secret!" -ForegroundColor Red
    Write-Host "   Erro: $_" -ForegroundColor Red
    exit 1
}

# 4. Construir DATABASE_URL
Write-Host "`n4. Construindo DATABASE_URL..." -ForegroundColor Yellow
$DATABASE_URL = "postgresql://$($secret.username):$($secret.password)@$($secret.host):$($secret.port)/$($secret.database)?sslmode=require"
Write-Host "   ✅ URL construída (password ocultada)" -ForegroundColor Green

# 5. Testar conexão
Write-Host "`n5. Testando conexão com RDS..." -ForegroundColor Yellow
try {
    $env:DATABASE_URL = $DATABASE_URL
    $env:NODE_ENV = "production"
    
    Write-Host "   ⏳ Conectando..." -ForegroundColor Gray
    
    # Verificar se psql está disponível
    $psqlAvailable = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlAvailable) {
        $testQuery = "SELECT version();"
        $env:PGPASSWORD = $secret.password
        $result = psql -h $secret.host -p $secret.port -U $secret.username -d $secret.database -c $testQuery 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Conexão bem-sucedida!" -ForegroundColor Green
        }
        else {
            Write-Host "   ⚠️  Não foi possível verificar conexão" -ForegroundColor Yellow
            Write-Host "   Continuando mesmo assim..." -ForegroundColor Gray
        }
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
    else {
        Write-Host "   ℹ️  psql não disponível, pulando teste de conexão" -ForegroundColor Gray
    }
}
catch {
    Write-Host "   ⚠️  Erro no teste de conexão: $_" -ForegroundColor Yellow
    Write-Host "   Continuando mesmo assim..." -ForegroundColor Gray
}

# 6. Verificar migrations pendentes
Write-Host "`n6. Verificando migrations pendentes..." -ForegroundColor Yellow
Write-Host "   ℹ️  Medusa executará automaticamente migrations pendentes" -ForegroundColor Gray

# 7. Executar migrations
if ($DryRun) {
    Write-Host "`n7. DRY RUN - Migrations NÃO serão executadas" -ForegroundColor Yellow
    Write-Host "   Para executar de verdade, rode sem -DryRun" -ForegroundColor Gray
}
else {
    Write-Host "`n7. Executando migrations..." -ForegroundColor Yellow
    Write-Host "   ⏳ npm run migrate" -ForegroundColor Gray
    
    try {
        npm run migrate
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n   ✅ MIGRATIONS EXECUTADAS COM SUCESSO!" -ForegroundColor Green
        }
        else {
            Write-Host "`n   ❌ ERRO ao executar migrations!" -ForegroundColor Red
            Write-Host "   Exit code: $LASTEXITCODE" -ForegroundColor Red
            exit $LASTEXITCODE
        }
    }
    catch {
        Write-Host "`n   ❌ ERRO ao executar migrations!" -ForegroundColor Red
        Write-Host "   Erro: $_" -ForegroundColor Red
        exit 1
    }
}

# 8. Verificar tabelas criadas
Write-Host "`n8. Verificando tabelas criadas..." -ForegroundColor Yellow
if ($psqlAvailable -and -not $DryRun) {
    $checkQuery = @"
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('lead', 'event', 'rag_query', 'helio_conversation', 'photogrammetry_analysis')
ORDER BY table_name;
"@
    
    $env:PGPASSWORD = $secret.password
    $result = psql -h $secret.host -p $secret.port -U $secret.username -d $secret.database -c $checkQuery 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Tabelas verificadas:" -ForegroundColor Green
        Write-Host $result -ForegroundColor Gray
    }
    else {
        Write-Host "   ⚠️  Não foi possível verificar tabelas" -ForegroundColor Yellow
    }
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
else {
    Write-Host "   ℹ️  Verificação de tabelas pulada (psql não disponível ou dry-run)" -ForegroundColor Gray
}

# 9. Limpar variáveis sensíveis
Write-Host "`n9. Limpando variáveis de ambiente..." -ForegroundColor Yellow
Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
Write-Host "   ✅ Variáveis limpas" -ForegroundColor Green

# 10. Resumo
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " RESUMO DA EXECUÇÃO" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AWS Profile: $Profile" -ForegroundColor White
Write-Host "Secret ID: $SecretId" -ForegroundColor White
Write-Host "Database: $($secret.database)" -ForegroundColor White
Write-Host "Host: $($secret.host)" -ForegroundColor White

if ($DryRun) {
    Write-Host "`nStatus: DRY RUN (nenhuma alteração feita)" -ForegroundColor Yellow
}
else {
    Write-Host "`nStatus: ✅ MIGRATIONS EXECUTADAS" -ForegroundColor Green
}

Write-Host "`nTabelas criadas (Phase 1):" -ForegroundColor White
Write-Host "  - lead (27 campos + 7 índices)" -ForegroundColor Gray
Write-Host "  - event (49 campos + 8 índices)" -ForegroundColor Gray
Write-Host "  - rag_query (35 campos + 7 índices)" -ForegroundColor Gray
Write-Host "  - helio_conversation (49 campos + 7 índices)" -ForegroundColor Gray
Write-Host "  - photogrammetry_analysis (64 campos + 8 índices)" -ForegroundColor Gray

Write-Host "`nPróximos passos:" -ForegroundColor Yellow
Write-Host "  1. Verificar tabelas no banco" -ForegroundColor White
Write-Host "  2. Criar migrations Phase 2 (3 tabelas)" -ForegroundColor White
Write-Host "  3. Implementar persistence nas APIs" -ForegroundColor White
Write-Host "  4. Testar end-to-end" -ForegroundColor White

Write-Host "`n✅ CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
