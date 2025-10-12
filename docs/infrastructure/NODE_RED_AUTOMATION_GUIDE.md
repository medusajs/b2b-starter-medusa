# 🤖 Node-RED Automation Guide - YSH B2B Store

**Versão**: 1.0.0  
**Data**: 12 de Outubro, 2025  
**Status**: ✅ Implementado

---

## 📋 Visão Geral

Node-RED é usado como **automation engine** para orquestrar testes, monitoramento, e notificações no ambiente de desenvolvimento local. Ele substitui ferramentas pesadas de CI/CD local e permite automações visuais via flows.

### Componentes

- **Node-RED**: Engine de automação com UI visual
- **Mosquitto MQTT**: Message broker para comunicação entre flows
- **Docker**: Containers isolados e persistentes

---

## 🚀 Quick Start

### 1. Iniciar Stack Completa

```powershell
# Criar network (apenas primeira vez)
docker network create ysh-b2b-network

# Subir stack principal (postgres, redis, backend, storefront)
docker-compose up -d

# Subir Node-RED + MQTT
docker-compose -f docker-compose.node-red.yml up -d
```

### 2. Acessar Node-RED

```tsx
URL: http://localhost:1880
User: admin
Password: (definir no primeiro acesso)
```

### 3. Verificar Flows

- Dashboard: `http://localhost:1880/ui`
- Editor: `http://localhost:1880`
- MQTT: `mqtt://localhost:1883`

---

## 🔧 Arquitetura

### Flows Disponíveis

#### 1. **CI/CD Pipeline Flow**

- **Trigger**: Webhook POST `/trigger/ci`
- **Ações**:
  - Parseia payload do GitHub
  - Roda 71 testes E2E do Playwright
  - Parseia resultados JSON
  - Atualiza status no GitHub
  - Publica resultados no MQTT
  - Envia notificações

**Endpoint**:

```bash
curl -X POST http://localhost:1880/api/trigger/ci \
  -H "Content-Type: application/json" \
  -d '{
    "ref": "refs/heads/main",
    "after": "abc123",
    "sender": {"login": "developer"},
    "repository": {"full_name": "own-boldsbrain/ysh-b2b"}
  }'
```

#### 2. **Visual Regression Flow**

- **Trigger**: Webhook POST `/trigger/visual-regression`
- **Ações**:
  - Builda Storybook
  - Envia snapshots para Chromatic
  - Compara com baseline
  - Notifica diferenças visuais

**Endpoint**:

```bash
curl -X POST http://localhost:1880/api/trigger/visual-regression \
  -H "Content-Type: application/json" \
  -d '{"ref": "refs/heads/feature-branch"}'
```

#### 3. **Contract Testing Flow**

- **Trigger**: Webhook POST `/trigger/contract-test`
- **Ações**:
  - Roda testes Pact consumer (storefront)
  - Roda testes Pact provider (backend)
  - Publica contracts no Pact Broker
  - Verifica "can-i-deploy"

**Endpoint**:

```bash
curl -X POST http://localhost:1880/api/trigger/contract-test \
  -H "Content-Type: application/json" \
  -d '{"consumer": "storefront", "provider": "backend"}'
```

#### 4. **Monitoring & Alerts Flow**

- **MQTT Topics**:
  - `ysh/ci/test-results` - Resultados de testes
  - `ysh/visual/snapshot-diff` - Diferenças visuais
  - `ysh/contract/verification` - Status de contracts
- **Ações**:
  - Agrega métricas
  - Gera dashboard
  - Envia alertas (Slack, Email)

---

## 📦 Estrutura de Arquivos

```tsx
node-red/
├── flows/
│   └── flows.json              # Flows exportados (versionados)
├── mosquitto/
│   └── mosquitto.conf          # Config MQTT broker
└── settings.js                 # Configuração Node-RED

docker-compose.node-red.yml     # Docker Compose para Node-RED
```

---

## 🎯 Casos de Uso

### 1. Desenvolvimento Local - Auto-test ao salvar arquivo

**Setup**:

1. Instalar node `node-red-contrib-watch` no Node-RED
2. Criar flow:
   - **Watch Node**: Monitorar `storefront/src/**/*.tsx`
   - **Debounce**: 2 segundos
   - **Function**: Detectar qual componente mudou
   - **Exec**: `npm run test:unit -- <arquivo>.test.tsx`
   - **Notification**: Mostrar resultado

**Resultado**: Ao salvar `ProductCard.tsx`, roda testes unitários automaticamente.

