"""
============================================================================
YSH Data Pipeline - Airflow DAG: Product Scraping
============================================================================
Version: 1.0.0
Date: October 14, 2025
Purpose: Weekly scraping of distributor product catalogs
Schedule: Weekly on Sundays at 3 AM BRT
============================================================================
"""

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
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
    'retries': 2,
    'retry_delay': timedelta(minutes=10),
    'execution_timeout': timedelta(hours=4),
}

# =============================================================================
# DAG DEFINITION
# =============================================================================
dag = DAG(
    'ysh_product_scraping_weekly',
    default_args=default_args,
    description='Weekly scraping of distributor product catalogs',
    schedule_interval='0 3 * * 0',  # 3 AM every Sunday
    catchup=False,
    max_active_runs=1,
    tags=['ysh', 'products', 'scraping', 'weekly'],
)

# =============================================================================
# TASK FUNCTIONS
# =============================================================================

def scrape_distributor(distributor_name: str, **context):
    """Scrape products from a distributor."""
    logger.info(f"Scraping {distributor_name}...")
    
    import sys
    sys.path.append('/opt/airflow/dags')
    from crawlee_scraper import DistributorScraper
    
    scraper = DistributorScraper(distributor_name)
    products = scraper.scrape()
    
    logger.info(f"Scraped {len(products)} products from {distributor_name}")
    
    context['task_instance'].xcom_push(
        key=f'{distributor_name}_count', 
        value=len(products)
    )
    return len(products)


def download_images(**context):
    """Download product images."""
    logger.info("Downloading product images...")
    
    import sys
    sys.path.append('/opt/airflow/dags')
    from download_images import ImageDownloader
    
    downloader = ImageDownloader()
    result = downloader.download_all_pending()
    
    logger.info(f"Downloaded {result['success']} images, {result['failed']} failed")
    return result


def process_with_vision_ai(**context):
    """Process images with Vision AI."""
    logger.info("Processing images with Vision AI...")
    
    import sys
    sys.path.append('/opt/airflow/dags')
    from unified_vision_ai import VisionAIProcessor
    
    processor = VisionAIProcessor()
    result = processor.process_pending_images()
    
    logger.info(f"Processed {result['processed']} images with Vision AI")
    return result


def sync_to_medusa(**context):
    """Sync products to Medusa."""
    logger.info("Syncing products to Medusa...")
    
    import sys
    sys.path.append('/opt/airflow/dags')
    from migrate_to_medusa import MedusaMigrator
    
    migrator = MedusaMigrator()
    result = migrator.sync_all()
    
    logger.info(f"Synced {result['synced']} products to Medusa")
    return result


# =============================================================================
# TASKS
# =============================================================================

start = BashOperator(
    task_id='start',
    bash_command='echo "Starting product scraping at $(date)"',
    dag=dag,
)

# Create log entry
create_log = PostgresOperator(
    task_id='create_scraping_log',
    postgres_conn_id='ysh_postgres',
    sql="""
        INSERT INTO pipeline.ingestion_log (source_name, status, started_at)
        VALUES ('product_scraping', 'running', NOW())
        RETURNING ingestion_id;
    """,
    dag=dag,
)

# Scrape each distributor (parallel)
scrape_neosolar = PythonOperator(
    task_id='scrape_neosolar',
    python_callable=lambda **ctx: scrape_distributor('neosolar', **ctx),
    provide_context=True,
    dag=dag,
)

scrape_fotus = PythonOperator(
    task_id='scrape_fotus',
    python_callable=lambda **ctx: scrape_distributor('fotus', **ctx),
    provide_context=True,
    dag=dag,
)

scrape_fortlev = PythonOperator(
    task_id='scrape_fortlev',
    python_callable=lambda **ctx: scrape_distributor('fortlev', **ctx),
    provide_context=True,
    dag=dag,
)

scrape_odex = PythonOperator(
    task_id='scrape_odex',
    python_callable=lambda **ctx: scrape_distributor('odex', **ctx),
    provide_context=True,
    dag=dag,
)

scrape_solfacil = PythonOperator(
    task_id='scrape_solfacil',
    python_callable=lambda **ctx: scrape_distributor('solfacil', **ctx),
    provide_context=True,
    dag=dag,
)

# Download images
download = PythonOperator(
    task_id='download_images',
    python_callable=download_images,
    provide_context=True,
    dag=dag,
)

# Process with Vision AI
process_vision = PythonOperator(
    task_id='process_with_vision_ai',
    python_callable=process_with_vision_ai,
    provide_context=True,
    dag=dag,
)

# Sync to Medusa
sync_medusa = PythonOperator(
    task_id='sync_to_medusa',
    python_callable=sync_to_medusa,
    provide_context=True,
    dag=dag,
)

# Update log
update_log = PostgresOperator(
    task_id='update_scraping_log',
    postgres_conn_id='ysh_postgres',
    sql="""
        UPDATE pipeline.ingestion_log
        SET status = 'success',
            completed_at = NOW()
        WHERE ingestion_id = (
            SELECT MAX(ingestion_id) FROM pipeline.ingestion_log 
            WHERE source_name = 'product_scraping'
        );
    """,
    dag=dag,
)

end = BashOperator(
    task_id='end',
    bash_command='echo "Product scraping completed at $(date)"',
    dag=dag,
)

# =============================================================================
# TASK DEPENDENCIES
# =============================================================================

start >> create_log
create_log >> [scrape_neosolar, scrape_fotus, scrape_fortlev, scrape_odex, scrape_solfacil]
[scrape_neosolar, scrape_fotus, scrape_fortlev, scrape_odex, scrape_solfacil] >> download
download >> process_vision >> sync_medusa >> update_log >> end

# =============================================================================
# END OF DAG
# =============================================================================
