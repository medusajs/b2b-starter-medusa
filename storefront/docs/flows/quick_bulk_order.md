# Fluxo — Quick/Bulk Order

Objetivo: acelerar adição de itens por SKU e importação CSV para empresas B2B com compras recorrentes.

Perfis
- Comprador B2B (empresa.funcionário: buyer)
- Admin Empresa (para listas salvas compartilhadas)

Entradas suportadas
- Campo `Adicionar por SKU`: `SKU`, `QTD` (com autocomplete opcional)
- Upload CSV: colunas `sku, quantity, notes` (UTF-8, separador vírgula)

Passo a passo
1) Acessar `Quick/Bulk Order` (menu B2B)
   - Importar CSV ou inserir linhas manualmente.
   - Validar SKUs desconhecidos e quantidades mínimas/múltiplos.
   - Evento: `bulk_add_completed` {skus[], count, list_id}.

2) Carrinho múltiplo
   - Selecionar carrinho alvo ou criar novo (rótulo por projeto/obra).
   - Ações em massa: remover, mover para outro carrinho, salvar como lista.

3) Listas de compra
   - Salvar lista (privada/compartilhada na empresa).
   - Exportar lista/carrinho (CSV) para ERP ou aprovação externa.

Validações
- SKU inválido → destacar linha, oferecer busca por similar.
- Quantidade fora do múltiplo mínimo → sugerir arredondamento.
- Itens restritos ao canal → informar indisponibilidade no `ysh-b2c`.

Critérios de aceite
- Importar CSV com 10k+ linhas de forma robusta (streaming/virtualização UI).
- Aplicar `price_list` vigente no preview do carrinho.
- Export CSV fiel ao carrinho (SKU, QTD, preço unitário e total, observações).

