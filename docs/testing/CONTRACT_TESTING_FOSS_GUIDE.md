# 🤝 Contract Testing - Pact Framework (100% FOSS)

**Versão**: 1.0.0  
**Data**: 12 de Outubro, 2025  
**Status**: ✅ FOSS Stack Completa

---

## 📋 Visão Geral

**Pact** é um framework FOSS para contract testing que valida contratos entre consumidores (frontend) e provedores (backend), garantindo que ambos estejam sempre sincronizados.

### Stack FOSS

- **Pact JS**: Consumer & provider testing (MIT License)
- **Pact Broker Docker**: Self-hosted contract repository
- **PostgreSQL**: Pact Broker storage
- **Node-RED**: Automação de verificação
- **GitHub Actions**: CI/CD pipeline

### Vantagens FOSS

✅ **Zero custo** - Sem limites de contratos/verificações  
✅ **Self-hosted** - Dados ficam no seu servidor  
✅ **API completa** - Webhooks, can-i-deploy, versioning  
✅ **No vendor lock-in** - Migração simples  
✅ **Open source** - Full transparência

---

## 🚀 Quick Start

### 1. Instalar Pact

```powershell
# Consumer (Storefront)
cd storefront
npm install --save-dev @pact-foundation/pact

# Provider (Backend)
cd backend
yarn add -D @pact-foundation/pact
```

### 2. Pact Broker Local

Já configurado em `docker-compose.foss.yml`:

```yaml
pact-broker:
  image: pactfoundation/pact-broker:latest
  container_name: ysh-pact-broker-foss
  ports:
    - "9292:9292"
  environment:
    PACT_BROKER_DATABASE_URL: postgresql://postgres:postgres@postgres:5432/pact_broker
    PACT_BROKER_BASIC_AUTH_USERNAME: pact
    PACT_BROKER_BASIC_AUTH_PASSWORD: pact
    PACT_BROKER_BASIC_AUTH_READ_ONLY_USERNAME: pact_ro
    PACT_BROKER_BASIC_AUTH_READ_ONLY_PASSWORD: pact_ro
    PACT_BROKER_LOG_LEVEL: INFO
  depends_on:
    - postgres
  networks:
    - ysh-foss-network
```

**Iniciar**:

```powershell
docker-compose -f docker-compose.foss.yml up -d pact-broker
```

**Acessar**: <http://localhost:9292> (Usuário: `pact`, Senha: `pact`)

### 3. Consumer Test (Storefront)

Criar `storefront/src/pact/products-api.pact.test.ts`:

