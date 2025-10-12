# Solar Calculator Module ☀️

Módulo reutilizável para cálculos de sistemas fotovoltaicos. Sem dependências externas - pode ser usado em backend, admin e storefront.

## 📦 Estrutura

```
solar-calculator/
├── types.ts                    # Interfaces TypeScript (14 tipos)
├── constants.ts                # Constantes técnicas e HSP por estado
├── calculator.ts               # Funções de cálculo (puras)
├── index.ts                    # Exports principais
└── __tests__/
    └── calculator.unit.spec.ts # 33 testes unitários (100% passing)
```

## 🎯 Funcionalidades

### 1. Cálculo de Ratio Painel/Inversor

```typescript
import { calculatePanelToInverterRatio, SolarPanel, SolarInverter } from '@modules/solar-calculator';

const panels: SolarPanel[] = [
  { id: 'p1', name: 'Panel 550W', power_w: 550, quantity: 10 }
];

const inverters: SolarInverter[] = [
  { id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 }
];

const result = calculatePanelToInverterRatio(panels, inverters);
// {
//   ratio: 1.1,
//   status: 'excellent', // 'excellent' | 'good' | 'acceptable' | 'warning' | 'error'
//   totalPanelPowerKw: 5.5,
//   totalInverterPowerKw: 5,
//   message: '✅ Excelente - Oversizing otimizado para máxima geração',
//   details: {
//     panelsPerInverter: 10,
//     oversizingPercentage: 10
//   }
// }
```

**Ranges de Ratio**:
- **Excellent**: 1.10 - 1.30 (oversizing otimizado)
- **Good**: 1.05 - 1.35 (dimensionamento adequado)
- **Acceptable**: 0.85 - 1.50 (funcional mas pode otimizar)
- **Warning**: 0.80 - 1.60 (revisar dimensionamento)
- **Error**: < 0.80 ou > 1.60 (fora dos padrões)

### 2. Estimativa de Geração de Energia

```typescript
import { estimateEnergyGeneration, SolarSystem } from '@modules/solar-calculator';

const system: SolarSystem = {
  panels: [
    { id: 'p1', name: 'Panel 550W', power_w: 550, quantity: 10 }
  ],
  inverters: [
    { id: 'i1', name: 'Inverter 5kW', power_kw: 5, quantity: 1 }
  ],
  location: {
    state: 'SP' // Horas de Sol Pico: 4.6h/dia
  }
};

const estimate = estimateEnergyGeneration(system);
// {
//   dailyKwh: 19.2,
//   monthlyKwh: 584,
//   yearlyKwh: 7008,
//   systemSizeKwp: 5.5,
//   peakSunHours: 4.6,
//   systemEfficiency: 0.76,
//   assumptions: {
//     peakSunHoursPerDay: 4.6,
//     performanceRatio: 0.80,
//     degradationFirstYear: 0.005
//   }
// }
```

**Fórmula**: `E = P × HSP × PR × η_inv × (1 - perdas)`

Onde:
- **E**: Energia gerada (kWh/dia)
- **P**: Potência instalada (kWp)
- **HSP**: Horas de Sol Pico (h/dia)
- **PR**: Performance Ratio (0.80 = 80%)
- **η_inv**: Eficiência do inversor (0.975 = 97.5%)

### 3. Validação de Compatibilidade

```typescript
import { validateSystemCompatibility } from '@modules/solar-calculator';

const result = validateSystemCompatibility(system);
// {
//   isCompatible: true,
//   issues: [],     // Problemas críticos/high
//   warnings: [],   // Avisos medium/low
//   score: 100      // Score 0-100
// }
```

**Validações**:
- ✅ Presença de painéis e inversores
- ✅ Limites de potência (min/max)
- ✅ Ratio painel/inversor adequado
- ✅ Tecnologias mistas
- ✅ Sistema economicamente viável

### 4. Projeção de Degradação

```typescript
import { projectEnergyGeneration } from '@modules/solar-calculator';

const projection = projectEnergyGeneration(
  10000,  // Geração inicial (kWh/ano)
  25      // Anos de projeção
);
// [
//   { year: 1, kWh: 10000, degradationFactor: 1.0 },
//   { year: 5, kWh: 9752, degradationFactor: 0.9752 },
//   { year: 10, kWh: 9511, degradationFactor: 0.9511 },
//   { year: 25, kWh: 8867, degradationFactor: 0.8867 }
// ]
```

Taxa de degradação padrão: **0.5% ao ano** (painéis Tier 1)

## 📍 Horas de Sol Pico por Estado

Baseado no Atlas Solarimétrico do Brasil (CRESESB/CEPEL):

| Região | Estados | HSP Médio |
|--------|---------|-----------|
| **Nordeste** (melhor) | RN, BA, PI, CE, PB | 5.5 - 5.9h |
| **Norte** | TO, RR, AP, PA, AM | 4.7 - 5.4h |
| **Centro-Oeste** | GO, DF, MS, MT | 5.2 - 5.4h |
| **Sudeste** | MG, ES, RJ, SP | 4.6 - 5.4h |
| **Sul** (menor) | PR, RS, SC | 4.3 - 4.5h |

**Padrão nacional**: 5.0h/dia

## 🧪 Testes

### Executar Testes

```bash
# Apenas solar-calculator
npm run test:unit -- --testPathPattern=solar-calculator

# Todos os testes unitários
npm run test:unit
```

