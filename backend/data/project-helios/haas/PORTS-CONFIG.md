# 🔌 Configurações de Portas Disponíveis

O HaaS Platform agora suporta múltiplas configurações de portas para evitar conflitos e permitir múltiplas instâncias.

## 📋 Opções de Configuração

### 1. **Portas Padrão** (Recomendado para primeiro uso)

```bash
# Linux/macOS
./scripts/dev.sh dev

# Windows
scripts\dev.bat dev

# Ou diretamente
docker-compose up -d
```

**URLs de Acesso:**

- **API:** <http://localhost:8000>
- **Documentação:** <http://localhost:8000/docs>
- **Health Check:** <http://localhost:8000/health>
- **Adminer (DB):** <http://localhost:8080>
- **Redis Commander:** <http://localhost:8081>
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

### 2. **Portas Alternativas** (Para evitar conflitos)

```bash
# Linux/macOS
./scripts/dev.sh alt-ports

# Windows
scripts\dev.bat alt-ports

# Ou diretamente
docker-compose -f docker-compose.alt-ports.yml up -d
```

**URLs de Acesso:**

- **API:** <http://localhost:8100>
- **Documentação:** <http://localhost:8100/docs>
- **Health Check:** <http://localhost:8100/health>
- **Adminer (DB):** <http://localhost:8180>
- **Redis Commander:** <http://localhost:8181>
- **PostgreSQL:** localhost:5433
- **Redis:** localhost:6380

### 3. **Portas Altas** (Para múltiplas instâncias)

```bash
# Linux/macOS
./scripts/dev.sh high-ports

# Windows
scripts\dev.bat high-ports

# Ou diretamente
docker-compose -f docker-compose.high-ports.yml up -d
```

**URLs de Acesso:**

- **API:** <http://localhost:18000>
- **Documentação:** <http://localhost:18000/docs>
- **Health Check:** <http://localhost:18000/health>
- **Adminer (DB):** <http://localhost:18080>
- **Redis Commander:** <http://localhost:18081>
- **PostgreSQL:** localhost:15432
- **Redis:** localhost:16379

## 🛠️ Configuração Personalizada

### Usando Variáveis de Ambiente

Você pode personalizar qualquer porta editando o arquivo `.env`:

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite as portas conforme necessário
HAAS_API_PORT=9000
POSTGRES_PORT=5435
REDIS_PORT=6381
ADMINER_PORT=9080
REDIS_COMMANDER_PORT=9081
```

Depois execute:

```bash
docker-compose up -d
```

### Arquivos de Configuração Pré-definidos

O projeto inclui arquivos .env pré-configurados:

1. **`.env.example`** - Template base
2. **`.env.alt-ports`** - Configuração com portas alternativas
3. **`.env.high-ports`** - Configuração com portas altas

Para usar um deles:

```bash
# Usar portas alternativas
cp .env.alt-ports .env
docker-compose up -d

# Ou usar portas altas
cp .env.high-ports .env
docker-compose up -d
```

## 🔍 Verificar Portas Disponíveis

### Windows

```cmd
# Verificar se uma porta está em uso
netstat -an | findstr :8000
netstat -an | findstr :5432

# Listar todas as portas TCP em uso
netstat -an | findstr TCP
```

### Linux/macOS

```bash
# Verificar se uma porta está em uso
netstat -tulpn | grep :8000
lsof -i :8000

# Verificar múltiplas portas
ss -tulpn | grep -E ':(8000|5432|6379|8080|8081)'
```

## 🚀 Comandos de Controle

### Iniciar com Diferentes Configurações

```bash
# Ambiente padrão
./scripts/dev.sh dev

# Portas alternativas (evitar conflitos)
./scripts/dev.sh alt-ports

# Portas altas (múltiplas instâncias)
./scripts/dev.sh high-ports
```

### Parar Ambientes

```bash
# Parar ambiente padrão
./scripts/dev.sh stop

# Parar ambiente alternativo
./scripts/dev.sh stop-alt

# Parar ambiente de portas altas
./scripts/dev.sh stop-high
```

### Logs Específicos

```bash
# Ver logs de qualquer configuração
docker-compose logs -f haas-api
docker-compose -f docker-compose.alt-ports.yml logs -f haas-api
docker-compose -f docker-compose.high-ports.yml logs -f haas-api
```

## 🔄 Múltiplas Instâncias Simultâneas

Você pode rodar múltiplas instâncias da aplicação simultaneamente:

```bash
# Terminal 1: Instância principal
./scripts/dev.sh dev

# Terminal 2: Instância alternativa
./scripts/dev.sh alt-ports

# Terminal 3: Instância com portas altas
./scripts/dev.sh high-ports
```

Cada instância terá seu próprio banco de dados e Redis isolados!

## 📊 Tabela Resumo das Portas

| Serviço | Padrão | Alternativa | Alta | Customizável |
|---------|--------|-------------|------|-------------|
| **HaaS API** | 8000 | 8100 | 18000 | `HAAS_API_PORT` |
| **PostgreSQL** | 5432 | 5433 | 15432 | `POSTGRES_PORT` |
| **Redis** | 6379 | 6380 | 16379 | `REDIS_PORT` |
| **Adminer** | 8080 | 8180 | 18080 | `ADMINER_PORT` |
| **Redis Commander** | 8081 | 8181 | 18081 | `REDIS_COMMANDER_PORT` |
| **Nginx HTTP** | 80 | 8082 | 18082 | `NGINX_HTTP_PORT` |
| **Nginx HTTPS** | 443 | 8443 | 18443 | `NGINX_HTTPS_PORT` |

## 🎯 Cenários de Uso

### 💡 **Desenvolvimento Individual**

Use **portas padrão** - mais simples e direto.

### ⚡ **Conflito de Portas**

Use **portas alternativas** - evita conflitos com outros serviços.

### 🏗️ **Múltiplas Instâncias/Teams**

Use **portas altas** - permite várias instâncias simultâneas.

### 🔧 **Ambiente Corporativo**

Use **configuração personalizada** - adapte às políticas da empresa.

## ⚠️ Solução de Problemas

### Erro: "Port already in use"

```bash
# 1. Verificar o que está usando a porta
netstat -tulpn | grep :8000  # Linux/macOS
netstat -an | findstr :8000   # Windows

# 2. Usar configuração alternativa
./scripts/dev.sh alt-ports

# 3. Ou personalizar as portas no .env
```

### Containers não iniciam

```bash
# Verificar logs
docker-compose logs

# Verificar portas disponíveis
./scripts/dev.sh high-ports
```

### Conectar aplicação externa

```bash
# Use as URLs correspondentes à configuração ativa:
# Padrão: http://localhost:8000
# Alternativa: http://localhost:8100  
# Alta: http://localhost:18000
```

Agora você tem total flexibilidade para rodar o HaaS Platform sem conflitos de porta! 🎉
