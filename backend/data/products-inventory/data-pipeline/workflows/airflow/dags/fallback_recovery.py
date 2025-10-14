"""
Fallback Recovery DAG
Handles failures with retry logic and alternative sources
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.utils.dates import days_ago
import logging
import time

logger = logging.getLogger(__name__)

default_args = {
    'owner': 'ysh-data-team',
    'depends_on_past': False,
    'email_on_failure': True,
    'retries': 0,  # Handle retries manually
    'retry_delay': timedelta(minutes=1)
}

dag = DAG(
    'fallback_recovery',
    default_args=default_args,
    description='Fallback and recovery mechanisms',
    schedule_interval=None,  # Triggered manually or by failures
    start_date=days_ago(1),
    catchup=False,
    tags=['operations', 'fallback', 'recovery']
)


def fetch_with_fallback(**context):
    """Fetch data with fallback to alternative sources"""
    logger.info("Attempting data fetch with fallback logic...")
    
    sources = [
        {'name': 'Primary ANEEL API', 'url': 'https://dadosabertos-aneel...'},
        {'name': 'ANEEL RSS Feed', 'url': 'https://dadosabertos-aneel.../rss'},
        {'name': 'Cached Data', 'url': 'redis://ysh-redis-cache'}
    ]
    
    for attempt, source in enumerate(sources, 1):
        try:
            logger.info(f"Attempt {attempt}: Trying {source['name']}...")
            
            # Simulate fetch
            time.sleep(1)
            
            # Simulate success on 3rd attempt
            if attempt == 3:
                data = {'source': source['name'], 'datasets': 45}
                logger.info(f"✓ Success with {source['name']}")
                
                context['task_instance'].xcom_push(
                    key='fallback_source',
                    value=source['name']
                )
                
                return data
            else:
                raise Exception(f"{source['name']} failed")
                
        except Exception as e:
            logger.warning(f"✗ {source['name']} failed: {e}")
            
            if attempt < len(sources):
                logger.info(f"Waiting 60s before next attempt...")
                time.sleep(60)
            else:
                logger.error("All sources failed!")
                raise Exception("All fallback sources exhausted")


def retry_with_exponential_backoff(**context):
    """Retry failed operations with exponential backoff"""
    logger.info("Starting retry with exponential backoff...")
    
    max_retries = 5
    base_delay = 2  # seconds
    
    for attempt in range(max_retries):
        try:
            delay = base_delay * (2 ** attempt)
            
            logger.info(f"Retry attempt {attempt + 1}/{max_retries}")
            
            # Simulate operation
            if attempt >= 3:  # Succeed on 4th attempt
                logger.info(f"✓ Operation succeeded on attempt {attempt + 1}")
                return {'status': 'success', 'attempts': attempt + 1}
            else:
                raise Exception(f"Simulated failure {attempt + 1}")
                
        except Exception as e:
            logger.warning(f"Attempt {attempt + 1} failed: {e}")
            
            if attempt < max_retries - 1:
                logger.info(f"Waiting {delay}s before retry...")
                time.sleep(delay)
            else:
                logger.error("Max retries exceeded")
                raise


def use_cached_data(**context):
    """Fallback to cached data when fresh data unavailable"""
    logger.info("Using cached data as fallback...")
    
    try:
        import redis
        import json
        
        r = redis.Redis(
            host='ysh-redis-cache',
            port=6379,
            decode_responses=True
        )
        
        # Try to get cached data
        cached = r.get('pipeline:last_successful_run')
        
        if cached:
            data = json.loads(cached)
            logger.info(f"✓ Using cached data from {data.get('timestamp')}")
            
            context['task_instance'].xcom_push(
                key='data_source',
                value='cache'
            )
            
            return data
        else:
            logger.warning("No cached data available")
            return {'status': 'no_cache', 'message': 'No fallback data'}
            
    except Exception as e:
        logger.error(f"Cache fallback failed: {e}")
        raise


def send_failure_alert(**context):
    """Send alert when fallbacks fail"""
    logger.info("Sending failure alert...")
    
    alert = {
        'timestamp': datetime.now().isoformat(),
        'severity': 'HIGH',
        'component': 'data_ingestion',
        'message': 'All fallback mechanisms failed',
        'action_required': True
    }
    
    logger.error(f"ALERT: {alert}")
    
    # In production:
    # - Send SNS notification
    # - Create PagerDuty incident
    # - Post to Slack
    
    return alert


def recover_from_failure(**context):
    """Attempt to recover from failure state"""
    logger.info("Attempting recovery...")
    
    try:
        # Check system health
        health_checks = {
            'redis': check_redis_health(),
            'postgres': check_postgres_health(),
            'ollama': check_ollama_health()
        }
        
        failed_services = [
            service for service, healthy in health_checks.items()
            if not healthy
        ]
        
        if failed_services:
            logger.warning(f"Failed services: {failed_services}")
            
            # Attempt to restart failed services
            for service in failed_services:
                restart_service(service)
            
            return {'status': 'recovered', 'restarted': failed_services}
        else:
            logger.info("All services healthy")
            return {'status': 'healthy'}
            
    except Exception as e:
        logger.error(f"Recovery failed: {e}")
        raise


def check_redis_health():
    """Check Redis connectivity"""
    try:
        import redis
        r = redis.Redis(host='ysh-redis-cache', port=6379)
        r.ping()
        return True
    except:
        return False


def check_postgres_health():
    """Check PostgreSQL connectivity"""
    try:
        import psycopg2
        conn = psycopg2.connect(
            host='ysh-postgres-db',
            port=5432,
            database='ysh_pipeline',
            user='ysh_user',
            password='ysh_secure_password_change_me'
        )
        conn.close()
        return True
    except:
        return False


def check_ollama_health():
    """Check Ollama service"""
    try:
        import requests
        response = requests.get('http://ysh-ollama-service:11434/api/tags')
        return response.status_code == 200
    except:
        return False


def restart_service(service):
    """Restart a failed service"""
    logger.info(f"Attempting to restart {service}...")
    # In production, use Docker API or K8s API
    # docker restart ysh-{service}
    pass


# Task definitions
task_fetch_fallback = PythonOperator(
    task_id='fetch_with_fallback',
    python_callable=fetch_with_fallback,
    dag=dag
)

task_retry = PythonOperator(
    task_id='retry_exponential_backoff',
    python_callable=retry_with_exponential_backoff,
    dag=dag
)

task_cached = PythonOperator(
    task_id='use_cached_data',
    python_callable=use_cached_data,
    dag=dag
)

task_alert = PythonOperator(
    task_id='send_alert',
    python_callable=send_failure_alert,
    trigger_rule='one_failed',
    dag=dag
)

task_recover = PythonOperator(
    task_id='recover_system',
    python_callable=recover_from_failure,
    dag=dag
)

# Task dependencies
task_fetch_fallback >> task_retry >> task_cached
[task_fetch_fallback, task_retry, task_cached] >> task_alert
task_alert >> task_recover
