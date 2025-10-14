"""Validação de registros utilizando o schema oficial da YSH."""

import logging
from typing import Mapping

from jsonschema import Draft202012Validator, ValidationError

from .models import EquipmentBatch, EquipmentRecord

logger = logging.getLogger(__name__)


class DatasheetValidationError(RuntimeError):
    """Erro indicando que um registro não atende ao schema."""

    def __init__(self, message: str, *, path: str | None = None) -> None:
        super().__init__(message)
        self.path: str | None = path


class RecordValidator:
    """Executa validações de schema JSON para registros do INMETRO."""

    def __init__(self, schema: dict[str, object]) -> None:
        self._schema: dict[str, object] = schema
        self._validator: Draft202012Validator = Draft202012Validator(schema)

    def _validate_payload(self, payload: Mapping[str, object]) -> None:
        errors: list[ValidationError] = list(self._validator.iter_errors(payload))
        for error in errors:
            path = " / ".join(str(item) for item in list(error.absolute_path))
            logger.error("Falha de validação (%s): %s", path, error.message)
            raise DatasheetValidationError(error.message, path=path)

    def validate_record(self, record: EquipmentRecord) -> None:
        payload: dict[str, object] = {
            "equipamentos": [record.dict()],
        }
        self._validate_payload(payload)

    def validate_batch(self, batch: EquipmentBatch) -> None:
        payload: dict[str, object] = batch.dict()
        self._validate_payload(payload)
