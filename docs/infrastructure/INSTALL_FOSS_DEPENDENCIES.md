# 🎯 FOSS Stack Implementation - Installation Script

## Quick Install - All Dependencies

### Storefront Dependencies

```powershell
cd storefront

# Pact testing dependencies
npm install --save-dev @pact-foundation/pact jest-pact

# BackstopJS for visual regression (global install recommended)
npm install -g backstopjs
# Or as dev dependency
npm install --save-dev backstopjs
```

### Backend Dependencies

```powershell
cd backend

# Pact testing dependencies
npm install --save-dev @pact-foundation/pact
```

---

## Validation Commands

### 1. Start Infrastructure

```powershell
# From root
docker-compose -f docker-compose.foss.yml up -d
docker-compose -f docker-compose.node-red.yml up -d

# Verify services
docker-compose -f docker-compose.foss.yml ps
```

### 2. Visual Regression Tests

```powershell
cd storefront

# Create baseline
npm run test:visual:reference

# Run tests
npm run test:visual

# View results
npm run test:visual:report
```

### 3. Contract Tests - Consumer

```powershell
cd storefront

# Generate contracts
npm run test:pact:consumer

# Publish to broker
npm run test:pact:publish

# View in Pact Broker: http://localhost:9292 (pact/pact)
```

### 4. Contract Tests - Provider

```powershell
cd backend

# Ensure backend is running
npm run dev

# In another terminal, run verification
npm run test:pact:provider

# Check if can deploy
npm run test:pact:can-i-deploy
```

---

## Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Pact Broker | <http://localhost:9292> | pact / pact |
| Node-RED | <http://localhost:1880> | admin / admin |
| Grafana | <http://localhost:3001> | admin / admin |
| Prometheus | <http://localhost:9090> | - |
| Jaeger | <http://localhost:16686> | - |
| Mailhog | <http://localhost:8025> | - |
| Backend | <http://localhost:9000> | - |
| Storefront | <http://localhost:8000> | - |

---

## Expected Results

### Visual Regression

- ✅ 18 scenarios captured
- ✅ Reference bitmaps created in `storefront/backstop/bitmaps_reference/`
- ✅ HTML report available via `npm run test:visual:report`

### Contract Testing

- ✅ 18+ contract interactions generated in `storefront/pacts/`
- ✅ Contracts visible in Pact Broker UI
- ✅ Provider verification passes
- ✅ Can-i-deploy check passes

---

## Troubleshooting

### BackstopJS fails to install

```powershell
# Use global install
npm install -g backstopjs

# Or use npx instead
npx backstop test --config=backstop/backstop.json
```

### Pact tests fail with "Cannot find module"

```powershell
# Ensure dependencies are installed
npm install --save-dev @pact-foundation/pact jest-pact

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Pact Broker not accessible

```powershell
# Check if running
docker-compose -f docker-compose.foss.yml ps pact-broker

# Restart
docker-compose -f docker-compose.foss.yml restart pact-broker

# View logs
docker-compose -f docker-compose.foss.yml logs pact-broker
```

### Provider verification fails

```powershell
# Ensure backend is running
docker-compose ps backend
# Or
npm run dev

# Check backend logs for errors
docker-compose logs backend
```

---

## Success Criteria

✅ **All services running** - `docker-compose ps` shows all healthy  
✅ **Visual tests pass** - BackstopJS generates report without errors  
✅ **Contracts generated** - Files exist in `storefront/pacts/`  
✅ **Contracts published** - Visible in Pact Broker UI  
✅ **Provider verification passes** - All consumer expectations met  
✅ **Can-i-deploy passes** - Safe to deploy to production  

---

## Support

- [PACT_SETUP_GUIDE.md](./PACT_SETUP_GUIDE.md) - Detailed Pact setup
- [VISUAL_REGRESSION_FOSS_GUIDE.md](./VISUAL_REGRESSION_FOSS_GUIDE.md) - BackstopJS guide
- [FOSS_TESTING_DOCUMENTATION_INDEX.md](./FOSS_TESTING_DOCUMENTATION_INDEX.md) - All docs

---

**Status**: Ready for installation and validation 🚀
