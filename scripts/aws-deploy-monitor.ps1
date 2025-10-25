# ==========================================
# AWS Deployment Monitor - Terminal Dedicado
# Uso: .\scripts\aws-deploy-monitor.ps1
# ==========================================

param(
    [string]$StackName = "ysh-b2b-infrastructure",
    [string]$AwsProfile = "ysh-production",
    [string]$Region = "us-east-1",
    [int]$CheckInterval = 45
)

$Host.UI.RawUI.WindowTitle = "AWS CloudFormation Monitor - $StackName"

Write-Host "`n" + "="*80 -ForegroundColor Cyan
Write-Host "  AWS CLOUDFORMATION DEPLOYMENT MONITOR" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Cyan
Write-Host "`nStack: $StackName" -ForegroundColor White
Write-Host "Region: $Region" -ForegroundColor Gray
Write-Host "Check Interval: ${CheckInterval}s" -ForegroundColor Gray
Write-Host "`n" + "="*80 -ForegroundColor Cyan

$iteration = 0
$startTime = Get-Date

while ($true) {
    $iteration++
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)
    
    Write-Host "`n📊 Check #$iteration - $(Get-Date -Format 'HH:mm:ss') (${elapsed}m elapsed)" -ForegroundColor Cyan
    Write-Host "-"*80 -ForegroundColor Gray
    
    try {
        $stackInfo = aws cloudformation describe-stacks `
            --stack-name $StackName `
            --profile $AwsProfile `
            --region $Region `
            --output json 2>&1
        
        if ($stackInfo -match "does not exist") {
            Write-Host "❌ Stack não existe" -ForegroundColor Red
            Write-Host "`nCriar novo stack com:" -ForegroundColor Yellow
            Write-Host ".\scripts\aws-deploy-create.ps1`n" -ForegroundColor White
            Start-Sleep -Seconds 30
            continue
        }
        
        $stack = ($stackInfo | ConvertFrom-Json).Stacks[0]
        $status = $stack.StackStatus
        
        $color = switch -Wildcard ($status) {
            "*COMPLETE*" { "Green" }
            "*PROGRESS*" { "Cyan" }
            "*FAILED*" { "Red" }
            "*ROLLBACK*" { "Red" }
            default { "Yellow" }
        }
        
        Write-Host "Status: $status" -ForegroundColor $color
        
        # Progress
        $resources = (aws cloudformation describe-stack-resources `
                --stack-name $StackName `
                --profile $AwsProfile `
                --region $Region `
                --output json | ConvertFrom-Json).StackResources
        
        $total = $resources.Count
        $complete = ($resources | Where-Object { $_.ResourceStatus -eq "CREATE_COMPLETE" }).Count
        $progress = if ($total -gt 0) { [math]::Round(($complete / $total) * 100, 1) } else { 0 }
        
        Write-Host "Progress: $complete/$total resources ($progress%)" -ForegroundColor White
        
        # Recent resources
        Write-Host "`nRecursos recentes:" -ForegroundColor Yellow
        $resources | 
        Sort-Object -Property LastUpdatedTimestamp -Descending |
        Select-Object -First 8 LogicalResourceId, ResourceType, ResourceStatus |
        Format-Table -AutoSize
        
        # Terminal states
        if ($status -eq "CREATE_COMPLETE") {
            Write-Host "`n🎉 STACK CRIADO COM SUCESSO!" -ForegroundColor Green
            Write-Host "Tempo total: ${elapsed} minutos`n" -ForegroundColor White
            
            # Outputs
            if ($stack.Outputs) {
                Write-Host "📤 Outputs:" -ForegroundColor Yellow
                $stack.Outputs | ForEach-Object {
                    Write-Host "  $($_.OutputKey): $($_.OutputValue)" -ForegroundColor Gray
                }
            }
            
            Write-Host "`n✅ Próximo: Executar .\scripts\aws-deploy-post-stack.ps1`n" -ForegroundColor Green
            break
        }
        elseif ($status -like "*FAILED*" -or $status -like "*ROLLBACK*") {
            Write-Host "`n❌ STACK CREATION FAILED!" -ForegroundColor Red
            
            # Error details
            $events = (aws cloudformation describe-stack-events `
                    --stack-name $StackName `
                    --profile $AwsProfile `
                    --region $Region `
                    --max-items 50 `
                    --output json | ConvertFrom-Json).StackEvents
            
            $failedEvent = $events | 
            Where-Object { 
                $_.ResourceStatusReason -and 
                $_.ResourceStatusReason -notlike "*cancelled*" -and 
                $_.ResourceStatus -like "*FAILED*" 
            } |
            Select-Object -First 1
            
            if ($failedEvent) {
                Write-Host "`n🐛 Root Cause:" -ForegroundColor Yellow
                Write-Host "  Resource: $($failedEvent.LogicalResourceId)" -ForegroundColor White
                Write-Host "  Type: $($failedEvent.ResourceType)" -ForegroundColor Gray
                Write-Host "  Reason: $($failedEvent.ResourceStatusReason)" -ForegroundColor Red
            }
            
            Write-Host "`n⚠️  Verificar erro e tentar novamente`n" -ForegroundColor Yellow
            break
        }
    }
    catch {
        Write-Host "❌ Erro ao consultar stack: $_" -ForegroundColor Red
        Start-Sleep -Seconds 30
        continue
    }
    
    Write-Host "`n⏰ Próxima verificação em $CheckInterval segundos..." -ForegroundColor Gray
    Start-Sleep -Seconds $CheckInterval
}

Write-Host "`n" + "="*80 -ForegroundColor Gray
Write-Host "Monitor encerrado - $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Gray
