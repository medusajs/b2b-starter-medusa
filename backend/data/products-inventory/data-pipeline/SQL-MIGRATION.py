"""
============================================================================
YSH Data Pipeline - Database Migration & Data Loading Scripts
============================================================================
Version: 1.0.0
Date: October 14, 2025
Purpose: ETL scripts for loading data into PostgreSQL, DynamoDB, and Redis
Performance: Batch processing with progress tracking and error handling
============================================================================
"""

import asyncio
import json
import hashlib
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import asyncpg
import boto3
import redis
from dataclasses import dataclass, asdict
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================================================
# SECTION 1: CONFIGURATION
# ============================================================================

@dataclass
class DatabaseConfig:
    """Database connection configuration."""
    
    # PostgreSQL
    pg_host: str = 'localhost'
    pg_port: int = 5432
    pg_database: str = 'ysh_pipeline'
    pg_user: str = 'ysh_api'
    pg_password: str = 'CHANGE_ME'
    
    # Redis
    redis_host: str = 'localhost'
    redis_port: int = 6379
    redis_password: Optional[str] = 'CHANGE_ME'
    redis_db: int = 0
    
    # DynamoDB
    dynamodb_region: str = 'us-east-1'
    dynamodb_endpoint: Optional[str] = None  # For local testing
    
    # Processing
    batch_size: int = 1000
    max_workers: int = 4

# ============================================================================
# SECTION 2: DATA MODELS
# ============================================================================

@dataclass
class ANEELDataset:
    """ANEEL dataset model."""
    aneel_id: str
    title: str
    description: Optional[str]
    url: Optional[str]
    modified: datetime
    published: Optional[datetime]
    format: Optional[str]
    category: Optional[str]
    keywords: List[str]
    license: Optional[str]
    spatial: Optional[str]
    temporal_start: Optional[datetime]
    temporal_end: Optional[datetime]
    update_frequency: Optional[str]
    source_api: str
    raw_metadata: Dict[str, Any]


@dataclass
class GenerationUnit:
    """Generation unit model."""
    unit_id: str
    consumer_class: str
    utility_company: str
    utility_code: str
    municipality: str
    state: str
    latitude: Optional[float]
    longitude: Optional[float]
    installed_power_kw: float
    source_type: str
    compensation_modality: str
    connection_date: Optional[datetime]
    registration_date: datetime
    raw_data: Dict[str, Any]


@dataclass
class Product:
    """Product model."""
    sku: str
    name: str
    description: Optional[str]
    category: str
    manufacturer: str
    model: str
    specifications: Dict[str, Any]
    cost_price: float
    sale_price: float
    stock_quantity: int
    status: str = 'ACTIVE'


@dataclass
class SolarKit:
    """Solar kit model."""
    kit_id: str
    sku: str
    name: str
    system_type: str
    power_kwp: float
    voltage_phase: str
    components: Dict[str, Any]
    kit_cost: float
    status: str = 'ACTIVE'

# ============================================================================
# SECTION 3: DATABASE LOADERS
# ============================================================================

