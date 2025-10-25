# ARQUITETURA DE INFORMAÇÃO & NAVEGAÇÃO - YSH Store

## IA de Alto Nível (Site Map)

O site map é organizado em grupos de rotas para segmentação B2B/B2C, utilizando Next.js App Router com route groups `(b2b)`, `(b2c)`, `(shared)`.

### Estrutura Principal

- **/** (Home): Página inicial com hero banner, destaques de kits por modalidade, soluções personalizadas por classe consumidora.
- **/solucoes**: Categorias por necessidade energética (economia de energia, backup de energia, mobilidade elétrica), com filtros dinâmicos por classe (B1/B2/B3/Condomínio/PME/Indústria) e modalidade (on-grid, híbrido, off-grid, EaaS/PPA).
- **/kits**: Grid responsivo de kits solares, com filtros por potência, modalidade, classe e preço. Inclui cards com ROI estimado.
- **/catalogo**: Catálogo técnico B2B por marca/linha (módulos, inversores, baterias, EV chargers, acessórios). Filtros avançados por especificações técnicas.
- **/empresa**: Dashboard B2B para gestão de conta empresa (funcionários, endereços, limites, aprovações). Acesso restrito a usuários de empresas.
- **/cotacoes**: Lista de cotações solicitadas, com status (pendente, aprovada, rejeitada).
- **/orcamentos**: Alias para /cotacoes, para compatibilidade semântica.
- **/checkout/{tradicional,flexivel,alternativo}**: Fluxos de checkout diferenciados (tradicional: padrão, flexível: múltiplos endereços/split, alternativo: BNPL/financiamento).
- **/painel**: Área pós-venda (histórico de pedidos, suporte, faturas).
- **/ajuda**: FAQ regulatória, contato com especialista, glossário de termos solares.

### Grupos de Rotas

- `(b2b)`: Rotas exclusivas B2B (/empresa, /catalogo, /cotacoes).
- `(b2c)`: Rotas simplificadas B2C (/kits, /solucoes).
- `(shared)`: Rotas comuns (/checkout, /painel, /ajuda).

## Roteiro de Discovery → Consideration → Decision → Purchase → Pós-Venda

Mapeamento por Classe Consumidora e Modalidade Energética.

### Classe B1 (Residencial)

- **Discovery**: Home → Kits recomendados (on-grid básico).
- **Consideration**: Comparação de kits via /kits, cálculo de ROI.
- **Decision**: Cotação simples via modal em PDP.
- **Purchase**: Checkout flexível (PIX/cartão).
- **Pós-Venda**: Painel com monitoramento de geração.

### Classe B2 (Rural)

- **Discovery**: /solucoes/off-grid → Kits off-grid.
- **Consideration**: Filtros por autonomia, comparação técnica.
- **Decision**: Cotação com especialista.
- **Purchase**: Checkout alternativo (financiamento rural).
- **Pós-Venda**: Suporte remoto, manutenção.

### Classe B3 (Comercial/Serviços PME)

- **Discovery**: /catalogo → Produtos por linha.
- **Consideration**: Bulk order, cotação para desconto escalonado.
- **Decision**: Aprovação interna por limite.
- **Purchase**: Checkout tradicional com split shipping.
- **Pós-Venda**: Painel com relatórios de consumo.

### Condomínios (Geração Compartilhada)

- **Discovery**: /solucoes/geracao-compartilhada.
- **Consideration**: Kits para telhado coletivo.
- **Decision**: Cotação coletiva, aprovações.
- **Purchase**: Checkout flexível com múltiplos endereços.
- **Pós-Venda**: Gestão de faturamento compartilhado.

### Grandes Contas (Indústria)

- **Discovery**: Contato direto via /ajuda.
- **Consideration**: Proposta customizada EaaS/PPA.
- **Decision**: Contrato longo prazo.
- **Purchase**: Checkout alternativo com SLA.
- **Pós-Venda**: Dashboard enterprise.

Modalidades: on-grid (foco economia), híbrido (backup), off-grid (autonomia), EaaS/PPA (serviço).

## Tabelas "Quem Vê o Quê"

### Disponibilidade por Sales Channel

| Recurso | ysh-b2b | ysh-b2c |
|---------|---------|---------|
| Catálogo Técnico | ✅ | ❌ |
| Preços B2B | ✅ | ❌ |
| Cotação | ✅ | ✅ (simplificada) |
| Aprovações | ✅ | ❌ |
| Bulk Order | ✅ | ❌ |
| Kits Recomendados | ✅ | ✅ |
| Múltiplos Endereços | ✅ | ❌ |

### Disponibilidade por Customer Group

