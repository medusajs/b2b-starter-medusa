import {import {import {

  ExecArgs,

  IProductModuleService,    ExecArgs, ExecArgs,

  IProductCategoryModuleService,

  IStoreModuleService,    IProductModuleService, IProductModuleService,

  ContainerRegistrationKeys,

  ModuleRegistrationName,    IProductCategoryModuleService, IProductCategoryModuleService,

  ProductStatus,

} from "@medusajs/framework/types";    IStoreModuleService, IStoreModuleService,



import { createProductCategoriesWorkflow, createProductsWorkflow } from "@medusajs/core-flows";    ContainerRegistrationKeys, ContainerRegistrationKeys,

import * as fs from "fs";

import * as path from "path";    ModuleRegistrationName, ModuleRegistrationName,



interface CatalogItem {    ProductStatus, ProductStatus,

  id?: string;

  sku?: string;} from "@medusajs/framework/types";} from "@medusajs/framework/types";

  name?: string;

  manufacturer?: string;

  category?: string;

  price?: string;import { createProductCategoriesWorkflow, createProductsWorkflow } from "@medusajs/core-flows"; import { createProductCategoriesWorkflow, createProductsWorkflow } from "@medusajs/core-flows";

  image?: string;

  description?: string;import * as fs from "fs"; import * as fs from "fs";

  availability?: string;

  processed_images?: {import * as path from "path"; import * as path from "path";

    thumb?: string;

    medium?: string;

    large?: string;

  };interface CatalogItem {interface CatalogItem {

  model?: string;

  technology?: string;    id?: string; id?: string;

  kwp?: number;

  cells?: number;    sku?: string; sku?: string;

  efficiency_pct?: number;

  dimensions?: {    name?: string; name?: string;

    length: number;

    width: number;    manufacturer?: string; manufacturer?: string;

    thickness: number;

  };    category?: string; category?: string;

  weight_kg?: number;

  source?: string;    price?: string; price?: string;

}

    image?: string; image?: string;

const parsePrice = (priceStr: string): number => {

  if (!priceStr) return 0;    description?: string; description?: string;

  const cleaned = priceStr.replace(/[^\d.,]/g, '').replace(',', '.');

  const parsed = parseFloat(cleaned);    availability?: string; availability?: string;

  return isNaN(parsed) ? 0 : parsed;

};    processed_images?: {

        processed_images?: any;

const readCatalogFile = (fileName: string): CatalogItem[] => {

  const filePath = path.join(__dirname, '../../../data/catalog', fileName);        thumb?: string; kwp?: number;

  if (!fs.existsSync(filePath)) {

    console.warn(`Arquivo ${fileName} não encontrado`);        medium?: string; efficiency_pct?: number;

    return [];

  }        large?: string; technology?: string;



  try {    }; weight_kg?: number;

    const data = fs.readFileSync(filePath, 'utf-8');

    const parsed = JSON.parse(data);    model?: string; source?: string;



    // Handle different JSON structures    technology?: string;

    if (Array.isArray(parsed)) {}

      return parsed;

    } else if (parsed && typeof parsed === 'object') {kwp ?: number;

      // Check for nested arrays in common keys

      for (const key of Object.keys(parsed)) {cells ?: number; const parsePrice = (priceStr: string): number => {

        if (Array.isArray(parsed[key])) {

          return parsed[key];    efficiency_pct ?: number; if (!priceStr) return 0;

        }

      }    dimensions ?: {

      // If no array found, wrap in array        const cleaned = priceStr.replace(/[^\d.,]/g, '').replace(',', '.');

      return [parsed];

    }        length: number; const parsed = parseFloat(cleaned);



    return [];        width: number; return isNaN(parsed) ? 0 : parsed;

  } catch (error) {

    console.error(`Erro ao ler ${fileName}:`, error);        thickness: number;

    return [];    };

  }

};};



const categoryMap: Record<string, string> = {weight_kg ?: number; const readCatalogFile = (fileName: string): CatalogItem[] => {

  "accessories": "Acessórios",

  "kits": "Kits Solares",    source ?: string; const filePath = path.join(__dirname, '../../../data/catalog', fileName);

  "panels": "Painéis Fotovoltaicos",

  "inverters": "Inversores",}    if (!fs.existsSync(filePath)) {

  "batteries": "Baterias",

  "structures": "Estruturas",    console.warn(`Arquivo ${fileName} não encontrado`);

  "cables": "Cabos",

  "controllers": "Controladores",    const parsePrice = (priceStr: string): number => {

  "chargers": "Carregadores"        return [];

};

        if (!priceStr) return 0;

const getCategoryId = (categoryName: string): string | undefined => {    }

  const mappedName = categoryMap[categoryName] || categoryName;

  // This would need to be implemented to find category by name    const cleaned = priceStr.replace(/[^\d.,]/g, '').replace(',', '.');

  // For now, return undefined and handle in calling code

  return undefined;    const parsed = parseFloat(cleaned); try {

};

        return isNaN(parsed) ? 0 : parsed; const data = fs.readFileSync(filePath, 'utf-8');

export default async function seedCatalog({ container }: ExecArgs) {

  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);    }; const parsed = JSON.parse(data);

  const productService = container.resolve<IProductModuleService>(ModuleRegistrationName.PRODUCT);

  const categoryService = container.resolve<IProductCategoryModuleService>(ModuleRegistrationName.PRODUCT_CATEGORY);

  const storeService = container.resolve<IStoreModuleService>(ModuleRegistrationName.STORE);

    const readCatalogFile = (fileName: string): CatalogItem[] => {        // Handle different JSON structures

  logger.info("Starting catalog seeding...");

        const filePath = path.join(__dirname, '../../../data/catalog', fileName); if (Array.isArray(parsed)) {

  // Create categories

  const categories = [            if (!fs.existsSync(filePath)) {

    { name: "Kits Solares", handle: "kits" },                return parsed;

    { name: "Painéis Fotovoltaicos", handle: "panels" },

    { name: "Inversores", handle: "inverters" },                console.warn(`Arquivo ${fileName} não encontrado`);

    { name: "Baterias", handle: "batteries" },            } else if (parsed && typeof parsed === 'object') {

    { name: "Estruturas", handle: "structures" },

    { name: "Cabos", handle: "cables" },                return [];            // Check for nested arrays in common keys

    { name: "Controladores", handle: "controllers" },

    { name: "Carregadores", handle: "chargers" },            } for (const key of Object.keys(parsed)) {

    { name: "Acessórios", handle: "accessories" }

  ];                if (Array.isArray(parsed[key])) {



  const createdCategories = [];                    try {

  for (const category of categories) {                        return parsed[key];

    try {

      const result = await createProductCategoriesWorkflow(container).run({                        const data = fs.readFileSync(filePath, 'utf-8');

        input: { product_categories: [category] }                    }

      });

      createdCategories.push(result);    const parsed = JSON.parse(data);

      logger.info(`Created category: ${category.name}`);                }

    } catch (error) {

      logger.warn(`Category ${category.name} might already exist:`, error);                // If no array found, wrap in array

    }

  }                // Handle different JSON structures            return [parsed];



  // Read all catalog files                if (Array.isArray(parsed)) { }

  const catalogFiles = [

    { file: "kits.json", category: "kits" },                return parsed;

    { file: "panels.json", category: "panels" },

    { file: "inverters.json", category: "inverters" },            } else if (parsed && typeof parsed === 'object') {

    { file: "batteries.json", category: "batteries" },                return [];

    { file: "structures.json", category: "structures" },

    { file: "cables.json", category: "cables" },                // Check for nested arrays in common keys    } catch (error) {

    { file: "controllers.json", category: "controllers" },

    { file: "chargers.json", category: "chargers" },                for (const key of Object.keys(parsed)) {

    { file: "accessories.json", category: "accessories" }                    console.error(`Erro ao ler ${fileName}:`, error);

  ];

                    if (Array.isArray(parsed[key])) {

  const allProducts: any[] = [];                        return [];



  for (const { file, category } of catalogFiles) {                        return parsed[key];

    logger.info(`Processing ${file}...`);                    }

    const items = readCatalogFile(file);

                }

    for (const item of items) {            };

      const categoryId = getCategoryId(category);

      if (!categoryId) continue;        }



      // Build product title        // If no array found, wrap in arrayconst categoryMap: Record<string, string> = {

      const title = item.name || item.model || `${item.manufacturer} ${item.id || item.sku}`;

        return [parsed]; "accessories": "Acessórios",

      // Build description

      let description = item.description || "";    }    "kits": "Kits Solares",

      if (item.kwp) description += `\nPotência: ${item.kwp} kWp`;

      if (item.efficiency_pct) description += `\nEficiência: ${item.efficiency_pct}%`;        "panels": "Painéis Fotovoltaicos",

      if (item.technology) description += `\nTecnologia: ${item.technology}`;

    return []; "inverters": "Inversores",

      // Create product object

      const price = parsePrice(item.price || "");  } catch (error) {

    "batteries": "Baterias",

      const images: { url: string }[] = [];

      if (item.processed_images?.large) {        console.error(`Erro ao ler ${fileName}:`, error); "structures": "Estruturas",

        images.push({ url: item.processed_images.large });

      } else if (item.image && item.image !== "/catalog/images/NEOSOLAR-KITS/neosolar_kits_27314.jpg") {    return []; "cables": "Cabos",

        images.push({ url: item.image });

      }  } "controllers": "Controladores",



      const product = {}; "chargers": "Carregadores"

        title,

        description,};

        category_ids: [categoryId],

        status: item.availability === "Disponível" ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,const categoryMap: Record<string, string> = {

        images,

        options: [{    "accessories": "Acessórios", const getCategoryId = (categoryName: string): string | undefined => {

          title: "Fabricante",

          values: [item.manufacturer || "YSH"]        "kits": "Kits Solares",    const mappedName = categoryMap[categoryName] || categoryName;

        }],

        variants: [{        "panels": "Painéis Fotovoltaicos",    // This would need to be implemented to find category by name

          title: item.sku || item.id || title,

          sku: item.sku || item.id || `YSH-${Date.now()}`,            "inverters": "Inversores",    // For now, return undefined and handle in calling code

          prices: price > 0 ? [{

            amount: price,                "batteries": "Baterias",    return undefined;

            currency_code: "brl"

          }] : [],        "structures": "Estruturas",};

          options: {

            Fabricante: item.manufacturer || "YSH"    "cables": "Cabos",

          },

          weight: item.weight_kg || 1,    "controllers": "Controladores", export default async function seedCatalog({ container }: ExecArgs) {

          manage_inventory: false,

          metadata: {        "chargers": "Carregadores"    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

            source: item.source || "YSH Catalog",

            original_id: item.id || item.sku}; const productService = container.resolve<IProductModuleService>(ModuleRegistrationName.PRODUCT);

          }

        }]const categoryService = container.resolve<IProductCategoryModuleService>(ModuleRegistrationName.PRODUCT_CATEGORY);

      };

const getCategoryId = (categoryName: string): string | undefined => {

      allProducts.push(product);    const storeService = container.resolve<IStoreModuleService>(ModuleRegistrationName.STORE);

    }

  }    const mappedName = categoryMap[categoryName] || categoryName;



  logger.info(`Creating ${allProducts.length} products...`);    // This would need to be implemented to find category by name    logger.info("Starting catalog seeding...");



  // Create products in batches    // For now, return undefined and handle in calling code

  const batchSize = 50;

  let totalProducts = 0;    return undefined;    // Create categories



  for (let i = 0; i < allProducts.length; i += batchSize) {}; const categories = [

    const batch = allProducts.slice(i, i + batchSize);

    logger.info(`Creating products batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allProducts.length / batchSize)}...`);    { name: "Kits Solares", handle: "kits" },



    try {export default async function seedCatalog({ container }: ExecArgs) {

      await createProductsWorkflow(container).run({    { name: "Painéis Fotovoltaicos", handle: "panels" },

        input: {

          products: batch    const logger = container.resolve(ContainerRegistrationKeys.LOGGER); { name: "Inversores", handle: "inverters" },

        }

      });    const productService = container.resolve<IProductModuleService>(ModuleRegistrationName.PRODUCT); { name: "Baterias", handle: "batteries" },

      totalProducts += batch.length;

      logger.info(`Created batch of ${batch.length} products`);    const categoryService = container.resolve<IProductCategoryModuleService>(ModuleRegistrationName.PRODUCT_CATEGORY); { name: "Estruturas", handle: "structures" },

    } catch (error) {

      logger.error(`Error creating batch ${Math.floor(i / batchSize) + 1}:`, error);    const storeService = container.resolve<IStoreModuleService>(ModuleRegistrationName.STORE); { name: "Cabos", handle: "cables" },

    }

  }    { name: "Controladores", handle: "controllers" },



  logger.info(`Finished seeding catalog data. Created ${totalProducts} products.`);    logger.info("Starting catalog seeding..."); { name: "Carregadores", handle: "chargers" },

}
    { name: "Acessórios", handle: "accessories" }

    // Create categories    ];

    const categories = [

        { name: "Kits Solares", handle: "kits" },    const createdCategories = [];

    { name: "Painéis Fotovoltaicos", handle: "panels" }, for (const category of categories) {

        { name: "Inversores", handle: "inverters" }, try {

            { name: "Baterias", handle: "batteries" }, const result = await createProductCategoriesWorkflow(container).run({

    { name: "Estruturas", handle: "structures" }, input: { product_categories: [category] }

    { name: "Cabos", handle: "cables" },            });

        { name: "Controladores", handle: "controllers" }, createdCategories.push(result);

        { name: "Carregadores", handle: "chargers" }, logger.info(`Created category: ${category.name}`);

        { name: "Acessórios", handle: "accessories" }
    } catch (error) {

  ]; logger.warn(`Category ${category.name} might already exist:`, error);

    }

    const createdCategories = [];
}

for (const category of categories) {

    try {    // Read all catalog files

        const result = await createProductCategoriesWorkflow(container).run({
            const catalogFiles = [

                input: { product_categories: [category] }        { file: "kits.json", category: "kits" },

      }); { file: "panels.json", category: "panels" },

        createdCategories.push(result); { file: "inverters.json", category: "inverters" },

        logger.info(`Created category: ${category.name}`); { file: "batteries.json", category: "batteries" },

    } catch (error) {
        { file: "structures.json", category: "structures" },

        logger.warn(`Category ${category.name} might already exist:`, error); { file: "cables.json", category: "cables" },

    } { file: "controllers.json", category: "controllers" },

} { file: "chargers.json", category: "chargers" },

{ file: "accessories.json", category: "accessories" }

// Read all catalog files    ];

const catalogFiles = [

    { file: "kits.json", category: "kits" },    const allProducts: any[] = [];

{ file: "panels.json", category: "panels" },

{ file: "inverters.json", category: "inverters" }, for (const { file, category } of catalogFiles) {

    { file: "batteries.json", category: "batteries" }, logger.info(`Processing ${file}...`);

    { file: "structures.json", category: "structures" }, const items = readCatalogFile(file);

    { file: "cables.json", category: "cables" },

    { file: "controllers.json", category: "controllers" }, for (const item of items) {

        { file: "chargers.json", category: "chargers" }, const categoryId = getCategoryId(category);

        { file: "accessories.json", category: "accessories" } if (!categoryId) continue;

  ];

        // Build product title

        const allProducts: any[] = []; const title = item.name || item.model || `${item.manufacturer} ${item.id || item.sku}`;



        for (const { file, category } of catalogFiles) {            // Build description

            logger.info(`Processing ${file}...`); let description = item.description || "";

            const items = readCatalogFile(file); if (item.kwp) description += `\nPotência: ${item.kwp} kWp`;

            if (item.efficiency_pct) description += `\nEficiência: ${item.efficiency_pct}%`;

            for (const item of items) {
                if (item.technology) description += `\nTecnologia: ${item.technology}`;

                const categoryId = getCategoryId(category);

                if (!categoryId) continue;            // Create product object

                const price = parsePrice(item.price || "");

                // Build product title

                const title = item.name || item.model || `${item.manufacturer} ${item.id || item.sku}`; const images: { url: string }[] = [];

                if (item.processed_images?.large) {

                    // Build description                images.push({ url: item.processed_images.large });

                    let description = item.description || "";
                } else if (item.image && item.image !== "/catalog/images/NEOSOLAR-KITS/neosolar_kits_27314.jpg") {

                    if (item.kwp) description += `\nPotência: ${item.kwp} kWp`; images.push({ url: item.image });

                    if (item.efficiency_pct) description += `\nEficiência: ${item.efficiency_pct}%`;
                }

                if (item.technology) description += `\nTecnologia: ${item.technology}`;

                const product = {

                    // Create product object                title,

                    const price = parsePrice(item.price || ""); description,

                    category_ids: [categoryId],

                    const images: { url: string }[] = []; status: item.availability === "Disponível" ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,

      if (item.processed_images?.large) {
                    images,

                    images.push({ url: item.processed_images.large }); options: [{

                    } else if (item.image && item.image !== "/catalog/images/NEOSOLAR-KITS/neosolar_kits_27314.jpg") {
                        title: "Fabricante",

                            images.push({ url: item.image }); values: [item.manufacturer || "YSH"]

                    }
                }],

                variants: [{

                    const product = {
                        title: item.sku || item.id || title,

                        title, sku: item.sku || item.id || `YSH-${Date.now()}`,

                        description, prices: price > 0 ? [{

                            category_ids: [categoryId], amount: price,

                            status: item.availability === "Disponível" ? ProductStatus.PUBLISHED : ProductStatus.DRAFT, currency_code: "brl"

        images,
                        }] : [],

                        options: [{
                            options: {

                                title: "Fabricante", Fabricante: item.manufacturer || "YSH"

          values: [item.manufacturer || "YSH"]
                            },

                        }], weight: item.weight_kg || 1,

                        variants: [{
                            manage_inventory: false,

                            title: item.sku || item.id || title, metadata: {

                                sku: item.sku || item.id || `YSH-${Date.now()}`, source: item.source || "YSH Catalog",

                                prices: price > 0 ? [{
                                    original_id: item.id || item.sku

            amount: price,
                                }

            currency_code: "brl"                }]

                    }] : [],            };

            options: {

                Fabricante: item.manufacturer || "YSH"            allProducts.push(product);

            },
        }

        weight: item.weight_kg || 1,    }

    manage_inventory: false,

        metadata: {
            logger.info(`Creating ${allProducts.length} products...`);

        source: item.source || "YSH Catalog",

            original_id: item.id || item.sku    // Create products in batches

    } const batchSize = 50;

}]let totalProducts = 0;

      };

for (let i = 0; i < allProducts.length; i += batchSize) {

    allProducts.push(product); const batch = allProducts.slice(i, i + batchSize);

} logger.info(`Creating products batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allProducts.length / batchSize)}...`);

  }

try {

    logger.info(`Creating ${allProducts.length} products...`); await createProductsWorkflow(container).run({

        input: {

            // Create products in batches                    products: batch

            const batchSize = 50;
        }

  let totalProducts = 0;
    });

    totalProducts += batch.length;

    for (let i = 0; i < allProducts.length; i += batchSize) {
        logger.info(`Created batch of ${batch.length} products`);

        const batch = allProducts.slice(i, i + batchSize);
    } catch (error) {

        logger.info(`Creating products batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allProducts.length / batchSize)}...`); logger.error(`Error creating batch ${Math.floor(i / batchSize) + 1}:`, error);

    }

    try { }

      await createProductsWorkflow(container).run({

        input: {
            logger.info(`Finished seeding catalog data. Created ${totalProducts} products.`);

            products: batch
        }

    }

      }); thumb ?: string;

totalProducts += batch.length;

logger.info(`Created batch of ${batch.length} products`); medium ?: string; import * as path from "path";

    } catch (error) {

    logger.error(`Error creating batch ${Math.floor(i / batchSize) + 1}:`, error); large ?: string;

}

  }  }; import {



    logger.info(`Finished seeding catalog data. Created ${totalProducts} products.`); model ?: string;

}
technology ?: string; interface CatalogItem {

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