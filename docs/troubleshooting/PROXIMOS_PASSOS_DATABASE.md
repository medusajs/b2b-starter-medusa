# 🎯 Próximos Passos - Criação do Banco de Dados

**Data:** 12 de outubro de 2025  
**Status:** ✅ Todos os pré-requisitos atendidos - PRONTO PARA EXECUTAR

---

## ✅ Pré-Requisitos Verificados

| Item | Status | Detalhes |
|------|--------|----------|
| **AWS SSO** | ✅ Renovado | Sessão ativa até próxima expiração |
| **DATABASE_URL** | ✅ Corrigido | Password URL-encoded corretamente |
| **Bastion IAM Role** | ✅ Anexado | `ysh-bastion-ssm-profile` com AmazonSSMManagedInstanceCore |
| **SSM Agent** | ✅ Online | Registrado e pronto para conexão |
| **RDS Status** | ✅ Available | Endpoint acessível, mas database `medusa_db` não existe |
| **Backend Service** | ⚠️ 0/2 tasks | Aguardando database (esperado) |
| **Storefront Service** | ✅ 2/2 tasks | Funcionando perfeitamente |

---

## 🚀 PASSO 1: Conectar ao Bastion via Session Manager (2 minutos)

### 1.1. Abrir AWS Console

```
URL: https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#Instances:
Credenciais: (use AWS SSO já autenticado)
```

### 1.2. Localizar Bastion

- Buscar instância: `i-0a8874f3890bb28c3`
- Nome: `production-ysh-b2b-bastion`
- Status: ✅ `running`
- Public IP: ✅ `3.239.64.51`
- VPC: ✅ `vpc-096abb11405bb44af` (production-ysh-b2b)
- IAM Role: ✅ `ysh-bastion-ssm-profile`
- SSM Agent: ✅ `Online` (último ping: 2025-10-12 09:45:04)

### 1.3. Conectar via Session Manager

1. Selecionar instância `i-0a8874f3890bb28c3`
2. Clicar botão **"Connect"** (canto superior direito)
3. Aba **"Session Manager"**
4. Clicar **"Connect"**
5. Aguardar terminal abrir (10-15 segundos)

**✅ Deve abrir terminal sem erros!** (IAM role já corrigido)

---

## 🗄️ PASSO 2: Instalar PostgreSQL Client (2 minutos)

No terminal do Session Manager que abriu, executar:

```bash
sudo dnf install -y postgresql15
```

**Saída esperada:**

```
Installed:
  postgresql15-15.x
Complete!
```

---

## 🎯 PASSO 3: Criar Database medusa_db (10 segundos)

### Opção A: Comando Único (RECOMENDADO)

```bash
PGPASSWORD='bJwPx-g-u9?lt!O[[EG2:Kzj[cs~' psql -h production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com -U medusa_user -d postgres -c 'CREATE DATABASE medusa_db;'
```

### Opção B: Interativo

```bash
# 1. Conectar ao postgres
PGPASSWORD='bJwPx-g-u9?lt!O[[EG2:Kzj[cs~' psql -h production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com -U medusa_user -d postgres

# 2. No prompt psql, executar:
CREATE DATABASE medusa_db;

# 3. Verificar:
\l medusa_db

# 4. Sair:
\q
```

### ✅ Saídas Esperadas

**Sucesso:**

```
CREATE DATABASE
```

**Se já existir (OK):**

```
ERROR: database "medusa_db" already exists
```

---

## 🚀 PASSO 4: Executar Deploy Final Automatizado (15 minutos)

**⚠️ IMPORTANTE:** Sair do Session Manager antes de executar (digite `exit` no terminal AWS)

No PowerShell local:

```powershell
.\deploy-final.ps1 -SkipDatabaseCreation
```

### O que o script faz automaticamente

1. **Force Redeploy Backend** (1 min)
   - Atualiza service com nova task definition
   - Backend pegará DATABASE_URL corrigido

2. **Aguardar 2/2 Tasks** (2 min)
   - Monitora até backend estar RUNNING

3. **Migrations** (3 min)
   - Executa `medusa db:migrate` via ECS Exec
   - Cria todas as tabelas do schema

4. **Seed Data** (5 min)
   - 511 SKUs de produtos
   - 101 Kits (combos)
   - 37 Manufacturers
   - Dados de demonstração B2B

5. **Health Checks** (1 min)
   - Backend: `/health`
   - Storefront: `/`

6. **Catalog API Tests** (1 min)
   - GET `/store/catalog/manufacturers` → 37 items
   - GET `/store/products` → 511 products
   - Validação de integridade

