#!/usr/bin/env node
/**
 * 🎨 Product Image Enrichment Script
 * 
 * Enriquece produtos do Medusa com imagens do catálogo interno
 * usando o sistema de matching avançado (4-level cascade)
 * 
 * Funcionalidades:
 * - Busca imagens via SKU matching (exact, partial, fuzzy)
 * - Busca por modelo/nome do produto
 * - Usa IMAGE_MAP.json para resolução de imagens
 * - Atualiza thumbnail e cria galeria de imagens
 * - Suporta dry-run para preview
 * - Relatório detalhado com estatísticas
 * 
 * Usage:
 *   npm run enrich:images              # Enriquecer todos os produtos
 *   npm run enrich:images -- --dry-run # Preview sem aplicar mudanças
 *   npm run enrich:images -- --category=panels # Apenas painéis
 *   npm run enrich:images -- --limit=50 # Limitar quantidade
 */

import {
    ExecArgs,
    IProductModuleService,
} from "@medusajs/framework/types"
import {
    ContainerRegistrationKeys,
    ModuleRegistrationName,
} from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

// Paths
const IMAGE_MAP_PATH = path.join(__dirname, "../static/images-catálogo_distribuidores/IMAGE_MAP.json")
const SKU_INDEX_PATH = path.join(__dirname, "../data/catalog/data/SKU_TO_PRODUCTS_INDEX.json")
const CATALOG_PATH = path.join(__dirname, "../data/catalog/unified_schemas")

// Base URL for images
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL || "http://localhost:9000"

interface ImageMapEntry {
    sku: string
    category: string
    distributor: string
    images: {
        original?: string
        webp?: string
        thumbnail?: string
        medium?: string
        large?: string
    }
    hash: string
    verified: boolean
}

interface ImageMapData {
    version: string
    generated_at: string
    total_skus: number
    total_images: number
    mappings: { [sku: string]: ImageMapEntry }
}

interface SkuIndexEntry {
    sku: string
    distributor: string
    category: string
    image: string
    matched_products: Array<{
        id: string
        name: string
        category: string
    }>
}

interface SkuIndexData {
    version: string
    total_skus: number
    matched_skus: number
    coverage_percent: number
    index: { [sku: string]: SkuIndexEntry }
}

interface EnrichmentStats {
    total: number
    enriched: number
    already_had_image: number
    no_match_found: number
    errors: number
    by_category: {
        [category: string]: {
            total: number
            enriched: number
            no_match: number
        }
    }
}

interface CLIOptions {
    dryRun: boolean
    category?: string
    limit?: number
    verbose: boolean
}

/**
 * Parse command line arguments
 */
function parseArgs(): CLIOptions {
    const args = process.argv.slice(2)

    return {
        dryRun: args.includes("--dry-run") || args.includes("-d"),
        category: args.find(arg => arg.startsWith("--category="))?.split("=")[1],
        limit: parseInt(args.find(arg => arg.startsWith("--limit="))?.split("=")[1] || "0"),
        verbose: args.includes("--verbose") || args.includes("-v"),
    }
}

/**
 * Load IMAGE_MAP.json
 */
async function loadImageMap(): Promise<ImageMapData> {
    try {
        const content = await fs.promises.readFile(IMAGE_MAP_PATH, "utf-8")
        return JSON.parse(content) as ImageMapData
    } catch (error) {
        throw new Error(`Failed to load IMAGE_MAP.json: ${error}`)
    }
}

/**
 * Load SKU_TO_PRODUCTS_INDEX.json
 */
async function loadSkuIndex(): Promise<SkuIndexData> {
    try {
        const content = await fs.promises.readFile(SKU_INDEX_PATH, "utf-8")
        return JSON.parse(content) as SkuIndexData
    } catch (error) {
        console.warn("⚠️  SKU_TO_PRODUCTS_INDEX.json not found, will use basic matching")
        return {
            version: "1.0.0",
            total_skus: 0,
            matched_skus: 0,
            coverage_percent: 0,
            index: {}
        }
    }
}

/**
 * Extract SKU from product metadata (multi-level)
 */
function extractSku(product: any): string | null {
    // Level 1: Direct SKU field
    if (product.metadata?.sku) {
        return String(product.metadata.sku).trim().toUpperCase()
    }

    // Level 2: Variant SKU
    if (product.variants && product.variants.length > 0) {
        const variantSku = product.variants[0].sku
        if (variantSku) {
            return String(variantSku).trim().toUpperCase()
        }
    }

    // Level 3: Product handle (often is SKU)
    if (product.handle) {
        return String(product.handle).trim().toUpperCase().replace(/-/g, "_")
    }

    // Level 4: Product ID
    if (product.id) {
        return String(product.id).trim().toUpperCase()
    }

    return null
}

