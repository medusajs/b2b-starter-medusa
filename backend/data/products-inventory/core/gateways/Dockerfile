# YSH Unified API Gateway - Docker Configuration
FROM python:3.11-slim

LABEL maintainer="Yello Solar Hub <dev@yellosolar.com>"
LABEL description="Unified API Gateway for YSH services"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements-gateway.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements-gateway.txt

# Copy application code
COPY unified_gateway.py .

# Create non-root user
RUN useradd -m -u 1000 gateway && chown -R gateway:gateway /app
USER gateway

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/gateway/health || exit 1

# Run application
CMD ["uvicorn", "unified_gateway:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "4"]
