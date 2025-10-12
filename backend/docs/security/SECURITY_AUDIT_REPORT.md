# Security Audit Report - Backend

**Data**: 2024-10-12
**Total Vulnerabilidades**: 60 (4 low, 4 moderate, 52 high)

---

## 📊 Resumo Executivo

### Vulnerabilidades por Severidade

- 🔴 **High**: 52 (86.7%)
- 🟡 **Moderate**: 4 (6.7%)
- 🟢 **Low**: 4 (6.7%)

### Pacotes Críticos Afetados

1. **axios** (<=0.30.1) - 3 CVEs high/moderate
2. **vite** (0.11.0 - 6.1.6) - 1 CVE moderate via esbuild
3. **@medusajs/framework** - Cascade de 52 pacotes

---

## 🔴 Vulnerabilidades High Priority

### 1. axios (3 CVEs)

**Versão Atual**: <=0.30.1
**Versão Segura**: >=0.30.2

#### CVE-1: CSRF Vulnerability (GHSA-wf5p-g6vw-rhxx)

- **Severidade**: Moderate (6.5 CVSS)
- **CWE**: CWE-352 (Cross-Site Request Forgery)
- **Range**: 0.8.1 - 0.28.0
- **Descrição**: Permite ataques CSRF em requisições cross-origin

#### CVE-2: SSRF + Credential Leakage (GHSA-jr5f-v2jv-69x6)

- **Severidade**: High
- **CWE**: CWE-918 (Server-Side Request Forgery)
- **Range**: <0.30.0
- **Descrição**: Vazamento de credenciais via URLs absolutas

#### CVE-3: DoS via Data Size (GHSA-4hjh-wcwx-xvwj)

- **Severidade**: High (7.5 CVSS)
- **CWE**: CWE-770 (Allocation of Resources Without Limits)
- **Range**: <0.30.2
- **Descrição**: DoS por falta de validação de tamanho de dados

**Impacto**:

- `@medusajs/telemetry` (dependência de `@medusajs/cli` e `@medusajs/framework`)
- `@medusajs/test-utils`

**Solução**:

```bash
# CUIDADO: Pode quebrar compatibilidade
npm install axios@latest --save-exact
```

**Status**: ⚠️ Requer teste extensivo antes de aplicar

---

### 2. @medusajs/framework (52 módulos em cascata)

**Versão Atual**: >=0.0.2-preview-20240729120705
**Versão Sugerida pelo Audit**: 0.0.1 (⚠️ BREAKING CHANGE)

**Módulos Afetados**:

- Todos os módulos `@medusajs/*` (auth, cart, customer, order, payment, etc.)
- `@medusajs/medusa` (core do sistema)

**Fix Disponível**:

```bash
npm audit fix --force
# ⚠️ Instalará @medusajs/framework@0.0.1 (major downgrade)
```

**Status**: 🚫 **NÃO RECOMENDADO**

- Downgrade de versão preview para 0.0.1 pode quebrar todo o sistema
- Medusa 2.x está em preview, vulnerabilidades são esperadas
- Aguardar release estável do Medusa 2.x

**Recomendação**:

1. Monitorar changelogs do Medusa
2. Aplicar patches quando disponíveis em versões preview posteriores
3. Considerar usar versões LTS em produção

---

### 3. vite (CVE via esbuild)

**Versão Atual**: 0.11.0 - 6.1.6
**Versão Segura**: >=7.1.9

#### CVE: CORS Bypass in Dev Server (GHSA-67mh-4wv8-2f99)

- **Severidade**: Moderate (5.3 CVSS)
- **CWE**: CWE-346 (Origin Validation Error)
- **Descrição**: Qualquer website pode enviar requests ao dev server e ler respostas
- **Range Afetado**: esbuild <=0.24.2

**Impacto**:

- `@medusajs/admin-bundler`
- `@medusajs/admin-vite-plugin`

**Solução Segura**:

```bash
npm install vite@latest --save-dev
```

**Status**: ✅ Aplicável (dev dependency, menor risco)

---

## 🟡 Vulnerabilidades Low/Moderate Priority

### 4. compression (via on-headers)

**Versão Atual**: 1.0.3 - 1.8.0
**CVE**: HTTP Response Header Manipulation (GHSA-76c9-3jph-rj3q)

- **Severidade**: Low (3.4 CVSS)
- **CWE**: CWE-241 (Improper Handling of Unexpected Data Type)

**Status**: ⚠️ Ligado ao `@medusajs/framework`, não corrigível isoladamente

