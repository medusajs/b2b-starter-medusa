/**
 * YSH Solar B2B - Medusa.js Catalog Importer
 * 
 * Importa catálogo gerado (inventory items, products, variants)
 * para Medusa.js v2.x usando Workflows
 * 
 * @usage
 * import { importCatalog } from './import-catalog-to-medusa'
 * await importCatalog('./medusa-catalog/complete_catalog_2025-10-14_04-44-35.json')
 */

import { 
  createInventoryItemsWorkflow,
  createProductsWorkflow,
  createProductCategoriesWorkflow,
  createProductTagsWorkflow
} from "@medusajs/medusa/core-flows"
import { MedusaContainer } from "@medusajs/framework/types"
import * as fs from 'fs'
import * as path from 'path'


// ============================================================================
// TYPES
// ============================================================================

interface CatalogMetadata {
  generated_at: string
  version: string
  medusa_version: string
  generator: string
}

interface CatalogStats {
  inventory_items: number
  products: number
  variants: number
  bundles: number
}

interface InventoryItem {
  sku: string
  title: string
  description?: string
  origin_country: string
  hs_code?: string
  material?: string
  weight?: number
  requires_shipping: boolean
  metadata?: Record<string, any>
}

interface ProductVariant {
  title: string
  sku: string
  barcode?: string
  manage_inventory: boolean
  allow_backorder: boolean
  weight?: number
  options: Record<string, string>
  prices: Array<{
    currency_code: string
    amount: number
    min_quantity?: number
    max_quantity?: number
    rules?: Record<string, any>
  }>
  inventory_items?: Array<{
    inventory_item_id: string
    required_quantity: number
  }>
  metadata?: Record<string, any>
}

interface Product {
  title: string
  subtitle?: string
  handle: string
  description?: string
  status: string
  thumbnail?: string
  categories?: string[]
  tags?: string[]
  collection_id?: string
  options: Array<{
    title: string
    values: string[]
  }>
  variants: ProductVariant[]
  metadata?: Record<string, any>
}

interface Catalog {
  metadata: CatalogMetadata
  stats: CatalogStats
  inventory_items: InventoryItem[]
  products: Product[]
}


// ============================================================================
// IMPORTER CLASS
// ============================================================================

export class MedusaCatalogImporter {
  private container: MedusaContainer
  private catalog: Catalog | null = null
  private inventoryItemMap: Map<string, string> = new Map()
  private categoryMap: Map<string, string> = new Map()
  private tagMap: Map<string, string> = new Map()
  private stats = {
    inventory_items_created: 0,
    products_created: 0,
    variants_created: 0,
    categories_created: 0,
    tags_created: 0,
    errors: 0
  }

  constructor(container: MedusaContainer) {
    this.container = container
  }

  /**
   * Carrega catálogo do arquivo JSON
   */
  async loadCatalog(filePath: string): Promise<void> {
    console.log(`\n${"=".repeat(80)}`)
    console.log("📥 Carregando catálogo...")
    console.log(`${"=".repeat(80)}`)
    
    try {
      const fullPath = path.resolve(filePath)
      const fileContent = fs.readFileSync(fullPath, 'utf-8')
      this.catalog = JSON.parse(fileContent)
      
      console.log(`✓ Catálogo carregado: ${fullPath}`)
      console.log(`  • Gerado em: ${this.catalog!.metadata.generated_at}`)
      console.log(`  • Versão: ${this.catalog!.metadata.version}`)
      console.log(`  • Inventory Items: ${this.catalog!.stats.inventory_items}`)
      console.log(`  • Products: ${this.catalog!.stats.products}`)
      console.log(`  • Variants: ${this.catalog!.stats.variants}`)
      console.log(`  • Bundles: ${this.catalog!.stats.bundles}`)
    } catch (error) {
      console.error(`❌ Erro ao carregar catálogo: ${error}`)
      throw error
    }
  }