---

### 2. PR Preview - Disparar testes ao abrir PR

**Setup**:

1. GitHub Webhook → Node-RED endpoint `/trigger/ci`
2. Node-RED flow:
   - Parse evento `pull_request.opened`
   - Checkout branch
   - Rodar testes E2E (71 tests)
   - Comentar no PR com resultados

**Resultado**: PR automaticamente recebe comentário com status dos testes.

---

### 3. Nightly Build - Testes completos overnight

**Setup**:

1. **Inject Node**: Cron `0 2 * * *` (2:00 AM)
2. **Function**: Preparar ambiente
3. **Exec Nodes**:
   - Build backend
   - Build storefront
   - Testes E2E (71)
   - Testes de carga (k6)
   - Visual regression (Chromatic)
4. **Email**: Relatório matinal

**Resultado**: Acordar com relatório completo de qualidade.

---

### 4. Deployment Safety - "Can I Deploy?" check

**Setup**:

1. **HTTP In**: `/api/can-i-deploy`
2. **Function**: Verificar:
   - ✅ Todos os testes passaram?
   - ✅ Contracts verificados?
   - ✅ Snapshots aprovados?
   - ✅ No linting errors?
3. **HTTP Response**: `200 OK` ou `400 BAD REQUEST`

**Resultado**: Deploy script consulta antes de fazer push para produção.

---

## 🔌 Integrações

### GitHub Actions → Node-RED

**Workflow** (`.github/workflows/e2e-tests.yml`):

```yaml
- name: Notify Node-RED
  run: |
    curl -X POST "${{ secrets.NODERED_WEBHOOK_URL }}/trigger/ci" \
      -H "Content-Type: application/json" \
      -d '{"status": "${{ job.status }}", "ref": "${{ github.ref }}"}'
```

**Node-RED Flow**:

```javascript
// Parse GitHub webhook
msg.github = {
    event: msg.req.headers['x-github-event'],
    ref: msg.payload.ref,
    status: msg.payload.status
};

// Determine action
if (msg.github.status === 'success') {
    msg.topic = 'ysh/ci/success';
} else {
    msg.topic = 'ysh/ci/failure';
    msg.payload = 'Tests failed! Check logs.';
}

return msg;
```

---

### Playwright → Node-RED

**Playwright Config** (`playwright.config.ts`):

```typescript
export default defineConfig({
  reporter: [
    ['json', { outputFile: 'test-results/results.json' }],
    ['html', { open: 'never' }]
  ]
});
```

**Node-RED Flow** (após testes):

```javascript
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('/workspace/test-results/results.json'));

msg.payload = {
    total: results.stats.tests,
    passed: results.stats.passes,
    failed: results.stats.failures,
    duration: results.stats.duration
};

msg.topic = 'ysh/tests/e2e';
return msg;
```

---

### Chromatic → Node-RED

**Chromatic CLI Output**:

```bash
npx chromatic --project-token=$TOKEN --exit-zero-on-changes > chromatic-output.log
```

**Node-RED Flow** (parse output):

```javascript
const output = msg.payload;
const regex = /Build (\d+) published.*(\d+) changes/;
const match = output.match(regex);

if (match) {
    msg.payload = {
        buildId: match[1],
        changes: parseInt(match[2])
    };
    msg.topic = 'ysh/visual/changes';
}

return msg;
```

---

### Pact Broker → Node-RED

**Pact CLI**:

```bash
npx pact-broker can-i-deploy \
  --pacticipant=ysh-storefront \
  --version=$SHA \
  --to-environment=production \
  --output=json > can-deploy.json
```

**Node-RED Flow**:

```javascript
const fs = require('fs');
const pactResult = JSON.parse(fs.readFileSync('/workspace/can-deploy.json'));

msg.payload = {
    canDeploy: pactResult.summary.deployable,
    reason: pactResult.summary.reason
};

msg.topic = 'ysh/pact/can-deploy';
return msg;
```

---

## 📊 Dashboard & Monitoring

### UI Dashboard Nodes

Instalar: `node-red-dashboard`

```bash
docker exec ysh-b2b-nodered npm install node-red-dashboard
```

**Dashboard URL**: `http://localhost:1880/ui`

### Widgets

1. **Test Status Gauge**
   - Tipo: Gauge
   - Range: 0-100%
   - Topic: `ysh/tests/coverage`

2. **Recent Test Results**
   - Tipo: Chart (Line)
   - X-axis: Time
   - Y-axis: Pass rate
   - Topic: `ysh/tests/history`

