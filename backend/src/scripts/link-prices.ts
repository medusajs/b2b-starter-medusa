import { ExecArgs } from "@medusajs/framework/types"
import { ModuleRegistrationName, Modules } from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

// Check if running in container
const CATALOG_PATH = fs.existsSync("/tmp/catalog")
    ? "/tmp/catalog"
    : path.resolve(__dirname, "../../data/catalog/unified_schemas")

const CATEGORIES_CONFIG = [
    { name: "inverters", file: "inverters_unified.json" },
    { name: "panels", file: "panels_unified.json" },
    { name: "kits", file: "kits_unified.json" },
    { name: "ev_chargers", file: "ev_chargers_unified.json" },
    { name: "cables", file: "cables_unified.json" },
    { name: "structures", file: "structures_unified.json" },
    { name: "controllers", file: "controllers_unified.json" },
    { name: "accessories", file: "accessories_unified.json" },
    { name: "stringboxes", file: "stringboxes_unified.json" },
    { name: "batteries", file: "batteries_unified.json" },
    { name: "posts", file: "posts_unified.json" },
]

export default async function linkPrices({ container }: ExecArgs): Promise<void> {
    const logger = container.resolve("logger")
    const productModuleService = container.resolve(ModuleRegistrationName.PRODUCT)
    const pricingModuleService = container.resolve(ModuleRegistrationName.PRICING)
    const remoteLink = container.resolve("remoteLink")

    let stats = {
        total: 0,
        updated: 0,
        errors: 0,
        skipped: 0
    }

    logger.info("💰 Vinculando preços às variantes...")
    logger.info(`📂 Pasta: ${CATALOG_PATH}`)

    // Criar mapa de preços do catálogo
    const priceMap = new Map<string, number>()

    for (const catConfig of CATEGORIES_CONFIG) {
        const filePath = path.join(CATALOG_PATH, catConfig.file)

        if (!fs.existsSync(filePath)) {
            continue
        }

        const rawData = fs.readFileSync(filePath, 'utf-8')
        const data = JSON.parse(rawData)
        const products = Array.isArray(data) ? data : (data.products || [])

        products.forEach((product: any) => {
            const priceBrl = product.pricing?.price_brl || product.price_brl || 0
            const safeHandle = (product.id || "")
                .toLowerCase()
                .replace(/_/g, '-')
                .replace(/[^a-z0-9-]/g, '')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')

            if (safeHandle && priceBrl > 0) {
                priceMap.set(safeHandle, priceBrl)
            }
        })
    }

    logger.info(`✅ Mapa: ${priceMap.size} produtos com preço`)

    // Buscar produtos
    const [products] = await productModuleService.listAndCountProducts()
    logger.info(`📦 Total: ${products.length} produtos`)

    const BATCH_SIZE = 20

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE)
        logger.info(`\n🔄 Lote ${Math.floor(i / BATCH_SIZE) + 1}...`)

        for (const product of batch) {
            stats.total++

            const catalogPrice = priceMap.get(product.handle)

            if (!catalogPrice) {
                stats.skipped++
                continue
            }

            try {
                const variants = await productModuleService.listProductVariants({
                    product_id: product.id
                })

                if (!variants.length) {
                    stats.skipped++
                    continue
                }

                const variant = variants[0]
                const priceInCents = Math.round(catalogPrice * 100)

                // Criar price set
                const priceSet = await pricingModuleService.createPriceSets({
                    prices: [
                        {
                            amount: priceInCents,
                            currency_code: "brl",
                        }
                    ]
                })

                // Vincular price set à variante
                await remoteLink.create({
                    [Modules.PRODUCT]: {
                        variant_id: variant.id
                    },
                    [Modules.PRICING]: {
                        price_set_id: priceSet.id
                    }
                })

                stats.updated++

                if (stats.updated % 20 === 0) {
                    logger.info(`  ✅ ${stats.updated} vinculados...`)
                }

            } catch (error: any) {
                logger.error(`  ❌ ${product.handle}: ${error.message}`)
                stats.errors++
            }
        }
    }

    logger.info("\n" + "=".repeat(60))
    logger.info("📊 RESUMO")
    logger.info("=".repeat(60))
    logger.info(`Total: ${stats.total}`)
    logger.info(`✅ Vinculados: ${stats.updated}`)
    logger.info(`⏭️  Pulados: ${stats.skipped}`)
    logger.info(`❌ Erros: ${stats.errors}`)
    logger.info("=".repeat(60))
}
