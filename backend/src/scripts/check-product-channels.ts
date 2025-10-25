import { ExecArgs } from "@medusajs/framework/types"
import { ModuleRegistrationName, Modules } from "@medusajs/framework/utils"

export default async function checkProductChannels({ container }: ExecArgs): Promise<void> {
    const productModuleService = container.resolve(ModuleRegistrationName.PRODUCT)
    const remoteLink = container.resolve(Modules.LINK)

    // Pegar os primeiros 5 produtos
    const [products] = await (productModuleService as any).listAndCountProducts({ take: 5 })

    console.log("=".repeat(60))
    console.log("🔍 VERIFICANDO SALES CHANNELS DOS PRODUTOS")
    console.log("=".repeat(60))

    for (const product of products) {
        console.log(`\n📦 ${product.title}`)
        console.log(`   ID: ${product.id}`)
        console.log(`   Handle: ${product.handle}`)

        // Verificar links de sales channel
        const links = await (remoteLink as any).list({
            product_id: product.id,
        })

        console.log(`   Sales Channels: ${links.length || 'Nenhum'}`)
    }

    console.log("\n" + "=".repeat(60))
}
