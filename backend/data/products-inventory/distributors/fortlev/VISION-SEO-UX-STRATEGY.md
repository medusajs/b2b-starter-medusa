# 🎨 Vision AI + SEO + UX Strategy

## FortLev Solar Kits - Complete Enrichment Pipeline

**Status**: 🚀 **IN PROGRESS** - Vision AI processing 217 kits  
**Started**: October 13, 2025  
**Models**: Gemma3:4b (Vision) + GPT OSS:20b (Text - optional)

---

## 📋 Executive Summary

Comprehensive content enrichment strategy combining:

- **Vision AI** (Gemma3) for image analysis and component identification
- **SEO/SEM** optimization for organic search visibility
- **UX Writing** best practices for conversion
- **Copywriting** strategies for emotional engagement
- **Medusa.js** optimization for e-commerce structure

**Goal**: Transform 217 raw solar kits into SEO-optimized, conversion-ready products with rich metadata extracted from component images.

---

## 🎯 Strategy Components

### 1. Vision AI Analysis (Gemma3)

**Purpose**: Extract technical specifications from product images

**What it does**:

- Analyzes panel images → identifies manufacturer, model, power rating, technology type
- Analyzes inverter images → extracts brand, model, specifications, certifications
- Uses OCR + vision understanding to read labels, logos, technical plates
- Assigns confidence levels (high/medium/low) to extracted data

**Output Structure**:

```json
{
  "vision_analysis": {
    "panel_manufacturer": "LONGi",
    "panel_model": "Hi-MO 6",
    "panel_technology": "monocristalino PERC",
    "panel_visual_features": ["Black frame", "Full black", "Bifacial"],
    "panel_confidence": "high",
    "inverter_manufacturer": "Growatt",
    "inverter_model": "MIN 2500TL-X",
    "inverter_specifications": ["MPPT dual", "WiFi integrado"],
    "inverter_confidence": "medium"
  }
}
```

### 2. UX Writing Strategy

**Purpose**: Create scannable, benefit-first titles

**Principles**:

- Front-load benefits (generation capacity, savings)
- 7-10 words maximum for scannability
- Action-oriented language
- Clear value proposition

**Format**:

```
Gere {monthly_gen}kWh/mês - Kit Solar {power}kWp {brand} + {brand}
```

**Example**:

```
Gere 1350kWh/mês - Kit Solar 10kWp LONGi + Growatt
```

**Why it works**:

1. Benefit first (1350kWh/mês) → immediate value
2. Power rating (10kWp) → technical match
3. Brands (LONGi + Growatt) → trust + authority
4. Short & scannable → mobile-friendly

### 3. SEO/SEM Optimization

**Purpose**: Rank for high-intent search queries

**Target Keywords**:

- Primary: `kit solar {power}kwp`
- Long-tail: `kit solar {power}kwp para {use_case}`
- Brand: `painel {manufacturer}`, `inversor {manufacturer}`
- Benefit: `gerar {generation}kwh`, `economizar conta luz`

**Title Structure** (50-60 chars):

```
Kit Solar {power}kWp para {use_case} | {brands}
```

**Meta Description** (150-160 chars):

```
Kit Solar {power}kWp completo para {use_case}. Gere até {gen}kWh/mês. 
{panel_brand} + inversor qualidade. R$ {price}/Wp. Frete grátis!
```

**SEO Tags Strategy**:

1. **Category tags** → navigation
   - "Kit Solar", "Energia Solar", "Sistema Fotovoltaico"

2. **Feature tags** → filtering
   - "Grid-Tie", "On-Grid", "Homologado", "Certificado"

3. **Benefit tags** → search intent
   - "Até 500kWh/mês", "Econômico", "Melhor Preço"

4. **Brand tags** → loyalty
   - "Painel LONGi", "Inversor Growatt"

5. **Size tags** → targeting
   - "Residencial Pequeno", "Comercial", "3-6kWp"

### 4. Copywriting Strategy (AIDA Framework)

**Attention** → Hook with benefit

```markdown
# Transforme Luz Solar em Economia Real
## Kit Solar {power}kWp - Gere até {gen}kWh por mês
**Economize até R$ {annual_savings} por ano** com energia limpa
```

