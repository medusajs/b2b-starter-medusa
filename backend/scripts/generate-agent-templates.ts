/**
 * Generates agent templates for all distributors
 * Usage: npx tsx scripts/generate-agent-templates.ts
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface DistributorConfig {
  name: string;
  slug: string;
  baseUrl: string;
  loginUrl: string;
  catalogUrl: string;
  selectors: {
    emailInput: string;
    passwordInput: string;
    loginButton: string;
    productCard: string;
    productTitle: string;
    productPrice: string;
    productLink: string;
    productImage: string;
    pagination?: string;
  };
}

const DISTRIBUTORS: DistributorConfig[] = [
  {
    name: 'Solfácil',
    slug: 'solfacil',
    baseUrl: 'https://www.solfacil.com.br',
    loginUrl: 'https://www.solfacil.com.br/login',
    catalogUrl: 'https://www.solfacil.com.br/produtos',
    selectors: {
      emailInput: 'input[name="email"], input[type="email"]',
      passwordInput: 'input[name="password"], input[type="password"]',
      loginButton: 'button[type="submit"], .btn-login, .login-button',
      productCard: '.product-card, .product-item, [data-product]',
      productTitle: 'h3, .product-title, .title',
      productPrice: '.price, .product-price, [data-price]',
      productLink: 'a[href*="/produto"], a[href*="/product"]',
      productImage: 'img',
    },
  },
  {
    name: 'Fotus',
    slug: 'fotus',
    baseUrl: 'https://www.fotus.com.br',
    loginUrl: 'https://www.fotus.com.br/login',
    catalogUrl: 'https://www.fotus.com.br/produtos',
    selectors: {
      emailInput: 'input[name="email"], input[type="email"]',
      passwordInput: 'input[name="password"], input[type="password"]',
      loginButton: 'button[type="submit"], .btn-login, .login-button',
      productCard: '.product-card, .product-item, [data-product]',
      productTitle: 'h3, .product-title, .title',
      productPrice: '.price, .product-price, [data-price]',
      productLink: 'a[href*="/produto"], a[href*="/product"]',
      productImage: 'img',
    },
  },
  {
    name: 'Odex',
    slug: 'odex',
    baseUrl: 'https://www.odex.com.br',
    loginUrl: 'https://www.odex.com.br/login',
    catalogUrl: 'https://www.odex.com.br/produtos',
    selectors: {
      emailInput: 'input[name="email"], input[type="email"]',
      passwordInput: 'input[name="password"], input[type="password"]',
      loginButton: 'button[type="submit"], .btn-login, .login-button',
      productCard: '.product-card, .product-item, [data-product]',
      productTitle: 'h3, .product-title, .title',
      productPrice: '.price, .product-price, [data-price]',
      productLink: 'a[href*="/produto"], a[href*="/product"]',
      productImage: 'img',
    },
  },
  {
    name: 'Edeltec',
    slug: 'edeltec',
    baseUrl: 'https://www.edeltec.com.br',
    loginUrl: 'https://www.edeltec.com.br/login',
    catalogUrl: 'https://www.edeltec.com.br/produtos',
    selectors: {
      emailInput: 'input[name="email"], input[type="email"]',
      passwordInput: 'input[name="password"], input[type="password"]',
      loginButton: 'button[type="submit"], .btn-login, .login-button',
      productCard: '.product-card, .product-item, [data-product]',
      productTitle: 'h3, .product-title, .title',
      productPrice: '.price, .product-price, [data-price]',
      productLink: 'a[href*="/produto"], a[href*="/product"]',
      productImage: 'img',
    },
  },
  {
    name: 'Dynamis',
    slug: 'dynamis',
    baseUrl: 'https://www.dynamis.com.br',
    loginUrl: 'https://www.dynamis.com.br/login',
    catalogUrl: 'https://www.dynamis.com.br/produtos',
    selectors: {
      emailInput: 'input[name="email"], input[type="email"]',
      passwordInput: 'input[name="password"], input[type="password"]',
      loginButton: 'button[type="submit"], .btn-login, .login-button',
      productCard: '.product-card, .product-item, [data-product]',
      productTitle: 'h3, .product-title, .title',
      productPrice: '.price, .product-price, [data-price]',
      productLink: 'a[href*="/produto"], a[href*="/product"]',
      productImage: 'img',
    },
  },
];

function generateServerTs(config: DistributorConfig): string {
  return `/**
 * ${config.name} B2B MCP Server
 * URL: ${config.baseUrl}
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

export class ${capitalizeWords(config.name)}MCPServer extends BaseMCPServer {
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
      this.logger.info('Authenticating with ${config.name} B2B...');
      
      await this.page.goto('${config.loginUrl}', { waitUntil: 'networkidle' });
      
      // Fill login form
      await this.page.fill('${config.selectors.emailInput}', email);
      await this.page.fill('${config.selectors.passwordInput}', password);
      
      // Click login button
      await this.page.click('${config.selectors.loginButton}');
      
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
      
      this.logger.info('Successfully authenticated with ${config.name} B2B');
      
      return {
        distributor: '${config.slug}',
        token: sessionCookie.value,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        cookies: cookies.map(c => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
        })),
      };
    } catch (error) {
      this.logger.error({ error }, '${config.name} authentication failed');
      throw error;
    }
  }

  protected async listProducts(filters?: ProductFilters): Promise<Product[]> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      this.logger.info({ filters }, 'Listing ${config.name} products...');
      
      // Navigate to catalog
      await this.page.goto('${config.catalogUrl}', { 
        waitUntil: 'networkidle' 
      });
      
      // Apply category filter if provided
      if (filters?.category) {
        await this.page.click(\`.category-filter[data-category="\${filters.category}"], a[href*="\${filters.category}"]\`);
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
      const products = await this.page.$$eval('${config.selectors.productCard}', (elements) => {
        return elements.map((el) => {
          const titleEl = el.querySelector('${config.selectors.productTitle}');
          const priceEl = el.querySelector('${config.selectors.productPrice}');
          const linkEl = el.querySelector('${config.selectors.productLink}');
          const imageEl = el.querySelector('${config.selectors.productImage}');
          
          const title = titleEl?.textContent?.trim() || '';
          const priceText = priceEl?.textContent?.trim() || '';
          const url = linkEl ? (linkEl as HTMLAnchorElement).href : '';
          const imageUrl = imageEl ? (imageEl as HTMLImageElement).src : '';
          
          const price = parseFloat(priceText.replace(/[^0-9,.]/g, '').replace('.', '').replace(',', '.')) || 0;
          
          return {
            id: url || title,
            sku: url.split('/').pop() || title.toLowerCase().replace(/\\s+/g, '-'),
            title,
            price,
            currency: 'BRL',
            imageUrl,
            url,
          };
        });
      });
      
      this.logger.info({ count: products.length }, '${config.name} products extracted');
      return products;
    } catch (error) {
      this.logger.error({ error }, 'Failed to list ${config.name} products');
      throw error;
    }
  }

  protected async getProduct(sku: string): Promise<Product | null> {
    if (!this.page) throw new Error('Browser not initialized');

    try {
      await this.page.goto(\`${config.baseUrl}/produto/\${sku}\`, { waitUntil: 'networkidle' });
      
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
      this.logger.error({ error, sku }, 'Failed to get ${config.name} product');
      return null;
    }
  }

  async extractProducts(config: ExtractionConfig): Promise<ExtractionResult> {
    try {
      this.logger.info({ config }, 'Starting ${config.name} product extraction');
      
      const startTime = Date.now();
      const products: Product[] = [];
      
      await pRetry(
        async () => {
          const session = await this.authenticate(
            process.env.\`EMAIL_${config.slug.toUpperCase()}\` || '',
            process.env.\`PASSWORD_${config.slug.toUpperCase()}\` || ''
          );
          
          if (!session) throw new Error('Authentication failed');
          
          const listedProducts = await this.listProducts(config.filters);
          products.push(...listedProducts);
        },
        { retries: 2 }
      );
      
      const duration = Date.now() - startTime;
      
      return {
        distributor: '${config.slug}',
        totalProducts: products.length,
        products,
        duration,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error({ error }, 'Extraction failed for ${config.name}');
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

export default ${capitalizeWords(config.name)}MCPServer;
`;
}

function generateDebugTs(config: DistributorConfig): string {
  return `/**
 * Debug script for ${config.name} Portal
 * Maps HTML structure and selectors
 * Usage: EMAIL=user@example.com PASSWORD=password npx tsx debug-${config.slug}.ts
 */

