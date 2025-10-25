"""
Configuração centralizada do HaaS Platform
Sistema de Homologação como Serviço
"""
from pydantic_settings import BaseSettings
from typing import List, Optional
from pathlib import Path


class Settings(BaseSettings):
    """Configurações da aplicação HaaS Platform"""

    # ===== APP CONFIGURATION =====
    APP_NAME: str = "HaaS Platform - Homologação como Serviço"
    APP_DESCRIPTION: str = ("Plataforma completa para homologação "
                            "automática de equipamentos fotovoltaicos")
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # ===== SERVER CONFIGURATION =====
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ===== CORS CONFIGURATION =====
    CORS_ORIGINS: List[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    # ===== DATABASE CONFIGURATION =====
    DATABASE_URL: Optional[str] = None
    DB_ECHO: bool = False
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10

    # ===== EXTERNAL APIS =====
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    ANEEL_BASE_URL: str = "https://dadosabertos.aneel.gov.br/api/3/action"
    INMETRO_BASE_URL: str = "https://registro.inmetro.gov.br"

    # ===== DISTRIBUIDORAS CONFIGURATION =====
    CPFL_BASE_URL: str = "https://servicosonline.cpfl.com.br"
    ENEL_SP_BASE_URL: str = "https://www.enel.com.br"
    CEMIG_BASE_URL: str = "https://www.cemig.com.br"

    # ===== PATHS =====
    BASE_DIR: Path = Path(__file__).parent.parent.parent
    DATA_DIR: str = "data"
    LOGS_DIR: str = "logs"
    CONFIG_DIR: str = "config"
    CACHE_DIR: str = "data/cache"
    EXPORTS_DIR: str = "data/exports"
    SCHEMAS_DIR: str = "schemas"
    VALIDATORS_DIR: str = "validators"

    # ===== CACHE CONFIGURATION =====
    REDIS_URL: Optional[str] = None
    CACHE_TTL: int = 3600  # 1 hour

    # ===== VALIDATION CONFIGURATION =====
    VALIDATION_TIMEOUT: int = 300  # 5 minutes
    MAX_RETRIES: int = 3
    RETRY_DELAY: int = 5  # seconds

    # ===== SECURITY =====
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    JWT_SECRET_KEY: str = "your-jwt-secret-key-here"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = False


# Instância global das configurações
settings = Settings()
