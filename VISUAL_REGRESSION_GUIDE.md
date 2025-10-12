# 🎨 Visual Regression Testing Guide - Storybook + Chromatic

**Versão**: 1.0.0  
**Data**: 12 de Outubro, 2025  
**Status**: ✅ Setup Completo

---

## 📋 Visão Geral

**Storybook** permite desenvolver e testar componentes isoladamente.  
**Chromatic** captura snapshots visuais e detecta mudanças automaticamente.

### Stack

- **Storybook 8**: Component explorer
- **Chromatic**: Visual regression testing SaaS
- **React 19**: UI library
- **Next.js 15**: App Router support
- **Tailwind CSS**: Styling

---

## 🚀 Quick Start

### 1. Instalar Dependências

```powershell
cd storefront

# Storybook já está instalado, mas para referência:
# npx storybook@latest init

# Install Chromatic
npm install --save-dev chromatic
```

### 2. Rodar Storybook Localmente

```powershell
cd storefront
npm run storybook
# Abre em http://localhost:6006
```

### 3. Build Storybook

```powershell
npm run build-storybook
# Output: storybook-static/
```

### 4. Publicar no Chromatic

```powershell
# Primeira vez: fazer login
npx chromatic --project-token=<YOUR_PROJECT_TOKEN>

# Builds subsequentes
npm run chromatic
```

---

## 📁 Estrutura de Stories

### Padrão de Arquivos

```tsx
src/
├── components/
│   ├── ConsentBanner.tsx
│   └── ConsentBanner.stories.tsx      # ← Story file
├── modules/
│   └── catalog/
│       └── components/
│           ├── ProductCard.tsx
│           └── ProductCard.stories.tsx # ← Story file
```

### Nomenclatura

- **Component**: `ComponentName.tsx`
- **Story**: `ComponentName.stories.tsx`
- **Tests**: `ComponentName.test.tsx`

---

## 🎯 Criando Stories

### 1. ProductCard Story

```tsx
// src/modules/catalog/components/ProductCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import ProductCard from './ProductCard'

const meta = {
  title: 'Catalog/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    price: { control: 'number' },
    imageUrl: { control: 'text' },
  },
} satisfies Meta<typeof ProductCard>

export default meta
type Story = StoryObj<typeof meta>

// Default story
export const Default: Story = {
  args: {
    id: 'prod_test',
    title: 'Painel Solar 550W',
    handle: 'painel-solar-550w',
    thumbnail: 'https://via.placeholder.com/300',
    price: {
      calculated_price: {
        calculated_amount: 85000, // R$ 850
        currency_code: 'BRL'
      }
    },
    blurDataURL: 'data:image/svg+xml;base64,...'
  },
}

// A/B Test Variant A
export const VariantA: Story = {
  args: {
    ...Default.args,
    // CTA will show "Ver Detalhes" (variant A)
  },
  parameters: {
    docs: {
      description: {
        story: 'A/B Test: CTA text variant A - "Ver Detalhes"',
      },
    },
  },
}

// A/B Test Variant B
export const VariantB: Story = {
  args: {
    ...Default.args,
    // CTA will show "Explorar Produto" (variant B)
  },
  parameters: {
    docs: {
      description: {
        story: 'A/B Test: CTA text variant B - "Explorar Produto"',
      },
    },
  },
}

// Loading State
export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
}

// No Image
export const NoImage: Story = {
  args: {
    ...Default.args,
    thumbnail: undefined,
  },
}

// Long Title
export const LongTitle: Story = {
  args: {
    ...Default.args,
    title: 'Painel Solar Fotovoltaico de Alta Eficiência 550W com Tecnologia PERC Monocristalino',
  },
}

// High Price
export const HighPrice: Story = {
  args: {
    ...Default.args,
    price: {
      calculated_price: {
        calculated_amount: 1200000, // R$ 12,000
        currency_code: 'BRL'
      }
    },
  },
}

// With Discount
export const WithDiscount: Story = {
  args: {
    ...Default.args,
    price: {
      calculated_price: {
        calculated_amount: 72250, // R$ 722.50
        currency_code: 'BRL'
      },
      original_price: {
        amount: 85000, // R$ 850
        currency_code: 'BRL'
      }
    },
  },
}
```

---

### 2. ConsentBanner Story

