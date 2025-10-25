// TODO: Workflow import-catalog precisa ser recriado
// import { importCatalogWorkflow } from "../workflows/import-catalog"

export default async function ({ container }: any) {
    console.log("🚀 Iniciando importação simplificada do catálogo...")
    console.log("⚠️ Este script precisa ser atualizado - workflow não disponível")

    try {
        // const { result } = await importCatalogWorkflow(container).run()
        // console.log("\n✅ Importação concluída!")
        // console.log(JSON.stringify(result, null, 2))
        // return result

        return { message: "Workflow precisa ser implementado" }
    } catch (error: any) {
        console.error("❌ Erro durante importação:", error.message)
        throw error
    }
}
