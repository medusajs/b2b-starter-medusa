# 🎯 Conexão Direta ao Bastion - URLs Exatas

**Data:** 12 de outubro de 2025  
**Instância:** i-0a8874f3890bb28c3 (ysh-bastion-temp)

---

## ✅ Instância Confirmada

| Propriedade | Valor | Status |
|-------------|-------|--------|
| **Instance ID** | `i-0a8874f3890bb28c3` | ✅ Running |
| **Nome** | `ysh-bastion-temp` | ✅ |
| **Public IP** | `3.239.64.51` | ✅ |
| **VPC** | `vpc-096abb11405bb44af` | ✅ Correta (production-ysh-b2b) |
| **IAM Role** | `ysh-bastion-ssm-profile` | ✅ Anexado |
| **SSM Agent** | Online | ✅ Registrado |

---

## 🚀 Opção 1: URL Direta da Instância (RECOMENDADO)

**Copie e cole no navegador:**

```tsx
https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#InstanceDetails:instanceId=i-0a8874f3890bb28c3
```

**Depois:**

1. Na página da instância, clicar botão **"Connect"** (canto superior direito)
2. Aba **"Session Manager"**
3. Botão **"Connect"**

---

## 🚀 Opção 2: URL Direta do Session Manager

**Copie e cole no navegador (conecta direto):**

```tsx
https://console.aws.amazon.com/systems-manager/session-manager/i-0a8874f3890bb28c3?region=us-east-1
```

⚠️ **Nota:** Esta URL pode pedir para você clicar em "Start session" na página que abrir.

---

## 🚀 Opção 3: Abrir Automaticamente do PowerShell

**Execute no PowerShell:**

```powershell
Start-Process 'https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#InstanceDetails:instanceId=i-0a8874f3890bb28c3'
```

---

## 📋 Comandos para Executar no Terminal Session Manager

### 1. Instalar PostgreSQL Client (2 minutos)

```bash
sudo dnf install -y postgresql15
```

**Saída esperada:**

```tsx
Installed:
  postgresql15-15.x
Complete!
```

### 2. Criar Database medusa_db (10 segundos)

```bash
PGPASSWORD='bJwPx-g-u9?lt!O[[EG2:Kzj[cs~' psql -h production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com -U medusa_user -d postgres -c 'CREATE DATABASE medusa_db;'
```

**Saída esperada:**

```tsx
CREATE DATABASE
```

**Ou (se já existir - OK):**

```tsx
ERROR: database "medusa_db" already exists
```

### 3. Sair do Session Manager

```bash
exit
```

---

## 🎯 Após Criar o Database

No PowerShell local, executar:

```powershell
.\deploy-final.ps1 -SkipDatabaseCreation
```

**Duração:** 15 minutos (automatizado)

---

## 🆘 Troubleshooting

### Erro: "Failed to start session"

**Solução:** Use Opção 1 (URL da instância) e clique manualmente em Connect → Session Manager

### Erro: "Target is not connected"

**Solução:** Aguardar 1-2 minutos (SSM agent pode estar reiniciando)

### Navegador não abre a URL

**Solução:** Copie a URL manualmente e cole no navegador

---

## ✅ Checklist

```tsx
□ Abrir URL da instância no navegador
□ Verificar que mostra i-0a8874f3890bb28c3 (ysh-bastion-temp)
□ Clicar Connect → Session Manager → Connect
□ Aguardar terminal abrir (~15 segundos)
□ Executar: sudo dnf install -y postgresql15
□ Executar: PGPASSWORD='...' psql ... CREATE DATABASE
□ Sair: exit
□ Executar local: .\deploy-final.ps1 -SkipDatabaseCreation
```

---

**⏱️ Tempo Total:** 4 min (database) + 15 min (deploy) = **19 minutos até 100% funcional**

**🎯 Instância 100% pronta para uso!**