**Interest** → Build credibility

```markdown
### Por Que Este Kit é a Escolha Certa?
✓ **Tecnologia Comprovada**: Painéis {brand} {tech}
✓ **Inversor Confiável**: {brand} com garantia estendida
✓ **Geração Previsível**: Média de {gen}kWh/mês
✓ **ROI Rápido**: Retorno em 4-6 anos
```

**Desire** → Technical specs + social proof

```markdown
### O Que Está Incluído
**Painéis Solares {brand}**
- Potência: {power}W por painel
- Quantidade: {qty} unidades
- Garantia: 25 anos de desempenho

### Ideal Para
- Residências com consumo moderado
- Famílias de 3-5 pessoas
- Economia significativa na conta
```

**Action** → Clear CTA with trust signals

```markdown
### Por Que Comprar Conosco?
🚚 **Frete Grátis** para todo o Brasil
💳 **Parcelamento** em até 12x sem juros
⭐ **Nota 4.8/5** - Mais de 1.000 clientes satisfeitos
```

### 5. Medusa.js Structure Optimization

**Product Hierarchy**:

```
Collection: FortLev Solar Kits
  └─ Category: Residencial Pequeno (0-3kWp)
  └─ Category: Residencial Médio (3-6kWp)
  └─ Category: Residencial Grande (6-10kWp)
  └─ Category: Comercial (>10kWp)
      └─ Product: Kit Solar 10kWp LONGi + Growatt
          └─ Variant: 10kWp | LONGi + Growatt
              └─ Inventory Kit:
                  - 20x Panel 500W (LONGi)
                  - 1x Inverter 10kW (Growatt)
```

**Variant Options**:

1. **Potência do Sistema**: "10kWp"
2. **Configuração de Painéis**: "500W x20"
3. **Potência do Inversor**: "10kW"

**Searchable Metadata**:

```json
{
  "seo_title": "Kit Solar 10kWp para Residência Grande | LONGi + Growatt",
  "seo_description": "Kit Solar 10kWp completo...",
  "primary_keyword": "kit solar 10kwp",
  "secondary_keywords": ["painel longi", "inversor growatt", ...],
  "target_audience": "residential_large",
  "value_proposition": "Economia + Sustentabilidade"
}
```

---

## 🔄 Processing Pipeline

### Phase 1: Base Normalization ✅ COMPLETE

```bash
python normalize_titles.py
```

**Output**: `fortlev-kits-normalized.json` (217 kits)

**What it does**:

- Standardizes manufacturer names (30+ brands)
- Generates SKUs: `FLV-{power}KWP-{panel}{inv}-{id}`
- Creates handles: `solar-kit-{power}kwp-{panel}-{inverter}`
- Produces 4 title variants (product, variant, search, SEO)

### Phase 2: Vision AI Enrichment 🚀 IN PROGRESS

```bash
python vision_enrich_titles.py
```

**Output**: `fortlev-kits-vision-enriched.json`

**What it's doing now**:

1. Download panel image → Gemma3 analysis → extract specs
2. Download inverter image → Gemma3 analysis → extract specs
3. Merge vision insights with normalized data
4. Generate SEO-optimized titles with vision data
5. Create marketing copy with identified brands
6. Generate comprehensive descriptions
7. Checkpoint every 10 kits

**Current Status**: Kit 1/217 - Analyzing panel image with Gemma3

**Time Estimate**: ~4-6 hours for 217 kits (1-2 min per kit)

### Phase 3: UX + Medusa Optimization ⏳ PENDING

```bash
python ux_medusa_optimizer.py
```

**Output**: `fortlev-kits-medusa-ready.json`

**What it will do**:

- Transform enriched data to Medusa.js Product structure
- Create inventory kits (panels + inverters as components)
- Generate tiered pricing rules (volume discounts)
- Build complete category hierarchy
- Add variant options and metadata
- Create collections and tags

**Run after**: Vision enrichment completes

### Phase 4: Medusa.js Import ⏳ PENDING

