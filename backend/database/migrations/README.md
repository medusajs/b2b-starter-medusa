# 📊 Database Migrations - YSH B2B Platform

> **Status:** ✅ **TODAS AS MIGRATIONS EXECUTADAS COM SUCESSO**  
> **Data:** 10/01/2025  
> **Total:** 30 tabelas | 626 índices | 26 triggers | 91 seed records

## Visão Geral

Este diretório contém os scripts SQL de migração para o banco de dados PostgreSQL da plataforma YSH B2B. Os schemas foram projetados para suportar todas as **personas**, **buyer journeys**, **ferramentas** e **módulos B2B** do sistema.

### 🎉 Migrations Completas

- ✅ **001** - Personas & Buyer Journeys (7 tabelas)
- ✅ **002** - Tools & Calculations (5 tabelas)
- ✅ **003** - B2B Modules (9 tabelas)
- ✅ **004** - Seed Data (33 registros)
- ✅ **005** - Approval Module (4 tabelas)
- ✅ **006** - ANEEL Tariff (5 tabelas)
- ✅ **007** - ANEEL Seed Data (58 registros)
---

## 📁 Estrutura de Migrations

```tsx
backend/database/migrations/
├── 001_personas_and_journeys.sql   # Personas, jornadas e analytics
├── 002_tools_and_calculations.sql  # Ferramentas solares e cálculos
├── 003_b2b_modules.sql             # Módulos B2B (companies, approvals, quotes, pricing)
├── 004_seed_data.sql               # Dados iniciais (10 personas, 7 jornadas, 15 tools)
└── README.md                        # Esta documentação
```

---

## 🗂️ Schema Detalhado

### Migration 001: Personas & Buyer Journeys

#### Tabelas Criadas

1. **`personas`** - Tipos de personas (CG_PRO_INSTALLER, CG_AFFILIATE, CG_OWNER_*, etc.)
   - 10 personas seed: 3 B2B Professional, 2 Affiliate, 4 Owner, 1 Admin
   - Configurações: customer_group_id, pricing_tier, capabilities, approval_threshold

2. **`buyer_journeys`** - Jornadas de compra
   - 7 jornadas seed: Discovery, Solar Analysis, Lead to B2B, Quote to Order, Comparison, CV, Post-Sale
   - Métricas: conversion_rate, time_to_purchase, satisfaction_score

3. **`journey_steps`** - Passos individuais de cada jornada
   - Campos: step_number, route_path, objective, components, available_actions
   - Relacionado: journey_id → buyer_journeys

4. **`persona_tools`** - Ferramentas disponíveis
   - 15 tools seed: calculadoras, analisadores, simuladores, geradores
   - Categorias: solar, financial, technical, business
   - Configuração: api_endpoint, input_schema, output_schema, execution_limits

5. **`tool_usage_tracking`** - Tracking de uso de ferramentas
   - Relacionado: tool_id → persona_tools
   - Campos: input_data, output_data, execution_time_ms, led_to_conversion

6. **`journey_analytics`** - Analytics agregados
   - Relacionado: journey_id → buyer_journeys
   - Métricas por período: completion_rate, avg_duration, conversion_value

7. **`customer_persona_assignments`** - Relacionamento N:N customers ↔ personas
   - Campos: is_primary, confidence_score, assignment_reason

---

### Migration 002: Tools & Calculations

#### Tabelas Criadas

1. **`solar_calculations`** - Cálculos de dimensionamento
   - Input: location, consumption_profile, roof_area, voltage, tariff_modality
   - Output: recommended_power_kw, system_configuration, roi_analysis
   - Conversão: cart_id, quote_id, order_id

2. **`viability_studies`** - Estudos de viabilidade
   - Relacionado: solar_calculation_id
   - Input: solar_calculation_result, project_details, financial_parameters, tariff_data
   - Output: viability_score, financial_analysis, technical_analysis, risk_analysis
   - Status: draft, final, approved, rejected

