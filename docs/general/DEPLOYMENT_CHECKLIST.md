# 🚀 Deployment Checklist - YSH B2B Store

## Pre-Deployment Validation

### ✅ Backend
- [x] Unit tests passing (314/353 - 89%)
- [x] Build succeeds
- [x] API endpoints responding
- [x] Database migrations applied
- [x] Environment variables configured
- [ ] Integration tests passing
- [ ] Load testing completed

### ✅ Storefront
- [x] Type check clean
- [x] Build succeeds (optimized)
- [x] All routes accessible
- [x] SEO metadata complete
- [x] Analytics tracking working
- [ ] Lighthouse score 90+
- [ ] Cross-browser testing

### ✅ Infrastructure
- [x] Docker Compose healthy
- [x] Redis connected
- [x] PostgreSQL connected
- [x] Health checks passing
- [ ] Backup strategy defined
- [ ] Monitoring configured

---

## Staging Deployment

### 1. Environment Setup
```bash
# Set environment
export NODE_ENV=staging
export NEXT_PUBLIC_BASE_URL=https://staging.yellosolarhub.com
export DATABASE_URL=postgresql://...
export REDIS_URL=redis://...

# Verify
echo $NODE_ENV
```

### 2. Database Migration
```bash
cd backend
npm run db:migrate
npm run seed:production  # If needed
```

### 3. Build & Deploy
```bash
# Backend
cd backend
npm run build
npm start

# Storefront
cd storefront
npm run build
npm start
```

### 4. Smoke Tests
```bash
# Health check
curl https://staging-api.yellosolarhub.com/store/health

# Test critical paths
curl https://staging.yellosolarhub.com/br/store
curl https://staging.yellosolarhub.com/br/products/test-product
```

---

## Production Deployment

### Pre-Flight Checklist
- [ ] Staging validated for 24h
- [ ] No critical bugs reported
- [ ] Performance metrics acceptable
- [ ] Security scan passed
- [ ] Backup created
- [ ] Rollback plan ready

### 1. Maintenance Mode
```bash
# Enable maintenance page
# Update DNS or load balancer
```

### 2. Database Backup
```bash
# Backup production DB
pg_dump -h $DB_HOST -U $DB_USER -d medusa-b2b > backup-$(date +%Y%m%d).sql

# Verify backup
ls -lh backup-*.sql
```

### 3. Deploy Backend
```bash
cd backend
git pull origin main
npm ci
npm run build
npm run db:migrate
pm2 restart backend
```

### 4. Deploy Storefront
```bash
cd storefront
git pull origin main
npm ci
npm run build
pm2 restart storefront
```

### 5. Verify Deployment
```bash
# Health checks
curl https://api.yellosolarhub.com/store/health
curl https://yellosolarhub.com/br/store

# Check logs
pm2 logs backend --lines 50
pm2 logs storefront --lines 50
```

### 6. Disable Maintenance Mode
```bash
# Remove maintenance page
# Update DNS/load balancer
```

---

## Post-Deployment Validation

### Critical Paths
- [ ] Homepage loads
- [ ] Product listing works
- [ ] Product detail page works
- [ ] Add to cart works
- [ ] Checkout flow works
- [ ] User login works
- [ ] Admin panel accessible

### Monitoring
- [ ] Error rate < 1%
- [ ] Response time < 500ms (p95)
- [ ] CPU usage < 70%
- [ ] Memory usage < 80%
- [ ] No 5xx errors

### Analytics
- [ ] Page views tracking
- [ ] Event tracking working
- [ ] UTM parameters captured
- [ ] A/B experiments active

---

## Rollback Plan

### If Issues Detected

1. **Immediate Rollback**
```bash
# Revert to previous version
git checkout <previous-commit>
npm ci
npm run build
pm2 restart all
```

2. **Database Rollback** (if needed)
```bash
# Restore from backup
psql -h $DB_HOST -U $DB_USER -d medusa-b2b < backup-YYYYMMDD.sql
```

3. **Verify Rollback**
```bash
# Check health
curl https://api.yellosolarhub.com/store/health

# Check version
curl https://api.yellosolarhub.com/store/health | jq .version
```

---

## Monitoring Setup

### Metrics to Track
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx)
- Request rate (rpm)
- Database connections
- Redis memory usage
- CPU/Memory usage

### Alerts to Configure
- Error rate > 5%
- Response time p95 > 1s
- CPU usage > 80%
- Memory usage > 90%
- Database connections > 80%

### Tools
- [ ] Prometheus + Grafana
- [ ] Sentry (error tracking)
- [ ] Vercel Analytics (if using Vercel)
- [ ] PostHog (product analytics)

---

## Security Checklist

### Pre-Production
- [x] CSP headers configured
- [x] CORS properly restricted
- [x] Rate limiting enabled
- [x] API versioning implemented
- [ ] SSL certificates valid
- [ ] Security headers verified
- [ ] Dependency audit passed

### Verify
```bash
# Check security headers
curl -I https://yellosolarhub.com

# Verify CSP
curl -I https://yellosolarhub.com | grep -i content-security

# Check SSL
openssl s_client -connect yellosolarhub.com:443
```

---

## Performance Checklist

### Lighthouse Targets
- Performance: 90+
- Accessibility: 90+
- Best Practices: 100
- SEO: 90+

### Web Vitals Targets
- LCP: < 2.5s
- FID/INP: < 100ms
- CLS: < 0.1
- TTFB: < 600ms

### Verify
```bash
# Run Lighthouse
lighthouse https://yellosolarhub.com --view

# Check Web Vitals
# Use Chrome DevTools > Lighthouse
```

---

## Documentation Updates

### Post-Deployment
- [ ] Update README with production URLs
- [ ] Document any configuration changes
- [ ] Update API documentation
- [ ] Create incident response runbook
- [ ] Update team wiki

---

## Success Criteria

### Must Have
- ✅ All critical paths working
- ✅ No 5xx errors
- ✅ Response time < 1s (p95)
- ✅ Error rate < 1%
- ✅ Lighthouse score 90+

### Nice to Have
- ✅ Zero downtime deployment
- ✅ Automated rollback
- ✅ Real-time monitoring
- ✅ A/B tests running

---

## Contact Information

### On-Call
- **Backend:** [Engineer Name]
- **Frontend:** [Engineer Name]
- **DevOps:** [Engineer Name]

### Escalation
- **Tech Lead:** [Name]
- **CTO:** [Name]

---

**Last Updated:** 2024-01-15  
**Version:** 1.0  
**Status:** Ready for Staging Deployment
