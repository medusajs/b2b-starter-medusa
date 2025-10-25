# 🎯 AWS ECS - Relatório de Status Completo

**Data:** 13 de Outubro de 2025  
**Conta AWS:** 773235999227  
**Região:** us-east-1  
**Profile:** ysh-production

---

## 📋 Sumário Executivo

### Status Atual

| Recurso | Quantidade | Status |
|---------|------------|--------|
| **Clusters** | 2 | 1 ATIVO, 1 VAZIO |
| **Serviços** | 2 | 1 RUNNING, 1 FAILED |
| **Tasks Rodando** | 2 | Apenas storefront |
| **Load Balancers** | 1 | ACTIVE |
| **Target Groups** | 2 | 1 HEALTHY, 1 UNHEALTHY |
| **Task Definitions** | 23 | Várias versões |

### ⚠️ Problemas Críticos Identificados

1. **Backend Service FAILED** - 0 tasks rodando, deployment falhou
2. **Storefront Targets UNHEALTHY** - Health checks falhando
3. **Cluster Duplicado** - `ysh-b2b-cluster` vazio e sem uso
4. **Nomenclatura Inconsistente** - Usando prefixo legado `ysh-b2b-*`

---

## 🏢 Inventário de Clusters ECS

### 1. production-ysh-b2b-cluster ✅ ATIVO

**ARN:** `arn:aws:ecs:us-east-1:773235999227:cluster/production-ysh-b2b-cluster`

**Status:** ACTIVE  
**Capacity Providers:**

- FARGATE_SPOT (weight: 2, base: 0)
- FARGATE (weight: 1, base: 0)

**Recursos:**

- Running Tasks: 2
- Active Services: 2
- Container Instances: 0 (Fargate apenas)

**Serviços:**

1. `ysh-b2b-backend` - ❌ FAILED
2. `ysh-b2b-storefront` - ⚠️ RUNNING (targets unhealthy)

---

### 2. ysh-b2b-cluster ❌ VAZIO

**ARN:** `arn:aws:ecs:us-east-1:773235999227:cluster/ysh-b2b-cluster`

**Status:** ACTIVE (mas sem uso)  
**Capacity Providers:** Nenhum configurado

**Recursos:**

- Running Tasks: 0
- Active Services: 0
- Container Instances: 0

**⚠️ Recomendação:** DELETAR - Cluster vazio sem serviços ou tasks

---

## 🔧 Detalhes dos Serviços

### 1. ysh-b2b-backend ❌ CRÍTICO

**Status:** ACTIVE (mas deployment FAILED)  
**Cluster:** production-ysh-b2b-cluster

**Configuração:**

- Desired Count: 2
- Running Count: 0 ❌
- Task Definition: `ysh-b2b-backend:12`

**Load Balancer:**

- Target Group: `ysh-backend-tg`
- Port: 9000
- Health Check: `/health`
- Health Status: ❌ Sem targets registrados

**Último Evento (2025-10-12 15:28):**

```
(service ysh-b2b-backend) (deployment ecs-svc/4115304556065230844) 
deployment failed: tasks failed to start.
```

**⚠️ Problemas:**

- Tasks não estão iniciando
- Deployment falhou
- Nenhum target saudável
- Possível problema com:
  - Imagem Docker
  - Configuração de secrets
  - Health check endpoint
  - Recursos insuficientes (CPU/Memória)

---

### 2. ysh-b2b-storefront ⚠️ PARCIALMENTE OPERACIONAL

**Status:** ACTIVE  
**Cluster:** production-ysh-b2b-cluster

**Configuração:**

- Desired Count: 2
- Running Count: 2 ✅
- Task Definition: `ysh-b2b-storefront:8`

**Load Balancer:**

- Target Group: `ysh-storefront-tg`
- Port: 8000
- Health Check: `/`
- Health Status: ⚠️ UNHEALTHY

**Targets:**

- 10.0.1.144:8000 - UNHEALTHY
- 10.0.2.197:8000 - UNHEALTHY

**⚠️ Problemas:**

- Tasks rodando mas health checks falhando
- Possível problema com:
  - Aplicação não respondendo na porta correta
  - Health check path incorreto
  - Startup time muito lento
  - Configuração de segurança bloqueando

---

## 📝 Task Definitions

### Backend Tasks

| Task Definition | Revisão | Status |
|-----------------|---------|--------|
| ysh-b2b-backend | 1-11 | Versões antigas |
| ysh-b2b-backend | 12 | ✅ ATUAL (mas falhando) |
| ysh-b2b-backend-migrations | 1-3 | Migrations tasks |

