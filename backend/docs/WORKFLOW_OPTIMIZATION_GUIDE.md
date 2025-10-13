# 🚀 Guia de Otimização do Workflow - Vision + Text Models

**Data**: 13 de outubro de 2025  
**Modelos**: Llama 3.2 Vision:11b + Gemma 3:4b/12b + GPT-OSS:20b  
**Objetivo**: Acelerar processamento de 25h → 2-4h

---

## 📊 Análise de Performance Atual

### Tempos Medidos (5 imagens teste)

| Etapa | Modelo | Tempo | % Total |
|-------|--------|-------|---------|
| **Análise Visual** | Llama 3.2 Vision:11b | 107s/img | 85% |
| **Normalização** | Gemma 3:4b | 2-3s | 2% |
| **Enriquecimento** | Gemma 3:4b | 5-8s | 6% |
| **Validação** | Gemma 3:4b | 1-2s | 1% |
| **I/O e overhead** | - | 5-10s | 6% |
| **TOTAL** | - | **120-130s/produto** | 100% |

### Gargalo Identificado

**85% do tempo está na análise visual com Llama Vision!**

```
Llama Vision (107s) ████████████████████████████████████████████ 85%
Gemma 3 (10s)       █████ 8%
Overhead (10s)      ██ 7%
```

---

## 🎯 Estratégias de Aceleração

### Estratégia 1: Otimização do Llama Vision (Crítico)

#### 1.1 Warmup do Modelo

**Problema**: Primeiras 3-4 imagens levam 130s, depois caem para 40s.

**Solução**: Pré-aquecer modelo antes do processamento.

```python
def warmup_vision_model(model: str, iterations: int = 3):
    """
    Aquece modelo com imagens dummy para atingir performance ótima
    Reduz tempo de 130s → 40s nas primeiras imagens
    """
    print(f"🔥 Aquecendo {model}...")
    
    # Usar imagem pequena e prompt simples
    dummy_prompt = "Descreva esta imagem em uma palavra."
    dummy_image = create_tiny_test_image()  # 100x100px
    
    warmup_times = []
    for i in range(iterations):
        start = time.time()
        ollama.chat(
            model=model,
            messages=[{
                'role': 'user',
                'content': dummy_prompt,
                'images': [dummy_image]
            }],
            options={'num_predict': 50}
        )
        elapsed = time.time() - start
        warmup_times.append(elapsed)
        print(f"   Warmup {i+1}/{iterations}: {elapsed:.1f}s")
    
    print(f"✅ Modelo aquecido! ({warmup_times[-1]:.1f}s última iteração)\n")
```

**Ganho esperado**: -55% no tempo médio (107s → 48s)

#### 1.2 Redução Drástica do Prompt

**Problema**: Prompt atual tem ~500 tokens, aumenta tempo de processamento.

**Solução**: Prompt minimalista com apenas o essencial.

```python
# ❌ ANTES (500 tokens)
prompt = """Você é um especialista em produtos fotovoltaicos.

Analise esta imagem de produto e extraia TODOS os dados visíveis:

{
  "manufacturer": "marca/logo visível (ex: SAJ, Growatt, Canadian Solar)",
  "model": "código/modelo exato visível",
  "product_type": "inverter/panel/battery/stringbox/structure/other",
  "subtype": "gridtie/hybrid/offgrid/mono/poly/bifacial/N/A",
  "specifications": {
    "power_w": 0,
    "power_kw": 0.0,
    "voltage": "220V/380V/...",
    "current_a": 0,
    "phase": "mono/tri/N/A",
    "efficiency_percent": 0.0,
    "mppt_count": 0,
    "max_input_voltage": 0,
    "max_output_current": 0
  },
  "visible_text": "transcreva TODO texto legível na imagem",
  "certifications": ["INMETRO", "IEC", "CE", etc],
  "image_quality": {
    "score": 0-10,
    "usable_for_catalog": true/false,
    "issues": ["listar problemas se houver"]
  }
}

IMPORTANTE: 
- Se não conseguir ler algum dado, deixe como null ou 0
- Seja preciso nos números e especificações
- Transcreva TODO texto visível, mesmo que pequeno

Retorne APENAS o JSON, sem texto adicional."""

# ✅ DEPOIS (120 tokens) - 75% menor
prompt = """JSON da imagem:
{"manufacturer":"","model":"","type":"inverter/panel","specs":{"kw":0,"voltage":"","mppt":0},"text":"","quality":0-10}

Apenas JSON válido."""
```

