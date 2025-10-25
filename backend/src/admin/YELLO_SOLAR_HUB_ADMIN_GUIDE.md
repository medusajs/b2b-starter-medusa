# 🌞 Yellow Solar Hub - Personalizações do Admin Medusa

## Visão Geral

Este documento descreve as personalizações do painel administrativo do Medusa especificamente projetadas para o catálogo de equipamentos solares da **Yellow Solar Hub**. As personalizações incluem widgets especializados para gerenciar painéis solares, inversores, kits completos e outros componentes do sistema fotovoltaico.

## 📊 Catálogo Yellow Solar Hub

### Inventário Atual

- **1.123 produtos totais** distribuídos em 12 categorias
- **480 inversores** (maior categoria) - Off-Grid, Grid-Tie, Híbridos, Microinversores
- **83 kits solares** - Sistemas completos com painéis + inversores + estruturas
- **29 painéis solares** - 585W-610W monocristalinos
- **83 carregadores EV** - Soluções de recarga para veículos elétricos
- **Outros**: 55 cabos, 38 controladores, 13 string boxes, 40 estruturas, 9 baterias

### Distribuidores

- **NEOSOLAR** - Principal distribuidor
- **FOTUS** - Kits e sistemas completos
- **ODEX** - Painéis e inversores
- **SOLFÁCIL** - Diversos produtos solares

## 🎨 Widgets Personalizados Implementados

### 1. Solar Inventory Dashboard Widget

**Arquivo**: `backend/src/admin/widgets/solar-inventory-dashboard.tsx`

**Localização**: Aparece antes da listagem de produtos (`product.list.before`)

**Funcionalidades**:

- ☀️ Métricas gerais do inventário solar
- 📊 Contagem de produtos por categoria com ícones visuais
- ⚡ Capacidade total de potência (painéis + inversores + kits)
- 💰 Valor total do estoque e preço médio
- ⚠️ Alertas para produtos sem preço
- 📈 Gráficos de distribuição de poder por categoria
- 🔄 Botão de atualização para recarregar métricas

**Dados Exibidos**:

```typescript
{
  totalProducts: 1123,
  categories: {
    panels: 26,
    inverters: 480,
    kits: 83,
    batteries: 9,
    cables: 55,
    controllers: 38,
    chargers: 83,
    structures: 40,
    stringboxes: 13
  },
  powerMetrics: {
    totalPanelPowerMW: 15.6,
    totalInverterPowerMW: 2400,
    totalKitPowerMW: 498
  },
  pricing: {
    avgProductPrice: 8200,
    totalInventoryValue: 9200000,
    productsWithoutPrice: 66
  }
}
```

**Screenshot Conceitual**:

```tsx
┌─────────────────────────────────────────────────────────────┐
│ ☀️ Inventário Solar Yellow Hub                   🔄 Atualizar │
├─────────────────────────────────────────────────────────────┤
│  1,123         2,913.1 MW        R$ 9.2M           66        │
│  Produtos      Capacidade        Estoque           Sem Preço │
├─────────────────────────────────────────────────────────────┤
│ Produtos por Categoria                                       │
│  ⚡ Inversores: 480 (42.7%)    🔆 Kits: 83 (7.4%)           │
│  ☀️ Painéis: 26 (2.3%)         🔌 Carregadores: 83 (7.4%)   │
│  🔋 Cabos: 55 (4.9%)           🎛️ Controladores: 38 (3.4%)  │
└─────────────────────────────────────────────────────────────┘
```

### 2. Solar Product Details Widget

**Arquivo**: `backend/src/admin/widgets/solar-product-details.tsx`

**Localização**: Depois dos detalhes do produto (`product.details.after`)

**Funcionalidades**:

- 🔬 Especificações técnicas específicas por categoria
- ⚡ Potência nominal (W, kW, kWp)
- 🔋 Tensão e corrente
- 📊 Eficiência e tecnologia
- 🏷️ Fabricante, modelo e distribuidor
- 📅 Data da última atualização

**Especificações por Categoria**:

#### Painéis Solares (☀️)

- Potência nominal (W)
- Tecnologia (Monocristalino, Policristalino)
- Eficiência (%)
- Tensão (V)
- Corrente (A)

