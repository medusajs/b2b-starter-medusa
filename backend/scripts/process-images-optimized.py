#!/usr/bin/env python3
"""
Processador OTIMIZADO de imagens com Llama 3.2 Vision
- Warmup do modelo para velocidade consistente
- Prompt conciso para reduzir tempo
- Parâmetros otimizados
- Cache de resultados

Usage:
    python scripts/process-images-optimized.py
    python scripts/process-images-optimized.py --max 10
    python scripts/process-images-optimized.py --category INVERTERS
"""

import sys
import json
import time
import hashlib
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime

try:
    import ollama
except ImportError:
    print("❌ Erro: módulo 'ollama' não instalado")
    print("Execute: pip install ollama")
    sys.exit(1)


def warmup_model(model: str, iterations: int = 3):
    """Pré-aquece modelo para performance consistente"""
    print(f"🔥 Aquecendo modelo {model}...")
    
    dummy_prompt = "Responda apenas 'OK'."
    
    warmup_times = []
    for i in range(iterations):
        start = time.time()
        try:
            ollama.generate(model=model, prompt=dummy_prompt)
            elapsed = time.time() - start
            warmup_times.append(elapsed)
            print(f"   Warmup {i+1}/{iterations}: {elapsed:.1f}s")
        except Exception as e:
            print(f"   ⚠️  Warmup {i+1} falhou: {e}")
    
    if warmup_times:
        avg_warmup = sum(warmup_times) / len(warmup_times)
        print(f"✅ Modelo aquecido! Média: {avg_warmup:.1f}s\n")
    else:
        print("⚠️  Nenhum warmup bem-sucedido\n")


def get_image_hash(image_path: Path) -> str:
    """Gera hash MD5 da imagem para cache"""
    return hashlib.md5(image_path.read_bytes()).hexdigest()


def load_cache(cache_dir: Path) -> Dict[str, Any]:
    """Carrega cache existente"""
    cache_file = cache_dir / "cache_index.json"
    if cache_file.exists():
        return json.loads(cache_file.read_text())
    return {}


def save_to_cache(
    cache_dir: Path,
    image_hash: str,
    metadata: Dict[str, Any]
):
    """Salva resultado no cache"""
    cache_dir.mkdir(parents=True, exist_ok=True)
    
    # Salvar arquivo individual
    cache_file = cache_dir / f"{image_hash}.json"
    cache_file.write_text(json.dumps(metadata, ensure_ascii=False, indent=2))
    
    # Atualizar índice
    index_file = cache_dir / "cache_index.json"
    index = load_cache(cache_dir)
    index[image_hash] = {
        'cached_at': datetime.now().isoformat(),
        'processing_time': metadata.get('_processing_time', 0)
    }
    index_file.write_text(json.dumps(index, indent=2))


def extract_metadata_optimized(
    image_path: Path,
    model: str,
    cache_dir: Optional[Path] = None
) -> Dict[str, Any]:
    """Extração otimizada de metadados com cache"""
    
    # Verificar cache
    if cache_dir:
        img_hash = get_image_hash(image_path)
        cache_file = cache_dir / f"{img_hash}.json"
        
        if cache_file.exists():
            print(" [CACHE]", end=" ")
            cached = json.loads(cache_file.read_text())
            cached['_from_cache'] = True
            return cached
    
    # Prompt conciso e focado
    prompt = """Extraia dados desta imagem de produto fotovoltaico:

{
  "manufacturer": "marca/logo",
  "model": "código exato",
  "product_type": "inverter/panel/battery/stringbox/structure",
  "specifications": {
    "power_kw": 0.0,
    "voltage": "220V/380V",
    "phase": "mono/tri",
    "mppt_count": 0,
    "efficiency_percent": 0.0
  },
  "visible_text": "todo texto legível",
  "quality_score": 0-10
}

Retorne APENAS JSON válido, sem markdown."""
    
    try:
        start_time = time.time()
        
        response = ollama.chat(
            model=model,
            messages=[{
                'role': 'user',
                'content': prompt,
                'images': [str(image_path)]
            }],
            options={
                'temperature': 0.0,       # Máximo determinismo
                'num_predict': 600,       # Suficiente para JSON
                'top_k': 10,              # Reduz opções
                'top_p': 0.9,             # Foca nas mais prováveis
                'repeat_penalty': 1.1     # Evita repetição
            }
        )
        
        elapsed = time.time() - start_time
        
        result_text = response['message']['content']
        
        # Limpar markdown se presente
        if '```json' in result_text:
            result_text = result_text.split('```json')[1].split('```')[0]
        elif '```' in result_text:
            result_text = result_text.split('```')[1].split('```')[0]
        
        # Parse JSON
        metadata = json.loads(result_text.strip())
        metadata['_processing_time'] = elapsed
        metadata['_from_cache'] = False
        
        # Salvar no cache
        if cache_dir:
            save_to_cache(cache_dir, img_hash, metadata)
        
        return metadata
        
    except json.JSONDecodeError as e:
        return {
            'error': 'json_decode_error',
            'error_detail': str(e),
            'raw_response': result_text[:500],
            '_processing_time': elapsed
        }
    except Exception as e:
        return {
            'error': str(type(e).__name__),
            'error_detail': str(e),
            '_processing_time': time.time() - start_time if 'start_time' in locals() else 0
        }


