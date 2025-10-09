# ☀️ Sistema de Cálculo Solar YSH - Implementação Completa

## 📋 Visão Geral

Implementação completa de um sistema de dimensionamento e análise financeira para sistemas solares fotovoltaicos, integrado ao catálogo de produtos da YSH Store.

## 🎯 Funcionalidades Implementadas

### 1. **Serviço de Cálculo Solar** (`calculator.ts`)

#### Dimensionamento Técnico
- ✅ Cálculo de kWp necessário baseado em consumo e irradiância
- ✅ HSP (Horas de Sol Pleno) por estado brasileiro
- ✅ Performance Ratio padrão: 82%
- ✅ Degradação anual: 0,5%
- ✅ Simulação de geração mensal (12 meses)
- ✅ Cálculo de área necessária (6,5 m²/kWp)
- ✅ Dimensionamento de inversores (85% da potência dos painéis)
- ✅ Suporte a oversizing: 100%, 114%, 130%, 145%, 160%

#### Busca de Kits no Catálogo
- ✅ Integração com serviço de matching de kits
- ✅ Busca por potência alvo com tolerância configurável
- ✅ Score de compatibilidade (0-100 pontos)
- ✅ Fallback para kits mock quando catálogo indisponível
- ✅ Extração de componentes (painéis, inversores, estrutura)

#### Análise Financeira
- ✅ **CAPEX**: Equipamentos, instalação, projeto, homologação
- ✅ **Economia**: Mensal, anual e projeção 25 anos
- ✅ **Retorno**: Payback simples/descontado, TIR, VPL
- ✅ **Financiamento**: Parcelas, economia líquida

#### Impacto Ambiental
- ✅ Emissões de CO₂ evitadas (25 anos)
- ✅ Equivalente em árvores plantadas
- ✅ Equivalente em carros fora de circulação

#### Conformidade MMGD
- ✅ Validação de oversizing (máx 160%)
- ✅ Validação de limite de potência por fase
- ✅ Alertas de conformidade com ANEEL 1.059/2023

### 2. **Serviço de Matching de Kits** (`kit-matcher.ts`)

#### Sistema de Pontuação (0-100)
- 🎯 **40 pontos**: Match de potência (±15% ideal)
- 🎯 **20 pontos**: Tipo de sistema (on-grid/off-grid/híbrido)
- 🎯 **15 pontos**: Tipo de estrutura/telhado
- 🎯 **10 pontos**: Marca preferida
- 🎯 **10 pontos**: Compatibilidade de fase
- 🎯 **5 pontos**: Disponibilidade em estoque

#### Filtros e Buscas
- ✅ Busca por range de potência (kWp)
- ✅ Filtro por tipo de sistema
- ✅ Filtro por marca de painéis/inversores
- ✅ Filtro por orçamento máximo
- ✅ Integração com RemoteQuery do Medusa

#### Extração de Metadados
- ✅ Componentes do kit (painéis, inversores, baterias)
- ✅ Especificações técnicas (potência, eficiência, MPPT)
- ✅ Disponibilidade e logística
- ✅ Preços e variantes

### 3. **API REST** (`route.ts`)

#### Endpoints

**POST /store/solar/calculator**
- Calcula sistema solar completo
- Valida entrada (consumo, UF, oversizing)
- Retorna dimensionamento + kits + financeiro + impacto

**GET /store/solar/calculator**
- Informações sobre a API
- Capabilities disponíveis
- Estados suportados
- Parâmetros aceitos

#### Validações
- ✅ Consumo obrigatório e > 0
- ✅ UF obrigatória (2 caracteres)
- ✅ Oversizing válido (100, 114, 130, 145, 160)
- ✅ Tipo de sistema válido (on-grid, off-grid, híbrido)
- ✅ Fase válida (mono, bi, trifásico)

#### Respostas
```json
{
  "success": true,
  "calculation": {
    "dimensionamento": { ... },
    "kits_recomendados": [ ... ],
    "financeiro": { ... },
    "impacto_ambiental": { ... },
    "conformidade": { ... },
    "dados_localizacao": { ... }
  },
  "metadata": {
    "calculated_at": "2024-01-15T10:30:00Z",
    "api_version": "v1",
    "input_parameters": { ... }
  }
}
```

## 📊 Dados Técnicos Incorporados

