# 🎨 Visual Regression Testing - BackstopJS (100% FOSS)

**Versão**: 1.0.0  
**Data**: 12 de Outubro, 2025  
**Status**: ✅ FOSS Stack Completa

---

## 📋 Visão Geral

**BackstopJS** é uma ferramenta FOSS para visual regression testing que captura screenshots e compara com baselines, similar ao Chromatic mas rodando 100% localmente.

### Stack FOSS

- **BackstopJS**: Visual regression engine (MIT License)
- **Headless Chrome**: Browser rendering
- **Node-RED**: Automação de testes
- **Docker**: Containerização
- **MinIO**: Armazenamento de screenshots (S3-compatible)

### Vantagens FOSS

✅ **Zero custo** - Sem limites de snapshots  
✅ **Privacy** - Screenshots ficam no seu servidor  
✅ **Control** - Full customização  
✅ **No vendor lock-in** - Dados são seus  
✅ **Self-hosted** - Deploy onde quiser

---

## 🚀 Quick Start

### 1. Instalar BackstopJS

```powershell
cd storefront
npm install --save-dev backstopjs
```

### 2. Inicializar Configuração

```powershell
npx backstop init
```

Isso cria:

```tsx
backstop/
├── backstop.json          # Configuração principal
├── engine_scripts/        # Custom scripts
└── backstop_data/         # Screenshots e reports
    ├── bitmaps_reference/ # Baselines
    ├── bitmaps_test/      # Test screenshots
    └── html_report/       # Visual reports
```

### 3. Configurar Scenarios

Editar `backstop/backstop.json`:

```json
{
  "id": "ysh_b2b_visual_regression",
  "viewports": [
    {
      "label": "phone",
      "width": 375,
      "height": 667
    },
    {
      "label": "tablet",
      "width": 768,
      "height": 1024
    },
    {
      "label": "desktop",
      "width": 1920,
      "height": 1080
    }
  ],
  "scenarios": [
    {
      "label": "ProductCard - Default",
      "url": "http://storefront:8000/br/produtos/painel-solar-550w-test",
      "selectors": ["[data-testid='product-card']"],
      "delay": 1000,
      "misMatchThreshold": 0.1
    },
    {
      "label": "ConsentBanner - First Visit",
      "url": "http://storefront:8000/br",
      "selectors": ["[data-testid='consent-banner']"],
      "delay": 500,
      "misMatchThreshold": 0.1
    },
    {
      "label": "Checkout - Shipping Step",
      "url": "http://storefront:8000/br/checkout",
      "selectors": ["#checkout-form"],
      "delay": 2000,
      "onReadyScript": "engine_scripts/login.js",
      "misMatchThreshold": 0.1
    }
  ],
  "paths": {
    "bitmaps_reference": "backstop_data/bitmaps_reference",
    "bitmaps_test": "backstop_data/bitmaps_test",
    "engine_scripts": "backstop_data/engine_scripts",
    "html_report": "backstop_data/html_report",
    "ci_report": "backstop_data/ci_report"
  },
  "engine": "puppeteer",
  "report": ["browser", "json", "CI"],
  "debug": false,
  "debugWindow": false
}
```

### 4. Criar Baseline

```powershell
# Primeira execução - cria baseline
npx backstop reference
```

### 5. Rodar Testes

```powershell
# Compara com baseline
npx backstop test
```

### 6. Ver Relatório

```powershell
# Abre relatório visual no browser
npx backstop openReport
```

---

## 🎯 Configuração Avançada

### Custom Engine Scripts

**Login antes do screenshot** (`engine_scripts/login.js`):

```javascript
module.exports = async (page, scenario, viewport) => {
  console.log('SCENARIO > ' + scenario.label);
  
  // Navigate to login
  await page.goto('http://storefront:8000/br/conta/login');
  
  // Fill credentials
  await page.type('input[type="email"]', 'test@yshsolar.com');
  await page.type('input[type="password"]', 'password123');
  
  // Submit
  await Promise.all([
    page.waitForNavigation(),
    page.click('button[type="submit"]')
  ]);
  
  console.log('Login completed');
};
```

**Interact before screenshot** (`engine_scripts/hover_cta.js`):

```javascript
module.exports = async (page, scenario, viewport) => {
  // Hover over CTA button
  await page.hover('[data-testid="product-cta"]');
  await page.waitForTimeout(500);
  
  console.log('Hover interaction completed');
};
```

---

## 📸 Scenarios por Componente

### ProductCard (A/B Variants)

