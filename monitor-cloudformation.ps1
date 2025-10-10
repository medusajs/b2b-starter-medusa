# Monitor CloudFormation Stack Progress
param(
    [string]$StackName = "ysh-b2b-infrastructure",
    [string]$Profile = "ysh-production",
    [string]$Region = "us-east-1",
    [int]$IntervalSeconds = 45
)

Write-Host "`n🔍 CloudFormation Stack Monitor" -ForegroundColor Cyan
Write-Host "Stack: $StackName" -ForegroundColor White
Write-Host "Checking every $IntervalSeconds seconds`n" -ForegroundColor Gray
Write-Host "="*80 -ForegroundColor Gray

$iteration = 0
$startTime = Get-Date

while ($true) {
    $iteration++
    $elapsed = [math]::Round(((Get-Date) - $startTime).TotalMinutes, 1)
    
    Write-Host "`n📊 Check #$iteration - $(Get-Date -Format 'HH:mm:ss') (${elapsed}m elapsed)" -ForegroundColor Cyan
    Write-Host "-"*80 -ForegroundColor Gray
    
    try {
        # Get stack status
        $stackInfo = aws cloudformation describe-stacks `
            --stack-name $StackName `
            --profile $Profile `
            --region $Region `
            --output json 2>&1 | ConvertFrom-Json
        
        if ($stackInfo.Stacks) {
            $stack = $stackInfo.Stacks[0]
            $status = $stack.StackStatus
            
            # Color based on status
            $color = switch -Wildcard ($status) {
                "*COMPLETE*" { "Green" }
                "*PROGRESS*" { "Cyan" }
                "*FAILED*" { "Red" }
                "*ROLLBACK*" { "Red" }
                default { "Yellow" }
            }
            
            Write-Host "Status: $status" -ForegroundColor $color
            
            # Get resource progress
            $resources = aws cloudformation describe-stack-resources `
                --stack-name $StackName `
                --profile $Profile `
                --region $Region `
                --output json | ConvertFrom-Json
            
            $total = $resources.StackResources.Count
            $complete = ($resources.StackResources | Where-Object { $_.ResourceStatus -eq "CREATE_COMPLETE" }).Count
            $progress = if ($total -gt 0) { [math]::Round(($complete / $total) * 100, 1) } else { 0 }
            
            Write-Host "Progress: $complete/$total resources ($progress%)" -ForegroundColor White
            
            # Show recent resources
            Write-Host "`nRecent Resources:" -ForegroundColor Yellow
            $resources.StackResources | 
            Sort-Object -Property LastUpdatedTimestamp -Descending |
            Select-Object -First 10 LogicalResourceId, ResourceType, ResourceStatus |
            Format-Table -AutoSize
            
            # Check if done
            if ($status -eq "CREATE_COMPLETE") {
                Write-Host "`n🎉 STACK CREATED SUCCESSFULLY!" -ForegroundColor Green
                Write-Host "Total time: ${elapsed} minutes`n" -ForegroundColor White
                
                # Show outputs
                if ($stack.Outputs) {
                    Write-Host "Outputs:" -ForegroundColor Yellow
                    $stack.Outputs | ForEach-Object {
                        Write-Host "  $($_.OutputKey): $($_.OutputValue)" -ForegroundColor Gray
                    }
                }
                break
            }
            elseif ($status -like "*FAILED*" -or $status -like "*ROLLBACK*") {
                Write-Host "`n❌ STACK CREATION FAILED!" -ForegroundColor Red
                
                # Show error
                $events = aws cloudformation describe-stack-events `
                    --stack-name $StackName `
                    --profile $Profile `
                    --region $Region `
                    --max-items 50 `
                    --output json | ConvertFrom-Json
                
                $failedEvent = $events.StackEvents | 
                Where-Object { $_.ResourceStatusReason -and $_.ResourceStatusReason -notlike "*cancelled*" -and $_.ResourceStatus -like "*FAILED*" } |
                Select-Object -First 1
                
                if ($failedEvent) {
                    Write-Host "`nRoot Cause:" -ForegroundColor Yellow
                    Write-Host "  Resource: $($failedEvent.LogicalResourceId)" -ForegroundColor White
                    Write-Host "  Type: $($failedEvent.ResourceType)" -ForegroundColor Gray
                    Write-Host "  Reason: $($failedEvent.ResourceStatusReason)" -ForegroundColor Red
                }
                break
            }
        }
        else {
            Write-Host "Stack not found or deleted" -ForegroundColor Red
            break
        }
    }
    catch {
        Write-Host "Error querying stack: $_" -ForegroundColor Red
        break
    }
    
    Write-Host "`nNext check in $IntervalSeconds seconds..." -ForegroundColor Gray
    Start-Sleep -Seconds $IntervalSeconds
}

Write-Host "`n" + "="*80 -ForegroundColor Gray
Write-Host "Monitoring complete" -ForegroundColor White
