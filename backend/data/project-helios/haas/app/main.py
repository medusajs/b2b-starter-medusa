"""
HaaS Platform - Homologação como Serviço
API Principal FastAPI para integração com distribuidoras
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import distributors, auth

app = FastAPI(
    title="HaaS Platform API",
    description="API para Homologação como Serviço - "
                "Integração com Distribuidoras",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origens permitidas
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


@app.get("/")
async def root():
    message = "HaaS Platform - Homologação como Serviço"
    return {"message": message, "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "haas-api"}

