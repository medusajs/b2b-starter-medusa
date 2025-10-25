# 🎯 Sistema de Padronização de IDs e Deployment S3

## 📋 Visão Geral

Sistema completo de normalização de IDs, SKUs e nomenclatura para produtos e imagens, com integração AWS S3 para armazenamento escalável de imagens.

---

## 🏗️ Arquitetura de Nomenclatura

### 1. SKU Normalizado (UPPERCASE_SNAKE_CASE)

**Formato:** `{PREFIX}_{MANUFACTURER}_{MODEL}`

**Prefixos por Categoria:**

```
INV - Inversores         (ex: INV_GROWATT_MIN_5000TL_X)
PNL - Painéis Solares   (ex: PNL_CANADIAN_CS3W_400P)
KIT - Kits Completos    (ex: KIT_GROWATT_5KW_HIBRIDO)
BAT - Baterias          (ex: BAT_BYD_BATTERY_BOX_LVS_12_0)
STR - Estruturas        (ex: STR_ROMAGNOLE_SOLO_12_PAINEIS)
CAB - Cabos             (ex: CAB_CONDUTTI_6MM_PRETO)
CTR - Controladores     (ex: CTR_EPEVER_TRACER_4210AN)
ACC - Acessórios        (ex: ACC_STAUBLI_MC4_MACHO_FEMEA)
SBX - String Boxes      (ex: SBX_KRAUS_2_ENTRADAS)
EVC - Carregadores EV   (ex: EVC_WALLBOX_PULSAR_PLUS_7_4KW)
PST - Postes            (ex: PST_GALVANIZADO_6M)
```

**Exemplo Completo:**

```
Produto Original: "Inversor Growatt MIN 5000TL-X 5kW"
SKU Normalizado:  INV_GROWATT_MIN_5000TL_X
Handle (URL):     inversor-growatt-min-5000tl-x
Image ID:         inv-growatt-min-5000tl-x
```

### 2. Product Handle (lowercase-kebab-case)

**Uso:** URLs amigáveis no storefront

```
INV_GROWATT_MIN_5000TL_X  →  inversor-growatt-min-5000tl-x
PNL_CANADIAN_CS3W_400P    →  painel-canadian-cs3w-400p
KIT_GROWATT_5KW_HIBRIDO   →  kit-growatt-5kw-hibrido
```

### 3. Image ID (lowercase-kebab-case)

**Uso:** Identificação de imagens no sistema

```
INV_GROWATT_MIN_5000TL_X  →  inv-growatt-min-5000tl-x.webp
PNL_CANADIAN_CS3W_400P    →  pnl-canadian-cs3w-400p.webp
```

### 4. S3 Key Structure

**Formato:** `{category}/{distributor}/{sku}.{format}`

```
inverters/aldo/inv-growatt-min-5000tl-x.webp
panels/renovigi/pnl-canadian-cs3w-400p.webp
kits/solfacil/kit-growatt-5kw-hibrido.webp
```

**URL Completa:**

```
https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/inverters/aldo/inv-growatt-min-5000tl-x.webp
```

---

## 🚀 Scripts de Normalização

### 1. Normalize Product IDs

Normaliza todos os IDs, SKUs e cria mapeamentos.

```bash
# Normalizar todos os produtos
npm run normalize:ids

# Preview sem aplicar mudanças
npm run normalize:ids -- --dry-run

# Exportar apenas mapeamentos
npm run normalize:ids -- --export

# Modo verboso
npm run normalize:ids -- --verbose
```

**Saídas Geradas:**

```
data/catalog/data/
├── PRODUCT_NORMALIZATION.json    # Mapeamento completo
├── S3_DEPLOYMENT_MANIFEST.json   # Manifesto para S3
├── product_normalization.csv     # CSV para revisão
├── DUPLICATES_REPORT.json        # Relatório de duplicatas
└── sync-to-s3.sh                 # Script de deploy S3
```

### 2. Enrich Product Images

Enriquece produtos do Medusa com imagens normalizadas.

```bash
# Enriquecer todos os produtos
npm run enrich:images

# Preview sem aplicar
npm run enrich:images -- --dry-run

# Apenas uma categoria
npm run enrich:images -- --category=panels

# Limitar quantidade
npm run enrich:images -- --limit=100

# Modo verboso
npm run enrich:images -- --verbose
```

