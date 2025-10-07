#!/bin/bash

# =============================================================================
# Fedora/Debian WSL Development Environment Setup
# Configuração completa para Node.js, Containers, AWS e desenvolvimento moderno
# =============================================================================

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
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

# Detectar distribuição
detect_distro() {
    if [ -f /etc/fedora-release ]; then
        echo "fedora"
    elif [ -f /etc/debian_version ]; then
        echo "debian"
    else
        echo "unknown"
    fi
}

# Atualizar sistema
update_system() {
    local distro=$1
    log_info "Atualizando sistema $distro..."
    
    if [ "$distro" = "fedora" ]; then
        sudo dnf update -y
        sudo dnf install -y curl wget git vim nano htop unzip tar gzip
    elif [ "$distro" = "debian" ]; then
        sudo apt update && sudo apt upgrade -y
        sudo apt install -y curl wget git vim nano htop unzip tar gzip build-essential
    fi
    
    log_success "Sistema atualizado com sucesso"
}

# Instalar Node.js via Node Version Manager (NVM)
install_nodejs() {
    log_info "Instalando Node.js 20 via NVM..."
    
    # Instalar NVM
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
    
    # Carregar NVM no shell atual
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    # Instalar Node.js 20 LTS
    nvm install 20
    nvm use 20
    nvm alias default 20
    
    # Verificar instalação
    node --version
    npm --version
    
    log_success "Node.js $(node --version) instalado com sucesso"
}

# Configurar Yarn 4 via Corepack
setup_yarn() {
    log_info "Configurando Yarn 4 via Corepack..."
    
    # Habilitar Corepack
    corepack enable
    
    # Preparar Yarn 4
    corepack prepare yarn@4.4.0 --activate
    
    # Verificar instalação
    yarn --version
    
    log_success "Yarn $(yarn --version) configurado com sucesso"
}

# Instalar Docker/Podman
install_containers() {
    local distro=$1
    log_info "Instalando Docker e Podman..."
    
    if [ "$distro" = "fedora" ]; then
        # Fedora - Podman é nativo
        sudo dnf install -y podman podman-compose podman-docker docker-compose
        
        # Habilitar socket do Podman
        systemctl --user enable --now podman.socket
        
        # Alias docker -> podman
        echo 'alias docker=podman' >> ~/.bashrc
        echo 'alias docker-compose=podman-compose' >> ~/.bashrc
        
    elif [ "$distro" = "debian" ]; then
        # Debian - Docker oficial + Podman
        
        # Docker
        sudo apt install -y apt-transport-https ca-certificates gnupg lsb-release
        curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        sudo apt update
        sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        
        # Adicionar usuário ao grupo docker
        sudo usermod -aG docker $USER
        
        # Podman
        sudo apt install -y podman podman-compose
    fi
    
    log_success "Containers (Docker/Podman) instalados com sucesso"
}

# Instalar AWS CLI
install_aws_cli() {
    log_info "Instalando AWS CLI v2..."
    
    # Download e instalação do AWS CLI v2
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
    
    # Verificar instalação
    aws --version
    
    log_success "AWS CLI $(aws --version) instalado com sucesso"
}

# Instalar ferramentas de desenvolvimento
install_dev_tools() {
    local distro=$1
    log_info "Instalando ferramentas de desenvolvimento..."
    
    if [ "$distro" = "fedora" ]; then
        sudo dnf install -y \
            postgresql-server postgresql-contrib \
            redis \
            jq \
            tree \
            bat \
            fd-find \
            ripgrep \
            fzf \
            zsh \
            tmux
    elif [ "$distro" = "debian" ]; then
        sudo apt install -y \
            postgresql postgresql-contrib \
            redis-server \
            jq \
            tree \
            bat \
            fd-find \
            ripgrep \
            fzf \
            zsh \
            tmux
    fi
    
    log_success "Ferramentas de desenvolvimento instaladas"
}

# Configurar Git
setup_git() {
    log_info "Configurando Git..."
    
    # Configuração básica (usuário deve ajustar)
    read -p "Digite seu nome para Git: " git_name
    read -p "Digite seu email para Git: " git_email
    
    git config --global user.name "$git_name"
    git config --global user.email "$git_email"
    git config --global init.defaultBranch main
    git config --global pull.rebase false
    
    # Configurar SSH para GitHub (opcional)
    read -p "Deseja configurar chave SSH para GitHub? (y/n): " setup_ssh
    if [ "$setup_ssh" = "y" ]; then
        ssh-keygen -t ed25519 -C "$git_email" -f ~/.ssh/id_ed25519 -N ""
        eval "$(ssh-agent -s)"
        ssh-add ~/.ssh/id_ed25519
        
        log_info "Chave SSH pública (adicione ao GitHub):"
        cat ~/.ssh/id_ed25519.pub
        echo ""
        read -p "Pressione Enter após adicionar a chave ao GitHub..."
    fi
    
    log_success "Git configurado com sucesso"
}

