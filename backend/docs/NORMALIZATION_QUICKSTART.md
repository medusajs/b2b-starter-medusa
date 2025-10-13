# 🎯 Normalização de Produtos & Deployment S3 - Quick Start

## 🚀 Início Rápido

### 1. Normalizar IDs e Gerar Manifesto

```bash
# Preview (sem aplicar mudanças)
npm run normalize:ids -- --dry-run

# Aplicar normalização
npm run normalize:ids
```

**Saídas:**
- `data/catalog/data/PRODUCT_NORMALIZATION.json`
- `data/catalog/data/S3_DEPLOYMENT_MANIFEST.json`
- `data/catalog/data/product_normalization.csv`
- `data/catalog/data/sync-to-s3.sh`

### 2. Deploy Imagens para S3

```bash
# Configurar AWS
aws configure
# Access Key: YOUR_KEY
# Secret: YOUR_SECRET
# Region: us-east-1

# Deploy
cd data/catalog/data
chmod +x sync-to-s3.sh
./sync-to-s3.sh
```

### 3. Enriquecer Produtos no Medusa

```bash
# Preview
npm run enrich:images -- --dry-run --limit=10

# Aplicar
npm run enrich:images
```

---

## 📋 Padrões de Nomenclatura

### SKU Format

```
{PREFIX}_{MANUFACTURER}_{MODEL}

Exemplos:
INV_GROWATT_MIN_5000TL_X        # Inversor
PNL_CANADIAN_CS3W_400P          # Painel
KIT_GROWATT_5KW_HIBRIDO         # Kit
```

### URL Format (Product Handle)

```
{category}-{manufacturer}-{model}

Exemplos:
inversor-growatt-min-5000tl-x
painel-canadian-cs3w-400p
kit-growatt-5kw-hibrido
```

### S3 Key Format

```
{category}/{distributor}/{sku}.{format}

Exemplos:
inverters/aldo/inv-growatt-min-5000tl-x.webp
panels/renovigi/pnl-canadian-cs3w-400p.webp
```

### S3 URL Completa

```
https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/{s3_key}

Exemplo:
https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/inverters/aldo/inv-growatt-min-5000tl-x.webp
```

---

## 📊 Estrutura de Arquivos

```
backend/
├── scripts/
│   ├── normalize-product-ids.ts      # Script principal de normalização
│   └── enrich-product-images.ts      # Script de enriquecimento
├── data/catalog/
│   ├── unified_schemas/              # Produtos originais (serão atualizados)
│   │   ├── inverters_unified.json
│   │   ├── panels_unified.json
│   │   └── ...
│   └── data/                          # Arquivos gerados
│       ├── PRODUCT_NORMALIZATION.json
│       ├── S3_DEPLOYMENT_MANIFEST.json
│       ├── product_normalization.csv
│       ├── DUPLICATES_REPORT.json (se houver)
│       └── sync-to-s3.sh
└── static/
    └── images-catálogo_distribuidores/
        └── IMAGE_MAP.json
```

---

## 🔧 Comandos Úteis

```bash
# Normalização
npm run normalize:ids                    # Normalizar tudo
npm run normalize:ids -- --dry-run       # Preview
npm run normalize:ids -- --verbose       # Com detalhes
npm run normalize:ids -- --export        # Só exportar mapeamentos

# Enriquecimento
npm run enrich:images                    # Enriquecer tudo
npm run enrich:images -- --dry-run       # Preview
npm run enrich:images -- --category=panels  # Só painéis
npm run enrich:images -- --limit=50      # Primeiros 50
npm run enrich:images -- --verbose       # Com detalhes

# Verificações S3
aws s3 ls s3://ysh-solar-hub-images/
aws s3 ls s3://ysh-solar-hub-images/inverters/aldo/
curl -I "https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/inverters/aldo/inv-growatt-min-5000tl-x.webp"
```

---

## 🎯 Prefixos por Categoria

