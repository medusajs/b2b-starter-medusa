/**
 * 🔄 Convert NeoSolar Products to Medusa.js v2.x Format
 * =================================================== 
 * 
 * Converte dados de kits NeoSolar para o formato Medusa.js v2.x usando:
 * - Product Module (Product, ProductVariant, ProductOption)
 * - Inventory Kits Pattern (Multi-part Products)
 * - Tiered Pricing + Price Rules
 * 
 * Input: neosolar-kits-normalized.json
 * Output: neosolar-kits-medusa.json
 * 
 * Usage:
 * ```bash
 * node convert-neosolar-to-medusa.js
 * ```
 */

const fs = require('fs');
const path = require('path');

// Configurações
const CONFIG = {
    INPUT_FILE: '../../distributors/neosolar/neosolar-kits-normalized.json',
    OUTPUT_FILE: 'neosolar-kits-medusa.json',
    MAX_PRODUCTS: 100, // Limite para teste
    BASE_CURRENCY: 'BRL'
};

// Utilitários
class NeoSolarConverter {
    constructor() {
        this.stats = {
            processed: 0,
            skipped: 0,
            errors: 0
        };
    }

    /**
     * Gera SKU padronizado NeoSolar
     */
    generateSKU(kitData) {
        const id = kitData.id || 'UNKNOWN';
        const potencia = kitData.potencia_kwp || 0;
        const systemType = kitData.type || 'Unknown';

        let prefix = 'NEO';
        if (systemType.includes('Off-Grid') || systemType.includes('Off Grid')) {
            prefix += '-OG';
        } else if (systemType.includes('On-Grid') || systemType.includes('On Grid')) {
            prefix += '-GT';
        } else if (systemType.includes('Híbrido') || systemType.includes('Hybrid')) {
            prefix += '-HY';
        } else {
            prefix += '-XX';
        }

        const powerStr = potencia.toString().replace('.', '_');
        return `${prefix}-${powerStr}KWP-${id.replace('NEO-', '')}`;
    }

    /**
     * Gera handle URL-friendly
     */
    generateHandle(title) {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
            .replace(/\s+/g, '-') // Espaços para hífens
            .replace(/-+/g, '-') // Múltiplos hífens para um
            .replace(/^-|-$/g, ''); // Remove hífens das pontas
    }

    /**
     * Converte preço BRL para centavos
     */
    tocents(priceBrl) {
        return Math.round(priceBrl * 100);
    }

    /**
     * Gera tiered pricing com descontos por quantidade
     */
    generateTieredPricing(basePriceBrl) {
        const baseAmount = this.tocents(basePriceBrl);

        return [
            {
                currency_code: CONFIG.BASE_CURRENCY,
                amount: baseAmount
            },
            {
                currency_code: CONFIG.BASE_CURRENCY,
                amount: Math.round(baseAmount * 0.95), // 5% off
                min_quantity: 2,
                max_quantity: 4
            },
            {
                currency_code: CONFIG.BASE_CURRENCY,
                amount: Math.round(baseAmount * 0.90), // 10% off
                min_quantity: 5
            }
        ];
    }

    /**
     * Mapeia categorias baseado no tipo de sistema e potência
     */
    mapCategories(kitData) {
        const categories = ['cat_kits', 'cat_kits_neosolar'];

        const systemType = kitData.type || '';
        if (systemType.includes('Off-Grid') || systemType.includes('Off Grid')) {
            categories.push('cat_kits_off_grid');
        } else if (systemType.includes('On-Grid') || systemType.includes('On Grid')) {
            categories.push('cat_kits_grid_tie');
        } else if (systemType.includes('Híbrido') || systemType.includes('Hybrid')) {
            categories.push('cat_kits_hibrido');
        }

        const potencia = kitData.potencia_kwp || 0;
        if (potencia <= 1) {
            categories.push('cat_kits_ate_1kwp');
        } else if (potencia <= 3) {
            categories.push('cat_kits_1_3kwp');
        } else if (potencia <= 5) {
            categories.push('cat_kits_3_5kwp');
        } else if (potencia <= 10) {
            categories.push('cat_kits_5_10kwp');
        } else {
            categories.push('cat_kits_acima_10kwp');
        }

        return categories;
    }

