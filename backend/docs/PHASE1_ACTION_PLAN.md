# 🎯 Plano de Ação Imediato - Phase 1

**Objetivo**: Implementar as 8 tarefas da Phase 1 (Sprint 1-4)  
**Prazo**: 2 semanas com 1 dev full-time  
**Status Atual**: 3/8 tarefas base criadas (código inicial)

---

## ✅ O Que Foi Criado (Último Hour)

### 1. Redis Cache para Embeddings ✅

- **Arquivo**: `backend/src/modules/rag/utils/embedding-cache-v2.ts`
- **Status**: Código completo, pronto para integração
- **Features**: GET/SET, batch ops, stats, health check
- **Próximo**: Adicionar ao docker-compose + testes

### 2. Qdrant Collections Script ✅

- **Arquivo**: `backend/scripts/create_nomic_collections.py`
- **Status**: Script completo, pronto para executar
- **Collections**: 4 novas (768d Nomic embeddings)
- **Próximo**: Executar + popular com dados

### 3. Vision Squad ✅

- **Arquivo**: `backend/scripts/vision_squad.py`
- **Status**: 3 agentes implementados (Primary, Specialist stub, Quality)
- **Workflow**: Quality → Primary → Specialist (fallback)
- **Próximo**: Completar GPT-4o + testes com dataset

### 4. Documentação Completa ✅

- **Proposta**: `docs/PROPOSTA_AVANCADA_AI_PLATFORM_2025.md`
- **Implementação**: `docs/PHASE1_IMPLEMENTATION.md`
- **Executivo**: `docs/PHASE1_EXECUTIVE_SUMMARY.md`
- **Este arquivo**: Plano de ação

---

## 🚀 Próximos Passos (Ordem de Prioridade)

### HOJE (4 horas) - Integração Básica

#### 1. Redis Cache Integration (2h)

```bash
# 1. Adicionar ao docker-compose.foss.yml
cd docker
# Adicionar:
#   redis:
#     image: redis:7-alpine
#     ports: [6379:6379]
#     volumes: [redis_data:/data]

# 2. Instalar deps
cd ../backend
yarn add ioredis @types/ioredis

# 3. Start
docker-compose -f docker-compose.foss.yml up -d redis

# 4. Test
yarn test src/modules/rag/utils/__tests__/embedding-cache.test.ts
```

#### 2. Qdrant Collections Setup (1h)

```bash
# 1. Install client
pip install qdrant-client

# 2. Run script
python backend/scripts/create_nomic_collections.py

# 3. Verify
curl http://localhost:6333/collections \
  -H "api-key: qdrant_dev_key_foss_2025" | jq

# Expected: 8 collections (4 old + 4 new)
```

#### 3. Vision Squad Test (1h)

```bash
# 1. Install deps
pip install opencv-python numpy

# 2. Test run
python backend/scripts/vision_squad.py \
  backend/static/images-catálogo_distribuidores/images_odex_source/INVERTERS/sku_112369_1-17457314169194004.jpeg \
  INVERTERS

# Expected output:
# 📸 Quality: 8/10
# 👁️ Primary: 85% confidence
# ✅ Success
```

---

### AMANHÃ (8 horas) - Completar Sprint 1-2

#### 4. Pathway Streaming Pipeline (4h)

**Criar**: `data-platform/pathway/pipelines/rag_streaming_advanced.py`

```python
import pathway as pw
from pathway.stdlib.ml.embeddings import OpenAIEmbedder

def advanced_rag_pipeline():
    # 1. S3 input
    docs = pw.io.s3.read(...)
    
    # 2. Parse PDFs
    chunks = docs.select(content=parse_pdf(...))
    
    # 3. Embeddings
    embedded = chunks.select(embedding=embedder(...))
    
    # 4. Upsert Qdrant
    pw.io.qdrant.write(embedded, ...)
    
    pw.run()
```

**Teste**: Upload PDF → disponível em RAG em 2-5 min

#### 5. OpenTelemetry + Grafana (4h)

**Setup**:

```bash
# 1. Install OpenTelemetry
yarn add @opentelemetry/api @opentelemetry/sdk-node

# 2. Configure
# backend/src/instrumentation.ts

# 3. Add to docker-compose
#   grafana:
#     image: grafana/grafana:latest
#     ports: [3000:3000]
```

**Dashboards**:

1. AgentFlow Performance
2. Cache Metrics
3. Qdrant Operations

---

### SEMANA 1 (40 horas) - Completar Sprint 3-4

#### 6. Translation Agent (8h)

**Criar**: `backend/scripts/translation_agent.py`

```python
class TranslationAgent:
    def translate(self, text: str, source: str = "pt", target: str = "en"):
        # Gemma 3:4b fine-tuned
        # PT-BR ↔ EN
        # Normalizar unidades
        pass
```

#### 7. SEO Agent (8h)

**Criar**: `backend/scripts/seo_agent.py`

```python
class SEOAgent:
    def optimize(self, product: Dict) -> Dict:
        # Gerar título otimizado
        # Meta description (155 chars)
        # Bullet points
        # Tags semânticas
        pass
```

#### 8. Batch Processor (12h)

**Criar**: `backend/scripts/agentflow_batch_processor.py`

