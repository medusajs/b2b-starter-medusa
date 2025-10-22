# 🔐 AWS RDS Connection - Setup Complete

**Data:** 22 de outubro de 2025  
**Status:** ✅ Conexão validada e funcionando

---

## 📊 Informações do RDS

| Propriedade | Valor |
|-------------|-------|
| **Instance ID** | `ysh-b2b-production-supabase-db` |
| **Endpoint** | `ysh-b2b-production-supabase-db.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432` |
| **IP Privado** | `10.0.10.153:5432` |
| **PostgreSQL** | 17.4 (64-bit) |
| **User** | `supabase_admin` |
| **Password** | `po5lwIAe_kKb5Ham0nPr2qeah2CGDNys` |
| **Database** | `postgres` |
| **SSL** | ✅ Obrigatório (`rejectUnauthorized: false`) |

---

## 🔌 SSH Tunnel (Desenvolvimento Local)

### Bastion Host

| Propriedade | Valor |
|-------------|-------|
| **Instance** | `ysh-bastion-temp` (i-0a887f43890bb28c3) |
| **IP Público** | `34.234.100.225` |
| **KeyPair** | `ysh-keypair.pem` |
| **User** | `ec2-user` |

### Comando para Abrir Túnel

```powershell
# Windows PowerShell
ssh -vvv -i ".\ysh-keypair.pem" `
  -o StrictHostKeyChecking=no `
  -o ServerAliveInterval=60 `
  -o ExitOnForwardFailure=yes `
  -N `
  -L 127.0.0.1:59588:ysh-b2b-production-supabase-db.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432 `
  ec2-user@34.234.100.225
```

```bash
# Linux/Mac
ssh -vvv -i "./ysh-keypair.pem" \
  -o StrictHostKeyChecking=no \
  -o ServerAliveInterval=60 \
  -o ExitOnForwardFailure=yes \
  -N \
  -L 127.0.0.1:59588:ysh-b2b-production-supabase-db.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432 \
  ec2-user@34.234.100.225
```

### Validar Túnel

```powershell
# PowerShell
Test-NetConnection 127.0.0.1 -Port 59588

# Bash/Zsh
nc -zv 127.0.0.1 59588
```

---

## 🧪 Testar Conexão

### Node.js (Recomendado)

```bash
node test-rds-connection.js
```

### psql (Se instalado)

```bash
# PowerShell
$env:PGPASSWORD='po5lwIAe_kKb5Ham0nPr2qeah2CGDNys'
psql -h 127.0.0.1 -p 59588 -U supabase_admin -d postgres -c "SELECT version();"

# Bash/Zsh
PGPASSWORD='po5lwIAe_kKb5Ham0nPr2qeah2CGDNys' \
psql -h 127.0.0.1 -p 59588 -U supabase_admin -d postgres -c "SELECT version();"
```

---

## 📁 Arquivos Criados/Atualizados

### `.env` (Desenvolvimento Local via Túnel)

```bash
DATABASE_URL=postgresql://supabase_admin:po5lwIAe_kKb5Ham0nPr2qeah2CGDNys@127.0.0.1:59588/postgres
DB_NAME=postgres
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

### `.env.production` (Deploy AWS ECS)

```bash
DATABASE_URL=postgresql://supabase_admin:po5lwIAe_kKb5Ham0nPr2qeah2CGDNys@ysh-b2b-production-supabase-db.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432/postgres
DB_NAME=postgres
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

### `test-rds-connection.js`

Script Node.js para validar conexão com RDS via túnel SSH.

---

## 🏗️ Infraestrutura AWS Detectada

### EC2 Instances (Running)

| Nome | Instance ID | Função |
|------|-------------|--------|
| `ysh-backend` | i-009c1d9c4dd119508 | Backend principal |
| `ysh-backend` | i-0bdc4063b1c3ab3e0 | Backend HA |
| `ysh-bastion-temp` | i-0a887f43890bb28c3 | Bastion host |
| `ysh-catalog-extractor` | i-01c23905ad86c5acc | Extrator de catálogos |

### RDS Instances

| ID | Endpoint | User | Port |
|----|----------|------|------|
| `ysh-b2b-production-supabase-db` | `ysh-b2b-production-supabase-db.cmxiy0wqok6l.us-east-1.rds.amazonaws.com` | `supabase_admin` | 5432 |
| `ysh-b2b-postgres-free` | `ysh-b2b-postgres-free.cmxiy0wqok6l.us-east-1.rds.amazonaws.com` | `medusa_user` | 5432 |
| `ysh-b2b-production-temporal-db` | `ysh-b2b-production-temporal-db.cmxiy0wqok6l.us-east-1.rds.amazonaws.com` | `temporal` | 5432 |
| `ysh-supabase-db` | `ysh-supabase-db.cmxiy0wqok6l.us-east-1.rds.amazonaws.com` | `supabase_admin` | 5432 |

