# 🎯 BACKEND V7 - Plano de Execução

**Data:** 2025-01-XX  
**Escopo:** backend/ (Medusa 2.10.3, MikroORM 6.4, TS 5)  
**Objetivo:** Revisão 360º cirúrgica com diffs mínimos

---

## ✅ Status Atual

### Quote Module (P0)
- ✅ **RESOLVIDO**: ESM fix aplicado com sucesso
- ✅ `src/modules/quote/package.json` criado com `{"type": "module"}`
- ✅ Extensões `.js` adicionadas em 5 arquivos
- ✅ Workflows reabilitados (`src/workflows/quote/`)
- ✅ Links reabilitados (`src/links/quote-links.ts`)
- ✅ **Typecheck**: 0 erros relacionados ao Quote

### Infraestrutura Existente
- ✅ Cache.clear com SCAN+DEL (sem KEYS)
- ✅ APIResponse + X-API-Version em Solar Calculator
- ✅ ANEEL concessionárias com APIResponse
- ✅ CV middleware com RateLimiter (Redis)
- ✅ PV http client sem setInterval em test

---

## 📋 Plano de 8 Passos

### ✅ Passo 1: Quote ESM Fix (P0) - CONCLUÍDO
**Tempo:** 30min  
**Status:** ✅ **COMPLETO**

- [x] Criar `package.json` local com ESM
- [x] Ajustar imports com extensões `.js`
- [x] Reabilitar workflows e links
- [x] Typecheck validado (0 erros Quote)

---

### 🔄 Passo 2: Padronizar Rotas Custom Restantes
**Tempo:** 1h  
**Status:** 🔄 **EM PROGRESSO**

#### Rotas a Padronizar

**ANEEL (3 rotas)**
- [ ] `/api/aneel/calculate-savings` (POST)
  - ❌ Não usa APIResponse.success
  - ❌ Não seta X-API-Version
  - ✅ Tem rate limiting
- [ ] `/api/aneel/concessionarias` (GET) - **JÁ PADRONIZADO**
- [ ] `/api/aneel/tariffs` (GET) - **JÁ PADRONIZADO**

**Solar (2 rotas)**
- [ ] `/api/solar/viability` (POST)
  - ❌ Não usa APIResponse.success
  - ❌ Não seta X-API-Version
  - ✅ Tem rate limiting
- [ ] `/api/solar/viability` (GET - quick)
  - ❌ Não usa APIResponse.success
  - ❌ Não seta X-API-Version
  - ✅ Tem rate limiting

**PVLib (4 rotas)**
- [x] `/api/pvlib/inverters` (GET) - **JÁ PADRONIZADO**
- [ ] `/api/pvlib/panels` (GET)
- [ ] `/api/pvlib/stats` (GET)
- [ ] `/api/pvlib/validate-mppt` (POST)

**Financing (2 rotas)**
- [ ] `/api/financing/rates` (GET)
- [ ] `/api/financing/simulate` (POST)

**Credit Analysis (1 rota)**
- [ ] `/api/credit-analysis` (POST)

**Total:** 12 rotas (1 concluída, 11 pendentes)

#### Padrão a Aplicar
```typescript
// 1. Rate limiting (já aplicado na maioria)
const limiter = RateLimiter.getInstance()
const limitResult = await limiter.checkLimit(...)
res.setHeader('X-RateLimit-Limit', limitResult.limit)
res.setHeader('X-RateLimit-Remaining', limitResult.remaining)
res.setHeader('X-RateLimit-Reset', new Date(limitResult.resetTime).toISOString())

// 2. Versioning
res.setHeader("X-API-Version", APIVersionManager.formatVersion(APIVersionManager.CURRENT_API_VERSION))

// 3. Response envelope
APIResponse.success(res, data, metadata)
APIResponse.error(res, statusCode, message, details)
APIResponse.rateLimit(res, message) // já aplicado
```

---

### 🔄 Passo 3: Versionamento Global
**Tempo:** 30min  
**Status:** ⏳ **PENDENTE**

- [ ] Middleware global para aceitar versão via header/query
- [ ] Garantir X-API-Version em todas as respostas custom
- [ ] Documentar estratégia de versionamento

---

### 🔄 Passo 4: PVLib Testes
**Tempo:** 1h  
**Status:** ⏳ **PENDENTE**

**Problemas Atuais:**
- ❌ Timeouts em testes (open handles)
- ❌ Métricas response_times vazias (p95/p99 = 0)

