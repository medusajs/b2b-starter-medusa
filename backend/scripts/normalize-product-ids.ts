#!/usr/bin/env node
/**
 * 🎯 Product ID Normalization & Standardization
 * 
 * Sistema de padronização de IDs, SKUs e nomenclatura para:
 * - Produtos do catálogo interno
 * - Imagens dos distribuidores
 * - Deployment no S3
 * - Sincronização Medusa
 * 
 * Padrões de Nomenclatura:
 * - SKU: UPPERCASE_SNAKE_CASE (ex: INV_GROWATT_MIN_5000TL_X)
 * - Image ID: lowercase-kebab-case (ex: inv-growatt-min-5000tl-x)
 * - S3 Key: category/distributor/sku.webp
 * - Product Handle: lowercase-kebab-case (ex: inversor-growatt-min-5000tl-x)
 * 
 * Usage:
 *   npm run normalize:ids              # Normalizar todos os IDs
 *   npm run normalize:ids -- --dry-run # Preview sem aplicar
 *   npm run normalize:ids -- --export  # Exportar mapeamento
 */

import fs from "fs"
import path from "path"
import crypto from "crypto"

// Paths
const CATALOG_PATH = path.join(__dirname, "../data/catalog/unified_schemas")
const IMAGE_MAP_PATH = path.join(__dirname, "../static/images-catálogo_distribuidores/IMAGE_MAP.json")
const SKU_INDEX_PATH = path.join(__dirname, "../data/catalog/data/SKU_TO_PRODUCTS_INDEX.json")
const OUTPUT_PATH = path.join(__dirname, "../data/catalog/data")

