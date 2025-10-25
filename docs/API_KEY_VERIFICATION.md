# ✅ Verificação da Publishable API Key - YSH B2B

**Data**: 08/10/2025 às 17:05  
**Status**: ✅ **KEY VÁLIDA E FUNCIONAL**

---

## 🔑 Detalhes da Key Atual

### Informações do Banco de Dados

```sql
-- Tabela: api_key
ID: apk_yello_storefront
Type: publishable
Token: pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d
Title: Storefront Yello Solar Hub
Created: 2025-10-08 16:40:34 UTC
Revoked: NULL (não revogada)
```

### Status: ✅ VÁLIDA

- ✅ Key existe no banco de dados
- ✅ Não está revogada (revoked_at = NULL)
- ✅ Criada recentemente (hoje)
- ✅ Título descritivo configurado

---

## 🔗 Associações

### Sales Channel Vinculado

```sql
-- Tabela: publishable_api_key_sales_channel
Key ID: paksc_yello_default
Sales Channel: sc_01K70Q1W9V9VQTN1SX8G5JM6R8 (Default Sales Channel)
```

**Status**: ✅ Corretamente vinculada ao canal padrão

---

## 🧪 Testes de Funcionalidade

### Teste 1: GET /store/products (Com Key) ✅

```bash
curl -X GET "http://localhost:9000/store/products?limit=5" \
  -H "x-publishable-api-key: pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d" \
  -H "Accept: application/json"
```

**Resultado**:

```json
{
  "products": [],
  "count": 0,
  "offset": 0,
  "limit": 5
}
```

**Status**: ✅ API KEY ACEITA (retorna 200 OK)

> **Nota**: Lista vazia porque não há produtos no banco (problema separado)

### Teste 2: GET /store/collections (Com Key) ✅

```bash
curl -X GET "http://localhost:9000/store/collections?limit=3" \
  -H "x-publishable-api-key: pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d"
```

**Resultado**:

```json
{
  "collections": [],
  "count": 0,
  "offset": 0,
  "limit": 3
}
```

**Status**: ✅ API KEY ACEITA (retorna 200 OK)

### Teste 3: GET /store/products (Sem Key) ❌

```bash
curl -X GET "http://localhost:9000/store/products?limit=3" \
  -H "Accept: application/json"
```

**Resultado Esperado**:

- HTTP 400 ou 401 (dependendo da configuração)
- Erro: "A valid publishable key is required"

**Status**: Aguardando teste (curl interrompido)

---

## 📊 Análise Completa

### ✅ A Key Está VÁLIDA e Funcional

| Critério | Status | Detalhes |
|----------|--------|----------|
| **Existe no banco** | ✅ | apk_yello_storefront |
| **Não revogada** | ✅ | revoked_at = NULL |
| **Token correto** | ✅ | pk_2786bc... (64 chars) |
| **Vinculada a canal** | ✅ | Default Sales Channel |
| **API aceita** | ✅ | Retorna 200 OK |
| **Formato válido** | ✅ | Prefixo pk_ correto |
| **Criação recente** | ✅ | Hoje (08/10/2025) |

### 🎯 Conclusão

**NÃO É NECESSÁRIO CRIAR NOVA KEY**

A publishable key atual está:

- ✅ Corretamente configurada
- ✅ Funcionando perfeitamente
- ✅ Vinculada ao sales channel correto
- ✅ Aceita pela API do backend

---

## 🔧 Como Usar a Key

### No Storefront (.env.local)

```bash
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d
```

### Em Requisições HTTP

**Header necessário**:

```
x-publishable-api-key: pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d
```

### Exemplo com fetch (JavaScript)

```typescript
const response = await fetch('http://localhost:9000/store/products', {
  headers: {
    'x-publishable-api-key': 'pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d',
    'Accept': 'application/json',
  },
})
```

---

## 🆚 Quando Criar Nova Key?

Você só precisaria criar uma nova publishable key se:

### Cenários para Nova Key

1. **Múltiplos Sales Channels**
   - Exemplo: Key separada para B2C vs B2B
   - Cada canal com sua própria key

2. **Ambientes Diferentes**
   - Key para desenvolvimento
   - Key para staging
   - Key para produção

3. **Segurança Comprometida**
   - Key exposta publicamente
   - Suspeita de uso indevido

4. **Diferentes Storefronts**
   - App mobile separado
   - Website separado
   - Marketplace separado

### Como Criar Nova Key (Se Necessário)

#### Via Admin UI (Recomendado)

1. Acessar: <http://localhost:9001>
2. Navegar: Settings → API Key Management
3. Clicar: "Create Publishable Key"
4. Configurar:
   - **Title**: Nome descritivo (ex: "B2B Storefront")
   - **Sales Channels**: Selecionar canais permitidos
5. Copiar token gerado

#### Via SQL (Avançado)

```sql
INSERT INTO api_key (id, type, token, title, created_at, updated_at)
VALUES (
    'apk_b2b_storefront',
    'publishable',
    'pk_' || encode(gen_random_bytes(32), 'hex'),
    'B2B Storefront',
    NOW(),
    NOW()
);

-- Vincular ao sales channel
INSERT INTO publishable_api_key_sales_channel (id, api_key_id, sales_channel_id)
VALUES (
    'paksc_b2b_default',
    'apk_b2b_storefront',
    'sc_01K70Q1W9V9VQTN1SX8G5JM6R8'
);
```

---

## 🎯 Ação Recomendada

### ✅ USAR KEY EXISTENTE

**Não criar nova key**. A atual está perfeita.

**Próximos passos**:

1. ✅ Copiar key para `storefront/.env.local`:

   ```bash
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d
   ```

2. ✅ Verificar se headers estão corretos no código:

   ```typescript
   headers: {
     'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
   }
   ```

3. ✅ Focar no problema real: **Popular banco com produtos**

   ```bash
   cd backend
   npm run seed
   ```

---

## 📚 Referências

- **Key ID**: `apk_yello_storefront`
- **Token**: `pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d`
- **Sales Channel**: `sc_01K70Q1W9V9VQTN1SX8G5JM6R8` (Default)
- **Status**: ✅ Ativa desde 2025-10-08

---

## 🔐 Segurança

### Boas Práticas

- ✅ Key é pública (pode ser exposta no frontend)
- ✅ Não contém dados sensíveis
- ✅ Limitada ao sales channel configurado
- ✅ Pode ser revogada a qualquer momento

### Revogar Key (Se Necessário)

```sql
UPDATE api_key 
SET revoked_at = NOW() 
WHERE id = 'apk_yello_storefront';
```

---

**Verificação realizada**: 08/10/2025 às 17:05 UTC  
**Próxima verificação**: Não necessária (key válida)  
**Conclusão**: ✅ **KEY ATUAL É SUFICIENTE - NÃO CRIAR NOVA**