**Ganho esperado**: -25% no tempo (48s → 36s)

#### 1.3 Otimização de Parâmetros Ollama

```python
# ❌ ANTES
options = {
    'temperature': 0.1,
    'num_predict': 1500  # Gera até 1500 tokens!
}

# ✅ DEPOIS
options = {
    'temperature': 0.0,      # Totalmente determinístico
    'num_predict': 400,      # JSON minimalista ~300 tokens
    'top_k': 5,              # Apenas top 5 tokens
    'top_p': 0.85,           # Foca nas escolhas mais prováveis
    'repeat_penalty': 1.2,   # Evita repetição
    'num_ctx': 2048,         # Context window menor
    'num_gpu': 33            # Todas as camadas na GPU (se disponível)
}
```

**Ganho esperado**: -15% no tempo (36s → 30s)

#### 1.4 Compressão de Imagens

```python
def optimize_image_for_vision(image_path: Path, max_size: int = 1024) -> Path:
    """
    Redimensiona imagem mantendo qualidade para OCR
    Imagens menores = processamento mais rápido
    """
    from PIL import Image
    
    img = Image.open(image_path)
    
    # Se já é pequena, retorna original
    if max(img.size) <= max_size:
        return image_path
    
    # Redimensionar mantendo aspect ratio
    img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    
    # Salvar temporário
    temp_path = Path(f"/tmp/{image_path.stem}_optimized{image_path.suffix}")
    img.save(temp_path, quality=85, optimize=True)
    
    return temp_path
```

**Ganho esperado**: -10% no tempo (30s → 27s)

---

### Estratégia 2: Processamento Paralelo (Crítico)

#### 2.1 Multi-threading para I/O

```python
from concurrent.futures import ThreadPoolExecutor
import queue

def process_images_parallel(images: List[Path], model: str, workers: int = 3):
    """
    Processa múltiplas imagens em paralelo
    Reduz tempo total em ~60%
    """
    
    results = []
    
    # Pool de workers
    with ThreadPoolExecutor(max_workers=workers) as executor:
        # Submit todas as tarefas
        futures = {
            executor.submit(
                extract_metadata_with_vision, 
                img, 
                model
            ): img for img in images
        }
        
        # Coletar resultados conforme completam
        from concurrent.futures import as_completed
        for future in as_completed(futures):
            img = futures[future]
            try:
                result = future.result()
                results.append({
                    'file': img.name,
                    'metadata': result
                })
                print(f"✅ {img.name}")
            except Exception as e:
                print(f"❌ {img.name}: {e}")
                results.append({
                    'file': img.name,
                    'error': str(e)
                })
    
    return results
```

**Limitação**: Ollama executa modelos sequencialmente por padrão.

**Solução**: Múltiplas instâncias Ollama ou usar GPU com batch.

**Ganho esperado**: 2-3x mais rápido com 3 workers (se infra permitir)

#### 2.2 Pipeline Assíncrono

