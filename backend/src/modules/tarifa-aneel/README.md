# ⚡ ANEEL Tariff Module

Módulo de tarifas de energia elétrica brasileiras baseado nos dados da ANEEL (Agência Nacional de Energia Elétrica).

## 📋 Visão Geral

Este módulo fornece:

- **Consulta de tarifas vigentes** por UF, grupo tarifário e concessionária
- **Cache distribuído Redis** com TTL de 24 horas
- **Cálculos** de custo anual, economia solar, payback e ROI
- **Versionamento de dataset** para invalidação automática de cache
- **Batch queries** para prevenção de N+1
- **Funções puras** (testáveis, determinísticas, sem side-effects)

## 🏗️ Arquitetura

```tsx
aneel-tariff/
├── service-new.ts          # Service principal com cache Redis
├── service.ts              # Service legado (in-memory)
├── types/
│   ├── enums.ts            # Enums ANEEL (GrupoTarifa, Bandeira, UF, etc)
│   └── interfaces.ts       # Interfaces TypeScript
├── validators.ts           # Zod schemas para validação
└── __tests__/
    └── service.unit.spec.ts  # Testes unitários (pure functions)
```

## 📊 Modelo de Dados

Baseado nas tabelas SQL (migrations `006_aneel_tariff_module.sql` e `007_aneel_seed_data.sql`):

| Tabela | Descrição |
|--------|-----------|
| `concessionarias` | Distribuidoras de energia (CPFL, Enel, Light, etc) |
| `tarifas` | Tarifas por UF, grupo e classe consumidora |
| `bandeiras_historico` | Histórico de bandeiras tarifárias mensais |
| `mmgd_classes` | Classes de MMGD (Lei 14.300/2022) |
| `tariff_cache` | Cache de consultas para otimização |

### Grupos Tarifários

- **B1**: Residencial
- **B2**: Rural
- **B3**: Demais classes
- **B4**: Iluminação pública
- **A1-AS**: Alta tensão (2,3 kV+)

### Bandeiras Tarifárias

| Bandeira | Adicional (R$/kWh) |
|----------|-------------------|
| Verde    | R$ 0,00          |
| Amarela  | R$ 0,02          |
| Vermelha 1 | R$ 0,04        |
| Vermelha 2 | R$ 0,06        |

## 🚀 Uso

### Consultar Tarifa Vigente

```typescript
import ANEELTariffService from "./modules/aneel-tariff/service-new";
import { GrupoTarifa, ClasseConsumidor, UF } from "./modules/aneel-tariff/types/enums";

const service = new ANEELTariffService({ logger });

const result = await service.getTarifaVigente({
  uf: UF.SP,
  grupo: GrupoTarifa.B1,
  classe: ClasseConsumidor.RESIDENCIAL,
});

console.log(`Tarifa SP: R$ ${result.tarifa_efetiva_kwh}/kWh`);
// Tarifa SP: R$ 0.74/kWh (com bandeira amarela)
```

### Calcular Custo Anual

```typescript
const custo = await service.calcularCustoAnual({
  uf: UF.SP,
  consumo_mensal_kwh: 500,
  grupo: GrupoTarifa.B1,
  bandeira_media: BandeiraTarifaria.AMARELA,
});

console.log(`Custo anual: R$ ${custo.custo_anual.toFixed(2)}`);
// Custo anual: R$ 4,440.00

console.log("Breakdown:", custo.breakdown);
// {
//   energia: 1800.00,      // 40%
//   distribuicao: 2520.00, // 57%
//   bandeira: 120.00       //  3%
// }
```

### Calcular Economia Solar

```typescript
const economia = await service.calcularEconomiaSolar({
  uf: UF.SP,
  consumo_mensal_kwh: 500,
  geracao_mensal_kwh: 450, // Sistema cobre 90%
  custo_sistema: 30000,
});

console.log(`Economia anual: R$ ${economia.economia_anual.toFixed(2)}`);
// Economia anual: R$ 3,996.00

console.log(`Payback: ${economia.payback_anos?.toFixed(1)} anos`);
// Payback: 7.5 anos

console.log(`ROI em 25 anos: ${economia.roi_percentual?.toFixed(1)}%`);
// ROI em 25 anos: 232.0%
```

### Batch Queries (Prevenção N+1)

```typescript
const batch = await service.getTarifasBatch({
  ufs: [UF.SP, UF.RJ, UF.MG, UF.PR],
  grupo: GrupoTarifa.B1,
});

console.log(`Cache hits: ${batch.cached_count}`);
console.log(`DB queries: ${batch.db_query_count}`);

batch.tarifas.forEach((tarifa, uf) => {
  console.log(`${uf}: R$ ${tarifa.tarifa_efetiva_kwh}/kWh`);
});
// SP: R$ 0.72/kWh
// RJ: R$ 0.89/kWh
// MG: R$ 0.78/kWh
// PR: R$ 0.62/kWh
```

### Invalidar Cache

```typescript
// Após atualizar tarifas no banco
await service.invalidateTarifasCache();
```

## 🎯 Funções Puras (Pure Functions)

Funções sem side-effects, testáveis isoladamente:

```typescript
import {
  calcularTarifaEfetiva,
  calcularCustoMensal,
  calcularBreakdownCustos,
  calcularPaybackSimples,
  calcularROI,
  normalizeUF,
} from "./modules/aneel-tariff/service-new";

// Tarifa efetiva = base + bandeira
const tarifa = calcularTarifaEfetiva(0.72, BandeiraTarifaria.AMARELA);
// 0.74

// Custo mensal
const custo = calcularCustoMensal(500, 0.74);
// 370.00

// Payback simples
const anos = calcularPaybackSimples(30000, 4000);
// 7.5

// ROI percentual
const roi = calcularROI(30000, 100000); // Economia total 25 anos
// 233.33%
```

