#!/usr/bin/env python3
"""
Teste de IA Local para Análise de Imagens
Usa Ollama + LLaVA para extrair metadados automaticamente
"""

import json
from pathlib import Path
import sys

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False
    print("⚠️  Ollama não instalado. Instale com: pip install ollama")


def check_ollama_setup():
    """Verifica se Ollama está configurado corretamente"""
    
    if not OLLAMA_AVAILABLE:
        return False, None
    
    try:
        # Testar conexão
        models = ollama.list()
        model_list = models.get('models', [])
        print(f"✅ Ollama conectado. Modelos disponíveis: {len(model_list)}")
        
        # Listar modelos
        for m in model_list:
            model_name = m.get('name', m.get('model', 'unknown'))
            print(f"   • {model_name}")
        
        # Verificar modelos de visão disponíveis
        vision_models = [
            m.get('name', m.get('model', ''))
            for m in model_list
            if 'llava' in str(m.get('name', m.get('model', ''))).lower()
        ]
        
        if vision_models:
            print(f"✅ Modelos de visão detectados: {', '.join(vision_models)}")
            return True, vision_models[0]
        else:
            print("⚠️  Nenhum modelo de visão encontrado.")
            print("   Modelos recomendados:")
            print("   • ollama pull llava:13b  (7.4 GB - RECOMENDADO)")
            print("   • ollama pull llava:34b  (19 GB - máxima qualidade)")
            print("   • ollama pull llava:7b   (4.7 GB - mais rápido)")
            return False, None
        
    except Exception as e:
        print(f"❌ Erro ao conectar com Ollama: {e}")
        print("   Certifique-se de que o Ollama está rodando:")
        print("   ollama serve")
        return False, None


def test_single_image(image_path, model=None):
    """Testa análise de uma única imagem"""
    
    # Auto-detectar modelo se não especificado
    if model is None:
        _, model = check_ollama_setup()
        if model is None:
            model = 'llava:13b'
    """Testa análise de uma única imagem"""
    
    print(f'\n{"="*80}')
    print(f'🧪 TESTE: {Path(image_path).name}')
    print(f'{"="*80}')
    
    if not Path(image_path).exists():
        print(f'❌ Arquivo não encontrado: {image_path}')
        return None
    
    # Prompt estruturado para extração de dados
    prompt = """Analise esta imagem de produto fotovoltaico e extraia as seguintes informações:

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem texto adicional.

{
  "manufacturer": "nome do fabricante visível na imagem",
  "category": "inverter, panel, battery, kit ou structure",
  "type": "gridtie, hibrido, offgrid, micro, bifacial, mono, etc (se identificável)",
  "model": "código/modelo exato do produto",
  "power": "potência em W ou kW (extraia do texto visível)",
  "power_numeric": potência em kW como número,
  "image_type": "logo_simples, diagrama_tecnico, produto_fotografia ou produto_render",
  "quality_score": nota de 1 a 10 para qualidade da imagem,
  "problems": ["lista de problemas detectados"],
  "logo_visible": true/false,
  "text_readable": ["lista de textos legíveis na imagem"],
  "confidence": 0.0 a 1.0
}"""
    
    try:
        print('🤖 Enviando para LLaVA...')
        
        response = ollama.chat(
            model=model,
            messages=[{
                'role': 'user',
                'content': prompt,
                'images': [str(image_path)]
            }]
        )
        
        content = response['message']['content']
        print('\n📄 Resposta bruta:')
        print(content)
        
        # Tentar extrair JSON
        try:
            # Remover marcadores de código se presentes
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]
            elif '```' in content:
                content = content.split('```')[1].split('```')[0]
            
            data = json.loads(content.strip())
            
            print('\n✅ JSON extraído com sucesso:')
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            return data
            
        except json.JSONDecodeError as e:
            print(f'\n⚠️  Resposta não é JSON válido: {e}')
            print('   Tentando interpretação manual...')
            
            # Fallback: criar estrutura básica
            return {
                'raw_response': content,
                'parsed': False,
                'error': str(e)
            }
        
    except Exception as e:
        print(f'❌ Erro durante análise: {e}')
        return None


