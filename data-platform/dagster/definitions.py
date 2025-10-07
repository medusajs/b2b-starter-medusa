"""
Dagster Definitions — YSH Data Platform
Entry point for all assets, jobs, schedules, and resources.
"""

from dagster import Definitions, ScheduleDefinition, define_asset_job, load_assets_from_modules
from dagster_aws.s3 import S3Resource

from . import assets
from .resources.postgres import PostgresResource
from .resources.pinecone import PineconeResource

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
    "pinecone": PineconeResource(
        api_key="pk_***",  # Substituir por env var
        index_name="ysh-rag",
    ),
}

# Dagster definitions
defs = Definitions(
    assets=all_assets,
    jobs=[catalog_job, tarifas_job],
    schedules=[catalog_schedule, tarifas_schedule],
    resources=resources,
)
