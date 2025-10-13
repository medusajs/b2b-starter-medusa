# 🚀 Storefront Deployment Plan

**Date:** October 12, 2025  
**Build ID:** `A3vhMEBM7tkM2YhZm9lGQ`  
**Status:** ✅ Ready for Deployment

---

## 📋 Pre-Deployment Checklist

- [x] ✅ Build successful (standalone output ready)
- [x] ✅ TypeScript validation passed (production code)
- [x] ✅ Security headers configured (CSP)
- [x] ✅ Environment variables present (.env.local)
- [x] ✅ Image optimization enabled (next/image)
- [x] ✅ Analytics consent management implemented
- [x] ✅ SEO metadata complete (JSON-LD, OG, Twitter)
- [x] ✅ A11y baseline validated

---

## 🎯 Deployment Options

### Option 1: Local Production Server (Quick Test)

**Best for:** Testing production build locally before cloud deployment

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\storefront

# Set production environment
$env:NODE_ENV="production"

# Start standalone server
node .next/standalone/server.js

# Server will start on http://localhost:3000
```

**Access:** <http://localhost:3000>

---

### Option 2: Docker Container (Recommended)

**Best for:** Containerized deployments (AWS ECS, GCP Cloud Run, Azure Container Instances)

#### Step 1: Create Optimized Dockerfile

```dockerfile
# File: storefront/Dockerfile.production
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build with standalone output
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### Step 2: Build Docker Image

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\storefront

# Build image
docker build -t ysh-storefront:latest -f Dockerfile.production .

# Verify image
docker images | Select-String "ysh-storefront"
```

#### Step 3: Run Container Locally (Test)

```powershell
# Run with environment variables
docker run -d `
  --name ysh-storefront `
  -p 3000:3000 `
  -e NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yellosolarhub.com `
  -e NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx `
  -e NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx `
  ysh-storefront:latest

# Check logs
docker logs -f ysh-storefront

# Access: http://localhost:3000

# Stop container
docker stop ysh-storefront
docker rm ysh-storefront
```

---

### Option 3: AWS Deployment

**Best for:** Production deployments with AWS infrastructure

#### A. AWS ECS (Elastic Container Service)

```powershell
# 1. Authenticate with AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# 2. Create ECR repository (first time only)
aws ecr create-repository --repository-name ysh-storefront --region us-east-1

# 3. Tag image
docker tag ysh-storefront:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:latest

# 4. Push to ECR
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:latest

# 5. Update ECS service (if task definition exists)
aws ecs update-service --cluster ysh-cluster --service storefront --force-new-deployment
```

#### B. AWS Amplify (Alternative)

```powershell
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify
cd c:\Users\fjuni\ysh_medusa\ysh-store\storefront
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

---

### Option 4: Vercel Deployment (Easiest)

**Best for:** Quick deployment with zero configuration

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to production
cd c:\Users\fjuni\ysh_medusa\ysh-store\storefront
vercel --prod

# Follow prompts to configure environment variables
```

**Environment Variables in Vercel:**

- Go to Project Settings → Environment Variables
- Add:
  - `NEXT_PUBLIC_MEDUSA_BACKEND_URL`
  - `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
  - `NEXT_PUBLIC_POSTHOG_KEY` (optional)
  - `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional)

---

## 🔧 Environment Variables Configuration

### Required Variables

```bash
# Backend Connection
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yellosolarhub.com

# Medusa Publishable Key (get from Admin → Settings → API Keys)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx
```

### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Site Verification
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=xxxxx

# Base URL (for canonical URLs)
NEXT_PUBLIC_BASE_URL=https://yellosolarhub.com

# Custom Analytics Endpoint
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://analytics.example.com/api/events
```

---

## 🔍 Post-Deployment Validation

### 1. Health Check

```powershell
# Check if server is responding
curl -I https://your-domain.com

# Expected: HTTP/2 200
```

### 2. Core Pages Validation

Visit these URLs and verify they load correctly:

- ✅ Homepage: `https://your-domain.com`
- ✅ Categories: `https://your-domain.com/br/categories`
- ✅ Product Page: `https://your-domain.com/br/products/[handle]`
- ✅ Cart: `https://your-domain.com/br/cart`
- ✅ Account: `https://your-domain.com/br/account`

### 3. Functionality Tests

- [ ] Images loading correctly (WebP/AVIF)
- [ ] Analytics tracking working (check PostHog/GA4)
- [ ] Consent banner appears on first visit
- [ ] UTM parameters captured in cookies
- [ ] A/B experiment bucket assigned
- [ ] SEO metadata present (view source)
- [ ] JSON-LD structured data in PDPs

### 4. Performance Check

