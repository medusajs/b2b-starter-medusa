# ✅ Task 6: Formulários de Análise de Crédito - EM PROGRESSO

**Data:** 2025-10-08  
**Status:** 🟡 70% Completo - Model criado, Service em ajuste

---

## 🎯 OBJETIVO

Criar sistema completo de análise de crédito para clientes solares, integrado com Quote e SolarCalculation.

---

## ✅ IMPLEMENTADO

### 1. Modelo `CreditAnalysis` (COMPLETO)

**Arquivo:** `backend/src/models/credit-analysis.ts`

**Campos principais:**

- ✅ Relacionamentos: `customer_id`, `quote_id`, `solar_calculation_id`
- ✅ Status: `pending`, `in_review`, `approved`, `rejected`, `conditional`
- ✅ Tipo: `individual` (PF) ou `business` (PJ)
- ✅ Dados pessoais: `full_name`, `cpf_cnpj`, `birth_date`, `company_foundation_date`
- ✅ Contato: `email`, `phone`, `mobile_phone`
- ✅ Endereço completo (JSON): `street`, `number`, `city`, `state`, `zip`, etc.
- ✅ Dados financeiros: `monthly_income`, `annual_revenue`, `occupation`, `employer`, `employment_time_months`
- ✅ Crédito: `credit_score`, `has_negative_credit`, `has_bankruptcy`, `monthly_debts`, `debt_to_income_ratio`
- ✅ Financiamento: `requested_amount`, `requested_term_months`, `financing_modality` (CDC/LEASING/EAAS/CASH)
- ✅ Entrada: `has_down_payment`, `down_payment_amount`
- ✅ Documentos (JSON): `cpf`, `rg`, `proof_income`, `proof_address`, `contract_social`, etc.
- ✅ Resultado: `analysis_result`, `approved_amount`, `approved_interest_rate`, `approval_conditions`
- ✅ Observações: `customer_notes`, `analyst_notes`, `rejection_reason`
- ✅ Metadados: `submission_source`, `ip_address`, `user_agent`
- ✅ Timestamps: `submitted_at`, `reviewed_at`, `approved_at`, `rejected_at`, `expires_at`

**Total: 30+ campos**

---

### 2. Service de Crédito (70% COMPLETO)

**Arquivo:** `backend/src/modules/credit-analysis/service.ts`

**Interfaces criadas:**

```typescript
export interface CreditAnalysisInput { ... }
export interface CreditAnalysisResult {
    approved: boolean
    approved_amount?: number
    approved_term_months?: number
    approved_interest_rate?: number
    approval_conditions?: string[]
    rejection_reason?: string
    recommended_actions?: string[]
}
export interface CreditScoreFactors {
    income_score: number           // 0-30 pontos
    employment_score: number       // 0-15 pontos
    credit_history_score: number   // 0-35 pontos
    debt_ratio_score: number       // 0-20 pontos
    total_score: number            // 0-100 pontos
}
```

**Métodos implementados:**

#### ✅ `createCreditAnalysis(input)`

- Valida dados obrigatórios
- Calcula `debt_to_income_ratio`
- Prepara dados para persistência
- **Nota:** Persistência será feita via API route

#### ✅ `analyzeCreditAutomatically(analysis)`

- Calcula score interno (0-100)
- Determina aprovação automática:
  - Score ≥ 60 pontos
  - Sem negativação
  - Sem falência
  - Dívida/renda < 50%
- Calcula taxa de juros baseada no score
- Retorna condições de aprovação ou motivo de rejeição

#### ✅ `calculateCreditScore(analysis)`

Algoritmo de scoring:

1. **Renda (0-30 pontos)**
   - ≥ R$ 10.000: 30pts
   - ≥ R$ 5.000: 20pts
   - ≥ R$ 3.000: 15pts
   - ≥ R$ 1.500: 10pts
   - < R$ 1.500: 5pts

2. **Emprego/Empresa (0-15 pontos)**
   - PF: Tempo de emprego
     - ≥ 36 meses: 15pts
     - ≥ 24 meses: 12pts
     - ≥ 12 meses: 8pts
     - < 12 meses: 5pts
   - PJ: Tempo de fundação
     - ≥ 5 anos: 15pts
     - ≥ 3 anos: 12pts
     - ≥ 1 ano: 8pts

