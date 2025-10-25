/**
 * Conversor de Painéis Solares para o Schema Medusa.js
 * 
 * Este script converte dados de painéis solares de diferentes formatos
 * (ODEX, Solfacil, Neosolar, etc.) para o padrão Medusa.js Product Module
 * 
 * @author YSH Medusa Team
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

/**
 * Configurações do conversor
 */
const CONFIG = {
    // Diretórios
    INPUT_DIR: path.join(__dirname, '..'),
    OUTPUT_DIR: path.join(__dirname, 'output'),

    // Prefixos para SKU
    SKU_PREFIX: 'PANEL',

    // Status padrão
    DEFAULT_STATUS: 'draft',

    // Moeda padrão
    DEFAULT_CURRENCY: 'BRL'
};

/**
 * Mapeamento de tecnologias
 */
const TECHNOLOGY_MAP = {
    'mono': 'Monocristalino',
    'monocristalino': 'Monocristalino',
    'perc': 'Monocristalino PERC',
    'mono perc': 'Monocristalino PERC',
    'topcon': 'Monocristalino TOPCon',
    'hjt': 'Monocristalino HJT',
    'poly': 'Policristalino',
    'policristalino': 'Policristalino',
    'bifacial': 'Bifacial',
    'half-cell': 'Half-Cell',
    'half cell': 'Half-Cell'
};

/**
 * Gera um handle único baseado no título
 * @param {string} title - Título do produto
 * @returns {string} Handle URL-friendly
 */