def process_images_optimized(
    images: List[Path],
    model: str,
    output_dir: Path,
    cache_dir: Optional[Path] = None,
    warmup: bool = True
):
    """Processa lista de imagens com otimizações"""
    
    print(f"\n{'='*60}")
    print(f"🚀 PROCESSAMENTO OTIMIZADO - Llama 3.2 Vision")
    print(f"{'='*60}\n")
    
    # Warmup
    if warmup:
        warmup_model(model)
    
    print(f"📦 Modelo: {model}")
    print(f"📸 Total de imagens: {len(images)}")
    print(f"💾 Output: {output_dir}")
    if cache_dir:
        print(f"🗄️  Cache: {cache_dir}")
    print()
    
    results = []
    errors = []
    total_time = 0
    cache_hits = 0
    
    for i, img_path in enumerate(images, 1):
        print(f"[{i}/{len(images)}] {img_path.name}...", end=" ", flush=True)
        
        metadata = extract_metadata_optimized(img_path, model, cache_dir)
        
        processing_time = metadata.get('_processing_time', 0)
        from_cache = metadata.get('_from_cache', False)
        
        if from_cache:
            cache_hits += 1
        
        print(f"({processing_time:.1f}s)", end=" ")
        
        result = {
            'file': img_path.name,
            'path': str(img_path.relative_to(Path.cwd())),
            'category': img_path.parent.name,
            'processed_at': datetime.now().isoformat(),
            'metadata': metadata
        }
        
        if 'error' in metadata:
            errors.append(result)
            print("❌")
        else:
            results.append(result)
            print("✅")
        
        if not from_cache:
            total_time += processing_time
        
        # Salvar resultado individual
        output_file = output_dir / f"{img_path.stem}_metadata.json"
        output_file.write_text(
            json.dumps(result, ensure_ascii=False, indent=2)
        )
    
    # Estatísticas
    print(f"\n{'='*60}")
    print(f"RESUMO DO PROCESSAMENTO")
    print(f"{'='*60}\n")
    
    successful = len(results)
    failed = len(errors)
    processed = successful + failed - cache_hits
    
    print(f"✅ Processadas com sucesso: {successful}/{len(images)}")
    print(f"❌ Com erros: {failed}/{len(images)}")
    if cache_hits > 0:
        print(f"🗄️  Do cache: {cache_hits}/{len(images)}")
    
    if processed > 0:
        avg_time = total_time / processed
        print(f"\n⏱️  Tempo médio: {avg_time:.1f}s por imagem")
        print(f"⏱️  Tempo total: {total_time:.1f}s ({total_time/60:.1f} min)")
        print(f"📊 Throughput: {3600/avg_time:.0f} imagens/hora")
    
    if results:
        # Qualidade média
        quality_scores = [
            r['metadata'].get('quality_score', 0)
            for r in results
            if 'quality_score' in r['metadata']
        ]
        
        if quality_scores:
            avg_quality = sum(quality_scores) / len(quality_scores)
            print(f"📊 Qualidade média: {avg_quality:.1f}/10")
        
        # Fabricantes
        manufacturers = set()
        for r in results:
            mfg = r['metadata'].get('manufacturer')
            if mfg and mfg.lower() not in ['null', 'n/a', '']:
                manufacturers.add(mfg)
        
        if manufacturers:
            print(f"\n🏭 Fabricantes: {', '.join(sorted(manufacturers))}")
    
    # Salvar resumo
    summary = {
        'processed_at': datetime.now().isoformat(),
        'model_used': model,
        'optimizations': [
            'warmup',
            'concise_prompt',
            'optimized_parameters',
            'cache' if cache_dir else None
        ],
        'total_images': len(images),
        'successful': successful,
        'failed': failed,
        'cache_hits': cache_hits,
        'total_time_seconds': total_time,
        'avg_time_seconds': total_time / processed if processed > 0 else 0,
        'throughput_per_hour': 3600 / (total_time / processed) if processed > 0 else 0,
        'results': results,
        'errors': errors
    }
    
    summary_file = output_dir / "processing_summary_optimized.json"
    summary_file.write_text(
        json.dumps(summary, ensure_ascii=False, indent=2)
    )
    
    print(f"\n💾 Resumo salvo: {summary_file}")
    
    # Relatório markdown
    create_report(summary, output_dir)
    
    return summary


