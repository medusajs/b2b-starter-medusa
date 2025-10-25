"""
============================================================================
YSH Data Pipeline - Airflow DAG: ANEEL Data Ingestion
============================================================================
Version: 1.0.0
Date: October 14, 2025
Purpose: Daily ingestion of ANEEL datasets (RSS feeds + API)
Schedule: Daily at 2 AM BRT
============================================================================
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
import logging

logger = logging.getLogger(__name__)

# =============================================================================
# DEFAULT ARGS
# =============================================================================
default_args = {
    'owner': 'ysh-pipeline',
    'depends_on_past': False,
    'start_date': datetime(2025, 10, 14),
    'email': ['alerts@ysh.com'],
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'execution_timeout': timedelta(hours=2),
}

# =============================================================================
# DAG DEFINITION
# =============================================================================
dag = DAG(
    'ysh_aneel_daily_ingestion',
    default_args=default_args,
    description='Daily ingestion of ANEEL datasets',
    schedule_interval='0 2 * * *',  # 2 AM daily
    catchup=False,
    max_active_runs=1,
    tags=['ysh', 'aneel', 'ingestion', 'daily'],
)

# =============================================================================
# TASK FUNCTIONS
# =============================================================================

def fetch_aneel_rss_feeds(**context):
    """Fetch ANEEL RSS feeds and store metadata."""
    logger.info("Fetching ANEEL RSS feeds...")
    
    # Import here to avoid issues with Airflow imports
    import sys
    sys.path.append('/opt/airflow/dags')
    from aneel_data_fetcher import ANEELDataFetcher
    
    fetcher = ANEELDataFetcher()
    results = fetcher.fetch_all_rss()
    
    logger.info(f"Fetched {len(results)} RSS entries")
    
    # Push to XCom for next tasks
    context['task_instance'].xcom_push(key='rss_count', value=len(results))
    return len(results)


def fetch_aneel_datasets(**context):
    """Fetch ANEEL datasets via API."""
    logger.info("Fetching ANEEL datasets...")
    
    import sys
    sys.path.append('/opt/airflow/dags')
    from aneel_data_fetcher import ANEELDataFetcher
    
    fetcher = ANEELDataFetcher()
    datasets = fetcher.fetch_datasets()
    
    logger.info(f"Fetched {len(datasets)} datasets")
    
    context['task_instance'].xcom_push(key='datasets_count', value=len(datasets))
    return len(datasets)


def process_generation_units(**context):
    """Process generation units data."""
    logger.info("Processing generation units...")
    
    # Connect to PostgreSQL
    pg_hook = PostgresHook(postgres_conn_id='ysh_postgres')
    
    # Your processing logic here
    sql = """
        SELECT COUNT(*) FROM aneel.generation_units 
        WHERE updated_at > NOW() - INTERVAL '1 day'
    """
    
    result = pg_hook.get_first(sql)
    count = result[0] if result else 0
    
    logger.info(f"Processed {count} generation units")
    return count


def validate_data_quality(**context):
    """Validate data quality after ingestion."""
    logger.info("Validating data quality...")
    
    pg_hook = PostgresHook(postgres_conn_id='ysh_postgres')
    
    # Check for duplicates
    checks = [
        ("Duplicate datasets", "SELECT COUNT(*) - COUNT(DISTINCT dataset_id) FROM aneel.datasets"),
        ("Missing coordinates", "SELECT COUNT(*) FROM aneel.generation_units WHERE location IS NULL"),
        ("Future dates", "SELECT COUNT(*) FROM aneel.datasets WHERE created_at > NOW()"),
    ]
    
    issues = []
    for check_name, sql in checks:
        result = pg_hook.get_first(sql)
        count = result[0] if result else 0
        if count > 0:
            issues.append(f"{check_name}: {count}")
    
    if issues:
        logger.warning(f"Data quality issues: {', '.join(issues)}")
    else:
        logger.info("Data quality validation passed")
    
    return len(issues)


def send_summary_report(**context):
    """Send summary report of the ingestion."""
    logger.info("Sending summary report...")
    
    ti = context['task_instance']
    
    rss_count = ti.xcom_pull(task_ids='fetch_rss_feeds', key='rss_count')
    datasets_count = ti.xcom_pull(task_ids='fetch_datasets', key='datasets_count')
    
    summary = f"""
    ANEEL Daily Ingestion Summary
    =============================
    Date: {context['execution_date'].strftime('%Y-%m-%d')}
    
    RSS Entries: {rss_count}
    Datasets: {datasets_count}
    
    Status: SUCCESS
    """
    
    logger.info(summary)
    
    # TODO: Send email/Slack notification
    return summary


# =============================================================================
# TASKS
# =============================================================================

# Start task
start = BashOperator(
    task_id='start',
    bash_command='echo "Starting ANEEL daily ingestion at $(date)"',
    dag=dag,
)

# Pre-ingestion: Create log entry
create_log = PostgresOperator(
    task_id='create_ingestion_log',
    postgres_conn_id='ysh_postgres',
    sql="""
        INSERT INTO pipeline.ingestion_log (source_name, status, started_at)
        VALUES ('aneel', 'running', NOW())
        RETURNING ingestion_id;
    """,
    dag=dag,
)

# Fetch RSS feeds
fetch_rss = PythonOperator(
    task_id='fetch_rss_feeds',
    python_callable=fetch_aneel_rss_feeds,
    provide_context=True,
    dag=dag,
)

# Fetch datasets
fetch_datasets_task = PythonOperator(
    task_id='fetch_datasets',
    python_callable=fetch_aneel_datasets,
    provide_context=True,
    dag=dag,
)

# Process generation units
process_units = PythonOperator(
    task_id='process_generation_units',
    python_callable=process_generation_units,
    provide_context=True,
    dag=dag,
)

# Validate data quality
validate_quality = PythonOperator(
    task_id='validate_data_quality',
    python_callable=validate_data_quality,
    provide_context=True,
    dag=dag,
)

# Update log entry
update_log = PostgresOperator(
    task_id='update_ingestion_log',
    postgres_conn_id='ysh_postgres',
    sql="""
        UPDATE pipeline.ingestion_log
        SET status = 'success',
            completed_at = NOW(),
            records_processed = {{ task_instance.xcom_pull(task_ids='fetch_datasets', key='datasets_count') }}
        WHERE ingestion_id = (
            SELECT MAX(ingestion_id) FROM pipeline.ingestion_log WHERE source_name = 'aneel'
        );
    """,
    dag=dag,
)

# Send report
send_report = PythonOperator(
    task_id='send_summary_report',
    python_callable=send_summary_report,
    provide_context=True,
    dag=dag,
)

# End task
end = BashOperator(
    task_id='end',
    bash_command='echo "ANEEL daily ingestion completed at $(date)"',
    dag=dag,
)

# =============================================================================
# TASK DEPENDENCIES
# =============================================================================

start >> create_log >> [fetch_rss, fetch_datasets_task]
[fetch_rss, fetch_datasets_task] >> process_units
process_units >> validate_quality
validate_quality >> update_log >> send_report >> end

# =============================================================================
# END OF DAG
# =============================================================================