```typescript
// In Medusa backend
import { importSolarKitsWorkflow } from "./workflows/import-solar-kits"

// Execute import
await importSolarKitsWorkflow(container)
  .run({
    input: {
      filePath: "./fortlev-kits-medusa-ready.json"
    }
  })
```

**What it does**:

- Creates collections ("FortLev Solar Kits")
- Creates category hierarchy
- Imports 217 products with variants
- Sets up inventory kits (multi-part products)
- Configures price rules (quantity discounts)
- Links images and metadata

### Phase 5: Semantic Search Setup ⏳ PENDING

```python
# Index to ChromaDB with Gemma3 embeddings
python setup_semantic_search.py
```

**What it does**:

- Creates ChromaDB collection
- Generates embeddings with Ollama Gemma3
- Indexes search_title + description fields
- Configures similarity search
- Tests queries

---

## 📊 Progress Tracking

### Overall Status

| Phase | Status | Progress | Output File |
|-------|--------|----------|-------------|
| 1. Base Normalization | ✅ Complete | 217/217 | fortlev-kits-normalized.json |
| 2. Vision Enrichment | 🚀 Running | 1/217 | fortlev-kits-vision-enriched.json |
| 3. UX + Medusa Opt | ⏳ Pending | 0/217 | fortlev-kits-medusa-ready.json |
| 4. Medusa Import | ⏳ Pending | 0/217 | Database |
| 5. Semantic Search | ⏳ Pending | 0/217 | ChromaDB |

### Vision AI Statistics (Live)

Check progress:

```powershell
# Count enriched kits
python -c "import json; data = json.load(open('fortlev-kits-vision-enriched.json')); print(f'Enriched: {len(data)} kits')"

# View last processed
python -c "import json; data = json.load(open('fortlev-kits-vision-enriched.json')); print(f'Last: {data[-1][\"id\"]}')"
```

---

## 🎨 Title Format Examples

### Sample Kit: 10kWp LONGi + Growatt

**1. UX Optimized** (benefit-first):

```
Gere 1350kWh/mês - Kit Solar 10kWp LONGi + Growatt
```

- ✅ Benefit upfront (1350kWh/mês)
- ✅ Short & scannable (9 words)
- ✅ Brands for trust

**2. SEO Optimized** (50-60 chars):

```
Kit Solar 10kWp para Casa Grande | LONGi + Growatt
```

- ✅ Primary keyword first
- ✅ Long-tail keyword (para Casa Grande)
- ✅ 55 characters

**3. Marketing/Copy** (emotional):

```
Premium: Kit Solar 10kWp LONGi - Economize até 95%
```

- ✅ Value proposition (Premium)
- ✅ Emotional trigger (Economize 95%)
- ✅ Authority brand (LONGi)

**4. Search Title** (Gemma3 semantic):

```
10kWp Solar Energy Kit LONGi Panel Growatt Inverter Grid-Tie System Complete Residential Installation
```

- ✅ All keywords for semantic search
- ✅ Natural language for embeddings
- ✅ Comprehensive for AI understanding

---

## 🏷️ Tag Strategy

### Example Kit Tags (10kWp LONGi + Growatt)

**Category Tags** (navigation):

- Kit Solar
- Energia Solar
- Sistema Fotovoltaico

**Size Tags** (targeting):

- Residencial Grande
- 6-10kWp
- Alto Consumo

**Power Tag**:

- 10kWp

**Brand Tags** (loyalty):

- Painel LONGi
- Inversor Growatt

**Feature Tags** (filtering):

- Grid-Tie
- On-Grid
- Homologado

**Benefit Tags** (search intent):

- Acima 1000kWh/mês
- Melhor Preço (if price_per_wp < 1.5)

**Total**: ~15-20 tags per product

---

## 💡 UX Best Practices Applied

### 1. Scannability

- ✅ Short titles (7-10 words)
- ✅ Bullet points for features
- ✅ Clear hierarchy (H1, H2, H3)
- ✅ Visual indicators (✓, 🚚, 💳)

### 2. Benefit-Driven

- ✅ Lead with value (kWh generation, savings)
- ✅ Emotional triggers (economia, sustentável)
- ✅ Social proof (nota 4.8/5, 1000+ clientes)

