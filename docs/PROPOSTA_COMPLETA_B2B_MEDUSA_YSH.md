# Proposta Completa: Marketplace B2B Medusa para Yello Solar Hub

## Customização "All-in-One Solar Shop" com Cobertura 360º End-to-End

**Data:** Outubro 2025  
**Versão:** 3.0 - Consolidada com Storefront e Backend  
**Cliente:** Yello Solar Hub (YSH)  
**Base:** [Medusa B2B Starter](https://github.com/medusajs/b2b-starter-medusa)  
**Catálogo:** 1.161 produtos unificados

---

## 🎯 Visão Executiva

Transformar o **Medusa B2B Starter** em uma plataforma marketplace especializada em produtos solares, aproveitando toda a infraestrutura B2B nativa do repositório oficial e adicionando customizações específicas para o mercado fotovoltaico, oferecendo cobertura completa **360º end-to-end**.

### Stack Completo Analisado

#### Backend (Framework Medusa 2.4)

- **Core**: Node.js 20 + TypeScript + PostgreSQL 15
- **Arquitetura**: Modular com módulos customizados (`company`, `approval`, `quote`)
- **Workflows**: SDK de workflows para processos complexos
- **Links**: Sistema de links remotos entre módulos
- **Migrations**: MikroORM para gerenciamento de schema

#### Storefront (Next.js 15)

- **Framework**: App Router + Server Components + Server Actions
- **UI**: Tailwind CSS + @medusajs/ui components
- **Autenticação**: Sistema de login integrado com customer/employee
- **Carrinho**: Context API com cart management
- **Checkout**: Multi-step workflow com aprovações

---

## 📊 Análise Detalhada do Repositório Base

### Módulos Backend Customizados

#### 1. Company Module (`src/modules/company`)

**Modelos:**

```typescript
// Company Model
{
  id: string (prefix: "comp")
  name: string
  email: string
  phone: string?
  address, city, state, zip, country: string?
  logo_url: string?
  currency_code: string?
  spending_limit_reset_frequency: enum ["never", "daily", "weekly", "monthly", "yearly"]
  employees: Employee[]
}

// Employee Model  
{
  id: string (prefix: "emp")
  spending_limit: bigNumber (default: 0)
  is_admin: boolean (default: false)
  company_id: string
  customer_id: string (linked via remote link)
}
```

**Workflows Existentes:**

- `create-companies`: Cria empresa + approval settings
- `update-companies`: Atualiza dados da empresa
- `delete-companies`: Remove empresa + settings
- `add-company-to-customer-group`: Vincula empresa a grupo de clientes

**APIs Admin:**

- `GET/POST /admin/companies` - CRUD empresas
- `GET/POST /admin/companies/:id/employees` - Gestão funcionários
- `POST /admin/companies/:id/approval-settings` - Config aprovações

**APIs Store:**

- `GET/POST /store/companies` - Empresas públicas
- `POST /store/companies/:id/employees` - Auto-cadastro funcionários

#### 2. Approval Module (`src/modules/approval`)

**Modelos:**

```typescript
// Approval Settings
{
  id: string
  company_id: string
  requires_admin_approval: boolean
  requires_sales_manager_approval: boolean
}

// Approval
{
  id: string
  cart_id: string
  type: enum ["admin", "sales_manager"]
  status: enum ["pending", "approved", "rejected"]
  created_by: string
  handled_by: string
}

// Approval Status (linked to cart)
{
  id: string
  cart_id: string
  status: enum ["pending", "approved", "rejected"]
}
```

**Workflows Existentes:**

- `create-approvals`: Cria aprovação + status no carrinho
- `update-approvals`: Aprova/rejeita aprovações
- `create-approval-settings`: Config inicial aprovações
- `update-approval-settings`: Atualiza regras de aprovação

**Validações (Hooks):**

```typescript
// src/workflows/hooks/validate-cart-completion.ts
completeCartWorkflow.hooks.validate(async ({ cart }) => {
  // 1. Verifica se aprovação pendente
  if (isPendingApproval) throw Error("Cart is pending approval")
  
  // 2. Verifica limite de gastos
  if (checkSpendingLimit(cart, customer)) {
    throw Error("Cart total exceeds spending limit")
  }
})
```

#### 3. Quote Module (Existente no Backend)

**Estrutura Identificada:**

- Sistema de cotações B2B integrado
- Comunicação bidirecional empresa ↔ vendedor
- Conversão de cotação para pedido

### Funcionalidades Storefront (Next.js 15)

#### Autenticação & Permissões

```typescript
// Login com employee role detection
// src/modules/account/components/login
- Login form com email/password
- Remember me checkbox
- Detecção automática de employee/admin
- Redirecionamento baseado em role

// Customer Context
interface B2BCustomer extends HttpTypes.StoreCustomer {
  employee: QueryEmployee | null
  orders?: HttpTypes.StoreOrder[]
  cart?: B2BCart[]
}
```

#### Carrinho & Checkout

```typescript
// Cart Context com B2B Features
// src/lib/context/cart-context.tsx
{
  cart: B2BCart
  approvals: QueryApproval[]
  approval_status: QueryApprovalStatus
  company: QueryCompany
  promotions: HttpTypes.StorePromotion[]
}

// Checkout Multi-Step
1. Shipping Address
2. Billing Address  
3. Delivery Method
4. Contact Information
5. Payment (com aprovações)

// Approval Workflow no Checkout
if (requiresApproval && !isApproved) {
  <RequestApprovalButton />
} else {
  <PaymentButton />
}
```

#### Componentes B2B Chave

**Spending Limit Check:**

```typescript
// src/lib/util/check-spending-limit.ts
function checkSpendingLimit(cart, customer) {
  const spendWindow = getSpendWindow(company) // daily/weekly/monthly/yearly
  const spent = getOrderTotalInSpendWindow(orders, spendWindow)
  return spent + cart.total > employee.spending_limit
}
```

**Approval Status Banner:**

```typescript
// src/modules/cart/components/approval-status-banner
- PENDING: "Cart is locked for approval"
- REJECTED: "Request approval from checkout page"
- APPROVED: "Cart approved, can be completed"
```

**Bulk Add to Cart:**

```typescript
// src/modules/products/components/product-variants-table
- Grid view de variantes
- Input quantidade por variante
- "Add X items to cart" bulk action
```

**Free Shipping Nudge:**

```typescript
// src/modules/shipping/components/free-shipping-price-nudge
- Progress bar até frete grátis
- Popup celebração quando atingido
- Integrado com carrinho drawer
```

#### Dashboard Empresa (Admin Panel)

**Company Overview:**

```typescript
// src/admin/routes/companies/[companyId]/page.tsx
- Info básica empresa
- Logo, endereço, contato
- Approval settings toggle
- Lista employees com:
  * Avatar + nome
  * Email
  * Spending limit
  * Admin badge
  * Actions menu (edit/delete)
```

**Employee Management:**

```typescript
// Componentes de gestão
- EmployeeCreateDrawer: Novo funcionário
- EmployeesUpdateForm: Editar funcionário
- EmployeesActionsMenu: Ações rápidas
- Spending limit com currency input
- Admin access toggle
```

---

## 🏗️ Arquitetura de Customização Solar

### Módulos Solares Propostos

#### 1. Solar Products Module

```typescript
// src/modules/solar-products/models/solar-product.ts
export const SolarProduct = model.define("solar_product", {
  id: model.id({ prefix: "sp" }).primaryKey(),
  base_product_id: model.text(), // Link para produto Medusa
  category: model.enum([
    "panels", "inverters", "batteries", "structures",
    "cables", "stringboxes", "controllers", "ev_chargers", 
    "posts", "accessories", "kits"
  ]),
  manufacturer: model.text(),
  model: model.text(),
  
  // Specs técnicas por categoria
  technical_specs: model.json(), // Flexível por tipo
  
  // Compatibilidade
  compatibility_matrix: model.json(), // Regras de compatibilidade
  
  // Certificações
  certifications: model.json(), // INMETRO, IEC, etc
  
  // Garantia
  warranty_info: model.json(), // Anos, termos, cobertura
  
  // Performance
  performance_data: model.json(), // Curvas, eficiência, degradação
})

// src/modules/solar-products/models/solar-kit.ts
export const SolarKit = model.define("solar_kit", {
  id: model.id({ prefix: "skit" }).primaryKey(),
  name: model.text(),
  type: model.enum(["ON_GRID", "OFF_GRID", "HYBRID"]),
  
  // Configuração
  configuration: model.json(), // Components list com IDs
  total_power_kw: model.number(),
  
  // Geração estimada
  estimated_generation: model.json(), // Por região, mensal/anual
  
  // ROI
  roi_calculation: model.json(), // Payback, savings
  
  // Precificação B2B
  pricing_tiers: model.json(), // Volume discounts
  
  // Região
  region_compatibility: model.json(), // Regiões BR compatíveis
})
```

**Service:**

```typescript
// src/modules/solar-products/service.ts
class SolarProductsModuleService extends MedusaService({
  SolarProduct,
  SolarKit,
}) {
  async validateCompatibility(components: string[]): Promise<boolean> {
    // Valida compatibilidade entre componentes
  }
  
  async calculateSystemPerformance(kitId: string, location: GeoLocation) {
    // Calcula geração baseado em irradiação solar
  }
  
  async optimizeConfiguration(requirements: SystemRequirements) {
    // Otimiza configuração baseado em necessidades
  }
}
```

#### 2. Solar Calculator Module

```typescript
// src/modules/solar-calculator/models/calculation.ts
export const SolarCalculation = model.define("solar_calculation", {
  id: model.id({ prefix: "scalc" }).primaryKey(),
  customer_id: model.text(),
  
  // Input
  location: model.json(), // Lat, Long, cidade, estado
  consumption_profile: model.json(), // kWh mensal por mês
  roof_area: model.number().nullable(),
  roof_type: model.text().nullable(),
  budget: model.number().nullable(),
  
  // Output
  recommended_power_kw: model.number(),
  estimated_generation_kwh: model.number(),
  system_configuration: model.json(),
  roi_analysis: model.json(),
  
  // Validação
  validated_at: model.dateTime().nullable(),
  validated_by: model.text().nullable(),
})
```

**Workflows:**

```typescript
// src/workflows/solar/calculate-system/index.ts
export const calculateSystemWorkflow = createWorkflow(
  "calculate-solar-system",
  (input: {
    location: GeoLocation
    consumption: MonthlyConsumption
    budget?: number
    preferences?: SystemPreferences
  }) => {
    // 1. Obter dados solares da região (NASA POWER API ou similar)
    const solarData = getSolarDataStep(input.location)
    
    // 2. Calcular potência necessária
    const sizing = calculateSizingStep({
      consumption: input.consumption,
      solarIrradiation: solarData,
      losses: 0.25 // 25% losses (standard)
    })
    
    // 3. Selecionar componentes compatíveis
    const components = selectComponentsStep({
      powerTarget: sizing.power_kw,
      budget: input.budget,
      preferences: input.preferences
    })
    
    // 4. Validar compatibilidade
    const validation = validateCompatibilityStep(components)
    
    // 5. Calcular ROI
    const roi = calculateROIStep({
      systemCost: components.total_cost,
      generation: sizing.estimated_generation,
      tariff: input.electricityTariff
    })
    
    // 6. Criar cálculo persistido
    const calculation = createCalculationStep({
      ...input,
      ...sizing,
      components,
      roi
    })
    
    return new WorkflowResponse({
      calculation,
      components,
      roi
    })
  }
)

// src/workflows/solar/create-custom-kit/index.ts
export const createCustomKitWorkflow = createWorkflow(
  "create-custom-solar-kit",
  (input: {
    name: string
    components: { product_id: string, quantity: number }[]
    type: "ON_GRID" | "OFF_GRID" | "HYBRID"
  }) => {
    // 1. Validar componentes
    const validated = validateKitComponentsStep(input.components)
    
    // 2. Calcular especificações totais
    const specs = calculateKitSpecsStep(validated)
    
    // 3. Criar produto base no Medusa
    const baseProduct = createProductsWorkflow.runAsStep({
      input: {
        products: [{
          title: input.name,
          type_id: "solar_kit",
          is_giftcard: false,
          discountable: true
        }]
      }
    })
    
    // 4. Criar kit solar
    const kit = createSolarKitStep({
      base_product_id: baseProduct.id,
      name: input.name,
      type: input.type,
      configuration: validated,
      total_power_kw: specs.total_power,
      estimated_generation: specs.generation
    })
    
    // 5. Linkar componentes ao kit
    createRemoteLinkStep(
      validated.map(c => ({
        [SOLAR_PRODUCTS_MODULE]: { solar_kit_id: kit.id },
        [Modules.PRODUCT]: { product_id: c.product_id }
      }))
    )
    
    return new WorkflowResponse({ kit, baseProduct })
  }
)
```

#### 3. Solar Marketplace Module

```typescript
// Extensão do Company Module para distribuidores
export const SolarVendor = model.define("solar_vendor", {
  id: model.id({ prefix: "sv" }).primaryKey(),
  company_id: model.text(), // Link para Company
  
  // Vendor info
  trade_name: model.text(),
  cnpj: model.text(),
  state_registration: model.text().nullable(),
  
  // Comissões
  commission_rate: model.number().default(0.10), // 10%
  performance_bonus: model.number().default(0),
  
  // Inventário
  managed_inventory: model.boolean().default(false),
  
  // Métricas
  total_sales: model.number().default(0),
  monthly_target: model.number().nullable(),
  
  // Status
  is_active: model.boolean().default(true),
  verified_at: model.dateTime().nullable(),
})

// Service com lógica de comissões
class SolarMarketplaceService extends MedusaService({
  SolarVendor
}) {
  async calculateCommission(
    sale: { total: number, vendor_id: string }
  ): Promise<CommissionBreakdown> {
    const vendor = await this.retrieveSolarVendor(sale.vendor_id)
    
    const baseCommission = sale.total * vendor.commission_rate
    const performanceBonus = this.calculatePerformanceBonus(vendor)
    const volumeBonus = this.calculateVolumeBonus(vendor.monthly_sales)
    
    return {
      base: baseCommission,
      performance: performanceBonus,
      volume: volumeBonus,
      total: baseCommission + performanceBonus + volumeBonus
    }
  }
}
```

### APIs Customizadas

#### Solar Products API

```typescript
// src/api/store/solar/products/route.ts
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  
  const { data: products } = await query.graph({
    entity: "solar_product",
    fields: [
      "*",
      "technical_specs",
      "compatibility_matrix",
      "certifications",
      "warranty_info"
    ],
    filters: {
      category: req.query.category,
      manufacturer: req.query.manufacturer
    },
    pagination: req.remoteQueryConfig.pagination
  })
  
  res.json({ solar_products: products })
}

// src/api/store/solar/compatibility/route.ts
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { component_ids } = req.body
  
  const solarService = req.scope.resolve("solarProductsModuleService")
  const isCompatible = await solarService.validateCompatibility(component_ids)
  
  res.json({ 
    compatible: isCompatible.valid,
    warnings: isCompatible.warnings,
    errors: isCompatible.errors
  })
}
```

#### Solar Calculator API

```typescript
// src/api/store/solar/calculator/route.ts
export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { result } = await calculateSystemWorkflow(req.scope).run({
    input: {
      location: req.validatedBody.location,
      consumption: req.validatedBody.consumption,
      budget: req.validatedBody.budget
    }
  })
  
  res.json({
    calculation: result.calculation,
    recommended_components: result.components,
    roi_analysis: result.roi
  })
}

// src/api/store/solar/kits/custom/route.ts
export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { result } = await createCustomKitWorkflow(req.scope).run({
    input: req.validatedBody
  })
  
  res.json({
    solar_kit: result.kit,
    product: result.baseProduct
  })
}
```

### Extensões Admin Dashboard

#### Solar Products Dashboard

```tsx
// src/admin/routes/solar-products/page.tsx
export default function SolarProductsPage() {
  const { products, isLoading } = useSolarProducts()
  
  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <Heading>Solar Products</Heading>
        <Button onClick={() => openCreateModal()}>
          Add Solar Product
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <Tabs.List>
          <Tabs.Trigger value="all">All Products</Tabs.Trigger>
          <Tabs.Trigger value="panels">Panels</Tabs.Trigger>
          <Tabs.Trigger value="inverters">Inverters</Tabs.Trigger>
          <Tabs.Trigger value="batteries">Batteries</Tabs.Trigger>
          <Tabs.Trigger value="kits">Kits</Tabs.Trigger>
        </Tabs.List>
        
        <Tabs.Content value="all">
          <SolarProductsTable products={products} />
        </Tabs.Content>
      </Tabs>
    </Container>
  )
}

// Componente de tabela com specs técnicas
function SolarProductsTable({ products }) {
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Image</Table.HeaderCell>
          <Table.HeaderCell>Name</Table.HeaderCell>
          <Table.HeaderCell>Manufacturer</Table.HeaderCell>
          <Table.HeaderCell>Power</Table.HeaderCell>
          <Table.HeaderCell>Efficiency</Table.HeaderCell>
          <Table.HeaderCell>Certifications</Table.HeaderCell>
          <Table.HeaderCell>Price</Table.HeaderCell>
          <Table.HeaderCell>Actions</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {products.map(product => (
          <Table.Row key={product.id}>
            <Table.Cell>
              <img src={product.image} className="w-12 h-12" />
            </Table.Cell>
            <Table.Cell>{product.name}</Table.Cell>
            <Table.Cell>{product.manufacturer}</Table.Cell>
            <Table.Cell>{product.technical_specs.power_w}W</Table.Cell>
            <Table.Cell>{product.technical_specs.efficiency}%</Table.Cell>
            <Table.Cell>
              {product.certifications.map(cert => (
                <Badge key={cert}>{cert}</Badge>
              ))}
            </Table.Cell>
            <Table.Cell>
              {formatAmount(product.price, product.currency_code)}
            </Table.Cell>
            <Table.Cell>
              <ProductActionsMenu product={product} />
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
```

#### Solar Calculator Widget

```tsx
// src/admin/widgets/solar-calculator-widget.tsx
export default function SolarCalculatorWidget() {
  const [calculation, setCalculation] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const handleCalculate = async (data) => {
    setLoading(true)
    const result = await fetch("/admin/solar/calculate", {
      method: "POST",
      body: JSON.stringify(data)
    })
    setCalculation(await result.json())
    setLoading(false)
  }
  
  return (
    <Container>
      <Heading>Solar System Calculator</Heading>
      <CalculatorForm onSubmit={handleCalculate} loading={loading} />
      {calculation && (
        <CalculationResults 
          sizing={calculation.sizing}
          components={calculation.components}
          roi={calculation.roi}
        />
      )}
    </Container>
  )
}
```

### Storefront Solar Features

#### Configurador Inteligente

```tsx
// storefront/src/modules/solar/components/system-configurator/index.tsx
export default function SystemConfigurator() {
  const [step, setStep] = useState(1)
  const [config, setConfig] = useState({})
  
  return (
    <Container className="max-w-4xl mx-auto py-12">
      <StepIndicator currentStep={step} totalSteps={5} />
      
      {step === 1 && (
        <LocationStep 
          onNext={(location) => {
            setConfig({ ...config, location })
            setStep(2)
          }}
        />
      )}
      
      {step === 2 && (
        <ConsumptionStep
          onNext={(consumption) => {
            setConfig({ ...config, consumption })
            setStep(3)
          }}
        />
      )}
      
      {step === 3 && (
        <PreferencesStep
          onNext={(preferences) => {
            setConfig({ ...config, preferences })
            setStep(4)
          }}
        />
      )}
      
      {step === 4 && (
        <ResultsStep
          config={config}
          onAddToCart={(kit) => {
            addToCart(kit)
            setStep(5)
          }}
        />
      )}
      
      {step === 5 && <SuccessStep />}
    </Container>
  )
}

// Location Step com mapa interativo
function LocationStep({ onNext }) {
  const [address, setAddress] = useState("")
  const [coords, setCoords] = useState(null)
  
  const handleGeocode = async () => {
    // Google Maps Geocoding API
    const result = await geocodeAddress(address)
    setCoords(result.coordinates)
  }
  
  return (
    <div className="space-y-6">
      <Heading>Where will the system be installed?</Heading>
      
      <AddressAutocomplete 
        value={address}
        onChange={setAddress}
        onSelect={handleGeocode}
      />
      
      {coords && (
        <>
          <MapPreview coordinates={coords} />
          <SolarIrradiationInfo coordinates={coords} />
        </>
      )}
      
      <Button 
        onClick={() => onNext({ address, coords })}
        disabled={!coords}
        size="large"
        className="w-full"
      >
        Continue
      </Button>
    </div>
  )
}

// Results Step com recomendações
function ResultsStep({ config, onAddToCart }) {
  const { data: calculation } = useSolarCalculation(config)
  
  if (!calculation) return <LoadingSpinner />
  
  return (
    <div className="space-y-6">
      <Heading>Recommended System</Heading>
      
      <SystemSummary 
        powerKw={calculation.sizing.power_kw}
        generation={calculation.sizing.estimated_generation}
        cost={calculation.components.total_cost}
      />
      
      <ROICard roi={calculation.roi} />
      
      <ComponentsList components={calculation.components.items} />
      
      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="secondary"
          onClick={() => downloadPDF(calculation)}
        >
          Download PDF
        </Button>
        <Button
          onClick={() => onAddToCart(calculation.components)}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  )
}
```

#### Comparador de Produtos

```tsx
// storefront/src/modules/solar/components/product-comparison/index.tsx
export default function ProductComparison({ products }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left p-4">Specification</th>
            {products.map(p => (
              <th key={p.id} className="text-center p-4">
                <img src={p.image} className="w-24 h-24 mx-auto" />
                <Text className="font-medium">{p.name}</Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <ComparisonRow 
            label="Power"
            values={products.map(p => `${p.technical_specs.power_w}W`)}
          />
          <ComparisonRow
            label="Efficiency"
            values={products.map(p => `${p.technical_specs.efficiency}%`)}
            highlight="highest"
          />
          <ComparisonRow
            label="Warranty"
            values={products.map(p => `${p.warranty_info.years} years`)}
          />
          <ComparisonRow
            label="Price"
            values={products.map(p => formatAmount(p.price, p.currency))}
            highlight="lowest"
          />
          <tr>
            <td className="p-4"></td>
            {products.map(p => (
              <td key={p.id} className="text-center p-4">
                <Button onClick={() => addToCart(p)}>
                  Add to Cart
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
```

---

## ⚡ Estratégias de Performance

### 1. Backend Optimization

**Database Indexing:**

```sql
-- Solar products performance indexes
CREATE INDEX idx_solar_product_category_power 
ON solar_product (category, total_power_kw DESC);

CREATE INDEX idx_solar_product_manufacturer 
ON solar_product (manufacturer, model);

CREATE INDEX idx_solar_kit_power_roi 
ON solar_kit (total_power_kw, roi_percentage DESC);

-- Company & Employee indexes (já existentes)
CREATE INDEX idx_employee_company_id 
ON employee (company_id) WHERE deleted_at IS NULL;
```

**Query Optimization:**

```typescript
// Usar query.graph com campos específicos
const { data } = await query.graph({
  entity: "solar_product",
  fields: [
    "id", "name", "manufacturer", "model",
    "technical_specs.power_w",
    "technical_specs.efficiency"
  ], // Apenas campos necessários
  filters: { category: "panels" },
  pagination: { limit: 20, offset: 0 }
})
```

**Caching Strategy:**

```typescript
// Redis para cálculos solares (dados irradiação não mudam)
const cacheKey = `solar_data:${lat}:${lng}`
const cached = await redis.get(cacheKey)
if (cached) return JSON.parse(cached)

const data = await fetchSolarData(lat, lng)
await redis.set(cacheKey, JSON.stringify(data), 'EX', 86400) // 24h
```

### 2. Frontend Optimization

**Code Splitting:**

```typescript
// Lazy load heavy components
const SolarCalculator = lazy(() => import('@/modules/solar/components/calculator'))
const ProductComparison = lazy(() => import('@/modules/solar/components/comparison'))

// Uso com Suspense
<Suspense fallback={<CalculatorSkeleton />}>
  <SolarCalculator />
</Suspense>
```

**Image Optimization:**

```typescript
// Next.js Image component com WebP
import Image from 'next/image'

<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  quality={85}
  format="webp"
  loading="lazy"
  placeholder="blur"
/>
```

**Server Components:**

```tsx
// Páginas produto como Server Components
export default async function SolarProductPage({ params }) {
  // Fetch direto no servidor
  const product = await getSolarProduct(params.id)
  
  return (
    <div>
      <ProductHeader product={product} />
      {/* Client components apenas onde necessário */}
      <AddToCartButton productId={product.id} />
    </div>
  )
}
```

---

## 📈 Métricas & Monitoramento

### KPIs Técnicos

| Métrica | Target | Ferramenta |
|---------|--------|------------|
| **TTFB** | <200ms | Vercel Analytics |
| **FCP** | <1.8s | Lighthouse |
| **LCP** | <2.5s | Core Web Vitals |
| **TTI** | <3.5s | Lighthouse |
| **CLS** | <0.1 | Core Web Vitals |
| **API Response** | <200ms | New Relic |
| **Database Query** | <50ms | PostgreSQL EXPLAIN |
| **Uptime** | 99.9% | StatusPage |

### KPIs de Negócio

| Métrica | Target Q1 | Target Q2 |
|---------|-----------|-----------|
| **Conversão B2B** | +150% | +200% |
| **Tempo Configuração** | -80% | -85% |
| **Satisfação Cliente** | 95% | 97% |
| **Revenue Marketplace** | +300% | +400% |
| **Distribuidores Ativos** | 25 | 50 |
| **Kits Configurados** | 500 | 1200 |

### Monitoring Stack

```typescript
// Setup Sentry para error tracking
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ]
})

// New Relic APM para backend
import newrelic from 'newrelic'

app.use(newrelic.instrumentWebFramework())

// Prometheus metrics customizados
import { register, Counter, Histogram } from 'prom-client'

const solarCalculations = new Counter({
  name: 'solar_calculations_total',
  help: 'Total solar system calculations'
})

const calculationDuration = new Histogram({
  name: 'solar_calculation_duration_seconds',
  help: 'Solar calculation duration'
})
```

---

## 🚀 Plano de Implementação

### Fase 1: Foundation (Semanas 1-2)

**Objetivos:**

- Setup Medusa B2B Starter completo
- Configuração banco de dados PostgreSQL
- Migração catálogo inicial (100 produtos teste)
- Validação funcionalidades B2B nativas

**Tasks:**

- [ ] Clone e setup repositório B2B Starter
- [ ] Configurar ambiente dev (backend + storefront)
- [ ] Criar database migrations para módulos solares
- [ ] Script migração dados catálogo YSH
- [ ] Testes funcionais checkout + approval flow

### Fase 2: Solar Modules (Semanas 3-5)

**Objetivos:**

- Implementar módulos customizados solares
- Criar workflows de cálculo e configuração
- APIs especializadas funcionando

**Tasks:**

- [ ] Módulo solar-products com modelos
- [ ] Módulo solar-calculator com workflows
- [ ] Módulo solar-marketplace (vendors)
- [ ] APIs REST completas documentadas
- [ ] Testes unitários + integração (>80% coverage)

### Fase 3: Admin Dashboard (Semana 6)

**Objetivos:**

- Dashboard admin especializado para produtos solares
- Ferramentas gestão vendedores
- Analytics e relatórios

**Tasks:**

- [ ] Solar products CRUD interface
- [ ] Calculator widget admin
- [ ] Vendor management pages
- [ ] Commission reports
- [ ] Analytics dashboard

### Fase 4: Storefront Features (Semanas 7-9)

**Objetivos:**

- Configurador sistema completo
- Comparador produtos
- Mobile PWA

**Tasks:**

- [ ] System configurator 5 steps
- [ ] Product comparison tool
- [ ] ROI calculator integration
- [ ] Mobile responsive + PWA
- [ ] SEO optimization

### Fase 5: Testing & Deploy (Semanas 10-11)

**Objetivos:**

- QA completo
- Performance tuning
- Deploy produção

**Tasks:**

- [ ] Load testing (1000 concurrent users)
- [ ] Security audit
- [ ] Performance optimization (<1.5s load)
- [ ] Setup monitoring (Sentry, New Relic)
- [ ] Production deployment
- [ ] Rollback plan

### Fase 6: Go-Live & Support (Semana 12)

**Objetivos:**

- Lançamento oficial
- Onboarding distribuidores
- Suporte inicial

**Tasks:**

- [ ] Soft launch (distribuidores beta)
- [ ] Training sessions (3 sessões)
- [ ] Documentation complete
- [ ] 24/7 monitoring first week
- [ ] Bug fixes & adjustments

---

## 💰 Investimento Detalhado

### Desenvolvimento (12 semanas)

| Fase | Duração | Equipe | Custo |
|------|---------|--------|-------|
| **Phase 1** | 2 sem | 3 devs | R$ 36.000 |
| **Phase 2** | 3 sem | 3 devs | R$ 54.000 |
| **Phase 3** | 1 sem | 2 devs | R$ 18.000 |
| **Phase 4** | 3 sem | 3 devs | R$ 54.000 |
| **Phase 5** | 2 sem | 4 devs | R$ 36.000 |
| **Phase 6** | 1 sem | 2 devs | R$ 18.000 |
| **Total** | **12 sem** | - | **R$ 216.000** |

### Infraestrutura (Mensal)

| Serviço | Custo | Justificativa |
|---------|-------|---------------|
| **Vercel Pro** | R$ 150 | Hosting storefront + edge functions |
| **Railway/Heroku** | R$ 200 | Backend + workers |
| **PostgreSQL** | R$ 150 | Database managed |
| **Redis** | R$ 100 | Caching layer |
| **CDN Cloudflare** | R$ 100 | Assets + images |
| **Sentry** | R$ 80 | Error tracking |
| **New Relic** | R$ 200 | APM monitoring |
| **Backup S3** | R$ 50 | Storage backups |
| **Total Mensal** | **R$ 1.030** | Escalável |

### ROI Projetado

#### Cenário Conservador (Q1)

- **Revenue adicional**: R$ 600.000
- **Custos totais**: R$ 226.000 (dev + 2 meses infra)
- **Lucro líquido**: R$ 374.000
- **ROI**: 165%
- **Payback**: 2.3 meses

#### Cenário Otimista (Q2)

- **Revenue adicional**: R$ 1.500.000
- **Custos totais**: R$ 230.000 (dev + 4 meses infra)
- **Lucro líquido**: R$ 1.270.000
- **ROI**: 552%
- **Payback**: 0.9 mês

---

## 🎯 Próximos Passos Imediatos

### Semana 1: Validação & Planejamento

1. **Reunião Kickoff** (2h)
   - Apresentação proposta completa
   - Validação requisitos técnicos
   - Definição escopo final

2. **Setup Ambiente Dev** (3 dias)
   - Clone repositório B2B Starter
   - Configuração banco de dados
   - Deploy ambiente staging

3. **Prototipagem** (2 dias)
   - Solar Products CRUD básico
   - Calculator MVP
   - Validação conceito

### Semana 2: Planejamento Detalhado

1. **Refinamento Backlog** (1 dia)
   - User stories detalhadas
   - Estimativas precisas
   - Priorização features

2. **Design System** (2 dias)
   - Componentes solares UI
   - Wireframes principais telas
   - Protótipo Figma

3. **Arquitetura Técnica** (2 dias)
   - Diagrama infraestrutura
   - Fluxo de dados
   - Documentação APIs

### Aprovação Final

**Documentos para Revisão:**

- [ ] Proposta técnica completa
- [ ] Cronograma detalhado 12 semanas
- [ ] Orçamento discriminado
- [ ] Termo de aceite

**Assinaturas:**

- [ ] Product Owner YSH
- [ ] CTO YSH
- [ ] CFO YSH (orçamento)
- [ ] Tech Lead (equipe desenvolvimento)

---

## 📞 Contato & Suporte

**Equipe Projeto:**

- **Tech Lead:** [Nome] - <tech@ysh.com>
- **Product Owner:** [Nome] - <product@ysh.com>
- **DevOps:** [Nome] - <devops@ysh.com>

**Comunicação:**

- **Daily Standups:** Segunda-Sexta 9h30
- **Sprint Reviews:** Sextas 16h
- **Slack Channel:** #ysh-medusa-b2b
- **Project Board:** Jira/Linear

**Ambientes:**

- **Dev:** <https://dev.ysh-solar.com>
- **Staging:** <https://staging.ysh-solar.com>
- **Prod:** <https://marketplace.ysh.com.br>

---

**Yello Solar Hub - Powered by Medusa B2B Starter**  
*Transformando o mercado solar brasileiro com tecnologia de ponta.*
