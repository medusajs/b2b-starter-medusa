import type { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import fs from "fs"
import path from "path"

const CATALOG_PATH = path.resolve(__dirname, "../../../../ysh-erp/data/catalog/unified_schemas")

const CATEGORIES_CONFIG = [
    { name: "inverters", priority: 1, category_handle: "inversores" },
    { name: "panels", priority: 1, category_handle: "paineis-solares" },
    { name: "kits", priority: 1, category_handle: "kits" },
    { name: "ev_chargers", priority: 2, category_handle: "carregadores-veiculares" },
    { name: "cables", priority: 2, category_handle: "cabos" },
    { name: "structures", priority: 3, category_handle: "estruturas" },
    { name: "controllers", priority: 3, category_handle: "controladores" },
    { name: "accessories", priority: 3, category_handle: "acessorios" },
    { name: "stringboxes", priority: 3, category_handle: "string-boxes" },
    { name: "batteries", priority: 3, category_handle: "baterias" },
    { name: "posts", priority: 3, category_handle: "postes" },
]

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const { createProductsWorkflow } = await import("@medusajs/medusa/core-flows")

    const stats = {
        total: 0,
        imported: 0,
        errors: 0,
        by_category: {} as Record<string, { imported: number; errors: number }>
    }

    console.log("🚀 Iniciando importação do catálogo YSH ERP...")
    console.log(`📂 Pasta: ${CATALOG_PATH}\n`)

    // Importar produtos por categoria
    for (const catConfig of CATEGORIES_CONFIG) {
        const filePath = path.join(CATALOG_PATH, `${catConfig.name}_unified.json`)

        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  Arquivo não encontrado: ${catConfig.name}_unified.json`)
            continue
        }

        stats.by_category[catConfig.name] = { imported: 0, errors: 0 }

        try {
            const rawData = fs.readFileSync(filePath, 'utf-8')
            const data = JSON.parse(rawData)
            const products = Array.isArray(data) ? data : (data.products || [])

            stats.total += products.length
            console.log(`📦 Importando ${products.length} produtos de ${catConfig.name}...`)

            // Importar em lotes de 10
            for (let i = 0; i < products.length; i += 10) {
                const batch = products.slice(i, i + 10)

                try {
                    const productsToCreate = batch.map((product: any) => ({
                        title: product.name,
                        handle: product.id,
                        description: product.description || `${product.manufacturer} ${product.model}`,
                        status: "published",
                        thumbnail: product.image_url || product.image,
                        metadata: {
                            sku: product.id.toUpperCase(),
                            manufacturer: product.manufacturer,
                            model: product.model,
                            source: "ysh-erp",
                            category: catConfig.name,
                            price_brl: product.pricing?.price_brl || product.price_brl || 0,
                        },
                    }))

                    await createProductsWorkflow(req.scope).run({
                        input: { products: productsToCreate }
                    })

                    stats.imported += batch.length
                    stats.by_category[catConfig.name].imported += batch.length
                } catch (batchError: any) {
                    console.error(`  ❌ Erro no lote ${i}-${i + 10}:`, batchError.message)
                    stats.errors += batch.length
                    stats.by_category[catConfig.name].errors += batch.length
                }
            }

            console.log(`  ✅ ${stats.by_category[catConfig.name].imported} produtos importados`)
            if (stats.by_category[catConfig.name].errors > 0) {
                console.log(`  ⚠️  ${stats.by_category[catConfig.name].errors} erros`)
            }
            console.log()

        } catch (error: any) {
            console.error(`❌ Erro ao processar categoria ${catConfig.name}:`, error.message)
        }
    }

    // Resumo final
    console.log("\n" + "=".repeat(60))
    console.log("📊 RESUMO DA IMPORTAÇÃO")
    console.log("=".repeat(60))
    console.log(`Total de produtos processados: ${stats.total}`)
    console.log(`✅ Importados com sucesso: ${stats.imported}`)
    console.log(`❌ Erros: ${stats.errors}`)
    console.log("\nPor categoria:")
    for (const [cat, catStats] of Object.entries(stats.by_category)) {
        console.log(`  ${cat}: ${catStats.imported} importados, ${catStats.errors} erros`)
    }
    console.log("=".repeat(60))

    res.json({
        success: true,
        stats
    })
}
