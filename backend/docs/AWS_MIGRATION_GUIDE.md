# AWS RDS Database Migration Guide

# Execute as migrations do Database 360° no banco PostgreSQL da AWS

## 🎯 Objetivo

Este script conecta ao RDS PostgreSQL na AWS e executa as migrations criadas para o Database 360°.

## 📋 Pré-requisitos

1. **AWS RDS PostgreSQL configurado**
   - Instância RDS ativa
   - Security Group permitindo acesso do seu IP
   - Credenciais válidas

2. **Credenciais AWS**
   - DATABASE_URL com hostname RDS
   - Ou variáveis individuais: HOST, PORT, USER, PASSWORD, DATABASE

3. **Medusa CLI instalado**
   - `npm install` executado
   - Node.js 20+

## 🔧 Configuração

### Opção 1: Usar variáveis de ambiente

```powershell
# Configurar DATABASE_URL para RDS
$env:DATABASE_URL = "postgresql://username:password@ysh-db-prod.xxxxx.us-east-1.rds.amazonaws.com:5432/medusa"
$env:NODE_ENV = "production"

# Executar migration
npm run migrate
```

### Opção 2: Usar arquivo .env.production

```bash
# .env.production
DATABASE_URL=postgresql://username:password@ysh-db-prod.xxxxx.us-east-1.rds.amazonaws.com:5432/medusa
NODE_ENV=production
DATABASE_SSL=true
```

```powershell
# Copiar .env.production para .env temporariamente
Copy-Item .env.production .env -Force

# Executar migration
npm run migrate

# Restaurar .env original
Copy-Item .env.development .env -Force
```

### Opção 3: Usar AWS Secrets Manager (Recomendado)

```powershell
# Carregar secrets da AWS
$SECRET = aws secretsmanager get-secret-value `
  --secret-id ysh-backend/production/database `
  --query SecretString `
  --output text `
  --profile ysh-production | ConvertFrom-Json

# Construir DATABASE_URL
$DATABASE_URL = "postgresql://$($SECRET.username):$($SECRET.password)@$($SECRET.host):$($SECRET.port)/$($SECRET.database)"

# Executar com variável temporária
$env:DATABASE_URL = $DATABASE_URL
$env:NODE_ENV = "production"
npm run migrate
```

## 🚀 Execução Rápida

### Script PowerShell Completo

Salve como `scripts/run-aws-migrations.ps1`:

```powershell
<#
.SYNOPSIS
    Executa migrations do Medusa no RDS AWS
.DESCRIPTION
    Conecta ao RDS PostgreSQL e executa todas as migrations pendentes
.PARAMETER Profile
    AWS Profile a usar (default: ysh-production)
.PARAMETER SecretId
    Secret Manager ID (default: ysh-backend/production/database)
.PARAMETER DryRun
    Se true, apenas mostra as migrations pendentes sem executar
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
} catch {
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
} catch {
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
} catch {
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
    
    # Teste simples de conexão via psql (se disponível)
    Write-Host "   ⏳ Conectando..." -ForegroundColor Gray
    
    # Se psql não estiver disponível, pular teste
    $psqlAvailable = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlAvailable) {
        $testQuery = "SELECT version();"
        $result = $env:DATABASE_URL | psql -c $testQuery 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Conexão bem-sucedida!" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Não foi possível verificar conexão" -ForegroundColor Yellow
            Write-Host "   Continuando mesmo assim..." -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  psql não disponível, pulando teste de conexão" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Erro no teste de conexão: $_" -ForegroundColor Yellow
    Write-Host "   Continuando mesmo assim..." -ForegroundColor Gray
}

# 6. Verificar migrations pendentes
Write-Host "`n6. Verificando migrations pendentes..." -ForegroundColor Yellow
try {
    # Medusa não tem comando para listar migrations pendentes, então vamos direto
    Write-Host "   ℹ️  Medusa executará automaticamente migrations pendentes" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️  Não foi possível verificar migrations" -ForegroundColor Yellow
}

# 7. Executar migrations
if ($DryRun) {
    Write-Host "`n7. DRY RUN - Migrations NÃO serão executadas" -ForegroundColor Yellow
    Write-Host "   Para executar de verdade, rode sem -DryRun" -ForegroundColor Gray
} else {
    Write-Host "`n7. Executando migrations..." -ForegroundColor Yellow
    Write-Host "   ⏳ npm run migrate" -ForegroundColor Gray
    
    try {
        npm run migrate
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n   ✅ MIGRATIONS EXECUTADAS COM SUCESSO!" -ForegroundColor Green
        } else {
            Write-Host "`n   ❌ ERRO ao executar migrations!" -ForegroundColor Red
            Write-Host "   Exit code: $LASTEXITCODE" -ForegroundColor Red
            exit $LASTEXITCODE
        }
    } catch {
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
    
    $result = $env:DATABASE_URL | psql -c $checkQuery 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Tabelas verificadas:" -ForegroundColor Green
        Write-Host $result -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  Não foi possível verificar tabelas" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Verificação de tabelas pulada (psql não disponível ou dry-run)" -ForegroundColor Yellow
}

# 9. Limpar variáveis sensíveis
Write-Host "`n9. Limpando variáveis de ambiente..." -ForegroundColor Yellow
Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
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
    Write-Host "Status: DRY RUN (nenhuma alteração feita)" -ForegroundColor Yellow
} else {
    Write-Host "Status: ✅ MIGRATIONS EXECUTADAS" -ForegroundColor Green
}