```tsx
// src/components/ConsentBanner.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import ConsentBanner from './ConsentBanner'

const meta = {
  title: 'Compliance/ConsentBanner',
  component: ConsentBanner,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'light',
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConsentBanner>

export default meta
type Story = StoryObj<typeof meta>

// Default (first visit)
export const FirstVisit: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Banner shown on first visit before user consents',
      },
    },
  },
}

// After Accepting All
export const AfterAcceptAll: Story = {
  decorators: [
    (Story) => {
      // Mock cookies
      if (typeof window !== 'undefined') {
        localStorage.setItem('consent', JSON.stringify({
          necessary: true,
          analytics: true,
          marketing: true,
          functional: true
        }))
      }
      return <Story />
    },
  ],
}

// After Rejecting Non-essential
export const AfterRejectNonEssential: Story = {
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('consent', JSON.stringify({
          necessary: true,
          analytics: false,
          marketing: false,
          functional: false
        }))
      }
      return <Story />
    },
  ],
}

// Detailed View (Manage Cookies)
export const DetailedView: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const manageBtn = canvas.getByText('Gerenciar Cookies')
    await userEvent.click(manageBtn)
  },
}
```

---

### 3. WebVitals Story (Instrumentation)

```tsx
// src/components/WebVitals.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import WebVitals from './WebVitals'

const meta = {
  title: 'Analytics/WebVitals',
  component: WebVitals,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof WebVitals>

export default meta
type Story = StoryObj<typeof meta>

// Default (monitoring active)
export const Monitoring: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Web Vitals monitoring component (invisible to users)',
      },
    },
  },
}

// With Mock Metrics
export const WithMockMetrics: Story = {
  decorators: [
    (Story) => {
      // Mock performance observer
      if (typeof window !== 'undefined') {
        window.mockWebVitals = {
          LCP: 1250,
          INP: 85,
          CLS: 0.05,
          TTFB: 320,
          FCP: 890
        }
      }
      return <Story />
    },
  ],
}
```

---

## 🔧 Configuração Chromatic

### Setup Inicial

1. **Criar conta**: <https://www.chromatic.com/start>
2. **Conectar repo**: Link GitHub repo `own-boldsbrain/ysh-b2b`
3. **Obter token**: Project Settings → Manage → Reveal project token

### Variáveis de Ambiente

```powershell
# .env.local (storefront)
CHROMATIC_PROJECT_TOKEN=chpt_xxxxxxxxxxxxx
```

### GitHub Secrets

```powershell
# Adicionar no GitHub repo
gh secret set CHROMATIC_PROJECT_TOKEN --body "chpt_xxxxx"
gh secret set NODERED_WEBHOOK_URL --body "http://YOUR_NODERED_URL"
```

---

## 🎨 Baseline & Snapshots

### Primeira Publicação (Baseline)

```powershell
cd storefront
npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN

# Output:
# ✅ Build 1 published
# 📸 23 snapshots captured
# 🎯 Baseline created
```

### Builds Subsequentes

```powershell
# Detecta mudanças automaticamente
npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN

# Output se houver mudanças:
# ⚠️  Build 2 published with 3 changes
# 🔍 Review changes at https://chromatic.com/build?appId=...
```

### Auto-aceitar em Main Branch

```yaml
# .github/workflows/visual-regression.yml
- name: Publish to Chromatic
  uses: chromaui/action@latest
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    autoAcceptChanges: main  # ← Auto-approve snapshots em main
```

---

## 🔍 Review Workflow

### 1. Desenvolvedor abre PR

```powershell
git checkout -b feature/new-button-style
# ... faz mudanças em ProductCard.tsx ...
git commit -m "feat: update button styles"
git push origin feature/new-button-style
```

### 2. GitHub Actions roda Chromatic

```yaml
# Workflow dispara automaticamente
pull_request:
  branches: [main]
  paths:
    - 'storefront/src/components/**'
```

### 3. Chromatic detecta mudanças visuais

**Output no PR**:
> 🎨 **Chromatic**: 3 visual changes detected  
> 📸 [Review snapshots →](https://chromatic.com/build?appId=...)

### 4. Tech Lead revisa snapshots

1. Clica link no PR
2. Vê side-by-side: Before vs After
3. Aceita ou rejeita mudanças

**Se aceitar**: Build passa, merge liberado  
**Se rejeitar**: Developer precisa ajustar

---

## 📊 Métricas & Reports

### Chromatic Dashboard

**URL**: <https://www.chromatic.com/builds?appId=YOUR_APP_ID>

**Métricas disponíveis**:

- 📸 Total snapshots
- ✅ Accepted changes
- ⏱️ Build duration
- 📈 Snapshot coverage trend

### Integração com Node-RED

**Flow**: Após Chromatic build

```javascript
// Node-RED function node
const chromaticOutput = msg.payload;

// Parse Chromatic CLI output
const buildIdMatch = chromaticOutput.match(/Build (\d+) published/);
const changesMatch = chromaticOutput.match(/(\d+) changes/);

msg.chromatic = {
    buildId: buildIdMatch ? buildIdMatch[1] : null,
    changes: changesMatch ? parseInt(changesMatch[1]) : 0,
    url: `https://chromatic.com/build?appId=${env.CHROMATIC_APP_ID}&number=${buildIdMatch[1]}`
};

