"""Modelos pydantic para o pipeline de integração INMETRO."""

from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ReferenceInfo(BaseModel):
    """Metadados da execução e origem dos dados."""

    fonte: str = Field("INMETRO", description="Fonte primária do registro")
    ultima_atualizacao: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Timestamp da última atualização",
    )
    responsavel: Optional[str] = Field(
        default=None, description="Responsável pelo processamento"
    )
    extra: Dict[str, Any] = Field(
        default_factory=dict, description="Metadados adicionais opcionais"
    )

    class Config:
        extra = "allow"


class CertificationInfo(BaseModel):
    """Informações de certificação conforme Portaria 140/2022."""

    normas_ensaios: List[str] = Field(
        default_factory=list,
        description="Normas e ensaios presentes no certificado",
    )
    ocp: Optional[str] = Field(
        default=None, description="Organismo de Certificação de Produtos"
    )
    certificado_numero: Optional[str] = Field(
        default=None, description="Número do certificado INMETRO"
    )
    registro_inmetro: Optional[str] = Field(
        default=None, description="Número de registro no INMETRO"
    )
    laboratorio_ensaio: Optional[str] = Field(
        default=None, description="Laboratório responsável pelos ensaios"
    )
    data_emissao: Optional[date] = Field(
        default=None, description="Data de emissão do certificado"
    )
    data_validade: Optional[date] = Field(
        default=None, description="Data de expiração do certificado"
    )

    class Config:
        extra = "allow"


class DatasheetInfo(BaseModel):
    """Dados técnicos extraídos do datasheet."""

    atributos: Dict[str, Any] = Field(
        default_factory=dict, description="Mapa de atributos técnicos"
    )
    arquivos: List[str] = Field(
        default_factory=list, description="Referências a arquivos brutos"
    )

    class Config:
        extra = "allow"


class EquipmentRecord(BaseModel):
    """Registro consolidado de um equipamento homologado."""

    categoria: str = Field(..., description="Categoria do equipamento")
    fabricante: str = Field(..., description="Nome do fabricante")
    modelo: str = Field(..., description="Identificação do modelo")
    familia: Optional[str] = Field(
        default=None, description="Família ou linha do produto"
    )
    datasheet: DatasheetInfo = Field(..., description="Informações técnicas")
    certificacao: CertificationInfo = Field(..., description="Dados da certificação")
    raw_payload: Dict[str, Any] = Field(
        default_factory=dict,
        description="Resposta bruta utilizada na extração",
    )
    referencia: Optional[ReferenceInfo] = Field(
        default=None, description="Metadados da coleta"
    )

    class Config:
        extra = "allow"

    def is_valid(self, as_of: Optional[date] = None) -> bool:
        """Retorna True se o certificado estiver válido na data informada."""

        data_referencia = as_of or date.today()
        if not self.certificacao.data_validade:
            return False
        return self.certificacao.data_validade >= data_referencia


class EquipmentBatch(BaseModel):
    """Coleção de equipamentos provenientes de uma execução do pipeline."""

    referencia: ReferenceInfo = Field(
        default_factory=ReferenceInfo, description="Metadados compartilhados"
    )
    equipamentos: List[EquipmentRecord] = Field(
        default_factory=list, description="Lista de equipamentos retornados"
    )

    class Config:
        extra = "allow"

    def add_record(self, record: EquipmentRecord) -> None:
        self.equipamentos.append(record)

    def filter_by_categoria(self, categoria: str) -> "EquipmentBatch":
        return EquipmentBatch(
            referencia=self.referencia,
            equipamentos=[
                item for item in self.equipamentos if item.categoria == categoria
            ],
        )

    def to_dict(self) -> Dict[str, Any]:
        return self.dict()
