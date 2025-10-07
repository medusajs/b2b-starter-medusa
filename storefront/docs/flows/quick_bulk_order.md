# WIREFLOW — QUICK/BULK ORDER

## Passo a Passo

1. **Usuário acessa /catalogo ou /kits**: Lista de produtos com opção "Adicionar ao Carrinho" ou "Bulk Add".
2. **Quick Add**: Clica em ícone + para adicionar 1 unidade rapidamente.
3. **Bulk Add**: Abre modal/form para inserir SKUs e quantidades, ou upload CSV.
4. **Processa Lista**: Backend valida SKUs, aplica price list, adiciona ao carrinho múltiplo.
5. **Carrinho Múltiplo**: Usuário pode gerenciar múltiplos carrinhos por endereço/empresa.
6. **Salvar/Exportar Lista**: Opção para salvar listas de compra ou exportar CSV.
7. **Checkout**: Redireciona para /checkout com itens consolidados.

## Estados e Transições

- Adicionar → Validar → Carrinho → Checkout.
- Eventos: bulk_add_completed, cart_exported.

## Componentes UI

- Botão Quick Add: Ícone + em cards de produto.
- Modal Bulk Add: Textarea para SKUs, file upload CSV.
- Tabela Carrinho: Linhas editáveis, ações em massa (remover, alterar qty).
- Dropdown Carrinhos: Selecionar carrinho ativo.
