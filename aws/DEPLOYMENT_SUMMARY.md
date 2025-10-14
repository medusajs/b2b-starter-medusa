# AWS SSO + GoDaddy Domain - Deployment Summary

## 📦 Files Created

### 1. **cloudformation-with-domain.yml** (745 lines)

Complete CloudFormation template with:

- ✅ **Custom domain parameters** (DomainName, HostedZoneId, CertificateArn)
- ✅ **HTTPS/SSL configuration** with ACM certificate
- ✅ **Route53 DNS records** (apex, www, api subdomains)
- ✅ **ALB with HTTPS listener** (port 443) + HTTP→HTTPS redirect
- ✅ **All FREE tier resources** (RDS, ElastiCache, S3, ECS, ALB)
- ✅ **Secrets Manager integration** with domain CORS
- ✅ **Path-based & host-based routing** for backend/storefront

**Location:** `aws/cloudformation-with-domain.yml`

### 2. **deploy-with-domain.ps1** (PowerShell Script)

Automated deployment script with:

- ✅ **AWS SSO configuration** (`aws configure sso`)
- ✅ **Route53 hosted zone creation** with nameserver output
- ✅ **GoDaddy nameserver update prompts** (manual step)
- ✅ **ACM certificate request** with automatic DNS validation
- ✅ **CloudFormation deployment** with all parameters
- ✅ **Verification & testing** after deployment
- ✅ **Dry-run mode** for testing without deployment

**Location:** `aws/deploy-with-domain.ps1`

### 3. **DEPLOYMENT_GUIDE_DOMAIN.md** (Complete Documentation)

Comprehensive guide with:

- ✅ **Prerequisites checklist** (AWS account, GoDaddy, CLI)
- ✅ **Quick start** (automated full deployment)
- ✅ **Step-by-step manual process** (SSO → DNS → Certificate → Deploy)
- ✅ **Infrastructure overview** (all resources created)
- ✅ **Cost breakdown** with FREE tier optimization
- ✅ **Security checklist** (MFA, backups, billing alerts)
- ✅ **Testing & verification** commands
- ✅ **Troubleshooting section** (common issues & fixes)
- ✅ **Next steps** (ECS deployment, migrations, monitoring)

**Location:** `aws/DEPLOYMENT_GUIDE_DOMAIN.md`

---

## 🚀 Deployment Options

### **OPTION A: Fully Automated (Recommended)**

```powershell
cd C:\Users\fjuni\ysh_medusa\ysh-store\aws

.\deploy-with-domain.ps1 `
    -Environment production `
    -DomainName yellosolarhub.store `
    -Region us-east-1 `
    -SSOProfile ysh-production `
    -CreateHostedZone `
    -RequestCertificate `
    -DeployStack
