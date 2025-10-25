#!/bin/bash

# ==========================================
# Script de Deploy para Vercel
# Configuração otimizada para performance
# ==========================================

set -e

# Configurações
PROJECT_NAME="ysh-b2b-storefront"
VERCEL_ORG_ID=${VERCEL_ORG_ID}
VERCEL_PROJECT_ID=${VERCEL_PROJECT_ID}

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções utilitárias
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

# Verificar dependências
check_dependencies() {
    log_info "Verificando dependências..."
    
    command -v vercel >/dev/null 2>&1 || { 
        log_error "Vercel CLI não encontrado. Instale com: npm i -g vercel"
        exit 1
    }
    
    command -v node >/dev/null 2>&1 || { 
        log_error "Node.js não encontrado. Instale Node.js antes de continuar."
        exit 1
    }
    
    log_success "Todas as dependências verificadas"
}

# Verificar login no Vercel
check_vercel_auth() {
    log_info "Verificando autenticação do Vercel..."
    
    if ! vercel whoami >/dev/null 2>&1; then
        log_warning "Não está logado no Vercel. Fazendo login..."
        vercel login
    fi
    
    log_success "Autenticação verificada"
}

# Preparar ambiente
prepare_environment() {
    log_info "Preparando ambiente..."
    
    cd storefront
    
    # Verificar se node_modules existe
    if [ ! -d "node_modules" ]; then
        log_info "Instalando dependências..."
        npm ci --legacy-peer-deps
    fi
    
    # Verificar variáveis de ambiente
    if [ ! -f ".env.local" ] && [ ! -f ".env.production" ]; then
        log_warning "Arquivo .env não encontrado. Certifique-se de configurar as variáveis no Vercel."
    fi
    
    log_success "Ambiente preparado"
}

# Build local para verificação
local_build() {
    log_info "Executando build local para verificação..."
    
    # Build otimizado
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_OPTIONS="--max-old-space-size=4096" \
    npm run build
    
    log_success "Build local concluído com sucesso"
}

# Deploy para preview
deploy_preview() {
    log_info "Fazendo deploy para preview..."
    
    vercel deploy \
        --yes \
        --name $PROJECT_NAME \
        --build-env NODE_ENV=production \
        --build-env NEXT_TELEMETRY_DISABLED=1 \
        --build-env NODE_OPTIONS="--max-old-space-size=4096"
    
    log_success "Deploy de preview concluído"
}

# Deploy para produção
deploy_production() {
    log_info "Fazendo deploy para produção..."
    
    vercel deploy \
        --prod \
        --yes \
        --name $PROJECT_NAME \
        --build-env NODE_ENV=production \
        --build-env NEXT_TELEMETRY_DISABLED=1 \
        --build-env NODE_OPTIONS="--max-old-space-size=4096"
    
    log_success "Deploy de produção concluído"
}

# Verificar deploy
verify_deployment() {
    log_info "Verificando deployment..."
    
    # Obter URL do deployment
    DEPLOYMENT_URL=$(vercel ls $PROJECT_NAME --limit 1 --json | jq -r '.[0].url')
    
    if [ "$DEPLOYMENT_URL" != "null" ] && [ -n "$DEPLOYMENT_URL" ]; then
        log_success "Deployment ativo em: https://$DEPLOYMENT_URL"
        
        # Verificar se o site responde
        if curl -f -s "https://$DEPLOYMENT_URL" > /dev/null; then
            log_success "✅ Site está respondendo corretamente"
        else
            log_warning "⚠️  Site pode não estar respondendo corretamente"
        fi
    else
        log_warning "Não foi possível obter URL do deployment"
    fi
}

# Otimizar performance pós-deploy
optimize_performance() {
    log_info "Configurando otimizações de performance..."
    
    # Configurar aliases de domínio se especificado
    if [ -n "$CUSTOM_DOMAIN" ]; then
        log_info "Configurando domínio personalizado: $CUSTOM_DOMAIN"
        vercel domains add $CUSTOM_DOMAIN $PROJECT_NAME
    fi
    
    log_success "Otimizações aplicadas"
}

# Função principal
main() {
    log_info "Iniciando processo de deploy no Vercel..."
    
    check_dependencies
    check_vercel_auth
    prepare_environment
    
    # Escolher tipo de deploy
    case "${1:-preview}" in
        "build")
            local_build
            ;;
        "preview")
            local_build
            deploy_preview
            verify_deployment
            ;;
        "production"|"prod")
            local_build
            deploy_production
            verify_deployment
            optimize_performance
            ;;
        *)
            log_error "Opção inválida. Use: build, preview, ou production"
            exit 1
            ;;
    esac
    
    log_success "🚀 Deploy no Vercel concluído com sucesso!"
    
    cd ..
}

# Executar função principal
main "$@"