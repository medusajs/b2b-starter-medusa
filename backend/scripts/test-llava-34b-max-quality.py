#!/usr/bin/env python3
"""
Teste Rápido: LLaVA 34B para Análise de Produtos Fotovoltaicos
Máxima performance e qualidade para extração de metadados
"""

import json
from pathlib import Path
import time

try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    print("❌ Erro: biblioteca ollama não instalada")
    print("   Instale com: pip install ollama")
    OLLAMA_AVAILABLE = False
    exit(1)


def test_llava_34b_single_image(image_path: str):
    """Testa LLaVA 34B em uma única imagem"""
    
    print(f'\n{"="*80}')
    print(f'🧪 TESTE LLaVA 34B - MÁXIMA QUALIDADE')
    print(f'{"="*80}')
    print(f'📸 Imagem: {Path(image_path).name}')
    
    if not Path(image_path).exists():
        print(f'❌ Arquivo não encontrado: {image_path}')
        return None
    
    # Prompt otimizado para produtos fotovoltaicos
    prompt = """Analise esta imagem de produto fotovoltaico e retorne APENAS um objeto JSON válido com estas informações:

{
  "manufacturer": "nome exato do fabricante visível",
  "model": "código/modelo completo do produto",
  "power_text": "potência como aparece na imagem (ex: 3kW, 550W)",
  "power_kw": potência numérica em kW,
  "category": "inverter, panel, battery, kit ou structure",
  "type": "gridtie, hibrido, offgrid, micro, bifacial, mono, etc",
  "image_type": "logo_simples, diagrama_tecnico, produto_fotografia ou produto_render",
  "quality_score": nota de 1-10 para qualidade da imagem,
  "text_visible": ["lista de todos textos legíveis"],
  "logo_visible": true/false,
  "technical_specs": ["lista de especificações técnicas visíveis"],
  "confidence": 0.0 a 1.0
}

Seja preciso e extraia TODAS informações visíveis. Retorne APENAS o JSON, sem explicações."""

    try:
        print(f'\n⏱️  Iniciando análise com LLaVA 34B...')
        start_time = time.time()
        
        response = ollama.chat(
            model='llava:34b',
            messages=[{
                'role': 'user',
                'content': prompt,
                'images': [str(image_path)]
            }]
        )
        
        elapsed = time.time() - start_time
        print(f'✅ Análise concluída em {elapsed:.2f} segundos')
        
        content = response['message']['content']
        
        # Extrair JSON
        try:
            # Remover marcadores de código se presentes
            if '```json' in content:
                content = content.split('```json')[1].split('```')[0]
            elif '```' in content:
                content = content.split('```')[1].split('```')[0]
            
            data = json.loads(content.strip())
            
            print(f'\n📊 RESULTADO DA ANÁLISE:')
            print(f'{"="*80}')
            print(json.dumps(data, indent=2, ensure_ascii=False))
            print(f'{"="*80}')
            
            # Análise de qualidade
            print(f'\n🎯 MÉTRICAS DE QUALIDADE:')
            print(f'   • Fabricante detectado: {data.get("manufacturer", "N/A")}')
            print(f'   • Modelo identificado: {data.get("model", "N/A")}')
            print(f'   • Potência extraída: {data.get("power_text", "N/A")} ({data.get("power_kw", 0)} kW)')
            print(f'   • Categoria: {data.get("category", "N/A")} / {data.get("type", "N/A")}')
            print(f'   • Score de qualidade: {data.get("quality_score", 0)}/10')
            print(f'   • Confiança: {data.get("confidence", 0)*100:.1f}%')
            print(f'   • Textos detectados: {len(data.get("text_visible", []))} itens')
            print(f'   • Specs técnicas: {len(data.get("technical_specs", []))} itens')
            
            return {
                'success': True,
                'data': data,
                'processing_time': elapsed,
                'image': str(image_path)
            }
            
        except json.JSONDecodeError as e:
            print(f'\n⚠️  Resposta não é JSON válido')
            print(f'📄 Resposta bruta:')
            print(content)
            
            return {
                'success': False,
                'raw_response': content,
                'processing_time': elapsed,
                'error': str(e)
            }
        
    except Exception as e:
        print(f'\n❌ Erro durante análise: {e}')
        return None


