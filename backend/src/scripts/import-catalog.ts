import { MedusaContainer } from "@medusajs/framework/types"
import { IProductModuleService, IRegionModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
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

interface ImportStats {
    total: number
    imported: number
    updated: number
    skipped: number
    errors: number
    by_category: Record<string, {
        imported: number
        errors: number
    }>
}

export default async function importCatalog({
    container,
}: {
    container: MedusaContainer
}): Promise<ImportStats> {
    const productModuleService: IProductModuleService = container.resolve(Modules.PRODUCT)
    const regionModuleService: IRegionModuleService = container.resolve(Modules.REGION)
    const query = container.resolve("query")

    const stats: ImportStats = {
        total: 0,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        by_category: {}
    }

    console.log("🚀 Iniciando importação do catálogo YSH ERP...")
    console.log(`📂 Pasta: ${CATALOG_PATH}\n`)

    // 1. Verificar/Criar região BR
    let regionBR
    try {
        const regions = await regionModuleService.listRegions({ currency_code: "brl" })
        regionBR = regions[0]

        if (!regionBR) {
            console.log("🌎 Criando região BR...")
            regionBR = await regionModuleService.createRegions({
                name: "Brasil",
                currency_code: "brl",
                countries: ["br"],
            })
            console.log("✅ Região BR criada\n")
        } else {
            console.log("✅ Região BR já existe\n")
        }
    } catch (error) {
        console.error("❌ Erro ao configurar região BR:", error)
        return stats
    }

    // 2. Criar/Verificar categorias
    const categoryMap = new Map<string, string>()

    for (const catConfig of CATEGORIES_CONFIG) {
        try {
            const categories = await productModuleService.listProductCategories({
                handle: catConfig.category_handle
            })

            let category = categories[0]

            if (!category) {
                console.log(`📁 Criando categoria: ${catConfig.name}`)
                category = await productModuleService.createProductCategories({
                    name: catConfig.name.charAt(0).toUpperCase() + catConfig.name.slice(1),
                    handle: catConfig.category_handle,
                    is_active: true,
                })
            }

            categoryMap.set(catConfig.name, category.id)
        } catch (error) {
            console.error(`❌ Erro ao criar categoria ${catConfig.name}:`, error)
        }
    }

    console.log(`✅ ${categoryMap.size} categorias configuradas\n`)

    // 3. Importar produtos por categoria
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

            // O arquivo pode ser array direto ou objeto com propriedade products
            const products = Array.isArray(data) ? data : (data.products || [])

            stats.total += products.length

            console.log(`📦 Importando ${products.length} produtos de ${catConfig.name}...`)

            const categoryId = categoryMap.get(catConfig.name)

            for (const product of products) {
                try {
                    // Verificar se produto já existe pelo handle
                    const existing = await productModuleService.listProducts({
                        handle: product.id
                    })

                    if (existing.length > 0) {
                        // Atualizar produto existente
                        await productModuleService.updateProducts(existing[0].id, {
                            title: product.name,
                            description: product.description || `${product.manufacturer} ${product.model}`,
                            status: product.availability ? "published" : "draft",
                            metadata: {
                                ...product.metadata,
                                sku: product.id.toUpperCase(),
                                manufacturer: product.manufacturer,
                                model: product.model,
                                technical_specs: product.technical_specs,
                            }
                        })
                        stats.updated++
                    } else {
                        // Criar novo produto com variante
                        const newProduct = await productModuleService.createProducts({
                            title: product.name,
                            handle: product.id,
                            description: product.description || `${product.manufacturer} ${product.model}`,
                            status: product.availability ? "published" : "draft",
                            thumbnail: product.image_url || product.image,
                            metadata: {
                                sku: product.id.toUpperCase(),
                                manufacturer: product.manufacturer,
                                model: product.model,
                                source: "ysh-erp",
                                category: catConfig.name,
                                technical_specs: product.technical_specs,
                                image_match: product.metadata?.image_match,
                                price_brl: product.pricing?.price_brl || product.price_brl || 0,
                            },
                            options: [{
                                title: "Default Option",
                            }],
                            variants: [{
                                title: "Default",
                                sku: product.id.toUpperCase(),
                                manage_inventory: false,
                                allow_backorder: true,
                                options: {
                                    "Default Option": "Default"
                                }
                            }]
                        })

                        stats.imported++
                        stats.by_category[catConfig.name].imported++
                    }

                } catch (productError: any) {
                    console.error(`  ❌ Erro ao importar produto ${product.id}:`, productError.message)
                    stats.errors++
                    stats.by_category[catConfig.name].errors++
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

    // 4. Resumo final
    console.log("\n" + "=".repeat(60))
    console.log("📊 RESUMO DA IMPORTAÇÃO")
    console.log("=".repeat(60))
    console.log(`Total de produtos processados: ${stats.total}`)
    console.log(`✅ Importados com sucesso: ${stats.imported}`)
    console.log(`🔄 Atualizados: ${stats.updated}`)
    console.log(`⏭️  Pulados: ${stats.skipped}`)
    console.log(`❌ Erros: ${stats.errors}`)
    console.log()
    console.log("Por categoria:")
    for (const [cat, catStats] of Object.entries(stats.by_category)) {
        console.log(`  ${cat}: ${catStats.imported} importados, ${catStats.errors} erros`)
    }
    console.log("=".repeat(60))

    return stats
}