| Recurso | Residencial B1 | Rural B2 | Comercial B3 | Condomínios | Integradores | Indústria |
|---------|---------------|----------|--------------|-------------|--------------|-----------|
| Price List Override | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cotação Obrigatória | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Aprovações | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bulk Order | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| EaaS/PPA | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Gaps de Conteúdo Identificados

- Conteúdo para EaaS/PPA: páginas de plano, SLA, estudos de caso.
- FAQ Regulatória: legislação solar brasileira.
- Glossário: termos técnicos em PT-BR.
- Estudos de Caso: por classe e modalidade.

## Yello Solar Hub (YSH) — Storefront B2B/B2C

Visão e especificação de UX/IA para customização do template "medusajs/b2b-starter-medusa" com foco em jornadas por Classe (B1/B2/B3/GC), Perfil energético (consumo/geração) e Modalidade (on-grid, híbrido/backup, off-grid, autoconsumo remoto, geração compartilhada, EaaS/PPA).

## Objetivos

- Refletir Classe × Perfil × Modalidade na IA, navegação, filtros e checkout.
- Orquestrar recursos B2B (empresas, múltiplos carrinhos, cotações, aprovações, endereços, limites) + Medusa (customer groups, price lists, sales channels).
- Entregar artefatos para dev: rotas, eventos, esquemas de conteúdo, critérios de aceite.

## Arquitetura de Informação (IA) e Navegação

Rotas principais (Next.js App Router):

- `/` Home
- `/solucoes` Categorias por necessidade: economia, backup/continuidade, mobilidade elétrica
- `/kits` Grid com filtros (classe, modalidade, potência, ROI)
- `/catalogo` B2B por marca/linha (tabelas densas)
- `/empresa` Conta Empresa (funcionários, papéis, endereços, limites, políticas)
- `/cotacoes` Cotações (listar, criar, aprovar, converter)
- `/orcamentos` Orçamentos rápidos (B2C)
- `/checkout` {`tradicional`, `flexivel`, `alternativo`}
- `/painel` Pós-venda (pedidos, entregas, instalações, tickets)
- `/ajuda` FAQ, regulatório, contato

Agrupamentos (route groups):

- `(shared)`: componentes reutilizáveis, autenticação, layout base
- `(b2b)`: `/empresa`, `/cotacoes`, `/catalogo`, `/checkout/flexivel`, `/painel`
- `(b2c)`: `/kits`, `/solucoes`, `/checkout/tradicional`, `/orcamentos`

Navegação e menus

- Topo: `Soluções`, `Kits`, `Catálogo (B2B)`, `Cotações`, `Empresa`, `Ajuda`
- Acesso rápido B2B (autenticado): `Quick/Bulk Order`, `Minhas Cotações`, `Aprovações`
- Rodapé: `Sobre`, `Regulatório/ANEEL`, `Estudos de Caso`, `Parcerias`, `Contato`

Estados de contexto

- Canal (`ysh-b2b` vs `ysh-b2c`) determina catálogo e visibilidade de preço.
- Grupo de cliente (Customer Group) determina price list ativa e políticas.

## Jornadas por Classe × Modalidade

Estrutura (descoberta → consideração → decisão → compra → pós-venda) com variações por classe e modalidade:

Residencial B1 (consumo; on-grid, híbrido/backup)

- Descoberta: calculadora de conta/consumo; quiz de perfil; landing de ROI.
- Consideração: comparação de kits on-grid vs híbrido; simulação de economia/backup.
- Decisão: CTA `Falar com especialista` vs `Cotação instantânea`.
- Compra: checkout tradicional (PIX/BOLETO/cartão); opção de financiamento (placeholder).
- Pós-venda: painel de instalação, garantia e suporte.

Comercial/Serviços B3 (PME; on-grid, híbrido/backup, EaaS)

- Descoberta: estudo de caso por segmento; estimativas de demanda e demanda contratada.
- Consideração: TCO/ROI; políticas de aprovação e limites por alçada.
- Decisão: fluxo de cotação com revisão comercial e aprovação interna.
- Compra: checkout flexível com split shipping e faturamento PJ.
- Pós-venda: SLAs, múltiplos endereços, relatórios de consumo/geração.

Rural B2 (consumo e geração; off-grid, híbrido)

- Descoberta: cenários de autonomia; dimensionamento de baterias/bombas.
- Consideração: kits off-grid, robustez e manutenção.
- Decisão: cotação técnica com anexos (plantas, fotos).
- Compra: pagamento BOLETO/PIX; agendamento de entrega.
- Pós-venda: assistência e peças de reposição.

Condomínios (GC; geração compartilhada, autoconsumo remoto)

