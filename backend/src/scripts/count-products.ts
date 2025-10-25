import { ExecArgs } from "@medusajs/framework/types"
import { ModuleRegistrationName } from "@medusajs/framework/utils"

export default async function countProducts({ container }: ExecArgs): Promise<void> {
    const productModuleService = container.resolve(ModuleRegistrationName.PRODUCT)

    const [products, count] = await productModuleService.listAndCountProducts()

    console.log("=".repeat(60))
    console.log("📊 PRODUTOS NO BANCO DE DADOS")
    console.log("=".repeat(60))
    console.log(`Total: ${count} produtos`)
    console.log("=".repeat(60))
}
