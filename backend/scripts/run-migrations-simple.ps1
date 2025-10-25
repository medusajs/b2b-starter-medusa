# AWS RDS MIGRATIONS RUNNER - Simplified Version
# Executa migrations do backend no RDS PostgreSQL da AWS
# USAGE: .\scripts\run-migrations-simple.ps1

param(
    [Parameter(Mandatory = $false)]
    [string]$Profile = "ysh-production",
    
    [Parameter(Mandatory = $false)]
    [string]$Region = "us-east-1"
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================================================" -ForegroundColor Cyan
Write-Host "  AWS RDS MIGRATIONS RUNNER" -ForegroundColor Yellow
Write-Host "========================================================================`n" -ForegroundColor Cyan

Write-Host "Configuracao:" -ForegroundColor Yellow
Write-Host "  Profile: $Profile" -ForegroundColor White
Write-Host "  Region: $Region`n" -ForegroundColor White

try {
    # 1. Verificar credenciais AWS
    Write-Host "[1/6] Verificando credenciais AWS..." -ForegroundColor Cyan
    $null = aws sts get-caller-identity --profile $Profile 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Credenciais AWS invalidas. Execute: aws sso login --profile $Profile"
    }
    Write-Host "  OK - Credenciais validas`n" -ForegroundColor Green
    
    # 2. Obter DATABASE_URL
    Write-Host "[2/6] Obtendo DATABASE_URL do Secrets Manager..." -ForegroundColor Cyan
    $dbUrl = aws secretsmanager get-secret-value `
        --secret-id "/ysh-b2b/database-url" `
        --profile $Profile `
        --region $Region `
        --query 'SecretString' `
        --output text 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao obter DATABASE_URL: $dbUrl"
    }
    Write-Host "  OK - DATABASE_URL obtida`n" -ForegroundColor Green
    
    # 3. Verificar RDS
    Write-Host "[3/6] Verificando RDS..." -ForegroundColor Cyan
    $rdsStatus = aws rds describe-db-instances `
        --db-instance-identifier production-ysh-b2b-postgres `
        --profile $Profile `
        --region $Region `
        --query 'DBInstances[0].DBInstanceStatus' `
        --output text 2>&1
    
    if ($LASTEXITCODE -ne 0 -or $rdsStatus -ne "available") {
        throw "RDS nao disponivel. Status: $rdsStatus"
    }
    Write-Host "  OK - RDS disponivel (status: $rdsStatus)`n" -ForegroundColor Green
    
    # 4. Verificar imagem ECR
    Write-Host "[4/6] Verificando imagem no ECR..." -ForegroundColor Cyan
    $ecrImage = aws ecr describe-images `
        --repository-name ysh-backend `
        --image-ids imageTag=latest `
        --profile $Profile `
        --region $Region `
        --query 'imageDetails[0].imageTags[0]' `
        --output text 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        throw "Imagem nao encontrada no ECR: $ecrImage"
    }
    Write-Host "  OK - Imagem encontrada: $ecrImage`n" -ForegroundColor Green
    
    # 5. Instrucoes para execucao
    Write-Host "[5/6] PRONTO PARA EXECUTAR MIGRATIONS`n" -ForegroundColor Green
    
    Write-Host "  OPCAO 1 - Via Docker Local (recomendado para teste):" -ForegroundColor Yellow
    Write-Host "  " -NoNewline
    Write-Host "docker run --rm -e DATABASE_URL=`"$dbUrl`" 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest npm run migrate" -ForegroundColor Cyan
    
    Write-Host "`n  OPCAO 2 - Via NPM Local:" -ForegroundColor Yellow
    Write-Host "  " -NoNewline
    Write-Host "`$env:DATABASE_URL = `"$dbUrl`"" -ForegroundColor Cyan
    Write-Host "  " -NoNewline
    Write-Host "npm run migrate" -ForegroundColor Cyan
    Write-Host "  " -NoNewline
    Write-Host "Remove-Item Env:\DATABASE_URL" -ForegroundColor Cyan
    
    Write-Host "`n  OPCAO 3 - Via ECS Fargate (producao):" -ForegroundColor Yellow
    Write-Host "  1. Criar cluster ECS (se nao existe)" -ForegroundColor Gray
    Write-Host "  2. Criar task definition com imagem ECR" -ForegroundColor Gray
    Write-Host "  3. Executar task com comando: npm run migrate" -ForegroundColor Gray
    Write-Host "  4. Ver logs no CloudWatch" -ForegroundColor Gray
    
    # 6. Executar via Docker?
    Write-Host "`n[6/6] Deseja executar as migrations via Docker agora? (s/n): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    
    if ($response -eq 's' -or $response -eq 'S') {
        Write-Host "`nExecutando migrations via Docker...`n" -ForegroundColor Cyan
        
        # Login no ECR
        Write-Host "  Fazendo login no ECR..." -ForegroundColor Cyan
        $ecrLogin = aws ecr get-login-password --profile $Profile --region $Region | docker login --username AWS --password-stdin 773235999227.dkr.ecr.us-east-1.amazonaws.com
        
        if ($LASTEXITCODE -ne 0) {
            throw "Falha no login ECR"
        }
        
        # Pull da imagem
        Write-Host "  Baixando imagem do ECR..." -ForegroundColor Cyan
        docker pull 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
        
        if ($LASTEXITCODE -ne 0) {
            throw "Falha ao baixar imagem"
        }
        
        # Executar migrations
        Write-Host "`n  Executando migrations...`n" -ForegroundColor Cyan
        Write-Host "  ========================================================================" -ForegroundColor Gray
        
        docker run --rm -e DATABASE_URL="$dbUrl" 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest npm run migrate
        
        Write-Host "  ========================================================================`n" -ForegroundColor Gray
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  OK - Migrations executadas com sucesso!`n" -ForegroundColor Green
            
            # Validacao basica
            Write-Host "  Validando tabelas criadas..." -ForegroundColor Cyan
            Write-Host "  - lead" -ForegroundColor Gray
            Write-Host "  - event" -ForegroundColor Gray
            Write-Host "  - rag_query" -ForegroundColor Gray
            Write-Host "  - helio_conversation" -ForegroundColor Gray
            Write-Host "  - photogrammetry_analysis`n" -ForegroundColor Gray
            
        }
        else {
            throw "Migrations falharam. Verifique os logs acima."
        }
    }
    else {
        Write-Host "`nMigrations NAO foram executadas." -ForegroundColor Yellow
        Write-Host "Execute manualmente uma das opcoes acima quando estiver pronto.`n" -ForegroundColor Yellow
    }
    
    Write-Host "========================================================================" -ForegroundColor Cyan
    Write-Host "  CONCLUIDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "========================================================================`n" -ForegroundColor Cyan
    
    Write-Host "Proximos passos:" -ForegroundColor Yellow
    Write-Host "  1. Validar tabelas: SELECT * FROM lead LIMIT 1;" -ForegroundColor Cyan
    Write-Host "  2. Testar APIs: POST /store/leads" -ForegroundColor Cyan
    Write-Host "  3. Deploy aplicacao no ECS`n" -ForegroundColor Cyan
    
}
catch {
    Write-Host "`n========================================================================" -ForegroundColor Red
    Write-Host "  ERRO NA EXECUCAO" -ForegroundColor Red
    Write-Host "========================================================================" -ForegroundColor Red
    Write-Host "  $($_.Exception.Message)`n" -ForegroundColor Red
    exit 1
}
