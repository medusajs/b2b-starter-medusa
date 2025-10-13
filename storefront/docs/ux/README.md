# 📐 UX & Strategy — Centro de Artefatos

Objetivo: concentrar aqui todos os artefatos, templates e decisões de UX, IA e pesquisa aplicáveis ao storefront YSH.

Por que existe

- Evitar dispersão de resultados de pesquisa, personas e jornadas entre vários arquivos.
- Dar entrada única para novos estudos, testes de usabilidade e políticas de microcopy e acessibilidade.

Estrutura (exemplo)

docs/ux/

- README.md (este arquivo)
- personas.md
- research-plan-template.md
- usability-test-plan.md
- journey-mapping.md
- microcopy-guidelines.md
- accessibility-checklist.md
- design-system-guidelines.md
- metrics-and-kpis.md
- templates/
  - usability-test-script.md
  - interview-guide.md
  - synthesis-template.md

Como usar

1. Para iniciar um estudo, reutilize `research-plan-template.md` e coloque os artefatos em `docs/ux/artifacts/` (journey-maps, gravações, sínteses).
2. Atualize `docs/DOCUMENTATION_INDEX.md` se adicionar arquivos permanentes.
3. Antes de mover documentos para `docs/ux/`, verifique tags e referências em `docs/INDEX.md` e rotas do projeto.

Responsáveis

- UX Strategist (owner)
- Product Designer
- Research

Convenções de nomeação

- Pesquisas: `research_*.md`
- Personas: `persona_*.md` ou `personas.md`
- Testes: `usability_*` ou colocar em `templates/`
