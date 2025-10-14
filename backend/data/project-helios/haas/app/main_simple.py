"""
Versão simples do HaaS Platform para debugging
"""

from fastapi import FastAPI

app = FastAPI(
    title="HaaS Platform API - Simple",
    description="Versão simples para teste",
    version="1.0.0"
)


@app.get("/")
async def root():
    return {"message": "HaaS Platform - Simple Version", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "haas-api-simple"}