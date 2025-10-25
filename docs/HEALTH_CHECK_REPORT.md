# 🏥 YSH B2B - Relatório de Saúde do Sistema

**Data**: 08/10/2025  
**Status Geral**: 🔴 **CRÍTICO - Sistema com múltiplos problemas**

---

## 📊 Resumo Executivo

### Problemas Críticos Identificados

1. **🔴 CRÍTICO**: Banco de dados VAZIO - 0 produtos cadastrados
2. **🔴 CRÍTICO**: Publishable Key ausente no storefront
3. **🔴 CRÍTICO**: Backend com erros de módulos desabilitados (INVENTORY, FULFILLMENT)
4. **🟡 ALTO**: Frontend usando API inexistente `/api/catalog/products`
5. **🟡 ALTO**: Watchpack errors no storefront (I/O errors)

---

## 🐳 Status dos Serviços Docker

### Serviços Ativos (4/4) ✅

| Serviço | Status | Portas | Saúde |
|---------|--------|--------|-------|
| ysh-b2b-postgres-dev | Up 2 minutes | 15432→5432 | ✅ Healthy |
| ysh-b2b-redis-dev | Up 2 minutes | 16379→6379 | ✅ Healthy |
| ysh-b2b-backend-dev | Up 2 minutes | 9000-9002 | 🔴 Com erros |
| ysh-b2b-storefront-dev | Up 2 minutes | 8000 | 🔴 Com erros |

### Serviços Kubernetes (Não utilizados no dev)

6 pods Kubernetes detectados mas não são usados no ambiente de desenvolvimento local.

---

## 🗄️ Status do Banco de Dados

### PostgreSQL ✅ Funcionando

```sql
-- Conexão: OK
-- Tabelas criadas: 100+ (migrations executadas)
```

### Dados Críticos 🔴

```sql
SELECT COUNT(*) FROM product;
-- Resultado: 0 produtos

SELECT COUNT(*) FROM product_category;
-- Não verificado ainda

SELECT COUNT(*) FROM sales_channel;
-- Não verificado ainda
```

**PROBLEMA**: Banco de dados sem produtos! Isso explica por que frontend e admin não mostram produtos.

---

## 🔧 Backend (Medusa v2)

### Configuração Atual

**Arquivo**: `backend/medusa-config.ts`

#### Módulos Habilitados ✅

- ✅ PRODUCT (ativo)
- ✅ PRICING (ativo)
- ✅ SALES_CHANNEL (ativo)
- ✅ CART (ativo)
- ✅ ORDER (ativo)
- ✅ PAYMENT (ativo)
- ✅ TAX (ativo)
- ✅ REGION (ativo)

#### Módulos Desabilitados ⚠️

- ❌ INVENTORY (disabled)
- ❌ STOCK_LOCATION (disabled)
- ❌ FULFILLMENT (disabled)

#### Módulos Customizados

- ✅ YSH_PRICING_MODULE (habilitado, mas sem dados)
- ❌ COMPANY_MODULE (comentado)
- ❌ QUOTE_MODULE (comentado)
- ❌ APPROVAL_MODULE (comentado)
- ❌ YSH_CATALOG_MODULE (comentado)

### Erros Detectados no Backend 🔴

#### 1. ValidationError: Order does not have property 'fulfillments'

```
ValidationError: Entity 'Order' does not have property 'fulfillments'
```

**Causa**: FULFILLMENT module está desabilitado, mas o código tenta acessar propriedades relacionadas.

**Impacto**: Admin Orders page quebrada (500 error)

#### 2. MedusaError: Publishable key required

```
MedusaError: A valid publishable key is required to proceed with the request
```

**Causa**: Storefront não está enviando publishable key válida nas requisições.

