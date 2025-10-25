from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from app.database import get_db
from app.database.models import Distributor as DBDistributor, ConnectionRequest as DBConnectionRequest
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


def get_distributors(db: Session) -> List[Distributor]:
    """Get all available distributors."""
    db_distributors = db.query(DBDistributor).filter(DBDistributor.status == "active").all()
    return [Distributor(
        id=d.id,
        name=d.name,
        code=d.code,
        region=d.region,
        status=d.status,
        contact_email=d.contact_email,
        contact_phone=d.contact_phone,
        service_area=d.service_area,
        created_at=d.created_at,
        updated_at=d.updated_at
    ) for d in db_distributors]


def get_distributor_by_id(db: Session, distributor_id: int) -> Optional[Distributor]:
    """Get distributor by ID."""
    db_distributor = db.query(DBDistributor).filter(DBDistributor.id == distributor_id).first()
    if not db_distributor:
        return None
    return Distributor(
        id=db_distributor.id,
        name=db_distributor.name,
        code=db_distributor.code,
        region=db_distributor.region,
        status=db_distributor.status,
        contact_email=db_distributor.contact_email,
        contact_phone=db_distributor.contact_phone,
        service_area=db_distributor.service_area,
        created_at=db_distributor.created_at,
        updated_at=db_distributor.updated_at
    )


def get_distributor_by_code(db: Session, code: str) -> Optional[Distributor]:
    """Get distributor by code."""
    db_distributor = db.query(DBDistributor).filter(DBDistributor.code == code).first()
    if not db_distributor:
        return None
    return Distributor(
        id=db_distributor.id,
        name=db_distributor.name,
        code=db_distributor.code,
        region=db_distributor.region,
        status=db_distributor.status,
        contact_email=db_distributor.contact_email,
        contact_phone=db_distributor.contact_phone,
        service_area=db_distributor.service_area,
        created_at=db_distributor.created_at,
        updated_at=db_distributor.updated_at
    )


def submit_connection_request(
    db: Session,
    distributor_id: int,
    request: ConnectionRequest,
    user_id: Optional[int] = None
) -> ConnectionResponse:
    """Submit a connection request to a distributor."""
    distributor = get_distributor_by_id(db, distributor_id)
    if not distributor:
        raise ValueError(f"Distributor with ID {distributor_id} not found")

    # Validate INMETRO compliance if equipment data is provided
    inmetro_validation_result = None
    if request.equipment:
        try:
            from app.services.inmetro_validation_service import (
                inmetro_validator
            )
            inmetro_validation_result = (
                inmetro_validator.validate_equipment_batch(
                    request.equipment, request
                )
            )
            if not inmetro_validation_result["valid"]:
                # Create response with validation errors
                return ConnectionResponse(
                    request_id=str(uuid.uuid4()),
                    status="rejected",
                    estimated_cost=None,
                    estimated_time_days=None,
                    requirements=[],
                    rejection_reason=(
                        "INMETRO validation failed: " +
                        "; ".join([
                            f"Equipment {r['equipment_index']}: "
                            f"{', '.join(r.get('errors', []))}"
                            for r in inmetro_validation_result["results"]
                            if not r["valid"]
                        ])
                    ),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
        except Exception as e:
            # Log validation error but allow request to proceed
            print(f"INMETRO validation error: {e}")

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

    # Add INMETRO-specific requirements if equipment was validated
    if inmetro_validation_result and inmetro_validation_result["valid"]:
        requirements.extend([
            "Certificado INMETRO válido para todos os equipamentos",
            "Laudo de ensaio dos equipamentos",
            "Comprovante de conformidade com Portaria 140/2022"
        ])

    # Create database record
    db_connection_request = DBConnectionRequest(
        request_id=request_id,
        distributor_id=distributor_id,
        user_id=user_id,
        connection_type=request.connection_type,
        voltage_level=request.voltage_level,
        power_requirement=request.power_requirement,
        location=request.location,
        equipment=request.equipment,
        documents=request.documents,
        status="pending",
        estimated_cost=estimated_cost,
        estimated_time_days=estimated_days,
        requirements=requirements,
        inmetro_validation_result=inmetro_validation_result,
        inmetro_valid=inmetro_validation_result["valid"] if inmetro_validation_result else False
    )

    db.add(db_connection_request)
    db.commit()
    db.refresh(db_connection_request)

    response = ConnectionResponse(
        request_id=request_id,
        status="pending",
        estimated_cost=estimated_cost,
        estimated_time_days=estimated_days,
        requirements=requirements,
        rejection_reason=None,
        created_at=db_connection_request.created_at,
        updated_at=db_connection_request.updated_at
    )

    # Trigger webhook for connection submitted event
    try:
        from app.services.webhook_service import trigger_webhook_event
        import asyncio

        # Run webhook trigger in background (don't await)
        status_change = {
            "status": "pending",
            "message": "Connection request submitted",
            "inmetro_validation": inmetro_validation_result
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


def get_connection_status(db: Session, request_id: str) -> Optional[ConnectionResponse]:
    """Get connection request status by ID."""
    db_request = db.query(DBConnectionRequest).filter(DBConnectionRequest.request_id == request_id).first()
    if not db_request:
        return None

    return ConnectionResponse(
        request_id=db_request.request_id,
        status=db_request.status,
        estimated_cost=db_request.estimated_cost,
        estimated_time_days=db_request.estimated_time_days,
        requirements=db_request.requirements or [],
        rejection_reason=db_request.rejection_reason,
        created_at=db_request.created_at,
        updated_at=db_request.updated_at
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

