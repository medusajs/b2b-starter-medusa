"""
Esquemas de validação para as APIs de Distribuidoras de Geração Distribuída (GD)
"""
import json
from pathlib import Path
from typing import Dict, List, Optional

from api.models.gd.distribuidoras_gd_models import (
    DistribuidoraGD,
    DistribuidorasGDResponse,
    DistribuidoraCreateRequest,
    DistribuidoraUpdateRequest,
    StatusResponse,
    ErrorResponse
)


def load_distribuidoras_schema() -> Dict:
    """
    Carrega o esquema JSON de validação das distribuidoras
    
    Returns:
        Dict: Esquema JSON de validação
    """
    schema_path = Path(__file__).parents[3] / "config" / "gd" / "distribuidoras_gd.schema.json"
    with open(schema_path, "r", encoding="utf-8") as f:
        return json.load(f)


# Exportando os modelos para uso nas APIs
__all__ = [
    "DistribuidoraGD",
    "DistribuidorasGDResponse",
    "DistribuidoraCreateRequest",
    "DistribuidoraUpdateRequest",
    "StatusResponse",
    "ErrorResponse",
    "load_distribuidoras_schema"
]