# 🤖 IA Local para Evolução de Imagens - Análise de Viabilidade

## 📦 Extensão: Python Image Preview (076923.python-image-preview)

### Funcionalidades Nativas

#### 1. **Preview de Múltiplos Formatos**

- ✅ NumPy arrays (`.npy`, `.npz`)
- ✅ Pillow/PIL images
- ✅ OpenCV images (BGR/RGB)
- ✅ Matplotlib figures
- ✅ Plotly plots
- ✅ ImageIO
- ✅ Scikit-Image
- ✅ TensorFlow tensors
- ✅ PyTorch tensors

#### 2. **Visualização Interativa**

```python
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

# Preview direto no VSCode
img = Image.open('produto.jpg')
# Hover ou comando para visualizar

arr = np.array(img)
# Preview de arrays NumPy automaticamente
```

#### 3. **Integração com Notebooks**

- Preview inline em Jupyter notebooks
- Suporte a múltiplos backends de visualização
- Debugging visual de tensores

---

## 🧠 Modelos de IA Local - Análise Técnica

### 🦙 **Ollama - Modelos Multimodais**

#### Modelos Disponíveis (Outubro 2025)

##### 1. **LLaVA 1.6 (34B)** ⭐ RECOMENDADO

```bash
ollama pull llava:34b
```

**Capacidades:**

- ✅ Análise detalhada de imagens de produtos
- ✅ Descrição automática de características
- ✅ Detecção de logos e textos em painéis
- ✅ Identificação de tipo de produto (inversor, painel, kit)
- ✅ Extração de especificações visíveis (potência, modelo)
- ✅ Avaliação de qualidade da imagem

**Exemplo de Uso:**

```python
import ollama

response = ollama.chat(
    model='llava:34b',
    messages=[{
        'role': 'user',
        'content': 'Analise esta imagem de produto solar. Identifique: tipo de produto, fabricante visível, potência, qualidade da imagem (1-10).',
        'images': ['produto.jpg']
    }]
)

print(response['message']['content'])
# Output: "Este é um inversor grid-tie da marca SAJ, modelo R5-3K-T2. 
#          A potência nominal é 3kW (visível no rótulo frontal). 
#          Qualidade da imagem: 8/10 - boa resolução, logo nítido, 
#          fundo limpo. Sugestões: aumentar contraste do texto inferior."
```

**Requisitos:**

- RAM: 32GB mínimo (modelo 34B)
- VRAM: 24GB GPU (recomendado RTX 4090)
- CPU: AMD Ryzen 9 / Intel i9 (sem GPU)

##### 2. **LLaVA 1.6 (13B)** 💡 BALANCEADO

```bash
ollama pull llava:13b
```

**Capacidades:**

- ✅ Análise rápida de produtos
- ✅ Descrição básica de características
- ✅ Detecção de tipo de produto
- ⚠️ Menos preciso em especificações técnicas
- ✅ Boa relação performance/qualidade

**Requisitos:**

- RAM: 16GB mínimo
- VRAM: 8GB GPU (RTX 3070+)

##### 3. **BakLLaVA (7B)** 🚀 RÁPIDO

```bash
ollama pull bakllava
```

**Capacidades:**

- ✅ Preview rápido de imagens
- ✅ Classificação básica
- ⚠️ Limitado em detalhes técnicos
- ✅ Ideal para triagem inicial

**Requisitos:**

- RAM: 8GB mínimo
- VRAM: 4GB GPU (RTX 3060)

---

### 🔓 **Modelos Open Source 20B+**

#### 1. **CogVLM (17B Visual + 17B Language)** ⭐ MELHOR OSS

```bash
# Instalação via HuggingFace
pip install transformers accelerate
```

**Capacidades:**

- ✅ Estado da arte em compreensão visual
- ✅ OCR nativo (leitura de textos em produtos)
- ✅ Reasoning visual complexo
- ✅ Detecção precisa de componentes
- ✅ Análise de diagramas técnicos

**Exemplo:**

