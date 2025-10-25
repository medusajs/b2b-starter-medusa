@echo off
REM ==========================================
REM Script PowerShell para Ambiente Dev Podman
REM Configuração otimizada para desenvolvimento
REM ==========================================

echo [INFO] Iniciando ambiente de desenvolvimento com Podman...

REM Verificar se Podman está instalado
podman --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Podman nao encontrado. Instale Podman Desktop antes de continuar.
    echo [INFO] Download: https://podman-desktop.io/downloads
    exit /b 1
)

REM Verificar se a máquina Podman está rodando
echo [INFO] Verificando status da maquina Podman...
podman machine list | findstr Running >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Iniciando maquina Podman...
    podman machine start
    if %errorlevel% neq 0 (
        echo [ERROR] Falha ao iniciar maquina Podman
        exit /b 1
    )
    timeout /t 10 /nobreak >nul
)

echo [SUCCESS] Podman verificado com sucesso

REM Definir variável para compatibilidade Docker
set DOCKER_HOST=npipe:////./pipe/podman-machine-default

REM Limpar ambiente anterior
echo [INFO] Limpando ambiente anterior...
podman-compose -f podman-compose.dev.yml down --volumes --remove-orphans 2>nul
podman system prune -f 2>nul

REM Criar rede personalizada se não existir
echo [INFO] Configurando rede de desenvolvimento...
podman network exists ysh-b2b-dev-network >nul 2>&1
if %errorlevel% neq 0 (
    podman network create ysh-b2b-dev-network --subnet 172.25.0.0/16
)

REM Build das imagens de desenvolvimento
echo [INFO] Construindo imagens de desenvolvimento...
podman build -f backend/Containerfile.dev -t ysh-b2b-backend-dev ./backend
if %errorlevel% neq 0 (
    echo [ERROR] Falha no build da imagem backend
    exit /b 1
)

podman build -f storefront/Containerfile.dev -t ysh-b2b-storefront-dev ./storefront
if %errorlevel% neq 0 (
    echo [ERROR] Falha no build da imagem storefront
    exit /b 1
)

echo [SUCCESS] Build das imagens concluído

REM Criar volumes persistentes
echo [INFO] Criando volumes persistentes...
podman volume create postgres_dev_data 2>nul
podman volume create redis_dev_data 2>nul
podman volume create backend_dev_uploads 2>nul

REM Iniciar serviços de desenvolvimento
echo [INFO] Iniciando servicos de desenvolvimento...
podman-compose -f podman-compose.dev.yml up -d

if %errorlevel% neq 0 (
    echo [ERROR] Falha ao iniciar servicos
    echo [INFO] Tentando com docker-compose como fallback...
    docker-compose -f podman-compose.dev.yml up -d
    if %errorlevel% neq 0 (
        echo [ERROR] Falha completa ao iniciar servicos
        exit /b 1
    )
)

echo [SUCCESS] Servicos iniciados com sucesso

REM Aguardar inicialização
echo [INFO] Aguardando inicializacao dos servicos...
timeout /t 60 /nobreak >nul

REM Verificar saúde dos serviços
echo [INFO] Verificando saude dos servicos...

REM Verificar PostgreSQL
podman exec ysh-b2b-postgres-dev pg_isready -U medusa_user -d medusa_db >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] PostgreSQL respondendo
) else (
    echo [WARNING] PostgreSQL pode nao estar respondendo corretamente
)

REM Verificar Redis
podman exec ysh-b2b-redis-dev redis-cli ping >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Redis respondendo
) else (
    echo [WARNING] Redis pode nao estar respondendo corretamente
)

REM Verificar backend
timeout /t 20 /nobreak >nul
curl -f http://localhost:9000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend respondendo em http://localhost:9000
) else (
    echo [WARNING] Backend ainda inicializando - aguarde mais alguns segundos
)

REM Verificar storefront
curl -f http://localhost:8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Storefront respondendo em http://localhost:8000
) else (
    echo [WARNING] Storefront ainda inicializando - aguarde mais alguns segundos
)

echo.
echo [INFO] ========================================
echo [INFO] AMBIENTE DE DESENVOLVIMENTO INICIADO!
echo [INFO] ========================================
echo [INFO] Storefront Dev: http://localhost:8000
echo [INFO] Backend API: http://localhost:9000
echo [INFO] Admin Panel: http://localhost:9000/admin
echo [INFO] Adminer DB: http://localhost:8080
echo [INFO] MailHog: http://localhost:8025
echo [INFO] ========================================
echo.
echo [INFO] COMANDOS UTEIS:
echo [INFO] Ver logs: podman-compose -f podman-compose.dev.yml logs -f
echo [INFO] Parar servicos: podman-compose -f podman-compose.dev.yml down
echo [INFO] Rebuild: podman-compose -f podman-compose.dev.yml build --no-cache
echo [INFO] Exec backend: podman exec -it ysh-b2b-backend-dev bash
echo [INFO] Exec storefront: podman exec -it ysh-b2b-storefront-dev bash
echo.

pause