def create_report(summary: Dict, output_dir: Path):
    """Cria relatório markdown otimizado"""
    
    report_file = output_dir / "PROCESSING_REPORT_OPTIMIZED.md"
    
    avg_time = summary.get('avg_time_seconds', 0)
    throughput = summary.get('throughput_per_hour', 0)
    
    md = f"""# 🚀 Relatório de Processamento OTIMIZADO

**Data**: {datetime.now().strftime('%d/%m/%Y %H:%M')}  
**Modelo**: {summary['model_used']}  
**Otimizações**: {', '.join([o for o in summary['optimizations'] if o])}

---

## 📊 Performance

- **Tempo médio**: {avg_time:.1f}s por imagem
- **Throughput**: {throughput:.0f} imagens/hora
- **Tempo total**: {summary['total_time_seconds']:.1f}s ({summary['total_time_seconds']/60:.1f} min)

## 📈 Resultados

- **Total**: {summary['total_images']} imagens
- **Sucesso**: {summary['successful']} ({summary['successful']/summary['total_images']*100:.1f}%)
- **Erros**: {summary['failed']}
- **Cache hits**: {summary['cache_hits']}

---

## ✅ Imagens Processadas

| # | Arquivo | Fabricante | Modelo | Tipo | Qualidade | Tempo |
|---|---------|------------|--------|------|-----------|-------|
"""
    
    for i, result in enumerate(summary['results'], 1):
        meta = result['metadata']
        time_str = f"{meta.get('_processing_time', 0):.1f}s"
        if meta.get('_from_cache'):
            time_str = "cache"
        
        md += f"| {i} | `{result['file']}` | {meta.get('manufacturer', 'N/A')} | {meta.get('model', 'N/A')} | {meta.get('product_type', 'N/A')} | {meta.get('quality_score', 'N/A')}/10 | {time_str} |\n"
    
    if summary['errors']:
        md += f"\n---\n\n## ❌ Erros ({len(summary['errors'])})\n\n"
        for error in summary['errors']:
            md += f"- `{error['file']}`: {error['metadata'].get('error', 'Unknown')}\n"
    
    md += "\n---\n\n_Gerado por process-images-optimized.py_\n"
    
    report_file.write_text(md, encoding='utf-8')
    print(f"📄 Relatório: {report_file}")


def find_images(category: Optional[str] = None) -> List[Path]:
    """Encontra imagens para processar"""
    base_path = Path("static/images-catálogo_distribuidores/images_odex_source")
    
    if not base_path.exists():
        return []
    
    images = []
    
    if category:
        cat_path = base_path / category
        if cat_path.exists():
            images.extend(cat_path.glob("*.jpg"))
            images.extend(cat_path.glob("*.jpeg"))
            images.extend(cat_path.glob("*.png"))
    else:
        for subdir in base_path.iterdir():
            if subdir.is_dir():
                images.extend(subdir.glob("*.jpg"))
                images.extend(subdir.glob("*.jpeg"))
                images.extend(subdir.glob("*.png"))
    
    return sorted(images)


def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Processador OTIMIZADO de imagens com Llama Vision'
    )
    parser.add_argument(
        '--category',
        choices=['INVERTERS', 'PANELS', 'STRINGBOXES', 'STRUCTURES'],
        help='Categoria específica'
    )
    parser.add_argument(
        '--max',
        type=int,
        help='Número máximo de imagens'
    )
    parser.add_argument(
        '--output',
        default='output/image-analysis-optimized',
        help='Diretório de saída'
    )
    parser.add_argument(
        '--no-warmup',
        action='store_true',
        help='Desabilitar warmup do modelo'
    )
    parser.add_argument(
        '--no-cache',
        action='store_true',
        help='Desabilitar cache'
    )
    
    args = parser.parse_args()
    
    # Setup
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    cache_dir = None if args.no_cache else Path(args.output) / "cache"
    
    model = 'llama3.2-vision:11b'
    
    # Encontrar imagens
    print("🔍 Procurando imagens...")
    images = find_images(args.category)
    
    if not images:
        print("❌ Nenhuma imagem encontrada")
        sys.exit(1)
    
    print(f"✅ Encontradas {len(images)} imagens")
    
    if args.category:
        print(f"📂 Categoria: {args.category}")
    
    # Limitar
    if args.max and args.max < len(images):
        images = images[:args.max]
        print(f"⚠️  Limitado a {args.max} imagens")
    
    # Processar
    summary = process_images_optimized(
        images,
        model,
        output_dir,
        cache_dir,
        warmup=not args.no_warmup
    )
    
    print(f"\n✅ Processamento concluído!")
    print(f"📁 Resultados em: {output_dir}/")


if __name__ == '__main__':
    main()
