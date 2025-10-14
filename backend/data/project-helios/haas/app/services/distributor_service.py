from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from app.models.distributors import (
    Distributor, ConnectionRequest, ConnectionResponse
)


# Mock distributor database - replace with real database later
mock_distributors: List[Dict[str, Any]] = [
    {
        "id": 1,
        "name": "CPFL Energia",
        "code": "CPFL",
        "region": "São Paulo",
        "status": "active",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "id": 2,
        "name": "Enel São Paulo",
        "code": "ENEL_SP",
        "region": "São Paulo",
        "status": "active",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "id": 3,
        "name": "CEMIG",
        "code": "CEMIG",
        "region": "Minas Gerais",
        "status": "active",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
]


def get_distributors() -> List[Distributor]:
    """Get all available distributors."""
    return [Distributor(**dist) for dist in mock_distributors]


def get_distributor_by_id(distributor_id: int) -> Optional[Distributor]:
    """Get distributor by ID."""
    for dist in mock_distributors:
        if dist["id"] == distributor_id:
            return Distributor(**dist)
    return None


def get_distributor_by_code(code: str) -> Optional[Distributor]:
    """Get distributor by code."""
    for dist in mock_distributors:
        if dist["code"] == code:
            return Distributor(**dist)
    return None


def submit_connection_request(
    distributor_id: int,
    request: ConnectionRequest
) -> ConnectionResponse:
    """Submit a connection request to a distributor."""
    distributor = get_distributor_by_id(distributor_id)
    if not distributor:
        raise ValueError(f"Distributor with ID {distributor_id} not found")

    # Mock response based on distributor and request type
    request_id = str(uuid.uuid4())

    # Simulate different processing times and costs based on distributor
    if distributor.code == "CPFL":
        estimated_cost = request.power_requirement * 150  # R$ 150/kW
        estimated_days = 15
    elif distributor.code == "ENEL_SP":
        estimated_cost = request.power_requirement * 180  # R$ 180/kW
        estimated_days = 20
    elif distributor.code == "CEMIG":
        estimated_cost = request.power_requirement * 140  # R$ 140/kW
        estimated_days = 18
    else:
        estimated_cost = request.power_requirement * 160  # Default
        estimated_days = 21

    # Basic validation requirements
    requirements = [
        "Comprovante de propriedade ou contrato de locação",
        "Projeto elétrico aprovado",
        "ART do responsável técnico",
        "Comprovante de pagamento da taxa de ligação"
    ]

    response = ConnectionResponse(
        request_id=request_id,
        status="pending",
        estimated_cost=estimated_cost,
        estimated_time_days=estimated_days,
        requirements=requirements,
        rejection_reason=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

    # Trigger webhook for connection submitted event
    try:
        from app.services.webhook_service import trigger_webhook_event
        import asyncio

        # Run webhook trigger in background (don't await)
        status_change = {
            "status": "pending",
            "message": "Connection request submitted"
        }
        asyncio.create_task(
            trigger_webhook_event(
                event_type="connection_submitted",
                request_id=request_id,
                distributor_id=distributor_id,
                connection_request=request.dict(),
                status_change=status_change
            )
        )
    except Exception as e:
        # Log webhook error but don't fail the request
        print(f"Webhook trigger failed: {e}")

    return response


def get_connection_status(request_id: str) -> Optional[ConnectionResponse]:
    """Get connection request status by ID."""
    # Mock implementation - in real system, this would query database
    # For now, return a mock response
    return ConnectionResponse(
        request_id=request_id,
        status="in_progress",
        estimated_cost=15000.0,
        estimated_time_days=15,
        requirements=["Documentação em análise"],
        rejection_reason=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )


def validate_connection_request(request: ConnectionRequest) -> Dict[str, Any]:
    """Validate connection request data."""
    errors = []

    if request.power_requirement <= 0:
        errors.append("Power requirement must be greater than 0")

    if not request.location:
        errors.append("Location information is required")

    connection_types = ["residential", "commercial", "industrial"]
    if request.connection_type not in connection_types:
        errors.append("Invalid connection type")

    return {
        "valid": len(errors) == 0,
        "errors": errors
    }

