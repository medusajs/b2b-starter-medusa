# Windows Development Checklist

Este guia resume as acoes minimas para operar o projeto `ysh-b2b` em Windows sem enfrentar os erros
`EPERM`, `fetch failed`, falhas de SSL ou dependencias ausentes.

## 1. Node.js e Corepack

- Instale o [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) e remova instalacoes anteriores do Node.
- Selecione a versao correta e habilite o Corepack:

  ```powershell
  nvm install 20
  nvm use 20
  corepack enable
  ```

## 2. Anti-virus e Indexacao

- Execute o script automatizado na raiz do repositorio:

  ```powershell
  pwsh -ExecutionPolicy Bypass -File infra/scripts/windows/setup-dev-environment.ps1
  ```

- O script adiciona exclusoes ao Windows Defender para o repositorio, caches Yarn/NPM e diretoria do `nvm`.
- Ele tambem define o repositorio como "nao indexado" para impedir bloqueios do Windows Search.

## 3. Terminais sem privilegio

- Antes de instalar dependencias, garanta que o shell nao esta elevado:

  ```powershell
  pwsh -File infra/scripts/windows/assert-non-admin.ps1
  ```

- Configure seus scripts de automacao para executar essa verificacao.

## 4. Reset de dependencias (scorched earth)

- Sempre que for necessario sanear `node_modules`, execute:

  ```powershell
  Remove-Item -Recurse -Force node_modules
  corepack yarn cache clean
  corepack yarn install --immutable
  ```

- Como atalho, use `pwsh -File infra/scripts/windows/reset-node-modules.ps1 -WorkspacePath ../backend` (ajuste o caminho conforme necessario).
- Repita para `backend/` e `storefront/` conforme aplicavel.
- O script valida se existe `package.json` no destino antes de prosseguir, evitando execucao acidental na raiz do repo.

## 5. Networking com Podman

- Crie uma rede dedicada com DNS antes de subir os servicos:

  ```powershell
  podman network create ysh-b2b-dev --dns-enabled=true
  ```

- O arquivo `podman-compose.dev.yml` ja associa todos os servicos a esta rede (veja `networks.ysh-b2b-dev-network`).

## 6. PostgreSQL e SSL

- Em desenvolvimento use `DATABASE_SSL=false` (padrao em `backend/.env.template`).
- Para ambientes com TLS habilitado, defina:

  ```text
  DATABASE_SSL=true
  DATABASE_SSL_REJECT_UNAUTHORIZED=true
  DATABASE_SSL_CA_FILE=/caminho/para/ca.pem
  ```

Manter estes passos garante um ambiente previsivel e evita o efeito cascata descrito no documento
"A Comprehensive Diagnostic and Resolution Guide for Node.js Development on Windows with Podman and Yarn".
