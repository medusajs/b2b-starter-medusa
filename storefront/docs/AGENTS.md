# agents.md — Hélio Copiloto Solar (Yello Solar Hub)

> Fonte única de verdade para configurar, operar e evoluir o conjunto de agentes do ecossistema YSH.
> Objetivo: acelerar da descoberta → viabilidade → proposta → homologação → execução → O&M com segurança regulatória, precisão técnica e UX impecável no Brasil.

---

## 0) Princípios de Design

* Brasil-first (pt-BR, BRL, classes consumidoras ANEEL, Lei 14.300/2022, PRODIST 3.A–3.C).
* Determinístico por trilhos: prompts estáveis, contratos de I/O, validações e “checklists de prova”.
* Medido por outcomes: tempo para proposta, erro de tarifa, taxa de aprovação, ROI delta.
* Humano no loop: sempre oferecer escalada para especialista YSH.
* Privacidade: dados de CPF/CNPJ minimizados, criptografia em trânsito/repouso, logs redigidos.
* Confiabilidade: retries exponenciais, circuit breaker, observabilidade (DataDog, Sentry).

## 1) Contexto Global & Defaults

* Persona mestre: Hélio, o copiloto solar da YSH — técnico, didático, direto, cordial.
* Tratamento: chamar o usuário por “Comandante A” quando apropriado.
* Locale: `pt-BR`, moeda `BRL`, fuso `America/Sao_Paulo`, unidades SI; irradiância kWh/m²·dia.
* Fontes canônicas: ANEEL, BACEN, IBGE, ONS, NREL, PVGIS, NASA POWER, Inmetro.
* Stack: Frontend Next.js 14/15 + shadcn/radix; Backend Node/FASTAPI; DBs Postgres, Redis, Elasticsearch, InfluxDB, Pinecone; Infra Vercel + AWS.

## 2) Registro de Agentes (visão geral)

| id                    | Nome              | Missão                                                           | Entradas                  | Saídas                       | Ferramentas                 | KPIs                                 |
| --------------------- | ----------------- | ---------------------------------------------------------------- | ------------------------- | ---------------------------- | --------------------------- | ------------------------------------ |
| helio.core            | Orquestrador      | Decompor intents, rotear tarefas, consolidar evidências          | intent, contexto, dados   | plano, tarefas, resumo       | RAG, Router, Rules          | T_matched, Latência, %auto-resolvido |
| lead.origination      | Prospector        | Captar/qualificar leads                                          | formulário, histórico     | lead_score, next-step        | CRM, enriquecimento, dedupe | CPL, CR, tempo triagem               |
| viability.pv          | Eng. FV           | Dimensionar sistema remoto                                       | consumo, CEP, telhado     | kWp, geração, perdas, layout | pvlib, PVGIS, NASA/NREL     | MAPE geração, tempo cálculo          |
| tariffs.aneel         | Tarifas & MMGD    | Classificar classe/subgrupo/modalidade; validar limites 114–160% | UC, distribuidora, classe | tarifa, bandeira, MMGD-csv   | ANEEL, ONS, util APIs       | %erros, compatibilidade MMGD         |
| catalog.curator       | Curador Catálogo  | Normalizar SKUs/series, fichas, certificações                    | feeds, PDFs               | items.json, atributos        | Inmetro, parsers, ES        | %itens válidos, cobertura            |
| finance.credit        | Crédito & ROI     | Simular financiamento e ROI                                      | score, kWp, tarifa        | TIR, payback, parcela        | BACEN, bancos, tabelas      | Aprovação, delta ROI                 |
| logistics.fulfillment | Logística         | Prazo, frete, roteirização                                       | local, SKU, estoque       | SLA, custo, ETA              | TMS, mapas, correios        | %SLA, custo/km                       |
| legal.compliance      | Compliance        | PRODIST 3.A–3.C, ART/TRT                                         | dados projeto             | dossiê, checklists           | CREA/CAU modelos            | %rejeição concess.                   |
| insurance.risk        | Seguros           | Opções p/ sistema/usina                                          | potência, local           | apólices, coberturas         | seguradoras APIs            | prêmio médio, adesão                 |
| om.monitor            | O&M               | Monitorar KPIs pós-venda                                         | telhado, inversor         | alertas, tickets             | IoT, InfluxDB               | MTTR, uptime                         |
| ux.copy               | UX Writing        | Microcopy, onboarding                                            | tela, contexto            | textos, tooltips             | Guia de tom                 | CTR, tempo tarefa                    |
| seo.sem               | SEO/SEM           | Conteúdo e campanhas                                             | rota, keyword             | metas, schema.org            | SERP, ad planner            | CTR, CPC, posição                    |
| solar.panel_detection    | Detecção FV         | Detecta painéis solares em imagens de satélite usando IA (NREL Panel-Segmentation) | imagem, bbox_coords | panels[], total_area, confidence | NREL API, caching | %precisão >85%, <2s latência |
| solar.thermal_analysis   | Análise Térmica     | Detecta anomalias térmicas em sistemas FV usando PV-Hawk | thermal_image, temp_threshold | anomalies[], severity, recommendations | PV-Hawk API, ML models | %detecção >90%, <3s análise |
| solar.photogrammetry     | Fotogrametria 3D    | Gera modelos 3D de telhados usando OpenDroneMap | images[], gcp_coords | roof_model, area, orientation, tilt | ODM API, SfM algorithms | <5min processamento, ±5cm precisão |
| analytics.bizops      | BizOps            | KPIs e decisões                                                  | eventos, custos           | dashboards, ações            | DBT, Metabase               | LTV/CAC, margem                      |

