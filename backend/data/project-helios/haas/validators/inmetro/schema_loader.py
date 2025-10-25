"""Utilitários para carregamento do schema JSON de datasheets."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import cast


SchemaDict = dict[str, object]


@lru_cache(maxsize=1)
def load_datasheet_schema(path: Path | None = None) -> SchemaDict:
    """Carrega o schema JSON de datasheets/certificados."""

    if path is None:
        base_dir = Path(__file__).resolve().parents[5]
        default_path = (
            base_dir / "config" / "schemas" / "datasheets_certificados.schema.json"
        )
        if not default_path.exists():
            # Suporte a estrutura antiga (config/sem subpasta schemas)
            fallback = base_dir / "config" / "datasheets_certificados.schema.json"
            default_path = fallback
        path = default_path

    with path.open("r", encoding="utf-8") as fh:
        data: SchemaDict = cast(SchemaDict, json.load(fh))
    return data
