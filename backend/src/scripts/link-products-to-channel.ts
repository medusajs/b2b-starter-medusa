import { ExecArgs } from "@medusajs/framework/types"
import { ModuleRegistrationName } from "@medusajs/framework/utils"

export default async function linkProductsToChannel({ container }: ExecArgs): Promise<void> {
    const logger = container.resolve("logger")
    const productModuleService = container.resolve(ModuleRegistrationName.PRODUCT)
    const salesChannelService = container.resolve(ModuleRegistrationName.SALES_CHANNEL)
    const remoteLink = container.resolve("remoteLink")

    logger.info("🔗 Conectando produtos ao sales channel...")

    // 1. Buscar default sales channel
    const [channels] = await salesChannelService.listAndCountSalesChannels({
        name: "Default Sales Channel"
    })

    if (!channels.length) {
        logger.error("❌ Sales channel não encontrado!")
        return
    }

    const channelId = channels[0].id
    logger.info(`✅ Sales channel: ${channels[0].name} (${channelId})`)

    // 2. Buscar todos os produtos
    const [products, totalProducts] = await productModuleService.listAndCountProducts()
    logger.info(`📦 Total de produtos: ${totalProducts}`)

    // 3. Criar links em lote
    const links = products.map(product => ({
        [ModuleRegistrationName.PRODUCT]: {
            product_id: product.id
        },
        [ModuleRegistrationName.SALES_CHANNEL]: {
            sales_channel_id: channelId
        }
    }))

    try {
        await remoteLink.create(links)
        logger.info(`✅ ${links.length} produtos conectados ao sales channel!`)
    } catch (error: any) {
        logger.error(`❌ Erro ao criar links: ${error.message}`)
    }

    logger.info("🎉 Processo concluído!")
}
