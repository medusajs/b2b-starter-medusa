import {
    createProductCategoriesWorkflow,
    createProductsWorkflow,
    createRegionsWorkflow,
} from "@medusajs/core-flows"
import {
    ExecArgs,
    ISalesChannelModuleService,
} from "@medusajs/framework/types"
import {
    ContainerRegistrationKeys,
    ModuleRegistrationName,
    ProductStatus,
} from "@medusajs/framework/utils"
import fs from "fs"
import path from "path"

// Check if running in container
const CATALOG_PATH = fs.existsSync("/tmp/catalog")
    ? "/tmp/catalog"
    : path.resolve(__dirname, "../../../../ysh-erp/data/catalog/unified_schemas")

const CATEGORIES_CONFIG = [
    { name: "inverters", priority: 1, category_handle: "inversores", display: "Inversores" },
    { name: "panels", priority: 1, category_handle: "paineis-solares", display: "Painéis Solares" },
    { name: "kits", priority: 1, category_handle: "kits", display: "Kits" },
    { name: "ev_chargers", priority: 2, category_handle: "carregadores-veiculares", display: "Carregadores Veiculares" },
    { name: "cables", priority: 2, category_handle: "cabos", display: "Cabos" },
    { name: "structures", priority: 3, category_handle: "estruturas", display: "Estruturas" },
    { name: "controllers", priority: 3, category_handle: "controladores", display: "Controladores" },
    { name: "accessories", priority: 3, category_handle: "acessorios", display: "Acessórios" },
    { name: "stringboxes", priority: 3, category_handle: "string-boxes", display: "String Boxes" },
    { name: "batteries", priority: 3, category_handle: "baterias", display: "Baterias" },
    { name: "posts", priority: 3, category_handle: "postes", display: "Postes" },
]

interface ImportStats {
    total: number
    imported: number
    updated: number
    skipped: number
    errors: number
    by_category: Record<string, {
        imported: number
        errors: number
    }>
}

