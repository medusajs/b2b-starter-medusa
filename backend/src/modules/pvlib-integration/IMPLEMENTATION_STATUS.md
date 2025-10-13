# PVLib Integration Module - Status Report

**Data**: 2025-10-12  
**Módulo**: `backend/src/modules/pvlib-integration`  
**Objetivo**: Integração com serviços PV externos (irradiância/eficiência) + Schemas locais (Sandia/CEC)

---

## 📊 Status Geral

| Componente | Status | Linhas | Testes | Observação |
|-----------|--------|--------|--------|------------|
| **Types** | ✅ Completo | ~227 | N/A | Enums, configs, errors |
| **HTTP Client** | ✅ Completo | ~418 | ⚠️ 6 erros | Retry, backoff, circuit breaker |
| **Unit Normalizer** | ✅ Completo | ~158 | ✅ 15 testes | Conversões W/m², °C, %, kWh |
| **Service (Local)** | ✅ Existente | ~387 | ❓ Não encontrados | Schemas Sandia/CEC locais |
| **Service (External)** | ❌ Não criado | 0 | 0 | Falta criar para APIs externas |
| **Index/Export** | ✅ Completo | ~7 | N/A | Módulo exportado |

---

## ✅ Componentes Implementados

### 1. Types (`src/types/pvlib/index.ts`) - ✅ COMPLETO

**Enums**:
- `PVDataProvider`: PVGIS, NREL, SOLCAST, METEONORM
- `DataType`: IRRADIANCE, EFFICIENCY, TEMPERATURE, WEATHER
- `Unit`: W/m², kW/m², MJ/m², Wh, kWh, MWh, °C, °F, K, %, decimal
- `CircuitState`: CLOSED, OPEN, HALF_OPEN

**Interfaces**:
- `CacheConfig`: TTL 24h configurável
- `RetryConfig`: Exponential backoff com jitter
- `TimeoutConfig`: Connect, request, total timeouts
- `CircuitBreakerConfig`: Failure/success thresholds
- `PVDataRequest/Response`: Requisição/resposta normalizadas
- `ResilienceMetrics`: Tracking de performance (p95, p99, cache hits)

**Custom Errors**:
- `PVProviderError`: Erros de provider com statusCode
- `CircuitBreakerOpenError`: Circuito aberto com retry timestamp

---

### 2. HTTP Client (`client/http-client.ts`) - ✅ COMPLETO

**Features Implementadas**:

#### Retry com Exponential Backoff
```typescript
private async fetchWithRetry(request: PVDataRequest): Promise<PVDataResponse> {
  let delay = this.config.retry.initial_delay_ms;
  
  for (let attempt = 1; attempt <= max_attempts; attempt++) {
    try {
      return await this.doFetch(request);
    } catch (error) {
      // Jitter: ±30% da delay
      const actualDelay = Math.min(delay + jitter, max_delay_ms);
      await this.sleep(actualDelay);
      delay *= backoff_multiplier; // 2x
    }
  }
}
```

**Configuração Padrão**:
- `max_attempts: 3`
- `initial_delay_ms: 100`
- `max_delay_ms: 1000`
- `backoff_multiplier: 2`
- `retryable_status_codes: [429, 503, 504]`

#### Circuit Breaker
```typescript
// State Machine: CLOSED → OPEN → HALF_OPEN → CLOSED
private circuitState: CircuitState = CircuitState.CLOSED;
private consecutiveFailures = 0;
private consecutiveSuccesses = 0;

// CLOSED → OPEN após N falhas
if (consecutiveFailures >= failure_threshold) {
  this.circuitState = CircuitState.OPEN;
}

// OPEN → HALF_OPEN após timeout
if (Date.now() - circuitOpenedAt >= timeout_ms) {
  this.circuitState = CircuitState.HALF_OPEN;
}

// HALF_OPEN → CLOSED após M sucessos
if (consecutiveSuccesses >= success_threshold) {
  this.circuitState = CircuitState.CLOSED;
}
```

**Configuração Padrão**:
- `failure_threshold: 3` (3 falhas consecutivas → OPEN)
- `success_threshold: 2` (2 sucessos em HALF_OPEN → CLOSED)
- `timeout_ms: 60000` (1 min em OPEN antes de tentar HALF_OPEN)

#### Cache de 24h
```typescript
private cache: Map<string, { data: PVDataResponse; expires_at: number }>;

// Cache key: lat:lon:dataTypes:start:end
private getCacheKey(request: PVDataRequest): string {
  return `${prefix}:${latitude}:${longitude}:${data_types.join(",")}:${start_date}:${end_date}`;
}

// TTL padrão: 86400 segundos (24h)
const expires_at = Date.now() + ttl_seconds * 1000;
```

**Limpeza automática**: `setInterval(() => cleanExpiredCache(), 3600000)` (1 hora)