// S3 Configuration
const S3_BUCKET = process.env.S3_BUCKET || "ysh-solar-hub-images"
const S3_REGION = process.env.S3_REGION || "us-east-1"
const S3_BASE_URL = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`

// Category mapping for normalization
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

// Distributor codes
const DISTRIBUTOR_CODES: Record<string, string> = {
    "ALDO": "ALD",
    "ALDO SOLAR": "ALD",
    "RENOVIGI": "RNV",
    "SOLFACIL": "SFL",
    "SOLFÁCIL": "SFL",
    "MINHA CASA SOLAR": "MCS",
    "FATOR SOLAR": "FTS",
}

interface NormalizedID {
    original: string
    normalized: string
    category: string
    distributor: string
    model: string
    hash: string
}

interface NormalizationMapping {
    version: string
    generated_at: string
    total_products: number
    total_normalized: number
    mappings: {
        [originalId: string]: NormalizedID
    }
    reverse_mappings: {
        [normalizedId: string]: string[]
    }
}

interface S3DeploymentManifest {
    version: string
    bucket: string
    region: string
    base_url: string
    generated_at: string
    total_images: number
    categories: {
        [category: string]: {
            total: number
            distributors: {
                [distributor: string]: {
                    total: number
                    images: Array<{
                        sku: string
                        s3_key: string
                        url: string
                        size?: number
                        formats: string[]
                    }>
                }
            }
        }
    }
}

/**
 * Clean and normalize string to UPPERCASE_SNAKE_CASE
 */
function toSnakeCase(str: string): string {
    return str
        .trim()
        .toUpperCase()
        // Remove special characters except letters, numbers, space, dash, underscore
        .replace(/[^A-Z0-9\s\-_]/g, "")
        // Replace spaces and dashes with underscores
        .replace(/[\s\-]+/g, "_")
        // Remove multiple consecutive underscores
        .replace(/_+/g, "_")
        // Remove leading/trailing underscores
        .replace(/^_+|_+$/g, "")
}

/**
 * Clean and normalize string to lowercase-kebab-case
 */
function toKebabCase(str: string): string {
    return str
        .trim()
        .toLowerCase()
        // Remove special characters except letters, numbers, space, dash, underscore
        .replace(/[^a-z0-9\s\-_]/g, "")
        // Replace spaces and underscores with dashes
        .replace(/[\s_]+/g, "-")
        // Remove multiple consecutive dashes
        .replace(/-+/g, "-")
        // Remove leading/trailing dashes
        .replace(/^-+|-+$/g, "")
}

/**
 * Extract manufacturer from product name
 */
function extractManufacturer(name: string, manufacturer?: string): string {
    if (manufacturer) {
        return toSnakeCase(manufacturer)
    }

    // Common manufacturers
    const manufacturers = [
        "GROWATT", "DEYE", "FRONIUS", "SMA", "ABB", "WEG", "HUAWEI",
        "CANADIAN", "JINKO", "JA SOLAR", "TRINA", "LONGI", "BYD",
        "RISEN", "LEAPTON", "OSDA", "DAH", "TALESUN", "SUNOVA"
    ]

    const nameUpper = name.toUpperCase()
    for (const mfg of manufacturers) {
        if (nameUpper.includes(mfg)) {
            return toSnakeCase(mfg)
        }
    }

    // Try to extract first word as manufacturer
    const firstWord = name.split(/[\s\-_]/)[0]
    return toSnakeCase(firstWord)
}

/**
 * Extract model from product name
 */
function extractModel(name: string, manufacturer: string): string {
    // Remove manufacturer from name
    let model = name.replace(new RegExp(manufacturer, "gi"), "").trim()

    // Remove common prefixes
    model = model.replace(/^(inversor|painel|kit|bateria|estrutura|cabo|controlador)/gi, "").trim()

    // Normalize to snake case
    return toSnakeCase(model)
}

/**
 * Generate normalized SKU
 */
function generateNormalizedSKU(
    product: any,
    category: string
): string {
    const prefix = CATEGORY_PREFIXES[category] || "PRD"
    const manufacturer = extractManufacturer(product.name || product.title, product.manufacturer)
    const model = extractModel(product.name || product.title, manufacturer)

    return `${prefix}_${manufacturer}_${model}`
}

/**
 * Generate hash for deduplication
 */
function generateHash(sku: string): string {
    return crypto.createHash("md5").update(sku).digest("hex").substring(0, 8)
}

/**
 * Normalize distributor name
 */
function normalizeDistributor(distributor: string): string {
    const cleaned = distributor.trim().toUpperCase()
    return DISTRIBUTOR_CODES[cleaned] || toSnakeCase(distributor).substring(0, 3)
}

/**
 * Generate S3 key for image
 */
function generateS3Key(
    category: string,
    distributor: string,
    sku: string,
    format: string = "webp"
): string {
    const normalizedCategory = toKebabCase(category)
    const normalizedDistributor = toKebabCase(distributor)
    const normalizedSku = toKebabCase(sku)

    return `${normalizedCategory}/${normalizedDistributor}/${normalizedSku}.${format}`
}

/**
 * Generate full S3 URL
 */
function generateS3Url(s3Key: string): string {
    return `${S3_BASE_URL}/${s3Key}`
}

/**
 * Normalize products from catalog
 */
async function normalizeProducts(
    dryRun: boolean = false,
    verbose: boolean = false
): Promise<NormalizationMapping> {
    const mapping: NormalizationMapping = {
        version: "1.0.0",
        generated_at: new Date().toISOString(),
        total_products: 0,
        total_normalized: 0,
        mappings: {},
        reverse_mappings: {}
    }

    console.log("📦 Normalizing product IDs...")
    console.log("")

    const categories = [
        "inverters", "panels", "kits", "batteries", "structures",
        "cables", "controllers", "accessories", "stringboxes",
        "ev_chargers", "posts"
    ]

    for (const category of categories) {
        const filePath = path.join(CATALOG_PATH, `${category}_unified.json`)

        if (!fs.existsSync(filePath)) {
            if (verbose) {
                console.log(`⚠️  ${category}: File not found, skipping`)
            }
            continue
        }

        const content = fs.readFileSync(filePath, "utf-8")
        const products = JSON.parse(content)

        if (verbose) {
            console.log(`📂 ${category}: ${products.length} products`)
        }

        for (const product of products) {
            const originalId = product.id || product.sku

            if (!originalId) {
                console.warn(`⚠️  Product without ID in ${category}:`, product.name)
                continue
            }

            const normalizedSKU = generateNormalizedSKU(product, category)
            const hash = generateHash(normalizedSKU)

            const normalized: NormalizedID = {
                original: originalId,
                normalized: normalizedSKU,
                category: category,
                distributor: normalizeDistributor(product.distributor || product.distribution_center || "UNKNOWN"),
                model: product.model || extractModel(product.name, extractManufacturer(product.name, product.manufacturer)),
                hash: hash
            }

            mapping.mappings[originalId] = normalized

            // Reverse mapping for deduplication
            if (!mapping.reverse_mappings[normalizedSKU]) {
                mapping.reverse_mappings[normalizedSKU] = []
            }
            mapping.reverse_mappings[normalizedSKU].push(originalId)

            mapping.total_products++
        }

        if (!dryRun) {
            // Update file with normalized IDs
            const updatedProducts = products.map((p: any) => {
                const originalId = p.id || p.sku
                const normalized = mapping.mappings[originalId]

                if (normalized) {
                    return {
                        ...p,
                        id: normalized.normalized,
                        original_id: originalId,
                        normalized_sku: normalized.normalized,
                        product_hash: normalized.hash,
                        metadata: {
                            ...p.metadata,
                            normalized_at: new Date().toISOString(),
                            normalization_version: "1.0.0"
                        }
                    }
                }
                return p
            })

            fs.writeFileSync(
                filePath,
                JSON.stringify(updatedProducts, null, 2),
                "utf-8"
            )
        }

        mapping.total_normalized += products.length
    }

    console.log("")
    console.log(`✅ Normalized ${mapping.total_normalized} products`)
    console.log(`📊 Unique SKUs: ${Object.keys(mapping.reverse_mappings).length}`)

    // Check for duplicates
    const duplicates = Object.entries(mapping.reverse_mappings)
        .filter(([_, originals]) => originals.length > 1)

    if (duplicates.length > 0) {
        console.log(`⚠️  Found ${duplicates.length} duplicate SKUs:`)
        duplicates.slice(0, 5).forEach(([sku, originals]) => {
            console.log(`   ${sku}: ${originals.length} products (${originals.slice(0, 2).join(", ")}...)`)
        })
    }

    return mapping
}

/**
 * Generate S3 deployment manifest
 */
async function generateS3Manifest(
    normalizationMapping: NormalizationMapping,
    dryRun: boolean = false
): Promise<S3DeploymentManifest> {
    const manifest: S3DeploymentManifest = {
        version: "1.0.0",
        bucket: S3_BUCKET,
        region: S3_REGION,
        base_url: S3_BASE_URL,
        generated_at: new Date().toISOString(),
        total_images: 0,
        categories: {}
    }

    console.log("")
    console.log("📸 Generating S3 deployment manifest...")
    console.log("")

    // Load IMAGE_MAP if exists
    if (!fs.existsSync(IMAGE_MAP_PATH)) {
        console.log("⚠️  IMAGE_MAP.json not found, creating empty manifest")
        return manifest
    }

    const imageMapContent = fs.readFileSync(IMAGE_MAP_PATH, "utf-8")
    const imageMap = JSON.parse(imageMapContent)

    for (const [sku, entry] of Object.entries(imageMap.mappings || {})) {
        const imageEntry = entry as any
        const category = imageEntry.category || "unknown"
        const distributor = normalizeDistributor(imageEntry.distributor || "unknown")

        // Initialize category
        if (!manifest.categories[category]) {
            manifest.categories[category] = {
                total: 0,
                distributors: {}
            }
        }

        // Initialize distributor
        if (!manifest.categories[category].distributors[distributor]) {
            manifest.categories[category].distributors[distributor] = {
                total: 0,
                images: []
            }
        }

        // Get normalized SKU if available
        const normalizedEntry = normalizationMapping.mappings[sku]
        const normalizedSku = normalizedEntry?.normalized || toSnakeCase(sku)

        // Generate S3 keys for different formats
        const formats = ["webp", "jpg", "png"].filter(fmt =>
            imageEntry.images?.[fmt] || fmt === "webp"
        )

        const imageInfo = {
            sku: normalizedSku,
            s3_key: generateS3Key(category, distributor, normalizedSku, "webp"),
            url: "",
            formats: formats
        }

        imageInfo.url = generateS3Url(imageInfo.s3_key)

        manifest.categories[category].distributors[distributor].images.push(imageInfo)
        manifest.categories[category].distributors[distributor].total++
        manifest.categories[category].total++
        manifest.total_images++
    }

    console.log(`✅ Generated manifest for ${manifest.total_images} images`)
    console.log(`📊 Categories: ${Object.keys(manifest.categories).length}`)

    return manifest
}

/**
 * Export normalized mappings
 */
async function exportMappings(
    normalizationMapping: NormalizationMapping,
    s3Manifest: S3DeploymentManifest,
    outputPath: string
) {
    console.log("")
    console.log("💾 Exporting mappings...")
    console.log("")

    // Create output directory
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true })
    }

    // 1. Save normalization mapping
    const normalizationPath = path.join(outputPath, "PRODUCT_NORMALIZATION.json")
    fs.writeFileSync(
        normalizationPath,
        JSON.stringify(normalizationMapping, null, 2),
        "utf-8"
    )
    console.log(`✅ Saved: ${normalizationPath}`)

    // 2. Save S3 manifest
    const manifestPath = path.join(outputPath, "S3_DEPLOYMENT_MANIFEST.json")
    fs.writeFileSync(
        manifestPath,
        JSON.stringify(s3Manifest, null, 2),
        "utf-8"
    )
    console.log(`✅ Saved: ${manifestPath}`)

    // 3. Generate CSV for easy review
    const csvPath = path.join(outputPath, "product_normalization.csv")
    const csvLines = ["Original ID,Normalized SKU,Category,Distributor,Model,Hash"]

    Object.values(normalizationMapping.mappings).forEach(entry => {
        csvLines.push([
            entry.original,
            entry.normalized,
            entry.category,
            entry.distributor,
            entry.model,
            entry.hash
        ].join(","))
    })

    fs.writeFileSync(csvPath, csvLines.join("\n"), "utf-8")
    console.log(`✅ Saved: ${csvPath}`)

    // 4. Generate S3 sync script
    const syncScriptPath = path.join(outputPath, "sync-to-s3.sh")
    const syncScript = generateS3SyncScript(s3Manifest)
    fs.writeFileSync(syncScriptPath, syncScript, "utf-8")
    fs.chmodSync(syncScriptPath, "755")
    console.log(`✅ Saved: ${syncScriptPath}`)

    // 5. Generate duplicate report
    const duplicates = Object.entries(normalizationMapping.reverse_mappings)
        .filter(([_, originals]) => originals.length > 1)

    if (duplicates.length > 0) {
        const duplicatesPath = path.join(outputPath, "DUPLICATES_REPORT.json")
        fs.writeFileSync(
            duplicatesPath,
            JSON.stringify({
                total_duplicates: duplicates.length,
                duplicates: duplicates.map(([sku, originals]) => ({
                    normalized_sku: sku,
                    duplicate_count: originals.length,
                    original_ids: originals
                }))
            }, null, 2),
            "utf-8"
        )
        console.log(`✅ Saved: ${duplicatesPath}`)
    }

    console.log("")
    console.log("✅ All mappings exported successfully!")
}

/**
 * Generate S3 sync script
 */
function generateS3SyncScript(manifest: S3DeploymentManifest): string {
    const script = `#!/bin/bash