```

**Time:** ~45-60 minutes (including DNS propagation wait)

**Manual steps:**

1. Login via AWS SSO browser prompt
2. Update GoDaddy nameservers when script prompts
3. Wait 24-48h for DNS propagation (script can wait or exit)

---

### **OPTION B: Step-by-Step (More Control)**

#### **1. Configure SSO (2 minutes)**

```powershell
.\deploy-with-domain.ps1 -Environment production
```

Provide SSO details when prompted.

#### **2. Create Hosted Zone (5 minutes)**

```powershell
.\deploy-with-domain.ps1 -CreateHostedZone
```

Update GoDaddy nameservers, then wait 24-48 hours.

#### **3. Request Certificate (30 minutes)**

```powershell
.\deploy-with-domain.ps1 -RequestCertificate
```

Script automatically validates via DNS (5-30 min).

#### **4. Deploy Stack (15-30 minutes)**

```powershell
.\deploy-with-domain.ps1 -DeployStack
```

Creates all AWS resources.

---

## 📋 Deployment Checklist

### **Prerequisites** (Before Starting)

- [ ] AWS account with **SSO/Identity Center** configured
- [ ] **AdministratorAccess** IAM role assigned
- [ ] GoDaddy account with **domain ownership** (`yellosolarhub.store`)
- [ ] AWS CLI v2 installed (`aws --version`)
- [ ] PowerShell 5.1+ or PowerShell Core

### **Step 1: SSO Configuration**

- [ ] Run `.\deploy-with-domain.ps1 -Environment production`
- [ ] Provide SSO Start URL (from AWS Identity Center)
- [ ] Provide SSO Region (usually `us-east-1`)
- [ ] Provide AWS Account ID (12 digits)
- [ ] Provide IAM Role Name (e.g., `AdministratorAccess`)
- [ ] Complete browser login when prompted
- [ ] Verify: `aws sts get-caller-identity --profile ysh-production`

### **Step 2: Route53 Hosted Zone**

- [ ] Run `.\deploy-with-domain.ps1 -CreateHostedZone`
- [ ] Copy **4 nameservers** from script output
- [ ] Login to GoDaddy: <https://dcc.godaddy.com/manage/yellosolarhub.store/dns>
- [ ] Click **"Nameservers"** → **"Change"**
- [ ] Select **"Enter my own nameservers (advanced)"**
- [ ] Add all 4 AWS nameservers
- [ ] Click **"Save"**
- [ ] Wait **24-48 hours** for DNS propagation
- [ ] Verify: `nslookup -type=NS yellosolarhub.store 8.8.8.8`

### **Step 3: SSL Certificate**

- [ ] Ensure DNS propagated (nameservers must be AWS)
- [ ] Run `.\deploy-with-domain.ps1 -RequestCertificate`
- [ ] Script automatically:
  - [ ] Requests wildcard certificate (`*.yellosolarhub.store`)
  - [ ] Creates DNS validation records in Route53
  - [ ] Waits for validation (5-30 minutes)
  - [ ] Saves certificate ARN for deployment
- [ ] Verify: Check ACM console for "Issued" status

### **Step 4: CloudFormation Deployment**

- [ ] Run `.\deploy-with-domain.ps1 -DeployStack`
- [ ] Provide **database master username** (default: `medusa_user`)
- [ ] Provide **database master password** (min 8 chars, secure!)
- [ ] Confirm deployment when prompted
- [ ] Wait **15-30 minutes** for stack creation
- [ ] Monitor: <https://console.aws.amazon.com/cloudformation/>
- [ ] Verify: Script shows all stack outputs

### **Step 5: Post-Deployment Verification**

- [ ] DNS resolves: `nslookup yellosolarhub.store`
- [ ] SSL works: `curl -I https://yellosolarhub.store`
- [ ] ALB healthy: Check target groups in AWS Console
- [ ] Secrets Manager: Verify secrets created
- [ ] RDS endpoint: Verify database accessible
- [ ] Redis endpoint: Verify cache accessible
- [ ] S3 bucket: Verify bucket created with CORS

---

## 💰 Cost Estimate

### **Always FREE (within limits):**

- ✅ **RDS db.t4g.micro**: 750 hours/month
- ✅ **ElastiCache cache.t4g.micro**: 750 hours/month
- ✅ **ALB**: 750 hours/month + 15 GB data
- ✅ **S3**: 5 GB storage + 20K GET + 2K PUT
- ✅ **ACM Certificate**: FREE forever
- ✅ **CloudWatch Logs**: 5 GB ingestion
- ✅ **RDS Storage**: 20 GB gp3

### **Monthly Charges:**

```
Route53 Hosted Zone:        $0.50
Secrets Manager:            $0.40 (after 30-day trial)
ECS Fargate (Backend):      ~$7.50 (0.25 vCPU, 0.5 GB)
ECS Fargate (Storefront):   ~$7.50 (0.25 vCPU, 0.5 GB)
Data Transfer (15GB):       $0.00 (within FREE tier)
-------------------------------------------
TOTAL:                      ~$15.90/month
```

### **Optimization to ~$8/month:**

- Combine backend + storefront in **single Fargate task**
- Use **FARGATE_SPOT** (up to 70% discount)
- Disable Container Insights
- Total: ~$8.40/month

---