| Categoria      | Prefixo | Exemplo                        |
|---------------|---------|--------------------------------|
| Inversores    | INV     | INV_GROWATT_MIN_5000TL_X      |
| Painéis       | PNL     | PNL_CANADIAN_CS3W_400P        |
| Kits          | KIT     | KIT_GROWATT_5KW_HIBRIDO       |
| Baterias      | BAT     | BAT_BYD_BATTERY_BOX_LVS_12_0  |
| Estruturas    | STR     | STR_ROMAGNOLE_SOLO_12_PAINEIS |
| Cabos         | CAB     | CAB_CONDUTTI_6MM_PRETO        |
| Controladores | CTR     | CTR_EPEVER_TRACER_4210AN      |
| Acessórios    | ACC     | ACC_STAUBLI_MC4_MACHO_FEMEA   |
| String Boxes  | SBX     | SBX_KRAUS_2_ENTRADAS          |
| Carregadores  | EVC     | EVC_WALLBOX_PULSAR_PLUS_7_4KW |
| Postes        | PST     | PST_GALVANIZADO_6M            |

---

## 🌐 Configuração AWS

### .env

```bash
S3_BUCKET=ysh-solar-hub-images
S3_REGION=us-east-1
IMAGE_BASE_URL=https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com
```

### Criar Bucket

```bash
aws s3 mb s3://ysh-solar-hub-images --region us-east-1
```

### Configurar Acesso Público

```bash
# Criar bucket-policy.json
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

# Aplicar policy
aws s3api put-bucket-policy --bucket ysh-solar-hub-images --policy file://bucket-policy.json
```

### Configurar CORS

```bash
# Criar cors.json
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

# Aplicar CORS
aws s3api put-bucket-cors --bucket ysh-solar-hub-images --cors-configuration file://cors.json
```

---

## 📈 Verificação

### 1. Verificar Normalização

```bash
# Ver alguns produtos normalizados
cat data/catalog/data/product_normalization.csv | head -20

# Verificar duplicatas
cat data/catalog/data/DUPLICATES_REPORT.json | jq '.total_duplicates'
```

### 2. Verificar S3

```bash
# Listar primeiras imagens
aws s3 ls s3://ysh-solar-hub-images/inverters/aldo/ | head

# Testar URL
curl -I "https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/inverters/aldo/inv-growatt-min-5000tl-x.webp"
```

### 3. Verificar Medusa

```bash
# Ver produto no Medusa
curl http://localhost:9000/store/products | jq '.products[0] | {id, title, thumbnail}'
```

---

## 🐛 Troubleshooting

### Duplicatas

```bash
# Ver relatório
cat data/catalog/data/DUPLICATES_REPORT.json | jq '.duplicates[0:5]'

# Duplicatas serão resolvidas automaticamente com sufixo
```

### S3 Access Denied

```bash
# Verificar credenciais
aws sts get-caller-identity

# Testar acesso
aws s3 ls s3://ysh-solar-hub-images/

# Verificar policy
aws s3api get-bucket-policy --bucket ysh-solar-hub-images
```

### Imagens não carregam

```bash
# 1. Verificar se produto tem thumbnail
curl http://localhost:9000/store/products/inv-growatt-min-5000tl-x | jq '.product.thumbnail'

# 2. Testar URL diretamente
curl -I "URL_DA_IMAGEM"

# 3. Verificar CORS
aws s3api get-bucket-cors --bucket ysh-solar-hub-images
```

---

## 📚 Documentação Completa

Ver: `docs/PRODUCT_NORMALIZATION_GUIDE.md`

---

## ✅ Checklist

- [ ] Executar `npm run normalize:ids -- --dry-run`
- [ ] Revisar mapeamentos gerados
- [ ] Resolver duplicatas se houver
- [ ] Executar `npm run normalize:ids`
- [ ] Configurar AWS CLI
- [ ] Criar bucket S3
- [ ] Configurar bucket policy e CORS
- [ ] Executar `sync-to-s3.sh`
- [ ] Verificar imagens no S3
- [ ] Configurar `.env` com URLs S3
- [ ] Executar `npm run enrich:images -- --dry-run`
- [ ] Executar `npm run enrich:images`
- [ ] Testar no storefront

---

**Status:** ✅ Sistema pronto para uso  
**Versão:** 1.0.0  
**Data:** 2025-10-13
