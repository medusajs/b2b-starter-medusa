from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime


class WebhookEvent(BaseModel):
    event_type: str  # connection_submitted, connection_approved, etc.
    request_id: str
    distributor_id: int
    distributor_code: str
    data: Dict[str, Any]
    timestamp: datetime
    webhook_url: Optional[str] = None


class WebhookConfig(BaseModel):
    url: str
    secret: Optional[str] = None
    events: list[str] = [
        "connection_submitted",
        "connection_approved",
        "connection_rejected"
    ]
    headers: Optional[Dict[str, str]] = None


class WebhookDelivery(BaseModel):
    webhook_id: str
    event: WebhookEvent
    status: str  # pending, delivered, failed
    attempts: int = 0
    last_attempt: Optional[datetime] = None
    next_attempt: Optional[datetime] = None
    response_status: Optional[int] = None
    error_message: Optional[str] = None


class WebhookPayload(BaseModel):
    """Standard webhook payload structure"""
    event_type: str
    request_id: str
    distributor: Dict[str, Any]
    connection_request: Optional[Dict[str, Any]] = None
    status_change: Optional[Dict[str, Any]] = None
    timestamp: datetime
    signature: Optional[str] = None  # For webhook verification
