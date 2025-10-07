Yello Solar Hub — Onboarding Autosserviço (Blueprint)

Este módulo define contratos, schemas e serviços para um fluxo de onboarding autosserviço com dimensionamento remoto usando dados públicos (NASA POWER / NSRDB), PVWatts (NREL) e tarifas ANEEL, com integração futura a um microserviço pvlib.

Ambiente (opcional):
- NREL_API_KEY: chave para PVWatts/NSRDB
- NSRDB_API_KEY, NSRDB_EMAIL: acesso NSRDB detalhado
- PVLIB_SERVICE_URL: URL do microserviço pvlib (POST /simulate)

Arquivos principais:
- schemas/: JSON Schemas para entradas/saídas
- nlu/: Intenções e slots (BASE, B1, B3, AVANÇADO)
- services/: Clientes de API (NASA, NREL, ANEEL)
- pipeline/: Tipos, orquestração e contrato de saída

Observação: os serviços fazem fetch; ajuste chaves via env e trate limites de taxa antes de produção.

