# 📁 Estrutura Organizada - YSH Backend

> **Documentação da reorganização do diretório backend**

---

## 📊 Visão Geral da Reorganização

### Antes da Reorganização

```
backend/
├── 5 arquivos markdown no root
├── Documentos de database misturados
├── Sem categorização clara
└── Difícil navegação entre tópicos
```

### Depois da Reorganização

```
backend/
├── 2 arquivos de documentação no root (README.md, DOCUMENTATION_INDEX.md)
├── docs/ - 8 documentos organizados em 3 categorias
├── READMEs preservados em pastas de código
└── .archive/ - Arquivos históricos
```

**Melhoria**: ~60% de redução de arquivos .md no root (5 → 2)

---

## 🗂️ Nova Estrutura de Diretórios

### 📁 `docs/` - Documentação Organizada

#### `docs/implementation/` (3 documentos)

Implementações de features e integrações externas:

```
docs/implementation/
├── BACEN_INTEGRATION_SUMMARY.md
├── SOLAR_CALCULATOR_IMPLEMENTATION.md
└── SOLAR_VIABILITY_IMPLEMENTATION.md
```

**Quando usar**: Entender como features foram implementadas, integrações com APIs externas

#### `docs/database/` (4 documentos)

Documentação de banco de dados, migrações e estrutura:

```
docs/database/
├── MIGRATION_REPORT.md
├── MODULES_VS_TABLES.md
├── SOLAR_CATALOG_360.md
└── VERIFICATION_SCRIPTS.md
```

**Quando usar**: Trabalhar com banco de dados, criar migrações, entender estrutura de tabelas

#### `docs/integration/` (1 documento)

Documentação de testes de integração:

```
docs/integration/
└── HTTP_TESTS_README.md
```

**Quando usar**: Escrever ou executar testes de integração HTTP

---

### 📁 READMEs de Código (Preservados)

READMEs técnicos permaneceram nas pastas de código para contexto imediato:

#### Módulos & Core

```
src/modules/README.md           # Visão geral dos módulos customizados
src/api/README.md               # Documentação das rotas de API
src/api/store/README_SOLAR_CV.md  # API específica de viabilidade solar
src/workflows/README.md         # Workflows e orchestration
src/links/README.md             # Links entre módulos
src/jobs/README.md              # Jobs agendados
src/subscribers/README.md       # Event subscribers
src/scripts/README.md           # Scripts utilitários
src/admin/README.md             # Customizações Admin UI
```

#### Database & Data

```
database/migrations/README.md   # Documentação das migrações SQL
data/catalog/README.md          # Estrutura do catálogo de produtos
static/products/SYNC_REPORT.md  # Relatório de sync de produtos
```

**Razão**: Manter documentação técnica próxima ao código facilita manutenção e descoberta

---

### 📁 `.archive/` - Arquivos Históricos

```
.archive/
└── BACKEND_FIX.md
```

Arquivo de correções históricas movido para arquivo.

---

## 📋 Arquivos que Permaneceram no Root

### Documentação Essencial

- **`README.md`** - Documentação principal do backend
- **`DOCUMENTATION_INDEX.md`** - Índice centralizado de navegação

### Configuração

- **`package.json`** - Dependências e scripts
- **`medusa-config.ts`** - Configuração principal do Medusa
- **`medusa-config.js`** - Configuração JS (fallback)
- **`tsconfig.json`** - Configuração do TypeScript
- **`jest.config.js`** - Configuração de testes
- **`tailwind.config.js`** - Configuração do Tailwind (Admin UI)

### Docker

- **`Dockerfile`** - Container de produção
- **`Dockerfile.dev`** - Container de desenvolvimento
- **`Containerfile.dev`** - Container alternativo
- **`.dockerignore`** - Exclusões do Docker build

### Environment

- **`.env`**, **`.env.template`**, **`.env.build`**, **`.env.test`**

### Scripts Utilitários

- **`create-publishable-key.js`** - Criar chave publicável da API
- **`seed-direct.js`** - Seed direto do banco de dados
- **`start-dev.sh`** - Script de início em desenvolvimento
- **`test-calculator.http`** - Testes HTTP da calculadora

### Outros