    /**
     * Gera tags para busca e classificação
     */
    generateTags(kitData) {
        const tags = ['tag_neosolar', 'tag_kit_solar'];

        // Sistema
        const systemType = kitData.type || '';
        if (systemType.includes('Off-Grid') || systemType.includes('Off Grid')) {
            tags.push('tag_off_grid', 'tag_autonomo');
        } else if (systemType.includes('On-Grid') || systemType.includes('On Grid')) {
            tags.push('tag_grid_tie', 'tag_injecao_rede');
        } else if (systemType.includes('Híbrido') || systemType.includes('Hybrid')) {
            tags.push('tag_hibrido', 'tag_backup');
        }

        // Potência
        const potencia = kitData.potencia_kwp || 0;
        if (potencia > 0) {
            tags.push(`tag_${Math.round(potencia)}kwp`);
        }

        // Componentes
        if (kitData.panels && kitData.panels.length > 0) {
            kitData.panels.forEach(panel => {
                if (panel.brand) {
                    tags.push(`tag_${panel.brand.toLowerCase()}`);
                }
            });
        }

        if (kitData.batteries && kitData.batteries.length > 0) {
            kitData.batteries.forEach(battery => {
                if (battery.technology) {
                    const tech = battery.technology.toLowerCase();
                    if (tech.includes('lítio') || tech.includes('litio')) {
                        tags.push('tag_litio');
                    } else if (tech.includes('chumbo')) {
                        tags.push('tag_chumbo_acido');
                    }
                }
                if (battery.voltage_v) {
                    tags.push(`tag_${battery.voltage_v}v`);
                }
            });
        }

        return tags;
    }

    /**
     * Cria inventory items para componentes do kit
     */
    createInventoryItems(kitData) {
        const inventoryItems = [];

        // Painéis
        if (kitData.panels) {
            kitData.panels.forEach((panel, index) => {
                if (panel.quantity > 0) {
                    inventoryItems.push({
                        inventory_item_id: `inv_item_panel_${kitData.id}_${index}`,
                        required_quantity: panel.quantity,
                        component_type: 'panel'
                    });
                }
            });
        }

        // Inversores/Controladores
        if (kitData.inverters) {
            kitData.inverters.forEach((inverter, index) => {
                if (inverter.quantity > 0 && inverter.brand !== 'None') {
                    inventoryItems.push({
                        inventory_item_id: `inv_item_inverter_${kitData.id}_${index}`,
                        required_quantity: inverter.quantity,
                        component_type: 'inverter'
                    });
                }
            });
        }

        // Baterias
        if (kitData.batteries) {
            kitData.batteries.forEach((battery, index) => {
                if (battery.quantity > 0) {
                    inventoryItems.push({
                        inventory_item_id: `inv_item_battery_${kitData.id}_${index}`,
                        required_quantity: battery.quantity,
                        component_type: 'battery'
                    });
                }
            });
        }

        return inventoryItems;
    }

    /**
     * Cria opções do produto baseado nos componentes
     */
    createOptions(kitData) {
        const options = [];

        // Potência (sempre presente)
        if (kitData.potencia_kwp) {
            options.push({
                title: 'Potência',
                values: [`${kitData.potencia_kwp}kWp`]
            });
        }

        // Tipo de Sistema
        if (kitData.type) {
            const systemType = kitData.type.replace('Solar Kit ', '');
            options.push({
                title: 'Tipo de Sistema',
                values: [systemType]
            });
        }

        // Voltagem da Bateria (se houver)
        if (kitData.batteries && kitData.batteries.length > 0) {
            const voltages = [...new Set(kitData.batteries.map(b => `${b.voltage_v}V`))];
            if (voltages.length > 0 && voltages[0] !== 'undefinedV') {
                options.push({
                    title: 'Voltagem Bateria',
                    values: voltages
                });
            }
        }

        // Capacidade da Bateria (se houver)
        if (kitData.batteries && kitData.batteries.length > 0) {
            const capacities = [...new Set(kitData.batteries.map(b => `${b.capacity_ah}Ah`))];
            if (capacities.length > 0 && capacities[0] !== 'undefinedAh') {
                options.push({
                    title: 'Capacidade Bateria',
                    values: capacities
                });
            }
        }

        // Tecnologia da Bateria (se houver)
        if (kitData.batteries && kitData.batteries.length > 0) {
            const technologies = [...new Set(kitData.batteries.map(b => b.technology).filter(Boolean))];
            if (technologies.length > 0) {
                options.push({
                    title: 'Tecnologia Bateria',
                    values: technologies
                });
            }
        }

        return options.length > 0 ? options : [{ title: 'Configuração', values: ['Padrão'] }];
    }

