# Proposta de Arquitetura Medusa.js para YSH Solar

## Visão Geral da Plataforma

### Contexto do Projeto YSH

- **Catálogo**: 247 kits solares FOTUS enriquecidos com especificações técnicas completas
- **Produtos**: Painéis solares (ASTRONERGY, SOLAR N PLUS, TRINA), Inversores (DEYE, TSUNESS), Estruturas
- **Dados**: Esquemas JSON enriquecidos com 14-16 campos técnicos por componente
- **Imagens**: WebP otimizado (thumb/medium/large) com 88.7% cobertura
- **Estado**: Pronto para produção com 95.7% sucesso de enriquecimento

### Base Tecnológica: Medusa B2B Starter

Utilizaremos o **[Medusa B2B Starter](https://github.com/medusajs/b2b-starter-medusa)** como base da implementação, que já inclui:

#### ✅ Funcionalidades B2B Nativas

- **Company Management**: Gestão de empresas e funcionários
- **Spending Limits**: Limites de gastos por funcionário
- **Bulk Add-to-Cart**: Adicionar múltiplas variantes ao carrinho
- **Quote Management**: Sistema completo de cotações
- **Order Edit**: Edição de pedidos e cotações
- **Company Approvals**: Aprovações obrigatórias por empresa
- **Merchant Approvals**: Aprovações por comerciante
- **Promotions**: Promoções manuais e automáticas
- **Free Shipping Nudge**: Incentivo visual para frete grátis

#### 🛠️ Stack Tecnológico

- **Backend**: Medusa 2.4 + Node.js 20 + PostgreSQL 15
- **Frontend**: Next.js 15 (App Router, Server Components, Streaming)
- **Admin**: Medusa Admin customizável
- **Arquitetura**: Headless commerce com APIs RESTful

### Por que Medusa.js + B2B Starter?

Medusa.js é uma plataforma headless de e-commerce modular que se adapta perfeitamente ao modelo B2B de produtos solares:

- **Arquitetura Headless**: Separa frontend/backend, permitindo múltiplas interfaces (web, mobile, API)
- **Modular**: Módulos isolados para produtos, pedidos, regiões, canais de vendas
- **Extensível**: Framework para customizações avançadas (modelos de dados, workflows, APIs)
- **B2B/B2C**: Suporte nativo para ambos os modelos
- **Marketplace**: Capacidades built-in para multi-vendor (perfeito para distribuidores solares)
- **B2B Starter**: Template oficial com funcionalidades B2B prontas para uso

## Arquitetura Proposta

### 1. Base: Medusa B2B Starter + Customizações Solares

Utilizaremos o B2B Starter como **base sólida** e adicionaremos módulos específicos para produtos solares:

```bash
# Estrutura baseada no B2B Starter + customizações solares
src/
├── modules/                    # Módulos do B2B Starter (companies, approvals, quotes)
│   ├── company/               # ✅ Gestão de empresas (pronto)
│   ├── approval/              # ✅ Sistema de aprovações (pronto)
│   ├── quote/                 # ✅ Gestão de cotações (pronto)
│   ├── solar-products/        # 🆕 Extensão para produtos solares
│   │   ├── models/
│   │   │   ├── solar-kit.ts   # Kit solar personalizado
│   │   │   ├── solar-panel.ts # Painel com specs técnicas
│   │   │   └── solar-inverter.ts # Inversor com specs
│   │   └── service.ts
│   └── solar-calculator/      # 🆕 Módulo de cálculo solar
├── workflows/
│   ├── company/               # ✅ Workflows B2B (prontos)
│   ├── quote/                 # ✅ Workflows de cotação (prontos)
│   └── solar/                 # 🆕 Workflows solares
│       ├── create-solar-kit/  # Workflow kit personalizado
│       ├── calculate-system/  # Workflow dimensionamento
│       └── generate-quote/    # Workflow cotação solar
├── api/
│   ├── companies/             # ✅ APIs B2B (prontas)
│   ├── quotes/                # ✅ APIs de cotação (prontas)
│   └── solar/                 # 🆕 APIs solares
│       ├── kits/              # APIs para kits solares
│       ├── calculator/        # APIs de cálculo
│       └── specifications/    # APIs de especificações
└── admin/
    └── extensions/            # Extensões admin customizadas
        ├── solar-products/    # Dashboard produtos solares
        └── solar-calculator/  # Ferramentas de cálculo
```

│   └── b2b/                   # APIs B2B
└── admin/
    └── extensions/            # Extensões admin customizadas

```

### 2. Modelo de Dados Customizado

#### Extensões dos Modelos Base

```typescript
// src/modules/solar-products/models/solar-panel.ts
const SolarPanel = model.define("solar_panel", {
  id: model.id().primaryKey(),
  base_product_id: model.text(), // Link para produto base Medusa
  manufacturer: model.text(),
  model: model.text(),
  power_watts: model.number(),
  technology: model.enum(["MONO", "POLY", "PERC", "TOPCON"]),
  efficiency: model.number(),
  dimensions: model.json(), // {length, width, height}
  weight_kg: model.number(),
  certifications: model.json(), // Array de certificações
  warranty_years: model.number(),
  temperature_coefficient: model.number(),
  max_system_voltage: model.number(),
  // ... outros campos técnicos
})

// src/modules/solar-products/models/solar-kit.ts
const SolarKit = model.define("solar_kit", {
  id: model.id().primaryKey(),
  name: model.text(),
  type: model.enum(["ON_GRID", "OFF_GRID", "HYBRID"]),
  total_power_kw: model.number(),
  estimated_generation_kwh: model.number(),
  components: model.json(), // Array de componentes com specs
  pricing_tiers: model.json(), // B2B pricing por volume
  region_compatibility: model.json(), // Regiões suportadas
})
```

#### Links Entre Módulos

```typescript
// src/links/vendor-solar-product.ts
export default defineLink(
  MarketplaceModule.linkable.vendor,
  {
    linkable: SolarProductsModule.linkable.solar_panel,
    isList: true,
  }
)
```

### 3. Workflows Personalizados

#### Workflow de Criação de Kit Solar

```typescript
// src/workflows/solar/create-solar-kit/index.ts
const createSolarKitWorkflow = createWorkflow(
  "create-solar-kit",
  (input: CreateSolarKitInput) => {
    // 1. Validar componentes
    const validatedComponents = validateKitComponents(input.components)

    // 2. Calcular especificações do sistema
    const systemSpecs = calculateSystemSpecs(validatedComponents)

    // 3. Criar produto base no Medusa
    const baseProduct = createProductsWorkflow.runAsStep({
      input: {
        products: [{
          title: input.name,
          type_id: SOLAR_KIT_TYPE,
          // ... outros campos
        }]
      }
    })

    // 4. Criar kit solar customizado
    const solarKit = createSolarKitStep({
      base_product_id: baseProduct.id,
      components: validatedComponents,
      system_specs: systemSpecs,
    })

    // 5. Vincular ao distribuidor (se aplicável)
    if (input.vendor_id) {
      createRemoteLinkStep([{
        [MARKETPLACE_MODULE]: { vendor_id: input.vendor_id },
        [SOLAR_PRODUCTS_MODULE]: { solar_kit_id: solarKit.id },
      }])
    }

    return new WorkflowResponse({ kit: solarKit })
  }
)
```

#### Workflow de Dimensionamento de Sistema

```typescript
// src/workflows/solar/calculate-system/index.ts
const calculateSystemWorkflow = createWorkflow(
  "calculate-system",
  (input: SystemCalculationInput) => {
    // 1. Obter dados de irradiação solar da região
    const solarIrradiation = getSolarIrradiation(input.location)

    // 2. Calcular geração mensal/anual
    const generation = calculateGeneration({
      panels: input.panels,
      inverter: input.inverter,
      irradiation: solarIrradiation,
      losses: input.system_losses,
    })

    // 3. Otimizar configuração
    const optimizedConfig = optimizeConfiguration({
      generation_target: input.energy_needed,
      available_components: input.available_components,
      budget: input.budget,
    })

    return new WorkflowResponse({
      generation,
      optimized_config: optimizedConfig,
      roi: calculateROI(optimizedConfig, input.electricity_cost),
    })
  }
)
```

### 4. APIs Customizadas

#### API de Kits Solares

```typescript
// src/api/solar-kits/route.ts
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: kits } = await query.graph({
    entity: "solar_kit",
    fields: [
      "id", "name", "type", "total_power_kw",
      "estimated_generation_kwh", "components.*",
      "pricing_tiers.*", "region_compatibility.*"
    ],
    filters: req.query, // Suporte a filtros avançados
  })

  res.json({ solar_kits: kits })
}

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const { result } = await createSolarKitWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  res.json({ solar_kit: result.kit })
}
```

#### API B2B para Distribuidores

```typescript
// src/api/b2b/pricing/route.ts
export const GET = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const vendorId = req.auth_context.actor_id

  const pricing = await getB2BPricing({
    vendor_id: vendorId,
    products: req.query.product_ids,
    quantities: req.query.quantities,
  })

  res.json({ pricing })
}
```

### 5. Extensões do Admin

#### Dashboard de Produtos Solares

```typescript
// src/admin/extensions/solar-products/page.tsx
const SolarProductsPage = () => {
  return (
    <Container>
      <Heading>Solar Products Management</Heading>

      {/* Filtros por fabricante, potência, eficiência */}
      <SolarProductFilters />

      {/* Tabela com specs técnicas */}
      <SolarProductTable
        columns={[
          "manufacturer", "model", "power_watts", "efficiency",
          "warranty_years", "certifications", "price"
        ]}
      />

      {/* Modal de criação/edição */}
      <SolarProductModal />
    </Container>
  )
}
```

#### Widget de Especificações Técnicas

```typescript
// src/admin/widgets/technical-specs.tsx
const TechnicalSpecsWidget = ({ product }) => {
  if (!isSolarProduct(product)) return null

  return (
    <WidgetContainer title="Technical Specifications">
      <SpecsGrid>
        <SpecItem label="Power" value={`${product.power_watts}W`} />
        <SpecItem label="Efficiency" value={`${product.efficiency}%`} />
        <SpecItem label="Dimensions" value={formatDimensions(product.dimensions)} />
        <SpecItem label="Weight" value={`${product.weight_kg}kg`} />
        <SpecItem label="Warranty" value={`${product.warranty_years} years`} />
      </SpecsGrid>
    </WidgetContainer>
  )
}
```

### 6. Cenários B2B/B2C

#### B2B (Distribuidores)

- **Dashboard dedicado**: Gestão de produtos, pedidos, clientes B2B
- **Precificação por volume**: Descontos baseados em quantidade
- **Pedidos bulk**: Criação de pedidos grandes com componentes customizados
- **Integração ERP**: APIs para sincronização com sistemas internos
- **Relatórios avançados**: Análise de vendas por região/produto

#### B2C (Consumidores Finais)

- **Configurador de sistemas**: Interface para dimensionar sistemas solares
- **Calculadora de ROI**: Estimativa de retorno do investimento
- **Comparador de produtos**: Side-by-side de painéis/inversores
- **Simulação de geração**: Baseado em localização e consumo
- **E-commerce simplificado**: Checkout otimizado para produtos solares

### 7. Estratégia de Migração

#### Fase 1: Setup Base (1-2 semanas)

1. Instalar Medusa.js com Next.js storefront
2. Criar módulos marketplace e solar-products
3. Configurar banco PostgreSQL
4. Implementar autenticação vendor/admin

#### Fase 2: Migração de Dados (1 semana)

1. Criar scripts de migração para esquemas enriquecidos
2. Migrar produtos base (painéis, inversores, estruturas)
3. Migrar kits FOTUS (247 kits)
4. Vincular imagens otimizadas

#### Fase 3: Customizações Core (2-3 semanas)

1. Implementar workflows de kits solares
2. Criar APIs customizadas
3. Desenvolver extensões admin
4. Configurar precificação B2B

#### Fase 4: Frontend & Integração (2 semanas)

1. Customizar storefront para produtos solares
2. Implementar configurador de sistemas
3. Criar dashboards B2B/B2C
4. Integrar calculadora de ROI

#### Fase 5: Testes & Deploy (1 semana)

1. Testes end-to-end
2. Performance optimization
3. Deploy na nuvem
4. Monitoramento e analytics

### 8. Benefícios da Arquitetura

#### Para YSH

- **Escalabilidade**: Arquitetura modular permite crescimento
- **Flexibilidade**: Headless permite múltiplos canais de venda
- **B2B Focus**: Capacidades específicas para vendas empresariais
- **Integração**: Fácil conexão com ERPs e sistemas existentes

#### Para Distribuidores

- **Autonomia**: Gestão própria de produtos e pedidos
- **Analytics**: Relatórios detalhados de vendas
- **Integração**: APIs para sincronização com sistemas internos
- **Customização**: Possibilidade de produtos exclusivos

#### Para Clientes

- **Experiência**: Configurador intuitivo de sistemas solares
- **Transparência**: Especificações técnicas completas
- **Comparação**: Ferramentas para tomada de decisão
- **Suporte**: Atendimento personalizado por distribuidor

### 9. Próximos Passos Recomendados

1. **Avaliação Técnica**: Revisar requisitos específicos não cobertos
2. **Prototipagem**: Criar POC com um kit solar completo
3. **Planejamento de Integração**: Definir APIs para sistemas existentes
4. **Design de UX**: Prototipar interfaces B2B/B2C
5. **Estimativa de Custos**: Orçamento desenvolvimento e infraestrutura

---

**Conclusão**: Medusa.js oferece uma base sólida e extensível para construir uma plataforma de e-commerce especializada em produtos solares, com suporte nativo a marketplace multi-vendor e capacidades B2B robustas. A arquitetura proposta permite integrar perfeitamente o catálogo enriquecido de 247 kits FOTUS, criando uma experiência diferenciada para distribuidores e clientes finais no mercado solar brasileiro.
