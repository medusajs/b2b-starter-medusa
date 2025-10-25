# 📐 Padronização de Nomenclatura de Imagens - YSH Store

## 🎯 Objetivo

Criar nomenclatura **padronizada, inteligente e SEO-friendly** para todas as imagens de produtos, facilitando:

- ✅ Identificação visual instantânea
- ✅ SEO e busca por imagens
- ✅ Organização e manutenção
- ✅ Rastreamento de origem

---

## 📋 Estrutura do Padrão

```ysx
FABRICANTE-CATEGORIA-TIPO-MODELO-POTENCIA-DISTRIBUIDOR.webp
```

### Componentes (em ordem)

| #  | Campo | Descrição | Exemplo | Obrigatório |
|----|-------|-----------|---------|-------------|
| 1  | **FABRICANTE** | Nome do fabricante | SAJ, FRONIUS, DAH | ✅ Sim* |
| 2  | **CATEGORIA** | Tipo de produto | INV, PANEL, KIT, BAT | ✅ Sim |
| 3  | **TIPO** | Subtipo/tecnologia | GRIDTIE, HIBRIDO, BIFACIAL | ⚠️ Condicional |
| 4  | **MODELO** | Código do modelo | R5-3K-T2, PRIMO82 | ✅ Sim* |
| 5  | **POTÊNCIA** | Potência do produto | 3KW, 550W | ⚠️ Condicional |
| 6  | **DISTRIBUIDOR** | Fonte dos dados | ODEX, SOLFACIL, FOTUS | ✅ Sim |

\* Pelo menos FABRICANTE ou MODELO deve estar presente

---

## 🏭 Fabricantes Comuns

| Fabricante Original | Nome Padronizado |
|---------------------|------------------|
| SAJ | SAJ |
| Growatt | GROWATT |
| Fronius | FRONIUS |
| SMA | SMA |
| Goodwe | GOODWE |
| Deye | DEYE |
| Solax | SOLAX |
| Chint | CHINT |
| Sofar | SOFAR |
| Canadian Solar | CANADIAN |
| Jinko Solar | JINKO |
| Trina Solar | TRINA |
| DAH Solar | DAH |

---

## 📦 Categorias Padronizadas

| Categoria Original | Código | Exemplos |
|-------------------|--------|----------|
| inverters | **INV** | Inversores grid-tie, híbridos, off-grid |
| panels | **PANEL** | Painéis solares mono/bifaciais |
| kits | **KIT** | Kits completos fotovoltaicos |
| batteries | **BAT** | Baterias estacionárias |
| structures | **STRUCT** | Estruturas de fixação |
| cables | **CABLE** | Cabos e conectores |
| accessories | **ACC** | Acessórios diversos |
| stringboxes | **SBOX** | String boxes/caixas de junção |

---

## 🔧 Tipos de Produtos (Opcional)

### Inversores

- **GRIDTIE** - Grid-tie (conectado à rede)
- **HIBRIDO** - Híbrido (rede + bateria)
- **OFFGRID** - Off-grid (isolado)
- **MICRO** - Microinversor

### Painéis

- **BIFACIAL** - Painel bifacial
- **MONO** - Monofacial
- **POLY** - Policristalino
- **NTYPE** - Tecnologia N-Type

### Kits

- **COMPLETO** - Kit completo
- **BASICO** - Kit básico
- **PREMIUM** - Kit premium

---

## ⚡ Potência

### Formato

- **Para ≥ 1kW**: `XKW` ou `X.XKW`
  - Exemplos: `3KW`, `5.5KW`, `10KW`
- **Para < 1kW**: `XXXW`
  - Exemplos: `550W`, `800W`

### Normalização

- `3000W` → `3KW`
- `5500W` → `5.5KW`
- `550W` → `550W`
- `0.8kW` → `800W`

---

## 🌐 Distribuidores

| Distribuidor | Código |
|--------------|--------|
| ODEX | ODEX |
| Solfácil | SOLFACIL |
| FOTUS | FOTUS |
| NeoSolar | NEOSOLAR |
| Fortlev | FORTLEV |

---

## 📊 Exemplos Reais

### Inversores Grid-Tie

| Nome Original | Nome Padronizado |
|---------------|------------------|
| `276954.jpg` - "Inversor Grid-Tie SAJ R5-3K-T2 BRL 3kW" | `SAJ-INV-GRIDTIE-R5-3K-T2-3KW-ODEX.webp` |
| `IMAGE_PRODUCT_600340.jpeg` - "ENPHASE IQ8P-72-2-BR" | `ENPHASE-INV-IQ8P-72-2-BR-SOLFACIL.webp` |
| `152147.jpg` - "Inversor Grid-Tie SAJ R5-10K-T2 10kW" | `SAJ-INV-GRIDTIE-R5-10K-T2-10KW-ODEX.webp` |

### Inversores Híbridos

| Nome Original | Nome Padronizado |
|---------------|------------------|
| `112369.jpg` - "Inversor Híbrido Deye SUN-5K" | `DEYE-INV-HIBRIDO-SG05LP1-EU-5KW-ODEX.webp` |
| `315148.jpg` - "Inversor Híbrido Growatt SPH 3000" | `GROWATT-INV-HIBRIDO-SPH-3000-3KW-ODEX.webp` |

### Microinversores

| Nome Original | Nome Padronizado |
|---------------|------------------|
| `ODEX-ODEX-INV-DEYE-800W.jpg` - "Microinversor Deye SUN-M80G4" | `DEYE-INV-MICRO-M80G4-EU-Q0-800W-ODEX.webp` |
| `ODEX-ODEX-INV-DEYE-2400W.jpg` - "Microinversor Deye SUN-2400G3" | `DEYE-INV-MICRO-G3-EU-Q0-2.4KW-ODEX.webp` |

