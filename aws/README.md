# AWS Deployment Documentation Index

Complete reference for deploying Medusa.js 2.10.3 B2B E-commerce on AWS Free Tier with GoDaddy custom domain.

---

## 📚 Documentation Files

### **1. DEPLOYMENT_SUMMARY.md** ⭐ START HERE

**Quick reference guide** with:

- Files created overview
- Deployment options (automated vs step-by-step)
- Complete checklists
- Cost breakdown ($15/month optimized to $8)
- Infrastructure overview
- Verification commands
- Next steps after deployment

**Use this for:** Quick overview and deployment decision-making

**Read time:** 10 minutes

---

### **2. DEPLOYMENT_GUIDE_DOMAIN.md** 📖 COMPLETE GUIDE

**Comprehensive step-by-step guide** with:

- Prerequisites checklist
- AWS SSO configuration
- Route53 hosted zone setup
- GoDaddy nameserver updates
- ACM certificate request and validation
- CloudFormation deployment
- Security checklist
- Testing & troubleshooting
- Post-deployment configuration

**Use this for:** Detailed instructions for each deployment step

**Read time:** 30 minutes

---

### **3. cloudformation-with-domain.yml** 🏗️ INFRASTRUCTURE

**CloudFormation template** (745 lines) defining:

- VPC with public/private subnets
- RDS PostgreSQL 15.7 (db.t4g.micro)
- ElastiCache Redis 7.1 (cache.t4g.micro)
- S3 bucket with CORS
- Application Load Balancer with HTTPS
- Route53 DNS records
- ACM SSL certificate integration
- ECS Fargate cluster
- IAM roles and security groups
- Secrets Manager
- CloudWatch log groups

**Use this for:** AWS infrastructure as code

**Modify this for:** Custom resource configurations

---

### **4. deploy-with-domain.ps1** 🚀 AUTOMATION

**PowerShell deployment script** with:

- AWS SSO configuration wizard
- Route53 hosted zone creation
- GoDaddy nameserver prompts
- ACM certificate request with auto-validation
- CloudFormation stack deployment
- Parameter collection
- Post-deployment verification
- Dry-run mode for testing

**Use this for:** Automated deployment execution

**Run this to:** Deploy entire infrastructure with one command

---

### **5. validate-deployment.ps1** ✅ VALIDATION

**Pre-deployment validation script** checking:

- AWS CLI version
- PowerShell version
- CloudFormation template existence
- AWS profile configuration
- SSO session status
- Existing hosted zone
- Existing ACM certificate
- CloudFormation stack status
- DNS propagation status

**Use this for:** Verifying prerequisites before deployment

**Run this to:** Catch issues early before deploying

---

### **6. AWS_SSO_GODADDY_DEPLOYMENT.md** (Previous Version)

Legacy guide with manual steps. **Superseded by automated scripts above.**

Use DEPLOYMENT_SUMMARY.md and deploy-with-domain.ps1 instead.

---

## 🎯 Quick Start Paths

### **Path A: Automated Deployment (Recommended)**

Perfect for users who want minimal manual steps.

1. **Validate prerequisites:**

   ```powershell
   cd C:\Users\fjuni\ysh_medusa\ysh-store\aws
   .\validate-deployment.ps1
   ```