**Impacto**: Requisições de /store/* falhando intermitentemente

#### 3. Server Version Check Failed

```
Failed to obtain server version. Unable to check client-server compatibility.
```

**Causa**: Possível incompatibilidade de versões ou configuração de DB.

**Impacto**: Avisos durante inicialização

---

## 🌐 Frontend (Next.js 15.5.4)

### Configuração Atual

**Porta**: 8000  
**Backend URL**: <http://localhost:9000>  
**Publishable Key**: `pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d`

### Problemas Identificados 🔴

#### 1. API Catalog Inexistente

```typescript
Error: Failed to parse URL from /api/catalog/products?category=panels&limit=6
```

**Arquivo**: `storefront/src/lib/api/catalog-client.ts:88`

**Problema**: Frontend está tentando chamar `/api/catalog/products` que não existe.

**Deveria usar**: `/store/products` (Medusa Store API)

#### 2. Watchpack I/O Errors

```
Watchpack Error (initial scan): Error: EIO: i/o error, scandir '/app/src/lib'
Watchpack Error (initial scan): Error: EIO: i/o error, scandir '/app/src/providers'
Watchpack Error (initial scan): Error: EIO: i/o error, scandir '/app/src/types'
```

**Causa**: Possíveis problemas de montagem de volumes Docker ou permissões de arquivo.

**Impacto**: Hot reload pode não funcionar corretamente

#### 3. Publishable Key não configurada

**Arquivo necessário**: `storefront/.env.local` (NÃO EXISTE)

**Template disponível**: `storefront/.env.template`

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_test  # ❌ PLACEHOLDER
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=us
REVALIDATE_SECRET=supersecret
```

---

## 📁 Estrutura de Módulos Criados

### YSH Pricing Module (Parcialmente implementado)

```
backend/src/modules/ysh-pricing/
├── index.ts ✅ (exporta YSH_PRICING_MODULE)
├── service.ts ❌ (NÃO EXISTE)
├── models/ ❌ (NÃO EXISTE)
│   ├── distributor.ts
│   ├── price-list.ts
│   └── price-rule.ts
├── workflows/ ❌ (NÃO EXISTE)
│   ├── sync-distributor-prices.ts
│   ├── calculate-customer-price.ts
│   └── schedule-price-sync.ts
└── migrations/ ❌ (NÃO EXISTE)
```

**Status**: Módulo registrado no medusa-config.ts mas NÃO implementado.

---

## 🔄 Limpeza de Módulos ERP (Executada)

### Ações Concluídas ✅

1. ✅ Dagster ERP assets desabilitados (4 assets)
2. ✅ Pathway CDC pipelines desabilitados
3. ✅ Kafka/Zookeeper/Debezium já removidos
4. ✅ Backups criados (.bak files)

### Arquivos Afetados

- `data-platform/dagster/assets/erp_sync.py` - Assets comentados
- `data-platform/pathway/pipelines/erp_sync.py.disabled` - Pipeline desabilitado
- `data-platform/dagster/definitions.py` - Jobs/schedules comentados

---

## 🚨 Ações Corretivas URGENTES

### Prioridade CRÍTICA 🔴

#### 1. Popular banco de dados com produtos

```bash
# Opção A: Seed com dados de exemplo
cd backend
npm run seed

# Opção B: Importar do catálogo YSH ERP
# (requer implementação do ysh-pricing module)
```

#### 2. Criar arquivo .env.local no storefront

```bash
cd storefront
cp .env.template .env.local

# Editar .env.local:
# 1. Obter publishable key real do Medusa Admin
# 2. Configurar NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
```

#### 3. Corrigir chamadas de API no frontend

**Arquivo**: `storefront/src/lib/api/catalog-client.ts`

```typescript
// ❌ ERRADO
const response = await fetch(`/api/catalog/products?${searchParams}`)

// ✅ CORRETO
const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/store/products?${searchParams}`)
```

### Prioridade ALTA 🟡

#### 4. Implementar ysh-pricing module

Completar a estrutura criada:

- service.ts
- models/
- workflows/
- migrations/

#### 5. Resolver erros de FULFILLMENT

Opções:

- Habilitar FULFILLMENT module
- Ou remover referências a fulfillments no código

#### 6. Corrigir Watchpack errors

```bash
# Rebuild containers com permissões corretas
docker-compose down
docker-compose up --build
```

---

## 📊 Métricas de Saúde

| Componente | Status | Métrica | Problema |
|------------|--------|---------|----------|
| Banco de Dados | 🔴 | 0 produtos | Sem dados |
| Backend API | 🟡 | Rodando com erros | Módulos desabilitados |
| Frontend | 🔴 | API errada | Chamadas quebradas |
| Redis Cache | ✅ | Healthy | OK |
| Docker Services | ✅ | 4/4 up | OK |
| ERP Integration | ⚫ | Desabilitado | Esperado |

---

## 📝 Checklist de Recuperação

### Fase 1: Dados Básicos

- [ ] Popular produtos no banco
- [ ] Criar categorias
- [ ] Criar sales channel
- [ ] Criar região padrão (BR)
- [ ] Obter publishable key válida

### Fase 2: Configuração

- [ ] Criar storefront/.env.local
- [ ] Configurar publishable key
- [ ] Verificar CORS settings

### Fase 3: Correções de Código

- [ ] Corrigir catalog-client.ts (API calls)
- [ ] Resolver fulfillments errors
- [ ] Implementar ysh-pricing service

### Fase 4: Testes

- [ ] Testar listagem de produtos no admin
- [ ] Testar listagem de produtos no storefront
- [ ] Testar adição ao carrinho
- [ ] Testar checkout flow

---

## 🎯 Próximos Passos Recomendados

### Opção 1: Quick Fix (2-3 horas)

1. Seed básico de produtos
2. Criar .env.local
3. Corrigir API calls no frontend
4. Validar produtos aparecem

### Opção 2: Implementação Completa (2-3 dias)

1. Implementar ysh-pricing module completo
2. Importar catálogo YSH ERP
3. Configurar scheduled jobs
4. Testes end-to-end

---

## 📚 Documentação Relacionada

- `docs/PRICING_DECISION.md` - Decisão de arquitetura
- `docs/PRICING_MIGRATION_PLAN.md` - Plano de migração
- `docs/CLEANUP_EXECUTION_SUMMARY.md` - Limpeza executada
- `docs/YSH_PRICING_IMPLEMENTATION.md` - Implementação (incompleta)

---

**Relatório gerado**: 08/10/2025 16:45 UTC  
**Próxima verificação**: Após implementar ações corretivas críticas