### 3. Mobile-First

- ✅ Titles fit mobile screens
- ✅ Key info above fold
- ✅ Touch-friendly CTAs

### 4. Trust Signals

- ✅ Certifications (INMETRO, ANEEL)
- ✅ Guarantees (25 anos, garantia estendida)
- ✅ Brand authority (Tier 1 manufacturers)
- ✅ Customer ratings

### 5. Clear CTAs

- ✅ Prominent buy button
- ✅ Multiple payment options
- ✅ Shipping info upfront
- ✅ Support availability

---

## 📈 Expected Outcomes

### SEO Performance

- **Organic Traffic**: +150-200% in 6 months
- **Ranking**: Top 3 for `kit solar {power}kwp` terms
- **Long-tail**: 50+ ranked long-tail keywords per product
- **CTR**: 4-6% from SERPs (vs. 2% average)

### Conversion Rate

- **Product Views**: +30-40% (better titles → more clicks)
- **Add to Cart**: +20-25% (clear value proposition)
- **Checkout**: +15-20% (trust signals, clear benefits)
- **Overall CR**: 2.5-3.5% (vs. 1.5% industry avg)

### User Experience

- **Bounce Rate**: -25-30% (clear, relevant content)
- **Time on Page**: +40-50% (engaging descriptions)
- **Pages/Session**: +2-3 pages (better navigation)
- **Return Visitors**: +20-25% (positive experience)

---

## 🔍 Semantic Search Strategy

### Query Examples

**User Query** → **Match Strategy**

1. **"kit solar 3kwp residencial"**
   - Matches: search_title field with embeddings
   - Filters: category = "residential_small", power = 2-4kWp
   - Returns: Top 5 3kWp kits sorted by relevance

2. **"painel longi inversor growatt barato"**
   - Matches: tags + metadata (brands)
   - Filters: panel_manufacturer = "LONGi", inverter = "Growatt"
   - Sort: price_per_wp ascending
   - Returns: All LONGi+Growatt kits, cheapest first

3. **"sistema fotovoltaico gerar 1000kwh mes"**
   - Matches: semantic understanding (1000kWh → ~7-8kWp)
   - Filters: monthly_generation_kwh >= 900
   - Returns: 7-9kWp kits with generation data

4. **"energia solar casa ar condicionado"**
   - Matches: description + use_case ("alto consumo")
   - Filters: category = "residential_large"
   - Returns: 6-10kWp kits for high consumption

### ChromaDB Configuration

```python
collection = client.create_collection(
    name="fortlev_solar_kits",
    metadata={"hnsw:space": "cosine"},
    embedding_function=ollama_embeddings
)

# Index fields
documents = [
    kit["titles"]["search_title"] + " " + 
    kit["description_long"] + " " + 
    " ".join(kit["seo"]["tags"])
]

# Query
results = collection.query(
    query_texts=["kit solar 3kwp residencial"],
    n_results=10,
    where={"power_kwp": {"$lte": 4}}
)
```

---

## 🛠️ Tools & Scripts

### Current Scripts

1. **normalize_titles.py** ✅
   - Base normalization
   - Manufacturer standardization
   - SKU generation

2. **vision_enrich_titles.py** 🚀
   - Gemma3 vision analysis
   - Image component identification
   - SEO copy generation
   - Currently running: Kit 1/217

3. **ux_medusa_optimizer.py** ⏳
   - Medusa.js structure
   - Inventory kits
   - Price rules
   - Ready to run after vision complete

4. **preview_normalized.py** ✅
   - Data inspection
   - Statistics
   - Quality checks

### Upcoming Scripts

5. **setup_semantic_search.py** ⏳
   - ChromaDB setup
   - Gemma3 embeddings
   - Query interface

6. **import_to_medusa.ts** ⏳
   - Medusa workflow
   - Batch import
   - Error handling

---

## 📝 Next Steps

### Immediate (Today)

1. ✅ Base normalization (DONE - 217 kits)
2. 🚀 Vision AI enrichment (IN PROGRESS - Kit 1/217)
3. ⏳ Monitor progress (check every 30 min)

