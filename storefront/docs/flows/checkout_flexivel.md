# WIREFLOW — CHECKOUT FLEXÍVEL

## Passo a Passo

1. **Carrinho → Checkout**: Usuário clica "Finalizar Compra", redireciona para /checkout/flexivel.
2. **Seleção de Endereço**: Escolhe endereço de entrega (múltiplos para empresa).
3. **Pagamento**: Opções: Cartão, PIX, Boleto; BNPL (placeholder), Financiamento Externo.
4. **Split Shipping**: Divide pedido em múltiplas entregas por endereço.
5. **Agendamento**: Seleciona data/hora de entrega.
6. **Revisão e Confirmação**: Mostra resumo, totais com impostos.
7. **Pagamento**: Processa via gateway, confirma pedido.
8. **Confirmação**: Página de sucesso, redireciona para /painel.

## Estados e Transições

- Endereço → Pagamento → Split → Agendamento → Confirmação → Pago.
- Eventos: checkout_step_viewed, payment_selected, order_placed.

## Componentes UI

- Stepper Checkout: Passos visuais (endereço, pagamento, revisão).
- Form Endereço: Select múltiplo para empresas.
- Opções Pagamento: Cards com ícones (PIX, cartão).
- Modal Split: Tabela para dividir itens por endereço.
- Calendário Agendamento: Date picker.
