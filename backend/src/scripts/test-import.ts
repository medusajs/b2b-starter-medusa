// Script simplificado de teste para importação
import {
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

export default async function testImport({ container }: ExecArgs): Promise<void> {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const salesChannelModuleService: ISalesChannelModuleService = container.resolve(
        ModuleRegistrationName.SALES_CHANNEL
    )

    logger.info("🧪 Teste de importação simplificado")

    // 1. Buscar sales channel padrão
    const defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
        name: "Default Sales Channel",
    })

    if (!defaultSalesChannel.length) {
        logger.error("❌ Sales channel padrão não encontrado")
        return
    }

    logger.info("✅ Sales channel encontrado")

    // 2. Criar região BR se não existir
    try {
        await createRegionsWorkflow(container).run({
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
        logger.info("✅ Região BR criada")
    } catch (error: any) {
        logger.info("✅ Região BR já existe (ou outro erro tolerável)")
    }

    // 3. Ler um arquivo de teste
    const testFile = "/tmp/catalog/panels_unified.json"

    if (!fs.existsSync(testFile)) {
        logger.error(`❌ Arquivo não encontrado: ${testFile}`)
        return
    }

    const data = JSON.parse(fs.readFileSync(testFile, 'utf-8'))
    const products = Array.isArray(data) ? data : (data.products || [])

    logger.info(`📦 Arquivo tem ${products.length} produtos`)

    // 4. Importar apenas os 3 primeiros produtos como teste
    const testProducts = products.slice(0, 3).map((product: any) => {
        const priceBrl = product.pricing?.price_brl || product.price_brl || 100

        return {
            title: product.name || "Produto Teste",
            handle: `test-${product.id || Date.now()}`,
            description: product.description || "Teste",
            status: ProductStatus.PUBLISHED,
            thumbnail: product.image_url || product.image,
            metadata: {
                sku: (product.id || "TEST").toUpperCase(),
                manufacturer: product.manufacturer || "Unknown",
                model: product.model || "Unknown",
                source: "ysh-erp-test",
                price_brl: priceBrl,
            },
            options: [
                {
                    title: "Default",
                    values: ["Default"],
                },
            ],
            variants: [
                {
                    title: "Default",
                    sku: (product.id || "TEST").toUpperCase(),
                    manage_inventory: false,
                    allow_backorder: true,
                    options: {
                        Default: "Default",
                    },
                    prices: [
                        {
                            amount: Math.round(priceBrl * 100),
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
    })

    logger.info(`🚀 Tentando importar ${testProducts.length} produtos...`)

    try {
        await createProductsWorkflow(container).run({
            input: {
                products: testProducts,
            },
        })

        logger.info(`✅ ${testProducts.length} produtos importados com sucesso!`)
    } catch (error: any) {
        logger.error(`❌ Erro na importação: ${error.message}`)
        logger.error(error.stack)
    }
}
