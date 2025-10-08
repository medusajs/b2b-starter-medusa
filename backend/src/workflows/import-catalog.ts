import {
    createStep,
    createWorkflow,
    StepResponse,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { IProductModuleService } from "@medusajs/framework/types"
import fs from "fs"
import path from "path"

const CATALOG_PATH = path.resolve(__dirname, "../../../../ysh-erp/data/catalog/unified_schemas")

const CATEGORIES = [
    { name: "inverters", handle: "inversores" },
    { name: "panels", handle: "paineis-solares" },
    { name: "kits", handle: "kits" },
]

// Step para importar produtos de uma categoria
const importCategoryStep = createStep(
    "import-category-step",
    async ({ categoryName, categoryHandle }: { categoryName: string, categoryHandle: string }, { container }) => {
        const productModuleService: IProductModuleService = container.resolve(Modules.PRODUCT)

        const filePath = path.join(CATALOG_PATH, `${categoryName}_unified.json`)

        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  Arquivo não encontrado: ${categoryName}_unified.json`)
            return new StepResponse({ imported: 0, errors: 0 })
        }

        const rawData = fs.readFileSync(filePath, 'utf-8')
        const data = JSON.parse(rawData)
        const products = Array.isArray(data) ? data : (data.products || [])

        console.log(`📦 Importando ${products.length} produtos de ${categoryName}...`)

        let imported = 0
        let errors = 0

        // Importar produtos em lotes pequenos
        for (let i = 0; i < Math.min(products.length, 50); i++) {
            const product = products[i]

            try {
                await productModuleService.createProducts({
                    title: product.name || "Produto sem nome",
                    handle: product.id || `product-${Date.now()}-${i}`,
                    description: product.description || `${product.manufacturer || ""} ${product.model || ""}`.trim() || "Sem descrição",
                    status: "published",
                    metadata: {
                        sku: product.id?.toUpperCase() || "",
                        manufacturer: product.manufacturer || "",
                        model: product.model || "",
                        source: "ysh-erp",
                        category: categoryName,
                        price_brl: product.pricing?.price_brl || product.price_brl || 0,
                    },
                })

                imported++
            } catch (error: any) {
                console.error(`❌ Erro ao importar ${product.id}:`, error.message)
                errors++
            }
        }

        console.log(`✅ ${imported} produtos importados, ${errors} erros`)

        return new StepResponse({ imported, errors })
    }
)

// Workflow de importação
export const importCatalogWorkflow = createWorkflow(
    "import-catalog-workflow",
    function () {
        const results: any[] = []

        for (const category of CATEGORIES) {
            const result = importCategoryStep(category)
            results.push(result)
        }

        return new WorkflowResponse({
            results,
            message: "Importação concluída"
        })
    }
)