#
# S3 Image Deployment Script
# Generated: ${manifest.generated_at}
# Total Images: ${manifest.total_images}
#

set -e

BUCKET="${manifest.bucket}"
REGION="${manifest.region}"
SOURCE_DIR="./static/images-catálogo_distribuidores"

echo "🚀 Deploying images to S3..."
echo "   Bucket: $BUCKET"
echo "   Region: $REGION"
echo "   Total: ${manifest.total_images} images"
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

# Check credentials
aws sts get-caller-identity > /dev/null 2>&1 || {
    echo "❌ AWS credentials not configured"
    exit 1
}

# Create bucket if not exists
aws s3 mb s3://$BUCKET --region $REGION 2>/dev/null || echo "Bucket already exists"

# Enable public read access (optional)
# aws s3api put-bucket-policy --bucket $BUCKET --policy file://bucket-policy.json

# Sync images by category
${Object.keys(manifest.categories).map(category => `
echo "📦 Syncing ${category}..."
aws s3 sync "$SOURCE_DIR/${category}/" "s3://$BUCKET/${category}/" \\
    --acl public-read \\
    --cache-control "max-age=31536000" \\
    --metadata-directive REPLACE \\
    --delete \\
    --exclude "*" \\
    --include "*.webp" \\
    --include "*.jpg" \\
    --include "*.png"
`).join("")}

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📊 Deployment Summary:"
${Object.entries(manifest.categories).map(([category, data]) => `
echo "   ${category}: ${data.total} images"
`).join("")}
echo ""
echo "🌐 Base URL: ${manifest.base_url}"
echo ""
`

    return script
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2)
    const dryRun = args.includes("--dry-run") || args.includes("-d")
    const exportOnly = args.includes("--export") || args.includes("-e")
    const verbose = args.includes("--verbose") || args.includes("-v")

    console.log("🎯 Product ID Normalization & S3 Deployment")
    console.log("=".repeat(60))
    console.log("")

    if (dryRun) {
        console.log("🔍 DRY RUN MODE - No changes will be applied")
        console.log("")
    }

    try {
        // Step 1: Normalize product IDs
        const normalizationMapping = await normalizeProducts(dryRun, verbose)

        // Step 2: Generate S3 manifest
        const s3Manifest = await generateS3Manifest(normalizationMapping, dryRun)

        // Step 3: Export mappings
        if (exportOnly || !dryRun) {
            await exportMappings(normalizationMapping, s3Manifest, OUTPUT_PATH)
        }

        console.log("")
        console.log("=".repeat(60))
        console.log("✅ Normalization completed successfully!")
        console.log("=".repeat(60))
        console.log("")
        console.log("📊 Summary:")
        console.log(`   Total products: ${normalizationMapping.total_products}`)
        console.log(`   Normalized: ${normalizationMapping.total_normalized}`)
        console.log(`   Unique SKUs: ${Object.keys(normalizationMapping.reverse_mappings).length}`)
        console.log(`   Total images: ${s3Manifest.total_images}`)
        console.log("")
        console.log("📁 Output files:")
        console.log(`   ${OUTPUT_PATH}/PRODUCT_NORMALIZATION.json`)
        console.log(`   ${OUTPUT_PATH}/S3_DEPLOYMENT_MANIFEST.json`)
        console.log(`   ${OUTPUT_PATH}/product_normalization.csv`)
        console.log(`   ${OUTPUT_PATH}/sync-to-s3.sh`)
        console.log("")
        console.log("🚀 Next steps:")
        console.log("   1. Review normalization mapping")
        console.log("   2. Fix any duplicates if needed")
        console.log("   3. Run: ./data/catalog/data/sync-to-s3.sh")
        console.log("   4. Update environment variables with S3 URLs")
        console.log("")

    } catch (error) {
        console.error("")
        console.error("❌ Error:", error)
        process.exit(1)
    }
}

// Run
if (require.main === module) {
    main().catch(console.error)
}

export { normalizeProducts, generateS3Manifest, exportMappings }
