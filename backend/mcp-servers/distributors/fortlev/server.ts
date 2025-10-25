/**
 * Fortlev Solar MCP Server
 * URL: https://fortlevsolar.app/
 */

import { BaseMCPServer, type MCPServerConfig } from '../../shared/base/mcp-server.js';
import type {
  AuthSession,
  Product,
  ExtractionResult,
  ExtractionConfig,
  ProductFilters,
} from '../../shared/types/distributor.js';
import { chromium, type Browser, type Page } from 'playwright';
import PQueue from 'p-queue';
import pRetry from 'p-retry';

export class FortlevMCPServer extends BaseMCPServer {
  private browser?: Browser;
  private page?: Page;
  private queue: PQueue;

  constructor(config: MCPServerConfig) {
    super(config);
    this.queue = new PQueue({ concurrency: 3 });
  }

  /**
   * Initialize browser instance
   */
  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      this.page = await this.browser.newPage();
      
      // Set user agent
      await this.page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      });
    }
  }

  /**
   * Authenticate with Fortlev Solar
   */
  protected async authenticate(email: string, password: string): Promise<AuthSession> {
    await this.initBrowser();
    if (!this.page) throw new Error('Browser not initialized');

    try {
      this.logger.info('Authenticating with Fortlev Solar');

      // Navigate to login page
      await this.page.goto('https://fortlevsolar.app/login', {
        waitUntil: 'networkidle',
      });

      // Fill credentials (os campos têm name="username" e name="password")
      await this.page.fill('input[name="username"]', email);
      await this.page.fill('input[name="password"]', password);

      // Submit login
      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle' }),
        this.page.click('button[type="submit"]'),
      ]);

      // Check if logged in by URL change (should redirect from /login)
      const currentUrl = this.page.url();
      const isLoggedIn = !currentUrl.includes('/login');

      if (!isLoggedIn) {
        // Try to capture error message from page
        const errorMsg = await this.page.locator('.message-error, .alert-error').textContent().catch(() => 'Unknown error');
        throw new Error(`Authentication failed - still on login page. ${errorMsg}`);
      }

      // Extract cookies/tokens
      const cookies = await this.page.context().cookies();
      const cookieMap = cookies.reduce(
        (acc, cookie) => {
          acc[cookie.name] = cookie.value;
          return acc;
        },
        {} as Record<string, string>
      );

      this.session = {
        distributor: 'fortlev',
        cookies: cookieMap,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
        isValid: true,
      };

      this.logger.info('Successfully authenticated with Fortlev');
      return this.session;
    } catch (error) {
      this.logger.error({ error }, 'Authentication failed');
      throw error;
    }
  }

  /**
   * List products with filters
   */
  protected async listProducts(
    filters: ProductFilters
  ): Promise<{ products: Product[]; total: number }> {
    if (!this.session?.isValid) {
      throw new Error('Not authenticated');
    }

    await this.initBrowser();
    if (!this.page) throw new Error('Browser not initialized');

    try {
      this.logger.info({ filters }, 'Listing products');

      // Navigate to catalog page (produto-avulso)
      const url = new URL('https://fortlevsolar.app/produto-avulso');
      if (filters.search) url.searchParams.set('nome', filters.search);

      await this.page.goto(url.toString(), { 
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      await this.page.waitForTimeout(3000); // Wait for dynamic content

      // Extract product list from card structure
      const products = await this.page.$$eval('.card', (elements) =>
        elements.map((el) => {
          // Extract SKU/Code from card-title
          const codeEl = el.querySelector('.card-title small span');
          const code = codeEl?.textContent?.trim() || '';

          // Extract title from content-single-products-card
          const titleEl = el.querySelector('.content-single-products-card .title-info .fw-semibold');
          const title = titleEl?.textContent?.trim() || '';

          // Extract price from text-orders-price
          const priceEl = el.querySelector('.text-orders-price p span');
          const price = priceEl?.textContent?.trim() || '';

          // Extract image
          const imageEl = el.querySelector('.img-content-orders img');
          const image = (imageEl as HTMLImageElement)?.src || '';

          // Extract component data from button click handler
          const buttonEl = el.querySelector('button[type="button"]');
          const onClickAttr = buttonEl?.getAttribute('@click') || buttonEl?.getAttribute('onclick') || '';
          
          // Try to parse component ID from the onclick JSON
          let componentData: any = {};
          try {
            const jsonMatch = onClickAttr.match(/addCart\((\{.*?\})\)/);
            if (jsonMatch) {
              const jsonStr = jsonMatch[1]
                .replace(/&quot;/g, '"')
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ');
              componentData = JSON.parse(jsonStr);
            }
          } catch (e) {
            // Ignore parse errors
          }

          return {
            code,
            title,
            price,
            image,
            componentId: componentData?.component?.id || '',
            manufacturer: componentData?.component?.manufacturer || null,
            family: componentData?.component?.family || '',
            step: componentData?.component?.step || 1,
            fullPrice: componentData?.full_price || 0,
            finalPrice: componentData?.final_price || 0,
          };
        })
      );

      // Filter out empty products
      const validProducts = products.filter(p => p.code && p.title);

      // Parse and normalize products
      const normalizedProducts: Product[] = validProducts.map((p) => ({
        sku: p.code,
        distributor: 'fortlev',
        title: p.title,
        category: this.mapFamilyToCategory(p.family) || this.categorizeProduct(p.title),
        manufacturer: p.manufacturer || this.extractManufacturer(p.title),
        model: this.extractModel(p.title),
        technicalSpecs: {
          family: p.family,
          componentId: p.componentId,
          step: p.step,
        },
        pricing: {
          retail: p.finalPrice || this.parsePrice(p.price),
          wholesale: p.fullPrice !== p.finalPrice ? p.fullPrice : undefined,
          currency: 'BRL',
          lastUpdated: new Date().toISOString(),
        },
        stock: {
          available: -1, // Unknown, will be updated with detailed call
        },
        images: p.image ? [p.image] : [],
        extractedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      this.logger.info({ count: normalizedProducts.length }, 'Products extracted');

      return {
        products: normalizedProducts,
        total: normalizedProducts.length,
      };
    } catch (error) {
      this.logger.error({ error }, 'Failed to list products');
      throw error;
    }
  }

  /**
   * Get detailed product information
   */
  protected async getProduct(sku: string): Promise<Product> {
    if (!this.session?.isValid) {
      throw new Error('Not authenticated');
    }

    await this.initBrowser();
    if (!this.page) throw new Error('Browser not initialized');

    try {
      this.logger.info({ sku }, 'Getting product details');

      // Navigate to product page
      const productUrl = `https://fortlevsolar.app/produto/${sku}`;
      await this.page.goto(productUrl, { waitUntil: 'networkidle' });

      // Extract detailed information
      const productData = await this.page.evaluate(() => {
        const getText = (selector: string) =>
          document.querySelector(selector)?.textContent?.trim() || '';
        const getAttr = (selector: string, attr: string) =>
          document.querySelector(selector)?.getAttribute(attr) || '';

        return {
          title: getText('h1, .product-title'),
          description: getText('.product-description, .description'),
          price: getText('.product-price, .price'),
          stock: getText('.stock-info, .availability'),
          manufacturer: getText('.manufacturer, .brand'),
          model: getText('.model-number, .product-code'),
          images: Array.from(document.querySelectorAll('.product-image img, .gallery img')).map(
            (img) => (img as HTMLImageElement).src
          ),
          specs: Array.from(document.querySelectorAll('.spec-item, .technical-spec')).reduce(
            (acc, el) => {
              const label = el.querySelector('.spec-label, dt')?.textContent?.trim();
              const value = el.querySelector('.spec-value, dd')?.textContent?.trim();
              if (label && value) acc[label] = value;
              return acc;
            },
            {} as Record<string, string>
          ),
        };
      });

      const product: Product = {
        sku,
        distributor: 'fortlev',
        title: productData.title,
        description: productData.description,
        category: this.categorizeProduct(productData.title),
        manufacturer: productData.manufacturer || this.extractManufacturer(productData.title),
        model: productData.model || this.extractModel(productData.title),
        technicalSpecs: productData.specs,
        pricing: {
          retail: this.parsePrice(productData.price),
          currency: 'BRL',
          lastUpdated: new Date().toISOString(),
        },
        stock: {
          available: this.parseStock(productData.stock),
        },
        images: productData.images,
        extractedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return product;
    } catch (error) {
      this.logger.error({ error, sku }, 'Failed to get product');
      throw error;
    }
  }

  /**
   * Extract full catalog
   */
  protected async extractCatalog(config: ExtractionConfig): Promise<ExtractionResult> {
    const startTime = Date.now();
    const errors: Array<{ sku?: string; message: string; stack?: string }> = [];
    let productsExtracted = 0;
    let productsCreated = 0;
    let productsUpdated = 0;

    try {
      this.logger.info({ config }, 'Starting catalog extraction');

      // Get all product links
      const { products } = await this.listProducts({
        limit: 1000,
        offset: 0,
      });

      // Extract details for each product with retry
      const results = await Promise.allSettled(
        products.map((product) =>
          this.queue.add(() =>
            pRetry(() => this.getProduct(product.sku), {
              retries: config.retryAttempts,
              minTimeout: config.retryDelay,
            })
          )
        )
      );

      // Process results
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          productsExtracted++;
          // TODO: Check if product exists in DB and increment created/updated
          productsCreated++;
        } else {
          errors.push({
            sku: products[index]?.sku,
            message: result.reason?.message || 'Unknown error',
            stack: result.reason?.stack,
          });
        }
      });

      return {
        distributor: 'fortlev',
        status: errors.length === 0 ? 'success' : 'partial',
        productsExtracted,
        productsUpdated,
        productsCreated,
        productsError: errors.length,
        errors,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error({ error }, 'Catalog extraction failed');
      throw error;
    }
  }

  /**
   * Check stock for multiple SKUs
   */
  protected async checkStock(skus: string[]): Promise<{ [sku: string]: number }> {
    const stockMap: { [sku: string]: number } = {};

    await Promise.allSettled(
      skus.map(async (sku) => {
        try {
          const product = await this.getProduct(sku);
          stockMap[sku] = product.stock.available;
        } catch (error) {
          this.logger.warn({ sku, error }, 'Failed to check stock');
          stockMap[sku] = 0;
        }
      })
    );

    return stockMap;
  }

  /**
   * Get available categories
   */
  protected async getCategories(): Promise<string[]> {
    return [
      'painel_solar',
      'inversor',
      'estrutura',
      'cabo',
      'conector',
      'string_box',
      'microinversor',
      'kit_completo',
    ];
  }

  /**
   * Get product schema
   */
  protected getProductSchema(): any {
    return {
      type: 'object',
      required: ['sku', 'title', 'category', 'manufacturer'],
      properties: {
        sku: { type: 'string' },
        title: { type: 'string' },
        category: { type: 'string' },
        manufacturer: { type: 'string' },
        model: { type: 'string' },
        pricing: { type: 'object' },
        stock: { type: 'object' },
      },
    };
  }

  /**
   * Helper: Extract SKU from URL
   */
  private extractSKUFromURL(url: string): string {
    const match = url.match(/\/produto\/([^/?]+)/);
    return match?.[1] || url.split('/').pop() || '';
  }

  /**
   * Helper: Map Fortlev family to category
   */
  private mapFamilyToCategory(family: string): Product['category'] | null {
    const familyMap: Record<string, Product['category']> = {
      'module': 'painel_solar',
      'inverter': 'inversor',
      'microinverter': 'microinversor',
      'structure': 'estrutura',
      'cable': 'cabo',
      'connector': 'conector',
      'string_box': 'string_box',
      'battery': 'bateria',
      'miscellaneous': 'outros',
    };
    return familyMap[family] || null;
  }

  /**
   * Helper: Categorize product from title
   */
  private categorizeProduct(title: string): Product['category'] {
    const lower = title.toLowerCase();
    if (lower.includes('painel') || lower.includes('módulo')) return 'painel_solar';
    if (lower.includes('inversor') && !lower.includes('micro')) return 'inversor';
    if (lower.includes('microinversor') || lower.includes('micro inversor')) return 'microinversor';
    if (lower.includes('estrutura') || lower.includes('trilho') || lower.includes('suporte')) return 'estrutura';
    if (lower.includes('cabo') || lower.includes('fio')) return 'cabo';
    if (lower.includes('conector') || lower.includes('mc4')) return 'conector';
    if (lower.includes('string box') || lower.includes('stringbox')) return 'string_box';
    if (lower.includes('bateria')) return 'bateria';
    if (lower.includes('kit')) return 'kit_completo';
    if (lower.includes('duto') || lower.includes('corrugado')) return 'outros';
    return 'outros';
  }

  /**
   * Helper: Extract manufacturer
   */
  private extractManufacturer(title: string): string {
    const brands = [
      'Canadian Solar',
      'Jinko',
      'Trina',
      'JA Solar',
      'LONGi',
      'Growatt',
      'Solis',
      'Fronius',
      'SMA',
      'Huawei',
      'Deye',
      'Hoymiles',
    ];
    for (const brand of brands) {
      if (title.toLowerCase().includes(brand.toLowerCase())) {
        return brand;
      }
    }
    return title.split(' ')[0];
  }

  /**
   * Helper: Extract model
   */
  private extractModel(title: string): string {
    const match = title.match(/\b([A-Z0-9-]+\d+[A-Z0-9-]*)\b/);
    return match?.[1] || '';
  }

  /**
   * Helper: Parse price string to number
   */
  private parsePrice(priceStr: string): number {
    const cleaned = priceStr.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
  }

  /**
   * Helper: Parse stock string to number
   */
  private parseStock(stockStr: string): number {
    const match = stockStr.match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  /**
   * Cleanup
   */
  async shutdown(): Promise<void> {
    await this.browser?.close();
    await super.shutdown();
  }
}

// Start server
const server = new FortlevMCPServer({
  name: 'fortlev-solar-mcp',
  version: '1.0.0',
  distributor: 'fortlev',
  credentials: {
    distributor: 'fortlev',
    email: process.env.FORTLEV_EMAIL || 'fernando.teixeira@yello.cash',
    password: process.env.FORTLEV_PASSWORD || '@Botapragirar2025',
    baseUrl: 'https://fortlevsolar.app/',
  },
});

server.start().catch(console.error);

// Handle shutdown
process.on('SIGINT', async () => {
  await server.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.shutdown();
  process.exit(0);
});