function generateHandle(title) {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

/**
 * Gera um SKU único para o painel
 * @param {Object} panel - Dados do painel
 * @returns {string} SKU único
 */
function generateSKU(panel) {
    const parts = [];

    // Fabricante (primeiras 3 letras)
    if (panel.manufacturer) {
        const mfg = panel.manufacturer
            .toUpperCase()
            .replace(/[^A-Z]/g, '')
            .substring(0, 3);
        parts.push(mfg);
    }

    // Modelo ou série
    if (panel.model) {
        const model = panel.model
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .substring(0, 8);
        parts.push(model);
    }

    // Potência
    if (panel.power_w) {
        parts.push(`${panel.power_w}W`);
    }

    // Tecnologia (sigla)
    if (panel.technology) {
        const tech = panel.technology.toLowerCase();
        if (tech.includes('perc')) parts.push('PERC');
        else if (tech.includes('topcon')) parts.push('TOPCON');
        else if (tech.includes('hjt')) parts.push('HJT');
        else if (tech.includes('mono')) parts.push('MONO');
        else if (tech.includes('poly')) parts.push('POLY');
    }

    // Bifacial
    if (panel.bifacial) {
        parts.push('BF');
    }

    return parts.join('-');
}

/**
 * Converte preço para centavos
 * @param {number|string} price - Preço em reais
 * @returns {number} Preço em centavos
 */
function convertPrice(price) {
    if (typeof price === 'number') {
        return Math.round(price * 100);
    }

    if (typeof price === 'string') {
        // Remove símbolos de moeda e espaços
        const cleaned = price.replace(/[R$\s]/g, '');

        // Substitui vírgula por ponto
        const normalized = cleaned.replace(',', '.');

        // Converte e multiplica por 100
        return Math.round(parseFloat(normalized) * 100);
    }

    return 0;
}

/**
 * Normaliza tecnologia
 * @param {string} technology - Tecnologia original
 * @returns {string} Tecnologia normalizada
 */
function normalizeTechnology(technology) {
    if (!technology) return 'Monocristalino';

    const lower = technology.toLowerCase();

    for (const [key, value] of Object.entries(TECHNOLOGY_MAP)) {
        if (lower.includes(key)) {
            return value;
        }
    }

    return technology;
}

/**
 * Extrai faixa de potência
 * @param {number} power - Potência em watts
 * @returns {string} Faixa de potência
 */
function getPowerRange(power) {
    if (power < 300) return 'Até 300W';
    if (power < 400) return '300W - 400W';
    if (power < 500) return '400W - 500W';
    if (power < 600) return '500W - 600W';
    return '600W+';
}

/**
 * Extrai opções do painel
 * @param {Object} panel - Dados do painel
 * @returns {Array} Array de opções
 */
function extractPanelOptions(panel) {
    const options = [];

    // Opção: Potência
    if (panel.power_w) {
        options.push({
            title: 'Potência',
            values: [`${panel.power_w}W`]
        });
    }

    // Opção: Tecnologia
    if (panel.technology) {
        options.push({
            title: 'Tecnologia',
            values: [normalizeTechnology(panel.technology)]
        });
    }

    // Opção: Cor da Moldura (se especificada)
    if (panel.frame_color) {
        options.push({
            title: 'Cor da Moldura',
            values: [panel.frame_color]
        });
    }

    return options;
}

/**
 * Extrai características elétricas
 * @param {Object} panel - Dados do painel
 * @returns {Object} Características elétricas
 */
function extractElectricalCharacteristics(panel) {
    const specs = panel.technical_specs || panel;

    return {
        pmax_w: specs.power_w || specs.pmax_w || null,
        vmp_v: specs.vmp_v || specs.vmp || null,
        imp_a: specs.imp_a || specs.imp || null,
        voc_v: specs.voc_v || specs.voc || null,
        isc_a: specs.isc_a || specs.isc || null,
        max_system_voltage_v: specs.max_system_voltage_v || 1500,
        max_series_fuse_rating_a: specs.max_series_fuse_rating_a || null
    };
}

/**
 * Extrai coeficientes de temperatura
 * @param {Object} panel - Dados do painel
 * @returns {Object} Coeficientes de temperatura
 */
function extractTemperatureCoefficients(panel) {
    const specs = panel.technical_specs || panel;
    const temp = specs.temperature_coefficients || {};

    return {
        pmax: temp.pmax || temp.pmax_percent_c || -0.35,
        voc: temp.voc || temp.voc_percent_c || -0.27,
        isc: temp.isc || temp.isc_percent_c || 0.05
    };
}

/**
 * Extrai dimensões físicas
 * @param {Object} panel - Dados do painel
 * @returns {Object} Dimensões
 */
function extractDimensions(panel) {
    const specs = panel.technical_specs || panel;
    const dim = specs.dimensions || {};

    return {
        length_mm: dim.length_mm || dim.comprimento_mm || null,
        width_mm: dim.width_mm || dim.largura_mm || null,
        thickness_mm: dim.thickness_mm || dim.espessura_mm || 35,
        weight_kg: dim.weight_kg || dim.peso_kg || null
    };
}

/**
 * Extrai especificações mecânicas
 * @param {Object} panel - Dados do painel
 * @returns {Object} Especificações mecânicas
 */
function extractMechanicalSpecs(panel) {
    const specs = panel.technical_specs || panel;
    const mech = specs.mechanical_specifications || {};

    return {
        frame_material: mech.frame_material || 'Alumínio Anodizado',
        frame_color: mech.frame_color || panel.frame_color || 'Prata',
        glass_type: mech.glass_type || 'Vidro Temperado de Alta Transmissão',
        glass_thickness_mm: mech.glass_thickness_mm || 3.2,
        junction_box: mech.junction_box || 'IP68',
        cable_length_mm: mech.cable_length_mm || 1200,
        connector_type: mech.connector_type || 'MC4'
    };
}

/**
 * Extrai garantias
 * @param {Object} panel - Dados do painel
 * @returns {Object} Garantias
 */
function extractWarranties(panel) {
    const specs = panel.technical_specs || panel;
    const war = specs.warranties || {};

    return {
        product_warranty_years: war.product_warranty_years || 12,
        performance_warranty_years: war.performance_warranty_years || 25,
        linear_warranty: war.linear_warranty !== false,
        performance_at_25_years: war.performance_at_25_years || 84.8
    };
}

/**
 * Extrai certificações
 * @param {Object} panel - Dados do painel
 * @returns {Array} Certificações
 */
function extractCertifications(panel) {
    const specs = panel.technical_specs || panel;
    const certs = specs.certifications || [];

    if (Array.isArray(certs) && certs.length > 0) {
        return certs;
    }

    // Certificações padrão
    return ['IEC 61215', 'IEC 61730', 'INMETRO'];
}

/**
 * Gera tags automaticamente
 * @param {Object} panel - Dados do painel
 * @returns {Array} Tags
 */
function generateTags(panel) {
    const tags = [];

    // Tag: Fabricante
    if (panel.manufacturer) {
        tags.push(`tag_${generateHandle(panel.manufacturer)}`);
    }

    // Tag: Potência
    if (panel.power_w) {
        tags.push(`tag_${panel.power_w}w`);
        tags.push(`tag_${getPowerRange(panel.power_w).toLowerCase().replace(/\s+/g, '_')}`);
    }

    // Tag: Tecnologia
    if (panel.technology) {
        const tech = normalizeTechnology(panel.technology);
        tags.push(`tag_${generateHandle(tech)}`);
    }

    // Tag: Bifacial
    if (panel.bifacial) {
        tags.push('tag_bifacial');
    }

    // Tag: Alta eficiência
    if (panel.efficiency && panel.efficiency >= 21) {
        tags.push('tag_alta_eficiencia');
    }

    // Tag: Full Black
    if (panel.frame_color && panel.frame_color.toLowerCase().includes('preta')) {
        tags.push('tag_full_black');
    }

    return tags;
}

/**
 * Converte painel para schema Medusa
 * @param {Object} panel - Dados do painel original
 * @param {string} source - Fonte dos dados (odex, solfacil, etc)
 * @returns {Object} Painel no formato Medusa
 */
function convertPanelToMedusaSchema(panel, source = 'unknown') {
    // Normaliza tecnologia
    const technology = normalizeTechnology(panel.technology || panel.tipo);

    // Gera título
    const title = panel.title ||
        panel.name ||
        `${panel.manufacturer || 'Painel'} ${panel.power_w || ''}W ${technology}`.trim();

    // Gera handle
    const handle = generateHandle(title);

    // Gera SKU
    const sku = generateSKU({
        manufacturer: panel.manufacturer || panel.fabricante,
        model: panel.model || panel.modelo,
        power_w: panel.power_w || panel.potencia,
        technology: technology,
        bifacial: panel.bifacial
    });

    // Extrai opções
    const options = extractPanelOptions({
        power_w: panel.power_w || panel.potencia,
        technology: technology,
        frame_color: panel.frame_color
    });

    // Cria estrutura Medusa
    const medusaPanel = {
        title: title,
        subtitle: `${panel.power_w || panel.potencia || ''}W ${technology} - Eficiência ${panel.efficiency || 21}%`,
        handle: handle,
        description: panel.description || `Módulo fotovoltaico ${title} de alta eficiência, ideal para sistemas residenciais e comerciais.`,
        status: CONFIG.DEFAULT_STATUS,
        is_giftcard: false,
        discountable: true,

        // Opções de variação
        options: options,

        // Variantes
        variants: [
            {
                title: title,
                sku: sku,
                barcode: panel.barcode || null,
                ean: panel.ean || null,
                inventory_quantity: panel.inventory_quantity || panel.stock || 0,
                allow_backorder: false,
                manage_inventory: true,
                weight: (panel.weight_kg || panel.peso_kg || 0) * 1000, // em gramas
                length: panel.dimensions?.length_mm || null,
                width: panel.dimensions?.width_mm || null,
                height: panel.dimensions?.thickness_mm || 35,
                origin_country: panel.origin_country || 'BR',

                // Preços
                prices: [
                    {
                        currency_code: CONFIG.DEFAULT_CURRENCY,
                        amount: convertPrice(panel.price || panel.preco || 0)
                    }
                ],

                // Opções desta variante
                options: options.reduce((acc, opt) => {
                    acc[opt.title] = opt.values[0];
                    return acc;
                }, {}),

                // ID externo para rastreamento
                external_id: panel.id || panel.external_id || null
            }
        ],

        // Imagens
        images: panel.images || [],

        // Metadata com especificações técnicas
        metadata: {
            source: source,
            manufacturer: panel.manufacturer || panel.fabricante || null,
            model: panel.model || panel.modelo || null,

            technical_specs: {
                power_w: panel.power_w || panel.potencia || null,
                technology: technology,
                efficiency: panel.efficiency || panel.eficiencia || null,
                cell_type: panel.cell_type || 'Monocristalino',
                number_of_cells: panel.number_of_cells || 144,
                bifacial: panel.bifacial || false,
                bifacial_factor: panel.bifacial_factor || null,

                dimensions: extractDimensions(panel),

                electrical_characteristics: extractElectricalCharacteristics(panel),

                temperature_coefficients: extractTemperatureCoefficients(panel),

                operating_conditions: {
                    operating_temperature_range: panel.operating_temperature_range || '-40°C a +85°C',
                    noct: panel.noct || 45
                },

                mechanical_specifications: extractMechanicalSpecs(panel),

                load_ratings: {
                    front_load_pa: panel.front_load_pa || 5400,
                    back_load_pa: panel.back_load_pa || 2400
                },

                warranties: extractWarranties(panel),

                certifications: extractCertifications(panel)
            }
        },

        // Tags para busca e filtro
        tags: generateTags({
            manufacturer: panel.manufacturer || panel.fabricante,
            power_w: panel.power_w || panel.potencia,
            technology: technology,
            bifacial: panel.bifacial,
            efficiency: panel.efficiency || panel.eficiencia,
            frame_color: panel.frame_color
        }),

        // Categorias (você pode ajustar conforme sua estrutura)
        categories: [
            'cat_paineis',
            `cat_paineis_${getPowerRange(panel.power_w || panel.potencia).toLowerCase().replace(/\s+/g, '_')}`,
            `cat_paineis_${generateHandle(technology)}`
        ],

        // ID externo para rastreamento
        external_id: panel.id || panel.external_id || null
    };

    return medusaPanel;
}

/**
 * Converte arquivo de painéis
 * @param {string} inputFile - Arquivo de entrada
 * @param {string} outputFile - Arquivo de saída
 * @param {string} source - Fonte dos dados
 */
function convertFile(inputFile, outputFile, source) {
    try {
        console.log(`\n📄 Convertendo: ${inputFile}`);

        // Lê arquivo de entrada
        const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

        // Converte cada painel
        const panels = Array.isArray(data) ? data : [data];
        const converted = panels.map(panel => convertPanelToMedusaSchema(panel, source));

        // Cria diretório de saída se não existir
        const outputDir = path.dirname(outputFile);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Salva resultado
        fs.writeFileSync(outputFile, JSON.stringify(converted, null, 2));

        console.log(`✅ Convertido: ${converted.length} painéis`);
        console.log(`📁 Salvo em: ${outputFile}`);

        return converted;
    } catch (error) {
        console.error(`❌ Erro ao converter ${inputFile}:`, error.message);
        return null;
    }
}

/**
 * Processa múltiplos arquivos
 */
function processAllFiles() {
    console.log('🚀 Iniciando conversão de painéis para Medusa.js\n');

    const files = [
        {
            input: path.join(CONFIG.INPUT_DIR, 'odex', 'odex-panels.json'),
            output: path.join(CONFIG.OUTPUT_DIR, 'odex-panels-medusa.json'),
            source: 'odex'
        },
        {
            input: path.join(CONFIG.INPUT_DIR, 'solfacil', 'solfacil-panels.json'),
            output: path.join(CONFIG.OUTPUT_DIR, 'solfacil-panels-medusa.json'),
            source: 'solfacil'
        },
        {
            input: path.join(CONFIG.INPUT_DIR, 'fotus', 'fotus-panels.json'),
            output: path.join(CONFIG.OUTPUT_DIR, 'fotus-panels-medusa.json'),
            source: 'fotus'
        }
    ];

    let totalConverted = 0;

    for (const file of files) {
        if (fs.existsSync(file.input)) {
            const result = convertFile(file.input, file.output, file.source);
            if (result) {
                totalConverted += result.length;
            }
        } else {
            console.log(`⚠️  Arquivo não encontrado: ${file.input}`);
        }
    }

    console.log(`\n✨ Conversão concluída! Total: ${totalConverted} painéis`);
}

// Executa se chamado diretamente
if (require.main === module) {
    processAllFiles();
}

// Exporta funções para uso em outros scripts
module.exports = {
    convertPanelToMedusaSchema,
    convertFile,
    generateHandle,
    generateSKU,
    convertPrice,
    normalizeTechnology,
    extractPanelOptions,
    generateTags
};
