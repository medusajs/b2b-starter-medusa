import {
    createProductCategoriesWorkflow,
    createProductsWorkflow,
} from "@medusajs/core-flows";
import {
    ExecArgs,
    IStoreModuleService,
} from "@medusajs/framework/types";
import {
    ContainerRegistrationKeys,
    ModuleRegistrationName,
    ProductStatus,
} from "@medusajs/framework/utils";
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
    dimensions_mm?: {
        length: number;
        width: number;
        thickness: number;
    };
    weight_kg?: number;
    warranty_years?: {
        product: number;
        performance: number;
    };
}

export default async function seedCatalogData({ container }: ExecArgs) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    const storeModuleService: IStoreModuleService = container.resolve(
        ModuleRegistrationName.STORE
    );

    logger.info("Starting catalog data seeding...");

    // Get the default sales channel
    const [store] = await storeModuleService.listStores();
    const defaultSalesChannel = store.default_sales_channel;

    if (!defaultSalesChannel) {
        throw new Error("No default sales channel found");
    }

    // Define catalog categories
    const categories = [
        { name: "Kits Solares", handle: "kits-solares" },
        { name: "Painéis Fotovoltaicos", handle: "paineis-fotovoltaicos" },
        { name: "Inversores", handle: "inversores" },
        { name: "Baterias", handle: "baterias" },
        { name: "Estruturas", handle: "estruturas" },
        { name: "Cabos", handle: "cabos" },
        { name: "Controladores", handle: "controladores" },
        { name: "Carregadores", handle: "carregadores" },
        { name: "Acessórios", handle: "acessorios" },
    ];

    logger.info("Creating product categories...");
    const { result: categoryResult } = await createProductCategoriesWorkflow(
        container
    ).run({
        input: {
            product_categories: categories.map(cat => ({
                name: cat.name,
                handle: cat.handle,
                is_active: true,
            })),
        },
    });

    // Function to read catalog files
    const readCatalogFile = (fileName: string): CatalogItem[] => {
        try {
            const filePath = path.join(process.cwd(), "data", "catalog", fileName);
            const data = fs.readFileSync(filePath, "utf-8");
            const parsed = JSON.parse(data);

            // Handle different file structures
            if (Array.isArray(parsed)) {
                return parsed;
            } else if (parsed.panels) {
                return parsed.panels;
            } else if (parsed.inverters) {
                return parsed.inverters;
            }
            return [];
        } catch (error) {
            logger.error(`Error reading ${fileName}:`, error);
            return [];
        }
    };

    // Function to parse price from string
    const parsePrice = (priceStr: string): number => {
        if (!priceStr) return 0;
        // Remove currency symbols and convert to number
        const cleaned = priceStr.replace(/[R$\s,]/g, "").replace(".", "");
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Function to get category ID
    const getCategoryId = (categoryName: string): string | undefined => {
        const categoryMap: { [key: string]: string } = {
            "kits": "Kits Solares",
            "panels": "Painéis Fotovoltaicos",
            "inverters": "Inversores",
            "batteries": "Baterias",
            "structures": "Estruturas",
            "cables": "Cabos",
            "controllers": "Controladores",
            "chargers": "Carregadores",
            "accessories": "Acessórios",
        };

        const mappedName = categoryMap[categoryName] || categoryName;
        return categoryResult.find(cat => cat.name === mappedName)?.id;
    };

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
        { file: "accessories.json", category: "accessories" },
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
            if (item.kwp) description += `\nPotência: ${item.kwp} kWp`;
            if (item.efficiency_pct) description += `\nEficiência: ${item.efficiency_pct}%`;
            if (item.technology) description += `\nTecnologia: ${item.technology}`;

            // Parse price
            const price = parsePrice(item.price || "");

            // Build images array
            const images: { url: string }[] = [];
            if (item.processed_images?.large) {
                images.push({ url: item.processed_images.large });
            } else if (item.image && item.image !== "/catalog/images/NEOSOLAR-KITS/neosolar_kits_27314.jpg") {
                images.push({ url: item.image });
            }

            // Create product object
            const product = {
                title,
                category_ids: [categoryId],
                description,
                status: item.availability === "Disponível" ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
                images,
                weight: item.weight_kg || 1,
                options: [
                    {
                        title: "Fabricante",
                        values: [item.manufacturer || "YSH"],
                    },
                ],
                variants: [
                    {
                        title: item.sku || item.id || title,
                        sku: item.sku || item.id || `YSH-${Date.now()}`,
                        options: {
                            Fabricante: item.manufacturer || "YSH",
                        },
                        manage_inventory: false,
                        prices: price > 0 ? [
                            {
                                amount: price,
                                currency_code: "brl",
                            },
                        ] : [],
                    },
                ],
                sales_channels: [
                    {
                        id: defaultSalesChannel.id,
                    },
                ],
                metadata: {
                    manufacturer: item.manufacturer,
                    source: item.source || "YSH Catalog",
                    original_id: item.id || item.sku,
                    category: category,
                },
            };

            allProducts.push(product);
        }
    }

    logger.info(`Creating ${allProducts.length} products...`);

    // Create products in batches to avoid memory issues
    const batchSize = 50;
    for (let i = 0; i < allProducts.length; i += batchSize) {
        const batch = allProducts.slice(i, i + batchSize);
        logger.info(`Creating products batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allProducts.length / batchSize)}...`);

        try {
            await createProductsWorkflow(container).run({
                input: {
                    products: batch,
                },
            });
        } catch (error) {
            logger.error(`Error creating batch ${Math.floor(i / batchSize) + 1}:`, error);
            // Continue with next batch
        }
    }

    logger.info("Finished seeding catalog data.");
}