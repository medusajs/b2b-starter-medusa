#!/usr/bin/env python3
"""
Processa imagens originais do catálogo ODEX com Llama 3.2 Vision
Extrai metadados estruturados de cada imagem de produto

Usage:
    python scripts/process-original-images.py
    python scripts/process-original-images.py --category INVERTERS
    python scripts/process-original-images.py --max 5
"""

import sys
import json
import time
from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime

try:
    import ollama
except ImportError:
    print("❌ Erro: módulo 'ollama' não instalado")
    print("Execute: pip install ollama")
    sys.exit(1)

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from ollama_model_selector import pick_image_model
except ImportError:
    print("⚠️  ollama_model_selector não encontrado, usando padrão")
    def pick_image_model():
        return 'llama3.2-vision:11b'


def find_original_images(base_path: Path, category: str = None) -> List[Path]:
    """Encontra todas as imagens originais"""
    
    images_path = base_path / "static" / "images-catálogo_distribuidores" / "images_odex_source"
    
    if not images_path.exists():
        print(f"❌ Diretório não encontrado: {images_path}")
        return []
    
    all_images = []
    
    if category:
        category_path = images_path / category
        if category_path.exists():
            all_images = (
                list(category_path.glob("*.jpg")) +
                list(category_path.glob("*.jpeg")) +
                list(category_path.glob("*.png"))
            )
    else:
        # Procurar em todos os subdiretórios
        for subdir in images_path.iterdir():
            if subdir.is_dir():
                all_images.extend(list(subdir.glob("*.jpg")))
                all_images.extend(list(subdir.glob("*.jpeg")))
                all_images.extend(list(subdir.glob("*.png")))
    
    return sorted(all_images)


def extract_metadata_with_vision(image_path: Path, model: str) -> Dict[str, Any]:
    """Extrai metadados usando Llama 3.2 Vision"""
    
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
    
    try:
        print(f"   Analisando com {model}...", end=" ", flush=True)
        start_time = time.time()
        
        response = ollama.chat(
            model=model,
            messages=[{
                'role': 'user',
                'content': prompt,
                'images': [str(image_path)]
            }],
            options={
                'temperature': 0.1,
                'num_predict': 1500
            }
        )
        
        elapsed = time.time() - start_time
        print(f"({elapsed:.1f}s)")
        
        result_text = response['message']['content']
        
        # Parse JSON
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0]
        elif '```' in result_text:
            result_text = result_text.split('```')[1].split('```')[0]
        
        metadata = json.loads(result_text.strip())
        metadata['_processing_time'] = elapsed
        
        return metadata
        
    except json.JSONDecodeError as e:
        print(f"⚠️  JSON inválido: {e}")
        return {
            'error': 'json_decode_error',
            'raw_response': result_text[:500]
        }
    except Exception as e:
        print(f"❌ Erro: {e}")
        return {
            'error': str(e)
        }


def process_images(images: List[Path], model: str, output_dir: Path):
    """Processa lista de imagens"""
    
    print(f"\n{'='*60}")
    print(f"🦙 PROCESSAMENTO DE IMAGENS ORIGINAIS")
    print(f"{'='*60}\n")
    print(f"📦 Modelo: {model}")
    print(f"📸 Total de imagens: {len(images)}")
    print(f"💾 Output: {output_dir}\n")
    
    results = []
    errors = []
    total_time = 0
    
    for i, img_path in enumerate(images, 1):
        print(f"[{i}/{len(images)}] {img_path.name}")
        
        metadata = extract_metadata_with_vision(img_path, model)
        
        result = {
            'file': img_path.name,
            'path': str(img_path.relative_to(Path.cwd())),
            'category': img_path.parent.name,
            'processed_at': datetime.now().isoformat(),
            'metadata': metadata
        }
        
        if 'error' in metadata:
            errors.append(result)
        else:
            results.append(result)
            total_time += metadata.get('_processing_time', 0)
        
        # Salvar resultado individual
        output_file = output_dir / f"{img_path.stem}_metadata.json"
        output_file.write_text(
            json.dumps(result, ensure_ascii=False, indent=2)
        )
    
    # Resumo
    print(f"\n{'='*60}")
    print(f"RESUMO DO PROCESSAMENTO")
    print(f"{'='*60}\n")
    
    successful = len(results)
    failed = len(errors)
    
    print(f"✅ Processadas com sucesso: {successful}/{len(images)}")
    print(f"❌ Com erros: {failed}/{len(images)}")
    
    if results:
        avg_time = total_time / len(results)
        print(f"⏱️  Tempo médio: {avg_time:.1f}s por imagem")
        print(f"⏱️  Tempo total: {total_time:.1f}s")
        
        # Estatísticas de qualidade
        quality_scores = [
            r['metadata'].get('image_quality', {}).get('score', 0)
            for r in results
            if 'image_quality' in r['metadata']
        ]
        
        if quality_scores:
            avg_quality = sum(quality_scores) / len(quality_scores)
            print(f"📊 Qualidade média: {avg_quality:.1f}/10")
        
        # Fabricantes encontrados
        manufacturers = set()
        for r in results:
            mfg = r['metadata'].get('manufacturer')
            if mfg and mfg.lower() != 'null':
                manufacturers.add(mfg)
        
        if manufacturers:
            print(f"\n🏭 Fabricantes detectados: {', '.join(sorted(manufacturers))}")
        
        # Tipos de produtos
        product_types = {}
        for r in results:
            ptype = r['metadata'].get('product_type', 'unknown')
            product_types[ptype] = product_types.get(ptype, 0) + 1
        
        print(f"\n📦 Tipos de produtos:")
        for ptype, count in sorted(product_types.items()):
            print(f"   {ptype}: {count}")
    
    # Salvar resumo completo
    summary = {
        'processed_at': datetime.now().isoformat(),
        'model_used': model,
        'total_images': len(images),
        'successful': successful,
        'failed': failed,
        'total_time_seconds': total_time,
        'results': results,
        'errors': errors
    }
    
    summary_file = output_dir / "processing_summary.json"
    summary_file.write_text(
        json.dumps(summary, ensure_ascii=False, indent=2)
    )
    
    print(f"\n💾 Resumo salvo: {summary_file}")
    
    # Criar relatório markdown
    create_markdown_report(summary, output_dir)
    
    return summary


