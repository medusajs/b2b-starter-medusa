/**
 * YSH Solar B2B - Enriched Products Importer for Medusa.js
 * 
 * Importa produtos enrichados (com scores, análise de preços, certificações)
 * para Medusa.js v2.x
 * 
 * @usage
 * import { importEnrichedProducts } from './import-enriched-to-medusa'
 * await importEnrichedProducts('./enriched-complete/enriched_products_2025-10-14_10-30-42.json')
 */

import {
    createProductsWorkflow,
    createProductCategoriesWorkflow,
    createProductTagsWorkflow
} from "@medusajs/medusa/core-flows"
import { MedusaContainer } from "@medusajs/framework/types"
import * as fs from 'fs'
import * as path from 'path'


// ============================================================================
// ENRICHED PRODUCT TYPES
// ============================================================================

interface PriceAnalysis {
    best_price: number
    worst_price: number
    average_price: number
    median_price: number
    price_variance: number
    distributors_count: number
    best_distributor: string
    price_range_pct: number
    price_recommendation: 'excellent_deal' | 'good_price' | 'average' | 'expensive'
}

interface WarrantyInfo {
    product_warranty_years: number
    performance_warranty_years: number
    performance_guarantee_pct: number
    extendable: boolean
    coverage_scope: string
}

interface CertificationInfo {
    inmetro: boolean
    iec_standards: string[]
    ce_marking: boolean
    ul_listed: boolean
    tuv_certified: boolean
    iso_9001: boolean
    iso_14001: boolean
    certification_score: number
}

interface KPIMetrics {
    efficiency_pct: number
    performance_ratio: number
    degradation_rate_annual: number
    temperature_coefficient: number
    mtbf_hours: number
    lifecycle_years: number
    energy_payback_time_months: number
    carbon_footprint_kg: number
}

interface EnrichedProduct {
    id: string
    title: string
    sku: string
    manufacturer: string
    category: string
    price_analysis: PriceAnalysis
    warranty: WarrantyInfo
    certifications: CertificationInfo
    kpis: KPIMetrics
    technical_specs: Record<string, any>
    images: string[]
    metadata: Record<string, any>
    overall_score: number
    value_score: number
    quality_score: number
    reliability_score: number
}


// ============================================================================
// IMPORT CONFIGURATION
// ============================================================================

interface ImportConfig {
    minOverallScore?: number
    minValueScore?: number
    categories?: string[]
    distributors?: string[]
    priceFilter?: string[]
    requireCertification?: boolean
    preferredCerts?: string[]
    trackInventory?: boolean
    allowBackorders?: boolean
    defaultStock?: number
    batchSize?: number
}

const DEFAULT_CONFIG: ImportConfig = {
    minOverallScore: 60,
    minValueScore: 50,
    categories: ['panels', 'inverters', 'structures', 'water_pumps'],
    priceFilter: ['excellent_deal', 'good_price', 'average'],
    requireCertification: false,
    trackInventory: true,
    allowBackorders: false,
    defaultStock: 10,
    batchSize: 20
}


// ============================================================================
// CATEGORY MAPPING
// ============================================================================

const CATEGORY_MAPPING: Record<string, { name: string; handle: string; description: string }> = {
    'panels': {
        name: 'Painéis Solares',
        handle: 'paineis-solares',
        description: 'Módulos fotovoltaicos para geração de energia solar'
    },
    'inverters': {
        name: 'Inversores',
        handle: 'inversores',
        description: 'Inversores fotovoltaicos grid-tie e off-grid'
    },
    'microinverters': {
        name: 'Microinversores',
        handle: 'microinversores',
        description: 'Microinversores para sistemas distribuídos'
    },
    'hybrid_inverters': {
        name: 'Inversores Híbridos',
        handle: 'inversores-hibridos',
        description: 'Inversores híbridos on-grid/off-grid com bateria'
    },
    'batteries': {
        name: 'Baterias',
        handle: 'baterias',
        description: 'Baterias estacionárias e de lítio para armazenamento'
    },
    'structures': {
        name: 'Estruturas de Fixação',
        handle: 'estruturas',
        description: 'Estruturas metálicas para montagem de painéis solares'
    },
    'stringboxes': {
        name: 'String Box',
        handle: 'string-box',
        description: 'Caixas de proteção e junção para strings fotovoltaicas'
    },
    'cables': {
        name: 'Cabos',
        handle: 'cabos',
        description: 'Cabos elétricos para sistemas fotovoltaicos'
    },
    'water_pumps': {
        name: 'Bombas Solares',
        handle: 'bombas-solares',
        description: 'Bombas d\'água movidas a energia solar'
    },
    'boxes': {
        name: 'Caixas e Gabinetes',
        handle: 'caixas',
        description: 'Caixas de proteção e gabinetes elétricos'
    },
    'security': {
        name: 'Proteção e Segurança',
        handle: 'protecao',
        description: 'Dispositivos de proteção contra surtos e sobretensão'
    },
    'miscellaneous': {
        name: 'Acessórios',
        handle: 'acessorios',
        description: 'Acessórios diversos para sistemas fotovoltaicos'
    }
}


