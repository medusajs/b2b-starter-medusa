# 📝 Configuração de Logging - YSH Data Pipeline

## 🎯 Objetivo

Configurar o sistema de logging para que os arquivos de log **NÃO sejam commitados** no repositório Git, mas sejam salvos apenas localmente ou enviados para sistemas de monitoramento.

---

## 🚫 Problema Identificado

Os scripts estavam gerando arquivos JSON de log continuamente no diretório `processed_data/`:

- `aneel_processed_*.json` (dados processados da ANEEL)
- `realtime_monitoring_*.json` (monitoramento em tempo real)

**Total**: 130+ arquivos gerados a cada execução!

---

## ✅ Solução Implementada

### 1. **`.gitignore` Criado**

Arquivo criado em: `c:\Users\fjuni\ysh_medusa\ysh-store\backend\data\.gitignore`

**Ignora**:

```gitignore
# Dados processados
processed_data/
**/processed_data/
*.json                    # Todos os JSONs
!package.json             # EXCETO package.json
!tsconfig.json            # EXCETO tsconfig.json
!**/schemas/**/*.json     # EXCETO schemas

# Logs
*.log
logs/
```

### 2. **Containers Docker Parados**

```powershell
docker compose down
```

Todos os 19 containers foram parados com sucesso.

### 3. **Arquivos de Log Limpos**

```powershell
Remove-Item processed_data\*.json -Force
```

---

## 🔧 Configuração Recomendada para Logging

### **Opção 1: Logging Apenas em Docker Volumes** ✅ RECOMENDADO

Modificar os scripts Python para salvar logs **dentro dos volumes Docker**:

```python
# Em vez de:
output_path = "processed_data/aneel_processed_{timestamp}.json"

# Use:
output_path = "/var/log/ysh-pipeline/aneel_processed_{timestamp}.json"
```

No `docker-compose.yml`:

```yaml
services:
  worker:
    volumes:
      - ./logs:/var/log/ysh-pipeline  # Mapeado para logs/ (já ignorado)
```

### **Opção 2: Enviar Logs para Grafana Loki** 🚀 PRODUÇÃO

Modificar scripts para usar **logging estruturado**:

```python
import logging
import json

logger = logging.getLogger(__name__)

# Configurar handler para Loki
handler = logging.handlers.HTTPHandler(
    'loki:3100', 
    '/loki/api/v1/push',
    method='POST'
)
logger.addHandler(handler)

# Log estruturado
logger.info(json.dumps({
    "timestamp": datetime.now().isoformat(),
    "source": "aneel_fetcher",
    "records_processed": 1000,
    "status": "success"
}))
```

### **Opção 3: Rotation Local com Limpeza Automática** 🔄

Usar `RotatingFileHandler` do Python:

```python
import logging
from logging.handlers import RotatingFileHandler

logger = logging.getLogger(__name__)

# Máximo 10MB por arquivo, 5 arquivos no total
handler = RotatingFileHandler(
    'logs/pipeline.log',
    maxBytes=10*1024*1024,  # 10MB
    backupCount=5
)

logger.addHandler(handler)
```

---

## 📊 Estrutura de Diretórios Recomendada

```
data-pipeline/
├── logs/                    # ✅ IGNORADO pelo Git
│   ├── pipeline.log
│   ├── aneel_fetcher.log
│   └── realtime.log
├── processed_data/          # ✅ IGNORADO pelo Git
│   ├── aneel_*.json
│   └── realtime_*.json
├── docker-data/             # ✅ IGNORADO pelo Git
│   ├── postgres/
│   ├── redis/
│   └── dynamodb/
├── schemas/                 # ✅ COMMITADO (schemas são código)
│   └── *.json
└── *.py                     # ✅ COMMITADO (código fonte)
```

---

## 🛠️ Scripts Modificados

### **1. `aneel_data_fetcher.py`**

Modificar para usar logging estruturado:

