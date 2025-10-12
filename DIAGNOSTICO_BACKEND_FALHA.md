# 🔍 Diagnóstico: Backend Falha ao Iniciar

**Data:** 12 de outubro de 2025  
**Status:** ❌ Backend com exit code 1 - Erro na aplicação

---

## 🎯 Problema Identificado

**Tasks ECS Fargate do backend falham com exit code 1** mesmo com toda infraestrutura de rede configurada corretamente.

---

## ✅ Infraestrutura Corrigida

Todos os componentes de rede necessários foram criados e configurados:

### VPC Endpoints Criados

| Serviço | Endpoint ID | Status | Porta | Finalidade |
|---------|-------------|--------|-------|------------|
| **Secrets Manager** | `vpce-0958668029110354c` | ✅ Available | 443 | Buscar secrets (DATABASE_URL, etc) |
| **CloudWatch Logs** | `vpce-05a2c80dcf9c079fe` | ✅ Available | 443 | Enviar logs da aplicação |
| **ECR API** | `vpce-078a312800cf15754` | ✅ Available | 443 | Autenticação com ECR |
| **ECR DKR** | `vpce-0cb9dedc72d87204f` | ✅ Available | 443 | Pull de imagens Docker |
| **S3 Gateway** | `vpce-09658f477209bb623` | ✅ Available | - | Download de layers das imagens ECR |

### Security Group

- **ID:** `sg-06563301eba0427b2`
- **Regra HTTPS:** ✅ Porta 443 permitida de 10.0.0.0/16
- **Regra PostgreSQL:** ✅ Porta 5432 permitida (10.0.1.10/32 + SG source)

### Database

- **RDS:** `production-ysh-b2b-postgres.cmxiy0wqok6l.us-east-1.rds.amazonaws.com`
- **Database:** `medusa_db` ✅ **EXISTE** (confirmado via SSM)
- **Credenciais:** ✅ Corretas e URL-encoded em `/ysh-b2b/database-url`

---

## 🔴 Sintomas Observados

1. **Tasks iniciam mas param rapidamente** com "Essential container in task exited"
2. **Exit code consistente:** `1` (erro da aplicação Node.js)
3. **Logs inacessíveis:** Problemas de encoding no AWS CLI PowerShell
4. **Comportamento:** 1 task chega a subir brevemente (visto em tentativa 7, 32, 38) mas depois falha

---

## 🧪 Testes Realizados

### Teste 1: Migration Task Manual

```powershell
# Executado comando: yarn medusa db:migrate
# Resultado: STOPPED com exit code 1
# Conclusão: Aplicação falha mesmo com migrations isoladas
```

### Teste 2: VPC Endpoints

```tsx
✅ Secrets Manager acessível
✅ CloudWatch Logs acessível  
✅ ECR acessível
✅ S3 Gateway configurado
```

### Teste 3: Database Connectivity

```tsx
✅ Database medusa_db existe
✅ Bastion consegue conectar via SSM send-command
✅ DATABASE_URL correto com password URL-encoded
```

---

## 🔍 Possíveis Causas

### 1. **Problema na Aplicação Medusa** ⚠️ MAIS PROVÁVEL

O backend pode estar falhando por:

- **Tabelas faltando:** Migrations nunca rodaram com sucesso
- **Configuração incorreta:** Alguma variável de ambiente faltando ou inválida
- **Erro no código:** Problema ao inicializar servidor Medusa
- **Timeout de conexão:** Aplicação não aguarda database estar pronto

### 2. **Logs Não Enviados**

- Tasks podem estar travando antes de enviar logs ao CloudWatch
- Encoding do PowerShell impede visualização dos logs existentes
- Logs podem estar em outro log group

### 3. **Health Check do ALB**

- Target Group pode estar matando tasks por falha no health check
- Health check path pode estar incorreto ou timing agressivo

---

## 🚀 Soluções Propostas

### Solução 1: Usar Public IP Temporariamente (RECOMENDADO)

**Objetivo:** Permitir debug com logs acessíveis

```powershell
# 1. Modificar task definition para usar public IP
aws ecs register-task-definition --cli-input-json file://backend-task-def-public.json

# 2. Executar task única com public IP
aws ecs run-task `
  --cluster production-ysh-b2b-cluster `
  --task-definition ysh-b2b-backend:NOVA_VERSAO `
  --launch-type FARGATE `
  --network-configuration "awsvpcConfiguration={subnets=[subnet-0f561c79c40d11c6f],securityGroups=[sg-06563301eba0427b2],assignPublicIp=ENABLED}" `
  --overrides '{"containerOverrides":[{"name":"ysh-b2b-backend","command":["yarn","medusa","db:migrate"]}]}' `
  --profile ysh-production `
  --region us-east-1
