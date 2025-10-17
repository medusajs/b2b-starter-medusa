"""
🏦 Rotas API para Análise Financeira BACEN em Tempo Real
Endpoints para taxas, KPIs por persona e leaderboards de equipamentos
"""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

router = APIRouter(prefix="/bacen", tags=["BACEN Realtime"])


# ============================================================================
# ENUMS E MODELOS
# ============================================================================


class PersonaID(str, Enum):
    """Identificadores das personas"""

    RESIDENCIAL_B1_PADRAO = "residencial_b1_padrao"
    RESIDENCIAL_B1_TARIFA_SOCIAL = "residencial_b1_tarifa_social"
    COMERCIAL_B3_PME = "comercial_b3_pme"
    INDUSTRIAL_A4_A3_MEDIA_TENSAO = "industrial_a4_a3_media_tensao"
    RURAL_B2_AGRO = "rural_b2_agro"
    MULTISITES_CONDOMINIO_GC = "multisites_condominio_gc"


class ClasseANEEL(str, Enum):
    """Classes ANEEL"""

    B1 = "B1"  # Residencial
    B2 = "B2"  # Rural
    B3 = "B3"  # Comercial
    A4 = "A4"  # Industrial 2,3-25 kV
    A3 = "A3"  # Industrial 30-44 kV


class RegimeGD(str, Enum):
    """Regime de Geração Distribuída"""

    GD_I = "GD I"
    GD_II = "GD II"
    GD_III = "GD III"
    GC = "Geração Compartilhada"
    ASSINATURA = "Assinatura/PPA"
    ACL = "ACL"


class TecnologiaPainel(str, Enum):
    """Tecnologias de painéis solares"""

    MONO_PERC = "Mono PERC"
    N_TYPE_TOPCON = "N-Type TOPCon"
    BIFACIAL = "Bifacial"
    HJT = "HJT"
    IBC = "IBC"


# ============================================================================
# MODELOS DE REQUEST
# ============================================================================


class PersonaFinancialRequest(BaseModel):
    """Request para cálculo de KPIs financeiros por persona"""

    persona_id: PersonaID
    classe: ClasseANEEL
    regime_gd: RegimeGD
    consumo_mensal_kwh: float = Field(gt=0, description="Consumo mensal em kWh")
    tarifa_kwh: float = Field(gt=0, description="Tarifa total R$/kWh")
    hsp_diario: float = Field(gt=0, le=12, description="Horas de sol pleno/dia")
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    oversizing: Optional[float] = Field(1.3, ge=1.0, le=2.0, description="Fator de oversizing")
    modalidade_financiamento: Optional[str] = None
    prazo_meses: Optional[int] = Field(None, ge=12, le=240)


class LeaderboardRequest(BaseModel):
    """Request para leaderboard de equipamentos"""

    persona_id: PersonaID
    classe: ClasseANEEL
    hsp_diario: float = Field(gt=0, le=12)
    tarifa_kwh: float = Field(gt=0)
    tecnologias: Optional[list[TecnologiaPainel]] = None
    fabricantes: Optional[list[str]] = None
    potencia_min: Optional[int] = Field(None, ge=100)
    potencia_max: Optional[int] = Field(None, le=1000)
    orcamento_max: Optional[float] = None


# ============================================================================
# MODELOS DE RESPONSE
# ============================================================================


class BCBRealtimeRate(BaseModel):
    """Taxa de juros em tempo real do BACEN"""

    modalidade: str
    segmento: str
    taxa_mensal: float
    taxa_anual: float
    spread: float
    numero_operacoes: int
    valor_medio: float
    timestamp: datetime
    fonte: str


class BCBMarketSnapshot(BaseModel):
    """Snapshot do mercado financeiro"""

    timestamp: datetime
    selic: float
    ipca: float
    igpm: float
    taxas_pf: list[BCBRealtimeRate]
    taxas_pj: list[BCBRealtimeRate]
    valid_until: datetime


class PersonaROI(BaseModel):
    """KPIs de ROI"""

    payback_simples: float
    payback_descontado: float
    tir: float
    vpl: float
    lcoe: float


class PersonaEconomia(BaseModel):
    """Economia projetada"""

    mensal: float
    anual: float
    total_25_anos: float
    economia_vs_tarifa: float


class PersonaFinanciamento(BaseModel):
    """Detalhes de financiamento"""

    modalidade: str
    taxa_mensal: float
    prazo_meses: int
    parcela_mensal: float
    juros_totais: float
    economia_liquida: float


class PersonaRiscos(BaseModel):
    """Riscos regulatórios"""

    escalonamento_tusd: list[float]
    impacto_escalonamento: float
    sensibilidade_tarifa: dict[str, float]


class PersonaFinancialKPIs(BaseModel):
    """KPIs financeiros completos por persona"""

    persona_id: PersonaID
    classe: ClasseANEEL
    regime_gd: RegimeGD
    investimento_total: float
    consumo_mensal_kwh: float
    tarifa_kwh: float
    oversizing: float
    roi: PersonaROI
    financiamento: Optional[PersonaFinanciamento]
    economia: PersonaEconomia
    riscos: PersonaRiscos
    timestamp: datetime


class EquipmentKPIs(BaseModel):
    """KPIs financeiros de equipamento"""

    lcoe_normalizado: float
    custo_instalado: float
    payback_equipamento: float
    roi_25_anos: float


class EquipmentScores(BaseModel):
    """Scores compostos de equipamento"""

    tecnico: float
    financeiro: float
    disponibilidade: float
    geral: float


class EquipmentFinancialScore(BaseModel):
    """Score financeiro completo de equipamento"""

    fabricante: str
    modelo: str
    tecnologia: TecnologiaPainel
    potencia_wp: int
    tier: int
    preco_unitario: float
    preco_wp: float
    disponibilidade: str
    distribuidores: list[str]
    eficiencia: float
    degradacao_anual: float
    garantia_potencia: int
    garantia_fabricacao: int
    kpis: EquipmentKPIs
    scores: EquipmentScores
    timestamp: datetime


class LeaderboardEstatisticas(BaseModel):
    """Estatísticas do leaderboard"""

    lcoe_media: float
    lcoe_menor: float
    lcoe_maior: float
    roi_medio: float
    payback_medio: float


class LeaderboardByPersona(BaseModel):
    """Leaderboard de equipamentos por persona"""

    persona_id: PersonaID
    classe: ClasseANEEL
    filtros: dict[str, Any]
    top_por_lcoe: list[EquipmentFinancialScore]
    top_por_roi: list[EquipmentFinancialScore]
    top_por_payback: list[EquipmentFinancialScore]
    top_por_score: list[EquipmentFinancialScore]
    estatisticas: LeaderboardEstatisticas
    timestamp: datetime


# ============================================================================
# ENDPOINTS
# ============================================================================


@router.get("/market-snapshot", response_model=BCBMarketSnapshot)
async def get_market_snapshot():
    """
    📊 Retorna snapshot completo do mercado financeiro

    Inclui:
    - Taxa SELIC atual
    - IPCA e IGP-M acumulados 12m
    - Taxas de crédito PF e PJ em tempo real
    - Timestamp e validade do cache
    """
    # TODO: Integrar com BCBRealtimeService real
    # Por ora, retorna dados mockados
    return {
        "timestamp": datetime.now(),
        "selic": 11.75,
        "ipca": 4.62,
        "igpm": 3.21,
        "taxas_pf": [
            {
                "modalidade": "CDC",
                "segmento": "PF",
                "taxa_mensal": 3.89,
                "taxa_anual": 58.4,
                "spread": 3.77,
                "numero_operacoes": 1_245_000,
                "valor_medio": 8_500.00,
                "timestamp": datetime.now(),
                "fonte": "BCB_SGS",
            },
            {
                "modalidade": "Consignado INSS",
                "segmento": "PF",
                "taxa_mensal": 1.72,
                "taxa_anual": 22.7,
                "spread": 1.60,
                "numero_operacoes": 890_000,
                "valor_medio": 15_200.00,
                "timestamp": datetime.now(),
                "fonte": "BCB_SGS",
            },
        ],
        "taxas_pj": [],
        "valid_until": datetime.now(),
    }


@router.get("/rates/modality/{modalidade}", response_model=BCBRealtimeRate)
async def get_rate_by_modality(
    modalidade: str, segmento: str = Query("PF", regex="^(PF|PJ)$")
):
    """
    💰 Retorna taxa de juros para modalidade específica

    Args:
        modalidade: CDC, Consignado INSS, etc
        segmento: PF ou PJ
    """
    snapshot = await get_market_snapshot()
    rates = snapshot.taxas_pf if segmento == "PF" else snapshot.taxas_pj

    for rate in rates:
        if rate.modalidade == modalidade:
            return rate

    raise HTTPException(status_code=404, detail=f"Taxa não encontrada: {modalidade} ({segmento})")


@router.post("/kpis/persona", response_model=PersonaFinancialKPIs)
async def calculate_persona_kpis(request: PersonaFinancialRequest):
    """
    📈 Calcula KPIs financeiros completos para persona

    Retorna:
    - ROI (Payback, TIR, VPL, LCOE)
    - Economia projetada (mensal, anual, 25 anos)
    - Detalhes de financiamento (se aplicável)
    - Análise de riscos regulatórios
    """
    # TODO: Integrar com PersonaFinancialAnalyzer real
    # Por ora, retorna cálculo simplificado
    return {
        "persona_id": request.persona_id,
        "classe": request.classe,
        "regime_gd": request.regime_gd,
        "investimento_total": request.consumo_mensal_kwh * 12 * 4.5,  # R$/Wp médio
        "consumo_mensal_kwh": request.consumo_mensal_kwh,
        "tarifa_kwh": request.tarifa_kwh,
        "oversizing": request.oversizing,
        "roi": {
            "payback_simples": 4.2,
            "payback_descontado": 5.8,
            "tir": 18.5,
            "vpl": 45_000.00,
            "lcoe": 0.28,
        },
        "financiamento": None,
        "economia": {
            "mensal": 650.00,
            "anual": 7_800.00,
            "total_25_anos": 195_000.00,
            "economia_vs_tarifa": 85.0,
        },
        "riscos": {
            "escalonamento_tusd": [0.151, 0.307, 0.477, 0.631, 0.787, 1.0],
            "impacto_escalonamento": 12_500.00,
            "sensibilidade_tarifa": {"cenario_otimista": 52_000.00, "cenario_pessimista": 38_000.00},
        },
        "timestamp": datetime.now(),
    }


@router.post("/leaderboards/equipment", response_model=LeaderboardByPersona)
async def generate_equipment_leaderboard(request: LeaderboardRequest):
    """
    🏆 Gera leaderboard de equipamentos para persona

    Retorna 4 rankings:
    - Top 10 por menor LCOE
    - Top 10 por maior ROI 25 anos
    - Top 10 por menor Payback
    - Top 10 por maior Score Geral

    Inclui estatísticas do mercado e filtros aplicados
    """
    # TODO: Integrar com EquipmentLeaderboardService real
    # Por ora, retorna dados mockados
    equipment_mock = {
        "fabricante": "Canadian Solar",
        "modelo": "CS7N-665MS",
        "tecnologia": TecnologiaPainel.N_TYPE_TOPCON,
        "potencia_wp": 665,
        "tier": 1,
        "preco_unitario": 1_330.00,
        "preco_wp": 2.0,
        "disponibilidade": "estoque",
        "distribuidores": ["neosolar", "fotus", "fortlev"],
        "eficiencia": 21.5,
        "degradacao_anual": 0.45,
        "garantia_potencia": 30,
        "garantia_fabricacao": 15,
        "kpis": {
            "lcoe_normalizado": 0.24,
            "custo_instalado": 3.6,
            "payback_equipamento": 3.8,
            "roi_25_anos": 425.0,
        },
        "scores": {"tecnico": 92.0, "financeiro": 88.0, "disponibilidade": 60.0, "geral": 85.2},
        "timestamp": datetime.now(),
    }

    return {
        "persona_id": request.persona_id,
        "classe": request.classe,
        "filtros": {
            "tecnologias": request.tecnologias,
            "fabricantes": request.fabricantes,
            "faixa_potencia": (
                {"min": request.potencia_min, "max": request.potencia_max}
                if request.potencia_min or request.potencia_max
                else None
            ),
            "orcamento_max": request.orcamento_max,
        },
        "top_por_lcoe": [equipment_mock],
        "top_por_roi": [equipment_mock],
        "top_por_payback": [equipment_mock],
        "top_por_score": [equipment_mock],
        "estatisticas": {
            "lcoe_media": 0.28,
            "lcoe_menor": 0.24,
            "lcoe_maior": 0.35,
            "roi_medio": 380.0,
            "payback_medio": 4.5,
        },
        "timestamp": datetime.now(),
    }


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "BACEN Realtime API",
        "timestamp": datetime.now(),
        "version": "1.0.0",
    }
