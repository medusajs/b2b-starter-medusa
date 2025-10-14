@echo off
REM HaaS Platform - Build and Development Script for Windows
REM Script para facilitar o desenvolvimento com Docker no Windows

setlocal enabledelayedexpansion

REM Verificar se Docker está instalado
:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está instalado
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker não está rodando
    exit /b 1
)

echo ✅ Docker está disponível
goto :eof

REM Verificar se Docker Compose está instalado
:check_docker_compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    docker compose version >nul 2>&1
    if errorlevel 1 (
        echo ❌ Docker Compose não está instalado
        exit /b 1
    )
)

echo ✅ Docker Compose está disponível
goto :eof

REM Build das imagens
:build_images
echo ℹ️  Construindo imagens Docker...

echo ℹ️  Construindo imagem de desenvolvimento...
docker build -f Dockerfile.dev -t haas-api:dev .

echo ℹ️  Construindo imagem de produção...
docker build -f Dockerfile -t haas-api:prod .

echo ✅ Imagens construídas com sucesso
goto :eof

REM Iniciar ambiente de desenvolvimento
:start_dev
echo ℹ️  Iniciando ambiente de desenvolvimento...

REM Criar arquivo .env se não existir
if not exist .env (
    echo ⚠️  Arquivo .env não encontrado, copiando do exemplo...
    copy .env.example .env
    echo ℹ️  Edite o arquivo .env com suas configurações
)

REM Subir serviços
docker-compose up -d

echo ✅ Ambiente de desenvolvimento iniciado
echo ℹ️  API: http://localhost:8000
echo ℹ️  Docs: http://localhost:8000/docs
echo ℹ️  Adminer: http://localhost:8080
echo ℹ️  Redis Commander: http://localhost:8081
goto :eof

REM Parar ambiente de desenvolvimento
:stop_dev
echo ℹ️  Parando ambiente de desenvolvimento...
docker-compose down
echo ✅ Ambiente parado
goto :eof

REM Logs do ambiente
:show_logs
set service=%1
if "%service%"=="" set service=haas-api
echo ℹ️  Mostrando logs do serviço: !service!
docker-compose logs -f !service!
goto :eof

REM Executar testes
:run_tests
echo ℹ️  Executando testes...
docker-compose exec haas-api pytest -v
goto :eof

REM Clean up
:cleanup
echo ⚠️  Removendo containers, volumes e imagens...
docker-compose down -v --rmi all
echo ✅ Cleanup completo
goto :eof

REM Deploy para produção
:deploy_prod
echo ℹ️  Preparando deploy para produção...

if not exist .env.production (
    echo ❌ Arquivo .env.production não encontrado
    exit /b 1
)

docker build -f Dockerfile -t haas-api:latest .
docker-compose -f docker-compose.prod.yml up -d

echo ✅ Deploy de produção iniciado
goto :eof

REM Iniciar ambiente com portas alternativas
:start_alt_ports
echo ℹ️  Iniciando ambiente com portas alternativas...
docker-compose -f docker-compose.alt-ports.yml up -d
echo ✅ Ambiente com portas alternativas iniciado
echo ℹ️  API: http://localhost:8100
echo ℹ️  Docs: http://localhost:8100/docs
echo ℹ️  Adminer: http://localhost:8180
echo ℹ️  Redis Commander: http://localhost:8181
goto :eof

REM Iniciar ambiente com portas altas
:start_high_ports
echo ℹ️  Iniciando ambiente com portas altas...
docker-compose -f docker-compose.high-ports.yml up -d
echo ✅ Ambiente com portas altas iniciado
echo ℹ️  API: http://localhost:18000
echo ℹ️  Docs: http://localhost:18000/docs
echo ℹ️  Adminer: http://localhost:18080
echo ℹ️  Redis Commander: http://localhost:18081
goto :eof

REM Parar ambiente com portas alternativas
:stop_alt_ports
echo ℹ️  Parando ambiente com portas alternativas...
docker-compose -f docker-compose.alt-ports.yml down
echo ✅ Ambiente alternativo parado
goto :eof

REM Parar ambiente com portas altas
:stop_high_ports
echo ℹ️  Parando ambiente com portas altas...
docker-compose -f docker-compose.high-ports.yml down
echo ✅ Ambiente de portas altas parado
goto :eof

REM Menu de ajuda
:show_help
echo HaaS Platform - Script de Desenvolvimento (Windows)
echo.
echo Uso: %0 [COMANDO]
echo.
echo Comandos disponíveis:
echo   build       - Construir imagens Docker
echo   dev         - Iniciar ambiente de desenvolvimento (portas padrão)
echo   alt-ports   - Iniciar com portas alternativas (8100, 5433, 6380, etc.)
echo   high-ports  - Iniciar com portas altas (18000, 15432, 16379, etc.)
echo   stop        - Parar ambiente padrão
echo   stop-alt    - Parar ambiente com portas alternativas
echo   stop-high   - Parar ambiente com portas altas
echo   logs        - Mostrar logs (opcional: nome do serviço)
echo   test        - Executar testes
echo   cleanup     - Remover containers, volumes e imagens
echo   deploy      - Deploy para produção
echo   help        - Mostrar esta ajuda
echo.
echo Configurações de Portas Disponíveis:
echo   Padrão:      API:8000, DB:5432, Redis:6379, Adminer:8080, Redis-UI:8081
echo   Alternativa: API:8100, DB:5433, Redis:6380, Adminer:8180, Redis-UI:8181
echo   Altas:       API:18000, DB:15432, Redis:16379, Adminer:18080, Redis-UI:18081
echo.
echo Exemplos:
echo   %0 dev                    # Iniciar desenvolvimento (portas padrão)
echo   %0 alt-ports              # Usar portas alternativas (evitar conflitos)
echo   %0 high-ports             # Usar portas altas (múltiplas instâncias)
echo   %0 logs haas-api         # Ver logs da API
goto :eof

REM Main
set command=%1
if "%command%"=="" set command=help

if "%command%"=="build" (
    call :check_docker
    call :build_images
) else if "%command%"=="dev" (
    call :check_docker
    call :check_docker_compose  
    call :start_dev
) else if "%command%"=="start" (
    call :check_docker
    call :check_docker_compose
    call :start_dev
) else if "%command%"=="stop" (
    call :check_docker_compose
    call :stop_dev
) else if "%command%"=="logs" (
    call :check_docker_compose
    call :show_logs %2
) else if "%command%"=="test" (
    call :check_docker_compose
    call :run_tests
) else if "%command%"=="cleanup" (
    call :check_docker_compose
    call :cleanup
) else if "%command%"=="deploy" (
    call :check_docker
    call :deploy_prod
) else (
    call :show_help
)