class PostgreSQLLoader:
    """Load data into PostgreSQL."""
    
    def __init__(self, config: DatabaseConfig):
        self.config = config
        self.pool: Optional[asyncpg.Pool] = None
    
    async def connect(self):
        """Create connection pool."""
        self.pool = await asyncpg.create_pool(
            host=self.config.pg_host,
            port=self.config.pg_port,
            database=self.config.pg_database,
            user=self.config.pg_user,
            password=self.config.pg_password,
            min_size=2,
            max_size=10
        )
        logger.info("PostgreSQL connection pool created")
    
    async def close(self):
        """Close connection pool."""
        if self.pool:
            await self.pool.close()
            logger.info("PostgreSQL connection pool closed")
    
    async def load_datasets(
        self,
        datasets: List[ANEELDataset]
    ) -> Dict[str, int]:
        """Load ANEEL datasets in batches."""
        inserted = 0
        updated = 0
        failed = 0
        
        async with self.pool.acquire() as conn:
            for i in range(0, len(datasets), self.config.batch_size):
                batch = datasets[i:i + self.config.batch_size]
                
                for dataset in batch:
                    try:
                        # Upsert dataset
                        result = await conn.execute("""
                            INSERT INTO aneel.datasets (
                                aneel_id, title, description, url, modified,
                                published, format, category, keywords, license,
                                spatial, temporal_start, temporal_end,
                                update_frequency, source_api, raw_metadata
                            ) VALUES (
                                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                                $11, $12, $13, $14, $15, $16
                            )
                            ON CONFLICT (aneel_id) DO UPDATE SET
                                title = EXCLUDED.title,
                                description = EXCLUDED.description,
                                modified = EXCLUDED.modified,
                                updated_at = NOW()
                            RETURNING id
                        """,
                            dataset.aneel_id,
                            dataset.title,
                            dataset.description,
                            dataset.url,
                            dataset.modified,
                            dataset.published,
                            dataset.format,
                            dataset.category,
                            dataset.keywords,
                            dataset.license,
                            dataset.spatial,
                            dataset.temporal_start,
                            dataset.temporal_end,
                            dataset.update_frequency,
                            dataset.source_api,
                            json.dumps(dataset.raw_metadata)
                        )
                        
                        if "INSERT" in result:
                            inserted += 1
                        else:
                            updated += 1
                            
                    except Exception as e:
                        logger.error(f"Error loading dataset {dataset.aneel_id}: {e}")
                        failed += 1
                
                logger.info(f"Processed batch {i // self.config.batch_size + 1}: "
                           f"{inserted} inserted, {updated} updated, {failed} failed")
        
        return {"inserted": inserted, "updated": updated, "failed": failed}
    
    async def load_generation_units(
        self,
        units: List[GenerationUnit]
    ) -> Dict[str, int]:
        """Load generation units in batches."""
        inserted = 0
        updated = 0
        failed = 0
        
        async with self.pool.acquire() as conn:
            for i in range(0, len(units), self.config.batch_size):
                batch = units[i:i + self.config.batch_size]
                
                for unit in batch:
                    try:
                        result = await conn.execute("""
                            INSERT INTO aneel.generation_units (
                                unit_id, consumer_class, utility_company,
                                utility_code, municipality, state, latitude,
                                longitude, installed_power_kw, source_type,
                                compensation_modality, connection_date,
                                registration_date, raw_data
                            ) VALUES (
                                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                                $11, $12, $13, $14
                            )
                            ON CONFLICT (unit_id) DO UPDATE SET
                                installed_power_kw = EXCLUDED.installed_power_kw,
                                updated_at = NOW()
                            RETURNING id
                        """,
                            unit.unit_id,
                            unit.consumer_class,
                            unit.utility_company,
                            unit.utility_code,
                            unit.municipality,
                            unit.state,
                            unit.latitude,
                            unit.longitude,
                            unit.installed_power_kw,
                            unit.source_type,
                            unit.compensation_modality,
                            unit.connection_date,
                            unit.registration_date,
                            json.dumps(unit.raw_data)
                        )
                        
                        if "INSERT" in result:
                            inserted += 1
                        else:
                            updated += 1
                            
                    except Exception as e:
                        logger.error(f"Error loading unit {unit.unit_id}: {e}")
                        failed += 1
                
                logger.info(f"Processed batch {i // self.config.batch_size + 1}: "
                           f"{inserted} inserted, {updated} updated, {failed} failed")
        
        return {"inserted": inserted, "updated": updated, "failed": failed}
    
    async def load_products(
        self,
        products: List[Product]
    ) -> Dict[str, int]:
        """Load products in batches."""
        inserted = 0
        updated = 0
        failed = 0
        
        async with self.pool.acquire() as conn:
            for i in range(0, len(products), self.config.batch_size):
                batch = products[i:i + self.config.batch_size]
                
                for product in batch:
                    try:
                        result = await conn.execute("""
                            INSERT INTO products.products (
                                sku, name, description, category, manufacturer,
                                model, specifications, cost_price, sale_price,
                                stock_quantity, status
                            ) VALUES (
                                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
                            )
                            ON CONFLICT (sku) DO UPDATE SET
                                name = EXCLUDED.name,
                                cost_price = EXCLUDED.cost_price,
                                sale_price = EXCLUDED.sale_price,
                                stock_quantity = EXCLUDED.stock_quantity,
                                updated_at = NOW()
                            RETURNING id
                        """,
                            product.sku,
                            product.name,
                            product.description,
                            product.category,
                            product.manufacturer,
                            product.model,
                            json.dumps(product.specifications),
                            product.cost_price,
                            product.sale_price,
                            product.stock_quantity,
                            product.status
                        )
                        
                        if "INSERT" in result:
                            inserted += 1
                        else:
                            updated += 1
                            
                    except Exception as e:
                        logger.error(f"Error loading product {product.sku}: {e}")
                        failed += 1
                
                logger.info(f"Processed batch {i // self.config.batch_size + 1}: "
                           f"{inserted} inserted, {updated} updated, {failed} failed")
        
        return {"inserted": inserted, "updated": updated, "failed": failed}


