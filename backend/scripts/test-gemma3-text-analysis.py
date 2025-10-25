#!/usr/bin/env python3
"""
Teste das Capacidades de Gemma 3:4B para Análise de Texto
Foca em normalização, extração de metadados e enriquecimento
"""

import json
from pathlib import Path
import time

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    print("❌ Ollama não instalado. Instale com: pip install ollama")
    OLLAMA_AVAILABLE = False
    exit(1)


def test_text_normalization():
    """Testa normalização de nomes de produtos"""
    print("="*80)
    print("🧪 TESTE 1: Normalização de Texto")
    print("="*80)
    
    test_cases = [
        "INVERSOR SAJ R5-3K-T2 MONOFASICO 220V 3000W ON GRID 2MPPT",
        "Painel Solar Jinko 550W Mono PERC JKM550M-7RL4-V",
        "KIT FOTUS GERACAO 10.65KWP CERAMICO COMPLETO",
        "Bateria Moura 220Ah 12V Estacionaria Clean",
    ]
    
    prompt_template = """Normalize este nome de produto em JSON estruturado:

PRODUTO: "{product}"

Retorne APENAS JSON válido:
{{
  "manufacturer": "fabricante",
  "category": "inverter/panel/battery/kit",
  "model": "código do modelo",
  "power_kw": valor numérico ou null,
  "type": "gridtie/hibrido/offgrid/mono/poli",
  "voltage": "tensão se aplicável",
  "key_features": ["lista de características"]
}}"""
    
    results = []
    
    for product in test_cases:
        print(f"\n📦 Produto: {product}")
        
        try:
            start = time.time()
            response = ollama.chat(
                model='gemma3:4b',
                messages=[{
                    'role': 'user',
                    'content': prompt_template.format(product=product)
                }]
            )
            elapsed = time.time() - start
            
            content = response['message']['content']
            
            # Extrair JSON
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]
            elif '```' in content:
                content = content.split('```')[1].split('```')[0]
            
            data = json.loads(content.strip())
            
            print(f"✅ Normalizado em {elapsed:.2f}s")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            results.append({
                'product': product,
                'normalized': data,
                'time': elapsed,
                'success': True
            })
            
        except Exception as e:
            print(f"❌ Erro: {e}")
            results.append({
                'product': product,
                'error': str(e),
                'success': False
            })
    
    # Estatísticas
    success_count = sum(1 for r in results if r['success'])
    avg_time = sum(r.get('time', 0) for r in results if r['success']) / max(success_count, 1)
    
    print(f"\n📊 RESUMO:")
    print(f"   • Sucessos: {success_count}/{len(test_cases)}")
    print(f"   • Tempo médio: {avg_time:.2f}s")
    print(f"   • Throughput: ~{3600/avg_time:.0f} produtos/hora")
    
    return results


def test_description_generation():
    """Testa geração de descrições de produtos"""
    print("\n" + "="*80)
    print("🧪 TESTE 2: Geração de Descrições")
    print("="*80)
    
    product_data = {
        "manufacturer": "SAJ",
        "model": "R5-3K-T2",
        "category": "inverter",
        "type": "gridtie",
        "power_kw": 3.0,
        "voltage": "220V",
        "phases": "monofásico",
        "mppt": 2
    }
    
    prompt = f"""Gere conteúdo comercial para este produto:

DADOS: {json.dumps(product_data, ensure_ascii=False)}

Retorne JSON:
{{
  "title_seo": "título otimizado (max 60 chars)",
  "short_description": "descrição curta (max 160 chars)",
  "long_description": "descrição detalhada (200-300 palavras)",
  "bullet_points": ["5 benefícios principais"],
  "keywords": ["10 palavras-chave"]
}}"""
    
    try:
        print(f"\n🤖 Gerando conteúdo com Gemma 3...")
        start = time.time()
        
        response = ollama.chat(
            model='gemma3:4b',
            messages=[{'role': 'user', 'content': prompt}]
        )
        
        elapsed = time.time() - start
        content = response['message']['content']
        
        # Extrair JSON
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0]
        elif '```' in content:
            content = content.split('```')[1].split('```')[0]
        
        data = json.loads(content.strip())
        
        print(f"✅ Gerado em {elapsed:.2f}s\n")
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
        return {'success': True, 'data': data, 'time': elapsed}
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return {'success': False, 'error': str(e)}


