# POLÍTICAS DE PREÇO, CANAIS & GRUPOS - YSH Store

## Taxonomia de Clientes (Customer Groups)

Baseado em classes consumidoras e perfis energéticos:

- **Residencial B1 (B2C)**: Consumidores finais residenciais, foco em kits simples on-grid.
- **Rural B2 (B2B Light)**: Proprietários rurais, off-grid e híbrido.
- **Comercial/Serviços B3 (PME/PJ)**: Pequenas e médias empresas comerciais.
- **Condomínio GC**: Condomínios com geração compartilhada.
- **Integradores/Revenda**: Parceiros revendedores, acesso wholesale.
- **Indústria/Grandes (B2B Enterprise)**: Grandes contas industriais, EaaS/PPA.

## Sales Channels

- **ysh-b2b**: Canal autenticado para B2B, catálogo técnico, bulk order, cotação obrigatória.
- **ysh-b2c**: Canal público para B2C, kits recomendados, checkout simplificado.

## Matriz Price Lists × Customer Groups

Price Lists aplicam overrides ou sales por grupo, com condições escalonadas.

### Price List 1: "B2B-Integradores-2025Q4"

- **Customer Groups**: Integradores/Revenda
- **Type**: override
- **Channels**: ysh-b2b
- **Condições**: Desconto 20-30% escalonado por volume (Q1: 20%, Q2: 25%, Q3: 30%).
- **Exemplo**: Módulo solar R$ 500 → R$ 400 (Q1).

### Price List 2: "B2B-PME-Patamar1"

- **Customer Groups**: Comercial/Serviços B3
- **Type**: override
- **Channels**: ysh-b2b
- **Condições**: Desconto 10-15% para primeiras compras, tiers por faturamento anual.
- **Exemplo**: Kit completo R$ 50.000 → R$ 45.000.

### Price List 3: "Residencial-Promo"

- **Customer Groups**: Residencial B1
- **Type**: sale
- **Channels**: ysh-b2c
- **Condições**: Promo sazonal, desconto fixo 5% em kits selecionados.
- **Exemplo**: Kit básico R$ 10.000 → R$ 9.500.

## Mapeamento de Produtos por Canal

Produtos restritos a ysh-b2b: acessórios técnicos, baterias industriais.
Produtos ysh-b2c: kits pré-configurados, EV chargers básicos.
