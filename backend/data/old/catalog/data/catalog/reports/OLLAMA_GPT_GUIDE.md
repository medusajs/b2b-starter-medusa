# 🤖 OLLAMA GPT-OSS 20B - Guia de Uso

**Modelo:** gpt-oss:20b (13 GB)  
**Status:** ✅ Instalado e funcionando  
**Versão Ollama:** 0.12.3  
**Endpoint:** <http://localhost:11434>

---

## 🚀 QUICK START

### 1. Testar Conexão

```bash
cd c:\Users\fjuni\ysh_medusa\ysh-erp\scripts
python ollama_gpt.py test
```

### 2. Chat Interativo

```bash
python ollama_gpt.py chat
```

### 3. Melhorar Descrições de Produtos

```bash
python ollama_gpt.py enhance ../data/catalog/unified_schemas ../data/catalog/enhanced
```

---

## 📊 CASOS DE USO

### 1. Análise de Qualidade de Produtos

```python
from ollama_gpt import OllamaGPT

client = OllamaGPT()

# Analisar produto
product = {
    "name": "Inversor Growatt MIN 3000TL-X",
    "manufacturer": "GROWATT",
    "category": "inverters",
    "description": "Inversor monofásico 3kW com 2 MPPT"
}

analysis = client.analyze_product(product)

print(f"Confiança na categoria: {analysis['category_confidence']}")
print(f"Qualidade dos dados: {analysis['quality_score']}/10")
print(f"Melhorias sugeridas: {analysis['suggested_improvements']}")
```

**Output:**

```json
{
  "category_confidence": 0.95,
  "quality_score": 7,
  "suggested_improvements": [
    "Incluir especificações técnicas detalhadas",
    "Adicionar informações sobre dimensões e peso",
    "Fornecer dados de certificações"
  ],
  "key_features": [
    "Inversor monofásico",
    "Potência nominal de 3 kW",
    "Suporte a 2 MPPT"
  ]
}
```

---

### 2. Melhorar Descrições de Produtos

```python
client = OllamaGPT()

product = {
    "name": "Painel Solar Canadian 550W",
    "description": "Painel solar 550w bifacial",
    "specifications": {
        "potencia": "550W",
        "tipo": "Bifacial",
        "eficiencia": "21.2%"
    }
}

enhanced_desc = client.enhance_description(product)
print(enhanced_desc)
```

**Output:**

```
Painel Solar Canadian 550W - Módulo Fotovoltaico Bifacial de Alta Eficiência

Este painel solar bifacial de 550W combina tecnologia de ponta com desempenho 
superior, oferecendo eficiência de 21.2% e capacidade de captar energia solar 
em ambas as faces. Ideal para aplicações residenciais e comerciais que buscam 
maximizar a geração de energia renovável com menor área de instalação.

Características principais:
- Potência nominal: 550W
- Tecnologia bifacial para até 30% mais geração
- Eficiência superior: 21.2%
- Fabricante: Canadian Solar
```

---

### 3. Extração de Especificações

```python
client = OllamaGPT()

text = """
O inversor Growatt MIN 3000TL-X possui potência de 3000W, 
tensão de entrada de 80-550V, 2 MPPT independentes, 
eficiência máxima de 98.4% e dimensões 330x415x148mm.
Peso: 10.5kg
"""

specs = client.extract_specs(text, category="inverters")
print(specs)
```

**Output:**

```json
{
  "potenciaNominal": "3000W",
  "tensaoEntrada": "80-550V",
  "numeroMPPT": 2,
  "eficienciaMaxima": "98.4%",
  "dimensoes": "330x415x148mm",
  "peso": "10.5kg"
}
```

---

### 4. Chat Interativo com Contexto

```python
client = OllamaGPT()

context = []

# Primeira pergunta
msg1 = "Quais são os principais fabricantes de inversores no catálogo?"
resp1 = client.chat(msg1, context)
context.append({"role": "user", "content": msg1})
context.append({"role": "assistant", "content": resp1})

# Segunda pergunta (com contexto)
msg2 = "E qual deles tem mais modelos?"
resp2 = client.chat(msg2, context)
print(resp2)
```

---

## 🛠️ INTEGRAÇÃO COM CATÁLOGO

### Script de Análise em Lote

```python
from ollama_gpt import OllamaGPT
import json
from pathlib import Path

def analyze_catalog_quality(schemas_dir):
    """Analisa qualidade de todos os produtos"""
    
    client = OllamaGPT()
    results = []
    
    for json_file in Path(schemas_dir).glob("*_unified.json"):
        with open(json_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        for product in products[:10]:  # Primeiros 10 de cada categoria
            analysis = client.analyze_product(product)
            results.append({
                "product_id": product.get('id'),
                "product_name": product.get('name'),
                "category": product.get('category'),
                "quality_score": analysis.get('quality_score', 0),
                "confidence": analysis.get('category_confidence', 0)
            })
    
    # Ordenar por quality_score
    results.sort(key=lambda x: x['quality_score'])
    
    # Produtos com pior qualidade
    print("\n🔴 Produtos que precisam de atenção:")
    for item in results[:10]:
        print(f"  {item['product_name'][:50]}")
        print(f"    Qualidade: {item['quality_score']}/10")
    
    # Estatísticas
    avg_quality = sum(r['quality_score'] for r in results) / len(results)
    print(f"\n📊 Qualidade média: {avg_quality:.1f}/10")
    
    return results

# Executar
results = analyze_catalog_quality("../data/catalog/unified_schemas")
```

