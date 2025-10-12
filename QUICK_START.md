# 🎯 EXECUÇÃO RÁPIDA - Deployment 100%

## Status: 95% → 100% (19 minutos)

### 🔴 TASK 1: MANUAL (4 min) - VOCÊ FAZ AGORA

**AWS Console → EC2 → i-0a8874f3890bb28c3 → Connect → Session Manager**

```bash
sudo dnf install -y postgresql15

PGPASSWORD='bJwPx-g-u9?lt!O[[EG2:Kzj[cs~' psql \
  -h production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com \
  -U medusa_user \
  -d postgres \
  -c 'CREATE DATABASE medusa_db;'
```

**Esperado**: `CREATE DATABASE`

---

### 🟢 TASK 2-10: AUTOMÁTICO (15 min) - SCRIPT FAZ TUDO

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store
.\deploy-final.ps1 -SkipDatabaseCreation
```

**O que o script faz**:

- ✅ Redeploy backend (1 min)
- ✅ Aguarda backend 2/2 tasks (2 min)  
- ✅ Database migrations (3 min)
- ✅ Seed 511 SKUs + 101 Kits (5 min)
- ✅ Smoke tests health + catalog (2 min)
- ✅ Verifica target groups (1 min)
- ✅ Cleanup bastion (1 min)

---

## 🎉 Resultado Final

```
Backend:    2/2 tasks RUNNING ✅
Storefront: 2/2 tasks RUNNING ✅
Database:   medusa_db + 511 SKUs ✅
Health:     /health → 200 OK ✅
Catalog:    37 manufacturers ✅
```

**Sistema 100% funcional! 🚀**

---

## 📝 Se Algo Falhar

### Migration error

```powershell
aws logs tail /ecs/ysh-b2b-backend --since 5m --follow --profile ysh-production --region us-east-1
```

### Backend não sobe

```powershell
# Verificar DATABASE_URL
aws secretsmanager get-secret-value --secret-id /ysh-b2b/database-url --query SecretString --output text --profile ysh-production --region us-east-1
```

### Re-executar script

```powershell
.\deploy-final.ps1 -SkipDatabaseCreation
```

---

## 🔗 URLs para Testar

- Backend: `http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/health`
- Storefront: `http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/`
- Catalog: `http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/store/catalog/manufacturers`

---

**PRÓXIMO PASSO**: Executar Task 1 (criar database) agora! ⬆️