3. **Visual Changes Alert**
   - Tipo: Notification
   - Trigger: `ysh/visual/changes`
   - Message: "{{payload.changes}} visual changes detected"

4. **Contract Status**
   - Tipo: Text/LED
   - Topic: `ysh/pact/can-deploy`
   - Color: Green (deployable) / Red (blocked)

---

## 🔔 Notificações

### Slack Integration

**Node**: `node-red-node-slack`

```javascript
// Slack message format
msg.payload = {
    text: `🧪 E2E Tests ${msg.report.success ? 'PASSED ✅' : 'FAILED ❌'}`,
    attachments: [{
        color: msg.report.success ? 'good' : 'danger',
        fields: [
            { title: 'Total', value: msg.report.total, short: true },
            { title: 'Passed', value: msg.report.passed, short: true },
            { title: 'Failed', value: msg.report.failed, short: true },
            { title: 'Duration', value: `${msg.report.duration}ms`, short: true }
        ],
        footer: 'YSH B2B CI/CD',
        ts: Date.now() / 1000
    }]
};

return msg;
```

---

### Email Notifications

**Node**: `node-red-node-email`

```javascript
msg.to = 'dev-team@yshsolar.com';
msg.subject = `[CI/CD] ${msg.statusText} - ${msg.github.branch}`;
msg.payload = `
<html>
<body>
  <h2>Test Results for ${msg.github.branch}</h2>
  <p>Status: ${msg.statusIcon} ${msg.statusText}</p>
  <table>
    <tr><td>Total Tests:</td><td>${msg.report.total}</td></tr>
    <tr><td>Passed:</td><td style="color: green">${msg.report.passed}</td></tr>
    <tr><td>Failed:</td><td style="color: red">${msg.report.failed}</td></tr>
    <tr><td>Duration:</td><td>${msg.report.duration}ms</td></tr>
  </table>
  <p><a href="https://github.com/${msg.github.repo}/actions">View Details</a></p>
</body>
</html>
`;

return msg;
```

---

## 🛠️ Troubleshooting

### Node-RED não inicia

```powershell
# Ver logs
docker logs ysh-b2b-nodered

# Recriar container
docker-compose -f docker-compose.node-red.yml down
docker-compose -f docker-compose.node-red.yml up -d
```

### Flows não aparecem

```powershell
# Verificar volumes
docker volume ls | Select-String "nodered"

# Copiar flows manualmente
docker cp node-red/flows/flows.json ysh-b2b-nodered:/data/flows/
docker restart ysh-b2b-nodered
```

### MQTT não conecta

```powershell
# Verificar Mosquitto
docker logs ysh-b2b-mqtt

# Testar conexão
docker exec ysh-b2b-mqtt mosquitto_sub -t "test" -C 1
```

### Testes não rodam no Node-RED

```powershell
# Entrar no container
docker exec -it ysh-b2b-nodered /bin/bash

# Verificar se Playwright está acessível
ls /workspace/storefront/node_modules/.bin/playwright

# Testar comando manualmente
cd /workspace/storefront
npm run test:e2e
```

---

## 📚 Recursos Adicionais

- **Node-RED Docs**: <https://nodered.org/docs/>
- **Node-RED Flows**: <https://flows.nodered.org/> (biblioteca de flows prontos)
- **MQTT Explorer**: <http://mqtt-explorer.com/> (debug MQTT messages)
- **Playwright Docs**: <https://playwright.dev/>
- **Pact Docs**: <https://docs.pact.io/>

---

## 🎓 Próximos Passos

1. **Instalar nodes adicionais**:
   - `node-red-dashboard` - UI dashboard
   - `node-red-contrib-slack` - Slack notifications
   - `node-red-node-email` - Email sender
   - `node-red-contrib-prometheus` - Metrics export

2. **Criar flows avançados**:
   - Auto-rollback em caso de falha
   - Load testing triggers (k6)
   - Database backup automation
   - Log aggregation

3. **Integrar com ferramentas**:
   - Grafana para métricas
   - Sentry para error tracking
   - Datadog APM

---

**Status**: ✅ Node-RED pronto para uso local!

**Comandos úteis**:

```powershell
# Start
docker-compose -f docker-compose.node-red.yml up -d

# Stop
docker-compose -f docker-compose.node-red.yml down

# Logs
docker logs -f ysh-b2b-nodered

# Access
start http://localhost:1880
```