    /**
     * Converte um kit NeoSolar para formato Medusa.js
     */
    convertKit(kitData) {
        try {
            const sku = this.generateSKU(kitData);
            const handle = this.generateHandle(kitData.name || kitData.title || 'Kit Solar');
            const categories = this.mapCategories(kitData);
            const tags = this.generateTags(kitData);
            const inventoryItems = this.createInventoryItems(kitData);
            const options = this.createOptions(kitData);

            // Preço (garantir que seja válido)
            const priceBrl = kitData.price_brl || 0;
            if (priceBrl <= 0) {
                this.stats.skipped++;
                return null;
            }

            const prices = this.generateTieredPricing(priceBrl);

            // Título e descrição
            const title = kitData.name || kitData.title || `Kit Solar ${kitData.potencia_kwp}kWp`;
            const subtitle = `${kitData.potencia_kwp}kWp ${kitData.type || 'Solar Kit'} - NeoSolar`;

            // Descrição detalhada
            let description = kitData.description || `Kit solar completo de ${kitData.potencia_kwp}kWp da NeoSolar.\n\n`;

            if (kitData.panels && kitData.panels.length > 0) {
                description += '**Painéis:**\n';
                kitData.panels.forEach(panel => {
                    description += `- ${panel.quantity}x ${panel.power_w}W ${panel.brand}\n`;
                });
                description += '\n';
            }

            if (kitData.inverters && kitData.inverters.length > 0) {
                description += '**Inversores/Controladores:**\n';
                kitData.inverters.forEach(inverter => {
                    if (inverter.brand !== 'None' && inverter.quantity > 0) {
                        description += `- ${inverter.quantity}x ${inverter.rating} ${inverter.type} ${inverter.brand}\n`;
                    }
                });
                description += '\n';
            }

            if (kitData.batteries && kitData.batteries.length > 0) {
                description += '**Baterias:**\n';
                kitData.batteries.forEach(battery => {
                    description += `- ${battery.quantity}x ${battery.capacity_ah}Ah/${battery.voltage_v}V ${battery.technology} ${battery.brand}\n`;
                });
                description += '\n';
            }

            // Estimativa de geração
            const estimatedGeneration = Math.round((kitData.potencia_kwp || 0) * 150);
            description += `**Geração Estimada:** ~${estimatedGeneration} kWh/mês\n\n`;
            description += '**Fornecedor:** NeoSolar - Distribuidor nacional de equipamentos fotovoltaicos';

            // Valores das opções
            const optionValues = {};
            options.forEach(option => {
                optionValues[option.title] = option.values[0];
            });

            // Variant
            const variant = {
                title: options.map(opt => opt.values[0]).join(' / '),
                sku: sku,
                manage_inventory: false, // Kits não gerenciam estoque
                allow_backorder: false,
                options: optionValues,
                inventory_items: inventoryItems,
                prices: prices,
                metadata: {
                    distributor: 'neosolar',
                    kit_id: kitData.id,
                    potencia_kwp: kitData.potencia_kwp,
                    total_panels: kitData.total_panels || 0,
                    total_inverters: kitData.total_inverters || 0,
                    total_batteries: kitData.total_batteries || 0,
                    estimated_generation_kwh_month: estimatedGeneration,
                    system_type: kitData.type
                }
            };

            // Product final
            const product = {
                title: title,
                subtitle: subtitle,
                handle: handle,
                description: description,
                status: kitData.status === 'published' ? 'published' : 'draft',
                is_giftcard: false,
                discountable: true,
                external_id: kitData.id,
                thumbnail: kitData.image_url,
                hs_code: '8541.40.16', // NCM para kits fotovoltaicos
                origin_country: 'CN',
                categories: categories,
                tags: tags,
                options: options,
                variants: [variant],
                images: kitData.image_url ? [{ url: kitData.image_url }] : [],
                metadata: {
                    distributor: 'neosolar',
                    product_type: 'kit',
                    is_bundle: true,
                    neosolar_specs: {
                        system_type: kitData.type,
                        potencia_kwp: kitData.potencia_kwp,
                        total_panels: kitData.total_panels || 0,
                        total_inverters: kitData.total_inverters || 0,
                        total_batteries: kitData.total_batteries || 0,
                        total_power_w: kitData.total_power_w || 0,
                        estimated_generation_kwh_month: estimatedGeneration,
                        components: {
                            panels: kitData.panels || [],
                            inverters: kitData.inverters || [],
                            batteries: kitData.batteries || []
                        },
                        pricing_per_wp: priceBrl / (kitData.potencia_kwp * 1000)
                    },
                    source_data: {
                        neosolar_id: kitData.id,
                        product_url: kitData.product_url,
                        image_url: kitData.image_url,
                        original_name: kitData.original_name || kitData.name,
                        imported_at: new Date().toISOString()
                    },
                    seo: {
                        seo_title: kitData.seo_title,
                        seo_description: kitData.seo_description,
                        search_title: kitData.search_title,
                        keywords: kitData.tags || []
                    }
                }
            };

            this.stats.processed++;
            return product;

        } catch (error) {
            console.error(`Erro convertendo kit ${kitData.id}:`, error.message);
            this.stats.errors++;
            return null;
        }
    }