---

## 📊 Estrutura de Dados

### PRODUCT_NORMALIZATION.json

```json
{
  "version": "1.0.0",
  "generated_at": "2025-01-13T00:00:00.000Z",
  "total_products": 1161,
  "total_normalized": 1161,
  "mappings": {
    "growatt-min-5000tl-x": {
      "original": "growatt-min-5000tl-x",
      "normalized": "INV_GROWATT_MIN_5000TL_X",
      "category": "inverters",
      "distributor": "ALD",
      "model": "MIN_5000TL_X",
      "hash": "a3f5c8d2"
    }
  },
  "reverse_mappings": {
    "INV_GROWATT_MIN_5000TL_X": ["growatt-min-5000tl-x"]
  }
}
```

### S3_DEPLOYMENT_MANIFEST.json

```json
{
  "version": "1.0.0",
  "bucket": "ysh-solar-hub-images",
  "region": "us-east-1",
  "base_url": "https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com",
  "generated_at": "2025-01-13T00:00:00.000Z",
  "total_images": 856,
  "categories": {
    "inverters": {
      "total": 245,
      "distributors": {
        "ALD": {
          "total": 120,
          "images": [
            {
              "sku": "INV_GROWATT_MIN_5000TL_X",
              "s3_key": "inverters/aldo/inv-growatt-min-5000tl-x.webp",
              "url": "https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/inverters/aldo/inv-growatt-min-5000tl-x.webp",
              "formats": ["webp", "jpg"]
            }
          ]
        }
      }
    }
  }
}
```

---

## 🌐 AWS S3 Deployment

### Pré-requisitos

1. **AWS CLI instalado:**

```bash
# Windows (PowerShell)
choco install awscli

# Verificar instalação
aws --version
```

2. **Credenciais configuradas:**

```bash
aws configure
# AWS Access Key ID: SEU_ACCESS_KEY
# AWS Secret Access Key: SEU_SECRET_KEY
# Default region: us-east-1
# Default output format: json
```

3. **Variáveis de ambiente:**

```bash
# .env
S3_BUCKET=ysh-solar-hub-images
S3_REGION=us-east-1
IMAGE_BASE_URL=https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com
```

### Deploy Manual

```bash
# 1. Normalizar produtos e gerar manifesto
npm run normalize:ids

# 2. Deploy para S3
cd data/catalog/data
chmod +x sync-to-s3.sh
./sync-to-s3.sh
```

### Deploy via Script Node

```bash
npm run deploy:images
```

---

## 📁 Estrutura S3

```
ysh-solar-hub-images/
├── inverters/
│   ├── aldo/
│   │   ├── inv-growatt-min-5000tl-x.webp
│   │   ├── inv-growatt-min-5000tl-x.jpg
│   │   └── ...
│   ├── renovigi/
│   └── solfacil/
├── panels/
│   ├── aldo/
│   ├── renovigi/
│   └── ...
├── kits/
├── batteries/
├── structures/
├── cables/
├── controllers/
├── accessories/
├── stringboxes/
├── ev_chargers/
└── posts/
```

---

## 🔄 Fluxo Completo de Normalização

### 1. Normalização Local

```bash
# Passo 1: Normalizar IDs e SKUs
npm run normalize:ids

# Verificar duplicatas
cat data/catalog/data/DUPLICATES_REPORT.json

# Passo 2: Validar mapeamentos
cat data/catalog/data/product_normalization.csv | head -20
```

### 2. Deploy S3

```bash
# Passo 3: Deploy imagens para S3
cd data/catalog/data
./sync-to-s3.sh

# Verificar deployment
aws s3 ls s3://ysh-solar-hub-images/inverters/aldo/ | head
```

### 3. Enriquecimento Medusa

```bash
# Passo 4: Enriquecer produtos no Medusa
npm run enrich:images

# Preview primeiro
npm run enrich:images -- --dry-run

# Aplicar mudanças
npm run enrich:images
```

### 4. Validação

```bash
# Verificar produtos atualizados
curl http://localhost:9000/store/products | jq '.products[0].thumbnail'

# Deve retornar:
# "https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/inverters/aldo/inv-growatt-min-5000tl-x.webp"
```