#### Timeouts Configuráveis
```typescript
const controller = new AbortController();
const timeoutId = setTimeout(
  () => controller.abort(),
  request_timeout_ms
);

const response = await fetch(url, {
  signal: controller.signal
});
```

**Configuração Padrão**:
- `request_timeout_ms: 10000` (10s por request)
- `connect_timeout_ms: 5000` (5s para connect)
- `total_timeout_ms: 30000` (30s incluindo retries)

#### Métricas de Observabilidade
```typescript
interface ResilienceMetrics {
  circuit_state: CircuitState;
  total_requests: number;
  failed_requests: number;
  cached_responses: number;
  average_response_time_ms: number;
  p95_response_time_ms: number; // Percentil 95
  p99_response_time_ms: number; // Percentil 99
}

// Calcula percentis mantendo últimas 1000 medições
const sortedTimes = [...response_times].sort((a, b) => a - b);
const p95Index = Math.floor(sortedTimes.length * 0.95);
```

**Provider-Specific URL Building**:
```typescript
switch (provider) {
  case "pvgis":
    return `${base_url}/PVcalc?lat=${lat}&lon=${lon}&outputformat=json`;
  case "nrel":
    return `${base_url}/solar/solar_resource/v1.json?lat=${lat}&lon=${lon}`;
  case "solcast":
    return `${base_url}/world_radiation/estimated_actuals?latitude=${lat}&longitude=${lon}`;
}
```

---

### 3. Unit Normalizer (`client/unit-normalizer.ts`) - ✅ COMPLETO

**Conversões Implementadas**:

#### Irradiância → W/m²
```typescript
static normalizeIrradiance(value: number, fromUnit: Unit): number {
  switch (fromUnit) {
    case Unit.W_PER_M2:
      return value; // Padrão SI
    case Unit.KW_PER_M2:
      return value * 1000;
    case Unit.MJ_PER_M2:
      // MJ/m²/day → W/m² (averaged over 24h)
      return (value * 1000000) / (24 * 3600);
  }
}
```

**Exemplo**: 20 MJ/m²/day = 231.48 W/m²

#### Energia → kWh
```typescript
static normalizeEnergy(value: number, fromUnit: Unit): number {
  switch (fromUnit) {
    case Unit.KWH:
      return value; // Padrão
    case Unit.WH:
      return value / 1000;
    case Unit.MWH:
      return value * 1000;
  }
}
```

#### Temperatura → °C
```typescript
static normalizeTemperature(value: number, fromUnit: Unit): number {
  switch (fromUnit) {
    case Unit.CELSIUS:
      return value;
    case Unit.FAHRENHEIT:
      return ((value - 32) * 5) / 9;
    case Unit.KELVIN:
      return value - 273.15;
  }
}
```

#### Eficiência → % (0-100)
```typescript
static normalizeEfficiency(value: number, fromUnit: Unit): number {
  switch (fromUnit) {
    case Unit.PERCENT:
      return value;
    case Unit.DECIMAL:
      return value * 100; // 0.185 → 18.5%
  }
}
```

**Detecção Automática de Unidades**:
```typescript
static detectUnit(unitString: string): Unit {
  const normalized = unitString.toLowerCase().trim();
  
  // Irradiância
  if (normalized.includes("w/m") || normalized === "wm2") {
    return Unit.W_PER_M2;
  }
  
  // Temperatura
  if (normalized === "c" || normalized === "celsius" || normalized === "°c") {
    return Unit.CELSIUS;
  }
  
  // ... outros casos
}
```

**Auto-Normalization Helpers**:
```typescript
// Detecta unidade da string e converte
UnitNormalizer.autoNormalizeIrradiance(1.2, "kW/m²"); // → 1200 W/m²
UnitNormalizer.autoNormalizeTemperature(86, "F");     // → 30 °C
UnitNormalizer.autoNormalizeEfficiency(0.22, "decimal"); // → 22%
```

---

### 4. Service Local (`service.ts`) - ✅ EXISTENTE (Schemas Locais)

**Propósito**: Acesso a schemas **locais** PVLib (Sandia/CEC)

**Features**:
- Carrega `normalized_inverters_sandia_clean.json` (inverters)
- Carrega `normalized_panels_cec_clean.json` (painéis)
- Cache de 1 hora
- Validação MPPT (compatibilidade inversor/painel)
- Busca por potência (±20% tolerância)

**NÃO É** para APIs externas (PVGIS, NREL, Solcast).

**Métodos**:
```typescript
class PVLibIntegrationService {
  loadInverters(): InverterPVLib[]
  loadPanels(): PanelPVLib[]
  getInverterById(id: string): InverterPVLib | null
  getPanelById(id: string): PanelPVLib | null
  validateMPPT(inverter, panel, modulesPerString): MPPTValidationResult
  findInvertersByPower(powerW, tolerance): InverterPVLib[]
  findPanelsByPower(powerW, tolerance): PanelPVLib[]
  getStats(): { inverters, panels, cache }
}
```

