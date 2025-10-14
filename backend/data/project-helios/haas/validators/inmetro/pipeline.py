"""Pipeline de extração estruturada de dados do portal INMETRO."""

from __future__ import annotations

import logging
from collections.abc import Iterable, Mapping, Sequence
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import cast

from .crawler import CrawlResult, InmetroCrawler
from .llm import LLMExtractionError, LLMInterface
from .models import EquipmentBatch, EquipmentRecord, ReferenceInfo
from .repository import InmetroRepository
from .validator import DatasheetValidationError, RecordValidator

logger = logging.getLogger(__name__)


class InmetroExtractionError(RuntimeError):
    """Erro genérico para falhas na etapa de extração estruturada."""


@dataclass(slots=True)
class EquipmentRequest:
    """Solicitação de coleta para um equipamento específico."""

    categoria: str
    fabricante: str
    modelo: str
    registry_id: str | None = None


class InmetroExtractor:
    """Responsável por transformar HTML em registros estruturados."""

    DEFAULT_SYSTEM_PROMPT: str = (
        "Você é um agente especializado em homologação de equipamentos. "
        "Extraia dados do portal INMETRO e responda sempre com um único JSON."
    )

    def __init__(
        self,
        llm: LLMInterface,
        *,
        system_prompt: str | None = None,
        max_prompt_chars: int = 12000,
        html_excerpt_chars: int = 4000,
    ) -> None:
        self._llm: LLMInterface = llm
        self._system_prompt: str = system_prompt or self.DEFAULT_SYSTEM_PROMPT
        self._max_prompt_chars: int = max_prompt_chars
        self._html_excerpt_chars: int = html_excerpt_chars

    def extract(self, crawl: CrawlResult) -> EquipmentRecord:
        """Converte o resultado do crawler em um registro `EquipmentRecord`."""

        metadata = dict(crawl.metadata)
        html_excerpt = self._truncate_html(crawl.html)
        prompt = self._build_prompt(html_excerpt, metadata)

        try:
            structured = self._llm.structured_extract(
                self._system_prompt,
                prompt,
            )
        except LLMExtractionError as exc:
            logger.exception("Falha ao extrair dados estruturados do LLM")
            raise InmetroExtractionError(
                "Falha ao extrair dados estruturados"
            ) from exc

        payload = self._prepare_payload(structured)
        return self._build_record(payload, metadata, html_excerpt, crawl)

    def _prepare_payload(self, structured: object) -> dict[str, object]:
        if isinstance(structured, Mapping):
            mapping = cast(Mapping[str, object], structured)
            return {str(key): value for key, value in mapping.items()}

        try:
            candidate = dict(structured)  # type: ignore[arg-type]
        except (TypeError, ValueError) as exc:
            raise InmetroExtractionError(
                "Resposta do LLM não é representável como objeto JSON"
            ) from exc

        as_dict = cast(Mapping[str, object], candidate)
        return {str(key): value for key, value in as_dict.items()}

    def _truncate_html(self, html: str) -> str:
        if len(html) <= self._html_excerpt_chars:
            return html
        logger.debug(
            "HTML excede %s caracteres; será truncado para %s",
            self._html_excerpt_chars,
            self._html_excerpt_chars,
        )
        return html[: self._html_excerpt_chars]

    def _build_prompt(self, html: str, metadata: Mapping[str, str]) -> str:
        registry_id = metadata.get("registry_id") or "não informado"
        descricao = (
            "Extraia as informações mais confiáveis do HTML "
            "do portal INMETRO. Responda apenas com JSON na "
            "seguinte estrutura:\n"
            "{\n"
            "  'categoria': string,\n"
            "  'fabricante': string,\n"
            "  'modelo': string,\n"
            "  'familia': string|null,\n"
            "  'datasheet': { 'atributos': dict, 'arquivos': lista[str] },\n"
            "  'certificacao': {\n"
            "     'ocp': string|null,\n"
            "     'certificado_numero': string|null,\n"
            "     'registro_inmetro': string|null,\n"
            "     'laboratorio_ensaio': string|null,\n"
            "     'data_emissao': string|null (formato YYYY-MM-DD),\n"
            "     'data_validade': string|null (formato YYYY-MM-DD),\n"
            "     'normas_ensaios': lista[str]\n"
            "  },\n"
            "  'referencia': opcional,\n"
            "  'raw_payload': opcional\n"
            "}\n"
            "Preencha sempre categoria, fabricante e modelo com os "
            "valores corretos."
        )
        html_excerpt = html[: self._html_excerpt_chars]
        prompt = (
            "METADADOS:\n"
            f"- categoria: {metadata.get('categoria', 'desconhecida')}\n"
            f"- fabricante: {metadata.get('fabricante', 'desconhecido')}\n"
            f"- modelo: {metadata.get('modelo', 'desconhecido')}\n"
            f"- registry_id: {registry_id}\n\n"
            "HTML:\n<<<\n"
            f"{html_excerpt}\n"
            ">>>\n\n"
            f"{descricao}"
        )
        return self._enforce_prompt_budget(prompt)

    def _enforce_prompt_budget(self, prompt: str) -> str:
        if len(prompt) <= self._max_prompt_chars:
            return prompt
        logger.debug(
            "Prompt excede %s caracteres; será truncado",
            self._max_prompt_chars,
        )
        return prompt[: self._max_prompt_chars]

    def _build_record(
        self,
        payload: Mapping[str, object],
        metadata: Mapping[str, str],
        html_excerpt: str,
        crawl: CrawlResult,
    ) -> EquipmentRecord:
        categoria = self._normalize_text(
            payload.get("categoria"), metadata.get("categoria")
        )
        fabricante = self._normalize_text(
            payload.get("fabricante"), metadata.get("fabricante")
        )
        modelo = self._normalize_text(
            payload.get("modelo"), metadata.get("modelo")
        )

        if not categoria or not fabricante or not modelo:
            raise InmetroExtractionError(
                "Informações básicas ausentes (categoria/fabricante/modelo)"
            )

        familia_text = self._normalize_text(
            payload.get("familia"), None, allow_empty=True
        )
        familia = familia_text or None

        datasheet_payload = self._ensure_mapping(payload.get("datasheet"))
        _ = datasheet_payload.setdefault("atributos", {})
        _ = datasheet_payload.setdefault("arquivos", [])

        certificacao_payload = self._ensure_mapping(
            payload.get("certificacao")
        )
        _ = certificacao_payload.setdefault("ocp", None)
        _ = certificacao_payload.setdefault("certificado_numero", None)
        _ = certificacao_payload.setdefault("registro_inmetro", None)
        _ = certificacao_payload.setdefault("laboratorio_ensaio", None)
        _ = certificacao_payload.setdefault("data_emissao", None)
        _ = certificacao_payload.setdefault("data_validade", None)
        _ = certificacao_payload.setdefault("normas_ensaios", [])

        referencia_data = self._ensure_mapping(payload.get("referencia"))
        extra_metadata = self._ensure_mapping(referencia_data.get("extra"))
        _ = extra_metadata.setdefault("inmetro_metadata", dict(metadata))
        if crawl.documents:
            _ = extra_metadata.setdefault(
                "documentos_coletados",
                [str(path) for path in crawl.documents],
            )
        referencia_data["extra"] = extra_metadata
        reference = ReferenceInfo(**referencia_data)

        raw_payload = self._ensure_mapping(payload.get("raw_payload"))
        _ = raw_payload.setdefault("metadata", dict(metadata))
        _ = raw_payload.setdefault("html_excerpt", html_excerpt)

        record_payload = {
            "categoria": categoria,
            "fabricante": fabricante,
            "modelo": modelo,
            "familia": familia,
            "datasheet": datasheet_payload,
            "certificacao": certificacao_payload,
            "raw_payload": raw_payload,
            "referencia": reference,
        }

        record = EquipmentRecord(**record_payload)
        return record

    @staticmethod
    def _ensure_mapping(value: object) -> dict[str, object]:
        if isinstance(value, Mapping):
            mapping = cast(Mapping[str, object], value)
            return {str(key): val for key, val in mapping.items()}
        return {}

    @staticmethod
    def _normalize_text(
        value: object,
        fallback: str | None,
        *,
        allow_empty: bool = False,
    ) -> str:
        candidate: str
        if isinstance(value, str):
            candidate = value.strip()
        elif value is None:
            candidate = (fallback or "").strip() if fallback else ""
        else:
            candidate = str(value).strip()

        if candidate:
            return candidate
        if allow_empty:
            return ""
        return (fallback or "").strip() if fallback else ""


