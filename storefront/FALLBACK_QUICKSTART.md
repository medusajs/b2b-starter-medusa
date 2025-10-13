# Quick Start - Sistema de Fallback

## 🚀 Teste Rápido

### PowerShell (Windows)

```powershell
# No diretório do storefront
cd storefront

# Executar teste
.\scripts\test-fallback.ps1

# Com URLs customizadas
.\scripts\test-fallback.ps1 -StorefrontUrl "http://localhost:3000" -BackendUrl "http://localhost:9000"
```

### Node.js (Multiplataforma)

```bash
# No diretório do storefront
cd storefront

# Executar teste
npx tsx scripts/test-fallback.ts

# Com variáveis de ambiente
STOREFRONT_URL=http://localhost:3000 NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000 npx tsx scripts/test-fallback.ts
```

## 📋 O que é testado?

✅ Conectividade com backend  
✅ Fallback automático (3 níveis)  
✅ 8 categorias de produtos  
✅ Tempo de resposta  
✅ Contagem de produtos  
✅ Origem dos dados

## 🎯 Resultado Esperado

```
═══════════════════════════════════════════════════════
   TESTE DO SISTEMA DE FALLBACK ROBUSTO
═══════════════════════════════════════════════════════

📍 Storefront: http://localhost:3000
📍 Backend: http://localhost:9000

🔍 Verificando saúde do backend...
   ✅ Backend: Online

📦 Testando categorias...

   Testing panels         ... ✅ 10 produtos (🟢 backend) [145ms]
   Testing inverters      ... ✅ 10 produtos (🟢 backend) [132ms]
   Testing batteries      ... ✅ 10 produtos (🟢 backend) [128ms]
   Testing structures     ... ✅ 10 produtos (🟢 backend) [141ms]
   Testing cables         ... ✅ 10 produtos (🟢 backend) [136ms]
   Testing accessories    ... ✅ 10 produtos (🟢 backend) [139ms]
   Testing stringboxes    ... ✅ 10 produtos (🟢 backend) [134ms]
   Testing kits           ... ✅ 10 produtos (🟢 backend) [142ms]

═══════════════════════════════════════════════════════
   ESTATÍSTICAS
═══════════════════════════════════════════════════════

✅ Sucesso: 8/8
❌ Falhas: 0/8
⏱️  Tempo médio: 137ms

📊 Fontes de dados:
   🟢 backend         : 8

📦 Total de produtos retornados: 80

═══════════════════════════════════════════════════════
   ✅ TODOS OS TESTES PASSARAM!
═══════════════════════════════════════════════════════
```

## 🔄 Testando Fallback

### Simular backend offline

```powershell
# 1. Derrubar backend
docker stop medusa-backend

# 2. Executar teste
.\scripts\test-fallback.ps1

# Resultado esperado:
# 📊 Fontes de dados:
#    🟡 fallback-api    : 8
# ou
#    🔵 local-file      : 8
```

## 📊 Códigos de Fonte

| Emoji | Fonte | Descrição |
|-------|-------|-----------|
| 🟢 | backend | Backend Medusa principal |
| 🟡 | fallback-api | Backend Fallback API |
| 🔵 | local-file | Arquivos JSON locais |
| 🔴 | error | Erro em todas as estratégias |

## ⚡ Comandos Úteis

```powershell
# Limpar cache do Next.js
Remove-Item .next -Recurse -Force

# Rebuild do storefront
npm run build

# Iniciar em dev mode
npm run dev

# Verificar health do backend
curl http://localhost:9000/health

# Testar endpoint direto
curl "http://localhost:3000/api/catalog/products?category=panels&limit=5"
```

## 🐛 Troubleshooting

### Backend não responde

```powershell
# Verificar se está rodando
docker ps | Select-String "medusa-backend"

# Iniciar backend
docker start medusa-backend

# Ver logs
docker logs medusa-backend --tail 50
```

### Storefront não encontra arquivos

```powershell
# Verificar estrutura de diretórios
ls ..\backend\data\catalog\fallback_exports

# Deve mostrar arquivos .json (panels.json, inverters.json, etc.)
```

### Timeout nos testes

```powershell
# Aumentar timeout no script
# Editar: scripts/test-fallback.ps1
# Linha: -TimeoutSec 15  →  -TimeoutSec 30
```

## 📚 Documentação Completa

Para documentação detalhada, veja:

- `docs/FALLBACK_SYSTEM_GUIDE.md` - Sistema completo
- `src/lib/catalog/fallback-loader.ts` - Código fonte

## ✅ Checklist de Deploy

Antes de fazer deploy:

- [ ] Todos os testes passando
- [ ] Arquivos fallback atualizados
- [ ] Variáveis de ambiente configuradas
- [ ] Cache configurado corretamente
- [ ] Logs de erro funcionando

---

**Última atualização:** 2025-10-13
