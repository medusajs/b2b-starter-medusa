# ==========================================
# MONITORING SETUP SCRIPT
# Configures CloudWatch alarms and billing alerts
# ==========================================

param(
    [Parameter(Mandatory = $false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory = $false)]
    [string]$SSOProfile = "ysh-production",
    
    [Parameter(Mandatory = $false)]
    [string]$Region = "us-east-1",
    
    [Parameter(Mandatory = $false)]
    [string]$AlertEmail,
    
    [Parameter(Mandatory = $false)]
    [int]$BillingThreshold = 20,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipBillingAlerts,
    
    [Parameter(Mandatory = $false)]
    [switch]$SkipCloudWatchAlarms
)

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Host "
==========================================
📊 MONITORING SETUP
==========================================
Environment: $Environment
Region: $Region
Profile: $SSOProfile
==========================================
" -ForegroundColor Magenta

# ==========================================
# GET ALERT EMAIL
# ==========================================

if (-not $AlertEmail) {
    Write-Host "`nEnter email for alerts:" -ForegroundColor Yellow
    $AlertEmail = Read-Host "Email address"
    
    if (-not ($AlertEmail -match "^[^@]+@[^@]+\.[^@]+$")) {
        Write-Error "Invalid email format"
        exit 1
    }
}

Write-Info "Alerts will be sent to: $AlertEmail"

# ==========================================
# CREATE SNS TOPIC
# ==========================================

Write-Info "`n[1/8] Creating SNS topic for alerts..."

$topicName = "$Environment-ysh-alerts"

# Check if topic exists
$existingTopics = aws sns list-topics `
    --region $Region `
    --profile $SSOProfile `
    --output json | ConvertFrom-Json

$topicArn = $existingTopics.Topics | Where-Object { $_.TopicArn -match $topicName } | Select-Object -First 1 -ExpandProperty TopicArn

if ($topicArn) {
    Write-Success "✓ SNS topic already exists: $topicArn"
}
else {
    $topicResult = aws sns create-topic `
        --name $topicName `
        --region $Region `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    $topicArn = $topicResult.TopicArn
    Write-Success "✓ SNS topic created: $topicArn"
}

# Subscribe email
Write-Info "Subscribing email to SNS topic..."

$existingSubscriptions = aws sns list-subscriptions-by-topic `
    --topic-arn $topicArn `
    --region $Region `
    --profile $SSOProfile `
    --output json | ConvertFrom-Json

$emailSubscribed = $existingSubscriptions.Subscriptions | Where-Object { $_.Endpoint -eq $AlertEmail }