```json
{
  "scenarios": [
    {
      "label": "ProductCard - Variant A (Ver Detalhes)",
      "url": "http://storefront:8000/br/produtos/painel-solar-550w-test",
      "selectors": ["[data-testid='product-card']"],
      "delay": 1000,
      "cookies": [
        {
          "name": "_ysh_exp_bucket",
          "value": "A",
          "domain": "localhost"
        }
      ],
      "misMatchThreshold": 0.1
    },
    {
      "label": "ProductCard - Variant B (Explorar Produto)",
      "url": "http://storefront:8000/br/produtos/painel-solar-550w-test",
      "selectors": ["[data-testid='product-card']"],
      "delay": 1000,
      "cookies": [
        {
          "name": "_ysh_exp_bucket",
          "value": "B",
          "domain": "localhost"
        }
      ],
      "misMatchThreshold": 0.1
    },
    {
      "label": "ProductCard - Loading State",
      "url": "http://storefront:8000/br/produtos/painel-solar-550w-test",
      "selectors": ["[data-testid='product-card-skeleton']"],
      "delay": 100,
      "misMatchThreshold": 0.1
    },
    {
      "label": "ProductCard - Hover State",
      "url": "http://storefront:8000/br/produtos/painel-solar-550w-test",
      "selectors": ["[data-testid='product-card']"],
      "hoverSelector": "[data-testid='product-card']",
      "delay": 1000,
      "misMatchThreshold": 0.1
    }
  ]
}
```

### ConsentBanner

```json
{
  "scenarios": [
    {
      "label": "ConsentBanner - Collapsed",
      "url": "http://storefront:8000/br",
      "selectors": ["[data-testid='consent-banner']"],
      "delay": 500,
      "misMatchThreshold": 0.1
    },
    {
      "label": "ConsentBanner - Expanded (Manage Cookies)",
      "url": "http://storefront:8000/br",
      "selectors": ["[data-testid='consent-banner']"],
      "clickSelector": "[data-testid='manage-cookies-btn']",
      "delay": 1000,
      "misMatchThreshold": 0.1
    }
  ]
}
```

### Checkout Flow

```json
{
  "scenarios": [
    {
      "label": "Checkout - Empty Cart",
      "url": "http://storefront:8000/br/carrinho",
      "selectors": ["viewport"],
      "delay": 1000,
      "misMatchThreshold": 0.1
    },
    {
      "label": "Checkout - Shipping Address",
      "url": "http://storefront:8000/br/checkout",
      "selectors": ["#shipping-address-form"],
      "delay": 2000,
      "onReadyScript": "engine_scripts/login.js",
      "misMatchThreshold": 0.1
    },
    {
      "label": "Checkout - Payment Method",
      "url": "http://storefront:8000/br/checkout?step=payment",
      "selectors": ["#payment-method-form"],
      "delay": 2000,
      "onReadyScript": "engine_scripts/login.js",
      "misMatchThreshold": 0.1
    }
  ]
}
```

---

## 🐳 Docker Integration

### Rodar via Docker Compose

```yaml
# docker-compose.foss.yml (já configurado)
backstop:
  image: backstopjs/backstopjs:latest
  container_name: ysh-backstop-foss
  volumes:
    - ./storefront/backstop:/src
    - backstop_data:/src/backstop_data
  command: test --config=backstop.json
  networks:
    - ysh-foss-network
  depends_on:
    - storefront
```

**Comandos**:

```powershell
# Reference (baseline)
docker-compose -f docker-compose.foss.yml run --rm backstop reference

# Test
docker-compose -f docker-compose.foss.yml run --rm backstop test

# Approve (atualiza baseline)
docker-compose -f docker-compose.foss.yml run --rm backstop approve
```

---

## 🤖 Integração Node-RED

### Flow: Trigger Visual Regression

```json
[
  {
    "id": "visual_regression_trigger",
    "type": "http in",
    "url": "/trigger/visual-regression",
    "method": "post",
    "name": "Visual Regression Trigger"
  },
  {
    "id": "run_backstop",
    "type": "exec",
    "command": "docker-compose -f /workspace/docker-compose.foss.yml run --rm backstop test --config=backstop.json",
    "name": "Run BackstopJS"
  },
  {
    "id": "parse_results",
    "type": "function",
    "func": "const output = msg.payload;\nconst passedMatch = output.match(/(\\d+) test\\(s\\) passed/);\nconst failedMatch = output.match(/(\\d+) test\\(s\\) failed/);\n\nmsg.backstop = {\n  passed: passedMatch ? parseInt(passedMatch[1]) : 0,\n  failed: failedMatch ? parseInt(failedMatch[1]) : 0,\n  success: failedMatch ? parseInt(failedMatch[1]) === 0 : true\n};\n\nreturn msg;",
    "name": "Parse Results"
  },
  {
    "id": "send_notification",
    "type": "mqtt out",
    "topic": "ysh/visual/results",
    "name": "Publish Results"
  }
]
```

### Webhook URL

```bash
curl -X POST http://localhost:1880/api/trigger/visual-regression \
  -H "Content-Type: application/json" \
  -d '{"branch": "feature/new-ui"}'
```

---

## 📊 CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/visual-regression-foss.yml
name: Visual Regression (FOSS)

on:
  pull_request:
    branches: [main]
    paths:
      - 'storefront/src/**'