```python
from transformers import AutoModelForCausalLM, AutoTokenizer
from PIL import Image

model = AutoModelForCausalLM.from_pretrained(
    "THUDM/cogvlm-chat-hf",
    torch_dtype=torch.bfloat16,
    trust_remote_code=True
)

query = "Identifique o fabricante, modelo e potência deste inversor"
image = Image.open("inversor.jpg")

response = model.chat(tokenizer, image, query)
# "Fabricante: SAJ, Modelo: R5-3K-T2, Potência: 3000W"
```

**Requisitos:**

- VRAM: 40GB (A100) ou 2x RTX 4090
- RAM: 64GB

#### 2. **BLIP-2 (OPT-6.7B)** 💼 ESPECIALIZADO

```python
from transformers import Blip2Processor, Blip2ForConditionalGeneration

processor = Blip2Processor.from_pretrained("Salesforce/blip2-opt-6.7b")
model = Blip2ForConditionalGeneration.from_pretrained("Salesforce/blip2-opt-6.7b")

# Geração de captions
inputs = processor(images=image, return_tensors="pt")
outputs = model.generate(**inputs)
caption = processor.decode(outputs[0], skip_special_tokens=True)
```

**Capacidades:**

- ✅ Excelente para descrições de produtos
- ✅ Image captioning automático
- ✅ Visual question answering
- ⚠️ Menos preciso em OCR

**Requisitos:**

- VRAM: 16GB (RTX 4080)
- RAM: 32GB

#### 3. **Qwen-VL (9.6B)** 🇨🇳 MULTILINGUAL

```python
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen-VL-Chat",
    trust_remote_code=True
)
```

**Capacidades:**

- ✅ Suporte a português nativo
- ✅ Bom OCR para textos PT-BR
- ✅ Compreensão de contexto brasileiro
- ✅ Análise de produtos locais

---

## 🎯 Casos de Uso para YSH Store

### 1. **Análise Automática de Qualidade** 🔍

```python
def analyze_image_quality_ai(image_path):
    """Usa LLaVA para avaliar qualidade da imagem"""
    
    prompt = """Analise esta imagem de produto fotovoltaico:
    
    1. Qualidade da foto (1-10): resolução, nitidez, iluminação
    2. Problemas detectados: desfoque, baixo contraste, reflexos
    3. Logo do fabricante: visível (sim/não), nítido (sim/não)
    4. Informações legíveis: rótulos, especificações, textos
    5. Sugestões de melhoria
    
    Responda em formato JSON."""
    
    response = ollama.chat(
        model='llava:34b',
        messages=[{
            'role': 'user',
            'content': prompt,
            'images': [image_path]
        }]
    )
    
    return json.loads(response['message']['content'])
```

**Output Esperado:**

```json
{
  "quality_score": 8,
  "problems": ["leve reflexo no canto superior", "texto inferior levemente desfocado"],
  "logo_visible": true,
  "logo_sharp": true,
  "text_readable": ["SAJ", "R5-3K-T2", "3000W"],
  "suggestions": [
    "Aumentar contraste em 10%",
    "Aplicar leve sharpen no texto inferior",
    "Crop para remover bordas desnecessárias"
  ]
}
```

### 2. **Extração Inteligente de Metadados** 📝

```python
def extract_product_metadata_ai(image_path):
    """Extrai informações do produto usando IA"""
    
    prompt = """Extraia as seguintes informações desta imagem:
    
    - Fabricante (marca)
    - Categoria (inversor/painel/bateria/kit)
    - Tipo (grid-tie/híbrido/off-grid/micro para inversores; mono/bifacial para painéis)
    - Modelo (código exato)
    - Potência (em W ou kW)
    - Tecnologia visível (ex: MPPT, N-Type, etc)
    
    Retorne JSON estruturado."""
    
    response = ollama.chat(
        model='llava:34b',
        messages=[{
            'role': 'user',
            'content': prompt,
            'images': [image_path]
        }]
    )
    
    return json.loads(response['message']['content'])
```

