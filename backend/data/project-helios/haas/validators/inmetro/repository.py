"""Persistência local para registros estruturados do INMETRO."""

from __future__ import annotations

import json
import logging
import unicodedata
from collections.abc import Iterable
from datetime import datetime, timezone
from pathlib import Path
from typing import TypeAlias, cast

from .models import EquipmentBatch, EquipmentRecord

logger = logging.getLogger(__name__)

Store: TypeAlias = dict[str, object]
RecordPayload: TypeAlias = dict[str, object]


class InmetroRepository:
    """Armazena registros extraídos do INMETRO em disco."""

    DEFAULT_FILENAME: str = "inmetro_registros_v1.json"

    def __init__(self, storage_path: Path | None = None) -> None:
        base_dir = Path(__file__).resolve().parents[5]
        default_path = base_dir / "derived_data" / self.DEFAULT_FILENAME
        self._path: Path = storage_path or default_path
        self._path.parent.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------
    # API pública
    # ------------------------------------------------------------------
    def upsert_record(self, record: EquipmentRecord) -> EquipmentRecord:
        """Insere ou atualiza um registro preservando unicidade."""

        store = self._load_store()
        payload = cast(RecordPayload, record.dict())
        self._upsert_payload(store, payload)
        self._write_store(store)
        return record

    def upsert_batch(self, batch: EquipmentBatch) -> EquipmentBatch:
        """Persiste todos os equipamentos de um lote."""

        store = self._load_store()
        for equipment in batch.equipamentos:
            payload = cast(RecordPayload, equipment.dict())
            self._upsert_payload(store, payload)
        self._write_store(store)
        return batch

    def list_records(
        self,
        *,
        categoria: str | None = None,
        fabricante: str | None = None,
        modelo: str | None = None,
        limit: int | None = None,
    ) -> list[EquipmentRecord]:
        """Retorna registros aplicando filtros opcionais."""

        store = self._load_store()
        filtros: dict[str, str | None] = {
            "categoria": categoria,
            "fabricante": fabricante,
            "modelo": modelo,
        }
        resultados: list[EquipmentRecord] = []
        for item in self._iter_records(store):
            if self._matches(item, filtros):
                try:
                    resultados.append(EquipmentRecord(**item))
                except Exception:  # pragma: no cover - log defensivo
                    logger.exception("Registro inválido encontrado no armazenamento")
            if limit is not None and len(resultados) >= limit:
                break
        return resultados

    def get_record(
        self,
        *,
        categoria: str,
        fabricante: str,
        modelo: str,
    ) -> EquipmentRecord | None:
        """Obtém um registro específico pelo identificador composto."""

        store = self._load_store()
        filtros: dict[str, str | None] = {
            "categoria": categoria,
            "fabricante": fabricante,
            "modelo": modelo,
        }
        for item in self._iter_records(store):
            if self._matches(item, filtros):
                try:
                    return EquipmentRecord(**item)
                except Exception:  # pragma: no cover - log defensivo
                    logger.exception("Registro inválido encontrado no armazenamento")
                    return None
        return None

    def metadata(self) -> dict[str, object]:
        store = self._load_store()
        metadata = dict(self._ensure_metadata(store))
        metadata["total_equipamentos"] = len(self._iter_records(store))
        return metadata

    # ------------------------------------------------------------------
    # Internos
    # ------------------------------------------------------------------
    def _load_store(self) -> Store:
        if not self._path.exists():
            return self._empty_store()
        try:
            with self._path.open("r", encoding="utf-8") as fh:
                raw_json = cast(object, json.load(fh))
                if isinstance(raw_json, dict):
                    return cast(Store, raw_json)
                logger.warning("Estrutura inesperada no armazenamento do INMETRO")
                return self._empty_store()
        except (json.JSONDecodeError, OSError):
            logger.exception("Falha ao ler armazenamento do INMETRO; recriando")
            return self._empty_store()

    def _write_store(self, store: Store) -> None:
        metadata = self._ensure_metadata(store)
        metadata["ultima_atualizacao"] = datetime.now(timezone.utc).isoformat()
        metadata["total_equipamentos"] = len(self._iter_records(store))
        with self._path.open("w", encoding="utf-8") as fh:
            json.dump(store, fh, ensure_ascii=False, indent=2, sort_keys=False)

    def _empty_store(self) -> Store:
        return {
            "equipamentos": [],
            "metadata": {
                "versao": 1,
                "ultima_atualizacao": datetime.now(timezone.utc).isoformat(),
            },
        }

    def _matches(self, item: RecordPayload, filtros: dict[str, str | None]) -> bool:
        for field, filtro in filtros.items():
            if filtro is None:
                continue
            valor = item.get(field)
            if not isinstance(valor, str):
                return False
            if self._normalize(valor) != self._normalize(filtro):
                return False
        return True

    def _upsert_payload(self, store: Store, payload: RecordPayload) -> None:
        key = self._make_key(
            str(payload.get("categoria", "")),
            str(payload.get("fabricante", "")),
            str(payload.get("modelo", "")),
        )
        equipamentos: list[RecordPayload] = list(self._iter_records(store))
        for index, item in enumerate(equipamentos):
            existing_key = self._make_key(
                str(item.get("categoria", "")),
                str(item.get("fabricante", "")),
                str(item.get("modelo", "")),
            )
            if existing_key == key:
                equipamentos[index] = payload
                break
        else:
            equipamentos.append(payload)
        store["equipamentos"] = equipamentos

    def _make_key(self, categoria: str, fabricante: str, modelo: str) -> str:
        return "::".join(
            [
                self._normalize(categoria),
                self._normalize(fabricante),
                self._normalize(modelo),
            ]
        )

    @staticmethod
    def _normalize(value: str) -> str:
        normalized = unicodedata.normalize("NFKD", value)
        ascii_bytes = normalized.encode("ascii", "ignore")
        return ascii_bytes.decode("ascii").strip().casefold()

    # ------------------------------------------------------------------
    # Métodos utilitários para testes
    # ------------------------------------------------------------------
    def clear(self) -> None:
        """Remove o arquivo de armazenamento."""

        if self._path.exists():
            self._path.unlink()

    def load_raw(self) -> Store:
        """Retorna os dados crus (apenas para depuração/testes)."""

        return self._load_store()

    def ingest_records(self, records: Iterable[EquipmentRecord]) -> None:
        """Insere uma coleção de registros (apenas para testes/scripts)."""

        store = self._load_store()
        for record in records:
            payload = cast(RecordPayload, record.dict())
            self._upsert_payload(store, payload)
        self._write_store(store)

    @property
    def path(self) -> Path:
        return self._path

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------
    def _iter_records(self, store: Store) -> list[RecordPayload]:
        raw_data = store.get("equipamentos")
        if not isinstance(raw_data, list):
            return []
        registros: list[RecordPayload] = []
        for item in cast(list[object], raw_data):
            if isinstance(item, dict):
                registros.append(cast(RecordPayload, item))
        return registros

    @staticmethod
    def _ensure_metadata(store: Store) -> dict[str, object]:
        metadata = store.get("metadata")
        if not isinstance(metadata, dict):
            metadata = {
                "versao": 1,
                "ultima_atualizacao": datetime.now(timezone.utc).isoformat(),
            }
            store["metadata"] = metadata
        return cast(dict[str, object], metadata)