```python
import asyncio

async def async_vision_analysis(image: Path, model: str):
    """Análise de visão assíncrona"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, 
        extract_metadata_with_vision, 
        image, 
        model
    )

async def async_text_processing(vision_result: Dict, model: str):
    """Processamento de texto assíncrono"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None,
        enrich_with_gemma3,
        vision_result,
        model
    )

async def process_product_pipeline(image: Path):
    """Pipeline completo assíncrono"""
    
    # Etapa 1: Visão (lento)
    vision_task = async_vision_analysis(image, 'llama3.2-vision:11b')
    
    # Enquanto processa visão, preparar próxima imagem
    vision_result = await vision_task
    
    # Etapa 2: Texto (rápido) - pode paralelizar
    text_tasks = [
        async_text_processing(vision_result, 'gemma3:4b'),
        async_validate_pvlib(vision_result),
        async_check_pricing(vision_result)
    ]
    
    results = await asyncio.gather(*text_tasks)
    
    return combine_results(vision_result, results)

async def process_batch_async(images: List[Path], batch_size: int = 5):
    """Processa lote com concorrência controlada"""
    
    semaphore = asyncio.Semaphore(batch_size)
    
    async def process_with_limit(img):
        async with semaphore:
            return await process_product_pipeline(img)
    
    tasks = [process_with_limit(img) for img in images]
    return await asyncio.gather(*tasks)
```

**Ganho esperado**: 40-50% mais rápido para lotes grandes

---

### Estratégia 3: Cache Inteligente

#### 3.1 Cache de Resultados de Visão

```python
import hashlib
from pathlib import Path

class VisionCache:
    """Cache persistente para resultados de análise visual"""
    
    def __init__(self, cache_dir: Path):
        self.cache_dir = cache_dir
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.hits = 0
        self.misses = 0
    
    def get_cache_key(self, image_path: Path, model: str) -> str:
        """Gera chave única baseada em hash da imagem + modelo"""
        img_hash = hashlib.sha256(image_path.read_bytes()).hexdigest()
        return f"{model}_{img_hash}"
    
    def get(self, image_path: Path, model: str) -> Optional[Dict]:
        """Busca no cache"""
        key = self.get_cache_key(image_path, model)
        cache_file = self.cache_dir / f"{key}.json"
        
        if cache_file.exists():
            self.hits += 1
            return json.loads(cache_file.read_text())
        
        self.misses += 1
        return None
    
    def set(self, image_path: Path, model: str, result: Dict):
        """Salva no cache"""
        key = self.get_cache_key(image_path, model)
        cache_file = self.cache_dir / f"{key}.json"
        cache_file.write_text(json.dumps(result, indent=2))
    
    def stats(self) -> Dict:
        """Estatísticas do cache"""
        total = self.hits + self.misses
        hit_rate = (self.hits / total * 100) if total > 0 else 0
        return {
            'hits': self.hits,
            'misses': self.misses,
            'hit_rate': f"{hit_rate:.1f}%",
            'total_cached': len(list(self.cache_dir.glob('*.json')))
        }

# Uso
cache = VisionCache(Path('cache/vision'))

def extract_with_cache(image: Path, model: str):
    # Tentar cache primeiro
    cached = cache.get(image, model)
    if cached:
        print(f"✅ Cache hit: {image.name}")
        return cached
    
    # Processar e cachear
    print(f"🔄 Processando: {image.name}")
    result = extract_metadata_with_vision(image, model)
    cache.set(image, model, result)
    
    return result
```

**Ganho esperado**: Re-processamento instantâneo (economiza 100% em imagens repetidas)

#### 3.2 Cache de Modelos em Memória

```python
class ModelPool:
    """Pool de modelos pré-carregados"""
    
    def __init__(self):
        self.models = {}
        self.lock = threading.Lock()
    
    def get_or_load(self, model_name: str):
        """Retorna modelo carregado ou carrega se necessário"""
        with self.lock:
            if model_name not in self.models:
                print(f"📥 Carregando {model_name}...")
                # Força carregamento fazendo query dummy
                ollama.generate(model=model_name, prompt="OK")
                self.models[model_name] = True
                print(f"✅ {model_name} carregado na RAM")
            
            return model_name
    
    def preload_all(self, model_names: List[str]):
        """Pré-carrega todos os modelos"""
        print("🔥 Pré-carregando modelos...")
        for model in model_names:
            self.get_or_load(model)
        print("✅ Todos os modelos prontos!\n")

# Uso
pool = ModelPool()
pool.preload_all([
    'llama3.2-vision:11b',
    'gemma3:4b',
    'gpt-oss:20b'
])
```

---

### Estratégia 4: Workflow Inteligente

