# 📱 FOTUS Dataset

**Fonte**: App FOTUS (app.fotus.com.br)
**Última atualização**: Outubro 2025

## 📊 Arquivos Incluídos

### Dados Principais

- **fotus-kits.json**: Kits solares padrão (~220 produtos → 3 únicos após deduplicação)
- **fotus-kits-hibridos.json**: Kits híbridos (~24 produtos → 1 único após deduplicação)

### Dados Brutos

- **fotus-kits.csv**: Dados originais em CSV
- **fotus-kits-hibridos.csv**: Kits híbridos em CSV
- **FOTUS-KITS-HIBRIDOS.MD**: Documentação dos kits híbridos

### Dados Processados

- **extracted/**: Dados extraídos e processados
  - `fotus-kits-extracted.json`
  - `fotus-kits-hibridos-extracted.json`
  - `fotus-kits-incompletos.json`

### Schemas

- **schemas/**: Schemas de validação
  - `fotus-kits-schema.json`
  - `fotus-kits-hibridos-schema.json`

## 🔍 Características dos Dados

- **Especialização**: Kits solares completos
- **Foco**: Mercado residencial e pequeno comercial
- **Potências**: 2,44 kWp a 16,10 kWp
- **Preços**: R$ 1,20 a R$ 1,88 por Wp
- **Taxa de duplicação**: ~98% (dados altamente redundantes)

## ⚠️ Problemas Identificados

1. **Duplicação massiva**: Mesmos produtos repetidos centenas de vezes
2. **Dados incompletos**: Muitos registros sem informações essenciais
3. **Inconsistências de preço**: Variações em produtos idênticos
4. **Estrutura irregular**: Dados não padronizados

## 🔄 Processamento Realizado

- ✅ Deduplicação por nome e especificações
- ✅ Consolidação de preços (média ponderada)
- ✅ Validação de schemas
- ✅ Extração de dados úteis
- ✅ Identificação de registros incompletos

## 📈 Produtos Únicos Finais

- **Kits padrão**: 3 produtos únicos
- **Kits híbridos**: 1 produto único
- **Total consolidado**: 4 kits FOTUS no catálogo unificado
