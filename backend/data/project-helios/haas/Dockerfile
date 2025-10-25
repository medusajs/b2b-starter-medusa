# HaaS Platform - Homologação como Serviço
# Production-ready Dockerfile
FROM python:3.11-slim

# Metadados
LABEL maintainer="YSH B2B Team"
LABEL version="1.0.0"
LABEL description="HaaS Platform - FastAPI application for distributor homologation"

# Variáveis de ambiente
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH="/app" \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Criar usuário não-root para segurança
RUN useradd --create-home --shell /bin/bash app \
    && mkdir -p /app/logs \
    && chown -R app:app /app

# Definir diretório de trabalho
WORKDIR /app

# Copiar requirements primeiro para otimizar cache do Docker
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Copiar código da aplicação
COPY . .

# Ajustar permissões
RUN chown -R app:app /app

# Mudar para usuário não-root
USER app

# Criar diretórios necessários
RUN mkdir -p /app/logs /app/uploads /app/tmp

# Expor porta
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Comando padrão
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]