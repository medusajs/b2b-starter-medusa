from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.models.distributors import (
    Distributor, ConnectionRequest, ConnectionResponse
)
from app.models.auth import User
from app.services.distributor_service import (
    get_distributors, get_distributor_by_id, submit_connection_request,
    get_connection_status, validate_connection_request
)
from app.auth.dependencies import get_current_active_user

router = APIRouter()


@router.get("/", response_model=List[Distributor])
async def list_distributors(
    current_user: User = Depends(get_current_active_user)
):
    """List all available distributors."""
    return get_distributors()


@router.get("/{distributor_id}", response_model=Distributor)
async def get_distributor(
    distributor_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """Get distributor by ID."""
    distributor = get_distributor_by_id(distributor_id)
    if not distributor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Distributor not found"
        )
    return distributor


@router.post("/{distributor_id}/connection", response_model=ConnectionResponse)
async def submit_connection(
    distributor_id: int,
    request: ConnectionRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Submit a connection request to a distributor."""
    # Validate the request
    validation = validate_connection_request(request)
    if not validation["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation errors: {', '.join(validation['errors'])}"
        )

    try:
        response = submit_connection_request(distributor_id, request)
        return response
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.get("/connection/{request_id}", response_model=ConnectionResponse)
async def get_connection_status_endpoint(
    request_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get connection request status."""
    status_response = get_connection_status(request_id)
    if not status_response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection request not found"
        )
    return status_response


@router.get("/validate")
async def validate_endpoint(
    request: ConnectionRequest,
    current_user: User = Depends(get_current_active_user)
):
    """Validate a connection request without submitting it."""
    return validate_connection_request(request)
