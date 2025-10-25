#!/usr/bin/env python3
"""
Script de teste para Llama 3.2 Vision
Valida capacidades de análise de imagens para produtos fotovoltaicos

Usage:
    python scripts/test-llama-vision.py
    python scripts/test-llama-vision.py --image path/to/image.jpg
    python scripts/test-llama-vision.py --batch static/images-catálogo_distribuidores/
"""

import sys
import json
import time
from pathlib import Path
from typing import Dict, Any, List

try:
    import ollama
except ImportError:
    print("❌ Erro: módulo 'ollama' não instalado")
    print("Execute: pip install ollama")
    sys.exit(1)

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    from ollama_model_selector import pick_image_model, installed_model_names
except ImportError:
    print("⚠️  Aviso: ollama_model_selector não encontrado")
    pick_image_model = lambda: 'llama3.2-vision:11b'
    installed_model_names = lambda: []


def check_model_availability() -> str:
    """Verifica se Llama 3.2 Vision está instalado"""
    
    print("\n🔍 Verificando modelos instalados...\n")
    
    models = installed_model_names()
    
    if not models:
        print("❌ Nenhum modelo Ollama detectado")
        print("Execute: ollama list")
        return None
    
    print("📦 Modelos instalados:")
    for model in models:
        marker = "✅" if "llama3.2-vision" in model.lower() else "  "
        print(f"{marker} {model}")
    
    # Verificar Llama 3.2 Vision
    llama_models = [m for m in models if "llama3.2-vision" in m.lower()]
    
    if llama_models:
        selected = llama_models[0]
        print(f"\n✅ Llama 3.2 Vision encontrado: {selected}")
        return selected
    
    print("\n⚠️  Llama 3.2 Vision não instalado")
    print("Execute: ollama pull llama3.2-vision:11b")
    
    # Tentar usar outro modelo de visão
    vision_keywords = ['vision', 'llava', 'gpt-oss']
    for kw in vision_keywords:
        alternatives = [m for m in models if kw in m.lower()]
        if alternatives:
            alt = alternatives[0]
            print(f"ℹ️  Usando modelo alternativo: {alt}")
            return alt
    
    print("\n❌ Nenhum modelo de visão disponível")
    return None


def test_basic_vision(model: str) -> bool:
    """Teste 1: Capacidade básica de análise de imagem"""
    
    print("\n" + "="*60)
    print("TESTE 1: Análise Básica de Imagem")
    print("="*60)
    
    # Procurar uma imagem de teste
    image_dirs = [
        Path('static/images-catálogo_distribuidores'),
        Path('../static/images-catálogo_distribuidores'),
        Path('uploads'),
        Path('../uploads')
    ]
    
    test_image = None
    for img_dir in image_dirs:
        if img_dir.exists():
            images = list(img_dir.glob('*.webp')) + list(img_dir.glob('*.jpg'))
            if images:
                test_image = str(images[0])
                break
    
    if not test_image:
        print("⚠️  Nenhuma imagem de teste encontrada")
        print("Execute com: python test-llama-vision.py --image path/to/image.jpg")
        return False
    
    print(f"📸 Imagem de teste: {Path(test_image).name}")
    
    prompt = """Descreva esta imagem brevemente. 
O que você vê? É um produto? Qual tipo?"""
    
    try:
        start_time = time.time()
        
        response = ollama.chat(
            model=model,
            messages=[{
                'role': 'user',
                'content': prompt,
                'images': [test_image]
            }],
            options={'temperature': 0.3}
        )
        
        elapsed = time.time() - start_time
        
        result = response['message']['content']
        
        print(f"\n⏱️  Tempo: {elapsed:.2f}s")
        print(f"\n📝 Resposta:")
        print(result)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        return False


