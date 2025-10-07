import fs from 'fs';
import path from 'path';

/**
 * Script de Normalização e Padronização de Schemas JSON
 * 
 * Objetivo: Garantir consistência, normalização e alinhamento com Medusa.js
 * - Padronizar estrutura de campos
 * - Normalizar caminhos de imagens
 * - Validar categorias e atributos
 * - Sincronizar com imagens processadas
 */

interface ProductSchema {
    id: string;
    name: string;
    manufacturer: string;
    model?: string;
    category: string;
    subcategory?: string;
    price: string | number;
    price_brl?: number;
    image?: string;
    image_url?: string;
    source: string;
    availability?: string | boolean;
    description: string;
    processed_images?: {
        thumb?: string;
        medium?: string;
        large?: string;
        original?: string;
    };
    images_processed?: any;
    image_quality_before?: number;
    image_quality_after?: number;
    image_upscale_factor?: number;
    image_processing_priority?: number;
    processing_date?: string;
    pricing?: {
        price: number;
        currency: string;
    };
    metadata?: {
        source?: string;
        source_file?: string;
        loaded_at?: string;
        merged_from_sources?: string[];
        last_consolidated?: string;
        normalized?: boolean;
        normalized_at?: string;
        original_id?: string;
        distributor?: string;
    };
    technical_specs?: Record<string, any>;
    distributor?: string;
    power?: number;
    original_category?: string;
    specifications?: Record<string, any>;

    // Campos específicos de kits
    type?: string;
    potencia_kwp?: number;
    estrutura?: string;
    centro_distribuicao?: string;
    panels?: any[];
    inverters?: any[];
    batteries?: any[];
    structures?: any[];
    accessories?: any[];
    total_panels?: number;
    total_inverters?: number;
    total_batteries?: number;
    total_structures?: number;
    total_accessories?: number;
    total_power_w?: number;
    images?: Record<string, string>;
}

// Mapeamento de categorias válidas para Medusa.js
const VALID_CATEGORIES = {
    panels: 'Painéis Solares',
    inverters: 'Inversores',
    batteries: 'Baterias',
    kits: 'Kits Fotovoltaicos',
    'kits-hibridos': 'Kits Híbridos',
    structures: 'Estruturas de Montagem',
    cables: 'Cabos e Conectores',
    controllers: 'Controladores de Carga',
    chargers: 'Carregadores',
    ev_chargers: 'Carregadores Veiculares',
    accessories: 'Acessórios',
    stringboxes: 'String Boxes',
    posts: 'Postes e Suportes',
    pumps: 'Bombas Solares',
    stations: 'Estações de Carregamento',
    others: 'Outros'
};

function normalizePrice(price: any): { price: number; price_brl: number; currency: string } {
    let numericPrice = 0;

    if (typeof price === 'string') {
        // Remove "R$", espaços, pontos (milhares) e converte vírgula para ponto
        numericPrice = parseFloat(
            price
                .replace(/R\$\s*/g, '')
                .replace(/\./g, '')
                .replace(',', '.')
                .trim()
        );
    } else if (typeof price === 'number') {
        numericPrice = price;
    }

    return {
        price: numericPrice,
        price_brl: numericPrice,
        currency: 'BRL'
    };
}

function normalizeImagePaths(product: ProductSchema): ProductSchema {
    // Padronizar processed_images
    if (product.processed_images) {
        const normalized: any = {};

        Object.keys(product.processed_images).forEach(key => {
            if (product.processed_images![key]) {
                // Converter backslashes para forward slashes
                normalized[key] = product.processed_images![key].replace(/\\/g, '/');
            }
        });

        product.processed_images = normalized;
    }

    // Consolidar campos de imagem
    if (product.image && !product.image_url) {
        product.image_url = product.image;
    }

    if (product.image_url) {
        product.image_url = product.image_url.replace(/\\/g, '/');
    }

    // Remover images_processed duplicado
    if (product.images_processed) {
        delete product.images_processed;
    }

    return product;
}

function normalizeCategory(product: ProductSchema): ProductSchema {
    // Garantir categoria válida
    if (!VALID_CATEGORIES[product.category as keyof typeof VALID_CATEGORIES]) {
        console.warn(`Categoria inválida encontrada: ${product.category} para produto ${product.id}`);

        // Tentar inferir categoria do ID ou nome
        if (product.id.includes('panel') || product.name.toLowerCase().includes('painel')) {
            product.category = 'panels';
        } else if (product.id.includes('inverter') || product.name.toLowerCase().includes('inversor')) {
            product.category = 'inverters';
        } else if (product.id.includes('battery') || product.id.includes('bateria')) {
            product.category = 'batteries';
        } else if (product.id.includes('kit')) {
            product.category = product.type === 'kits-hibridos' ? 'kits-hibridos' : 'kits';
        } else {
            product.category = 'others';
        }
    }

    // Salvar categoria original se for diferente
    if (product.original_category && product.original_category !== product.category) {
        if (!product.metadata) product.metadata = {};
        product.metadata.original_category = product.original_category;
    }

    return product;
}

