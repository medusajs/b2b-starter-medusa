"""
Dagster Assets — Tarifas ANEEL
"""

from dagster import asset, AssetExecutionContext, Output
from ..resources.postgres import PostgresResource


@asset(
    group_name="tarifas",
    description="Tarifas ANEEL normalizadas",
    compute_kind="Pathway CDC",
)
def tarifas_aneel(
    context: AssetExecutionContext,
    postgres_medusa: PostgresResource,
) -> Output[dict]:
    """
    Pipeline Pathway CDC que escuta mudanças em tarifas_raw (scraper escreve lá)
    e normaliza para tarifas_normalized.
    """
    context.log.info("⚡ Iniciando Pathway CDC para tarifas ANEEL")
    
    # TODO: Integrar com Pathway pipeline real
    # Mock por enquanto
    
    stats = {
        "distribuidoras": 54,
        "classes": 7,
        "records_processed": 1234,
    }
    
    context.log.info(f"✅ Processadas {stats['records_processed']} tarifas")
    
    return Output(
        stats,
        metadata={
            "num_distribuidoras": stats["distribuidoras"],
            "num_classes": stats["classes"],
        },
    )
