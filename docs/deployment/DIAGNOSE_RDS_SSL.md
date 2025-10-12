# Diagnóstico RDS SSL Configuration - EXECUTAR NO CLOUDSHELL

## 🔍 Verificar Configuração SSL do RDS

### Passo 1: Verificar RDS Parameter Group

```bash
aws rds describe-db-instances \
  --db-instance-identifier production-ysh-b2b-postgres \
  --region us-east-1 \
  --query 'DBInstances[0].[DBParameterGroups[0].DBParameterGroupName,Engine,EngineVersion]' \
  --output json
```

### Passo 2: Verificar Parâmetro `rds.force_ssl`

```bash
# Obter nome do parameter group do Passo 1 (ex: default.postgres15)
aws rds describe-db-parameters \
  --db-parameter-group-name PARAMETER_GROUP_NAME \
  --region us-east-1 \
  --query 'Parameters[?ParameterName==`rds.force_ssl`]' \
  --output json
```

**Valores esperados**:

- `"ParameterValue": "1"` → RDS **FORÇA** SSL (bom, mas por que não funciona?)
- `"ParameterValue": "0"` → RDS **PERMITE** não-SSL (problema!)

---

### Passo 3: Verificar Conectividade com `psql` (Teste Manual)

**Instalar psql no CloudShell** (se necessário):

```bash
sudo yum install -y postgresql15
```

**Testar conexão COM SSL**:

```bash
psql "postgresql://medusa_user:bJwPx-g-u9%3flt!O%5b%5bEG2%3aKzj%5bcs%7e@production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432/medusa_db?sslmode=require"
```

**Se conectar com sucesso**:

```
medusa_db=> \conninfo
```

Deve mostrar: `SSL connection (protocol: TLSv1.3, cipher: ...)`

**Se falhar com "no encryption"**:

- RDS está rejeitando SSL
- Security group bloqueando porta 5432
- URL mal formatada (URL encoding de senha)

---

### Passo 4: Verificar Security Group

```bash
aws ec2 describe-security-groups \
  --group-ids sg-06563301eba0427b2 \
  --region us-east-1 \
  --query 'SecurityGroups[0].IpPermissions[?FromPort==`5432`].[FromPort,ToPort,IpRanges,UserIdGroupPairs]' \
  --output json
```

**Deve permitir**:

- **Port**: 5432
- **Source**: `sg-06563301eba0427b2` (auto-referência) ou CIDR da VPC

---

## 🔬 Hipótese Principal: URL Encoding da Senha

A senha tem **caracteres especiais URL-encoded**:

```
bJwPx-g-u9%3flt!O%5b%5bEG2%3aKzj%5bcs%7e
```

**Decodificado**:

- `%3f` = `?`
- `%5b` = `[`
- `%3a` = `:`
- `%7e` = `~`

**Senha real**: `bJwPx-g-u9?lt!O[[EG2:Kzj[cs~`

### Possível Problema: Double Encoding ou Parsing Incorreto

O Node.js `pg` driver pode estar **mal interpretando** a URL encoded password.

---

## ✅ Solução 1: Testar com Senha Simples (Temporário)

**APENAS PARA DIAGNÓSTICO** - vamos criar um usuário teste:

```bash
# Conectar ao RDS via psql (se funcionar)
psql "postgresql://medusa_user:PASSWORD@production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432/medusa_db?sslmode=require"

# Criar usuário teste com senha simples
CREATE USER medusa_test WITH PASSWORD 'TestPassword123';
GRANT ALL PRIVILEGES ON DATABASE medusa_db TO medusa_test;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO medusa_test;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO medusa_test;
\q
```

**Atualizar secret temporário**:

```bash
aws secretsmanager create-secret \
  --name /ysh-b2b/database-url-test \
  --secret-string "postgresql://medusa_test:TestPassword123@production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432/medusa_db?sslmode=require" \
  --region us-east-1
```

**Modificar migrations task para usar secret teste**:

- Atualizar `secrets[0].valueFrom` para `/ysh-b2b/database-url-test`
- Registrar como revision 4
- Executar e validar logs

---

## ✅ Solução 2: Forçar SSL no RDS Parameter Group

Se `rds.force_ssl=0`, criar custom parameter group:

```bash
# Criar parameter group
aws rds create-db-parameter-group \
  --db-parameter-group-name ysh-b2b-postgres-ssl-enforced \
  --db-parameter-group-family postgres15 \
  --description "PostgreSQL 15 with SSL enforced" \
  --region us-east-1

# Modificar rds.force_ssl
aws rds modify-db-parameter-group \
  --db-parameter-group-name ysh-b2b-postgres-ssl-enforced \
  --parameters "ParameterName=rds.force_ssl,ParameterValue=1,ApplyMethod=immediate" \
  --region us-east-1

# Aplicar ao RDS (requer reboot)
aws rds modify-db-instance \
  --db-instance-identifier production-ysh-b2b-postgres \
  --db-parameter-group-name ysh-b2b-postgres-ssl-enforced \
  --region us-east-1

# Reboot (CUIDADO: downtime!)
aws rds reboot-db-instance \
  --db-instance-identifier production-ysh-b2b-postgres \
  --region us-east-1
```

---

## ✅ Solução 3: Usar `sslmode=verify-ca` com CA Bundle

A URL atual usa `sslmode=require` mas não valida o CA. Vamos tentar `verify-ca`:

```bash
aws secretsmanager update-secret \
  --secret-id /ysh-b2b/database-url \
  --secret-string "postgresql://medusa_user:bJwPx-g-u9%3flt!O%5b%5bEG2%3aKzj%5bcs%7e@production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432/medusa_db?sslmode=verify-ca&sslrootcert=/tmp/rds-ca-bundle.pem" \
  --region us-east-1
```

---

## 🎯 Próximos Passos

Execute **Passos 1 e 2** para verificar RDS parameter group e forçamento de SSL.

Se `rds.force_ssl=1`, o problema está no **client side** (Node.js pg driver não usando SSL).

Cole os resultados aqui! 🔍