**Output Esperado:**

```json
{
  "manufacturer": "SAJ",
  "category": "inverter",
  "type": "grid-tie",
  "model": "R5-3K-T2",
  "power": "3000W",
  "power_kw": 3.0,
  "technology": ["2 MPPT", "Monofásico", "220V"],
  "confidence": 0.95
}
```

### 3. **Detecção de Tipo de Imagem** 🎨

```python
def detect_image_type_ai(image_path):
    """Classifica tipo de imagem (logo simples, diagrama, foto real, render)"""
    
    prompt = """Classifique esta imagem em uma das categorias:
    
    1. logo_simples: Logo/produto em fundo branco, sem detalhes complexos
    2. diagrama_tecnico: Diagrama, esquema, desenho técnico
    3. produto_fotografia: Foto real do produto, iluminação natural
    4. produto_render: Renderização 3D, CGI, imagem sintética
    
    Retorne apenas a categoria."""
    
    response = ollama.chat(
        model='llava:13b',  # Modelo menor suficiente para classificação
        messages=[{
            'role': 'user',
            'content': prompt,
            'images': [image_path]
        }]
    )
    
    return response['message']['content'].strip()
```

**Integração com Perfis de Otimização:**

```python
IMAGE_OPTIMIZATION_PROFILES = {
    'logo_simples': {'quality': 98, 'denoise': 0, 'sharpen': 0},
    'diagrama_tecnico': {'quality': 95, 'denoise': 1, 'sharpen': 0},
    'produto_fotografia': {'quality': 90, 'denoise': 2, 'sharpen': 0.5},
    'produto_render': {'quality': 88, 'denoise': 3, 'sharpen': 1.0}
}

image_type = detect_image_type_ai(image_path)
profile = IMAGE_OPTIMIZATION_PROFILES[image_type]
```

### 4. **Geração Automática de Nomenclatura** 🏷️

```python
def generate_filename_ai(image_path):
    """Gera nome padronizado usando IA"""
    
    metadata = extract_product_metadata_ai(image_path)
    
    # Formato: FABRICANTE-CATEGORIA-TIPO-MODELO-POTENCIA
    parts = [
        metadata.get('manufacturer', 'UNKNOWN'),
        metadata['category'][:3].upper(),  # INV, PAN, etc
        metadata.get('type', ''),
        metadata.get('model', ''),
        f"{metadata.get('power_kw', '')}KW" if metadata.get('power_kw') else ''
    ]
    
    filename = '-'.join([p for p in parts if p])
    
    return filename + '.webp'
```

### 5. **Sugestões de Melhoria Automática** 🎯

```python
def suggest_improvements_ai(image_path):
    """IA sugere melhorias específicas"""
    
    prompt = """Como especialista em fotografia de produtos, analise esta imagem e sugira:
    
    1. Ajustes de cor (saturação, temperatura, contraste)
    2. Recorte ideal (aspect ratio, margens)
    3. Correções de perspectiva
    4. Remoção de elementos indesejados
    5. Melhorias de nitidez específicas
    
    Seja específico com valores numéricos quando possível."""
    
    response = ollama.chat(
        model='llava:34b',
        messages=[{
            'role': 'user',
            'content': prompt,
            'images': [image_path]
        }]
    )
    
    return response['message']['content']
```

---

## 🚀 Pipeline Proposto: IA + Processamento Tradicional

### Arquitetura

```
┌─────────────────┐
│  Imagem Original │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────┐
│  1. Análise IA (LLaVA)  │ ← Extração de metadados
│  - Fabricante           │   Tipo de imagem
│  - Modelo               │   Avaliação de qualidade
│  - Potência             │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  2. Classificação       │ ← Determina perfil
│  - logo_simples         │   de otimização
│  - diagrama_tecnico     │
│  - produto_fotografia   │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  3. Processamento       │ ← OpenCV + Pillow
│  - Perfil específico    │   com parâmetros
│  - Quality 88-98        │   ajustados por IA
│  - Denoise 0-3          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  4. Nomenclatura        │ ← Nome padronizado
│  FABRICANTE-CAT-MODELO  │   gerado por IA
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  5. Versões Responsivas │ ← 4 tamanhos
│  original/large/med/th  │   (1200/800/400)
└─────────────────────────┘
```

