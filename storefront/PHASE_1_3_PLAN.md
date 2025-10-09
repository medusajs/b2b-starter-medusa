# Phase 1.3 - Accessibility Improvements Plan

**Date:** October 8, 2025  
**Status:** 🔄 IN PROGRESS  
**Goal:** Atingir score 90+ em auditoria de acessibilidade

---

## 🎯 Objectives

1. **Adicionar aria-labels** a botões sem texto visível
2. **Corrigir labels de formulários** - associar todos inputs com labels
3. **Implementar skip links** - navegação rápida para conteúdo principal
4. **Preparar para testes com screen readers** - landmarks semânticos

---

## 📋 Tasks

### Priority 1: Skip Links (WCAG 2.4.1) ✅

- [x] Adicionar skip link no layout principal
- [x] Skip to main content
- [x] Skip to navigation
- [x] Estilização acessível (visível no focus)

### Priority 2: Aria-labels (WCAG 4.1.2) 🔄

- [ ] Botões de fechar modais
- [ ] Botões de navegação sem texto
- [ ] Ícones interativos
- [ ] Botões de ação (editar, deletar, etc)

### Priority 3: Form Labels (WCAG 3.3.2) 🔄

- [ ] CreditSimulator inputs (12 campos)
- [ ] DimensionamentoClient inputs (6 campos)
- [ ] Onboarding steps inputs
- [ ] Quote forms inputs

### Priority 4: Landmarks Semânticos (WCAG 1.3.1) 🔄

- [ ] `<header>` para cabeçalho
- [ ] `<nav>` para navegação
- [ ] `<main>` para conteúdo principal
- [ ] `<aside>` para sidebar
- [ ] `<footer>` para rodapé

### Priority 5: Screen Reader Preparation 🔜

- [ ] Live regions para toasts (aria-live)
- [ ] Focus management em modais
- [ ] Títulos de página descritivos
- [ ] Alt text para imagens

---

## 🚀 Implementation Strategy

### 1. Skip Links Component

```tsx
// components/SkipLinks.tsx
<div className="skip-links">
  <a href="#main-content" className="skip-link">
    Pular para conteúdo principal
  </a>
  <a href="#navigation" className="skip-link">
    Pular para navegação
  </a>
</div>

// CSS
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  z-index: 100;
}
.skip-link:focus {
  top: 0;
}
```

### 2. Aria-labels Pattern

```tsx
// Antes
<button onClick={close}>
  <X />
</button>

// Depois
<button onClick={close} aria-label="Fechar modal">
  <X />
</button>
```

### 3. Form Labels Pattern

```tsx
// Antes
<input
  type="text"
  placeholder="CEP"
  value={cep}
/>

// Depois
<label htmlFor="cep-input" className="sr-only">CEP</label>
<input
  id="cep-input"
  type="text"
  placeholder="CEP"
  value={cep}
  aria-label="Código postal"
/>
```

### 4. Landmarks Pattern

```tsx
// layout.tsx
<body>
  <SkipLinks />
  <header id="navigation">...</header>
  <main id="main-content">...</main>
  <footer>...</footer>
</body>
```

---

## 📊 Files to Modify

### High Priority

1. `src/app/layout.tsx` - Skip links
2. `src/modules/layout/components/side-menu/index.tsx` - Close button aria-label
3. `src/modules/common/components/modal/index.tsx` - Close button aria-label
4. `src/modules/finance/components/CreditSimulator.tsx` - 12 input labels
5. `src/modules/onboarding/components/DimensionamentoClient.tsx` - 6 input labels

### Medium Priority

6. `src/modules/products/components/product-actions/mobile-actions.tsx` - Close button
7. `src/modules/onboarding/components/steps/*.tsx` - Form inputs
8. `src/modules/quotes/components/QuoteForm.tsx` - Form inputs
9. `src/modules/tariffs/components/TariffClassifier.tsx` - Form inputs

### Low Priority

10. All buttons with only icons
11. Image alt texts
12. Focus trap in modals

---

## 🎨 Screen-Reader Only Class

```css
/* globals.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

## ✅ Success Criteria

- [ ] Zero WCAG violations (level AA)
- [ ] All interactive elements keyboard accessible
- [ ] All forms have proper labels
- [ ] Skip links functional
- [ ] Screen reader navigation smooth
- [ ] Focus indicators visible
- [ ] Color contrast ratio > 4.5:1

---

## 🧪 Testing Plan

### Automated Testing

- [ ] axe DevTools audit
- [ ] Lighthouse accessibility score
- [ ] WAVE evaluation

### Manual Testing

- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader testing (NVDA/JAWS)
- [ ] Focus indicators visibility
- [ ] Skip links functionality

### Browser Testing

- [ ] Chrome + ChromeVox
- [ ] Firefox + NVDA
- [ ] Safari + VoiceOver
- [ ] Edge + Narrator

---

**Next Step:** Implementar skip links e aria-labels críticos
