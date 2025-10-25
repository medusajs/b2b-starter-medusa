import YshCatalogModuleService from '../service';
import * as fs from 'fs';

// Mock fixtures data
const mockKitsData = [
  {
    id: 'KIT-001',
    name: 'Kit Solar 5kW Residencial',
    manufacturer: 'ACME Solar',
    category: 'kits',
    price: 'R$ 15.500,00',
    technical_specs: {
      power_w: 5000,
      panel_count: 10,
      inverter_power_w: 5000
    }
  }
];

const mockInvertersData = [
  {
    id: 'INV-001',
    name: 'Inversor Grid-Tie 5kW',
    manufacturer: 'PowerTech',
    category: 'inverters',
    price: 'R$ 4.200,00'
  }
];

const mockSkuRegistry = {
  items: [
    { category: 'kits', id: 'KIT-001', sku: 'YSH-KIT-RES-5KW' }
  ]
};

// Mock fs module
jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('YSH Catalog Module - SKU Normalization Unit Tests', () => {
  let service: YshCatalogModuleService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock fs.existsSync and fs.readFileSync
    mockedFs.existsSync.mockImplementation((filePath: any) => {
      const pathStr = filePath.toString();
      return pathStr.includes('kits_unified.json') || 
             pathStr.includes('inverters_unified.json') ||
             pathStr.includes('sku_registry.json');
    });
    
    mockedFs.readFileSync.mockImplementation((filePath: any) => {
      const pathStr = filePath.toString();
      if (pathStr.includes('kits_unified.json')) {
        return JSON.stringify(mockKitsData);
      }
      if (pathStr.includes('inverters_unified.json')) {
        return JSON.stringify(mockInvertersData);
      }
      if (pathStr.includes('sku_registry.json')) {
        return JSON.stringify(mockSkuRegistry);
      }
      throw new Error('File not found');
    });
    
    service = new YshCatalogModuleService(null, {
      catalogPath: '/mock/catalog',
      unifiedSchemasPath: '/mock/unified'
    });
  });

  it('should apply canonical SKU from registry when present', async () => {
    const result = await service.listProductsByCategory('kits', { limit: 10 });
    
    expect(result.products.length).toBeGreaterThan(0);
    const product = result.products[0];
    expect(product.sku).toBe('YSH-KIT-RES-5KW');
    expect(product.category).toBe('kits');
    expect(product.name).toBe('Kit Solar 5kW Residencial');
  });

  it('should fall back to ID uppercased when no registry entry', async () => {
    // Mock empty registry for this test
    mockedFs.readFileSync.mockImplementation((filePath: any) => {
      const pathStr = filePath.toString();
      if (pathStr.includes('inverters_unified.json')) {
        return JSON.stringify(mockInvertersData);
      }
      if (pathStr.includes('sku_registry.json')) {
        return JSON.stringify({ items: [] }); // Empty registry
      }
      throw new Error('File not found');
    });
    
    const result = await service.listProductsByCategory('inverters', { limit: 10 });
    
    expect(result.products.length).toBeGreaterThan(0);
    const product = result.products[0];
    expect(product.sku).toBe('INV-001');
    expect(product.name).toContain('Inversor');
  });

  it('should generate deterministic SKU when id/sku missing', async () => {
    const panelWithoutId = {
      name: 'Painel Solar 600W München',
      manufacturer: 'München Solar',
      technical_specs: { power_w: 600 },
      category: 'panels',
      price: 'R$ 820,00'
    };
    
    // Mock panel data without ID and empty registry
    mockedFs.existsSync.mockImplementation((filePath: any) => {
      const pathStr = filePath.toString();
      return pathStr.includes('panels_unified.json') || pathStr.includes('sku_registry.json');
    });
    
    mockedFs.readFileSync.mockImplementation((filePath: any) => {
      const pathStr = filePath.toString();
      if (pathStr.includes('panels_unified.json')) {
        return JSON.stringify([panelWithoutId]);
      }
      if (pathStr.includes('sku_registry.json')) {
        return JSON.stringify({ items: [] });
      }
      throw new Error('File not found');
    });
    
    const result1 = await service.listProductsByCategory('panels', { limit: 10 });
    const result2 = await service.listProductsByCategory('panels', { limit: 10 });
    
    expect(result1.products.length).toBeGreaterThan(0);
    expect(result2.products.length).toBeGreaterThan(0);
    expect(result1.products[0].sku).toEqual(result2.products[0].sku);
    expect(result1.products[0].sku).toMatch(/^[A-Z0-9-]{6,64}$/);
  });
  
  it('should handle price parsing correctly', async () => {
    const result = await service.listProductsByCategory('kits', { limit: 10 });
    
    expect(result.products.length).toBeGreaterThan(0);
    const product = result.products[0];
    expect(product.price_brl).toBe(15500); // R$ 15.500,00 -> 15500
  });
  
  it('should return consistent results for identical inputs', async () => {
    const result1 = await service.listProductsByCategory('kits', { limit: 10 });
    const result2 = await service.listProductsByCategory('kits', { limit: 10 });
    
    expect(result1).toEqual(result2);
    expect(result1.products[0].sku).toBe(result2.products[0].sku);
  });
});