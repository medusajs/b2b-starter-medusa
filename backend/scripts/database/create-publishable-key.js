/**
 * Script para criar Publishable API Key no Medusa v2.8
 * Uso: npx medusa exec create-publishable-key.js
 */

import { MedusaModule } from "@medusajs/framework/modules-sdk"

const createPublishableKey = async () => {
    console.log("🔑 Criando Publishable API Key...")

    try {
        const apiKeyModule = MedusaModule.resolve("api-key")

        if (!apiKeyModule) {
            console.error("❌ Módulo API Key não encontrado")
            return
        }

        // Criar a publishable key
        const publishableKey = await apiKeyModule.createApiKeys({
            token: "pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d",
            type: "publishable",
            title: "Storefront Yello Solar Hub",
            created_by: "system",
        })

        console.log("✅ Publishable Key criada com sucesso!")
        console.log("Token:", publishableKey.token)
        console.log("ID:", publishableKey.id)
        console.log("Type:", publishableKey.type)

        // Associar com o sales channel padrão
        const salesChannelModule = MedusaModule.resolve("sales-channel")

        if (salesChannelModule) {
            console.log("\n📢 Buscando Sales Channel padrão...")

            const salesChannels = await salesChannelModule.listSalesChannels({
                is_default: true
            })

            if (salesChannels && salesChannels.length > 0) {
                const defaultChannel = salesChannels[0]
                console.log(`✅ Sales Channel encontrado: ${defaultChannel.name} (${defaultChannel.id})`)

                // Associar publishable key ao sales channel
                await apiKeyModule.addSalesChannelsToApiKey(publishableKey.id, [defaultChannel.id])

                console.log("✅ Publishable Key associada ao Sales Channel!")
            } else {
                console.warn("⚠️  Nenhum Sales Channel padrão encontrado")
            }
        }

        console.log("\n🎉 Configuração concluída!")
        console.log("\nVariável de ambiente para .env:")
        console.log(`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=${publishableKey.token}`)

    } catch (error) {
        console.error("❌ Erro ao criar Publishable Key:", error.message)
        console.error(error.stack)
    }
}

export default createPublishableKey
