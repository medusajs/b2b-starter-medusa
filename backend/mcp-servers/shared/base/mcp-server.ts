/**
 * Base MCP Server para distribuidores solares
 * Implementa Model Context Protocol com tools, resources e prompts
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import type {
  DistributorCredentials,
  Product,
  ExtractionResult,
  ExtractionConfig,
  AuthSession,
  ProductFilters,
} from '../types/distributor.js';
import pino from 'pino';

export interface MCPServerConfig {
  name: string;
  version: string;
  distributor: string;
  credentials: DistributorCredentials;
}

export abstract class BaseMCPServer {
  protected server: Server;
  protected logger: pino.Logger;
  protected config: MCPServerConfig;
  protected session?: AuthSession;

  constructor(config: MCPServerConfig) {
    this.config = config;
    this.logger = pino({
      name: config.name,
      level: process.env.LOG_LEVEL || 'info',
    });

    this.server = new Server(
      {
        name: config.name,
        version: config.version,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  /**
   * Setup MCP protocol handlers
   */
  private setupHandlers(): void {
    // Tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return this.callTool(name, args || {});
    });

    // Resources handler
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: this.getResources(),
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      return this.readResource(uri);
    });

    // Prompts handler
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: this.getPrompts(),
    }));

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return this.getPrompt(name, args || {});
    });
  }

  /**
   * Define available tools
   */
  protected getTools() {
    return [
      {
        name: 'authenticate',
        description: 'Authenticate with distributor platform',
        inputSchema: {
          type: 'object',
          properties: {
            email: { type: 'string' },
            password: { type: 'string' },
          },
          required: ['email', 'password'],
        },
      },
      {
        name: 'list_products',
        description: 'List products with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            manufacturer: { type: 'string' },
            inStock: { type: 'boolean' },
            limit: { type: 'number', default: 100 },
            offset: { type: 'number', default: 0 },
          },
        },
      },
      {
        name: 'get_product',
        description: 'Get detailed product information',
        inputSchema: {
          type: 'object',
          properties: {
            sku: { type: 'string' },
          },
          required: ['sku'],
        },
      },
      {
        name: 'extract_catalog',
        description: 'Extract full catalog or incremental updates',
        inputSchema: {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['full', 'incremental', 'price-only'],
              default: 'incremental',
            },
            categories: {
              type: 'array',
              items: { type: 'string' },
            },
            batchSize: { type: 'number', default: 50 },
          },
        },
      },
      {
        name: 'check_stock',
        description: 'Check product availability',
        inputSchema: {
          type: 'object',
          properties: {
            skus: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['skus'],
        },
      },
    ];
  }

  /**
   * Define available resources
   */
  protected getResources() {
    return [
      {
        uri: `catalog://${this.config.distributor}/schema`,
        name: 'Product Schema',
        description: 'JSON schema for product data',
        mimeType: 'application/json',
      },
      {
        uri: `catalog://${this.config.distributor}/sitemap`,
        name: 'Site Map',
        description: 'Navigation structure of distributor site',
        mimeType: 'application/json',
      },
      {
        uri: `catalog://${this.config.distributor}/categories`,
        name: 'Product Categories',
        description: 'Available product categories',
        mimeType: 'application/json',
      },
    ];
  }

  /**
   * Define available prompts
   */
  protected getPrompts() {
    return [
      {
        name: 'product-extraction',
        description: 'Extract product data from page',
        arguments: [
          {
            name: 'url',
            description: 'Product page URL',
            required: true,
          },
        ],
      },
      {
        name: 'price-comparison',
        description: 'Compare prices across products',
        arguments: [
          {
            name: 'skus',
            description: 'Product SKUs to compare',
            required: true,
          },
        ],
      },
    ];
  }

  /**
   * Call a tool - must be implemented by subclasses
   */
  protected async callTool(name: string, args: any): Promise<any> {
    this.logger.info({ tool: name, args }, 'Calling tool');

    switch (name) {
      case 'authenticate':
        return this.authenticate(args.email, args.password);
      case 'list_products':
        return this.listProducts(args);
      case 'get_product':
        return this.getProduct(args.sku);
      case 'extract_catalog':
        return this.extractCatalog(args);
      case 'check_stock':
        return this.checkStock(args.skus);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  /**
   * Read a resource - must be implemented by subclasses
   */
  protected async readResource(uri: string): Promise<any> {
    this.logger.info({ uri }, 'Reading resource');

    if (uri.endsWith('/schema')) {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(this.getProductSchema(), null, 2),
          },
        ],
      };
    }

    if (uri.endsWith('/categories')) {
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(await this.getCategories(), null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  }

  /**
   * Get a prompt - must be implemented by subclasses
   */
  protected async getPrompt(name: string, args: any): Promise<any> {
    this.logger.info({ prompt: name, args }, 'Getting prompt');

    // Implementar templates de prompts específicos
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Prompt: ${name} with args: ${JSON.stringify(args)}`,
          },
        },
      ],
    };
  }

  /**
   * Abstract methods - must be implemented by subclasses
   */
  protected abstract authenticate(
    email: string,
    password: string
  ): Promise<AuthSession>;

  protected abstract listProducts(
    filters: ProductFilters
  ): Promise<{ products: Product[]; total: number }>;

  protected abstract getProduct(sku: string): Promise<Product>;

  protected abstract extractCatalog(
    config: ExtractionConfig
  ): Promise<ExtractionResult>;

  protected abstract checkStock(
    skus: string[]
  ): Promise<{ [sku: string]: number }>;

  protected abstract getCategories(): Promise<string[]>;

  protected abstract getProductSchema(): any;

  /**
   * Start the MCP server
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    this.logger.info(
      {
        distributor: this.config.distributor,
        name: this.config.name,
        version: this.config.version,
      },
      'MCP Server started'
    );
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down MCP server');
    await this.server.close();
  }
}
