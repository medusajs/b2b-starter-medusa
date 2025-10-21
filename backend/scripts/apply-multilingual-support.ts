#!/usr/bin/env npx tsx
/**
 * Apply Multilingual Support to All Distributor Servers
 * Aplicar suporte multilíngue a todos os servidores de distribuidores
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distributorsPath = path.join(__dirname, '..', 'mcp-servers', 'distributors');

interface FileChange {
  old: RegExp | string;
  new: string;
}

const changes: FileChange[] = [
  // Logging messages
  {
    old: /this\.logger\.info\(['"`]Authenticating with .* B2B\.\.\.['"` ]\);/g,
    new: "this.logger.info(this.messages.auth.authenticating);",
  },
  {
    old: /this\.logger\.info\(['"`]Successfully authenticated with .* B2B['"`]\);/g,
    new: "this.logger.info(this.messages.auth.authenticated);",
  },
  {
    old: /this\.logger\.error\(\{ error \}, ['"`].* authentication failed['"`]\);/g,
    new: "this.logger.error({ error }, this.messages.auth.failed);",
  },
  {
    old: /this\.logger\.info\(\{ filters \}, ['"`]Listing .* products\.\.\.['"` ]\);/g,
    new: "this.logger.info({ filters }, this.messages.products.listing);",
  },
  {
    old: /this\.logger\.info\(\{ count: .* \}, ['"`].* products listed['"`]\);/g,
    new: "this.logger.info({ count }, this.messages.products.listed);",
  },
  {
    old: /this\.logger\.error\(\{ error \}, ['"`]Failed to list .* products['"`]\);/g,
    new: "this.logger.error({ error }, this.messages.products.failed);",
  },
  {
    old: /this\.logger\.info\(\{ sku \}, ['"`]Fetching .* product details\.\.\.['"` ]\);/g,
    new: "this.logger.info({ sku }, this.messages.products.fetching);",
  },
  {
    old: /this\.logger\.warn\(\{ sku \}, ['"`].* product not found['"`]\);/g,
    new: "this.logger.warn({ sku }, this.messages.products.not_found);",
  },
  {
    old: /this\.logger\.info\(\{ sku \}, ['"`].* product details fetched['"`]\);/g,
    new: "this.logger.info({ sku }, this.messages.products.fetched);",
  },
  {
    old: /this\.logger\.error\(\{ error, sku \}, ['"`]Failed to fetch .* product['"`]\);/g,
    new: "this.logger.error({ error, sku }, this.messages.products.failed);",
  },
  {
    old: /this\.logger\.info\(\{ config \}, ['"`]Starting .* catalog extraction\.\.\.['"` ]\);/g,
    new: "this.logger.info({ config }, this.messages.catalog.extracting);",
  },
  {
    old: /this\.logger\.info\(\{ total: products\.length \}, ['"`]Extracting full product details\.\.\.['"` ]\);/g,
    new: "this.logger.info({ total: products.length }, this.messages.products.full_details);",
  },
  {
    old: /this\.logger\.info\(\s+\{ total: result\.total_products, duration \},\s+['"`].* catalog extraction completed['"`]\s+\);/g,
    new: "this.logger.info(\n        { total: result.total_products, duration },\n        this.messages.catalog.completed\n      );",
  },
  {
    old: /this\.logger\.error\(\{ error \}, ['"`].* catalog extraction failed['"`]\);/g,
    new: "this.logger.error({ error }, this.messages.catalog.failed);",
  },
];

async function applyChanges() {
  try {
    // Get list of distributor directories
    const distributors = fs
      .readdirSync(distributorsPath)
      .filter(
        (f) =>
          fs
            .statSync(path.join(distributorsPath, f))
            .isDirectory() && f !== 'README.md'
      );

    console.log(`Found ${distributors.length} distributors:\n`);

    for (const distributor of distributors) {
      const serverPath = path.join(distributorsPath, distributor, 'server.ts');

      if (!fs.existsSync(serverPath)) {
        console.log(`⚠️  ${distributor}: No server.ts found`);
        continue;
      }

      let content = fs.readFileSync(serverPath, 'utf-8');
      let modified = false;

      for (const change of changes) {
        const regex = typeof change.old === 'string' ? new RegExp(change.old) : change.old;
        if (regex.test(content)) {
          content = content.replace(regex, change.new);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(serverPath, content, 'utf-8');
        console.log(`✅ ${distributor}: Updated with multilingual support`);
      } else {
        console.log(`ℹ️  ${distributor}: Already up-to-date or no matches found`);
      }
    }

    console.log('\n✨ All distributors updated!');
  } catch (error) {
    console.error('Error applying changes:', error);
    process.exit(1);
  }
}

applyChanges();