/**
 * Find image for SKU with 4-level matching cascade
 */
function findImageForSku(
    sku: string | null,
    product: any,
    imageMap: ImageMapData,
    skuIndex: SkuIndexData
): ImageMapEntry | null {
    if (!sku) {
        return null
    }

    // Level 1: Exact match in IMAGE_MAP
    if (imageMap.mappings[sku]) {
        return imageMap.mappings[sku]
    }

    // Level 2: Case-insensitive match
    const skuLower = sku.toLowerCase()
    for (const [mapSku, entry] of Object.entries(imageMap.mappings)) {
        if (mapSku.toLowerCase() === skuLower) {
            return entry
        }
    }

    // Level 3: Partial match (SKU contains or is contained)
    for (const [mapSku, entry] of Object.entries(imageMap.mappings)) {
        const mapSkuLower = mapSku.toLowerCase()
        if (skuLower.includes(mapSkuLower) || mapSkuLower.includes(skuLower)) {
            // Validate it's a good match (length difference < 30%)
            const lengthDiff = Math.abs(sku.length - mapSku.length)
            const maxLength = Math.max(sku.length, mapSku.length)
            if (lengthDiff / maxLength < 0.3) {
                return entry
            }
        }
    }

    // Level 4: SKU Index lookup (cross-reference with other products)
    if (skuIndex.index[sku]) {
        const indexEntry = skuIndex.index[sku]
        if (indexEntry.image && imageMap.mappings[indexEntry.sku]) {
            return imageMap.mappings[indexEntry.sku]
        }
    }

    // Level 5: Fuzzy match by product name/model
    if (product.title) {
        const productName = product.title.toLowerCase()
        const productModel = product.metadata?.model?.toLowerCase() || ""

        for (const [mapSku, entry] of Object.entries(imageMap.mappings)) {
            // Check if SKU appears in product name or model
            const skuInName = productName.includes(mapSku.toLowerCase())
            const skuInModel = productModel.includes(mapSku.toLowerCase())

            if (skuInName || skuInModel) {
                return entry
            }
        }
    }

    return null
}

/**
 * Build full image URL
 */
function buildImageUrl(imagePath: string): string {
    // Remove leading slashes
    const cleanPath = imagePath.replace(/^\/+/, "")

    // If already a full URL, return as-is
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
        return cleanPath
    }

    // Build full URL
    return `${IMAGE_BASE_URL}/${cleanPath}`
}

/**
 * Enrich product with images
 */
async function enrichProduct(
    product: any,
    imageMap: ImageMapData,
    skuIndex: SkuIndexData,
    productModuleService: IProductModuleService,
    dryRun: boolean,
    verbose: boolean
): Promise<{ enriched: boolean; reason: string }> {
    // Skip if already has thumbnail
    if (product.thumbnail && !product.thumbnail.includes("placeholder")) {
        return { enriched: false, reason: "already_has_image" }
    }

    // Extract SKU
    const sku = extractSku(product)

    if (verbose) {
        console.log(`   📝 Product: ${product.title}`)
        console.log(`      SKU: ${sku || "NOT FOUND"}`)
    }

    // Find image
    const imageEntry = findImageForSku(sku, product, imageMap, skuIndex)

    if (!imageEntry) {
        if (verbose) {
            console.log(`      ❌ No image found`)
        }
        return { enriched: false, reason: "no_match" }
    }

    // Build image URLs
    const thumbnail = imageEntry.images.thumbnail || imageEntry.images.original
    const medium = imageEntry.images.medium || imageEntry.images.webp || imageEntry.images.original
    const large = imageEntry.images.large || imageEntry.images.original

    if (!thumbnail) {
        if (verbose) {
            console.log(`      ❌ Image entry has no valid images`)
        }
        return { enriched: false, reason: "no_valid_image" }
    }

    const thumbnailUrl = buildImageUrl(thumbnail)
    const mediumUrl = buildImageUrl(medium)
    const largeUrl = buildImageUrl(large)

    if (verbose) {
        console.log(`      ✅ Found image: ${imageEntry.sku}`)
        console.log(`         Thumbnail: ${thumbnailUrl}`)
    }

    if (dryRun) {
        console.log(`      🔍 DRY RUN - Would update:`)
        console.log(`         thumbnail: ${thumbnailUrl}`)
        return { enriched: true, reason: "dry_run" }
    }

    // Update product
    try {
        await productModuleService.updateProducts(product.id, {
            thumbnail: thumbnailUrl,
            metadata: {
                ...product.metadata,
                image_sku: imageEntry.sku,
                image_distributor: imageEntry.distributor,
                image_source: "internal_catalog",
                image_enriched_at: new Date().toISOString(),
                image_urls: {
                    thumbnail: thumbnailUrl,
                    medium: mediumUrl,
                    large: largeUrl,
                }
            }
        })

        if (verbose) {
            console.log(`      ✅ Updated successfully`)
        }

        return { enriched: true, reason: "success" }
    } catch (error: any) {
        console.error(`      ❌ Error updating product: ${error.message}`)
        return { enriched: false, reason: "error" }
    }
}