---

## 🎯 CASOS DE USO AVANÇADOS

### 1. Geração de Tags Automáticas

```python
def generate_tags(product):
    client = OllamaGPT()
    
    prompt = f"""Baseado neste produto, gere 5-10 tags relevantes:
    
    Nome: {product['name']}
    Categoria: {product['category']}
    Descrição: {product.get('description', '')}
    
    Retorne apenas as tags separadas por vírgula."""
    
    tags = client.generate(prompt, temperature=0.3, max_tokens=100)
    return [t.strip() for t in tags.split(',')]

# Uso
tags = generate_tags({
    "name": "Inversor Growatt MIN 3000TL-X",
    "category": "inverters",
    "description": "Inversor monofásico 3kW com 2 MPPT"
})
print(tags)
# Output: ['inversor', 'growatt', 'monofásico', '3kW', 'MPPT', 'grid-tie']
```

---

### 2. Comparação de Produtos

```python
def compare_products(product1, product2):
    client = OllamaGPT()
    
    prompt = f"""Compare estes dois produtos:

    Produto 1:
    Nome: {product1['name']}
    Fabricante: {product1['manufacturer']}
    Specs: {json.dumps(product1.get('specifications', {}))}
    
    Produto 2:
    Nome: {product2['name']}
    Fabricante: {product2['manufacturer']}
    Specs: {json.dumps(product2.get('specifications', {}))}
    
    Retorne uma comparação estruturada destacando:
    - Principais diferenças
    - Vantagens de cada um
    - Recomendação de uso"""
    
    return client.generate(prompt, temperature=0.5, max_tokens=500)
```

---

### 3. Resposta a Perguntas sobre Produtos

```python
def answer_product_question(product, question):
    client = OllamaGPT()
    
    context = f"""Produto: {product['name']}
    Fabricante: {product['manufacturer']}
    Descrição: {product.get('description', '')}
    Especificações: {json.dumps(product.get('specifications', {}), indent=2)}
    """
    
    prompt = f"""{context}
    
    Pergunta: {question}
    
    Responda de forma técnica e precisa:"""
    
    return client.generate(prompt, temperature=0.3)

# Uso
answer = answer_product_question(
    product={"name": "Inversor Growatt MIN 3000TL-X", ...},
    question="Este inversor suporta baterias?"
)
```

---

## 📈 PERFORMANCE

### Benchmarks (no seu PC)

- **Teste 1:** Geração de texto (200 tokens) = ~5 segundos
- **Teste 2:** Análise de produto = ~8 segundos
- **Teste 3:** Melhorar descrição = ~10 segundos

### Otimizações

```python
# Usar temperature baixa para respostas mais consistentes
client.generate(prompt, temperature=0.2)

# Limitar tokens para respostas mais rápidas
client.generate(prompt, max_tokens=100)

# Processar em batch quando possível
products = [p1, p2, p3]
analyses = [client.analyze_product(p) for p in products]
```

---

## 🔧 CONFIGURAÇÃO

### Ajustar Modelo

```python
# Usar outro modelo
client = OllamaGPT(model="llama2:13b")

# Mudar URL (se Ollama estiver remoto)
client = OllamaGPT(base_url="http://192.168.1.100:11434")
```

### Parâmetros de Geração

```python
response = client.generate(
    prompt="Seu prompt aqui",
    temperature=0.7,    # 0 = determinístico, 1 = criativo
    max_tokens=2000,    # Máximo de tokens na resposta
    stream=True         # Streaming em tempo real
)
```

---

## 🚨 TROUBLESHOOTING

### Problema: "Connection refused"

**Solução:** Iniciar Ollama

```bash
ollama serve
```

### Problema: Respostas lentas

**Soluções:**

1. Reduzir `max_tokens`
2. Usar `temperature` mais baixa
3. Fechar outros programas pesados

### Problema: Modelo não encontrado

**Solução:** Verificar modelos instalados

```bash
ollama list
```

---

## 📚 RECURSOS ADICIONAIS

### Comandos Ollama CLI

```bash
# Listar modelos
ollama list

# Rodar modelo interativo
ollama run gpt-oss:20b

# Ver informações do modelo
ollama show gpt-oss:20b

# Remover modelo
ollama rm gpt-oss:20b

# Baixar modelo
ollama pull gpt-oss:20b
```

### API REST Direta

```bash
# Gerar texto
curl http://localhost:11434/api/generate -d '{
  "model": "gpt-oss:20b",
  "prompt": "Por que o céu é azul?"
}'

# Chat
curl http://localhost:11434/api/chat -d '{
  "model": "gpt-oss:20b",
  "messages": [{"role": "user", "content": "Olá!"}]
}'
```

---

## ✅ CHECKLIST DE USO

- [x] Ollama instalado (v0.12.3)
- [x] Modelo gpt-oss:20b baixado (13 GB)
- [x] Script Python criado (`ollama_gpt.py`)
- [x] Testes executados com sucesso
- [ ] Integrado ao pipeline de catálogo
- [ ] Dashboard de análise criado
- [ ] API REST implementada

---

**🎉 Ollama GPT-OSS 20B pronto para uso!**

**Próximos passos sugeridos:**

1. Analisar qualidade dos 1,123 produtos
2. Gerar descrições melhoradas
3. Criar sistema de tags automático
4. Implementar chatbot de suporte
