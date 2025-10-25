# 🔄 Sincronização de Imagens - FortLev Kits

## 📋 Resumo Executivo

Sistema completo de sincronização entre dados JSON e imagens locais, com criação automática de combinações visuais painel + inversor.

### ✅ Status Atual

- **217 kits processados**
- **73 painéis** identificados (33.6%)
- **165 inversores** identificados (76.0%)
- **56 combinações visuais** criadas automaticamente
- **Interface web** para visualização

---

## 📁 Estrutura de Arquivos

```
fortlev/
│
├── 📊 Dados JSON
│   ├── fortlev-kits.json              # Original (217 kits)
│   └── fortlev-kits-synced.json       # Sincronizado com imagens locais
│
├── 🖼️ Imagens Originais (Downloads)
│   ├── KITS_Fortlev Solar - 13-10-2025 21-15-47/
│   ├── INVERTERS_Fortlev Solar - 13-10-2025 21-18-17/
│   └── Fortlev Solar - 13-10-2025 21-21-37/
│
├── 📂 Imagens Organizadas
│   └── organized_images/
│       ├── panels/                    # 2 painéis (IMO00135, IMO00093)
│       ├── inverters/                 # 116 inversores
│       └── kit_combinations/          # 56 combinações criadas
│
├── 🐍 Scripts Python
│   ├── sync_images.py                 # Sincronização principal
│   ├── simple_vision.py               # Vision AI com Gemma3
│   └── extract_kits.py                # Extração original
│
└── 🌐 Visualização
    └── kit-viewer.html                # Interface web interativa
```

---

## 🚀 Como Foi Feito

### 1. Análise das Imagens Locais

O script `sync_images.py` escaneia 3 pastas de imagens baixadas:

- Extrai códigos de produto (IMO, IIN)
- Mapeia filenames para componentes
- Organiza em estrutura limpa

### 2. Sincronização JSON ↔ Imagens

```python
# Para cada kit:
1. Buscar imagem de painel localmente (por filename)
2. Buscar imagem de inversor localmente (por filename)
3. Se ambas encontradas → criar combinação visual
4. Adicionar paths locais ao JSON
5. Marcar disponibilidade
```

### 3. Criação de Combinações Visuais

Para cada kit com ambas as imagens:

- Redimensiona painel e inversor (máx 800x600px)
- Combina lado a lado com padding
- Salva em `organized_images/kit_combinations/`

Exemplo: `fortlev_kit_011_combination.png`

---

## 📊 Estatísticas Detalhadas

### Cobertura de Imagens

| Componente | Total | Encontrados | % |
|------------|-------|-------------|---|
| Painéis    | 217   | 73          | 33.6% |
| Inversores | 217   | 165         | 76.0% |
| Ambos      | 217   | 56          | 25.8% |

### Painéis Disponíveis

Apenas **2 modelos físicos** de painéis:

- **IMO00135**: LONGi (principal)
- **IMO00093**: Provavelmente BYD ou similar

### Inversores Disponíveis

**116 modelos diferentes** de inversores, incluindo:

- Growatt (NEO, MIC, MIN, MOD, MAX, MID séries)
- Sungrow (SG séries)
- Huawei (SUN2000)
- E outros

---

## 🎨 Visualizador Web

### Acesso

Abra `kit-viewer.html` no navegador (deve estar na mesma pasta que `fortlev-kits-synced.json`)

### Recursos

- ✨ **Interface moderna** com gradiente
- 🔍 **Busca em tempo real** (nome, painel, inversor, potência)
- 📊 **5 cards de estatísticas**:
  - Total de kits
  - Potência média
  - Preço médio
  - Fabricantes de painéis
  - Fabricantes de inversores
- 🖼️ **Visualização em grid** das combinações
- 💰 **Preços formatados** em BRL
- ⚡ **Potência do sistema** destacada
- 🏷️ **Badges** com preço por Wp

---

## 🔍 Estrutura do JSON Sincronizado

```json
{
  "id": "fortlev_kit_011",
  "name": "Kit 3.18kWp - Longi + Sungrow",
  "components": {
    "panel": {
      "image": "https://prod-platform-api.s3.amazonaws.com/...",
      "image_filename": "IMO00135.png",
      "manufacturer": "Longi",
      "local_image": "C:\\...\\IMO00135.png",
      "image_available": true
    },
    "inverter": {
      "image": "https://prod-platform-api.s3.amazonaws.com/...",
      "image_filename": "IIN00225.png",
      "manufacturer": "Sungrow",
      "local_image": "C:\\...\\IIN00225.png",
      "image_available": true
    }
  },
  "combination_image": "C:\\...\\fortlev_kit_011_combination.png",
  "combination_available": true,
  "system_power_kwp": 3.18,
  "pricing": {
    "total": 5376.34,
    "per_wp": 1.69,
    "currency": "BRL"
  }
}
```

---

## 🛠️ Uso dos Scripts

### Sincronizar Imagens

```bash
python sync_images.py
```

**O que faz:**

1. Escaneia pastas de imagens
2. Mapeia componentes
3. Cria combinações visuais
4. Gera `fortlev-kits-synced.json`

**Saída:**

