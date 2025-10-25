# Fluxo — Checkout Flexível (B2B)

Objetivo: suportar pagamento PJ, split shipping, agendamento e placeholders de BNPL/financiamento.

Stepper
1) Identificação/Empresa
2) Endereços e Split Shipping
3) Pagamento e Condições
4) Revisão e Confirmação

Detalhes por etapa
1) Identificação/Empresa
   - Selecionar empresa e responsável; inserir PO/OC (opcional).
   - Eventos: `checkout_step_viewed` {step_name: "identificacao"}.

2) Endereços e Split Shipping
   - Selecionar múltiplos endereços; agrupar itens por destino.
   - Agendamento de janela de entrega por endereço.
   - Calcular frete por grupo; exibir prazos.
   - Eventos: `checkout_step_viewed` {step_name: "enderecos"}.

3) Pagamento e Condições
   - Métodos: PIX, BOLETO, Cartão; "Condição negociada" (após aprovação interna).
   - Placeholder: BNPL/financiamento externo (link-out / webhook de retorno).
   - Eventos: `payment_selected` {method}.

4) Revisão e Confirmação
   - Resumo por split; impostos/retenções; termos.
   - Confirmar e gerar pedido.
   - Eventos: `order_placed` {order_id, value, channel}.

Validações
- Endereços insuficientes para split → bloquear com instrução clara.
- Método indisponível por valor/risco → sugerir alternativo.

Critérios de aceite
- Split shipping com fretes e prazos independentes.
- PIX/BOLETO/Cartão funcionais; registrar comprovantes/linhas digitáveis.
- Preservar condições da cotação convertida (quando aplicável).

