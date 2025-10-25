# 🚀 AWS ECR - Quick Reference

**Última Atualização:** 13 de Outubro de 2025

---

## 🔐 Autenticação Rápida

```powershell
# SSO Login
aws sso login --profile ysh-production

# ECR Docker Login
aws ecr get-login-password --profile ysh-production --region us-east-1 | `
  docker login --username AWS --password-stdin 773235999227.dkr.ecr.us-east-1.amazonaws.com
```

---

## 📦 URIs dos Repositórios

```bash
# Principal (Backend)
773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend

# Legados (considerar consolidação)
773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-backend
773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/backend

# Frontend
773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b-storefront
773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-b2b/storefront
```

---

## 🚀 Deploy Workflow

### 1. Build e Push (Automatizado)

```powershell
# Deploy versão nova
.\scripts\deploy-ecr.ps1 -Version v1.0.6

# Com BuildKit (mais rápido)
.\scripts\deploy-ecr.ps1 -Version v1.0.6 -UseBuildKit

# Apenas build (sem push)
.\scripts\deploy-ecr.ps1 -Version v1.0.6 -SkipPush
```

### 2. Deploy Manual

```powershell
# Build
docker build -t ysh-backend:v1.0.6 .

# Tag
docker tag ysh-backend:v1.0.6 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.6
docker tag ysh-backend:v1.0.6 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest

# Push
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.6
docker push 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest
```

---

## 📥 Pull e Run

```powershell
# Pull latest
docker pull 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest

# Run container
docker run -d `
  --name ysh-backend `
  -p 9000:9000 `
  --env-file .env.production `
  773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:latest

# Pull versão específica
docker pull 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.5
```

---

## 🔍 Comandos de Inspeção

```powershell
# Listar todos os repositórios
aws ecr describe-repositories --profile ysh-production --region us-east-1

# Listar imagens de um repositório
aws ecr list-images --repository-name ysh-backend --profile ysh-production --region us-east-1

# Detalhes das imagens
aws ecr describe-images --repository-name ysh-backend --profile ysh-production --region us-east-1

# Detalhes de imagem específica
aws ecr describe-images `
  --repository-name ysh-backend `
  --image-ids imageTag=latest `
  --profile ysh-production --region us-east-1
```

---

## 🧹 Manutenção

### Limpar Imagens Sem Tag

```powershell
# Dry run (apenas visualizar)
.\scripts\cleanup-ecr-untagged.ps1 -Repository ysh-backend -DryRun

# Executar limpeza
.\scripts\cleanup-ecr-untagged.ps1 -Repository ysh-backend
```

### Ativar/Desativar Scanning

```powershell
# Ativar scan on push
.\scripts\enable-ecr-scanning.ps1 -Repository ysh-backend -Action enable

# Desativar
.\scripts\enable-ecr-scanning.ps1 -Repository ysh-backend -Action disable

# Aplicar em todos os repositórios
.\scripts\enable-ecr-scanning.ps1 -Action enable
```

### Deletar Imagem Específica

```powershell
# Por digest
aws ecr batch-delete-image `
  --repository-name ysh-backend `
  --image-ids imageDigest=sha256:xxxxx `
  --profile ysh-production --region us-east-1

# Por tag
aws ecr batch-delete-image `
  --repository-name ysh-backend `
  --image-ids imageTag=v1.0.1 `
  --profile ysh-production --region us-east-1
```

---

## 🔄 Rollback

```powershell
# Opção 1: Usar versão anterior específica
docker pull 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.4
docker stop ysh-backend && docker rm ysh-backend
docker run -d --name ysh-backend -p 9000:9000 `
  773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:v1.0.4

# Opção 2: Usar tag 'previous' (se configurado)
docker pull 773235999227.dkr.ecr.us-east-1.amazonaws.com/ysh-backend:previous
```

---

## 🔐 Segurança

### Ver Resultados de Scan

```powershell
aws ecr describe-image-scan-findings `
  --repository-name ysh-backend `
  --image-id imageTag=latest `
  --profile ysh-production --region us-east-1
```

