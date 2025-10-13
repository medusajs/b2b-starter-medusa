/**
 * 🎯 Exemplo Prático - Uso do Sistema de Normalização
 * 
 * Este arquivo demonstra como usar o sistema de normalização
 * em diferentes cenários do YSH Solar Hub
 */

import {
    toSnakeCase,
    toKebabCase,
    generateS3Key,
    generateS3Url,
} from "./normalize-product-ids"

// ============================================================================
// CENÁRIO 1: Importação de Novo Produto
// ============================================================================

/**
 * Quando um novo produto é importado do distribuidor
 */
async function importNewProduct(rawProduct: any) {
    // Dados originais do distribuidor
    const raw = {
        id: "growatt-min-5000tl-x",
        nome: "Inversor Growatt MIN 5000TL-X 5kW",
        fabricante: "Growatt",
        modelo: "MIN 5000TL-X",
        distribuidor: "ALDO SOLAR",
        categoria: "inversores",
        preco: 4500.00,
        imagem_local: "./aldo/growatt-5000.jpg"
    }

    // Normalização
    const normalized = {
        // SKU padronizado
        sku: "INV_GROWATT_MIN_5000TL_X",

        // Handle para URL
        handle: "inversor-growatt-min-5000tl-x",

        // Metadata estruturada
        metadata: {
            original_id: raw.id,
            manufacturer: "GROWATT",
            model: "MIN_5000TL_X",
            distributor: "ALD",
            category: "inverters",
            price_brl: raw.preco,
        },

        // URL da imagem no S3
        thumbnail: "https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/inverters/aldo/inv-growatt-min-5000tl-x.webp",

        // Metadados de imagem
        image_metadata: {
            s3_key: "inverters/aldo/inv-growatt-min-5000tl-x.webp",
            distributor: "aldo",
            formats: ["webp", "jpg"],
            verified: true,
        }
    }

    return normalized
}

// ============================================================================
// CENÁRIO 2: Busca de Imagem para Produto Existente
// ============================================================================

/**
 * Quando um produto Medusa precisa de imagem
 */
async function enrichProductWithImage(medusaProduct: any) {
    // Produto no Medusa (sem imagem)
    const product = {
        id: "prod_01JCPH9ZXB4K8Y5T6N3M2G1R0Q",
        title: "Inversor Growatt MIN 5000TL-X",
        handle: "inversor-growatt-min-5000tl-x",
        thumbnail: null,
        metadata: {
            sku: "INV_GROWATT_MIN_5000TL_X",
            manufacturer: "GROWATT",
            category: "inverters"
        }
    }

    // 4-Level Image Matching Cascade
    const imageResolution = {
        // Level 1: Exact SKU match
        exact_match: "INV_GROWATT_MIN_5000TL_X",

        // Level 2: Case-insensitive
        case_insensitive: "inv_growatt_min_5000tl_x",

        // Level 3: Partial match
        partial_match: "GROWATT_MIN_5000TL",

        // Level 4: Name/model fuzzy
        fuzzy_match: "growatt 5000"
    }

    // Resultado
    const enriched = {
        ...product,
        thumbnail: "https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/inverters/aldo/inv-growatt-min-5000tl-x.webp",
        metadata: {
            ...product.metadata,
            image_sku: "INV_GROWATT_MIN_5000TL_X",
            image_distributor: "ALD",
            image_source: "internal_catalog",
            image_enriched_at: new Date().toISOString(),
            image_urls: {
                thumbnail: "https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/inverters/aldo/inv-growatt-min-5000tl-x-thumb.webp",
                medium: "https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/inverters/aldo/inv-growatt-min-5000tl-x-medium.webp",
                large: "https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/inverters/aldo/inv-growatt-min-5000tl-x.webp"
            }
        }
    }

    return enriched
}

// ============================================================================
// CENÁRIO 3: Upload de Nova Imagem para S3
// ============================================================================

/**
 * Quando uma nova imagem precisa ser carregada
 */
async function uploadImageToS3(imageFile: File, product: any) {
    // Informações do produto
    const productInfo = {
        sku: "INV_GROWATT_MIN_5000TL_X",
        category: "inverters",
        distributor: "aldo",
        format: "webp"
    }

    // Gerar S3 key padronizada
    const s3Key = `${productInfo.category}/${productInfo.distributor}/${productInfo.sku.toLowerCase().replace(/_/g, '-')}.${productInfo.format}`
    // Result: "inverters/aldo/inv-growatt-min-5000tl-x.webp"

    // Metadados S3
    const s3Metadata = {
        "Content-Type": "image/webp",
        "Cache-Control": "max-age=31536000", // 1 year
        "x-amz-meta-sku": productInfo.sku,
        "x-amz-meta-category": productInfo.category,
        "x-amz-meta-distributor": productInfo.distributor,
        "x-amz-meta-uploaded-at": new Date().toISOString()
    }

    // Upload para S3 (pseudo-código)
    const uploadResult = {
        bucket: "ysh-solar-hub-images",
        key: s3Key,
        url: `https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/${s3Key}`,
        etag: "a1b2c3d4e5f6...",
        size: 156789,
        metadata: s3Metadata
    }

    return uploadResult
}

