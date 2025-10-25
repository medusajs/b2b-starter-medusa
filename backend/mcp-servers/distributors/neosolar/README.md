# Neosolar Portal B2B - MCP Server

Servidor MCP (Model Context Protocol) para extração de produtos do Portal B2B Neosolar.

## 🔗 URL Base
```
https://portalb2b.neosolar.com.br/
```

## 📁 Estrutura de Arquivos

```
mcp-servers/distributors/neosolar/
├── server.ts                  # Implementação do MCP Server
├── debug-neosolar.ts          # Script de debug/mapeamento HTML
├── test-neosolar.ts           # Testes unitários
├── extract-neosolar-full.ts   # Extração completa do catálogo
└── README.md                  # Esta documentação
```

## 🚀 Uso

### 1. Debug - Mapear Estrutura HTML

Primeiro, execute o script de debug para mapear os seletores HTML:

```bash
# Sem credenciais (apenas captura login page)
npx tsx mcp-servers/distributors/neosolar/debug-neosolar.ts

# Com credenciais (explora páginas autenticadas)
EMAIL=seu@email.com PASSWORD=suasenha npx tsx mcp-servers/distributors/neosolar/debug-neosolar.ts
```

**Saída:**
- `debug-login-page.html` - HTML da página de login
- `debug-home-page.html` - HTML da home autenticada (se credenciais fornecidas)
- `debug-screenshot.png` - Screenshot da página

### 2. Testar Ferramentas

Execute testes para validar autenticação e extração:

```bash
EMAIL=seu@email.com PASSWORD=suasenha npx tsx mcp-servers/distributors/neosolar/test-neosolar.ts
```

**Testes executados:**
1. ✅ Autenticação
2. ✅ Listar produtos (primeira página)
3. ✅ Obter detalhes de produto
4. ✅ Buscar produtos
5. ✅ Extração em lote

### 3. Extração Completa

Extraia o catálogo completo de produtos:

```bash
EMAIL=seu@email.com PASSWORD=suasenha npx tsx mcp-servers/distributors/neosolar/extract-neosolar-full.ts
```

**Saída:**
- `mcp-servers/neosolar-catalog-full.json` - Catálogo completo em JSON
- `mcp-servers/neosolar-catalog-full.csv` - Catálogo completo em CSV

## 📊 Formato de Dados

### Product Schema

```typescript
{
  sku: string;                    // SKU único do produto
  distributor: 'neosolar';        // Nome do distribuidor
  title: string;                  // Título do produto
  description?: string;           // Descrição detalhada
  category: string;               // Categoria (Inversor, Módulo, etc.)
  manufacturer?: string;          // Fabricante/Marca
  model?: string;                 // Modelo do produto
  technicalSpecs: {               // Especificações técnicas
    specifications?: string[];
    originalUrl?: string;
  };
  pricing: {
    currency: 'BRL';
    amount: number;               // Preço em reais
    validUntil: string;           // ISO date
  };
  availability: {
    inStock: boolean;
    quantity: number | null;
  };
  images: string[];               // URLs das imagens
  lastUpdated: string;            // ISO date
}
```

### Extraction Result Schema

```typescript
{
  distributor: 'neosolar';
  totalProducts: number;
  products: Product[];
  extractedAt: string;            // ISO date
  duration: number;               // Duração em segundos
  stats: {
    categoryCounts: {             // Produtos por categoria
      [category: string]: number;
    };
    priceStats: {
      min: number;
      max: number;
      avg: number;
      median: number;
    };
  };
}
```

## 🛠️ Configuração

### Variáveis de Ambiente

```bash
EMAIL=seu@email.com          # Email de login no Portal B2B
PASSWORD=suasenha            # Senha de login
```

### Configuração do Server

```typescript
const server = new NeosolarMCPServer({
  distributor: 'neosolar',
  // Outras configurações...
});
```

## 📝 Tarefas Pendentes

Após executar `debug-neosolar.ts`, atualize os seletores em `server.ts`:

### Seletores a Verificar

1. **Login Form**
   - Campo email: `input[type="email"]` ou outro?
   - Campo senha: `input[type="password"]` ou outro?
   - Botão submit: `button[type="submit"]` ou outro?

2. **Product Listing**
   - Container de produtos: `.product-card`, `.product-item` ou outro?
   - SKU: `[class*="sku"]` ou outro?
   - Título: `.product-title` ou outro?
   - Preço: `.price` ou outro?
   - Imagem: `img` dentro do card
   - Link do produto: `a[href*="produto"]` ou outro?

3. **Product Details**
   - Título: `h1` ou outro?
   - Descrição: `.description` ou outro?
   - Especificações: `.spec-item` ou outro?
   - Galeria de imagens: `img[src*="produto"]` ou outro?

4. **Paginação**
   - Container: `.pagination` ou outro?
   - Botão próxima página: `.next`, `[rel="next"]` ou outro?

## 🔄 Fluxo de Trabalho

1. **Debug** → Mapear seletores HTML
2. **Atualizar** → Ajustar seletores em `server.ts`
3. **Testar** → Executar `test-neosolar.ts`
4. **Extrair** → Executar `extract-neosolar-full.ts`
5. **Persistir** → Importar para PostgreSQL (próxima etapa)

## 📦 Dependências

- `playwright` - Browser automation
- `p-queue` - Rate limiting
- `p-retry` - Retry logic
- `pino` - Logging

## 🎯 Próximos Passos

1. Executar debug e mapear seletores
2. Atualizar `server.ts` com seletores corretos
3. Testar extração
4. Criar script de importação para PostgreSQL (similar a `import-fortlev-to-db.ts`)
5. Integrar com Temporal workflows

## 📚 Referências

- [Fortlev Server](../fortlev/server.ts) - Template de referência
- [BaseMCPServer](../../shared/base/mcp-server.ts) - Classe base
- [Playwright Docs](https://playwright.dev/) - Documentação do Playwright
