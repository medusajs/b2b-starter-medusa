# Configuração da Publishable API Key

## Problema

O Medusa v2 requer uma **Publishable API Key** para acessar os endpoints `/store/*`.
A tabela `publishable_api_key` não existe no banco de dados atual.

## Soluções

### Solução 1: Criar via Admin Dashboard (Recomendado)

1. Acesse o painel admin: <http://localhost:9000/app>
2. Faça login com suas credenciais de admin
3. Navegue para: **Settings** → **API Key Management**
4. Clique em **"Create Publishable API Key"**
5. Dê um nome (ex: "YSH Storefront Key")
6. Copie a chave gerada (formato: `pk_xxxxx...`)
7. Adicione no arquivo `.env.local` do storefront:

   ```
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxx...
   ```

### Solução 2: Testar APIs com a chave no header

Após criar a chave no admin, você pode testar as APIs assim:

```powershell
$headers = @{
    "x-publishable-api-key" = "pk_xxxxx..."  # Sua chave aqui
}
Invoke-WebRequest -Uri "http://localhost:9000/store/products?limit=5" -Headers $headers
```

Ou com curl:

```bash
curl -H "x-publishable-api-key: pk_xxxxx..." http://localhost:9000/store/products?limit=5
```

### Solução 3: APIs Customizadas Públicas

Como alternativa, as rotas em `/store/catalog/*` estão configuradas sem exigência de auth,
pois usam o módulo customizado `ysh-catalog` que lê diretamente dos arquivos JSON:

```powershell
# Testar endpoint de catálogo customizado (sem auth necessária)
Invoke-WebRequest -Uri "http://localhost:9000/store/catalog/kits?limit=5"
```

## Status Atual

✅ **Backend rodando**: <http://localhost:9000>
✅ **Admin acessível**: <http://localhost:9000/app>
✅ **297 produtos criados no banco** via script de seed
✅ **Endpoints de catálogo customizado** funcionando sem auth
⏳ **Publishable Key**: Precisa ser criada no admin dashboard

## Próximos Passos

1. Criar admin user se ainda não existe:

   ```bash
   docker compose exec backend npx medusa user -e admin@ysh.com.br -p supersecret
   ```

2. Acessar admin dashboard e criar a publishable key

3. Configurar a chave no storefront

4. Testar integração completa backend ↔ storefront

## Arquivos Relevantes

- **Backend API Routes**: `backend/src/api/store/products/route.ts`
- **Catalog Custom Module**: `backend/src/modules/ysh-catalog/`
- **Seed Script**: `backend/src/scripts/seed-catalog.ts`
- **Products Created**: 297 produtos de kits, painéis, inversores, etc.
