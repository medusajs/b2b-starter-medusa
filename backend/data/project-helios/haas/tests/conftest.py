"""
HaaS Platform - Test Configuration & Fixtures
Provides shared fixtures for all test suites
"""
import pytest
from typing import AsyncGenerator, Generator
from fastapi import FastAPI
from fastapi.testclient import TestClient
from httpx import AsyncClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import fakeredis
import redis

from app.main import app
from app.services.auth_service import (
    create_access_token,
    create_refresh_token,
    get_password_hash
)


# ==================== Database Fixtures ====================

@pytest.fixture(scope="function")
def db_engine():
    """Create in-memory SQLite engine for testing."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    # Create tables here if needed
    # Base.metadata.create_all(bind=engine)
    yield engine
    engine.dispose()


@pytest.fixture(scope="function")
def db_session(db_engine) -> Generator[Session, None, None]:
    """Create database session for testing."""
    SessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=db_engine
    )
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


# ==================== Redis Fixtures ====================

@pytest.fixture(scope="function")
def redis_client():
    """Create fake Redis client for testing."""
    fake_redis = fakeredis.FakeStrictRedis(decode_responses=True)
    yield fake_redis
    fake_redis.flushall()


@pytest.fixture(scope="function")
def mock_redis(monkeypatch, redis_client):
    """Mock Redis client in auth_service."""
    import app.services.auth_service as auth_service
    monkeypatch.setattr(auth_service, "redis_client", redis_client)
    return redis_client


# ==================== FastAPI App Fixtures ====================

@pytest.fixture(scope="module")
def test_app() -> FastAPI:
    """Get FastAPI app instance."""
    return app


@pytest.fixture(scope="function")
def client(test_app: FastAPI) -> Generator[TestClient, None, None]:
    """Create synchronous test client."""
    with TestClient(test_app) as test_client:
        yield test_client


@pytest.fixture(scope="function")
async def async_client(
    test_app: FastAPI
) -> AsyncGenerator[AsyncClient, None]:
    """Create async test client."""
    async with AsyncClient(
        app=test_app,
        base_url="http://test"
    ) as ac:
        yield ac


# ==================== Auth Fixtures ====================

@pytest.fixture(scope="function")
def test_user_data():
    """Test user data."""
    return {
        "email": "test@haas.com",
        "password": "testpass123",
        "full_name": "Test User",
        "role": "distributor",
        "is_active": True
    }


@pytest.fixture(scope="function")
def test_user_hashed(test_user_data):
    """Test user with hashed password."""
    data = test_user_data.copy()
    data["hashed_password"] = get_password_hash(data["password"])

    # Ensure user exists in auth_service fake DB for auth flows
    import app.services.auth_service as auth_service
    auth_service.fake_users_db[data["email"]] = {
        "id": 999,
        "email": data["email"],
        "full_name": data["full_name"],
        "hashed_password": data["hashed_password"],
        "role": data["role"],
        "is_active": data["is_active"],
    }
    return data


@pytest.fixture(scope="function")
def access_token(test_user_hashed):
    """Create valid access token."""
    return create_access_token(data={"sub": test_user_hashed["email"]})


@pytest.fixture(scope="function")
def refresh_token(test_user_hashed):
    """Create valid refresh token."""
    return create_refresh_token(data={"sub": test_user_hashed["email"]})


@pytest.fixture(scope="function")
def auth_headers(access_token):
    """Create authentication headers with Bearer token."""
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture(scope="function")
def expired_token():
    """Create expired access token for testing."""
    from datetime import datetime, timedelta
    from jose import jwt
    from app.config import settings

    payload = {
        "sub": "test@haas.com",
        "exp": datetime.utcnow() - timedelta(hours=1),
        "type": "access"
    }
    return jwt.encode(payload, settings.SECRET_KEY, settings.ALGORITHM)


# ==================== INMETRO Fixtures ====================

@pytest.fixture(scope="function")
def valid_inmetro_certificate():
    """Valid INMETRO certificate data."""
    return {
        "certificate_number": "BR-001-2024",
        "product_type": "inverter",
        "manufacturer": "Fronius",
        "model": "Primo 5.0-1",
        "valid_until": "2025-12-31",
        "power_rating": 5000,
        "status": "valid"
    }


@pytest.fixture(scope="function")
def invalid_inmetro_certificate():
    """Invalid INMETRO certificate data."""
    return {
        "certificate_number": "INVALID-000-0000",
        "product_type": "inverter",
        "manufacturer": "Unknown",
        "model": "Unknown",
        "status": "invalid"
    }


@pytest.fixture(scope="function")
def mock_inmetro_pipeline(mocker):
    """Mock InmetroPipeline for testing."""
    mock = mocker.Mock()
    mock.validate_certificate.return_value = {
        "valid": True,
        "details": {
            "certificate_number": "BR-001-2024",
            "status": "valid",
            "manufacturer": "Fronius"
        }
    }
    return mock


# ==================== Documents Fixtures ====================

@pytest.fixture(scope="function")
def project_data_sample():
    """Sample project data for document generation."""
    return {
        "client": {
            "name": "João Silva",
            "cpf": "123.456.789-00",
            "address": "Rua Teste, 123",
            "city": "São Paulo",
            "state": "SP"
        },
        "system": {
            "power": 5.0,
            "modules": 10,
            "inverter": "Fronius Primo 5.0-1",
            "structure": "Metálico",
            "voltage": 220
        },
        "location": {
            "latitude": -23.5505,
            "longitude": -46.6333,
            "roof_type": "Cerâmico",
            "orientation": "Norte"
        }
    }


@pytest.fixture(scope="function")
def mock_document_generator(mocker):
    """Mock document generator service."""
    mock = mocker.Mock()
    mock.generate_memorial.return_value = {
        "document_id": "DOC-001",
        "url": "https://s3.amazonaws.com/haas-docs/DOC-001.pdf",
        "status": "generated"
    }
    return mock


# ==================== Monitoring Fixtures ====================

@pytest.fixture(scope="function")
def mock_system_metrics(mocker):
    """Mock system metrics from psutil."""
    mock = mocker.Mock()
    mock.cpu_percent.return_value = 45.5
    mock.virtual_memory.return_value = mocker.Mock(
        percent=60.0,
        used=8000000000,
        total=16000000000
    )
    mock.disk_usage.return_value = mocker.Mock(
        percent=55.0,
        used=100000000000,
        total=200000000000
    )
    return mock


@pytest.fixture(scope="function")
def sample_alert():
    """Sample alert data."""
    return {
        "id": "ALERT-001",
        "severity": "warning",
        "service": "inmetro_crawler",
        "message": "High latency detected",
        "timestamp": "2025-10-14T10:00:00Z",
        "acknowledged": False
    }


# ==================== Helper Functions ====================

@pytest.fixture(scope="function")
def mock_background_tasks(mocker):
    """Mock FastAPI BackgroundTasks."""
    return mocker.Mock()


def create_test_user(
    email: str = "test@haas.com",
    password: str = "testpass123",
    role: str = "distributor"
):
    """Helper to create test user data."""
    return {
        "email": email,
        "password": password,
        "full_name": f"Test {role.title()}",
        "role": role,
        "is_active": True,
        "hashed_password": get_password_hash(password)
    }


# ==================== Cleanup ====================

@pytest.fixture(autouse=True)
def reset_mocks():
    """Reset all mocks after each test."""
    yield
    # Cleanup logic here if needed
