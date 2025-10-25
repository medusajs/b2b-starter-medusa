# Estados Vazios, Erros, Avisos e Sucesso

## Cotação (B2B)
- Vazio: Você ainda não tem cotações. [Pedir cotação] para começar.
- Em revisão: Sua cotação está em revisão comercial. Você receberá uma notificação quando houver atualização.
- Aguardando aprovação: Este pedido precisa de aprovação de {role}. Envie para aprovação.
- Expirada: Esta cotação expirou. Solicite a revalidação de preços.
- Sucesso: Pronto! Sua solicitação de cotação foi enviada. Acompanhe em {rotaPainel}.
- Erro (criação): Não foi possível criar a cotação. Verifique os itens e tente novamente.

## Empresa
- Sem funcionários: Convide sua equipe para comprar com você. [Convidar pessoas]
- Sem endereços: Cadastre pelo menos um endereço para entrega e faturamento.
- Permissão: Você não tem permissão para esta ação. Fale com um administrador.

## Quick/Bulk Order
- Vazio: Importe um CSV ou adicione SKUs manualmente para começar. Exemplo de cabeçalho: sku,quantity,notes
- Sucesso (importação): {x} itens adicionados, {y} com erro. [Baixar relatório]
- Erro (SKU): SKU inválido ou indisponível neste canal.
- Erro (quantidade): Quantidade fora do múltiplo mínimo. Ajuste para {múltiplo}.
- Erro (CSV): Arquivo CSV inválido. Use cabeçalho sku,quantity,notes em UTF-8.

## PLP/Store
- Vazio: Nenhum item encontrado. Ajuste os filtros.
- Alerta: Itens restritos ao seu canal não são exibidos.

## PDP
- Erro (variante): Selecione uma variação antes de adicionar ao carrinho.
- Alerta (estoque): Estoque baixo — restam {qtd} unidades.

## Checkout
- Passos: Itens → Endereço → Pagamento → Revisão → Confirmação
- Erro (endereço): Endereço incompleto para entrega. Revise os campos obrigatórios.
- Erro (pagamento): Método de pagamento indisponível para este pedido. Tente outro método.
- Sucesso: Pedido confirmado! Enviamos a confirmação para {email}.

## Pós-venda
- Boas-vindas: Bem-vindo(a) ao seu painel solar. Acompanhe geração e economia estimada.
- Ticket vazio: Sem chamados no momento. Abra um chamado para relatar um problema.

## Campos Críticos (padrão de erro)
- Estrutura: O que deu errado + Como corrigir + Exemplo.
- E-mail: Não conseguimos validar o e-mail. Corrija o formato (ex.: {exemplo_email}).
- CPF: Não conseguimos validar o CPF. Digite apenas números.
- CNPJ: Não conseguimos validar o CNPJ. Digite apenas números.
- Telefone: Informe DDD e número, por exemplo (11) 91234-5678.
- CEP: Use o formato 00000-000.
- Cartão: Revise número, validade (MM/AA) e CVV.

