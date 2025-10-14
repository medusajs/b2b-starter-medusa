from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class DistributorBase(BaseModel):
    name: str
    code: str  # CPFL, ENEL_SP, CEMIG, etc.
    region: str
    status: str = "active"


class DistributorCreate(DistributorBase):
    pass


class Distributor(DistributorBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConnectionRequest(BaseModel):
    distributor_id: int
    connection_type: str  # residential, commercial, industrial
    voltage_level: str
    power_requirement: float  # in kW
    location: Dict[str, Any]  # GeoJSON or coordinates
    documents: Optional[List[str]] = []  # List of document URLs/IDs


class ConnectionResponse(BaseModel):
    request_id: str
    status: str  # pending, approved, rejected, in_progress
    estimated_cost: Optional[float]
    estimated_time_days: Optional[int]
    requirements: Optional[List[str]]
    rejection_reason: Optional[str]
    created_at: datetime
    updated_at: datetime


class WebhookEvent(BaseModel):
    event_type: str  # connection_approved, connection_rejected, status_update
    request_id: str
    distributor_id: int
    data: Dict[str, Any]
    timestamp: datetime