**Soluções:**
- [ ] Usar fake timers (jest.useFakeTimers)
- [ ] DI de `request_timeout_ms` baixo em test
- [ ] Mock de métricas com valores realistas
- [ ] Garantir cleanup de timers/promises

**Arquivos:**
- `src/modules/pvlib-integration/__tests__/service.unit.spec.ts`
- `src/modules/pvlib-integration/service.ts`

---

### 🔄 Passo 5: Approval/Financing Testes
**Tempo:** 1h  
**Status:** ⏳ **PENDENTE**

**Problemas Atuais:**
- ❌ Injeção de manager/repository falha
- ❌ Dependências de BD real

**Soluções:**
- [ ] Criar harness de manager/repository (mock)
- [ ] Usar utils de teste do Medusa (Modules SDK)
- [ ] Cobrir regras/estados principais sem BD

**Arquivos:**
- `src/modules/approval/__tests__/service.unit.spec.ts`
- `src/modules/financing/__tests__/service.unit.spec.ts`

---

### 🔄 Passo 6: Integration:modules
**Tempo:** 30min  
**Status:** ⏳ **PENDENTE**

- [ ] Garantir que setup ignora módulos desativados
- [ ] Alternativa: stub leve do service em NODE_ENV=test
- [ ] Validar que todos os módulos carregam corretamente

---

### 🔄 Passo 7: Pact Provider (Subset)
**Tempo:** 1h  
**Status:** ⏳ **PENDENTE**

- [ ] Fixtures determinísticos para quotes/cart/catalog
- [ ] Verificação com rotas pactadas
- [ ] Mock apenas em test para rotas não cobertas

**Arquivos:**
- `pact/fixtures/catalog.ts` (já existe)
- `pact/fixtures/quotes.ts` (já existe)
- `pact/provider.pact.test.ts`

---

### 🔄 Passo 8: Observabilidade/Prod
**Tempo:** 30min  
**Status:** ⏳ **PENDENTE**

- [ ] Validar logs pino com request_id/duração/status
- [ ] Validar CACHE com Redis em produção
- [ ] Validar WORKFLOW com Redis
- [ ] Validar file provider S3

---

## 🧪 Validações

### Typecheck
```bash
cd backend && npm run typecheck
```
**Status Atual:** 32 erros pré-existentes (não relacionados ao Quote)

### Testes Unitários
```bash
npm run test:unit
```
**Status Atual:** 329 passing (pvlib/approval/financing com issues)

### Testes de Integração
```bash
npm run test:integration:modules
```
**Status Atual:** Pendente validação

### Pact Provider
```bash
npm run test:pact:provider
```
**Status Atual:** Pendente implementação

### Build
```bash
npm run build
```
**Status Atual:** Pendente validação

---

## 📊 Progresso Geral

- ✅ **Passo 1:** Quote ESM Fix - **100%**
- 🔄 **Passo 2:** Rotas Custom - **8%** (1/12)
- ⏳ **Passo 3:** Versionamento - **0%**
- ⏳ **Passo 4:** PVLib Testes - **0%**
- ⏳ **Passo 5:** Approval/Financing Testes - **0%**
- ⏳ **Passo 6:** Integration:modules - **0%**
- ⏳ **Passo 7:** Pact Provider - **0%**
- ⏳ **Passo 8:** Observabilidade - **0%**

**Total:** 12.5% completo

---

## 🎯 Próximos Passos Imediatos

1. **Padronizar rotas ANEEL/Solar/PVLib** (Passo 2)
   - Aplicar APIResponse.success + X-API-Version
   - 11 rotas pendentes
   - Tempo estimado: 1h

2. **Estabilizar testes PVLib** (Passo 4)
   - Fake timers + DI de timeout
   - Mock de métricas
   - Tempo estimado: 1h

3. **Validar build completo**
   - Garantir 0 erros de compilação
   - Smoke test das APIs
   - Tempo estimado: 15min

---

## 📝 Critérios de Aceite

- [x] Quote compila e funciona
- [x] Workflows/links reativados
- [ ] Rotas custom com APIResponse + X-API-Version
- [ ] 429 com Retry-After onde aplicável
- [ ] pvlib/approval/financing testes estáveis
- [ ] integration:modules verde
- [ ] Pact Provider verde (subset)
- [ ] Cache.clear sem KEYS
- [ ] CORS/RL corretos em prod
- [ ] Logs com request_id

**Status:** 2/10 critérios atendidos (20%)

---

**Tempo Total Estimado:** 6h  
**Tempo Gasto:** 30min  
**Tempo Restante:** 5h30min