// Send to MQTT
msg.topic = 'ysh/visual/snapshot-diff';
return msg;
```

---

## 🚨 Alertas & Notificações

### Slack Alert (via Node-RED)

```javascript
// Quando houver mudanças visuais
if (msg.chromatic.changes > 0) {
    msg.payload = {
        text: `⚠️ Visual Regression Alert`,
        attachments: [{
            color: 'warning',
            title: `${msg.chromatic.changes} visual changes detected`,
            text: `Review snapshots before merging`,
            actions: [{
                type: 'button',
                text: 'Review Snapshots',
                url: msg.chromatic.url
            }]
        }]
    };
    return msg;
}
```

---

## 🎓 Best Practices

### 1. **Snapshot Coverage**

- ✅ Testar todos os states (default, loading, error, empty)
- ✅ Testar breakpoints (mobile, tablet, desktop)
- ✅ Testar variantes A/B
- ✅ Testar dark mode (se aplicável)

### 2. **Story Organization**

```
src/
├── components/           # Shared components
│   ├── ConsentBanner/
│   │   ├── index.tsx
│   │   ├── ConsentBanner.stories.tsx
│   │   └── ConsentBanner.test.tsx
│   └── WebVitals/
│       ├── index.tsx
│       └── WebVitals.stories.tsx
├── modules/              # Feature modules
│   └── catalog/
│       └── components/
│           ├── ProductCard/
│           │   ├── index.tsx
│           │   ├── ProductCard.stories.tsx
│           │   └── ProductCard.test.tsx
```

### 3. **Chromatic Configuration**

```json
// package.json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "chromatic": "npx chromatic --exit-zero-on-changes --auto-accept-changes main"
  }
}
```

### 4. **CI/CD Integration**

- ✅ Rodar Chromatic em **TODOS** os PRs
- ✅ Auto-aceitar snapshots em branch `main`
- ✅ Bloquear merge se houver mudanças não revisadas
- ✅ Notificar equipe via Slack/Email

---

## 🔧 Troubleshooting

### Chromatic build falha

```powershell
# Verificar token
echo $env:CHROMATIC_PROJECT_TOKEN

# Rodar localmente com verbose
npx chromatic --project-token=$CHROMATIC_PROJECT_TOKEN --debug
```

### Snapshots inconsistentes

**Problema**: Fonts, images loading dinamicamente

**Solução**: Usar `loaders` em stories

```tsx
export const Default: Story = {
  loaders: [
    async () => ({
      image: await fetch('https://api.example.com/image').then(r => r.blob())
    }),
  ],
  render: (args, { loaded: { image } }) => (
    <ProductCard {...args} image={image} />
  ),
}
```

### Muitos false positives

**Problema**: Animações, transições causam diffs

**Solução**: Desabilitar animações em Storybook

```tsx
// .storybook/preview.ts
export const parameters = {
  chromatic: {
    disableSnapshot: false,
    pauseAnimationAtEnd: true, // ← Pausa animações
  },
}
```

---

## 📚 Recursos

- **Storybook Docs**: <https://storybook.js.org/docs/react/get-started/introduction>
- **Chromatic Docs**: <https://www.chromatic.com/docs/>
- **Next.js + Storybook**: <https://storybook.js.org/recipes/@storybook/nextjs>
- **Visual Testing Guide**: <https://storybook.js.org/docs/react/writing-tests/visual-testing>

---

## ✅ Checklist

- [x] Storybook instalado e configurado
- [x] Stories criadas para componentes principais
- [x] Chromatic configurado
- [x] GitHub Actions workflow criado
- [x] Baseline snapshots capturados
- [ ] Treinar equipe em review de snapshots
- [ ] Integrar com Node-RED dashboard
- [ ] Setup alertas Slack/Email

---

**Status**: ✅ Visual Regression Testing pronto para uso!

**Próximos Passos**:

1. Criar stories para mais componentes
2. Testar dark mode (se aplicável)
3. Adicionar Interaction tests com `@storybook/test`
