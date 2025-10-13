# 🛠️ Scripts de Utilidade - YSH B2B Store

Scripts PowerShell para automação de tarefas comuns no projeto Medusa B2B.

## 📋 Scripts Disponíveis

### 🔑 `create-publishable-key.ps1`

**Propósito:** Criar automaticamente uma Publishable API Key e configurar no storefront.

**O que faz:**

1. Gera uma nova publishable key no banco de dados
2. Associa ao "Default Sales Channel"
3. Salva automaticamente em `storefront/.env`
4. Cria backup em `storefront/.publishable-key.txt`
5. Copia token para clipboard (se disponível)
6. Oferece teste imediato da key

**Uso:**

```powershell
# A partir da raiz do projeto
.\scripts\create-publishable-key.ps1

# Ou com caminho absoluto
powershell -ExecutionPolicy Bypass -File "C:\Users\fjuni\ysh_medusa\ysh-store\scripts\create-publishable-key.ps1"
```

**Pré-requisitos:**

- Container `ysh-b2b-postgres` rodando
- Database `medusa-backend` criado e migrado
- Sales channel "Default Sales Channel" existente

**Output esperado:**

```
🔑 Criando Publishable API Key para Medusa Store...

📦 Verificando container PostgreSQL...
✅ Container PostgreSQL encontrado

🔧 Executando SQL para criar publishable key...

╔════════════════════════════════════════════════════════════════╗
║  ✅ PUBLISHABLE KEY CRIADA COM SUCESSO!                       ║
╚════════════════════════════════════════════════════════════════╝

🔑 Key ID: apk_xxxxxxxxxxxx
🎯 Token: pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
📦 Sales Channel: Default Sales Channel (sc_xxxxxxxxxxxx)
🏪 Store: Medusa Store (store_xxxxxxxxxxxx)

💾 Salvando token em arquivo...
   ✅ Variável NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY adicionada

📁 Arquivo atualizado: storefront\.env
💾 Backup do token salvo em: storefront\.publishable-key.txt
📋 Token copiado para clipboard!

╔════════════════════════════════════════════════════════════════╗
║  🎉 PUBLISHABLE KEY CONFIGURADA COM SUCESSO!                  ║
╚════════════════════════════════════════════════════════════════╝

📋 PRÓXIMOS PASSOS:

1. ✅ Token já foi adicionado ao storefront/.env

2. Reinicie o storefront:
   docker compose -f docker/docker-compose.yml restart storefront

3. Teste a API:
   $headers = @{"x-publishable-api-key" = "pk_xxxxx..."}
   Invoke-RestMethod -Uri "http://localhost:9000/store/products?limit=1" -Headers $headers

4. Acesse o PDP:
   http://localhost:8000/br/products/kit-solar-5kw

🧪 Deseja testar a key agora? (S/N):
```

**Troubleshooting:**

| Erro | Causa | Solução |
|------|-------|---------|
| "Container não está rodando" | Postgres não iniciado | `docker compose up -d postgres` |
| "Sales Channel não encontrado" | Seed não executou | Executar migrations + seed |
| "Permission denied" | Sem permissão SQL | Verificar user postgres |

---

## 🔧 Desenvolvimento de Novos Scripts

### Template Base

```powershell
# ====================================================================
# Script: Nome do Script
# Descrição: Breve descrição
# Uso: .\scripts\nome-script.ps1
# ====================================================================

Write-Host "🚀 Iniciando..." -ForegroundColor Cyan

# Configurações
$CONTAINER_NAME = "ysh-b2b-postgres"
$DB_USER = "postgres"
$DB_NAME = "medusa-backend"

# Verificações
Write-Host "📦 Verificando pré-requisitos..." -ForegroundColor Yellow

# Lógica principal
try {
    # Código aqui
    Write-Host "✅ Sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro: $_" -ForegroundColor Red
    exit 1
}
```

### Boas Práticas

1. **Sempre verificar pré-requisitos:**
   - Containers rodando
   - Arquivos existindo
   - Permissões adequadas

2. **Usar cores para feedback:**
   - 🟢 Green: Sucesso
   - 🟡 Yellow: Avisos/Progresso
   - 🔴 Red: Erros
   - 🔵 Cyan: Informações

3. **Criar backups:**
   - Antes de modificar arquivos importantes
   - Salvar em `.backup` ou `.bak`

4. **Logging detalhado:**
   - O que está sendo feito
   - Resultados intermediários
   - Erros com contexto

5. **Interatividade quando apropriado:**
   - Confirmações para ações destrutivas
   - Opções de teste imediato
   - Próximos passos claros

---

## 📝 Scripts Planejados

### `seed-demo-data.ps1` (Próximo)

- Popular banco com dados demo B2B
- Produtos, empresas, funcionários, approvals
- Alternativa ao seed script atual que está falhando

### `reset-database.ps1`

- Limpar banco completamente
- Reexecutar migrações
- Opção de seed automático

### `check-health.ps1`

- Verificar status de todos os serviços
- Validar conectividade
- Report de saúde do sistema

### `backup-database.ps1`

- Backup completo do PostgreSQL
- Compressão automática
- Armazenamento com timestamp

---

## 🧪 Testes

### Testar create-publishable-key.ps1

```powershell
# 1. Garantir ambiente limpo
docker exec ysh-b2b-postgres psql -U postgres -d medusa-backend -c "DELETE FROM api_key WHERE type = 'publishable';"

# 2. Executar script
.\scripts\create-publishable-key.ps1

# 3. Verificar no banco
docker exec ysh-b2b-postgres psql -U postgres -d medusa-backend -c "SELECT id, token, title FROM api_key WHERE type = 'publishable';"

# 4. Verificar arquivo
Get-Content storefront\.env | Select-String "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY"

# 5. Testar API
$key = (Get-Content storefront\.publishable-key.txt)
$headers = @{"x-publishable-api-key" = $key}
Invoke-RestMethod -Uri "http://localhost:9000/store/products?limit=1" -Headers $headers
```

---

## 🔗 Links Úteis

- [Medusa Documentation](https://docs.medusajs.com)
- [PowerShell Documentation](https://docs.microsoft.com/powershell)
- [Project README](../README.md)

---

**Última atualização:** 13/10/2025  
**Maintainer:** GitHub Copilot Agent