function normalizeMetadata(product: ProductSchema): ProductSchema {
    if (!product.metadata) {
        product.metadata = {};
    }

    // Garantir campos essenciais
    if (!product.metadata.normalized_at) {
        product.metadata.normalized_at = new Date().toISOString();
    }

    product.metadata.normalized = true;

    // Mover distributor para metadata se existir no root
    if (product.distributor && !product.metadata.distributor) {
        product.metadata.distributor = product.distributor;
    }

    // Mover original_id para metadata
    if ((product as any).original_id && !product.metadata.original_id) {
        product.metadata.original_id = (product as any).original_id;
        delete (product as any).original_id;
    }

    return product;
}

function normalizeAvailability(product: ProductSchema): ProductSchema {
    // Converter availability para booleano padrão
    if (product.availability !== undefined) {
        if (typeof product.availability === 'string') {
            product.availability =
                product.availability.toLowerCase() === 'disponível' ||
                product.availability.toLowerCase() === 'disponivel' ||
                product.availability.toLowerCase() === 'true' ||
                product.availability === '1';
        }
    } else {
        product.availability = true; // Assume disponível por padrão
    }

    return product;
}

function normalizeTechnicalSpecs(product: ProductSchema): ProductSchema {
    if (!product.technical_specs) {
        product.technical_specs = {};
    }

    // Migrar specifications para technical_specs
    if (product.specifications && Object.keys(product.specifications).length > 0) {
        product.technical_specs = {
            ...product.technical_specs,
            ...product.specifications
        };
        delete product.specifications;
    }

    // Extrair power para technical_specs
    if (product.power && !product.technical_specs.power_w) {
        product.technical_specs.power_w = product.power;
    }

    // Garantir power_w para painéis e inversores
    if ((product.category === 'panels' || product.category === 'inverters') &&
        !product.technical_specs.power_w) {
        // Tentar extrair do nome
        const powerMatch = product.name.match(/(\d+(?:\.\d+)?)\s*k?w/i);
        if (powerMatch) {
            const value = parseFloat(powerMatch[1]);
            product.technical_specs.power_w = powerMatch[0].toLowerCase().includes('kw') ? value * 1000 : value;
        }
    }

    return product;
}

function normalizeProduct(product: ProductSchema): ProductSchema {
    // Aplicar todas as normalizações
    product = normalizeCategory(product);
    product = normalizeImagePaths(product);
    product = normalizeAvailability(product);
    product = normalizeMetadata(product);
    product = normalizeTechnicalSpecs(product);

    // Normalizar pricing
    if (product.price) {
        const normalizedPricing = normalizePrice(product.price);
        product.pricing = normalizedPricing;
        product.price_brl = normalizedPricing.price_brl;

        // Manter price como string formatado
        if (typeof product.price !== 'string') {
            product.price = `R$ ${normalizedPricing.price.toFixed(2).replace('.', ',')}`;
        }
    }

    // Garantir campos obrigatórios
    if (!product.description) {
        product.description = product.name;
    }

    if (!product.model) {
        product.model = '';
    }

    return product;
}

async function normalizeSchemaFile(filePath: string): Promise<void> {
    console.log(`\n📄 Normalizando: ${path.basename(filePath)}`);

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const products: ProductSchema[] = JSON.parse(content);

        console.log(`   📊 Total de produtos: ${products.length}`);

        const normalized = products.map((product, index) => {
            try {
                return normalizeProduct(product);
            } catch (error) {
                console.error(`   ❌ Erro ao normalizar produto ${index} (${product.id}):`, error);
                return product;
            }
        });

        // Salvar arquivo normalizado
        fs.writeFileSync(filePath, JSON.stringify(normalized, null, 2), 'utf-8');

        console.log(`   ✅ Normalização concluída`);

        // Estatísticas
        const categories = normalized.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        console.log(`   📊 Categorias:`);
        Object.entries(categories).forEach(([cat, count]) => {
            console.log(`      - ${cat}: ${count} produtos`);
        });

    } catch (error) {
        console.error(`   ❌ Erro ao processar arquivo:`, error);
    }
}

async function main() {
    console.log('🔧 Iniciando Normalização de Schemas JSON\n');
    console.log('='.repeat(60));

    const unifiedSchemasDir = path.join(__dirname, '../data/catalog/unified_schemas');
    const enrichedSchemasDir = path.join(__dirname, '../data/catalog/schemas_enriched');

    // Processar unified_schemas
    console.log('\n📁 Processando unified_schemas...');
    const unifiedFiles = fs.readdirSync(unifiedSchemasDir)
        .filter(f => f.endsWith('.json'));

    for (const file of unifiedFiles) {
        await normalizeSchemaFile(path.join(unifiedSchemasDir, file));
    }

    // Processar schemas_enriched
    console.log('\n📁 Processando schemas_enriched...');
    const enrichedFiles = fs.readdirSync(enrichedSchemasDir)
        .filter(f => f.endsWith('.json'));

    for (const file of enrichedFiles) {
        await normalizeSchemaFile(path.join(enrichedSchemasDir, file));
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Normalização concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Revisar logs de avisos acima');
    console.log('   2. Executar script de seed do catálogo');
    console.log('   3. Verificar produtos no admin dashboard');
}

main().catch(console.error);