## 🔐 Validação (Zod)

```typescript
import { TarifaVigenteQuerySchema, CustoAnualInputSchema } from "./validators";

// Validar input
const validated = TarifaVigenteQuerySchema.parse({
  uf: "sp", // será convertido para UF.SP
  grupo: "B1",
});

// Tratamento de erro
try {
  CustoAnualInputSchema.parse({
    uf: "XX", // UF inválida
    consumo_mensal_kwh: -100, // consumo negativo
  });
} catch (error) {
  console.error(error.errors);
  // [{ path: ["uf"], message: "UF inválida" }, ...]
}
```

## 📈 Performance

### Latência

| Operação | Cache Hit | Cache Miss |
|----------|-----------|------------|
| `getTarifaVigente` | < 5ms | 20-30ms |
| `calcularCustoAnual` | < 8ms | 25-35ms |
| `calcularEconomiaSolar` | < 15ms | 50-70ms |
| `getTarifasBatch(4 UFs)` | < 10ms | 80-120ms |

### Cache

- **TTL**: 24 horas (86.400 segundos)
- **Invalidação**: Por tag (`tarifas`, `concessionarias`, `bandeiras`)
- **Versioning**: Dataset versionado (`2024.10`) para invalidação automática
- **Keys**: `aneel-tariff:v2024.10:tarifa-vigente:SP:B1:residencial`

## 📅 SLA de Atualização

### Tarifas de Energia

- **Frequência**: Mensal (após reajustes ANEEL)
- **Fonte**: Resoluções homologatórias da ANEEL
- **Prazo**: Até 5 dias úteis após publicação oficial
- **Notificação**: Email para equipe técnica

### Bandeiras Tarifárias

- **Frequência**: Mensal (último dia útil do mês anterior)
- **Fonte**: ANEEL - Sistema de Bandeiras Tarifárias
- **Atualização**: Automática via scraping (fallback: manual)

### Concessionárias

- **Frequência**: Trimestral (ou sob demanda)
- **Eventos**: Fusões, aquisições, mudanças de área de concessão

## 🛡️ Estratégia de Fallback

### 1. Cache Redis Indisponível

```tsx
getTarifaVigente() → DB Query → Success
```

**Latência**: +25ms (tolerável)

### 2. Banco de Dados Indisponível

```tsx
getTarifaVigente() → Fallback Snapshot (in-memory) → Success
```

**Snapshot**: Última versão válida carregada na inicialização  
**Freshness**: Máximo 7 dias de defasagem  
**Warning**: Log de aviso para equipe SRE

### 3. Tarifa Não Encontrada para UF

```tsx
getTarifaVigente(uf="AC") → Not found → Média Nacional
```

**Fallback**: Tarifa média nacional para grupo B1  
**Valor**: R$ 0,72/kWh (atualizado trimestralmente)  
**Observação**: Marcado no response (`source: "fallback_nacional"`)

### 4. Bandeira Tarifária Não Encontrada

```tsx
getBandeiraAtual() → Not found → Bandeira Amarela (default conservador)
```

**Fallback**: Bandeira amarela (R$ 0,02/kWh)  
**Motivo**: Conservadorismo (melhor superestimar custo)

## 🧪 Testes

### Unit Tests

```bash
npm run test:unit -- aneel-tariff
```

**Cobertura esperada**: 100% das pure functions

### Integration Tests

```bash
npm run test:integration:modules -- aneel-tariff
```

**Cenários**:

- Cache hit/miss
- Batch queries (N+1 prevention)
- Fallback scenarios
- Dataset versioning

### Fixtures

```tsx
__tests__/fixtures/
├── tarifas-sp-2024.json      # Tarifas SP (CPFL, Enel)
├── tarifas-rj-2024.json      # Tarifas RJ (Light, Enel)
├── bandeiras-2024.json       # Bandeiras Jan-Dez 2024
└── concessionarias.json      # 25 concessionárias principais
```

## 🚨 Alertas e Monitoramento

### Métricas Recomendadas

- **Cache hit rate**: Target > 85%
- **Latência p95**: < 50ms
- **Errors rate**: < 0.1%
- **Freshness**: Dataset age < 7 dias

### Alertas Críticos

1. **Cache Redis down**: Alertar equipe SRE (PagerDuty)
2. **DB unavailable**: Ativar fallback snapshot + alert
3. **Dataset defasado**: > 30 dias sem atualização
4. **Tarifa não encontrada**: > 5% das consultas

## 📚 Referências

- [ANEEL - Agência Nacional de Energia Elétrica](https://www.aneel.gov.br)
- [Sistema de Bandeiras Tarifárias](https://www.aneel.gov.br/bandeiras-tarifarias)
- [Lei 14.300/2022 - Marco Legal da Micro e Minigeração Distribuída](https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2022/lei/l14300.htm)
- [Resoluções Homologatórias](https://www.aneel.gov.br/resolucoes)

## 🔄 Changelog

### v2024.10 (Outubro 2024)

- ✅ Refatoração completa: cache Redis, funções puras, versionamento
- ✅ Validators Zod para todas as APIs
- ✅ Batch queries (N+1 prevention)
- ✅ Testes unitários (100% cobertura pure functions)
- ✅ Documentação completa com SLA e fallback

### v2024.07 (Julho 2024)

- 🆕 Criação inicial do módulo
- 🆕 Dados estáticos em memória (12 concessionárias)
- 🆕 Migrations SQL (006, 007)

---

**Mantido por**: Equipe Backend YSH  
**Última atualização**: 2024-10-12