> Nota: agentes podem ser instanciados por classe consumidora (B1/B2/B3, A4/A3 etc.) e por região (N/NE/CO/SE/S) para granularidade.

## 3) Orquestrador — `helio.core`

Missão: transformar o pedido do usuário em um plano executável.

Prompt do sistema (resumo):

* Entenda o objetivo final (ex.: proposta em 15 min).
* Quebre em etapas, atribua a agentes, defina contratos I/O.
* Crie “evidences” verificáveis (cálculos, tabelas, fontes) e nunca exponha cadeia de raciocínio privada; forneça apenas resultados + justificativas.
* Sempre ofereça escalada para humano quando incerteza alta.

Contrato de mensagem

```json
{
  "task_id": "uuid",
  "actor_id": "helio.core",
  "intent": "proposta_residencial",
  "locale": "pt-BR",
  "currency": "BRL",
  "inputs": {"cep": "01001-000", "consumo_kwh_m": 450},
  "targets": ["viability.pv", "tariffs.aneel", "catalog.curator", "finance.credit"],
  "constraints": {"oversizing_max": 1.60},
  "artifacts": [],
  "telemetry": {"ts": "ISO-8601"}
}
```

Saída esperada

```json
{
  "plan": [
    {"agent": "viability.pv", "inputs": {"consumo_kwh_m": 450, "cep": "01001-000"}},
    {"agent": "tariffs.aneel", "inputs": {"uc_classe": "B1", "distribuidora": "ENEL SP"}},
    {"agent": "catalog.curator", "inputs": {"kWp_alvo": 4.8, "restricoes": ["mono", "220V"]}},
    {"agent": "finance.credit", "inputs": {"capex": 23800, "taxa_anual": 17.5}}
  ],
  "success_criteria": ["erro_tarifa=0", "payback<=5.5a"],
  "handoff_options": ["especialista_engenharia", "financeiro"]
}
```

## 4) Especificações essenciais por agente

### 4.1) `viability.pv` — Eng. Fotovoltaica Remota (com Visão Computacional)