#### 4.1 Decisão Dinâmica de Modelos

```python
def select_best_model_for_image(image_path: Path) -> str:
    """
    Seleciona modelo mais adequado baseado em características da imagem
    """
    from PIL import Image
    
    img = Image.open(image_path)
    width, height = img.size
    file_size = image_path.stat().st_size
    
    # Imagens grandes e complexas → modelo mais poderoso
    if width > 2000 or height > 2000 or file_size > 5_000_000:
        return 'llama3.2-vision:90b'  # Melhor qualidade
    
    # Imagens médias → modelo balanceado
    elif width > 1000 or file_size > 1_000_000:
        return 'llama3.2-vision:11b'  # Recomendado
    
    # Imagens pequenas e simples → modelo rápido
    else:
        return 'gemma3:4b'  # Se tiver capacidade de visão
```

#### 4.2 Pipeline Híbrido Otimizado

```python
def optimized_hybrid_pipeline(image_path: Path) -> Dict:
    """
    Pipeline otimizado com paralelização estratégica
    """
    
    # ETAPA 1: Visão (gargalo) - executar primeiro
    print(f"🔍 Análise visual...")
    vision_start = time.time()
    vision_result = extract_with_cache(
        optimize_image_for_vision(image_path),
        'llama3.2-vision:11b'
    )
    vision_time = time.time() - vision_start
    print(f"   ✅ Visão completa: {vision_time:.1f}s")
    
    # ETAPA 2: Processamento paralelo de texto
    print(f"📝 Enriquecimento paralelo...")
    text_start = time.time()
    
    with ThreadPoolExecutor(max_workers=3) as executor:
        # Executar em paralelo
        future_normalize = executor.submit(
            normalize_with_gemma3, 
            vision_result, 
            'gemma3:4b'
        )
        
        future_enrich = executor.submit(
            enrich_with_gemma3,
            vision_result,
            'gemma3:4b'
        )
        
        future_validate = executor.submit(
            validate_with_pvlib,
            vision_result
        )
        
        # Aguardar conclusão
        normalized = future_normalize.result()
        enriched = future_enrich.result()
        validated = future_validate.result()
    
    text_time = time.time() - text_start
    print(f"   ✅ Texto completo: {text_time:.1f}s")
    
    # ETAPA 3: Combinação final
    final_result = {
        'vision': vision_result,
        'normalized': normalized,
        'enriched': enriched,
        'validated': validated,
        'processing_times': {
            'vision': vision_time,
            'text': text_time,
            'total': vision_time + text_time
        }
    }
    
    print(f"✅ Total: {final_result['processing_times']['total']:.1f}s\n")
    
    return final_result
```

---

### Estratégia 5: Aceleração por GPU

#### 5.1 Configuração Otimizada

```bash
# Configurar Ollama para usar GPU otimamente
export OLLAMA_GPU_LAYERS=33        # Todas as camadas
export OLLAMA_NUM_GPU=1             # Usar 1 GPU
export OLLAMA_MAX_LOADED_MODELS=3   # Manter 3 modelos na VRAM
export OLLAMA_FLASH_ATTENTION=1     # Flash attention (mais rápido)
```

#### 5.2 Verificação de GPU

```python
def check_gpu_status():
    """Verifica se GPU está sendo usada"""
    try:
        result = subprocess.run(
            ['ollama', 'ps'],
            capture_output=True,
            text=True
        )
        
        print("📊 Status Ollama:")
        print(result.stdout)
        
        # Verificar NVIDIA
        gpu_result = subprocess.run(
            ['nvidia-smi', '--query-gpu=name,memory.used,memory.total', '--format=csv'],
            capture_output=True,
            text=True
        )
        
        print("\n🎮 Status GPU:")
        print(gpu_result.stdout)
        
    except Exception as e:
        print(f"⚠️  Não foi possível verificar GPU: {e}")
```

**Ganho esperado com GPU**: 2-3x mais rápido (30s → 10-15s)

---

## 📊 Comparativo de Performance

### Cenários de Otimização