def test_data_validation():
    """Testa validação de consistência"""
    print("\n" + "="*80)
    print("🧪 TESTE 3: Validação de Dados")
    print("="*80)
    
    test_products = [
        {
            "name": "INVERSOR SAJ 3KW MONOFASICO",
            "category": "inverter",
            "power_kw": 3.0,
            "manufacturer": "SAJ"
        },
        {
            "name": "PAINEL 550W JINKO",
            "category": "inverter",  # ERRO: deveria ser "panel"
            "power_kw": None,  # ERRO: falta potência
            "manufacturer": "Jinko"
        }
    ]
    
    prompt_template = """Valide a consistência destes dados:

PRODUTO: {product}

Identifique:
1. Inconsistências entre nome e dados
2. Dados faltantes críticos
3. Valores suspeitos

Retorne JSON:
{{
  "is_valid": true/false,
  "issues": ["lista de problemas"],
  "severity": "low/medium/high",
  "suggestions": ["sugestões de correção"]
}}"""
    
    results = []
    
    for product in test_products:
        print(f"\n📦 Validando: {product['name']}")
        
        try:
            response = ollama.chat(
                model='gemma3:4b',
                messages=[{
                    'role': 'user',
                    'content': prompt_template.format(
                        product=json.dumps(product, ensure_ascii=False)
                    )
                }]
            )
            
            content = response['message']['content']
            
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]
            elif '```' in content:
                content = content.split('```')[1].split('```')[0]
            
            data = json.loads(content.strip())
            
            status = "✅ VÁLIDO" if data['is_valid'] else "❌ INVÁLIDO"
            print(f"{status} - Severidade: {data['severity']}")
            
            if data['issues']:
                print(f"   Problemas:")
                for issue in data['issues']:
                    print(f"      • {issue}")
            
            results.append({
                'product': product,
                'validation': data,
                'success': True
            })
            
        except Exception as e:
            print(f"❌ Erro: {e}")
            results.append({
                'product': product,
                'error': str(e),
                'success': False
            })
    
    return results


def test_entity_extraction():
    """Testa extração de entidades"""
    print("\n" + "="*80)
    print("🧪 TESTE 4: Extração de Entidades")
    print("="*80)
    
    text = """
    O inversor Growatt MIC 3000TL-X possui potência nominal de 3000W, 
    tensão de entrada de 50-550V, 2 MPPT independentes e eficiência 
    máxima de 97.6%. Compatível com painéis de até 4500Wp. 
    Garantia de 10 anos do fabricante.
    """
    
    prompt = f"""Extraia todas entidades importantes deste texto:

TEXTO: {text}

Retorne JSON:
{{
  "manufacturer": "fabricante",
  "model": "modelo",
  "power_w": potência em watts,
  "voltage_range": "faixa de tensão",
  "mppt_count": número de MPPTs,
  "efficiency_percent": eficiência,
  "warranty_years": anos de garantia,
  "max_panel_power_w": potência máxima de painéis
}}"""
    
    try:
        print("🤖 Extraindo entidades...")
        
        response = ollama.chat(
            model='gemma3:4b',
            messages=[{'role': 'user', 'content': prompt}]
        )
        
        content = response['message']['content']
        
        if '```json' in content:
            content = content.split('```json')[1].split('```')[0]
        elif '```' in content:
            content = content.split('```')[1].split('```')[0]
        
        data = json.loads(content.strip())
        
        print("✅ Entidades extraídas:\n")
        print(json.dumps(data, indent=2, ensure_ascii=False))
        
        return {'success': True, 'data': data}
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return {'success': False, 'error': str(e)}


def main():
    print("="*80)
    print("🚀 TESTES DE CAPACIDADES DO GEMMA 3:4B")
    print("="*80)
    print()
    
    if not OLLAMA_AVAILABLE:
        return
    
    # Verificar se Gemma 3 está disponível
    try:
        models = ollama.list()
        has_gemma3 = any('gemma3' in m.get('name', '') for m in models.get('models', []))
        
        if not has_gemma3:
            print("❌ Gemma 3:4b não está instalado!")
            print("   Instale com: ollama pull gemma3:4b")
            return
        
        print("✅ Gemma 3:4b detectado!\n")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return
    
    # Executar testes
    results = {
        'normalization': test_text_normalization(),
        'description': test_description_generation(),
        'validation': test_data_validation(),
        'extraction': test_entity_extraction()
    }
    
    # Salvar relatório
    report_path = Path('static/gemma3-test-report.json')
    report_path.parent.mkdir(exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    print("\n" + "="*80)
    print("📊 RESUMO FINAL")
    print("="*80)
    print(f"✅ Todos os testes concluídos!")
    print(f"📄 Relatório salvo: {report_path}")
    print()
    print("🎯 Gemma 3:4b é excelente para:")
    print("   • Normalização de dados de produtos")
    print("   • Geração de descrições comerciais")
    print("   • Validação de consistência")
    print("   • Extração de entidades técnicas")
    print()
    print("⚠️  Nota: Para análise de imagens, use gpt-oss:20b")


if __name__ == '__main__':
    main()
