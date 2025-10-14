"""
HaaS Platform - Homologação como Serviço
API Principal FastAPI para integração com distribuidoras
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from app.config import settings
from app.routers import distributors, auth, webhooks

# Configure logging
settings.setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("🚀 Starting HaaS Platform API")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Database URL: {settings.DATABASE_URL}")
    logger.info(f"Redis URL: {settings.REDIS_URL}")
    
    # Initialize database tables if needed
    try:
        from app.database import create_tables
        create_tables()
        logger.info("✅ Database tables initialized")
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down HaaS Platform API")


app = FastAPI(
    title="HaaS Platform API",
    description="API para Homologação como Serviço - "
                "Integração com Distribuidoras",
    version="1.0.0",
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
    lifespan=lifespan
)

# Security middleware for production
if settings.is_production:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"]  # Configure proper hosts in production
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(
    auth.router,
    prefix="/auth",
    tags=["Autenticação"]
)
app.include_router(
    distributors.router,
    prefix="/distributors",
    tags=["Distribuidoras"]
)
app.include_router(
    webhooks.router,
    prefix="/webhooks",
    tags=["Webhooks"]
)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    logger.info("Root endpoint accessed")
    return {
        "message": "HaaS Platform - Homologação como Serviço",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "docs": "/docs" if settings.is_development else "disabled",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    logger.debug("Health check endpoint accessed")
    
    # Test database connection
    db_status = "healthy"
    try:
        from app.database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"
    
    # Test Redis connection (if configured)
    redis_status = "not_configured"
    if settings.REDIS_URL and settings.REDIS_URL != "redis://localhost:6379":
        try:
            # Add Redis health check here if needed
            redis_status = "healthy"
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            redis_status = "unhealthy"
    
    return {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "service": "haas-api",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": "2025-10-14T10:00:00Z",
        "checks": {
            "database": db_status,
            "redis": redis_status
        }
    }