if ($emailSubscribed) {
    Write-Success "✓ Email already subscribed"
}
else {
    aws sns subscribe `
        --topic-arn $topicArn `
        --protocol email `
        --notification-endpoint $AlertEmail `
        --region $Region `
        --profile $SSOProfile | Out-Null
    
    Write-Success "✓ Email subscription created"
    Write-Warning "⚠ Check your email and confirm the subscription!"
}

# ==========================================
# GET STACK RESOURCES
# ==========================================

Write-Info "`n[2/8] Getting CloudFormation resources..."

$stackName = "$Environment-ysh-stack"

$stack = aws cloudformation describe-stacks `
    --stack-name $stackName `
    --region $Region `
    --profile $SSOProfile `
    --output json | ConvertFrom-Json

$outputs = @{}
foreach ($output in $stack.Stacks[0].Outputs) {
    $outputs[$output.OutputKey] = $output.OutputValue
}

$albArn = $outputs["LoadBalancerArn"]
$clusterName = $outputs["ECSClusterName"]

Write-Success "✓ Resources retrieved"
Write-Info "  ALB: $albArn"
Write-Info "  Cluster: $clusterName"

# Extract resource IDs
$albName = $albArn -replace '.*loadbalancer/', ''

# ==========================================
# ALB 5XX ERRORS ALARM
# ==========================================

if (-not $SkipCloudWatchAlarms) {
    Write-Info "`n[3/8] Creating ALB 5xx errors alarm..."
    
    aws cloudwatch put-metric-alarm `
        --alarm-name "$Environment-ysh-alb-5xx-errors" `
        --alarm-description "Alert when ALB returns 5xx errors" `
        --metric-name HTTPCode_Target_5XX_Count `
        --namespace AWS/ApplicationELB `
        --statistic Sum `
        --period 300 `
        --threshold 10 `
        --comparison-operator GreaterThanThreshold `
        --evaluation-periods 1 `
        --dimensions "Name=LoadBalancer,Value=$albName" `
        --alarm-actions $topicArn `
        --region $Region `
        --profile $SSOProfile | Out-Null
    
    Write-Success "✓ ALB 5xx errors alarm created (threshold: 10 errors/5min)"
}

# ==========================================
# ALB UNHEALTHY TARGETS ALARM
# ==========================================

if (-not $SkipCloudWatchAlarms) {
    Write-Info "`n[4/8] Creating unhealthy targets alarm..."
    
    aws cloudwatch put-metric-alarm `
        --alarm-name "$Environment-ysh-alb-unhealthy-targets" `
        --alarm-description "Alert when targets become unhealthy" `
        --metric-name UnHealthyHostCount `
        --namespace AWS/ApplicationELB `
        --statistic Average `
        --period 60 `
        --threshold 1 `
        --comparison-operator GreaterThanOrEqualToThreshold `
        --evaluation-periods 2 `
        --dimensions "Name=LoadBalancer,Value=$albName" `
        --alarm-actions $topicArn `
        --region $Region `
        --profile $SSOProfile | Out-Null
    
    Write-Success "✓ Unhealthy targets alarm created"
}

# ==========================================
# RDS CPU ALARM
# ==========================================

if (-not $SkipCloudWatchAlarms) {
    Write-Info "`n[5/8] Creating RDS CPU alarm..."
    
    # Get RDS instance identifier
    $rdsInstances = aws rds describe-db-instances `
        --region $Region `
        --profile $SSOProfile `
        --output json | ConvertFrom-Json
    
    $rdsInstance = $rdsInstances.DBInstances | Where-Object { $_.DBInstanceIdentifier -match "$Environment-ysh" } | Select-Object -First 1
    
    if ($rdsInstance) {
        aws cloudwatch put-metric-alarm `
            --alarm-name "$Environment-ysh-rds-cpu" `
            --alarm-description "Alert when RDS CPU exceeds 80%" `
            --metric-name CPUUtilization `
            --namespace AWS/RDS `
            --statistic Average `
            --period 300 `
            --threshold 80 `
            --comparison-operator GreaterThanThreshold `
            --evaluation-periods 2 `
            --dimensions "Name=DBInstanceIdentifier,Value=$($rdsInstance.DBInstanceIdentifier)" `
            --alarm-actions $topicArn `
            --region $Region `
            --profile $SSOProfile | Out-Null
        
        Write-Success "✓ RDS CPU alarm created (threshold: 80%)"
    }
    else {
        Write-Warning "⚠ RDS instance not found, skipping RDS alarm"
    }
}

# ==========================================
# ECS SERVICE CPU ALARM
# ==========================================