---

## 🎯 Padrões de Código

### Distributor Codes

```typescript
const DISTRIBUTOR_CODES: Record<string, string> = {
    "ALDO": "ALD",
    "ALDO SOLAR": "ALD",
    "RENOVIGI": "RNV",
    "SOLFACIL": "SFL",
    "SOLFÁCIL": "SFL",
    "MINHA CASA SOLAR": "MCS",
    "FATOR SOLAR": "FTS",
}
```

### Category Prefixes

```typescript
const CATEGORY_PREFIXES: Record<string, string> = {
    inverters: "INV",
    panels: "PNL",
    kits: "KIT",
    batteries: "BAT",
    structures: "STR",
    cables: "CAB",
    controllers: "CTR",
    accessories: "ACC",
    stringboxes: "SBX",
    ev_chargers: "EVC",
    posts: "PST",
}
```

### Funções de Normalização

```typescript
// Snake case (SKU)
function toSnakeCase(str: string): string {
    return str.toUpperCase()
        .replace(/[^A-Z0-9\s\-_]/g, "")
        .replace(/[\s\-]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "")
}

// Kebab case (URLs, Image IDs)
function toKebabCase(str: string): string {
    return str.toLowerCase()
        .replace(/[^a-z0-9\s\-_]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
}

// S3 Key
function generateS3Key(
    category: string,
    distributor: string,
    sku: string,
    format: string = "webp"
): string {
    return `${toKebabCase(category)}/${toKebabCase(distributor)}/${toKebabCase(sku)}.${format}`
}
```

---

## 🔍 Resolução de Duplicatas

### Identificar Duplicatas

```bash
# Ver relatório de duplicatas
cat data/catalog/data/DUPLICATES_REPORT.json | jq '.duplicates[] | select(.duplicate_count > 1)'
```

### Estratégias de Resolução

1. **Adicionar sufixo do distribuidor:**

```typescript
// Se houver duplicatas
if (duplicateCount > 1) {
    normalizedSKU = `${normalizedSKU}_${distributorCode}`
}

// Exemplo:
// INV_GROWATT_MIN_5000TL_X_ALD
// INV_GROWATT_MIN_5000TL_X_RNV
```

2. **Adicionar hash único:**

```typescript
const hash = generateHash(originalId)
normalizedSKU = `${normalizedSKU}_${hash}`

// Exemplo:
// INV_GROWATT_MIN_5000TL_X_A3F5C8D2
```

3. **Manter original_id para referência:**

```json
{
  "id": "INV_GROWATT_MIN_5000TL_X",
  "original_id": "growatt-min-5000tl-x",
  "handle": "inversor-growatt-min-5000tl-x"
}
```

---

## 📈 Monitoramento e Métricas

### Cobertura de Imagens

```bash
# Verificar cobertura por categoria
npm run normalize:ids -- --verbose | grep "coverage"

# Exemplo de saída:
# inverters: 245/280 (87.5%)
# panels: 320/380 (84.2%)
# kits: 89/120 (74.2%)
```

### S3 Storage Stats

```bash
# Tamanho total no S3
aws s3 ls s3://ysh-solar-hub-images --recursive --summarize

# Por categoria
aws s3 ls s3://ysh-solar-hub-images/inverters/ --recursive --summarize
```

### Performance Metrics

```typescript
// Adicionar ao script
console.time("Normalization")
await normalizeProducts()
console.timeEnd("Normalization")

console.time("S3 Upload")
await deployToS3()
console.timeEnd("S3 Upload")
```

---

## 🧪 Testes

### Teste de Normalização

```bash
# Dry run completo
npm run normalize:ids -- --dry-run --verbose

# Verificar algumas conversões
echo "INV_GROWATT_MIN_5000TL_X" | node -e "console.log(require('./scripts/normalize-product-ids').toKebabCase(process.stdin.read().toString()))"
# Output: inv-growatt-min-5000tl-x
```

### Teste de S3 URLs

```bash
# Verificar URL gerada
curl -I "https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/inverters/aldo/inv-growatt-min-5000tl-x.webp"

# Deve retornar: HTTP/1.1 200 OK
```

### Teste de Enriquecimento