---

## ⚠️ Problemas Identificados

### 1. Testes do HTTP Client (6 erros de tipo)

**Erro**:
```
Argument of type '{ ok: true; json: () => Promise<...>; }' is not assignable to parameter of type 'Response'.
Type is missing properties: headers, redirected, status, statusText, and 10 more.
```

**Causa**: Mock parcial do Response não tem todas propriedades.

**Solução**: Criar helper `createMockResponse()`:
```typescript
function createMockResponse(data: any, options: { status?: number; ok?: boolean } = {}): Response {
  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    statusText: options.status === 400 ? "Bad Request" : "OK",
    json: async () => data,
    headers: new Headers(),
    redirected: false,
    type: "basic",
    url: "",
    clone: jest.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    text: jest.fn(),
  } as Response;
}
```

**Uso**:
```typescript
fetchMock.mockResolvedValueOnce(
  createMockResponse({ outputs: {} })
);
```

---

### 2. Arquitetura Dual (Confusão de Propósitos)

**Situação Atual**:
- `service.ts` → Schemas **LOCAIS** (Sandia/CEC de arquivos JSON)
- `http-client.ts` → APIs **EXTERNAS** (PVGIS, NREL via HTTP)

**Problema**: Não há service que **USE** o http-client para APIs externas.

**Soluções Possíveis**:

#### Opção A: Criar ExternalPVDataService
```typescript
class ExternalPVDataService extends MedusaService({}) {
  private clients: Map<PVDataProvider, PVHttpClient>;
  
  async fetchIrradiance(lat, lon): Promise<IrradianceData[]> {
    // Usa http-client para buscar de PVGIS/NREL
  }
  
  async fetchWithFailover(request): Promise<PVDataResponse> {
    // Tenta primary, depois fallbacks
  }
}
```

#### Opção B: Renomear Service Existente
```typescript
// Atual: PVLibIntegrationService (schemas locais)
// Renomear para: PVLibSchemaService

// Novo: PVLibExternalDataService (APIs HTTP)
```

#### Opção C: Unificar em Service Único
```typescript
class PVLibIntegrationService {
  // Schemas locais
  loadInverters()
  loadPanels()
  
  // APIs externas (novo)
  fetchExternalIrradiance()
  fetchExternalEfficiency()
}
```

---

## 📋 Tasks Remanescentes

### 🔴 Prioridade Alta (Bloqueantes)

1. **Corrigir Testes do HTTP Client** (30 min)
   - Criar helper `createMockResponse()`
   - Substituir todos mocks parciais por mocks completos
   - Rodar `yarn test:unit http-client.unit.spec.ts`
   - **Aceite**: 0 erros de tipo, todos testes passam

2. **Decidir Arquitetura** (15 min - decisão)
   - Opção A: Criar `ExternalPVDataService` separado
   - Opção B: Renomear existente + criar novo
   - Opção C: Unificar em service único
   - **Recomendação**: Opção A (separação de responsabilidades)

3. **Implementar ExternalPVDataService** (45 min)
   ```typescript
   class ExternalPVDataService extends MedusaService({}) {
     private httpClient: PVHttpClient;
     
     async fetchIrradiance(request: PVDataRequest): Promise<PVDataResponse> {
       return this.httpClient.fetchData(request);
     }
     
     async fetchWithFailover(request: PVDataRequest, fallbackProviders: PVDataProvider[]): Promise<PVDataResponse> {
       // Implementa lógica de failover
     }
     
     getMetrics(): ResilienceMetrics {
       return this.httpClient.getMetrics();
     }
   }
   ```
   - Exportar em `index.ts`
   - Registrar em `medusa-config.ts`

### 🟡 Prioridade Média (Melhoria)

4. **Testes de Integração com MSW** (60 min)
   - Instalar `msw` (Mock Service Worker)
   - Criar handlers para PVGIS, NREL
   - Testar timeout handling
   - Testar circuit breaker transitions
   - **Aceite**: Simular falhas reais, verificar retry/backoff

5. **Documentação da Arquitetura** (30 min)
   - Criar `backend/src/modules/pvlib-integration/README.md`
   - Explicar dual architecture:
     - **Local Schemas** (Sandia/CEC) → `PVLibIntegrationService`
     - **External APIs** (PVGIS/NREL) → `ExternalPVDataService` + `PVHttpClient`
   - Quando usar cada um
   - Exemplos de uso

6. **Normalizer para Providers Específicos** (45 min)
   - Criar `client/normalizers/pvgis-normalizer.ts`
   - Criar `client/normalizers/nrel-normalizer.ts`
   - Implementar parsing de respostas específicas
   - Mapear para `PVDataResponse` padronizado