// ============================================================================
// CENÁRIO 4: Geração de URLs para Frontend
// ============================================================================

/**
 * Quando o frontend precisa exibir produtos com imagens
 */
function generateProductUrls(product: any) {
    const sku = product.metadata.sku // "INV_GROWATT_MIN_5000TL_X"
    const category = product.metadata.category // "inverters"
    const distributor = product.metadata.distributor // "ALD"

    // Normalizar para URLs
    const categorySlug = category.toLowerCase() // "inverters"
    const distributorSlug = distributor.toLowerCase() // "ald"
    const skuSlug = sku.toLowerCase().replace(/_/g, '-') // "inv-growatt-min-5000tl-x"

    return {
        // URL do produto no storefront
        product_url: `https://yellosolar.com.br/produtos/${skuSlug}`,

        // URLs das imagens
        images: {
            thumbnail: `https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/${categorySlug}/${distributorSlug}/${skuSlug}-thumb.webp`,
            medium: `https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/${categorySlug}/${distributorSlug}/${skuSlug}-medium.webp`,
            large: `https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/${categorySlug}/${distributorSlug}/${skuSlug}.webp`,

            // Fallback para JPG
            jpg: `https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/${categorySlug}/${distributorSlug}/${skuSlug}.jpg`
        },

        // URLs para SEO
        seo: {
            canonical: `https://yellosolar.com.br/produtos/${skuSlug}`,
            og_image: `https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/${categorySlug}/${distributorSlug}/${skuSlug}.webp`,
            twitter_image: `https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/${categorySlug}/${distributorSlug}/${skuSlug}.webp`
        }
    }
}

// ============================================================================
// CENÁRIO 5: Resolução de Duplicatas
// ============================================================================

/**
 * Quando há produtos duplicados com mesmo SKU normalizado
 */
function resolveDuplicates(products: any[]) {
    // Produtos com mesmo modelo de distribuidores diferentes
    const duplicates = [
        {
            id: "aldo-growatt-5000",
            name: "Inversor Growatt MIN 5000TL-X",
            distributor: "ALDO",
            sku_normalized: "INV_GROWATT_MIN_5000TL_X"
        },
        {
            id: "renovigi-growatt-5000",
            name: "Inversor Growatt MIN 5000TL-X 5kW",
            distributor: "RENOVIGI",
            sku_normalized: "INV_GROWATT_MIN_5000TL_X"
        }
    ]

    // Estratégia 1: Adicionar sufixo do distribuidor
    const strategy1 = duplicates.map(p => ({
        ...p,
        sku_final: `${p.sku_normalized}_${p.distributor.substring(0, 3).toUpperCase()}`,
        // Result: "INV_GROWATT_MIN_5000TL_X_ALD" e "INV_GROWATT_MIN_5000TL_X_REN"
    }))

    // Estratégia 2: Usar hash único
    const strategy2 = duplicates.map(p => {
        const hash = require('crypto').createHash('md5').update(p.id).digest('hex').substring(0, 8)
        return {
            ...p,
            sku_final: `${p.sku_normalized}_${hash}`,
            // Result: "INV_GROWATT_MIN_5000TL_X_A1B2C3D4"
        }
    })

    // Estratégia 3: Manter original_id para referência
    const strategy3 = duplicates.map(p => ({
        sku: p.sku_normalized, // Mesmo para ambos
        original_id: p.id,      // Diferente
        distributor: p.distributor,
        handle: `${p.sku_normalized.toLowerCase().replace(/_/g, '-')}-${p.distributor.toLowerCase()}`,
        // Result handles: "inv-growatt-min-5000tl-x-aldo" e "inv-growatt-min-5000tl-x-renovigi"
    }))

    return {
        strategy1,
        strategy2,
        strategy3,
        recommended: strategy3 // URLs diferentes, SKU igual para busca
    }
}

// ============================================================================
// CENÁRIO 6: Batch Processing de Imagens
// ============================================================================

/**
 * Quando precisa processar múltiplas imagens em lote
 */
async function batchProcessImages(products: any[]) {
    const results = {
        total: products.length,
        processed: 0,
        enriched: 0,
        errors: 0,
        skipped: 0,
        by_category: {} as Record<string, number>
    }

    for (const product of products) {
        try {
            // Skip se já tem imagem
            if (product.thumbnail && !product.thumbnail.includes('placeholder')) {
                results.skipped++
                continue
            }

            // Buscar imagem
            const sku = product.metadata.sku
            const category = product.metadata.category
            const distributor = product.metadata.distributor || 'aldo'

            const s3Key = `${category}/${distributor}/${sku.toLowerCase().replace(/_/g, '-')}.webp`
            const imageUrl = `https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/${s3Key}`

            // Verificar se imagem existe (HEAD request)
            const exists = await checkImageExists(imageUrl)

            if (exists) {
                // Atualizar produto
                await updateProductImage(product.id, imageUrl)

                results.enriched++
                results.by_category[category] = (results.by_category[category] || 0) + 1
            }

            results.processed++

        } catch (error) {
            results.errors++
            console.error(`Error processing ${product.id}:`, error)
        }
    }

    return results
}

