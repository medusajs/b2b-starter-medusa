# 📚 YSH Store - Documentação UX & Implementação

## 🎯 Visão Geral

Esta pasta contém toda a documentação de UX Strategy, Arquitetura de Informação e Implementação Técnica do storefront B2B/B2C da Yello Solar Hub.

## 📂 Estrutura

```
docs/
├── README.md (este arquivo)
├── EXECUTIVE_SUMMARY.md (resumo executivo, decisões, QA, rollout)
├── INTEGRATION_GUIDE.md (guia técnico de integração)
├── IA_YSH_Store.md (arquitetura de informação, site map)
├── analytics/
│   └── events.json (taxonomia de eventos)
├── backlog/
│   └── experiments.md (backlog A/B tests)
├── copy/
│   ├── microcopy.md (copies PT-BR, estados vazios)
│   └── componentes_ui.md (especificação componentes UI)
├── flows/
│   ├── cotacao_aprovacao.md (fluxo cotação & aprovação)
│   ├── quick_bulk_order.md (fluxo bulk/quick order)
│   └── checkout_flexivel.md (fluxo checkout flexível)
├── policies/
│   └── pricing_channels_groups.md (price lists, grupos, canais)
└── routes/
    └── manifest.yml (rotas, loaders, eventos, ACL)
```

## 🚀 Quick Start

### Para Product Managers

1. Leia [`EXECUTIVE_SUMMARY.md`](./EXECUTIVE_SUMMARY.md) para decisões de UX e plano de rollout
2. Revise [`IA_YSH_Store.md`](./IA_YSH_Store.md) para entender jornadas por classe
3. Consulte [`backlog/experiments.md`](./backlog/experiments.md) para priorizar testes

### Para Desenvolvedores

1. Comece com [`INTEGRATION_GUIDE.md`](./INTEGRATION_GUIDE.md)
2. Revise [`routes/manifest.yml`](./routes/manifest.yml) para estrutura de rotas
3. Implemente eventos de [`analytics/events.json`](./analytics/events.json)

### Para Designers

1. Consulte [`copy/componentes_ui.md`](./copy/componentes_ui.md) para UI kit
2. Revise [`copy/microcopy.md`](./copy/microcopy.md) para voz e tom
3. Consulte [`policies/pricing_channels_groups.md`](./policies/pricing_channels_groups.md) para segmentação

### Para Analytics

1. Implemente taxonomia de [`analytics/events.json`](./analytics/events.json)
2. Configure experimentos de [`backlog/experiments.md`](./backlog/experiments.md)
3. Crie dashboards com métricas de [`EXECUTIVE_SUMMARY.md`](./EXECUTIVE_SUMMARY.md)

## 📦 Principais Entregáveis

### ✅ Implementados

- Componentes home (SolutionsByClass, ModalidadesGrid)
- Página /solucoes com filtros cliente-side
- Contexto SalesChannelContext (B2B/B2C)
- ProductCard com badges YSH (modalidade, ROI)
- Events de analytics (8 eventos)
- Status expandido de cotações

### 🚧 Pendentes

- Integração com Medusa API (customer groups, price lists)
- Modal de cotação reutilizável
- Bulk order com upload CSV
- Checkout flexível (split shipping)
- Aplicação dinâmica de price lists

## 🎨 Jornadas por Classe Consumidora

| Classe | Modalidades | Foco | CTA |
|--------|-------------|------|-----|
| Residencial B1 | On-grid, Híbrido | Economia | "Ver kits residenciais" |
| Rural B2 | Off-grid, Híbrido | Autonomia | "Ver soluções rurais" |
| Comercial B3 | On-grid, EaaS | Redução custo | "Cotação empresarial" |
| Condomínios | Geração compartilhada | Coletivo | "Soluções coletivas" |
| Indústria | EaaS, PPA | Zero capex | "Falar com especialista" |

## 🔑 Conceitos-Chave

### Customer Groups

Segmentação por classe consumidora e perfil energético:

- `residencial-b1`, `rural-b2`, `comercial-b3`, `condominios`, `integradores`, `industria`

### Sales Channels

- `ysh-b2b`: Acesso autenticado, bulk order, cotações
- `ysh-b2c`: Catálogo simplificado, kits recomendados

### Price Lists

Políticas de preço diferenciadas:

- `b2b-integradores-2025q4`: Desconto 20-30% escalonado
- `b2b-pme-patamar1`: Desconto 10-15% primeira compra
- `residencial-promo`: Desconto sazonal 5%

### Modalidades Energéticas

- **On-Grid**: Conectado à rede, foco economia
- **Híbrido**: Rede + baterias, backup
- **Off-Grid**: Autônomo, áreas remotas
- **EaaS/PPA**: Energia como serviço, zero capex

## 📊 Métricas de Sucesso

### AARRR

- **Activation**: Tempo até primeira cotação <10min
- **Retention**: Taxa de recompra 90 dias >20%
- **Revenue**: AOP B2C R$ 15k, B2B R$ 80k

### B2B KPIs

- Taxa conversão cotação→pedido >30%
- Tempo aprovação <48h
- % bulk order >40%

## 🔗 Links Externos

- [Medusa.js Docs](https://docs.medusajs.com)
- [B2B Starter Repo](https://github.com/medusajs/b2b-starter-medusa)
- [Next.js App Router](https://nextjs.org/docs/app)

## 📝 Notas de Implementação

### Prioridade Alta

1. Integrar SalesChannelContext no layout raiz
2. Conectar filtros /solucoes com Medusa API
3. Implementar modal de cotação com tracking

### Prioridade Média

4. Bulk order com upload CSV
5. Checkout flexível (múltiplos endereços)
6. Dashboard analytics

### Prioridade Baixa

7. Quiz de perfil energético
8. Calculadora ROI interativa
9. Estudos de caso por classe

## 🆘 Suporte

Para dúvidas sobre:

- **UX/Design**: Consultar `EXECUTIVE_SUMMARY.md` → Decisões de UX
- **Implementação**: Consultar `INTEGRATION_GUIDE.md`
- **Analytics**: Consultar `analytics/events.json`

---

**Última atualização**: 2025-10-07  
**Versão**: 1.0.0  
**Autor**: UX Strategist Agent - YSH Store
