# ==========================================
# Validate CloudFormation Stack Outputs
# Uso: .\scripts\aws-validate-stack.ps1
# ==========================================

param(
    [string]$AwsProfile = "ysh-production",
    [string]$Region = "us-east-1",
    [string]$StackName = "ysh-b2b-infrastructure"
)

$Host.UI.RawUI.WindowTitle = "Stack Validation"

Write-Host "`n" + "="*80 -ForegroundColor Blue
Write-Host "  CLOUDFORMATION STACK VALIDATION" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Blue

# Get stack outputs
Write-Host "`nObtenendo outputs do stack..." -ForegroundColor Cyan

try {
    $stack = (aws cloudformation describe-stacks `
            --stack-name $StackName `
            --profile $AwsProfile `
            --region $Region `
            --output json | ConvertFrom-Json).Stacks[0]
    
    if ($stack.StackStatus -ne "CREATE_COMPLETE") {
        Write-Host "Stack status: $($stack.StackStatus)" -ForegroundColor Yellow
        Write-Host "Stack ainda nao esta completo. Aguarde CREATE_COMPLETE." -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Stack Status: CREATE_COMPLETE" -ForegroundColor Green
    
    # Parse outputs
    $outputs = @{}
    $stack.Outputs | ForEach-Object {
        $outputs[$_.OutputKey] = $_.OutputValue
    }
    
    Write-Host "`n" + "="*80 -ForegroundColor Magenta
    Write-Host "  OUTPUTS DISPONIVEIS" -ForegroundColor White
    Write-Host "="*80 -ForegroundColor Magenta
    
    foreach ($key in $outputs.Keys | Sort-Object) {
        Write-Host "`n$key :" -ForegroundColor Cyan
        Write-Host "  $($outputs[$key])" -ForegroundColor White
    }
    
    # Validate critical outputs
    Write-Host "`n" + "="*80 -ForegroundColor Yellow
    Write-Host "  VALIDACAO CRITICA" -ForegroundColor White
    Write-Host "="*80 -ForegroundColor Yellow
    
    $criticalOutputs = @(
        "VPCId",
        "PrivateSubnet1",
        "PrivateSubnet2",
        "ECSSecurityGroup",
        "DatabaseEndpoint",
        "RedisEndpoint",
        "LoadBalancerDNS",
        "LoadBalancerArn"
    )
    
    $allPresent = $true
    
    foreach ($output in $criticalOutputs) {
        if ($outputs.ContainsKey($output)) {
            Write-Host "[OK] $output" -ForegroundColor Green
        }
        else {
            Write-Host "[!!] $output AUSENTE" -ForegroundColor Red
            $allPresent = $false
        }
    }
    
    if ($allPresent) {
        Write-Host "`n" + "="*80 -ForegroundColor Green
        Write-Host "  VALIDACAO COMPLETA - TODOS OS OUTPUTS PRESENTES" -ForegroundColor White
        Write-Host "="*80 -ForegroundColor Green
        
        # Test connectivity
        Write-Host "`n" + "="*80 -ForegroundColor Cyan
        Write-Host "  TESTES DE CONECTIVIDADE" -ForegroundColor White
        Write-Host "="*80 -ForegroundColor Cyan
        
        # ALB
        Write-Host "`nTestando ALB DNS..." -ForegroundColor Cyan
        $albDns = $outputs["LoadBalancerDNS"]
        try {
            $response = Invoke-WebRequest -Uri "http://$albDns" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            Write-Host "[OK] ALB respondendo (Status: $($response.StatusCode))" -ForegroundColor Green
        }
        catch {
            Write-Host "[!!] ALB nao respondeu: $_" -ForegroundColor Yellow
            Write-Host "    (Normal se services ainda nao estiverem rodando)" -ForegroundColor Gray
        }
        
        # Export para uso em outros scripts
        Write-Host "`n" + "="*80 -ForegroundColor Magenta
        Write-Host "  EXPORTANDO VARIAVEIS" -ForegroundColor White
        Write-Host "="*80 -ForegroundColor Magenta
        
        $exportFile = "aws-outputs.json"
        $outputs | ConvertTo-Json | Out-File $exportFile -Encoding UTF8
        Write-Host "`nOutputs salvos em: $exportFile" -ForegroundColor Green
        
        Write-Host "`n" + "="*80 -ForegroundColor Green
        Write-Host "  PROXIMO PASSO" -ForegroundColor White
        Write-Host "="*80 -ForegroundColor Green
        Write-Host "`nExecutar: .\scripts\aws-deploy-post-stack.ps1`n" -ForegroundColor Cyan
    }
    else {
        Write-Host "`n" + "="*80 -ForegroundColor Red
        Write-Host "  VALIDACAO FALHOU - OUTPUTS AUSENTES" -ForegroundColor White
        Write-Host "="*80 -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "`nErro ao validar stack: $_" -ForegroundColor Red
    exit 1
}