// ============================================================================
// ENRICHED PRODUCTS IMPORTER
// ============================================================================

export class EnrichedProductsImporter {
    private container: MedusaContainer
    private config: ImportConfig
    private products: EnrichedProduct[] = []
    private categoryMap: Map<string, string> = new Map()
    private tagMap: Map<string, string> = new Map()
    private stats = {
        loaded: 0,
        filtered: 0,
        categories_created: 0,
        tags_created: 0,
        products_created: 0,
        variants_created: 0,
        errors: 0
    }

    constructor(container: MedusaContainer, config: Partial<ImportConfig> = {}) {
        this.container = container
        this.config = { ...DEFAULT_CONFIG, ...config }
    }

    /**
     * Carrega e filtra produtos enrichados
     */
    async loadProducts(filePath: string): Promise<void> {
        console.log(`\n${"=".repeat(80)}`)
        console.log("📥 Carregando produtos enrichados...")
        console.log(`${"=".repeat(80)}`)

        try {
            const fullPath = path.resolve(filePath)
            const fileContent = fs.readFileSync(fullPath, 'utf-8')
            const allProducts: EnrichedProduct[] = JSON.parse(fileContent)

            this.stats.loaded = allProducts.length
            console.log(`✓ ${allProducts.length} produtos carregados`)

            // Aplicar filtros
            this.products = allProducts.filter(p => this.shouldImport(p))
            this.stats.filtered = this.products.length

            console.log(`\n📊 Filtros aplicados:`)
            console.log(`  • Score mínimo: ${this.config.minOverallScore}`)
            console.log(`  • Categorias: ${this.config.categories?.join(', ')}`)
            console.log(`  • Classificação de preço: ${this.config.priceFilter?.join(', ')}`)
            console.log(`\n✓ ${this.products.length} produtos selecionados para importação`)
            console.log(`  ❌ ${allProducts.length - this.products.length} produtos filtrados`)

        } catch (error) {
            console.error(`❌ Erro ao carregar produtos: ${error}`)
            throw error
        }
    }

    /**
     * Verifica se produto deve ser importado
     */
    private shouldImport(product: EnrichedProduct): boolean {
        // Filtro de score
        if (this.config.minOverallScore && product.overall_score < this.config.minOverallScore) {
            return false
        }

        if (this.config.minValueScore && product.value_score < this.config.minValueScore) {
            return false
        }

        // Filtro de categoria
        if (this.config.categories && !this.config.categories.includes(product.category)) {
            return false
        }

        // Filtro de preço
        if (this.config.priceFilter && !this.config.priceFilter.includes(product.price_analysis.price_recommendation)) {
            return false
        }

        // Filtro de certificação (opcional)
        if (this.config.requireCertification) {
            const hasCert = product.certifications.ce_marking ||
                product.certifications.inmetro ||
                product.certifications.tuv_certified
            if (!hasCert) return false
        }

        return true
    }