### Short-term (This Week)

4. ⏳ UX + Medusa optimization (after vision complete)
5. ⏳ Review enriched data quality
6. ⏳ Configure Medusa.js backend (collections, categories)

### Medium-term (Next Week)

7. ⏳ Create import workflow
8. ⏳ Execute Medusa.js import (217 products)
9. ⏳ Set up ChromaDB + semantic search
10. ⏳ Test search queries

### Long-term (This Month)

11. ⏳ Storefront integration
12. ⏳ A/B testing (titles, descriptions)
13. ⏳ SEO performance tracking
14. ⏳ Conversion rate monitoring

---

## 🎯 Success Metrics

### Data Quality

- ✅ 217/217 kits normalized
- 🚀 Vision analysis accuracy: Target >80%
- ⏳ SEO tag coverage: Target 15-20 tags/product
- ⏳ Description completeness: Target 100%

### Search Performance

- ⏳ Semantic search accuracy: Target >85%
- ⏳ Query response time: Target <200ms
- ⏳ Result relevance: Target 4.5/5 user rating

### Business Impact

- ⏳ Product views: Target +30%
- ⏳ Conversion rate: Target 2.5-3.5%
- ⏳ Average order value: Track change
- ⏳ Return customer rate: Target +20%

---

## 📚 Documentation References

### Medusa.js Guides

- [MEDUSA-AGENTS.md](./MEDUSA-AGENTS.md) - 7 specialized integration patterns
- [NORMALIZATION-SUMMARY.md](./NORMALIZATION-SUMMARY.md) - Complete implementation guide

### Vision AI Docs

- Gemma3 Vision: `http://localhost:11434/api/generate`
- Model: `gemma3:4b` (vision + text)
- Parameters: `temperature=0.3`, `top_p=0.9`

### SEO Resources

- Google Search Central
- Ahrefs SEO Guide
- Moz Beginner's Guide

---

## 🔄 Process Flow Diagram

```
┌─────────────────────┐
│ Raw Kits (217)      │
│ fortlev-kits-       │
│ synced.json         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ PHASE 1:            │✅ COMPLETE
│ Base Normalization  │
│ - Manufacturer map  │
│ - SKU generation    │
│ - 4 title formats   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ fortlev-kits-       │
│ normalized.json     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ PHASE 2:            │🚀 IN PROGRESS
│ Vision Enrichment   │   Kit 1/217
│ - Gemma3 analysis   │
│ - SEO optimization  │
│ - UX writing        │
│ - Copywriting       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ fortlev-kits-       │
│ vision-enriched.    │
│ json                │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ PHASE 3:            │⏳ PENDING
│ Medusa UX Optimizer │
│ - Product structure │
│ - Inventory kits    │
│ - Price rules       │
│ - Categories/tags   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ fortlev-kits-       │
│ medusa-ready.json   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ PHASE 4:            │⏳ PENDING
│ Medusa.js Import    │
│ - Collections       │
│ - Products          │
│ - Variants          │
│ - Inventory kits    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ PHASE 5:            │⏳ PENDING
│ Semantic Search     │
│ - ChromaDB index    │
│ - Gemma3 embeddings │
│ - Query interface   │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│ 🎉 PRODUCTION       │
│ - 217 products live │
│ - SEO optimized     │
│ - Search enabled    │
│ - Ready to sell!    │
└─────────────────────┘
```

---

## 💬 Contact & Support

**Vision AI Issues**:

- Check Ollama: `ollama list` (should show gemma3:4b)
- Test: `ollama run gemma3:4b "test vision"`
- Restart: `ollama serve`

**Script Issues**:

- Check progress: Look at checkpoint files
- Resume: Script auto-saves every 10 kits
- Logs: Check terminal output

**Questions**:

- Medusa.js patterns → Read MEDUSA-AGENTS.md
- SEO strategy → Read sections above
- Technical specs → Check NORMALIZATION-SUMMARY.md

---

**Last Updated**: October 13, 2025  
**Status**: Vision AI processing in background (Kit 1/217)  
**Next Action**: Monitor progress, prepare for UX optimization phase
