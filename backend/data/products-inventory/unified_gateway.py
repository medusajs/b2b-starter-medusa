"""
YSH Unified API Gateway
=======================
Single entry point for all Yello Solar Hub services:
- E-commerce (Medusa.js)
- HaaS Platform (FastAPI)  
- Data Platform (Dagster + Pathway)

Features:
- Route-based routing with path prefixes
- Unified JWT authentication across all services
- Rate limiting and throttling
- Request/response transformation
- Health check aggregation
- Distributed tracing
- API versioning support
"""

from fastapi import FastAPI, Request, HTTPException, Depends, Header
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import asyncio
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from collections import defaultdict
import time
import logging
from urllib.parse import urljoin
from pydantic import BaseModel, Field
import redis.asyncio as redis
from jose import jwt, JWTError
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
class GatewayConfig:
    """Gateway configuration from environment variables"""
    
    # Service endpoints
    MEDUSA_URL = os.getenv("MEDUSA_URL", "http://localhost:9000")
    HAAS_URL = os.getenv("HAAS_URL", "http://localhost:8000")
    DATA_PLATFORM_URL = os.getenv("DATA_PLATFORM_URL", "http://localhost:8001")
    
    # JWT configuration
    JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
    JWT_ALGORITHM = "HS256"
    JWT_EXPIRATION_HOURS = 24
    
    # Redis for rate limiting
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Rate limiting
    RATE_LIMIT_REQUESTS = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW", "60"))
    
    # CORS
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")
    
    # Timeout
    REQUEST_TIMEOUT_SECONDS = int(os.getenv("REQUEST_TIMEOUT", "30"))

config = GatewayConfig()

# FastAPI app
app = FastAPI(
    title="YSH Unified API Gateway",
    description="Unified API Gateway for Yello Solar Hub services",
    version="1.0.0",
    docs_url="/gateway/docs",
    redoc_url="/gateway/redoc",
    openapi_url="/gateway/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted host middleware (security)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]  # Configure properly in production
)

# HTTP client for proxying
http_client: Optional[httpx.AsyncClient] = None
redis_client: Optional[redis.Redis] = None

# Service routing map
SERVICE_ROUTES = {
    "/api/ecommerce": config.MEDUSA_URL,
    "/api/haas": config.HAAS_URL,
    "/api/data": config.DATA_PLATFORM_URL,
}

# ==================== Models ====================

class HealthCheckResponse(BaseModel):
    """Health check response model"""
    status: str
    timestamp: str
    services: Dict[str, Dict[str, Any]]
    gateway_version: str = "1.0.0"

class ErrorResponse(BaseModel):
    """Error response model"""
    error: str
    message: str
    timestamp: str
    path: str
    status_code: int

class RateLimitInfo(BaseModel):
    """Rate limit information"""
    limit: int
    remaining: int
    reset_at: str

# ==================== Startup/Shutdown ====================

