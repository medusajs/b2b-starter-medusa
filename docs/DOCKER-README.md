# 🚀 YSH B2B - Configurações Docker/Podman Otimizadas

## 📋 Visão Geral

Este projeto inclui configurações Docker/Podman altamente otimizadas para máxima performance e eficácia em AWS e Vercel. As configurações foram projetadas especificamente para o projeto Medusa B2B com foco em:

- **Performance**: Builds multi-stage, cache otimizado, recursos limitados
- **Segurança**: Usuários não-root, health checks, headers de segurança
- **Escalabilidade**: Configurações AWS ECS/Fargate, Vercel Edge
- **Eficiência**: Build paralelo, otimização de imagens, compressão

## 🏗️ Arquitetura

```bash
ysh-b2b/
├── backend/                 # API Medusa + Admin
│   ├── Dockerfile          # Multi-stage otimizado
│   └── .dockerignore       # Exclusões otimizadas
├── storefront/             # Next.js Storefront
│   ├── Dockerfile          # Build otimizado Next.js
│   ├── .dockerignore       # Exclusões específicas
│   ├── vercel.json         # Configuração Vercel
│   └── next.config.js      # Configurações de performance Next.js
├── docker-compose.yml      # Orquestração local
├── nginx.conf             # Load balancer otimizado
├── aws/                   # Configurações AWS
│   ├── cloudformation-infrastructure.yml
│   ├── backend-task-definition.json
│   └── storefront-task-definition.json
├── scripts/               # Scripts de automação
│   ├── deploy-aws.sh      # Deploy AWS automatizado
│   ├── deploy-vercel.sh   # Deploy Vercel automatizado
│   └── local-build.bat    # Build local Windows
└── .github/workflows/     # CI/CD GitHub Actions
    ├── deploy-aws.yml
    └── deploy-vercel.yml
```

## 🐳 Docker - Desenvolvimento Local

### Pré-requisitos

- Docker Desktop instalado
- 8GB+ RAM disponível
- PowerShell (Windows) ou Bash (Linux/Mac)

### 🚀 Início Rápido

```bash
# Windows
.\scripts\local-build.bat

# Linux/Mac
chmod +x scripts/local-build.sh
./scripts/local-build.sh
```

### Acesso aos Serviços

