import {import {
    import {

        ExecArgs, import {

            IProductModuleService,

            IProductCategoryModuleService, ExecArgs, import {

                IStoreModuleService,

                ContainerRegistrationKeys, IProductModuleService,

                ModuleRegistrationName,

                ProductStatus, IProductCategoryModuleService, ExecArgs,

            } from "@medusajs/framework/types";

            IStoreModuleService,

            import { createProductCategoriesWorkflow, createProductsWorkflow } from "@medusajs/core-flows";

            import * as fs from "fs"; ContainerRegistrationKeys, IProductModuleService, ExecArgs, createProductCategoriesWorkflow,

            import * as path from "path";

            ModuleRegistrationName,

            interface CatalogItem {

    id ?: string; ProductStatus, IProductCategoryModuleService,

        sku ?: string;

    name ?: string;
} from "@medusajs/framework/types";

manufacturer ?: string;

category ?: string; IStoreModuleService, IProductModuleService, createProductsWorkflow,

    price ?: string;

image ?: string; import { createProductCategoriesWorkflow, createProductsWorkflow } from "@medusajs/core-flows";

description ?: string;

availability ?: string; import * as fs from "fs";

processed_images ?: {} from "@medusajs/framework/types";

thumb ?: string;

medium ?: string; import * as path from "path";

large ?: string;

  }; import {

    model?: string;

    technology?: string; interface CatalogItem {

        kwp?: number; IProductCategoryModuleService,

        cells?: number;

        efficiency_pct?: number; id?: string;

        dimensions_mm?: {

            length: number; sku?: string; ContainerRegistrationKeys,

            width: number;

            thickness: number; name?: string;

        };
    } from "@medusajs/core-flows";

weight_kg ?: number;

warranty_years ?: {
    manufacturer?: string;

    product: number;

    performance: number; category?: string; ModuleRegistrationName,

};

}    price ?: string;



export default async function seedCatalogData({ container }: ExecArgs) {
    image ?: string; ProductStatus, IStoreModuleService, import {

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    const storeModuleService: IStoreModuleService = container.resolve(description ?: string;

    ModuleRegistrationName.STORE

  ); availability ?: string;

} from "@medusajs/framework/utils";

logger.info("Starting catalog data seeding...");

processed_images ?: {

    // Get the default sales channel

    const [store] = await storeModuleService.listStores(); thumb?: string; import * as fs from "fs";

    const defaultSalesChannel = store.default_sales_channel;

    medium?: string;

    if(!defaultSalesChannel) { } from "@medusajs/framework/types"; ExecArgs,

    throw new Error("No default sales channel found");

}    large ?: string;



// Define catalog categories  }; import * as path from "path";

const categories = [

    { name: "Kits Solares", handle: "kits-solares" }, model ?: string;

{ name: "Painéis Fotovoltaicos", handle: "paineis-fotovoltaicos" },

{ name: "Inversores", handle: "inversores" }, technology ?: string; import {

    { name: "Baterias", handle: "baterias" },

    { name: "Estruturas", handle: "estruturas" }, kwp ?: number;

{ name: "Cabos", handle: "cabos" },

{ name: "Controladores", handle: "controladores" }, cells ?: number; interface CatalogItem {

    { name: "Carregadores", handle: "carregadores" },

{ name: "Acessórios", handle: "acessorios" }, efficiency_pct ?: number; IStoreModuleService,

  ];

dimensions_mm ?: {

    logger.info("Creating product categories...");

    const { result: categoryResult } = await createProductCategoriesWorkflow(length: number; id?: string;

    container

  ).run({
        width: number;

        input: {

            product_categories: categories.map(cat => ({
                thickness: number; sku?: string; ContainerRegistrationKeys,

                name: cat.name,

                handle: cat.handle,
            };

            is_active: true,

        })), weight_kg?: number; name?: string;

},

  }); warranty_years ?: {} from "@medusajs/framework/types";



// Function to read catalog files        product: number;

const readCatalogFile = (fileName: string): CatalogItem[] => {

    try {
        performance: number; manufacturer ?: string;

        const filePath = path.join(process.cwd(), "..", "..", "data", "catalog", fileName);

        const data = fs.readFileSync(filePath, "utf-8");
    };

    const parsed = JSON.parse(data);

}category ?: string; ModuleRegistrationName,import {

      // Handle different file structures

      if (Array.isArray(parsed)) {

    return parsed;

} else if (parsed.panels) {
    export default async function seedCatalogData({ container }: ExecArgs) {

        return parsed.panels; price ?: string;

    } else if (parsed.inverters) {

        return parsed.inverters; const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    }

    return []; const storeModuleService: IStoreModuleService = container.resolve(image ?: string; ProductStatus, ContainerRegistrationKeys,

    } catch (error) {

    logger.error(`Error reading ${fileName}:`, error); ModuleRegistrationName.STORE

    return [];

}  ); description ?: string;

  };



// Function to parse price from string

const parsePrice = (priceStr: string): number => {
    logger.info("Starting catalog data seeding..."); availability ?: string;

    if (!priceStr) return 0;

    // Remove currency symbols and convert to number    } from "@medusajs/framework/utils"; ModuleRegistrationName,

    const cleaned = priceStr.replace(/[R$\s,]/g, "").replace(".", "");

    const parsed = parseFloat(cleaned);  // Get the default sales channel

    return isNaN(parsed) ? 0 : parsed;

}; const [store] = await storeModuleService.listStores(); processed_images ?: {



    // Function to get category ID    const defaultSalesChannel = store.default_sales_channel;

    const getCategoryId = (categoryName: string): string | undefined => {

        const categoryMap: { [key: string]: string } = {
            thumb?: string; import * as fs from "fs"; ProductStatus,

            "kits": "Kits Solares",

            "panels": "Painéis Fotovoltaicos", if(!defaultSalesChannel) {

                "inverters": "Inversores",

                    "batteries": "Baterias",        throw new Error("No default sales channel found"); medium ?: string;

                "structures": "Estruturas",

                    "cables": "Cabos",    }

      "controllers": "Controladores",

            "chargers": "Carregadores", large?: string; import * as path from "path";

            "accessories": "Acessórios",

        };    // Define catalog categories    } from "@medusajs/framework/utils";



        const mappedName = categoryMap[categoryName] || categoryName; const categories = [

    return categoryResult.find(cat => cat.name === mappedName)?.id;

    };        { name: "Kits Solares", handle: "kits-solares" },  };



// Read all catalog files{ name: "Painéis Fotovoltaicos", handle: "paineis-fotovoltaicos" },

const catalogFiles = [

    { file: "kits.json", category: "kits" }, { name: "Inversores", handle: "inversores" }, model ?: string; import * as fs from "fs";

{ file: "panels.json", category: "panels" },

{ file: "inverters.json", category: "inverters" }, { name: "Baterias", handle: "baterias" },

{ file: "batteries.json", category: "batteries" },

{ file: "structures.json", category: "structures" }, { name: "Estruturas", handle: "estruturas" }, technology ?: string;

{ file: "cables.json", category: "cables" },

{ file: "controllers.json", category: "controllers" }, { name: "Cabos", handle: "cabos" },

{ file: "chargers.json", category: "chargers" },

{ file: "accessories.json", category: "accessories" }, { name: "Controladores", handle: "controladores" }, kwp ?: number; interface CatalogItem {import * as path from "path";

  ];

{ name: "Carregadores", handle: "carregadores" },

const allProducts: any[] = [];

{ name: "Acessórios", handle: "acessorios" }, cells ?: number;

for (const { file, category } of catalogFiles) {

    logger.info(`Processing ${file}...`);  ];

    const items = readCatalogFile(file);

    efficiency_pct ?: number; id ?: string;

    for (const item of items.slice(0, 10)) { // Limit to 10 items per category for testing

        const categoryId = getCategoryId(category); logger.info("Creating product categories...");

        if (!categoryId) continue;

        const { result: categoryResult } = await createProductCategoriesWorkflow(dimensions_mm ?: {

            // Build product title

            const title = item.name || item.model || `${item.manufacturer} ${item.id || item.sku}`; container



      // Build description  ).run({ length: number; sku?: string; interface CatalogItem {

      let description = item.description || "";

            if(item.kwp) description += `\nPotência: ${item.kwp} kWp`; input: {

                if (item.efficiency_pct) description += `\nEficiência: ${item.efficiency_pct}%`;

                if (item.technology) description += `\nTecnologia: ${item.technology}`; product_categories: categories.map(cat => ({

                    width: number;

                    // Parse price

                    const price = parsePrice(item.price || ""); name: cat.name,



                    // Build images array                handle: cat.handle, thickness: number; name?: string; id?: string;

                    const images: { url: string }[] = [];

                if (item.processed_images?.large) {
                    is_active: true,

                        images.push({ url: item.processed_images.large });

                } else if (item.image && item.image !== "/catalog/images/NEOSOLAR-KITS/neosolar_kits_27314.jpg") { })),

                images.push({ url: item.image });
            };

    }

},

// Create product object

const product = {}); weight_kg ?: number; manufacturer ?: string; sku ?: string;

title,

    category_ids: [categoryId],

        description,

        status: item.availability === "Disponível" ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,// Function to read catalog fileswarranty_years ?: {

            images,

            weight: item.weight_kg || 1,const readCatalogFile = (fileName: string): CatalogItem[] => {

                options: [

                    {
                        try {

                            title: "Fabricante", product: number; category?: string; name?: string;

                            values: [item.manufacturer || "YSH"],

                        }, const filePath = path.join(process.cwd(), "..", "..", "data", "catalog", fileName);

        ],

                    variants: [        const data = fs.readFileSync(filePath, "utf-8"); performance: number;

                {

                    title: item.sku || item.id || title,        const parsed = JSON.parse(data);

                    sku: item.sku || item.id || `YSH-${Date.now()}`,

                        options: { }; price ?: string; manufacturer ?: string;

                    Fabricante: item.manufacturer || "YSH",

            },    // Handle different file structures

                manage_inventory: false,

                    prices: price > 0 ? [    if (Array.isArray(parsed)) { }

                {

                    amount: price,    return parsed;

                    currency_code: "brl",

              },
            } else if (parsed.panels) {

            ] : [], image ?: string; category ?: string;

            },

        ], return parsed.panels;

sales_channels: [

    {} else if (parsed.inverters) {

        id: defaultSalesChannel.id,    export default async function seedCatalogData({ container }: ExecArgs) {

        },

        ], return parsed.inverters;

        metadata: {

            manufacturer: item.manufacturer,    } const logger = container.resolve(ContainerRegistrationKeys.LOGGER); description ?: string; price ?: string;

        source: item.source || "YSH Catalog",

            original_id: item.id || item.sku,    return [];

        category: category,

        },} catch (error) {

}; const productService: IProductModuleService = container.resolve(



    allProducts.push(product); logger.error(`Error reading ${fileName}:`, error);

    }

  }    return []; ModuleRegistrationName.PRODUCT    availability ?: string; image ?: string;



logger.info(`Creating ${allProducts.length} products...`);}



// Create products in batches to avoid memory issues  };  );

const batchSize = 50;

for (let i = 0; i < allProducts.length; i += batchSize) {

    const batch = allProducts.slice(i, i + batchSize);

    logger.info(`Creating products batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allProducts.length / batchSize)}...`);// Function to parse price from string    const categoryService: IProductCategoryModuleService = container.resolve(processed_images ?: {



    try {
        const parsePrice = (priceStr: string): number => {

            await createProductsWorkflow(container).run({

                input: {
                    if(!priceStr) return 0; ModuleRegistrationName.PRODUCT_CATEGORY        description?: string;

                    products: batch,

                },    // Remove currency symbols and convert to number

            });

        } catch (error) {
            const cleaned = priceStr.replace(/[R$\s,]/g, "").replace(".", "");  );

            logger.error(`Error creating batch ${Math.floor(i / batchSize) + 1}:`, error);

            // Continue with next batch    const parsed = parseFloat(cleaned);

        }

    }    return isNaN(parsed) ? 0 : parsed; const storeModuleService: IStoreModuleService = container.resolve(thumb ?: string; availability ?: string;



    logger.info("Finished seeding catalog data.");
};

}
ModuleRegistrationName.STORE

// Function to get category ID

const getCategoryId = (categoryName: string): string | undefined => {  ); medium ?: string; processed_images ?: {

    const categoryMap: { [key: string]: string } = {

        "kits": "Kits Solares",

            "panels": "Painéis Fotovoltaicos",

                "inverters": "Inversores", logger.info("Starting catalog data seeding..."); large ?: string; thumb ?: string;

        "batteries": "Baterias",

            "structures": "Estruturas",

                "cables": "Cabos",

                    "controllers": "Controladores",        // Get the default sales channel        }; medium?: string;

                        "chargers": "Carregadores",

                            "accessories": "Acessórios",        const [store] = await storeModuleService.listStores();

    };

    const defaultSalesChannel = store.default_sales_channel; model ?: string; large ?: string;

    const mappedName = categoryMap[categoryName] || categoryName;

    return categoryResult.find(cat => cat.name === mappedName)?.id;

};

if (!defaultSalesChannel) {

    // Read all catalog files            technology ?: string;

    const catalogFiles = [

        { file: "kits.json", category: "kits" },            throw new Error("No default sales channel found");

    { file: "panels.json", category: "panels" },
};

{ file: "inverters.json", category: "inverters" },

{ file: "batteries.json", category: "batteries" },    }

{ file: "structures.json", category: "structures" },

{ file: "cables.json", category: "cables" }, kwp ?: number; model ?: string;

{ file: "controllers.json", category: "controllers" },

{ file: "chargers.json", category: "chargers" },    // Define catalog categories

{ file: "accessories.json", category: "accessories" },

  ]; const categories = [cells ?: number; technology ?: string;



const allProducts: any[] = []; { name: "Kits Solares", handle: "kits-solares" },



for (const { file, category } of catalogFiles) {
    { name: "Painéis Fotovoltaicos", handle: "paineis-fotovoltaicos" }, efficiency_pct ?: number; kwp ?: number;

    logger.info(`Processing ${file}...`);

    const items = readCatalogFile(file); { name: "Inversores", handle: "inversores" },



    for (const item of items.slice(0, 10)) { // Limit to 10 items per category for testing    { name: "Baterias", handle: "baterias" }, dimensions_mm ?: {

        const categoryId = getCategoryId(category);

        if (!categoryId) continue; { name: "Estruturas", handle: "estruturas" }, cells ?: number;



        // Build product title    { name: "Cabos", handle: "cabos" },

        const title = item.name || item.model || `${item.manufacturer} ${item.id || item.sku}`;

        { name: "Controladores", handle: "controladores" }, length: number; efficiency_pct ?: number;

        // Build description

        let description = item.description || ""; { name: "Carregadores", handle: "carregadores" },

        if (item.kwp) description += `\nPotência: ${item.kwp} kWp`;

        if (item.efficiency_pct) description += `\nEficiência: ${item.efficiency_pct}%`; { name: "Acessórios", handle: "acessorios" }, width: number; dimensions_mm ?: {

            if(item.technology) description += `\nTecnologia: ${item.technology}`;

  ];

        // Parse price

        const price = parsePrice(item.price || ""); thickness: number; length: number;



        // Build images array        logger.info("Creating product categories...");

        const images: { url: string }[] = [];

        if (item.processed_images?.large) {
            const createdCategories = [];

            images.push({ url: item.processed_images.large });
        }; width: number;

    } else if (item.image && item.image !== "/catalog/images/NEOSOLAR-KITS/neosolar_kits_27314.jpg") {

        images.push({ url: item.image }); for (const cat of categories) {

        }

        try {

            // Create product object            weight_kg ?: number; thickness: number;

            const product = {

                title, const existing = await categoryService.listProductCategories({

                    category_ids: [categoryId],

                    description, handle: cat.handle, warranty_years?: {};

                    status: item.availability === "Disponível" ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,

                    images,
                });

                weight: item.weight_kg || 1,

                options: [            if(existing.length === 0) {

          {
                product: number; weight_kg ?: number;

                title: "Fabricante",

                    values: [item.manufacturer || "YSH"],                const category = await categoryService.createProductCategories({

                    },

        ], name: cat.name, performance: number; warranty_years ?: {

                    variants: [

                        {
                            handle: cat.handle,

                            title: item.sku || item.id || title,

                            sku: item.sku || item.id || `YSH-${Date.now()}`, is_active: true,

                            options: {}; product: number;

                            Fabricante: item.manufacturer || "YSH",

                        },                });

                manage_inventory: false,

                    prices: price > 0 ? [createdCategories.push(category);

                    {} performance: number;

                        amount: price,

                        currency_code: "brl", logger.info(`Created category: ${cat.name}`);

              },

            ] : [],        } else { };

    },

        ], createdCategories.push(existing[0]);

    sales_channels: [

        {} export default async function seedCatalogData({ container }: ExecArgs) { }

    id: defaultSalesChannel.id,

          },} catch (error) {

        ],

    metadata: {
        logger.error(`Error creating category ${cat.name}:`, error); const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

        manufacturer: item.manufacturer,

            source: item.source || "YSH Catalog",}

    original_id: item.id || item.sku,

        category: category,  } const productService: IProductModuleService = container.resolve(export default async function seedCatalogData({ container }: ExecArgs) {

        },

      };



allProducts.push(product);    // Function to read catalog files    ModuleRegistrationName.PRODUCT    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

    }

  }    const readCatalogFile = (fileName: string): CatalogItem[] => {



    logger.info(`Creating ${allProducts.length} products...`); try {  ); const storeModuleService: IStoreModuleService = container.resolve(



  // Create products in batches to avoid memory issues      const filePath = path.join(process.cwd(), "..", "..", "data", "catalog", fileName);

  const batchSize = 50;

        for (let i = 0; i < allProducts.length; i += batchSize) {
            const data = fs.readFileSync(filePath, "utf-8"); const categoryService: IProductCategoryModuleService = container.resolve(ModuleRegistrationName.STORE

    const batch = allProducts.slice(i, i + batchSize);

            logger.info(`Creating products batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allProducts.length / batchSize)}...`); const parsed = JSON.parse(data);



            try {
                ModuleRegistrationName.PRODUCT_CATEGORY);

                await createProductsWorkflow(container).run({

                    input: {            // Handle different file structures

                        products: batch,

                    }, if(Array.isArray(parsed)) {  );

                });

            } catch (error) {
                return parsed;

                logger.error(`Error creating batch ${Math.floor(i / batchSize) + 1}:`, error);

                // Continue with next batch            } else if (parsed.panels) {

            } const storeModuleService: IStoreModuleService = container.resolve(logger.info("Starting catalog data seeding...");

        }

        return parsed.panels;

        logger.info("Finished seeding catalog data.");

    }            } else if (parsed.inverters) {
        ModuleRegistrationName.STORE

        return parsed.inverters;

    }  );    // Get the default sales channel

return [];

        } catch (error) {
    const [store] = await storeModuleService.listStores();

    logger.error(`Error reading ${fileName}:`, error);

    return []; logger.info("Starting catalog data seeding..."); const defaultSalesChannel = store.default_sales_channel;

}

    };



// Function to parse price from string    // Get the default sales channel    if (!defaultSalesChannel) {

const parsePrice = (priceStr: string): number => {

    if (!priceStr) return 0; const [store] = await storeModuleService.listStores(); throw new Error("No default sales channel found");

    // Remove currency symbols and convert to number

    const cleaned = priceStr.replace(/[R$\s,]/g, "").replace(".", ""); const defaultSalesChannel = store.default_sales_channel;

    const parsed = parseFloat(cleaned);
}

return isNaN(parsed) ? 0 : parsed;

};



// Function to get category IDif (!defaultSalesChannel) {    // Define catalog categories

const getCategoryId = (categoryName: string): string | undefined => {

    const categoryMap: { [key: string]: string } = {
        throw new Error("No default sales channel found"); const categories = [

            "kits": "Kits Solares",

            "panels": "Painéis Fotovoltaicos",  } { name: "Kits Solares", handle: "kits-solares" },

    "inverters": "Inversores",

        "batteries": "Baterias", { name: "Painéis Fotovoltaicos", handle: "paineis-fotovoltaicos" },

            "structures": "Estruturas",

                "cables": "Cabos",// Define catalog categories        { name: "Inversores", handle: "inversores" },

                    "controllers": "Controladores",

                        "chargers": "Carregadores",const categories = [{ name: "Baterias", handle: "baterias" },

                            "accessories": "Acessórios",

    }; { name: "Kits Solares", handle: "kits-solares" }, { name: "Estruturas", handle: "estruturas" },



const mappedName = categoryMap[categoryName] || categoryName; { name: "Painéis Fotovoltaicos", handle: "paineis-fotovoltaicos" }, { name: "Cabos", handle: "cabos" },

return createdCategories.find(cat => cat.name === mappedName)?.id;

  }; { name: "Inversores", handle: "inversores" }, { name: "Controladores", handle: "controladores" },



// Read all catalog files{ name: "Baterias", handle: "baterias" }, { name: "Carregadores", handle: "carregadores" },

const catalogFiles = [

    { file: "kits.json", category: "kits" }, { name: "Estruturas", handle: "estruturas" }, { name: "Acessórios", handle: "acessorios" },

    { file: "panels.json", category: "panels" },

    { file: "inverters.json", category: "inverters" }, { name: "Cabos", handle: "cabos" },];

{ file: "batteries.json", category: "batteries" },

{ file: "structures.json", category: "structures" }, { name: "Controladores", handle: "controladores" },

{ file: "cables.json", category: "cables" },

{ file: "controllers.json", category: "controllers" }, { name: "Carregadores", handle: "carregadores" }, logger.info("Creating product categories...");

{ file: "chargers.json", category: "chargers" },

{ file: "accessories.json", category: "accessories" }, { name: "Acessórios", handle: "acessorios" }, const { result: categoryResult } = await createProductCategoriesWorkflow(

  ];

  ]; container

let totalProducts = 0;

    ).run({

    for(const { file, category } of catalogFiles) {

        logger.info(`Processing ${file}...`); logger.info("Creating product categories..."); input: {

            const items = readCatalogFile(file);

            const createdCategories = []; product_categories: categories.map(cat => ({

                for(const item of items.slice(0, 5)) { // Limit to 5 items per category for testing

                const categoryId = getCategoryId(category); for(const cat of categories) {

                    if (!categoryId) continue; name: cat.name,



      // Build product title    try {

      const title = item.name || item.model || `${item.manufacturer} ${item.id || item.sku}`; handle: cat.handle,



                        // Build description      const existing = await categoryService.listProductCategories({

                        let description = item.description || ""; is_active: true,

      if (item.kwp) description += `\nPotência: ${item.kwp} kWp`;

                    if (item.efficiency_pct) description += `\nEficiência: ${item.efficiency_pct}%`; handle: cat.handle,

      if (item.technology) description += `\nTecnologia: ${item.technology}`;
                })),



      // Parse price      });        },

      const price = parsePrice(item.price || "");

if (existing.length === 0) { });

// Build images array

const images: { url: string }[] = []; const category = await categoryService.createProductCategories({

    if(item.processed_images?.large) {

        images.push({ url: item.processed_images.large }); name: cat.name,    // Function to read catalog files

      } else if (item.image && item.image !== "/catalog/images/NEOSOLAR-KITS/neosolar_kits_27314.jpg") {

    images.push({ url: item.image }); handle: cat.handle, const readCatalogFile = (fileName: string): CatalogItem[] => {

    }

    is_active: true,        try {

        try {

            const product = await productService.createProducts({}); const filePath = path.join(process.cwd(), "data", "catalog", fileName);

            title,

                category_ids: [categoryId], createdCategories.push(category); const data = fs.readFileSync(filePath, "utf-8");

            description,

                status: item.availability === "Disponível" ? ProductStatus.PUBLISHED : ProductStatus.DRAFT, logger.info(`Created category: ${cat.name}`); const parsed = JSON.parse(data);

            images,

                weight: item.weight_kg || 1,      } else {

            options: [

                {
                    createdCategories.push(existing[0]);            // Handle different file structures

                    title: "Fabricante",

                    values: [item.manufacturer || "YSH"],
                } if (Array.isArray(parsed)) {

                },

          ],
        } catch (error) {

            variants: [    return parsed;

            {

                title: item.sku || item.id || title, logger.error(`Error creating category ${cat.name}:`, error);

                sku: item.sku || item.id || `YSH-${Date.now()}`,} else if (parsed.panels) {

                    options: {

                        Fabricante: item.manufacturer || "YSH",} return parsed.panels;

                },

            manage_inventory: false,  }
    } else if (parsed.inverters) {

        prices: price > 0 ? [

            {
                return parsed.inverters;

                amount: price,

                raw_amount: price,    // Function to read catalog files            }

                currency_code: "brl",

            },    const readCatalogFile = (fileName: string): CatalogItem[] => {

              ] : [],        return [];

    },

          ], try { } catch (error) {

        sales_channels: [

            {
                const filePath = path.join(process.cwd(), "..", "..", "data", "catalog", fileName); logger.error(`Error reading ${fileName}:`, error);

                id: defaultSalesChannel.id,

            },            const data = fs.readFileSync(filePath, "utf-8"); return [];

          ],

        metadata: {
            const parsed = JSON.parse(data);

            manufacturer: item.manufacturer,        }

        source: item.source || "YSH Catalog",

            original_id: item.id || item.sku,    };

    category: category,

          },    // Handle different file structures

        });

if (Array.isArray(parsed)) {    // Function to parse price from string

    totalProducts++;

    logger.info(`Created product: ${title}`); return parsed; const parsePrice = (priceStr: string): number => {

    } catch (error) {

        logger.error(`Error creating product ${title}:`, error);
    } else if (parsed.panels) {

    } if (!priceStr) return 0;

}

  }            return parsed.panels;        // Remove currency symbols and convert to number



logger.info(`Finished seeding catalog data. Created ${totalProducts} products.`);        } else if (parsed.inverters) {

} const cleaned = priceStr.replace(/[R$\s,]/g, "").replace(".", "");

return parsed.inverters; const parsed = parseFloat(cleaned);

        } return isNaN(parsed) ? 0 : parsed;

return [];
    };

} catch (error) {

    logger.error(`Error reading ${fileName}:`, error);    // Function to get category ID

    return []; const getCategoryId = (categoryName: string): string | undefined => {

    }        const categoryMap: { [key: string]: string } = {

    }; "kits": "Kits Solares",

        "panels": "Painéis Fotovoltaicos",

  // Function to parse price from string            "inverters": "Inversores",

  const parsePrice = (priceStr: string): number => {
        "batteries": "Baterias",

    if (!priceStr) return 0; "structures": "Estruturas",

    // Remove currency symbols and convert to number            "cables": "Cabos",

    const cleaned = priceStr.replace(/[R$\s,]/g, "").replace(".", ""); "controllers": "Controladores",

    const parsed = parseFloat(cleaned); "chargers": "Carregadores",

    return isNaN(parsed) ? 0 : parsed; "accessories": "Acessórios",

  };
};



// Function to get category ID        const mappedName = categoryMap[categoryName] || categoryName;

const getCategoryId = (categoryName: string): string | undefined => {
    return categoryResult.find(cat => cat.name === mappedName)?.id;

    const categoryMap: { [key: string]: string } = {};

    "kits": "Kits Solares",

        "panels": "Painéis Fotovoltaicos",    // Read all catalog files

            "inverters": "Inversores",    const catalogFiles = [

                "batteries": "Baterias", { file: "kits.json", category: "kits" },

                "structures": "Estruturas", { file: "panels.json", category: "panels" },

                "cables": "Cabos", { file: "inverters.json", category: "inverters" },

                "controllers": "Controladores", { file: "batteries.json", category: "batteries" },

                "chargers": "Carregadores", { file: "structures.json", category: "structures" },

                "accessories": "Acessórios", { file: "cables.json", category: "cables" },

    }; { file: "controllers.json", category: "controllers" },

{ file: "chargers.json", category: "chargers" },

const mappedName = categoryMap[categoryName] || categoryName; { file: "accessories.json", category: "accessories" },

return createdCategories.find(cat => cat.name === mappedName)?.id;    ];

  };

const allProducts: any[] = [];

// Read all catalog files

const catalogFiles = [    for (const { file, category } of catalogFiles) {

    { file: "kits.json", category: "kits" }, logger.info(`Processing ${file}...`);

    { file: "panels.json", category: "panels" }, const items = readCatalogFile(file);

    { file: "inverters.json", category: "inverters" },

    { file: "batteries.json", category: "batteries" }, for (const item of items) {

        { file: "structures.json", category: "structures" }, const categoryId = getCategoryId(category);

        { file: "cables.json", category: "cables" }, if (!categoryId) continue;

        { file: "controllers.json", category: "controllers" },

        { file: "chargers.json", category: "chargers" },            // Build product title

        { file: "accessories.json", category: "accessories" }, const title = item.name || item.model || `${item.manufacturer} ${item.id || item.sku}`;

  ];

        // Build description

        let totalProducts = 0; let description = item.description || "";

        if (item.kwp) description += `\nPotência: ${item.kwp} kWp`;

        for (const { file, category } of catalogFiles) {
            if (item.efficiency_pct) description += `\nEficiência: ${item.efficiency_pct}%`;

            logger.info(`Processing ${file}...`); if (item.technology) description += `\nTecnologia: ${item.technology}`;

            const items = readCatalogFile(file);

            // Parse price

            for (const item of items.slice(0, 10)) { // Limit to 10 items per category for testing            const price = parsePrice(item.price || "");

                const categoryId = getCategoryId(category);

                if (!categoryId) continue;            // Build images array

                const images: { url: string }[] = [];

                // Build product title            if (item.processed_images?.large) {

                const title = item.name || item.model || `${item.manufacturer} ${item.id || item.sku}`; images.push({ url: item.processed_images.large });

            } else if (item.image && item.image !== "/catalog/images/NEOSOLAR-KITS/neosolar_kits_27314.jpg") {

                // Build description                images.push({ url: item.image });

                let description = item.description || "";
            }

            if (item.kwp) description += `\nPotência: ${item.kwp} kWp`;

            if (item.efficiency_pct) description += `\nEficiência: ${item.efficiency_pct}%`;            // Create product object

            if (item.technology) description += `\nTecnologia: ${item.technology}`; const product = {

                title,

                // Parse price                category_ids: [categoryId],

                const price = parsePrice(item.price || ""); description,

                status: item.availability === "Disponível" ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,

                // Build images array                images,

                const images: { url: string }[] = []; weight: item.weight_kg || 1,

      if (item.processed_images?.large) {
                options: [

                    images.push({ url: item.processed_images.large }); {

                    } else if (item.image && item.image !== "/catalog/images/NEOSOLAR-KITS/neosolar_kits_27314.jpg") {
                        title: "Fabricante",

                            images.push({ url: item.image }); values: [item.manufacturer || "YSH"],

      }
            },

                ],

            try {
                variants: [

        const product = await productService.createProducts({                    {

                    title, title: item.sku || item.id || title,

                    category_ids: [categoryId], sku: item.sku || item.id || `YSH-${Date.now()}`,

                    description, options: {

                        status: item.availability === "Disponível" ? ProductStatus.PUBLISHED : ProductStatus.DRAFT, Fabricante: item.manufacturer || "YSH",

                        images,
                    },

                    weight: item.weight_kg || 1, manage_inventory: false,

                    options: [prices: price > 0 ? [

                        {                            {

                            title: "Fabricante", amount: price,

                            values: [item.manufacturer || "YSH"], currency_code: "brl",

                        },                            },

          ],                        ] : [],

                    variants: [                    },

            {                ],

                title: item.sku || item.id || title, sales_channels: [

                    sku: item.sku || item.id || `YSH-${Date.now()}`, {

                        options: {
                            id: defaultSalesChannel.id,

                            Fabricante: item.manufacturer || "YSH",
                        },

                    },],

                    manage_inventory: false, metadata: {

                    prices: price > 0 ? [manufacturer: item.manufacturer,

                        {
                            source: item.source || "YSH Catalog",

                            amount: price, original_id: item.id || item.sku,

                            currency_code: "brl", category: category,

                        },                },

              ] : [],            };

        },

          ], allProducts.push(product);

        sales_channels: [        }

    { }

    id: defaultSalesChannel.id,

            }, logger.info(`Creating ${allProducts.length} products...`);

          ],

metadata: {    // Create products in batches to avoid memory issues

    manufacturer: item.manufacturer,    const batchSize = 50;

    source: item.source || "YSH Catalog",    for (let i = 0; i < allProducts.length; i += batchSize) {

        original_id: item.id || item.sku,        const batch = allProducts.slice(i, i + batchSize);

        category: category, logger.info(`Creating products batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allProducts.length / batchSize)}...`);

    },

}); try {

    await createProductsWorkflow(container).run({

        totalProducts++; input: {

            logger.info(`Created product: ${title}`); products: batch,

      } catch (error) { },

    logger.error(`Error creating product ${title}:`, error);
});

      }        } catch (error) {

} logger.error(`Error creating batch ${Math.floor(i / batchSize) + 1}:`, error);

  }            // Continue with next batch

        }

logger.info(`Finished seeding catalog data. Created ${totalProducts} products.`);    }

}
logger.info("Finished seeding catalog data.");
}