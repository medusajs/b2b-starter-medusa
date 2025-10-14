# 🚀 Sistema de Logging - Guia Completo

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Quick Start](#quick-start)
4. [Configuração](#configuração)
5. [Uso](#uso)
6. [Monitoramento](#monitoramento)
7. [Manutenção](#manutenção)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Sistema completo de logging estruturado com:

- ✅ **Logging estruturado** em Python com `RotatingFileHandler`
- ✅ **Agregação de logs** com Grafana Loki
- ✅ **Shipping de logs** com Promtail
- ✅ **Visualização** em Grafana
- ✅ **Rotação automática** de logs
- ✅ **Scripts de gerenciamento** PowerShell

### Benefícios

- 📦 **Zero commits de logs** no Git
- 🔄 **Rotação automática** evita discos cheios
- 📊 **Dashboards visuais** para análise
- 🔍 **Pesquisa rápida** em todos os logs
- ⚡ **Performance** otimizada

---

## 🏗️ Arquitetura

```
┌─────────────────┐
│  Python Scripts │ → Logs estruturados (logs/*.log)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│    Promtail     │ → Coleta e envia logs
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│      Loki       │ → Agrega e indexa
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│    Grafana      │ → Visualiza e pesquisa
└─────────────────┘
```

### Componentes

| Componente | Porta | Descrição |
|------------|-------|-----------|
| Grafana | 3000 | UI de visualização |
| Loki | 3100 | Agregador de logs |
| Promtail | 9080 | Coletor de logs |
| Prometheus | 9090 | Métricas |

---

## 🚀 Quick Start

### 1. Iniciar Stack

```powershell
# Navegar para o diretório
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend\data\products-inventory\data-pipeline

# Iniciar todos os serviços
docker compose up -d

# Verificar status
docker compose ps
```

### 2. Executar Scripts Python

```powershell
# Definir diretório de logs
$env:LOG_DIR = "logs"

# Executar script
python aneel_data_fetcher.py
```

### 3. Acessar Grafana

1. Abrir: <http://localhost:3000>
2. Login: `admin` / `grafana_2025`
3. Ir para **Explore** → Selecionar datasource **Loki**
4. Query: `{job="ysh-pipeline"}`

---

## ⚙️ Configuração

### Variáveis de Ambiente

```powershell
# Windows PowerShell
$env:LOG_DIR = "logs"              # Diretório de logs
$env:LOG_LEVEL = "INFO"            # Nível de log (DEBUG, INFO, WARNING, ERROR)
```

```bash
# Linux/WSL
export LOG_DIR=logs
export LOG_LEVEL=INFO
```

### Docker Compose

Os serviços já estão configurados no `docker-compose.yml`:

- **LOG_DIR**: `/var/log/ysh-pipeline`
- **Volume mapping**: `./logs:/var/log/ysh-pipeline`

### Python Scripts

Todos os scripts já estão configurados com:

- `RotatingFileHandler` (10MB máximo, 5 backups)
- Formato estruturado com timestamp
- Logging para arquivo + console

---

## 💻 Uso

### Logs Locais

#### Ver logs recentes

```powershell
# Últimas 50 linhas
Get-Content logs\integrated_pipeline.log -Tail 50

# Seguir logs em tempo real
Get-Content logs\integrated_pipeline.log -Tail 50 -Wait

# Filtrar por nível
Get-Content logs\*.log | Select-String "ERROR"
```

#### Script de monitoramento

```powershell
# Monitor interativo
.\scripts\monitor-logs.ps1

# Watch mode (tempo real)
.\scripts\monitor-logs.ps1 -Watch

# Filtrar por palavra-chave
.\scripts\monitor-logs.ps1 -Filter "ERROR"
```

### Logs no Grafana

#### 1. Queries Básicas

```logql
# Todos os logs da aplicação
{job="ysh-pipeline"}

# Apenas erros
{job="ysh-pipeline", level="ERROR"}

# Por componente específico
{job="ysh-pipeline", logger="aneel_data_fetcher"}
```

#### 2. Queries Avançadas

```logql
# Contar erros por minuto
rate({job="ysh-pipeline", level="ERROR"}[1m])

# Top 10 loggers com mais logs
topk(10, sum by (logger) (rate({job="ysh-pipeline"}[5m])))

# Logs contendo "failed"
{job="ysh-pipeline"} |= "failed"

# Logs excluindo "INFO"
{job="ysh-pipeline"} != "INFO"
```

#### 3. Filtros por Tempo

- **Last 5 minutes**: Últimos 5 minutos
- **Last 1 hour**: Última hora
- **Last 24 hours**: Últimas 24 horas
- **Custom**: Personalizado

---

## 📊 Monitoramento

### Dashboards Recomendados

#### 1. Application Logs Dashboard

- **Log rate** por componente
- **Error rate** ao longo do tempo
- **Top errors** (mais frequentes)
- **Log volume** por nível

#### 2. System Logs Dashboard

- **Container logs** por serviço
- **Docker events**
- **Database logs** (PostgreSQL, Redis)
- **Airflow task logs**

### Alertas

Configurar alertas no Grafana para:

- Taxa de erros > 10/min
- Disco de logs > 80% cheio
- Serviço sem logs há > 10 minutos

---

## 🔧 Manutenção

### Limpeza Manual

```powershell
# Script de limpeza (dry-run)
.\scripts\cleanup-logs.ps1 -DryRun

# Limpeza real (confirma antes)
.\scripts\cleanup-logs.ps1

# Limpar logs com mais de 30 dias
.\scripts\cleanup-logs.ps1 -DaysToKeep 30

# Verbose mode
.\scripts\cleanup-logs.ps1 -Verbose
```

### Limpeza Automática

#### Windows Task Scheduler

```powershell
# Criar tarefa agendada (executar como Admin)
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-File C:\path\to\cleanup-logs.ps1"

$trigger = New-ScheduledTaskTrigger -Daily -At 2am

Register-ScheduledTask -TaskName "YSH-LogCleanup" `
    -Action $action -Trigger $trigger -Description "Cleanup YSH logs daily"
```

#### Linux Cron

```bash
# Adicionar ao crontab
crontab -e

# Executar diariamente às 2am
0 2 * * * cd /path/to/data-pipeline && ./scripts/cleanup-logs.sh
```

### Logrotate (Linux)

```bash
# Instalar logrotate
sudo apt-get install logrotate

# Copiar configuração
sudo cp infrastructure/logrotate/logrotate.conf /etc/logrotate.d/ysh-pipeline

# Testar
sudo logrotate -d /etc/logrotate.d/ysh-pipeline

# Executar manualmente
sudo logrotate -f /etc/logrotate.d/ysh-pipeline
```

---

## 🔍 Troubleshooting

### Problema: Logs não aparecem no Grafana

**Verificar Loki**:

```powershell
docker compose logs loki
curl http://localhost:3100/ready
```

**Verificar Promtail**:

```powershell
docker compose logs promtail
```

**Verificar datasource**:

- Grafana → Configuration → Data Sources → Loki
- Test: Deve retornar "Data source is working"

### Problema: Disco cheio

**Verificar tamanho**:

```powershell
.\scripts\monitor-logs.ps1
```

**Limpar imediatamente**:

```powershell
.\scripts\cleanup-logs.ps1 -DaysToKeep 1
```

**Verificar Docker volumes**:

```powershell
docker system df
docker volume prune
```

### Problema: Logs não rotacionam

**Verificar configuração Python**:

```python
# Os scripts já usam RotatingFileHandler
# Verifique se LOG_DIR está definido
import os
print(os.getenv('LOG_DIR', 'logs'))
```

**Verificar manualmente**:

```powershell
# Logs devem ter backups: .log.1, .log.2, etc.
Get-ChildItem logs\*.log*
```

### Problema: Performance lenta

**Reduzir retention no Loki**:

```yaml
# infrastructure/loki/loki-config.yml
limits_config:
  retention_period: 168h  # 7 dias em vez de 31
```

**Limitar queries no Grafana**:

```logql
# Usar time range menor
{job="ysh-pipeline"}[5m]  # Últimos 5 minutos

# Limitar resultados
{job="ysh-pipeline"} | limit 100
```

---

## 📝 Comandos Úteis

### Docker

```powershell
# Ver logs de um container
docker compose logs -f loki
docker compose logs -f promtail

# Reiniciar serviço específico
docker compose restart loki

# Rebuild sem cache
docker compose build --no-cache

# Ver uso de recursos
docker stats
```

### Logs

```powershell
# Contar linhas por arquivo
Get-ChildItem logs\*.log | ForEach-Object {
    "$($_.Name): $((Get-Content $_.FullName | Measure-Object -Line).Lines) lines"
}

# Buscar em todos os logs
Get-ChildItem logs\*.log | Select-String "error"

# Top 10 mensagens mais frequentes
Get-Content logs\*.log | Group-Object | Sort-Object Count -Descending | Select-Object -First 10
```

### Grafana

```powershell
# Reset admin password
docker compose exec grafana grafana-cli admin reset-admin-password admin_2025

# Backup dashboards
curl -u admin:grafana_2025 http://localhost:3000/api/dashboards/db/my-dashboard > backup.json

# Import dashboard
curl -X POST -u admin:grafana_2025 http://localhost:3000/api/dashboards/db -d @backup.json
```

---

## 🎓 Boas Práticas

### 1. Níveis de Log

```python
logger.debug("Detalhes técnicos para debug")      # Desenvolvimento
logger.info("Operação normal concluída")          # Produção (padrão)
logger.warning("Atenção: situação incomum")       # Revisar
logger.error("Erro que precisa atenção")          # Investigar
logger.critical("Falha crítica do sistema")       # Urgente!
```

### 2. Contexto Estruturado

```python
# ✅ BOM: Com contexto estruturado
logger.info(
    "ANEEL data fetched",
    extra={
        'count': 1000,
        'duration_ms': 523,
        'source': 'rss_feed'
    }
)

# ❌ RUIM: Sem contexto
logger.info("Fetched some data")
```

### 3. Evitar Logs Excessivos

```python
# ❌ RUIM: Log em loop
for item in items:
    logger.info(f"Processing {item}")  # 1000+ logs!

# ✅ BOM: Log agregado
logger.info(f"Processing {len(items)} items")
# ... processar ...
logger.info(f"Completed processing", extra={'count': len(items)})
```

### 4. Segurança

```python
# ❌ NUNCA logar senhas/tokens
logger.info(f"User logged in: {username} / {password}")

# ✅ Logar apenas informação segura
logger.info(f"User logged in", extra={'username': username})
```

---

## 📚 Referências

- [Grafana Loki Documentation](https://grafana.com/docs/loki/)
- [Promtail Configuration](https://grafana.com/docs/loki/latest/clients/promtail/)
- [LogQL Query Language](https://grafana.com/docs/loki/latest/logql/)
- [Python logging module](https://docs.python.org/3/library/logging.html)

---

## 🆘 Suporte

Se encontrar problemas:

1. ✅ Verificar este README
2. ✅ Checar logs: `docker compose logs`
3. ✅ Executar monitor: `.\scripts\monitor-logs.ps1`
4. ✅ Verificar `.gitignore` está correto

---

**Versão**: 2.0  
**Data**: 2025-10-14  
**Status**: ✅ PRODUÇÃO READY