**Total de revisões backend:** 15

### Storefront Tasks

| Task Definition | Revisão | Status |
|-----------------|---------|--------|
| ysh-b2b-storefront | 1-7 | Versões antigas |
| ysh-b2b-storefront | 8 | ✅ ATUAL (rodando) |

**Total de revisões storefront:** 8

**⚠️ Observação:** Muitas revisões antigas acumuladas (total: 23 task definitions)

---

## 🌐 Load Balancer e Networking

### Application Load Balancer

**Nome:** production-ysh-b2b-alb  
**DNS:** `production-ysh-b2b-alb-1849611639.us-east-1.elb.amazonaws.com`  
**Status:** ACTIVE ✅  
**Tipo:** Application Load Balancer  
**VPC:** vpc-096abb11405bb44af

### Target Groups

#### 1. ysh-backend-tg

**Porta:** 9000  
**Protocol:** HTTP  
**Health Check:** `/health`  
**VPC:** vpc-096abb11405bb44af  
**Targets:** 0 registrados ❌

**ARN:** `arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-backend-tg/5d057ad67b1e08c0`

---

#### 2. ysh-storefront-tg

**Porta:** 8000  
**Protocol:** HTTP  
**Health Check:** `/`  
**VPC:** vpc-096abb11405bb44af  
**Targets:** 2 UNHEALTHY ⚠️

**ARN:** `arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-storefront-tg/de48968877cc252d`

**Targets Atuais:**

```
10.0.1.144:8000 - UNHEALTHY
10.0.2.197:8000 - UNHEALTHY
```

---

## 🔍 Análise de Problemas

### Problema 1: Backend Service FAILED ❌ CRÍTICO

**Impacto:** Aplicação backend completamente fora do ar

**Sintomas:**

- 0 tasks rodando (esperado: 2)
- Deployment falhou: "tasks failed to start"
- Últimas tentativas de restart: 2025-10-12 15:28

**Possíveis Causas:**

1. **Imagem Docker com problemas**
   - Imagem ECR não encontrada ou sem permissão
   - Usando repositório legado deletado?
   - Tag incorreta

2. **Secrets/Environment Variables**
   - Secrets Manager inacessível
   - Variáveis de ambiente faltando
   - Database connection string incorreto

3. **Health Check Falhando**
   - Endpoint `/health` não respondendo
   - Timeout muito curto
   - Aplicação crashando no startup

4. **Recursos Insuficientes**
   - CPU/Memória além do limit da task definition
   - Fargate Spot indisponível

**Investigação Necessária:**

```bash
# Ver logs da última task que falhou
aws ecs describe-tasks --cluster production-ysh-b2b-cluster \
  --tasks <task-id> --profile ysh-production

# Ver task definition atual
aws ecs describe-task-definition \
  --task-definition ysh-b2b-backend:12 \
  --profile ysh-production
```

---

### Problema 2: Storefront Targets UNHEALTHY ⚠️ ALTO

**Impacto:** Aplicação rodando mas não acessível via Load Balancer

**Sintomas:**

- Tasks rodando (2/2)
- Mas todos os targets UNHEALTHY
- Health check falhando em `/`

**Possíveis Causas:**

1. **Porta Incorreta**
   - Target Group configurado para porta 8000
   - Container pode estar expondo porta diferente (3000?)

2. **Health Check Path**
   - Verificando `/` mas app pode não ter rota raiz
   - Ou requer autenticação/headers específicos

3. **Security Groups**
   - ALB não consegue alcançar tasks
   - Regras de inbound/outbound bloqueando

4. **Startup Time**
   - Aplicação demora para iniciar
   - Health check timeout muito curto

**Investigação Necessária:**

```bash
# Ver configuração da task definition
aws ecs describe-task-definition \
  --task-definition ysh-b2b-storefront:8 \
  --profile ysh-production

# Ver security groups das tasks
aws ecs describe-tasks --cluster production-ysh-b2b-cluster \
  --tasks <task-id> --profile ysh-production \
  --query 'tasks[0].attachments[0].details'
```

---

### Problema 3: Cluster Duplicado ⚠️ MÉDIO

**Cluster:** ysh-b2b-cluster  
**Status:** Vazio, sem uso, sem recursos

**Impacto:** Custos desnecessários, confusão organizacional

**Recomendação:** Deletar imediatamente

**Comando:**

