#!/bin/bash

# ==========================================
# Script de Build e Deploy para AWS ECS
# Configuração otimizada para performance
# ==========================================

set -e

# Configurações
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}
ECR_BACKEND_REPO="ysh-b2b-backend"
ECR_STOREFRONT_REPO="ysh-b2b-storefront"
ECS_CLUSTER="production-ysh-b2b-cluster"
BACKEND_SERVICE="ysh-b2b-backend-service"
STOREFRONT_SERVICE="ysh-b2b-storefront-service"

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
    
    command -v aws >/dev/null 2>&1 || { 
        log_error "AWS CLI não encontrado. Instale e configure antes de continuar."
        exit 1
    }
    
    command -v docker >/dev/null 2>&1 || { 
        log_error "Docker não encontrado. Instale Docker antes de continuar."
        exit 1
    }
    
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        log_error "AWS_ACCOUNT_ID não definido. Configure a variável de ambiente."
        exit 1
    fi
    
    log_success "Todas as dependências verificadas"
}

# Login no ECR
ecr_login() {
    log_info "Fazendo login no ECR..."
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    log_success "Login no ECR realizado com sucesso"
}

# Build e push da imagem do backend
build_backend() {
    log_info "Construindo imagem do backend..."
    
    cd backend
    
    # Build otimizado com cache
    docker build \
        --cache-from $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND_REPO:latest \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        -t $ECR_BACKEND_REPO:latest \
        -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND_REPO:latest \
        -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND_REPO:$(git rev-parse --short HEAD) \
        .
    
    log_success "Build do backend concluído"
    
    log_info "Fazendo push da imagem do backend..."
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND_REPO:latest
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_BACKEND_REPO:$(git rev-parse --short HEAD)
    
    log_success "Push do backend concluído"
    cd ..
}

# Build e push da imagem do storefront
build_storefront() {
    log_info "Construindo imagem do storefront..."
    
    cd storefront
    
    # Build otimizado com cache
    docker build \
        --cache-from $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_STOREFRONT_REPO:latest \
        --build-arg BUILDKIT_INLINE_CACHE=1 \
        -t $ECR_STOREFRONT_REPO:latest \
        -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_STOREFRONT_REPO:latest \
        -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_STOREFRONT_REPO:$(git rev-parse --short HEAD) \
        .
    
    log_success "Build do storefront concluído"
    
    log_info "Fazendo push da imagem do storefront..."
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_STOREFRONT_REPO:latest
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_STOREFRONT_REPO:$(git rev-parse --short HEAD)
    
    log_success "Push do storefront concluído"
    cd ..
}

# Deploy no ECS
deploy_ecs() {
    log_info "Iniciando deploy no ECS..."
    
    # Update backend service
    log_info "Atualizando serviço do backend..."
    aws ecs update-service \
        --cluster $ECS_CLUSTER \
        --service $BACKEND_SERVICE \
        --force-new-deployment \
        --region $AWS_REGION \
        --output table
    
    # Update storefront service
    log_info "Atualizando serviço do storefront..."
    aws ecs update-service \
        --cluster $ECS_CLUSTER \
        --service $STOREFRONT_SERVICE \
        --force-new-deployment \
        --region $AWS_REGION \
        --output table
    
    log_success "Deploy iniciado com sucesso"
}

# Aguardar conclusão do deploy
wait_deployment() {
    log_info "Aguardando conclusão do deploy..."
    
    # Wait for backend service
    log_info "Aguardando backend..."
    aws ecs wait services-stable \
        --cluster $ECS_CLUSTER \
        --services $BACKEND_SERVICE \
        --region $AWS_REGION
    
    # Wait for storefront service
    log_info "Aguardando storefront..."
    aws ecs wait services-stable \
        --cluster $ECS_CLUSTER \
        --services $STOREFRONT_SERVICE \
        --region $AWS_REGION
    
    log_success "Deploy concluído com sucesso!"
}

# Função principal
main() {
    log_info "Iniciando processo de build e deploy..."
    
    check_dependencies
    ecr_login
    
    # Escolher o que construir
    case "${1:-all}" in
        "backend")
            build_backend
            deploy_ecs
            ;;
        "storefront")
            build_storefront
            deploy_ecs
            ;;
        "all"|*)
            build_backend
            build_storefront
            deploy_ecs
            ;;
    esac
    
    wait_deployment
    
    log_success "🚀 Deploy completo! Aplicação atualizada com sucesso."
}

# Executar função principal
main "$@"