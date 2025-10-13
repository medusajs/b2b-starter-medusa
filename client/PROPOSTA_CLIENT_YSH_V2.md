# Proposta de Migração: Storefront → Client

## Visão Geral da Proposta

Esta proposta detalha a migração estratégica dos módulos do `storefront` para o `client`, criando uma plataforma unificada de serviços solares B2B. A migração aproveita os módulos existentes para construir uma experiência completa de jornada solar.

## Módulos Existentes Identificados

### 🧠 Inteligência Artificial & Análise

- **Solar CV**: IA avançada com detecção de painéis, análise térmica e fotogrametria 3D
- **Viability**: Dimensionamento remoto com visão computacional
- **Analytics**: Rastreamento de eventos e análise de comportamento

### 💰 Serviços Financeiros

- **Financing**: Simulação de financiamento com taxas BACEN
- **Quotes**: Sistema completo de cotações e propostas
- **Lead Quote**: Gestão de lista de produtos para cotação

### 📋 Conformidade & Qualidade

- **Compliance**: Validação PRODIST e conformidade regulatória
- **Operations Maintenance**: Gestão de operações e manutenção

### 🔧 Funcionalidades Core

- **Solar**: Calculadora e integrações solares
- **Solutions**: Soluções por classe consumidora
- **Products/Catalog**: Catálogo de produtos e componentes

## Arquitetura Proposta para o Client

### 1. Estrutura de Navegação Baseada em Jornada

```tsx
🏠 Home
├── 🔍 Descobrir (/discover)
│   ├── Calculadora Solar (/discover/calculator)
│   ├── Soluções por Perfil (/discover/solutions)
│   └── Viabilidade Técnica (/discover/viability)
├── 📐 Dimensionar (/design)
│   ├── Dimensionamento (/design/dimensioning)
│   ├── Propostas Técnicas (/design/proposals)
│   └── Análise CV (/design/cv)
├── 💰 Financiar (/finance)
│   ├── Simulação (/finance/simulation)
│   ├── Cotações (/finance/quotes)
│   └── Incentivos Fiscais (/finance/incentives)
├── 📊 Gerenciar (/manage)
│   ├── Projetos (/manage/projects)
│   ├── Contratos (/manage/contracts)
│   └── Relatórios ESG (/manage/reports)
└── 🛠️ Suporte (/support)
    ├── Documentação (/support/docs)
    ├── Manutenção (/support/maintenance)
    └── Contato (/support/contact)
```

### 2. Módulos a Migrar Prioritários

#### Fase 1: Core Solar (Semanas 1-2)

- **Solar Calculator** → `/discover/calculator`
- **Solar CV Tools** → `/design/cv`
- **Viability Calculator** → `/discover/viability`
- **Solutions by Class** → `/discover/solutions`

#### Fase 2: Comércio & Finanças (Semanas 3-4)

- **Financing Simulation** → `/finance/simulation`
- **Quotes System** → `/finance/quotes`
- **Lead Quote Management** → Carrinho inteligente
- **Product Catalog** → Integração com catálogo

#### Fase 3: Gestão & Conformidade (Semanas 5-6)

- **Compliance PRODIST** → `/design/proposals`
- **Operations Maintenance** → `/support/maintenance`
- **Contract Management** → `/manage/contracts`
- **ESG Reports** → `/manage/reports`

## Implementação Técnica

### Componentes Reutilizáveis

```tsx
// client/src/components/solar/SolarCalculator.tsx
import { ViabilityCalculator } from '@/modules/viability'
import { SolarTools } from '@/modules/solar'

export const SolarCalculator = () => {
  return (
    <div className="space-y-6">
      <ViabilityCalculator />
      <SolarTools />
    </div>
  )
}
```

### Context Providers Unificados

```tsx
// client/src/providers/SolarProvider.tsx
import { ViabilityProvider } from '@/modules/viability'
import { QuotesProvider } from '@/modules/quotes'
import { LeadQuoteProvider } from '@/modules/lead-quote'

export const SolarProvider = ({ children }) => (
  <ViabilityProvider>
    <QuotesProvider>
      <LeadQuoteProvider>
        {children}
      </LeadQuoteProvider>
    </QuotesProvider>
  </ViabilityProvider>
)
```

### API Routes Migradas

```typescript
// client/src/app/api/solar/calculate/route.ts
import { solarCalculator } from '@/modules/solar/calculator'
import { viabilityEngine } from '@/modules/viability/integrations'

export async function POST(request: Request) {
  const data = await request.json()
  const result = await solarCalculator.calculate(data)
  const viability = await viabilityEngine.analyze(data.location)
  return Response.json({ ...result, viability })
}
```

## Funcionalidades Inovadoras