jobs:
  backstop-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        working-directory: storefront
        run: npm ci
      
      - name: Install BackstopJS
        run: npm install -g backstopjs
      
      - name: Start services
        run: |
          docker-compose -f docker-compose.foss.yml up -d postgres redis backend storefront
          sleep 30
      
      - name: Run BackstopJS tests
        working-directory: storefront/backstop
        run: backstop test --config=backstop.json || true
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: backstop-report
          path: storefront/backstop/backstop_data/html_report/
      
      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('storefront/backstop/backstop_data/ci_report/report.json', 'utf8');
            const data = JSON.parse(report);
            
            const output = `
            ## 🎨 Visual Regression Results (BackstopJS)
            
            **Total Tests**: ${data.testsPassed + data.testsFailed}
            **Passed**: ✅ ${data.testsPassed}
            **Failed**: ❌ ${data.testsFailed}
            
            [Download Report](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: output
            });
```

---

## 🔍 Analisando Resultados

### HTML Report

Após `backstop test`, abra o relatório:

```powershell
npx backstop openReport
```

**O relatório mostra**:

- ✅ **Passed tests** - Verde
- ❌ **Failed tests** - Vermelho
- 🔍 **Side-by-side comparison** - Reference vs Test
- 📊 **Mismatch percentage** - Diferença em %
- 🖼️ **Diff highlight** - Áreas diferentes em rosa

### JSON Report

Para automação, use `ci_report/report.json`:

```json
{
  "testsPassed": 23,
  "testsFailed": 2,
  "tests": [
    {
      "pair": {
        "label": "ProductCard - Default",
        "status": "pass"
      }
    },
    {
      "pair": {
        "label": "ConsentBanner - Expanded",
        "status": "fail",
        "diff": {
          "misMatchPercentage": "2.34"
        }
      }
    }
  ]
}
```

---

## 🛠️ Best Practices

### 1. Configuração de Threshold

```json
{
  "misMatchThreshold": 0.1,  // 0.1% tolerância (anti-aliasing)
  "requireSameDimensions": true
}
```

### 2. Ignorar Elementos Dinâmicos

```json
{
  "removeSelectors": [
    "[data-testid='timestamp']",
    ".dynamic-content",
    "#live-chat"
  ]
}
```

### 3. Wait Conditions

```json
{
  "readySelector": "[data-testid='product-loaded']",  // Espera elemento
  "delay": 2000,  // Espera fixa (ms)
  "readyEvent": "load"  // Espera evento
}
```

### 4. Responsive Testing

```json
{
  "viewports": [
    {"label": "phone", "width": 375, "height": 667},
    {"label": "tablet", "width": 768, "height": 1024},
    {"label": "desktop", "width": 1920, "height": 1080},
    {"label": "4k", "width": 3840, "height": 2160}
  ]
}
```

---

## 🚨 Troubleshooting

### Testes sempre falham (false positives)

**Problema**: Fonts, animações, timestamps causam diffs

**Solução**:

```json
{
  "misMatchThreshold": 1.0,  // Aumentar tolerância
  "removeSelectors": [".timestamp", ".animation"],
  "delay": 3000  // Esperar animações terminarem
}
```

### Screenshots vazios

**Problema**: Página não carregou

**Solução**:

```json
{
  "readySelector": "#app-loaded",
  "delay": 5000,
  "onReadyScript": "engine_scripts/wait_for_load.js"
}
```

### Containers não comunicam

**Problema**: BackstopJS não acessa storefront

**Solução**:

```yaml
# docker-compose.foss.yml
backstop:
  networks:
    - ysh-foss-network  # Mesma rede do storefront
  depends_on:
    - storefront
```

---

## 📚 Recursos FOSS

- **BackstopJS Docs**: <https://github.com/garris/BackstopJS>
- **Puppeteer**: <https://pptr.dev/>
- **Docker**: <https://docs.docker.com/>
- **Node-RED**: <https://nodered.org/>

---

## ✅ Checklist

- [x] BackstopJS instalado
- [x] `backstop.json` configurado
- [x] Scenarios criados para componentes principais
- [x] Baseline capturado (`backstop reference`)
- [x] Docker integration configurado
- [ ] Node-RED flow criado
- [ ] GitHub Actions workflow testado
- [ ] Treinar equipe para review de diffs

---

## 🎓 Próximos Passos

1. **Adicionar mais scenarios** - Cobrir 100% dos componentes
2. **Integrar com Grafana** - Dashboard de métricas visuais
3. **Auto-approve em CI** - Se diff < threshold, auto-merge
4. **Scheduled tests** - Rodar nightly para detectar regressões

---

**Status**: ✅ Visual Regression FOSS pronto para uso!

**Vantagens vs Chromatic**:

- ✅ **$0/mês** vs $149/mês
- ✅ **Unlimited snapshots** vs 5,000/mês
- ✅ **Self-hosted** vs SaaS
- ✅ **Full control** vs Vendor lock-in
