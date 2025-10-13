import YshCatalogModuleService from '../service';
import * as fs from 'fs';
import * as path from 'path';

// Mock provider for integration tests
class MockCatalogProvider {
  private mockData: Record<string, any[]> = {
    kits: [
      {
        id: 'KIT-001',
        name: 'Kit Solar 5kW Residencial',
        manufacturer: 'ACME Solar',
        category: 'kits',
        price: 'R$ 15.500,00'
      }
    ],
    panels: [
      {
        id: 'PANEL-001',
        name: 'Painel Solar 550W',
        manufacturer: 'SolarMax',
        category: 'panels',
        price: 'R$ 680,00'
      }
    ]
  };

  async getProductsByCategory(category: string): Promise<any[]> {
    return this.mockData[category] || [];
  }
}

describe('YSH Catalog Module - Integration Tests', () => {
  let service: YshCatalogModuleService;
  let mockProvider: MockCatalogProvider;

  beforeEach(() => {
    mockProvider = new MockCatalogProvider();
    
    // Mock fs operations for integration tests
    jest.spyOn(fs, 'existsSync').mockImplementation((filePath: any) => {
      const pathStr = filePath.toString();
      return pathStr.includes('kits_unified.json') || 
             pathStr.includes('panels_unified.json') ||
             pathStr.includes('inverters_unified.json') ||
             pathStr.includes('sku_registry.json');
    });
    
    jest.spyOn(fs, 'readFileSync').mockImplementation((filePath: any) => {
      const pathStr = filePath.toString();
      
      if (pathStr.includes('kits_unified.json')) {
        return JSON.stringify(mockProvider.mockData.kits);
      }
      if (pathStr.includes('panels_unified.json')) {
        return JSON.stringify(mockProvider.mockData.panels);
      }
      if (pathStr.includes('inverters_unified.json')) {
        return JSON.stringify([]);
      }
      if (pathStr.includes('sku_registry.json')) {
        return JSON.stringify({
          items: [
            { category: 'kits', id: 'KIT-001', sku: 'YSH-KIT-RES-5KW' },
            { category: 'panels', id: 'PANEL-001', sku: 'YSH-PNL-550W' }
          ]
        });
      }
      
      throw new Error('File not found');
    });

    service = new YshCatalogModuleService(null, {
      catalogPath: '/mock/catalog',
      unifiedSchemasPath: '/mock/unified'
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('✅ Product Listing Integration', () => {
    it('should list products by category via provider mock', async () => {
      const result = await service.listProductsByCategory('kits', { limit: 10 });
      
      expect(result).toBeDefined();
      expect(result.products).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      
      const product = result.products[0];
      expect(product.sku).toBe('YSH-KIT-RES-5KW');
      expect(product.category).toBe('kits');
      expect(product.name).toBe('Kit Solar 5kW Residencial');
    });

    it('should handle pagination correctly', async () => {
      const page1 = await service.listProductsByCategory('kits', { page: 1, limit: 1 });
      const page2 = await service.listProductsByCategory('kits', { page: 2, limit: 1 });
      
      expect(page1.products).toHaveLength(1);
      expect(page2.products).toHaveLength(0); // No more products
      expect(page1.page).toBe(1);
      expect(page2.page).toBe(2);
    });

    it('should filter by manufacturer', async () => {
      const result = await service.listProductsByCategory('kits', { 
        manufacturer: 'ACME Solar',
        limit: 10 
      });
      
      expect(result.products).toHaveLength(1);
      expect(result.products[0].manufacturer).toBe('ACME Solar');
    });

    it('should filter by price range', async () => {
      const result = await service.listProductsByCategory('kits', { 
        minPrice: 10000,
        maxPrice: 20000,
        limit: 10 
      });
      
      expect(result.products).toHaveLength(1);
      expect(result.products[0].price_brl).toBe(15500);
    });
  });

  describe('✅ SKU Registry Integration', () => {
    it('should apply canonical SKUs from registry', async () => {
      const kitsResult = await service.listProductsByCategory('kits');
      const panelsResult = await service.listProductsByCategory('panels');
      
      expect(kitsResult.products[0].sku).toBe('YSH-KIT-RES-5KW');
      expect(panelsResult.products[0].sku).toBe('YSH-PNL-550W');
    });

    it('should handle missing registry gracefully', async () => {
      // Mock empty registry
      jest.spyOn(fs, 'readFileSync').mockImplementation((filePath: any) => {
        const pathStr = filePath.toString();
        
        if (pathStr.includes('kits_unified.json')) {
          return JSON.stringify(mockProvider.mockData.kits);
        }
        if (pathStr.includes('sku_registry.json')) {
          return JSON.stringify({ items: [] });
        }
        
        throw new Error('File not found');
      });

      const result = await service.listProductsByCategory('kits');
      
      expect(result.products[0].sku).toBe('KIT-001'); // Falls back to ID
    });
  });

  describe('✅ Product Search Integration', () => {
    it('should search products across categories', async () => {
      const results = await service.searchProducts('Solar', { limit: 10 });
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(p => p.name?.includes('Solar'))).toBe(true);
    });

    it('should search within specific category', async () => {
      const results = await service.searchProducts('Kit', { 
        category: 'kits',
        limit: 10 
      });
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].category).toBe('kits');
    });
  });

  describe('✅ Product Retrieval Integration', () => {
    it('should get product by ID', async () => {
      const product = await service.getProductById('kits', 'KIT-001');
      
      expect(product).toBeDefined();
      expect(product?.id).toBe('KIT-001');
      expect(product?.sku).toBe('YSH-KIT-RES-5KW');
    });

    it('should get product by SKU', async () => {
      const product = await service.getProductById('kits', 'YSH-KIT-RES-5KW');
      
      expect(product).toBeDefined();
      expect(product?.sku).toBe('YSH-KIT-RES-5KW');
    });

    it('should return null for non-existent product', async () => {
      const product = await service.getProductById('kits', 'NON-EXISTENT');
      
      expect(product).toBeNull();
    });
  });

  describe('✅ Data Consistency Integration', () => {
    it('should produce consistent results for repeated calls', async () => {
      const result1 = await service.listProductsByCategory('kits');
      const result2 = await service.listProductsByCategory('kits');
      
      expect(result1).toEqual(result2);
    });

    it('should maintain SKU determinism', async () => {
      const product1 = await service.getProductById('kits', 'KIT-001');
      const product2 = await service.getProductById('kits', 'KIT-001');
      
      expect(product1?.sku).toBe(product2?.sku);
      expect(product1?.sku).toBe('YSH-KIT-RES-5KW');
    });
  });

  describe('✅ Error Handling Integration', () => {
    it('should handle unsupported category gracefully', async () => {
      await expect(service.listProductsByCategory('invalid-category'))
        .rejects.toThrow('invalid-category');
    });

    it('should handle file system errors gracefully', async () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('File system error');
      });

      const result = await service.listProductsByCategory('kits');
      
      expect(result.products).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});