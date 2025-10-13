# Cross-Linking Audit - Solar Service Flows

## Audit Methodology

This audit examines cross-linking between solar operational modules to identify:

- Dead ends (pages with no clear next steps)
- Missing connections between related flows
- Opportunities for improved user journey continuity

## Current Flow Analysis

### Primary Solar Flow: Discover → Design → Finance → Manage

#### 1. Calculator (/dimensionamento) → Dimensioning Flow

**Current State**:

- Calculator provides results but limited CTAs
- No direct link to financing simulation
- Missing connection to technical proposals

**Issues Found**:

- Dead end after calculation (only "share" options)
- No path to financing for users ready to buy
- Missing link to detailed proposals

**Recommended Fixes**:

```tsx
// Add to calculator results page:
<CTASection>
  <PrimaryCTA href="/financiamento">Simular Financiamento</PrimaryCTA>
  <SecondaryCTA href="/proposta">Ver Proposta Detalhada</SecondaryCTA>
  <TertiaryCTA href="/cotacao">Adicionar à Cotação</TertiaryCTA>
</CTASection>
```

#### 2. Dimensioning (/dimensionamento) → Proposal Flow

**Current State**:

- Good connection to printable proposals
- Missing link to quote system
- No financing integration

**Issues Found**:

- Users can generate PDF but can't easily quote
- No financing context in proposals
- Missing connection back to catalog for additional items

**Recommended Fixes**:

```tsx
// Add cross-linking in dimensionamento results:
<Link href="/financiamento?data=${encodedData}">
  Simular Financiamento
</Link>
<Link href="/cotacao?data=${encodedData}">
  Adicionar à Lista de Cotação
</Link>
```

#### 3. Financing (/financiamento) → Quote Integration

**Current State**:

- Standalone financing simulation
- No connection to quote system
- Missing link back to dimensioning

**Issues Found**:

- Financing results don't integrate with quotes
- No way to save financing scenarios
- Missing connection to project management

**Recommended Fixes**:

```tsx
// Add to financing results:
<Button onClick={() => addToQuote(financingData)}>
  Incluir na Cotação
</Button>
<Link href="/manage/projects">
  Ver Meus Projetos
</Link>
```

### Secondary Flows: Support & Resources

#### 4. Support Pages → Main Flows

**Current State**:

- Support pages exist but are isolated
- No clear paths back to conversion flows
- Missing contextual help links

**Issues Found**:

- Users in support can't easily restart flows
- No "try again" or "start over" options
- Missing integration with live chat → sales

**Recommended Fixes**:

```tsx
// Add to support pages:
<QuickActions>
  <Link href="/dimensionamento">Refazer Dimensionamento</Link>
  <Link href="/financiamento">Simular Financiamento</Link>
  <Button onClick={() => startChat()}>Falar com Consultor</Button>
</QuickActions>
```

#### 5. Catalog → Operational Modules

**Current State**:

- Catalog links to individual products
- Missing integration with dimensioning
- No connection to quote system

**Issues Found**:

- Users can't easily add catalog items to quotes
- No "configure system" flow from catalog
- Missing technical specifications integration

**Recommended Fixes**:

```tsx
// Add to product pages:
<ContextualActions>
  <Button onClick={() => addToDimensioning(product)}>
    Usar no Dimensionamento
  </Button>
  <Button onClick={() => addToQuote(product)}>
    Adicionar à Cotação
  </Button>
</ContextualActions>
```

### Cross-Flow Opportunities

#### 6. Lifecycle Stage Transitions

**Missing Connections**:

- Post-calculation → financing awareness
- Pre-quote → dimensioning validation
- Post-financing → project management
- Maintenance → upgrade/expansion flows

**Recommended Implementation**:

```tsx
// Lifecycle-aware navigation component
const LifecycleNav = ({ currentStage, userData }) => {
  const stages = {
    discover: { next: 'design', cta: 'Dimensionar Sistema' },
    design: { next: 'finance', cta: 'Simular Financiamento' },
    finance: { next: 'manage', cta: 'Gerenciar Projeto' },
    manage: { next: 'support', cta: 'Suporte & Manutenção' }
  };
  
  return (
    <ProgressIndicator>
      {Object.entries(stages).map(([stage, config]) => (
        <Step 
          key={stage}
          active={stage === currentStage}
          completed={isCompleted(stage)}
          onClick={() => navigateToStage(stage)}
        >
          {config.cta}
        </Step>
      ))}
    </ProgressIndicator>
  );
};
```

#### 7. Contextual Help Integration

**Current Gaps**:

- No help links in complex forms
- Missing tooltips for technical terms
- No progressive disclosure for advanced options

**Recommended Fixes**:

```tsx
// Contextual help component
const ContextualHelp = ({ topic, position = 'inline' }) => {
  const helpContent = {
    'irradiacao': {
      title: 'Irradiação Solar',
      content: 'Medida da energia solar disponível em kWh/m²/dia',
      link: '/suporte/irradiacao'
    },
    'payback': {
      title: 'Payback',
      content: 'Tempo necessário para recuperar investimento',
      calculator: '/calculadora/payback'
    }
  };
  
  return (
    <HelpTooltip content={helpContent[topic]}>
      <Icon name="help" />
    </HelpTooltip>
  );
};
```

## Implementation Priority

### High Priority (Immediate Impact)

1. **Calculator → Financing Link**: Add financing CTA to calculator results
2. **Dimensioning → Quote Integration**: Connect proposals to quote system
3. **Financing → Project Management**: Link approved financing to project tracking

### Medium Priority (Journey Continuity)

4. **Support → Flow Restart**: Add "start over" options in support pages
5. **Catalog → Dimensioning**: Enable system configuration from catalog
6. **Lifecycle Navigation**: Implement progress indicators across flows

### Low Priority (Optimization)

7. **Contextual Help**: Add inline help for technical concepts
8. **Cross-sell Opportunities**: Suggest related products/services
9. **Social Proof Integration**: Show testimonials at conversion points

## Success Metrics

- **Conversion Funnel Completion**: Track drop-off rates between stages
- **Cross-link Click-through**: Measure usage of new cross-linking CTAs
- **User Journey Continuity**: Reduce dead ends and back-button usage
- **Support Ticket Reduction**: Fewer "how do I..." questions

## Technical Implementation

### Navigation Context Provider

```tsx
// Global navigation state
const NavigationContext = createContext({
  currentFlow: null,
  userProgress: {},
  crossLinks: {},
  updateProgress: () => {},
  navigateToFlow: () => {}
});
```

### Route-based Cross-linking

```tsx
// Route configuration with cross-links
const ROUTE_CONFIG = {
  '/dimensionamento': {
    next: ['/financiamento', '/proposta'],
    related: ['/suporte/dimensionamento'],
    prerequisites: []
  },
  '/financiamento': {
    next: ['/cotacao', '/manage/projects'],
    related: ['/suporte/financiamento'],
    prerequisites: ['/dimensionamento']
  }
};
```

This audit provides a roadmap for eliminating dead ends and creating seamless user journeys across the solar service ecosystem.
