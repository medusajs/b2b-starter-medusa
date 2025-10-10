# ==========================================
# AWS Stack Creation - Terminal Dedicado
# Uso: .\scripts\aws-deploy-create.ps1
# ==========================================

param(
    [string]$StackName = "ysh-b2b-infrastructure",
    [string]$AwsProfile = "ysh-production",
    [string]$Region = "us-east-1",
    [string]$Environment = "production"
)

$Host.UI.RawUI.WindowTitle = "AWS Stack Creation - $StackName"

Write-Host "`n" + "="*80 -ForegroundColor Green
Write-Host "  AWS CLOUDFORMATION STACK CREATION" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Green

Write-Host "`n📋 Configuração:" -ForegroundColor Cyan
Write-Host "  Stack: $StackName" -ForegroundColor White
Write-Host "  Environment: $Environment" -ForegroundColor White
Write-Host "  Region: $Region" -ForegroundColor White
Write-Host "  Profile: $AwsProfile" -ForegroundColor White

# Verificar se stack já existe
Write-Host "`n🔍 Verificando se stack existe..." -ForegroundColor Yellow
try {
    $existing = aws cloudformation describe-stacks `
        --stack-name $StackName `
        --profile $AwsProfile `
        --region $Region `
        --output json 2>&1
    
    if ($existing -notmatch "does not exist") {
        $stack = ($existing | ConvertFrom-Json).Stacks[0]
        Write-Host "⚠️  Stack já existe com status: $($stack.StackStatus)" -ForegroundColor Yellow
        
        if ($stack.StackStatus -eq "DELETE_IN_PROGRESS") {
            Write-Host "`n⏳ Stack está sendo deletado. Aguarde a conclusão." -ForegroundColor Yellow
            Write-Host "   Use .\scripts\aws-deploy-monitor.ps1 para acompanhar`n" -ForegroundColor Gray
            exit 1
        }
        
        Write-Host "`n❌ Delete o stack existente antes de criar um novo`n" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "✅ Stack não existe - pronto para criar" -ForegroundColor Green
}

# Validar template
Write-Host "`n✔️  Validando template CloudFormation..." -ForegroundColor Yellow
$validation = aws cloudformation validate-template `
    --template-body file://aws/cloudformation-infrastructure.yml `
    --profile $AwsProfile `
    --region $Region `
    --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Template inválido!" -ForegroundColor Red
    Write-Host $validation -ForegroundColor Red
    exit 1
}

Write-Host "✅ Template válido" -ForegroundColor Green

# Criar stack
Write-Host "`n🚀 Criando CloudFormation Stack..." -ForegroundColor Cyan
Write-Host "`nRecursos que serao criados:" -ForegroundColor Yellow
Write-Host "  * VPC + Subnets" -ForegroundColor Gray
Write-Host "  * Internet Gateway + Route Tables" -ForegroundColor Gray
Write-Host "  * Security Groups" -ForegroundColor Gray
Write-Host "  * RDS PostgreSQL 15.14" -ForegroundColor Gray
Write-Host "  * ElastiCache Redis" -ForegroundColor Gray
Write-Host "  * ECS Cluster" -ForegroundColor Gray
Write-Host "  * Application Load Balancer" -ForegroundColor Gray

Write-Host "`nTempo estimado: 12-15 minutos`n" -ForegroundColor Yellow

$result = aws cloudformation create-stack `
    --stack-name $StackName `
    --template-body file://aws/cloudformation-infrastructure.yml `
    --parameters ParameterKey=Environment, ParameterValue=$Environment `
    --capabilities CAPABILITY_IAM `
    --profile $AwsProfile `
    --region $Region `
    --output json 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Erro ao criar stack!" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    exit 1
}

$stackInfo = $result | ConvertFrom-Json
Write-Host "✅ Stack criado com sucesso!" -ForegroundColor Green
Write-Host "`nStack ID: $($stackInfo.StackId)" -ForegroundColor Gray

Write-Host "`n" + "="*80 -ForegroundColor Green
Write-Host "  PROXIMO PASSO" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Green
Write-Host "`nAbra um novo terminal e execute:" -ForegroundColor Cyan
Write-Host "   .\scripts\aws-deploy-monitor.ps1" -ForegroundColor White
Write-Host "`nPara monitorar o progresso da criacao do stack`n" -ForegroundColor Gray
