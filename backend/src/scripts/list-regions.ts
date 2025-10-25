import { ExecArgs } from "@medusajs/framework/types"
import { ModuleRegistrationName } from "@medusajs/framework/utils"

export default async function listRegions({ container }: ExecArgs): Promise<void> {
    const regionService = container.resolve(ModuleRegistrationName.REGION)

    const regions = await regionService.listRegions()

    console.log("=".repeat(60))
    console.log("🌎 REGIÕES CONFIGURADAS")
    console.log("=".repeat(60))
    regions.forEach(region => {
        console.log(`\n✅ ${region.name}`)
        console.log(`   ID: ${region.id}`)
        console.log(`   Moeda: ${region.currency_code.toUpperCase()}`)
        console.log(`   Países: ${region.countries?.map(c => c.iso_2).join(', ') || 'N/A'}`)
    })
    console.log("\n" + "=".repeat(60))
}
