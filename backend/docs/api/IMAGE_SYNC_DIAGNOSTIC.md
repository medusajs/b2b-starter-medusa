# Image Synchronization Diagnostic Report

**Data**: 12 de Outubro de 2025  
**Status**: ❌ **CRITICAL - Image Mapping Broken**

---

## 🔍 Problema Identificado

A sincronização entre produtos e imagens está **quebrada** devido à perda de informação durante o processo de consolidação de dados.

### Estatísticas

- **IMAGE_MAP.json**: 854 SKUs, 861 imagens ✅
- **Produtos Consolidados**: 1,123 produtos
- **Match Atual**: **5 produtos (0.4%)** ❌

---

## 🚨 Root Cause Analysis

### 1. **SKUs Numéricos Perdidos**

**Antes (fonte original)**:

```json
{
  "sku": "112369",
  "name": "Inversor XYZ",
  "image": "/path/to/112369.jpg"
}
```

**Depois (consolidado)**:

```json
{
  "id": "odex_inverters_ODEX-PAINEL-ODEX-585W",
  "name": "Painel Solar Odex 585W",
  "image": ""  // ❌ VAZIO!
}
```

### 2. **Campo `image` Vazio**

A maioria dos produtos tem `"image": ""` após a consolidação:

```json
{
  "id": "neosolar_inverters_22916",
  "name": "Microinversor Deye SUN2250",
  "image": "",  // ❌ Perdido!
  "source": "portalb2b.neosolar.com.br"
}
```

### 3. **IMAGE_MAP Órfão**

O `IMAGE_MAP.json` tem 854 SKUs numéricos que **não existem** mais nos produtos consolidados:

```json
// IMAGE_MAP.json
{
  "112369": {
    "sku": "112369",
    "images": { "original": "/static/.../112369.jpg" }
  }
}

// Mas o produto 112369 não existe em unified_schemas!
```

---

## 💡 Soluções Propostas

### Opção 1: **Re-consolidação Preservando SKUs** ⭐ RECOMENDADO

**Ação**: Rodar novamente o processo de consolidação mantendo o campo `sku` original.

**Mudanças necessárias**:

1. Script de consolidação deve preservar campo `sku` numérico
2. Campo `image` deve manter referência ao `IMAGE_MAP`
3. Adicionar campo `original_sku` se necessário

**Resultado esperado**:

```json
{
  "id": "odex_inverters_112369",
  "sku": "112369",  // ✅ Preservado
  "name": "Inversor XYZ",
  "image": "/static/images-catálogo_distribuidores/ODEX-INVERTERS/112369.jpg"
}
```

**Esforço**: Alto (4-6 horas)  
**Coverage esperado**: 73.6% (854/1123)

---

### Opção 2: **Matching por Nome/Modelo**

**Ação**: Criar algoritmo fuzzy matching entre produtos e IMAGE_MAP.

**Lógica**:

```typescript
function findImageByName(product, imageMap) {
  // 1. Buscar por manufacturer + model
  // 2. Fuzzy match no nome
  // 3. Scoring de confiança
  return bestMatch;
}
```

**Prós**:

- Não precisa re-consolidar
- Pode funcionar para ~60-70% dos casos

**Contras**:

- Matching impreciso
- Performance impact
- Falsos positivos

**Esforço**: Médio (2-3 horas)  
**Coverage esperado**: 40-60%

---

### Opção 3: **Hybrid - Metadata Lookup**

**Ação**: Adicionar campo `distributor_sku` em metadata durante próxima consolidação.

**Estrutura**:

```json
{
  "id": "odex_inverters_xyz",
  "metadata": {
    "distributor_sku": "112369",  // ✅ Link preservado
    "original_source": "odex"
  }
}
```

**Prós**:

- Não quebra estrutura atual
- Informação preservada em metadata
- Fácil de implementar

**Contras**:

- Precisa rodar consolidação novamente
- Metadata pode ficar inflado

**Esforço**: Baixo (1-2 horas)  
**Coverage esperado**: 73.6%

---

### Opção 4: **Workaround Temporário** ⚠️

**Ação**: Usar IMAGE_MAP como fallback para produtos sem imagem.

**Implementação**:

```typescript
async getImageForProduct(product) {
  // 1. Tentar extrair SKU de várias fontes
  const sku = this.extractSku(product);
  
  // 2. Se não encontrar, usar placeholder genérico por categoria
  if (!sku) {
    return this.getPlaceholderImage(product.category);
  }
  
  // 3. Buscar no IMAGE_MAP
  return this.imageMap.mappings[sku] || placeholder;
}
```

**Prós**:

- Implementado ✅ (já está funcionando)
- Não precisa mudanças em dados

**Contras**:

- Apenas 0.4% coverage atual
- Não resolve o problema raiz

**Esforço**: Zero (já feito)  
**Coverage esperado**: 0.4% ❌

---

## 📋 Recomendação

### **Implementar Opção 3 + Opção 1**

1. **Curto prazo** (hoje):
   - ✅ Manter workaround atual
   - Documentar limitação (0.4% coverage)
   - Usar placeholders por categoria

2. **Médio prazo** (próxima sprint):
   - Adicionar `distributor_sku` em metadata
   - Re-rodar consolidação uma vez
   - Atualizar `catalog-service.ts` para usar metadata

3. **Longo prazo**:
   - Modificar pipeline de consolidação
   - Garantir preservação de SKUs
   - Adicionar testes de integridade

---

## 🔧 Quick Fix para Demonstração

Se precisar de demo rápido com imagens:

**Opção A**: Modificar 20-30 produtos manualmente:

```bash
# Adicionar SKU correto em produtos key
node scripts/patch-top-products-skus.js
```

**Opção B**: Usar imagens genéricas:

```typescript
// Mapear categoria -> placeholder
const placeholders = {
  inverters: '/static/placeholder-inverter.jpg',
  kits: '/static/placeholder-kit.jpg',
  // ...
};
```

---

## 📊 Métricas Atuais

| Categoria | Produtos | Com Imagem | Coverage |
|-----------|----------|------------|----------|
| inverters | 489 | 0 | 0% ❌ |
| kits | 334 | 0 | 0% ❌ |
| ev_chargers | 83 | 0 | 0% ❌ |
| cables | 55 | 0 | 0% ❌ |
| structures | 40 | 3 | 7.5% 🟡 |
| stringboxes | 13 | 1 | 7.7% 🟡 |
| panels | 29 | 1 | 3.4% 🟡 |
| **TOTAL** | **1123** | **5** | **0.4%** ❌ |

---

## ✅ Ações Imediatas

- [ ] Decidir qual opção implementar
- [ ] Se Opção 1 ou 3: Localizar script de consolidação
- [ ] Se Opção 2: Implementar fuzzy matching
- [ ] Se nenhuma: Aceitar 0.4% e usar placeholders

---

**Autor**: GitHub Copilot  
**Prioridade**: 🔴 ALTA  
**Impacto no Sistema**: Internal Catalog API funciona mas sem imagens reais