2. **Run full deployment:**

   ```powershell
   .\deploy-with-domain.ps1 `
       -Environment production `
       -DomainName yellosolarhub.store `
       -CreateHostedZone `
       -RequestCertificate `
       -DeployStack
   ```

3. **Update GoDaddy nameservers** when prompted

4. **Wait for completion** (45-60 minutes)

**Time:** ~60 minutes (mostly waiting)

**Manual steps:** 2 (SSO login, GoDaddy nameserver update)

---

### **Path B: Step-by-Step Deployment**

Perfect for users who want full control over each step.

1. **Read:** `DEPLOYMENT_SUMMARY.md` (overview)

2. **Read:** `DEPLOYMENT_GUIDE_DOMAIN.md` (detailed steps)

3. **Validate:** Run `.\validate-deployment.ps1`

4. **Configure SSO:**

   ```powershell
   .\deploy-with-domain.ps1 -Environment production
   ```

5. **Create hosted zone:**

   ```powershell
   .\deploy-with-domain.ps1 -CreateHostedZone
   ```

6. **Update GoDaddy nameservers** (copy from output)

7. **Wait 24-48 hours** for DNS propagation

8. **Request certificate:**

   ```powershell
   .\deploy-with-domain.ps1 -RequestCertificate
   ```

9. **Deploy stack:**

   ```powershell
   .\deploy-with-domain.ps1 -DeployStack
   ```

**Time:** 2-3 days (includes DNS propagation wait)

**Manual steps:** 3 (SSO login, GoDaddy update, parameter input)

---

### **Path C: Understanding Before Deploying**

Perfect for first-time AWS users or those wanting to understand every component.

1. **Read:** `DEPLOYMENT_SUMMARY.md` (10 min)

2. **Read:** `DEPLOYMENT_GUIDE_DOMAIN.md` (30 min)

3. **Review:** `cloudformation-with-domain.yml` (understand infrastructure)

4. **Review:** `deploy-with-domain.ps1` (understand automation)

5. **Dry-run:**

   ```powershell
   .\deploy-with-domain.ps1 -Environment production
   # Don't use -DeployStack flag yet
   ```

6. **Validate:** Run `.\validate-deployment.ps1`

7. **Deploy:** Follow Path A or Path B

**Time:** 1-2 hours study + deployment time

**Benefit:** Full understanding of AWS infrastructure

---

## 🔍 Common Use Cases

### **"I want to deploy as fast as possible"**

→ Follow **Path A** (Automated)

### **"I want to understand what's being created"**

→ Follow **Path C** (Understanding)

### **"I've deployed before and want control"**

→ Follow **Path B** (Step-by-step)

### **"I'm getting errors during deployment"**

→ Check **Troubleshooting** section in `DEPLOYMENT_GUIDE_DOMAIN.md`

### **"I want to estimate costs"**

→ See **Cost Breakdown** in `DEPLOYMENT_SUMMARY.md`

### **"I want to modify infrastructure"**

→ Edit `cloudformation-with-domain.yml` and validate

### **"I want to add monitoring/alerts"**

→ See **Next Steps** section in `DEPLOYMENT_SUMMARY.md`

### **"I need to delete everything"**

→ See **Stack Updates** section in `DEPLOYMENT_GUIDE_DOMAIN.md`

---

## 📊 File Relationships

```
validate-deployment.ps1          # Run first to check prerequisites
        ↓
deploy-with-domain.ps1          # Main automation script
        ↓
cloudformation-with-domain.yml  # Infrastructure definition
        ↓
[AWS Resources Created]         # VPC, RDS, Redis, S3, ALB, ECS...
        ↓
[Next Steps]                    # ECS task deployment, migrations, etc.
```

**Documentation flow:**

```
DEPLOYMENT_SUMMARY.md           # Overview (read first)
        ↓
DEPLOYMENT_GUIDE_DOMAIN.md     # Detailed guide (read for steps)
        ↓
validate-deployment.ps1         # Validation (run before deploy)
        ↓