### Cobertura de Testes (33 testes)

**Power Calculations** (3 testes):
- ✅ `calculateTotalPanelPower`
- ✅ `calculateTotalInverterPower`
- ✅ Arrays vazios e quantidade zero

**Ratio Analysis** (15 testes):
- ✅ Ratios excellent (1.1x - 1.3x)
- ✅ Ratios good (1.05x - 1.35x)
- ✅ Ratios acceptable (0.85x - 1.5x)
- ✅ Ratios warning (0.75x, 1.55x)
- ✅ Ratios error (< 0.8x, > 1.6x)
- ✅ Múltiplos painéis/inversores
- ✅ Max input power validation
- ✅ Strict mode

**Energy Generation** (5 testes):
- ✅ HSP padrão (5.0h)
- ✅ HSP regional (SP, BA, RN)
- ✅ Configurações personalizadas
- ✅ Assumptions corretos

**Compatibility Validation** (6 testes):
- ✅ Sistema correto
- ✅ Falta de painéis/inversores
- ✅ Sistema muito pequeno
- ✅ Ratio inadequado
- ✅ Tecnologias mistas
- ✅ Score calculation

**Degradation** (4 testes):
- ✅ Fator de degradação (0.5%/ano)
- ✅ Taxa personalizada
- ✅ Projeção 25 anos
- ✅ Decrescimento progressivo

## 📚 Constantes Técnicas

### Performance Ratio (PR)

```typescript
DEFAULT_PERFORMANCE_RATIO = 0.80; // 80%
```

Considera perdas por:
- Temperatura (~10%)
- Sujeira (~3%)
- Cabeamento (~3%)
- Sombreamento (~2%)
- Descasamento (~2%)

### Eficiência do Inversor

```typescript
DEFAULT_INVERTER_EFFICIENCY = 0.975; // 97.5%
```

Inversores modernos (string/micro) típicos.

### Degradação Anual

```typescript
DEFAULT_DEGRADATION_RATE = 0.005; // 0.5% ao ano
```

Painéis Tier 1 com garantia de 25 anos.

### Vida Útil dos Componentes

```typescript
COMPONENT_LIFESPAN = {
  PANELS: 25,           // anos
  INVERTERS: 10,        // String inverters
  MICROINVERTERS: 15,   // Microinversores
  BATTERIES: 10,        // Baterias de lítio
  STRUCTURES: 25        // Estruturas
};
```

## 🔧 Configurações Personalizadas

### Exemplo Completo

```typescript
import { estimateEnergyGeneration } from '@modules/solar-calculator';

const estimate = estimateEnergyGeneration(system, {
  config: {
    performanceRatio: 0.85,          // 85% (sistema otimizado)
    degradationRate: 0.003,          // 0.3%/ano (painéis premium)
    inverterEfficiency: 0.98,        // 98% (inversor high-end)
    cableAndOtherLosses: 0.02,       // 2% (cabeamento curto)
    regionalParams: {
      state: 'BA',
      peakSunHours: 5.8,
      seasonalVariation: {
        summer: 6.5,
        winter: 5.1
      }
    }
  },
  includeSeasonalVariation: true,
  projectionYears: 30
});
```

## 🌍 Uso Multi-Ambiente

### Backend (API)

```typescript
// src/api/admin/solar-calculator/route.ts
import { calculatePanelToInverterRatio } from '@modules/solar-calculator';

export const POST = async (req, res) => {
  const { panels, inverters } = req.validatedBody;
  const result = calculatePanelToInverterRatio(panels, inverters);
  res.json({ result });
};
```

### Admin Widget

```typescript
// src/admin/widgets/solar-kit-composition.tsx
import { calculatePanelToInverterRatio, estimateEnergyGeneration } from '@modules/solar-calculator';

const KitCalculator = ({ panels, inverters }) => {
  const ratio = calculatePanelToInverterRatio(panels, inverters);
  const generation = estimateEnergyGeneration({ panels, inverters });
  
  return <div>Ratio: {ratio.ratio.toFixed(2)} - {ratio.status}</div>;
};
```

### Storefront

```typescript
// storefront/src/lib/solar/calculator.ts
import { estimateEnergyGeneration } from '@backend/modules/solar-calculator';

export async function calculateKitGeneration(kitId: string) {
  const kit = await fetchKit(kitId);
  return estimateEnergyGeneration(kit.system);
}
```

## 📖 Referências Técnicas

- **ABNT NBR 16690:2019**: Instalações elétricas de arranjos fotovoltaicos
- **CRESESB/CEPEL**: Atlas Solarimétrico do Brasil
- **IEC 61724-1**: Monitoramento de sistemas fotovoltaicos
- **Resolução Normativa ANEEL 482/2012**: Micro e minigeração distribuída

## 🚀 Próximos Passos

- [ ] Criar API endpoint `/admin/solar-calculator/estimate`
- [ ] Refatorar widgets admin para usar funções compartilhadas
- [ ] Adicionar cálculo de ROI (Return on Investment)
- [ ] Suportar análise de sombreamento
- [ ] Integrar com API de tarifas de energia por concessionária
- [ ] Calcular payback period considerando inflação

---

**Built for Yello Solar Hub** ☀️⚡  
*Empowering solar calculations with precision and reliability*