3. **`cv_analyses`** - Análise de telhado via Computer Vision
   - Input: image_sources, analysis_parameters
   - Output: roof_analysis, obstacles_detected, shading_analysis, optimal_panel_layout
   - Status: pending, processing, completed, failed
   - Qualidade: confidence_score, quality_issues

4. **`credit_analyses`** - Análise de crédito
   - Relacionado: quote_id, solar_calculation_id, viability_study_id
   - Dados: customer_type, cpf_cnpj, monthly_income, credit_score
   - Resultado: approved_amount, interest_rate, approval_conditions
   - Status: pending, in_review, approved, rejected, conditional

5. **`dimensioning_requests`** - Solicitações personalizadas
   - Relacionado: customer_id, solar_calculation_id
   - Tipo: basic, advanced, professional, custom
   - Status: pending, assigned, in_progress, completed, cancelled
   - Atribuição: assigned_to (técnico/engenheiro)

---

### Migration 003: B2B Modules

#### Tabelas Criadas

1. **`companies`** - Empresas B2B
   - Dados: name, cnpj, email, address
   - Financeiro: credit_limit, spending_limit, spending_limit_reset_frequency
   - Configuração: customer_group_id, company_type, payment_terms
   - Status: is_verified, is_active

2. **`employees`** - Funcionários/Colaboradores
   - Relacionado: company_id → companies, customer_id (remote link)
   - Papel: role (admin, purchaser, viewer, approver), is_admin
   - Limites: spending_limit, monthly_limit, current_month_spent
   - Convite: invite_status, invite_token, invited_at

3. **`company_projects`** - Projetos/Obras
   - Relacionado: company_id, created_by, project_manager_id
   - Tipo: project_type (residential, commercial, industrial, rural)
   - Orçamento: estimated_budget, approved_budget, spent_to_date
   - Status: planning, active, on_hold, completed, cancelled
   - Vínculos: cart_ids[], order_ids[]

4. **`approvals`** - Aprovações de compra
   - Relacionado: cart_id, company_id, project_id
   - Tipo: spending_limit, technical_review, management, credit
   - Status: pending, approved, rejected, cancelled, expired
   - Valores: requested_amount, approved_amount
   - Atores: created_by, handled_by

5. **`quotes`** - Cotações (RFQ)
   - Relacionado: customer_id, company_id, project_id, cart_id, draft_order_id
   - Status: pending_merchant, pending_customer, accepted, rejected
   - Valores: subtotal, discount_total, tax_total, shipping_total, total
   - Termos: payment_terms, delivery_terms, validity_days

6. **`quote_messages`** - Mensagens de cotação
   - Relacionado: quote_id → quotes
   - Autor: author_id, author_type (customer, merchant, system)
   - Tipo: comment, status_change, price_update, attachment

7. **`ysh_distributors`** - Distribuidores/Fornecedores
   - Dados: name, slug, email, website
   - Configuração: keywords[], price_markup, min_order_value
   - Logística: default_lead_time_days, shipping_zones[]
   - API: api_endpoint, api_key, api_type

8. **`ysh_distributor_prices`** - Preços por distribuidor
   - Relacionado: distributor_id, variant_id (Medusa)
   - Preços: base_price, final_price, cost_price, list_price
   - Disponibilidade: availability, qty_available, allow_backorder
   - Logística: lead_time_days, min_quantity, warehouse_location
   - Sync: last_updated_at, is_stale

9. **`price_change_log`** - Histórico de mudanças de preço
   - Relacionado: distributor_price_id
   - Mudanças: old/new base_price, old/new final_price, price_change_percent
   - Disponibilidade: old/new availability, old/new qty

---

### Migration 004: Seed Data

#### Dados Iniciais Inseridos

**Personas (10):**

