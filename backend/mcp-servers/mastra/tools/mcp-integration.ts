/**
 * MCP Tools Integration - Mastra AI
 * 
 * Cria Mastra Tools que integram com MCP Servers existentes
 * Permite que agentes Mastra invoquem ferramentas MCP de forma transparente
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { FortlevMCPServer } from '../../distributors/fortlev/server';
import type { ProductFilters, ExtractionConfig } from '../../shared/types/distributor';

/**
 * Singleton MCP Server Instances
 * 
 * Reutiliza instâncias de MCP servers para evitar reconexões
 */
const mcpServers = {
  fortlev: new FortlevMCPServer({
    credentials: {
      email: process.env.FORTLEV_EMAIL!,
      password: process.env.FORTLEV_PASSWORD!,
    },
  }),
  // TODO: Adicionar outros distribuidores conforme implementação
  // neosolar: new NeosolarMCPServer({ ... }),
  // solfacil: new SolfacilMCPServer({ ... }),
  // etc.
};

/**
 * Fortlev Tools
 * 
 * Tools Mastra que integram com Fortlev MCP Server
 */
export const fortlevTools = {
  /**
   * authenticate_fortlev
   * 
   * Autentica no portal Fortlev Solar e obtém sessão
   */
  authenticate_fortlev: createTool({
    id: 'authenticate_fortlev',
    description: 'Authenticate to Fortlev Solar portal and obtain session cookies',
    inputSchema: z.object({
      email: z.string().email().describe('Login email'),
      password: z.string().min(8).describe('Login password'),
    }),
    execute: async ({ context }) => {
      try {
        const result = await mcpServers.fortlev.authenticate(
          context.email,
          context.password
        );
        return {
          success: true,
          sessionId: result.sessionId,
          expiresAt: result.expiresAt,
          message: 'Authentication successful',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
        };
      }
    },
  }),

  /**
   * list_products_fortlev
   * 
   * Lista produtos do catálogo Fortlev com filtros opcionais
   */
  list_products_fortlev: createTool({
    id: 'list_products_fortlev',
    description: 'List products from Fortlev catalog with optional filters',
    inputSchema: z.object({
      category: z
        .enum(['panels', 'inverters', 'batteries', 'structures', 'cables', 'accessories', 'all'])
        .optional()
        .describe('Product category filter'),
      manufacturer: z.string().optional().describe('Manufacturer name filter'),
      inStock: z.boolean().optional().describe('Filter only in-stock products'),
      limit: z.number().min(1).max(100).default(20).describe('Number of products to return'),
      offset: z.number().min(0).default(0).describe('Pagination offset'),
    }),
    execute: async ({ context }) => {
      try {
        const filters: ProductFilters = {
          category: context.category as any,
          manufacturer: context.manufacturer,
          inStock: context.inStock,
          limit: context.limit,
          offset: context.offset,
        };

        const products = await mcpServers.fortlev.listProducts(filters);

        return {
          success: true,
          products,
          total: products.length,
          hasMore: products.length === context.limit,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to list products',
          products: [],
        };
      }
    },
  }),

  /**
   * get_product_fortlev
   * 
   * Obtém informações detalhadas de um produto específico
   */
  get_product_fortlev: createTool({
    id: 'get_product_fortlev',
    description: 'Get detailed information for a specific product by SKU',
    inputSchema: z.object({
      sku: z.string().describe('Product SKU (unique identifier)'),
    }),
    execute: async ({ context }) => {
      try {
        const product = await mcpServers.fortlev.getProduct(context.sku);

        if (!product) {
          return {
            success: false,
            error: `Product with SKU ${context.sku} not found`,
          };
        }

        return {
          success: true,
          product,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get product',
        };
      }
    },
  }),

  /**
   * extract_catalog_fortlev
   * 
   * Extrai catálogo completo ou incremental do Fortlev
   */
  extract_catalog_fortlev: createTool({
    id: 'extract_catalog_fortlev',
    description: 'Extract full or incremental catalog from Fortlev Solar',
    inputSchema: z.object({
      mode: z
        .enum(['full', 'incremental', 'price-only'])
        .default('incremental')
        .describe('Extraction mode: full (all products), incremental (updated only), price-only (prices only)'),
      categories: z
        .array(z.string())
        .optional()
        .describe('Filter by categories (empty = all categories)'),
      batchSize: z
        .number()
        .min(1)
        .max(50)
        .default(10)
        .describe('Number of products to process per batch'),
      concurrency: z
        .number()
        .min(1)
        .max(5)
        .default(3)
        .describe('Number of parallel requests'),
      timeout: z
        .number()
        .min(5000)
        .max(60000)
        .default(30000)
        .describe('Request timeout in milliseconds'),
      retryAttempts: z
        .number()
        .min(1)
        .max(5)
        .default(3)
        .describe('Number of retry attempts on failure'),
      retryDelay: z
        .number()
        .min(1000)
        .max(10000)
        .default(2000)
        .describe('Delay between retries in milliseconds'),
    }),
    execute: async ({ context }) => {
      try {
        const config: ExtractionConfig = {
          mode: context.mode as any,
          categories: context.categories,
          batchSize: context.batchSize,
          concurrency: context.concurrency,
          timeout: context.timeout,
          retryAttempts: context.retryAttempts,
          retryDelay: context.retryDelay,
        };

        const result = await mcpServers.fortlev.extractCatalog(config);

        return {
          success: result.status === 'completed',
          productsExtracted: result.productsProcessed,
          productsSuccess: result.productsSuccess,
          productsFailed: result.productsFailed,
          errors: result.errors,
          duration: result.duration,
          timestamp: result.timestamp,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Extraction failed',
          productsExtracted: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
      }
    },
  }),

  /**
   * check_stock_fortlev
   * 
   * Verifica disponibilidade de estoque para múltiplos SKUs
   */
  check_stock_fortlev: createTool({
    id: 'check_stock_fortlev',
    description: 'Check stock availability for multiple product SKUs',
    inputSchema: z.object({
      skus: z.array(z.string()).min(1).max(50).describe('Array of product SKUs to check'),
    }),
    execute: async ({ context }) => {
      try {
        const stockData = await mcpServers.fortlev.checkStock(context.skus);

        return {
          success: true,
          stockData,
          total: stockData.length,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to check stock',
          stockData: [],
        };
      }
    },
  }),
};

/**
 * All MCP Tools
 * 
 * Exporta todos os tools disponíveis organizados por distribuidor
 */
export const mcpTools = {
  fortlev: fortlevTools,
  // TODO: Adicionar tools de outros distribuidores
  // neosolar: neosolarTools,
  // solfacil: solfacilTools,
  // fotus: fotusTools,
  // odex: odexTools,
  // edeltec: edeltecTools,
  // dynamis: dynamisTools,
};

/**
 * Get all tools for a distributor
 * 
 * @param distributor - Distributor name
 * @returns Tools object
 */
export function getDistributorTools(
  distributor: 'fortlev' | 'neosolar' | 'solfacil' | 'fotus' | 'odex' | 'edeltec' | 'dynamis'
): Record<string, any> {
  return mcpTools[distributor] || {};
}

/**
 * Cleanup MCP Servers
 * 
 * Fecha conexões e libera recursos dos MCP servers
 */
export async function cleanupMCPServers(): Promise<void> {
  await Promise.all([
    mcpServers.fortlev.shutdown(),
    // TODO: Adicionar cleanup de outros servers
  ]);
}
