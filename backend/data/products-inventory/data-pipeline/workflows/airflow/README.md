# Apache Airflow for YSH Data Pipeline

Complete Airflow deployment for orchestrating Brazilian energy data workflows.

## 🚀 Quick Start

### 1. Initialize Airflow

```powershell
# Set Airflow UID (Linux/Mac)
# echo -e "AIRFLOW_UID=$(id -u)" > .env

# Windows - use default
echo "AIRFLOW_UID=50000" > .env

# Start Airflow
docker-compose up -d

# Wait for initialization (~2 minutes)
docker-compose logs -f airflow-init
```

### 2. Access Web UI

```powershell
# Open browser
start http://localhost:8080

# Login credentials
Username: airflow
Password: airflow
```

### 3. Trigger DAGs

**Option 1: Web UI**

- Navigate to DAGs page
- Click on DAG name
- Click "Trigger DAG" button (▶️)

**Option 2: CLI**

```powershell
# Trigger daily ingestion
docker exec airflow-scheduler airflow dags trigger daily_full_ingestion

# Trigger hourly updates
docker exec airflow-scheduler airflow dags trigger hourly_incremental_updates

# Trigger fallback recovery
docker exec airflow-scheduler airflow dags trigger fallback_recovery
```

## 📊 Available DAGs

### daily_full_ingestion

**Schedule**: Daily at 2 AM  
**Duration**: ~15-20 minutes  
**Description**: Complete data ingestion from all sources

**Tasks**:

1. `start_pipeline` - Initialization
2. `fetch_aneel` - Fetch ANEEL datasets
3. `scrape_utilities` - Scrape utility portals
4. `process_ai` - AI processing with Ollama
5. `index_vectors` - Vector store indexing
6. `update_cache` - Redis cache update
7. `send_summary` - Email summary
8. `end_pipeline` - Cleanup

**Parallelization**: `fetch_aneel` and `scrape_utilities` run in parallel

### hourly_incremental_updates

**Schedule**: Every hour  
**Duration**: ~2-5 minutes  
**Description**: Check for new updates and process incrementally

**Tasks**:

1. `check_updates` - Check for new data
2. `process_updates` - Process new data (if found)
3. `skip_processing` - Skip if no updates
4. `notify_updates` - Send notification

**Smart Skipping**: Skips processing if no new data detected

### fallback_recovery

**Schedule**: Manual trigger  
**Duration**: Variable  
**Description**: Recovery mechanisms for failures

**Tasks**:

1. `fetch_with_fallback` - Try multiple data sources
2. `retry_exponential_backoff` - Retry with backoff
3. `use_cached_data` - Fallback to cache
4. `send_alert` - Alert on failure
5. `recover_system` - Attempt auto-recovery

**Use Cases**: Triggered automatically on failures or manually for testing

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
# Airflow
AIRFLOW_UID=50000
AIRFLOW__CORE__EXECUTOR=LocalExecutor

# Database
POSTGRES_USER=airflow
POSTGRES_PASSWORD=airflow
POSTGRES_DB=airflow

# Pipeline components
REDIS_HOST=ysh-redis-cache
REDIS_PORT=6379
OLLAMA_URL=http://ysh-ollama-service:11434

# Email (optional)
AIRFLOW__SMTP__SMTP_HOST=smtp.gmail.com
AIRFLOW__SMTP__SMTP_PORT=587
AIRFLOW__SMTP__SMTP_USER=your-email@gmail.com
AIRFLOW__SMTP__SMTP_PASSWORD=your-app-password
AIRFLOW__SMTP__SMTP_MAIL_FROM=airflow@ysh.com
```

### Custom Configuration

Edit `docker-compose.yml`:

```yaml
environment:
  AIRFLOW__CORE__PARALLELISM: 32           # Max parallel tasks
  AIRFLOW__CORE__MAX_ACTIVE_RUNS_PER_DAG: 3  # Concurrent DAG runs
  AIRFLOW__SCHEDULER__MAX_TDB_TIMEOUT: 300   # Task timeout
```

## 📈 Monitoring

### Web UI Dashboard

Access at `http://localhost:8080`:

- **DAGs**: View all workflows
- **Grid**: Task execution timeline
- **Graph**: Visual DAG structure
- **Gantt**: Duration analysis
- **Task Duration**: Historical performance
- **Code**: View DAG source code

### CLI Monitoring

```powershell
# List DAGs
docker exec airflow-scheduler airflow dags list

# DAG status
docker exec airflow-scheduler airflow dags state daily_full_ingestion

# Task logs
docker exec airflow-scheduler airflow tasks logs daily_full_ingestion fetch_aneel <execution_date>

# Running tasks
docker exec airflow-scheduler airflow tasks list daily_full_ingestion

# Test task
docker exec airflow-scheduler airflow tasks test daily_full_ingestion fetch_aneel 2025-01-14
```

