import fs from 'fs'
import path from 'path'
import os from 'os'

// Import the service under test
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import YshCatalogModuleService from '../../ysh-catalog/service'

function writeJson(p: string, data: any) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8')
}

describe('YshCatalogModuleService SKU enrichment', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ysh-catalog-test-'))
  const catalogPath = tmpRoot
  const unified = path.join(catalogPath, 'unified_schemas')

  afterAll(() => {
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }) } catch {}
  })

  test('applies canonical SKU from registry when present', async () => {
    // Arrange unified + registry
    writeJson(path.join(unified, 'kits_unified.json'), [
      { id: 'ITEM1', name: 'Kit A', manufacturer: 'ACME', category: 'kits', price: 'R$ 100,00' }
    ])
    writeJson(path.join(unified, 'sku_registry.json'), {
      items: [{ category: 'kits', id: 'ITEM1', sku: 'CANONICAL-1' }]
    })

    // Pass catalogPath as option to constructor
    const svc = new YshCatalogModuleService(null, { 
      catalogPath,
      unifiedSchemasPath: unified 
    })
    const res = await svc.listProductsByCategory('kits', { limit: 10 })
    expect(res.products.length).toBeGreaterThan(0)
    const p = res.products[0]
    expect(p.sku).toBe('CANONICAL-1')
    expect(p.category).toBe('kits')
  })

  test('falls back to ID uppercased when no registry', async () => {
    // Arrange unified without registry
    writeJson(path.join(unified, 'inverters_unified.json'), [
      { id: 'inv-001', name: 'Inverter X', manufacturer: 'Brand', category: 'inverters', price: 'R$ 200,00' }
    ])

    // Ensure no registry for inverters
    writeJson(path.join(unified, 'sku_registry.json'), { items: [] })

    const svc = new YshCatalogModuleService(null, { 
      catalogPath,
      unifiedSchemasPath: unified 
    })
    const res = await svc.listProductsByCategory('inverters', { limit: 10 })
    expect(res.products.length).toBeGreaterThan(0)
    const p = res.products[0]
    expect(p.sku).toBe('INV-001')
  })

  test('generates deterministic SKU when id/sku missing', async () => {
    writeJson(path.join(unified, 'panels_unified.json'), [
      { name: 'Panel 600W', manufacturer: 'München', technical_specs: { power_w: 600 }, category: 'panels', price: 'R$ 300,00' }
    ])
    // Empty registry to force fallback
    writeJson(path.join(unified, 'sku_registry.json'), { items: [] })

    const svc = new YshCatalogModuleService(null, { 
      catalogPath,
      unifiedSchemasPath: unified 
    })
    const res1 = await svc.listProductsByCategory('panels', { limit: 10 })
    const res2 = await svc.listProductsByCategory('panels', { limit: 10 })
    expect(res1.products.length).toBeGreaterThan(0)
    expect(res2.products.length).toBeGreaterThan(0)
    expect(res1.products[0].sku).toEqual(res2.products[0].sku)
    expect(res1.products[0].sku).toMatch(/^[A-Z0-9-]{6,64}$/)
  })
})

