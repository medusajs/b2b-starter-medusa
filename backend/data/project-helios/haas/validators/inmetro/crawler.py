"""Crawler simplificado para coleta de dados do portal INMETRO."""

import logging
from dataclasses import dataclass
from pathlib import Path
import httpx

logger = logging.getLogger(__name__)


@dataclass
class CrawlResult:
    """Resultado da coleta contendo HTML e anexos."""

    html: str
    documents: list[Path]
    metadata: dict[str, str]


class InmetroCrawler:
    """Cliente responsável por obter páginas e anexos do INMETRO."""

    DEFAULT_TIMEOUT: float = 30.0

    def __init__(
        self,
        cache_dir: Path | None = None,
        raw_storage_dir: Path | None = None,
        http_client: httpx.Client | None = None,
    ) -> None:
        self.cache_dir: Path | None = cache_dir
        self.raw_storage_dir: Path | None = raw_storage_dir
        self.http_client: httpx.Client = http_client or httpx.Client(
            timeout=self.DEFAULT_TIMEOUT
        )

        if self.cache_dir and not self.cache_dir.exists():
            self.cache_dir.mkdir(parents=True, exist_ok=True)
        if self.raw_storage_dir and not self.raw_storage_dir.exists():
            self.raw_storage_dir.mkdir(parents=True, exist_ok=True)

    def fetch_equipment(
        self,
        categoria: str,
        fabricante: str,
        modelo: str,
        registry_id: str | None = None,
    ) -> CrawlResult:
        """Obtém HTML do cadastro no INMETRO."""

        metadata: dict[str, str] = {
            "categoria": categoria,
            "fabricante": fabricante,
            "modelo": modelo,
        }
        if registry_id:
            metadata["registry_id"] = registry_id

        cached = self._load_from_cache(fabricante, modelo)
        if cached is not None:
            logger.debug("Carregando INMETRO cache para %s/%s", fabricante, modelo)
            return CrawlResult(html=cached, documents=[], metadata=metadata)

        logger.info(
            "Cache ausente para %s/%s. Coletando do portal INMETRO...",
            fabricante,
            modelo,
        )
        html = self._fetch_from_portal(fabricante, modelo, registry_id)
        return CrawlResult(html=html, documents=[], metadata=metadata)

    def _load_from_cache(self, fabricante: str, modelo: str) -> str | None:
        if not self.cache_dir:
            return None
        slug = self._slugify(f"{fabricante}-{modelo}")
        html_path = self.cache_dir / f"{slug}.html"
        if not html_path.exists():
            return None
        return html_path.read_text(encoding="utf-8")

    def _fetch_from_portal(
        self, fabricante: str, modelo: str, registry_id: str | None
    ) -> str:
        if registry_id:
            url = (
                "https://registro.inmetro.gov.br/consulta/resultado.asp"
                f"?numero={registry_id}"
            )
        else:
            query = self._slugify(f"{fabricante} {modelo}").replace("-", "+")
            url = (
                "https://www.inmetro.gov.br/prodcert/busca.asp?pag=1&palavra="
                f"{query}"
            )

        logger.debug("Coletando dados do INMETRO em %s", url)
        response = self.http_client.get(url)
        response.raise_for_status()

        html = response.text
        if self.cache_dir:
            slug = self._slugify(f"{fabricante}-{modelo}")
            html_path = self.cache_dir / f"{slug}.html"
            _ = html_path.write_text(html, encoding="utf-8")
        if self.raw_storage_dir:
            slug = self._slugify(f"{fabricante}-{modelo}")
            raw_path = self.raw_storage_dir / f"{slug}-raw.html"
            _ = raw_path.write_text(html, encoding="utf-8")
        return html

    @staticmethod
    def _slugify(value: str) -> str:
        return (
            value.lower()
            .replace("/", "-")
            .replace(" ", "-")
            .replace("__", "-")
            .replace("--", "-")
        )