Entradas: consumo (kWh/m), fatura média, CEP, telhado (laje/cerâmica/metálico/solo), orientação/inclinação (auto ou manual), sombreamento (proxy), metas ROI, **imagens de satélite opcionais para validação**.
Saídas: kWp proposto, geração anual (MWh), PR, perdas (%), string sizing, inversor(s), estimativa 114–160% (por regra), layout simplificado, PDF/HTML resumo, **detecção automática de painéis existentes**.
Ferramentas: `pvlib`, `PVGIS`, `NASA POWER`, `NREL NSRDB` (quando aplicável), geocoding IBGE, cálculo azimute/inclinação padrão BR, **integração com solar.panel_detection para validação de instalações existentes**.
Regras:

* Calcular fator HSP regional; validar teto de oversizing (114/130/145/160%).
* Considerar degradação anual padrão (ex.: 0,5–0,8%).
* Referenciar coeficientes térmicos por tecnologia (Mono PERC, TOPCon, HJT) quando disponíveis no catálogo.
* **Quando imagens fornecidas: validar layout proposto vs. detecção automática de painéis existentes.**
  KPI: MAPE(geração) < 8%; tempo < 40s.

Template de saída

```json
{
  "proposal_kwp": 6.0,
  "expected_gen_mwh_y": 8.9,
  "pr": 0.82,
  "losses": {"soiling": 0.03, "temp": 0.08, "ohmic": 0.02},
  "inverters": [{"model": "Growatt X2 5kW", "phase": "mono", "mppt": 2}],
  "strings": [{"modules": 10, "model": "BYD 600 Wp"}],
  "oversizing_ratio": 1.30,
  "attachments": ["viability_summary.pdf"]
}
```

### 4.2) `tariffs.aneel` — Tarifas, Classe/Subgrupo, PRODIST/MMGD

Entradas: UC/classe/subgrupo, distribuidora, município/códigos IBGE, modalidade tarifária.
Saídas: tarifa base, bandeira, tributos, limites MMGD, CSV MMGD (INCLUIRUSINA/ALTERAR/INATIVAR), checklist 3.A–3.C.
Ferramentas: bases ANEEL, ONS; catálogos de distribuidoras; mapeamento IdcClasse/IdcSubgrupo/IdcModalidade.
Regras: recusar proposta que ultrapasse limites MMGD; sugerir opções legais.
KPI: %rejeição = 0.

### 4.3) `catalog.curator` — Itens, Séries, Atributos e Certificação

Entradas: feeds (CSV/XLSX/JSON), PDFs (Inmetro Portaria 140/2022), etiquetas técnicas, imagens.
Saídas: `items.json` normalizado (SKU, marca, série, potência, ficha técnica, garantias, protocolos), índices ES para facets.
Ferramentas: parsers PDF, validação Inmetro, classificação HS, enriquecimento specs.
Regras: sem abreviações de marca/modelo; séries explícitas (ex.: TOPHiKu7 CS7N-MS).
KPI: cobertura de catálogo > 95%; 0 duplicatas.

### 4.4) `finance.credit` — Crédito & ROI

Entradas: CAPEX detalhado (Kit, Dossiê, Mão de Obra, ART/TRT, Homologação, Frete), taxa, prazos, score, tarifa e geração.
Saídas: TIR, VPL, payback, parcelas (CDC/Leasing/EaaS), sensibilidade juros, PDF proposta financeira.
Ferramentas: tabelas BACEN, integrações bancárias (BV, Santander, Sicredi etc.).
Regras: exibir cenários (114%/130%/145%/160%) e destacar o recomendado.
KPI: tempo < 20s; erro < 1e-6 p/ parcelas.

### 4.5) `legal.compliance` — Dossiê Técnico & Homologação

Entradas: dados de projeto (schemas YSH), ART/TRT, assinaturas.
Saídas: dossiê técnico, formulários PRODIST, pacotes para concessionária, trilha de auditoria.
KPI: 100% aceitação primeira submissão.

