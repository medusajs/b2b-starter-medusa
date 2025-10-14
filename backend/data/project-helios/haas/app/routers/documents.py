"""Router para APIs de geração de documentos - HaaS Platform."""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from enum import Enum

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.auth import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])


# ==================== ENUMS ====================

class DocumentType(str, Enum):
    """Tipos de documentos."""
    MEMORIAL = "memorial"
    DIAGRAM_UNIFILAR = "diagram_unifilar"
    DIAGRAM_LAYOUT = "diagram_layout"
    TECHNICAL_REPORT = "technical_report"


class DocumentStatus(str, Enum):
    """Status de processamento."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DiagramType(str, Enum):
    """Tipos de diagramas."""
    UNIFILAR = "unifilar"
    LAYOUT = "layout"
    BOTH = "both"


# ==================== SCHEMAS ====================

class Equipment(BaseModel):
    """Equipamento do projeto."""
    type: str = Field(..., description="Tipo: panel, inverter, battery")
    manufacturer: str
    model: str
    quantity: int
    power_w: float
    inmetro_certified: bool = False


class ProjectLocation(BaseModel):
    """Localização do projeto."""
    address: str
    city: str
    state: str
    zip_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distributor: str = Field(
        ...,
        description="Concessionária (ex: CEMIG, CPFL, Light)"
    )


class ProjectData(BaseModel):
    """Dados do projeto solar."""
    project_name: str
    client_name: str
    client_cpf_cnpj: str
    location: ProjectLocation
    equipments: List[Equipment]
    total_power_kwp: float
    estimated_generation_kwh_month: float
    installation_type: str = Field(
        ...,
        description="Tipo: residencial, comercial, industrial, rural"
    )
    connection_type: str = Field(
        default="monofásico",
        description="monofásico, bifásico, trifásico"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "project_name": "Sistema Solar Residencial 10kWp",
                "client_name": "João Silva",
                "client_cpf_cnpj": "123.456.789-00",
                "location": {
                    "address": "Rua das Flores, 123",
                    "city": "Belo Horizonte",
                    "state": "MG",
                    "zip_code": "30000-000",
                    "distributor": "CEMIG"
                },
                "equipments": [
                    {
                        "type": "panel",
                        "manufacturer": "Canadian Solar",
                        "model": "CS3W-450MS",
                        "quantity": 22,
                        "power_w": 450,
                        "inmetro_certified": True
                    }
                ],
                "total_power_kwp": 9.9,
                "estimated_generation_kwh_month": 1250,
                "installation_type": "residencial",
                "connection_type": "monofásico"
            }
        }


class SystemDesign(BaseModel):
    """Design do sistema para diagramas."""
    project_id: str
    modules_layout: Dict = Field(
        ...,
        description="Layout dos módulos: arrays, orientação, inclinação"
    )
    inverters: List[Equipment]
    string_configuration: Dict = Field(
        ...,
        description="Configuração de strings: módulos por string"
    )
    cable_sizing: Optional[Dict] = Field(
        None,
        description="Dimensionamento de cabos"
    )
    protection_devices: Optional[Dict] = Field(
        None,
        description="Dispositivos de proteção: DPS, disjuntores"
    )


class DocumentResponse(BaseModel):
    """Resposta de criação de documento."""
    document_id: str
    document_type: DocumentType
    status: DocumentStatus
    message: str
    created_at: datetime
    estimated_completion: Optional[datetime] = None

    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "doc_a1b2c3d4",
                "document_type": "memorial",
                "status": "processing",
                "message": (
                    "Documento em processamento. "
                    "Use GET /documents/{document_id} para verificar status."
                ),
                "created_at": "2025-10-14T10:30:00Z",
                "estimated_completion": "2025-10-14T10:32:00Z"
            }
        }


class DocumentDetail(BaseModel):
    """Detalhes completos do documento."""
    document_id: str
    document_type: DocumentType
    status: DocumentStatus
    project_name: str
    client_name: str
    file_url: Optional[str] = Field(
        None,
        description="URL assinada (expira em 1h)"
    )
    file_size_bytes: Optional[int] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    created_by: str
    metadata: Dict = Field(default_factory=dict)


class DiagramRequest(BaseModel):
    """Requisição para geração de diagramas."""
    project_data: ProjectData
    system_design: SystemDesign
    diagram_types: List[DiagramType] = Field(
        default=[DiagramType.UNIFILAR],
        description="Tipos de diagramas a gerar"
    )
    include_technical_specs: bool = Field(
        default=True,
        description="Incluir especificações técnicas"
    )
    validate_nbr5410: bool = Field(
        default=True,
        description="Validar conformidade NBR 5410"
    )


# Armazenamento temporário de documentos (substituir por DB)
_documents_storage: Dict[str, DocumentDetail] = {}


# ==================== HELPER FUNCTIONS ====================

async def _generate_memorial_pdf(
    document_id: str,
    project_data: ProjectData,
    user_email: str
) -> None:
    """
    Gera memorial descritivo em background.

    TODO: Implementar geração real com ReportLab + Jinja2
    """
    try:
        logger.info(f"Generating memorial for document {document_id}")

        # Simular processamento
        import asyncio
        await asyncio.sleep(2)

        # Atualizar status
        if document_id in _documents_storage:
            _documents_storage[document_id].status = DocumentStatus.COMPLETED
            _documents_storage[document_id].completed_at = datetime.utcnow()
            # TODO: Upload para S3 e gerar URL assinada
            _documents_storage[document_id].file_url = (
                f"https://s3.amazonaws.com/haas-docs/{document_id}.pdf"
                "?signature=mock"
            )
            _documents_storage[document_id].file_size_bytes = 524288  # 512KB

        logger.info(f"Memorial {document_id} generated successfully")

    except Exception as exc:
        logger.exception(f"Error generating memorial {document_id}")
        if document_id in _documents_storage:
            _documents_storage[document_id].status = DocumentStatus.FAILED
            _documents_storage[document_id].metadata["error"] = str(exc)


async def _generate_diagrams_pdf(
    document_id: str,
    diagram_request: DiagramRequest,
    user_email: str
) -> None:
    """
    Gera diagramas técnicos em background.

    TODO: Implementar geração real de diagramas
    """
    try:
        logger.info(f"Generating diagrams for document {document_id}")

        # Validar NBR 5410 se solicitado
        if diagram_request.validate_nbr5410:
            # TODO: Implementar validações reais
            logger.info("Validating NBR 5410 compliance")

        # Simular processamento
        import asyncio
        await asyncio.sleep(3)

        # Atualizar status
        if document_id in _documents_storage:
            _documents_storage[document_id].status = DocumentStatus.COMPLETED
            _documents_storage[document_id].completed_at = datetime.utcnow()
            _documents_storage[document_id].file_url = (
                f"https://s3.amazonaws.com/haas-docs/{document_id}.pdf"
                "?signature=mock"
            )
            _documents_storage[document_id].file_size_bytes = 1048576  # 1MB

        logger.info(f"Diagrams {document_id} generated successfully")

    except Exception as exc:
        logger.exception(f"Error generating diagrams {document_id}")
        if document_id in _documents_storage:
            _documents_storage[document_id].status = DocumentStatus.FAILED
            _documents_storage[document_id].metadata["error"] = str(exc)


# ==================== ENDPOINTS ====================

@router.post(
    "/memorial",
    response_model=DocumentResponse,
    status_code=202,
    summary="Gerar memorial descritivo",
    description="""
    Gera memorial descritivo de projeto solar fotovoltaico.

    **Conteúdo do memorial:**
    - Dados do cliente e localização
    - Descrição do sistema (equipamentos, potência)
    - Estimativa de geração
    - Normas aplicáveis (ABNT, NR-10)
    - Requisitos da concessionária
    - Especificações técnicas dos equipamentos

    **Formato:** PDF com template profissional

    **Processamento:** Assíncrono (2-3 minutos)

    Use GET /documents/{document_id} para verificar status e obter URL.
    """
)
async def generate_memorial(
    project_data: ProjectData,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> DocumentResponse:
    """
    Gera memorial descritivo do projeto solar.

    Returns:
        DocumentResponse com document_id para acompanhamento
    """
    document_id = f"doc_{uuid.uuid4().hex[:8]}"

    # Criar registro inicial
    document_detail = DocumentDetail(
        document_id=document_id,
        document_type=DocumentType.MEMORIAL,
        status=DocumentStatus.PENDING,
        project_name=project_data.project_name,
        client_name=project_data.client_name,
        created_at=datetime.utcnow(),
        created_by=current_user.email,
        metadata={
            "total_power_kwp": project_data.total_power_kwp,
            "location": project_data.location.city,
            "distributor": project_data.location.distributor
        }
    )

    _documents_storage[document_id] = document_detail

    # Agendar geração em background
    background_tasks.add_task(
        _generate_memorial_pdf,
        document_id=document_id,
        project_data=project_data,
        user_email=current_user.email
    )

    logger.info(
        f"Memorial generation started: {document_id} - "
        f"{project_data.project_name}"
    )

    return DocumentResponse(
        document_id=document_id,
        document_type=DocumentType.MEMORIAL,
        status=DocumentStatus.PROCESSING,
        message=(
            "Memorial descritivo em processamento. "
            f"Use GET /documents/{document_id} para verificar status."
        ),
        created_at=datetime.utcnow(),
        estimated_completion=datetime.utcnow() + timedelta(minutes=2)
    )


@router.get(
    "/{document_id}",
    response_model=DocumentDetail,
    summary="Buscar documento",
    description="""
    Busca documento por ID e retorna URL assinada para download.

    **URL assinada:**
    - Válida por 1 hora
    - Acesso direto ao arquivo no S3
    - Regenerar chamando este endpoint novamente

    **Status possíveis:**
    - `pending`: Aguardando processamento
    - `processing`: Em geração
    - `completed`: Pronto para download (file_url disponível)
    - `failed`: Erro na geração
    """
)
async def get_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> DocumentDetail:
    """
    Busca documento por ID.

    Args:
        document_id: ID único do documento

    Returns:
        DocumentDetail com URL assinada se completo

    Raises:
        HTTPException 404: Documento não encontrado
    """
    if document_id not in _documents_storage:
        raise HTTPException(
            status_code=404,
            detail=f"Documento {document_id} não encontrado"
        )

    document = _documents_storage[document_id]

    # TODO: Regenerar URL assinada S3 se necessário
    # Se documento completo e URL expirou, gerar nova

    logger.info(
        f"Document retrieved: {document_id} - Status: {document.status}"
    )

    return document


@router.post(
    "/diagrams",
    response_model=DocumentResponse,
    status_code=202,
    summary="Gerar diagramas técnicos",
    description="""
    Gera diagramas técnicos do sistema solar fotovoltaico.

    **Tipos de diagramas:**
    - `unifilar`: Diagrama unifilar elétrico
    - `layout`: Layout de arranjo dos módulos
    - `both`: Ambos os diagramas

    **Validações automáticas:**
    - NBR 5410 (Instalações elétricas de baixa tensão)
    - NR-10 (Segurança em instalações e serviços em eletricidade)
    - Dimensionamento de cabos
    - Dispositivos de proteção

    **Formato:** PDF com diagramas técnicos profissionais

    **Processamento:** Assíncrono (3-4 minutos)
    """
)
async def generate_diagrams(
    diagram_request: DiagramRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> DocumentResponse:
    """
    Gera diagramas técnicos do sistema.

    Args:
        diagram_request: Dados do projeto e configuração do sistema

    Returns:
        DocumentResponse com document_id para acompanhamento
    """
    document_id = f"doc_{uuid.uuid4().hex[:8]}"

    # Determinar tipo de documento
    if DiagramType.BOTH in diagram_request.diagram_types:
        doc_type = DocumentType.DIAGRAM_LAYOUT
    elif DiagramType.UNIFILAR in diagram_request.diagram_types:
        doc_type = DocumentType.DIAGRAM_UNIFILAR
    else:
        doc_type = DocumentType.DIAGRAM_LAYOUT

    # Criar registro inicial
    document_detail = DocumentDetail(
        document_id=document_id,
        document_type=doc_type,
        status=DocumentStatus.PENDING,
        project_name=diagram_request.project_data.project_name,
        client_name=diagram_request.project_data.client_name,
        created_at=datetime.utcnow(),
        created_by=current_user.email,
        metadata={
            "diagram_types": [
                dt.value for dt in diagram_request.diagram_types
            ],
            "validate_nbr5410": diagram_request.validate_nbr5410,
            "total_power_kwp": diagram_request.project_data.total_power_kwp
        }
    )

    _documents_storage[document_id] = document_detail

    # Agendar geração em background
    background_tasks.add_task(
        _generate_diagrams_pdf,
        document_id=document_id,
        diagram_request=diagram_request,
        user_email=current_user.email
    )

    logger.info(
        f"Diagram generation started: {document_id} - "
        f"Types: {diagram_request.diagram_types}"
    )

    return DocumentResponse(
        document_id=document_id,
        document_type=doc_type,
        status=DocumentStatus.PROCESSING,
        message=(
            "Diagramas técnicos em processamento. "
            f"Use GET /documents/{document_id} para verificar status."
        ),
        created_at=datetime.utcnow(),
        estimated_completion=datetime.utcnow() + timedelta(minutes=3)
    )


@router.get(
    "/",
    summary="Listar documentos do usuário",
    description="Lista todos os documentos gerados pelo usuário atual."
)
async def list_user_documents(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> List[DocumentDetail]:
    """
    Lista documentos do usuário.

    Returns:
        Lista de DocumentDetail
    """
    user_documents = [
        doc for doc in _documents_storage.values()
        if doc.created_by == current_user.email
    ]

    logger.info(
        f"Listing {len(user_documents)} documents for "
        f"{current_user.email}"
    )

    return user_documents