  /**
   * Cria categorias no Medusa
   */
  async createCategories(): Promise<void> {
    if (!this.catalog) throw new Error("Catalog not loaded")
    
    console.log(`\n${"=".repeat(80)}`)
    console.log("📁 Criando categorias...")
    console.log(`${"=".repeat(80)}`)

    // Extrair categorias únicas dos produtos
    const categoriesSet = new Set<string>()
    this.catalog.products.forEach(product => {
      product.categories?.forEach(cat => categoriesSet.add(cat))
    })

    const categories = Array.from(categoriesSet).map(code => ({
      name: this.formatCategoryName(code),
      handle: code,
      is_active: true,
      metadata: {
        original_code: code
      }
    }))

    console.log(`  • Total de categorias: ${categories.length}`)

    try {
      const { result } = await createProductCategoriesWorkflow(this.container).run({
        input: {
          product_categories: categories
        }
      })

      // Mapear códigos → IDs
      result.forEach((cat: any, index: number) => {
        this.categoryMap.set(categories[index].handle, cat.id)
      })

      this.stats.categories_created = result.length
      console.log(`✓ ${result.length} categorias criadas`)
    } catch (error) {
      console.error(`❌ Erro criando categorias: ${error}`)
      this.stats.errors++
    }
  }

  /**
   * Cria tags no Medusa
   */
  async createTags(): Promise<void> {
    if (!this.catalog) throw new Error("Catalog not loaded")
    
    console.log(`\n${"=".repeat(80)}`)
    console.log("🏷️  Criando tags...")
    console.log(`${"=".repeat(80)}`)

    // Extrair tags únicas
    const tagsSet = new Set<string>()
    this.catalog.products.forEach(product => {
      product.tags?.forEach(tag => tagsSet.add(tag))
    })

    const tags = Array.from(tagsSet).map(value => ({
      value,
      metadata: {}
    }))

    console.log(`  • Total de tags: ${tags.length}`)

    try {
      const { result } = await createProductTagsWorkflow(this.container).run({
        input: {
          product_tags: tags
        }
      })

      // Mapear valores → IDs
      result.forEach((tag: any, index: number) => {
        this.tagMap.set(tags[index].value, tag.id)
      })

      this.stats.tags_created = result.length
      console.log(`✓ ${result.length} tags criadas`)
    } catch (error) {
      console.error(`❌ Erro criando tags: ${error}`)
      this.stats.errors++
    }
  }

  /**
   * Cria inventory items no Medusa
   */
  async createInventoryItems(): Promise<void> {
    if (!this.catalog) throw new Error("Catalog not loaded")
    
    console.log(`\n${"=".repeat(80)}`)
    console.log("📦 Criando inventory items...")
    console.log(`${"=".repeat(80)}`)

    console.log(`  • Total: ${this.catalog.inventory_items.length}`)

    try {
      const { result } = await createInventoryItemsWorkflow(this.container).run({
        input: {
          items: this.catalog.inventory_items.map(item => ({
            ...item,
            // Adicionar níveis de estoque iniciais
            location_levels: [
              {
                stocked_quantity: 0,
                location_id: "sloc_default" // Ajustar conforme necessário
              }
            ]
          }))
        }
      })

      // Mapear SKUs → inventory_item_ids
      result.forEach((item: any, index: number) => {
        const sku = this.catalog!.inventory_items[index].sku
        this.inventoryItemMap.set(sku, item.id)
      })

      this.stats.inventory_items_created = result.length
      console.log(`✓ ${result.length} inventory items criados`)
    } catch (error) {
      console.error(`❌ Erro criando inventory items: ${error}`)
      this.stats.errors++
    }
  }

  /**
   * Cria produtos no Medusa
   */
  async createProducts(): Promise<void> {
    if (!this.catalog) throw new Error("Catalog not loaded")
    
    console.log(`\n${"=".repeat(80)}`)
    console.log("🛍️  Criando produtos...")
    console.log(`${"=".repeat(80)}`)

    console.log(`  • Total: ${this.catalog.products.length}`)

    // Processar em lotes de 10
    const batchSize = 10
    for (let i = 0; i < this.catalog.products.length; i += batchSize) {
      const batch = this.catalog.products.slice(i, i + batchSize)
      
      console.log(`\n  📦 Lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(this.catalog.products.length / batchSize)}...`)

      try {
        const productsInput = batch.map(product => this.transformProduct(product))
        
        const { result } = await createProductsWorkflow(this.container).run({
          input: {
            products: productsInput
          }
        })

        this.stats.products_created += result.length
        this.stats.variants_created += result.reduce((sum: number, p: any) => sum + p.variants.length, 0)
        
        console.log(`  ✓ ${result.length} produtos criados`)
      } catch (error) {
        console.error(`  ❌ Erro no lote: ${error}`)
        this.stats.errors++
      }
    }

    console.log(`\n✓ Total de produtos criados: ${this.stats.products_created}`)
    console.log(`✓ Total de variants criados: ${this.stats.variants_created}`)
  }

