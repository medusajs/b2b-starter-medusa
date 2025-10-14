#!/usr/bin/env python3
"""
🔄 Merge Enriched Products to Medusa.js Catalog
================================================

Integra produtos enriquecidos com LLM ao catálogo Medusa.js v2.x
"""

import json
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime


class MedusaMerger:
    def __init__(self):
        self.enriched_path = Path('enriched-complete')
        self.medusa_catalog_path = Path('medusa-catalog')
        self.output_path = Path('medusa-catalog')
        
        self.stats = {
            'total_products': 0,
            'enriched_merged': 0,
            'skipped': 0,
            'errors': 0
        }
    
    def load_enriched_products(self) -> List[Dict[str, Any]]:
        """Carrega produtos enriquecidos"""
        enriched_files = list(self.enriched_path.glob('enriched_products_*.json'))
        
        if not enriched_files:
            raise FileNotFoundError("Nenhum arquivo enriched_products_*.json encontrado")
        
        latest_file = max(enriched_files, key=lambda p: p.stat().st_mtime)
        print(f"📂 Carregando produtos enriquecidos: {latest_file.name}")
        
        with open(latest_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        print(f"✅ {len(products)} produtos enriquecidos carregados\n")
        return products
    
    def load_medusa_catalog(self) -> Dict[str, Any]:
        """Carrega catálogo base Medusa.js"""
        catalog_files = list(self.medusa_catalog_path.glob('complete_catalog_*.json'))
        
        if not catalog_files:
            raise FileNotFoundError("Nenhum catálogo Medusa.js encontrado")
        
        latest_file = max(catalog_files, key=lambda p: p.stat().st_mtime)
        print(f"📂 Carregando catálogo Medusa.js: {latest_file.name}")
        
        with open(latest_file, 'r', encoding='utf-8') as f:
            catalog = json.load(f)
        
        print(f"✅ Catálogo carregado: {len(catalog.get('products', []))} produtos\n")
        return catalog
    
    def create_enriched_metadata(self, enriched: Dict[str, Any]) -> Dict[str, Any]:
        """Cria metadata enriquecido para Medusa.js"""
        metadata = {
            'llm_enriched': True,
            'enriched_at': datetime.now().isoformat(),
            'enrichment_version': '1.0.0'
        }
        
        # Price Analysis
        if enriched.get('price_analysis'):
            metadata['price_analysis'] = {
                'recommendation': enriched['price_analysis'].get('price_recommendation'),
                'best_price': enriched['price_analysis'].get('best_price'),
                'average_price': enriched['price_analysis'].get('average_price'),
                'best_distributor': enriched['price_analysis'].get('best_distributor'),
                'distributors_count': enriched['price_analysis'].get('distributors_count')
            }
        
        # Warranty
        if enriched.get('warranty'):
            metadata['warranty'] = {
                'product_years': enriched['warranty'].get('product_warranty_years'),
                'performance_years': enriched['warranty'].get('performance_warranty_years'),
                'performance_guarantee': enriched['warranty'].get('performance_guarantee_pct'),
                'coverage': enriched['warranty'].get('coverage_scope')
            }
        
        # Certifications
        if enriched.get('certifications'):
            certs = enriched['certifications']
            metadata['certifications'] = {
                'inmetro': certs.get('inmetro', False),
                'inmetro_code': certs.get('inmetro_code'),
                'iec_standards': certs.get('iec_standards', []),
                'ce_marking': certs.get('ce_marking', False),
                'tuv_certified': certs.get('tuv_certified', False),
                'certification_score': certs.get('certification_score', 0)
            }
        
        # KPIs
        if enriched.get('kpis'):
            metadata['technical_kpis'] = {
                'efficiency_pct': enriched['kpis'].get('efficiency_pct'),
                'performance_ratio': enriched['kpis'].get('performance_ratio'),
                'degradation_annual': enriched['kpis'].get('degradation_rate_annual'),
                'lifecycle_years': enriched['kpis'].get('lifecycle_years'),
                'payback_months': enriched['kpis'].get('energy_payback_time_months')
            }
        
        # Quality Scores
        metadata['quality_scores'] = {
            'overall': round(enriched.get('overall_score', 0), 1),
            'value': round(enriched.get('value_score', 0), 1),
            'quality': round(enriched.get('quality_score', 0), 1),
            'reliability': round(enriched.get('reliability_score', 0), 1)
        }
        
        return metadata
    
    def find_matching_product(self, enriched: Dict[str, Any], 
                             catalog_products: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Encontra produto correspondente no catálogo Medusa"""
        enriched_id = enriched.get('id', '')
        
        # Tentar match por ID
        for product in catalog_products:
            if product.get('id') == enriched_id:
                return product
            
            # Tentar match por handle (slug)
            if enriched_id.replace('_', '-') in product.get('handle', ''):
                return product
            
            # Tentar match por título
            if enriched.get('title', '').lower() == product.get('title', '').lower():
                return product
        
        return None
    
    def merge_products(self, enriched_products: List[Dict[str, Any]], 
                      catalog: Dict[str, Any]) -> Dict[str, Any]:
        """Merge produtos enriquecidos com catálogo"""
        print("🔄 Iniciando merge...\n")
        
        catalog_products = catalog.get('products', [])
        self.stats['total_products'] = len(catalog_products)
        
        # Criar índice de produtos enriquecidos por ID
        enriched_index = {p['id']: p for p in enriched_products}
        
        merged_count = 0
        
        for product in catalog_products:
            product_id = product.get('id')
            
            # Buscar enriquecimento correspondente
            enriched = None
            
            # Try exact match by id
            if product_id in enriched_index:
                enriched = enriched_index[product_id]
            else:
                # Try fuzzy match
                enriched = self.find_matching_product(product, enriched_products)
            
            if enriched:
                # Merge metadata
                if 'metadata' not in product:
                    product['metadata'] = {}
                
                enriched_metadata = self.create_enriched_metadata(enriched)
                product['metadata'].update(enriched_metadata)
                
                # Update images if available
                if enriched.get('images') and not product.get('images'):
                    product['images'] = enriched['images']
                
                # Update thumbnail if available
                if enriched.get('images') and not product.get('thumbnail'):
                    product['thumbnail'] = enriched['images'][0]
                
                merged_count += 1
                self.stats['enriched_merged'] += 1
                
                if merged_count % 10 == 0:
                    print(f"   ✅ {merged_count} produtos merged...")
            else:
                self.stats['skipped'] += 1
        
        print(f"\n✅ Merge concluído: {merged_count} produtos enriquecidos\n")
        
        # Update catalog metadata
        if 'metadata' not in catalog:
            catalog['metadata'] = {}
        
        catalog['metadata']['enrichment'] = {
            'enriched_at': datetime.now().isoformat(),
            'total_enriched': merged_count,
            'enrichment_version': '1.0.0',
            'enrichment_source': 'LLM (GPT OSS 20B via Ollama)'
        }
        
        return catalog
    
    def save_merged_catalog(self, catalog: Dict[str, Any]):
        """Salva catálogo merged"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_file = self.output_path / f'complete_catalog_enriched_{timestamp}.json'
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(catalog, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Catálogo merged salvo: {output_file.name}")
        print(f"📊 Tamanho: {output_file.stat().st_size / 1024:.1f} KB\n")
        
        return output_file
    
    def generate_report(self, output_file: Path):
        """Gera relatório de merge"""
        print("=" * 60)
        print("📊 RELATÓRIO DE MERGE")
        print("=" * 60)
        print(f"📦 Produtos no catálogo: {self.stats['total_products']}")
        print(f"✅ Produtos enriquecidos merged: {self.stats['enriched_merged']}")
        print(f"⏭️  Produtos sem enrichment: {self.stats['skipped']}")
        print(f"❌ Erros: {self.stats['errors']}")
        print()
        
        if self.stats['total_products'] > 0:
            enrichment_rate = (self.stats['enriched_merged'] / self.stats['total_products']) * 100
            print(f"📈 Taxa de enriquecimento: {enrichment_rate:.1f}%")
        
        print()
        print(f"📁 Arquivo gerado: {output_file}")
        print("=" * 60)
    
    def run(self):
        """Executa merge completo"""
        print("🚀 MERGE DE PRODUTOS ENRIQUECIDOS COM MEDUSA.JS")
        print("=" * 60)
        print()
        
        try:
            # 1. Carregar produtos enriquecidos
            enriched_products = self.load_enriched_products()
            
            # 2. Carregar catálogo Medusa
            catalog = self.load_medusa_catalog()
            
            # 3. Merge
            merged_catalog = self.merge_products(enriched_products, catalog)
            
            # 4. Salvar
            output_file = self.save_merged_catalog(merged_catalog)
            
            # 5. Relatório
            self.generate_report(output_file)
            
            print("\n✅ MERGE CONCLUÍDO COM SUCESSO!")
            
        except Exception as e:
            print(f"\n❌ ERRO: {e}")
            self.stats['errors'] += 1
            raise


def main():
    merger = MedusaMerger()
    merger.run()


if __name__ == "__main__":
    main()