## 🏗️ Resources Created

### **Network Layer**

- **VPC** (10.0.0.0/16)
- **2 Public Subnets** (Multi-AZ)
- **2 Private Subnets** (Multi-AZ)
- **Internet Gateway**
- **Route Tables**

### **Database & Cache**

- **RDS PostgreSQL 15.7** (db.t4g.micro, 20GB gp3)
- **ElastiCache Redis 7.1** (cache.t4g.micro)

### **Storage**

- **S3 Bucket** (private, CORS configured)

### **Compute**

- **ECS Fargate Cluster**
- **Task Execution Role** (with Secrets Manager access)
- **Task Role** (with S3 access)

### **Load Balancing**

- **Application Load Balancer** (internet-facing)
- **Backend Target Group** (port 9000, health: /health)
- **Storefront Target Group** (port 8000, health: /)
- **HTTPS Listener** (port 443, ACM certificate)
- **HTTP Listener** (port 80, redirect to HTTPS)

### **DNS & SSL**

- **Route53 Hosted Zone** (`yellosolarhub.store`)
- **ACM Certificate** (wildcard: `*.yellosolarhub.store`)
- **A Records:**
  - `yellosolarhub.store` → ALB
  - `www.yellosolarhub.store` → ALB
  - `api.yellosolarhub.store` → ALB

### **Security**

- **Secrets Manager** (DATABASE_URL, REDIS_URL, JWT/Cookie secrets)
- **Security Groups** (ALB, ECS, RDS, Redis)
- **IAM Roles** (ECS execution & task roles)

### **Monitoring**

- **CloudWatch Log Groups** (backend, storefront)
- **7-day retention** (cost optimization)

---

## 🧪 Verification Commands

### **Test DNS Resolution**

```powershell
nslookup yellosolarhub.store
nslookup www.yellosolarhub.store
nslookup api.yellosolarhub.store
```

### **Test SSL Certificate**

```powershell
curl -I https://yellosolarhub.store
curl -I https://www.yellosolarhub.store
curl -I https://api.yellosolarhub.store
```

### **Test ALB Routing**

```powershell
# Get ALB DNS
aws cloudformation describe-stacks `
    --stack-name production-ysh-stack `
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' `
    --output text `
    --profile ysh-production

# Test backend health
curl -I https://api.yellosolarhub.store/health
```

### **Check ECS Tasks**

```powershell
aws ecs list-tasks `
    --cluster production-ysh-cluster `
    --profile ysh-production

aws ecs describe-tasks `
    --cluster production-ysh-cluster `
    --tasks <task-arn> `
    --profile ysh-production
```

### **View CloudWatch Logs**

```powershell
aws logs tail /aws/ecs/production-ysh-backend `
    --follow `
    --profile ysh-production
```

---

## 🛠️ Common Issues & Fixes

### **Issue 1: "SSO token expired"**

**Fix:**

```powershell
aws sso login --profile ysh-production
```

### **Issue 2: "Certificate validation timeout"**

**Causes:**

- DNS not propagated yet (wait longer)
- Nameservers not updated in GoDaddy
- Route53 validation records not created

**Check:**

```powershell
# Verify nameservers
nslookup -type=NS yellosolarhub.store 8.8.8.8

# Check Route53 records
aws route53 list-resource-record-sets `
    --hosted-zone-id Z1234567890ABC `
    --profile ysh-production `
    --query "ResourceRecordSets[?Type=='CNAME']"
```

### **Issue 3: "Stack creation failed"**

**Check events:**

```powershell
aws cloudformation describe-stack-events `
    --stack-name production-ysh-stack `
    --profile ysh-production `
    --max-items 20
```

**Common causes:**

- Certificate ARN not in `us-east-1`
- Hosted Zone ID incorrect
- IAM permissions missing

### **Issue 4: "502 Bad Gateway"**

**Causes:**

- ECS tasks not running
- Target group health checks failing
- Security group rules blocking traffic

**Fix:**

1. Check ECS task status
2. View CloudWatch logs for errors
3. Verify security group rules allow ALB → ECS traffic
4. Check target group health in ALB console

---

## 📚 Next Steps After Deployment

### **1. Deploy ECS Tasks**

Create task definitions for backend and storefront:

```powershell
# Backend task
aws ecs register-task-definition `
    --cli-input-json file://backend-task-definition.json `
    --profile ysh-production