### Configurar Scan Automático

```powershell
aws ecr put-image-scanning-configuration `
  --repository-name ysh-backend `
  --image-scanning-configuration scanOnPush=true `
  --profile ysh-production --region us-east-1
```

---

## 📊 Lifecycle Policy

### Criar Arquivo `ecr-lifecycle-policy.json`

```json
{
  "rules": [
    {
      "rulePriority": 1,
      "description": "Keep last 10 images",
      "selection": {
        "tagStatus": "any",
        "countType": "imageCountMoreThan",
        "countNumber": 10
      },
      "action": {
        "type": "expire"
      }
    },
    {
      "rulePriority": 2,
      "description": "Remove untagged images after 7 days",
      "selection": {
        "tagStatus": "untagged",
        "countType": "sinceImagePushed",
        "countUnit": "days",
        "countNumber": 7
      },
      "action": {
        "type": "expire"
      }
    }
  ]
}
```

### Aplicar Policy

```powershell
aws ecr put-lifecycle-policy `
  --repository-name ysh-backend `
  --lifecycle-policy-text file://ecr-lifecycle-policy.json `
  --profile ysh-production --region us-east-1
```

---

## 🆘 Troubleshooting

### Erro: "no basic auth credentials"

```powershell
# Re-fazer login ECR
aws ecr get-login-password --profile ysh-production --region us-east-1 | `
  docker login --username AWS --password-stdin 773235999227.dkr.ecr.us-east-1.amazonaws.com
```

### Erro: "Unable to locate credentials"

```powershell
# Re-fazer login SSO
aws sso login --profile ysh-production

# Verificar credenciais
aws sts get-caller-identity --profile ysh-production
```

### Build Docker Lento

```powershell
# Usar BuildKit
$env:DOCKER_BUILDKIT = "1"
docker build -t ysh-backend:v1.0.6 .

# Ou via script
.\scripts\deploy-ecr.ps1 -Version v1.0.6 -UseBuildKit
```

### Limpar Cache Docker Local

```powershell
# Remover imagens não usadas
docker image prune -f

# Remover tudo (cuidado!)
docker system prune -a -f
```

---

## 📁 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `scripts/deploy-ecr.ps1` | Deploy automatizado |
| `scripts/cleanup-ecr-untagged.ps1` | Limpeza de imagens |
| `scripts/enable-ecr-scanning.ps1` | Configurar scanning |
| `Dockerfile` | Dockerfile principal |
| `.dockerignore` | Exclusões de build |
| `docs/AWS_ECR_STATUS_REPORT.md` | Relatório completo |
| `docs/AWS_ECR_EXECUTIVE_SUMMARY.md` | Resumo executivo |

---

## 🔗 Links Úteis

- **AWS Console ECR:** <https://console.aws.amazon.com/ecr/repositories?region=us-east-1>
- **SSO Portal:** <https://d-9066293405.awsapps.com/start>
- **ECR Pricing:** <https://aws.amazon.com/ecr/pricing/>
- **Docker Hub:** <https://hub.docker.com/>

---

## 💡 Dicas Rápidas

1. **Sempre use tags versionadas** (v1.0.x) além de `latest`
2. **Mantenha `latest` atualizado** para deploys rápidos
3. **Limpe imagens antigas** regularmente (lifecycle policy)
4. **Ative scan on push** para segurança
5. **Use BuildKit** para builds mais rápidos
6. **Documente mudanças** em cada versão

---

## 📞 Suporte

**Account ID:** 773235999227  
**Region:** us-east-1  
**Profile:** ysh-production  
**Role:** AdministratorAccess

**Em caso de problemas:**

1. Verificar autenticação SSO
2. Verificar credenciais ECR
3. Consultar CloudWatch Logs
4. Revisar documentação completa

---

**Versão do Documento:** 1.0  
**Última Atualização:** 2025-10-13  
**Próxima Revisão:** 2025-10-20