class InmetroPipeline:
    """Orquestra as etapas de coleta, extração e validação."""

    def __init__(
        self,
        crawler: InmetroCrawler,
        extractor: InmetroExtractor,
        validator: RecordValidator,
        *,
        repository: InmetroRepository | None = None,
    ) -> None:
        self._crawler: InmetroCrawler = crawler
        self._extractor: InmetroExtractor = extractor
        self._validator: RecordValidator = validator
        self._repository: InmetroRepository | None = repository

    def process_equipment(self, request: EquipmentRequest) -> EquipmentRecord:
        """Executa o pipeline completo para um único equipamento."""

        crawl_result = self._crawler.fetch_equipment(
            categoria=request.categoria,
            fabricante=request.fabricante,
            modelo=request.modelo,
            registry_id=request.registry_id,
        )
        record = self._extractor.extract(crawl_result)
        try:
            self._validator.validate_record(record)
        except DatasheetValidationError:
            logger.exception("Registro inválido de acordo com o schema JSON")
            raise

        if self._repository is not None:
            _ = self._repository.upsert_record(record)
        return record

    def process_batch(
        self,
        requests: Sequence[EquipmentRequest],
    ) -> EquipmentBatch:
        """Processa uma lista de equipamentos gerando um lote validado."""

        reference = ReferenceInfo(
            extra={
                "total_equipamentos": len(requests),
                "processado_em": datetime.now(timezone.utc).isoformat(),
            }
        )

        equipamentos: list[EquipmentRecord] = []
        for request in requests:
            record = self.process_equipment(request)
            if record.referencia is None:
                record.referencia = reference
            equipamentos.append(record)

        batch = EquipmentBatch(referencia=reference, equipamentos=equipamentos)
        self._validator.validate_batch(batch)
        if self._repository is not None:
            _ = self._repository.upsert_batch(batch)
        return batch

    def collect_many(
        self,
        requests: Iterable[EquipmentRequest],
    ) -> list[EquipmentRecord]:
        """Atalho para obter diversos registros sem embrulhá-los em um lote."""

        return [self.process_equipment(request) for request in requests]
