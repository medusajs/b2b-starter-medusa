import { MedusaAppLoader } from "@medusajs/framework"
import importCatalog from "./import-catalog"

async function run() {
    console.log("🔧 Carregando aplicação Medusa...")

    const app = await MedusaAppLoader.load({
        directory: process.cwd(),
    })

    try {
        const stats = await importCatalog(app.container)

        if (stats.errors > 0) {
            console.error(`\n⚠️  Importação concluída com ${stats.errors} erros`)
            process.exit(1)
        } else {
            console.log("\n✅ Importação concluída com sucesso!")
            process.exit(0)
        }
    } catch (error: any) {
        console.error("\n❌ Erro fatal durante importação:", error.message)
        console.error(error.stack)
        process.exit(1)
    } finally {
        await app.shutdown()
    }
}

run()
