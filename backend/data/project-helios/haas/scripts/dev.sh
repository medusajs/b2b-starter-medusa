#!/bin/bash

# HaaS Platform - Build and Development Script
# Script para facilitar o desenvolvimento com Docker

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker não está rodando"
        exit 1
    fi
    
    log_success "Docker está disponível"
}

# Verificar se Docker Compose está instalado
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose não está instalado"
        exit 1
    fi
    
    log_success "Docker Compose está disponível"
}

# Build das imagens
build_images() {
    log_info "Construindo imagens Docker..."
    
    # Build da imagem de desenvolvimento
    log_info "Construindo imagem de desenvolvimento..."
    docker build -f Dockerfile.dev -t haas-api:dev .
    
    # Build da imagem de produção
    log_info "Construindo imagem de produção..."
    docker build -f Dockerfile -t haas-api:prod .
    
    log_success "Imagens construídas com sucesso"
}

# Iniciar ambiente de desenvolvimento
start_dev() {
    log_info "Iniciando ambiente de desenvolvimento..."
    
    # Criar arquivo .env se não existir
    if [ ! -f .env ]; then
        log_warning "Arquivo .env não encontrado, copiando do exemplo..."
        cp .env.example .env
        log_info "Edite o arquivo .env com suas configurações"
    fi
    
    # Subir serviços
    docker-compose up -d
    
    log_success "Ambiente de desenvolvimento iniciado"
    log_info "API: http://localhost:8000"
    log_info "Docs: http://localhost:8000/docs"
    log_info "Adminer: http://localhost:8080"
    log_info "Redis Commander: http://localhost:8081"
}

# Iniciar ambiente com portas alternativas
start_alt_ports() {
    log_info "Iniciando ambiente com portas alternativas..."
    
    # Usar configuração de portas alternativas
    docker-compose -f docker-compose.alt-ports.yml up -d
    
    log_success "Ambiente com portas alternativas iniciado"
    log_info "API: http://localhost:8100"
    log_info "Docs: http://localhost:8100/docs"
    log_info "Adminer: http://localhost:8180"
    log_info "Redis Commander: http://localhost:8181"
    log_info "PostgreSQL: localhost:5433"
    log_info "Redis: localhost:6380"
}

# Iniciar ambiente com portas altas
start_high_ports() {
    log_info "Iniciando ambiente com portas altas..."
    
    # Usar configuração de portas altas
    docker-compose -f docker-compose.high-ports.yml up -d
    
    log_success "Ambiente com portas altas iniciado"
    log_info "API: http://localhost:18000"
    log_info "Docs: http://localhost:18000/docs"
    log_info "Adminer: http://localhost:18080"
    log_info "Redis Commander: http://localhost:18081"
    log_info "PostgreSQL: localhost:15432"
    log_info "Redis: localhost:16379"
}

# Parar ambiente de desenvolvimento
stop_dev() {
    log_info "Parando ambiente de desenvolvimento..."
    docker-compose down
    log_success "Ambiente parado"
}

# Parar ambiente com portas alternativas
stop_alt_ports() {
    log_info "Parando ambiente com portas alternativas..."
    docker-compose -f docker-compose.alt-ports.yml down
    log_success "Ambiente alternativo parado"
}

# Parar ambiente com portas altas
stop_high_ports() {
    log_info "Parando ambiente com portas altas..."
    docker-compose -f docker-compose.high-ports.yml down
    log_success "Ambiente de portas altas parado"
}

# Logs do ambiente
show_logs() {
    local service=${1:-haas-api}
    log_info "Mostrando logs do serviço: $service"
    docker-compose logs -f $service
}

# Executar testes
run_tests() {
    log_info "Executando testes..."
    docker-compose exec haas-api pytest -v
}

# Executar linting
run_lint() {
    log_info "Executando linting..."
    docker-compose exec haas-api black .
    docker-compose exec haas-api flake8
    docker-compose exec haas-api mypy app
}

# Backup do banco de dados
backup_db() {
    log_info "Fazendo backup do banco de dados..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="backup_${timestamp}.sql"
    
    docker-compose exec postgres pg_dump -U haas_user haas_db > $backup_file
    
    log_success "Backup salvo em: $backup_file"
}

