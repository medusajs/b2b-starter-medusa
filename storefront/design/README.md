# 🎨 Design — Tokens e Assets

```text
Este diretório serve como ponto de montagem para ativos de design que fazem parte do repositório (tokens, ícones, imagens otimizadas). Não suba arquivos binários pesados — prefira artefatos vetoriais ou links para o arquivo Figma/Design System central.

Estrutura sugerida

```tsx
design/
  tokens/
    colors.json
    spacing.json
```

  assets/
    icons/
    images/ (otimizadas)
  FIGMA_LINKS.md

```

Integração com código

- Exportar tokens para `tailwind.config.js` e mapear para classes utilitárias
- `src/styles/` importa tokens quando necessário

Observações

- Assets críticos para produção (logo, favicons, icons) devem estar em `public/`.
- Para arquivos pesados use o storage do time (S3 / Google Drive) e referencie por link.