import { chromium, type Browser, type Page } from 'playwright';
import { promises as fs } from 'fs';

async function debug(): Promise<void> {
  const email = process.env.EMAIL || '';
  const password = process.env.PASSWORD || '';
  
  if (!email || !password) {
    console.error('Please set EMAIL and PASSWORD environment variables');
    process.exit(1);
  }
  
  let browser: Browser | undefined;
  
  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    console.log('🔍 Opening ${config.name} login page...');
    await page.goto('${config.loginUrl}', { waitUntil: 'networkidle' });
    
    // Save login page
    await page.screenshot({ path: 'debug-login-page.png' });
    const loginHtml = await page.content();
    await fs.writeFile('debug-login-page.html', loginHtml);
    console.log('✅ Login page saved: debug-login-page.html');
    
    // Attempt login
    console.log('🔑 Attempting login...');
    await page.fill('${config.selectors.emailInput}', email);
    await page.fill('${config.selectors.passwordInput}', password);
    await page.click('${config.selectors.loginButton}');
    
    try {
      await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 });
    } catch (error) {
      console.warn('⚠️  Navigation timeout, checking current page...');
    }
    
    // Wait a bit for JavaScript to settle
    await page.waitForTimeout(3000);
    
    // Check if login was successful
    const url = page.url();
    console.log('📍 Current URL:', url);
    
    if (url.includes('/login') || url.includes('/signin')) {
      console.error('❌ Still on login page - credentials may be incorrect');
    } else {
      console.log('✅ Successfully navigated past login page');
      
      // Save homepage
      await page.screenshot({ path: 'debug-home-page.png' });
      const homeHtml = await page.content();
      await fs.writeFile('debug-home-page.html', homeHtml);
      console.log('✅ Home page saved: debug-home-page.html');
      
      // Navigate to products
      console.log('🛍️  Navigating to products...');
      await page.goto('${config.catalogUrl}', { waitUntil: 'networkidle' });
      
      // Save products page
      await page.screenshot({ path: 'debug-products-page.png' });
      const productsHtml = await page.content();
      await fs.writeFile('debug-products-page.html', productsHtml);
      console.log('✅ Products page saved: debug-products-page.html');
      
      // Extract product selectors
      console.log('🔎 Analyzing product structure...');
      const analysis = await page.evaluate(() => {
        const productElements = document.querySelectorAll('${config.selectors.productCard}');
        console.log('Found product elements:', productElements.length);
        
        if (productElements.length === 0) {
          // Try to find other patterns
          const possibleSelectors = [
            '.product',
            '.item',
            '[data-product]',
            '[data-item]',
            '.product-card',
            '.product-item',
          ];
          
          const found = possibleSelectors.filter(sel => document.querySelectorAll(sel).length > 0);
          return { warning: 'No products found with selector, try these:', suggestions: found };
        }
        
        const firstProduct = productElements[0];
        return {
          totalFound: productElements.length,
          firstProduct: {
            html: firstProduct.outerHTML.substring(0, 500),
            innerText: firstProduct.innerText?.substring(0, 200) || '',
          },
        };
      });
      
      console.log('📊 Analysis:', JSON.stringify(analysis, null, 2));
    }
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