```typescript
import { pactWith } from 'jest-pact';
import { Matchers } from '@pact-foundation/pact';
import { sdk } from '@/lib/config';

pactWith(
  {
    consumer: 'ysh-storefront',
    provider: 'ysh-backend',
    port: 8080,
    pactfileWriteMode: 'update',
    dir: './pacts',
  },
  (interaction) => {
    describe('Products API', () => {
      describe('GET /store/products', () => {
        beforeEach(() => {
          const productMatcher = {
            id: Matchers.string('prod_01JXXX'),
            title: Matchers.string('Painel Solar 550W'),
            handle: Matchers.string('painel-solar-550w'),
            thumbnail: Matchers.string('/uploads/thumbnail.jpg'),
            status: Matchers.string('published'),
            variants: Matchers.eachLike({
              id: Matchers.string('variant_01JXXX'),
              title: Matchers.string('Default'),
              sku: Matchers.string('PSL-550W-01'),
              calculated_price: Matchers.like({
                calculated_amount: Matchers.integer(2500),
                currency_code: Matchers.string('BRL'),
              }),
            }),
          };

          interaction.given('produtos existem no catálogo')
            .uponReceiving('uma requisição para listar produtos')
            .withRequest({
              method: 'GET',
              path: '/store/products',
              query: {
                fields: '*variants,*variants.calculated_price',
                limit: '20',
                offset: '0',
              },
              headers: {
                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
              },
            })
            .willRespondWith({
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
              body: {
                products: Matchers.eachLike(productMatcher),
                count: Matchers.integer(45),
                limit: 20,
                offset: 0,
              },
            });
        });

        it('returns a list of products', async () => {
          // Call API through SDK
          const { products, count } = await sdk.client.fetch(
            '/store/products',
            {
              query: {
                fields: '*variants,*variants.calculated_price',
                limit: 20,
                offset: 0,
              },
              headers: {
                'x-publishable-api-key': 'pk_test_xxx',
              },
              baseUrl: 'http://localhost:8080',
            }
          );

          expect(products).toBeDefined();
          expect(products.length).toBeGreaterThan(0);
          expect(count).toBeGreaterThan(0);
          expect(products[0]).toHaveProperty('id');
          expect(products[0]).toHaveProperty('title');
          expect(products[0]).toHaveProperty('variants');
        });
      });

      describe('GET /store/products/:id', () => {
        beforeEach(() => {
          interaction.given('produto prod_01JXXX existe')
            .uponReceiving('uma requisição para obter produto por ID')
            .withRequest({
              method: 'GET',
              path: '/store/products/prod_01JXXX',
              query: {
                fields: '*variants,*variants.calculated_price,*images',
              },
              headers: {
                'x-publishable-api-key': Matchers.string('pk_test_xxx'),
              },
            })
            .willRespondWith({
              status: 200,
              headers: {
                'Content-Type': 'application/json',
              },
              body: {
                product: {
                  id: 'prod_01JXXX',
                  title: 'Painel Solar 550W',
                  handle: 'painel-solar-550w',
                  description: Matchers.string(),
                  thumbnail: Matchers.string('/uploads/thumbnail.jpg'),
                  images: Matchers.eachLike({
                    id: Matchers.string('img_01JXXX'),
                    url: Matchers.string('/uploads/image.jpg'),
                  }),
                  variants: Matchers.eachLike({
                    id: Matchers.string('variant_01JXXX'),
                    title: 'Default',
                    sku: 'PSL-550W-01',
                    calculated_price: {
                      calculated_amount: 2500,
                      currency_code: 'BRL',
                    },
                  }),
                },
              },
            });
        });

        it('returns a single product', async () => {
          const { product } = await sdk.client.fetch(
            '/store/products/prod_01JXXX',
            {
              query: {
                fields: '*variants,*variants.calculated_price,*images',
              },
              headers: {
                'x-publishable-api-key': 'pk_test_xxx',
              },
              baseUrl: 'http://localhost:8080',
            }
          );

          expect(product.id).toBe('prod_01JXXX');
          expect(product.title).toBe('Painel Solar 550W');
          expect(product.variants).toBeDefined();
          expect(product.images).toBeDefined();
        });
      });
    });
  }
);
```

**Rodar consumer test**:

```powershell
cd storefront
npm test -- src/pact/products-api.pact.test.ts
```

Isso gera `storefront/pacts/ysh-storefront-ysh-backend.json`

### 4. Publicar Contrato no Broker

```powershell
npx pact-broker publish ./pacts `
  --consumer-app-version="1.0.0+$(git rev-parse --short HEAD)" `
  --broker-base-url="http://localhost:9292" `
  --broker-username="pact" `
  --broker-password="pact" `
  --tag="main" `
  --tag="prod"
```

### 5. Provider Verification (Backend)

Criar `backend/src/pact/products-provider.pact.test.ts`:

```typescript
import { Verifier } from '@pact-foundation/pact';
import path from 'path';

describe('Pact Verification - Products API', () => {
  it('validates the expectations of ysh-storefront', async () => {
    const opts = {
      provider: 'ysh-backend',
      providerBaseUrl: 'http://localhost:9000',
      
      // Pact Broker config
      pactBrokerUrl: 'http://localhost:9292',
      pactBrokerUsername: 'pact',
      pactBrokerPassword: 'pact',
      
      // Consumer versions to verify
      consumerVersionSelectors: [
        { tag: 'main', latest: true },
        { tag: 'prod', latest: true },
      ],
      
      // Publish results back to broker
      publishVerificationResult: true,
      providerVersion: process.env.GIT_COMMIT || '1.0.0',
      providerVersionTags: [process.env.GIT_BRANCH || 'main'],
      
      // State handlers
      stateHandlers: {
        'produtos existem no catálogo': async () => {
          // Seed database with test products
          console.log('Setting up state: produtos existem no catálogo');
          // Use seed scripts or factories
        },
        'produto prod_01JXXX existe': async () => {
          console.log('Setting up state: produto prod_01JXXX existe');
          // Create specific product
        },
      },
      
      // Request filters (add auth headers)
      requestFilter: (req, res, next) => {
        req.headers['x-publishable-api-key'] = process.env.MEDUSA_PUBLISHABLE_KEY;
        next();
      },
    };

    const output = await new Verifier(opts).verifyProvider();
    console.log('Pact Verification Complete!');
    console.log(output);
  }, 30000); // 30s timeout
});
```

**Rodar provider test**:

```powershell
cd backend
yarn test:pact:provider
```

---

## 🎯 Contratos Críticos do YSH B2B

### 1. Products API

**Consumer**: Storefront  
**Provider**: Backend  
**Endpoints**:

- `GET /store/products` - Listar produtos
- `GET /store/products/:id` - Obter produto por ID
- `GET /store/products/:id/variants` - Listar variantes

### 2. Cart API

**Consumer**: Storefront  
**Provider**: Backend  
**Endpoints**:

- `POST /store/carts` - Criar carrinho
- `POST /store/carts/:id/line-items` - Adicionar item
- `PATCH /store/carts/:id/line-items/:line_id` - Atualizar quantidade
- `DELETE /store/carts/:id/line-items/:line_id` - Remover item
- `POST /store/carts/:id/complete` - Finalizar carrinho

**Exemplo de contrato**:

```typescript
// storefront/src/pact/cart-api.pact.test.ts
describe('POST /store/carts/:id/line-items', () => {
  beforeEach(() => {
    interaction
      .given('carrinho cart_01JXXX existe e tem limite disponível')
      .uponReceiving('requisição para adicionar item ao carrinho')
      .withRequest({
        method: 'POST',
        path: '/store/carts/cart_01JXXX/line-items',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': Matchers.string(),
        },
        body: {
          variant_id: 'variant_01JXXX',
          quantity: 10,
        },
      })
      .willRespondWith({
        status: 200,
        body: {
          cart: {
            id: 'cart_01JXXX',
            items: Matchers.eachLike({
              id: Matchers.string(),
              variant_id: 'variant_01JXXX',
              quantity: 10,
              unit_price: Matchers.integer(),
            }),
            total: Matchers.integer(),
          },
        },
      });
  });
});
```

### 3. Approvals API

**Consumer**: Storefront  
**Provider**: Backend  
**Endpoints**:

- `GET /store/approvals` - Listar aprovações pendentes
- `POST /store/approvals/:id/approve` - Aprovar
- `POST /store/approvals/:id/reject` - Rejeitar

### 4. Quotes API

**Consumer**: Storefront  
**Provider**: Backend  
**Endpoints**:

- `POST /store/quotes` - Criar cotação
- `GET /store/quotes/:id` - Obter cotação
- `POST /store/quotes/:id/messages` - Enviar mensagem
- `POST /store/quotes/:id/accept` - Aceitar cotação

---

## 🐳 Docker Integration

### Criar Database para Pact Broker

```sql
-- Executar no PostgreSQL
CREATE DATABASE pact_broker;
GRANT ALL PRIVILEGES ON DATABASE pact_broker TO postgres;
```