3. **Histórico de Crédito (0-35 pontos)**
   - Score ≥ 750: 35pts
   - Score 700-749: 30pts
   - Score 650-699: 25pts
   - Score 600-649: 20pts
   - Score 550-599: 15pts
   - Score < 550: 10pts
   - **Penalidades:**
     - Negativado: -20pts
     - Falência: -35pts

4. **Relação Dívida/Renda (0-20 pontos)**
   - 0%: 20pts
   - < 20%: 18pts
   - < 30%: 15pts
   - < 40%: 10pts
   - < 50%: 5pts
   - ≥ 50%: 0pts

#### ✅ `getApprovalConditions()`

Condições baseadas no perfil:

- Score < 70: Entrada mínima de 20%
- Score < 650: Seguro de crédito obrigatório
- Dívida/renda > 30%: Prazo limitado a 48 meses
- PJ: Financiamento limitado a 50% do faturamento anual

#### ✅ `getRejectionReason()`

Motivos de rejeição:

- Histórico de falência
- Negativado (Serasa/SPC)
- Comprometimento de renda ≥ 50%
- Score < 40
- Renda não comprovada

#### ✅ `getRecommendedActions()`

Ações para melhorar aprovação:

- Regularizar pendências
- Melhorar score (pagar contas em dia)
- Reduzir dívidas mensais
- Considerar entrada de 20-30%
- Reduzir prazo de financiamento
- Apresentar comprovação de renda adicional

#### ✅ `validateInput()`

Validações:

- Campos obrigatórios
- CPF (11 dígitos) / CNPJ (14 dígitos)
- Valor e prazo válidos

#### ✅ `calculateDebtToIncomeRatio()`

Fórmula: `monthly_debts / monthly_income`

---

## ⏸️ PENDENTE

### 3. API Routes (0% - PRÓXIMO PASSO)

**Endpoints a criar:**

#### `POST /api/credit-analysis`

Criar nova análise de crédito.

**Request:**

```json
{
  "customer_id": "cus_01JFKL...",
  "quote_id": "quo_01JFKL...",
  "solar_calculation_id": "scalc_01JFKL...",
  "customer_type": "individual",
  "full_name": "João da Silva",
  "cpf_cnpj": "12345678901",
  "email": "joao@email.com",
  "phone": "(11) 98765-4321",
  "address": {
    "street": "Rua Solar",
    "number": "123",
    "city": "São Paulo",
    "state": "SP",
    "zip": "01001-000",
    "country": "Brasil"
  },
  "monthly_income": 5000,
  "credit_score": 700,
  "monthly_debts": 1200,
  "requested_amount": 25000,
  "requested_term_months": 60
}
```

**Response:**

```json
{
  "id": "cred_01JFKL...",
  "status": "pending",
  "submitted_at": "2025-10-08T15:30:00.000Z"
}
```

#### `POST /api/credit-analysis/:id/analyze`

Executar análise automática.

**Response:**

```json
{
  "approved": true,
  "approved_amount": 25000,
  "approved_term_months": 60,
  "approved_interest_rate": 0.0135,
  "approval_conditions": [
    "Entrada mínima de 20% recomendada"
  ],
  "score_breakdown": {
    "income_score": 20,
    "employment_score": 12,
    "credit_history_score": 30,
    "debt_ratio_score": 15,
    "total_score": 77
  }
}
```

#### `GET /api/credit-analysis/:id`

Buscar análise por ID.

#### `GET /api/credit-analysis/customer/:customer_id`

Listar análises de um cliente.

#### `GET /api/credit-analysis/quote/:quote_id`

Listar análises de uma cotação.

#### `PATCH /api/credit-analysis/:id/status`

Atualizar status manualmente (admin).

**Request:**

```json
{
  "status": "approved",
  "analyst_notes": "Cliente pré-aprovado via análise manual"
}
```

---

### 4. Formulários Frontend (0% - PRÓXIMO PASSO)

**Componente:** `storefront/src/modules/credit-analysis/components/CreditAnalysisForm.tsx`

**Seções do formulário:**

1. **Tipo de Cliente**
   - Radio: Pessoa Física / Pessoa Jurídica

2. **Dados Pessoais**
   - Nome completo
   - CPF/CNPJ (com validação)
   - Data de nascimento (PF) / Data de fundação (PJ)

3. **Contato**
   - E-mail
   - Telefone
   - Celular (opcional)

4. **Endereço**
   - CEP (busca automática via ViaCEP)
   - Rua, Número, Complemento
   - Bairro, Cidade, Estado

