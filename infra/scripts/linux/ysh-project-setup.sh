#!/bin/bash

# =============================================================================
# YSH B2B Project Setup for WSL (Fedora/Debian)
# Configuração específica do projeto Medusa.js + Next.js
# =============================================================================

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar pré-requisitos
check_prerequisites() {
    log_info "Verificando pré-requisitos..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js não encontrado. Execute primeiro: ./fedora-debian-setup.sh"
        exit 1
    fi
    
    # Verificar Yarn
    if ! command -v yarn &> /dev/null; then
        log_error "Yarn não encontrado. Execute primeiro: ./fedora-debian-setup.sh"
        exit 1
    fi
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        log_error "Git não encontrado. Execute primeiro: ./fedora-debian-setup.sh"
        exit 1
    fi
    
    log_success "Pré-requisitos verificados"
}

# Clonar projeto (se necessário)
clone_project() {
    local project_dir="$HOME/projects/ysh-b2b"
    
    if [ -d "$project_dir" ]; then
        log_info "Projeto já existe em $project_dir"
        cd "$project_dir"
    else
        log_info "Clonando projeto YSH B2B..."
        cd ~/projects
        
        # Solicitar URL do repositório
        read -p "Digite a URL do repositório Git: " repo_url
        git clone "$repo_url" ysh-b2b
        cd ysh-b2b
        
        log_success "Projeto clonado com sucesso"
    fi
}

# Configurar containers para o projeto
setup_project_containers() {
    log_info "Configurando containers do projeto..."
    
    # Verificar se existe docker-compose ou podman-compose
    if [ -f "docker-compose.yml" ]; then
        compose_file="docker-compose.yml"
    elif [ -f "podman-compose.dev.yml" ]; then
        compose_file="podman-compose.dev.yml"
    else
        log_error "Arquivo de compose não encontrado"
        return 1
    fi
    
    log_info "Usando arquivo: $compose_file"
    
    # Baixar imagens
    if command -v podman-compose &> /dev/null; then
        podman-compose -f "$compose_file" pull
    else
        docker-compose -f "$compose_file" pull
    fi
    
    log_success "Containers configurados"
}

# Instalar dependências do backend
setup_backend() {
    log_info "Configurando backend (Medusa.js)..."
    
    if [ -d "backend" ]; then
        cd backend
        
        # Verificar Node version
        if [ -f ".nvmrc" ]; then
            nvm use
        fi
        
        # Instalar dependências
        log_info "Instalando dependências do backend..."
        yarn install
        
        # Build do projeto
        log_info "Building backend..."
        yarn build
        
        # Copiar template de environment
        if [ -f ".env.template" ] && [ ! -f ".env" ]; then
            cp .env.template .env
            log_info "Arquivo .env criado a partir do template. Configure as variáveis necessárias."
        fi
        
        cd ..
        log_success "Backend configurado"
    else
        log_warning "Diretório backend não encontrado"
    fi
}

# Instalar dependências do storefront
setup_storefront() {
    log_info "Configurando storefront (Next.js)..."
    
    if [ -d "storefront" ]; then
        cd storefront
        
        # Verificar Node version
        if [ -f ".nvmrc" ]; then
            nvm use
        fi
        
        # Instalar dependências
        log_info "Instalando dependências do storefront..."
        yarn install
        
        # Build do projeto
        log_info "Building storefront..."
        yarn build
        
        # Copiar template de environment
        if [ -f ".env.local.template" ] && [ ! -f ".env.local" ]; then
            cp .env.local.template .env.local
            log_info "Arquivo .env.local criado a partir do template. Configure as variáveis necessárias."
        fi
        
        cd ..
        log_success "Storefront configurado"
    else
        log_warning "Diretório storefront não encontrado"
    fi
}

# Configurar banco de dados
setup_database() {
    log_info "Configurando banco de dados..."
    
    # Verificar se existe init-scripts
    if [ -d "backend/init-scripts" ]; then
        log_info "Scripts de inicialização encontrados"
    fi
    
    # Tentar subir containers de banco
    if [ -f "docker-compose.yml" ] || [ -f "podman-compose.dev.yml" ]; then
        log_info "Subindo containers de banco de dados..."
        
        if command -v podman-compose &> /dev/null; then
            podman-compose -f podman-compose.dev.yml up -d postgres redis
        else
            docker-compose up -d postgres redis
        fi
        
        # Aguardar banco ficar pronto
        log_info "Aguardando banco de dados ficar pronto..."
        sleep 10
        
        # Executar migrations se existir
        if [ -d "backend" ]; then
            cd backend
            if grep -q "migration" package.json; then
                log_info "Executando migrations..."
                yarn run migration:run || log_warning "Migrations falharam - execute manualmente"
            fi
            cd ..
        fi
        
        log_success "Banco de dados configurado"
    else
        log_warning "Arquivo de compose não encontrado"
    fi
}

# Configurar AWS CLI local
setup_local_aws() {
    log_info "Configurando AWS CLI..."
    
    # Verificar se AWS CLI está instalado
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI não instalado. Execute o setup principal primeiro."
        return 1
    fi
    
    # Configurar perfil de desenvolvimento
    read -p "Deseja configurar AWS CLI agora? (y/n): " setup_aws
    if [ "$setup_aws" = "y" ]; then
        log_info "Configure suas credenciais AWS:"
        aws configure
        
        # Testar conectividade
        log_info "Testando conectividade AWS..."
        if aws sts get-caller-identity; then
            log_success "AWS CLI configurado e testado com sucesso"
        else
            log_warning "Erro ao testar AWS CLI - verifique credenciais"
        fi
    else
        log_info "Configuração AWS pulada. Execute 'aws configure' quando necessário."
    fi
}

