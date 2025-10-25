# Índice de Estruturas de Diretórios

Este documento contém a documentação das estruturas de diretórios do projeto YSH Medusa B2B.

## Arquivos de Estrutura

### 1. [PROJECT_STRUCTURE_ROOT.md](PROJECT_STRUCTURE_ROOT.md)

Estrutura completa do diretório raiz do projeto, incluindo todos os arquivos e pastas de configuração, documentação, código fonte e recursos.

### 2. [PROJECT_STRUCTURE_BACKEND.md](PROJECT_STRUCTURE_BACKEND.md)

Estrutura detalhada do diretório `backend/`, incluindo configurações, código fonte organizado por módulos, testes, documentação e recursos.

### 3. [PROJECT_STRUCTURE_STOREFRONT.md](PROJECT_STRUCTURE_STOREFRONT.md)

Estrutura detalhada do diretório `storefront/`, incluindo configurações Next.js, código fonte organizado por funcionalidades, testes e recursos.

## Visão Geral da Arquitetura

```bash
ysh-medusa/
├── docs/                    # Documentação
│   ├── PROJECT_STRUCTURE_ROOT.md
│   ├── PROJECT_STRUCTURE_BACKEND.md
│   └── PROJECT_STRUCTURE_STOREFRONT.md
├── backend/                 # API Medusa.js (Node.js/TypeScript)
│   ├── src/
│   │   ├── api/            # Endpoints da API
│   │   ├── modules/        # Módulos personalizados
│   │   ├── workflows/      # Lógica de negócio
│   │   └── lib/            # Utilitários
│   └── package.json
└── storefront/              # Loja Next.js (React/TypeScript)
    ├── src/
    │   ├── app/            # App Router
    │   ├── components/     # Componentes React
    │   ├── modules/        # Módulos funcionais
    │   └── lib/            # Utilitários
    └── package.json
```

## Tecnologias Principais

- **Backend**: Medusa.js, Node.js, TypeScript, PostgreSQL, Redis
- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Infraestrutura**: Docker, AWS, Nginx
- **Testes**: Jest, Playwright, Vitest
- **Documentação**: Markdown, Storybook

## Última Atualização

Estruturas extraídas em: Outubro 13, 2025
