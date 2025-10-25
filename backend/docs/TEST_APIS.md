# 🧪 Testes das APIs de Catálogo Interno

## Comandos de Teste (PowerShell)

### 1. Health Check

```powershell
Invoke-WebRequest -Uri "http://localhost:9000/store/internal-catalog/health" -UseBasicParsing | Select-Object Content
```

### 2. Estatísticas Gerais

```powershell
Invoke-WebRequest -Uri "http://localhost:9000/store/internal-catalog/stats" -UseBasicParsing | Select-Object Content
```

### 3. Lista de Categorias

```powershell
Invoke-WebRequest -Uri "http://localhost:9000/store/internal-catalog/categories" -UseBasicParsing | Select-Object Content
```

### 4. Categoria Inverters (100% coverage - 489 produtos)

```powershell
Invoke-WebRequest -Uri "http://localhost:9000/store/internal-catalog/categories/inverters" -UseBasicParsing | Select-Object Content
```

### 5. Categoria Kits (100% coverage - 334 produtos)

```powershell
Invoke-WebRequest -Uri "http://localhost:9000/store/internal-catalog/categories/kits" -UseBasicParsing | Select-Object Content
```

### 6. Estatísticas do Cache

```powershell
Invoke-WebRequest -Uri "http://localhost:9000/store/internal-catalog/cache/stats" -UseBasicParsing | Select-Object Content
```

### 7. Limpar Cache (POST)

```powershell
Invoke-WebRequest -Uri "http://localhost:9000/store/internal-catalog/cache/clear" -Method POST -UseBasicParsing | Select-Object Content
```

## Resultados Esperados

### Health Check

```json
{
  "status": "ok",
  "timestamp": "2025-01-20T...",
  "service": "internal-catalog",
  "version": "1.0.0"
}
```

### Stats

```json
{
  "total_products": 1123,
  "products_with_images": 1028,
  "coverage_percent": 91.5,
  "categories": 12,
  "cache_entries": 0,
  "categories_loaded": []
}
```

### Categorias

```json
{
  "categories": [
    {
      "id": "inverters",
      "name": "Inverters",
      "product_count": 489,
      "image_coverage": 100.0
    },
    ...
  ]
}
```

### Produtos de uma Categoria

```json
{
  "category": "inverters",
  "total": 489,
  "with_images": 489,
  "coverage": 100.0,
  "products": [
    {
      "id": "...",
      "title": "...",
      "sku": "112369",
      "image_url": "/static/images-catálogo_distribuidores/ODEX-INVERTERS/112369.jpg",
      "...": "..."
    }
  ]
}
```

## Como Executar

### Passo 1: Garantir que o Backend está Rodando

```powershell
cd backend
yarn dev
```

**Aguarde até ver:**

```
✔ Server is ready on port: 9000
```

### Passo 2: Abrir Nova Janela do PowerShell

**IMPORTANTE**: NÃO feche a janela do backend!

### Passo 3: Executar os Testes

Copie e cole cada comando acima na nova janela do PowerShell.

## Verificações de Sucesso

- ✅ Health check retorna status "ok"
- ✅ Stats mostra 91.5% coverage
- ✅ Lista de categorias retorna 12 categorias
- ✅ Inverters retorna 489 produtos (100% coverage)
- ✅ Kits retorna 334 produtos (100% coverage)
- ✅ Todos os produtos têm campo `image_url` populado
- ✅ Cache stats mostra métricas de hit/miss

## Troubleshooting

### Erro: "A conexão subjacente estava fechada"

- Backend não está rodando ou foi desligado
- Solução: Reiniciar backend com `yarn dev`

### Erro: "404 Not Found"

- Rota incorreta ou backend não carregou APIs
- Solução: Verificar logs do backend ao iniciar

### Performance Lenta

- Cache frio na primeira requisição
- Solução: Normal, próximas requisições serão instantâneas (cache hit)

### Cobertura Menor que 91.5%

- Índices não foram carregados corretamente
- Solução: Executar `node scripts/preload-catalog.js` antes de iniciar backend
