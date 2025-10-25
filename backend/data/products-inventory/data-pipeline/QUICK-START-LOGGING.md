# ⚡ Quick Start - Sistema de Logging

## 🚀 Início Rápido (5 minutos)

### 1️⃣ Iniciar Stack

```powershell
cd c:\Users\fjuni\ysh_medusa\ysh-store\backend\data\products-inventory\data-pipeline
docker compose up -d
```

**Aguarde ~30 segundos** para todos os serviços iniciarem.

### 2️⃣ Verificar Status

```powershell
docker compose ps
```

Todos os serviços devem estar **Up** (verde).

### 3️⃣ Executar Script de Teste

```powershell
$env:LOG_DIR = "logs"
python aneel_data_fetcher.py
```

### 4️⃣ Ver Logs

**Opção A: Arquivo Local**

```powershell
Get-Content logs\aneel_fetcher.log -Tail 20
```

**Opção B: Monitor Interativo**

```powershell
.\scripts\monitor-logs.ps1
```

**Opção C: Grafana (Recomendado)**

1. Abrir: <http://localhost:3000>
2. Login: `admin` / `grafana_2025`
3. Menu: **Explore** (ícone de bússola)
4. Selecionar: **Loki** (dropdown superior)
5. Query: `{job="ysh-pipeline"}`
6. Clicar: **Run query**

---

## 📊 Principais URLs

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Grafana** | <http://localhost:3000> | admin / grafana_2025 |
| **Loki** | <http://localhost:3100> | N/A |
| **Prometheus** | <http://localhost:9090> | N/A |
| **Airflow** | <http://localhost:8080> | admin / admin_2025 |

---

## 🎯 Comandos Essenciais

```powershell
# Ver logs em tempo real
.\scripts\monitor-logs.ps1 -Watch

# Ver apenas erros
Get-Content logs\*.log | Select-String "ERROR"

# Limpar logs antigos (dry-run)
.\scripts\cleanup-logs.ps1 -DryRun

# Status dos containers
docker compose ps

# Logs de um serviço
docker compose logs -f loki

# Parar tudo
docker compose down
```

---

## 🔍 Queries Úteis no Grafana

```logql
# Todos os logs
{job="ysh-pipeline"}

# Apenas erros
{job="ysh-pipeline", level="ERROR"}

# Por script específico
{job="ysh-pipeline", logger="aneel_data_fetcher"}

# Últimos 5 minutos
{job="ysh-pipeline"}[5m]
```

---

## 🆘 Troubleshooting Rápido

### Logs não aparecem no Grafana?

```powershell
# 1. Verificar Loki
curl http://localhost:3100/ready

# 2. Verificar Promtail
docker compose logs promtail

# 3. Reiniciar stack
docker compose restart loki promtail
```

### Disco cheio?

```powershell
# Limpar logs com mais de 7 dias
.\scripts\cleanup-logs.ps1

# Limpar volumes Docker
docker system prune -a --volumes
```

---

## 📚 Documentação Completa

Ver: `LOGGING-SYSTEM-README.md`

---

**Pronto! Sistema de logging configurado! 🎉**
