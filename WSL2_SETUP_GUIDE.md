# Guia de Setup: WSL2 + Docker para Medusa B2B (Recomendado)

## Por que WSL2?

✅ **Performance 3-5x melhor** que Docker Desktop no Windows
✅ **Compatibilidade total** com dependências Node.js/Linux
✅ **Builds mais rápidos** e menos erros de dependências
✅ **Ambiente similar à produção** (Linux nativo)
✅ **Sem conflitos de porta** entre Windows e containers

## Passo 1: Instalar WSL2

### 1.1. Habilitar WSL (PowerShell como Administrador)

```powershell
# Instalar WSL com Ubuntu
wsl --install

# Ou se já tiver WSL instalado, atualizar para WSL2
wsl --set-default-version 2
```

### 1.2. Instalar distribuição Ubuntu

```powershell
wsl --install -d Ubuntu-22.04
```

### 1.3. Configurar usuário Ubuntu

Após instalação, configure seu usuário e senha quando solicitado.

## Passo 2: Instalar Docker no WSL2

### 2.1. Dentro do WSL (abra terminal Ubuntu)

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y ca-certificates curl gnupg lsb-release

# Adicionar chave GPG do Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Adicionar repositório Docker
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Adicionar usuário ao grupo docker (evitar sudo)
sudo usermod -aG docker $USER
```

### 2.2. Iniciar Docker

```bash
# Iniciar serviço Docker
sudo service docker start

# Verificar instalação
docker --version
docker compose version
```

## Passo 3: Configurar Projeto no WSL2

### 3.1. Clonar projeto no WSL (NÃO use /mnt/c/)

```bash
# Criar diretório de projetos no WSL
mkdir -p ~/projects
cd ~/projects

# Clonar o repositório
git clone https://github.com/medusajs/b2b-starter-medusa.git ysh-medusa
cd ysh-medusa
```

> **⚠️ IMPORTANTE**: Sempre trabalhe dentro do filesystem do WSL (`/home/user/`), NÃO em `/mnt/c/`.
> Performance é 10x melhor no filesystem nativo do WSL!

### 3.2. Configurar ambiente

```bash
# Backend
cd backend
cp .env.template .env

# Editar .env se necessário
nano .env

# Storefront
cd ../storefront
cp .env.template .env
nano .env
```

## Passo 4: Iniciar Ambiente de Desenvolvimento

### 4.1. Build e start dos containers

```bash
cd ~/projects/ysh-medusa

# Build inicial
docker compose build

# Iniciar serviços
docker compose up -d

# Ver logs
docker compose logs -f
```

### 4.2. Executar migrações

```bash
# Aguardar PostgreSQL estar pronto (~10 segundos)
sleep 10

# Executar migrações
docker compose exec backend npx medusa db:migrate

# Seed dados
docker compose exec backend npm run seed

# Criar usuário admin
docker compose exec backend npx medusa user -e admin@test.com -p supersecret -i admin
```

## Passo 5: Acessar Aplicações

- **Storefront**: [http://localhost:8000](http://localhost:8000)
- **Admin**: [http://localhost:9000/app](http://localhost:9000/app)
  - Email: <admin@test.com>
  - Senha: supersecret

## Comandos Úteis

### WSL

```bash
# Verificar distribuições WSL instaladas
wsl --list --verbose

# Entrar no WSL
wsl

# Parar WSL
wsl --shutdown

# Abrir VS Code no WSL
code .
```

### Docker

```bash
# Ver status dos containers
docker compose ps

# Parar containers
docker compose down

# Ver logs
docker compose logs -f [service-name]

# Reconstruir container específico
docker compose up --build [service-name]

# Limpar tudo e recomeçar
docker compose down -v
docker compose up --build
```

### Performance

```bash
# Limpar cache do Docker
docker system prune -a

# Ver uso de recursos
docker stats

# Otimizar WSL
# Adicionar ao arquivo C:\Users\<seu-usuario>\.wslconfig:
[wsl2]
memory=8GB
processors=4
swap=2GB
```

## Integração com VS Code

### Instalar extensão WSL

1. Instalar extensão **Remote - WSL** no VS Code
2. No VS Code, pressionar `F1` → `WSL: New WSL Window`
3. Ou no terminal WSL: `code .`

### Extensões recomendadas no WSL

- Docker
- ESLint
- Prettier
- GitLens
- TypeScript and JavaScript Language Features

## Troubleshooting

### Docker não inicia no WSL

```bash
# Verificar status
sudo service docker status

# Iniciar manualmente
sudo service docker start

# Adicionar ao início automático (opcional)
echo "sudo service docker start" >> ~/.bashrc
```

### Erro "permission denied" ao executar docker

```bash
# Relogar após adicionar usuário ao grupo docker
exit  # Sair do WSL
wsl   # Entrar novamente
```

### Performance lenta

1. **Usar filesystem nativo do WSL** (`~/` não `/mnt/c/`)
2. **Configurar .wslconfig** com mais recursos
3. **Limpar cache do Docker** regularmente

### Resolver conflitos de porta

```bash
# Ver o que está usando a porta
sudo lsof -i :9000
sudo lsof -i :5432
sudo lsof -i :6379

# Matar processo específico
sudo kill -9 <PID>
```

## Migração do Projeto Atual

### Opção 1: Copiar projeto para WSL

```bash
# No Windows PowerShell
wsl

# No WSL
cd ~
mkdir -p projects
cd projects

# Copiar do Windows para WSL
cp -r /mnt/c/Users/fjuni/ysh_medusa/medusa-starter ./ysh-medusa
cd ysh-medusa

# Limpar node_modules e reinstalar
rm -rf backend/node_modules storefront/node_modules
cd backend && npm install
cd ../storefront && npm install --legacy-peer-deps
```

### Opção 2: Clonar repositório fresco (Recomendado)

```bash
cd ~/projects
git clone https://github.com/medusajs/b2b-starter-medusa.git ysh-medusa
cd ysh-medusa

# Seguir Passo 3 acima
```

## Próximos Passos

1. ✅ Setup WSL2 completo
2. ✅ Ambiente Docker funcionando
3. 🎯 **Personalizar com design YSH**
4. 🎯 **Transformar catálogo para produtos solares**
5. 🎯 **Configurar módulos B2B customizados**

## Recursos Adicionais

- [Documentação oficial WSL](https://learn.microsoft.com/en-us/windows/wsl/)
- [Docker no WSL2](https://docs.docker.com/desktop/wsl/)
- [Medusa Documentation](https://docs.medusajs.com/v2)
- [Troubleshooting WSL](https://learn.microsoft.com/en-us/windows/wsl/troubleshooting)

---

**📌 Nota**: Este setup WSL2 resolverá os problemas de dependência Zod e oferecerá performance muito superior ao Docker Desktop no Windows.