#### Inversores (⚡)

- Potência nominal (kW)
- Tipo (Grid-Tie, Off-Grid, Híbrido, Microinversor)
- Tensão de saída (V)
- Fases (Monofásico, Trifásico)
- Eficiência (%)
- Corrente máxima (A)

#### Kits Solares (🔆)

- Potência do sistema (kWp)
- Quantidade de painéis
- Quantidade de inversores
- Tipo de estrutura
- Centro de distribuição

**Screenshot Conceitual**:

```tsx
┌─────────────────────────────────────────────────────────────┐
│ ⚡ Especificações Técnicas Solares          [Inversor]       │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ ⚡ 5.0 kW  │  │ 🔋 220 V   │  │ 📡 Mono    │            │
│  │ Potência   │  │ Tensão     │  │ Fases      │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ 📊 97.5 %  │  │ 🔧 Grid    │  │ ⚡ 25 A    │            │
│  │ Eficiência │  │ Tipo       │  │ Corrente   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
├─────────────────────────────────────────────────────────────┤
│  Fabricante: DEYE          Distribuidor: NEOSOLAR          │
│  Modelo: SUN-5K-G04        Atualização: 07/10/2025         │
└─────────────────────────────────────────────────────────────┘
```

### 3. Solar Kit Composition Widget

**Arquivo**: `backend/src/admin/widgets/solar-kit-composition.tsx`

**Localização**: Depois dos detalhes do produto (`product.details.after`) - Apenas para produtos tipo "kit"

**Funcionalidades**:

- 🔆 Visão detalhada da composição do kit
- ☀️ Lista de painéis com potência individual e total
- ⚡ Lista de inversores com capacidade
- 🔋 Baterias (quando aplicável)
- 📊 Análise de ratio painel/inversor
- 🔧 Calculadora de sistema integrada
- ⚡ Estimativa de geração de energia (diária, mensal, anual)
- ✅ Validação de compatibilidade do sistema

**Análises Automáticas**:

#### Ratio Painel/Inversor

- ✅ **Excelente**: 1.1x a 1.3x (dimensionamento ideal)
- ⚠️ **Aceitável**: 0.8x a 1.5x (pode ser otimizado)
- ❌ **Fora do Ideal**: < 0.8x ou > 1.5x (revisar)

#### Estimativa de Geração

Baseado em 5 horas de sol pico/dia (média Brasil) e 80% de eficiência:

- **Diária**: kWp × 5h × 0.8
- **Mensal**: diária × 30
- **Anual**: diária × 365

**Exemplo de Kit**:

```typescript
{
  id: "FOTUS-KP04-kits-hibridos",
  name: "Kit 1.2 kWp - ASTRONERGY 600W + TSUNESS 2.25kW",
  potencia_kwp: 1.2,
  panels: [
    {
      brand: "ASTRONERGY",
      power_w: 600,
      quantity: 2,
      description: "600W N-TYPE BIFACIAL (22,2% EF.)"
    }
  ],
  inverters: [
    {
      brand: "TSUNESS",
      power_kw: 2.25,
      quantity: 1,
      description: "MICROINVERSOR 2.25KW MONOFÁSICO 220V"
    }
  ],
  estrutura: "Cerâmico",
  centro_distribuicao: "CD ESPÍRITO SANTO"
}
```

**Screenshot Conceitual**:

```tsx
┌─────────────────────────────────────────────────────────────┐
│ 🔆 Composição do Kit Solar          [1.20 kWp] 🔧 Calculadora│
├─────────────────────────────────────────────────────────────┤
│  ☀️ 2         ⚡ 1           🔋 1.20 kWp     📊 0.53x       │
│  Painéis      Inversores    Sistema         Ratio          │
├─────────────────────────────────────────────────────────────┤
│ ☀️ Painéis Solares                                          │
│  ┌───────────────────────────────────────────────────┐     │
│  │ ☀️  ASTRONERGY                             [2x]    │     │
│  │     600W N-TYPE BIFACIAL (22,2% EF.)              │     │
│  │     Potência: 600W | Total: 1200W                 │     │
│  └───────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│ ⚡ Inversores                                                │
│  ┌───────────────────────────────────────────────────┐     │
│  │ ⚡  TSUNESS                                 [1x]    │     │
│  │     MICROINVERSOR 2.25KW MONOFÁSICO 220V          │     │
│  │     Potência: 2.25kW | Total: 2.25kW              │     │
│  └───────────────────────────────────────────────────┘     │
├─────────────────────────────────────────────────────────────┤
│ 🔧 Análise do Sistema                                       │
│  📊 Ratio: 0.53x  ⚠️ Aceitável, mas pode ser otimizado     │
│  ⚡ Geração Estimada:                                       │
│     4.8 kWh/dia | 144 kWh/mês | 1,752 kWh/ano             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Como Usar as Personalizações

### Visualizar Dashboard Solar

1. Acesse o painel admin do Medusa: `http://localhost:9000/app`
2. Navegue para **Produtos** no menu lateral
3. O widget **Solar Inventory Dashboard** aparecerá automaticamente no topo da página
4. Clique em **🔄 Atualizar** para recarregar as métricas

### Visualizar Especificações de Produto

1. Acesse qualquer produto solar na lista
2. Role até o final da página de detalhes
3. O widget **Especificações Técnicas Solares** exibirá automaticamente os dados técnicos
4. As especificações variam conforme a categoria do produto

### Analisar Composição de Kit

1. Acesse um produto da categoria "kits"
2. Role até encontrar o widget **Composição do Kit Solar**
3. Visualize os componentes: painéis, inversores, baterias
4. Clique em **🔧 Calculadora** para ver análise detalhada:
   - Ratio painel/inversor
   - Estimativa de geração de energia
   - Detalhes completos do sistema

## 📁 Estrutura de Arquivos

```tsx
backend/src/admin/
├── widgets/
│   ├── solar-inventory-dashboard.tsx    # Widget do dashboard principal
│   ├── solar-product-details.tsx        # Widget de especificações técnicas
│   └── solar-kit-composition.tsx        # Widget de composição de kits
├── components/
│   └── (componentes reutilizáveis, se necessário)
├── hooks/
│   └── (hooks personalizados para buscar dados)
├── lib/
│   ├── client.ts                        # Cliente HTTP para API Medusa
│   └── query-key-factory.ts             # Factory de chaves de query
├── utils/
│   ├── format-amount.ts                 # Formatação de valores
│   ├── currency-symbol-map.ts           # Mapeamento de símbolos de moeda
│   └── index.ts                         # Utilitários gerais
├── README.md                            # Este arquivo
└── tsconfig.json                        # Configuração TypeScript
```

## 🔧 Customização Avançada

### Adicionar Novos Widgets

1. Crie um novo arquivo em `backend/src/admin/widgets/nome-do-widget.tsx`
2. Importe `defineWidgetConfig` do `@medusajs/admin-sdk`
3. Defina o componente React do widget
4. Exporte a configuração com a zona desejada:

```tsx
import { defineWidgetConfig } from "@medusajs/admin-sdk"

const MeuWidget = () => {
  return <div>Meu Widget Solar</div>
}

export const config = defineWidgetConfig({
  zone: "product.details.after", // ou "product.list.before", etc.
})

export default MeuWidget
```

### Zonas Disponíveis

- `product.list.before` - Antes da lista de produtos
- `product.list.after` - Depois da lista de produtos
- `product.details.before` - Antes dos detalhes do produto
- `product.details.after` - Depois dos detalhes do produto
- `order.details.after` - Depois dos detalhes do pedido
- `customer.details.after` - Depois dos detalhes do cliente

### Buscar Dados da API

Use o cliente HTTP configurado em `backend/src/admin/lib/client.ts`:

```tsx
import { useEffect, useState } from "react"

const fetchProducts = async () => {
  const response = await fetch('/admin/products?limit=1000', {
    credentials: 'include'
  })
  
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  
  const data = await response.json()
  return data.products
}
```

## 📊 Estrutura de Dados dos Produtos

### Metadados Técnicos

Todos os produtos solares incluem metadados estruturados:

```typescript
{
  id: "neosolar_inverters_22916",
  name: "Microinversor Deye SUN2250 G4",
  category: "inverters",
  price_brl: 1719,
  metadata: {
    category: "inverters",
    manufacturer: "DEYE",
    model: "SUN2250 G4",
    source: "portalb2b.neosolar.com.br",
    technical_specs: {
      power_kw: 2.25,
      type: "MICROINVERSOR",
      voltage_v: 220,
      phases: "Monofásico",
      efficiency: 97.5,
      current_a: 10
    },
    normalized: true,
    normalized_at: "2025-10-07T05:03:13.590712"
  }
}
```

### Kits Solares

Kits incluem componentes aninhados:

```typescript
{
  id: "FOTUS-KP04-kits",
  name: "Kit 1.14 kWp - SOLAR N PLUS + DEYE",
  type: "kits",
  potencia_kwp: 1.14,
  panels: [
    {
      brand: "SOLAR N PLUS",
      power_w: 570,
      quantity: 2,
      description: "570W N-TYPE BIFACIAL DG (22,1% EF.)"
    }
  ],
  inverters: [
    {
      brand: "DEYE",
      power_kw: 2.25,
      quantity: 1,
      description: "MICROINVERSOR 2.25KW MONOFÁSICO 220V"
    }
  ],
  estrutura: "Cerâmico",
  centro_distribuicao: "CD ESPÍRITO SANTO"
}
```

## 🔍 Manutenção e Troubleshooting

### Widgets Não Aparecem

1. **Verificar build do admin**:

   ```bash
   cd backend
   yarn build
   ```

2. **Verificar logs do servidor**:

   ```bash
   yarn dev
   # Procurar por erros relacionados a admin customization
   ```

3. **Limpar cache do navegador**:
   - Ctrl+Shift+R (Windows/Linux)
   - Cmd+Shift+R (Mac)

### Dados Não Carregam

1. **Verificar autenticação**: Widgets usam `credentials: 'include'` para manter sessão
2. **Verificar estrutura de dados**: Produtos devem ter `metadata.category` e `metadata.technical_specs`
3. **Verificar console do navegador**: F12 → Console para ver erros JavaScript

### Performance Lenta

1. **Limitar quantidade de produtos**: Widgets buscam até 1000 produtos
2. **Adicionar paginação**: Para catálogos muito grandes
3. **Usar cache**: Implementar cache de dados com React Query

## 📈 Próximas Melhorias

### Features Planejadas

- [ ] **Comparador de Produtos**: Comparar especificações lado a lado
- [ ] **Builder de Kits**: Interface drag-and-drop para montar kits personalizados
- [ ] **Calculadora de ROI**: Calcular retorno sobre investimento para clientes
- [ ] **Mapa de Distribuição**: Visualizar centros de distribuição no mapa
- [ ] **Relatórios de Estoque**: Gerar relatórios em PDF/Excel
- [ ] **Integração com Distribuidores**: Sincronizar preços e disponibilidade em tempo real

### Integrações Futuras

- **API NEOSOLAR**: Sincronização automática de catálogo
- **API FOTUS**: Atualização de kits e preços
- **CRM Solar**: Integração com ferramentas de vendas solar
- **Google Analytics**: Rastreamento de produtos mais visualizados

## 🆘 Suporte

Para dúvidas ou problemas com as personalizações:

1. Consulte a [documentação do Medusa Admin SDK](https://docs.medusajs.com/resources/admin-sdk)
2. Verifique os exemplos em `backend/src/admin/widgets/`
3. Revise os logs do servidor em `backend/.medusa/server/logs/`

## 📝 Changelog

### v1.0.0 - 2025-01-XX (Versão Inicial)

- ✅ Solar Inventory Dashboard Widget
- ✅ Solar Product Details Widget
- ✅ Solar Kit Composition Widget
- ✅ Calculadora de sistema integrada
- ✅ Análise automática de ratio painel/inversor
- ✅ Estimativa de geração de energia
- ✅ Suporte para 12 categorias de produtos
- ✅ Integração com catálogo de 1.123 produtos

---

**Desenvolvido para Yellow Solar Hub** 🌞⚡  
*Personalizações para o maior distribuidor de equipamentos solares do Brasil*