/**
 * Main enrichment function
 */
export default async function enrichProductImages({ container }: ExecArgs): Promise<void> {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const productModuleService: IProductModuleService = container.resolve(
        ModuleRegistrationName.PRODUCT
    )

    const options = parseArgs()

    const stats: EnrichmentStats = {
        total: 0,
        enriched: 0,
        already_had_image: 0,
        no_match_found: 0,
        errors: 0,
        by_category: {}
    }

    logger.info("🎨 Product Image Enrichment")
    logger.info("=".repeat(50))

    if (options.dryRun) {
        logger.warn("🔍 DRY RUN MODE - No changes will be applied")
    }

    if (options.category) {
        logger.info(`📂 Category filter: ${options.category}`)
    }

    if (options.limit) {
        logger.info(`🔢 Limit: ${options.limit} products`)
    }

    logger.info("")

    // Load data sources
    logger.info("📥 Loading data sources...")

    const imageMap = await loadImageMap()
    logger.info(`   ✅ IMAGE_MAP.json loaded: ${imageMap.total_images} images`)

    const skuIndex = await loadSkuIndex()
    logger.info(`   ✅ SKU_INDEX loaded: ${skuIndex.total_skus} SKUs`)

    logger.info("")

    // Fetch products
    logger.info("📦 Fetching products from Medusa...")

    const filters: any = {
        limit: options.limit || 1000,
        offset: 0
    }

    if (options.category) {
        // Filter by category handle
        const categories = await productModuleService.listProductCategories({
            handle: options.category
        })

        if (categories.length > 0) {
            filters.category_id = categories[0].id
        } else {
            logger.warn(`⚠️  Category '${options.category}' not found, processing all products`)
        }
    }

    const products = await productModuleService.listProducts(filters)

    logger.info(`   ✅ Found ${products.length} products`)
    logger.info("")

    // Process products
    logger.info("🔄 Processing products...")
    logger.info("")

    for (let i = 0; i < products.length; i++) {
        const product = products[i]
        const category = product.metadata?.category || "unknown"

        if (!stats.by_category[category]) {
            stats.by_category[category] = {
                total: 0,
                enriched: 0,
                no_match: 0
            }
        }

        stats.by_category[category].total++
        stats.total++

        if (!options.verbose) {
            process.stdout.write(`\r   Processing: ${i + 1}/${products.length} (${Math.round((i + 1) / products.length * 100)}%)`)
        } else {
            logger.info(`\n📦 [${i + 1}/${products.length}] ${product.title}`)
        }

        const result = await enrichProduct(
            product,
            imageMap,
            skuIndex,
            productModuleService,
            options.dryRun,
            options.verbose
        )

        if (result.enriched && result.reason === "success") {
            stats.enriched++
            stats.by_category[category].enriched++
        } else if (result.reason === "already_has_image") {
            stats.already_had_image++
        } else if (result.reason === "no_match" || result.reason === "no_valid_image") {
            stats.no_match_found++
            stats.by_category[category].no_match++
        } else if (result.reason === "error") {
            stats.errors++
        }
    }

    if (!options.verbose) {
        process.stdout.write("\n")
    }

    // Print summary
    logger.info("")
    logger.info("=".repeat(50))
    logger.info("📊 Enrichment Summary")
    logger.info("=".repeat(50))
    logger.info(`Total products: ${stats.total}`)
    logger.info(`✅ Enriched: ${stats.enriched} (${Math.round(stats.enriched / stats.total * 100)}%)`)
    logger.info(`🖼️  Already had image: ${stats.already_had_image}`)
    logger.info(`❌ No match found: ${stats.no_match_found}`)
    logger.info(`⚠️  Errors: ${stats.errors}`)
    logger.info("")
    logger.info("📊 By Category:")

    Object.entries(stats.by_category)
        .sort((a, b) => b[1].total - a[1].total)
        .forEach(([category, data]) => {
            const coverage = data.total > 0 ? Math.round(data.enriched / data.total * 100) : 0
            logger.info(`   ${category.padEnd(20)} ${data.enriched.toString().padStart(4)}/${data.total.toString().padStart(4)} (${coverage}%)`)
        })

    logger.info("")

    if (options.dryRun) {
        logger.warn("🔍 DRY RUN MODE - No changes were applied")
        logger.info("   Run without --dry-run to apply changes")
    } else {
        logger.info("✅ Image enrichment completed!")
    }

    logger.info("")
}