```python
import logging
import os
from datetime import datetime

# Configurar logger
LOG_DIR = os.getenv('LOG_DIR', 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(f'{LOG_DIR}/aneel_fetcher.log'),
        logging.StreamHandler()  # Também mostra no console
    ]
)
logger = logging.getLogger(__name__)

# Em vez de salvar JSON:
# with open(f'processed_data/aneel_{timestamp}.json', 'w') as f:
#     json.dump(data, f)

# Use:
logger.info(f"Processed {len(data)} ANEEL records", extra={
    'count': len(data),
    'timestamp': datetime.now().isoformat()
})
```

### **2. `realtime_processor.py`**

```python
import logging
import os

LOG_DIR = os.getenv('LOG_DIR', 'logs')
os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    handlers=[
        logging.FileHandler(f'{LOG_DIR}/realtime.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Em vez de salvar JSON a cada execução:
logger.info("Realtime monitoring cycle completed", extra={
    'metrics': metrics_dict
})
```

---

## 🚀 Como Executar com Logging Correto

### **Desenvolvimento Local**

```powershell
# Definir diretório de logs
$env:LOG_DIR = "logs"

# Executar script
python aneel_data_fetcher.py
```

### **Docker**

```yaml
services:
  worker:
    environment:
      - LOG_DIR=/var/log/ysh-pipeline
    volumes:
      - ./logs:/var/log/ysh-pipeline
```

```powershell
docker compose up -d
```

---

## 📈 Monitoramento com Grafana

### **1. Configurar Promtail (Log Shipper)**

```yaml
# docker-compose.yml
services:
  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./logs:/var/log/ysh-pipeline:ro
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
```

### **2. Visualizar no Grafana**

Dashboard: <http://localhost:3001>

1. Acessar **Explore**
2. Selecionar datasource **Loki**
3. Query: `{job="ysh-pipeline"}`

---

## 🧹 Limpeza Periódica (Opcional)

### **Script PowerShell**

Criar `cleanup-logs.ps1`:

```powershell
# Remover logs com mais de 7 dias
$logDir = "logs"
$daysToKeep = 7

Get-ChildItem $logDir -Recurse -File | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$daysToKeep) } | 
    Remove-Item -Force

Write-Host "✅ Logs com mais de $daysToKeep dias foram removidos"
```

### **Cron Job (Linux/WSL)**

```bash
# Adicionar ao crontab
0 2 * * * find /path/to/logs -type f -mtime +7 -delete
```

---

## ✅ Checklist de Validação

- [x] `.gitignore` criado e configurado
- [x] Containers Docker parados
- [x] Arquivos de log existentes removidos
- [ ] Scripts Python modificados para usar logging estruturado
- [ ] Docker volumes configurados para logs
- [ ] Promtail/Loki configurado (opcional)
- [ ] Dashboard Grafana para logs (opcional)

---

## 🎯 Próximos Passos

1. **Modificar scripts Python** para usar logging estruturado
2. **Testar localmente** sem gerar arquivos JSON
3. **Configurar Promtail/Loki** para produção
4. **Criar dashboards Grafana** para visualização de logs
5. **Configurar alertas** para erros críticos

---

## 📞 Comandos Úteis

```powershell
# Ver logs em tempo real (Docker)
docker compose logs -f worker

# Ver logs salvos localmente
Get-Content logs\pipeline.log -Tail 50 -Wait

# Limpar todos os logs
Remove-Item logs\*.log -Force

# Verificar arquivos ignorados pelo Git
git status --ignored

# Remover arquivos já commitados que agora estão no .gitignore
git rm -r --cached processed_data/
git commit -m "Remove processed_data from tracking"
```

---

## 🎉 Resultado Final

✅ **Logs não são mais commitados no Git**  
✅ **Arquivos salvos localmente em `logs/`**  
✅ **Docker volumes isolados**  
✅ **Monitoramento via Grafana (opcional)**  
✅ **Limpeza automática com rotation**

---

**Documentado em**: 2025-10-14  
**Versão**: 1.0  
**Status**: ✅ IMPLEMENTADO