class DynamoDBLoader:
    """Load data into DynamoDB."""
    
    def __init__(self, config: DatabaseConfig):
        self.config = config
        self.dynamodb = boto3.resource(
            'dynamodb',
            region_name=config.dynamodb_region,
            endpoint_url=config.dynamodb_endpoint
        )
    
    def cache_datasets(
        self,
        datasets: List[ANEELDataset]
    ) -> Dict[str, int]:
        """Cache datasets in DynamoDB."""
        table = self.dynamodb.Table('ysh-pipeline-cache')
        cached = 0
        failed = 0
        
        with table.batch_writer() as batch:
            for dataset in datasets:
                try:
                    item = {
                        'pk': 'dataset',
                        'sk': dataset.aneel_id,
                        'dataset_id': dataset.aneel_id,
                        'title': dataset.title,
                        'category': dataset.category,
                        'source': dataset.source_api,
                        'modified': dataset.modified.isoformat(),
                        'url': dataset.url,
                        'timestamp': int(datetime.now().timestamp()),
                        'ttl': int((datetime.now() + timedelta(hours=6)).timestamp())
                    }
                    batch.put_item(Item=item)
                    cached += 1
                    
                except Exception as e:
                    logger.error(f"Error caching dataset {dataset.aneel_id}: {e}")
                    failed += 1
        
        logger.info(f"Cached {cached} datasets, {failed} failed")
        return {"cached": cached, "failed": failed}
    
    def log_ingestion_run(
        self,
        run_id: str,
        workflow_name: str,
        metrics: Dict[str, Any]
    ):
        """Log ingestion run metadata."""
        table = self.dynamodb.Table('ysh-ingestion-metadata')
        
        item = {
            'run_id': run_id,
            'timestamp': int(datetime.now().timestamp()),
            'workflow_name': workflow_name,
            'status': metrics.get('status', 'SUCCESS'),
            'metrics': metrics,
            'ttl': int((datetime.now() + timedelta(days=30)).timestamp())
        }
        
        table.put_item(Item=item)
        logger.info(f"Logged ingestion run {run_id}")


