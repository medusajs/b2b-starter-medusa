"""
Hourly Incremental Updates DAG
Check for new data every hour and process only changes
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.operators.bash import BashOperator
from airflow.utils.dates import days_ago
import logging

logger = logging.getLogger(__name__)

default_args = {
    'owner': 'ysh-data-team',
    'depends_on_past': False,
    'email_on_failure': True,
    'retries': 2,
    'retry_delay': timedelta(minutes=2)
}

dag = DAG(
    'hourly_incremental_updates',
    default_args=default_args,
    description='Hourly check for new ANEEL datasets',
    schedule_interval='0 * * * *',  # Every hour
    start_date=days_ago(1),
    catchup=False,
    tags=['production', 'incremental', 'hourly']
)


def check_for_updates(**context):
    """Check if there are new updates available"""
    logger.info("Checking for new updates...")
    
    try:
        import redis
        import json
        
        r = redis.Redis(
            host='ysh-redis-cache',
            port=6379,
            decode_responses=True
        )
        
        # Get last check time
        last_check = r.get('pipeline:last_incremental_check')
        
        if last_check:
            last_check_data = json.loads(last_check)
            logger.info(f"Last check: {last_check_data}")
        
        # Simulate checking for updates
        # In production, query ANEEL RSS feed
        has_updates = True  # Simplified
        
        # Store check time
        check_data = {
            'timestamp': datetime.now().isoformat(),
            'has_updates': has_updates
        }
        r.set('pipeline:last_incremental_check', json.dumps(check_data))
        r.expire('pipeline:last_incremental_check', 3600)
        
        if has_updates:
            logger.info("✓ New updates found - proceeding with ingestion")
            return 'process_updates'
        else:
            logger.info("✗ No updates found - skipping")
            return 'skip_processing'
            
    except Exception as e:
        logger.error(f"Update check failed: {e}")
        # On error, proceed with processing to be safe
        return 'process_updates'


def process_incremental_updates(**context):
    """Process only new/changed data"""
    logger.info("Processing incremental updates...")
    
    try:
        # Simplified incremental processing
        updates = {
            'new_datasets': 5,
            'updated_tariffs': 2,
            'new_certifications': 3
        }
        
        context['task_instance'].xcom_push(
            key='incremental_updates',
            value=updates
        )
        
        logger.info(f"Incremental update completed: {updates}")
        return updates
        
    except Exception as e:
        logger.error(f"Incremental processing failed: {e}")
        raise


def skip_processing(**context):
    """Skip processing when no updates"""
    logger.info("No new updates - processing skipped")
    return {'status': 'skipped', 'reason': 'no_updates'}


def notify_updates(**context):
    """Send notification about updates"""
    logger.info("Sending update notification...")
    
    updates = context['task_instance'].xcom_pull(
        task_ids='process_updates',
        key='incremental_updates'
    )
    
    if updates:
        logger.info(f"Updates processed: {updates}")
        # In production, send webhook or SNS notification
    
    return {'status': 'notified'}


# Task definitions
task_check = BranchPythonOperator(
    task_id='check_updates',
    python_callable=check_for_updates,
    dag=dag
)

task_process = PythonOperator(
    task_id='process_updates',
    python_callable=process_incremental_updates,
    dag=dag
)

task_skip = PythonOperator(
    task_id='skip_processing',
    python_callable=skip_processing,
    dag=dag
)

task_notify = PythonOperator(
    task_id='notify_updates',
    python_callable=notify_updates,
    trigger_rule='none_failed',
    dag=dag
)

# Task dependencies
task_check >> [task_process, task_skip]
task_process >> task_notify
task_skip >> task_notify