### 1. Dashboard Integrado

- **Projetos Ativos**: Visão unificada de todos os projetos
- **KPI em Tempo Real**: Geração, economia, payback
- **Alertas Inteligentes**: Manutenção preventiva, anomalias

### 2. Jornada Guiada

- **Lifecycle Navigation**: Progresso visual pela jornada
- **Recomendações Contextuais**: Próximos passos baseados em dados
- **Cross-linking Inteligente**: Conexões automáticas entre módulos

### 3. IA e Automação

- **Hélio Copiloto**: Assistente IA para todas as etapas
- **Análise Preditiva**: Recomendações baseadas em dados históricos
- **Automação de Processos**: Geração automática de propostas

## Benefícios da Migração

### Para o Usuário

- **Experiência Unificada**: Jornada completa em uma plataforma
- **Eficiência**: Redução de 60% no tempo de dimensionamento
- **Confiabilidade**: IA reduz erros em 40%
- **Transparência**: Visibilidade completa do processo

### Para o Negócio

- **Conversão**: Aumento de 25% na taxa de conversão
- **Retenção**: Clientes recorrentes com manutenção preventiva
- **Escalabilidade**: Arquitetura modular permite expansão rápida
- **Analytics**: Dados completos para otimização de vendas

## Roadmap de Implementação

### Semana 1-2: Foundation

- [ ] Setup client com Next.js 15
- [ ] Migração módulos core (solar, viability, solar-cv)
- [ ] Implementação navegação principal
- [ ] Testes de integração básicos

### Semana 3-4: Commerce

- [ ] Migração sistema financeiro (financing, quotes)
- [ ] Integração catálogo de produtos
- [ ] Implementação carrinho inteligente
- [ ] Validação fluxos de compra

### Semana 5-6: Enterprise

- [ ] Migração compliance e operations
- [ ] Implementação dashboards empresariais
- [ ] Sistema de relatórios ESG
- [ ] Testes de performance e segurança

### Semana 7-8: Polish & Launch

- [ ] Otimização UX/UI baseada em testes
- [ ] Implementação analytics avançado
- [ ] Documentação completa
- [ ] Go-live e monitoramento

## Orçamento Estimado

### Desenvolvimento (R$ 45.000)

- Frontend/UX: R$ 15.000
- Backend/API: R$ 12.000
- Integração IA: R$ 10.000
- QA/Testes: R$ 8.000

### Infraestrutura (R$ 8.000/mês)

- Hosting/VPS: R$ 3.000
- APIs externas: R$ 2.000
- Analytics: R$ 1.500
- Backup/Segurança: R$ 1.500

### Marketing & Growth (R$ 12.000)

- SEO/Performance: R$ 5.000
- Content/Analytics: R$ 4.000
- Suporte inicial: R$ 3.000

**Total Investimento: R$ 65.000 + R$ 8.000/mês**

## Métricas de Sucesso

### KPIs Técnicos

- **Performance**: < 3s load time
- **Uptime**: 99.9% disponibilidade
- **SEO**: Top 3 posições Google "energia solar empresa"

### KPIs de Negócio

- **Conversão**: 25% aumento taxa conversão
- **Engajamento**: 40% redução bounce rate
- **Retenção**: 60% clientes recorrentes

### KPIs de Usuário

- **Satisfação**: NPS > 8.0
- **Usabilidade**: Task completion > 90%
- **Eficiência**: 50% redução tempo tarefas

## Riscos e Mitigação

### Riscos Técnicos

- **Complexidade IA**: Mitigação - Prototipagem incremental
- **Integração APIs**: Mitigação - Testes automatizados
- **Performance**: Mitigação - Otimização contínua

### Riscos de Negócio

- **Adoção Usuários**: Mitigação - Beta testing com clientes
- **Concorrência**: Mitigação - Diferenciação por IA
- **Regulatório**: Mitigação - Compliance PRODIST integrado

## Conclusão

Esta proposta transforma o YSH de uma plataforma fragmentada em uma experiência unificada de serviços solares B2B. Ao migrar e integrar os módulos existentes do storefront, criamos uma jornada completa que vai desde a descoberta até a operação, com IA avançada guiando cada etapa.

A arquitetura modular permite evolução contínua, enquanto a experiência unificada aumenta conversão e satisfação do cliente. O investimento é justificado pelo ROI esperado e pela posição competitiva que estabelece no mercado brasileiro de energia solar.

**Próximos Passos Recomendados:**

1. Aprovação do escopo e orçamento
2. Kickoff com equipe técnica
3. Desenvolvimento do MVP (calculadora + dimensionamento)
4. Validação com usuários beta
5. Lançamento completo

---

*Proposta preparada por GitHub Copilot - Outubro 2025*