- `CG_PRO_INSTALLER` - Instalador Profissional
- `CG_PRO_INTEGRATOR` - Integrador de Sistemas
- `CG_PRO_ENGINEER` - Engenheiro Solar
- `CG_AFFILIATE` - Parceiro Afiliado
- `CG_AFFILIATE_PREMIUM` - Afiliado Premium
- `CG_OWNER_RESIDENTIAL` - Proprietário Residencial
- `CG_OWNER_COMMERCIAL` - Proprietário Comercial
- `CG_OWNER_RURAL` - Proprietário Rural
- `CG_OWNER_INDUSTRIAL` - Proprietário Industrial
- `CG_ADMIN` - Administrador da Plataforma

**Buyer Journeys (7):**

- `DISCOVERY_TO_PURCHASE` - Descoberta → Compra Simples (100%)
- `SOLAR_ANALYSIS_TO_KIT` - Análise Solar → Kit Completo (95%)
- `LEAD_TO_B2B_CLIENT` - Lead → Cliente B2B (90%)
- `QUOTE_TO_ORDER` - Cotação B2B → Pedido (85%)
- `COMPARISON_TO_DECISION` - Comparação → Decisão (100%)
- `CV_TO_PROPOSAL` - Computer Vision → Proposta (80%)
- `POST_SALE_SUPPORT` - Pós-Venda → Suporte (60%)

**Tools (15):**

*Solar (3):*

- `solar_dimensioning` - Calculadora de Dimensionamento
- `viability_analyzer` - Analisador de Viabilidade
- `tariff_classifier` - Classificador de Tarifas

*Technical (4):*

- `cv_roof_analyzer` - Analisador de Telhado (CV)
- `panel_layout_optimizer` - Otimizador de Layout
- `compatibility_checker` - Verificador de Compatibilidade
- `load_calculator` - Calculadora de Cargas
- `shading_simulator` - Simulador de Sombreamento

*Financial (3):*

- `credit_analyzer` - Analisador de Crédito
- `roi_calculator` - Calculadora de ROI
- `financing_simulator` - Simulador de Financiamento

*Business (3):*

- `quote_generator` - Gerador de Cotações
- `project_manager` - Gerenciador de Projetos
- `bulk_pricer` - Cotador em Lote

*Analysis (2):*

- `product_comparator` - Comparador de Produtos
- `performance_predictor` - Preditor de Performance

---

## 🚀 Como Executar as Migrations

### Pré-requisitos

- PostgreSQL 14+ instalado
- Banco de dados `medusa_db` criado
- Usuário `medusa_user` configurado

### Opção 1: Docker (Recomendado)

```powershell
# 1. Iniciar PostgreSQL via Docker
docker-compose up -d postgres

# 2. Acessar o container
docker exec -it ysh-b2b-postgres psql -U medusa_user -d medusa_db

# 3. Executar migrations
\i /app/database/migrations/001_personas_and_journeys.sql
\i /app/database/migrations/002_tools_and_calculations.sql
\i /app/database/migrations/003_b2b_modules.sql
\i /app/database/migrations/004_seed_data.sql
```

### Opção 2: PowerShell Script

```powershell
# Script automatizado
cd C:\Users\fjuni\ysh_medusa\ysh-store\backend

$migrations = @(
    "database/migrations/001_personas_and_journeys.sql",
    "database/migrations/002_tools_and_calculations.sql",
    "database/migrations/003_b2b_modules.sql",
    "database/migrations/004_seed_data.sql"
)

foreach ($migration in $migrations) {
    Write-Host "Executando $migration..." -ForegroundColor Cyan
    docker exec -i ysh-b2b-postgres psql -U medusa_user -d medusa_db < $migration
    if ($?) {
        Write-Host "✓ $migration concluída" -ForegroundColor Green
    } else {
        Write-Host "✗ Erro em $migration" -ForegroundColor Red
        break
    }
}
```

### Opção 3: Cliente PostgreSQL Local