| Otimização | Tempo/Img | Ganho | Cumulative |
|-----------|-----------|-------|------------|
| **Baseline** (atual) | 107s | - | 107s |
| + Warmup | 48s | -55% | 48s |
| + Prompt otimizado | 36s | -25% | 36s |
| + Parâmetros | 30s | -17% | 30s |
| + Compressão imagem | 27s | -10% | 27s |
| + Cache (2ª execução) | 0.1s | -99.6% | 0.1s |
| + GPU | 10s | -63% | 10s |
| + Paralelização 3x | 3.3s | -67% | 3.3s |

### Tempo Total para Catálogo (854 produtos)

| Cenário | Tempo/Produto | Tempo Total | Vs Baseline |
|---------|---------------|-------------|-------------|
| **Atual** | 120s | 28.5h | - |
| **Otimizado** | 35s | 8.3h | **-71%** ⚡⚡ |
| **+ GPU** | 15s | 3.6h | **-87%** 🚀 |
| **+ Paralelo 3x** | 5s | 1.2h | **-96%** 🔥 |

---

## 🎬 Implementação por Fases

### Fase 1: Quick Wins (Hoje - 2h)

**Implementar**:
- ✅ Warmup do modelo
- ✅ Prompt minimalista
- ✅ Parâmetros otimizados
- ✅ Cache básico

**Script**: `process-images-optimized-v1.py`

**Ganho esperado**: 107s → 35s (-67%)

```bash
python scripts/process-images-optimized-v1.py --test 10
```

### Fase 2: Parallelização (Amanhã - 4h)

**Implementar**:
- ✅ ThreadPoolExecutor
- ✅ Pipeline assíncrono
- ✅ Processamento em lote

**Script**: `process-images-parallel-v2.py`

**Ganho esperado**: 35s → 12s (-66% adicional)

```bash
python scripts/process-images-parallel-v2.py --workers 3 --batch 50
```

### Fase 3: GPU Acceleration (Esta Semana - 1 dia)

**Implementar**:
- ✅ Configuração GPU otimizada
- ✅ Monitoramento de VRAM
- ✅ Batch processing na GPU

**Ganho esperado**: 12s → 4-5s (-60% adicional)

```bash
OLLAMA_GPU_LAYERS=33 python scripts/process-images-gpu-v3.py --all
```

### Fase 4: Produção (Quando validado)

**Implementar**:
- ✅ Script completo integrado
- ✅ Monitoramento em tempo real
- ✅ Recuperação de erros
- ✅ Relatórios automáticos

**Meta final**: **854 produtos em 1-2 horas**

```bash
python scripts/process-full-catalog.py \
  --optimize \
  --gpu \
  --parallel 3 \
  --cache \
  --output data/enriched_catalog
```

---

## 📈 Métricas de Sucesso

### Objetivos Técnicos

- ✅ Tempo médio < 10s por produto
- ✅ Throughput > 300 produtos/hora
- ✅ Taxa de sucesso > 98%
- ✅ Hit rate de cache > 50% em re-runs
- ✅ Uso de GPU > 80%

### Objetivos de Negócio

- ✅ Catálogo completo < 3 horas
- ✅ Custo operacional: R$ 0 (tudo local)
- ✅ Qualidade de dados > 95%
- ✅ Re-processamento < 30min

---

## 💡 Conclusão

### Situação Atual
- ⏱️ 120s/produto
- 🕐 28.5 horas para catálogo completo
- 🐌 Gargalo: Llama Vision (85% do tempo)

### Após Otimizações
- ⏱️ **5-10s/produto** (-95%)
- 🕐 **1-2 horas para catálogo** (-96%)
- 🚀 **Throughput: 300-500 produtos/hora**

### Próxima Ação

```bash
# Testar otimizações com 10 imagens
python scripts/create-optimized-processor.py
python scripts/process-images-optimized-v1.py --test 10 --verbose
```

---

**Autor**: YSH AI Team  
**Data**: 13/10/2025  
**Versão**: 1.0  
**Status**: Ready for Implementation