# Restaurar banco de dados
restore_db() {
    local backup_file=$1
    
    if [ -z "$backup_file" ]; then
        log_error "Especifique o arquivo de backup"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "Arquivo de backup não encontrado: $backup_file"
        exit 1
    fi
    
    log_info "Restaurando banco de dados de: $backup_file"
    
    # Parar aplicação
    docker-compose stop haas-api
    
    # Restaurar banco
    docker-compose exec -T postgres psql -U haas_user -d haas_db < $backup_file
    
    # Reiniciar aplicação
    docker-compose start haas-api
    
    log_success "Banco de dados restaurado"
}

# Clean up - remover containers e volumes
cleanup() {
    log_warning "Removendo containers, volumes e imagens..."
    docker-compose down -v --rmi all
    log_success "Cleanup completo"
}

# Deploy para produção
deploy_prod() {
    log_info "Preparando deploy para produção..."
    
    # Verificar se arquivo .env.production existe
    if [ ! -f .env.production ]; then
        log_error "Arquivo .env.production não encontrado"
        exit 1
    fi
    
    # Build da imagem de produção
    docker build -f Dockerfile -t haas-api:latest .
    
    # Deploy usando docker-compose.prod.yml
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "Deploy de produção iniciado"
}

# Menu de ajuda
show_help() {
    echo "HaaS Platform - Script de Desenvolvimento"
    echo ""
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  build       - Construir imagens Docker"
    echo "  dev         - Iniciar ambiente de desenvolvimento (portas padrão)"
    echo "  alt-ports   - Iniciar com portas alternativas (8100, 5433, 6380, etc.)"
    echo "  high-ports  - Iniciar com portas altas (18000, 15432, 16379, etc.)"
    echo "  stop        - Parar ambiente padrão"
    echo "  stop-alt    - Parar ambiente com portas alternativas"
    echo "  stop-high   - Parar ambiente com portas altas"
    echo "  logs        - Mostrar logs (opcional: nome do serviço)"
    echo "  test        - Executar testes"
    echo "  lint        - Executar linting e formatação"
    echo "  backup      - Fazer backup do banco de dados"
    echo "  restore     - Restaurar banco de dados (requer arquivo)"
    echo "  cleanup     - Remover containers, volumes e imagens"
    echo "  deploy      - Deploy para produção"
    echo "  help        - Mostrar esta ajuda"
    echo ""
    echo "Configurações de Portas Disponíveis:"
    echo "  Padrão:      API:8000, DB:5432, Redis:6379, Adminer:8080, Redis-UI:8081"
    echo "  Alternativa: API:8100, DB:5433, Redis:6380, Adminer:8180, Redis-UI:8181"
    echo "  Altas:       API:18000, DB:15432, Redis:16379, Adminer:18080, Redis-UI:18081"
    echo ""
    echo "Exemplos:"
    echo "  $0 dev                    # Iniciar desenvolvimento (portas padrão)"
    echo "  $0 alt-ports              # Usar portas alternativas (evitar conflitos)"
    echo "  $0 high-ports             # Usar portas altas (múltiplas instâncias)"
    echo "  $0 logs haas-api         # Ver logs da API"
    echo "  $0 restore backup.sql    # Restaurar backup"
}

# Main
main() {
    case ${1:-help} in
        "build")
            check_docker
            build_images
            ;;
        "dev"|"start")
            check_docker
            check_docker_compose
            start_dev
            ;;
        "alt-ports"|"alt")
            check_docker
            check_docker_compose
            start_alt_ports
            ;;
        "high-ports"|"high")
            check_docker
            check_docker_compose
            start_high_ports
            ;;
        "stop")
            check_docker_compose
            stop_dev
            ;;
        "stop-alt")
            check_docker_compose
            stop_alt_ports
            ;;
        "stop-high")
            check_docker_compose
            stop_high_ports
            ;;
        "logs")
            check_docker_compose
            show_logs $2
            ;;
        "test")
            check_docker_compose
            run_tests
            ;;
        "lint")
            check_docker_compose
            run_lint
            ;;
        "backup")
            check_docker_compose
            backup_db
            ;;
        "restore")
            check_docker_compose
            restore_db $2
            ;;
        "cleanup")
            check_docker_compose
            cleanup
            ;;
        "deploy")
            check_docker
            deploy_prod
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

main "$@"