### Iniciar Stack Completa

```powershell
docker-compose -f docker-compose.foss.yml up -d postgres pact-broker
```

### Verificar Logs

```powershell
docker logs ysh-pact-broker-foss -f
```

---

## 🤖 Integração Node-RED

### Flow: Trigger Pact Verification

```json
[
  {
    "id": "pact_verify_trigger",
    "type": "http in",
    "url": "/trigger/pact-verify",
    "method": "post",
    "name": "Pact Verify Trigger"
  },
  {
    "id": "run_provider_test",
    "type": "exec",
    "command": "cd /workspace/backend && yarn test:pact:provider",
    "name": "Run Provider Verification"
  },
  {
    "id": "parse_pact_results",
    "type": "function",
    "func": "const output = msg.payload;\nconst successMatch = output.match(/Pact Verification Complete/);\n\nmsg.pact = {\n  success: !!successMatch,\n  provider: 'ysh-backend',\n  consumers: ['ysh-storefront'],\n  timestamp: new Date().toISOString()\n};\n\nreturn msg;",
    "name": "Parse Pact Results"
  },
  {
    "id": "check_can_i_deploy",
    "type": "exec",
    "command": "npx pact-broker can-i-deploy --pacticipant=ysh-backend --version=$(git rev-parse --short HEAD) --to=prod --broker-base-url=http://localhost:9292 --broker-username=pact --broker-password=pact",
    "name": "Can I Deploy?"
  },
  {
    "id": "publish_mqtt",
    "type": "mqtt out",
    "topic": "ysh/pact/results",
    "name": "Publish Results"
  }
]
```

### Webhook URL

```bash
curl -X POST http://localhost:1880/api/trigger/pact-verify \
  -H "Content-Type: application/json" \
  -d '{"provider": "ysh-backend", "consumer": "ysh-storefront"}'
```

---

## 📊 CI/CD Integration

### GitHub Actions Workflow

Atualizar `.github/workflows/contract-testing.yml`:

```yaml
name: Contract Testing (FOSS)

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  workflow_dispatch:

env:
  PACT_BROKER_BASE_URL: http://localhost:9292
  PACT_BROKER_USERNAME: pact
  PACT_BROKER_PASSWORD: pact

jobs:
  consumer-tests:
    name: Consumer Tests (Storefront)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: storefront
        run: npm ci
      
      - name: Run consumer tests
        working-directory: storefront
        run: npm run test:pact:consumer
      
      - name: Publish pacts to broker
        working-directory: storefront
        run: |
          npx pact-broker publish ./pacts \
            --consumer-app-version="${{ github.sha }}" \
            --broker-base-url="${{ env.PACT_BROKER_BASE_URL }}" \
            --broker-username="${{ env.PACT_BROKER_USERNAME }}" \
            --broker-password="${{ env.PACT_BROKER_PASSWORD }}" \
            --tag="${{ github.ref_name }}" \
            --tag="ci"
  
  provider-verification:
    name: Provider Verification (Backend)
    runs-on: ubuntu-latest
    needs: consumer-tests
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Start services
        run: |
          docker-compose -f docker-compose.foss.yml up -d postgres redis pact-broker backend
          sleep 30
      
      - name: Install dependencies
        working-directory: backend
        run: yarn install
      
      - name: Run provider verification
        working-directory: backend
        env:
          GIT_COMMIT: ${{ github.sha }}
          GIT_BRANCH: ${{ github.ref_name }}
        run: yarn test:pact:provider
      
      - name: Can I Deploy?
        run: |
          npx pact-broker can-i-deploy \
            --pacticipant=ysh-backend \
            --version="${{ github.sha }}" \
            --to=prod \
            --broker-base-url="${{ env.PACT_BROKER_BASE_URL }}" \
            --broker-username="${{ env.PACT_BROKER_USERNAME }}" \
            --broker-password="${{ env.PACT_BROKER_PASSWORD }}"
```

