# AWS Deployment with Custom Domain (GoDaddy)

Complete guide for deploying Medusa.js 2.10.3 B2B E-commerce on AWS Free Tier with custom domain from GoDaddy.

## 📋 Prerequisites

### Required Accounts & Access

- ✅ **AWS Account** with SSO (AWS Identity Center) configured
- ✅ **GoDaddy Account** with domain ownership (`yellosolar.com.br`)
- ✅ **AWS CLI v2** installed ([Download](https://aws.amazon.com/cli/))
- ✅ **PowerShell 5.1+** (Windows) or PowerShell Core (Mac/Linux)
- ✅ **AdministratorAccess** or equivalent IAM permissions

### Verify AWS CLI Installation

```powershell
aws --version
# Expected: aws-cli/2.x.x Python/3.x.x Windows/10 exe/AMD64 prompt/off
```

---

## 🚀 Quick Start (Automated Deployment)

### **Option 1: Full Automated Deployment**

Run everything in one command (after prerequisites):

```powershell
cd C:\Users\fjuni\ysh_medusa\ysh-store\aws

.\deploy-with-domain.ps1 `
    -Environment production `
    -DomainName yellosolar.com.br `
    -Region us-east-1 `
    -SSOProfile ysh-production `
    -CreateHostedZone `
    -RequestCertificate `
    -DeployStack
```

**What this does:**

1. ✅ Configures AWS SSO authentication
2. ✅ Creates Route53 hosted zone
3. ✅ Requests ACM SSL certificate (FREE)
4. ✅ Validates certificate via DNS
5. ✅ Deploys CloudFormation stack (15-30 min)
6. ✅ Creates all AWS resources (VPC, RDS, Redis, S3, ECS, ALB)
7. ✅ Configures DNS records automatically

**Manual step required:**

- Update GoDaddy nameservers when prompted (see step 2 below)

---

### **Option 2: Step-by-Step Deployment**

#### **Step 1: Configure AWS SSO**

```powershell
.\deploy-with-domain.ps1 -Environment production
```

**Provide when prompted:**

- SSO Start URL: `https://d-xxxxxxxxxx.awsapps.com/start`
- SSO Region: `us-east-1`
- AWS Account ID: `123456789012`
- IAM Role Name: `AdministratorAccess`

**Login via browser** when prompted.

---

#### **Step 2: Create Route53 Hosted Zone**

```powershell
.\deploy-with-domain.ps1 -CreateHostedZone
```

**Script outputs nameservers:**

```
Nameservers for GoDaddy:
  • ns-123.awsdns-12.com
  • ns-456.awsdns-45.net
  • ns-789.awsdns-78.org
  • ns-012.awsdns-01.co.uk
```

**Update GoDaddy DNS:**

1. Login to GoDaddy: <https://dcc.godaddy.com/manage/yellosolar.com.br/dns>
2. Click **"Nameservers"** → **"Change"**
3. Select **"Enter my own nameservers (advanced)"**
4. Add all 4 nameservers from script output
5. Click **"Save"**

**⏳ Wait 24-48 hours for DNS propagation** before continuing.

**Verify DNS propagation:**

```powershell
nslookup -type=NS yellosolar.com.br 8.8.8.8
# Should return AWS nameservers
```

---

#### **Step 3: Request SSL Certificate**

```powershell
.\deploy-with-domain.ps1 -RequestCertificate
```

**Script automatically:**

- Requests wildcard certificate (`*.yellosolar.com.br`)
- Creates DNS validation records in Route53
- Waits for validation (5-30 minutes)

**Certificate ARN saved** for next step.

---

#### **Step 4: Deploy CloudFormation Stack**

```powershell
.\deploy-with-domain.ps1 -DeployStack
```

**Provide when prompted:**

- Database master username (default: `medusa_user`)
- Database master password (min 8 chars, secure!)

**Stack deployment time:** 15-30 minutes

**Monitor in AWS Console:**
<https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks>

---

## 📊 Stack Outputs

After deployment, script shows:

```yaml
VPCId: vpc-xxxxxxxxxxxxx
DatabaseEndpoint: production-ysh-postgres.xxxxxx.us-east-1.rds.amazonaws.com
RedisEndpoint: production-ysh-redis.xxxxxx.cache.amazonaws.com
LoadBalancerDNS: production-ysh-alb-xxxxxxxxxxxxx.us-east-1.elb.amazonaws.com
MediaBucketName: production-ysh-media-123456789012
ECSClusterName: production-ysh-cluster
SecretsManagerARN: arn:aws:secretsmanager:us-east-1:123456789012:secret:production/ysh/medusa-xxxxxx
DomainURL: https://yellosolar.com.br
APIURL: https://api.yellosolar.com.br
WWWURL: https://www.yellosolar.com.br
```

---

## 🏗️ Infrastructure Created (FREE TIER Optimized)

### **VPC & Networking**

- ✅ **VPC** (10.0.0.0/16)
- ✅ **2 Public Subnets** (10.0.1.0/24, 10.0.2.0/24)
- ✅ **2 Private Subnets** (10.0.3.0/24, 10.0.4.0/24)
- ✅ **Internet Gateway**
- ✅ **Route Tables**

### **Database**

- ✅ **RDS PostgreSQL 15.7** - `db.t4g.micro` (750 hrs/month FREE)
- ✅ **20 GB gp3 Storage** (20 GB FREE)
- ✅ **7-day automated backups**
- ✅ **Private subnet deployment**
- ✅ **Encrypted at rest**

### **Cache**

- ✅ **ElastiCache Redis 7.1** - `cache.t4g.micro` (750 hrs/month FREE)
- ✅ **Single node cluster**
- ✅ **Private subnet deployment**

### **Storage**

- ✅ **S3 Bucket** - 5 GB storage FREE
- ✅ **CORS configured** for domain
- ✅ **Private by default** (IAM access only)

### **Compute**

- ✅ **ECS Fargate Cluster**
- ✅ **Task definitions** for backend & storefront
- ✅ **Auto-scaling disabled** (FREE tier optimization)

### **Load Balancer**

- ✅ **Application Load Balancer** (750 hrs/month FREE)
- ✅ **HTTPS listener** (port 443) with ACM certificate
- ✅ **HTTP → HTTPS redirect** (port 80)
- ✅ **Path-based routing:**
  - `/admin/*`, `/store/*`, `/api/*` → Backend (port 9000)
  - `/*` → Storefront (port 8000)
- ✅ **Host-based routing:**
  - `api.yellosolar.com.br` → Backend

### **DNS & SSL**

- ✅ **Route53 Hosted Zone**
- ✅ **ACM SSL Certificate** (FREE, auto-renewal)
- ✅ **A Records:**
  - `yellosolar.com.br` → ALB
  - `www.yellosolar.com.br` → ALB
  - `api.yellosolar.com.br` → ALB

### **Security**

- ✅ **Secrets Manager** - 30-day trial, then $0.40/month per secret
- ✅ **Security Groups** with least privilege
- ✅ **IAM Roles** for ECS tasks

### **Monitoring**

- ✅ **CloudWatch Logs** (5 GB ingestion FREE)
- ✅ **7-day retention** (cost optimization)

---

## 💰 Cost Breakdown

### **Always Free (within limits):**

- ✅ RDS db.t4g.micro: 750 hours/month
- ✅ ElastiCache cache.t4g.micro: 750 hours/month
- ✅ ALB: 750 hours/month + 15 GB data processing
- ✅ S3: 5 GB storage + 20,000 GET + 2,000 PUT
- ✅ RDS Storage: 20 GB gp3
- ✅ ACM Certificate: FREE forever
- ✅ Route53: $0.50/month per hosted zone (not free)
- ✅ CloudWatch Logs: 5 GB ingestion FREE
- ✅ ECS Fargate: 20 GB storage + compute charges apply

### **Estimated Monthly Cost (Single Instance):**

```
Route53 Hosted Zone:        $0.50
Secrets Manager:            $0.40 (after 30-day trial)
RDS db.t4g.micro:           $0.00 (within 750h FREE tier)
ElastiCache cache.t4g.micro: $0.00 (within 750h FREE tier)
ALB:                        $0.00 (within 750h FREE tier)
S3:                         $0.00 (within 5GB FREE tier)
ECS Fargate (0.25 vCPU):    ~$7.50/month per task
-------------------------------------------
TOTAL (Backend + Storefront): ~$23.40/month
```

### **FREE Tier Maximization Tips:**

- ✅ Use **1 Fargate task** for combined backend+storefront (reduces cost to ~$8)
- ✅ Keep RDS/ElastiCache **running continuously** (don't stop/start - wastes hours)
- ✅ Use **S3 Intelligent-Tiering** for old files
- ✅ Set **CloudWatch log retention** to 7 days (default: 30)
- ✅ Disable **Container Insights** (not needed for small deployments)
- ✅ Use **FARGATE_SPOT** capacity provider (up to 70% discount)

---

## 🔐 Security Checklist

### **After Deployment:**

- [ ] **Rotate database password** after 90 days
- [ ] **Enable MFA** on AWS root account
- [ ] **Configure AWS Backup** for RDS (optional)
- [ ] **Review IAM policies** - remove unused permissions
- [ ] **Enable CloudTrail** for audit logging (90-day free trial)
- [ ] **Configure AWS WAF** on ALB (optional, costs apply)
- [ ] **Set up billing alerts** in AWS Billing console
- [ ] **Enable GuardDuty** (30-day free trial, then costs apply)

### **Secrets Manager Content:**

```json
{
  "DATABASE_URL": "postgres://user:pass@host:5432/db",
  "REDIS_URL": "redis://host:6379",
  "JWT_SECRET": "auto-generated-64-chars",
  "COOKIE_SECRET": "auto-generated-64-chars",
  "S3_BUCKET": "production-ysh-media-xxxxx",
  "AWS_REGION": "us-east-1",
  "DOMAIN_NAME": "yellosolar.com.br",
  "STORE_CORS": "https://yellosolar.com.br,https://www.yellosolar.com.br",
  "ADMIN_CORS": "https://yellosolar.com.br,https://www.yellosolar.com.br,https://api.yellosolar.com.br"
}
```

---

## 🧪 Testing & Verification

### **1. Test DNS Resolution**

```powershell
nslookup yellosolar.com.br
nslookup www.yellosolar.com.br
nslookup api.yellosolar.com.br
```

### **2. Test SSL Certificate**

```powershell
# PowerShell
curl -I https://yellosolar.com.br

# Expected: HTTP/1.1 200 OK or 301/302 (redirect)
```

### **3. Test ALB Health Checks**

```powershell
# Get ALB DNS
$albDns = aws cloudformation describe-stacks `
    --stack-name production-ysh-stack `
    --query 'Stacks[0].Outputs[?OutputKey==`LoadBalancerDNS`].OutputValue' `
    --output text `
    --profile ysh-production

# Test backend health
curl -I "http://$albDns/health"
# Expected: HTTP/1.1 200 OK
```

### **4. Test Domain Routing**

```powershell
# Test HTTPS redirect
curl -I http://yellosolar.com.br
# Expected: HTTP/1.1 301 Moved Permanently, Location: https://...

# Test API subdomain
curl -I https://api.yellosolar.com.br/health
# Expected: HTTP/1.1 200 OK
```

---

## 🛠️ Troubleshooting

### **Issue: "Stack creation failed"**

**Check:**

```powershell
aws cloudformation describe-stack-events `
    --stack-name production-ysh-stack `
    --profile ysh-production `
    --max-items 20
```

**Common causes:**

- ❌ Certificate ARN not in `us-east-1` (ALB requires us-east-1 for ACM)
- ❌ Hosted Zone ID incorrect
- ❌ Database password too weak (min 8 chars)
- ❌ IAM permissions missing (needs `CAPABILITY_NAMED_IAM`)

---

### **Issue: "Certificate validation timeout"**

**Check validation records:**

```powershell
aws route53 list-resource-record-sets `
    --hosted-zone-id Z1234567890ABC `
    --profile ysh-production `
    --query "ResourceRecordSets[?Type=='CNAME']"
```

**Manual validation:**

```powershell
# Get validation records from ACM
aws acm describe-certificate `
    --certificate-arn arn:aws:acm:us-east-1:123456789012:certificate/xxxxx `
    --region us-east-1 `
    --profile ysh-production
```

---

### **Issue: "Domain not accessible after deployment"**

**Wait time:** DNS propagation can take up to 48 hours.

**Verify:**

```powershell
# Check Route53 records exist
aws route53 list-resource-record-sets `
    --hosted-zone-id Z1234567890ABC `
    --profile ysh-production

# Check ALB target health
aws elbv2 describe-target-health `
    --target-group-arn arn:aws:elasticloadbalancing:... `
    --profile ysh-production
```

**Common causes:**

- ❌ ECS tasks not running (check ECS console)
- ❌ Security groups blocking traffic
- ❌ Target group health checks failing
- ❌ DNS not propagated yet

---

### **Issue: "502 Bad Gateway"**

**Check ECS tasks:**

```powershell
aws ecs list-tasks `
    --cluster production-ysh-cluster `
    --profile ysh-production

aws ecs describe-tasks `
    --cluster production-ysh-cluster `
    --tasks <task-arn> `
    --profile ysh-production
```

**Check CloudWatch Logs:**

```powershell
aws logs tail /aws/ecs/production-ysh-backend `
    --follow `
    --profile ysh-production
```

---

## 📚 Next Steps

### **1. Deploy Application (ECS Tasks)**

Create task definitions and services for:

- **Backend** (Medusa.js API)
- **Storefront** (Next.js)

See: `backend-task-definition.json` and `storefront-task-definition.json`

### **2. Run Database Migrations**

```bash
# Connect to ECS task and run
docker exec -it <container-id> bash
yarn medusa db:migrate
yarn run seed
```

### **3. Configure Medusa Admin**

1. Create admin user
2. Configure store settings
3. Set up payment providers
4. Configure shipping options

### **4. Update Application CORS**

Update `medusa-config.ts`:

```typescript
store_cors: process.env.STORE_CORS || "https://yellosolar.com.br,https://www.yellosolar.com.br"
admin_cors: process.env.ADMIN_CORS || "https://yellosolar.com.br"
```

### **5. Monitor & Optimize**

- Set up CloudWatch alarms
- Enable auto-scaling (if needed)
- Review CloudWatch Insights for performance
- Optimize RDS/Redis connections

---

## 🔄 Stack Updates

### **Update CloudFormation Stack:**

```powershell
.\deploy-with-domain.ps1 -DeployStack -UpdateStack
```

### **Delete Stack (Cleanup):**

```powershell
aws cloudformation delete-stack `
    --stack-name production-ysh-stack `
    --profile ysh-production
```

**Warning:** This deletes all resources except:

- RDS snapshots (manual deletion required)
- S3 bucket (delete objects first)
- Route53 hosted zone (manual deletion required)

---

## 📞 Support & Resources

### **AWS Documentation:**

- [CloudFormation User Guide](https://docs.aws.amazon.com/cloudformation/)
- [ECS Fargate Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Route53 DNS Configuration](https://docs.aws.amazon.com/route53/)
- [ACM Certificate Validation](https://docs.aws.amazon.com/acm/latest/userguide/dns-validation.html)

### **GoDaddy Support:**

- [Update Nameservers](https://www.godaddy.com/help/change-nameservers-for-my-domains-664)
- [DNS Propagation Checker](https://www.whatsmydns.net/)

### **Medusa.js Documentation:**

- [Deployment Guide](https://docs.medusajs.com/deployment)
- [Environment Variables](https://docs.medusajs.com/references/medusa_config)

---

## ✅ Checklist Summary

**Before Deployment:**

- [ ] AWS account with SSO configured
- [ ] GoDaddy domain ownership verified
- [ ] AWS CLI v2 installed and working
- [ ] AdministratorAccess IAM permissions

**During Deployment:**

- [ ] AWS SSO authenticated
- [ ] Route53 hosted zone created
- [ ] GoDaddy nameservers updated
- [ ] DNS propagation verified (24-48h)
- [ ] ACM certificate requested and validated
- [ ] CloudFormation stack deployed successfully

**After Deployment:**

- [ ] Stack outputs verified
- [ ] DNS records resolving correctly
- [ ] SSL certificate working
- [ ] ALB health checks passing
- [ ] Domain accessible via HTTPS
- [ ] ECS tasks deployed (next step)
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Monitoring configured

---

**🎉 Ready to deploy YSH B2B Platform on AWS with custom domain!**

Questions? Review the troubleshooting section or check AWS CloudWatch Logs for detailed error messages.