### Irradiância Solar (HSP) por Estado
```typescript
AC: 4.5, AL: 5.5, AM: 4.7, AP: 4.9, BA: 5.7,
CE: 5.8, DF: 5.4, ES: 5.0, GO: 5.5, MA: 5.3,
MG: 5.4, MS: 5.2, MT: 5.3, PA: 4.8, PB: 5.9,
PE: 5.8, PI: 5.6, PR: 4.8, RJ: 5.0, RN: 5.9,
RO: 4.9, RR: 4.6, RS: 4.6, SC: 4.5, SE: 5.6,
SP: 5.1, TO: 5.4
```

### Tarifas de Energia por Estado (R$/kWh)
```typescript
AC: 0.75, AL: 0.78, AM: 0.72, BA: 0.80,
CE: 0.76, DF: 0.72, ES: 0.74, GO: 0.73,
MG: 0.82, PR: 0.79, RJ: 0.88, RS: 0.85,
SC: 0.77, SP: 0.78
// Demais estados: R$ 0.75 (média)
```

### Parâmetros de Cálculo
- **Performance Ratio**: 82%
- **Degradação Anual**: 0,5%
- **Área por kWp**: 6,5 m²
- **Potência Inversor**: 85% da potência dos painéis
- **Taxa de desconto (VPL)**: 8% a.a.
- **SELIC (financiamento)**: 11,75% a.a.

## 🧪 Testes

Arquivo de testes REST Client criado: `test-calculator.http`

### Cenários de Teste

1. ✅ **Básico**: Consumo 450 kWh/mês, SP
2. ✅ **Completo**: Consumo 650 kWh/mês, MG, com localização
3. ✅ **Array Mensal**: 12 meses de consumo, RJ
4. ✅ **Financiamento**: 750 kWh/mês, RS, 60 meses
5. ✅ **Comercial**: 2500 kWh/mês, PR
6. ❌ **Erro**: Falta consumo (validação)
7. ❌ **Erro**: Oversizing inválido (validação)

## 📁 Estrutura de Arquivos

```
backend/src/
├── modules/solar/services/
│   ├── calculator.ts          # Serviço principal de cálculo
│   └── kit-matcher.ts         # Matching de kits do catálogo
├── api/store/solar/calculator/
│   ├── route.ts              # Endpoints REST
│   └── middlewares.ts        # API versioning
└── test-calculator.http      # Testes REST Client
```

## 🚀 Como Usar

### 1. Iniciar Backend
```bash
cd backend
yarn dev
```

### 2. Testar API
Abra `test-calculator.http` no VS Code com REST Client extension e execute os requests.

### 3. Integração no Frontend
```typescript
const response = await fetch('/store/solar/calculator', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Version': 'v1'
  },
  body: JSON.stringify({
    consumo_kwh_mes: 450,
    uf: 'SP',
    oversizing_target: 130,
    tipo_sistema: 'on-grid',
    fase: 'bifasico'
  })
});

const { calculation } = await response.json();
console.log(calculation.dimensionamento);
console.log(calculation.kits_recomendados);
console.log(calculation.financeiro);
```

## 🔄 Integração com Catálogo

O sistema busca kits reais do catálogo Medusa:

1. **Query Products**: RemoteQuery busca produtos com `metadata.potencia_kwp`
2. **Scoring**: Sistema de pontos classifica kits por relevância
3. **Fallback**: Se nenhum kit encontrado, retorna mock baseado no dimensionamento
4. **Extração**: Metadados são extraídos e formatados para resposta

## 📈 Próximos Passos

### Curto Prazo
- [ ] Testar com catálogo real de produtos
- [ ] Adicionar cache de cálculos (Redis)
- [ ] Criar componentes React para frontend

### Médio Prazo
- [ ] Análise sazonal (verão/inverno)
- [ ] Dimensionamento de baterias (sistemas híbridos)
- [ ] Comparação multi-localização
- [ ] Simulação de sombreamento

### Longo Prazo
- [ ] Machine Learning para previsão de geração
- [ ] Integração com dados meteorológicos real-time
- [ ] Otimização por algoritmos genéticos
- [ ] Dashboard de monitoramento pós-instalação

## 📚 Referências

- **CRESESB**: Dados de irradiância solar brasileira
- **ANEEL REN 1.059/2023**: Regras MMGD
- **MME**: Projeções de tarifas
- **ABGD**: Boas práticas de dimensionamento
- **IEA**: Fatores de emissão de CO₂

---

**Status**: ✅ Implementação completa e pronta para testes  
**Última Atualização**: 2024-01-15  
**Autor**: YSH Development Team
