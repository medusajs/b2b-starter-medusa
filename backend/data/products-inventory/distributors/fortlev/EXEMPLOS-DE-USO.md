# 🎯 Exemplos de Uso: Dados Enriquecidos

## Como Usar os Kits Enriquecidos com Vision AI + SEO

**Para**: Desenvolvedores, profissionais de marketing, analistas de dados  
**Dados**: 217 kits solares FortLev com enriquecimento completo

---

## 📊 Estrutura de Dados Enriquecidos

Cada kit enriquecido contém:

```json
{
  // Dados originais preservados
  "id": "fortlev_kit_001",
  "name": "Kit 2.44kWp - Panel + Growatt",
  "system_power_kwp": 2.44,
  "pricing": {...},
  "components": {...},
  
  // Análise de visão Gemma3
  "vision_analysis": {
    "panel_manufacturer": "Unknown",
    "panel_model": null,
    "panel_technology": "monocristalino",
    "panel_visual_features": [],
    "panel_confidence": "low",
    "inverter_manufacturer": "Growatt",
    "inverter_model": "MIN 2500TL-X",
    "inverter_specifications": ["2 MPPT", "WiFi"],
    "inverter_confidence": "high"
  },
  
  // Títulos otimizados (3 formatos)
  "titles": {
    "ux_optimized": "Gere 330kWh/mês - Kit Solar 2.44kWp Panel + Growatt",
    "seo_optimized": "Kit Solar 2.44kWp para Casa Pequena | Panel + Growatt",
    "marketing": "Melhor Custo-Benefício: Kit Solar 2.44kWp Panel - Economize até 95%"
  },
  
  // Metadata SEO
  "seo": {
    "meta_description": "Kit Solar 2.44kWp completo para casa pequena. Gere até 330kWh/mês...",
    "tags": ["Kit Solar", "Residencial Pequeno", "2.44kWp", ...],
    "primary_keyword": "kit solar 2.44kwp",
    "secondary_keywords": ["painel solar", "inversor growatt", ...]
  },
  
  // Descrição longa (AIDA framework)
  "description_long": "# Transforme Luz Solar em Economia Real\n\n## Kit Solar 2.44kWp...",
  
  // Metadados UX
  "ux_metadata": {
    "target_audience": "residential_small",
    "value_proposition": "Economia + Sustentabilidade",
    "key_benefits": [
      "Gere 330kWh/mês",
      "Reduza até 95% da conta de luz",
      ...
    ]
  }
}
```

---

## 🔍 Casos de Uso

### 1. Listagem de Produtos (E-commerce)

**Título para Display**:

```javascript
const displayTitle = kit.titles.ux_optimized;
// "Gere 330kWh/mês - Kit Solar 2.44kWp Panel + Growatt"
```

**Tags para Filtros**:

```javascript
const filters = kit.seo.tags.filter(tag => 
  tag.includes('kWp') || 
  tag.includes('Residencial')
);
// ["2.44kWp", "Residencial Pequeno", "Até 3kWp"]
```

**Preview Card**:

```jsx
<ProductCard
  title={kit.titles.ux_optimized}
  price={kit.pricing.final}
  generation={kit.ux_metadata.key_benefits[0]}
  tags={kit.seo.tags.slice(0, 3)}
  image={kit.images.combination}
/>
```

### 2. SEO (Search Engine Optimization)

**HTML Meta Tags**:

```html
<title>{kit.titles.seo_optimized}</title>
<meta name="description" content={kit.seo.meta_description} />
<meta name="keywords" content={kit.seo.secondary_keywords.join(', ')} />
<link rel="canonical" href={`/products/${kit.handle}`} />
```

**Structured Data (Schema.org)**:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": kit.titles.seo_optimized,
  "description": kit.seo.meta_description,
  "brand": {
    "@type": "Brand",
    "name": kit.vision_analysis.panel_manufacturer
  },
  "offers": {
    "@type": "Offer",
    "price": kit.pricing.final,
    "priceCurrency": "BRL"
  }
}
```

### 3. Busca Semântica (Gemma3 + ChromaDB)

**Indexação**:

```python
import chromadb
from chromadb.utils import embedding_functions

# Configurar embeddings com Ollama Gemma3
ollama_ef = embedding_functions.OllamaEmbeddingFunction(
    model_name="gemma3:4b",
    url="http://localhost:11434/api/embeddings"
)