    /**
     * Cria categorias no Medusa
     */
    async createCategories(): Promise<void> {
        console.log(`\n${"=".repeat(80)}`)
        console.log("📁 Criando categorias...")
        console.log(`${"=".repeat(80)}`)

        // Extrair categorias únicas
        const categoriesSet = new Set<string>()
        this.products.forEach(p => categoriesSet.add(p.category))

        const categories = Array.from(categoriesSet).map(code => {
            const mapped = CATEGORY_MAPPING[code] || {
                name: code.charAt(0).toUpperCase() + code.slice(1),
                handle: code,
                description: ''
            }
            return {
                name: mapped.name,
                handle: mapped.handle,
                description: mapped.description,
                is_active: true,
                metadata: { original_code: code }
            }
        })

        console.log(`  • Categorias a criar: ${categories.length}`)

        try {
            const { result } = await createProductCategoriesWorkflow(this.container).run({
                input: { product_categories: categories }
            })

            result.forEach((cat: any, index: number) => {
                this.categoryMap.set(categories[index].metadata.original_code, cat.id)
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
        console.log(`\n${"=".repeat(80)}`)
        console.log("🏷️  Criando tags...")
        console.log(`${"=".repeat(80)}`)

        const tagsSet = new Set<string>()

        this.products.forEach(p => {
            // Manufacturer
            tagsSet.add(p.manufacturer)

            // Distributor
            if (p.metadata.distributor) {
                tagsSet.add(p.metadata.distributor)
            }

            // Price recommendation
            tagsSet.add(p.price_analysis.price_recommendation)

            // Certifications
            if (p.certifications.inmetro) tagsSet.add('INMETRO')
            if (p.certifications.ce_marking) tagsSet.add('CE')
            if (p.certifications.tuv_certified) tagsSet.add('TÜV')

            // Quality badges
            if (p.overall_score >= 70) tagsSet.add('High Quality')
            if (p.price_analysis.price_recommendation === 'excellent_deal') tagsSet.add('Best Price')
        })

        const tags = Array.from(tagsSet).map(value => ({ value, metadata: {} }))
        console.log(`  • Tags a criar: ${tags.length}`)

        try {
            const { result } = await createProductTagsWorkflow(this.container).run({
                input: { product_tags: tags }
            })

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
     * Transforma produto enrichado para formato Medusa
     */
    private transformProduct(enriched: EnrichedProduct): any {
        const tags: string[] = [
            enriched.manufacturer,
            enriched.price_analysis.price_recommendation
        ]

        if (enriched.metadata.distributor) tags.push(enriched.metadata.distributor)
        if (enriched.certifications.inmetro) tags.push('INMETRO')
        if (enriched.certifications.ce_marking) tags.push('CE')
        if (enriched.certifications.tuv_certified) tags.push('TÜV')
        if (enriched.overall_score >= 70) tags.push('High Quality')
        if (enriched.price_analysis.price_recommendation === 'excellent_deal') tags.push('Best Price')

        const handle = enriched.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')

        return {
            title: enriched.title,
            subtitle: enriched.metadata.model || enriched.manufacturer,
            handle: handle,
            description: enriched.metadata.description || enriched.title,
            status: 'published',
            thumbnail: enriched.images[0] || null,
            images: enriched.images.map(url => ({ url })),
            categories: [this.categoryMap.get(enriched.category)].filter(Boolean),
            tags: tags.map(t => this.tagMap.get(t)).filter(Boolean),
            options: [{ title: 'Default', values: ['Standard'] }],
            variants: [{
                title: 'Standard',
                sku: enriched.sku || `YSH-${enriched.id}`,
                manage_inventory: this.config.trackInventory,
                allow_backorder: this.config.allowBackorders,
                inventory_quantity: this.config.defaultStock,
                options: { Default: 'Standard' },
                prices: [{
                    currency_code: 'brl',
                    amount: Math.round(enriched.price_analysis.best_price * 100)
                }],
                metadata: {
                    distributor: enriched.metadata.distributor,
                    original_price: enriched.price_analysis.best_price
                }
            }],
            metadata: {
                // Scores
                overall_score: enriched.overall_score,
                value_score: enriched.value_score,
                quality_score: enriched.quality_score,
                reliability_score: enriched.reliability_score,

                // Price Analysis
                price_comparison: {
                    best: enriched.price_analysis.best_price,
                    average: enriched.price_analysis.average_price,
                    worst: enriched.price_analysis.worst_price,
                    distributors: enriched.price_analysis.distributors_count,
                    best_distributor: enriched.price_analysis.best_distributor,
                    recommendation: enriched.price_analysis.price_recommendation
                },

                // Certifications
                certifications: {
                    inmetro: enriched.certifications.inmetro,
                    ce: enriched.certifications.ce_marking,
                    tuv: enriched.certifications.tuv_certified,
                    iec_standards: enriched.certifications.iec_standards.join(', '),
                    score: enriched.certifications.certification_score
                },

                // Warranty
                warranty: {
                    product_years: enriched.warranty.product_warranty_years,
                    performance_years: enriched.warranty.performance_warranty_years,
                    guarantee_pct: enriched.warranty.performance_guarantee_pct,
                    scope: enriched.warranty.coverage_scope
                },

                // KPIs
                kpis: enriched.kpis,

                // Source
                distributor: enriched.metadata.distributor,
                manufacturer: enriched.manufacturer,
                category: enriched.category,
                enriched_at: new Date().toISOString()
            }
        }
    }

    /**
     * Cria produtos no Medusa
     */
    async createProducts(): Promise<void> {
        console.log(`\n${"=".repeat(80)}`)
        console.log("🛍️  Criando produtos...")
        console.log(`${"=".repeat(80)}`)

        const batchSize = this.config.batchSize || 20
        console.log(`  • Total de produtos: ${this.products.length}`)
        console.log(`  • Tamanho do lote: ${batchSize}`)

        for (let i = 0; i < this.products.length; i += batchSize) {
            const batch = this.products.slice(i, i + batchSize)
            const batchNum = Math.floor(i / batchSize) + 1
            const totalBatches = Math.ceil(this.products.length / batchSize)

            console.log(`\n  📦 Lote ${batchNum}/${totalBatches} (${batch.length} produtos)...`)

            try {
                const productsInput = batch.map(p => this.transformProduct(p))

                const { result } = await createProductsWorkflow(this.container).run({
                    input: { products: productsInput }
                })

                this.stats.products_created += result.length
                this.stats.variants_created += result.length // 1 variant per product

                console.log(`  ✓ ${result.length} produtos criados`)
            } catch (error) {
                console.error(`  ❌ Erro no lote ${batchNum}: ${error}`)
                this.stats.errors++
            }
        }

        console.log(`\n✓ Total de produtos criados: ${this.stats.products_created}`)
    }

    /**
     * Executa importação completa
     */
    async import(productsPath: string): Promise<void> {
        console.log("\n" + "🚀".repeat(40))
        console.log("YSH SOLAR - ENRICHED PRODUCTS IMPORTER")
        console.log("🚀".repeat(40))

        const startTime = Date.now()

        try {
            await this.loadProducts(productsPath)

            if (this.products.length === 0) {
                console.log("\n⚠️  Nenhum produto selecionado para importação (verifique filtros)")
                return
            }

            await this.createCategories()
            await this.createTags()
            await this.createProducts()

            const duration = ((Date.now() - startTime) / 1000).toFixed(2)

            console.log(`\n${"=".repeat(80)}`)
            console.log("📊 ESTATÍSTICAS FINAIS")
            console.log(`${"=".repeat(80)}`)
            console.log(`  • Produtos carregados: ${this.stats.loaded}`)
            console.log(`  • Produtos filtrados: ${this.stats.loaded - this.stats.filtered}`)
            console.log(`  • Produtos selecionados: ${this.stats.filtered}`)
            console.log(`  • Categorias criadas: ${this.stats.categories_created}`)
            console.log(`  • Tags criadas: ${this.stats.tags_created}`)
            console.log(`  • Produtos criados: ${this.stats.products_created}`)
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
 * Importa produtos enrichados para Medusa.js
 * 
 * @example
 * await importEnrichedProducts(
 *   './enriched-complete/enriched_products_2025-10-14_10-30-42.json',
 *   container,
 *   { minOverallScore: 60, categories: ['panels', 'inverters'] }
 * )
 */
export async function importEnrichedProducts(
    productsPath: string,
    container: MedusaContainer,
    config?: Partial<ImportConfig>
): Promise<void> {
    const importer = new EnrichedProductsImporter(container, config)
    await importer.import(productsPath)
}


export default EnrichedProductsImporter
