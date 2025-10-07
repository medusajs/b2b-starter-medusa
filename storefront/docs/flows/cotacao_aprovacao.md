# Fluxo — Cotação → Aprovação → Pedido

Objetivo: permitir que clientes B2B solicitem cotações, passem por revisão comercial e aprovações por alçada, convertendo em pedido com rastreabilidade.

Perfis envolvidos
- Solicitante (empresa.funcionário: requester)
- Revisor Comercial (ysh.comercial)
- Aprovador (empresa.funcionário: approver)
- Admin Empresa (empresa.admin)

Pré-condições
- Usuário autenticado no canal `ysh-b2b` e vinculado a uma `company`.
- `customer_group` e `price_list` ativos para o usuário/empresa.

Passo a passo
1) PDP/Lista → Ação `Pedir cotação`
   - Coleta: itens (sku, qty), notas e anexos (opcional).
   - Evento: `quote_requested` {company_id, items[], est_value, group_id}.
   - Resultado: cria `draft_quote` com status `pendente_revisao`.

2) Painel Empresa (`/cotacoes`) → Ver lista
   - Filtros por status: pendente_revisao, em_revisao, aguardando_aprovacao, aprovado, rejeitado, convertido.
   - Tabela densa com ações em massa.

3) Revisão Comercial (backoffice/medusa admin)
   - Aplica `price_list` adequada ao `customer_group` e quantidade.
   - Pode sugerir alternativas (itens equivalentes, prazos, SLAs).
   - Atualiza valores e validade da proposta.
   - Evento: `price_list_applied` {price_list_id, group_id, channel}.
   - Status: `aguardando_aprovacao`.

4) Aprovação por Alçada (Empresa)
   - Regras: limites por `role`/`budget_limit`.
   - Aprovar/Rejeitar com motivo e logs.
   - Evento: `quote_approved` {approver_id, quote_id, policy} ou `quote_rejected` {reason}.

5) Conversão em Pedido
   - Ação `Gerar pedido` cria `cart` com preços travados e leva ao `/checkout/flexivel`.
   - Evento: `checkout_step_viewed` {step_name: "start"}.
   - Status da cotação: `convertido` (vinculado a `order_id`).

Regras de negócio
- Validade de proposta (ex.: 7–15 dias) e revalidação automática de preço se expirar.
- Trilhas de auditoria: timestamps de revisão, aprovação e conversão.
- Notificações: e-mail e in-app para marcos (criada, revisada, aprovada, expirada).

Estados e erros
- Sem permissão de aprovação → mensagem clara e CTA para solicitar ao admin.
- Itens fora de estoque durante conversão → oferecer substitutos ou backorder.

Critérios de aceite
- Aplicação correta de `price_list` por `customer_group` e canal.
- Logs completos de aprovação com usuário e motivo.
- Conversão preserva preços/condições; gera pedido com vínculo à cotação.

