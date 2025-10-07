# Solução Alternativa: Criar Publishable Key via SQL

Como o admin dashboard está com problemas de build do Vite, vamos criar a publishable key diretamente no banco de dados.

## Método 1: Via SQL direto no PostgreSQL

```powershell
# Gerar UUID e token
$uuid = [guid]::NewGuid().ToString()
$token = "pk_" + (-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_}))

Write-Host "UUID: $uuid"
Write-Host "Token: $token"

# Inserir no banco (você precisará usar esses valores)
docker compose exec postgres psql -U medusa_user -d medusa_db -c "
INSERT INTO api_key (id, token, title, type, created_at, updated_at) 
VALUES ('$uuid', '$token', 'YSH Storefront Key', 'publishable', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
"
```

## Método 2: Via API Admin (recomendado se o admin funcionar)

```powershell
# 1. Login no admin para obter token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:9000/admin/auth/user" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@ysh.com.br","password":"Admin@123"}'

$adminToken = $loginResponse.token

# 2. Criar publishable key
$createKeyResponse = Invoke-RestMethod -Uri "http://localhost:9000/admin/publishable-api-keys" `
  -Method POST `
  -Headers @{ "Authorization" = "Bearer $adminToken" } `
  -ContentType "application/json" `
  -Body '{"title":"YSH Storefront Key"}'

Write-Host "Publishable Key: $($createKeyResponse.publishable_api_key.id)"
```

## Método 3: Desabilitar rotas customizadas do admin temporariamente

Se quiser acessar o admin básico do Medusa sem as páginas customizadas:

1. Renomeie temporariamente a pasta de rotas:

```powershell
docker compose exec backend mv /app/src/admin/routes /app/src/admin/routes.bak
```

2. Reinicie o backend:

```powershell
docker compose restart backend
```

3. Acesse <http://localhost:9000/app>

4. Crie a key no Settings > API Key Management

5. Restaure as rotas:

```powershell
docker compose exec backend mv /app/src/admin/routes.bak /app/src/admin/routes
docker compose restart backend
```

## Testar a Key

Depois de criar, teste assim:

```powershell
$key = "pk_xxxxx..."  # Sua chave aqui
$headers = @{ "x-publishable-api-key" = $key }
Invoke-WebRequest -Uri "http://localhost:9000/store/products?limit=5" -Headers $headers
```
