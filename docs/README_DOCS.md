# 📚 Documentação YSH B2B - Estrutura Organizada

**Última Atualização:** 12 de outubro de 2025

---

## 📂 Estrutura da Documentação

### 📁 `/docs/deployment/`

Documentação relacionada ao processo de deployment AWS:

- Status de deployment e progresso
- Checklists e planos de execução
- Scripts PowerShell para deployment
- Relatórios de prontidão para produção

### 📁 `/docs/troubleshooting/`

Guias de resolução de problemas:

- Diagnósticos de backend e integração
- Problemas de database e conectividade
- Correções de TypeScript e configuração
- Verificação de secrets e credenciais

### 📁 `/docs/logs/`

Logs de troubleshooting e análise:

- Logs do backend ECS
- Scripts CloudShell para análise
- Outputs de comandos AWS CLI

### 📁 `/docs/aws/`

Documentação de infraestrutura AWS:

- Configurações do AWS Copilot
- Task definitions ECS
- Guias de configuração de recursos

---

## 🚀 Quick Links

### Início Rápido

- [README Principal](../README.md) - Setup inicial e visão geral
- [Backend 100% Funcional](../BACKEND_100_FUNCIONAL.md) - Status do backend local
- [Documentation Index](../DOCUMENTATION_INDEX.md) - Índice completo

### Deployment AWS

- [deployment/DEPLOYMENT_STATUS_EXECUTIVE.md](deployment/DEPLOYMENT_STATUS_EXECUTIVE.md) - Status executivo
- [deployment/QUICK_START.md](deployment/QUICK_START.md) - Guia rápido de deployment
- [deployment/PRE_FLIGHT_CHECKLIST.md](deployment/PRE_FLIGHT_CHECKLIST.md) - Checklist pré-deployment

### Troubleshooting

- [troubleshooting/DIAGNOSTICO_BACKEND_FALHA.md](troubleshooting/DIAGNOSTICO_BACKEND_FALHA.md) - Diagnóstico de falhas
- [troubleshooting/SECRETS_VERIFICATION_REPORT.md](troubleshooting/SECRETS_VERIFICATION_REPORT.md) - Verificação de secrets
- [troubleshooting/CONNECT_BASTION_DIRECT.md](troubleshooting/CONNECT_BASTION_DIRECT.md) - Conexão ao bastion

### Logs & Análise

- [logs/CLOUDSHELL_COMMANDS.md](logs/CLOUDSHELL_COMMANDS.md) - Comandos para CloudShell
- [logs/CLOUDSHELL_CHECK_LATEST.sh](logs/CLOUDSHELL_CHECK_LATEST.sh) - Script de verificação

---

## 📖 Índice Completo de Documentação

### Backend (`/backend/`)

- [Backend README](../backend/README.md)
- [Backend Documentation Index](../backend/DOCUMENTATION_INDEX.md)

### Storefront (`/storefront/`)

- [Storefront README](../storefront/README.md)
- [Storefront Documentation Index](../storefront/DOCUMENTATION_INDEX.md)
- [AGENTS.md](../storefront/AGENTS.md) - Instruções para agentes

### Data Platform (`/data-platform/`)

- Configurações e scripts do data platform

---

## 🔧 Manutenção

Esta estrutura foi organizada para:

- ✅ Separar concerns (deployment, troubleshooting, logs)
- ✅ Facilitar navegação e busca
- ✅ Manter root limpo e organizado
- ✅ Preservar histórico de troubleshooting

**Convenção:** Novos documentos devem ser adicionados nas pastas apropriadas, não no root.
