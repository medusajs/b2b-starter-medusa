# 🔍 Verificar Database - Quick Check

**Uso**: Execute ANTES de rodar deploy-final.ps1 para confirmar que medusa_db existe.

## Verificação Rápida

```powershell
# Verificar via logs do backend (se tentar conectar)
aws logs tail /ecs/ysh-b2b-backend --since 2m --profile ysh-production --region us-east-1 2>&1 | Select-String -Pattern "medusa_db|database.*exist"
```

## Verificação Completa (via Session Manager)

No Session Manager do bastion, execute:

```bash
PGPASSWORD='bJwPx-g-u9?lt!O[[EG2:Kzj[cs~' psql \
  -h production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com \
  -U medusa_user \
  -d postgres \
  -c '\l' | grep medusa_db
```

**Esperado**: Linha com `medusa_db | medusa_user | ...`

## Se Database Existe

✅ Execute imediatamente:

```powershell
.\deploy-final.ps1 -SkipDatabaseCreation
```

## Se Database NÃO Existe

❌ Volte ao CREATE_DATABASE_MANUAL.md e complete Task 1.
