# ✅ Admin Dashboard Disponível

## 🎉 Problema Resolvido

O admin estava com erro de build do Vite devido às rotas customizadas (companies, quotes, approvals).

**Solução aplicada**: Rotas customizadas temporariamente desabilitadas.

## 🔑 Como Criar a Publishable Key

### Passo 1: Acessar o Admin

Abra no navegador: **<http://localhost:9000/app>**

### Passo 2: Fazer Login

- **Email**: `admin@ysh.com.br`
- **Senha**: `Admin@123`

### Passo 3: Criar a API Key

1. No menu lateral, vá em **Settings** (última opção)
2. Clique em **API Key Management**
3. Clique no botão **"Create API Key"** ou **"+"**
4. Preencha:
   - **Title**: YSH Storefront Key
   - **Type**: Publishable
5. Clique em **Save** ou **Create**
6. **COPIE A CHAVE GERADA** (formato: `pk_xxxxxxxxxxxxx...`)

### Passo 4: Configurar no Storefront

Crie/edite o arquivo `.env.local` no storefront:

```env
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxx...
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

### Passo 5: Testar

```powershell
# Teste a API com a chave
$key = "pk_xxxxxxxxxxxxx..."  # Cole sua chave aqui
$headers = @{ "x-publishable-api-key" = $key }
$response = Invoke-WebRequest -Uri "http://localhost:9000/store/products?limit=5" -Headers $headers
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

## 📊 Status Atual

- ✅ Backend rodando (porta 9000)
- ✅ Admin disponível (<http://localhost:9000/app>)
- ✅ 297 produtos no banco de dados
- ✅ Admin user criado
- ⏳ **Próximo**: Criar publishable key no admin
- ⏳ **Depois**: Configurar storefront e testar integração

## 🔄 Restaurar Rotas Customizadas (Depois)

Quando quiser ativar as rotas customizadas novamente (companies, quotes, approvals):

```powershell
# Restaurar rotas
docker compose exec backend mv /app/src/admin/routes.disabled /app/src/admin/routes

# Reiniciar backend
docker compose restart backend
```

⚠️ **Nota**: As rotas customizadas têm um bug de resolução de paths no Vite. Isso será corrigido em uma atualização futura.

## 🎯 Ação Imediata

**Acesse agora**: <http://localhost:9000/app>

Login: `admin@ysh.com.br` / `Admin@123`

Crie a publishable key em Settings > API Key Management!