def test_metadata_extraction(model: str, image_path: str) -> Dict[str, Any]:
    """Teste 2: Extração estruturada de metadados"""
    
    print("\n" + "="*60)
    print("TESTE 2: Extração de Metadados Estruturados")
    print("="*60)
    
    print(f"📸 Imagem: {Path(image_path).name}")
    
    prompt = """Analise esta imagem de produto fotovoltaico e extraia:

{
  "manufacturer": "marca/logo visível",
  "model": "código do modelo",
  "product_type": "inverter/panel/battery/kit/other",
  "specifications": {
    "power_kw": 0.0,
    "voltage": "...",
    "phase": "mono/tri/N/A"
  },
  "visible_text": "todo texto legível",
  "image_quality": 0-10,
  "usable_for_catalog": true/false
}

Retorne APENAS o JSON, sem texto adicional."""
    
    try:
        start_time = time.time()
        
        response = ollama.chat(
            model=model,
            messages=[{
                'role': 'user',
                'content': prompt,
                'images': [image_path]
            }],
            options={
                'temperature': 0.1,
                'num_predict': 800
            }
        )
        
        elapsed = time.time() - start_time
        
        result_text = response['message']['content']
        
        # Tentar parsear JSON
        try:
            # Remover markdown code blocks se existir
            if '```json' in result_text:
                result_text = result_text.split('```json')[1].split('```')[0]
            elif '```' in result_text:
                result_text = result_text.split('```')[1].split('```')[0]
            
            result = json.loads(result_text.strip())
            
            print(f"\n⏱️  Tempo: {elapsed:.2f}s")
            print(f"\n✅ Metadados extraídos:")
            print(json.dumps(result, ensure_ascii=False, indent=2))
            
            return result
            
        except json.JSONDecodeError:
            print(f"\n⚠️  Resposta não é JSON válido:")
            print(result_text)
            return None
        
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        return None


def test_quality_validation(model: str, image_path: str) -> bool:
    """Teste 3: Validação de qualidade de imagem"""
    
    print("\n" + "="*60)
    print("TESTE 3: Validação de Qualidade")
    print("="*60)
    
    print(f"📸 Imagem: {Path(image_path).name}")
    
    prompt = """Avalie a qualidade desta imagem para uso em catálogo de e-commerce:

{
  "quality_score": 0-10,
  "resolution": "high/medium/low",
  "focus": "sharp/acceptable/blurry",
  "lighting": "good/acceptable/poor",
  "composition": "centered/acceptable/poor",
  "background": "clean/acceptable/cluttered",
  "decision": "approved/needs_improvement/rejected",
  "recommendations": ["sugestões de melhoria"]
}

Retorne APENAS JSON."""
    
    try:
        start_time = time.time()
        
        response = ollama.chat(
            model=model,
            messages=[{
                'role': 'user',
                'content': prompt,
                'images': [image_path]
            }],
            options={'temperature': 0.2}
        )
        
        elapsed = time.time() - start_time
        result_text = response['message']['content']
        
        # Parse JSON
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0]
        elif '```' in result_text:
            result_text = result_text.split('```')[1].split('```')[0]
        
        result = json.loads(result_text.strip())
        
        print(f"\n⏱️  Tempo: {elapsed:.2f}s")
        print(f"\n📊 Avaliação de Qualidade:")
        print(json.dumps(result, ensure_ascii=False, indent=2))
        
        # Decisão visual
        decision = result.get('decision', 'unknown')
        if decision == 'approved':
            print("\n✅ APROVADA para catálogo")
        elif decision == 'needs_improvement':
            print("\n⚠️  PRECISA DE MELHORIAS")
        else:
            print("\n❌ REJEITADA")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        return False