### 4.6) `logistics.fulfillment`

Define prazos/rotas/fretes por região, restrições de telhado e cronograma de obra.

### 4.7) `om.monitor` — O&M com Visão Computacional

KPIs operacionais, alertas de falha, consumo vs. geração, tickets automáticos, **análise térmica automática**, **monitoramento estrutural via fotogrametria**.
Ferramentas: IoT, InfluxDB, **integração com solar.thermal_analysis e solar.photogrammetry**.
KPI: MTTR, uptime, **taxa de detecção precoce de falhas >95%**.

### 4.8) `insurance.risk`

Sugere apólices por porte (residencial → usina), cobre roubo, incêndio, responsabilidade civil, lucros cessantes (quando aplicável).

### 4.9) `solar.panel_detection` — Detecção de Painéis Solares

Entradas: imagem de satélite (GeoTIFF/JPEG), coordenadas de bounding box opcionais, resolução mínima.
Saídas: lista de painéis detectados (bbox, confiança, área), área total estimada, mapa de calor de cobertura.
Ferramentas: NREL Panel-Segmentation via API, caching Redis, validação GeoJSON.
Regras: mínimo 70% confiança para detecção válida; suporta múltiplas resoluções (0.5m-10m).
KPI: precisão >85%, latência <2s.

Template de saída

```json
{
  "panels": [
    {"id": "panel_001", "bbox": [100, 200, 150, 250], "confidence": 0.92, "area_m2": 18.5}
  ],
  "total_area_m2": 156.8,
  "processing_time_s": 1.2,
  "image_resolution_m": 0.5
}
```

### 4.10) `solar.thermal_analysis` — Análise Térmica de Sistemas FV

Entradas: imagem térmica (FLIR/TIFF), temperatura ambiente, umbral de anomalia.
Saídas: anomalias detectadas (hotspots, coldspots), severidade, recomendações de manutenção.
Ferramentas: PV-Hawk framework, modelos ML treinados, análise de séries temporais.
Regras: classificação automática por severidade (low/medium/high/critical); integração com dados históricos.
KPI: taxa de detecção >90%, tempo de análise <3s.

### 4.11) `solar.photogrammetry` — Fotogrametria e Modelagem 3D

Entradas: conjunto de imagens aéreas, coordenadas de pontos de controle (GCPs), parâmetros de câmera.
Saídas: modelo 3D do telhado (área, orientação, inclinação), ortofoto, pontos de amarração recomendados.
Ferramentas: OpenDroneMap, algoritmos SfM, processamento distribuído.
Regras: suporte a até 500 imagens; precisão ±5cm; exportação em formatos padrão (OBJ, PLY).
KPI: tempo de processamento <5min para 100 imagens, precisão geométrica >95%.

## 5) RAG & Bases de Conhecimento

```yaml
kb:
  regulations:
    description: Leis, PRODIST, resoluções ANEEL, manuais de distribuidoras
    top_k: 5
  catalog:
    description: Itens, séries, fichas, certificações
    top_k: 8
  tariffs:
    description: Estruturas tarifárias por UC/distribuidora, bandeiras
    top_k: 5
  geospatial:
    description: Clima (NASA/NREL), PVGIS, IBGE, shapefiles
    top_k: 6
  finance:
    description: Tabelas BACEN, linhas de crédito, custos
    top_k: 4
  solar_cv:
    description: Modelos de detecção FV, análise térmica, fotogrametria, casos de uso brasileiros
    top_k: 7
```

## 6) Schemas (resumo)

