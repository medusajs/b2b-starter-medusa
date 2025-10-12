# 🆘 Troubleshooting: Session Manager Connection Failed

**Erro:** "Failed to connect to your instance - Error establishing SSH connection"

**Data:** 12 de outubro de 2025  
**Instância:** i-0a8874f3890bb28c3

---

## ✅ Status Verificado

| Item | Status | Detalhes |
|------|--------|----------|
| **Instância** | ✅ Running | i-0a8874f3890bb28c3 |
| **IAM Role** | ✅ Anexado | ysh-bastion-ssm-profile |
| **SSM Agent** | ✅ Online | Versão 3.3.3050.0 (latest) |
| **Último Ping** | ✅ Recente | 2025-10-12 09:50:04 (há 5 min) |
| **Permissões IAM** | ✅ OK | AdministratorAccess |
| **Session Manager Plugin** | ❌ Não instalado | No seu PC local |

---

## 🎯 Causa do Problema

O erro ocorre porque você está tentando conectar via **AWS CLI local**, mas o **Session Manager Plugin não está instalado** no seu computador.

**Boa notícia:** Você **NÃO precisa instalar o plugin!** O AWS Console tem Session Manager integrado no navegador.

---

## ✅ Solução: Usar AWS Console (Recomendado)

### Passo 1: Abrir URL Direta

**Copie e cole no navegador:**

```
https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#InstanceDetails:instanceId=i-0a8874f3890bb28c3
```

**Ou execute no PowerShell:**

```powershell
Start-Process 'https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#InstanceDetails:instanceId=i-0a8874f3890bb28c3'
```

### Passo 2: Conectar via Session Manager

1. **Verificar** que a página mostra:
   - Instance ID: `i-0a8874f3890bb28c3`
   - Nome: `ysh-bastion-temp`
   - Status: `running` (verde)

2. **Clicar** no botão laranja **"Connect"** (canto superior direito)

3. Na janela que abrir, **selecionar aba** "Session Manager"

4. **Clicar** no botão laranja **"Connect"**

5. **Aguardar** 10-15 segundos - o terminal abrirá no navegador!

---

## 🔧 Se o Erro Persistir no Console

### Solução 1: Renovar Sessão AWS

```powershell
aws sso logout --profile ysh-production
aws sso login --profile ysh-production
```

**Credenciais:**

- Portal: <https://d-9066293405.awsapps.com/start>
- Username: ysh-dev
- Password: >NUSv^H<f*G#ti^GQO#e9u44uF>%x2IuU%L

### Solução 2: Limpar Cache do Navegador

1. Pressionar **Ctrl + Shift + Delete**
2. Selecionar "Cookies" e "Cache"
3. Limpar últimas 24 horas
4. Tentar conectar novamente

### Solução 3: Usar Modo Anônimo

1. Abrir navegador em **modo anônimo/privado**
2. Fazer login no AWS Console
3. Abrir URL da instância
4. Conectar via Session Manager

### Solução 4: Verificar Bloqueios de Rede

Se você está em rede corporativa:

- VPN pode estar bloqueando WebSocket (Session Manager usa)
- Firewall pode bloquear portas 443/8443
- Tentar conectar de outra rede (4G/5G do celular compartilhado)

---

## 📱 Alternativa: Instalar Session Manager Plugin (Opcional)

Se preferir usar AWS CLI local, pode instalar o plugin:

### Windows (PowerShell como Administrador)

```powershell
# Download
Invoke-WebRequest -Uri "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/windows/SessionManagerPluginSetup.exe" -OutFile "$env:TEMP\SessionManagerPluginSetup.exe"

# Instalar
Start-Process -FilePath "$env:TEMP\SessionManagerPluginSetup.exe" -ArgumentList "/quiet" -Wait

# Verificar
session-manager-plugin --version
```

**Depois de instalar:**

```powershell
aws ssm start-session --target i-0a8874f3890bb28c3 --profile ysh-production --region us-east-1
```

---

## 📋 Comandos para Executar no Terminal Session Manager

Quando conseguir conectar, execute estes 2 comandos:

### 1. Instalar PostgreSQL (2 minutos)

```bash
sudo dnf install -y postgresql15
```

### 2. Criar Database (10 segundos)

```bash
PGPASSWORD='bJwPx-g-u9?lt!O[[EG2:Kzj[cs~' psql -h production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com -U medusa_user -d postgres -c 'CREATE DATABASE medusa_db;'
```

**Saída esperada:** `CREATE DATABASE`

### 3. Sair

```bash
exit
```

---

## 🔍 Verificação Adicional

Se ainda não funcionar, execute este diagnóstico:

```powershell
# Verificar instância
aws ec2 describe-instances --instance-ids i-0a8874f3890bb28c3 --profile ysh-production --region us-east-1 --query "Reservations[0].Instances[0].[State.Name,IamInstanceProfile.Arn]"

# Verificar SSM
aws ssm describe-instance-information --filters "Key=InstanceIds,Values=i-0a8874f3890bb28c3" --profile ysh-production --region us-east-1 --query "InstanceInformationList[0].[PingStatus,LastPingDateTime]"

# Verificar permissões
aws sts get-caller-identity --profile ysh-production
```

**Enviar resultado se o problema persistir.**

---

## 🎯 Próximos Passos Após Criar Database

No PowerShell local:

```powershell
.\deploy-final.ps1 -SkipDatabaseCreation
```

**Duração:** 15 minutos (automatizado)

---

## ✅ Checklist de Troubleshooting

```
□ Abrir URL no navegador (não AWS CLI)
□ Verificar que página mostra i-0a8874f3890bb28c3
□ Clicar Connect > Session Manager > Connect
□ Se erro persistir: renovar sessão SSO
□ Se erro persistir: limpar cache do navegador
□ Se erro persistir: usar modo anônimo
□ Se erro persistir: tentar outra rede
```

---

**💡 Dica:** O método do navegador (AWS Console) é **mais confiável** que AWS CLI local para Session Manager, especialmente em redes corporativas.