    /**
     * Converte todos os kits do arquivo
     */
    convertAll() {
        console.log('🔄 Iniciando conversão NeoSolar → Medusa.js');
        console.log('='.repeat(50));

        try {
            // Ler arquivo de entrada
            const inputPath = path.join(__dirname, CONFIG.INPUT_FILE);
            if (!fs.existsSync(inputPath)) {
                throw new Error(`Arquivo não encontrado: ${inputPath}`);
            }

            const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
            console.log(`📥 Carregados ${inputData.length} kits NeoSolar`);

            // Processar kits (com limite)
            const kitsToProcess = inputData.slice(0, CONFIG.MAX_PRODUCTS);
            console.log(`🎯 Processando ${kitsToProcess.length} kits...`);

            const products = [];

            kitsToProcess.forEach((kitData, index) => {
                if (index % 10 === 0) {
                    console.log(`   Processando kit ${index + 1}/${kitsToProcess.length}...`);
                }

                const product = this.convertKit(kitData);
                if (product) {
                    products.push(product);
                }
            });

            // Salvar resultado
            const outputPath = path.join(__dirname, CONFIG.OUTPUT_FILE);
            const outputData = {
                metadata: {
                    generated_at: new Date().toISOString(),
                    version: '2.0.0',
                    medusa_version: 'v2.x',
                    source: 'NeoSolar Converter',
                    total_products: products.length
                },
                stats: this.stats,
                products: products
            };

            fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf8');

            // Relatório final
            console.log('\n' + '='.repeat(50));
            console.log('📊 CONVERSÃO CONCLUÍDA');
            console.log('='.repeat(50));
            console.log(`✅ Processados: ${this.stats.processed}`);
            console.log(`⏭️  Ignorados: ${this.stats.skipped}`);
            console.log(`❌ Erros: ${this.stats.errors}`);
            console.log(`📁 Arquivo salvo: ${outputPath}`);
            console.log('='.repeat(50));

        } catch (error) {
            console.error('❌ Erro na conversão:', error.message);
            process.exit(1);
        }
    }
}

// Executar conversão
if (require.main === module) {
    const converter = new NeoSolarConverter();
    converter.convertAll();
}

module.exports = NeoSolarConverter;