```bash
aws ecs delete-cluster \
  --cluster ysh-b2b-cluster \
  --profile ysh-production \
  --region us-east-1
```

---

### Problema 4: Nomenclatura Inconsistente ⚠️ BAIXO

**Problema:** Uso de prefixo legado `ysh-b2b-*`

**Impacto:**

- Inconsistência com novos recursos ECR (`ysh-*`)
- Confusão na identificação de recursos
- Dificuldade em migração futura

**Recursos Afetados:**

- Cluster: `production-ysh-b2b-cluster`
- Serviços: `ysh-b2b-backend`, `ysh-b2b-storefront`
- Task Definitions: `ysh-b2b-backend`, `ysh-b2b-storefront`
- Target Groups: `ysh-backend-tg`, `ysh-storefront-tg` (melhores)

**Recomendação:** Considerar renomear em próxima iteração para:

- `ysh-production-cluster`
- `ysh-backend`, `ysh-storefront`
- `ysh-backend-task`, `ysh-storefront-task`

---

## 📊 Análise de Custos

### Custos Estimados Atuais

**ECS Fargate:**

- 2 tasks storefront rodando
- 0 tasks backend rodando
- Configuração típica: 0.5 vCPU + 1GB RAM por task

**Cálculo:**

- 2 tasks × $0.04048/hour (0.5 vCPU) = $0.08096/hour
- 2 tasks × $0.004445/GB/hour × 1GB = $0.00889/hour
- **Total:** ~$0.09/hour = ~$65/mês (storefront apenas)

**Load Balancer:**

- 1 ALB: ~$16/mês
- LCU costs: ~$5-10/mês (baixo tráfego)
- **Total:** ~$21-26/mês

**Total Estimado Atual:** ~$86-91/mês

**⚠️ Observação:** Backend não está rodando, então custos reais deveriam ser ~$150/mês com ambos ativos

---

## 🎯 Plano de Ação Prioritário

### 1. ❌ CRÍTICO - Resolver Backend Service Failure

**Prioridade:** IMEDIATA  
**Impacto:** Aplicação backend completamente fora do ar

**Ações:**

1. Verificar qual imagem Docker a task definition está usando
2. Confirmar se a imagem existe no ECR
3. Revisar logs da última task que falhou
4. Verificar secrets e environment variables
5. Testar health check endpoint manualmente
6. Ajustar task definition se necessário
7. Forçar novo deployment

**Comandos:**

```bash
# 1. Ver task definition atual
aws ecs describe-task-definition \
  --task-definition ysh-b2b-backend:12 \
  --profile ysh-production --region us-east-1

# 2. Ver logs das tasks falhadas (CloudWatch)
aws logs tail /ecs/ysh-b2b-backend \
  --follow --profile ysh-production --region us-east-1

# 3. Forçar novo deployment após correções
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-backend \
  --force-new-deployment \
  --profile ysh-production --region us-east-1
```

---

### 2. ⚠️ ALTO - Corrigir Health Checks do Storefront

**Prioridade:** ALTA  
**Impacto:** Aplicação inacessível via Load Balancer

**Ações:**

1. Verificar porta exposta pelo container (8000 vs 3000?)
2. Testar acesso direto ao container via IP
3. Revisar configuração do Target Group
4. Ajustar health check path/timeout se necessário
5. Verificar Security Groups

**Comandos:**

```bash
# 1. Ver task definition e porta do container
aws ecs describe-task-definition \
  --task-definition ysh-b2b-storefront:8 \
  --profile ysh-production --region us-east-1 \
  --query 'taskDefinition.containerDefinitions[0].portMappings'

# 2. Ver configuração do Target Group
aws elbv2 describe-target-groups \
  --target-group-arns arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-storefront-tg/de48968877cc252d \
  --profile ysh-production --region us-east-1

# 3. Modificar health check se necessário
aws elbv2 modify-target-group \
  --target-group-arn arn:aws:elasticloadbalancing:us-east-1:773235999227:targetgroup/ysh-storefront-tg/de48968877cc252d \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 10 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3 \
  --profile ysh-production --region us-east-1
```

---

### 3. ✅ MÉDIO - Deletar Cluster Vazio

**Prioridade:** MÉDIA  
**Impacto:** Limpeza organizacional

**Ações:**

```bash
# Deletar cluster vazio
aws ecs delete-cluster \
  --cluster ysh-b2b-cluster \
  --profile ysh-production \
  --region us-east-1
```

---

### 4. 🔄 BAIXO - Atualizar Task Definitions para Novos Repositórios ECR

