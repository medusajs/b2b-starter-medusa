import { ExecArgs } from "@medusajs/framework/types"
import { ModuleRegistrationName } from "@medusajs/framework/utils"
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

export default async function fixProductPrices({ container }: ExecArgs): Promise<void> {
    const logger = container.resolve("logger")
    const productModuleService = container.resolve(ModuleRegistrationName.PRODUCT)
    const pricingModuleService = container.resolve(ModuleRegistrationName.PRICING)

    let stats = {
        total: 0,
        updated: 0,
        errors: 0,
        skipped: 0
    }

    logger.info("💰 Iniciando correção de preços...")
    logger.info(`📂 Pasta: ${CATALOG_PATH}`)

    // Criar um mapa de preços do catálogo (handle -> price)
    const priceMap = new Map<string, number>()

    for (const catConfig of CATEGORIES_CONFIG) {
        const filePath = path.join(CATALOG_PATH, catConfig.file)

        if (!fs.existsSync(filePath)) {
            logger.warn(`⚠️  Arquivo não encontrado: ${catConfig.file}`)
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

    logger.info(`✅ Mapa de preços criado: ${priceMap.size} produtos com preço`)

    // Buscar todos os produtos do banco
    const [products, totalProducts] = await productModuleService.listAndCountProducts()
    logger.info(`📦 Total de produtos no banco: ${totalProducts}`)

    // Processar em lotes
    const BATCH_SIZE = 50

    for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE)
        logger.info(`\n🔄 Processando lote ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} produtos)...`)

        for (const product of batch) {
            stats.total++

            const catalogPrice = priceMap.get(product.handle)

            if (!catalogPrice || catalogPrice === 0) {
                logger.warn(`  ⚠️  Sem preço no catálogo: ${product.handle}`)
                stats.skipped++
                continue
            }

            try {
                // Buscar variantes do produto
                const variants = await productModuleService.listProductVariants({
                    product_id: product.id
                })

                if (!variants.length) {
                    logger.warn(`  ⚠️  Produto sem variantes: ${product.handle}`)
                    stats.skipped++
                    continue
                }

                // Atualizar preço da variante
                const variant = variants[0]
                const priceInCents = Math.round(catalogPrice * 100)

                // Criar ou atualizar price set
                await pricingModuleService.createPriceSets({
                    prices: [
                        {
                            amount: priceInCents,
                            currency_code: "brl",
                            rules: {}
                        }
                    ]
                })

                stats.updated++

                if (stats.updated % 10 === 0) {
                    logger.info(`  ✅ ${stats.updated} preços atualizados...`)
                }

            } catch (error: any) {
                logger.error(`  ❌ Erro ao atualizar ${product.handle}: ${error.message}`)
                stats.errors++
            }
        }
    }

    // Resumo final
    logger.info("\n" + "=".repeat(60))
    logger.info("📊 RESUMO DA CORREÇÃO DE PREÇOS")
    logger.info("=".repeat(60))
    logger.info(`Total de produtos: ${stats.total}`)
    logger.info(`✅ Preços atualizados: ${stats.updated}`)
    logger.info(`⏭️  Pulados (sem preço): ${stats.skipped}`)
    logger.info(`❌ Erros: ${stats.errors}`)
    logger.info("=".repeat(60))
}
