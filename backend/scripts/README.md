# 🚀 YSH Store 360º Scripts

Scripts para preload, validação e testes do sistema completo de 22 módulos.

---

## 📋 Scripts Disponíveis

### 1. 🧪 Test Runner (Recomendado)

Executa todos os testes de uma vez:

```bash
# Executar todos os testes
node test-store-360.js

# Pular preload (apenas validação)
node test-store-360.js --skip-preload

# Pular validação (apenas preload)
node test-store-360.js --skip-validation

# Modo verbose (mostra output completo)
node test-store-360.js --verbose
```

**Output esperado**:

```
[0.01s] 🧪 Starting YSH Store 360º Test Suite...
════════════════════════════════════════════════════════════════════════════════
[1.23s] ✅ Internal Catalog Validation passed (850ms)
[2.15s] ✅ Store 360º Validation passed (920ms)
[2.35s] ✅ Internal Catalog Preload passed (200ms)
[3.80s] ✅ Store 360º Preload passed (1450ms)

📊 Test Suite Report:
════════════════════════════════════════════════════════════════════════════════
   Total Tests: 4
   ✅ Passed: 4
   ❌ Failed: 0
   📈 Success Rate: 100.0%
🎉 All tests passed!
```

---

### 2. 🔍 Validação

#### Internal Catalog (6 endpoints)

```bash
node validate-catalog-apis.js
```

#### Store 360º (22 módulos)

```bash
# Validar todos os módulos
node validate-store-360.js

# Validar módulo específico
node validate-store-360.js --module=internal-catalog

# Modo verbose
node validate-store-360.js --verbose
```

**O que valida**:

- ✅ Estrutura de endpoints (params, query, body, response)
- ✅ Data files (existência + JSON válido)
- ✅ Dependencies entre módulos
- ✅ External services configurados

---

### 3. 📦 Preload

#### Internal Catalog

```bash
node preload-catalog.js
```

**Performance esperada**:

- 📦 12 categorias
- 📸 91.5% cobertura de imagens
- ⏱️ ~0.02s total time

#### Store 360º (22 módulos)

```bash
# Preload completo com priorização
node preload-store-360.js

# Apenas módulos específicos
node preload-store-360.js --modules=internal-catalog,kits,solar-calculations

# Modo verbose (detalhes de arquivos/schemas)
node preload-store-360.js --verbose

# Pular health check
node preload-store-360.js --skip-health
```

**Performance esperada**:

- 📦 22 módulos
- 💾 8 módulos cacheados
- 📈 90%+ success rate
- ⏱️ ~1.2s total time

---

## 📊 Relatórios Gerados

Todos os scripts salvam relatórios JSON:

| Script | Relatório Salvo |
|--------|----------------|
| `validate-catalog-apis.js` | `../validation-report.json` |
| `validate-store-360.js` | `../data/validation-360-report.json` |
| `preload-catalog.js` | `../data/catalog/preload-report.json` |
| `preload-store-360.js` | `../data/preload-360-report.json` |

---

## 🎯 Quick Start

### Primeira vez? Execute o test runner

```bash
cd backend/scripts
node test-store-360.js --verbose
```

Isso executará:

1. ✅ Validação do Internal Catalog (8 testes)
2. ✅ Validação do Store 360º (22 módulos)
3. ✅ Preload do Internal Catalog (12 categorias)
4. ✅ Preload do Store 360º (22 módulos)

**Tempo total esperado**: ~3-4 segundos

---

## 🔧 Troubleshooting

### Erros de data files missing

Se você ver warnings sobre arquivos faltando:

```bash
# Verificar estrutura de pastas
ls -R ../data/

# Criar diretórios necessários
mkdir -p ../data/catalog/data
mkdir -p ../data/kits
mkdir -p ../data/solar
mkdir -p ../data/financing
mkdir -p ../data/shipping
mkdir -p ../data/rag
```

### External services unavailable

Se serviços externos estiverem down (Solar CV, Vector DB):

- ✅ Sistema continua operando
- ⚠️ Módulos marcados como "degraded"
- ℹ️ Isso é esperado se serviços não estão rodando

### Preload lento

Se preload estiver lento (>2s):

```bash
# Preload apenas módulos prioritários
node preload-store-360.js --modules=internal-catalog,catalog,products,kits,companies
```

---

## 📚 Documentação Completa

Para detalhes técnicos:

- **[STORE_360_COMPLETE_REPORT.md](../../STORE_360_COMPLETE_REPORT.md)** - Relatório completo
- **[DOCUMENTATION_INDEX_360.md](../../DOCUMENTATION_INDEX_360.md)** - Índice de docs
- **[EXECUTIVE_SUMMARY_360.md](../../EXECUTIVE_SUMMARY_360.md)** - Resumo executivo

---

## 🎉 Próximos Passos

Após executar os scripts:

1. **Ver relatórios**: `cat ../data/validation-360-report.json | jq`
2. **Iniciar backend**: `cd .. && docker-compose up backend`
3. **Testar health endpoint**: `curl http://localhost:9000/store/health | jq`
4. **Ver módulo específico**: `curl "http://localhost:9000/store/health?module=internal-catalog" | jq`

---

**Sistema 360º pronto para uso!** ✅
