# 🤖 Guia de Instalação: IA para Análise de Imagens

## 📋 Visão Geral

Este guia mostra como configurar **Ollama + LLaVA** para análise inteligente de imagens de produtos fotovoltaicos usando IA local (sem custos de API).

---

## ⚙️ Requisitos Mínimos

### Hardware

- **RAM**: 16 GB (mínimo)
- **VRAM**: 8 GB (placa NVIDIA/AMD recomendada)
  - RTX 3070 / RTX 4060 ou superior
  - RX 6700 XT ou superior
- **Storage**: 10 GB livres

### Software

- Windows 10/11 ou Linux
- Python 3.10+
- PowerShell ou Bash

---

## 🚀 Instalação Passo a Passo

### 1️⃣ Instalar Ollama

#### Windows

```powershell
# Download do instalador
Invoke-WebRequest -Uri "https://ollama.ai/download/windows" -OutFile "OllamaSetup.exe"

# Executar instalador
.\OllamaSetup.exe

# Verificar instalação
ollama --version
```

#### Linux/MacOS

```bash
# Instalação automática
curl -fsSL https://ollama.ai/install.sh | sh

# Verificar instalação
ollama --version
```

### 2️⃣ Baixar Modelo LLaVA

```bash
# OPÇÃO 1: LLaVA 13B (RECOMENDADO - 8GB VRAM)
ollama pull llava:13b

# OPÇÃO 2: LLaVA 7B (mais rápido - 4GB VRAM)
ollama pull llava:7b

# OPÇÃO 3: LLaVA 34B (máxima qualidade - 24GB VRAM)
ollama pull llava:34b
```

**Tempo de download**: 5-15 minutos (dependendo da conexão)

### 3️⃣ Iniciar Servidor Ollama

```bash
# Terminal separado - deixar rodando
ollama serve
```

**Porta padrão**: `http://localhost:11434`

### 4️⃣ Instalar SDK Python

```bash
# Instalar biblioteca Ollama
pip install ollama

# Verificar instalação
python -c "import ollama; print('Ollama OK!')"
```

---

## 🧪 Teste Rápido

### Teste Manual (CLI)

```bash
# Testar com uma imagem
ollama run llava:13b "Descreva esta imagem" < caminho/para/imagem.jpg

# Exemplo prático
ollama run llava:13b "Qual o fabricante e modelo deste inversor?" < static/images-catálogo_distribuidores/ODEX-INVERTERS/276954.jpg
```

### Teste Automatizado (Python)

```bash
# Executar script de teste completo
python scripts/test-ai-image-analysis.py
```

**Menu do script**:

1. **Testar imagem única** - Análise detalhada de 1 imagem
2. **Testar lote** - Processa 5 imagens aleatórias
3. **Comparar IA vs Manual** - Valida precisão da IA
4. **Todos os testes** - Suite completa

---

## 📊 Exemplo de Uso

### Análise de Imagem Única

```python
import ollama
from pathlib import Path

# Configurar prompt
prompt = """Extraia metadados desta imagem de produto solar:
- Fabricante
- Modelo
- Potência (kW)
- Tipo (inversor/painel/bateria)
"""

# Analisar
response = ollama.chat(
    model='llava:13b',
    messages=[{
        'role': 'user',
        'content': prompt,
        'images': ['static/images/produto.jpg']
    }]
)

print(response['message']['content'])
```

**Saída esperada**:

```json
{
  "manufacturer": "SAJ",
  "model": "R5-3K-T2",
  "power": "3 kW",
  "type": "inverter",
  "category": "gridtie"
}
```

---

## 🎯 Casos de Uso

### 1. Extração Automática de Metadados

- **Problema**: 576 imagens sem informações no banco
- **Solução**: IA identifica fabricante, modelo e potência da imagem
- **Resultado**: Nomenclatura padronizada automática

### 2. Classificação de Tipo de Imagem

- **Tipos detectados**: Logo simples, Diagrama técnico, Foto produto, Render 3D
- **Aplicação**: Aplicar perfil de otimização específico por tipo

### 3. Análise de Qualidade

- **Métricas**: Nitidez, iluminação, legibilidade de texto
- **Score**: 1-10 com sugestões de melhoria
- **Decisão**: Manter original ou reprocessar

### 4. Geração de Nomes de Arquivo

- **Entrada**: Imagem com logo "Growatt" e texto "5000TL"
- **Saída**: `GROWATT-INV-GRIDTIE-5000TL-5KW-ODEX.webp`

### 5. Detecção de Problemas

- **IA identifica**:
  - Imagem desfocada
  - Logo cortada
  - Baixo contraste
  - Texto ilegível

---

## 📈 Performance

### Benchmarks (LLaVA 13B)

| Hardware | Tempo/Imagem | Imagens/Hora |
|----------|--------------|--------------|
| RTX 4090 | 1.2s | 3000 |
| RTX 4070 | 2.5s | 1440 |
| RTX 3070 | 3.0s | 1200 |
| RTX 3060 | 4.5s | 800 |

**Para processar 854 imagens**:

- RTX 4090: ~17 minutos
- RTX 3070: ~43 minutos
- CPU only: ~6 horas

---

## 🔧 Troubleshooting

### Erro: "connection refused"

```bash
# Verificar se Ollama está rodando
ollama ps

# Se não estiver, iniciar
ollama serve
```

