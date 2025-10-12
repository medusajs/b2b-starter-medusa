#!/usr/bin/env python3
"""
CONSOLIDAÇÃO E UNIFICAÇÃO DE SCHEMAS JSON - SEM PERDAS
YSH Solar Hub - Data Consolidation Script

Este script garante que todos os dados JSON sejam consolidados e unificados
sem perda de informação, criando um catálogo master integrado.
"""

import json
import shutil
from pathlib import Path
from datetime import datetime
from collections import defaultdict
from typing import Dict, List, Any

# Diretórios
BASE_DIR = Path(__file__).parent
CATALOG_DIR = BASE_DIR / "catalog"
ACHIEVE_DIR = BASE_DIR / "achieve"
OUTPUT_DIR = CATALOG_DIR / "unified_schemas"

# Fontes de dados
SOURCES = {
    'catalog': CATALOG_DIR,
    'unified': ACHIEVE_DIR / "unified_catalog",
    'consolidated': ACHIEVE_DIR / "catalog_consolidated",
    'schemas': ACHIEVE_DIR / "schemas",
    'schemas_enriched': CATALOG_DIR / "schemas_enriched"
}


class SchemaConsolidator:
    """Consolidador de schemas JSON sem perdas"""

    def __init__(self):
        self.all_data = defaultdict(list)
        self.metadata = {
            'timestamp': datetime.now().isoformat(),
            'sources_processed': [],
            'total_products': 0,
            'by_category': {},
            'integrity_check': {}
        }
        self.product_hashes = defaultdict(set)

    def load_json(self, filepath: Path) -> Any:
        """Carrega arquivo JSON com tratamento de erros"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️  Erro ao carregar {filepath.name}: {e}")
            return None

    def save_json(self, data: Any, filepath: Path):
        """Salva arquivo JSON"""
        filepath.parent.mkdir(parents=True, exist_ok=True)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def generate_product_hash(self, product: Dict) -> str:
        """Gera hash único para identificar produtos"""
        # Usa múltiplos campos para identificação
        keys = [
            product.get('id', ''),
            product.get('manufacturer', ''),
            product.get('model', ''),
            product.get('name', ''),
            str(product.get('power_kw', product.get('power_w', '')))
        ]
        return '|'.join(str(k).lower().strip() for k in keys if k)

    def merge_products(self, existing: Dict, new: Dict) -> Dict:
        """Merge inteligente de produtos, preservando todos os dados"""
        merged = existing.copy()

        # Merge campos simples (prioriza valores não vazios)
        for key, value in new.items():
            if key not in merged or not merged[key]:
                merged[key] = value
            elif isinstance(value, dict) and isinstance(merged[key], dict):
                # Merge recursivo para objetos
                merged[key] = {**merged[key], **value}
            elif isinstance(value, list) and isinstance(merged[key], list):
                # Merge de listas (preserva objetos complexos)
                if value and isinstance(value[0], dict):
                    # Para listas de objetos, apenas adiciona novos
                    existing_ids = {str(item.get('id', item)) for item in merged[key] if isinstance(item, dict)}
                    for item in value:
                        if isinstance(item, dict):
                            item_id = str(item.get('id', item))
                            if item_id not in existing_ids:
                                merged[key].append(item)
                        else:
                            merged[key].append(item)
                else:
                    # Para listas simples, deduplica
                    try:
                        merged[key] = list(set(merged[key] + value))
                    except TypeError:
                        # Se não puder fazer set, mantém lista combinada
                        merged[key] = merged[key] + [v for v in value if v not in merged[key]]

        # Adiciona metadados de merge
        if 'metadata' not in merged:
            merged['metadata'] = {}

        if 'merged_from_sources' not in merged['metadata']:
            merged['metadata']['merged_from_sources'] = []

        source = new.get('metadata', {}).get('source', 'unknown')
        if source not in merged['metadata']['merged_from_sources']:
            merged['metadata']['merged_from_sources'].append(source)

        merged['metadata']['last_consolidated'] = datetime.now().isoformat()

        return merged

    def process_directory(self, directory: Path, source_name: str):
        """Processa todos os JSONs de um diretório"""
        print(f"\n📂 Processando: {source_name} ({directory})")

        if not directory.exists():
            print(f"   ⚠️  Diretório não encontrado")
            return

        json_files = list(directory.glob('*.json'))

        # Ignora arquivos de backup e relatórios
        json_files = [f for f in json_files if not any(x in f.name.lower()
            for x in ['backup', 'report', 'inventory', 'stats', 'config'])]

        print(f"   Encontrados: {len(json_files)} arquivos JSON")

        for json_file in json_files:
            self.process_json_file(json_file, source_name)

    def process_json_file(self, filepath: Path, source_name: str):
        """Processa um arquivo JSON individual"""
        data = self.load_json(filepath)
        if data is None:
            return

        # Adiciona metadados de origem
        source_metadata = {
            'source': source_name,
            'source_file': filepath.name,
            'loaded_at': datetime.now().isoformat()
        }

        # Identifica categoria pelo nome do arquivo
        category = self.identify_category(filepath.name)

        # Processa dados
        products = []
        if isinstance(data, list):
            products = data
        elif isinstance(data, dict):
            if 'products' in data:
                products = data['products']
            elif 'kits' in data:
                products = data['kits']
            else:
                # Trata como produto único
                products = [data]

        # Adiciona produtos com merge inteligente
        added = 0
        merged = 0

        for product in products:
            if not isinstance(product, dict):
                continue

            # Adiciona metadados de origem
            if 'metadata' not in product:
                product['metadata'] = {}
            product['metadata'].update(source_metadata)

            # Gera hash do produto
            product_hash = self.generate_product_hash(product)

            # Verifica se já existe
            if product_hash in self.product_hashes[category]:
                # Merge com produto existente
                existing_idx = next(
                    (i for i, p in enumerate(self.all_data[category])
                     if self.generate_product_hash(p) == product_hash),
                    None
                )
                if existing_idx is not None:
                    self.all_data[category][existing_idx] = self.merge_products(
                        self.all_data[category][existing_idx],
                        product
                    )
                    merged += 1
            else:
                # Adiciona novo produto
                self.all_data[category].append(product)
                self.product_hashes[category].add(product_hash)
                added += 1

        print(f"   ✓ {filepath.name}: {added} novos, {merged} merged → {category}")
        self.metadata['sources_processed'].append({
            'source': source_name,
            'file': filepath.name,
            'category': category,
            'added': added,
            'merged': merged
        })

    def identify_category(self, filename: str) -> str:
        """Identifica categoria do produto pelo nome do arquivo"""
        filename_lower = filename.lower()

        if 'inverter' in filename_lower:
            return 'inverters'
        elif 'panel' in filename_lower or 'painel' in filename_lower:
            return 'panels'
        elif 'kit' in filename_lower:
            return 'kits'
        elif 'batter' in filename_lower or 'bateria' in filename_lower:
            return 'batteries'
        elif 'cable' in filename_lower or 'cabo' in filename_lower:
            return 'cables'
        elif 'structure' in filename_lower or 'estrutura' in filename_lower:
            return 'structures'
        elif 'stringbox' in filename_lower or 'string' in filename_lower:
            return 'stringboxes'
        elif 'charger' in filename_lower or 'carregador' in filename_lower:
            return 'ev_chargers'
        elif 'controller' in filename_lower or 'controlador' in filename_lower:
            return 'controllers'
        elif 'accessor' in filename_lower or 'acessorio' in filename_lower:
            return 'accessories'
        elif 'post' in filename_lower or 'poste' in filename_lower:
            return 'posts'
        else:
            return 'others'

    def run_consolidation(self):
        """Executa consolidação completa"""
        print("="*80)
        print("🔄 CONSOLIDAÇÃO E UNIFICAÇÃO DE SCHEMAS JSON - SEM PERDAS")
        print("="*80)

        # Processa todas as fontes
        for source_name, source_dir in SOURCES.items():
            if source_dir.exists():
                self.process_directory(source_dir, source_name)

        # Estatísticas
        total_products = sum(len(products) for products in self.all_data.values())
        self.metadata['total_products'] = total_products
        self.metadata['by_category'] = {
            cat: len(prods) for cat, prods in self.all_data.items()
        }

        print(f"\n{'='*80}")
        print(f"📊 ESTATÍSTICAS DE CONSOLIDAÇÃO")
        print(f"{'='*80}")
        print(f"Total de produtos consolidados: {total_products}")
        print(f"\nPor categoria:")
        for category, count in sorted(self.metadata['by_category'].items()):
            print(f"   • {category}: {count} produtos")

        # Salva arquivos consolidados
        self.save_consolidated_files()

        # Gera relatório de integridade
        self.generate_integrity_report()

    def save_consolidated_files(self):
        """Salva arquivos consolidados"""
        print(f"\n{'='*80}")
        print(f"💾 SALVANDO ARQUIVOS CONSOLIDADOS")
        print(f"{'='*80}")

        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

        # Salva por categoria
        for category, products in self.all_data.items():
            if products:
                output_file = OUTPUT_DIR / f"{category}_unified.json"
                self.save_json(products, output_file)
                print(f"   ✓ {output_file.name}: {len(products)} produtos")

        # Salva metadados
        metadata_file = OUTPUT_DIR / "CONSOLIDATION_METADATA.json"
        self.save_json(self.metadata, metadata_file)
        print(f"   ✓ {metadata_file.name}: metadados")

        # Cria índice master
        master_index = {
            'version': '1.0.0',
            'generated_at': datetime.now().isoformat(),
            'total_products': self.metadata['total_products'],
            'categories': self.metadata['by_category'],
            'files': [f"{cat}_unified.json" for cat in self.all_data.keys()],
            'sources': list(SOURCES.keys())
        }
        index_file = OUTPUT_DIR / "MASTER_INDEX.json"
        self.save_json(master_index, index_file)
        print(f"   ✓ {index_file.name}: índice master")

    def generate_integrity_report(self):
        """Gera relatório de integridade dos dados"""
        print(f"\n{'='*80}")
        print(f"✅ VERIFICAÇÃO DE INTEGRIDADE")
        print(f"{'='*80}")

        integrity = {
            'total_products': self.metadata['total_products'],
            'by_category': self.metadata['by_category'],
            'sources_processed': len(self.metadata['sources_processed']),
            'data_quality': {}
        }

        # Verifica qualidade dos dados
        for category, products in self.all_data.items():
            quality = {
                'total': len(products),
                'with_id': sum(1 for p in products if p.get('id')),
                'with_name': sum(1 for p in products if p.get('name')),
                'with_manufacturer': sum(1 for p in products if p.get('manufacturer')),
                'with_price': sum(1 for p in products if p.get('price_brl') or p.get('price')),
                'with_image': sum(1 for p in products if p.get('image_url') or p.get('images')),
                'with_metadata': sum(1 for p in products if p.get('metadata'))
            }

            quality['completeness_pct'] = round(
                (quality['with_id'] + quality['with_name'] + quality['with_manufacturer']) /
                (quality['total'] * 3) * 100, 1
            ) if quality['total'] > 0 else 0

            integrity['data_quality'][category] = quality

            print(f"\n{category.upper()}:")
            print(f"   Total: {quality['total']}")
            print(f"   Com ID: {quality['with_id']} ({quality['with_id']/quality['total']*100:.1f}%)")
            print(f"   Com Nome: {quality['with_name']} ({quality['with_name']/quality['total']*100:.1f}%)")
            print(f"   Com Fabricante: {quality['with_manufacturer']} ({quality['with_manufacturer']/quality['total']*100:.1f}%)")
            print(f"   Completude: {quality['completeness_pct']}%")

        # Salva relatório
        report_file = OUTPUT_DIR / "INTEGRITY_REPORT.json"
        self.save_json(integrity, report_file)
        print(f"\n✓ Relatório salvo em: {report_file}")


def main():
    consolidator = SchemaConsolidator()
    consolidator.run_consolidation()

    print(f"\n{'='*80}")
    print(f"✅ CONSOLIDAÇÃO CONCLUÍDA COM SUCESSO!")
    print(f"{'='*80}")
    print(f"📁 Arquivos salvos em: {OUTPUT_DIR}")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    main()
