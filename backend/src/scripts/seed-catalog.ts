import {
    ExecArgs,
    IProductModuleService,
    IStoreModuleService,
    ProductStatus,
} from "@medusajs/framework/types";

import { createProductCategoriesWorkflow, createProductsWorkflow } from "@medusajs/core-flows";
import * as fs from "fs";
import * as path from "path";

interface CatalogItem {
    id?: string;
    sku?: string;
    name?: string;
    manufacturer?: string;
    category?: string;
    price?: string;
    image?: string;
    description?: string;
    availability?: string;
    processed_images?: {
        thumb?: string;
        medium?: string;
        large?: string;
    };
    model?: string;
    technology?: string;
    kwp?: number;
    cells?: number;
    efficiency_pct?: number;
    dimensions?: {
        length: number;
        width: number;
        thickness: number;
    };
    weight_kg?: number;
    source?: string;
}

const parsePrice = (priceStr: string): number => {
    if (!priceStr) return 0;
    const cleaned = priceStr.replace(/[^\d.,]/g, "").replace(",", ".");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

const readCatalogFile = (fileName: string): CatalogItem[] => {
    const filePath = path.join(__dirname, "../../../data/catalog", fileName);
    if (!fs.existsSync(filePath)) {
        console.warn(`Arquivo ${fileName} nao encontrado`);
        return [];
    }

    try {
        const data = fs.readFileSync(filePath, "utf-8");
        const parsed = JSON.parse(data);

        // Handle different JSON structures
        if (Array.isArray(parsed)) {
            return parsed;
        } else if (parsed && typeof parsed === "object") {
            // Check for nested arrays in common keys
            for (const key of Object.keys(parsed)) {
                if (Array.isArray(parsed[key])) {
                    return parsed[key];
                }
            }
            // If no array found, wrap in array
            return [parsed];
        }

        return [];
    } catch (error) {
        console.error(`Erro ao ler ${fileName}:`, error);
        return [];
    }
};

const categoryMap: Record<string, string> = {
    "accessories": "Acessorios",
    "kits": "Kits Solares",
    "panels": "Paineis Fotovoltaicos",
    "inverters": "Inversores",
    "batteries": "Baterias",
    "structures": "Estruturas",
    "cables": "Cabos",
    "controllers": "Controladores",
    "chargers": "Carregadores"
};

const getCategoryId = (categoryName: string): string | undefined => {
    const mappedName = categoryMap[categoryName] || categoryName;
    // This would need to be implemented to find category by name
    // For now, return undefined and handle in calling code
    return undefined;
};

export default async function seedCatalog({ container }: ExecArgs) {
    const logger = container.resolve("logger");
    const productService = container.resolve("productService");
    const categoryService = container.resolve("categoryService");
    const storeService = container.resolve("storeService");

    logger.info("Starting catalog seeding...");

    // Create categories
    const categories = [
        { name: "Kits Solares", handle: "kits" },
        { name: "Paineis Fotovoltaicos", handle: "panels" },
        { name: "Inversores", handle: "inverters" },
        { name: "Baterias", handle: "batteries" },
        { name: "Estruturas", handle: "structures" },
        { name: "Cabos", handle: "cables" },
        { name: "Controladores", handle: "controllers" },
        { name: "Carregadores", handle: "chargers" },
        { name: "Acessorios", handle: "accessories" }
    ];

    const createdCategories: any[] = [];
    for (const category of categories) {
        try {
            const result = await createProductCategoriesWorkflow(container).run({
                input: { product_categories: [category] }
            });
            createdCategories.push(result);
            logger.info(`Created category: ${category.name}`);
        } catch (error) {
            logger.warn(`Category ${category.name} might already exist`);
        }
    }

    // Read all catalog files
    const catalogFiles = [
        { file: "kits.json", category: "kits" },
        { file: "panels.json", category: "panels" },
        { file: "inverters.json", category: "inverters" },
        { file: "batteries.json", category: "batteries" },
        { file: "structures.json", category: "structures" },
        { file: "cables.json", category: "cables" },
        { file: "controllers.json", category: "controllers" },
        { file: "chargers.json", category: "chargers" },
        { file: "accessories.json", category: "accessories" }
    ];

    const allProducts: any[] = [];

    for (const { file, category } of catalogFiles) {
        logger.info(`Processing ${file}...`);
        const items = readCatalogFile(file);

        for (const item of items) {
            const categoryId = getCategoryId(category);
            if (!categoryId) continue;

            // Build product title
            const title = item.name || item.model || `${item.manufacturer} ${item.id || item.sku}`;

            // Build description
            let description = item.description || "";
            if (item.kwp) description += `\nPotencia: ${item.kwp} kWp`;
            if (item.efficiency_pct) description += `\nEficiencia: ${item.efficiency_pct}%`;
            if (item.technology) description += `\nTecnologia: ${item.technology}`;

            // Create product object
            const price = parsePrice(item.price || "");

            const images: { url: string }[] = [];
            if (item.processed_images?.large) {
                images.push({ url: item.processed_images.large });
            } else if (item.image && item.image !== "/catalog/images/NEOSOLAR-KITS/neosolar_kits_27314.jpg") {
                images.push({ url: item.image });
            }

            const product = {
                title,
                description,
                category_ids: [categoryId],
                status: item.availability === "Disponivel" ? "published" : "draft",
                images,
                options: [{
                    title: "Fabricante",
                    values: [item.manufacturer || "YSH"]
                }],
                variants: [{
                    title: item.sku || item.id || title,
                    sku: item.sku || item.id || `YSH-${Date.now()}`,
                    prices: price > 0 ? [{
                        amount: price,
                        currency_code: "brl"
                    }] : [],
                    options: {
                        Fabricante: item.manufacturer || "YSH"
                    },
                    weight: item.weight_kg || 1,
                    manage_inventory: false,
                    metadata: {
                        source: item.source || "YSH Catalog",
                        original_id: item.id || item.sku
                    }
                }]
            };

            allProducts.push(product);
        }
    }

    logger.info(`Creating ${allProducts.length} products...`);

    // Create products in batches
    const batchSize = 50;
    let totalProducts = 0;

    for (let i = 0; i < allProducts.length; i += batchSize) {
        const batch = allProducts.slice(i, i + batchSize);
        logger.info(`Creating products batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allProducts.length / batchSize)}...`);

        try {
            await createProductsWorkflow(container).run({
                input: {
                    products: batch
                }
            });
            totalProducts += batch.length;
            logger.info(`Created batch of ${batch.length} products`);
        } catch (error) {
            logger.error(`Error creating batch ${Math.floor(i / batchSize) + 1}:`, error);
        }
    }

    logger.info(`Finished seeding catalog data. Created ${totalProducts} products.`);
}
