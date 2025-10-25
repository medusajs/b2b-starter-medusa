import os
import logging
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Application Settings
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API Configuration
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_WORKERS: int = 1
    API_RELOAD: bool = True
    
    # Database settings
    DATABASE_URL: str = "sqlite:///./haas_platform.db"
    
    # Redis settings
    REDIS_URL: str = "redis://localhost:6379"
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 10485760  # 10MB
    UPLOAD_DIR: str = "./uploads"
    
    # Logging Settings
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: str = "./logs/haas.log"
    LOG_MAX_SIZE: int = 10485760  # 10MB
    LOG_BACKUP_COUNT: int = 5
    
    # Webhook Settings
    WEBHOOK_TIMEOUT: int = 30
    WEBHOOK_RETRY_ATTEMPTS: int = 3
    
    # Security Settings
    SECURE_COOKIES: bool = False
    HTTPS_ONLY: bool = False
    
    # Monitoring Settings
    SENTRY_DSN: str = ""
    METRICS_ENABLED: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True
        
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"
        
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"
        
    def setup_logging(self) -> None:
        """Configure logging based on environment settings."""
        # Create logs directory if it doesn't exist
        log_dir = os.path.dirname(self.LOG_FILE)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
        
        # Configure logging
        log_level = getattr(logging, self.LOG_LEVEL.upper(), logging.INFO)
        
        # Create formatter
        formatter = logging.Formatter(self.LOG_FORMAT)
        
        # Configure root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(log_level)
        
        # Remove existing handlers
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(log_level)
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)
        
        # File handler with rotation
        if self.LOG_FILE:
            from logging.handlers import RotatingFileHandler
            file_handler = RotatingFileHandler(
                self.LOG_FILE,
                maxBytes=self.LOG_MAX_SIZE,
                backupCount=self.LOG_BACKUP_COUNT
            )
            file_handler.setLevel(log_level)
            file_handler.setFormatter(formatter)
            root_logger.addHandler(file_handler)


settings = Settings()