---

### 5. global (via min-document)

**CVE**: Prototype Pollution (GHSA-rx8g-88g5-qh64)

- **Severidade**: Low
- **CWE**: CWE-1321 (Improperly Controlled Modification of Object Prototype)

**Status**: ✅ Corrigível via `npm audit fix`

---

## 🎯 Plano de Ação Recomendado

### Fase 1: Correções Seguras (Aplicar Agora) ✅

```bash
# 1. Atualizar vite (dev dependency)
npm install vite@latest --save-dev

# 2. Corrigir vulnerabilidades low sem breaking changes
npm audit fix
```

**Risco**: Baixo
**Impacto**: Reduz 5-8 vulnerabilidades

---

### Fase 2: Correções de Médio Risco (Teste em Dev) ⚠️

```bash
# 3. Atualizar axios (requer testes extensivos)
npm install axios@^1.7.0 --save-exact

# 4. Testar todos os fluxos de telemetria e HTTP calls
npm run test:unit
npm run test:integration:http
```

**Risco**: Médio
**Impacto**: Corrige 3 CVEs high/moderate
**Validação Necessária**:

- Testar workflows que usam axios
- Verificar telemetria do Medusa
- Confirmar test-utils funcionando

---

### Fase 3: Aguardar Updates Upstream (Não Aplicar) 🚫

```bash
# NÃO EXECUTAR
# npm audit fix --force
# npm install @medusajs/framework@0.0.1
```

**Motivo**:

- Medusa 2.x está em preview
- Downgrade para 0.0.1 quebraria o sistema
- Vulnerabilidades serão corrigidas em futuras releases

**Ação**: Monitorar:

- <https://github.com/medusajs/medusa/releases>
- <https://github.com/medusajs/medusa/security/advisories>

---

## 📋 Checklist de Aplicação

### Antes de Aplicar

- [ ] Commit atual em branch separada
- [ ] Backup do `package-lock.json`
- [ ] Testes rodando 100% (baseline)

### Aplicação Fase 1

- [ ] `npm install vite@latest --save-dev`
- [ ] `npm audit fix` (sem --force)
- [ ] Rodar testes: `npm run test:unit`
- [ ] Verificar build: `npm run build`

### Aplicação Fase 2 (Ambiente Dev)

- [ ] `npm install axios@^1.7.0`
- [ ] Rodar todos os testes
- [ ] Testar manualmente:
  - [ ] Admin login
  - [ ] Telemetria (se habilitada)
  - [ ] Workflows de API externa
- [ ] Monitorar logs por 24-48h

### Aplicação Fase 3

- [ ] Aguardar Medusa 2.x stable
- [ ] Re-auditar após cada update

---

## 🔒 Mitigações Temporárias (Produção)

Enquanto aguarda correções upstream:

### 1. Network Policies

```yaml
# Bloquear SSRF do axios
- Implementar egress rules restritivas
- Whitelist apenas domínios confiáveis
```

### 2. Rate Limiting Adicional

```typescript
// Proteger contra DoS do axios
app.use(rateLimit({
  windowMs: 60000,
  max: 100,
  message: "Too many requests"
}));
```

### 3. CORS Hardening (Já Implementado)

```bash
# .env.production
CV_CORS_ORIGINS=https://app.yellowsolar.com.br
```

### 4. Monitoramento

- Alertas para requests com headers suspeitos
- Logs de telemetria para detectar CSRF
- Dashboards de performance (detectar DoS)

---

## 📈 Métricas de Progresso

| Fase | Vulnerabilidades | Status | ETA |
|------|------------------|--------|-----|
| Fase 1 (Segura) | 5-8 | ⏳ Pronto | Hoje |
| Fase 2 (Teste Dev) | 3 | ⚠️ Pendente | 1 semana |
| Fase 3 (Upstream) | 52 | 🚫 Bloqueado | Aguardar Medusa stable |

**Redução Estimada**: 8-11 vulnerabilidades (13-18%)
**Vulnerabilidades Remanescentes**: 49-52 (82-87%) - dependentes do Medusa

---

## 🚀 Próximos Passos

1. ✅ Aplicar Fase 1 hoje
2. ⏳ Setup ambiente de staging para Fase 2
3. 📋 Criar processo de monitoramento semanal de CVEs
4. 📧 Inscrever-se em security advisories do Medusa

---

**Atualizado**: 2024-10-12
**Revisor**: GitHub Copilot
**Próxima Revisão**: 2024-10-19