---

## 🔍 Can I Deploy?

Verificar se é seguro fazer deploy:

```powershell
# Backend pode ir para prod?
npx pact-broker can-i-deploy `
  --pacticipant=ysh-backend `
  --version="$(git rev-parse --short HEAD)" `
  --to=prod `
  --broker-base-url="http://localhost:9292" `
  --broker-username="pact" `
  --broker-password="pact"
```

**Output**:

```
Computer says yes \o/

CONSUMER        | C.VERSION | PROVIDER    | P.VERSION | SUCCESS?
----------------|-----------|-------------|-----------|----------
ysh-storefront  | 1.0.0     | ysh-backend | abc123    | true

All required verification results are published and successful
```

---

## 🛠️ Best Practices

### 1. Use Matchers

```typescript
import { Matchers } from '@pact-foundation/pact';

// ✅ Good - flexible
body: {
  id: Matchers.string('prod_01JXXX'),
  price: Matchers.integer(2500),
  email: Matchers.email(),
  timestamp: Matchers.iso8601DateTime(),
}

// ❌ Bad - brittle
body: {
  id: 'prod_01JXXX123456',
  price: 2500,
  email: 'test@example.com',
  timestamp: '2025-01-15T10:30:00Z',
}
```

### 2. Provider States

```typescript
stateHandlers: {
  'user with email test@example.com exists': async () => {
    await createUser({ email: 'test@example.com' });
  },
  'cart is empty': async () => {
    await clearCart('cart_01JXXX');
  },
}
```

### 3. Tag Strategies

```powershell
# Development
--tag="dev" --tag="feature/new-ui"

# Staging
--tag="staging" --tag="release-candidate"

# Production
--tag="prod" --tag="v1.2.3"
```

---

## 🚨 Troubleshooting

### Pact Broker não inicia

**Problema**: Database connection failed

**Solução**:

```powershell
# Criar database
docker-compose -f docker-compose.foss.yml exec postgres psql -U postgres -c "CREATE DATABASE pact_broker;"

# Reiniciar broker
docker-compose -f docker-compose.foss.yml restart pact-broker
```

### Provider verification falha

**Problema**: State handlers não executam

**Solução**:

```typescript
stateHandlers: {
  'produtos existem': async () => {
    console.log('Setting up state...');
    // Add debug logging
    await seedProducts();
    console.log('State setup complete');
  },
}
```

### Can-i-deploy sempre retorna "no"

**Problema**: Verificação não publicada no broker

**Solução**:

```typescript
// Ensure publishVerificationResult: true
publishVerificationResult: true,
providerVersion: process.env.GIT_COMMIT,
```

---

## 📚 Recursos FOSS

- **Pact Docs**: <https://docs.pact.io/>
- **Pact Broker**: <https://github.com/pact-foundation/pact_broker>
- **Pact JS**: <https://github.com/pact-foundation/pact-js>

---

## ✅ Checklist

- [x] Pact Broker Docker rodando (localhost:9292)
- [ ] Consumer tests criados para APIs principais
- [ ] Provider verification configurado
- [ ] State handlers implementados
- [ ] CI/CD pipeline configurado
- [ ] Can-i-deploy integrado no pipeline
- [ ] Node-RED flows criados

---

## 🎓 Próximos Passos

1. **Expandir cobertura** - Adicionar contratos para todas as APIs
2. **Webhooks** - Configurar Pact Broker webhooks para notificações
3. **Breaking changes** - Detectar mudanças incompatíveis antes do deploy
4. **Versioning** - Implementar semantic versioning nos contratos

---

**Status**: ✅ Contract Testing FOSS pronto para uso!

**Vantagens vs Pact SaaS**:

- ✅ **$0/mês** vs $500/mês (enterprise)
- ✅ **Unlimited contracts** vs Limited
- ✅ **Self-hosted** vs SaaS
- ✅ **Full API access** vs Restricted
