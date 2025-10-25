# 🧪 Diagnóstico de Testes PLG - Suite Completa (25 testes)

**Data**: 2025-10-13  
**Status**: ⚠️ 5/25 testes passando (20.0% success rate)

---

## 📊 Resultados Atuais

### ✅ Testes Passando (5)

1. **Solar Calc - Unauthorized** → 401 (esperado)
2. **Credit Analysis - GET by ID (404)** → 404 (esperado)
3. **Credit Analysis - Validation error** → 400 (esperado)
4. **Financing App - GET by ID (404)** → 404 (esperado)
5. **Financing App - Validation error** → 400 (esperado)

### ❌ Testes Falhando (20)

#### 🔴 Problema 1: Auth Context não populado (6 tests)

**Endpoints afetados:**

- `POST /store/solar_calculations` (6 testes)

**Erro:**

```
Status: 401 | Error: Unauthorized - login required
```

**Causa Raiz:**

- O middleware `authenticate("customer", ["session", "bearer"])` foi adicionado mas o servidor não foi reiniciado
- O `req.auth_context` não está sendo populado apesar do token Bearer estar correto no header

**Arquivos Criados/Modificados:**

- ✅ `src/api/store/solar_calculations/middlewares.ts` (criado)
- ✅ `src/api/store/middlewares.ts` (importação adicionada)
- ✅ `src/api/store/solar_calculations/route.ts` (usa `req.auth_context?.actor_id`)

**Solução Necessária:**

1. Reiniciar o servidor Medusa: `npm run dev` (ou processo equivalente)
2. Verificar se middleware está registrado: checar logs de startup
3. Testar endpoint isoladamente com curl + Bearer token

---

#### 🔴 Problema 2: EntityManager não registrado no Container (8 tests)

**Endpoints afetados:**

- `POST /store/credit-analyses` (4 testes)
- `POST /store/financing-applications` (4 testes)

**Erro:**

```
Status: 500 | Error: Could not resolve 'entityManager'.
Resolution path: entityManager
```

**Causa Raiz:**

- Os workflows `analyzeCreditWorkflow` e `applyFinancingWorkflow` tentam resolver `entityManager` do container
- Medusa 2.x não registra `entityManager` por padrão (usa módulos isolados)

**Workflows Afetados:**

- `src/workflows/credit-analysis/analyze-credit.ts`
- `src/workflows/financing/apply-financing.ts`

**Solução Necessária:**

1. **Opção A (Recomendada)**: Refatorar workflows para usar módulos Medusa nativos

   ```typescript
   // Ao invés de:
   const em = container.resolve("entityManager")
   
   // Usar:
   const creditService = container.resolve("creditAnalysisService") // custom module
   // ou query direto via RemoteQuery
   const query = container.resolve("query")
   ```

2. **Opção B (Temporária)**: Registrar entityManager no container

   ```typescript
   // medusa-config.ts ou loader
   import { MikroORM } from "@mikro-orm/core"
   
   export default async (container) => {
     const orm = await MikroORM.init(mikroOrmConfig)
     container.register("entityManager", orm.em)
   }
   ```

---

#### 🔴 Problema 3: Service Alias não encontrado (4 tests)

**Endpoints afetados:**

- `GET /store/orders/:id/fulfillment` (4 testes)

**Erro:**

```
Status: 500 | Error: Service with alias "order_fulfillment" was not found.
```

**Causa Raiz:**

- O endpoint `GET /store/orders/[id]/fulfillment/route.ts` usa:

  ```typescript
  const { data: [fulfillment] } = await query.graph({
      entity: "order_fulfillment", // ❌ Entity não registrada
      ...
  })
  ```

- A entidade `order_fulfillment` (tabela existe no DB) não está registrada como módulo Medusa

**Soluções Possíveis:**

1. **Opção A**: Criar módulo custom `OrderFulfillmentModule` com entity registration
2. **Opção B**: Usar módulo Order nativo do Medusa e estender com custom fields
3. **Opção C**: Usar entityManager direto (requer Problema 2 resolvido)

---

## 🎯 Próximos Passos (Ordem de Prioridade)

### Fase 1: Restart & Auth Fix (imediato)

