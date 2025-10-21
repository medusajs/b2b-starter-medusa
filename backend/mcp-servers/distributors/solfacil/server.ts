/**
 * Solfácil B2B MCP Server
 * URL: https://www.solfacil.com.br
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

export class SolfácilMCPServer extends BaseMCPServer {
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
      this.logger.info(this.messages.auth.authenticating);
      
      await this.page.goto('https://www.solfacil.com.br/login', { waitUntil: 'networkidle' });
      
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
      
      this.logger.info(this.messages.auth.authenticated);
      
      return {
        distributor: 'solfacil',
        token: sessionCookie.value,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        cookies: cookies.map(c => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
        })),
      };
    } catch (error) {
      this.logger.error({ error }, this.messages.auth.failed);
      throw error;
    }
  }

  protected async listProducts(filters?: ProductFilters): Promise<Product[]> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      this.logger.info({ filters }, this.messages.products.listing);
      
      // Navigate to catalog
      await this.page.goto('https://www.solfacil.com.br/produtos', { 
        waitUntil: 'networkidle' 
      });
      
      // Apply category filter if provided
      if (filters?.category) {
        await this.page.click(`.category-filter[data-category="${filters.category}"], a[href*="${filters.category}"]`);
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
          
          const price = parseFloat(priceText.replace(/[^0-9,.]/g, '').replace('.', '').replace(',', '.')) || 0;
          
          return {
            id: url || title,
            sku: url.split('/').pop() || title.toLowerCase().replace(/\s+/g, '-'),
            title,
            price,
            currency: 'BRL',
            imageUrl,
            url,
          };
        });
      });
      
      this.logger.info({ count: products.length }, 'Solfácil products extracted');
      return products;
    } catch (error) {
      this.logger.error({ error }, this.messages.products.failed);
      throw error;
    }
  }

  protected async getProduct(sku: string): Promise<Product | null> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      await this.page.goto(`https://www.solfacil.com.br/produto/${sku}`, { waitUntil: 'networkidle' });
      
      const product = await this.page.evaluate(() => {
        const titleEl = document.querySelector('h1, .product-title');
        const priceEl = document.querySelector('[data-price], .price');
        const descEl = document.querySelector('[data-description], .description');
        const imagesEls = document.querySelectorAll('[data-image], .product-image');
        
        return {
          title: titleEl?.textContent?.trim() || '',
          price: parseFloat(priceEl?.textContent?.replace(/[^0-9,.]/g, '').replace('.', '').replace(',', '.') || '0'),
          description: descEl?.textContent?.trim() || '',
          images: Array.from(imagesEls).map(el => (el as HTMLImageElement).src || (el as HTMLElement).dataset.image || ''),
        };
      });
      
      return {
        sku,
        title: product.title,
        price: product.price,
        currency: 'BRL',
        imageUrl: product.images[0] || '',
        url: this.page.url(),
        ...product,
      };
    } catch (error) {
      this.logger.error({ error, sku }, 'Failed to get Solfácil product');
      return null;
    }
  }

  async extractProducts(config: ExtractionConfig): Promise<ExtractionResult> {
    try {
      this.logger.info({ config }, 'Starting Solfácil product extraction');
      
      const startTime = Date.now();
      const products: Product[] = [];
      
      await pRetry(
        async () => {
          const session = await this.authenticate(
            process.env.`EMAIL_SOLFACIL` || '',
            process.env.`PASSWORD_SOLFACIL` || ''
          );
          
          if (!session) throw new Error('Authentication failed');
          
          const listedProducts = await this.listProducts(config.filters);
          products.push(...listedProducts);
        },
        { retries: 2 }
      );
      
      const duration = Date.now() - startTime;
      
      return {
        distributor: 'solfacil',
        totalProducts: products.length,
        products,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error({ error }, 'Extraction failed for Solfácil');
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export default SolfácilMCPServer;
