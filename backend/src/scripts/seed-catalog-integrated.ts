/**
 * Script de Seed do Catálogo YSH - Integrado
 * 
 * Carrega 1.123 produtos otimizados do catálogo consolidado
 * no banco de dados Medusa.js
 */

import { MedusaContainer } from "@medusajs/framework/types";
import fs from "fs";
import path from "path";

interface Product {
    id: string;
    name: string;
    category: string;
    description?: string;
    price_brl?: number;
    pricing?: {
        price: number;
        price_brl: number;
        currency: string;
    };
    technical_specs?: Record<string, any>;
    image_url?: string;
    images?: string[];
    processed_images?: {
        thumb?: string;
        medium?: string;
        large?: string;
    };
    metadata?: Record<string, any>;
}

export default async function seedCatalog(container: MedusaContainer) {
    console.log("🌱 Iniciando seed do catálogo YSH...\n");

    const productModuleService = container.resolve("productModuleService");
    const salesChannelModuleService = container.resolve("salesChannelModuleService");
    const linkModuleService = container.resolve("linkModuleService");

    try {
        // 1. Verificar/Criar Sales Channel
        console.log("📢 Verificando Sales Channel...");
        const salesChannels = await salesChannelModuleService.list();
        let salesChannel = salesChannels.find((sc: any) => sc.name === "Default Sales Channel");

        if (!salesChannel) {
            console.log("  ➕ Criando Sales Channel padrão...");
            salesChannel = await salesChannelModuleService.create({
                name: "Default Sales Channel",
                description: "Canal de vendas B2B Yello Solar Hub",
            });
            console.log(`  ✅ Sales Channel criado: ${salesChannel.id}`);
        } else {
            console.log(`  ✅ Sales Channel existe: ${salesChannel.id}`);
        }

        // 2. Carregar catálogo consolidado
        console.log("\n📦 Carregando catálogo consolidado...");
        const catalogDir = path.join(__dirname, "..", "data", "catalog", "unified_schemas");

        if (!fs.existsSync(catalogDir)) {
            throw new Error(`Diretório de catálogo não encontrado: ${catalogDir}`);
        }

        const files = fs.readdirSync(catalogDir)
            .filter(f => f.endsWith("_unified.json") && !f.includes("backup"));

        console.log(`  📄 Encontrados ${files.length} arquivos de catálogo\n`);

        let totalProducts = 0;
        let createdProducts = 0;
        let skippedProducts = 0;
        let errors = 0;

        // 3. Processar cada categoria
        for (const file of files) {
            const category = file.replace("_unified.json", "");
            console.log(`\n📂 Processando: ${category}`);

            const filePath = path.join(catalogDir, file);
            const products: Product[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));

            console.log(`  📊 ${products.length} produtos encontrados`);
            totalProducts += products.length;

            // 4. Criar produtos
            for (const product of products) {
                try {
                    // Verificar se já existe
                    const existing = await productModuleService.list({
                        filters: { external_id: product.id },
                    });

                    if (existing.length > 0) {
                        skippedProducts++;
                        continue;
                    }

                    // Preparar dados do produto
                    const price = product.price_brl || product.pricing?.price_brl || 0;

                    const productData = {
                        external_id: product.id,
                        title: product.name,
                        description: product.description || `${product.name} - Categoria: ${category}`,
                        handle: product.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                        is_giftcard: false,
                        discountable: true,
                        options: [
                            {
                                title: "Padrão",
                                values: ["Padrão"],
                            },
                        ],
                        variants: [
                            {
                                title: "Padrão",
                                sku: product.id,
                                manage_inventory: false,
                                prices: [
                                    {
                                        amount: Math.round(price * 100), // Converter para centavos
                                        currency_code: "brl",
                                    },
                                ],
                            },
                        ],
                        images: product.image_url
                            ? [{ url: product.image_url }]
                            : product.images?.map((url) => ({ url })) || [],
                        metadata: {
                            category: product.category,
                            technical_specs: product.technical_specs || {},
                            processed_images: product.processed_images || {},
                            normalized: product.metadata?.normalized || false,
                            ...product.metadata,
                        },
                    };

                    // Criar produto
                    const createdProduct = await productModuleService.create(productData);

                    // Associar ao Sales Channel
                    await linkModuleService.create({
                        productService: {
                            product_id: createdProduct.id,
                        },
                        salesChannelService: {
                            sales_channel_id: salesChannel.id,
                        },
                    });

                    createdProducts++;

                    if (createdProducts % 50 === 0) {
                        console.log(`  ✅ ${createdProducts} produtos criados...`);
                    }
                } catch (error) {
                    errors++;
                    console.error(`  ❌ Erro ao criar produto ${product.id}:`, error.message);
                }
            }

            console.log(`  ✅ Categoria ${category} concluída`);
        }

        // 5. Resumo final
        console.log("\n" + "=".repeat(50));
        console.log("📊 RESUMO DO SEED");
        console.log("=".repeat(50));
        console.log(`\n✅ Total de produtos processados: ${totalProducts}`);
        console.log(`✅ Produtos criados: ${createdProducts}`);
        console.log(`⏭️  Produtos já existentes: ${skippedProducts}`);
        console.log(`❌ Erros: ${errors}`);
        console.log(`📢 Sales Channel: ${salesChannel.id}`);
        console.log("\n✅ Seed concluído com sucesso!\n");

    } catch (error) {
        console.error("\n❌ Erro no seed:", error);
        throw error;
    }
}
