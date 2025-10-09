# 📚 Índice de Documentação - YSH B2B Solar Commerce

**Última atualização**: 09/10/2025

---

## 🎯 Início Rápido

- [README.md](./README.md) - Visão geral do projeto e setup inicial
- [Guia Rápido de Inicialização](./docs/guides/GUIA_RAPIDO_INICIALIZACAO.md)
- [Credenciais Admin](./docs/guides/CREDENCIAIS_ADMIN.md)

---

## 📊 Status do Sistema

### Relatórios de Status Atuais

- [Status Desenvolvimento](./docs/status/DEV_STATUS.md) - ✅ Backend e Frontend funcionando
- [Status Ambiente Dev](./docs/status/DEV_ENV_STATUS.md) - Estado dos serviços
- [Status Deployment](./docs/status/DEPLOYMENT_STATUS.md) - 🟡 Build em progresso
- [Status Sistema SKU](./docs/status/STATUS_FINAL_SISTEMA_SKU.md) - 85% completo
- [Quick Status](./docs/status/QUICK_STATUS.md) - Análise unitária completa
- [Startup Success](./docs/status/STARTUP_SUCCESS.md)

---

## 🚀 Deployment e Infraestrutura

### AWS

- [AWS Setup 360](./docs/deployment/AWS_SETUP_360_SUMMARY.md) - ✅ Configuração completa
- [AWS Credentials Setup](./docs/deployment/AWS_CREDENTIALS_SETUP_GUIDE.md)
- [AWS Deployment Credentials](./docs/deployment/AWS_DEPLOYMENT_CREDENTIALS.md)
- [AWS Free Tier Guide](./docs/deployment/AWS_FREE_TIER_GUIDE.md)

### Deployment

- [Production Architecture](./docs/deployment/PRODUCTION_ARCHITECTURE.md)
- [Production Deployment Guide](./docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Deployment Optimization](./docs/deployment/DEPLOYMENT_OPTIMIZATION_SUMMARY.md)
- [Validation Report](./docs/deployment/VALIDATION_REPORT.md)

### LocalStack

- [LocalStack Quickstart](./docs/deployment/LOCALSTACK_QUICKSTART.md)

---

## 🐳 Docker

### Configuração e Otimização

- [Docker Implementation Complete](./docs/docker/DOCKER_IMPLEMENTATION_COMPLETE.md)
- [Docker Improvements](./docs/docker/DOCKER_IMPROVEMENTS_SUMMARY.md)
- [Docker Infrastructure Analysis](./docs/docker/DOCKER_INFRASTRUCTURE_ANALYSIS.md)
- [Docker Integration Analysis](./docs/docker/DOCKER_INTEGRATION_ANALYSIS.md)
- [Docker Optimization](./docs/docker/DOCKER_OPTIMIZATION_SUMMARY.md)
- [Docker Quickstart](./docs/docker/DOCKER_QUICKSTART.md)
- [Docker Workaround Alpine](./docs/docker/DOCKER_WORKAROUND_ALPINE.md)

### Docker Compose Files

- `docker-compose.yml` - Configuração principal
- `docker-compose.dev.yml` - Desenvolvimento simplificado
- `docker-compose.dev.resilient.yml` - Desenvolvimento resiliente
- `docker-compose.optimized.yml` - ⭐ Otimizado para performance
- `docker-compose.foss.yml` - Stack 100% FOSS
- `docker-compose.localstack.yml` - LocalStack Pro

---

## 💻 Implementações e Features

### Módulos B2B

- [Implementação Concluída](./docs/implementation/IMPLEMENTACAO_CONCLUIDA.md)
- [Integration Review](./docs/implementation/INTEGRATION_REVIEW.md)
- [Migration ERP Removal](./docs/implementation/MIGRATION_ERP_REMOVAL.md)
- [Personalização Order Module](./docs/implementation/PERSONALIZACAO_ORDER_MODULE.md)

### Sistema Solar

- [Solar Integration Complete](./docs/implementation/SOLAR_INTEGRATION_COMPLETE.md)
- [Solar Viability Implementation](./docs/implementation/SOLAR_VIABILITY_IMPLEMENTATION.md)
- [MPPT Validation Integration](./docs/implementation/MPPT_VALIDATION_INTEGRATION.md)

### Features Específicas

- [Credit Analysis Implementation](./docs/implementation/CREDIT_ANALYSIS_IMPLEMENTATION.md)
- [Task 6 Complete](./docs/implementation/TASK_6_COMPLETE.md)
- [Phase 1.3 ARIA Labels](./docs/implementation/PHASE_1_3_ARIA_LABELS_COMPLETE.md)

### Catálogo