# Criar scripts utilitários
create_utility_scripts() {
    log_info "Criando scripts utilitários..."
    
    # Script para iniciar ambiente de desenvolvimento
    cat > start-dev.sh << 'EOF'
#!/bin/bash
# Script para iniciar ambiente de desenvolvimento completo

echo "🚀 Iniciando ambiente de desenvolvimento YSH B2B..."

# Subir containers
echo "📦 Subindo containers..."
if command -v podman-compose &> /dev/null; then
    podman-compose -f podman-compose.dev.yml up -d
else
    docker-compose up -d
fi

# Aguardar banco
echo "⏳ Aguardando banco de dados..."
sleep 10

# Iniciar backend em background
echo "🔧 Iniciando backend..."
cd backend && yarn dev &
BACKEND_PID=$!

# Iniciar storefront em background
echo "🎨 Iniciando storefront..."
cd ../storefront && yarn dev &
STOREFRONT_PID=$!

echo "✅ Ambiente iniciado!"
echo "🔧 Backend: http://localhost:9000"
echo "🎨 Storefront: http://localhost:8000"
echo ""
echo "Para parar: kill $BACKEND_PID $STOREFRONT_PID"
echo "PIDs salvos em /tmp/ysh-dev-pids"
echo "$BACKEND_PID $STOREFRONT_PID" > /tmp/ysh-dev-pids

wait
EOF
    chmod +x start-dev.sh
    
    # Script para parar ambiente
    cat > stop-dev.sh << 'EOF'
#!/bin/bash
# Script para parar ambiente de desenvolvimento

echo "🛑 Parando ambiente de desenvolvimento..."

# Parar processos Node.js
if [ -f /tmp/ysh-dev-pids ]; then
    echo "📦 Parando aplicações..."
    kill $(cat /tmp/ysh-dev-pids) 2>/dev/null || true
    rm /tmp/ysh-dev-pids
fi

# Parar containers
echo "🐳 Parando containers..."
if command -v podman-compose &> /dev/null; then
    podman-compose -f podman-compose.dev.yml down
else
    docker-compose down
fi

echo "✅ Ambiente parado!"
EOF
    chmod +x stop-dev.sh
    
    # Script para reset completo
    cat > reset-env.sh << 'EOF'
#!/bin/bash
# Script para reset completo do ambiente

echo "🔄 Resetando ambiente de desenvolvimento..."

# Parar tudo
./stop-dev.sh

# Limpar containers e volumes
echo "🧹 Limpando containers e volumes..."
if command -v podman &> /dev/null; then
    podman system prune -af
    podman volume prune -f
else
    docker system prune -af
    docker volume prune -f
fi

# Limpar node_modules
echo "📦 Limpando node_modules..."
rm -rf backend/node_modules backend/.yarn/cache
rm -rf storefront/node_modules storefront/.yarn/cache

# Reinstalar dependências
echo "⬇️ Reinstalando dependências..."
cd backend && yarn install
cd ../storefront && yarn install

echo "✅ Reset completo realizado!"
EOF
    chmod +x reset-env.sh
    
    log_success "Scripts utilitários criados"
}

# Verificar saúde do ambiente
health_check() {
    log_info "Verificando saúde do ambiente..."
    
    # Verificar Node.js e Yarn
    log_info "Node.js: $(node --version)"
    log_info "Yarn: $(yarn --version)"
    
    # Verificar containers
    if command -v podman &> /dev/null; then
        log_info "Podman: $(podman --version)"
    fi
    
    if command -v docker &> /dev/null; then
        log_info "Docker: $(docker --version)"
    fi
    
    # Verificar AWS
    if command -v aws &> /dev/null; then
        log_info "AWS CLI: $(aws --version)"
    fi
    
    # Verificar dependências do projeto
    if [ -d "backend" ] && [ -f "backend/package.json" ]; then
        log_info "✅ Backend encontrado"
    fi
    
    if [ -d "storefront" ] && [ -f "storefront/package.json" ]; then
        log_info "✅ Storefront encontrado"
    fi
    
    log_success "Verificação de saúde completa"
}

# Função principal
main() {
    log_info "=== Setup do Projeto YSH B2B ==="
    echo ""
    
    check_prerequisites
    clone_project
    setup_backend
    setup_storefront
    setup_project_containers
    setup_database
    setup_local_aws
    create_utility_scripts
    health_check
    
    log_success "=== Setup do projeto completo! ==="
    echo ""
    log_info "Scripts criados:"
    echo "• ./start-dev.sh - Inicia ambiente completo"
    echo "• ./stop-dev.sh - Para ambiente"
    echo "• ./reset-env.sh - Reset completo"
    echo ""
    log_info "Próximos passos:"
    echo "1. Configure .env nos diretórios backend/ e storefront/"
    echo "2. Execute: ./start-dev.sh"
    echo "3. Acesse: http://localhost:8000 (storefront) e http://localhost:9000 (backend)"
    echo ""
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi