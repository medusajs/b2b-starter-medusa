# ✅ Correção Aplicada - Publishable Key

**Data**: 8 de outubro de 2025  
**Problema**: Chave publicável incorreta no container Docker

---

## 🔧 Correção Realizada

### Arquivo Modificado

`docker-compose.dev.yml` - Seção `storefront` > `environment`

### Alterações

```diff
environment:
  NODE_ENV: development
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: http://localhost:9000
- NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: pk_dev_test
+ NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d
  NEXT_PUBLIC_BASE_URL: http://localhost:8000
- NEXT_PUBLIC_DEFAULT_REGION: us
+ NEXT_PUBLIC_DEFAULT_REGION: br
- REVALIDATE_SECRET: dev-revalidate-secret
+ REVALIDATE_SECRET: supersecret
  NEXT_TELEMETRY_DISABLED: 1
```

---

## ✅ Verificação

### Variáveis de Ambiente no Container

```bash
$ docker exec ysh-b2b-storefront-dev env | grep NEXT_PUBLIC

NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d ✅
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_DEFAULT_REGION=br ✅
```

### Logs de Requisição

```
Headers: {
  "x-publishable-api-key": "pk_2786bc8945cacd335e0cd8fb17b19d2516ec4e29ed9a64ca583ebbe4bb9dc40d" ✅
}
```

---

## 📊 Status Atual

✅ **Chave publicável correta** - pk_2786bc8945...  
✅ **Região padrão correta** - br (Brasil)  
✅ **Storefront respondendo** - <http://localhost:8000> (200 OK)  
⚠️ **Backend retornando erros** - Collections/Categories com retry

---

## 🔍 Próximo Problema

O backend está recebendo as requisições com a chave correta, mas retornando erro.  
Necessário investigar:

1. Se a chave está configurada no backend
2. Se existe um sales channel associado
3. Se há produtos/collections no banco de dados

---

## 📝 Comandos para Investigação

```powershell
# 1. Verificar health do backend
Invoke-WebRequest -Uri http://localhost:9000/health

# 2. Listar publishable keys no backend
docker exec ysh-b2b-backend-dev npx medusa publishable-api-key list

# 3. Verificar se há collections no banco
docker exec ysh-b2b-postgres-dev psql -U medusa_user -d medusa_db -c "SELECT id, handle, title FROM product_collection LIMIT 10;"

# 4. Verificar se há produtos
docker exec ysh-b2b-postgres-dev psql -U medusa_user -d medusa_db -c "SELECT id, title FROM product LIMIT 10;"
```

---

**Correção aplicada com sucesso!** 🎉  
Documentos atualizados:

- `DIAGNOSTICO_STOREFRONT_COMPLETO.md`
- `CORRECAO_PUBLISHABLE_KEY.md` (este arquivo)