# Storefront task
aws ecs register-task-definition `
    --cli-input-json file://storefront-task-definition.json `
    --profile ysh-production

# Create services
aws ecs create-service `
    --cluster production-ysh-cluster `
    --service-name backend `
    --task-definition backend:1 `
    --desired-count 1 `
    --launch-type FARGATE `
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx,subnet-yyy],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" `
    --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=backend,containerPort=9000" `
    --profile ysh-production
```

### **2. Run Database Migrations**

Connect to ECS task and run migrations:

```bash
# Get task ARN
aws ecs list-tasks --cluster production-ysh-cluster --profile ysh-production

# Execute command in task
aws ecs execute-command `
    --cluster production-ysh-cluster `
    --task <task-arn> `
    --container backend `
    --command "yarn medusa db:migrate" `
    --interactive `
    --profile ysh-production
```

### **3. Seed Database**

```bash
aws ecs execute-command `
    --cluster production-ysh-cluster `
    --task <task-arn> `
    --container backend `
    --command "yarn run seed" `
    --interactive `
    --profile ysh-production
```

### **4. Create Admin User**

```bash
aws ecs execute-command `
    --cluster production-ysh-cluster `
    --task <task-arn> `
    --container backend `
    --command "yarn medusa user -e admin@test.com -p supersecret -i admin" `
    --interactive `
    --profile ysh-production
```

### **5. Configure Medusa Admin**

Access admin at: `https://yellosolarhub.store/app`

1. Login with admin credentials
2. Configure store settings
3. Add publishable API keys
4. Set up payment providers (if needed)
5. Configure shipping options

### **6. Update Storefront Environment**

Get publishable key from admin, then:

```bash
# Update environment variables in storefront task
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yellosolarhub.store
```

### **7. Set Up Monitoring**

```powershell
# Create CloudWatch alarm for ALB 5xx errors
aws cloudwatch put-metric-alarm `
    --alarm-name production-alb-5xx-errors `
    --alarm-description "Alert on 5xx errors" `
    --metric-name HTTPCode_Target_5XX_Count `
    --namespace AWS/ApplicationELB `
    --statistic Sum `
    --period 300 `
    --threshold 10 `
    --comparison-operator GreaterThanThreshold `
    --evaluation-periods 1 `
    --profile ysh-production

# Create billing alert
aws cloudwatch put-metric-alarm `
    --alarm-name billing-alert-15usd `
    --alarm-description "Alert when monthly bill exceeds $15" `
    --metric-name EstimatedCharges `
    --namespace AWS/Billing `
    --statistic Maximum `
    --period 21600 `
    --threshold 15 `
    --comparison-operator GreaterThanThreshold `
    --evaluation-periods 1 `
    --dimensions Name=Currency,Value=USD `
    --profile ysh-production
```

### **8. Enable Auto-Scaling (Optional)**

For production traffic:

```powershell
# Register scalable target
aws application-autoscaling register-scalable-target `
    --service-namespace ecs `
    --scalable-dimension ecs:service:DesiredCount `
    --resource-id service/production-ysh-cluster/backend `
    --min-capacity 1 `
    --max-capacity 3 `
    --profile ysh-production

# Create scaling policy
aws application-autoscaling put-scaling-policy `
    --service-namespace ecs `
    --scalable-dimension ecs:service:DesiredCount `
    --resource-id service/production-ysh-cluster/backend `
    --policy-name cpu75-target-tracking `
    --policy-type TargetTrackingScaling `
    --target-tracking-scaling-policy-configuration "PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},TargetValue=75.0" `
    --profile ysh-production
```

---

## 🔐 Security Best Practices

### **Immediate Actions:**