class RedisLoader:
    """Load data into Redis."""
    
    def __init__(self, config: DatabaseConfig):
        self.config = config
        self.client = redis.Redis(
            host=config.redis_host,
            port=config.redis_port,
            password=config.redis_password,
            db=config.redis_db,
            decode_responses=True
        )
    
    def cache_datasets(
        self,
        datasets: List[ANEELDataset],
        ttl: int = 21600  # 6 hours
    ) -> Dict[str, int]:
        """Cache datasets in Redis."""
        cached = 0
        failed = 0
        
        with self.client.pipeline() as pipe:
            for dataset in datasets:
                try:
                    key = f'ysh:api:datasets:{dataset.aneel_id}'
                    value = json.dumps({
                        'id': dataset.aneel_id,
                        'title': dataset.title,
                        'category': dataset.category,
                        'modified': dataset.modified.isoformat(),
                        'url': dataset.url
                    })
                    pipe.setex(key, ttl, value)
                    cached += 1
                    
                except Exception as e:
                    logger.error(f"Error caching dataset {dataset.aneel_id}: {e}")
                    failed += 1
            
            pipe.execute()
        
        logger.info(f"Cached {cached} datasets in Redis, {failed} failed")
        return {"cached": cached, "failed": failed}
    
    def update_counts(self, counts: Dict[str, int]):
        """Update aggregate counts."""
        with self.client.pipeline() as pipe:
            for key, value in counts.items():
                pipe.setex(f'ysh:{key}', 3600, value)
            pipe.execute()
        
        logger.info(f"Updated {len(counts)} counts in Redis")

# ============================================================================
# SECTION 4: ETL ORCHESTRATOR
# ============================================================================

class ETLOrchestrator:
    """Orchestrate ETL process across all databases."""
    
    def __init__(self, config: DatabaseConfig):
        self.config = config
        self.pg_loader = PostgreSQLLoader(config)
        self.dynamo_loader = DynamoDBLoader(config)
        self.redis_loader = RedisLoader(config)
    
    async def run_full_etl(
        self,
        datasets: List[ANEELDataset],
        units: List[GenerationUnit],
        products: List[Product]
    ) -> Dict[str, Any]:
        """Run complete ETL pipeline."""
        start_time = datetime.now()
        run_id = hashlib.md5(start_time.isoformat().encode()).hexdigest()
        
        logger.info(f"Starting ETL run {run_id}")
        
        results = {
            'run_id': run_id,
            'started_at': start_time.isoformat(),
            'datasets': {},
            'units': {},
            'products': {},
            'cache': {}
        }
        
        try:
            # Connect to PostgreSQL
            await self.pg_loader.connect()
            
            # Load datasets
            logger.info("Loading datasets into PostgreSQL...")
            results['datasets']['postgresql'] = await self.pg_loader.load_datasets(datasets)
            
            # Load generation units
            logger.info("Loading generation units into PostgreSQL...")
            results['units']['postgresql'] = await self.pg_loader.load_generation_units(units)
            
            # Load products
            logger.info("Loading products into PostgreSQL...")
            results['products']['postgresql'] = await self.pg_loader.load_products(products)
            
            # Cache in DynamoDB
            logger.info("Caching datasets in DynamoDB...")
            results['cache']['dynamodb'] = self.dynamo_loader.cache_datasets(datasets)
            
            # Cache in Redis
            logger.info("Caching datasets in Redis...")
            results['cache']['redis'] = self.redis_loader.cache_datasets(datasets)
            
            # Update counts
            counts = {
                'dataset_count': len(datasets),
                'unit_count': len(units),
                'product_count': len(products)
            }
            self.redis_loader.update_counts(counts)
            
            # Log run metadata
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            metrics = {
                'status': 'SUCCESS',
                'duration_seconds': duration,
                'datasets_processed': len(datasets),
                'units_processed': len(units),
                'products_processed': len(products)
            }
            
            self.dynamo_loader.log_ingestion_run(run_id, 'full_etl', metrics)
            
            results['ended_at'] = end_time.isoformat()
            results['duration_seconds'] = duration
            results['status'] = 'SUCCESS'
            
        except Exception as e:
            logger.error(f"ETL run failed: {e}")
            results['status'] = 'FAILED'
            results['error'] = str(e)
        
        finally:
            await self.pg_loader.close()
        
        logger.info(f"ETL run {run_id} completed: {results['status']}")
        return results

# ============================================================================
# SECTION 5: SAMPLE DATA GENERATORS
# ============================================================================

