import { ExecArgs } from "@medusajs/framework/types"
import { ModuleRegistrationName } from "@medusajs/framework/utils"

export default async function checkPrices({ container }: ExecArgs): Promise<void> {
    const logger = container.resolve("logger")
    const productModuleService = container.resolve(ModuleRegistrationName.PRODUCT)

    const [products] = await productModuleService.listAndCountProducts({}, { take: 3 })

    logger.info("=".repeat(60))
    logger.info("💰 VERIFICANDO PREÇOS")
    logger.info("=".repeat(60))

    for (const product of products) {
        logger.info(`\n📦 ${product.title}`)
        logger.info(`   ID: ${product.id}`)

        // Buscar variantes com preços
        const variants = await productModuleService.listProductVariants({
            product_id: product.id
        }, {
            relations: ["prices"]
        })

        variants.forEach(variant => {
            logger.info(`   \n   🔹 Variante: ${variant.sku}`)
            logger.info(`      ID: ${variant.id}`)
            logger.info(`      Preços: ${(variant as any).prices?.length || 0}`)
            (variant as any).prices?.forEach(price => {
                logger.info(`         - ${price.currency_code?.toUpperCase()}: R$ ${(price.amount || 0) / 100}`)
            })
        })
    }

    logger.info("\n" + "=".repeat(60))
}
