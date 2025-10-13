# 📚 Arquivos Legados - Catálogo YSH

**Status**: 🗄️ **ARQUIVADO** - Não usar para produção
**Data**: Outubro 2025

---

## 📁 Conteúdo

Este diretório contém **arquivos históricos** e **versões anteriores** do catálogo, mantidos para:

- 🔙 **Recuperação de dados** em caso de necessidade
- 📊 **Análises comparativas** de evolução do catálogo
- 🧪 **Referência histórica** de estruturas antigas
- 🔍 **Debugging** de problemas legados

---

## 🗂️ Tipos de Arquivos

### Backups (*.backup)

- Versões anteriores dos arquivos JSON
- **Não usar** - dados podem estar desatualizados
- Mantidos apenas para recuperação de emergência

### READMEs Antigos (README_*.md)

- `README_CONSOLIDATION.md` - Processo de consolidação inicial
- `README_UNIFIED.md` - Primeira versão unificada
- `SUMMARY.md` - Resumo executivo antigo

### Análises Históricas

- `CONSOLIDATION_ANALYSIS.md` - Análise do processo de consolidação
- `CONSOLIDATION_REPORT.json` - Relatório técnico de consolidação
- `schemas_enriched/` - Schemas experimentais

---

## ⚠️ Importante

- **NÃO USE** estes arquivos para desenvolvimento
- **USE SEMPRE** os arquivos em `/unified_schemas/`
- Estes dados podem estar **desatualizados** ou **inconsistentes**
- Mantidos apenas para **fins históricos**

---

## 🔄 Migração Completa

| Arquivo Legado | Arquivo Atual |
|----------------|---------------|
| `inverters.json.backup` | `../unified_schemas/inverters_unified.json` |
| `kits.json.backup` | `../unified_schemas/kits_unified.json` |
| `panels.json.backup` | `../unified_schemas/panels_unified.json` |
| `accessories.json.backup` | `../unified_schemas/accessories_unified.json` |

**👆 Use sempre os arquivos unificados para produção!**