def create_markdown_report(summary: Dict, output_dir: Path):
    """Cria relatório em markdown"""
    
    report_file = output_dir / "PROCESSING_REPORT.md"
    
    md = f"""# 🦙 Relatório de Processamento - Llama 3.2 Vision

**Data**: {datetime.now().strftime('%d/%m/%Y %H:%M')}  
**Modelo**: {summary['model_used']}

---

## 📊 Estatísticas Gerais

- **Total de imagens**: {summary['total_images']}
- **Processadas com sucesso**: {summary['successful']}
- **Com erros**: {summary['failed']}
- **Tempo total**: {summary['total_time_seconds']:.1f}s
- **Tempo médio**: {summary['total_time_seconds']/max(summary['successful'], 1):.1f}s por imagem

---

## ✅ Imagens Processadas

| # | Arquivo | Fabricante | Modelo | Tipo | Qualidade |
|---|---------|------------|--------|------|-----------|
"""
    
    for i, result in enumerate(summary['results'], 1):
        meta = result['metadata']
        md += f"| {i} | `{result['file']}` | {meta.get('manufacturer', 'N/A')} | {meta.get('model', 'N/A')} | {meta.get('product_type', 'N/A')} | {meta.get('image_quality', {}).get('score', 'N/A')}/10 |\n"
    
    if summary['errors']:
        md += f"\n---\n\n## ❌ Erros ({len(summary['errors'])})\n\n"
        for error in summary['errors']:
            md += f"- `{error['file']}`: {error['metadata'].get('error', 'Unknown error')}\n"
    
    md += "\n---\n\n## 📁 Arquivos Gerados\n\n"
    md += "- `processing_summary.json` - Resumo completo em JSON\n"
    md += "- `*_metadata.json` - Metadados individuais de cada imagem\n"
    md += "- `PROCESSING_REPORT.md` - Este relatório\n"
    
    report_file.write_text(md, encoding='utf-8')
    print(f"📄 Relatório markdown: {report_file}")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Processa imagens originais com Llama 3.2 Vision'
    )
    parser.add_argument(
        '--category',
        choices=['INVERTERS', 'PANELS', 'STRINGBOXES', 'STRUCTURES'],
        help='Categoria específica para processar'
    )
    parser.add_argument(
        '--max',
        type=int,
        help='Número máximo de imagens a processar'
    )
    parser.add_argument(
        '--output',
        default='output/image-analysis',
        help='Diretório de saída (padrão: output/image-analysis)'
    )
    
    args = parser.parse_args()
    
    # Setup
    base_path = Path.cwd()
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Verificar modelo
    model = pick_image_model()
    if not model:
        print("❌ Nenhum modelo de visão disponível")
        print("Execute: ollama pull llama3.2-vision:11b")
        sys.exit(1)
    
    # Encontrar imagens
    print("🔍 Procurando imagens originais...")
    images = find_original_images(base_path, args.category)
    
    if not images:
        print("❌ Nenhuma imagem encontrada")
        print("Verifique: static/images-catálogo_distribuidores/images_odex_source/")
        sys.exit(1)
    
    print(f"✅ Encontradas {len(images)} imagens")
    
    if args.category:
        print(f"📂 Categoria: {args.category}")
    
    # Limitar quantidade se especificado
    if args.max and args.max < len(images):
        images = images[:args.max]
        print(f"⚠️  Limitado a {args.max} imagens")
    
    # Processar
    summary = process_images(images, model, output_dir)
    
    print(f"\n✅ Processamento concluído!")
    print(f"📁 Resultados em: {output_dir}/")


if __name__ == '__main__':
    main()