async function checkImageExists(url: string): Promise<boolean> {
    // Implementação real faria HEAD request
    return true
}

async function updateProductImage(productId: string, imageUrl: string): Promise<void> {
    // Implementação real atualizaria no Medusa
    console.log(`Updated ${productId} with ${imageUrl}`)
}

// ============================================================================
// CENÁRIO 7: Geração de Sitemap com Imagens
// ============================================================================

/**
 * Quando precisa gerar sitemap XML com URLs de imagens
 */
function generateImageSitemap(products: any[]) {
    const sitemapEntries = products.map(product => {
        const sku = product.metadata.sku
        const category = product.metadata.category
        const distributor = product.metadata.distributor || 'aldo'
        const handle = product.handle

        const imageUrl = `https://ysh-solar-hub-images.s3.us-east-1.amazonaws.com/${category}/${distributor}/${sku.toLowerCase().replace(/_/g, '-')}.webp`

        return {
            loc: `https://yellosolar.com.br/produtos/${handle}`,
            lastmod: new Date().toISOString(),
            changefreq: 'weekly',
            priority: 0.8,
            image: {
                loc: imageUrl,
                caption: product.title,
                title: product.title,
                license: 'https://yellosolar.com.br/termos'
            }
        }
    })

    // Converter para XML (pseudo-código)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapEntries.map(entry => `
  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
    <image:image>
      <image:loc>${entry.image.loc}</image:loc>
      <image:caption>${entry.image.caption}</image:caption>
      <image:title>${entry.image.title}</image:title>
    </image:image>
  </url>
`).join('')}
</urlset>`

    return xml
}

// ============================================================================
// CENÁRIO 8: Monitoramento e Métricas
// ============================================================================

/**
 * Quando precisa monitorar cobertura de imagens
 */
async function calculateImageCoverage(products: any[]) {
    const metrics = {
        total_products: products.length,
        with_images: 0,
        without_images: 0,
        placeholder_images: 0,
        s3_images: 0,
        local_images: 0,
        by_category: {} as Record<string, { total: number, with_images: number }>
    }

    for (const product of products) {
        const category = product.metadata.category || 'unknown'

        if (!metrics.by_category[category]) {
            metrics.by_category[category] = { total: 0, with_images: 0 }
        }

        metrics.by_category[category].total++

        if (!product.thumbnail || product.thumbnail.includes('placeholder')) {
            metrics.without_images++
        } else {
            metrics.with_images++
            metrics.by_category[category].with_images++

            if (product.thumbnail.includes('s3.amazonaws.com')) {
                metrics.s3_images++
            } else {
                metrics.local_images++
            }
        }
    }

    // Calcular percentuais
    const coverage = {
        ...metrics,
        coverage_percent: Math.round((metrics.with_images / metrics.total_products) * 100),
        s3_percent: Math.round((metrics.s3_images / metrics.with_images) * 100),
        by_category_coverage: Object.entries(metrics.by_category).map(([cat, data]) => ({
            category: cat,
            coverage: Math.round((data.with_images / data.total) * 100),
            total: data.total,
            with_images: data.with_images
        }))
    }

    return coverage
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
    importNewProduct,
    enrichProductWithImage,
    uploadImageToS3,
    generateProductUrls,
    resolveDuplicates,
    batchProcessImages,
    generateImageSitemap,
    calculateImageCoverage
}

// ============================================================================
// EXEMPLO DE USO
// ============================================================================

if (require.main === module) {
    console.log("🎯 Exemplos de Uso do Sistema de Normalização\n")

    // Exemplo 1: Importar produto
    console.log("1️⃣  Importando novo produto...")
    importNewProduct({}).then(result => {
        console.log("   SKU:", result.sku)
        console.log("   Handle:", result.handle)
        console.log("   Image:", result.thumbnail)
        console.log("")
    })

    // Exemplo 2: Gerar URLs
    console.log("2️⃣  Gerando URLs para frontend...")
    const urls = generateProductUrls({
        metadata: {
            sku: "INV_GROWATT_MIN_5000TL_X",
            category: "inverters",
            distributor: "ALD"
        }
    })
    console.log("   Product URL:", urls.product_url)
    console.log("   Image URL:", urls.images.large)
    console.log("")

    // Exemplo 3: Resolver duplicatas
    console.log("3️⃣  Resolvendo duplicatas...")
    const resolution = resolveDuplicates([])
    console.log("   Estratégia recomendada:", resolution.recommended[0]?.handle || "N/A")
    console.log("")

    console.log("✅ Exemplos executados com sucesso!")
}