```powershell
# Run Lighthouse audit
lighthouse https://your-domain.com --view

# Or use PageSpeed Insights
# Visit: https://pagespeed.web.dev/
```

**Target Scores:**

- Performance: 90+
- SEO: 95+
- Accessibility: 90+
- Best Practices: 95+

---

## 📊 Monitoring Setup

### 1. Vercel Analytics (if using Vercel)

Already integrated via `@vercel/analytics/next`

**Dashboard:** <https://vercel.com/[your-project]/analytics>

### 2. PostHog

```typescript
// Already configured in src/providers/posthog-provider.tsx
// Set NEXT_PUBLIC_POSTHOG_KEY in environment variables
```

**Dashboard:** <https://app.posthog.com>

### 3. Google Analytics 4

```typescript
// Set NEXT_PUBLIC_GA_MEASUREMENT_ID
// Tracking automatically integrated via sku-analytics.tsx
```

**Dashboard:** <https://analytics.google.com>

### 4. Error Tracking (Sentry - Optional)

```powershell
# Install Sentry
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard@latest -i nextjs

# Configure DSN in environment variables
SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
```

---

## 🚨 Rollback Plan

### If Deployment Fails

#### Option 1: Revert Docker Container

```powershell
# Stop current container
docker stop ysh-storefront

# Run previous version
docker run -d --name ysh-storefront -p 3000:3000 ysh-storefront:previous
```

#### Option 2: Revert Vercel Deployment

```powershell
# List deployments
vercel ls

# Promote previous deployment
vercel promote [previous-deployment-url]
```

#### Option 3: Revert ECS Service

```powershell
# Update to previous task definition
aws ecs update-service --cluster ysh-cluster --service storefront --task-definition storefront:PREVIOUS_REVISION
```

---

## 🔐 Security Checklist

Before going live:

- [ ] HTTPS enabled (SSL certificate)
- [ ] CSP headers active (verify in browser DevTools)
- [ ] Environment variables secured (not exposed in client)
- [ ] API keys restricted to domain (Medusa Admin)
- [ ] Rate limiting configured (if applicable)
- [ ] CORS configured on backend
- [ ] Firewall rules set (if applicable)

---

## 📈 Optimization Recommendations

### After Deployment

1. **Enable CDN**
   - CloudFlare, AWS CloudFront, or Vercel Edge Network
   - Cache static assets (images, fonts, JS/CSS)

2. **Configure Cache Headers**
   - Already configured in `next.config.js`
   - Verify with: `curl -I https://your-domain.com/_next/static/...`

3. **Set Up Monitoring Alerts**
   - Core Web Vitals degradation
   - Error rate > 1%
   - Response time > 1s
   - 5xx errors

4. **Database Connection Pool** (if using direct DB)
   - Configure max connections
   - Set up connection timeout

---

## 🎯 Success Metrics

Monitor these KPIs post-deployment:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Uptime** | 99.9% | Monitoring dashboard |
| **LCP** | < 2.5s | Lighthouse, Core Web Vitals |
| **FID** | < 100ms | Core Web Vitals |
| **CLS** | < 0.1 | Core Web Vitals |
| **Error Rate** | < 1% | Sentry, logs |
| **Conversion Rate** | Baseline +10% | Analytics funnel |
| **SEO Traffic** | Baseline +20% | Google Search Console |

---

## 📞 Support Contacts

**Issues During Deployment:**

1. Check logs:

   ```powershell
   # Docker
   docker logs ysh-storefront
   
   # Vercel
   vercel logs
   
   # AWS ECS
   aws ecs describe-tasks --cluster ysh-cluster --tasks [task-id]
   ```

2. Review documentation:
   - `REVIEW_SUMMARY.md` - Quick overview
   - `STOREFRONT_360_REVIEW_REPORT.md` - Technical details
   - `QUICK_START.md` - Troubleshooting guide

3. Backend health check:

   ```powershell
   curl https://api.yellosolarhub.com/health
   ```

---

## ✅ Final Pre-Deployment Command

**Run this NOW to start deployment:**

```powershell
# Navigate to storefront
cd c:\Users\fjuni\ysh_medusa\ysh-store\storefront

# Choose your deployment method:

# Option A: Local Production Test
$env:NODE_ENV="production"; node .next/standalone/server.js

# Option B: Docker
docker build -t ysh-storefront:latest -f Dockerfile.production .; docker run -d --name ysh-storefront -p 3000:3000 -e NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yellosolarhub.com ysh-storefront:latest

# Option C: Vercel (Recommended)
vercel --prod
```

---

**Deployment Approved By:** AI Staff Engineer  
**Deployment Date:** October 12, 2025  
**Next Review:** 7 days post-deployment
