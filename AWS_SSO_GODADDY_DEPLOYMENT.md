# ==========================================

# AWS SSO Configuration & Deployment Guide

# GoDaddy Domain Integration

# ==========================================

## 🔐 AWS SSO Configuration

### 1. Configure AWS SSO (Identity Center)

```powershell
# Install AWS CLI (if not installed)
winget install Amazon.AWSCLI

# Configure AWS SSO
aws configure sso

# Provide the following when prompted:
# SSO Start URL: https://your-org.awsapps.com/start
# SSO Region: us-east-1 (or your region)
# SSO Registration scopes: sso:account:access
# CLI default output format: json
# CLI profile name: ysh-production
```

### 2. Login to AWS SSO

```powershell
# Login via SSO
aws sso login --profile ysh-production

# Verify credentials
aws sts get-caller-identity --profile ysh-production

# Set as default profile
$env:AWS_PROFILE = "ysh-production"
```

### 3. Configure AWS Credentials File

**Location**: `~\.aws\config`

```ini
[profile ysh-production]
sso_start_url = https://your-org.awsapps.com/start
sso_region = us-east-1
sso_account_id = 123456789012
sso_role_name = AdministratorAccess
region = us-east-1
output = json

[profile ysh-staging]
sso_start_url = https://your-org.awsapps.com/start
sso_region = us-east-1
sso_account_id = 123456789012
sso_role_name = PowerUserAccess
region = us-east-1
output = json
```

## 🌐 GoDaddy Domain Configuration

### Domain: yellosolar.com.br (or your domain)

### 1. Route53 Hosted Zone Setup

```powershell
# Create hosted zone
aws route53 create-hosted-zone `
  --name yellosolar.com.br `
  --caller-reference $(Get-Date -Format "yyyyMMddHHmmss") `
  --profile ysh-production

# Get name servers
aws route53 get-hosted-zone `
  --id /hostedzone/YOUR_ZONE_ID `
  --profile ysh-production
```

### 2. Update GoDaddy DNS Settings

Login to GoDaddy and configure nameservers:

1. Go to: <https://dcc.godaddy.com/domains>
2. Select your domain: yellosolar.com.br
3. Click "Manage DNS"
4. Scroll to "Nameservers" section
5. Change to "Custom" and add AWS nameservers:

   ```
   ns-123.awsdns-12.com
   ns-456.awsdns-45.net
   ns-789.awsdns-78.org
   ns-012.awsdns-01.co.uk
   ```

**Note**: DNS propagation takes 24-48 hours

### 3. Verify DNS Propagation

```powershell
# Check nameservers
nslookup -type=NS yellosolar.com.br

# Check A record
nslookup yellosolar.com.br

# Or use online tools
# https://dnschecker.org
```

## 📜 SSL/TLS Certificate Configuration

### 1. Request ACM Certificate (FREE with AWS)

```powershell
# Request certificate for domain and subdomains
aws acm request-certificate `
  --domain-name yellosolar.com.br `
  --subject-alternative-names "*.yellosolar.com.br" "www.yellosolar.com.br" `
  --validation-method DNS `
  --region us-east-1 `
  --profile ysh-production

# Get certificate ARN
$CERT_ARN = (aws acm list-certificates --profile ysh-production --query "CertificateSummaryList[?DomainName=='yellosolar.com.br'].CertificateArn" --output text)
Write-Host "Certificate ARN: $CERT_ARN"

# Get validation records
aws acm describe-certificate `
  --certificate-arn $CERT_ARN `
  --profile ysh-production
```

### 2. Add DNS Validation Records to Route53

```powershell
# Get hosted zone ID
$ZONE_ID = (aws route53 list-hosted-zones --query "HostedZones[?Name=='yellosolar.com.br.'].Id" --output text --profile ysh-production)

# Create validation record (get values from ACM describe-certificate)
aws route53 change-resource-record-sets `
  --hosted-zone-id $ZONE_ID `
  --change-batch file://acm-validation.json `
  --profile ysh-production
```

**acm-validation.json**:

```json
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "_abc123.yellosolar.com.br",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "_xyz789.acm-validations.aws."
          }
        ]
      }
    }
  ]
}
```

### 3. Wait for Certificate Validation

```powershell
# Wait for validation (can take 5-30 minutes)
aws acm wait certificate-validated `
  --certificate-arn $CERT_ARN `
  --profile ysh-production

Write-Host "Certificate validated successfully!" -ForegroundColor Green
```

## 🚀 CloudFormation Deployment with Domain

### 1. Update CloudFormation Template Parameters

Add to `aws/cloudformation-free-tier.yml`:

```yaml
Parameters:
  # ... existing parameters ...
  
  DomainName:
    Type: String
    Default: yellosolar.com.br
    Description: Primary domain name
  
  HostedZoneId:
    Type: String
    Description: Route53 Hosted Zone ID
  
  CertificateArn:
    Type: String
    Description: ACM Certificate ARN for SSL/TLS
```

### 2. Deploy CloudFormation Stack

```powershell
# Set variables
$STACK_NAME = "ysh-b2b-production"
$TEMPLATE_FILE = "aws/cloudformation-with-domain.yml"
$HOSTED_ZONE_ID = "Z1234567890ABC"
$CERT_ARN = "arn:aws:acm:us-east-1:123456789012:certificate/abc-123"

