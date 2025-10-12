# 🔴 AÇÃO MANUAL NECESSÁRIA - Criar Database

## ⚠️ Por que manual?

AWS SSM send-command falha com caracteres especiais na senha (`?`, `!`, `[`, `~`).  
**Única solução confiável**: Session Manager no navegador.

---

## � CREDENCIAIS CONFIRMADAS

```
AWS Account ID:     773235999227
IAM User:           ysh-dev (AdministratorAccess via SSO)
IAM Role ARN:       arn:aws:sts::773235999227:assumed-role/AWSReservedSSO_AdministratorAccess_c007a985b3eea5a7/ysh-dev
Profile:            ysh-production
Region:             us-east-1

RDS Instance:       production-ysh-b2b-postgres
RDS Endpoint:       production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com
RDS Master User:    medusa_user
RDS Status:         ✅ available

Bastion Instance:   i-0a8874f3890bb28c3
Bastion Status:     ✅ running
Bastion Public IP:  3.239.64.51
Bastion Private IP: 10.0.1.10
```

---

## �📋 Passos (4 minutos)

### 1. Abrir AWS Console

```
https://us-east-1.console.aws.amazon.com/ec2/home?region=us-east-1#Instances:instanceId=i-0a8874f3890bb28c3
```

☝️ **Link direto para o bastion!**

- Login com: **ysh-dev** (AdministratorAccess)
- Account: **773235999227**
- Region: **us-east-1** (já selecionada no link)

### 2. Conectar ao Bastion

1. **EC2** → **Instances**
2. Selecionar: **i-0a8874f3890bb28c3** (bastion)
3. Botão **Connect** (laranja no topo direito)
4. Aba **Session Manager**
5. Botão **Connect** (laranja)

### 3. Executar Comandos

**Copie e cole EXATAMENTE** estes comandos no terminal Session Manager:

```bash
# Instalar PostgreSQL client (2 min)
sudo dnf install -y postgresql15

# Criar database (10 segundos)
PGPASSWORD='bJwPx-g-u9?lt!O[[EG2:Kzj[cs~' psql \
  -h production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com \
  -U medusa_user \
  -d postgres \
  -c 'CREATE DATABASE medusa_db;'
```

### 4. Verificar Sucesso

**Output esperado**:

```
CREATE DATABASE
```

**Se ver "already exists"**: Perfeito! Database já foi criado.

**Se erro de conexão**: Verificar security group (mas já foi validado).

---

## ✅ Após Concluir

Volte ao PowerShell e execute:

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store
.\deploy-final.ps1 -SkipDatabaseCreation
```

Isso executará automaticamente Tasks 2-10 (15 minutos) e completará o deployment 100%! 🚀

---

## 🆘 Troubleshooting

### Erro: "psql: command not found"

```bash
sudo dnf install -y postgresql15
```

### Erro: "FATAL: password authentication failed"

Verificar se copiou a senha EXATAMENTE (incluindo todos os caracteres especiais):

```
bJwPx-g-u9?lt!O[[EG2:Kzj[cs~
```

### Erro: "could not connect to server"

Verificar RDS endpoint está correto:

```bash
ping production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com
```

Se ping funciona mas psql não, verificar security group no AWS Console.

---

**IMPORTANTE**: Não feche o Session Manager até ver `CREATE DATABASE` aparecer! ✅