### Painéis Solares

| Nome Original | Nome Padronizado |
|---------------|------------------|
| `289244.jpg` - "Painel Solar Odex 585W" | `ODEX-PANEL-ODEX-585W-ODEX.webp` |
| `299586.jpg` - "Painel Solar Jinko 615W" | `JINKO-PANEL-JINKO-615W-ODEX.webp` |
| `300585.jpg` - "Painel Solar Odex 610W" | `ODEX-PANEL-ODEX-610W-ODEX.webp` |

### Estruturas

| Nome Original | Nome Padronizado |
|---------------|------------------|
| `313801.jpg` - "Estrutura Solar Group Fibrocimento" | `SOLAR-GROUP-STRUCT-ODEX.webp` |
| `124358.jpg` - "Estrutura Pratyc Solo Fixo PRS-1600" | `PRATYC-STRUCT-PRS-1600-ODEX.webp` |

### Kits

| Nome Original | Nome Padronizado |
|---------------|------------------|
| `FOTUS-KP04-kits` - "KP04 SOLAR N PLUS 570W BIFACIAL" | `KIT-BIFACIAL-KP04-1.14KW-FOTUS.webp` |

---

## 🔄 Processo de Renomeação

### 1. Análise de Dados

```bash
python scripts/analyze-product-nomenclature.py
```

**Output**: Análise dos datasets e exemplos de nomenclatura

### 2. Simulação (Dry Run)

```bash
python scripts/rename-images-intelligent.py
```

**Output**:

- Lista de renomeações planejadas
- Relatório em `static/images-renaming-report.json`
- **Nenhum arquivo é modificado**

### 3. Aplicação Real

```bash
python scripts/rename-images-intelligent.py --apply
```

**Actions**:

- ✅ Renomeia arquivos físicos
- ✅ Atualiza IMAGE_MAP.json para v5.0
- ✅ Cria backup (IMAGE_MAP.json.backup-v4)
- ✅ Mantém histórico (campo `old_sku`)

### 4. Regenerar Imagens Responsivas

```bash
python scripts/generate-responsive-images.py
```

**Output**: Versões responsivas com novos nomes

---

## 📊 Estatísticas do Projeto

### Resultado da Análise (13/10/2025)

| Métrica | Valor |
|---------|-------|
| **Total de produtos** | 171 |
| **Imagens para renomear** | 69 (40.4%) |
| **Sem imagem** | 53 (31.0%) |
| **Imagem não encontrada** | 49 (28.6%) |
| **Erros** | 0 |

### Distribuição por Distribuidor

| Distribuidor | Produtos | Imagens OK |
|--------------|----------|------------|
| ODEX Inverters | 45 | 27 (60%) |
| ODEX Panels | 9 | 7 (78%) |
| ODEX Structures | 3 | 3 (100%) |
| SOLFACIL Inverters | 82 | 31 (38%) |
| SOLFACIL Panels | 6 | 1 (17%) |
| FOTUS Kits | 3 | 0 (0%) |

---

## 🎯 Benefícios da Padronização

### 1. **SEO e Descoberta**

- URLs descritivas e amigáveis
- Melhor indexação por motores de busca
- Alt text automático baseado no nome

### 2. **Organização**

- Agrupamento natural por fabricante/categoria
- Fácil identificação visual no filesystem
- Ordenação alfabética significativa

### 3. **Rastreabilidade**

- Distribuidor identificado no nome
- Histórico mantido no IMAGE_MAP
- Versionamento completo

### 4. **Manutenção**

- Identificação rápida de produtos
- Detecção de duplicatas
- Migração simplificada

### 5. **Performance**

- Nomes consistentes permitem caching eficiente
- Prefetch baseado em padrões
- CDN-friendly

---

## 🛠️ Regras de Sanitização

### Caracteres Permitidos

- ✅ Letras maiúsculas: `A-Z`
- ✅ Números: `0-9`
- ✅ Hífen: `-`
- ❌ Espaços (convertidos para `-`)
- ❌ Caracteres especiais (removidos)
- ❌ Acentos (removidos)

### Limites

- **Nome completo**: máximo 150 caracteres
- **Modelo**: máximo 25 caracteres
- **Fabricante**: máximo 50 caracteres

### Normalização

```python
# Antes
"Inversor Grid-Tie SAJ R5-3K-T2 BRL 3kW"

# Depois
"SAJ-INV-GRIDTIE-R5-3K-T2-3KW-ODEX"
```

---

## 📝 Próximos Passos

### Implementação Imediata

- [ ] Revisar relatório de dry-run
- [ ] Executar renomeação com `--apply`
- [ ] Validar IMAGE_MAP v5.0
- [ ] Regenerar imagens responsivas

### Curto Prazo (1 semana)

- [ ] Processar distribuidores faltantes (NeoSolar, Fortlev)
- [ ] Completar imagens faltantes (53 produtos)
- [ ] Localizar imagens não encontradas (49 produtos)

### Médio Prazo (1 mês)

- [ ] Integrar com API de catálogo
- [ ] Implementar geração automática de alt text
- [ ] Configurar CDN com URLs padronizadas
- [ ] Dashboard de monitoramento de imagens

---

## 🔗 Referências

- **IMAGE_MAP v4.0**: `static/images-catálogo_distribuidores/IMAGE_MAP.json`
- **Relatório de análise**: `static/images-renaming-report.json`
- **Script de renomeação**: `scripts/rename-images-intelligent.py`
- **Script de análise**: `scripts/analyze-product-nomenclature.py`
- **Datasets originais**: `data/catalog/data/catalog/distributor_datasets/`

---

**Última atualização**: 13 de outubro de 2025  
**Versão do documento**: 1.0  
**Status**: ✅ Pronto para Aplicação