### Health Checks

```powershell
# Scheduler health
docker exec airflow-scheduler airflow jobs check --job-type SchedulerJob

# Database connection
docker exec airflow-scheduler airflow db check

# All components
docker-compose ps
```

## 🔄 DAG Development

### Creating New DAG

1. **Create Python file** in `dags/` directory:

```python
from datetime import datetime
from airflow import DAG
from airflow.operators.python import PythonOperator

def my_task(**context):
    print("Hello from custom DAG!")
    return {"status": "success"}

with DAG(
    'my_custom_dag',
    start_date=datetime(2025, 1, 1),
    schedule_interval='0 3 * * *',  # 3 AM daily
    catchup=False
) as dag:
    
    task = PythonOperator(
        task_id='my_task',
        python_callable=my_task
    )
```

2. **Verify DAG** (auto-detected in ~30 seconds):

```powershell
docker exec airflow-scheduler airflow dags list-import-errors
```

3. **Test DAG**:

```powershell
docker exec airflow-scheduler airflow dags test my_custom_dag 2025-01-14
```

### Best Practices

1. **Use XCom** for task communication:

```python
# Push data
context['task_instance'].xcom_push(key='my_data', value=data)

# Pull data
data = context['task_instance'].xcom_pull(task_ids='previous_task', key='my_data')
```

2. **Error Handling**:

```python
from airflow.exceptions import AirflowException

def my_task(**context):
    try:
        # Task logic
        pass
    except Exception as e:
        raise AirflowException(f"Task failed: {e}")
```

3. **Retries**:

```python
default_args = {
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'retry_exponential_backoff': True
}
```

## 🛠️ Maintenance

### Backup Metadata DB

```powershell
# Backup PostgreSQL
docker exec airflow-postgres pg_dump -U airflow airflow > airflow_backup.sql

# Restore
docker exec -i airflow-postgres psql -U airflow airflow < airflow_backup.sql
```

### Clear Old Logs

```powershell
# Clear logs older than 30 days
docker exec airflow-scheduler airflow db clean --clean-before-timestamp "$(date -d '30 days ago' '+%Y-%m-%d')"
```

### Update Airflow

```powershell
# Stop services
docker-compose down

# Update docker-compose.yml (change image version)
# image: apache/airflow:2.9.0-python3.9

# Rebuild and start
docker-compose up -d

# Upgrade database
docker exec airflow-scheduler airflow db upgrade
```

## 🔧 Troubleshooting

### DAG Not Appearing

```powershell
# Check import errors
docker exec airflow-scheduler airflow dags list-import-errors

# Verify DAG file syntax
docker exec airflow-scheduler python /opt/airflow/dags/my_dag.py

# Restart scheduler
docker-compose restart airflow-scheduler
```

### Task Stuck

```powershell
# Kill stuck task
docker exec airflow-scheduler airflow tasks clear daily_full_ingestion -t fetch_aneel

# Force mark success
docker exec airflow-scheduler airflow tasks state daily_full_ingestion fetch_aneel <execution_date> --set-state success
```

### Database Issues

```powershell
# Reset database (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d
```

### Performance Issues

```powershell
# Increase parallelism
# Edit docker-compose.yml:
AIRFLOW__CORE__PARALLELISM: 64
AIRFLOW__CORE__DAG_CONCURRENCY: 32

# Restart
docker-compose restart
```

## 📚 Integration

### With Existing Pipeline

DAGs automatically import pipeline components:

```python
sys.path.append('/opt/airflow/dags/pipeline')
from integrated_data_pipeline import DataPipelineOrchestrator

orchestrator = DataPipelineOrchestrator()
results = await orchestrator.run_full_ingestion()
```

### With Node-RED

Trigger Airflow from Node-RED:

```javascript
// HTTP Request node
POST http://localhost:8080/api/v1/dags/daily_full_ingestion/dagRuns
Headers: {
    "Content-Type": "application/json",
    "Authorization": "Basic YWlyZmxvdzphaXJmbG93"  // base64(airflow:airflow)
}
Body: { "conf": {} }
```

### With AWS

See `../aws/` directory for AWS deployment configurations.

## 🎯 Performance Metrics

**Expected Performance**:

- DAG Parse Time: <5 seconds
- Task Queue Time: <10 seconds
- Daily Ingestion: 15-20 minutes
- Hourly Updates: 2-5 minutes
- Memory Usage: ~2GB (all services)

## 📝 Next Steps

1. ✅ Start Airflow: `docker-compose up -d`
2. ✅ Access UI: `http://localhost:8080`
3. ✅ Enable DAGs
4. ✅ Trigger test run
5. ✅ Configure email alerts
6. ✅ Setup monitoring dashboards
7. ✅ Deploy to production

---

**Ready to orchestrate!** 🚀 Start Airflow and trigger your first DAG run.