- [ ] Parar servidor atual
- [ ] `npm run dev` para recarregar middlewares
- [ ] Testar endpoint solar com curl:

  ```bash
  curl -X POST http://localhost:9000/store/solar_calculations \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"customer_id":"cus_xxx","consumo_kwh_mes":450,"uf":"SP"}'
  ```

- [ ] Verificar se `req.auth_context` está populado (adicionar `console.log` temporário)

### Fase 2: Workflows EntityManager Fix (1-2h)

**Opção Rápida (para testes)**:

- [ ] Registrar entityManager no `src/loaders/mikro-orm.ts`
- [ ] Reiniciar servidor
- [ ] Re-executar testes

**Opção Correta (produção)**:

- [ ] Criar módulos Medusa para CreditAnalysis e FinancingApplication
- [ ] Refatorar workflows para usar services do módulo
- [ ] Documentar arquitetura de módulos

### Fase 3: Order Fulfillment Module (2-3h)

- [ ] Avaliar se OrderFulfillment deve ser módulo custom ou extensão de Order
- [ ] Implementar module registration
- [ ] Testar query.graph() funciona com entity registrada

### Fase 4: Re-executar Suite Completa

- [ ] `node run-plg-tests-complete.js`
- [ ] Alvo: 20+ testes passando (80%+)
- [ ] Documentar cobertura PLG em cada Stage

---

## 📝 Alterações Realizadas Nesta Sessão

### Arquivos Criados

1. `src/api/store/solar_calculations/middlewares.ts` → Auth middleware
2. `src/api/store/credit-analyses/middlewares.ts` → Auth middleware
3. `src/api/store/financing_applications/middlewares.ts` → Auth middleware
4. `src/api/store/orders/middlewares.ts` → Auth middleware

### Arquivos Modificados

1. `src/api/store/middlewares.ts` → Imports + registrations
2. `src/api/store/solar_calculations/route.ts` → `req.auth_context?.actor_id`
3. `src/api/store/solar_calculations/[id]/route.ts` → `req.auth_context?.actor_id`
4. `run-plg-tests-complete.js` → Ajustes de payload (requested_term_months, modality, quote_id)

### Payload Fixes Aplicados

- **Credit Analysis**: `installments_preference` → `requested_term_months`
- **Credit Analysis**: `preferred_modality` → `financing_modality`
- **Financing Applications**: Adicionado `quote_id` obrigatório
- **Financing Applications**: Campos simplificados (removidos installments, principal_amount)
- **Order Fulfillment**: Mudou de POST para GET (método correto)
- **Order Fulfillment**: Path corrigido para `/store/orders/:id/fulfillment`

---

## 🔍 Como Validar Cada Fix

### 1. Auth Context

```bash
# Deve retornar 200 (não 401) com token válido
curl -X POST http://localhost:9000/store/solar_calculations \
  -H "Authorization: Bearer $(cat .test-token)" \
  -H "Content-Type: application/json" \
  -d '{"customer_id":"cus_test","consumo_kwh_mes":450,"uf":"SP"}'
```

### 2. EntityManager

```bash
# Deve retornar 201 (não 500 "entityManager not found")
curl -X POST http://localhost:9000/store/credit-analyses \
  -H "Authorization: Bearer $(cat .test-token)" \
  -H "Content-Type: application/json" \
  -d '{"customer_id":"cus_test","requested_amount":30000,"requested_term_months":60}'
```

### 3. Order Fulfillment Module

```bash
# Deve retornar 404 (não 500 "service not found")
curl -X GET http://localhost:9000/store/orders/nonexistent/fulfillment \
  -H "Authorization: Bearer $(cat .test-token)"
```

---

## 📈 Meta de Sucesso

**Objetivo Final:**

- ✅ 20/25 testes passando (80% success rate)
- ✅ Stage 1 (Solar): 5/7 passando (kits exposure validado)
- ✅ Stage 2 (Credit): 5/7 passando (offers exposure validado)
- ✅ Stage 3 (Financing): 5/7 passando (payment_schedule validado)
- ✅ Stage 4 (Order): 3/4 passando (tracking events expostos)

**PLG Metrics Target:**

- Stage 1: ≥1 kit com product_id exposure
- Stage 2: ≥3 financing offers por análise
- Stage 3: ≥1 payment schedule com 60+ installments
- Stage 4: ≥1 tracking event por shipment

---

**Próximo comando:**

```bash
# Após restart do servidor:
node run-plg-tests-complete.js
```