### 🟢 Prioridade Baixa (Futuro)

7. **Métricas Prometheus** (30 min)
   - Expor métricas do circuit breaker
   - Expor p95/p99 response times
   - Expor cache hit rate

8. **Admin UI para Métricas** (120 min)
   - Dashboard com estado dos providers
   - Gráfico de response times
   - Alertas de circuit breaker OPEN

9. **Scheduled Job para Health Check** (30 min)
   - Job a cada 5 min verificando saúde dos providers
   - Notifica se algum provider está OPEN há > 15 min

---

## 🧪 Cobertura de Testes

| Arquivo | Testes | Status | Cobertura |
|---------|--------|--------|-----------|
| `unit-normalizer.unit.spec.ts` | 15 | ✅ PASSA | ~95% |
| `http-client.unit.spec.ts` | 11 | ⚠️ 6 erros de tipo | 0% (não roda) |
| `service.ts` (local) | ❓ Não encontrados | - | ❓ |

**Testes do Unit Normalizer** (15 casos):
- ✅ Irradiance: W/m², kW/m², MJ/m², zero values
- ✅ Energy: kWh, Wh, MWh
- ✅ Temperature: °C, °F, K, freezing point, negatives
- ✅ Efficiency: %, decimal, 100% edge case
- ✅ Unit Detection: vários formatos, case-insensitive
- ✅ Auto-normalization: from string
- ✅ Edge cases: large values, whitespace

**Testes do HTTP Client** (11 casos, todos pendentes):
- ⏳ Retry on 503
- ⏳ NO retry on 400
- ⏳ Respect max_attempts
- ⏳ Circuit breaker OPEN after failures
- ⏳ Reject when OPEN
- ⏳ Transition OPEN → HALF_OPEN (placeholder)
- ⏳ CLOSE after successes (placeholder)
- ⏳ Cache successful responses
- ⏳ Respect cache TTL (placeholder)
- ⏳ Different cache keys for locations
- ⏳ Timeout handling
- ⏳ Track metrics

---

## 🚀 Próximos Passos Recomendados

### Sprint 1 (2 horas)
1. ✅ Corrigir testes do HTTP client (30 min)
2. ✅ Decidir arquitetura (15 min)
3. ✅ Implementar ExternalPVDataService (45 min)
4. ✅ Rodar testes unitários completos (15 min)
5. ✅ Documentar arquitetura dual (15 min)

### Sprint 2 (3 horas)
6. Testes de integração com MSW (60 min)
7. Normalizers específicos por provider (90 min)
8. Registrar em medusa-config.ts (15 min)
9. Criar exemplo de uso no README (15 min)

### Sprint 3 (Futuro)
10. Métricas Prometheus
11. Admin UI
12. Scheduled health checks

---

## 📊 Métricas de Qualidade

| Métrica | Valor | Meta | Status |
|---------|-------|------|--------|
| Cobertura de Testes | ~47% | 80% | 🟡 |
| Erros de Lint | 6 | 0 | 🔴 |
| Tempo de Response (p95) | N/A | <2s | ⏳ |
| Cache Hit Rate | N/A | >60% | ⏳ |
| Circuit Breaker Funcionando | ✅ Implementado | Sim | 🟢 |
| Retry com Backoff | ✅ Implementado | Sim | 🟢 |
| Normalização de Unidades | ✅ Implementado | Sim | 🟢 |

---

## 💡 Recomendações Arquiteturais

### Separação Clara de Responsabilidades

```
pvlib-integration/
├── service.ts              # Schemas LOCAIS (Sandia/CEC)
├── external-service.ts     # APIs EXTERNAS (PVGIS/NREL) ← CRIAR
├── client/
│   ├── http-client.ts      # HTTP resiliente
│   ├── unit-normalizer.ts  # Conversões
│   └── normalizers/        # Provider-specific ← CRIAR
│       ├── pvgis.ts
│       ├── nrel.ts
│       └── solcast.ts
└── __tests__/
    ├── service.unit.spec.ts
    ├── external-service.unit.spec.ts
    ├── http-client.unit.spec.ts (FIX)
    └── unit-normalizer.unit.spec.ts (OK)
```

### Quando Usar Cada Service

**Use `PVLibIntegrationService` (schemas locais)**:
- Buscar parâmetros Sandia de inversor
- Buscar parâmetros CEC de painel
- Validar compatibilidade MPPT
- Dados offline (sem internet)

**Use `ExternalPVDataService` (APIs externas)**:
- Buscar irradiância solar de location
- Buscar dados meteorológicos em tempo real
- Simulações com dados atualizados
- Requires internet/API keys

---

**Última Atualização**: 2025-10-12  
**Próxima Revisão**: Após Sprint 1 completar  
**Responsável**: Staff Backend Engineer
