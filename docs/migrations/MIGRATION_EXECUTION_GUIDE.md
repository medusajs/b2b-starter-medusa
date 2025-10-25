# Estrutura Definitiva Medusa.js v2 - Guia de Execução

## Status Atual ✅

**Script de Migração**: `tools/Migrate-Structure-Clean.ps1`  
**Teste Dry-Run**: Executado com sucesso  
**Pronto para Execução**: SIM

## O Que o Script Faz

### Fase 1: Criação da Estrutura Definitiva

Cria diretórios consolidados seguindo best practices Medusa.js v2:

```tsx
backend/
├── src/
│   ├── admin/           # Admin UI customizations
│   ├── api/             # API routes (store + admin)
│   ├── modules/         # Custom B2B modules
│   ├── workflows/       # Business logic workflows
│   ├── links/           # Module links
│   ├── subscribers/     # Event subscribers
│   ├── jobs/            # Background jobs
│   ├── scripts/         # Utility scripts
│   ├── types/           # Shared types
│   └── utils/           # Utilities
├── medusa-config.ts
├── package.json
└── tsconfig.json

storefront/
├── src/
│   ├── app/
│   │   └── [countryCode]/
│   │       ├── (main)/      # Public pages
│   │       └── (checkout)/  # Checkout flow
│   ├── modules/             # Feature modules
│   ├── components/          # Shared components
│   ├── lib/
│   │   ├── config/
│   │   ├── data/            # Server Actions
│   │   ├── hooks/
│   │   └── utils/
│   ├── providers/
│   ├── styles/
│   └── types/
├── middleware.ts
├── next.config.js
└── package.json

shared/                  # Shared code
└── types/

packages/                # Monorepo packages
├── ui/
├── config/
└── types/
```

### Fase 2: Migração de Arquivos

**Migra de `server/` → `backend/`:**

- ✅ Módulos B2B (company, quote, approval)
- ✅ Workflows e hooks
- ✅ Links entre módulos
- ✅ Admin customizations
- ✅ API routes (store + admin)
- ✅ Subscribers, jobs, scripts
- ✅ Arquivos de configuração

**Arquivos Migrados (Dry-Run):**

- 74 arquivos de módulos B2B
- 2 workflows
- 1 link adapter
- 15+ API routes
- 4 subscribers
- 1 job, 1 script de seed
- 4 arquivos de config

### Fase 3: Validação

Verifica que todos os diretórios críticos foram criados.

## Como Executar

### 1. Dry-Run (Já Executado ✅)

```powershell
& "c:\Users\fjuni\ysh_medusa\ysh-store\tools\Migrate-Structure-Clean.ps1" -WhatIf
```

**Resultado**: Mostra o que será feito sem executar

### 2. Execução Real

```powershell
& "c:\Users\fjuni\ysh_medusa\ysh-store\tools\Migrate-Structure-Clean.ps1"
```

**O que acontece:**

- Cria toda estrutura de diretórios
- Copia todos os arquivos de `server/` para `backend/`
- Preserva diretórios `client/` e `server/` (não remove)
- Gera logs coloridos do progresso

### 3. Validação Pós-Migração

```powershell
# Backend
cd backend
yarn install
yarn build

# Storefront
cd ..\storefront
yarn install
yarn dev
```

## Avisos do Dry-Run

⚠️ **Diretórios que serão criados mas não existem atualmente:**

1. `storefront\src\app\[countryCode]\(main)` - Rota main do Next.js
2. `storefront\src\app\[countryCode]\(checkout)` - Rota checkout
3. `shared\types` - Tipos compartilhados

**Ação necessária**: Após migração, mover rotas existentes do storefront para essas pastas.

## O Que NÃO é Feito

❌ **Não remove** diretórios antigos (`client/`, `server/`)  
❌ **Não atualiza** imports automáticamente  
❌ **Não modifica** arquivos existentes no `backend/` atual  
❌ **Não cria** backup automático (você deve fazer manualmente)

## Backup Manual Recomendado

Antes de executar, faça backup:

```powershell
# Criar backup completo
Copy-Item -Path "c:\Users\fjuni\ysh_medusa\ysh-store" -Destination "c:\Users\fjuni\ysh_medusa\ysh-store-backup-$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')" -Recurse
```

## Próximos Passos Após Migração

1. **Verificar arquivos migrados**
   - Comparar `server/src/` com `backend/src/`
   - Garantir que todos os arquivos foram copiados

2. **Atualizar imports relativos**
   - Ajustar caminhos se necessário
   - Verificar imports entre módulos

3. **Testar build backend**

   ```powershell
   cd backend
   yarn build
   ```

4. **Testar storefront**

   ```powershell
   cd storefront
   yarn dev
   ```

5. **Organizar rotas do storefront**
   - Mover páginas para `(main)/` ou `(checkout)/`
   - Seguir estrutura App Router Next.js 15

6. **Atualizar documentação**
   - README.md
   - Guias de desenvolvimento
   - Diagramas de arquitetura

7. **Commit estrutura nova**

   ```bash
   git add .
   git commit -m "feat: reorganize to definitive Medusa.js v2 structure"
   ```

## Decisão

✅ **Dry-run passou** - Script está pronto  
⏸️ **Aguardando confirmação** para executar migração real

**Para executar**:

```powershell
& "c:\Users\fjuni\ysh_medusa\ysh-store\tools\Migrate-Structure-Clean.ps1"
```

## Rollback

Se algo der errado:

1. **Restaurar do backup**

   ```powershell
   Remove-Item -Path "c:\Users\fjuni\ysh_medusa\ysh-store" -Recurse -Force
   Copy-Item -Path "c:\Users\fjuni\ysh_medusa\ysh-store-backup-TIMESTAMP" -Destination "c:\Users\fjuni\ysh_medusa\ysh-store" -Recurse
   ```

2. **Ou reverter via Git**

   ```bash
   git reset --hard HEAD
   git clean -fd
   ```

## Estrutura Após Migração

- `backend/` - Servidor Medusa consolidado (server/ migrado)
- `storefront/` - Loja Next.js 15 (mantém estrutura atual)
- `client/` - Mantido (pode ser removido depois)
- `server/` - Mantido (pode ser removido depois)
- `shared/` - Novo (tipos compartilhados)
- `packages/` - Expandido (ui, config, types)

---

**Última Atualização**: Outubro 13, 2025  
**Script**: `tools/Migrate-Structure-Clean.ps1`  
**Status**: ✅ Pronto para execução