def test_batch_comparison(num_samples=3):
    """Testa LLaVA 34B em lote e compara com dados manuais"""
    
    print(f'\n{"="*80}')
    print(f'🔬 TESTE COMPARATIVO: LLaVA 34B vs Dados Manuais')
    print(f'{"="*80}')
    
    # Carregar dataset ODEX
    dataset_path = Path('data/catalog/data/catalog/distributor_datasets/odex/odex-inverters.json')
    
    if not dataset_path.exists():
        print(f'❌ Dataset não encontrado: {dataset_path}')
        return []
    
    with open(dataset_path, 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    results = []
    
    for i, product in enumerate(products[:num_samples], 1):
        print(f'\n{"─"*80}')
        print(f'📦 PRODUTO {i}/{num_samples}')
        print(f'{"─"*80}')
        
        # Dados manuais
        manual_data = {
            'name': product.get('name'),
            'manufacturer': product.get('manufacturer'),
            'model': product.get('model'),
            'category': product.get('category'),
        }
        
        print(f'\n📋 DADOS MANUAIS:')
        print(json.dumps(manual_data, indent=2, ensure_ascii=False))
        
        # Localizar imagem
        image_path_rel = product.get('image', '')
        if not image_path_rel:
            print(f'⚠️  Produto sem imagem')
            continue
        
        image_path = Path('static') / image_path_rel.lstrip('/')
        
        if not image_path.exists():
            print(f'⚠️  Imagem não encontrada: {image_path}')
            continue
        
        # Análise com IA
        print(f'\n🤖 ANÁLISE COM LLAVA 34B:')
        ai_result = test_llava_34b_single_image(str(image_path))
        
        if ai_result and ai_result.get('success'):
            ai_data = ai_result['data']
            
            # Comparação
            print(f'\n⚖️  COMPARAÇÃO:')
            
            manufacturer_match = (
                manual_data['manufacturer'].lower() in ai_data.get('manufacturer', '').lower() or
                ai_data.get('manufacturer', '').lower() in manual_data['manufacturer'].lower()
            )
            print(f'   • Fabricante: {"✅ MATCH" if manufacturer_match else "❌ DIVERGÊNCIA"}')
            print(f'     Manual: {manual_data["manufacturer"]}')
            print(f'     IA: {ai_data.get("manufacturer")}')
            
            if manual_data.get('model'):
                model_similarity = manual_data['model'].lower() in ai_data.get('model', '').lower()
                print(f'   • Modelo: {"✅ SIMILAR" if model_similarity else "⚠️  DIFERENTE"}')
                print(f'     Manual: {manual_data["model"]}')
                print(f'     IA: {ai_data.get("model")}')
            
            category_match = manual_data['category'].lower() == ai_data.get('category', '').lower()
            print(f'   • Categoria: {"✅ MATCH" if category_match else "❌ DIVERGÊNCIA"}')
            print(f'     Manual: {manual_data["category"]}')
            print(f'     IA: {ai_data.get("category")}')
            
            results.append({
                'product': manual_data['name'],
                'manual': manual_data,
                'ai': ai_data,
                'matches': {
                    'manufacturer': manufacturer_match,
                    'category': category_match
                },
                'processing_time': ai_result['processing_time']
            })
    
    # Resumo final
    print(f'\n{"="*80}')
    print(f'📊 RESUMO FINAL')
    print(f'{"="*80}')
    
    if results:
        total = len(results)
        manufacturer_accuracy = sum(1 for r in results if r['matches']['manufacturer']) / total * 100
        category_accuracy = sum(1 for r in results if r['matches']['category']) / total * 100
        avg_time = sum(r['processing_time'] for r in results) / total
        
        print(f'   • Amostras analisadas: {total}')
        print(f'   • Precisão (Fabricante): {manufacturer_accuracy:.1f}%')
        print(f'   • Precisão (Categoria): {category_accuracy:.1f}%')
        print(f'   • Tempo médio: {avg_time:.2f}s por imagem')
        print(f'   • Throughput: {3600/avg_time:.0f} imagens/hora')
        print(f'\n   • Estimativa para 854 imagens: {(854*avg_time)/60:.1f} minutos')
    
    # Salvar relatório
    report_path = Path('static/llava-34b-test-report.json')
    report_path.parent.mkdir(exist_ok=True)
    
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({
            'model': 'llava:34b',
            'total_samples': len(results),
            'results': results,
            'summary': {
                'manufacturer_accuracy': manufacturer_accuracy if results else 0,
                'category_accuracy': category_accuracy if results else 0,
                'avg_processing_time': avg_time if results else 0,
            }
        }, f, indent=2, ensure_ascii=False)
    
    print(f'\n📄 Relatório salvo: {report_path}')
    
    return results


def main():
    print('='*80)
    print('🚀 TESTE LLaVA 34B - MÁXIMA QUALIDADE PARA PRODUTOS FOTOVOLTAICOS')
    print('='*80)
    
    # Verificar se modelo está disponível
    try:
        models = ollama.list()
        has_llava_34b = any('llava:34b' in m.get('name', '') for m in models.get('models', []))
        
        if not has_llava_34b:
            print('\n⚠️  LLaVA 34B não está instalado!')
            print('   Baixando agora... (isso pode levar alguns minutos)')
            print('   Aguarde o download terminar e execute novamente.')
            return
        
        print('\n✅ LLaVA 34B detectado e pronto!')
        
    except Exception as e:
        print(f'\n❌ Erro ao verificar modelos: {e}')
        print('   Certifique-se de que o Ollama está rodando: ollama serve')
        return
    
    # Menu
    print('\n📋 OPÇÕES DE TESTE:')
    print('  1. Testar imagem única (análise detalhada)')
    print('  2. Teste comparativo (3 produtos com validação)')
    print('  3. Análise rápida de imagem específica')
    
    choice = input('\nEscolha (1-3): ').strip()
    
    if choice == '1':
        # Buscar primeira imagem disponível
        test_images = list(Path('static/images-catálogo_distribuidores').rglob('*.jpg'))[:1]
        if test_images:
            test_llava_34b_single_image(str(test_images[0]))
        else:
            print('❌ Nenhuma imagem encontrada')
    
    elif choice == '2':
        test_batch_comparison(num_samples=3)
    
    elif choice == '3':
        img_path = input('Caminho da imagem: ').strip()
        if img_path:
            test_llava_34b_single_image(img_path)
    
    else:
        print('❌ Opção inválida')


if __name__ == '__main__':
    main()
