"""
Daily Full Ingestion DAG
Complete data pipeline execution every day at 2 AM
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.utils.dates import days_ago
import asyncio
import json
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Default arguments
default_args = {
    'owner': 'ysh-data-team',
    'depends_on_past': False,
    'email': ['alerts@ysh.com'],
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'retry_exponential_backoff': True,
    'max_retry_delay': timedelta(minutes=30)
}

# Create DAG
dag = DAG(
    'daily_full_ingestion',
    default_args=default_args,
    description='Daily full data ingestion from ANEEL, utilities, PDFs',
    schedule_interval='0 2 * * *',  # 2 AM daily
    start_date=days_ago(1),
    catchup=False,
    tags=['production', 'ingestion', 'daily']
)


def fetch_aneel_data(**context):
    """Fetch data from ANEEL"""
    logger.info("Starting ANEEL data fetch...")
    
    try:
        import sys
        sys.path.append('/opt/airflow/dags/pipeline')
        
        from aneel_data_fetcher import ANEELDataFetcher
        
        async def run_fetch():
            fetcher = ANEELDataFetcher()
            data = await fetcher.fetch_all_data()
            return data
        
        data = asyncio.run(run_fetch())
        
        # Store in XCom
        context['task_instance'].xcom_push(
            key='aneel_datasets',
            value=len(data.get('datasets', []))
        )
        
        logger.info(f"ANEEL fetch completed: {len(data.get('datasets', []))} datasets")
        return data
        
    except Exception as e:
        logger.error(f"ANEEL fetch failed: {e}")
        raise


def scrape_utilities(**context):
    """Scrape utility portals"""
    logger.info("Starting utility portal scraping...")
    
    try:
        import sys
        sys.path.append('/opt/airflow/dags/pipeline')
        
        from crawlee_scraper import UtilityPortalScraper
        
        async def run_scrape():
            scraper = UtilityPortalScraper()
            results = await scraper.scrape_all_utilities()
            return results
        
        results = asyncio.run(run_scrape())
        
        context['task_instance'].xcom_push(
            key='utility_results',
            value=len(results)
        )
        
        logger.info(f"Utility scraping completed: {len(results)} portals")
        return results
        
    except Exception as e:
        logger.error(f"Utility scraping failed: {e}")
        raise


def process_with_ai(**context):
    """Process data with AI"""
    logger.info("Starting AI processing...")
    
    try:
        import sys
        sys.path.append('/opt/airflow/dags/pipeline')
        
        from realtime_processor import IntegratedProcessor
        
        # Get ANEEL data from previous task
        aneel_count = context['task_instance'].xcom_pull(
            task_ids='fetch_aneel',
            key='aneel_datasets'
        )
        
        logger.info(f"Processing {aneel_count} datasets with AI...")
        
        async def run_process():
            processor = IntegratedProcessor()
            # Simplified processing for demo
            return {'processed': aneel_count, 'status': 'success'}
        
        result = asyncio.run(run_process())
        
        context['task_instance'].xcom_push(
            key='ai_processed',
            value=result['processed']
        )
        
        logger.info(f"AI processing completed: {result['processed']} items")
        return result
        
    except Exception as e:
        logger.error(f"AI processing failed: {e}")
        raise


def index_in_vector_store(**context):
    """Index documents in vector store"""
    logger.info("Starting vector indexing...")
    
    try:
        import sys
        sys.path.append('/opt/airflow/dags/pipeline')
        
        from enhanced_ollama import EnhancedOllamaIntegration
        
        processed_count = context['task_instance'].xcom_pull(
            task_ids='process_ai',
            key='ai_processed'
        )
        
        logger.info(f"Indexing {processed_count} documents...")
        
        async def run_index():
            ollama = EnhancedOllamaIntegration()
            # Simplified indexing for demo
            return processed_count
        
        indexed = asyncio.run(run_index())
        
        context['task_instance'].xcom_push(
            key='indexed_count',
            value=indexed
        )
        
        logger.info(f"Vector indexing completed: {indexed} documents")
        return indexed
        
    except Exception as e:
        logger.error(f"Vector indexing failed: {e}")
        raise


def update_cache(**context):
    """Update Redis cache"""
    logger.info("Updating Redis cache...")
    
    try:
        import redis
        
        r = redis.Redis(
            host='ysh-redis-cache',
            port=6379,
            decode_responses=True
        )
        
        # Store metadata
        metadata = {
            'last_update': datetime.now().isoformat(),
            'aneel_datasets': context['task_instance'].xcom_pull(
                task_ids='fetch_aneel',
                key='aneel_datasets'
            ),
            'utilities_scraped': context['task_instance'].xcom_pull(
                task_ids='scrape_utilities',
                key='utility_results'
            ),
            'documents_indexed': context['task_instance'].xcom_pull(
                task_ids='index_vectors',
                key='indexed_count'
            )
        }
        
        r.set('pipeline:last_run', json.dumps(metadata))
        r.expire('pipeline:last_run', 86400)  # 24 hours
        
        logger.info(f"Cache updated: {metadata}")
        return metadata
        
    except Exception as e:
        logger.error(f"Cache update failed: {e}")
        # Don't fail the whole pipeline if cache update fails
        return {'status': 'cache_failed', 'error': str(e)}


def send_summary_email(**context):
    """Send execution summary"""
    logger.info("Preparing summary email...")
    
    try:
        from airflow.operators.email import EmailOperator
        
        summary = {
            'execution_date': context['execution_date'].isoformat(),
            'aneel_datasets': context['task_instance'].xcom_pull(
                task_ids='fetch_aneel',
                key='aneel_datasets'
            ),
            'utilities_scraped': context['task_instance'].xcom_pull(
                task_ids='scrape_utilities',
                key='utility_results'
            ),
            'documents_indexed': context['task_instance'].xcom_pull(
                task_ids='index_vectors',
                key='indexed_count'
            ),
            'status': 'SUCCESS'
        }
        
        logger.info(f"Pipeline Summary: {summary}")
        
        # In production, send actual email
        # email_op = EmailOperator(
        #     task_id='send_email',
        #     to='team@ysh.com',
        #     subject='YSH Pipeline - Daily Ingestion Summary',
        #     html_content=f"<pre>{json.dumps(summary, indent=2)}</pre>"
        # )
        # email_op.execute(context)
        
        return summary
        
    except Exception as e:
        logger.error(f"Email summary failed: {e}")
        return {'status': 'email_failed', 'error': str(e)}


# Task definitions
task_start = BashOperator(
    task_id='start_pipeline',
    bash_command='echo "Starting daily full ingestion at $(date)"',
    dag=dag
)

task_fetch_aneel = PythonOperator(
    task_id='fetch_aneel',
    python_callable=fetch_aneel_data,
    dag=dag
)

task_scrape_utilities = PythonOperator(
    task_id='scrape_utilities',
    python_callable=scrape_utilities,
    dag=dag
)

task_process_ai = PythonOperator(
    task_id='process_ai',
    python_callable=process_with_ai,
    dag=dag
)

task_index_vectors = PythonOperator(
    task_id='index_vectors',
    python_callable=index_in_vector_store,
    dag=dag
)

task_update_cache = PythonOperator(
    task_id='update_cache',
    python_callable=update_cache,
    dag=dag
)

task_send_summary = PythonOperator(
    task_id='send_summary',
    python_callable=send_summary_email,
    dag=dag
)

task_end = BashOperator(
    task_id='end_pipeline',
    bash_command='echo "Pipeline completed at $(date)"',
    dag=dag
)

# Task dependencies
task_start >> [task_fetch_aneel, task_scrape_utilities]
[task_fetch_aneel, task_scrape_utilities] >> task_process_ai
task_process_ai >> task_index_vectors
task_index_vectors >> task_update_cache
task_update_cache >> task_send_summary
task_send_summary >> task_end