- [Catalog Import Summary](./docs/implementation/CATALOG_IMPORT_SUMMARY.md)
- [Schemas JSON YSH](./docs/implementation/SCHEMAS_JSON_YSH.md)
- [Unit Analysis Summary](./docs/implementation/UNIT_ANALYSIS_SUMMARY.md)

### Storefront

- [Diagnóstico Storefront Completo](./docs/implementation/DIAGNOSTICO_STOREFRONT_COMPLETO.md)
- [Storefront Funcional](./docs/implementation/STOREFRONT_FUNCIONAL.md)

### Testes

- [Teste Rápido Viability](./docs/implementation/TESTE_RAPIDO_VIABILITY.md)

### Relatórios

- [Relatório Implementação Final](./docs/implementation/RELATORIO_IMPLEMENTACAO_FINAL.md)
- [Resumo Trabalho](./docs/implementation/RESUMO_TRABALHO.md)

---

## 📖 Guias e Tutoriais

- [Guia Rápido Inicialização](./docs/guides/GUIA_RAPIDO_INICIALIZACAO.md)
- [Logo Yello Implementação](./docs/guides/LOGO_YELLO_IMPLEMENTACAO.md)
- [Credenciais Admin](./docs/guides/CREDENCIAIS_ADMIN.md)
- [Correção Publishable Key](./docs/guides/CORRECAO_PUBLISHABLE_KEY.md)

---

## 🛠️ Scripts

### Desenvolvimento (`scripts/dev/`)

- `dev.ps1` - Iniciar backend + frontend
- `start-dev.ps1` - Iniciar desenvolvimento
- `start-backend.ps1` - Apenas backend
- `check-backend.ps1` - Verificar backend
- `check-dev.ps1` - Verificar todos os serviços
- `status.ps1` - Status geral
- `test-posthog-fix.ps1` - Testar correção PostHog
- `verifica-logo.ps1` - Verificar logo
- `quick-fix-backend.ps1` - Fix rápido backend
- `fix-backend-dev.ps1` - Fix desenvolvimento

### Docker (`scripts/docker/`)

- `setup-docker.ps1` - Setup inicial Docker

### Deployment (`scripts/deployment/`)

- `build-production.ps1` - Build imagens produção
- `push-to-ecr.ps1` - Push para AWS ECR

---

## 📂 Estrutura de Workspaces

### Backend (`backend/`)

- Medusa 2.4 Server
- Módulos: company, quote, approval
- Workflows personalizados
- Scripts de seed e migrations

### Storefront (`storefront/`)

- Next.js 15 com App Router
- Módulos de funcionalidade
- Componentes compartilhados
- Documentação específica em `storefront/*.md`

### Data Platform (`data-platform/`)

- Dagster pipelines
- Pathway streaming
- PostHog analytics
- Qdrant vector DB

---

## 🔧 Infraestrutura (`infra/`)

- Scripts de setup (Linux/Windows)
- Configurações Redis, Loki, Prometheus
- Task definitions AWS
- Networking configs

---

## 🗄️ Arquivo Histórico (`.archive/`)

Documentos e configurações antigas mantidas para referência:

- Árvores de estrutura antigas
- Docker compose backups

---

## 📝 Arquivos de Configuração Raiz

- `.env` - Variáveis de ambiente
- `.dockerignore` - Ignorar em builds Docker
- `.gitignore` - Ignorar no Git
- `nginx.conf` - Configuração Nginx
- `yarn.lock` - Lock de dependências root
- `LICENSE` - Licença MIT

---

## 🆘 Troubleshooting

### Problemas Comuns

1. **Backend não inicia**
   - Ver: [docs/guides/GUIA_RAPIDO_INICIALIZACAO.md](./docs/guides/GUIA_RAPIDO_INICIALIZACAO.md)
   - Executar: `.\scripts\dev\check-backend.ps1`

2. **Erro de Publishable Key**
   - Ver: [docs/guides/CORRECAO_PUBLISHABLE_KEY.md](./docs/guides/CORRECAO_PUBLISHABLE_KEY.md)

3. **Docker loop restart**
   - Ver: [docs/docker/DOCKER_WORKAROUND_ALPINE.md](./docs/docker/DOCKER_WORKAROUND_ALPINE.md)

4. **Deployment AWS**
   - Ver: [docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md](./docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md)

---

## 📞 Suporte

- **Email**: <fernando@yellosolarhub.com>
- **GitHub**: <https://github.com/own-boldsbrain/ysh-b2b>
- **Discord Medusa**: <https://discord.gg/xpCwq3Kfn8>

---

**Última revisão**: 09/10/2025 por Fernando Junio
