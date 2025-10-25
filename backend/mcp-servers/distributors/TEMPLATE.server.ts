/**
 * DISTRIBUTOR_TEMPLATE_PLACEHOLDER - MCP Server
 * URL: DISTRIBUTOR_BASE_URL
 * 
 * Este é um template que deve ser customizado para cada distribuidor.
 * Substitua DISTRIBUTOR_PLACEHOLDER pelos valores reais.
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

export class DISTRIBUTOR_CLASSMCPServer extends BaseMCPServer {
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
      this.logger.info('Authenticating with DISTRIBUTOR_NAME...');
      
      // TODO: Update login URL
      await this.page.goto('DISTRIBUTOR_LOGIN_URL', { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });

      // TODO: Update selectors based on debug output
      const emailField = this.page.locator('input[type="email"], input[name*="email"]').first();
      const passwordField = this.page.locator('input[type="password"]').first();
      
      await emailField.fill(email);
      await passwordField.fill(password);

      await Promise.all([
        this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }),
        this.page.locator('button[type="submit"]').first().click(),
      ]);

      const currentUrl = this.page.url();
      const isLoggedIn = !currentUrl.includes('/login');

      if (!isLoggedIn) {
        const errorMsg = await this.page
          .locator('.alert-danger, .error, .message-error')
          .first()
          .textContent()
          .catch(() => 'Unknown error');
        throw new Error(`Authentication failed. ${errorMsg}`);
      }

      const cookies = await this.page.context().cookies();
      const cookieMap = cookies.reduce(
        (acc, cookie) => {
          acc[cookie.name] = cookie.value;
          return acc;
        },
        {} as Record<string, string>
      );

      this.session = {
        distributor: 'DISTRIBUTOR_ID',
        cookies: cookieMap,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isValid: true,
      };

      this.logger.info('Successfully authenticated');
      return this.session;
    } catch (error) {
      this.logger.error({ error }, 'Authentication failed');
      throw error;
    }
  }

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

      // TODO: Update product listing URL
      const url = new URL('DISTRIBUTOR_PRODUCTS_URL');
      if (filters.search) url.searchParams.set('q', filters.search);
      if (filters.page) url.searchParams.set('page', filters.page.toString());

      await this.page.goto(url.toString(), {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      await this.page.waitForTimeout(3000);

      // TODO: Update product card selector
      const products = await this.page.$$eval(
        '.product-card, .product-item, [class*="product"]',
        (elements) =>
          elements.map((el) => {
            const codeEl = el.querySelector('[class*="sku"], [class*="code"]');
            const titleEl = el.querySelector('h2, h3, .product-title');
            const priceEl = el.querySelector('.price, [class*="price"]');
            const imageEl = el.querySelector('img');
            const brandEl = el.querySelector('.brand, [class*="brand"]');
            const categoryEl = el.querySelector('.category, [class*="category"]');

            return {
              code: codeEl?.textContent?.trim() || '',
              title: titleEl?.textContent?.trim() || '',
              price: priceEl?.textContent?.trim() || '',
              image: (imageEl as HTMLImageElement)?.src || '',
              brand: brandEl?.textContent?.trim() || '',
              category: categoryEl?.textContent?.trim() || '',
            };
          })
      );

      const validProducts = products.filter((p) => p.title);

      const normalizedProducts: Product[] = validProducts.map((p) => {
        const priceValue = parseFloat(
          p.price.replace(/[^\d,]/g, '').replace(',', '.')
        ) || 0;

        return {
          sku: p.code || `DISTRIBUTOR_${this.generateId()}`,
          distributor: 'DISTRIBUTOR_ID',
          title: p.title,
          category: p.category || this.categorizeProduct(p.title),
          manufacturer: p.brand || this.extractManufacturer(p.title),
          model: this.extractModel(p.title),
          pricing: {
            currency: 'BRL',
            amount: priceValue,
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          availability: {
            inStock: true,
            quantity: null,
          },
          images: p.image ? [p.image] : [],
          lastUpdated: new Date().toISOString(),
        };
      });

      return {
        products: normalizedProducts,
        total: normalizedProducts.length,
      };
    } catch (error) {
      this.logger.error({ error }, 'Failed to list products');
      throw error;
    }
  }

  protected async getProduct(sku: string): Promise<Product | null> {
    if (!this.session?.isValid) {
      throw new Error('Not authenticated');
    }

    await this.initBrowser();
    if (!this.page) throw new Error('Browser not initialized');

    try {
      this.logger.info({ sku }, 'Getting product details');

      // TODO: Update product search URL
      const searchUrl = `DISTRIBUTOR_PRODUCTS_URL?q=${encodeURIComponent(sku)}`;
      await this.page.goto(searchUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });

      const productLink = this.page
        .locator('a[href*="produto"], a[href*="product"]')
        .first();

      if ((await productLink.count()) === 0) {
        return null;
      }

      await productLink.click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(2000);

      const productData = await this.page.evaluate(() => ({
        title: document.querySelector('h1')?.textContent?.trim() || '',
        price: document.querySelector('.price, [class*="price"]')?.textContent?.trim() || '',
        description: document.querySelector('.description')?.textContent?.trim() || '',
        images: Array.from(document.querySelectorAll('img[src*="produto"], img[src*="product"]')).map(
          (img) => (img as HTMLImageElement).src
        ),
      }));

      const priceValue = parseFloat(
        productData.price.replace(/[^\d,]/g, '').replace(',', '.')
      ) || 0;

      return {
        sku,
        distributor: 'DISTRIBUTOR_ID',
        title: productData.title,
        description: productData.description || undefined,
        category: this.categorizeProduct(productData.title),
        manufacturer: this.extractManufacturer(productData.title),
        pricing: {
          currency: 'BRL',
          amount: priceValue,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        availability: {
          inStock: true,
          quantity: null,
        },
        images: productData.images,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error({ error, sku }, 'Failed to get product');
      return null;
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
      this.page = undefined;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(7);
  }
}