- [ ] **Rotate database password** (store in Secrets Manager)
- [ ] **Enable MFA** on AWS root account
- [ ] **Review IAM policies** - remove unused permissions
- [ ] **Set up billing alerts** ($10, $15, $20 thresholds)
- [ ] **Enable AWS CloudTrail** (90-day free trial)
- [ ] **Configure AWS Backup** for RDS (7-day retention)
- [ ] **Update CORS origins** in Secrets Manager after domain verification
- [ ] **Generate strong API keys** in Medusa admin

### **Ongoing Maintenance:**

- [ ] **Rotate secrets** every 90 days
- [ ] **Review CloudWatch logs** weekly
- [ ] **Monitor RDS/Redis metrics** for performance
- [ ] **Update ECS task definitions** when new images available
- [ ] **Review billing dashboard** monthly
- [ ] **Test disaster recovery** (restore from RDS snapshot)
- [ ] **Update ACM certificate** (auto-renewed by AWS)

---

## 📊 Monitoring Dashboard

### **Key Metrics to Track:**

- **ALB Target Health** (should be 100% healthy)
- **ECS Task Count** (should match desired count)
- **RDS CPU/Memory** (should stay under 80%)
- **Redis Hit Rate** (should be > 80%)
- **ALB Response Time** (P95 should be < 500ms)
- **CloudWatch Log Errors** (should be minimal)
- **Monthly AWS Bill** (should stay under $20)

### **CloudWatch Dashboard Setup:**

```powershell
# Create custom dashboard
aws cloudwatch put-dashboard `
    --dashboard-name production-ysh-monitoring `
    --dashboard-body file://cloudwatch-dashboard.json `
    --profile ysh-production
```

---

## ✅ Success Criteria

**Deployment is successful when:**

- ✅ CloudFormation stack status: `CREATE_COMPLETE`
- ✅ All Route53 A records resolve to ALB
- ✅ SSL certificate shows "Issued" status
- ✅ HTTPS works on all domains (apex, www, api)
- ✅ ALB target groups show "Healthy" status
- ✅ ECS tasks running: `RUNNING` state
- ✅ Backend health check: `curl -I https://api.yellosolarhub.store/health` returns 200
- ✅ Storefront loads: `https://yellosolarhub.store` returns 200
- ✅ Database migrations completed successfully
- ✅ Admin user created and can login
- ✅ Publishable key configured in storefront
- ✅ No errors in CloudWatch logs

---

## 🎯 Quick Reference

### **Deployment Command (Full Automation):**

```powershell
.\deploy-with-domain.ps1 -Environment production -DomainName yellosolarhub.store -CreateHostedZone -RequestCertificate -DeployStack
```

### **Stack Management:**

```powershell
# Describe stack
aws cloudformation describe-stacks --stack-name production-ysh-stack --profile ysh-production

# List stack outputs
aws cloudformation describe-stacks --stack-name production-ysh-stack --query 'Stacks[0].Outputs' --profile ysh-production

# Delete stack (cleanup)
aws cloudformation delete-stack --stack-name production-ysh-stack --profile ysh-production
```

### **ECS Management:**

```powershell
# List tasks
aws ecs list-tasks --cluster production-ysh-cluster --profile ysh-production

# Stop task (restart)
aws ecs stop-task --cluster production-ysh-cluster --task <task-arn> --profile ysh-production
```

### **View Logs:**

```powershell
# Backend logs
aws logs tail /aws/ecs/production-ysh-backend --follow --profile ysh-production

# Storefront logs
aws logs tail /aws/ecs/production-ysh-storefront --follow --profile ysh-production
```

---

**🚀 Ready to deploy YSH B2B Platform on AWS with custom domain!**

**Documentation:**

- 📘 Full Guide: `aws/DEPLOYMENT_GUIDE_DOMAIN.md`
- 📜 CloudFormation: `aws/cloudformation-with-domain.yml`
- 🔧 Deployment Script: `aws/deploy-with-domain.ps1`

**Next Action:** Run the deployment script and follow the prompts!