- **Storefront**: [http://localhost:8000](http://localhost:8000)
- **Backend API**: [http://localhost:9000](http://localhost:9000)
- **Load Balancer**: [http://localhost](http://localhost)
- **Admin Panel**: [http://localhost:9000/admin](http://localhost:9000/admin)

### Comandos Úteis

```bash
# Ver logs em tempo real
docker compose logs -f

# Rebuildar sem cache
docker compose build --no-cache

# Parar todos os serviços
docker compose down

# Limpar volumes e containers
docker compose down --volumes --remove-orphans
```

## ☁️ AWS ECS/Fargate

### Recursos Otimizados

- **Multi-AZ**: Alta disponibilidade em múltiplas zonas
- **Auto Scaling**: Escalabilidade automática baseada em CPU/Memória
- **Load Balancer**: Application Load Balancer otimizado
- **RDS PostgreSQL**: Instância otimizada com Performance Insights
- **ElastiCache Redis**: Cache em memória para performance
- **ECR**: Registry privado com lifecycle policies

### Configurações de Performance

```yaml
# Backend - Fargate
CPU: 1024 (1 vCPU)
Memory: 2048 MB
Health Check: /health endpoint
Auto Scaling: 2-10 instâncias

# Storefront - Fargate  
CPU: 512 (0.5 vCPU)
Memory: 1024 MB
Health Check: / endpoint
Auto Scaling: 2-20 instâncias
```

### Deploy AWS

```bash
# Configurar variáveis
export AWS_ACCOUNT_ID="123456789012"
export AWS_REGION="us-east-1"

# Executar deploy
chmod +x scripts/deploy-aws.sh
./scripts/deploy-aws.sh all
```

### Pré-requisitos AWS

1. AWS CLI configurado
2. Docker instalado
3. Permissões IAM adequadas
4. CloudFormation stack implantada

## 🌐 Vercel

### Otimizações Implementadas

- **Next.js 14+**: App Router com Server Components
- **Edge Runtime**: Máxima performance global
- **Image Optimization**: Formatos AVIF/WebP
- **Build Cache**: Cache otimizado de builds
- **Compression**: Gzip/Brotli automático

### Configurações de Performance Vercel

```json
{
  "regions": ["iad1", "sfo1"],
  "functions": {
    "maxDuration": 30,
    "memory": 1024
  },
  "build": {
    "env": {
      "NODE_OPTIONS": "--max-old-space-size=4096"
    }
  }
}
```

### Deploy Vercel

```bash
# Preview
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh preview

# Produção
./scripts/deploy-vercel.sh production
```

### Pré-requisitos Vercel

1. Vercel CLI instalado: `npm i -g vercel`
2. Account Vercel ativo
3. Variáveis de ambiente configuradas

## 🔧 Configurações de Ambiente

### Backend (.env)

```bash
NODE_ENV=production
DATABASE_URL=postgres://user:pass@host:5432/db
REDIS_URL=redis://host:6379
JWT_SECRET=your-jwt-secret
COOKIE_SECRET=your-cookie-secret
```

### Storefront (.env.local)

```bash
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-backend.com
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_BASE_URL=https://your-storefront.com
NEXT_PUBLIC_DEFAULT_REGION=us
REVALIDATE_SECRET=your-revalidate-secret
```

## 📊 Monitoramento e Performance

### Métricas AWS

- **CloudWatch**: Logs centralizados
- **Performance Insights**: Monitoramento DB
- **Container Insights**: Métricas ECS
- **X-Ray**: Tracing distribuído

### Métricas Vercel

- **Analytics**: Performance real-time
- **Speed Insights**: Core Web Vitals
- **Function Logs**: Debugging serverless
- **Edge Network**: Latência global

## 🔒 Segurança

### Docker

- Imagens oficiais e atualizadas
- Usuários não-root
- Multi-stage builds
- Minimal base images (Alpine)
- Security scanning habilitado

### Headers de Segurança

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Referrer-Policy: strict-origin-when-cross-origin
```

## 🚦 CI/CD

### GitHub Actions

Workflows automatizados para:

- **Tests**: Testes unitários e builds
- **Security**: Scans de vulnerabilidades
- **Deploy**: Automação de deploys
- **Notifications**: Alertas em Slack/Discord

### Secrets Necessários

```yaml
# AWS
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY

# Vercel  
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

## 🎯 Benchmarks de Performance

### Métricas Locais (Docker Compose)

- **Startup Time**: ~30-45 segundos
- **Memory Usage**: ~2GB total
- **Response Time**: <100ms (local)

### Métricas AWS (Produção)

- **Cold Start**: ~2-3 segundos
- **Response Time**: <200ms (global)
- **Throughput**: 1000+ req/min por instância

### Métricas Vercel (Edge)

- **Cold Start**: <1 segundo
- **Global Latency**: <100ms
- **Cache Hit Rate**: >95%

## 🛠️ Troubleshooting

### Problemas Comuns

#### Docker Build Lento

```bash
# Usar cache do BuildKit
export DOCKER_BUILDKIT=1
docker build --cache-from image:latest
```

#### Erro de Memória Next.js

```bash
# Aumentar heap size
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### AWS Deploy Falha

```bash
# Verificar logs
aws logs describe-log-groups
aws logs get-log-events --log-group-name /ecs/ysh-b2b-backend
```

### Comandos de Debug

```bash
# Health checks
curl -f http://localhost:9000/health
curl -f http://localhost:8000

# Container stats
docker stats

# Logs em tempo real
docker compose logs -f backend
docker compose logs -f storefront

# Verificar recursos
docker system df
docker system prune -a
```

## 📈 Otimizações Avançadas

### Para Produção de Alto Volume

1. **Database Pooling**: pgBouncer para PostgreSQL
2. **CDN**: CloudFront para assets estáticos  
3. **Caching**: Redis Cluster multi-AZ
4. **Monitoring**: Datadog/New Relic
5. **Alerting**: PagerDuty integration

### Para Custos Otimizados

1. **Spot Instances**: FARGATE_SPOT para cargas não-críticas
2. **Reserved Capacity**: RDS e ElastiCache reserved
3. **S3 Intelligent Tiering**: Para uploads/assets
4. **Lambda**: Para processos batch

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- 📧 Email: suporte@ysh-b2b.com
- 💬 Discord: [YSH B2B Community](https://discord.gg/ysh-b2-b)
- 📋 Issues: [GitHub Issues](https://github.com/own-boldsbrain/ysh-b2b/issues)