```powershell
# Se PostgreSQL estiver instalado localmente
psql -U medusa_user -d medusa_db -f database/migrations/001_personas_and_journeys.sql
psql -U medusa_user -d medusa_db -f database/migrations/002_tools_and_calculations.sql
psql -U medusa_user -d medusa_db -f database/migrations/003_b2b_modules.sql
psql -U medusa_user -d medusa_db -f database/migrations/004_seed_data.sql
```

---

## 🔍 Verificação da Instalação

```sql
-- 1. Verificar tabelas criadas
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Verificar personas seed
SELECT code, display_name, persona_type, is_active 
FROM personas 
ORDER BY priority;

-- 3. Verificar buyer journeys
SELECT code, display_name, complexity, completion_percentage 
FROM buyer_journeys 
ORDER BY completion_percentage DESC;

-- 4. Verificar tools
SELECT code, display_name, tool_type, category, is_active 
FROM persona_tools 
ORDER BY category, code;

-- 5. Verificar contagem de registros
SELECT 
    (SELECT COUNT(*) FROM personas) as personas,
    (SELECT COUNT(*) FROM buyer_journeys) as journeys,
    (SELECT COUNT(*) FROM persona_tools) as tools,
    (SELECT COUNT(*) FROM companies) as companies,
    (SELECT COUNT(*) FROM ysh_distributors) as distributors;
```

---

## 📊 Relacionamentos Principais

```
┌─────────────────────────────────────────────────────────────┐
│                    ECOSYSTEM OVERVIEW                       │
└─────────────────────────────────────────────────────────────┘

personas
    ├── customer_persona_assignments → customer (Medusa)
    ├── buyer_journeys.primary_persona_ids (JSONB)
    └── persona_tools.available_for_personas (JSONB)

buyer_journeys
    ├── journey_steps (1:N)
    ├── journey_analytics (1:N)
    └── tool_usage_tracking.journey_id (FK)

persona_tools
    ├── tool_usage_tracking (1:N)
    └── personas (via JSONB array)

companies
    ├── employees (1:N)
    ├── company_projects (1:N)
    ├── approvals (1:N)
    └── quotes (1:N)

solar_calculations
    ├── viability_studies (1:N)
    ├── credit_analyses (1:N)
    └── dimensioning_requests (1:N)

ysh_distributors
    ├── ysh_distributor_prices (1:N)
    └── price_change_log (via distributor_price_id)
```

---

## 🛠️ Manutenção e Próximos Passos

### Recomendações Imediatas

1. **Popular Journey Steps**
   - Adicionar etapas detalhadas para cada buyer journey
   - Mapear rotas, componentes e CTAs

2. **Configurar Personas por Customer**
   - Atualizar `customer_persona_assignments` no signup
   - Implementar lógica de atribuição automática

3. **Monitoring & Analytics**
   - Começar tracking de `tool_usage_tracking`
   - Popular `journey_analytics` periodicamente

4. **Seed Distributors**
   - Adicionar distribuidores reais
   - Popular `ysh_distributor_prices` com catálogo

### Manutenção Contínua

- **Backup Regular**: Configurar backup automático do PostgreSQL
- **Performance Monitoring**: Analisar slow queries e adicionar índices
- **Data Cleanup**: Remover tool_usage_tracking antigos (>1 ano)
- **Schema Updates**: Versionar mudanças futuras com migrations incrementais

---

## 📞 Suporte e Documentação

- **Schema Visual**: Gerar ERD usando ferramentas como `pg_dump` + DBDiagram.io
- **Documentação API**: Consultar `backend/src/api/` para endpoints
- **Issues**: Reportar problemas via GitHub Issues
- **Contact**: Equipe YSH B2B Development

---

**Última Atualização:** 10/01/2025  
**Versão do Schema:** 1.0  
**PostgreSQL Mínimo:** 14+  
**Total de Tabelas:** 22  
**Total de Seed Records:** 32 (10 personas + 7 journeys + 15 tools)