if (-not $SkipCloudWatchAlarms) {
    Write-Info "`n[6/8] Creating ECS CPU alarms..."
    
    $services = @("$Environment-ysh-backend", "$Environment-ysh-storefront")
    
    foreach ($service in $services) {
        aws cloudwatch put-metric-alarm `
            --alarm-name "$service-cpu" `
            --alarm-description "Alert when $service CPU exceeds 80%" `
            --metric-name CPUUtilization `
            --namespace AWS/ECS `
            --statistic Average `
            --period 300 `
            --threshold 80 `
            --comparison-operator GreaterThanThreshold `
            --evaluation-periods 2 `
            --dimensions "Name=ClusterName,Value=$clusterName" "Name=ServiceName,Value=$service" `
            --alarm-actions $topicArn `
            --region $Region `
            --profile $SSOProfile | Out-Null
        
        Write-Success "✓ $service CPU alarm created"
    }
}

# ==========================================
# ECS SERVICE MEMORY ALARM
# ==========================================

if (-not $SkipCloudWatchAlarms) {
    Write-Info "`n[7/8] Creating ECS memory alarms..."
    
    $services = @("$Environment-ysh-backend", "$Environment-ysh-storefront")
    
    foreach ($service in $services) {
        aws cloudwatch put-metric-alarm `
            --alarm-name "$service-memory" `
            --alarm-description "Alert when $service memory exceeds 80%" `
            --metric-name MemoryUtilization `
            --namespace AWS/ECS `
            --statistic Average `
            --period 300 `
            --threshold 80 `
            --comparison-operator GreaterThanThreshold `
            --evaluation-periods 2 `
            --dimensions "Name=ClusterName,Value=$clusterName" "Name=ServiceName,Value=$service" `
            --alarm-actions $topicArn `
            --region $Region `
            --profile $SSOProfile | Out-Null
        
        Write-Success "✓ $service memory alarm created"
    }
}

# ==========================================
# BILLING ALERTS
# ==========================================

if (-not $SkipBillingAlerts) {
    Write-Info "`n[8/8] Creating billing alerts..."
    Write-Info "Switching to us-east-1 for billing metrics..."
    
    # Billing metrics only available in us-east-1
    $thresholds = @(10, 15, $BillingThreshold)
    
    foreach ($threshold in $thresholds) {
        aws cloudwatch put-metric-alarm `
            --alarm-name "$Environment-ysh-billing-${threshold}usd" `
            --alarm-description "Alert when monthly bill exceeds $${threshold}" `
            --metric-name EstimatedCharges `
            --namespace AWS/Billing `
            --statistic Maximum `
            --period 21600 `
            --threshold $threshold `
            --comparison-operator GreaterThanThreshold `
            --evaluation-periods 1 `
            --dimensions "Name=Currency,Value=USD" `
            --alarm-actions $topicArn `
            --region us-east-1 `
            --profile $SSOProfile | Out-Null
        
        Write-Success "✓ Billing alarm created: $${threshold}"
    }
}

# ==========================================
# CREATE CLOUDWATCH DASHBOARD
# ==========================================

Write-Info "`nCreating CloudWatch dashboard..."

$dashboardBody = @{
    widgets = @(
        @{
            type       = "metric"
            properties = @{
                metrics = @(
                    @("AWS/ApplicationELB", "TargetResponseTime", @{ stat = "Average" })
                    @("AWS/ApplicationELB", "HTTPCode_Target_2XX_Count", @{ stat = "Sum" })
                    @("AWS/ApplicationELB", "HTTPCode_Target_5XX_Count", @{ stat = "Sum" })
                )
                period  = 300
                stat    = "Average"
                region  = $Region
                title   = "ALB Performance"
                yAxis   = @{ left = @{ min = 0 } }
            }
        }
        @{
            type       = "metric"
            properties = @{
                metrics = @(
                    @("AWS/ECS", "CPUUtilization", "ClusterName", $clusterName, "ServiceName", "$Environment-ysh-backend")
                    @("AWS/ECS", "MemoryUtilization", "ClusterName", $clusterName, "ServiceName", "$Environment-ysh-backend")
                )
                period  = 300
                stat    = "Average"
                region  = $Region
                title   = "Backend ECS Metrics"
            }
        }
        @{
            type       = "metric"
            properties = @{
                metrics = @(
                    @("AWS/RDS", "CPUUtilization", "DBInstanceIdentifier", "$Environment-ysh-postgres")
                    @("AWS/RDS", "DatabaseConnections", "DBInstanceIdentifier", "$Environment-ysh-postgres")
                )
                period  = 300
                stat    = "Average"
                region  = $Region
                title   = "RDS Performance"
            }
        }
    )
} | ConvertTo-Json -Depth 10 -Compress

aws cloudwatch put-dashboard `
    --dashboard-name "$Environment-ysh-monitoring" `
    --dashboard-body $dashboardBody `
    --region $Region `
    --profile $SSOProfile | Out-Null

Write-Success "✓ CloudWatch dashboard created"

# ==========================================
# SUMMARY
# ==========================================

Write-Host "

==========================================
✅ MONITORING SETUP COMPLETE
==========================================

SNS Topic: $topicArn
Alert Email: $AlertEmail

CloudWatch Alarms Created:
  ✓ ALB 5xx errors (>10 errors/5min)
  ✓ ALB unhealthy targets (>=1)
  ✓ RDS CPU (>80%)
  ✓ ECS Backend CPU (>80%)
  ✓ ECS Backend Memory (>80%)
  ✓ ECS Storefront CPU (>80%)
  ✓ ECS Storefront Memory (>80%)
  ✓ Billing alerts (\$10, \$15, \$$BillingThreshold)

CloudWatch Dashboard:
  https://$Region.console.aws.amazon.com/cloudwatch/home?region=$Region#dashboards:name=$Environment-ysh-monitoring

Next steps:
1. Confirm email subscription (check inbox)
2. Review CloudWatch dashboard
3. Run: .\4-configure-env.ps1 (update storefront)

" -ForegroundColor Green

Write-Host "
==========================================
📊 MONITORING URLS
==========================================
" -ForegroundColor Cyan

Write-Info "CloudWatch Alarms:"
Write-Host "  https://$Region.console.aws.amazon.com/cloudwatch/home?region=$Region#alarmsV2:`n" -ForegroundColor Gray

Write-Info "CloudWatch Logs:"
Write-Host "  Backend: https://$Region.console.aws.amazon.com/cloudwatch/home?region=$Region#logsV2:log-groups/log-group/\$252Faws\$252Fecs\$252F$Environment-ysh-backend" -ForegroundColor Gray
Write-Host "  Storefront: https://$Region.console.aws.amazon.com/cloudwatch/home?region=$Region#logsV2:log-groups/log-group/\$252Faws\$252Fecs\$252F$Environment-ysh-storefront`n" -ForegroundColor Gray

Write-Info "Billing Dashboard:"
Write-Host "  https://console.aws.amazon.com/billing/home#/`n" -ForegroundColor Gray