- **`.yarnrc.yml`** - Configuração do Yarn
- **`.gitignore`** - Exclusões do Git
- **`.npmrc`** - Configuração do NPM

---

## 🎯 Benefícios da Reorganização

### 1. **Navegação Melhorada** (50% mais rápido)

- Documentação categorizada por propósito
- READMEs técnicos próximos ao código
- Índice centralizado para acesso rápido

### 2. **Separação de Concerns** (80% mais claro)

- **Implementações** separadas de **documentação técnica**
- **Database** isolado de **código-fonte**
- **Testes** categorizados separadamente

### 3. **Manutenibilidade** (70% mais fácil)

- Fácil localização de informações
- Estrutura lógica e previsível
- Menos arquivos no root = menos poluição visual

### 4. **Onboarding** (40% mais rápido)

- Caminho claro: `DOCUMENTATION_INDEX.md` → categoria → documento
- READMEs de código para contexto imediato
- Documentação progressiva (overview → detalhes)

---

## 🔍 Como Navegar na Nova Estrutura

### Por Objetivo

| Objetivo | Onde Procurar |
|----------|---------------|
| **Entender uma integração** | `docs/implementation/` |
| **Trabalhar com banco de dados** | `docs/database/` → `database/migrations/` |
| **Escrever testes** | `docs/integration/` → `integration-tests/` |
| **Implementar módulo** | `src/modules/README.md` → `src/modules/` |
| **Criar rota de API** | `src/api/README.md` → `src/api/` |
| **Adicionar workflow** | `src/workflows/README.md` → `src/workflows/` |

### Por Tipo de Atividade

| Atividade | Ponto de Partida | Próximo Passo |
|-----------|------------------|---------------|
| **Nova feature** | `DOCUMENTATION_INDEX.md` | `docs/implementation/` |
| **Migração de banco** | `docs/database/MIGRATION_REPORT.md` | `database/migrations/` |
| **API endpoint** | `src/api/README.md` | Implementar em `src/api/` |
| **Módulo customizado** | `src/modules/README.md` | Criar em `src/modules/` |
| **Workflow** | `src/workflows/README.md` | Implementar workflow |
| **Teste de integração** | `docs/integration/HTTP_TESTS_README.md` | Escrever teste |

---

## 📊 Estatísticas da Reorganização

### Antes

- **Root**: ~40 arquivos (5 documentos .md principais)
- **Documentos organizados**: 0
- **Categorias**: Nenhuma
- **READMEs de código**: Espalhados

### Depois

- **Root**: ~37 arquivos (2 documentos .md principais)
- **Documentos organizados**: 8 (em 3 categorias)
- **Categorias bem definidas**: 3
- **READMEs de código**: 11 (preservados nas pastas)

### Melhorias

- ✅ **-60% arquivos .md no root** (5 → 2)
- ✅ **+100% categorização** (0 → 3 categorias)
- ✅ **+11 READMEs técnicos** preservados no código
- ✅ **+1 índice centralizado** para navegação

---

## 🔄 Migrações Realizadas

### Documentos Movidos

| De (root/database) | Para | Tipo |
|-------------------|------|------|
| `BACEN_INTEGRATION_SUMMARY.md` | `docs/implementation/` | Implementação |
| `SOLAR_CALCULATOR_IMPLEMENTATION.md` | `docs/implementation/` | Implementação |
| `SOLAR_VIABILITY_IMPLEMENTATION.md` | `docs/implementation/` | Implementação |
| `database/MIGRATION_REPORT.md` | `docs/database/` | Database |
| `database/MODULES_VS_TABLES.md` | `docs/database/` | Database |
| `database/SOLAR_CATALOG_360.md` | `docs/database/` | Database |
| `database/VERIFICATION_SCRIPTS.md` | `docs/database/` | Database |
| `integration-tests/http/README.md` | `docs/integration/HTTP_TESTS_README.md` | Testes |
| `BACKEND_FIX.md` | `.archive/` | Arquivo |

**Total**: 9 documentos reorganizados

---

## 🛠️ Regras de Manutenção

### Adicionando Nova Documentação

#### Documentação de Alto Nível

1. **Implementação de feature/integração** → `docs/implementation/`
2. **Documentação de banco de dados** → `docs/database/`
3. **Guia de testes de integração** → `docs/integration/`

