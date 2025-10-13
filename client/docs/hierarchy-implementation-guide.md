# Consistent Hierarchy Implementation Guide

## Overview

This guide ensures that breadcrumbs, tab bars, and documentation all reflect the same locked Information Architecture (IA) defined in the navigation model. This maintains consistency between development and UX teams.

## Hierarchy Structure

### Primary Navigation (Top Level)

```
🏠 Home
├── 🔍 Descobrir (/discover)
├── 📐 Dimensionar (/design)
├── 💰 Financiar (/finance)
├── 📊 Gerenciar (/manage)
└── 🛠️ Suporte (/support)
```

### Secondary Navigation (By Section)

#### 🔍 Descobrir (/discover)

- Calculadora (/discover/calculator)
- Soluções (/discover/solutions)
- Viabilidade (/discover/viability)

#### 📐 Dimensionar (/design)

- Dimensionamento (/design/dimensioning)
- Propostas (/design/proposals)
- Análise CV (/design/cv)

#### 💰 Financiar (/finance)

- Simulação (/finance/simulation)
- Cotações (/finance/quotes)
- Incentivos (/finance/incentives)

#### 📊 Gerenciar (/manage)

- Projetos (/manage/projects)
- Contratos (/manage/contracts)
- Relatórios (/manage/reports)

#### 🛠️ Suporte (/support)

- Documentação (/support/docs)
- Manutenção (/support/maintenance)
- Contato (/support/contact)

## Implementation Patterns

### 1. Breadcrumb Usage

```tsx
// In any page component
import { generateBreadcrumbs } from '@/components/navigation/Breadcrumb'

export default function MyPage() {
  const breadcrumbs = generateBreadcrumbs('/discover/calculator')
  // Returns: [{label: "Descobrir", href: "/discover"}, {label: "Calculadora", current: true}]

  return (
    <div>
      <Breadcrumb items={breadcrumbs} />
      {/* Page content */}
    </div>
  )
}
```

### 2. Tab Bar Usage

```tsx
// In section layout or page
import { TabBar, getActiveTab } from '@/components/navigation/TabBar'

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  const activeTab = getActiveTab('/discover/calculator', 'discover')

  return (
    <div>
      <TabBar section="discover" activeTab={activeTab} />
      {children}
    </div>
  )
}
```

### 3. URL Structure Enforcement

All routes must follow the hierarchy:

```tsx
/discover/*     → 🔍 Descobrir section
/design/*       → 📐 Dimensionar section
/finance/*      → 💰 Financiar section
/manage/*       → 📊 Gerenciar section
/support/*      → 🛠️ Suporte section
```

### 4. Navigation Context Provider

```tsx
// _app.tsx or layout.tsx
import { NavigationProvider } from '@/contexts/NavigationContext'

export default function App({ Component, pageProps }) {
  return (
    <NavigationProvider>
      <Component {...pageProps} />
    </NavigationProvider>
  )
}
```

## Documentation Standards

### File Organization

```
docs/
├── navigation/
│   ├── hierarchy.md          # This file
│   ├── breadcrumbs.md        # Breadcrumb usage guide
│   └── tabs.md              # Tab bar implementation
├── sections/
│   ├── discover/
│   ├── design/
│   ├── finance/
│   ├── manage/
│   └── support/
└── components/
    ├── Breadcrumb.md
    └── TabBar.md
```

### Content Guidelines

- Always reference the hierarchy icons (🔍 📐 💰 📊 🛠️)
- Use consistent section names
- Include cross-references between related sections
- Document any deviations from the hierarchy

## Migration Checklist

### For Each Route

- [ ] Breadcrumb component implemented
- [ ] Tab bar shows correct active state
- [ ] URL follows hierarchy pattern
- [ ] Documentation updated
- [ ] Cross-links validated

### For Each Section

- [ ] Layout includes TabBar
- [ ] All sub-routes documented
- [ ] Navigation context integrated
- [ ] User testing completed

## Quality Assurance

### Automated Checks

```bash
# Run hierarchy validation
npm run validate:hierarchy

# Check for broken cross-links
npm run validate:crosslinks

# Verify breadcrumb consistency
npm run validate:breadcrumbs
```

### Manual Testing

1. Navigate each user journey
2. Verify breadcrumb accuracy
3. Test tab bar active states
4. Check cross-link functionality
5. Validate on mobile devices

## Future Changes

### Hierarchy Modification Process

1. Update PRIMARY_NAV in layout.tsx
2. Update HIERARCHY_MAP in Breadcrumb.tsx
3. Update TAB_HIERARCHY in TabBar.tsx
4. Update documentation
5. Run validation tests
6. User testing for changed sections

### Version Control

- Tag hierarchy changes: `hierarchy/v1.0`, `hierarchy/v1.1`, etc.
- Document changes in CHANGELOG.md
- Update migration guides for breaking changes

This ensures that as the application evolves, the navigation hierarchy remains consistent and predictable for both users and developers.