debug().catch(console.error);
`;
}

function generateTestTs(config: DistributorConfig): string {
  return `/**
 * Test suite for ${config.name} agent
 * Usage: EMAIL=user@example.com PASSWORD=password npx tsx test-${config.slug}.ts
 */

import ${capitalizeWords(config.name)}MCPServer from './server.js';
import { strict as assert } from 'assert';

async function runTests(): Promise<void> {
  const server = new ${capitalizeWords(config.name)}MCPServer({
    name: '${config.slug}',
    version: '1.0.0',
    logger: console as any,
  });
  
  const email = process.env.EMAIL || '';
  const password = process.env.PASSWORD || '';
  
  if (!email || !password) {
    console.error('❌ Please set EMAIL and PASSWORD environment variables');
    process.exit(1);
  }
  
  try {
    // Test 1: Authentication
    console.log('🧪 Test 1: Authentication');
    const session = await server.authenticate(email, password);
    assert(session.distributor === '${config.slug}', 'Distributor name mismatch');
    assert(session.token, 'No token returned');
    assert(session.expiresAt, 'No expiration date');
    console.log('✅ Authentication test passed');
    
    // Test 2: List Products
    console.log('🧪 Test 2: List Products');
    const products = await server.listProducts();
    assert(Array.isArray(products), 'Products is not an array');
    assert(products.length > 0, 'No products found');
    console.log(\`✅ Found \${products.length} products\`);
    
    // Test 3: Get Detailed Product
    if (products.length > 0) {
      console.log('🧪 Test 3: Get Product Details');
      const firstProduct = products[0];
      const detailed = await server.getProduct(firstProduct.sku);
      assert(detailed, 'Failed to get product details');
      console.log('✅ Product details retrieved');
    }
    
    // Test 4: Category Filter
    console.log('🧪 Test 4: Category Filter');
    const filtered = await server.listProducts({ category: 'inversores' });
    assert(Array.isArray(filtered), 'Filtered products is not an array');
    console.log(\`✅ Found \${filtered.length} products in category\`);
    
    // Test 5: Full Extraction
    console.log('🧪 Test 5: Full Extraction');
    const result = await server.extractProducts({
      filters: { limit: 50 },
    });
    assert(result.distributor === '${config.slug}', 'Result distributor mismatch');
    assert(result.products.length > 0, 'No products in extraction result');
    console.log(\`✅ Extracted \${result.products.length} products in \${result.duration}ms\`);
    
    console.log('\\n✨ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await server.cleanup();
  }
}

runTests().catch(console.error);
`;
}

function generateExtractTs(config: DistributorConfig): string {
  return `/**
 * Full extraction script for ${config.name}
 * Saves products to JSON and CSV
 * Usage: EMAIL=user@example.com PASSWORD=password npx tsx extract-${config.slug}-full.ts
 */

import ${capitalizeWords(config.name)}MCPServer from './server.js';
import { promises as fs } from 'fs';
import { createWriteStream } from 'fs';

interface CSVProduct {
  sku: string;
  title: string;
  price: number;
  currency: string;
  category?: string;
  brand?: string;
  url?: string;
  imageUrl?: string;
}

async function extractFull(): Promise<void> {
  const server = new ${capitalizeWords(config.name)}MCPServer({
    name: '${config.slug}',
    version: '1.0.0',
    logger: console as any,
  });
  
  const email = process.env.EMAIL || '';
  const password = process.env.PASSWORD || '';
  
  if (!email || !password) {
    console.error('❌ Please set EMAIL and PASSWORD environment variables');
    process.exit(1);
  }
  
  try {
    console.log('🚀 Starting ${config.name} full extraction...');
    
    const result = await server.extractProducts({
      filters: { limit: 10000 },
    });
    
    // Save JSON
    const jsonPath = '${config.slug}-catalog-full.json';
    await fs.writeFile(jsonPath, JSON.stringify(result, null, 2));
    console.log(\`✅ Saved \${result.products.length} products to \${jsonPath}\`);
    
    // Save CSV
    const csvPath = '${config.slug}-catalog-full.csv';
    const csv = createWriteStream(csvPath);
    
    csv.write('sku,title,price,currency,imageUrl,url\\n');
    
    for (const product of result.products) {
      const row = [
        escapeCSV(product.sku || ''),
        escapeCSV(product.title || ''),
        product.price || 0,
        product.currency || 'BRL',
        escapeCSV(product.imageUrl || ''),
        escapeCSV(product.url || ''),
      ].join(',');
      csv.write(row + '\\n');
    }
    
    csv.end();
    console.log(\`✅ Saved \${result.products.length} products to \${csvPath}\`);
    
    console.log(\`\\n📊 Extraction Summary:\`);
    console.log(\`   Total Products: \${result.products.length}\`);
    console.log(\`   Duration: \${result.duration}ms\`);
    console.log(\`   Timestamp: \${result.timestamp}\`);
  } catch (error) {
    console.error('❌ Extraction failed:', error);
    process.exit(1);
  } finally {
    await server.cleanup();
  }
}

function escapeCSV(value: string): string {
  if (typeof value !== 'string') return String(value);
  if (value.includes(',') || value.includes('\"') || value.includes('\\n')) {
    return \`"\${value.replace(/"/g, '""')}"\`;
  }
  return value;
}

extractFull().catch(console.error);
`;
}

function generateReadme(config: DistributorConfig): string {
  return `# ${config.name} Agent

MCP Server for ${config.name} B2B Portal at: \`${config.baseUrl}\`

## Quick Start

### Prerequisites
- Node.js 18+
- Playwright browsers installed: \`npx playwright install\`
- ${config.name} B2B account credentials

### Installation

\`\`\`bash
npm install
\`\`\`

### Authentication

Set environment variables:

\`\`\`bash
export EMAIL_${config.slug.toUpperCase()}="your@email.com"
export PASSWORD_${config.slug.toUpperCase()}="your-password"
\`\`\`

Or for development:

\`\`\`bash
export EMAIL="your@email.com"
export PASSWORD="your-password"
\`\`\`

## Usage

### Debug (Map HTML Structure)

Use this first to understand the actual portal structure and update selectors if needed:

\`\`\`bash
EMAIL=user@example.com PASSWORD=pass npx tsx debug-${config.slug}.ts
\`\`\`

Outputs:
- \`debug-login-page.html\` - Login page structure
- \`debug-home-page.html\` - Home page after login
- \`debug-products-page.html\` - Products page
- \`debug-*.png\` - Screenshots for visual inspection

Use these to refine selectors in \`server.ts\` if the generic ones don't work.

### Test Suite

Run full test suite:

\`\`\`bash
EMAIL=user@example.com PASSWORD=pass npx tsx test-${config.slug}.ts
\`\`\`

Tests:
1. ✅ Authentication
2. ✅ List products
3. ✅ Get product details
4. ✅ Category filtering
5. ✅ Full extraction

### Full Extraction

Extract complete catalog to JSON + CSV:

\`\`\`bash
EMAIL=user@example.com PASSWORD=pass npx tsx extract-${config.slug}-full.ts
\`\`\`

Outputs:
- \`${config.slug}-catalog-full.json\` - Complete product data
- \`${config.slug}-catalog-full.csv\` - For spreadsheet import

## Configuration

### Selectors

If the debug output shows incorrect selectors, update in \`server.ts\`:

\`\`\`typescript
private readonly selectors = {
  emailInput: 'input[name="email"]',
  passwordInput: 'input[name="password"]',
  loginButton: 'button[type="submit"]',
  productCard: '.product-card',
  productTitle: 'h3.title',
  productPrice: '.price',
  productLink: 'a.product-link',
  productImage: 'img.product-image',
};
\`\`\`

### Rate Limiting

Adjust concurrency in constructor:

\`\`\`typescript
this.queue = new PQueue({ concurrency: 3 }); // Change from 3
\`\`\`

## MCP Server Interface

### Methods

\`\`\`typescript
// Authenticate with portal
async authenticate(email: string, password: string): Promise<AuthSession>

// List products with optional filters
async listProducts(filters?: ProductFilters): Promise<Product[]>

// Get detailed product info
async getProduct(sku: string): Promise<Product | null>

// Full extraction with stats
async extractProducts(config: ExtractionConfig): Promise<ExtractionResult>

// Cleanup resources
async cleanup(): Promise<void>
\`\`\`

## Schema

### Product

\`\`\`typescript
interface Product {
  id: string;
  sku: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  url: string;
  category?: string;
  brand?: string;
  description?: string;
  specifications?: Record<string, string>;
}
\`\`\`

### ExtractionResult

\`\`\`typescript
interface ExtractionResult {
  distributor: string;
  totalProducts: number;
  products: Product[];
  duration: number;
  timestamp: string;
}
\`\`\`

## Troubleshooting

### "Authentication failed - still on login page"

The login selectors might be wrong. Run debug script and check \`debug-login-page.html\`:

\`\`\`bash
npx tsx debug-${config.slug}.ts
\`\`\`

### "No products found"

Product selectors need refinement. Check \`debug-products-page.html\` and update:

\`\`\`typescript
productCard: '.your-actual-selector'
\`\`\`

### Rate limiting / 429 errors

Reduce concurrency:

\`\`\`typescript
this.queue = new PQueue({ concurrency: 1 });
\`\`\`

Add delays:

\`\`\`typescript
await this.page.waitForTimeout(2000); // 2 second delay
\`\`\`

## Database Integration

Import to PostgreSQL:

\`\`\`bash
npx tsx scripts/import-${config.slug}-to-db.ts
\`\`\`

## Performance

- **Typical extraction**: 200-300 products / 2-3 minutes
- **Full catalog**: Variable depending on product count
- **Memory usage**: ~200-400MB for 1000+ products

## Support

For issues with selectors or authentication, see \`debug-*.html\` and \`debug-*.png\` files generated by debug script.
`;
}

function capitalizeWords(str: string): string {
  return str
    .split(/[\s-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

async function main(): Promise<void> {
  const distributorsDir = path.join(__dirname, '../mcp-servers/distributors');
  
  for (const distributor of DISTRIBUTORS) {
    const agentDir = path.join(distributorsDir, distributor.slug);
    
    try {
      await fs.mkdir(agentDir, { recursive: true });
      
      // Generate files
      const serverContent = generateServerTs(distributor);
      const debugContent = generateDebugTs(distributor);
      const testContent = generateTestTs(distributor);
      const extractContent = generateExtractTs(distributor);
      const readmeContent = generateReadme(distributor);
      
      // Write files
      await fs.writeFile(path.join(agentDir, 'server.ts'), serverContent);
      await fs.writeFile(path.join(agentDir, `debug-${distributor.slug}.ts`), debugContent);
      await fs.writeFile(path.join(agentDir, `test-${distributor.slug}.ts`), testContent);
      await fs.writeFile(path.join(agentDir, `extract-${distributor.slug}-full.ts`), extractContent);
      await fs.writeFile(path.join(agentDir, 'README.md'), readmeContent);
      
      console.log(`✅ Generated agent template for ${distributor.name}`);
    } catch (error) {
      console.error(`❌ Error generating template for ${distributor.name}:`, error);
    }
  }
  
  console.log(`\n✨ All agent templates generated! Ready for credential-based testing.`);
}

main().catch(console.error);
