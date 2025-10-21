# 🌐 Multilingual Support - Suporte Multilíngue

## Overview

All distributor agents now support **Portuguese (pt-BR) and English (en-US)** for:
- Log messages
- Error handling
- Status reporting
- Category names
- Stock status
- Currency formatting
- Date/time formatting

Todos os agentes de distribuidores agora suportam **Português (pt-BR) e English (en-US)** para:
- Mensagens de log
- Tratamento de erros
- Relatórios de status
- Nomes de categorias
- Status de estoque
- Formatação de moeda
- Formatação de data/hora

## Implementation

### Language Configuration

Each distributor server accepts a `language` parameter in the configuration:

```typescript
const config: MCPServerConfig = {
  name: 'Neosolar MCP Server',
  version: '1.0.0',
  distributor: 'neosolar',
  credentials: { ... },
  language: 'pt', // 'pt' or 'en'
};
```

### Message Keys

#### Authentication Messages (`auth`)
- `authenticating`: "Autenticando com o portal B2B..." / "Authenticating with B2B portal..."
- `authenticated`: "Autenticado com sucesso no portal B2B" / "Successfully authenticated with B2B portal"
- `failed`: "Falha na autenticação do portal B2B" / "B2B portal authentication failed"
- `still_on_login`: "Ainda na página de login após autenticação" / "Still on login page after authentication"
- `no_session`: "Nenhum cookie de sessão encontrado após login" / "No session cookie found after login"

#### Product Messages (`products`)
- `listing`: "Listando produtos..." / "Listing products..."
- `listed`: "Produtos listados com sucesso" / "Products listed successfully"
- `failed`: "Falha ao listar produtos" / "Failed to list products"
- `fetching`: "Buscando detalhes do produto..." / "Fetching product details..."
- `fetched`: "Detalhes do produto obtidos com sucesso" / "Product details fetched successfully"
- `not_found`: "Produto não encontrado" / "Product not found"
- `full_details`: "Extraindo detalhes completos dos produtos..." / "Extracting full product details..."

#### Catalog Messages (`catalog`)
- `extracting`: "Iniciando extração do catálogo..." / "Starting catalog extraction..."
- `completed`: "Extração do catálogo concluída" / "Catalog extraction completed"
- `failed`: "Falha na extração do catálogo" / "Catalog extraction failed"

#### Category Names (`categories`)
- `panel`: "Painel Solar" / "Solar Panel"
- `inverter`: "Inversor" / "Inverter"
- `structure`: "Estrutura" / "Structure"
- `cable`: "Cabo" / "Cable"
- `connector`: "Conector" / "Connector"
- `string_box`: "String Box" / "String Box"
- `battery`: "Bateria" / "Battery"
- `microinverter`: "Microinversor" / "Microinverter"
- `kit`: "Kit Completo" / "Complete Kit"
- `other`: "Outros" / "Other"

#### Stock Messages (`stock`)
- `available`: "Disponível" / "Available"
- `unavailable`: "Indisponível" / "Unavailable"
- `out_of_stock`: "Fora de Estoque" / "Out of Stock"

### Formatting Functions

#### Currency Formatting
```typescript
import { formatCurrency } from '../../shared/types/languages.js';

const price = 1234.56;
formatCurrency(price, 'pt'); // 'R$ 1.234,56'
formatCurrency(price, 'en'); // 'R$ 1,234.56'
```

#### Date Formatting
```typescript
import { formatDate } from '../../shared/types/languages.js';

const date = new Date();
formatDate(date, 'pt'); // '21/10/2025 14:30:45'
formatDate(date, 'en'); // '10/21/2025 2:30:45 PM'
```

## Distributor Support Matrix

| Distributor | Portuguese | English | Status |
|---|---|---|---|
| Neosolar | ✅ | ✅ | Implemented |
| Solfácil | ✅ | ✅ | Implemented |
| Fotus | ✅ | ✅ | Implemented |
| Odex | ✅ | ✅ | Implemented |
| Edeltec | ✅ | ✅ | Implemented |
| Dynamis | ✅ | ✅ | Implemented |
| Fortlev | ✅ | ✅ | Ready |

## Environment Variables

Control default language via environment variable:

```bash
export DEFAULT_LANGUAGE=pt  # or 'en'
```

## Usage Example

### With Portuguese (Default)
```typescript
const server = new NeosolarMCPServer({
  name: 'Neosolar MCP Server',
  version: '1.0.0',
  distributor: 'neosolar',
  credentials: { /* ... */ },
  language: 'pt',
});

// Output:
// "Autenticando com o portal B2B..."
// "Produtos listados com sucesso"
```

### With English
```typescript
const server = new NeosolarMCPServer({
  name: 'Neosolar MCP Server',
  version: '1.0.0',
  distributor: 'neosolar',
  credentials: { /* ... */ },
  language: 'en',
});

// Output:
// "Authenticating with B2B portal..."
// "Products listed successfully"
```

## Adding New Languages

To add a new language (e.g., Spanish):

1. **Update `languages.ts`:**
```typescript
export type Language = 'pt' | 'en' | 'es';

export const messages: Record<Language, I18nMessages> = {
  // ... existing languages ...
  es: {
    auth: {
      authenticating: 'Autenticando con portal B2B...',
      // ... rest of messages ...
    },
    // ... rest of sections ...
  },
};
```

2. **Update distributor configs** to accept the new language

3. **Add tests** for the new language in test suites

## Testing Multilingual Support

Run tests with different languages:

```bash
# Test with Portuguese
LANGUAGE=pt npm run test

# Test with English
LANGUAGE=en npm run test
```

## File Structure

```
mcp-servers/
├── shared/
│   └── types/
│       └── languages.ts          # Multilingual definitions
│       └── distributor.ts        # Type definitions
│       └── index.ts
│   └── base/
│       └── mcp-server.ts         # Base class with language support
├── distributors/
│   ├── neosolar/
│   │   └── server.ts            # Uses this.messages.*
│   ├── solfacil/
│   │   └── server.ts            # Uses this.messages.*
│   └── ...                        # All others
└── scripts/
    └── apply-multilingual-support.ts  # Applied messages to all servers
```

## Best Practices

1. **Always use `this.messages.*` instead of hardcoded strings in logs:**
   ```typescript
   // ✅ Good
   this.logger.info(this.messages.products.listing);

   // ❌ Bad
   this.logger.info('Listing products...');
   ```

2. **Use formatting functions for numbers and dates:**
   ```typescript
   // ✅ Good
   const formatted = formatCurrency(price, this.language);

   // ❌ Bad
   const formatted = `R$ ${price}`;
   ```

3. **Keep messages concise** (usually < 80 characters for logs)

4. **Test both languages** when adding new features:
   ```bash
   EMAIL_NEOSOLAR=... PASSWORD_NEOSOLAR=... LANGUAGE=pt npx tsx test.ts
   EMAIL_NEOSOLAR=... PASSWORD_NEOSOLAR=... LANGUAGE=en npx tsx test.ts
   ```

## Summary / Resumo

✅ All 7 Brazilian solar distributors now support both Portuguese and English
✅ Centralized message management in `languages.ts`
✅ Automatic currency and date formatting based on language
✅ Easy to extend with new languages
✅ All log messages are now translatable

✅ Todos os 7 distribuidores solares brasileiros agora suportam Português e English
✅ Gerenciamento centralizado de mensagens em `languages.ts`
✅ Formatação automática de moeda e data baseado no idioma
✅ Fácil de estender com novos idiomas
✅ Todas as mensagens de log agora são traduzíveis
