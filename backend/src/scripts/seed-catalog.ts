import {
  ExecArgs,
  IProductModuleService,
  IProductCategoryModuleService,
  IStoreModuleService,
  ContainerRegistrationKeys,
  ModuleRegistrationName,
  ProductStatus,
} from '@medusajs/framework/types';

import { createProductCategoriesWorkflow, createProductsWorkflow } from '@medusajs/core-flows';
import * as fs from 'fs';
import * as path from 'path';

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
  const cleaned = priceStr.replace(/[^\d.,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

const readCatalogFile = (fileName: string): CatalogItem[] => {
  const filePath = path.join(__dirname, '../../../data/catalog', fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(Arquivo  não encontrado);
    return [];
  }

  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data);

    // Handle different JSON structures
    if (Array.isArray(parsed)) {
      return parsed;
    } else if (parsed && typeof parsed === 'object') {
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
    console.error(Erro ao ler :, error);
    return [];
  }
};

const categoryMap: Record<string, string> = {
  'accessories': 'Acessórios',
  'kits': 'Kits Solares',
  'panels': 'Painéis Fotovoltaicos',
  'inverters': 'Inversores',
  'batteries': 'Baterias',
  'structures': 'Estruturas',
  'cables': 'Cabos',
  'controllers': 'Controladores',
  'chargers': 'Carregadores'
};

const getCategoryId = (categoryName: string): string | undefined => {
  const mappedName = categoryMap[categoryName] || categoryName;
  // This would need to be implemented to find category by name
  // For now, return undefined and handle in calling code
  return undefined;
};

export default async function seedCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productService = container.resolve<IProductModuleService>(ModuleRegistrationName.PRODUCT);
  const categoryService = container.resolve<IProductCategoryModuleService>(ModuleRegistrationName.PRODUCT_CATEGORY);
  const storeService = container.resolve<IStoreModuleService>(ModuleRegistrationName.STORE);

  logger.info('Starting catalog seeding...');

  // Create categories
  const categories = [
    { name: 'Kits Solares', handle: 'kits' },
    { name: 'Painéis Fotovoltaicos', handle: 'panels' },
    { name: 'Inversores', handle: 'inverters' },
    { name: 'Baterias', handle: 'batteries' },
    { name: 'Estruturas', handle: 'structures' },
    { name: 'Cabos', handle: 'cables' },
    { name: 'Controladores', handle: 'controllers' },
    { name: 'Carregadores', handle: 'chargers' },
    { name: 'Acessórios', handle: 'accessories' }
  ];

  const createdCategories = [];
  for (const category of categories) {
    try {
      const result = await createProductCategoriesWorkflow(container).run({
        input: { product_categories: [category] }
      });
      createdCategories.push(result);
      logger.info(Created category: );
    } catch (error) {
      logger.warn(Category  might already exist:, error);
    }
  }

  // Read all catalog files
  const catalogFiles = [
    { file: 'kits.json', category: 'kits' },
    { file: 'panels.json', category: 'panels' },
    { file: 'inverters.json', category: 'inverters' },
    { file: 'batteries.json', category: 'batteries' },
    { file: 'structures.json', category: 'structures' },
    { file: 'cables.json', category: 'cables' },
    { file: 'controllers.json', category: 'controllers' },
    { file: 'chargers.json', category: 'chargers' },
    { file: 'accessories.json', category: 'accessories' }
  ];

  const allProducts: any[] = [];

  for (const { file, category } of catalogFiles) {
    logger.info(Processing ...);
    const items = readCatalogFile(file);

    for (const item of items) {
      const categoryId = getCategoryId(category);
      if (!categoryId) continue;

      // Build product title
      const title = item.name || item.model || ${item.manufacturer} ;

      // Build description
      let description = item.description || '';
      if (item.kwp) description += \nPotência:  kWp;
      if (item.efficiency_pct) description += \nEficiência: %;
      if (item.technology) description += \nTecnologia: ;

      // Create product object
      const price = parsePrice(item.price || '');

      const images: { url: string }[] = [];
      if (item.processed_images?.large) {
        images.push({ url: item.processed_images.large });
      } else if (item.image && item.image !== '/catalog/images/NEOSOLAR-KITS/neosolar_kits_27314.jpg') {
        images.push({ url: item.image });
      }

      const product = {
        title,
        description,
        category_ids: [categoryId],
        status: item.availability === 'Disponível' ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
        images,
        options: [{
          title: 'Fabricante',
          values: [item.manufacturer || 'YSH']
        }],
        variants: [{
          title: item.sku || item.id || title,
          sku: item.sku || item.id || YSH-,
          prices: price > 0 ? [{
            amount: price,
            currency_code: 'brl'
          }] : [],
          options: {
            Fabricante: item.manufacturer || 'YSH'
          },
          weight: item.weight_kg || 1,
          manage_inventory: false,
          metadata: {
            source: item.source || 'YSH Catalog',
            original_id: item.id || item.sku
          }
        }]
      };

      allProducts.push(product);
    }
  }

  logger.info(Creating  products...);

  // Create products in batches
  const batchSize = 50;
  let totalProducts = 0;

  for (let i = 0; i < allProducts.length; i += batchSize) {
    const batch = allProducts.slice(i, i + batchSize);
    logger.info(Creating products batch /...);

    try {
      await createProductsWorkflow(container).run({
        input: {
          products: batch
        }
      });
      totalProducts += batch.length;
      logger.info(Created batch of  products);
    } catch (error) {
      logger.error(Error creating batch :, error);
    }
  }

  logger.info(Finished seeding catalog data. Created  products.);
}
