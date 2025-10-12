# 🔧 Script de Correção - Backend Database Connection

## Problema Identificado

**Erro Atual**: `no pg_hba...` (PostgreSQL Host-Based Authentication)

**Causa**: O RDS foi criado mas:

1. Database `medusa_db` não existe
2. Usuário `medusa_user` não existe ou não tem permissões
3. O RDS está usando usuário/senha master padrão do CloudFormation

## Solução: Acessar RDS e Configurar

### Opção 1: Via Bastion Host (Recomendado)

#### 1.1 Criar Bastion Temporário

```powershell
# Criar par de chaves
aws ec2 create-key-pair `
  --key-name ysh-bastion-temp `
  --query 'KeyMaterial' `
  --output text `
  --profile ysh-production --region us-east-1 > ysh-bastion-temp.pem

# Launch instância na subnet pública
aws ec2 run-instances `
  --image-id ami-0c55b159cbfafe1f0 `
  --instance-type t3.micro `
  --key-name ysh-bastion-temp `
  --security-group-ids sg-06563301eba0427b2 `
  --subnet-id subnet-0f561c79c40d11c6f `
  --associate-public-ip-address `
  --iam-instance-profile Name=EC2-SSM-Role `
  --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=ysh-bastion-temp}]" `
  --profile ysh-production --region us-east-1
```

#### 1.2 Conectar via Session Manager

```powershell
# Obter instance ID
$instanceId = (aws ec2 describe-instances `
  --filters "Name=tag:Name,Values=ysh-bastion-temp" "Name=instance-state-name,Values=running" `
  --query "Reservations[0].Instances[0].InstanceId" `
  --output text `
  --profile ysh-production --region us-east-1)

# Conectar
aws ssm start-session --target $instanceId --profile ysh-production --region us-east-1
```

#### 1.3 Dentro do Bastion - Instalar PostgreSQL Client

```bash
# Instalar psql
sudo yum install postgresql15 -y

# Verificar credenciais do RDS no CloudFormation
# (precisa do master username e password)
```

### Opção 2: Obter Senha Master do RDS

**Problema**: Não sabemos a senha master configurada no CloudFormation!

Vou verificar o template CloudFormation para ver como foi criado:

```powershell
# Ver parâmetros do RDS
aws rds describe-db-instances `
  --db-instance-identifier production-ysh-b2b-postgres `
  --query "DBInstances[0].[MasterUsername,Endpoint.Address,Endpoint.Port]" `
  --output table `
  --profile ysh-production --region us-east-1
```

### Opção 3: Reset Master Password (Mais Seguro)

```powershell
# 1. Gerar nova senha forte
$newMasterPassword = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# 2. Modificar instância para resetar senha
aws rds modify-db-instance `
  --db-instance-identifier production-ysh-b2b-postgres `
  --master-user-password $newMasterPassword `
  --apply-immediately `
  --profile ysh-production --region us-east-1

# 3. Aguardar modificação completar (~5 min)
aws rds wait db-instance-available `
  --db-instance-identifier production-ysh-b2b-postgres `
  --profile ysh-production --region us-east-1

Write-Host "Nova senha master: $newMasterPassword"
```

#### 3.1 Conectar e Criar Database + Usuário

```bash
# Dentro do bastion
psql -h production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d postgres

# Comandos SQL
CREATE DATABASE medusa_db;
CREATE USER medusa_user WITH PASSWORD 'MedusaSecurePassword2024';
GRANT ALL PRIVILEGES ON DATABASE medusa_db TO medusa_user;
\c medusa_db
GRANT ALL ON SCHEMA public TO medusa_user;
ALTER DATABASE medusa_db OWNER TO medusa_user;
\q
```

#### 3.2 Atualizar Secret com Nova URL

```powershell
aws secretsmanager update-secret `
  --secret-id /ysh-b2b/database-url `
  --secret-string "postgresql://medusa_user:MedusaSecurePassword2024@production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com:5432/medusa_db" `
  --profile ysh-production --region us-east-1
```

**Nota**: Sem `!` na senha agora, URL encoding não é mais necessário

### Opção 4: Alternativa Rápida - Usar Master User Direto

Se CloudFormation usou senha padrão conhecida, podemos usar master user temporariamente:

```powershell
# Verificar template CloudFormation para ver se tem senha hardcoded
cat aws/cloudformation-infrastructure.yml | Select-String -Pattern "MasterUserPassword"
```

---

## Decisão Recomendada

**MELHOR**: Opção 3 - Reset master password, criar database e usuário corretamente

**Motivos**:

1. ✅ Não depende de senha desconhecida
2. ✅ Configura tudo do zero com segurança
3. ✅ Separa usuário master de usuário aplicação
4. ✅ Total controle sobre credenciais

**Tempo estimado**: 15-20 minutos

---

## Próximos Passos

1. ⏰ **Agora**: Verificar master username no RDS
2. ⏰ **+2 min**: Reset master password (se necessário)
3. ⏰ **+5 min**: Launch bastion + conectar
4. ⏰ **+8 min**: Criar database + usuário
5. ⏰ **+10 min**: Atualizar secret + redeploy
6. ⏰ **+13 min**: Verificar backend RUNNING
7. ⏰ **+15 min**: Run migrations
8. ⏰ **+18 min**: Run seed
9. ⏰ **+20 min**: Smoke tests

**ETA para sistema 100% funcional**: ~20 minutos

---

**Autor**: GitHub Copilot  
**Data**: 10/10/2025 17:00  
**Status**: ⏳ Aguardando execução