# Criar coleção
collection = client.create_collection(
    name="fortlev_kits",
    embedding_function=ollama_ef
)

# Indexar cada kit
for kit in kits:
    # Combinar textos relevantes para busca
    search_text = " ".join([
        kit["titles"]["search_title"],
        kit["seo"]["meta_description"],
        " ".join(kit["seo"]["tags"])
    ])
    
    collection.add(
        documents=[search_text],
        metadatas=[{
            "id": kit["id"],
            "power": kit["system_power_kwp"],
            "price": kit["pricing"]["final"],
            "category": kit["ux_metadata"]["target_audience"]
        }],
        ids=[kit["id"]]
    )
```

**Query**:

```python
# Buscar kits para casa pequena com Growatt
results = collection.query(
    query_texts=["kit solar residencial pequeno inversor growatt"],
    n_results=10,
    where={"power": {"$lte": 3.5}}
)

for doc, metadata in zip(results['documents'][0], results['metadatas'][0]):
    print(f"Kit: {metadata['id']}, Potência: {metadata['power']}kWp")
```

### 4. Comparação de Produtos

**Tabela Comparativa**:

```javascript
const compareKits = (kit1, kit2) => ({
  features: [
    {
      name: 'Potência',
      kit1: `${kit1.system_power_kwp}kWp`,
      kit2: `${kit2.system_power_kwp}kWp`
    },
    {
      name: 'Fabricante Painel',
      kit1: kit1.vision_analysis.panel_manufacturer,
      kit2: kit2.vision_analysis.panel_manufacturer
    },
    {
      name: 'Geração Mensal',
      kit1: kit1.ux_metadata.key_benefits[0],
      kit2: kit2.ux_metadata.key_benefits[0]
    },
    {
      name: 'Preço',
      kit1: `R$ ${kit1.pricing.final.toFixed(2)}`,
      kit2: `R$ ${kit2.pricing.final.toFixed(2)}`
    },
    {
      name: 'R$/Wp',
      kit1: `R$ ${kit1.pricing.per_wp.toFixed(2)}`,
      kit2: `R$ ${kit2.pricing.per_wp.toFixed(2)}`
    }
  ]
});
```

### 5. Recomendações Personalizadas

**Por Consumo Mensal**:

```javascript
function recommendByConsumption(monthlyConsumption) {
  // Consumo médio → potência necessária (considerando 4.5h sol/dia)
  const requiredPower = monthlyConsumption / (4.5 * 30);
  
  // Buscar kits próximos
  return kits.filter(kit => {
    const power = kit.system_power_kwp;
    return power >= requiredPower * 0.9 && power <= requiredPower * 1.2;
  }).sort((a, b) => a.pricing.per_wp - b.pricing.per_wp);
}

// Exemplo: cliente consome 500kWh/mês
const recommended = recommendByConsumption(500);
// Retorna kits 3-4.5kWp ordenados por melhor custo-benefício
```

**Por Orçamento**:

```javascript
function recommendByBudget(maxBudget) {
  return kits
    .filter(kit => kit.pricing.final <= maxBudget)
    .sort((a, b) => b.system_power_kwp - a.system_power_kwp);
}