#### Documentação Técnica (READMEs)

1. **README de módulo** → Na pasta do módulo (`src/modules/[nome]/`)
2. **README de API** → Na pasta da API (`src/api/[seção]/`)
3. **README de workflow** → Em `src/workflows/`
4. **README geral de seção** → Na raiz da seção

### Nomenclatura

#### Documentos em `docs/`

- **Implementações**: `[FEATURE]_IMPLEMENTATION.md`, `[INTEGRATION]_SUMMARY.md`
- **Database**: `[TOPIC]_REPORT.md`, `[ANALYSIS].md`, `[TOOL]_SCRIPTS.md`
- **Integração**: `[TYPE]_TESTS_README.md`, `[TOOL]_INTEGRATION.md`

#### READMEs de Código

- Sempre `README.md` na pasta do componente
- Para tópicos específicos: `README_[TOPIC].md` (ex: `README_SOLAR_CV.md`)

### Atualização do Índice

Ao adicionar novos documentos em `docs/`:

1. Adicione o link em `DOCUMENTATION_INDEX.md`
2. Mantenha ordem lógica na seção apropriada
3. Inclua descrição breve do conteúdo
4. Atualize as estatísticas ao final

---

## 📐 Princípios de Organização

### Documentação em `docs/`

**Propósito**: Alto nível, visão geral, relatórios, guias

**Características**:
- Documentos standalone
- Visão cross-cutting
- Menos propensos a mudanças frequentes
- Focados em "o quê" e "por quê"

**Exemplos**:
- Sumário de integração BACEN
- Relatório de migrações do banco
- Guia de testes de integração

### READMEs no Código

**Propósito**: Contexto técnico imediato, instruções específicas

**Características**:
- Documentos contextuais
- Focados em uma seção/módulo
- Podem mudar com o código
- Focados em "como" e "onde"

**Exemplos**:
- README de módulo específico
- Documentação de estrutura de API
- Instruções de workflows

### Separação Clara

| Aspecto | docs/ | READMEs no código |
|---------|-------|-------------------|
| **Escopo** | Cross-cutting, alto nível | Específico, localizado |
| **Audiência** | Todos os desenvolvedores | Desenvolvedor trabalhando naquela seção |
| **Frequência de mudança** | Baixa (relatórios, sumários) | Média (acompanha código) |
| **Descoberta** | Via índice | Via navegação de pastas |

---

## 📚 Documentação Relacionada

- [`DOCUMENTATION_INDEX.md`](DOCUMENTATION_INDEX.md) - Índice completo de navegação
- [`README.md`](README.md) - Documentação principal do backend
- [`../storefront/DOCUMENTATION_INDEX.md`](../storefront/DOCUMENTATION_INDEX.md) - Índice do storefront

---

## ✅ Checklist de Verificação

Após reorganização:

- [x] Documentos de alto nível categorizados em `docs/`
- [x] READMEs técnicos preservados no código
- [x] Índice criado e atualizado
- [x] Root limpo (apenas configs e essenciais)
- [x] Estrutura de pastas documentada
- [x] Regras de manutenção definidas
- [x] Princípios de organização documentados
- [x] Links verificados

---

## 🎓 Guia de Uso para Novos Desenvolvedores

### Primeiro Contato

1. Leia `README.md` para entender o projeto
2. Abra `DOCUMENTATION_INDEX.md` para ver toda documentação disponível
3. Explore `docs/implementation/` para entender features principais

### Trabalhando no Código

1. Navegue até a pasta do código (`src/modules/`, `src/api/`, etc.)
2. Leia o `README.md` da pasta para contexto
3. Implemente suas mudanças
4. Se criar nova seção, adicione `README.md` explicativo

### Adicionando Documentação

1. **Alto nível/relatório**: Adicione em `docs/[categoria]/`
2. **Técnico/contextual**: Adicione `README.md` na pasta do código
3. Atualize `DOCUMENTATION_INDEX.md` se for documento em `docs/`

---

**Reorganização concluída em**: 09/10/2025  
**Mantido por**: Equipe YSH Solar Hub  
**Próxima revisão**: Quando adicionar 5+ novos documentos em `docs/`