```bash
# Dry run em poucos produtos
npm run enrich:images -- --dry-run --limit=10 --verbose

# Verificar saída
# [1/10] Inversor Growatt MIN 5000TL-X
#    SKU: INV_GROWATT_MIN_5000TL_X
#    ✅ Found image: inv-growatt-min-5000tl-x
#    🔍 DRY RUN - Would update thumbnail
```

---

## 🚨 Troubleshooting

### Problema: Duplicatas excessivas

**Solução:**

```bash
# 1. Verificar quantas duplicatas
cat data/catalog/data/DUPLICATES_REPORT.json | jq '.total_duplicates'

# 2. Analisar padrões
cat data/catalog/data/DUPLICATES_REPORT.json | jq '.duplicates[0:5]'

# 3. Ajustar extração de modelo/manufacturer
# Editar: scripts/normalize-product-ids.ts
# Melhorar: extractManufacturer() e extractModel()
```

### Problema: S3 Access Denied

**Solução:**

```bash
# Verificar credenciais
aws sts get-caller-identity

# Verificar permissões do bucket
aws s3api get-bucket-policy --bucket ysh-solar-hub-images

# Criar bucket policy
cat > bucket-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ysh-solar-hub-images/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket ysh-solar-hub-images --policy file://bucket-policy.json
```

### Problema: Imagens não aparecem no storefront

**Diagnóstico:**

```bash
# 1. Verificar se produto tem thumbnail
curl http://localhost:9000/store/products/inv-growatt-min-5000tl-x | jq '.product.thumbnail'

# 2. Verificar se URL é acessível
curl -I "URL_DA_IMAGEM"

# 3. Verificar CORS no S3
aws s3api get-bucket-cors --bucket ysh-solar-hub-images

# 4. Adicionar CORS se necessário
cat > cors.json <<EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket ysh-solar-hub-images --cors-configuration file://cors.json
```

---

## 📚 Referências

### Documentação AWS

- [S3 Bucket Naming](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html)
- [S3 CLI Reference](https://docs.aws.amazon.com/cli/latest/reference/s3/)
- [S3 CORS Configuration](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)

### Padrões de Nomenclatura

- [URL Slug Best Practices](https://moz.com/learn/seo/url)
- [REST API Naming Conventions](https://restfulapi.net/resource-naming/)

### Scripts Relacionados

- `scripts/normalize-product-ids.ts` - Normalização de IDs
- `scripts/enrich-product-images.ts` - Enriquecimento de imagens
- `scripts/import-catalog.ts` - Importação para Medusa
- `data/catalog/data/sync-to-s3.sh` - Deploy S3

---

## ✅ Checklist de Implementação

### Fase 1: Normalização Local

- [ ] Executar `npm run normalize:ids -- --dry-run`
- [ ] Revisar `PRODUCT_NORMALIZATION.json`
- [ ] Verificar `DUPLICATES_REPORT.json`
- [ ] Resolver duplicatas se necessário
- [ ] Executar `npm run normalize:ids` (sem dry-run)

### Fase 2: Setup AWS S3

- [ ] Criar bucket S3: `ysh-solar-hub-images`
- [ ] Configurar AWS CLI
- [ ] Testar acesso: `aws s3 ls`
- [ ] Configurar bucket policy (public read)
- [ ] Configurar CORS

### Fase 3: Deploy Imagens

- [ ] Revisar `S3_DEPLOYMENT_MANIFEST.json`
- [ ] Executar `sync-to-s3.sh`
- [ ] Verificar upload: `aws s3 ls s3://ysh-solar-hub-images/`
- [ ] Testar URL de imagem no navegador

### Fase 4: Enriquecimento Medusa

- [ ] Configurar `IMAGE_BASE_URL` no `.env`
- [ ] Executar `npm run enrich:images -- --dry-run`
- [ ] Validar preview
- [ ] Executar `npm run enrich:images`
- [ ] Verificar produtos no admin

### Fase 5: Validação Final

- [ ] Testar storefront
- [ ] Verificar performance de carregamento
- [ ] Monitorar custos S3
- [ ] Documentar para equipe

---

**Última atualização:** 2025-10-13  
**Versão:** 1.0.0  
**Status:** ✅ Pronto para uso