// Exemplo: orçamento de R$ 15.000
const options = recommendByBudget(15000);
// Retorna kits mais potentes dentro do orçamento
```

### 6. Analytics e Relatórios

**Dashboard de Estatísticas**:

```javascript
const analytics = {
  // Por fabricante
  byManufacturer: kits.reduce((acc, kit) => {
    const mfg = kit.vision_analysis.panel_manufacturer;
    if (!acc[mfg]) acc[mfg] = { count: 0, total_power: 0 };
    acc[mfg].count++;
    acc[mfg].total_power += kit.system_power_kwp;
    return acc;
  }, {}),
  
  // Por categoria
  byCategory: kits.reduce((acc, kit) => {
    const cat = kit.ux_metadata.target_audience;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(kit);
    return acc;
  }, {}),
  
  // Distribuição de preços
  priceDistribution: {
    min: Math.min(...kits.map(k => k.pricing.final)),
    max: Math.max(...kits.map(k => k.pricing.final)),
    avg: kits.reduce((sum, k) => sum + k.pricing.final, 0) / kits.length
  }
};
```

### 7. E-mail Marketing

**Template de Produto**:

```html
<div class="product-email">
  <h2>{{kit.titles.marketing}}</h2>
  
  <p>{{kit.ux_metadata.key_benefits[0]}}</p>
  
  <img src="{{kit.images.combination}}" alt="{{kit.titles.ux_optimized}}">
  
  <div class="benefits">
    {{#each kit.ux_metadata.key_benefits}}
      <p>✓ {{this}}</p>
    {{/each}}
  </div>
  
  <div class="specs">
    <p>Potência: {{kit.system_power_kwp}}kWp</p>
    <p>Painel: {{kit.vision_analysis.panel_manufacturer}}</p>
    <p>Inversor: {{kit.vision_analysis.inverter_manufacturer}}</p>
  </div>
  
  <a href="/products/{{kit.handle}}" class="cta">
    Ver Detalhes - R$ {{kit.pricing.final}}
  </a>
</div>
```

### 8. Filtros Avançados

**Interface de Filtros**:

```javascript
class KitFilter {
  constructor(kits) {
    this.kits = kits;
    this.filtered = [...kits];
  }
  
  byPower(min, max) {
    this.filtered = this.filtered.filter(k => 
      k.system_power_kwp >= min && k.system_power_kwp <= max
    );
    return this;
  }
  
  byPanelManufacturer(manufacturer) {
    this.filtered = this.filtered.filter(k =>
      k.vision_analysis.panel_manufacturer === manufacturer
    );
    return this;
  }
  
  byInverterManufacturer(manufacturer) {
    this.filtered = this.filtered.filter(k =>
      k.vision_analysis.inverter_manufacturer === manufacturer
    );
    return this;
  }
  
  byPriceRange(min, max) {
    this.filtered = this.filtered.filter(k =>
      k.pricing.final >= min && k.pricing.final <= max
    );
    return this;
  }
  
  byCategory(category) {
    this.filtered = this.filtered.filter(k =>
      k.ux_metadata.target_audience === category
    );
    return this;
  }
  
  byTags(tags) {
    this.filtered = this.filtered.filter(k =>
      tags.every(tag => k.seo.tags.includes(tag))
    );
    return this;
  }
  
  sortBy(field, direction = 'asc') {
    this.filtered.sort((a, b) => {
      const valA = this.getNestedValue(a, field);
      const valB = this.getNestedValue(b, field);
      return direction === 'asc' ? valA - valB : valB - valA;
    });
    return this;
  }
  
  getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }
  
  get results() {
    return this.filtered;
  }
}

// Uso
const filter = new KitFilter(kits);
const results = filter
  .byPower(3, 6)
  .byPanelManufacturer('LONGi')
  .byPriceRange(0, 20000)
  .sortBy('pricing.per_wp', 'asc')
  .results;
```

### 9. Import para Medusa.js

**Workflow de Import**:

```typescript
import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk"

type ImportKitsInput = {
  filePath: string
}

export const importEnrichedKitsWorkflow = createWorkflow(
  "import-enriched-kits",
  (input: ImportKitsInput) => {
    // 1. Load enriched kits
    const kits = loadKitsFromFile(input.filePath)
    
    // 2. Create collections
    const collection = createCollectionStep({
      title: "FortLev Solar Kits",
      handle: "fortlev-solar-kits"
    })
    
    // 3. Create categories
    const categories = createCategoriesStep([
      { name: "Residencial Pequeno", handle: "residencial-pequeno" },
      { name: "Residencial Médio", handle: "residencial-medio" },
      { name: "Residencial Grande", handle: "residencial-grande" },
      { name: "Comercial", handle: "comercial" }
    ])
    
    // 4. Import products
    const products = kits.map(kit => ({
      title: kit.titles.ux_optimized,
      subtitle: kit.titles.marketing,
      handle: kit.handle,
      description: kit.description_long,
      collection_id: collection.id,
      category: categories.find(c => 
        c.handle === getCategoryHandle(kit)
      ).id,
      tags: kit.seo.tags.map(t => ({ value: t })),
      metadata: {
        seo_title: kit.titles.seo_optimized,
        seo_description: kit.seo.meta_description,
        ...kit.vision_analysis
      },
      variants: [{
        title: kit.variant_title,
        sku: kit.variant_sku,
        prices: [{ 
          amount: kit.pricing.final * 100,
          currency_code: "brl"
        }]
      }]
    }))
    
    return createProductsStep(products)
  }
)
```

### 10. A/B Testing

**Teste de Títulos**:

```javascript
const abTest = {
  variants: {
    A: kit.titles.ux_optimized,      // Benefício primeiro
    B: kit.titles.seo_optimized,     // Keyword primeiro
    C: kit.titles.marketing           // Marketing copy
  },
  
  track: (variant, event) => {
    analytics.track('product_title_test', {
      kit_id: kit.id,
      variant: variant,
      event: event,  // 'view', 'click', 'add_to_cart'
      timestamp: Date.now()
    });
  },
  
  analyze: () => {
    // Calcular conversion rate por variante
    const results = analytics.query({
      metric: 'conversion_rate',
      groupBy: 'variant',
      filter: { kit_id: kit.id }
    });
    
    return results;
  }
};
```

---

## 🎨 Exemplos Visuais

### Card de Produto

```jsx
<div className="product-card">
  {/* Badge de categoria */}
  <span className="badge">{kit.ux_metadata.target_audience}</span>
  
  {/* Imagem */}
  <img src={kit.images.combination} alt={kit.titles.ux_optimized} />
  
  {/* Título UX */}
  <h3>{kit.titles.ux_optimized}</h3>
  
  {/* Benefício principal */}
  <p className="benefit">{kit.ux_metadata.key_benefits[0]}</p>
  
  {/* Especificações */}
  <div className="specs">
    <span>⚡ {kit.system_power_kwp}kWp</span>
    <span>📦 {kit.vision_analysis.panel_manufacturer}</span>
    <span>🔌 {kit.vision_analysis.inverter_manufacturer}</span>
  </div>
  
  {/* Tags (primeiras 3) */}
  <div className="tags">
    {kit.seo.tags.slice(0, 3).map(tag => (
      <span key={tag} className="tag">{tag}</span>
    ))}
  </div>
  
  {/* Preço */}
  <div className="price">
    <span className="amount">R$ {kit.pricing.final.toFixed(2)}</span>
    <span className="per-wp">R$ {kit.pricing.per_wp.toFixed(2)}/Wp</span>
  </div>
  
  {/* CTA */}
  <button>Ver Detalhes</button>
</div>
```

### Página de Detalhes

```jsx
<div className="product-detail">
  {/* Hero Section */}
  <section className="hero">
    <div className="gallery">
      <img src={kit.images.combination} />
      <img src={kit.images.panel} />
      <img src={kit.images.inverter} />
    </div>
    
    <div className="summary">
      <h1>{kit.titles.seo_optimized}</h1>
      <p className="subtitle">{kit.titles.marketing}</p>
      
      <div className="key-benefits">
        {kit.ux_metadata.key_benefits.map(benefit => (
          <p key={benefit}>✓ {benefit}</p>
        ))}
      </div>
      
      <div className="price-block">
        <h2>R$ {kit.pricing.final.toFixed(2)}</h2>
        <p>ou 12x de R$ {(kit.pricing.final / 12).toFixed(2)}</p>
      </div>
      
      <button className="cta">Adicionar ao Carrinho</button>
    </div>
  </section>
  
  {/* Descrição Longa (AIDA) */}
  <section className="description">
    <div dangerouslySetInnerHTML={{ 
      __html: marked(kit.description_long) 
    }} />
  </section>
  
  {/* Especificações Técnicas */}
  <section className="specs">
    <h2>Especificações Técnicas</h2>
    <table>
      <tr>
        <td>Potência do Sistema</td>
        <td>{kit.system_power_kwp}kWp</td>
      </tr>
      <tr>
        <td>Fabricante Painel</td>
        <td>{kit.vision_analysis.panel_manufacturer}</td>
      </tr>
      <tr>
        <td>Modelo Painel</td>
        <td>{kit.vision_analysis.panel_model || 'N/A'}</td>
      </tr>
      <tr>
        <td>Tecnologia</td>
        <td>{kit.vision_analysis.panel_technology}</td>
      </tr>
      <tr>
        <td>Fabricante Inversor</td>
        <td>{kit.vision_analysis.inverter_manufacturer}</td>
      </tr>
      <tr>
        <td>Modelo Inversor</td>
        <td>{kit.vision_analysis.inverter_model || 'N/A'}</td>
      </tr>
    </table>
  </section>
  
  {/* Tags SEO */}
  <section className="tags">
    {kit.seo.tags.map(tag => (
      <a key={tag} href={`/search?tag=${tag}`}>{tag}</a>
    ))}
  </section>
</div>
```

---

## 🔗 Integração com Sistemas

### CRM (HubSpot, Salesforce)

```javascript
// Sincronizar kit como produto no CRM
const syncToCRM = async (kit) => {
  await crm.products.create({
    name: kit.titles.seo_optimized,
    description: kit.seo.meta_description,
    price: kit.pricing.final,
    properties: {
      power_kwp: kit.system_power_kwp,
      panel_manufacturer: kit.vision_analysis.panel_manufacturer,
      inverter_manufacturer: kit.vision_analysis.inverter_manufacturer,
      category: kit.ux_metadata.target_audience,
      tags: kit.seo.tags.join(', ')
    }
  });
};
```

### ERP

```javascript
// Integrar com sistema de inventário
const syncToERP = async (kit) => {
  await erp.inventory.update({
    sku: kit.variant_sku,
    name: kit.titles.ux_optimized,
    category: kit.ux_metadata.target_audience,
    components: [
      {
        type: 'panel',
        manufacturer: kit.vision_analysis.panel_manufacturer,
        quantity: kit.components.panel.quantity
      },
      {
        type: 'inverter',
        manufacturer: kit.vision_analysis.inverter_manufacturer,
        quantity: 1
      }
    ]
  });
};
```

### BI/Analytics (Power BI, Tableau)

```javascript
// Exportar para análise
const exportForBI = (kits) => {
  return kits.map(kit => ({
    id: kit.id,
    title: kit.titles.ux_optimized,
    power: kit.system_power_kwp,
    category: kit.ux_metadata.target_audience,
    panel_manufacturer: kit.vision_analysis.panel_manufacturer,
    inverter_manufacturer: kit.vision_analysis.inverter_manufacturer,
    price: kit.pricing.final,
    price_per_wp: kit.pricing.per_wp,
    panel_confidence: kit.vision_analysis.panel_confidence,
    inverter_confidence: kit.vision_analysis.inverter_confidence,
    tags_count: kit.seo.tags.length,
    has_combination_image: !!kit.images.combination
  }));
};
```

---

## 📈 Métricas e KPIs

### Qualidade dos Dados

```javascript
const dataQuality = {
  // Confiança da visão AI
  visionConfidence: {
    high: kits.filter(k => 
      k.vision_analysis.panel_confidence === 'high' &&
      k.vision_analysis.inverter_confidence === 'high'
    ).length,
    medium: kits.filter(k =>
      k.vision_analysis.panel_confidence === 'medium' ||
      k.vision_analysis.inverter_confidence === 'medium'
    ).length,
    low: kits.filter(k =>
      k.vision_analysis.panel_confidence === 'low' ||
      k.vision_analysis.inverter_confidence === 'low'
    ).length
  },
  
  // Completude dos dados
  completeness: {
    withPanelImage: kits.filter(k => k.images.panel).length,
    withInverterImage: kits.filter(k => k.images.inverter).length,
    withCombinationImage: kits.filter(k => k.images.combination).length,
    fullMetadata: kits.filter(k => 
      k.vision_analysis.panel_manufacturer !== 'Unknown' &&
      k.vision_analysis.inverter_manufacturer !== 'Unknown'
    ).length
  }
};
```

---

## 🎓 Melhores Práticas

1. **Use títulos contextuais**:
   - Listagem → `ux_optimized` (benefício primeiro)
   - Página de produto → `seo_optimized` (SEO friendly)
   - Anúncios → `marketing` (apelo emocional)

2. **Aproveite as tags**:
   - Filtros de navegação
   - Breadcrumbs
   - Links relacionados

3. **Implemente busca semântica**:
   - Melhora relevância dos resultados
   - Entende intenção do usuário
   - Reduz zero-results

4. **Use descrições longas**:
   - SEO (conteúdo rico)
   - Conversão (AIDA framework)
   - Educação do cliente

5. **Monitore confiança da visão**:
   - High confidence → use diretamente
   - Medium/Low → revisar manualmente

---

**Última Atualização**: 13 Outubro 2025  
**Versão**: 1.0