**Prioridade:** BAIXA (após resolver problemas críticos)  
**Impacto:** Alinhamento com nova estrutura ECR

**Ações:**

1. Criar novas task definitions apontando para:
   - `773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest`
   - `773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-storefront:latest`

2. Atualizar serviços para usar novas task definitions

3. Testar deployment completo

4. Deprecar task definitions antigas após 30 dias

---

### 5. 🧹 BAIXO - Limpeza de Task Definitions Antigas

**Prioridade:** BAIXA  
**Impacto:** Organização, redução de clutter

**Total de task definitions:** 23  
**Recomendação:** Manter apenas últimas 5 versões de cada

**Ações:**

```bash
# Desregistrar versões antigas (1-7 do backend, 1-3 do storefront)
aws ecs deregister-task-definition \
  --task-definition ysh-b2b-backend:1 \
  --profile ysh-production --region us-east-1

# Repetir para cada versão antiga...
```

---

## 🔧 Comandos Úteis de Troubleshooting

### Ver logs de um serviço

```bash
# CloudWatch Logs
aws logs tail /ecs/ysh-b2b-backend --follow \
  --profile ysh-production --region us-east-1
```

### Listar tasks em execução

```bash
aws ecs list-tasks \
  --cluster production-ysh-b2b-cluster \
  --service-name ysh-b2b-storefront \
  --profile ysh-production --region us-east-1
```

### Ver detalhes de uma task específica

```bash
aws ecs describe-tasks \
  --cluster production-ysh-b2b-cluster \
  --tasks <task-arn> \
  --profile ysh-production --region us-east-1
```

### Forçar novo deployment

```bash
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-backend \
  --force-new-deployment \
  --profile ysh-production --region us-east-1
```

### Escalar serviço

```bash
aws ecs update-service \
  --cluster production-ysh-b2b-cluster \
  --service ysh-b2b-backend \
  --desired-count 2 \
  --profile ysh-production --region us-east-1
```

---

## 📋 Checklist de Validação

### Infraestrutura ECS

- [ ] Backend service rodando (2/2 tasks)
- [ ] Storefront service rodando (2/2 tasks)
- [ ] Todos os targets HEALTHY no ALB
- [ ] Cluster vazio deletado
- [ ] Task definitions antigas limpas

### Load Balancer

- [ ] ALB acessível via DNS
- [ ] Health checks passando
- [ ] Routing rules configuradas
- [ ] SSL/TLS configurado (se aplicável)

### Task Definitions

- [ ] Usando imagens dos novos repositórios ECR
- [ ] Secrets configurados corretamente
- [ ] Environment variables corretas
- [ ] Recursos (CPU/RAM) adequados
- [ ] Health checks otimizados

### Networking

- [ ] Security Groups permitem tráfego ALB → Tasks
- [ ] Subnets privadas configuradas
- [ ] NAT Gateway para acesso externo
- [ ] VPC Flow Logs habilitados (opcional)

---

## 📚 Referências

### AWS Console Links

**ECS:**

- Clusters: <https://console.aws.amazon.com/ecs/v2/clusters>
- Services: <https://console.aws.amazon.com/ecs/v2/clusters/production-ysh-b2b-cluster/services>
- Task Definitions: <https://console.aws.amazon.com/ecs/v2/task-definitions>

**Load Balancers:**

- ALB: <https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#LoadBalancers>:
- Target Groups: <https://console.aws.amazon.com/ec2/v2/home?region=us-east-1#TargetGroups>:

**CloudWatch:**

- Logs: <https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#logsV2:log-groups>

---

## 🎯 Próximos Passos

### Imediato (Hoje)

1. ❌ Diagnosticar e corrigir backend service failure
2. ⚠️ Corrigir health checks do storefront
3. ✅ Deletar cluster vazio

### Esta Semana

4. Atualizar task definitions para novos repositórios ECR
5. Testar deployment end-to-end completo
6. Configurar alarmes CloudWatch para health checks

### Próximo Mês

7. Limpar task definitions antigas
8. Considerar renomear recursos para nomenclatura consistente
9. Implementar auto-scaling policies
10. Revisar custos e otimizar configurações

---

**Status Final:** ❌ **AÇÃO IMEDIATA NECESSÁRIA**

**Problemas Críticos:** 2  
**Problemas de Alta Prioridade:** 1  
**Melhorias Recomendadas:** 3

---

*Relatório gerado em: 13 de Outubro de 2025*  
*Próxima revisão: Após correção dos problemas críticos*