```python
from concurrent.futures import ThreadPoolExecutor

class BatchProcessor:
    def process_batch_parallel(self, products, batch_size=10):
        # 4 threads paralelas
        # Rate limiting
        # Progress bar
        # Error recovery
        pass
```

**Target**: 240 produtos/hora (4x faster)

#### 9. Fine-tune Llama 3.2 Vision (12h)

**Steps**:

1. Coletar 500 imagens dataset
2. Anotação manual (ground truth)
3. Preparar formato LoRA
4. Fine-tuning script
5. A/B testing

```bash
# Criar adapter
ollama create ysh-vision:v1 -f Modelfile.ysh

# Modelfile.ysh
FROM llama3.2-vision:11b
ADAPTER ./lora-weights/ysh-solar-adapter.bin
PARAMETER temperature 0.1
SYSTEM """Especialista em produtos fotovoltaicos..."""
```

---

### SEMANA 2 (40 horas) - Testes e Otimização

#### 10. Testes Completos (16h)

- Unit tests (Jest/Pytest)
- Integration tests
- Performance benchmarks
- Load testing

#### 11. Documentação Final (8h)

- API docs
- Deployment guide
- Troubleshooting
- Runbooks

#### 12. Deploy & Monitoring (16h)

- Deploy to staging
- Configure alerts
- Smoke tests
- Production rollout

---

## 📊 Timeline Visual

```
Semana 0 (HOJE):
├─ Redis cache integration     [====] 2h ✅
├─ Qdrant collections setup    [====] 1h ✅
├─ Vision Squad test           [====] 1h ✅
└─ Total: 4h

Semana 1:
├─ Pathway pipeline            [========] 4h
├─ OpenTelemetry/Grafana       [========] 4h
├─ Translation Agent            [================] 8h
├─ SEO Agent                   [================] 8h
├─ Batch Processor             [========================] 12h
└─ Fine-tune Vision            [========================] 12h
└─ Total: 48h

Semana 2:
├─ Testes completos            [================================] 16h
├─ Documentação final          [================] 8h
├─ Deploy & Monitoring         [================================] 16h
└─ Total: 40h

TOTAL: 92 horas (~2 semanas com 1 dev full-time)
```

---

## 🎯 Métricas de Sucesso

### Sprint 1-2 (Semana 1)

| Métrica | Baseline | Target | Como Medir |
|---------|----------|--------|------------|
| Cache hit rate | 0% | 50%+ | Redis stats API |
| Qdrant collections | 4 | 8 | Collection list |
| Pathway latency | N/A | <5 min | Time PDF → queryable |
| Grafana dashboards | 0 | 3 | Dashboard count |

### Sprint 3-4 (Semana 2)

| Métrica | Baseline | Target | Como Medir |
|---------|----------|--------|------------|
| Vision accuracy | 80% | 85%+ | Manual validation (50 images) |
| Processing speed | 60/hora | 240/hora | Batch processor logs |
| Image rejection | 15% | <10% | Quality agent stats |
| Fine-tuned improvement | 0% | +15% | A/B test accuracy |

---

## 🚨 Riscos & Mitigações

### Risco 1: Fine-tuning dataset insuficiente

**Impacto**: Alto  
**Probabilidade**: Média  
**Mitigação**:

- Usar imagens existentes (489 inversores)
- Synthetic data augmentation
- Começar com 200 imagens (MVP)

### Risco 2: GPT-4o Vision custo alto

**Impacto**: Médio  
**Probabilidade**: Baixa  
**Mitigação**:

- Usar apenas em fallback (< 30% casos)
- Cache agressivo
- Threshold configurável

### Risco 3: Pathway pipeline complexo

**Impacto**: Médio  
**Probabilidade**: Média  
**Mitigação**:

- Começar com pipeline simples (S3 + PDF)
- Incremental features
- Fallback para batch processing

---

## ✅ Checklist de Conclusão

### Sprint 1-2

- [ ] Redis cache operacional (hit rate >50%)
- [ ] 8 collections Qdrant (4 novas populadas)
- [ ] Pathway pipeline básico (PDF → RAG <5 min)
- [ ] 3 Grafana dashboards

### Sprint 3-4

- [ ] Vision Squad 85%+ accuracy
- [ ] Translation + SEO agents integrados
- [ ] Batch processor 240 prod/hora
- [ ] Llama 3.2 Vision fine-tuned (+15% accuracy)

### Geral

- [ ] Testes unitários (>80% coverage)
- [ ] Documentação completa
- [ ] Deploy staging
- [ ] Monitoring & alerts
- [ ] Production rollout

---

## 📞 Suporte

**Tech Lead**: @tech-lead (Slack)  
**Issues**: GitHub Issues label `phase-1`  
**Daily standup**: 10:00 UTC  
**Sprint review**: Sexta-feira 16:00 UTC

---

## 🎉 Celebração

**Quando 100% completo**:

- [ ] Demo para stakeholders
- [ ] Blog post interno
- [ ] Retrospectiva
- [ ] Planejar Phase 2 (RAG Enhancement)

---

**Criado**: 13 de outubro de 2025  
**Owner**: Equipe YSH AI/ML  
**Última atualização**: 13 out 2025 15:45 UTC