def test_batch_processing(model: str, image_dir: str, max_images: int = 5):
    """Teste 4: Processamento em lote"""
    
    print("\n" + "="*60)
    print(f"TESTE 4: Processamento em Lote ({max_images} imagens)")
    print("="*60)
    
    img_path = Path(image_dir)
    if not img_path.exists():
        print(f"❌ Diretório não existe: {image_dir}")
        return
    
    images = list(img_path.glob('*.webp')) + list(img_path.glob('*.jpg'))
    images = images[:max_images]
    
    if not images:
        print(f"❌ Nenhuma imagem encontrada em: {image_dir}")
        return
    
    print(f"📸 Processando {len(images)} imagens...")
    
    results = []
    total_time = 0
    
    for i, img in enumerate(images, 1):
        print(f"\n[{i}/{len(images)}] {img.name}")
        
        metadata = test_metadata_extraction(model, str(img))
        
        if metadata:
            results.append({
                'file': img.name,
                'metadata': metadata
            })
    
    # Resumo
    print("\n" + "="*60)
    print("RESUMO DO LOTE")
    print("="*60)
    
    successful = len(results)
    print(f"\n✅ Processadas com sucesso: {successful}/{len(images)}")
    
    if results:
        avg_quality = sum(
            r['metadata'].get('image_quality', 0)
            for r in results
        ) / len(results)
        print(f"📊 Qualidade média: {avg_quality:.1f}/10")
        
        # Salvar resultados
        output_file = Path('output/llama-vision-test-results.json')
        output_file.parent.mkdir(exist_ok=True)
        output_file.write_text(
            json.dumps(results, ensure_ascii=False, indent=2)
        )
        print(f"\n💾 Resultados salvos: {output_file}")


def run_all_tests():
    """Executa todos os testes"""
    
    print("\n" + "="*60)
    print("🦙 LLAMA 3.2 VISION - SUITE DE TESTES")
    print("="*60)
    
    # Verificar modelo
    model = check_model_availability()
    if not model:
        return
    
    # Encontrar imagem de teste
    image_dirs = [
        Path('static/images-catálogo_distribuidores'),
        Path('../static/images-catálogo_distribuidores'),
        Path('uploads'),
        Path('../uploads')
    ]
    
    test_image = None
    test_dir = None
    
    for img_dir in image_dirs:
        if img_dir.exists():
            images = list(img_dir.glob('*.webp')) + list(img_dir.glob('*.jpg'))
            if images:
                test_image = str(images[0])
                test_dir = str(img_dir)
                break
    
    if not test_image:
        print("\n❌ Nenhuma imagem encontrada para testes")
        print("Coloque imagens em: static/images-catálogo_distribuidores/")
        return
    
    # Executar testes
    tests_passed = 0
    tests_total = 4
    
    if test_basic_vision(model):
        tests_passed += 1
    
    if test_metadata_extraction(model, test_image):
        tests_passed += 1
    
    if test_quality_validation(model, test_image):
        tests_passed += 1
    
    if test_dir:
        test_batch_processing(model, test_dir, max_images=3)
        tests_passed += 1
    
    # Resultado final
    print("\n" + "="*60)
    print("RESULTADO FINAL")
    print("="*60)
    print(f"\n✅ Testes aprovados: {tests_passed}/{tests_total}")
    
    if tests_passed == tests_total:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        print("\nLlama 3.2 Vision está funcionando perfeitamente!")
        print("Pronto para processar o catálogo completo.")
    elif tests_passed >= tests_total // 2:
        print("\n⚠️  ALGUNS TESTES FALHARAM")
        print("Verifique os erros acima e tente novamente.")
    else:
        print("\n❌ MAIORIA DOS TESTES FALHOU")
        print("Verifique a instalação do Ollama e dos modelos.")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Testa capacidades do Llama 3.2 Vision'
    )
    parser.add_argument(
        '--image',
        help='Caminho para imagem de teste específica'
    )
    parser.add_argument(
        '--batch',
        help='Diretório para processamento em lote'
    )
    parser.add_argument(
        '--max-images',
        type=int,
        default=5,
        help='Número máximo de imagens no lote (padrão: 5)'
    )
    
    args = parser.parse_args()
    
    if args.image:
        model = check_model_availability()
        if model:
            test_metadata_extraction(model, args.image)
            test_quality_validation(model, args.image)
    elif args.batch:
        model = check_model_availability()
        if model:
            test_batch_processing(model, args.batch, args.max_images)
    else:
        run_all_tests()
