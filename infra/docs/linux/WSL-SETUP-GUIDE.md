# Setup Rápido WSL - YSH B2B Development Environment

## 1. Primeiro Setup (Execute uma vez)

```bash
# Clone os scripts de setup (se ainda não tiver o projeto)
cd ~
git clone https://github.com/own-boldsbrain/ysh-b2b.git projects/ysh-b2b
cd projects/ysh-b2b

# Tornar scripts executáveis
chmod +x infra/scripts/linux/*.sh

# Executar setup completo do sistema
./infra/scripts/linux/fedora-debian-setup.sh
```

⚠️ **Importante**: Após o setup do sistema, reinicie o terminal ou execute:
```bash
source ~/.zshrc
```

## 2. Setup do Projeto

```bash
# Executar setup específico do projeto
./infra/scripts/linux/ysh-project-setup.sh
```

## 3. Configuração de Variáveis de Ambiente

### Backend (.env)
```bash
cd backend
cp .env.template .env
nano .env  # ou code .env
```

Configure:
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa
REDIS_URL=redis://localhost:6379
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
DATABASE_SSL=false
MEDUSA_ADMIN_CORS=http://localhost:7001,http://localhost:7000
STORE_CORS=http://localhost:8000
```

### Storefront (.env.local)
```bash
cd ../storefront
cp .env.local.template .env.local
nano .env.local  # ou code .env.local
```

Configure:
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_BASE_URL=http://localhost:8000
```

## 4. Iniciar Ambiente de Desenvolvimento

```bash
# Voltar para raiz do projeto
cd ~/projects/ysh-b2b

# Iniciar ambiente completo
./start-dev.sh
```

## 5. Comandos Úteis

### Gerenciamento do Ambiente
```bash
./start-dev.sh     # Inicia tudo (containers + apps)
./stop-dev.sh      # Para tudo
./reset-env.sh     # Reset completo (limpa tudo)
```

### Comandos Manuais
```bash
# Containers apenas
podman-compose -f podman-compose.dev.yml up -d
podman-compose -f podman-compose.dev.yml down

# Backend apenas
cd backend && yarn dev

# Storefront apenas
cd storefront && yarn dev

# Build e test
cd backend && yarn build && yarn test
cd storefront && yarn build
```

### AWS CLI
```bash
aws configure                    # Configurar credenciais
aws sts get-caller-identity     # Testar conectividade
aws s3 ls                       # Listar buckets S3
```

### Debugging
```bash
# Logs de containers
podman logs medusa-backend
podman logs medusa-postgres
podman logs medusa-redis

# Status dos containers
podman ps
podman stats

# Verificar portas
netstat -tlnp | grep :9000   # Backend
netstat -tlnp | grep :8000   # Storefront
netstat -tlnp | grep :5432   # PostgreSQL
```

## 6. URLs de Acesso

- **Storefront**: http://localhost:8000
- **Backend API**: http://localhost:9000
- **Admin Dashboard**: http://localhost:9000/admin
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 7. Estrutura do Projeto

```
ysh-b2b/
├── backend/          # Medusa.js server
├── storefront/       # Next.js B2B frontend
├── infra/
│   ├── scripts/linux/    # Scripts de setup Linux
│   └── docs/             # Documentação
├── docker-compose.yml
├── podman-compose.dev.yml
├── start-dev.sh      # Script de inicialização
├── stop-dev.sh       # Script para parar
└── reset-env.sh      # Script de reset
```

## 8. Troubleshooting

### Problema com permissões
```bash
sudo chown -R $USER:$USER ~/projects/ysh-b2b
```

### Problema com Yarn/Node
```bash
nvm use 20
corepack enable
```

### Problema com containers
```bash
podman system prune -af
podman volume prune -f
```

### Problema com banco
```bash
# Reset do banco
podman-compose -f podman-compose.dev.yml down -v
podman-compose -f podman-compose.dev.yml up -d postgres
cd backend && yarn run migration:run
```

## 9. Performance Tips

### Configurar .wslconfig (Windows)
Arquivo: `C:\Users\seu-usuario\.wslconfig`
```ini
[wsl2]
memory=8GB
processors=4
swap=2GB
localhostForwarding=true

[experimental]
sparseVhd=true
autoMemoryReclaim=gradual
```

Após criar o arquivo:
```powershell
# No PowerShell do Windows
wsl --shutdown
# Reabrir WSL
```

## 10. Git Workflow

```bash
# Configurar SSH (se não foi feito)
ssh-keygen -t ed25519 -C "your-email@example.com"
cat ~/.ssh/id_ed25519.pub  # Adicionar ao GitHub

# Workflow básico
git status
git add .
git commit -m "feat: sua mudança"
git push origin main

# Branches
git checkout -b feature/nova-funcionalidade
git push origin feature/nova-funcionalidade
```

---

🎉 **Pronto!** Seu ambiente WSL está configurado para desenvolvimento Node.js + AWS com containers nativos e performance otimizada.