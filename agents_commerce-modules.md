# Medusa.js Commerce Modules - Guia para Agentes

## Visão Geral

Os **Commerce Modules** do Medusa.js são componentes modulares que fornecem funcionalidades específicas para domínios de comércio eletrônico. Cada módulo oferece:

- **Serviços**: Lógica de negócio para operações específicas
- **Modelos de Dados**: Representação de tabelas no banco de dados
- **APIs**: Endpoints REST para interação com clientes
- **Extensibilidade**: Capacidade de estender modelos e funcionalidades

## Lista Completa de Commerce Modules

### Core Commerce Modules

| Módulo | Descrição | Casos de Uso |
|--------|-----------|--------------|
| **API Key** | Gerenciamento de chaves de API | Autenticação de sistemas externos |
| **Auth** | Autenticação e autorização | Login, registro, permissões |
| **Cart** | Carrinho de compras | Adicionar/remover itens, cálculos |
| **Currency** | Moedas e taxas de câmbio | Suporte multi-moeda |
| **Customer** | Gestão de clientes | Perfis, histórico, preferências |
| **Fulfillment** | Cumprimento de pedidos | Entrega, logística, tracking |
| **Inventory** | Controle de inventário | Estoque, reservas, alertas |
| **Order** | Gestão de pedidos | Ciclo de vida completo do pedido |
| **Payment** | Processamento de pagamentos | Gateways, métodos de pagamento |
| **Pricing** | Estratégias de precificação | Regras de preço, descontos |
| **Product** | Catálogo de produtos | Produtos, variantes, categorias |
| **Promotion** | Promoções e descontos | Cupons, campanhas, regras |
| **Region** | Regiões geográficas | Países, estados, configurações regionais |
| **Sales Channel** | Canais de venda | Marketplace, B2B, B2C |
| **Stock Location** | Localizações de estoque | Armazéns, depósitos |
| **Store** | Configurações da loja | Metadados, configurações globais |
| **Tax** | Cálculos de impostos | Regras fiscais, alíquotas |
| **User** | Gestão de usuários | Staff, admins, roles |

## Como Usar os Commerce Modules

### 1. Em Aplicações Medusa

```typescript
// Uso em API routes
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const productService = req.scope.resolve("productService")
  const products = await productService.list()

  res.json({ products })
}
```

### 2. Em Aplicações Serverless

```typescript
// Next.js ou outras aplicações serverless
import { ProductModule } from "@medusajs/product"

const productService = new ProductModule()
// Uso direto do serviço
```

### 3. Em Aplicações Node.js

```typescript
// Qualquer aplicação Node.js
import { modules } from "@medusajs/medusa"

const { ProductModule } = modules
// Instanciação e uso
```

## Arquitetura dos Commerce Modules

### Estrutura Típica

```tsx
src/modules/[module-name]/
├── index.ts              # Definição do módulo
├── service.ts            # Serviço principal
├── models/               # Modelos de dados
│   ├── index.ts
│   └── [model].ts
├── types/                # Tipos TypeScript
├── migrations/           # Migrações de banco
└── __tests__/            # Testes
```

### Padrões de Serviço

```typescript
class ProductModuleService extends MedusaService({
  Product,
  ProductVariant,
  ProductCategory,
}) {
  // Métodos CRUD gerados automaticamente
  // createProducts, updateProducts, deleteProducts
  // listProducts, listAndCountProducts
  // retrieveProduct

  // Métodos customizados
  async customBusinessLogic() {
    // Lógica específica do negócio
  }
}
```

## Extensibilidade

### Estendendo Modelos

```typescript
// Em medusa-config.ts
import { Modules } from "@medusajs/framework/utils"

export default defineConfig({
  modules: {
    productService: {
      resolve: "@medusajs/product",
      options: {
        databaseConfig: {
          schema: "custom_schema"
        }
      }
    }
  }
})
```

### Customizando Serviços

```typescript
// Criando módulo customizado
class CustomProductService extends ProductModuleService {
  // Override de métodos
  async listProducts(filters) {
    // Lógica customizada
    return super.listProducts(filters)
  }

  // Novos métodos
  async customProductLogic() {
    // Implementação
  }
}
```

## Integração com Módulos Customizados

### Definindo Relacionamentos

```typescript
// Módulo customizado
export const CustomModule = model.define("custom_entity", {
  id: model.id({ prefix: "custom" }).primaryKey(),
  product_id: model.text(),

  // Relacionamento com Product Module
  product: model.belongsTo(() => Product, {
    mappedBy: "custom_entities"
  })
})
```

### Usando em Workflows

```typescript
import { createWorkflow } from "@medusajs/workflows-sdk"

const customWorkflow = createWorkflow(
  "custom-workflow",
  function (input) {
    // Usar serviços de commerce modules
    const productService = useQuery({
      entity: "product",
      fields: ["*"],
      filters: { id: input.product_id }
    })

    // Lógica customizada
    const customLogic = createStep(
      "custom-step",
      async (data) => {
        // Implementação
      }
    )

    return new WorkflowResponse(result)
  }
)
```

## Boas Práticas

### 1. Separação de Responsabilidades

- **Commerce Modules**: Funcionalidades core de e-commerce
- **Custom Modules**: Lógica específica do negócio
- **Workflows**: Orquestração de operações complexas

### 2. Extensibilidade vs Override

- Prefira **estender** modelos ao invés de sobrescrever
- Use **composição** ao invés de herança direta
- Mantenha **compatibilidade** com versões futuras

### 3. Performance

- Use **lazy loading** para relacionamentos
- Implemente **cache** quando apropriado
- Otimize **queries** com campos específicos

### 4. Testabilidade

- Teste **serviços isoladamente**
- Use **mocks** para dependências externas
- Implemente **testes de integração** para workflows

## Casos de Uso Comuns

### Marketplace B2B

```typescript
// Combinando módulos para marketplace
- Customer Module: Buyers e Sellers
- Product Module: Catálogo compartilhado
- Order Module: Pedidos entre empresas
- Payment Module: Pagamentos B2B
- Custom Module: Regras específicas de marketplace
```

### Assinaturas

```typescript
// Sistema de assinaturas
- Product Module: Produtos com recorrência
- Customer Module: Assinantes
- Payment Module: Cobrança recorrente
- Order Module: Pedidos de assinatura
- Custom Module: Lógica de renovação
```

### Marketplace Digital

```typescript
// Produtos digitais
- Product Module: Produtos digitais
- Customer Module: Compradores
- Fulfillment Module: Entrega automática
- Custom Module: Controle de acesso
```

## Troubleshooting

### Problemas Comuns

1. **Dependências Circulares**: Evite imports circulares entre módulos
2. **Performance**: Monitore queries N+1 em relacionamentos
3. **Migrations**: Sempre teste migrations em ambientes de staging
4. **Cache**: Invalide cache quando necessário

### Debugging

```typescript
// Logs detalhados
const service = req.scope.resolve("productService")
console.log("Available methods:", Object.getOwnPropertyNames(service))

// Query debugging
const products = await service.listProducts({}, {
  relations: ["variants", "categories"],
  take: 10
})
```

## Recursos Adicionais

- [Documentação Oficial](https://docs.medusajs.com/resources/commerce-modules)
- [Guia de Extensibilidade](https://docs.medusajs.com/learn/fundamentals/modules)
- [Referência de API](https://docs.medusajs.com/api/store)
- [Exemplos no GitHub](https://github.com/medusajs/medusa/tree/develop/packages)

---

*Este documento serve como referência para agentes trabalhando com Medusa.js Commerce Modules. Atualizado baseado na documentação oficial v2.x.*