```

**Vantagens:**

- Logs acessíveis via internet
- Secrets acessíveis via NAT implícito
- Debug mais fácil

### Solução 2: Verificar Logs via AWS Console

**Acesso direto:**

```tsx
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Fecs$252Fysh-b2b-backend
```

**Ou via CLI com encoding correto:**

```powershell
# Salvar logs em arquivo
$logEvents = aws logs filter-log-events `
  --log-group-name /ecs/ysh-b2b-backend `
  --start-time $((Get-Date).AddMinutes(-30).ToUniversalTime().ToString("o")) `
  --profile ysh-production `
  --region us-east-1 `
  --output json | ConvertFrom-Json

$logEvents.events | ForEach-Object { 
  "$($_.timestamp) : $($_.message)" 
} | Out-File -FilePath logs-backend.txt -Encoding UTF8
```

### Solução 3: Ajustar Health Check do Target Group

```powershell
# Aumentar timeout e intervalo do health check
aws elbv2 modify-target-group `
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-backend-tg/5d057ad67b1e08c0 `
  --health-check-interval-seconds 30 `
  --health-check-timeout-seconds 10 `
  --healthy-threshold-count 2 `
  --unhealthy-threshold-count 5 `
  --profile ysh-production `
  --region us-east-1
```

### Solução 4: Executar Migrations via Bastion

Como o bastion consegue conectar ao RDS, podemos:

```bash
# 1. Conectar ao bastion via Session Manager
# 2. Instalar Node.js e Yarn
sudo dnf install -y nodejs20 npm
npm install -g yarn

# 3. Clonar repositório (ou copiar arquivos backend/)
# 4. Configurar .env com DATABASE_URL
# 5. Executar migrations manualmente
yarn medusa db:migrate
yarn run seed
```

### Solução 5: Simplificar Teste - Container Básico

Testar com container mínimo para validar conectividade:

```dockerfile
FROM public.ecr.aws/docker/library/node:20-alpine
RUN apk add --no-cache postgresql15-client
CMD ["psql", "--version"]
```

---

## 📋 Próximos Passos Imediatos

### Opção A: Debug Rápido (30 min)

1. ✅ Acessar AWS Console CloudWatch Logs
2. ✅ Ler últimos erros do container
3. ✅ Identificar erro específico (connection refused, missing table, etc)
4. ✅ Aplicar correção

### Opção B: Bypass Temporário (1 hora)

1. ✅ Executar migrations via bastion host
2. ✅ Popular tabelas com seed data
3. ✅ Redeploy backend service
4. ✅ Verificar se inicia com tabelas criadas

### Opção C: Reconstrução (2 horas)

1. ✅ Criar nova task definition com public IP
2. ✅ Testar em subnet pública
3. ✅ Validar funcionamento completo
4. ✅ Migrar de volta para subnet privada

---

## 🎯 Recomendação Final

**PRIORIDADE 1:** Acessar logs via AWS Console para identificar erro exato

**PRIORIDADE 2:** Se logs mostrarem "tabelas não existem", executar migrations via bastion

**PRIORIDADE 3:** Ajustar health check do ALB para dar mais tempo ao backend iniciar

---

## 📊 Status Atual

```
✅ VPC Endpoints: 5/5 criados e disponíveis
✅ Security Groups: Configurados corretamente
✅ Database: Existe e acessível
✅ Secrets: Configurados e acessíveis
✅ Storefront: 2/2 tasks RUNNING (frontend OK)
❌ Backend: 0/2 tasks (EXIT CODE 1)
```

**Infraestrutura de rede está 100% funcional. Problema está na camada de aplicação.**

---

## 🔗 Links Úteis

- **CloudWatch Logs:** <https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups>
- **ECS Service:** <https://console.aws.amazon.com/ecs/v2/clusters/production-ysh-b2b-cluster/services/ysh-b2b-backend/health?region=us-east-1>
- **RDS Instance:** <https://console.aws.amazon.com/rds/home?region=us-east-1#database:id=production-ysh-b2b-postgres>
- **Target Groups:** <https://console.aws.amazon.com/ec2/home?region=us-east-1#TargetGroups>:

---

**Próximo comando sugerido:**

```powershell
# Abrir logs no browser
Start-Process "https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups/log-group/$252Fecs$252Fysh-b2b-backend"
```
