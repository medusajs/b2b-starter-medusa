# 🔍 Diagnóstico: Problema com LLaVA e Imagens

**Data**: 13 de Janeiro de 2025  
**Status**: ❌ LLaVA travando ao processar imagens

---

## 📊 Situação Atual

### ✅ O Que Funciona

- ✅ Ollama instalado (v0.12.5)
- ✅ LLaVA 7B instalado (4.7 GB)
- ✅ GPT-OSS 20B instalado (13 GB)
- ✅ LLaVA responde a texto simples (4.35s)
- ✅ Biblioteca Python ollama funcional

### ❌ O Que Não Funciona

- ❌ LLaVA trava ao processar imagens
- ❌ Erro: "model runner has unexpectedly stopped"
- ❌ Status code: 500

---

## 🔍 Diagnóstico do Problema

### Causa Provável: **Limitação de Recursos**

O erro "model runner has unexpectedly stopped" indica que:

1. **Memória Insuficiente no Momento da Execução**
   - LLaVA 7B precisa de ~8 GB RAM durante processamento de imagem
   - Mais ~2-3 GB para carregar a imagem
   - Total: ~10-12 GB apenas para o modelo

2. **CPU Sem Aceleração GPU**
   - PyTorch detectado: **CPU only** (sem CUDA)
   - Processamento de visão é MUITO pesado em CPU
   - LLaVA espera GPU para imagens

3. **Conflito com Outros Processos**
   - GPT-OSS 20B (13 GB) pode estar em memória
   - Servidor Ollama pode ter múltiplas instâncias
   - RAM fragmentada

---

## 💡 Soluções Possíveis

### Solução 1: **Usar BakLLaVA (Mais Leve)** ⭐ RECOMENDADO

```bash
# Remover LLaVA 7B
ollama rm llava:7b

# Baixar BakLLaVA (otimizado para CPU)
ollama pull bakllava

# Testar
python scripts/test-llava-quick.py
```

**Vantagens**:

- Modelo mais otimizado para CPU
- Menor uso de memória (~3 GB)
- Mais rápido (~1-2s por imagem)

### Solução 2: **Usar LLaVA 13B com Quantização** ⭐⭐

```bash
# Usar versão quantizada (Q4)
ollama pull llava:13b-q4
```

**Vantagens**:

- Melhor qualidade que 7B
- Menor uso de memória (~6 GB vs 8 GB)
- Compatível com CPU

### Solução 3: **Usar Moondream (Ultra Leve)** ⭐⭐⭐

```bash
# Modelo ultra leve para visão
ollama pull moondream

# Apenas 1.7 GB!
```

**Vantagens**:

- Extremamente leve (1.7 GB)
- Rápido em CPU
- Ideal para testes

**Desvantagens**:

- Qualidade inferior
- Menos detalhes

### Solução 4: **APIs Cloud (Sem Hardware Local)** ⭐⭐⭐⭐

#### Opção A: OpenAI GPT-4 Vision

```python
import openai

response = openai.chat.completions.create(
    model="gpt-4-vision-preview",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "Extraia fabricante e modelo"},
            {"type": "image_url", "image_url": {"url": "..."}}
        ]
    }]
)
```

**Custo**: ~US$ 0.01 por imagem × 854 = **US$ 8.54**

#### Opção B: Google Gemini Vision (GRATUITO)

```python
import google.generativeai as genai

model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content([
    "Extraia fabricante e modelo",
    image
])
```

**Custo**: **GRATUITO** até 60 requisições/minuto

---

## 🎯 Recomendação Final

### **Estratégia Híbrida** (Melhor Custo-Benefício)

```
1. TENTAR: BakLLaVA ou Moondream localmente
   ├─ Custo: R$ 0
   ├─ Se funcionar: processar localmente
   └─ Se travar: ir para passo 2

2. ALTERNATIVA: Google Gemini Vision (Gratuito)
   ├─ Custo: R$ 0
   ├─ 854 imagens ÷ 60/min = ~15 minutos
   └─ Qualidade excelente

3. BACKUP: OpenAI GPT-4 Vision
   ├─ Custo: ~R$ 42 (US$ 8.54)
   ├─ Altíssima qualidade
   └─ Rápido (10-15 minutos)
```

---

## 📝 Comandos para Tentar Agora

### Teste 1: BakLLaVA

```bash
ollama rm llava:7b
ollama pull bakllava
python scripts/test-llava-quick.py
```

### Teste 2: Moondream

```bash
ollama rm llava:7b
ollama pull moondream
# Editar script para usar 'moondream'
python scripts/test-llava-quick.py
```

### Teste 3: Google Gemini (API)

```bash
pip install google-generativeai
# Criar script test-gemini-vision.py
python scripts/test-gemini-vision.py
```

---

## 🔄 Comparação de Opções

| Solução | Custo | Velocidade | Qualidade | Viabilidade |
|---------|-------|------------|-----------|-------------|
| **BakLLaVA** | R$ 0 | ⭐⭐⭐ | ⭐⭐⭐⭐ | 🟡 Tentar |
| **Moondream** | R$ 0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | 🟡 Tentar |
| **Gemini** | R$ 0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ RECOMENDADO |
| **GPT-4V** | R$ 42 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Se tiver budget |
| **LLaVA 7B** | R$ 0 | ❌ Trava | - | ❌ Não funciona |
| **LLaVA 13B** | R$ 0 | ❌ Trava | - | ❌ Não funciona |

---

## 🚀 Próximo Passo Imediato

**Execute este comando agora**:

```bash
# Opção 1: Testar BakLLaVA
ollama pull bakllava

# OU Opção 2: Testar Moondream
ollama pull moondream

# OU Opção 3: Usar Google Gemini (gratuito)
pip install google-generativeai
```

**Qual você quer testar primeiro?**

1. BakLLaVA (otimizado para CPU)
2. Moondream (ultra leve)
3. Google Gemini Vision (cloud gratuito)
4. OpenAI GPT-4 Vision (cloud pago)

---

## 📚 Recursos Adicionais

- **Ollama Models**: <https://ollama.com/library>
- **Google Gemini API**: <https://ai.google.dev/tutorials/python_quickstart>
- **OpenAI Vision API**: <https://platform.openai.com/docs/guides/vision>

---

**🎯 Conclusão**: LLaVA não está funcionando para imagens neste hardware. Recomendo testar **Google Gemini Vision GRATUITO** como melhor alternativa.
