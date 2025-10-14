#!/usr/bin/env python3
"""
Script para executar a API HaaS Platform - versão simples sem reload
"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8002,
        reload=False,
        log_level="info"
    )