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
