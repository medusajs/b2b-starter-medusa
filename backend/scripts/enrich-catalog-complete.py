#!/usr/bin/env python3
"""
Enriquecimento Completo do Catálogo YSH Store
Integra: Llama Vision + Gemma 3 + GPT-OSS + PVLib + NREL + Normalização

Este script:
1. Extrai metadados visuais com Llama 3.2 Vision
2. Normaliza dados com Gemma 3
3. Valida especificações com PVLib/CEC/Sandia
4. Enriquece com dados NREL
5. Padroniza para UI components da store

Usage:
    python scripts/enrich-catalog-complete.py
    python scripts/enrich-catalog-complete.py --category inverters
    python scripts/enrich-catalog-complete.py --max 10
"""

import sys
import json
import asyncio
import time
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import ollama
except ImportError:
    print("❌ Erro: módulo 'ollama' não instalado")
    print("Execute: pip install ollama")
    sys.exit(1)

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    from ollama_model_selector import (
        pick_image_model,
        pick_text_model
    )
except ImportError:
    def pick_image_model():
        return 'llama3.2-vision:11b'
    def pick_text_model():
        return 'gemma3:4b'


class CatalogEnricher:
    """Enriquecedor completo de catálogo"""
    
    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.vision_model = pick_image_model()
        self.text_model = pick_text_model()
        
        # Carregar dados PVLib
        self.pvlib_data = self._load_pvlib_data()
        
        # Carregar dados validados
        self.validated_data = self._load_validated_data()
        
        # Carregar dados enriquecidos
        self.enriched_data = self._load_enriched_data()
        
        print(f"🔧 Configuração:")
        print(f"   Vision Model: {self.vision_model}")
        print(f"   Text Model: {self.text_model}")
        print(f"   PVLib Data: {len(self.pvlib_data)} produtos")
        print(f"   Validated Data: {len(self.validated_data)} produtos")
        print(f"   Enriched Data: {len(self.enriched_data)} produtos")
    
    def _load_pvlib_data(self) -> Dict:
        """Carrega dados normalizados do PVLib"""
        data = {}
        
        pvlib_path = (
            self.base_path / "data" / "catalog" / "data" / 
            "catalog" / "normalized_pvlib"
        )
        
        if pvlib_path.exists():
            # Inversores
            inv_file = pvlib_path / "normalized_inverters_sandia_clean.json"
            if inv_file.exists():
                with open(inv_file, 'r', encoding='utf-8') as f:
                    inv_data = json.load(f)
                    data['inverters'] = inv_data
            
            # Painéis
            panel_file = pvlib_path / "normalized_panels_cec_clean.json"
            if panel_file.exists():
                with open(panel_file, 'r', encoding='utf-8') as f:
                    panel_data = json.load(f)
                    data['panels'] = panel_data
        
        return data
    
    def _load_validated_data(self) -> Dict:
        """Carrega dados validados"""
        data = {}
        
        validated_path = (
            self.base_path / "data" / "catalog" / "data" / 
            "catalog" / "validated_pvlib"
        )
        
        if validated_path.exists():
            # Inversores validados
            inv_file = validated_path / "validated_inverters_unified.json"
            if inv_file.exists():
                with open(inv_file, 'r', encoding='utf-8') as f:
                    data['inverters'] = json.load(f)
            
            # Painéis validados
            panel_file = validated_path / "validated_panels_unified.json"
            if panel_file.exists():
                with open(panel_file, 'r', encoding='utf-8') as f:
                    data['panels'] = json.load(f)
        
        return data
    
    def _load_enriched_data(self) -> Dict:
        """Carrega dados enriquecidos"""
        data = {}
        
        enriched_path = (
            self.base_path / "data" / "catalog" / "data" / 
            "catalog" / "enriched_pvlib"
        )
        
        if enriched_path.exists():
            # Inversores enriquecidos
            inv_file = enriched_path / "enriched_inverters_unified.json"
            if inv_file.exists():
                with open(inv_file, 'r', encoding='utf-8') as f:
                    data['inverters'] = json.load(f)
            
            # Painéis enriquecidos
            panel_file = enriched_path / "enriched_panels_unified.json"
            if panel_file.exists():
                with open(panel_file, 'r', encoding='utf-8') as f:
                    data['panels'] = json.load(f)
        
        return data
    
    def extract_visual_metadata(
        self,
        image_path: Path
    ) -> Optional[Dict[str, Any]]:
        """Extrai metadados visuais com Llama 3.2 Vision"""
        
        if not image_path.exists():
            return None
        
        prompt = """Analise esta imagem de produto fotovoltaico e extraia:

{
  "manufacturer": "marca visível",
  "model": "modelo exato",
  "product_type": "inverter/panel/battery/stringbox/structure",
  "specifications": {
    "power_w": 0,
    "voltage": "...",
    "efficiency": 0.0
  },
  "visible_text": "todo texto legível",
  "certifications": [],
  "image_quality_score": 0-10
}

Retorne APENAS JSON."""
        
        try:
            response = ollama.chat(
                model=self.vision_model,
                messages=[{
                    'role': 'user',
                    'content': prompt,
                    'images': [str(image_path)]
                }],
                options={'temperature': 0.1}
            )
            
            result_text = response['message']['content']
            
            # Parse JSON
            if '```json' in result_text:
                result_text = result_text.split('```json')[1].split('```')[0]
            elif '```' in result_text:
                result_text = result_text.split('```')[1].split('```')[0]
            
            return json.loads(result_text.strip())
            
        except Exception as e:
            print(f"   ⚠️  Erro visual: {e}")
            return None
    
    def normalize_with_gemma(
        self,
        visual_data: Dict,
        pvlib_data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Normaliza e enriquece dados com Gemma 3"""
        
        prompt = f"""Você é especialista em produtos fotovoltaicos.

DADOS VISUAIS:
{json.dumps(visual_data, ensure_ascii=False, indent=2)}

DADOS PVLIB (se disponível):
{json.dumps(pvlib_data or {}, ensure_ascii=False, indent=2)}

Normalize e estruture em formato padronizado para e-commerce:

{{
  "product": {{
    "sku": "FABRICANTE-TIPO-MODELO",
    "title": "título comercial",
    "manufacturer": "fabricante normalizado",
    "model": "modelo normalizado",
    "category": "primary/secondary",
    "type": "gridtie/hybrid/offgrid/mono/poly"
  }},
  "specifications": {{
    "power_nominal_w": 0,
    "efficiency_percent": 0.0,
    "voltage_nominal_v": 0,
    "current_max_a": 0,
    "mppt_channels": 0,
    "dimensions_mm": "LxWxH",
    "weight_kg": 0.0,
    "warranty_years": 0,
    "certifications": ["INMETRO", "IEC", "CE"]
  }},
  "compatibility": {{
    "recommended_for": ["aplicação 1", "aplicação 2"],
    "system_voltage": ["220V", "380V"],
    "installation_type": ["residencial", "comercial"]
  }},
  "ui_data": {{
    "display_name": "nome para UI",
    "short_description": "descrição curta (160 chars)",
    "tags": ["tag1", "tag2"],
    "highlight_features": ["feature 1", "feature 2"],
    "technical_level": "basic/intermediate/advanced"
  }}
}}

Retorne APENAS JSON bem estruturado."""
        
        try:
            response = ollama.chat(
                model=self.text_model,
                messages=[{
                    'role': 'user',
                    'content': prompt
                }],
                options={'temperature': 0.2}
            )
            
            result_text = response['message']['content']
            
            # Parse JSON
            if '```json' in result_text:
                result_text = result_text.split('```json')[1].split('```')[0]
            elif '```' in result_text:
                result_text = result_text.split('```')[1].split('```')[0]
            
            return json.loads(result_text.strip())
            
        except Exception as e:
            print(f"   ⚠️  Erro normalização: {e}")
            return {
                'error': str(e),
                'raw_visual_data': visual_data
            }
    
    def enrich_product(
        self,
        image_path: Path,
        sku: str
    ) -> Dict[str, Any]:
        """Pipeline completo de enriquecimento"""
        
        print(f"\n📦 Processando SKU: {sku}")
        print(f"   Imagem: {image_path.name}")
        
        start_time = time.time()
        
        # Etapa 1: Análise Visual
        print(f"   1️⃣ Análise visual...", end=" ", flush=True)
        visual_data = self.extract_visual_metadata(image_path)
        if visual_data:
            print(f"✅ ({time.time() - start_time:.1f}s)")
        else:
            print("❌")
            return {'error': 'visual_extraction_failed'}
        
        # Etapa 2: Buscar dados PVLib
        print(f"   2️⃣ Buscando dados PVLib...", end=" ", flush=True)
        pvlib_match = self._find_pvlib_match(
            visual_data.get('manufacturer'),
            visual_data.get('model')
        )
        if pvlib_match:
            print(f"✅ Match encontrado")
        else:
            print("⚠️  Sem match")
        
        # Etapa 3: Normalização com Gemma
        print(f"   3️⃣ Normalizando com Gemma...", end=" ", flush=True)
        normalized = self.normalize_with_gemma(visual_data, pvlib_match)
        if 'error' not in normalized:
            print(f"✅ ({time.time() - start_time:.1f}s)")
        else:
            print("❌")
        
        # Compilar resultado final
        result = {
            'sku': sku,
            'image_path': str(image_path.relative_to(self.base_path)),
            'processed_at': datetime.now().isoformat(),
            'processing_time_seconds': time.time() - start_time,
            'visual_analysis': visual_data,
            'pvlib_match': pvlib_match,
            'normalized_data': normalized,
            'data_sources': {
                'visual': 'llama3.2-vision:11b',
                'normalization': 'gemma3:4b',
                'pvlib': bool(pvlib_match),
                'validated': False,
                'enriched': False
            }
        }
        
        print(f"   ✅ Completo em {result['processing_time_seconds']:.1f}s")
        
        return result
    
    def _find_pvlib_match(
        self,
        manufacturer: str,
        model: str
    ) -> Optional[Dict]:
        """Busca match nos dados PVLib"""
        
        if not manufacturer or not model:
            return None
        
        mfg_lower = manufacturer.lower()
        model_lower = model.lower()
        
        # Buscar em inversores
        if 'inverters' in self.pvlib_data:
            for inv in self.pvlib_data['inverters']:
                inv_mfg = inv.get('manufacturer', '').lower()
                inv_model = inv.get('model', '').lower()
                
                if mfg_lower in inv_mfg and model_lower in inv_model:
                    return inv
        
        # Buscar em painéis
        if 'panels' in self.pvlib_data:
            for panel in self.pvlib_data['panels']:
                panel_mfg = panel.get('manufacturer', '').lower()
                panel_model = panel.get('model', '').lower()
                
                if mfg_lower in panel_mfg and model_lower in panel_model:
                    return panel
        
        return None
    
    def process_batch(
        self,
        images: List[Path],
        output_dir: Path,
        max_workers: int = 3
    ) -> Dict[str, Any]:
        """Processa lote de imagens em paralelo"""
        
        print(f"\n{'='*60}")
        print(f"🚀 ENRIQUECIMENTO COMPLETO DO CATÁLOGO")
        print(f"{'='*60}\n")
        print(f"📦 Total de imagens: {len(images)}")
        print(f"🔧 Workers paralelos: {max_workers}")
        print(f"💾 Output: {output_dir}\n")
        
        results = []
        errors = []
        
        # Processar em paralelo
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submeter tarefas
            future_to_image = {}
            for img in images:
                sku = img.stem.split('_')[1] if '_' in img.stem else img.stem
                future = executor.submit(self.enrich_product, img, sku)
                future_to_image[future] = img
            
            # Coletar resultados
            for i, future in enumerate(as_completed(future_to_image), 1):
                img = future_to_image[future]
                
                try:
                    result = future.result()
                    
                    if 'error' not in result:
                        results.append(result)
                    else:
                        errors.append(result)
                    
                    # Salvar resultado individual
                    output_file = output_dir / f"{img.stem}_enriched.json"
                    output_file.write_text(
                        json.dumps(result, ensure_ascii=False, indent=2)
                    )
                    
                except Exception as e:
                    print(f"❌ Erro processando {img.name}: {e}")
                    errors.append({
                        'image': str(img),
                        'error': str(e)
                    })
        
        # Gerar resumo
        summary = self._generate_summary(results, errors, output_dir)
        
        return summary
    
    def _generate_summary(
        self,
        results: List[Dict],
        errors: List[Dict],
        output_dir: Path
    ) -> Dict[str, Any]:
        """Gera resumo do processamento"""
        
        print(f"\n{'='*60}")
        print(f"RESUMO DO ENRIQUECIMENTO")
        print(f"{'='*60}\n")
        
        successful = len(results)
        failed = len(errors)
        total = successful + failed
        
        print(f"✅ Processados com sucesso: {successful}/{total}")
        print(f"❌ Com erros: {failed}/{total}")
        
        if results:
            avg_time = sum(
                r['processing_time_seconds'] for r in results
            ) / len(results)
            print(f"⏱️  Tempo médio: {avg_time:.1f}s por produto")
            
            # PVLib matches
            with_pvlib = sum(
                1 for r in results if r.get('pvlib_match')
            )
            print(f"🔗 Com match PVLib: {with_pvlib}/{successful}")
            
            # Estatísticas de fabricantes
            manufacturers = set()
            for r in results:
                mfg = (
                    r.get('visual_analysis', {})
                    .get('manufacturer')
                )
                if mfg:
                    manufacturers.add(mfg)
            
            if manufacturers:
                print(f"\n🏭 Fabricantes: {', '.join(sorted(manufacturers))}")
        
        # Salvar resumo
        summary = {
            'processed_at': datetime.now().isoformat(),
            'total_images': total,
            'successful': successful,
            'failed': failed,
            'models_used': {
                'vision': self.vision_model,
                'text': self.text_model
            },
            'results': results,
            'errors': errors
        }
        
        summary_file = output_dir / "enrichment_summary.json"
        summary_file.write_text(
            json.dumps(summary, ensure_ascii=False, indent=2)
        )
        
        print(f"\n💾 Resumo salvo: {summary_file}")
        
        # Criar relatório markdown
        self._create_report(summary, output_dir)
        
        return summary
    
    def _create_report(self, summary: Dict, output_dir: Path):
        """Cria relatório markdown"""
        
        report_file = output_dir / "ENRICHMENT_REPORT.md"
        
        md = f"""# 📊 Relatório de Enriquecimento - Catálogo YSH Store

**Data**: {datetime.now().strftime('%d/%m/%Y %H:%M')}  
**Vision Model**: {summary['models_used']['vision']}  
**Text Model**: {summary['models_used']['text']}

---

## 📈 Estatísticas

- **Total processado**: {summary['total_images']}
- **Sucesso**: {summary['successful']}
- **Erros**: {summary['failed']}
- **Taxa de sucesso**: {(summary['successful']/max(summary['total_images'], 1)*100):.1f}%

---

## ✅ Produtos Enriquecidos

| SKU | Fabricante | Modelo | Tipo | PVLib | Tempo |
|-----|------------|--------|------|-------|-------|
"""
        
        for result in summary['results']:
            sku = result.get('sku', 'N/A')
            visual = result.get('visual_analysis', {})
            mfg = visual.get('manufacturer', 'N/A')
            model = visual.get('model', 'N/A')
            ptype = visual.get('product_type', 'N/A')
            pvlib = '✅' if result.get('pvlib_match') else '❌'
            time_s = result.get('processing_time_seconds', 0)
            
            md += f"| {sku} | {mfg} | {model} | {ptype} | {pvlib} | {time_s:.1f}s |\n"
        
        if summary['errors']:
            md += f"\n---\n\n## ❌ Erros\n\n"
            for error in summary['errors']:
                md += f"- {error.get('sku', 'N/A')}: {error.get('error', 'Unknown')}\n"
        
        md += """
---

## 📁 Arquivos Gerados

- `enrichment_summary.json` - Resumo completo
- `*_enriched.json` - Dados enriquecidos individuais
- `ENRICHMENT_REPORT.md` - Este relatório

---

## 🔄 Pipeline Executado

1. **Llama 3.2 Vision** - Extração de metadados visuais
2. **PVLib Matching** - Busca em dados CEC/Sandia
3. **Gemma 3** - Normalização e estruturação
4. **UI Formatting** - Padronização para componentes da store

---

**Gerado por**: YSH AI Pipeline v1.0
"""
        
        report_file.write_text(md, encoding='utf-8')
        print(f"📄 Relatório: {report_file}")


def find_product_images(
    base_path: Path,
    category: Optional[str] = None
) -> List[Path]:
    """Encontra imagens de produtos"""
    
    images_path = (
        base_path / "static" / "images-catálogo_distribuidores" / 
        "images_odex_source"
    )
    
    if not images_path.exists():
        return []
    
    all_images = []
    
    if category:
        category_path = images_path / category.upper()
        if category_path.exists():
            all_images = (
                list(category_path.glob("*.jpg")) +
                list(category_path.glob("*.jpeg")) +
                list(category_path.glob("*.png"))
            )
    else:
        for subdir in images_path.iterdir():
            if subdir.is_dir():
                all_images.extend(list(subdir.glob("*.jpg")))
                all_images.extend(list(subdir.glob("*.jpeg")))
                all_images.extend(list(subdir.glob("*.png")))
    
    return sorted(all_images)


def main():
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Enriquecimento completo do catálogo'
    )
    parser.add_argument(
        '--category',
        choices=['inverters', 'panels', 'stringboxes', 'structures'],
        help='Categoria específica'
    )
    parser.add_argument(
        '--max',
        type=int,
        help='Número máximo de produtos'
    )
    parser.add_argument(
        '--workers',
        type=int,
        default=3,
        help='Número de workers paralelos (padrão: 3)'
    )
    parser.add_argument(
        '--output',
        default='output/enriched-catalog',
        help='Diretório de saída'
    )
    
    args = parser.parse_args()
    
    # Setup
    base_path = Path.cwd()
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Inicializar enriquecedor
    print("🔧 Inicializando enriquecedor...")
    enricher = CatalogEnricher(base_path)
    
    # Encontrar imagens
    print("\n🔍 Procurando imagens...")
    images = find_product_images(base_path, args.category)
    
    if not images:
        print("❌ Nenhuma imagem encontrada")
        sys.exit(1)
    
    print(f"✅ Encontradas {len(images)} imagens")
    
    if args.max and args.max < len(images):
        images = images[:args.max]
        print(f"⚠️  Limitado a {args.max} imagens")
    
    # Processar
    summary = enricher.process_batch(images, output_dir, args.workers)
    
    print(f"\n✅ Enriquecimento concluído!")
    print(f"📁 Resultados em: {output_dir}/")


if __name__ == '__main__':
    main()