# Generate secure secrets
$JWT_SECRET = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$COOKIE_SECRET = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# Deploy stack
aws cloudformation create-stack `
  --stack-name $STACK_NAME `
  --template-body file://$TEMPLATE_FILE `
  --parameters `
    ParameterKey=Environment,ParameterValue=production `
    ParameterKey=DomainName,ParameterValue=yellosolar.com.br `
    ParameterKey=HostedZoneId,ParameterValue=$HOSTED_ZONE_ID `
    ParameterKey=CertificateArn,ParameterValue=$CERT_ARN `
    ParameterKey=DBMasterUsername,ParameterValue=medusa_user `
    ParameterKey=DBMasterPassword,ParameterValue=YourSecurePassword123! `
    ParameterKey=MedusaJWTSecret,ParameterValue=$JWT_SECRET `
    ParameterKey=MedusaCookieSecret,ParameterValue=$COOKIE_SECRET `
  --capabilities CAPABILITY_NAMED_IAM `
  --profile ysh-production

# Monitor stack creation
aws cloudformation wait stack-create-complete `
  --stack-name $STACK_NAME `
  --profile ysh-production

# Get outputs
aws cloudformation describe-stacks `
  --stack-name $STACK_NAME `
  --profile ysh-production `
  --query "Stacks[0].Outputs"
```

### 3. Create DNS Records for ALB

```powershell
# Get ALB DNS name
$ALB_DNS = (aws cloudformation describe-stacks `
  --stack-name $STACK_NAME `
  --profile ysh-production `
  --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" `
  --output text)

# Get ALB Hosted Zone ID (standard for ALB)
$ALB_ZONE_ID = (aws elbv2 describe-load-balancers `
  --profile ysh-production `
  --query "LoadBalancers[0].CanonicalHostedZoneId" `
  --output text)

# Create Route53 records
aws route53 change-resource-record-sets `
  --hosted-zone-id $HOSTED_ZONE_ID `
  --change-batch file://route53-records.json `
  --profile ysh-production
```

**route53-records.json**:

```json
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "yellosolar.com.br",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z35SXDOTRQ7X7K",
          "DNSName": "ysh-alb-123456789.us-east-1.elb.amazonaws.com",
          "EvaluateTargetHealth": true
        }
      }
    },
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.yellosolar.com.br",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z35SXDOTRQ7X7K",
          "DNSName": "ysh-alb-123456789.us-east-1.elb.amazonaws.com",
          "EvaluateTargetHealth": true
        }
      }
    },
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.yellosolar.com.br",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z35SXDOTRQ7X7K",
          "DNSName": "ysh-alb-123456789.us-east-1.elb.amazonaws.com",
          "EvaluateTargetHealth": true
        }
      }
    }
  ]
}
```

## 🔧 Post-Deployment Configuration

### 1. Update Environment Variables

```powershell
# Update ECS Task Definition with correct domain
aws ecs register-task-definition `
  --family ysh-backend `
  --container-definitions file://backend-task-def.json `
  --profile ysh-production

# Restart services
aws ecs update-service `
  --cluster production-ysh-cluster `
  --service ysh-backend-service `
  --force-new-deployment `
  --profile ysh-production
```

### 2. Configure CORS for Domain

Update Medusa backend `medusa-config.ts`:

```typescript
const STORE_CORS = process.env.STORE_CORS || 
  "https://yellosolar.com.br,https://www.yellosolar.com.br"

const ADMIN_CORS = process.env.ADMIN_CORS || 
  "https://yellosolar.com.br,https://www.yellosolar.com.br,https://api.yellosolar.com.br"
```

### 3. Test Domain Configuration

```powershell
# Test HTTPS
curl -I https://yellosolar.com.br

# Test API
curl https://api.yellosolar.com.br/health

# Test SSL certificate
openssl s_client -connect yellosolar.com.br:443 -servername yellosolar.com.br
```

## 📊 Monitoring & Verification

### Health Checks

```powershell
# Check ALB target health
aws elbv2 describe-target-health `
  --target-group-arn arn:aws:elasticloadbalancing:... `
  --profile ysh-production

# Check ECS service status
aws ecs describe-services `
  --cluster production-ysh-cluster `
  --services ysh-backend-service ysh-storefront-service `
  --profile ysh-production
```

### CloudWatch Logs

```powershell
# View backend logs
aws logs tail /aws/ecs/production-ysh-backend `
  --follow `
  --profile ysh-production

# View storefront logs
aws logs tail /aws/ecs/production-ysh-storefront `
  --follow `
  --profile ysh-production
```

## 🔒 Security Checklist

- [x] AWS SSO configured with MFA
- [x] SSL/TLS certificate issued (ACM)
- [x] HTTPS enforced on ALB
- [x] Security groups restricted
- [x] Secrets stored in Secrets Manager
- [x] IAM roles with least privilege
- [x] CloudWatch alarms configured
- [x] Backup enabled for RDS
- [x] CORS properly configured
- [x] Rate limiting enabled

## 🆘 Troubleshooting

### SSO Login Issues

```powershell
# Clear SSO cache
Remove-Item -Recurse -Force ~/.aws/sso/cache

# Re-login
aws sso login --profile ysh-production
```

### DNS Not Resolving

```powershell
# Check DNS propagation
nslookup yellosolar.com.br 8.8.8.8

# Flush local DNS cache
ipconfig /flushdns
```

### Certificate Validation Failed

```powershell
# Check validation records
aws route53 list-resource-record-sets `
  --hosted-zone-id $HOSTED_ZONE_ID `
  --profile ysh-production

# Re-check certificate status
aws acm describe-certificate `
  --certificate-arn $CERT_ARN `
  --profile ysh-production
```

## 📚 Additional Resources

- [AWS SSO Documentation](https://docs.aws.amazon.com/singlesignon/)
- [Route53 Documentation](https://docs.aws.amazon.com/route53/)
- [ACM Documentation](https://docs.aws.amazon.com/acm/)
- [GoDaddy DNS Management](https://www.godaddy.com/help/manage-dns-680)
- [CloudFormation Best Practices](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/best-practices.html)
