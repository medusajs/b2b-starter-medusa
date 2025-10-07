# Políticas — Price Lists × Customer Groups × Sales Channels

Sales Channels
- `ysh-b2b`: acesso autenticado; catálogo técnico; cotações; quick/bulk order.
- `ysh-b2c`: vitrine simplificada; kits recomendados; sem SKUs restritos.

Customer Groups (taxonomia base)
- `Residencial B1` (B2C)
- `Rural B2` (B2B Light)
- `Comercial/Serviços B3 (PME)` (B2B)
- `Condomínio GC` (B2B)
- `Integradores/Revenda` (B2B)
- `Indústria/Grandes` (B2B Enterprise)

Price Lists (exemplos iniciais)
1) `B2B-Integradores-2025Q4`
   - type: `override`
   - customer_groups: [`Integradores/Revenda`]
   - channels: [`ysh-b2b`]
   - regras: descontos escalonados por quantidade (ex.: ≥10 unidades -7%, ≥50 -12%).
   - validade: 2025-10-01 a 2025-12-31

2) `B2B-PME-Patamar1`
   - type: `override`
   - customer_groups: [`Comercial/Serviços B3 (PME)`]
   - channels: [`ysh-b2b`]
   - regras: tiers por ticket (ex.: R$15k -3%, R$50k -6%, R$150k -9%).
   - validade: rolling trimestral

3) `Residencial-Promo`
   - type: `sale`
   - customer_groups: [`Residencial B1`]
   - channels: [`ysh-b2c`]
   - regras: campanhas sazonais (ex.: kit on-grid -8%).
   - validade: conforme campanha

Diretrizes
- Manter catálogo único e controlar visibilidade por `sales_channel`.
- Toda diferenciação de preço via `price_lists` + `customer_groups`.
- Nomear `price_lists` com padrão: `<segmento>-<tier>-<YYYYQ#>`.
- Evitar lista por cliente individual, preferir por grupo/segmento; exceção: contratos enterprise.

Matriz de visibilidade (exemplo)
- `ysh-b2c` → visível: `Residencial B1` (preço base + `Residencial-Promo` quando ativo).
- `ysh-b2b` → visível: `Rural B2`, `B3 PME`, `GC`, `Integradores`, `Grandes` (preço via listas dedicadas).

