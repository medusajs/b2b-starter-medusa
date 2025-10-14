"""Interfaces e implementações para agentes LLM (Codex/OpenAI)."""

import json
import logging
from typing import Any, Dict, Optional, Protocol

logger = logging.getLogger(__name__)


class LLMExtractionError(RuntimeError):
    """Erro ao tentar obter resposta estruturada do LLM."""


class LLMInterface(Protocol):
    """Interface base para agentes LLM utilizados no pipeline."""

    def structured_extract(
        self, system_prompt: str, user_prompt: str
    ) -> Dict[str, Any]:
        """Recebe prompts e devolve um objeto JSON estruturado."""


class OpenAICodexAgent(LLMInterface):
    """Agente que utiliza a API OpenAI para produzir respostas JSON."""

    def __init__(
        self,
        model: str = "gpt-4.1-mini",
        api_key: Optional[str] = None,
        organization: Optional[str] = None,
        temperature: float = 0.0,
    ) -> None:
        try:
            from openai import OpenAI
        except ImportError as exc:  # pragma: no cover - dependência opcional
            raise RuntimeError(
                "A biblioteca 'openai' é necessária para usar " "o OpenAICodexAgent"
            ) from exc

        kwargs: Dict[str, Any] = {}
        if api_key:
            kwargs["api_key"] = api_key
        if organization:
            kwargs["organization"] = organization

        self._client: Any = OpenAI(**kwargs)
        self._model: str = model
        self._temperature: float = temperature

    def structured_extract(
        self, system_prompt: str, user_prompt: str
    ) -> Dict[str, Any]:
        try:
            response = self._client.responses.create(
                model=self._model,
                temperature=self._temperature,
                response_format={"type": "json_object"},
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
        except Exception as exc:  # pragma: no cover - apenas logamos
            raise LLMExtractionError("Falha ao consultar a API OpenAI") from exc

        try:
            # SDK >= 1.0 retorna conteúdo estruturado em output_text
            if hasattr(response, "output"):  # type: ignore[attr-defined]
                chunks = getattr(response, "output")
                raw_text = "".join(
                    fragment.content[0].text  # type: ignore[index]
                    for fragment in chunks
                    if getattr(fragment, "content", None)
                )
            else:
                raw_text = response.output_text  # type: ignore[attr-defined]
        except Exception as exc:  # pragma: no cover - defensivo
            raise LLMExtractionError(
                "Não foi possível interpretar a resposta do LLM"
            ) from exc

        try:
            return json.loads(raw_text)
        except json.JSONDecodeError as exc:
            logger.exception("Resposta inválida do LLM: %s", raw_text)
            raise LLMExtractionError("Resposta do LLM não é um JSON válido") from exc


class MockLLMAgent:
    """Implementação simples para testes unitários e execuções offline."""

    def __init__(self, payload: Optional[Dict[str, Any]] = None) -> None:
        self._payload = payload or {}

    def structured_extract(
        self, system_prompt: str, user_prompt: str
    ) -> Dict[str, Any]:
        if not self._payload:
            raise LLMExtractionError("Payload de teste não configurado")
        return self._payload