deploy-with-domain.ps1         # Deployment (run to deploy)
```

---

## 🎓 Learning Resources

### **For AWS Beginners:**

1. Start with `DEPLOYMENT_SUMMARY.md` (overview)
2. Read "Infrastructure Created" section (understand resources)
3. Review "Cost Breakdown" (understand pricing)
4. Run `validate-deployment.ps1` (hands-on validation)
5. Read `DEPLOYMENT_GUIDE_DOMAIN.md` (detailed steps)

### **For AWS Intermediate:**

1. Read `DEPLOYMENT_SUMMARY.md` (quick refresh)
2. Review `cloudformation-with-domain.yml` (infrastructure code)
3. Run `deploy-with-domain.ps1` (automated deployment)
4. Monitor CloudFormation console (watch stack creation)

### **For AWS Advanced:**

1. Review `cloudformation-with-domain.yml` (validate architecture)
2. Modify template as needed (custom configurations)
3. Run `deploy-with-domain.ps1 -DeployStack` (deploy)
4. Implement auto-scaling, monitoring, backups (see Next Steps)

---

## 🛠️ Customization Guide

### **Change Domain Name:**

Edit these parameters in `deploy-with-domain.ps1`:

```powershell
-DomainName "yourdomain.com"
```

### **Change AWS Region:**

Edit these parameters:

```powershell
-Region "us-west-2"
```

**Note:** ACM certificate must be in `us-east-1` for ALB

### **Change Database Size:**

Edit `cloudformation-with-domain.yml`:

```yaml
DBInstanceClass: db.t4g.small  # Change from db.t4g.micro
AllocatedStorage: 40           # Change from 20 GB
```

### **Change ECS Task Resources:**

Edit task definitions (to be created):

```json
{
  "cpu": "512",      // 0.5 vCPU (change from 256)
  "memory": "1024"   // 1 GB (change from 512)
}
```

### **Add Auto-Scaling:**

See "Enable Auto-Scaling" in `DEPLOYMENT_SUMMARY.md`

### **Add WAF Protection:**

Create AWS WAF Web ACL and associate with ALB

### **Enable CloudTrail:**

Enable in AWS Console or add to CloudFormation template

---

## 📞 Support & Troubleshooting

### **Issue: Deployment fails**

1. Check `DEPLOYMENT_GUIDE_DOMAIN.md` → Troubleshooting section
2. Run `.\validate-deployment.ps1` to check prerequisites
3. Review CloudFormation events:

   ```powershell
   aws cloudformation describe-stack-events `
       --stack-name production-ysh-stack `
       --profile ysh-production
   ```

### **Issue: Domain not accessible**

1. Verify DNS propagation (can take 48 hours)
2. Check Route53 records exist
3. Verify ACM certificate status
4. Check ALB target group health

### **Issue: SSL certificate validation timeout**

1. Verify nameservers updated in GoDaddy
2. Wait for DNS propagation (24-48 hours)
3. Check Route53 CNAME validation records exist

### **Issue: Cost higher than expected**

1. Review billing dashboard
2. Check ECS task count (should be 1-2)
3. Verify RDS/Redis are FREE tier eligible
4. Check data transfer usage
5. Set up billing alerts

---

## ✅ Deployment Checklist

**Before Starting:**

- [ ] Read `DEPLOYMENT_SUMMARY.md`
- [ ] Review `DEPLOYMENT_GUIDE_DOMAIN.md`
- [ ] Run `.\validate-deployment.ps1`
- [ ] Ensure AWS account has AdministratorAccess
- [ ] Ensure GoDaddy domain ownership

**During Deployment:**

- [ ] Configure AWS SSO
- [ ] Create Route53 hosted zone
- [ ] Update GoDaddy nameservers
- [ ] Wait for DNS propagation
- [ ] Request ACM certificate
- [ ] Deploy CloudFormation stack
- [ ] Verify all outputs

**After Deployment:**

- [ ] Test domain accessibility
- [ ] Verify SSL certificate
- [ ] Check ALB target health
- [ ] Deploy ECS tasks (next step)
- [ ] Run database migrations
- [ ] Create admin user
- [ ] Configure monitoring
- [ ] Set up billing alerts

---

## 🎯 Success Criteria

**Deployment is successful when:**

- ✅ CloudFormation stack: `CREATE_COMPLETE`
- ✅ Route53 DNS resolves to ALB
- ✅ HTTPS works on all domains
- ✅ ACM certificate shows "Issued"
- ✅ ALB target groups healthy
- ✅ ECS tasks running
- ✅ No errors in CloudWatch logs
- ✅ Backend health check returns 200
- ✅ Storefront loads successfully

---

## 📈 Next Steps After Deployment

See "Next Steps After Deployment" section in `DEPLOYMENT_SUMMARY.md`:

1. Deploy ECS tasks (backend & storefront)
2. Run database migrations
3. Seed initial data
4. Create admin user
5. Configure Medusa admin
6. Update storefront environment
7. Set up monitoring & alerts
8. Enable auto-scaling (optional)

---

## 📚 Quick Reference

| Task | Command |
|------|---------|
| Validate prerequisites | `.\validate-deployment.ps1` |
| Full automated deployment | `.\deploy-with-domain.ps1 -CreateHostedZone -RequestCertificate -DeployStack` |
| Configure SSO only | `.\deploy-with-domain.ps1 -Environment production` |
| Create hosted zone only | `.\deploy-with-domain.ps1 -CreateHostedZone` |
| Request certificate only | `.\deploy-with-domain.ps1 -RequestCertificate` |
| Deploy stack only | `.\deploy-with-domain.ps1 -DeployStack` |
| Check stack status | `aws cloudformation describe-stacks --stack-name production-ysh-stack --profile ysh-production` |
| View CloudWatch logs | `aws logs tail /aws/ecs/production-ysh-backend --follow --profile ysh-production` |
| List ECS tasks | `aws ecs list-tasks --cluster production-ysh-cluster --profile ysh-production` |
| Delete stack | `aws cloudformation delete-stack --stack-name production-ysh-stack --profile ysh-production` |

---

**🚀 Ready to deploy YSH B2B Platform on AWS!**

**Start here:** `DEPLOYMENT_SUMMARY.md` → `validate-deployment.ps1` → `deploy-with-domain.ps1`

**Questions?** Check `DEPLOYMENT_GUIDE_DOMAIN.md` → Troubleshooting section
