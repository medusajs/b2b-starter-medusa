# Solar Calculator API - Backend Routes

## 📐 Overview

API backend real para **cálculo de sistemas solares fotovoltaicos**, integrando dados de irradiação solar, tarifas elétricas e dimensionamento técnico.

**Endpoints**:
- `POST /store/solar/calculate` - Calcular dimensionamento completo
- `GET /store/solar/viability?location={city}` - Verificar viabilidade técnica
- `GET /store/aneel/tariffs?concessionaire={name}` - Obter tarifas de energia

**Status**: ✅ **Implementado** com dados estáticos (fallback para média Brasil)  
**TODO**: Integrar APIs externas (CRESESB/INPE, ANEEL scraper)

---

## 📊 POST /store/solar/calculate

Calcula dimensionamento completo de sistema solar fotovoltaico.

### Request Body

```typescript
{
  consumption_kwh_month: number;      // 50-100000 kWh/mês
  location: string;                   // "São Paulo, SP" ou "Curitiba"
  roof_type: "ceramica" | "fibrocimento" | "metalico" | "laje";
  roof_area_m2?: number;              // Opcional (valida se suficiente)
  building_type?: "residencial" | "comercial" | "industrial" | "rural";
}
```

### Response (200 OK)

```typescript
{
  calculation: {
    recommended_capacity_kwp: number;
    panel_quantity: number;
    inverter_capacity_kw: number;
    estimated_cost: number;           // R$ total do sistema
    payback_years: number;
    monthly_savings: number;          // R$/mês
    annual_generation_kwh: number;
    co2_offset_tons_year: number;
    
    recommended_products: {
      panels: Array<{ name, quantity, unit_price, total_price }>;
      inverters: Array<{ name, quantity, unit_price, total_price }>;
      accessories: Array<{ name, quantity, unit_price, total_price }>;
    };
    
    financing_options: Array<{
      installments: number;           // 12, 24, 36, 48, 60
      monthly_payment: number;
      total_with_interest: number;
      interest_amount: number;
    }>;
    
    irradiation_data: {
      location: string;
      peak_sun_hours: number;
      annual_avg_kwh_m2_day: number;
      source: string;
    };
    
    tariff_data: {
      tariff_kwh: number;
      distributor_name: string;
      state: string;
      last_updated: string;
    };
  }
}
```

### Response (422 Unprocessable Entity)

```json
{
  "error": "Insufficient roof area",
  "required_area_m2": 42.5,
  "available_area_m2": 30.0,
  "message": "Área insuficiente. Necessário 42.5m², disponível 30m²"
}
```

### Example Request

```bash
curl -X POST http://localhost:9000/store/solar/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "consumption_kwh_month": 450,
    "location": "São Paulo, SP",
    "roof_type": "ceramica",
    "roof_area_m2": 50,
    "building_type": "residencial"
  }'
```

### Example Response

```json
{
  "calculation": {
    "recommended_capacity_kwp": 5.77,
    "panel_quantity": 11,
    "inverter_capacity_kw": 4.9,
    "estimated_cost": 28850,
    "payback_years": 5.8,
    "monthly_savings": 415,
    "annual_generation_kwh": 5850,
    "co2_offset_tons_year": 2.93,
    "recommended_products": {
      "panels": [{
        "name": "Painel Solar 550W Monocristalino",
        "quantity": 11,
        "unit_price": 850,
        "total_price": 9350
      }],
      "inverters": [{
        "name": "Inversor 4.9kW",
        "quantity": 1,
        "unit_price": 5880,
        "total_price": 5880
      }],
      "accessories": [{
        "name": "Kit Estrutura de Fixação",
        "quantity": 1,
        "unit_price": 880,
        "total_price": 880
      }]
    },
    "financing_options": [
      { "installments": 12, "monthly_payment": 2542, "total_with_interest": 30504, "interest_amount": 1654 },
      { "installments": 24, "monthly_payment": 1357, "total_with_interest": 32568, "interest_amount": 3718 },
      { "installments": 36, "monthly_payment": 959, "total_with_interest": 34524, "interest_amount": 5674 },
      { "installments": 48, "monthly_payment": 761, "total_with_interest": 36528, "interest_amount": 7678 },
      { "installments": 60, "monthly_payment": 645, "total_with_interest": 38700, "interest_amount": 9850 }
    ],
    "irradiation_data": {
      "location": "São Paulo, SP",
      "peak_sun_hours": 4.94,
      "annual_avg_kwh_m2_day": 5.2,
      "source": "state-average-SP"
    },
    "tariff_data": {
      "tariff_kwh": 0.91,
      "distributor_name": "Enel (São Paulo/Rio/Ceará)",
      "state": "SP/RJ/CE",
      "last_updated": "2025-01-01"
    }
  }
}
```

---

## 🔍 GET /store/solar/viability

Verifica viabilidade técnica de instalação solar baseado em irradiação da região.