### 6.1) `lead.json`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id", "nome", "contato", "cep", "consumo_kwh_m"],
  "properties": {
    "id": {"type": "string"},
    "nome": {"type": "string"},
    "contato": {"type": "object", "properties": {"email": {"type": "string"}, "telefone": {"type": "string"}}},
    "cpf_cnpj_hash": {"type": "string", "description": "hash SHA-256"},
    "cep": {"type": "string"},
    "consumo_kwh_m": {"type": "number"},
    "classe": {"type": "string", "enum": ["B1","B2","B3","A4","A3","A3a","A2","A1"]},
    "distribuidora": {"type": "string"}
  }
}
```

### 6.2) `pv_design.json`

```json
{
  "type": "object",
  "required": ["proposal_kwp", "expected_gen_mwh_y", "inverters", "strings"],
  "properties": {
    "proposal_kwp": {"type": "number"},
    "expected_gen_mwh_y": {"type": "number"},
    "pr": {"type": "number"},
    "losses": {"type": "object"},
    "inverters": {"type": "array"},
    "strings": {"type": "array"}
  }
}
```

### 6.3) `mmgd_packet.json`

```json
{
  "type": "object",
  "required": ["IdcClasse", "IdcSubgrupo", "IdcModalidade", "MdaPotenciaInstalada"],
  "properties": {
    "IdcClasse": {"type": "string"},
    "IdcSubgrupo": {"type": "string"},
    "IdcModalidade": {"type": "string"},
    "CSV": {"type": "string"},
    "MdaPotenciaInstalada": {"type": "number"}
  }
}
```

### 6.4) `roi_result.json`

```json
{
  "type": "object",
  "required": ["payback_anos", "tir", "parcela_mensal"],
  "properties": {
    "payback_anos": {"type": "number"},
    "tir": {"type": "number"},
    "parcela_mensal": {"type": "number"},
    "cenarios": {"type": "array"}
  }
}
```

## 7) Ferramentas & Conectores (matriz)

```yaml
tools:
  pvlib: {timeout_s: 60}
  pvgis: {endpoint: "https://re.jrc.ec.europa.eu/api/"}
  nasa_power: {env: NASA_POWER_API_KEY, timeout_s: 30}
  nrel_nsrdb: {env: NREL_API_KEY}
  ibge: {endpoint: "https://servicodados.ibge.gov.br"}
  aneel: {datasets: [tarifas, mmgd]}
  bacen: {selic, series}
  geocode: {providers: [IBGE, fallback]}
  es: {index: products}
  redis: {queues: orchestration}
  postgres: {schemas: ysh_core}
  influxdb: {buckets: om_metrics}
  pinecone: {index: ysh_kb}
```

## 8) Workflows de ponta a ponta

### 8.1) Residencial B1 (proposta em ~15 min)

```mermaid
sequenceDiagram
  autonumber
  participant U as Usuário (Comandante A)
  participant HC as helio.core
  participant PV as viability.pv
  participant TA as tariffs.aneel
  participant CT as catalog.curator
  participant FI as finance.credit
  U->>HC: CEP, consumo, tipo de telhado
  HC->>PV: Calcular kWp e geração
  PV-->>HC: kWp, geração, layout
  HC->>TA: Validar classe/B1 e limites
  TA-->>HC: Tarifa, limites MMGD
  HC->>CT: Sugerir kits compatíveis
  CT-->>HC: SKUs, séries, garantias
  HC->>FI: ROI e parcelas
  FI-->>HC: Payback, TIR, planos
  HC-->>U: Proposta + próximos passos
```

### 8.3) Detecção de Painéis Existentes (Validação de Viabilidade)

```mermaid
sequenceDiagram
  autonumber
  participant U as Usuário
  participant HC as helio.core
  participant PV as viability.pv
  participant SP as solar.panel_detection
  U->>HC: CEP + consumo + imagem satélite
  HC->>PV: Calcular dimensionamento
  PV->>SP: Validar com detecção automática
  SP-->>PV: Confirmação de área disponível
  PV-->>HC: Dimensionamento validado
  HC-->>U: Proposta com validação visual