def generate_sample_datasets(count: int = 100) -> List[ANEELDataset]:
    """Generate sample ANEEL datasets for testing."""
    datasets = []
    categories = ['geracao_distribuida', 'tarifas', 'certificacoes']
    
    for i in range(count):
        datasets.append(ANEELDataset(
            aneel_id=hashlib.md5(f"dataset_{i}".encode()).hexdigest(),
            title=f"Dataset de Teste {i}",
            description=f"Descrição do dataset {i}",
            url=f"https://example.com/dataset/{i}",
            modified=datetime.now(),
            published=datetime.now() - timedelta(days=30),
            format='CSV',
            category=categories[i % len(categories)],
            keywords=['energia', 'solar', 'teste'],
            license='CC-BY-4.0',
            spatial='BR-MG',
            temporal_start=datetime(2024, 1, 1),
            temporal_end=datetime(2024, 12, 31),
            update_frequency='monthly',
            source_api='DCAT_AP',
            raw_metadata={'test': True}
        ))
    
    return datasets


def generate_sample_units(count: int = 50) -> List[GenerationUnit]:
    """Generate sample generation units for testing."""
    units = []
    states = ['BR-MG', 'BR-SP', 'BR-RJ']
    
    for i in range(count):
        units.append(GenerationUnit(
            unit_id=f"UNIT-{i:06d}",
            consumer_class='RESIDENCIAL',
            utility_company='CEMIG',
            utility_code='0062',
            municipality='Belo Horizonte',
            state=states[i % len(states)],
            latitude=-19.9208 + (i * 0.01),
            longitude=-43.9345 + (i * 0.01),
            installed_power_kw=5.5 + (i * 0.5),
            source_type='SOLAR_FOTOVOLTAICA',
            compensation_modality='AUTOCONSUMO_LOCAL',
            connection_date=datetime.now() - timedelta(days=i * 10),
            registration_date=datetime.now() - timedelta(days=i * 12),
            raw_data={'test': True}
        ))
    
    return units


def generate_sample_products(count: int = 30) -> List[Product]:
    """Generate sample products for testing."""
    products = []
    categories = ['paineis', 'inversores', 'baterias']
    
    for i in range(count):
        products.append(Product(
            sku=f"TEST-PROD-{i:04d}",
            name=f"Produto de Teste {i}",
            description=f"Descrição do produto {i}",
            category=categories[i % len(categories)],
            manufacturer='Test Manufacturer',
            model=f"MODEL-{i}",
            specifications={'power': 550, 'efficiency': 21.5},
            cost_price=1000.0 + (i * 50),
            sale_price=1500.0 + (i * 75),
            stock_quantity=100 - i,
            status='ACTIVE'
        ))
    
    return products

# ============================================================================
# SECTION 6: CLI INTERFACE
# ============================================================================

async def main():
    """Main CLI interface."""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='YSH Data Pipeline - Database Migration Tool'
    )
    parser.add_argument(
        'command',
        choices=['test', 'migrate', 'status'],
        help='Command to execute'
    )
    parser.add_argument(
        '--pg-host',
        default='localhost',
        help='PostgreSQL host'
    )
    parser.add_argument(
        '--redis-host',
        default='localhost',
        help='Redis host'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Dry run (no actual changes)'
    )
    
    args = parser.parse_args()
    
    config = DatabaseConfig(
        pg_host=args.pg_host,
        redis_host=args.redis_host
    )
    
    if args.command == 'test':
        logger.info("Running test migration with sample data...")
        
        datasets = generate_sample_datasets(100)
        units = generate_sample_units(50)
        products = generate_sample_products(30)
        
        orchestrator = ETLOrchestrator(config)
        results = await orchestrator.run_full_etl(datasets, units, products)
        
        print("\n" + "="*60)
        print("MIGRATION RESULTS:")
        print(json.dumps(results, indent=2, default=str))
    
    elif args.command == 'status':
        logger.info("Checking database status...")
        # TODO: Implement status check
        print("Status check not yet implemented")
    
    else:
        logger.error(f"Unknown command: {args.command}")


if __name__ == '__main__':
    asyncio.run(main())