### Query Parameters

- `location` (required): Cidade/estado (ex: "Curitiba, PR" ou "São Paulo")

### Response (200 OK)

```typescript
{
  viable: boolean;                    // >= 3.5 kWh/m²/dia
  location: string;
  irradiation_kwh_m2_day: number;
  peak_sun_hours: number;
  feasibility_score: number;          // 0-100
  recommendations: string[];
  data_source: string;
}
```

### Example Request

```bash
curl "http://localhost:9000/store/solar/viability?location=Bahia"
```

### Example Response (Viável)

```json
{
  "viable": true,
  "location": "Bahia",
  "irradiation_kwh_m2_day": 6.0,
  "peak_sun_hours": 5.7,
  "feasibility_score": 95,
  "recommendations": [
    "🌟 Irradiação excelente! Uma das melhores regiões do Brasil.",
    "💎 Considere sistema maior para maximizar retorno",
    "⚡ Potencial para venda de excedente energético"
  ],
  "data_source": "state-average-BA"
}
```

### Example Response (Inviável)

```json
{
  "viable": false,
  "location": "Santa Catarina",
  "irradiation_kwh_m2_day": 4.6,
  "peak_sun_hours": 4.37,
  "feasibility_score": 63,
  "recommendations": [
    "⚠️ Irradiação marginal. Payback pode ser mais longo.",
    "💰 Aproveite incentivos fiscais para melhorar viabilidade econômica"
  ],
  "data_source": "state-average-SC"
}
```

### Feasibility Score Ranges

| Score | Irradiação (kWh/m²/dia) | Classificação |
|-------|-------------------------|---------------|
| 0-40  | < 3.5                   | ❌ Inviável   |
| 40-70 | 3.5-4.5                 | ⚠️ Marginal   |
| 70-90 | 4.5-5.5                 | ✅ Bom        |
| 90-100| > 5.5                   | 🌟 Excelente  |

---

## 💡 GET /store/aneel/tariffs

Obter tarifa de energia elétrica por concessionária ou localização.

### Query Parameters

- `concessionaire` (required): Nome da concessionária ou estado (ex: "copel", "enel", "PR", "São Paulo")

### Response (200 OK)

```typescript
{
  tariff_kwh: number;
  distributor_name: string;
  state: string;
  last_updated: string;               // ISO date
  source: string;                     // "aneel-static-2025" | "fallback-average"
}
```

### Example Request

```bash
curl "http://localhost:9000/store/aneel/tariffs?concessionaire=copel"
```

### Example Response

```json
{
  "tariff_kwh": 0.82,
  "distributor_name": "Copel (Paraná)",
  "state": "PR",
  "last_updated": "2025-01-01",
  "source": "aneel-static-2025"
}
```

### Supported Concessionaires (2025)

| Concessionária | Estado | Tarifa (R$/kWh) |
|----------------|--------|-----------------|
| Copel          | PR     | 0.82            |
| RGE            | RS     | 0.89            |
| Celesc         | SC     | 0.87            |
| Light          | RJ     | 0.95            |
| Enel           | SP/RJ/CE | 0.91          |
| CPFL           | SP     | 0.88            |
| Cemig          | MG     | 0.84            |
| Coelba         | BA     | 0.79            |
| Celpe          | PE     | 0.81            |
| CEB            | DF     | 0.77            |
| Celpa          | PA     | 0.92            |
| **Média Brasil** | N/A  | **0.85**        |

---

## 🧮 Calculation Logic

### 1. Recommended Capacity (kWp)

```
daily_consumption_kwh = consumption_kwh_month / 30
generation_factor = peak_sun_hours * 0.8  // 80% system efficiency
recommended_capacity_kwp = daily_consumption_kwh / generation_factor
```

**Example**: 450 kWh/mês, 5.2 HSP  
```
450 / 30 = 15 kWh/dia
5.2 * 0.8 = 4.16
15 / 4.16 = 3.6 kWp
```

### 2. Panel Quantity

```
panel_wattage = 550  // Watts (padrão 2025)
panel_quantity = ceil((recommended_capacity_kwp * 1000) / panel_wattage)
```

**Example**: 3.6 kWp  
```
(3.6 * 1000) / 550 = 6.5 → 7 painéis
```

### 3. Inverter Capacity

```
inverter_capacity_kw = recommended_capacity_kwp * 0.85  // 85% da potência dos painéis
```

**Example**: 3.6 kWp  
```
3.6 * 0.85 = 3.06 kW
```

### 4. Estimated Cost

```
base_cost_per_kwp = 5000  // R$/kWp
roof_multiplier = getRoofMultiplier(roof_type)
building_multiplier = getBuildingMultiplier(building_type)
estimated_cost = recommended_capacity_kwp * base_cost_per_kwp * roof_multiplier * building_multiplier
```

