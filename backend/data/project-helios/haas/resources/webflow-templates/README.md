# 📦 Webflow Templates - HaaS Platform

## 🎯 Templates Prioritários

Este diretório contém os templates Webflow selecionados para o HaaS Platform.

---

## 📋 Lista de Templates

### 1. **Fintria** - Dashboard de Monitoramento

- **URL**: <https://webflow.com/made-in-webflow/website/fintria>
- **Uso**: Base para Dashboard de Monitoramento
- **Componentes Principais**:
  - Layout sidebar + main content
  - KPI cards grid (4 colunas)
  - Charts interativos (Chart.js)
  - Tabela de atividades recentes
  - Design system com cores financeiras

**Como Obter**:

1. Acessar <https://webflow.com/made-in-webflow/website/fintria>
2. Clicar em "Clone" (requer conta Webflow)
3. Abrir no Webflow Designer
4. Export code: Settings → Export Code
5. Salvar em `fintria/`

**Arquivos Esperados**:

```
fintria/
├── index.html
├── css/
│   ├── normalize.css
│   └── webflow.css
├── js/
│   └── webflow.js
└── images/
```

---

### 2. **Finance X** - Landing Page

- **URL**: <https://webflow.com/made-in-webflow/website/financex>
- **Uso**: Landing Page Comercial do HaaS
- **Componentes Principais**:
  - Hero section com CTA
  - Features grid (3 colunas)
  - Pricing table
  - Testimonials
  - Contact form

**Como Obter**:

1. Acessar <https://webflow.com/made-in-webflow/website/financex>
2. Clicar em "Clone"
3. Export code
4. Salvar em `finance-x/`

**Customizações Necessárias**:

- Trocar cores para paleta HaaS (#0066CC)
- Ajustar copy para "Homologação Digital"
- Integrar formulário com FastAPI
- Adicionar seção "Como Funciona"

---

### 3. **The Agency** - Portal Institucional

- **URL**: <https://webflow.com/made-in-webflow/website/The-Agency>
- **Uso**: Portal Institucional / Sobre
- **Componentes Principais**:
  - About section
  - Services grid
  - Team showcase
  - Case studies
  - Footer completo

**Como Obter**:

1. Acessar <https://webflow.com/made-in-webflow/website/The-Agency>
2. Clicar em "Clone"
3. Export code
4. Salvar em `the-agency/`

**Integração com HaaS**:

- Usar para página "Sobre o HaaS"
- Adaptar services para "Funcionalidades"
- Team para "Concessionárias Parceiras"

---

## 🛠️ Instruções de Setup

### Pré-requisitos

- Conta Webflow (free tier suficiente)
- Navegador moderno (Chrome/Firefox)
- Editor de código (VS Code)

### Passo a Passo

#### 1. Criar Conta Webflow

```
1. Acessar: https://webflow.com/dashboard/signup
2. Criar conta gratuita
3. Verificar email
4. Login no Dashboard
```

#### 2. Clonar Templates

```
Para cada template (Fintria, Finance X, The Agency):

1. Abrir URL do template
2. Clicar botão "Clone"
3. Selecionar workspace
4. Aguardar clonagem (30-60s)
5. Template aparece no Dashboard
```

#### 3. Export Code

```
1. Abrir template no Dashboard
2. Clicar ícone de engrenagem (Settings)
3. Selecionar "Export Code"
4. Aguardar preparação do ZIP
5. Download do arquivo
6. Extrair para este diretório
```

#### 4. Organizar Arquivos

```powershell
# Estrutura final esperada
webflow-templates/
├── fintria/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── images/
├── finance-x/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── images/
└── the-agency/
    ├── index.html
    ├── css/
    ├── js/
    └── images/
```

---

## 🎨 Customização dos Templates

### Cores HaaS (Substituir no CSS)

```css
/* ANTES (cores originais dos templates) */
--primary-color: #1a73e8;
--success-color: #34a853;
--warning-color: #fbbc04;
--danger-color: #ea4335;

/* DEPOIS (paleta HaaS) */
--primary-color: #0066CC;
--success-color: #28A745;
--warning-color: #FFC107;
--danger-color: #DC3545;
```

**Comando de Busca e Substituição** (VS Code):

```
Ctrl+Shift+F
Buscar: #1a73e8
Substituir: #0066CC
Replace All in Files
```

---

## 🔗 Integração com FastAPI

### Dashboard (Fintria)

**Endpoints a integrar**:

```javascript
// Substituir dados mockados por chamadas API

// KPIs
fetch('/api/monitoring/overview?period=30d')
    .then(response => response.json())
    .then(data => updateKPIs(data.kpis));

// Recent Activity
fetch('/api/monitoring/recent-activity?limit=10')
    .then(response => response.json())
    .then(data => populateTable(data));

// Websocket Real-Time
const ws = new WebSocket('ws://localhost:8000/ws/dashboard');
ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    handleRealtimeUpdate(update);
};
```

### Landing Page (Finance X)

**Formulário de Contato**:

```javascript
document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: e.target.name.value,
        email: e.target.email.value,
        message: e.target.message.value
    };
    
    const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
    });
    
    if (response.ok) {
        showSuccessMessage();
    }
});
```

---

## 📊 Checklist de Validação

### Fintria (Dashboard)

- [ ] Template clonado no Webflow
- [ ] Código exportado e extraído
- [ ] Cores substituídas para paleta HaaS
- [ ] Textos customizados (português)
- [ ] Integração API implementada
- [ ] Websockets funcionando
- [ ] Responsivo testado (desktop + tablet)
- [ ] Performance: load time < 2s

### Finance X (Landing Page)

- [ ] Template clonado no Webflow
- [ ] Código exportado e extraído
- [ ] Hero section customizado
- [ ] Features adaptados para HaaS
- [ ] Pricing table ajustado
- [ ] Formulário integrado com API
- [ ] SEO otimizado (meta tags)
- [ ] Google Analytics adicionado

### The Agency (Portal)

- [ ] Template clonado no Webflow
- [ ] Código exportado e extraído
- [ ] Seção "Sobre" escrita
- [ ] Serviços documentados
- [ ] Footer completo (links, contato)
- [ ] Imagens de alta qualidade
- [ ] Navegação funcional
- [ ] Mobile-friendly

---

## 🚀 Próximos Passos

Após completar o download e setup dos templates:

1. **Implementar Design System** (Tarefa 3)
   - Criar colors.css
   - Criar components.html
   - Biblioteca de ícones Material

2. **Desenvolver Dashboard** (Tarefa 4)
   - Integrar template Fintria
   - Conectar APIs FastAPI
   - Implementar Websockets

3. **Landing Page** (Tarefa 5)
   - Integrar template Finance X
   - Customizar copy e imagens
   - SEO e Analytics

---

## 📞 Suporte

Se houver problemas com download ou clonagem:

**Alternativas**:

1. Usar templates free de outros sites (ThemeForest, Creative Tim)
2. Criar dashboard from scratch com React + Material-UI
3. Usar templates Bootstrap gratuitos

**Recursos Úteis**:

- Webflow University: <https://university.webflow.com/>
- Webflow Forum: <https://forum.webflow.com/>
- Webflow Export Guide: <https://university.webflow.com/lesson/export-code>

---

*Última atualização: 14 de outubro de 2025*