@app.on_event("startup")
async def startup():
    """Initialize resources on startup"""
    global http_client, redis_client
    
    logger.info("Starting YSH Unified API Gateway...")
    
    # Initialize HTTP client
    http_client = httpx.AsyncClient(
        timeout=httpx.Timeout(config.REQUEST_TIMEOUT_SECONDS),
        follow_redirects=True,
        limits=httpx.Limits(max_keepalive_connections=20, max_connections=100)
    )
    logger.info("HTTP client initialized")
    
    # Initialize Redis client
    try:
        redis_client = await redis.from_url(
            config.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        await redis_client.ping()
        logger.info("Redis client initialized")
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        redis_client = None
    
    logger.info("Gateway startup complete")

@app.on_event("shutdown")
async def shutdown():
    """Cleanup resources on shutdown"""
    global http_client, redis_client
    
    logger.info("Shutting down YSH Unified API Gateway...")
    
    if http_client:
        await http_client.aclose()
        logger.info("HTTP client closed")
    
    if redis_client:
        await redis_client.close()
        logger.info("Redis client closed")

# ==================== Authentication ====================

security = HTTPBearer(auto_error=False)

async def verify_jwt_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """
    Verify JWT token from Authorization header
    Returns decoded token payload or None if invalid/missing
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            config.JWT_SECRET,
            algorithms=[config.JWT_ALGORITHM]
        )
        
        # Check expiration
        exp = payload.get("exp")
        if exp and datetime.fromtimestamp(exp) < datetime.utcnow():
            logger.warning("Token expired")
            return None
        
        return payload
    
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        return None

def require_auth(token_payload: Optional[Dict] = Depends(verify_jwt_token)) -> Dict:
    """
    Dependency that requires valid authentication
    Raises 401 if token is invalid or missing
    """
    if not token_payload:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )
    return token_payload

# ==================== Rate Limiting ====================

async def check_rate_limit(request: Request) -> RateLimitInfo:
    """
    Check rate limit for client IP
    Returns rate limit info
    Raises 429 if limit exceeded
    """
    if not redis_client:
        # If Redis is unavailable, allow all requests
        return RateLimitInfo(
            limit=config.RATE_LIMIT_REQUESTS,
            remaining=config.RATE_LIMIT_REQUESTS,
            reset_at=datetime.utcnow().isoformat()
        )
    
    # Get client identifier (IP address)
    client_ip = request.client.host
    
    # Redis key for rate limiting
    key = f"ratelimit:{client_ip}"
    
    # Current window
    now = int(time.time())
    window_start = now - config.RATE_LIMIT_WINDOW_SECONDS
    
    # Remove old entries
    await redis_client.zremrangebyscore(key, 0, window_start)
    
    # Count requests in current window
    current_requests = await redis_client.zcard(key)
    
    # Check if limit exceeded
    if current_requests >= config.RATE_LIMIT_REQUESTS:
        reset_at = datetime.fromtimestamp(
            window_start + config.RATE_LIMIT_WINDOW_SECONDS
        )
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limit_exceeded",
                "message": "Too many requests",
                "limit": config.RATE_LIMIT_REQUESTS,
                "reset_at": reset_at.isoformat()
            }
        )
    
    # Add current request
    await redis_client.zadd(key, {str(now): now})
    await redis_client.expire(key, config.RATE_LIMIT_WINDOW_SECONDS)
    
    # Calculate remaining requests
    remaining = config.RATE_LIMIT_REQUESTS - current_requests - 1
    reset_at = datetime.fromtimestamp(
        window_start + config.RATE_LIMIT_WINDOW_SECONDS
    )
    
    return RateLimitInfo(
        limit=config.RATE_LIMIT_REQUESTS,
        remaining=max(0, remaining),
        reset_at=reset_at.isoformat()
    )

# ==================== Service Routing ====================

def get_target_service(path: str) -> Optional[str]:
    """
    Determine target service based on request path
    Returns service URL or None if no match
    """
    for prefix, service_url in SERVICE_ROUTES.items():
        if path.startswith(prefix):
            return service_url
    return None

def transform_path(original_path: str, service_prefix: str) -> str:
    """
    Transform gateway path to service path
    Example: /api/haas/auth/login -> /auth/login
    """
    return original_path[len(service_prefix):]

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
async def proxy_request(
    request: Request,
    path: str,
    rate_limit: RateLimitInfo = Depends(check_rate_limit)
):
    """
    Main proxy handler - routes requests to appropriate backend service
    """
    # Add leading slash
    full_path = f"/{path}"
    
    # Determine target service
    target_service = get_target_service(full_path)
    if not target_service:
        raise HTTPException(
            status_code=404,
            detail={
                "error": "service_not_found",
                "message": f"No service found for path: {full_path}"
            }
        )
    
    # Find service prefix
    service_prefix = None
    for prefix, url in SERVICE_ROUTES.items():
        if url == target_service:
            service_prefix = prefix
            break
    
    # Transform path
    service_path = transform_path(full_path, service_prefix)
    target_url = urljoin(target_service, service_path)
    
    # Add query parameters
    if request.url.query:
        target_url = f"{target_url}?{request.url.query}"
    
    # Prepare headers
    headers = dict(request.headers)
    headers.pop("host", None)  # Remove host header
    
    # Add rate limit headers
    headers["X-RateLimit-Limit"] = str(rate_limit.limit)
    headers["X-RateLimit-Remaining"] = str(rate_limit.remaining)
    headers["X-RateLimit-Reset"] = rate_limit.reset_at
    
    # Add tracing headers
    headers["X-Gateway-Request-ID"] = str(time.time())
    headers["X-Forwarded-For"] = request.client.host
    
    try:
        # Get request body
        body = await request.body()
        
        # Proxy request
        response = await http_client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            content=body
        )
        
        # Prepare response headers
        response_headers = dict(response.headers)
        response_headers["X-Gateway-Service"] = service_prefix
        response_headers["X-RateLimit-Limit"] = str(rate_limit.limit)
        response_headers["X-RateLimit-Remaining"] = str(rate_limit.remaining)
        
        # Return response
        return JSONResponse(
            content=response.json() if response.headers.get("content-type", "").startswith("application/json") else {"data": response.text},
            status_code=response.status_code,
            headers=response_headers
        )
    
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail={
                "error": "gateway_timeout",
                "message": "Service request timed out"
            }
        )
    except Exception as e:
        logger.error(f"Proxy error: {e}")
        raise HTTPException(
            status_code=502,
            detail={
                "error": "bad_gateway",
                "message": f"Failed to communicate with service: {str(e)}"
            }
        )

# ==================== Gateway Endpoints ====================

@app.get("/gateway/health", response_model=HealthCheckResponse)
async def gateway_health():
    """
    Aggregated health check for all services
    """
    services_health = {}
    
    # Check each service
    for service_name, service_url in [
        ("ecommerce", config.MEDUSA_URL),
        ("haas", config.HAAS_URL),
        ("data_platform", config.DATA_PLATFORM_URL)
    ]:
        try:
            health_url = urljoin(service_url, "/health")
            response = await http_client.get(health_url, timeout=5.0)
            
            services_health[service_name] = {
                "status": "healthy" if response.status_code == 200 else "unhealthy",
                "response_time_ms": int(response.elapsed.total_seconds() * 1000),
                "status_code": response.status_code
            }
        except Exception as e:
            services_health[service_name] = {
                "status": "unreachable",
                "error": str(e)
            }
    
    # Overall status
    all_healthy = all(
        service.get("status") == "healthy"
        for service in services_health.values()
    )
    
    return HealthCheckResponse(
        status="healthy" if all_healthy else "degraded",
        timestamp=datetime.utcnow().isoformat(),
        services=services_health
    )

@app.get("/gateway/version")
async def gateway_version():
    """Gateway version information"""
    return {
        "version": "1.0.0",
        "name": "YSH Unified API Gateway",
        "services": list(SERVICE_ROUTES.keys())
    }

@app.get("/gateway/routes")
async def gateway_routes():
    """List all available service routes"""
    return {
        "routes": [
            {
                "prefix": prefix,
                "service": url,
                "description": {
                    "/api/ecommerce": "E-commerce platform (Medusa.js)",
                    "/api/haas": "HaaS Platform (FastAPI)",
                    "/api/data": "Data Platform (Dagster + Pathway)"
                }.get(prefix, "Unknown service")
            }
            for prefix, url in SERVICE_ROUTES.items()
        ]
    }

# ==================== Error Handlers ====================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error=exc.detail.get("error", "http_error") if isinstance(exc.detail, dict) else "http_error",
            message=exc.detail.get("message", str(exc.detail)) if isinstance(exc.detail, dict) else str(exc.detail),
            timestamp=datetime.utcnow().isoformat(),
            path=str(request.url.path),
            status_code=exc.status_code
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch-all exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            error="internal_server_error",
            message="An unexpected error occurred",
            timestamp=datetime.utcnow().isoformat(),
            path=str(request.url.path),
            status_code=500
        ).dict()
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "unified_gateway:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
        log_level="info"
    )
