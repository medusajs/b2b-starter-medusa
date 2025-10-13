# 🎯 Schemas Unificados e Consolidados

**Versão**: 2.0.0
**Última atualização**: Outubro 2025
**Status**: ✅ PRODUÇÃO

Este diretório contém os **schemas unificados** que consolidam produtos de todos os distribuidores em arquivos organizados por categoria. Use estes arquivos para:

- 🛍️ **Catálogo de produtos para clientes**
- 🤖 **Agentes de dimensionamento e recomendação**
- 💰 **Sistema de cotação e precificação**
- 📊 **Análises e relatórios**

---

## 📁 Arquivos Principais

### Por Categoria de Produto

| Arquivo | Produtos | Descrição |
|---------|----------|-----------|
| `inverters_unified.json` | 490 | Todos os inversores (grid-tie, off-grid, híbridos, micro) |
| `kits_unified.json` | 336 | Kits solares completos |
| `ev_chargers_unified.json` | 83 | Carregadores para veículos elétricos |
| `panels_unified.json` | 29 | Painéis fotovoltaicos |
| `batteries_unified.json` | 21 | Baterias e sistemas de armazenamento |
| `structures_unified.json` | 30 | Estruturas de fixação |
| `stringboxes_unified.json` | 13 | String boxes e proteções CC |
| `cables_unified.json` | 35 | Cabos e componentes elétricos |
| `accessories_unified.json` | 18 | Acessórios diversos |
| `controllers_unified.json` | 17 | Controladores de carga MPPT |
| `posts_unified.json` | 6 | Postes de iluminação solar |
| `others_unified.json` | 73 | Outros produtos |

### Metadados e Controle

| Arquivo | Propósito |
|---------|-----------|
| `MASTER_INDEX.json` | Índice completo de todos os produtos |
| `INTEGRITY_REPORT.json` | Relatório de qualidade dos dados |
| `CONSOLIDATION_METADATA.json` | Metadados do processo de consolidação |
| `VALIDATION_REPORT.json` | Relatório de validação de schemas |

---

## 🔍 Estrutura Padrão dos Produtos

Todos os produtos seguem esta estrutura unificada:

```json
{
  "id": "string (único)",
  "name": "string",
  "manufacturer": "string",
  "model": "string",
  "category": "string",
  "price": "string (BRL formatado)",
  "image": "string (caminho local)",
  "source": "string (distribuidor)",
  "availability": "string",
  "description": "string",
  "specifications": {
    "power": "string",
    "voltage": "string",
    "efficiency": "string"
  },
  "pricing": {
    "original_price": "number",
    "currency": "BRL",
    "price_per_wp": "number"
  }
}
```

---

## 📊 Estatísticas Totais

- **Total de produtos**: 1.161
- **Distribuidores**: 5 (NeoSolar, Solfácil, ODEX, FOTUS, FortLev)
- **Categorias**: 12
- **Taxa de completude**: 99%+
- **Produtos com imagens**: ~79%

---

## 🔄 Atualizações

Os arquivos são atualizados automaticamente quando:

1. Novos dados de distribuidores são processados
2. Duplicatas são identificadas e removidas
3. Preços são atualizados
4. Novos produtos são adicionados

---

## ⚠️ Importante

- **Use SEMPRE estes arquivos para produção**
- Dados são validados e normalizados
- Duplicatas foram removidas
- Preços estão padronizados em BRL
- Para dados específicos por distribuidor, consulte `/distributor_datasets/`
