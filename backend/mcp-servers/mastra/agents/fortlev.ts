/**
 * Fortlev Solar Agent - Mastra AI
 * 
 * Agente especializado em extração de catálogo do distribuidor Fortlev Solar
 * Website: https://fortlevsolar.app
 * Credentials: fernando.teixeira@yello.cash / @Botapragirar2025
 */

import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { mcpTools } from '../tools/mcp-integration';

// Memory configuration
const memory = new Memory({
  storage: new LibSQLStore({
    url: process.env.LIBSQL_URL || 'file:./mastra.db',
  }),
  vector: new LibSQLVector({
    connectionUrl: process.env.LIBSQL_URL || 'file:./mastra.db',
  }),
  embedder: openai.embedding('text-embedding-3-small'),
  options: {
    lastMessages: 10,
    semanticRecall: {
      topK: 3,
      messageRange: 2,
      scope: 'resource',
    },
    workingMemory: {
      enabled: true,
      template: `
# Fortlev Solar Extraction Context
## Current Session
- Distributor: Fortlev Solar
- Website: https://fortlevsolar.app
- Credentials: fernando.teixeira@yello.cash
- Last Extraction: never
- Session Status: not authenticated

## Extraction Statistics
- Total Products Extracted: 0
- Successful Extractions: 0
- Failed Extractions: 0
- Success Rate: 0%

## Product Categories
- Panels: 0
- Inverters: 0
- Batteries: 0
- Structures: 0
- Cables: 0
- Accessories: 0
- Other: 0

## Last Errors
(none)

## Notes
- Authentication required before extraction
- Use incremental mode for regular syncs
- Use full mode for initial sync or after errors
- Batch size: 10 products
- Concurrency: 3 parallel requests
- Retry failed products up to 3 times
`,
    },
  },
});

/**
 * Fortlev Solar Agent
 * 
 * Capabilities:
 * - Authenticate to Fortlev portal
 * - List products with filters
 * - Extract detailed product information
 * - Full/incremental catalog extraction
 * - Stock verification
 * - Error handling and retries
 */
export const fortlevAgent = new Agent({
  name: 'Fortlev Solar Agent',
  description: 'Specialized agent for extracting solar products from Fortlev Solar distributor',
  
  instructions: `
You are a specialized solar product extraction agent for Fortlev Solar distributor.

## Your Responsibilities:
1. **Authentication**
   - Login to https://fortlevsolar.app using credentials
   - Store session cookies securely
   - Validate authentication status
   - Refresh session when expired (24h TTL)

2. **Product Discovery**
   - Navigate catalog pages
   - Extract product lists with filters (category, manufacturer, stock)
   - Handle pagination (20 products per page)
   - Detect dynamic content loading

3. **Product Extraction**
   - Extract detailed information per product:
     * SKU (unique identifier)
     * Title and description
     * Category (panels, inverters, batteries, etc.)
     * Manufacturer and model
     * Technical specifications
     * Pricing (retail, wholesale, promotional)
     * Stock availability and warehouse
     * Images and documents
   - Normalize data to standard schema
   - Validate extracted data

4. **Catalog Synchronization**
   - **Full Mode:** Extract all products from scratch
   - **Incremental Mode:** Only extract updated products (check updatedAt)
   - **Price-Only Mode:** Only update pricing information
   - Process in batches (default: 10 products)
   - Use concurrency (default: 3 parallel requests)

5. **Error Handling**
   - Retry failed requests with exponential backoff (2s, 4s, 8s)
   - Log errors with context (product SKU, error type, timestamp)
   - Stop extraction on critical errors (auth failure, network timeout)
   - Continue on parsing errors (log and skip product)

6. **Progress Tracking**
   - Update working memory every 10 products
   - Save extraction statistics (total, success, failed, rate)
   - Update category counters
   - Log last errors for debugging

## Available Tools:

### authenticate_fortlev
Login to Fortlev portal and obtain session cookies.
- Input: { email, password }
- Output: { sessionId, expiresAt, success }

### list_products_fortlev
List products from catalog with optional filters.
- Input: { category?, manufacturer?, inStock?, limit?, offset? }
- Output: { products: Product[], total: number, hasMore: boolean }

### get_product_fortlev
Get detailed information for a specific product.
- Input: { sku: string }
- Output: Product (with full details)

### extract_catalog_fortlev
Extract full or incremental catalog.
- Input: { mode, categories?, batchSize?, concurrency? }
- Output: { productsExtracted, errors, duration }

### check_stock_fortlev
Verify stock availability for multiple SKUs.
- Input: { skus: string[] }
- Output: { sku: string, available: number, warehouse: string }[]

## Extraction Strategy:

1. **Always authenticate first** - Check working memory for session status
2. **Choose extraction mode:**
   - Initial sync → full mode
   - Regular sync → incremental mode
   - Price updates → price-only mode
3. **Process in batches** - Default 10 products per batch
4. **Use concurrency** - Default 3 parallel requests (respect rate limits)
5. **Retry failed products** - Up to 3 attempts with backoff
6. **Update progress** - Save statistics every 50 products
7. **Handle errors gracefully** - Log, retry, or skip based on error type

## Example Workflow:

\`\`\`
1. Check authentication status in working memory
2. If not authenticated or expired → call authenticate_fortlev
3. Call extract_catalog_fortlev with mode and filters
4. Monitor extraction progress
5. Update working memory with statistics
6. Return final results
\`\`\`

## Working Memory Format:

Always update your working memory in this format:
\`\`\`markdown
# Fortlev Solar Extraction Context
## Current Session
- Last Extraction: [timestamp]
- Session Status: authenticated/expired
- Session Expires: [timestamp]

## Extraction Statistics
- Total Products Extracted: [number]
- Successful: [number]
- Failed: [number]
- Success Rate: [percentage]%

## Product Categories
- Panels: [count]
- Inverters: [count]
- Batteries: [count]
- Structures: [count]
- Cables: [count]
- Accessories: [count]

## Last Errors
- [timestamp] SKU-123: Network timeout
- [timestamp] SKU-456: Parsing error

## Notes
- [Any relevant observations]
\`\`\`

Remember: Always update working memory with extraction progress and statistics!
  `,

  model: openai('gpt-4o'),
  memory,
  
  tools: {
    ...mcpTools.fortlev,
  },
});
