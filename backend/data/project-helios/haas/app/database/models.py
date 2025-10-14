"""Database models for HaaS Platform."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import (
    Integer, String, Float, DateTime, Text, ForeignKey, JSON, Boolean
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from geoalchemy2 import Geometry
from app.database import Base


class Distributor(Base):
    """Database model for distributors."""
    __tablename__ = "distributors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    region: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="active")
    contact_email: Mapped[Optional[str]] = mapped_column(String(255))
    contact_phone: Mapped[Optional[str]] = mapped_column(String(50))
    service_area: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON
    )  # GeoJSON polygon
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    connection_requests: Mapped[List["ConnectionRequest"]] = relationship(
        "ConnectionRequest", back_populates="distributor"
    )


class User(Base):
    """Database model for users (distributors and admins)."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(20), default="distributor"
    )  # distributor, admin
    distributor_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("distributors.id"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    distributor: Mapped[Optional[Distributor]] = relationship("Distributor")


class ConnectionRequest(Base):
    """Database model for connection requests."""
    __tablename__ = "connection_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    request_id: Mapped[str] = mapped_column(
        String(36), unique=True, nullable=False, index=True
    )
    distributor_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("distributors.id"), nullable=False, index=True
    )
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )

    # Connection details
    connection_type: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # residential, commercial, industrial
    voltage_level: Mapped[str] = mapped_column(String(50), nullable=False)
    power_requirement: Mapped[float] = mapped_column(
        Float, nullable=False
    )  # in kW

    # Location with PostGIS geometry
    location: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON
    )  # GeoJSON point
    location_geom: Mapped[Optional[str]] = mapped_column(
        Geometry('POINT', srid=4326), nullable=True
    )

    # Equipment and documents
    equipment: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(
        JSON
    )  # INMETRO equipment data
    documents: Mapped[Optional[List[str]]] = mapped_column(
        JSON
    )  # Document URLs/IDs

    # Status and processing
    status: Mapped[str] = mapped_column(
        String(20), default="pending", nullable=False
    )  # pending, approved, rejected, in_progress, completed
    estimated_cost: Mapped[Optional[float]] = mapped_column(Float)
    estimated_time_days: Mapped[Optional[int]] = mapped_column(Integer)
    requirements: Mapped[Optional[List[str]]] = mapped_column(JSON)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text)

    # INMETRO validation results
    inmetro_validation_result: Mapped[Optional[Dict[str, Any]]] = (
        mapped_column(JSON)
    )
    inmetro_valid: Mapped[bool] = mapped_column(Boolean, default=False)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    rejected_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Relationships
    distributor: Mapped[Distributor] = relationship(
        "Distributor", back_populates="connection_requests"
    )
    user: Mapped[Optional[User]] = relationship("User")


class WebhookConfig(Base):
    """Database model for webhook configurations."""
    __tablename__ = "webhook_configs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    secret: Mapped[str] = mapped_column(
        String(255), nullable=False
    )  # HMAC secret
    event_types: Mapped[List[str]] = mapped_column(
        JSON, nullable=False
    )  # Events to trigger
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    deliveries: Mapped[List["WebhookDelivery"]] = relationship(
        "WebhookDelivery", back_populates="config"
    )


class WebhookDelivery(Base):
    """Database model for webhook delivery attempts."""
    __tablename__ = "webhook_deliveries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    config_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("webhook_configs.id"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)
    payload: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=False)
    signature: Mapped[str] = mapped_column(String(255), nullable=False)

    # Delivery status
    status: Mapped[str] = mapped_column(
        String(20),
        default="pending",
        nullable=False
    )  # pending, delivered, failed, retrying
    attempt_count: Mapped[int] = mapped_column(Integer, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, default=3)

    # Response details
    response_status: Mapped[Optional[int]] = mapped_column(Integer)
    response_body: Mapped[Optional[str]] = mapped_column(Text)
    error_message: Mapped[Optional[str]] = mapped_column(Text)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    next_retry_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    # Relationships
    config: Mapped[WebhookConfig] = relationship(
        "WebhookConfig", back_populates="deliveries"
    )
