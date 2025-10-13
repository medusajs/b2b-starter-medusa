# @ysh/ui — Design System (minimal)

Pacote mínimo para componentes compartilhados do storefront. Contém tokens iniciais, componentes e stories para Storybook.

Quick start

1. Instale dependências na raiz do `storefront/` (ex.: `yarn`)
2. Rodar storybook: `yarn workspace @ysh/ui storybook` ou ir para `packages/ui` e executar `pnpm/storybook` dependendo do monorepo
3. Consumir o pacote localmente via `file:./packages/ui` (já configurado no `package.json` do storefront)

Contribuição

- Escreva componentes em `src/components`
- Adicione stories em `stories/`
- Exporte novas APIs em `src/index.ts`
