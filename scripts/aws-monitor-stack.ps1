# ==========================================
# Monitor CloudFormation Stack Progress
# Uso: .\scripts\aws-monitor-stack.ps1
# ==========================================

param(
    [string]$AwsProfile = "ysh-production",
    [string]$Region = "us-east-1",
    [string]$StackName = "ysh-b2b-infrastructure",
    [int]$RefreshInterval = 30
)

$Host.UI.RawUI.WindowTitle = "CloudFormation Stack Monitor"

function Get-StackStatus {
    $stack = (aws cloudformation describe-stacks `
            --stack-name $StackName `
            --profile $AwsProfile `
            --region $Region `
            --output json 2>&1 | ConvertFrom-Json).Stacks[0]
    
    return $stack
}

function Get-StackResources {
    $resources = (aws cloudformation describe-stack-resources `
            --stack-name $StackName `
            --profile $AwsProfile `
            --region $Region `
            --output json | ConvertFrom-Json).StackResources
    
    return $resources
}

Write-Host "`n" + "="*80 -ForegroundColor Blue
Write-Host "  CLOUDFORMATION STACK MONITOR" -ForegroundColor White
Write-Host "="*80 -ForegroundColor Blue
Write-Host "`nStack: $StackName" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host "Refresh: ${RefreshInterval}s`n" -ForegroundColor Cyan

$iteration = 0

while ($true) {
    $iteration++
    Clear-Host
    
    Write-Host "`n" + "="*80 -ForegroundColor Blue
    Write-Host "  CLOUDFORMATION MONITOR - Iteration $iteration" -ForegroundColor White
    Write-Host "="*80 -ForegroundColor Blue
    Write-Host "Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
    
    try {
        $stack = Get-StackStatus
        $status = $stack.StackStatus
        
        Write-Host "`nStack Status: " -NoNewline
        
        if ($status -eq "CREATE_COMPLETE") {
            Write-Host $status -ForegroundColor Green
        }
        elseif ($status -eq "CREATE_IN_PROGRESS") {
            Write-Host $status -ForegroundColor Yellow
        }
        elseif ($status -like "*FAILED*" -or $status -like "*ROLLBACK*") {
            Write-Host $status -ForegroundColor Red
        }
        else {
            Write-Host $status -ForegroundColor Cyan
        }
        
        Write-Host "`nCreated: $($stack.CreationTime)" -ForegroundColor Gray
        
        if ($stack.LastUpdatedTime) {
            Write-Host "Updated: $($stack.LastUpdatedTime)" -ForegroundColor Gray
        }
        
        # Resources status
        Write-Host "`n" + "-"*80 -ForegroundColor Gray
        Write-Host "RESOURCES STATUS" -ForegroundColor Cyan
        Write-Host "-"*80 -ForegroundColor Gray
        
        $resources = Get-StackResources
        $grouped = $resources | Group-Object ResourceStatus
        
        foreach ($group in $grouped) {
            $count = $group.Count
            $status = $group.Name
            
            $color = "White"
            $icon = "?"
            
            if ($status -like "*COMPLETE*") {
                $color = "Green"
                $icon = "OK"
            }
            elseif ($status -like "*IN_PROGRESS*") {
                $color = "Yellow"
                $icon = ".."
            }
            elseif ($status -like "*FAILED*") {
                $color = "Red"
                $icon = "!!"
            }
            
            Write-Host "[$icon] " -NoNewline -ForegroundColor $color
            Write-Host "$status : $count resources" -ForegroundColor $color
        }
        
        # Critical resources detail
        Write-Host "`n" + "-"*80 -ForegroundColor Gray
        Write-Host "CRITICAL RESOURCES" -ForegroundColor Cyan
        Write-Host "-"*80 -ForegroundColor Gray
        
        $critical = @(
            "AWS::RDS::DBInstance",
            "AWS::ElastiCache::CacheCluster",
            "AWS::ECS::Cluster",
            "AWS::ElasticLoadBalancingV2::LoadBalancer"
        )
        
        foreach ($type in $critical) {
            $resource = $resources | Where-Object { $_.ResourceType -eq $type }
            if ($resource) {
                $color = "White"
                $icon = "?"
                
                if ($resource.ResourceStatus -like "*COMPLETE*") {
                    $color = "Green"
                    $icon = "OK"
                }
                elseif ($resource.ResourceStatus -like "*IN_PROGRESS*") {
                    $color = "Yellow"
                    $icon = ".."
                }
                elseif ($resource.ResourceStatus -like "*FAILED*") {
                    $color = "Red"
                    $icon = "!!"
                }
                
                $shortType = $type -replace "AWS::", "" -replace "::", "-"
                Write-Host "[$icon] " -NoNewline -ForegroundColor $color
                Write-Host "$shortType : $($resource.ResourceStatus)" -ForegroundColor $color
            }
        }
        
        # Check if complete
        if ($status -eq "CREATE_COMPLETE") {
            Write-Host "`n" + "="*80 -ForegroundColor Green
            Write-Host "  STACK CREATE COMPLETE!" -ForegroundColor White
            Write-Host "="*80 -ForegroundColor Green
            Write-Host "`nProximo passo: .\scripts\aws-deploy-post-stack.ps1`n" -ForegroundColor Cyan
            break
        }
        elseif ($status -like "*FAILED*" -or $status -like "*ROLLBACK*") {
            Write-Host "`n" + "="*80 -ForegroundColor Red
            Write-Host "  STACK CREATION FAILED!" -ForegroundColor White
            Write-Host "="*80 -ForegroundColor Red
            
            # Show failure reason
            $events = (aws cloudformation describe-stack-events `
                    --stack-name $StackName `
                    --profile $AwsProfile `
                    --region $Region `
                    --max-items 10 `
                    --query "StackEvents[?ResourceStatus=='CREATE_FAILED'].[ResourceType,ResourceStatusReason]" `
                    --output json | ConvertFrom-Json)
            
            if ($events) {
                Write-Host "`nFailure Reasons:" -ForegroundColor Yellow
                foreach ($event in $events) {
                    Write-Host "  * $($event[0]): $($event[1])" -ForegroundColor Red
                }
            }
            
            break
        }
        
        Write-Host "`n" + "="*80 -ForegroundColor Gray
        Write-Host "Aguardando ${RefreshInterval}s... (Ctrl+C para parar)" -ForegroundColor Gray
        
        Start-Sleep -Seconds $RefreshInterval
    }
    catch {
        Write-Host "`nErro ao consultar stack: $_" -ForegroundColor Red
        Write-Host "Tentando novamente em ${RefreshInterval}s..." -ForegroundColor Yellow
        Start-Sleep -Seconds $RefreshInterval
    }
}