### S3 Buckets

- `ysh-b2b-products` - Catálogos e SKUs
- `ysh-b2b-backups` - Backups
- `ysh-b2b-uploads` - Uploads de usuários
- `ysh-b2b-terraform-state` - Estado Terraform
- `ysh-aneel-data-20251021` - Datasets ANEEL

### ECS Services

- `ecs/ysh-b2b-backend`
- `ecs/ysh-b2b-backend-migrations`
- `ecs/ysh-b2b-backend-migrations-with-seed`
- `ecs/ysh-b2b-storefront`

### CloudFormation Stacks

- `ysh-b2b-production` - Status: `UPDATE_COMPLETE`
- `production-ysh-stack` - Status: `CREATE_COMPLETE`
- `CDKToolkit` - Status: `CREATE_COMPLETE`

---

## 🔒 Security Groups (Pendente Validação)

### Comando para Validar SGs

```powershell
$REGION="us-east-1"
$BASTION_IP="34.234.100.225"

# 1. Identificar SGs do Bastion
aws ec2 describe-instances --region $REGION `
  --filters "Name=ip-address,Values=$BASTION_IP" `
  --query "Reservations[].Instances[].{Id:InstanceId,SGs:SecurityGroups[].GroupId}"

# 2. Identificar SGs do RDS
aws rds describe-db-instances --region $REGION `
  --query "DBInstances[?DBInstanceIdentifier=='ysh-b2b-production-supabase-db'][].{Id:DBInstanceIdentifier,VpcSg:VpcSecurityGroups[].VpcSecurityGroupId}"

# 3. Validar regras do SG do RDS (substituir <RDS_SG_ID>)
aws ec2 describe-security-groups --region $REGION --group-ids <RDS_SG_ID> `
  --query "SecurityGroups[].IpPermissions[].{From:FromPort,To:ToPort,SourcesSG:UserIdGroupPairs[].GroupId}"

# 4. Validar egress do SG do Bastion (substituir <BASTION_SG_ID>)
aws ec2 describe-security-groups --region $REGION --group-ids <BASTION_SG_ID> `
  --query "SecurityGroups[].IpPermissionsEgress[].{From:FromPort,To:ToPort,ToSG:UserIdGroupPairs[].GroupId}"
```

### Regra Esperada

- **RDS SG Inbound**: Porta `5432` TCP a partir do **SG do Bastion**
- **Bastion SG Outbound**: Porta `5432` TCP para o **SG do RDS** (ou `0.0.0.0/0`)

### Criar Regra (Se Necessário)

```powershell
aws ec2 authorize-security-group-ingress --region us-east-1 `
  --group-id <RDS_SG_ID> `
  --protocol tcp --port 5432 `
  --source-group <BASTION_SG_ID>
```

---

## ✅ Testes Executados

### Test 1: Conexão TCP
```
✅ Port 59588 listening on 127.0.0.1
✅ TcpTestSucceeded: True
```

### Test 2: PostgreSQL Connection
```
✅ Connected to: 10.0.10.153:5432
✅ User: supabase_admin
✅ Database: postgres
✅ Backend PID: 8509
```

### Test 3: PostgreSQL Version
```
✅ PostgreSQL 17.4 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 12.4.0, 64-bit
```

### Test 4: Available Databases
```
✅ postgres (7715 kB)
✅ rdsadmin (7779 kB)
```

---

## 📝 Próximos Passos

1. **Validar Security Groups** (executar comandos AWS CLI acima)
2. **Criar databases adicionais** (se necessário):
   ```sql
   CREATE DATABASE medusa_backend;
   CREATE USER medusa_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE medusa_backend TO medusa_user;
   ```
3. **Executar migrations**:
   ```bash
   npm run migrations:run
   ```
4. **Configurar CI/CD** para usar `.env.production` no ECS

---

## 🆘 Troubleshooting

### Porta 59588 não escuta

```powershell
# Fechar SSH antigo
Get-Process ssh -ErrorAction SilentlyContinue | Stop-Process -Force

# Reabrir túnel
ssh -vvv -i ".\ysh-keypair.pem" -N -L 127.0.0.1:59588:ysh-b2b-production-supabase-db.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432 ec2-user@34.234.100.225
```

### Porta ocupada

```powershell
# Usar porta alternativa
ssh -i ".\ysh-keypair.pem" -N -L 127.0.0.1:54320:ysh-b2b-production-supabase-db.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432 ec2-user@34.234.100.225

# Atualizar .env
DATABASE_URL=postgresql://supabase_admin:po5lwIAe_kKb5Ham0nPr2qeah2CGDNys@127.0.0.1:54320/postgres
```

### Timeout na conexão

Validar Security Groups e rotas VPC (comandos acima).

---

## 📞 Contatos

- **AWS Account ID**: 773235999227
- **Região**: us-east-1
- **Stack Principal**: ysh-b2b-production
