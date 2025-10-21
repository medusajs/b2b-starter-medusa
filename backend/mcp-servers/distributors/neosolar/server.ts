/**
 * Neosolar B2B MCP Server
 * URL: https://portalb2b.neosolar.com.br/
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

export class NeosolarMCPServer extends BaseMCPServer {
  private browser?: Browser;
  private page?: Page;
  private queue: PQueue;

  constructor(config: MCPServerConfig) {
    super(config);
    this.queue = new PQueue({ concurrency: 3 });
  }

  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      this.page = await this.browser.newPage();
      
      await this.page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      });
    }
  }

  protected async authenticate(email: string, password: string): Promise<AuthSession> {
    await this.initBrowser();
    if (!this.page) throw new Error('Browser not initialized');

    try {
      this.logger.info('Authenticating with Neosolar B2B...');
      
      await this.page.goto('https://portalb2b.neosolar.com.br/', { waitUntil: 'networkidle' });
      
      // Fill login form
      await this.page.fill('input[name="email"], input[type="email"]', email);
      await this.page.fill('input[name="password"], input[type="password"]', password);
      
      // Click login button
      await this.page.click('button[type="submit"], .btn-login, .login-button');
      
      // Wait for navigation after login
      await this.page.waitForLoadState('networkidle');
      
      // Check if login was successful
      const isLoggedIn = await this.page.evaluate(() => {
        return !window.location.href.includes('/login') && 
               (document.querySelector('.user-menu') !== null ||
                document.querySelector('.profile') !== null ||
                document.querySelector('.products, .catalog') !== null);
      });
      
      if (!isLoggedIn) {
        throw new Error('Authentication failed - still on login page');
      }
      
      // Extract session cookies
      const cookies = await this.page.context().cookies();
      const sessionCookie = cookies.find(c => 
        c.name.toLowerCase().includes('session') || 
        c.name.toLowerCase().includes('token') ||
        c.name.toLowerCase().includes('auth')
      );
      
      if (!sessionCookie) {
        throw new Error('No session cookie found after login');
      }
      
      this.logger.info('Successfully authenticated with Neosolar B2B');
      
      return {
        distributor: 'neosolar',
        token: sessionCookie.value,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        cookies: cookies.map(c => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
        })),
      };
    } catch (error) {
      this.logger.error({ error }, 'Neosolar authentication failed');
      throw error;
    }
  }

  protected async listProducts(filters?: ProductFilters): Promise<Product[]> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      this.logger.info({ filters }, 'Listing Neosolar products...');
      
      // Navigate to catalog
      await this.page.goto('https://portalb2b.neosolar.com.br/produtos', { 
        waitUntil: 'networkidle' 
      });
      
      // Apply category filter if provided
      if (filters?.category) {
        await this.page.click(`a[href*="${filters.category}"], .category-filter[data-category="${filters.category}"]`);
        await this.page.waitForLoadState('networkidle');
      }
      
      // Scroll to load all products
      await this.page.evaluate(async () => {
        for (let i = 0; i < 5; i++) {
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      });
      
      // Extract product list
      const products = await this.page.$$eval('.product-card, .product-item, [data-product]', (elements) => {
        return elements.map((el) => {
          const titleEl = el.querySelector('h3, .product-title, .title');
          const priceEl = el.querySelector('.price, .product-price, [data-price]');
          const linkEl = el.querySelector('a[href*="/produto"], a[href*="/product"]');
          const imageEl = el.querySelector('img');
          
          const title = titleEl?.textContent?.trim() || '';
          const priceText = priceEl?.textContent?.trim() || '';
          const url = linkEl ? (linkEl as HTMLAnchorElement).href : '';
          const imageUrl = imageEl ? (imageEl as HTMLImageElement).src : '';
          
          // Extract SKU from URL or data attribute
          let sku = '';
          if (url) {
            const skuMatch = url.match(/\/produto[s]?\/([^\/]+)/);
            sku = skuMatch ? skuMatch[1] : '';
          }
          if (!sku) {
            sku = el.getAttribute('data-sku') || el.getAttribute('data-id') || '';
          }
          
          return {
            sku,
            title,
            url,
            imageUrl,
            priceText,
          };
        });
      });
      
      // Parse and enrich products
      const enrichedProducts: Product[] = products
        .filter(p => p.sku && p.title)
        .map(p => ({
          distributor: 'neosolar',
          sku: p.sku,
          title: p.title,
          url: p.url,
          description: '',
          category: this.categorizeProduct(p.title),
          manufacturer: this.extractManufacturer(p.title),
          model: this.extractModel(p.title),
          price: this.parsePrice(p.priceText),
          stock: { available: true, quantity: null, reserved: 0 },
          specifications: {},
          images: p.imageUrl ? [p.imageUrl] : [],
          datasheet_url: null,
          last_updated: new Date().toISOString(),
        }));
      
      this.logger.info({ count: enrichedProducts.length }, 'Neosolar products listed');
      return enrichedProducts;
    } catch (error) {
      this.logger.error({ error }, 'Failed to list Neosolar products');
      throw error;
    }
  }

  protected async getProduct(sku: string): Promise<Product | null> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      this.logger.info({ sku }, 'Fetching Neosolar product details...');
      
      // Navigate to product page
      await this.page.goto(`https://portalb2b.neosolar.com.br/produto/${sku}`, {
        waitUntil: 'networkidle',
      });
      
      // Check if product exists
      const notFound = await this.page.locator('text=/não encontrado|404/i').count() > 0;
      if (notFound) {
        this.logger.warn({ sku }, 'Neosolar product not found');
        return null;
      }
      
      // Extract product details
      const product = await this.page.evaluate(() => {
        const title = document.querySelector('h1, .product-title')?.textContent?.trim() || '';
        const description = document.querySelector('.description, .product-description')?.textContent?.trim() || '';
        const priceEl = document.querySelector('.price, .product-price, [data-price]');
        const priceText = priceEl?.textContent?.trim() || '';
        
        // Extract images
        const images: string[] = [];
        document.querySelectorAll('.product-image img, .gallery img').forEach(img => {
          const src = (img as HTMLImageElement).src;
          if (src && !images.includes(src)) {
            images.push(src);
          }
        });
        
        // Extract specifications
        const specs: Record<string, string> = {};
        document.querySelectorAll('.spec-row, .specification, [data-spec]').forEach(row => {
          const label = row.querySelector('.spec-label, .label, dt')?.textContent?.trim();
          const value = row.querySelector('.spec-value, .value, dd')?.textContent?.trim();
          if (label && value) {
            specs[label] = value;
          }
        });
        
        // Extract datasheet URL
        const datasheetLink = document.querySelector('a[href*=".pdf"], a[download]');
        const datasheet_url = datasheetLink ? (datasheetLink as HTMLAnchorElement).href : null;
        
        // Extract stock info
        const stockText = document.querySelector('.stock, .availability')?.textContent?.trim() || '';
        
        return {
          title,
          description,
          priceText,
          images,
          specs,
          datasheet_url,
          stockText,
        };
      });
      
      const enrichedProduct: Product = {
        distributor: 'neosolar',
        sku,
        title: product.title,
        url: this.page.url(),
        description: product.description,
        category: this.categorizeProduct(product.title),
        manufacturer: this.extractManufacturer(product.title),
        model: this.extractModel(product.title),
        price: this.parsePrice(product.priceText),
        stock: this.parseStock(product.stockText),
        specifications: product.specs,
        images: product.images,
        datasheet_url: product.datasheet_url,
        last_updated: new Date().toISOString(),
      };
      
      this.logger.info({ sku }, 'Neosolar product details fetched');
      return enrichedProduct;
    } catch (error) {
      this.logger.error({ error, sku }, 'Failed to fetch Neosolar product');
      return null;
    }
  }

  protected async extractCatalog(config: ExtractionConfig): Promise<ExtractionResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info({ config }, 'Starting Neosolar catalog extraction...');
      
      // Authenticate first
      if (!this.page) {
        await this.authenticate(
          process.env.NEOSOLAR_EMAIL!,
          process.env.NEOSOLAR_PASSWORD!
        );
      }
      
      // List all products
      const products = await this.listProducts(config.filters);
      
      // Extract full details if requested
      let detailedProducts: Product[] = [];
      if (config.full_details) {
        this.logger.info({ total: products.length }, 'Extracting full product details...');
        
        const detailTasks = products.slice(0, config.max_products).map(p =>
          this.queue.add(() =>
            pRetry(
              () => this.getProduct(p.sku),
              {
                retries: 3,
                minTimeout: 1000,
                maxTimeout: 30000,
                onFailedAttempt: (error) => {
                  this.logger.warn(
                    { sku: p.sku, attempt: error.attemptNumber },
                    'Retry fetching product details'
                  );
                },
              }
            )
          )
        );
        
        const results = await Promise.allSettled(detailTasks);
        detailedProducts = results
          .filter((r): r is PromiseFulfilledResult<Product | null> => r.status === 'fulfilled')
          .map(r => r.value)
          .filter((p): p is Product => p !== null);
      }
      
      const finalProducts = config.full_details ? detailedProducts : products;
      const duration = Date.now() - startTime;
      
      const result: ExtractionResult = {
        distributor: 'neosolar',
        timestamp: new Date().toISOString(),
        total_products: finalProducts.length,
        products: finalProducts,
        duration_ms: duration,
        errors: [],
      };
      
      this.logger.info(
        { total: result.total_products, duration },
        'Neosolar catalog extraction completed'
      );
      
      return result;
    } catch (error) {
      this.logger.error({ error }, 'Neosolar catalog extraction failed');
      throw error;
    }
  }

  protected async checkStock(sku: string): Promise<{ available: boolean; quantity: number | null; reserved: number }> {
    const product = await this.getProduct(sku);
    return product?.stock || { available: false, quantity: null, reserved: 0 };
  }

  protected getCategories(): string[] {
    return [
      'painel_solar',
      'inversor',
      'estrutura',
      'cabo',
      'conector',
      'string_box',
      'bateria',
      'microinversor',
      'kit_completo',
      'outros',
    ];
  }

  protected getProductSchema(): Record<string, unknown> {
    return {
      type: 'object',
      properties: {
        sku: { type: 'string' },
        title: { type: 'string' },
        category: { type: 'string' },
        manufacturer: { type: 'string' },
        model: { type: 'string' },
        price: { type: 'number' },
        stock: { type: 'object' },
        specifications: { type: 'object' },
      },
      required: ['sku', 'title', 'category'],
    };
  }

  private categorizeProduct(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('painel') || lower.includes('módulo') || lower.includes('placa solar')) return 'painel_solar';
    if (lower.includes('inversor') && !lower.includes('micro')) return 'inversor';
    if (lower.includes('microinversor') || lower.includes('micro inversor')) return 'microinversor';
    if (lower.includes('estrutura') || lower.includes('suporte')) return 'estrutura';
    if (lower.includes('cabo') || lower.includes('fio')) return 'cabo';
    if (lower.includes('conector') || lower.includes('mc4')) return 'conector';
    if (lower.includes('string box') || lower.includes('stringbox')) return 'string_box';
    if (lower.includes('bateria') || lower.includes('acumulador')) return 'bateria';
    if (lower.includes('kit')) return 'kit_completo';
    return 'outros';
  }

  private extractManufacturer(title: string): string {
    const manufacturers = ['Canadian Solar', 'Jinko', 'Trina', 'JA Solar', 'Growatt', 'Fronius', 'Sungrow', 'Huawei'];
    for (const manufacturer of manufacturers) {
      if (title.toLowerCase().includes(manufacturer.toLowerCase())) {
        return manufacturer;
      }
    }
    return 'Unknown';
  }

  private extractModel(title: string): string {
    const modelMatch = title.match(/\b([A-Z0-9]{3,}[-]?[A-Z0-9]+)\b/);
    return modelMatch ? modelMatch[1] : 'Unknown';
  }

  private parsePrice(priceText: string): number {
    const cleaned = priceText.replace(/[^\d,]/g, '').replace(',', '.');
    const price = parseFloat(cleaned);
    return isNaN(price) ? 0 : price;
  }

  private parseStock(stockText: string): { available: boolean; quantity: number | null; reserved: number } {
    const lower = stockText.toLowerCase();
    if (lower.includes('indisponível') || lower.includes('fora de estoque')) {
      return { available: false, quantity: 0, reserved: 0 };
    }
    
    const quantityMatch = stockText.match(/(\d+)/);
    if (quantityMatch) {
      return { available: true, quantity: parseInt(quantityMatch[1]), reserved: 0 };
    }
    
    return { available: true, quantity: null, reserved: 0 };
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
      this.page = undefined;
    }
  }
}
