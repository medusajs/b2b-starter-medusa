FROM python:3.11-slim

WORKDIR /opt/dagster/app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy Dagster code
COPY . .

# Expose Dagster webserver port
EXPOSE 3000

# Default command (override in docker-compose)
CMD ["dagster", "dev", "-h", "0.0.0.0", "-p", "3000"]