  /**
   * Transforma produto do catálogo para formato Medusa
   */
  private transformProduct(product: Product): any {
    return {
      title: product.title,
      subtitle: product.subtitle,
      handle: product.handle,
      description: product.description,
      status: product.status,
      thumbnail: product.thumbnail,
      // Mapear categorias para IDs
      categories: product.categories?.map(cat => 
        this.categoryMap.get(cat)
      ).filter(Boolean),
      // Mapear tags para IDs
      tags: product.tags?.map(tag => 
        this.tagMap.get(tag)
      ).filter(Boolean),
      collection_id: product.collection_id,
      options: product.options,
      variants: product.variants.map(variant => ({
        ...variant,
        // Mapear inventory_items se for bundle
        inventory_items: variant.inventory_items?.map(item => ({
          ...item,
          inventory_item_id: this.inventoryItemMap.get(
            item.inventory_item_id.replace('inv_', '')
          ) || item.inventory_item_id
        }))
      })),
      metadata: product.metadata
    }
  }

  /**
   * Formata nome da categoria
   */
  private formatCategoryName(code: string): string {
    return code
      .replace('cat_', '')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Executa importação completa
   */
  async import(catalogPath: string): Promise<void> {
    console.log("\n" + "🚀".repeat(40))
    console.log("YSH SOLAR B2B - MEDUSA.JS CATALOG IMPORTER")
    console.log("🚀".repeat(40))

    const startTime = Date.now()

    try {
      await this.loadCatalog(catalogPath)
      await this.createCategories()
      await this.createTags()
      await this.createInventoryItems()
      await this.createProducts()

      const duration = ((Date.now() - startTime) / 1000).toFixed(2)

      // Estatísticas finais
      console.log(`\n${"=".repeat(80)}`)
      console.log("📊 ESTATÍSTICAS FINAIS")
      console.log(`${"=".repeat(80)}`)
      console.log(`  • Categorias criadas: ${this.stats.categories_created}`)
      console.log(`  • Tags criadas: ${this.stats.tags_created}`)
      console.log(`  • Inventory Items criados: ${this.stats.inventory_items_created}`)
      console.log(`  • Products criados: ${this.stats.products_created}`)
      console.log(`  • Variants criados: ${this.stats.variants_created}`)
      console.log(`  • Erros: ${this.stats.errors}`)
      console.log(`  • Tempo total: ${duration}s`)
      console.log(`${"=".repeat(80)}`)

      if (this.stats.errors === 0) {
        console.log("\n✅ Importação concluída com sucesso!")
      } else {
        console.log(`\n⚠️  Importação concluída com ${this.stats.errors} erros`)
      }

    } catch (error) {
      console.error(`\n❌ Erro fatal durante importação: ${error}`)
      throw error
    }
  }
}


// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Importa catálogo para Medusa.js
 * 
 * @example
 * import { importCatalog } from './import-catalog-to-medusa'
 * await importCatalog('./medusa-catalog/complete_catalog_2025-10-14_04-44-35.json')
 */
export async function importCatalog(
  catalogPath: string,
  container?: MedusaContainer
): Promise<void> {
  // Se container não fornecido, criar um (exemplo)
  if (!container) {
    console.warn("⚠️  Container não fornecido, usando container padrão")
    // TODO: Obter container do Medusa
    throw new Error("Container is required")
  }

  const importer = new MedusaCatalogImporter(container)
  await importer.import(catalogPath)
}


// ============================================================================
// CLI USAGE
// ============================================================================

/**
 * Uso via CLI:
 * 
 * ts-node import-catalog-to-medusa.ts ./medusa-catalog/complete_catalog.json
 */
if (require.main === module) {
  const catalogPath = process.argv[2]
  
  if (!catalogPath) {
    console.error("❌ Uso: ts-node import-catalog-to-medusa.ts <catalog-path>")
    process.exit(1)
  }

  // TODO: Inicializar container do Medusa
  console.log("⚠️  CLI não implementado - usar como módulo")
  console.log("\nExemplo:")
  console.log("import { importCatalog } from './import-catalog-to-medusa'")
  console.log("await importCatalog('./medusa-catalog/complete_catalog.json', container)")
}


export default MedusaCatalogImporter
