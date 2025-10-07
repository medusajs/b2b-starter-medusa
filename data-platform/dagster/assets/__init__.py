"""
Dagster Assets — YSH Data Platform
"""

from .catalog import catalog_normalized, catalog_embeddings
from .tarifas import tarifas_aneel

__all__ = [
    "catalog_normalized",
    "catalog_embeddings",
    "tarifas_aneel",
]
