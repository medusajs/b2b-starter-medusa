# UI Kit — Componentes e Diretrizes

Componentes principais
- Filtros (checkbox, range, tags): com contagem e reset rápido.
- Tabelas densas: colunas configuráveis, ordenação, paginação/virtualização, ações em massa.
- Quick Add: input SKU + quantidade, autocomplete, validação inline.
- Modais de cotação/aprovação: formulário compacto, anexos, histórico.
- Stepper de checkout: etapas claras, breadcrumbs e salvamento de progresso.
- Cards de plano (EaaS/PPA): preço/mês, SLA, benefícios; destaque de diferenças.
- Compare drawer (kits): comparação lado a lado com atributos chave.
- Empty & Error states: orientados a tarefa com CTAs úteis.
- Toaster/Alertas: feedback imediato e não intrusivo.

Acessibilidade (a11y)
- Labels explícitas em todos inputs; `aria-*` nos componentes interativos.
- Foco visível; navegação por teclado completa (Tab/Shift+Tab, Enter/Espaço).
- Tabelas com `scope` em cabeçalhos, resumo e caption quando necessário.
- Cores com contraste mínimo 4.5:1; não usar cor como único indicador.

Responsividade
- Tabelas: overflow-x com sticky header/primeira coluna; colunas colapsáveis em mobile.
- Grids: 2–4 colunas mobile→desktop; cartões com hierarquia clara.
- Formulários: layout de uma coluna em mobile; agrupamento semântico.

Performance
- Virtualização de listas/tabelas para >200 linhas.
- Debounce em filtros e busca; pré-busca de páginas adjacentes.