### Erro: "out of memory"

```bash
# Usar modelo menor
ollama pull llava:7b

# Ou liberar VRAM (fechar jogos, Chrome, etc)
```

### Erro: "model not found"

```bash
# Listar modelos instalados
ollama list

# Reinstalar se necessário
ollama pull llava:13b
```

### Performance lenta

```bash
# Verificar uso de GPU
nvidia-smi  # Windows/Linux com NVIDIA

# Se usando CPU, considerar:
# 1. Modelo menor (llava:7b)
# 2. Processar em lote menor
# 3. Rodar overnight
```

---

## 🔄 Workflow Completo

### Pipeline Integrado

```
1. IMAGEM ORIGINAL
   ↓
2. ANÁLISE IA (LLaVA)
   - Extrai: fabricante, modelo, potência, tipo
   - Classifica: logo/diagrama/foto/render
   - Avalia: qualidade (1-10)
   ↓
3. NOMENCLATURA INTELIGENTE
   - Gera: FABRICANTE-CAT-TIPO-MODELO-POT-DIST.webp
   - Exemplo: SAJ-INV-GRIDTIE-R5-3K-T2-3KW-ODEX.webp
   ↓
4. PROCESSAMENTO ADEQUADO
   - Logo: qualidade 95, sharpening suave
   - Diagrama: qualidade 90, contraste +10%
   - Foto: qualidade 85, redimensionar
   ↓
5. RESPONSIVO (4 TAMANHOS)
   - Original, Large (1200px), Medium (800px), Thumb (400px)
   ↓
6. UPDATE IMAGE_MAP v5.0
   - SKU mapeado para nome inteligente
   - Paths de todas versões responsivas
   - Metadados extraídos pela IA
```

### Script Único de Processamento

```bash
# Futuro: script integrado
python scripts/ai-full-pipeline.py --input static/images-raw/ --output static/images-responsive/

# Fará automaticamente:
# 1. Análise por IA
# 2. Renomeação inteligente
# 3. Processamento otimizado
# 4. Geração responsiva
# 5. Atualização IMAGE_MAP
```

---

## 📝 Próximos Passos

### Fase 1: Validação (Esta Semana)

- [x] Instalar Ollama + LLaVA 13B
- [ ] Rodar `python scripts/test-ai-image-analysis.py`
- [ ] Analisar 10 imagens de teste
- [ ] Validar precisão (>90% de acertos)

### Fase 2: Integração (Próxima Semana)

- [ ] Criar `scripts/ai-full-pipeline.py`
- [ ] Integrar com `rename-images-intelligent.py`
- [ ] Integrar com `generate-responsive-images.py`
- [ ] Processar lote teste de 50 imagens

### Fase 3: Produção (2 Semanas)

- [ ] Processar todas 854 imagens
- [ ] Upgrade IMAGE_MAP v5.0
- [ ] Documentar metadados extraídos
- [ ] Deploy com novas nomenclaturas

---

## 💰 Comparação de Custos

### Opção 1: IA Local (Ollama)

- **Custo**: R$ 0
- **Setup**: ~30 minutos
- **Requisito**: GPU 8GB VRAM
- **Privacidade**: Total (dados não saem da máquina)

### Opção 2: API OpenAI GPT-4 Vision

- **Custo**: ~R$ 1,70 por 854 imagens (US$ 0.01/imagem)
- **Setup**: 5 minutos
- **Requisito**: Internet + API key
- **Privacidade**: Imagens enviadas para OpenAI

### Opção 3: API Google Gemini Vision

- **Custo**: Gratuito até 60 req/min
- **Setup**: 5 minutos
- **Requisito**: Internet + Google Cloud
- **Privacidade**: Imagens enviadas para Google

**Recomendação**: Ollama para desenvolvimento, OpenAI para produção (se precisar de escala).

---

## 🔒 Segurança e Privacidade

### Ollama (IA Local)

✅ **Vantagens**:

- Dados nunca saem do servidor
- Sem riscos de vazamento
- Não depende de internet
- Sem limites de requisições

❌ **Desvantagens**:

- Requer hardware dedicado
- Manutenção manual de modelos

### APIs Cloud

✅ **Vantagens**:

- Sem necessidade de GPU
- Sempre atualizado
- Escalável instantaneamente

❌ **Desvantagens**:

- Imagens enviadas para terceiros
- Custos recorrentes
- Depende de internet

---

## 📚 Referências

- **Ollama Docs**: <https://ollama.ai/docs>
- **LLaVA Paper**: <https://llava-vl.github.io/>
- **Modelos**: <https://ollama.ai/library>
- **GitHub Ollama**: <https://github.com/ollama/ollama>
- **Python SDK**: <https://github.com/ollama/ollama-python>

---

## 🆘 Suporte

### Problemas Comuns

1. **GPU não detectada**: Instalar drivers NVIDIA/AMD atualizados
2. **Modelo lento**: Reduzir para `llava:7b`
3. **Erro de memória**: Fechar outros programas

### Contatos

- **Issues**: Abrir issue no repositório
- **Docs**: Ver `docs/AI_IMAGE_EVOLUTION.md`
- **Logs**: `ollama logs` para debug

---

**✅ Setup completo! Próximo passo**: Executar testes com `python scripts/test-ai-image-analysis.py`