### Script Integrado

```python
#!/usr/bin/env python3
"""
Pipeline Inteligente de Processamento de Imagens
Combina IA local (Ollama) + processamento tradicional
"""

import ollama
from PIL import Image
import cv2
import json


class AIImageProcessor:
    def __init__(self, model='llava:13b'):
        self.model = model
    
    def process_image(self, image_path, distributor='ODEX'):
        """Pipeline completo de processamento"""
        
        print(f'🤖 Analisando com IA: {image_path}')
        
        # 1. Extração de metadados por IA
        metadata = self.extract_metadata_ai(image_path)
        print(f'   Fabricante: {metadata.get("manufacturer")}')
        print(f'   Modelo: {metadata.get("model")}')
        print(f'   Potência: {metadata.get("power")}')
        
        # 2. Classificação de tipo
        image_type = self.classify_image_type(image_path)
        print(f'   Tipo detectado: {image_type}')
        
        # 3. Análise de qualidade
        quality = self.analyze_quality(image_path)
        print(f'   Qualidade: {quality["score"]}/10')
        
        # 4. Gerar nome padronizado
        filename = self.generate_standard_name(metadata, distributor)
        print(f'   Nome padronizado: {filename}')
        
        # 5. Selecionar perfil de otimização
        profile = self.select_optimization_profile(image_type, quality)
        print(f'   Perfil: quality={profile["quality"]}, denoise={profile["denoise"]}')
        
        # 6. Processar imagem
        output_path = self.optimize_image(image_path, filename, profile)
        
        return {
            'metadata': metadata,
            'type': image_type,
            'quality': quality,
            'filename': filename,
            'profile': profile,
            'output': output_path
        }
    
    def extract_metadata_ai(self, image_path):
        """Extrai metadados usando LLaVA"""
        
        prompt = """Extraia informações desta imagem de produto solar.
        Retorne JSON: {"manufacturer": "...", "category": "...", "model": "...", "power": "..."}"""
        
        try:
            response = ollama.chat(
                model=self.model,
                messages=[{
                    'role': 'user',
                    'content': prompt,
                    'images': [image_path]
                }]
            )
            
            return json.loads(response['message']['content'])
        except:
            return {}
    
    def classify_image_type(self, image_path):
        """Classifica tipo de imagem"""
        
        prompt = """Classifique esta imagem em UMA categoria:
        - logo_simples
        - diagrama_tecnico
        - produto_fotografia
        - produto_render
        Responda apenas a categoria."""
        
        try:
            response = ollama.chat(
                model=self.model,
                messages=[{
                    'role': 'user',
                    'content': prompt,
                    'images': [image_path]
                }]
            )
            
            return response['message']['content'].strip()
        except:
            return 'produto_fotografia'  # fallback
    
    def analyze_quality(self, image_path):
        """Analisa qualidade da imagem"""
        
        prompt = """Avalie a qualidade desta imagem (1-10).
        Retorne JSON: {"score": 8, "problems": ["..."]}"""
        
        try:
            response = ollama.chat(
                model=self.model,
                messages=[{
                    'role': 'user',
                    'content': prompt,
                    'images': [image_path]
                }]
            )
            
            return json.loads(response['message']['content'])
        except:
            return {'score': 7, 'problems': []}
    
    def generate_standard_name(self, metadata, distributor):
        """Gera nome padronizado"""
        
        parts = [
            metadata.get('manufacturer', 'UNKNOWN').upper(),
            metadata.get('category', 'PROD')[:3].upper(),
            metadata.get('model', '').upper(),
            metadata.get('power', '').upper(),
            distributor.upper()
        ]
        
        return '-'.join([p for p in parts if p])
    
    def select_optimization_profile(self, image_type, quality):
        """Seleciona perfil baseado em tipo e qualidade"""
        
        profiles = {
            'logo_simples': {'quality': 98, 'denoise': 0, 'sharpen': 0},
            'diagrama_tecnico': {'quality': 95, 'denoise': 1, 'sharpen': 0},
            'produto_fotografia': {'quality': 90, 'denoise': 2, 'sharpen': 0.5},
            'produto_render': {'quality': 88, 'denoise': 3, 'sharpen': 1.0}
        }
        
        profile = profiles.get(image_type, profiles['produto_fotografia'])
        
        # Ajustar baseado em qualidade
        if quality.get('score', 7) < 6:
            profile['denoise'] += 1
            profile['sharpen'] += 0.5
        
        return profile
    
    def optimize_image(self, input_path, filename, profile):
        """Otimiza imagem com perfil selecionado"""
        
        img = Image.open(input_path)
        
        # Processar com OpenCV se necessário
        if profile['denoise'] > 0 or profile['sharpen'] > 0:
            img_array = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
            
            if profile['denoise'] > 0:
                img_array = cv2.fastNlMeansDenoisingColored(img_array, None, profile['denoise'] * 3, 10, 7, 21)
            
            if profile['sharpen'] > 0:
                kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]]) * profile['sharpen']
                img_array = cv2.filter2D(img_array, -1, kernel)
            
            img = Image.fromarray(cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB))
        
        # Salvar
        output_path = f'static/images-ai-processed/{filename}.webp'
        img.save(output_path, 'WEBP', quality=profile['quality'], method=6)
        
        return output_path


# Uso
processor = AIImageProcessor(model='llava:13b')
result = processor.process_image('static/images-catálogo_distribuidores/ODEX-INVERTERS/276954.jpg', 'ODEX')
```

