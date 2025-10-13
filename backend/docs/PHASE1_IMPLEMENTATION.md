# 🚀 Implementação Phase 1: Sprint 1-4

**Status**: 🏗️ Em andamento  
**Prazo**: 2 meses (Sprint 1-4)  
**Objetivo**: Fundação + AgentFlow v2.0

---

## 📋 Checklist de Implementação

### ✅ Sprint 1-2: Core Infrastructure

- [ ] **Redis Cache para Embeddings**
  - ✅ Módulo TypeScript criado: `backend/src/modules/rag/utils/embedding-cache-v2.ts`
  - [ ] Adicionar ao `docker-compose.foss.yml`
  - [ ] Integrar com OpenAI service
  - [ ] Testes unitários
  - [ ] Métricas de hit rate

- [ ] **4 Novas Collections Qdrant (Nomic 768d)**
  - ✅ Script criado: `backend/scripts/create_nomic_collections.py`
  - [ ] Executar script de criação
  - [ ] Popular collection `ysh-local-catalog`
  - [ ] Popular collection `ysh-pvlib-database`
  - [ ] Configurar indexes otimizados

- [ ] **Pathway Streaming Pipeline (Básico)**
  - [ ] Implementar `rag_streaming_advanced.py`
  - [ ] Configurar S3 bucket watcher
  - [ ] Parser PDF/DOCX
  - [ ] Webhook notifications

- [ ] **OpenTelemetry + Grafana**
  - [ ] Setup OpenTelemetry SDK
  - [ ] Instrumentar AgentFlow
  - [ ] Dashboards Grafana
  - [ ] Alertas críticos

### ✅ Sprint 3-4: AgentFlow v2.0

- [ ] **Vision Squad (3 Agentes)**
  - ✅ Script base criado: `backend/scripts/vision_squad.py`
  - [ ] Primary Vision Agent (Llama 3.2) - implementado
  - [ ] Specialist Vision Agent (GPT-4o) - stub criado
  - [ ] Image Quality Agent (OpenCV) - implementado
  - [ ] Testes com dataset de 50 imagens

- [ ] **Translation + SEO Agents**
  - [ ] Translation Agent (PT-BR ↔ EN)
  - [ ] SEO Optimization Agent
  - [ ] Integrar com enrichment pipeline

- [ ] **Batch Processor Paralelo**
  - [ ] Sistema de filas (4 threads)
  - [ ] Rate limiting
  - [ ] Progress tracking
  - [ ] Error recovery

- [ ] **Fine-tune Llama 3.2 Vision (LoRA)**
  - [ ] Preparar dataset (500 imagens)
  - [ ] Anotações ground truth
  - [ ] Fine-tuning script
  - [ ] Validação A/B testing

---

## 🚀 Quick Start (Hoje - 2 horas)

### 1. Redis Cache

```bash
# 1. Adicionar ao docker-compose
cd docker
# Editar docker-compose.foss.yml (adicionar service redis)

# 2. Instalar dependências
cd ../backend
yarn add ioredis @types/ioredis

# 3. Testar cache
cd src/modules/rag/utils
# Usar embedding-cache-v2.ts
```

### 2. Qdrant Collections

```bash
# 1. Instalar qdrant-client
pip install qdrant-client

# 2. Criar collections
python backend/scripts/create_nomic_collections.py

# 3. Verificar
curl http://localhost:6333/collections -H "api-key: qdrant_dev_key_foss_2025"
```

### 3. Vision Squad Test

```bash
# 1. Instalar dependências
pip install opencv-python numpy

# 2. Testar com imagem
python backend/scripts/vision_squad.py \
  backend/static/images-catálogo_distribuidores/images_odex_source/INVERTERS/sku_112369_1-17457314169194004.jpeg \
  INVERTERS
```

---

## 📁 Estrutura de Arquivos Criados

```
backend/
├── src/modules/rag/utils/
│   └── embedding-cache-v2.ts       ✅ Redis cache module
│
├── scripts/
│   ├── create_nomic_collections.py ✅ Qdrant setup
│   ├── vision_squad.py             ✅ Vision agents
│   ├── populate_local_catalog.py   🔜 TODO
│   ├── ingest_pvlib_database.py    🔜 TODO
│   └── agentflow_batch_processor.py 🔜 TODO
│
├── data-platform/
│   └── pathway/pipelines/
│       └── rag_streaming_advanced.py 🔜 TODO
│
└── docs/
    └── PHASE1_IMPLEMENTATION.md     📄 Este arquivo
```

---

## 🧪 Testes

### Redis Cache

```typescript
// backend/src/modules/rag/utils/__tests__/embedding-cache.test.ts
import { EmbeddingCache } from '../embedding-cache-v2'

describe('EmbeddingCache', () => {
  it('should cache and retrieve embeddings', async () => {
    const cache = new EmbeddingCache({
      host: 'localhost',
      port: 6379
    }, logger)
    
    const text = "Inversor 10kW"
    const embedding = [0.1, 0.2, 0.3]
    
    await cache.set(text, 'openai', embedding)
    const cached = await cache.get(text, 'openai')
    
    expect(cached).toEqual(embedding)
  })
})
```

### Vision Squad

```python
# backend/scripts/test_vision_squad.py
from vision_squad import VisionSquad

def test_vision_squad():
    squad = VisionSquad(enable_specialist=False)
    
    result = squad.analyze(
        'path/to/test/image.jpg',
        'INVERTERS',
        verbose=True
    )
    
    assert result['success'] == True
    assert result['confidence'] > 0.5
    assert 'manufacturer' in result['data']
```

---

## 📊 Métricas de Sucesso

### Sprint 1-2

| Métrica | Meta | Status |
|---------|------|--------|
| Redis cache hit rate | >50% | 🔄 |
| Qdrant collections | 8 total | 🔄 |
| Pathway pipeline latency | <5 min | 🔄 |
| Grafana dashboards | 3 | 🔄 |

### Sprint 3-4

| Métrica | Meta | Status |
|---------|------|--------|
| Vision Squad accuracy | >85% | 🔄 |
| Processing speed | 240 prod/hora | 🔄 |
| Image quality filter | <10% rejeição | 🔄 |
| Fine-tuned model improvement | +15% | 🔄 |

---

## 🐛 Troubleshooting

### Redis não conecta

```bash
# Verificar se está rodando
docker ps | grep redis

# Logs
docker logs ysh-redis

# Restart
docker-compose -f docker/docker-compose.foss.yml restart redis
```

### Qdrant collections não criam

```bash
# Verificar API key
echo $QDRANT_API_KEY

# Testar conexão
curl http://localhost:6333/healthz \
  -H "api-key: qdrant_dev_key_foss_2025"
```

### Ollama model não encontrado

```bash
# Listar modelos
ollama list

# Instalar se necessário
ollama pull llama3.2-vision:11b
```

---

## 📚 Próximos Passos

### Sprint 5-6 (Mês 3-4): RAG Enhancement

1. Multi-turn conversations
2. Hybrid search (dense + sparse)
3. Smart quoting system
4. Compatibility Agent

### Sprint 7-8 (Mês 3-4): Knowledge Expansion

1. Ingest PVLib (19K produtos)
2. Web scraper agent
3. PDF parser
4. User behavior analytics

---

## 🆘 Suporte

**Documentação completa**: `/docs/PROPOSTA_AVANCADA_AI_PLATFORM_2025.md`  
**Issues**: GitHub Issues  
**Chat**: Slack #ysh-ai-implementation

---

**Última atualização**: 13 de outubro de 2025  
**Maintainer**: Hélio (AI Copilot)