- Descoberta: explicação regulatória (ANEEL), rateio entre unidades.
- Consideração: modelos GC vs autoconsumo; contratos e adesões.
- Decisão: propostas multiunidade; aprovações por síndico/conselho.
- Compra: EaaS/PPA (serviço) com planos e SLAs.
- Pós-venda: portal de unidades, faturação recorrente.

Indústria/Grandes Contas (B2B Enterprise; on-grid, EaaS/PPA)

- Descoberta: auditoria energética; metas ESG.
- Consideração: PPA/EaaS; integrações e compliance.
- Decisão: RFP; cotações multi-lote; aprovações complexas.
- Compra: contratos; milestones; split de entregas.
- Pós-venda: relatórios avançados, integrações BI.

## Quem vê o quê (Sales Channels × Customer Groups)

Sales Channels

- `ysh-b2c`: vitrine simplificada; kits recomendados; preços públicos; sem SKUs restritos.
- `ysh-b2b`: acesso autenticado; catálogo técnico; quick/bulk order; cotações e aprovações.

Customer Groups (exemplos)

- `Residencial B1`, `Rural B2`, `Comercial/Serviços B3 (PME)`, `Condomínio GC`, `Integradores/Revenda`, `Indústria/Grandes`.

Visibilidade

- `ysh-b2c` mostra: `Residencial B1` e conteúdos públicos (kits/soluções). Sem acesso a `Quick/Bulk`.
- `ysh-b2b` mostra: todos os grupos B2B (Rural B2, B3 PME, GC, Integradores, Grandes). Preços via Price Lists.
- SKUs técnicos (ex.: inversores industriais) somente no `ysh-b2b`.

## Conteúdos e gaps

- Calculadoras: consumo/ROI (B1), TCO/ROI (B3/Grandes), dimensionamento off-grid (B2).
- Regulatório: GC e autoconsumo remoto (ANEEL) — criar FAQ e guias.
- Estudos de caso: por classe/segmento (B3, GC, Indústria) — pipeline editorial.
- Glossário: termos técnicos, impostos e modalidades — base em `/docs/copy/glossario.md`.

## Convenções técnicas (Next.js + Medusa)

- App Router com grupos `(shared)`, `(b2b)`, `(b2c)`; server components para data loading e caching.
- Data sources (Medusa): `products`, `price_lists`, `customer_groups`, `sales_channels`, `companies`, `employees`, `quotes`, `carts`, `orders`.
- Autorização: ACL por empresa/funcionário/role em páginas `(b2b)`.

## Critérios de Aceite (DoD)

- B2B vê preços corretos por `price_list + customer_group` no canal `ysh-b2b`.
- Empresa: gerencia funcionários (roles), endereços, múltiplos carrinhos, cota/aprovação.
- Quick/Bulk: por SKU e CSV; export de carrinho.
- Analytics: eventos com payloads válidos; funil cotação→pedido no painel.
- Conteúdos PT-BR, acessíveis e responsivos; estados vazios/erros com microcopy.

## Decisões de UX (Design Rationale)

- Separar catálogo por `sales_channel` para proteção de SKUs e simplicidade de permissão.
- Diferenciação de preço somente via `price_lists` e `customer_groups` para manter catálogo único.
- Checkout flexível para B2B (split shipping, faturação PJ) e tradicional para B2C.
- Tabelas densas com ações em massa e virtualização para desempenho.
- Eventos padronizados para mensuração e growth (AARRR + B2B KPIs).

## Riscos e Trade-offs

- Complexidade de `price_lists` por tiers pode aumentar manutenção — mitigar com convenções de nomenclatura e validade por trimestre.
- Catálogo por canal reduz reutilização, mas evita exposição indevida de SKUs.
- Aprovações multi-alçada elevam fricção — compensar com presets e SLAs.
- Flexibilidade de checkout vs simplicidade — segmentar por canal.

## Checklist de QA Funcional

- Autenticação/ACL `(b2b)`: acesso a `/empresa`, `/cotacoes` e quick/bulk.
- Price list: aplicação por grupo e canal; queda para preço padrão em ausência.
- Cotações: criar, revisar (comercial), aprovar (alçada), converter em pedido.
- Aprovações: bloqueio por limite; logs e trilha de aprovação.
- Quick/Bulk: adicionar via SKU/CSV; validações; export de carrinho.
- Checkout: métodos PIX/BOLETO/cartão; split shipping; notas fiscais.
- Analytics: todos eventos com payloads completos e contextos (canal, group_id).

## Plano de Rollout

- Piloto: `Integradores/Revenda (B2B)` com `B2B-Integradores-2025Q4`.
- Fase 2: `PME B3 (B2B)` com `B2B-PME-Patamar1` + quick/bulk.
- Fase 3: `Condomínios GC` com planos EaaS/PPA e faturação recorrente.