export default async function importCatalog({ container }: ExecArgs): Promise<void> {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const salesChannelModuleService: ISalesChannelModuleService = container.resolve(
        ModuleRegistrationName.SALES_CHANNEL
    )

    const stats: ImportStats = {
        total: 0,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        by_category: {}
    }

    logger.info("🚀 Iniciando importação do catálogo YSH ERP...")
    logger.info(`📂 Pasta: ${CATALOG_PATH}`)

    // 1. Verificar/Criar região BR
    let regionBR
    try {
        const { result: regions } = await createRegionsWorkflow(container).run({
            input: {
                regions: [
                    {
                        name: "Brasil",
                        currency_code: "brl",
                        countries: ["br"],
                        payment_providers: ["pp_system_default"],
                    },
                ],
            },
        })
        regionBR = regions[0]
        logger.info("✅ Região BR configurada")
    } catch (error: any) {
        if (error.message?.includes("already exists")) {
            logger.info("✅ Região BR já existe")
            // Continue mesmo se já existe
        } else {
            logger.error("❌ Erro ao configurar região BR:", error)
            return
        }
    }

    // 2. Buscar sales channel padrão
    const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
    })

    if (!defaultSalesChannel.length) {
        logger.error("❌ Sales channel padrão não encontrado. Execute o seed primeiro.")
        return
    }

    // 3. Criar categorias
    const categoryMap = new Map<string, string>()

    logger.info("📁 Criando categorias...")
    try {
        const { result: categoryResult } = await createProductCategoriesWorkflow(container).run({
            input: {
                product_categories: CATEGORIES_CONFIG.map(cat => ({
                    name: cat.display,
                    handle: cat.category_handle,
                    is_active: true,
                })),
            },
        })

        categoryResult.forEach((category, index) => {
            categoryMap.set(CATEGORIES_CONFIG[index].name, category.id)
        })

        logger.info(`✅ ${categoryMap.size} categorias criadas`)
    } catch (error: any) {
        logger.warn(`⚠️  Algumas categorias podem já existir: ${error.message}`)
        // Continue mesmo se algumas categorias já existirem
    }

    // 4. Importar produtos por categoria (em lotes para melhor performance)
    const BATCH_SIZE = 10 // Importar 10 produtos por vez

    for (const catConfig of CATEGORIES_CONFIG) {
        const filePath = path.join(CATALOG_PATH, `${catConfig.name}_unified.json`)

        if (!fs.existsSync(filePath)) {
            logger.warn(`⚠️  Arquivo não encontrado: ${catConfig.name}_unified.json`)
            continue
        }

        stats.by_category[catConfig.name] = { imported: 0, errors: 0 }

        try {
            const rawData = fs.readFileSync(filePath, 'utf-8')
            const data = JSON.parse(rawData)
            const products = Array.isArray(data) ? data : (data.products || [])

            stats.total += products.length
            logger.info(`📦 Importando ${products.length} produtos de ${catConfig.name}...`)

            const categoryId = categoryMap.get(catConfig.name)

            // Processar em lotes
            for (let i = 0; i < products.length; i += BATCH_SIZE) {
                const batch = products.slice(i, i + BATCH_SIZE)

                const productsToCreate = batch.map((product: any) => {
                    const priceBrl = product.pricing?.price_brl || product.price_brl || 0
                    // Criar handle URL-safe: remover underscores, converter para lowercase
                    const safeHandle = (product.id || `product-${Date.now()}`)
                        .toLowerCase()
                        .replace(/_/g, '-')
                        .replace(/[^a-z0-9-]/g, '')
                        .replace(/-+/g, '-')
                        .replace(/^-|-$/g, '')

                    return {
                        title: product.name || "Produto sem nome",
                        handle: safeHandle,
                        description: product.description || `${product.manufacturer || ""} ${product.model || ""}`.trim() || "Sem descrição",
                        status: ProductStatus.PUBLISHED,
                        thumbnail: product.image_url || product.image,
                        metadata: {
                            sku: (product.id || "").toUpperCase(),
                            manufacturer: product.manufacturer || "",
                            model: product.model || "",
                            source: "ysh-erp",
                            category: catConfig.name,
                            technical_specs: product.technical_specs,
                            image_match: product.metadata?.image_match,
                            price_brl: priceBrl,
                        },
                        category_ids: categoryId ? [categoryId] : [],
                        options: [
                            {
                                title: "Default",
                                values: ["Default"],
                            },
                        ],
                        variants: [
                            {
                                title: "Default",
                                sku: (product.id || "").toUpperCase(),
                                manage_inventory: false,
                                allow_backorder: true,
                                options: {
                                    Default: "Default",
                                },
                                prices: [
                                    {
                                        amount: Math.round(priceBrl * 100), // Converter para centavos
                                        currency_code: "brl",
                                    },
                                ],
                            },
                        ],
                        sales_channels: [
                            {
                                id: defaultSalesChannel[0].id,
                            },
                        ],
                    }
                })                try {
                    await createProductsWorkflow(container).run({
                        input: {
                            products: productsToCreate,
                        },
                    })

                    stats.imported += batch.length
                    stats.by_category[catConfig.name].imported += batch.length

                    logger.info(`  ✅ Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} produtos importados`)
                } catch (batchError: any) {
                    logger.error(`  ❌ Erro no lote: ${batchError.message}`)
                    stats.errors += batch.length
                    stats.by_category[catConfig.name].errors += batch.length
                }
            }

            logger.info(`  ✅ Total: ${stats.by_category[catConfig.name].imported} produtos importados de ${catConfig.name}`)
            if (stats.by_category[catConfig.name].errors > 0) {
                logger.warn(`  ⚠️  ${stats.by_category[catConfig.name].errors} erros`)
            }

        } catch (error: any) {
            logger.error(`❌ Erro ao processar categoria ${catConfig.name}:`, error.message)
        }
    }

    // 5. Resumo final
    logger.info("\n" + "=".repeat(60))
    logger.info("📊 RESUMO DA IMPORTAÇÃO")
    logger.info("=".repeat(60))
    logger.info(`Total de produtos processados: ${stats.total}`)
    logger.info(`✅ Importados com sucesso: ${stats.imported}`)
    logger.info(`🔄 Atualizados: ${stats.updated}`)
    logger.info(`⏭️  Pulados: ${stats.skipped}`)
    logger.info(`❌ Erros: ${stats.errors}`)
    logger.info("\nPor categoria:")
    for (const [cat, catStats] of Object.entries(stats.by_category)) {
        logger.info(`  ${cat}: ${catStats.imported} importados, ${catStats.errors} erros`)
    }
    logger.info("=".repeat(60))
}
