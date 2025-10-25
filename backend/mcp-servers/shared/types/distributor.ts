/**
 * Tipos compartilhados para MCP Servers de Distribuidores
 */

import { z } from 'zod';

/**
 * Credenciais de autenticação
 */
export const DistributorCredentialsSchema = z.object({
  distributor: z.enum([
    'fortlev',
    'neosolar',
    'solfacil',
    'fotus',
    'odex',
    'edeltec',
    'dynamis',
  ]),
  email: z.string().email(),
  password: z.string(),
  baseUrl: z.string().url(),
});

export type DistributorCredentials = z.infer<typeof DistributorCredentialsSchema>;

/**
 * Produto normalizado
 */
export const ProductSchema = z.object({
  // Identificação
  sku: z.string(),
  distributor: z.string(),
  distributorProductId: z.string().optional(),
  
  // Informações básicas
  title: z.string(),
  description: z.string().optional(),
  category: z.enum([
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
  ]),
  
  // Fabricante
  manufacturer: z.string(),
  model: z.string(),
  
  // Especificações técnicas
  technicalSpecs: z.record(z.string(), z.any()),
  
  // Preços
  pricing: z.object({
    retail: z.number().optional(),
    wholesale: z.number().optional(),
    promotional: z.number().optional(),
    currency: z.string().default('BRL'),
    lastUpdated: z.string().datetime(),
  }),
  
  // Estoque
  stock: z.object({
    available: z.number(),
    reserved: z.number().default(0),
    warehouse: z.string().optional(),
    leadTime: z.number().optional(), // dias
  }),
  
  // Imagens
  images: z.array(z.string().url()),
  
  // Documentos
  documents: z.array(z.object({
    type: z.enum(['datasheet', 'manual', 'certificate', 'warranty']),
    url: z.string().url(),
    name: z.string(),
  })).optional(),
  
  // Metadata
  metadata: z.record(z.string(), z.any()).optional(),
  
  // Timestamps
  extractedAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Product = z.infer<typeof ProductSchema>;

/**
 * Resultado de extração
 */
export const ExtractionResultSchema = z.object({
  distributor: z.string(),
  status: z.enum(['success', 'partial', 'failed']),
  productsExtracted: z.number(),
  productsUpdated: z.number(),
  productsCreated: z.number(),
  productsError: z.number(),
  errors: z.array(z.object({
    sku: z.string().optional(),
    message: z.string(),
    stack: z.string().optional(),
  })),
  duration: z.number(), // milisegundos
  timestamp: z.string().datetime(),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

/**
 * Configuração de extração
 */
export const ExtractionConfigSchema = z.object({
  distributor: z.string(),
  mode: z.enum(['full', 'incremental', 'price-only']),
  categories: z.array(z.string()).optional(),
  batchSize: z.number().default(50),
  concurrency: z.number().default(3),
  timeout: z.number().default(30000), // ms
  retryAttempts: z.number().default(3),
  retryDelay: z.number().default(1000), // ms
});

export type ExtractionConfig = z.infer<typeof ExtractionConfigSchema>;

/**
 * Sessão de autenticação
 */
export const AuthSessionSchema = z.object({
  distributor: z.string(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  cookies: z.record(z.string(), z.string()).optional(),
  expiresAt: z.string().datetime(),
  isValid: z.boolean(),
});

export type AuthSession = z.infer<typeof AuthSessionSchema>;

/**
 * Mapeamento de categorias por distribuidor
 */
export interface CategoryMapping {
  [distributor: string]: {
    [normalizedCategory: string]: string[];
  };
}

/**
 * Status do MCP Server
 */
export const MCPServerStatusSchema = z.object({
  distributor: z.string(),
  status: z.enum(['online', 'offline', 'degraded']),
  lastSync: z.string().datetime().optional(),
  lastError: z.string().optional(),
  metrics: z.object({
    totalProducts: z.number(),
    successRate: z.number(),
    avgExtractionTime: z.number(),
    errorRate: z.number(),
  }),
});

export type MCPServerStatus = z.infer<typeof MCPServerStatusSchema>;

/**
 * Filtros de busca
 */
export const ProductFiltersSchema = z.object({
  category: z.string().optional(),
  manufacturer: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  inStock: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.number().default(100),
  offset: z.number().default(0),
});

export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