5. **Dados Financeiros**
   - Renda mensal (PF) / Faturamento anual (PJ)
   - Profissão / Atividade
   - Empregador / Nome empresarial
   - Tempo de emprego/empresa

6. **Informações de Crédito**
   - Score de crédito (se souber)
   - Possui restrições? (Sim/Não)
   - Valor das dívidas mensais

7. **Financiamento Desejado**
   - Valor solicitado (pré-preenchido do kit)
   - Prazo desejado (dropdown: 12, 24, 36, 48, 60 meses)
   - Possui entrada? Valor da entrada

8. **Upload de Documentos**
   - CPF/CNPJ
   - RG/CNH
   - Comprovante de renda
   - Comprovante de endereço
   - Contrato social (PJ)

9. **Observações**
   - Campo de texto livre

**Componente:** `storefront/src/modules/credit-analysis/components/CreditAnalysisResult.tsx`

Exibir resultado da análise:

- ✅ Aprovado / ❌ Rejeitado / ⚠️ Condicional
- Score calculado (gráfico de progresso)
- Valor aprovado
- Taxa de juros
- Parcela mensal
- Condições/restrições
- Ações recomendadas (se rejeitado)

---

### 5. Integração com Quote (0% - PRÓXIMO PASSO)

**Fluxo completo:**

```
1. Cliente calcula viabilidade solar
   ↓
2. Seleciona kit desejado
   ↓
3. Cria cotação (Quote)
   ↓
4. Sistema sugere: "Deseja simular financiamento?"
   ↓
5. Cliente preenche formulário de crédito
   ↓
6. Sistema cria CreditAnalysis vinculada a Quote
   ↓
7. Análise automática executada
   ↓
8. Se aprovado → Cotação atualizada com condições
   ↓
9. Se rejeitado → Sugestões de melhoria
   ↓
10. Cliente pode revisar e reenviar
```

**Modificações necessárias:**

- `backend/src/modules/quote/models/quote.ts`: Adicionar `credit_analysis_id`
- `storefront/src/modules/quotes/`: Adicionar botão "Solicitar Análise de Crédito"
- Dashboard admin: Visualizar análises pendentes

---

## 📊 COMPARAÇÃO: Sistema Atual vs. Proposto

| Recurso | Antes | Depois |
|---------|-------|--------|
| Análise de crédito | ❌ Manual/externo | ✅ Automática integrada |
| Score interno | ❌ Não existe | ✅ Algoritmo 0-100 pts |
| Aprovação automática | ❌ N/A | ✅ Sim (score ≥ 60) |
| Condições personalizadas | ❌ N/A | ✅ Baseadas no perfil |
| Documentos digitais | ❌ N/A | ✅ Upload + storage |
| Integração com Quote | ❌ N/A | ✅ Vinculação direta |
| Histórico do cliente | ❌ N/A | ✅ Lista todas análises |
| Recomendações IA | ❌ N/A | ✅ Ações para melhorar |

---

## 🚀 PRÓXIMOS PASSOS (Prioridade)

1. **Ajustar Service** (30 min)
   - Simplificar para padrão Medusa correto
   - Remover dependências de query direto

2. **Criar API Routes** (1-2h)
   - POST /api/credit-analysis
   - POST /api/credit-analysis/:id/analyze
   - GET endpoints
   - PATCH status update

3. **Criar Formulário Frontend** (2-3h)
   - CreditAnalysisForm.tsx
   - CreditAnalysisResult.tsx
   - Integração com ViaCEP
   - Upload de documentos

4. **Integrar com Quote** (1h)
   - Adicionar credit_analysis_id no modelo
   - Botão na página de cotação
   - Fluxo completo

5. **Testar End-to-End** (1h)
   - Criar análise
   - Executar scoring
   - Aprovar/rejeitar
   - Visualizar resultado

**Total estimado: 6-8 horas**

---

## 💡 MELHORIAS FUTURAS

- [ ] Integração com bureaus de crédito (Serasa, SPC)
- [ ] Integração com bancos parceiros (Santander, BV, etc.)
- [ ] Machine Learning para melhorar scoring
- [ ] Assinatura digital de contratos
- [ ] Notificações por e-mail/SMS
- [ ] Dashboard de análises para admin
- [ ] Relatórios e métricas (taxa de aprovação, ticket médio, etc.)
- [ ] Integração com sistemas de pagamento
- [ ] Simulação de múltiplas ofertas de bancos

---

**Status atual: Modelo completo + Service 70% pronto. Próximos passos: API Routes + Frontend** 🎯
