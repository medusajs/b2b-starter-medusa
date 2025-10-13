/**
 * Script de Conversão de Dados de Inversores para Schema Medusa.js
 * 
 * Este script converte dados de inversores do formato atual para o schema
 * padronizado Medusa.js, pronto para importação.
 */

/**
 * Gera um handle único baseado no nome do produto
 */
function generateHandle(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9]+/g, '-') // Substitui caracteres especiais por hífen
        .replace(/^-+|-+$/g, '') // Remove hífens do início e fim
        .substring(0, 100) // Limita tamanho
}

/**
 * Gera um SKU único
 */
function generateSKU(data) {
    const manufacturer = (data.manufacturer || 'GEN').substring(0, 10).toUpperCase()
    const model = (data.model || 'STD').substring(0, 15).toUpperCase()
    const power = data.technical_specs?.power_kw || data.technical_specs?.power_w / 1000 || 0
    const voltage = data.technical_specs?.voltage_v || 220
    const phases = (data.technical_specs?.phases || 'MONO').substring(0, 4).toUpperCase()

    return `${manufacturer}-${model}-${power}KW-${voltage}V-${phases}`
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9-]/g, '')
}

/**
 * Extrai opções do inversor
 */
function extractOptions(technicalSpecs) {
    const options = []

    // Potência
    if (technicalSpecs?.power_kw || technicalSpecs?.power_w) {
        const powerKw = technicalSpecs.power_kw || (technicalSpecs.power_w / 1000)
        options.push({
            title: "Potência",
            values: [`${powerKw}kW`]
        })
    }

    // Voltagem
    if (technicalSpecs?.voltage_v) {
        options.push({
            title: "Voltagem",
            values: [`${technicalSpecs.voltage_v}V`]
        })
    }

    // Fases
    if (technicalSpecs?.phases) {
        options.push({
            title: "Fases",
            values: [technicalSpecs.phases]
        })
    }

    // Se não houver opções, cria uma padrão
    if (options.length === 0) {
        options.push({
            title: "Modelo",
            values: ["Padrão"]
        })
    }

    return options
}

/**
 * Converte preço para centavos
 */
function convertPrice(priceData) {
    if (!priceData) return null

    let amount = 0

    if (typeof priceData === 'number') {
        amount = Math.round(priceData * 100)
    } else if (priceData.price) {
        amount = Math.round(priceData.price * 100)
    } else if (typeof priceData === 'string') {
        // Tenta extrair número de string como "R$ 1.599,00"
        const numericValue = parseFloat(
            priceData
                .replace(/[^\d,.-]/g, '')
                .replace(/\./g, '')
                .replace(',', '.')
        )
        amount = Math.round(numericValue * 100)
    }

    return {
        currency_code: priceData.currency || "BRL",
        amount: amount
    }
}

/**
 * Determina o tipo de inversor
 */
function determineInverterType(data) {
    const name = (data.name || '').toLowerCase()
    const description = (data.description || '').toLowerCase()
    const text = `${name} ${description}`

    if (text.includes('micro') || text.includes('microinversor')) {
        return 'MICROINVERSOR'
    } else if (text.includes('hybrid') || text.includes('híbrido')) {
        return 'HYBRID'
    } else if (text.includes('off') || text.includes('autônomo')) {
        return 'OFF_GRID'
    } else if (text.includes('grid') || text.includes('rede')) {
        return 'GRID_TIE'
    }

    return 'GRID_TIE' // Default
}

/**
 * Converte um inversor do formato antigo para o schema Medusa.js
 */