---

## 📊 Comparação de Modelos

| Modelo | Tamanho | VRAM | Velocidade | Qualidade | Recomendado Para |
|--------|---------|------|------------|-----------|------------------|
| **LLaVA 34B** | 34GB | 24GB | Lento (10s/img) | ⭐⭐⭐⭐⭐ | Produção, análise detalhada |
| **LLaVA 13B** | 13GB | 8GB | Médio (3s/img) | ⭐⭐⭐⭐ | **Recomendado** balanceado |
| **BakLLaVA 7B** | 7GB | 4GB | Rápido (1s/img) | ⭐⭐⭐ | Preview, triagem rápida |
| **CogVLM 34B** | 34GB | 40GB | Lento (15s/img) | ⭐⭐⭐⭐⭐ | Melhor OCR, texto técnico |
| **BLIP-2 6.7B** | 6.7GB | 16GB | Rápido (2s/img) | ⭐⭐⭐⭐ | Captions, descrições |
| **Qwen-VL 9.6B** | 9.6GB | 16GB | Médio (4s/img) | ⭐⭐⭐⭐ | Suporte PT-BR |

---

## 💡 Recomendação Final

### Setup Ideal para YSH Store

1. **Modelo Principal**: **LLaVA 13B** (Ollama)
   - Melhor custo-benefício
   - Roda em GPU mainstream (RTX 3070+)
   - Qualidade suficiente para metadados

2. **Backup**: **BLIP-2** (HuggingFace)
   - Para geração de descrições
   - Fallback quando Ollama indisponível

3. **Pipeline**:

   ```
   Imagem → LLaVA (metadados) → Perfil → OpenCV (processamento) → WebP (4 tamanhos)
   ```

### Próximos Passos

1. ✅ Instalar Ollama + LLaVA 13B
2. ✅ Criar script de teste com 10 imagens
3. ✅ Validar qualidade de extração vs manual
4. ✅ Integrar com pipeline existente
5. ✅ Processar lote completo (278 imagens)

**Última atualização**: 13 de outubro de 2025  
**Status**: 🎯 Pronto para Implementação