7. **Target Groups** (1 min)
   - Verifica 4/4 targets healthy

8. **Cleanup Bastion** (1 min)
   - Termina instância (economiza custos)

**Total:** ~15 minutos automatizado

---

## 🎉 PASSO 5: Validação Final (2 minutos)

### 5.1. Verificar Backend Health

```powershell
curl http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/health
```

**Esperado:** `{"status":"ok"}`

### 5.2. Verificar Storefront

```powershell
curl http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/
```

**Esperado:** HTML com `<title>Medusa Store</title>`

### 5.3. Testar Catalog API

```powershell
curl http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/store/catalog/manufacturers
```

**Esperado:** JSON com 37 manufacturers

### 5.4. Verificar ECS Services

```powershell
aws ecs describe-services --cluster production-ysh-b2b-cluster --services ysh-b2b-backend ysh-b2b-storefront --profile ysh-production --region us-east-1 --query "services[].[serviceName,runningCount,desiredCount]" --output table
```

**Esperado:**

```
ysh-b2b-backend      | 2 | 2
ysh-b2b-storefront   | 2 | 2
```

---

## 📊 Timeline Completa

| Etapa | Duração | Total Acumulado |
|-------|---------|-----------------|
| 1. Conectar Session Manager | 2 min | 2 min |
| 2. Instalar PostgreSQL | 2 min | 4 min |
| 3. Criar Database | 10 seg | 4 min 10 seg |
| 4. Deploy Final (automatizado) | 15 min | 19 min 10 seg |
| 5. Validação | 2 min | **21 min 10 seg** |

**🎯 Total: ~21 minutos até sistema 100% funcional**

---

## 🆘 Troubleshooting

### Erro: "Failed to connect to your instance"

**Causa:** IAM role ainda registrando  
**Solução:** Aguardar mais 1-2 minutos e tentar novamente

### Erro: "psql: command not found"

**Causa:** PostgreSQL client não instalado  
**Solução:** Executar novamente `sudo dnf install -y postgresql15`

### Erro: "FATAL: password authentication failed"

**Causa:** Password incorreto ou especial chars não escapados  
**Solução:** Usar exatamente o comando da Opção A (com PGPASSWORD)

### Erro: "could not connect to server"

**Causa:** Security Group ou network  
**Solução:** Verificar Security Groups (já validado, não deve ocorrer)

### Backend continua 0/2 tasks após database criado

**Solução:** Executar force redeploy manual:

```powershell
aws ecs update-service --cluster production-ysh-b2b-cluster --service ysh-b2b-backend --force-new-deployment --profile ysh-production --region us-east-1
```

---

## 📋 Checklist de Execução

```
□ PASSO 1: Abrir AWS Console e conectar Session Manager
□ PASSO 2: Instalar PostgreSQL client
□ PASSO 3: Executar CREATE DATABASE medusa_db
□ PASSO 4: Sair do Session Manager (exit)
□ PASSO 5: Executar .\deploy-final.ps1 -SkipDatabaseCreation
□ PASSO 6: Aguardar 15 minutos (script automatizado)
□ PASSO 7: Validar endpoints (health, storefront, catalog)
□ PASSO 8: Confirmar 4/4 targets healthy
□ PASSO 9: Atualizar documentação final
```

---

## 🎯 Resultado Final Esperado

✅ **Backend:** 2/2 tasks RUNNING  
✅ **Storefront:** 2/2 tasks RUNNING  
✅ **Database:** medusa_db com schema completo  
✅ **Seed Data:** 511 SKUs + 101 Kits + 37 Manufacturers  
✅ **Health Endpoints:** Todos 200 OK  
✅ **Target Groups:** 4/4 healthy  
✅ **Bastion:** Terminado (custos otimizados)  

**🚀 Sistema 100% Funcional em Produção AWS!**

---

## 📝 Comandos de Referência Rápida

```bash
# Session Manager - Criar Database
PGPASSWORD='bJwPx-g-u9?lt!O[[EG2:Kzj[cs~' psql -h production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com -U medusa_user -d postgres -c 'CREATE DATABASE medusa_db;'

# PowerShell Local - Deploy Automatizado
.\deploy-final.ps1 -SkipDatabaseCreation

# Validação - Backend Health
curl http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/health

# Validação - Catalog API
curl http://production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com/store/catalog/manufacturers
```

---

**🎯 PRONTO PARA EXECUTAR! Todos os pré-requisitos atendidos.**
