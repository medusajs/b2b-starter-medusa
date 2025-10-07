"""
Dagster Assets — Catálogo FV (Módulos, Inversores, Baterias)
"""

from dagster import asset, AssetExecutionContext, Output, MetadataValue
import pandas as pd
import os

from ..resources.postgres import PostgresResource
from ..resources.pinecone import PineconeResource


@asset(
    group_name="catalog",
    description="Catálogo FV normalizado (Inmetro + Distribuidores)",
    compute_kind="Pathway + Python",
)
def catalog_normalized(
    context: AssetExecutionContext,
    postgres_medusa: PostgresResource,
) -> Output[pd.DataFrame]:
    """
    Executa pipeline Pathway para normalizar catálogo de módulos/inversores.
    
    Fontes:
    - S3: ysh-catalog/raw/*.csv
    - Inmetro: scrape + PDFs
    
    Sinks:
    - Postgres: public.items_normalized
    """
    context.log.info("🚀 Iniciando pipeline Pathway — catalog_etl")
    
    # TODO: Integrar com Pathway pipeline real
    # Por enquanto, mock para validar estrutura
    
    # Simular resultado do Pathway
    mock_data = {
        "id": ["mod_001", "mod_002", "inv_001"],
        "sku": ["BYD-600-MONO", "JINKO-550-BIFACIAL", "GROWATT-5KW"],
        "brand": ["BYD", "JinkoSolar", "Growatt"],
        "category": ["module", "module", "inverter"],
        "power_wp": [600, 550, 5000],
    }
    df = pd.DataFrame(mock_data)
    
    # Escrever no Postgres (mock)
    context.log.info(f"✅ Normalizados {len(df)} itens do catálogo")
    
    return Output(
        df,
        metadata={
            "num_items": len(df),
            "num_modules": len(df[df["category"] == "module"]),
            "num_inverters": len(df[df["category"] == "inverter"]),
            "preview": MetadataValue.md(df.head().to_markdown(index=False)),
        },
    )


@asset(
    group_name="catalog",
    deps=[catalog_normalized],
    description="Embeddings do catálogo para RAG",
    compute_kind="OpenAI + Pinecone",
)
def catalog_embeddings(
    context: AssetExecutionContext,
    postgres_medusa: PostgresResource,
    pinecone: PineconeResource,
) -> Output[dict]:
    """
    Gera embeddings dos itens do catálogo e insere no Pinecone.
    """
    context.log.info("🔍 Gerando embeddings para catálogo...")
    
    # TODO: Implementar geração real de embeddings via OpenAI
    # Mock por enquanto
    
    num_embeddings = 3  # Mock
    
    context.log.info(f"✅ Gerados {num_embeddings} embeddings")
    
    return Output(
        {"num_embeddings": num_embeddings},
        metadata={
            "model": "text-embedding-3-large",
            "dimension": 3072,
            "namespace": "catalog",
        },
    )