def test_batch_images(image_dir, model=None, limit=5):
    """Testa análise em lote"""
    
    # Auto-detectar modelo se não especificado
    if model is None:
        _, model = check_ollama_setup()
        if model is None:
            model = 'llava:13b'
    """Testa análise em lote"""
    
    print(f'\n{"="*80}')
    print('🧪 TESTE EM LOTE')
    print(f'{"="*80}')
    
    image_dir = Path(image_dir)
    
    if not image_dir.exists():
        print(f'❌ Diretório não encontrado: {image_dir}')
        return []
    
    # Buscar imagens
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp']:
        image_files.extend(list(image_dir.glob(ext)))
    
    print(f'\n📂 Encontradas {len(image_files)} imagens')
    print(f'🎯 Testando primeiras {limit}...\n')
    
    results = []
    
    for i, img_path in enumerate(image_files[:limit], 1):
        print(f'\n[{i}/{limit}] Processando: {img_path.name}')
        
        result = test_single_image(img_path, model)
        
        if result:
            results.append({
                'file': str(img_path),
                'filename': img_path.name,
                'data': result
            })
    
    # Salvar relatório
    report_path = Path('static/ai-analysis-report.json')
    report_path.parent.mkdir(exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({
            'model': model,
            'total_tested': len(results),
            'results': results
        }, f, indent=2, ensure_ascii=False)
    
    print(f'\n{"="*80}')
    print('📊 RESUMO DO TESTE')
    print(f'{"="*80}')
    print(f'✅ Analisadas: {len(results)}/{limit}')
    print(f'📄 Relatório: {report_path}')
    
    return results


def compare_ai_vs_manual(model=None):
    """Compara extração por IA vs dados manuais"""
    
    # Auto-detectar modelo se não especificado
    if model is None:
        _, model = check_ollama_setup()
        if model is None:
            model = 'llava:13b'
    """Compara extração por IA vs dados manuais"""
    
    print(f'\n{"="*80}')
    print('⚖️  COMPARAÇÃO: IA vs MANUAL')
    print(f'{"="*80}')
    
    # Carregar dataset manual (ODEX)
    dataset_path = Path('data/catalog/data/catalog/distributor_datasets/odex/odex-inverters.json')
    
    if not dataset_path.exists():
        print(f'❌ Dataset não encontrado: {dataset_path}')
        return
    
    with open(dataset_path, 'r', encoding='utf-8') as f:
        manual_data = json.load(f)
    
    # Testar primeiros 3
    comparisons = []
    
    for product in manual_data[:3]:
        image_path = product.get('image', '')
        if not image_path:
            continue
        
        # Construir caminho completo
        img_file = Path('static') / image_path.lstrip('/')
        
        if not img_file.exists():
            print(f'⚠️  Imagem não encontrada: {img_file}')
            continue
        
        print(f'\n{"="*60}')
        print(f'📦 Produto: {product.get("name", "")}')
        
        # Dados manuais
        manual = {
            'manufacturer': product.get('manufacturer'),
            'model': product.get('model'),
            'category': product.get('category'),
            'power_manual': product.get('name', '')  # Extração manual da potência
        }
        
        print('\n📋 DADOS MANUAIS:')
        print(json.dumps(manual, indent=2, ensure_ascii=False))
        
        # Análise por IA
        ai_result = test_single_image(img_file, model=model)
        
        if ai_result:
            print('\n🤖 DADOS IA:')
            print(json.dumps({
                'manufacturer': ai_result.get('manufacturer'),
                'model': ai_result.get('model'),
                'category': ai_result.get('category'),
                'power': ai_result.get('power')
            }, indent=2, ensure_ascii=False))
            
            # Comparação
            comparison = {
                'product_name': product.get('name'),
                'manual': manual,
                'ai': ai_result,
                'match': {
                    'manufacturer': manual['manufacturer'].lower() in ai_result.get('manufacturer', '').lower(),
                    'category': manual['category'] == ai_result.get('category'),
                }
            }
            
            comparisons.append(comparison)
    
    # Salvar comparações
    report_path = Path('static/ai-vs-manual-comparison.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(comparisons, f, indent=2, ensure_ascii=False)
    
    print(f'\n📄 Comparação salva: {report_path}')


def main():
    print('='*80)
    print('🤖 TESTE DE IA LOCAL PARA ANÁLISE DE IMAGENS')
    print('='*80)
    
    # 1. Verificar setup
    has_vision, model_name = check_ollama_setup()
    if not has_vision:
        print('\n❌ Setup incompleto. Siga as instruções acima.')
        sys.exit(1)
    
    print(f'\n✅ Usando modelo: {model_name}')
    
    # 2. Menu
    print('\n📋 OPÇÕES DE TESTE:')
    print('  1. Testar imagem única')
    print('  2. Testar lote (5 imagens)')
    print('  3. Comparar IA vs dados manuais')
    print('  4. Todos os testes')
    
    choice = input('\nEscolha (1-4): ').strip()
    
    if choice == '1':
        # Teste único
        img_path = input('Caminho da imagem: ').strip()
        test_single_image(img_path)
    
    elif choice == '2':
        # Lote
        img_dir = input('Diretório de imagens: ').strip() or 'static/images-catálogo_distribuidores/ODEX-INVERTERS'
        test_batch_images(img_dir)
    
    elif choice == '3':
        # Comparação
        compare_ai_vs_manual()
    
    elif choice == '4':
        # Todos
        print('\n🚀 Executando todos os testes...\n')
        
        # Teste único
        test_img = 'static/images-catálogo_distribuidores/ODEX-INVERTERS/276954.jpg'
        if Path(test_img).exists():
            test_single_image(test_img)
        
        # Lote
        test_batch_images('static/images-catálogo_distribuidores/ODEX-INVERTERS', limit=3)
        
        # Comparação
        compare_ai_vs_manual()
    
    else:
        print('❌ Opção inválida')


if __name__ == '__main__':
    main()