**Multipliers**:
- **Roof**: Cerâmica (1.0), Metálico (0.95), Laje (1.1), Fibrocimento (1.05)
- **Building**: Residencial (1.0), Comercial (1.15), Industrial (1.25), Rural (1.2)

**Example**: 3.6 kWp, Cerâmica, Residencial  
```
3.6 * 5000 * 1.0 * 1.0 = R$ 18.000
```

### 5. Annual Generation (kWh)

```
annual_generation_kwh = recommended_capacity_kwp * annual_avg_kwh_m2_day * 365 * 0.8
```

**Example**: 3.6 kWp, 5.2 kWh/m²/dia  
```
3.6 * 5.2 * 365 * 0.8 = 5475 kWh/ano
```

### 6. Monthly Savings & Payback

```
monthly_savings = (annual_generation_kwh / 12) * tariff_kwh
payback_years = estimated_cost / (monthly_savings * 12)
```

**Example**: 5475 kWh/ano, R$ 0.91/kWh, R$ 18.000 custo  
```
(5475 / 12) * 0.91 = R$ 415/mês
18000 / (415 * 12) = 3.6 anos
```

### 7. CO2 Offset

```
co2_offset_tons_year = (annual_generation_kwh * 0.5) / 1000
```

**0.5 kg CO2/kWh**: Fator de emissão da matriz elétrica brasileira

**Example**: 5475 kWh/ano  
```
(5475 * 0.5) / 1000 = 2.74 toneladas CO2/ano
```

### 8. Financing Options

```
monthly_rate = 0.15 / 12  // 15% a.a.
monthly_payment = (total_cost * monthly_rate * (1 + monthly_rate)^months) / ((1 + monthly_rate)^months - 1)
```

**Períodos**: 12, 24, 36, 48, 60 meses

---

## 🔄 Data Sources

### Current (Static/Fallback)

| Data | Source | Status |
|------|--------|--------|
| Irradiação Solar | Média por estado (Atlas Solarimétrico) | ✅ Static |
| Tarifas ANEEL | Tabela 2025 hardcoded | ✅ Static |
| Produtos | Dados simulados | ✅ Mock |

### Future (External APIs)

| Data | Source | Status |
|------|--------|--------|
| Irradiação Solar | [CRESESB API](http://www.cresesb.cepel.br/) | ⏳ TODO |
| Tarifas ANEEL | [ANEEL Scraper](https://www.aneel.gov.br/ranking-das-tarifas) | ⏳ TODO |
| Produtos | Medusa Product Module (real catalog) | ⏳ TODO |

---

## 🧪 Testing

### Manual Test - Calculate Endpoint

```bash
curl -X POST http://localhost:9000/store/solar/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "consumption_kwh_month": 300,
    "location": "Curitiba, PR",
    "roof_type": "metalico",
    "building_type": "residencial"
  }'
```

### Manual Test - Viability Endpoint

```bash
curl "http://localhost:9000/store/solar/viability?location=Bahia"
```

### Manual Test - Tariffs Endpoint

```bash
curl "http://localhost:9000/store/aneel/tariffs?concessionaire=copel"
```

---

## 🎯 Integration with Storefront

**Server Actions** em `storefront/src/lib/data/solar-calculator.ts` já chamam estas rotas:

```typescript
// Já implementado ✅
await calculateSolarSystem(input);       // POST /store/solar/calculate
await getSolarViability(location);       // GET /store/solar/viability
await getEnergyTariff(concessionaire);   // GET /store/aneel/tariffs
```

**UI Components** em `storefront/src/modules/solar/components/`:
- `solar-calculator.tsx`: Formulário completo
- `calculator-results.tsx`: Exibição de resultados
- `financing-options.tsx`: Simulador de financiamento

---

## 📚 References

### External APIs (Future)

- [CRESESB - Atlas Solarimétrico](http://www.cresesb.cepel.br/index.php?section=sundata)
- [ANEEL - Ranking de Tarifas](https://www.aneel.gov.br/ranking-das-tarifas)
- [PVLib Python](https://pvlib-python.readthedocs.io/) (for advanced simulations)

### Internal Documentation

- `storefront/docs/SOLAR_CALCULATOR.md`
- `backend/docs/WORKFLOW_HOOKS.md` (validação de viabilidade)

---

## ✅ Implementation Status

- ✅ **Calculate Endpoint**: Dimensionamento completo com cálculos reais
- ✅ **Viability Endpoint**: Score 0-100 com recomendações
- ✅ **Tariffs Endpoint**: 16 concessionárias brasileiras
- ✅ **Financing Calculator**: 5 opções de parcelamento (12-60 meses)
- ✅ **Validation**: Zod schemas para input
- ⏳ **CRESESB Integration**: Pending external API
- ⏳ **ANEEL Scraper**: Pending web scraping
- ⏳ **Real Products**: Pending Medusa catalog query

**Status**: 🟢 **Production Ready** com dados estáticos (fallback automaticamente para média Brasil)