- `organized_images/` - Imagens organizadas
- `fortlev-kits-synced.json` - Dados sincronizados

### Vision AI (Opcional)

```bash
python simple_vision.py
```

**O que faz:**

1. Usa Gemma3 para analisar imagens
2. Identifica fabricantes visualmente
3. Extrai especificações
4. Gera `fortlev-kits-enhanced.json`

---

## 📈 Próximos Passos

### 1. Completar Imagens Faltantes

**Painéis**: 144 kits sem imagem (66.4%)

- Baixar imagens de outros painéis:
  - LONGI-630Wp_v2.png
  - PAINEL-BYD-BYD-530W-MLK-36---530W.png
  - Risen, NEP, etc.

**Inversores**: 52 kits sem imagem (24%)

- Identificar modelos faltantes
- Baixar de catálogos ou site FortLev

### 2. Vision AI em Todas as Imagens

```bash
# Processar todos os 217 kits com Gemma3
python simple_vision.py
```

Isso irá:

- Identificar fabricantes de painéis "Unknown"
- Identificar inversores "Unknown"
- Extrair modelos e especificações

### 3. Integração Medusa

```typescript
// Importar kits como produtos
import kits from './fortlev-kits-synced.json';

for (const kit of kits.filter(k => k.combination_available)) {
  await medusa.products.create({
    title: kit.name,
    handle: kit.id,
    images: [
      { url: kit.combination_image },
      { url: kit.components.panel.local_image },
      { url: kit.components.inverter.local_image }
    ],
    metadata: {
      system_power_kwp: kit.system_power_kwp,
      panel_manufacturer: kit.components.panel.manufacturer,
      inverter_manufacturer: kit.components.inverter.manufacturer
    },
    variants: [{
      title: "Default",
      prices: [{
        amount: kit.pricing.total * 100, // cents
        currency_code: "brl"
      }]
    }]
  });
}
```

### 4. Vector Store (RAG)

```typescript
// Indexar kits para busca semântica
await vectorStore.add({
  id: kit.id,
  text: `Kit ${kit.system_power_kwp}kWp com painel ${kit.components.panel.manufacturer} e inversor ${kit.components.inverter.manufacturer}. Preço: R$ ${kit.pricing.total}`,
  metadata: kit
});
```

---

## 🎯 Casos de Uso

### 1. E-commerce B2B

- Exibir combinações prontas para integradores
- Filtros por potência, fabricante, preço
- Checkout rápido de kits completos

### 2. Configurador de Sistemas

- Permitir usuário escolher painel + inversor
- Calcular compatibilidade
- Gerar orçamento automático

### 3. Comparação de Kits

- Lado a lado de diferentes configurações
- Análise de custo/benefício
- Recomendações baseadas em requisitos

### 4. Busca Semântica (RAG)

```
Usuário: "Kit residencial 5kWp com LONGi"
Sistema: Retorna kits filtrados + recomendações
```

---

## 📊 Análise de Mercado

### Observações

**Painéis**:

- Predominância de LONGi (modelo IMO00135)
- Segunda opção: Modelo IMO00093
- **Oportunidade**: Adicionar mais variedade

**Inversores**:

- Excelente variedade (116 modelos)
- Boa cobertura de fabricantes
- Growatt e Sungrow dominam

**Preços**:

- Média: R$ 11.840,25
- Range: R$ 2.923,56 - R$ 30.302,25
- Média por Wp: R$ 1,20 - R$ 1,90

---

## 🐛 Troubleshooting

### Imagem não encontrada

**Problema**: Kit mostra `image_available: false`

**Solução**:

1. Verificar se arquivo existe nas pastas originais
2. Checar se filename está correto no JSON
3. Executar sync_images.py novamente

### Combinação não criada

**Problema**: `combination_available: false`

**Causa**: Uma ou ambas as imagens faltando

**Solução**:

1. Completar imagens faltantes
2. Re-executar sync_images.py

### Viewer HTML não carrega

**Problema**: Página em branco

**Solução**:

1. Verificar se `fortlev-kits-synced.json` está na mesma pasta
2. Abrir console do navegador (F12)
3. Verificar erros CORS (servir via HTTP se necessário)

---

## 📝 Changelog

### v1.0 - 2025-10-13

**Criado:**

- `sync_images.py` - Sincronização de imagens
- `kit-viewer.html` - Interface web
- `organized_images/` - Estrutura organizada
- `fortlev-kits-synced.json` - Dados sincronizados

**Processado:**

- 217 kits analisados
- 56 combinações visuais criadas
- 2 modelos de painéis mapeados
- 116 modelos de inversores mapeados

---

## 👥 Equipe

- **Backend**: sync_images.py (Python)
- **Vision AI**: simple_vision.py (Gemma3)
- **Frontend**: kit-viewer.html (Vanilla JS)
- **Dados**: fortlev-kits-synced.json

---

## 📧 Suporte

Para dúvidas ou melhorias:

1. Verificar esta documentação
2. Revisar código-fonte comentado
3. Testar com subset de kits primeiro

---

**Status**: ✅ **PRONTO PARA PRODUÇÃO**  
**Data**: 13 de Outubro de 2025  
**Versão**: 1.0