function convertInverterToMedusaSchema(oldData) {
    const technicalSpecs = oldData.technical_specs || {}
    const pricing = oldData.pricing || oldData.price_brl || {}

    // Gera título e subtítulo
    const title = oldData.name || oldData.title || 'Inversor Solar'
    const powerKw = technicalSpecs.power_kw || (technicalSpecs.power_w / 1000) || 0
    const voltage = technicalSpecs.voltage_v || 220
    const phases = technicalSpecs.phases || 'Monofásico'
    const subtitle = `${powerKw}kW ${phases} ${voltage}V${technicalSpecs.mppt_count ? ` - ${technicalSpecs.mppt_count} MPPT` : ''}`

    // Extrai opções
    const options = extractOptions(technicalSpecs)

    // Cria objeto de opções para variante
    const variantOptions = {}
    options.forEach(opt => {
        variantOptions[opt.title] = opt.values[0]
    })

    // Gera SKU e handle
    const sku = generateSKU(oldData)
    const handle = generateHandle(title)

    // Converte preço
    const priceData = convertPrice(pricing)

    // Determina status baseado na disponibilidade
    let status = 'published'
    if (oldData.availability) {
        const avail = oldData.availability.toLowerCase()
        if (avail.includes('indispon') || avail === 'out_of_stock') {
            status = 'draft'
        }
    }

    // Monta o objeto Medusa
    const medusaProduct = {
        title: title,
        subtitle: subtitle,
        handle: handle,
        description: oldData.description || title,
        status: status,
        external_id: oldData.id,
        discountable: true,
        is_giftcard: false,

        // Imagens
        thumbnail: oldData.image || oldData.processed_images?.medium || null,
        images: [],

        // Dimensões e peso
        weight: technicalSpecs.weight || null,
        length: technicalSpecs.length || null,
        height: technicalSpecs.height || null,
        width: technicalSpecs.width || null,

        // Códigos fiscais
        hs_code: "8504.40.90", // Código HS padrão para inversores
        origin_country: technicalSpecs.origin_country || "CN",
        material: technicalSpecs.material || technicalSpecs.protection_degree || null,

        // Categorias (IDs devem existir no Medusa)
        categories: [
            { id: "cat_inversores" }
        ],

        // Tags
        tags: [],

        // Opções e variantes
        options: options,
        variants: [
            {
                title: `${oldData.manufacturer || 'Generic'} - ${subtitle}`,
                sku: sku,
                manage_inventory: true,
                allow_backorder: false,
                inventory_quantity: oldData.inventory_quantity || 0,
                options: variantOptions,
                prices: priceData ? [priceData] : []
            }
        ],

        // Metadados
        metadata: {
            manufacturer: oldData.manufacturer || 'Generic',
            distributor: oldData.source || 'Unknown',
            source: oldData.source || null,
            technical_specs: {
                type: determineInverterType(oldData),
                power_w: technicalSpecs.power_w || (technicalSpecs.power_kw * 1000) || null,
                power_kw: technicalSpecs.power_kw || (technicalSpecs.power_w / 1000) || null,
                voltage_v: technicalSpecs.voltage_v || null,
                phases: technicalSpecs.phases || null,
                mppt_count: technicalSpecs.mppt_count || null,
                efficiency: technicalSpecs.efficiency || null,
                current_a: technicalSpecs.current_a || null,
                max_dc_voltage_v: technicalSpecs.max_dc_voltage_v || null,
                min_dc_voltage_v: technicalSpecs.min_dc_voltage_v || null,
                max_dc_current_a: technicalSpecs.max_dc_current_a || null,
                nominal_ac_voltage_v: technicalSpecs.nominal_ac_voltage_v || technicalSpecs.voltage_v || null,
                ac_frequency_hz: technicalSpecs.ac_frequency_hz || 60,
                protection_degree: technicalSpecs.protection_degree || null,
                operating_temp_min_c: technicalSpecs.operating_temp_min_c || null,
                operating_temp_max_c: technicalSpecs.operating_temp_max_c || null,
                topology: technicalSpecs.topology || null,
                communication: technicalSpecs.communication || [],
                certifications: technicalSpecs.certifications || [],
                warranty_years: technicalSpecs.warranty_years || null
            },
            source_data: {
                source_id: oldData.id,
                source_url: oldData.source || null,
                imported_at: new Date().toISOString(),
                last_updated: oldData.metadata?.last_updated || new Date().toISOString()
            }
        }
    }

    // Adiciona imagens se disponíveis
    if (oldData.image) {
        medusaProduct.images.push({ url: oldData.image })
    }
    if (oldData.processed_images) {
        if (oldData.processed_images.large) {
            medusaProduct.images.push({ url: oldData.processed_images.large })
        }
        if (oldData.processed_images.medium && oldData.processed_images.medium !== oldData.image) {
            medusaProduct.images.push({ url: oldData.processed_images.medium })
        }
    }

    // Adiciona tags baseadas nas características
    const tags = []

    // Tag do fabricante
    if (oldData.manufacturer) {
        tags.push({ id: `tag_${oldData.manufacturer.toLowerCase().replace(/\s+/g, '_')}` })
    }

    // Tag de potência
    if (powerKw) {
        tags.push({ id: `tag_${Math.round(powerKw)}kw` })
    }

    // Tag de fases
    if (phases) {
        tags.push({ id: `tag_${phases.toLowerCase().replace('á', 'a')}` })
    }

    // Tag de MPPTs
    if (technicalSpecs.mppt_count) {
        tags.push({ id: `tag_${technicalSpecs.mppt_count}mppt` })
    }

    medusaProduct.tags = tags

    // Adiciona categorias específicas baseadas no tipo
    const inverterType = determineInverterType(oldData)
    if (inverterType === 'GRID_TIE') {
        medusaProduct.categories.push({ id: 'cat_inversores_grid_tie' })
    } else if (inverterType === 'OFF_GRID') {
        medusaProduct.categories.push({ id: 'cat_inversores_off_grid' })
    } else if (inverterType === 'HYBRID') {
        medusaProduct.categories.push({ id: 'cat_inversores_hybrid' })
    } else if (inverterType === 'MICROINVERSOR') {
        medusaProduct.categories.push({ id: 'cat_microinversores' })
    }

    // Categoria por fases
    if (phases) {
        const phasesNormalized = phases.toLowerCase()
        if (phasesNormalized.includes('mono')) {
            medusaProduct.categories.push({ id: 'cat_inversores_monofasicos' })
        } else if (phasesNormalized.includes('tri')) {
            medusaProduct.categories.push({ id: 'cat_inversores_trifasicos' })
        } else if (phasesNormalized.includes('bi')) {
            medusaProduct.categories.push({ id: 'cat_inversores_bifasicos' })
        }
    }

    return medusaProduct
}

