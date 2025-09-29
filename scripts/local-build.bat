@echo off
REM ==========================================
REM Script PowerShell para Build Local Otimizado
REM ==========================================

echo [INFO] Iniciando build local otimizado...

REM Verificar se Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker nao encontrado. Instale Docker Desktop antes de continuar.
    exit /b 1
)

REM Verificar se Docker Compose está disponível
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose nao encontrado. Atualize o Docker Desktop.
    exit /b 1
)

echo [SUCCESS] Docker verificado com sucesso

REM Limpar containers e volumes anteriores
echo [INFO] Limpando ambiente anterior...
docker compose down --volumes --remove-orphans 2>nul
docker system prune -f 2>nul

REM Build das imagens
echo [INFO] Construindo imagens Docker...
docker compose build --parallel --progress=plain

if %errorlevel% neq 0 (
    echo [ERROR] Falha no build das imagens
    exit /b 1
)

echo [SUCCESS] Build das imagens concluído

REM Iniciar serviços
echo [INFO] Iniciando servicos...
docker compose up -d

if %errorlevel% neq 0 (
    echo [ERROR] Falha ao iniciar servicos
    exit /b 1
)

echo [SUCCESS] Servicos iniciados com sucesso

REM Aguardar inicialização
echo [INFO] Aguardando inicializacao dos servicos...
timeout /t 30 /nobreak >nul

REM Verificar saúde dos serviços
echo [INFO] Verificando saude dos servicos...

REM Verificar backend
curl -f http://localhost:9000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Backend respondendo em http://localhost:9000
) else (
    echo [WARNING] Backend pode nao estar respondendo corretamente
)

REM Verificar storefront
curl -f http://localhost:8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Storefront respondendo em http://localhost:8000
) else (
    echo [WARNING] Storefront pode nao estar respondendo corretamente
)

REM Verificar nginx
curl -f http://localhost/health >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Nginx respondendo em http://localhost
) else (
    echo [WARNING] Nginx pode nao estar respondendo corretamente
)

echo.
echo [INFO] ========================================
echo [INFO] Aplicacao iniciada com sucesso!
echo [INFO] ========================================
echo [INFO] Storefront: http://localhost:8000
echo [INFO] Backend API: http://localhost:9000
echo [INFO] Load Balancer: http://localhost
echo [INFO] ========================================
echo.
echo [INFO] Para parar os servicos: docker compose down
echo [INFO] Para ver logs: docker compose logs -f
echo [INFO] Para rebuild: docker compose build --no-cache

pause