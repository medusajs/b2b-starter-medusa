# Backend - Deployment Quick Start

## ✅ Pré-Validação (Checklist)

Execute antes de fazer deploy:

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend

# 1. Testes (deve mostrar ~89% pass rate)
npm run test:unit
npm run test:integration:modules

# 2. Build (deve compilar sem erros críticos)
npm run build

# 3. Lint (opcional - warnings ok)
npm run lint
```

**Resultado Esperado**:

- ✅ Testes: 674/754 (89.4%)
- ✅ Build: Sucesso
- ⚠️ TypeScript: 46 warnings (não-bloqueantes)

---

## 🔧 Variáveis de Ambiente (Produção)

### Essenciais

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/medusa_db?sslmode=require

# Redis
REDIS_URL=redis://user:pass@host:6379
MEDUSA_REDIS_URL=redis://user:pass@host:6379

# Segurança
JWT_SECRET=<gerado-com-openssl-rand-hex-32>
COOKIE_SECRET=<gerado-com-openssl-rand-hex-32>
NODE_ENV=production

# CORS (IMPORTANTE!)
STORE_CORS=https://loja.seudominio.com,https://app.seudominio.com
ADMIN_CORS=https://admin.seudominio.com
AUTH_CORS=https://loja.seudominio.com,https://admin.seudominio.com
CV_CORS_ORIGINS=https://cv.seudominio.com,https://app.seudominio.com
```

### Opcionais

```bash
# Computer Vision
SOLAR_CV_API_KEYS=key1,key2,key3

# Catalog
YSH_CATALOG_PATH=./data/catalog
```

---

## 🚀 Deploy Steps

### 1. Docker (Recomendado)

```bash
# Build image
docker build -t ysh-backend:latest -f Dockerfile .

# Run migrations
docker run --rm \
  --env-file .env.production \
  ysh-backend:latest \
  npm run migrate

# Start server
docker run -d \
  --name ysh-backend \
  --env-file .env.production \
  -p 9000:9000 \
  ysh-backend:latest
```

### 2. PM2 (Node.js Direct)

```bash
# Install dependencies
npm ci --production

# Run migrations
npm run migrate

# Start with PM2
pm2 start npm --name ysh-backend -- start
pm2 save
pm2 startup
```

---

## 🔍 Health Checks

### 1. Basic Health

```bash
curl http://localhost:9000/health
# Expected: {"status":"ok"}
```

### 2. Redis Connection

```bash
curl http://localhost:9000/store/internal-catalog/health
# Expected: {"redis":{"connected":true}}
```

### 3. Rate Limiting

```bash
# Should see rate limit headers
curl -I http://localhost:9000/store/catalog/skus
# Expected headers:
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 99
# X-RateLimit-Reset: <timestamp>
```

### 4. CORS Validation

```bash
# Should deny unknown origins in production
curl -H "Origin: https://unknown-domain.com" \
     http://localhost:9000/store/catalog/skus
# Expected: 403 Forbidden (se CV_CORS_ORIGINS configurado)
```

---

## 📊 Monitoring (Produção)

### Redis Cache Stats

```javascript
// Via API route ou script
const cacheManager = CacheManager.getInstance();
const stats = await cacheManager.getStats();
console.log('Connected:', stats.connected);
console.log('Keys:', stats.dbSize);
console.log('Memory:', stats.memory.used_memory_human);
```

### Rate Limit Violations

```bash
# Logs devem mostrar 429 responses
grep "Rate limit exceeded" /var/log/medusa/app.log
```

### CORS Denials

```bash
# Logs devem mostrar 403 CORS errors
grep "E403_ORIGIN" /var/log/medusa/app.log
```

---

## 🛠️ Troubleshooting

### Issue: "haste module naming collision"

**Solução**: Já corrigido em jest.config.js (modulePathIgnorePatterns)

### Issue: Rate limit não funciona multi-instance

**Solução**: Verificar REDIS_URL configurado (não usar in-memory)

### Issue: CORS 403 em produção

**Solução**: Configurar CV_CORS_ORIGINS com lista explícita de origens

### Issue: Cache lento em produção

**Solução**: Usar Redis (não in-memory) via medusa-config.ts

---

## 📈 Performance Targets

| Métrica | Target | Como Medir |
|---------|--------|------------|
| API Response Time | <200ms | `curl -w "@curl-format.txt" <url>` |
| Cache Hit Rate | >80% | Redis INFO stats |
| Rate Limit Overhead | <5ms | Middleware timing logs |
| SCAN vs KEYS | 0 KEYS | Redis MONITOR (não deve ver KEYS) |

---

## 🔐 Security Checklist

- [ ] `JWT_SECRET` != "supersecret"
- [ ] `COOKIE_SECRET` != "supersecret"
- [ ] `CV_CORS_ORIGINS` configurado (sem wildcard)
- [ ] `DATABASE_URL` com `?sslmode=require`
- [ ] `REDIS_URL` com TLS (se disponível)
- [ ] Rate limiting Redis habilitado
- [ ] Cache usando Redis (não in-memory)
- [ ] CORS sem wildcard em produção

---

## 📞 Support

- **Documentação Completa**: `BACKEND_SURGICAL_IMPROVEMENTS_REPORT.md`
- **Sumário Executivo**: `BACKEND_360_FINAL_SUMMARY.md`
- **Unified Catalog**: `src/modules/unified-catalog/IMPLEMENTATION_SUMMARY.md`

---

**Última Atualização**: 2025-01-12  
**Status**: ✅ Pronto para Produção
