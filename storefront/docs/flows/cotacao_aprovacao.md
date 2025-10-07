# WIREFLOW — COTAÇÃO & APROVAÇÃO

## Passo a Passo

1. **Usuário navega para PDP ou Lista de Produtos** (ex.: /catalogo ou /kits).
2. **Clica em "Pedir Cotação"**: Abre modal com itens selecionados, quantidades, notas adicionais.
3. **Submete Cotação**: Cria draft quote no backend (Medusa), status: pendente.
4. **Redireciona para /empresa/cotacoes**: Painel mostra cotação pendente, com detalhes.
5. **Revisão Comercial**: Admin/Comercial aplica price list, ajusta preços, adiciona comentários.
6. **Submete para Aprovação**: Se valor > limite empresa, envia para aprovação interna.
7. **Aprovação Interna**: Aprovador (role específico) aprova/rejeita via painel.
8. **Cotações Aprovadas**: Usuário recebe notificação, pode "Gerar Pedido".
9. **Gera Pedido**: Converte quote em cart/order, redireciona para checkout.

## Estados e Transições

- Pendente → Revisão → Aprovação → Aprovada/Rejeitada.
- Eventos: quote_requested, quote_approved, quote_rejected.

## Componentes UI

- Modal de Cotação: Form com lista de itens, inputs quantidade/notas.
- Tabela de Cotações: Status badges, ações (ver detalhes, aprovar).
- Stepper de Aprovação: Passos visuais.