/**
 * Converte múltiplos inversores
 */
function convertMultipleInverters(oldDataArray) {
    return oldDataArray.map(oldData => {
        try {
            return convertInverterToMedusaSchema(oldData)
        } catch (error) {
            console.error(`Erro ao converter inversor ${oldData.id}:`, error)
            return null
        }
    }).filter(Boolean) // Remove nulls
}

/**
 * Exemplo de uso
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        convertInverterToMedusaSchema,
        convertMultipleInverters,
        generateHandle,
        generateSKU
    }
}

// Exemplo de uso standalone
if (typeof window === 'undefined' && require.main === module) {
    const fs = require('fs')
    const path = require('path')

    // Exemplo: converter arquivo odex-inverters.json
    const inputFile = path.join(__dirname, '../odex/odex-inverters.json')
    const outputFile = path.join(__dirname, 'odex-inverters-medusa-format.json')

    try {
        const oldData = JSON.parse(fs.readFileSync(inputFile, 'utf-8'))
        const medusaData = convertMultipleInverters(oldData)

        fs.writeFileSync(outputFile, JSON.stringify(medusaData, null, 2), 'utf-8')
        console.log(`✅ Conversão concluída: ${medusaData.length} inversores convertidos`)
        console.log(`📁 Arquivo salvo: ${outputFile}`)
    } catch (error) {
        console.error('❌ Erro na conversão:', error)
    }
}
