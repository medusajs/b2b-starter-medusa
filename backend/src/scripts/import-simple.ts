import { importCatalogWorkflow } from "../workflows/import-catalog"

export default async function ({ container }: any) {
    console.log("🚀 Iniciando importação simplificada do catálogo...")

    try {
        const { result } = await importCatalogWorkflow(container).run()

        console.log("\n✅ Importação concluída!")
        console.log(JSON.stringify(result, null, 2))

        return result
    } catch (error: any) {
        console.error("❌ Erro durante importação:", error.message)
        throw error
    }
}