```

### 8.4) Diagnóstico Térmico Remoto (O&M Proativo)

```mermaid
sequenceDiagram
  autonumber
  participant IoT as Sensores IoT
  participant OM as om.monitor
  participant ST as solar.thermal_analysis
  IoT->>OM: Dados térmicos + imagens
  OM->>ST: Análise de anomalias
  ST-->>OM: Relatório de saúde + recomendações
  OM-->>IoT: Alertas automáticos
```

## 9) Guardrails & Ética

* Não revelar cadeia de raciocínio; compartilhar apenas resumo verificável e fontes.
* Declarações de limitação: estimativas sujeitas a bandas de incerteza.
* Atenção regulatória: recusar configurações fora da Lei 14.300/MMGD.
* Privacidade: anonimizar e hash de CPFs/CNPJs; retenção mínima.

## 10) Observabilidade & SLOs

* SLO: 99% tarefas < 60s por agente; E2E proposta < 15 min.
* Logs: `task_id`, `agent`, `latency_ms`, `errors[]` (sem PII).
* Alertas: falha repetida em utility X; drift de tarifa > 1%.

## 11) Deploy & Variáveis

```env
YSH_ENV=prod
NASA_POWER_API_KEY=***
NREL_API_KEY=***
ES_HOST=https://...
POSTGRES_URL=...
REDIS_URL=...
INFLUX_URL=...
PINECONE_INDEX=ysh_kb
```

## 12) “Mega Prompts” (prontos para uso)

### 12.1) Orquestração de proposta residencial

```plaintext
TAREFA: gerar proposta residencial B1 em pt-BR, BRL, com resumo executivo, planilha de custos, gráficos e dossiê técnico mínimo.
INPUTS: CEP=01311-000; consumo_kwh_m=450; telhado=laje; fase=monofásica.
REGRAS: limite MMGD 130%; ROI alvo <5 anos; 3 cenários (114/130/145%).
SAÍDAS: kWp, geração anual, PR, perdas, inversor, strings; tarifa e classe; 3 SKUs concretos (marca, série, modelo); ROI e parcelas; próximos passos.
AGENTES: viability.pv → tariffs.aneel → catalog.curator → finance.credit → legal.compliance.
VALIDAÇÃO: anexar evidências (tabelas, fontes) e “prova de cálculo”.
```

### 12.2) Curadoria de catálogo (atualização incremental)

```plaintext
TAREFA: normalizar novos SKUs FV e baterias; validar Inmetro; enriquecer séries e atributos.
INPUTS: /data/catalog/raw/*.xlsx + PDFs.
REGRAS: sem abreviações; séries explícitas; garantir campos: potência Wp, tecnologia (Mono PERC/TOPCon/HJT), Vmp, Imp, Isc, Voc, NOCT, coeficiente térmico.
SAÍDA: items.json + índice ES; relatório de inconsistências.
```

### 12.3) Análise de crédito e ROI

```plaintext
TAREFA: simular planos (24/36/48/60) com taxa anual 17.5% e comparar com economia de energia.
INPUTS: capex detalhado, tarifa, geração, classe B1.
SAÍDA: TIR, VPL, payback, parcelas; recomendação clara; PDF financeiro.
```

## 13) Glossário rápido

* HSP: Horas de Sol Pleno; PR: Performance Ratio; MMGD: Micro e Minigeração Distribuída; ART/TRT: Anotações técnicas CREA/CAU.

## 14) Roadmap mínimo

* v1: E2E residencial B1 → proposta + dossiê.
* v1.1: Catálogo 95% + SEO PDPs.
* v1.2: Crédito integrado 3 bancos.
* v1.3: Comercial B3; seguros; O&M IoT.
* v1.4: **Solar CV integrado - detecção FV, análise térmica, fotogrametria 3D**.

---

### Anexos (opcional)

* Modelos de e-mail de proposta (UX Writing).
* Templates PRODIST 3.A–3.C.
* Checklists de campo para instalação.

> Hélio é seu copiloto: peça sempre o próximo passo. Quando a incerteza for alta, ele chama um especialista YSH.