Write-Host "`nTabelas criadas (Phase 1):" -ForegroundColor White
Write-Host "  - lead" -ForegroundColor Gray
Write-Host "  - event" -ForegroundColor Gray
Write-Host "  - rag_query" -ForegroundColor Gray
Write-Host "  - helio_conversation" -ForegroundColor Gray
Write-Host "  - photogrammetry_analysis" -ForegroundColor Gray

Write-Host "`n✅ CONCLUÍDO!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
```

### Executar o Script

```powershell
# Ir para pasta do backend
cd C:\Users\fjuni\ysh_medusa\ysh-store\backend

# Dar permissão de execução
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Executar migrations (produção)
.\scripts\run-aws-migrations.ps1

# Ou dry-run primeiro (sem executar)
.\scripts\run-aws-migrations.ps1 -DryRun

# Ou em ambiente diferente
.\scripts\run-aws-migrations.ps1 -Profile ysh-dev -SecretId ysh-backend/dev/database
```

## 📊 Verificação Pós-Migration

### Conectar ao RDS via psql

```powershell
# Obter DATABASE_URL
$SECRET = aws secretsmanager get-secret-value `
  --secret-id ysh-backend/production/database `
  --query SecretString `
  --output text `
  --profile ysh-production | ConvertFrom-Json

$DATABASE_URL = "postgresql://$($SECRET.username):$($SECRET.password)@$($SECRET.host):$($SECRET.port)/$($SECRET.database)?sslmode=require"

# Conectar
psql $DATABASE_URL
```

### Queries de Verificação

```sql
-- 1. Listar todas as tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verificar tabelas Phase 1 criadas
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('lead', 'event', 'rag_query', 'helio_conversation', 'photogrammetry_analysis')
ORDER BY table_name;

-- 3. Verificar índices criados
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('lead', 'event', 'rag_query', 'helio_conversation', 'photogrammetry_analysis')
ORDER BY tablename, indexname;

-- 4. Verificar histórico de migrations
SELECT * FROM mikro_orm_migrations ORDER BY executed_at DESC LIMIT 10;

-- 5. Testar insert em Lead
INSERT INTO lead (
    id, name, email, phone, interest_type, source, 
    session_id, created_at, updated_at
)
VALUES (
    'lead_test_aws_001', 
    'Teste AWS', 
    'teste@aws.com', 
    '11999999999', 
    'solar', 
    'website',
    'sess_aws_test',
    NOW(),
    NOW()
);

-- 6. Verificar insert
SELECT * FROM lead WHERE id = 'lead_test_aws_001';

-- 7. Limpar teste
DELETE FROM lead WHERE id = 'lead_test_aws_001';
```

## 🔐 Segurança

### Boas Práticas

1. **NUNCA commite credenciais**
   - Use AWS Secrets Manager
   - Rotacione senhas regularmente

2. **Security Groups**
   - Permita apenas IPs necessários
   - Use VPN ou bastion host para acesso produção

3. **SSL/TLS**
   - Sempre use `sslmode=require` na connection string
   - Verifique certificado RDS

4. **Audit Trail**
   - Todas migrations são logadas em `mikro_orm_migrations`
   - CloudTrail registra acessos ao Secrets Manager

## 🚨 Troubleshooting

### Erro: "Connection refused"

```powershell
# Verificar Security Group permite seu IP
aws ec2 describe-security-groups `
  --group-ids sg-xxxxx `
  --profile ysh-production

# Adicionar seu IP ao Security Group
$MY_IP = (Invoke-WebRequest -Uri "https://api.ipify.org").Content
aws ec2 authorize-security-group-ingress `
  --group-id sg-xxxxx `
  --protocol tcp `
  --port 5432 `
  --cidr "$MY_IP/32" `
  --profile ysh-production
```

### Erro: "password authentication failed"

```powershell
# Verificar credenciais no Secrets Manager
aws secretsmanager get-secret-value `
  --secret-id ysh-backend/production/database `
  --profile ysh-production

# Rotacionar senha se necessário
aws secretsmanager rotate-secret `
  --secret-id ysh-backend/production/database `
  --profile ysh-production
```

### Erro: "SSL connection required"

```powershell
# Adicionar sslmode=require na URL
$DATABASE_URL = "${DATABASE_URL}?sslmode=require"
```

### Erro: "Migration already executed"

```sql
-- Verificar histórico
SELECT * FROM mikro_orm_migrations ORDER BY executed_at DESC;

-- Se migration foi executada parcialmente, pode precisar reverter manualmente
-- CUIDADO: Isso deleta dados!
DROP TABLE IF EXISTS lead CASCADE;
DROP TABLE IF EXISTS event CASCADE;
-- ... etc

-- Então deletar entrada da tabela de migrations
DELETE FROM mikro_orm_migrations WHERE name = 'Migration20251013140000';

-- Re-executar migration
npm run migrate
```

## 📚 Próximos Passos

Após executar as migrations Phase 1, você precisa:

1. **Criar migrations Phase 2**
   - financing_simulation
   - solar_viability_analysis
   - catalog_access_log

2. **Implementar persistence nas APIs**
   - `/store/leads` → save to Lead
   - `/store/events` → save to Event
   - `/store/rag/*` → save to RagQuery + HelioConversation
   - `/store/photogrammetry` → save to PhotogrammetryAnalysis

3. **Testar end-to-end**
   - POST dados via API
   - Verificar salvamento no banco
   - Consultar via admin ou API

---

**Documentação Relacionada:**

- `docs/DATABASE_360_FINAL_SUMMARY.md` - Resumo executivo
- `docs/DATABASE_360_IMPLEMENTATION_STATUS.md` - Status técnico
- `docs/API_DATABASE_AUDIT_360.md` - Análise completa das APIs

**Última atualização:** 2025-01-13
**Autor:** GitHub Copilot