# Configurar Shell (Zsh + Oh My Zsh)
setup_shell() {
    log_info "Configurando Zsh + Oh My Zsh..."
    
    # Instalar Oh My Zsh
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended
    
    # Configurar plugins úteis
    git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
    
    # Configurar .zshrc
    cat > ~/.zshrc << 'EOF'
# Oh My Zsh configuration
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="robbyrussell"

plugins=(
    git
    node
    npm
    yarn
    docker
    aws
    zsh-autosuggestions
    zsh-syntax-highlighting
)

source $ZSH/oh-my-zsh.sh

# NVM configuration
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Aliases úteis
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'

# Git aliases
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git pull'
alias gd='git diff'
alias gb='git branch'
alias gco='git checkout'

# Node/Yarn aliases
alias ni='npm install'
alias nr='npm run'
alias yi='yarn install'
alias ys='yarn start'
alias yd='yarn dev'
alias yb='yarn build'

# Docker/Podman aliases
alias dps='docker ps'
alias dimg='docker images'
alias dlog='docker logs'
alias dexec='docker exec -it'

# AWS aliases
alias awsl='aws s3 ls'
alias awsp='aws configure list-profiles'

EOF

    log_success "Shell configurado com Zsh + Oh My Zsh"
}

# Configurar VS Code para WSL
setup_vscode_integration() {
    log_info "Configurando integração com VS Code..."
    
    # Criar script para abrir VS Code
    cat > ~/.local/bin/code << 'EOF'
#!/bin/bash
/mnt/c/Users/$USER/AppData/Local/Programs/Microsoft\ VS\ Code/bin/code "$@"
EOF
    chmod +x ~/.local/bin/code
    
    # Adicionar ao PATH
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
    
    log_success "Integração VS Code configurada"
}

# Criar estrutura de diretórios
create_directory_structure() {
    log_info "Criando estrutura de diretórios..."
    
    mkdir -p ~/projects
    mkdir -p ~/scripts
    mkdir -p ~/.local/bin
    
    log_success "Estrutura de diretórios criada"
}

# Performance tuning para WSL
optimize_wsl() {
    log_info "Otimizando performance WSL..."
    
    # Criar .wslconfig no Windows (via PowerShell)
    cat > /mnt/c/Users/$USER/.wslconfig << 'EOF'
[wsl2]
memory=8GB
processors=4
swap=2GB
localhostForwarding=true

[experimental]
sparseVhd=true
autoMemoryReclaim=gradual
EOF

    log_info "Arquivo .wslconfig criado. Reinicie o WSL para aplicar: wsl --shutdown"
    log_success "Otimizações WSL aplicadas"
}

# Função principal
main() {
    log_info "=== Configuração do Ambiente de Desenvolvimento WSL ==="
    log_info "Este script configurará um ambiente completo para desenvolvimento Node.js + AWS"
    echo ""
    
    # Detectar distribuição
    distro=$(detect_distro)
    log_info "Distribuição detectada: $distro"
    
    if [ "$distro" = "unknown" ]; then
        log_error "Distribuição não suportada"
        exit 1
    fi
    
    # Executar configurações
    update_system "$distro"
    install_nodejs
    setup_yarn
    install_containers "$distro"
    install_aws_cli
    install_dev_tools "$distro"
    setup_git
    create_directory_structure
    setup_vscode_integration
    optimize_wsl
    setup_shell
    
    log_success "=== Setup completo! ==="
    log_info "Próximos passos:"
    echo "1. Reinicie o terminal ou execute: source ~/.zshrc"
    echo "2. Configure AWS: aws configure"
    echo "3. Clone seu projeto: git clone <repo-url> ~/projects/"
    echo "4. Reinicie WSL para otimizações: wsl --shutdown (no Windows)"
    echo ""
    log_info "Comandos úteis instalados:"
    echo "- node, npm, yarn (via NVM)"
    echo "- docker, podman"
    echo "- aws cli"
    echo "- git com SSH"
    echo "- zsh com oh-my-zsh"
    echo ""
}

# Executar se chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi