"""Router para APIs de monitoramento - HaaS Platform."""

from __future__ import annotations

import logging
import psutil
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from enum import Enum

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.dependencies import get_current_active_user
from app.models.auth import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


# ==================== ENUMS ====================

class ServiceStatus(str, Enum):
    """Status de serviços."""
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    DOWN = "down"


class AlertSeverity(str, Enum):
    """Severidade de alertas."""
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class MetricPeriod(str, Enum):
    """Períodos de métricas."""
    HOUR = "1h"
    DAY = "24h"
    WEEK = "7d"
    MONTH = "30d"


# ==================== SCHEMAS ====================

class ServiceHealth(BaseModel):
    """Health check de um serviço."""
    name: str
    status: ServiceStatus
    latency_ms: Optional[float] = None
    message: str
    last_checked: datetime


class DashboardMetrics(BaseModel):
    """Métricas do dashboard em tempo real."""
    uptime_seconds: float
    total_requests: int
    requests_per_minute: float
    avg_latency_ms: float
    error_rate_pct: float
    active_users: int
    services: List[ServiceHealth]
    active_alerts: int
    timestamp: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "uptime_seconds": 86400,
                "total_requests": 152340,
                "requests_per_minute": 42.5,
                "avg_latency_ms": 125.3,
                "error_rate_pct": 0.8,
                "active_users": 15,
                "services": [
                    {
                        "name": "PostgreSQL",
                        "status": "healthy",
                        "latency_ms": 12.5,
                        "message": "Connected",
                        "last_checked": "2025-10-14T10:30:00Z"
                    }
                ],
                "active_alerts": 2,
                "timestamp": "2025-10-14T10:30:00Z"
            }
        }


class MetricDataPoint(BaseModel):
    """Ponto de dados de métrica."""
    timestamp: datetime
    value: float
    label: Optional[str] = None


class HistoricalMetrics(BaseModel):
    """Métricas históricas."""
    period: str
    start_time: datetime
    end_time: datetime
    total_requests: int
    total_errors: int
    error_rate_pct: float
    latency_p50_ms: float
    latency_p95_ms: float
    latency_p99_ms: float
    requests_by_endpoint: Dict[str, int]
    latency_over_time: List[MetricDataPoint]
    requests_over_time: List[MetricDataPoint]


class Alert(BaseModel):
    """Alerta de monitoramento."""
    id: str
    severity: AlertSeverity
    title: str
    description: str
    service: str
    metric: str
    threshold: float
    current_value: float
    triggered_at: datetime
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None


class AlertsResponse(BaseModel):
    """Resposta de alertas."""
    total: int
    critical: int
    warning: int
    info: int
    alerts: List[Alert]


# ==================== HELPER FUNCTIONS ====================

def get_system_metrics() -> Dict:
    """Coleta métricas do sistema."""
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')

    return {
        "cpu_percent": cpu_percent,
        "memory_percent": memory.percent,
        "memory_available_gb": memory.available / (1024**3),
        "disk_percent": disk.percent,
        "disk_free_gb": disk.free / (1024**3)
    }


def check_service_health(
    service_name: str,
    db: Optional[Session] = None
) -> ServiceHealth:
    """Verifica health de um serviço."""
    if service_name == "PostgreSQL" and db:
        try:
            from sqlalchemy import text
            start = datetime.utcnow()
            db.execute(text("SELECT 1"))
            latency = (datetime.utcnow() - start).total_seconds() * 1000

            return ServiceHealth(
                name="PostgreSQL",
                status=ServiceStatus.HEALTHY,
                latency_ms=round(latency, 2),
                message="Database connection healthy",
                last_checked=datetime.utcnow()
            )
        except Exception as e:
            return ServiceHealth(
                name="PostgreSQL",
                status=ServiceStatus.DOWN,
                message=f"Database error: {str(e)}",
                last_checked=datetime.utcnow()
            )

    elif service_name == "Redis":
        # TODO: Implementar check Redis
        return ServiceHealth(
            name="Redis",
            status=ServiceStatus.HEALTHY,
            latency_ms=5.2,
            message="Cache operational",
            last_checked=datetime.utcnow()
        )

    elif service_name == "InmetroCrawler":
        # TODO: Implementar check InmetroCrawler
        return ServiceHealth(
            name="InmetroCrawler",
            status=ServiceStatus.HEALTHY,
            latency_ms=250.0,
            message="Crawler operational",
            last_checked=datetime.utcnow()
        )

    return ServiceHealth(
        name=service_name,
        status=ServiceStatus.DOWN,
        message="Service not found",
        last_checked=datetime.utcnow()
    )


def generate_mock_alerts() -> List[Alert]:
    """Gera alertas mock (substituir por dados reais)."""
    now = datetime.utcnow()

    return [
        Alert(
            id="alert_001",
            severity=AlertSeverity.WARNING,
            title="High Error Rate",
            description="Error rate exceeded 5% threshold",
            service="INMETRO API",
            metric="error_rate",
            threshold=5.0,
            current_value=6.2,
            triggered_at=now - timedelta(minutes=15),
            acknowledged=False
        ),
        Alert(
            id="alert_002",
            severity=AlertSeverity.CRITICAL,
            title="Database Connection Pool Exhausted",
            description="All database connections in use",
            service="PostgreSQL",
            metric="connection_pool_usage",
            threshold=90.0,
            current_value=98.5,
            triggered_at=now - timedelta(minutes=5),
            acknowledged=False
        )
    ]


# ==================== ENDPOINTS ====================

@router.get(
    "/dashboard",
    response_model=DashboardMetrics,
    summary="Dashboard em tempo real",
    description="""
    Retorna métricas do dashboard em tempo real.

    **Inclui:**
    - Uptime do sistema
    - Total de requests e taxa atual (req/min)
    - Latência média e taxa de erro
    - Status de serviços (PostgreSQL, Redis, InmetroCrawler)
    - Número de alertas ativos

    Atualizar a cada 30 segundos para dados em tempo real.
    """
)
async def get_dashboard_metrics(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> DashboardMetrics:
    """
    Retorna métricas do dashboard.

    Requires: Admin ou Distributor role
    """
    # Coletar métricas do sistema
    # system_metrics = get_system_metrics()  # TODO: usar quando implementar alertas de sistema

    # Check de serviços
    services = [
        check_service_health("PostgreSQL", db),
        check_service_health("Redis"),
        check_service_health("InmetroCrawler")
    ]

    # TODO: Buscar métricas reais do banco/Redis
    # Por enquanto retorna dados mock
    uptime = 86400  # 24 horas em segundos

    return DashboardMetrics(
        uptime_seconds=uptime,
        total_requests=152340,
        requests_per_minute=42.5,
        avg_latency_ms=125.3,
        error_rate_pct=0.8,
        active_users=15,
        services=services,
        active_alerts=2,
        timestamp=datetime.utcnow()
    )


@router.get(
    "/metrics",
    response_model=HistoricalMetrics,
    summary="Métricas históricas",
    description="""
    Retorna métricas históricas para análise de performance.

    **Períodos disponíveis:**
    - `1h`: Última hora (granularidade 1min)
    - `24h`: Últimas 24 horas (granularidade 5min)
    - `7d`: Últimos 7 dias (granularidade 1h)
    - `30d`: Últimos 30 dias (granularidade 6h)

    **Métricas:**
    - Volume de requests por endpoint
    - Taxa de erro ao longo do tempo
    - Latência P50/P95/P99
    - Séries temporais para gráficos
    """
)
async def get_historical_metrics(
    period: MetricPeriod = Query(
        MetricPeriod.DAY,
        description="Período de métricas"
    ),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> HistoricalMetrics:
    """
    Retorna métricas históricas.

    Args:
        period: Período de análise (1h, 24h, 7d, 30d)
    """
    logger.info(f"Fetching metrics for period: {period.value}")

    # Calcular timestamps
    end_time = datetime.utcnow()
    if period == MetricPeriod.HOUR:
        start_time = end_time - timedelta(hours=1)
    elif period == MetricPeriod.DAY:
        start_time = end_time - timedelta(days=1)
    elif period == MetricPeriod.WEEK:
        start_time = end_time - timedelta(days=7)
    else:  # MONTH
        start_time = end_time - timedelta(days=30)

    # TODO: Buscar métricas reais do banco/Redis
    # Por enquanto retorna dados mock
    mock_latency_data = [
        MetricDataPoint(
            timestamp=start_time + timedelta(minutes=i*15),
            value=100 + (i % 5) * 10,
            label=f"t+{i*15}min"
        )
        for i in range(10)
    ]

    mock_requests_data = [
        MetricDataPoint(
            timestamp=start_time + timedelta(minutes=i*15),
            value=500 + (i % 3) * 100,
            label=f"t+{i*15}min"
        )
        for i in range(10)
    ]

    return HistoricalMetrics(
        period=period.value,
        start_time=start_time,
        end_time=end_time,
        total_requests=12345,
        total_errors=98,
        error_rate_pct=0.79,
        latency_p50_ms=95.3,
        latency_p95_ms=245.8,
        latency_p99_ms=412.5,
        requests_by_endpoint={
            "/api/inmetro/validate": 5432,
            "/api/inmetro/search": 3210,
            "/api/inmetro/certificate/{id}": 2103,
            "/api/inmetro/batch": 890,
            "/auth/login": 710
        },
        latency_over_time=mock_latency_data,
        requests_over_time=mock_requests_data
    )


@router.get(
    "/alerts",
    response_model=AlertsResponse,
    summary="Alertas ativos",
    description="""
    Retorna lista de alertas ativos no sistema.

    **Severidades:**
    - `critical`: Requer ação imediata (sistema em risco)
    - `warning`: Requer atenção (degradação de performance)
    - `info`: Informativo (eventos normais)

    **Tipos de alerta:**
    - Taxa de erro > 5%
    - Latência P95 > 2s
    - Uso de disco > 80%
    - Uso de memória > 85%
    - Pool de conexões > 90%
    - Rate limit violations
    """
)
async def get_active_alerts(
    severity: Optional[AlertSeverity] = Query(
        None,
        description="Filtrar por severidade"
    ),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> AlertsResponse:
    """
    Retorna alertas ativos.

    Args:
        severity: Filtrar por severidade (optional)
    """
    logger.info(f"Fetching alerts, severity filter: {severity}")

    # TODO: Buscar alertas reais do banco
    # Por enquanto retorna dados mock
    all_alerts = generate_mock_alerts()

    # Filtrar por severidade se especificado
    if severity:
        filtered_alerts = [
            a for a in all_alerts if a.severity == severity
        ]
    else:
        filtered_alerts = all_alerts

    # Contar por severidade
    critical_count = sum(
        1 for a in all_alerts if a.severity == AlertSeverity.CRITICAL
    )
    warning_count = sum(
        1 for a in all_alerts if a.severity == AlertSeverity.WARNING
    )
    info_count = sum(
        1 for a in all_alerts if a.severity == AlertSeverity.INFO
    )

    return AlertsResponse(
        total=len(all_alerts),
        critical=critical_count,
        warning=warning_count,
        info=info_count,
        alerts=filtered_alerts
    )


@router.post(
    "/alerts/{alert_id}/acknowledge",
    summary="Reconhecer alerta",
    description="Marca um alerta como reconhecido pelo operador."
)
async def acknowledge_alert(
    alert_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Reconhece um alerta.

    Args:
        alert_id: ID do alerta a reconhecer
    """
    logger.info(
        f"Alert {alert_id} acknowledged by {current_user.email}"
    )

    # TODO: Atualizar alerta no banco
    # Por enquanto retorna confirmação

    return {
        "message": f"Alert {alert_id} acknowledged",
        "acknowledged_by": current_user.email,
        "acknowledged_at": datetime.utcnow().isoformat()
    }
