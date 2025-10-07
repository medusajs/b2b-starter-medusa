"""
Dagster Definitions — YSH Data Platform
Entry point for all assets, jobs, schedules, and resources.
"""

from dagster import Definitions, ScheduleDefinition, define_asset_job, load_assets_from_modules
from dagster_aws.s3 import S3Resource
import os

from . import assets
from .resources.postgres import PostgresResource
from .resources.qdrant import QdrantResource

# Load all assets from modules
all_assets = load_assets_from_modules([assets])

# Define jobs
catalog_job = define_asset_job(
    name="catalog_job",
    selection=["catalog_normalized", "catalog_embeddings"],
    description="ETL do catálogo FV (Inmetro + Distribuidores) + embeddings",
)

tarifas_job = define_asset_job(
    name="tarifas_job",
    selection=["tarifas_aneel"],
    description="Atualização de tarifas ANEEL",
)

helio_kb_job = define_asset_job(
    name="helio_kb_job",
    selection=[
        "helio_kb_regulations",
        "helio_kb_catalog",
        "helio_kb_tariffs",
        "helio_kb_geospatial",
        "helio_kb_finance",
        "helio_kb_summary"
    ],
    description="Indexar todas as Knowledge Bases do Hélio (RAG)",
)

# Define schedules
catalog_schedule = ScheduleDefinition(
    job=catalog_job,
    cron_schedule="0 2 * * *",  # 2h diariamente
    description="Rodar ETL de catálogo diariamente às 2h",
)

tarifas_schedule = ScheduleDefinition(
    job=tarifas_job,
    cron_schedule="0 6 * * *",  # 6h diariamente
    description="Atualizar tarifas ANEEL diariamente às 6h",
)

helio_kb_schedule = ScheduleDefinition(
    job=helio_kb_job,
    cron_schedule="0 4 * * *",  # 4h diariamente
    description="Reindexar Knowledge Bases do Hélio diariamente às 4h",
)

# Define resources
resources = {
    "postgres_medusa": PostgresResource(
        host="postgres",
        port=5432,
        database="medusa_db",
        user="medusa_user",
        password="medusa_password",
    ),
    "s3": S3Resource(
        region_name="us-east-1",
    ),
    "qdrant": QdrantResource(
        url=os.getenv("QDRANT_URL", "http://qdrant:6333"),
        api_key=os.getenv("QDRANT_API_KEY"),
        collection_name=os.getenv("QDRANT_COLLECTION", "ysh-rag"),
    ),
}

# Dagster definitions
defs = Definitions(
    assets=all_assets,
    jobs=[catalog_job, tarifas_job, helio_kb_job],
    schedules=[catalog_schedule, tarifas_schedule, helio_kb_schedule],
    resources=resources,
)
