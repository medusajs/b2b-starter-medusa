#!/usr/bin/env python3
"""
NORMALIZAÇÃO DE ESPECIFICAÇÕES TÉCNICAS E VINCULAÇÃO DE IMAGENS
YSH Solar Hub - Data Normalization & Image Linking
"""

import json
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
from collections import defaultdict

# Diretórios
BASE_DIR = Path(__file__).parent
CATALOG_DIR = BASE_DIR / "catalog"
SCHEMAS_DIR = CATALOG_DIR / "unified_schemas"
IMAGES_DIR = CATALOG_DIR / "images_processed"


class SpecsAndImagesNormalizer:
    """Normalizador de especificações técnicas e vinculador de imagens"""

    def __init__(self):
        self.image_map = self.build_image_map()
        self.stats = {
            'total_products': 0,
            'products_normalized': 0,
            'images_linked': 0,
            'missing_images': 0,
            'by_category': defaultdict(lambda: {
                'total': 0, 'normalized': 0, 'images_linked': 0
            })
        }

    def load_json(self, filepath: Path) -> Any:
        """Carrega arquivo JSON"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"⚠️  Erro ao carregar {filepath.name}: {e}")
            return None

    def save_json(self, data: Any, filepath: Path):
        """Salva arquivo JSON"""
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def build_image_map(self) -> Dict[str, Dict[str, str]]:
        """Constrói mapa de imagens processadas"""
        print("\n📸 Construindo mapa de imagens...")
        image_map = {}

        if not IMAGES_DIR.exists():
            print("⚠️  Diretório de imagens não encontrado")
            return image_map

        # DISTRIBUIDOR/CATEGORIA/SIZE/*.webp
        for distributor_dir in IMAGES_DIR.iterdir():
            if not distributor_dir.is_dir() or distributor_dir.name == 'reports':
                continue

            for category_dir in distributor_dir.iterdir():
                if not category_dir.is_dir():
                    continue

                for size in ['thumb', 'medium', 'large']:
                    size_dir = category_dir / size
                    if not size_dir.exists():
                        continue

                    for img_file in size_dir.glob('*.webp'):
                        product_id = self.extract_id_from_filename(img_file.name)

                        if product_id:
                            if product_id not in image_map:
                                image_map[product_id] = {}

                            rel_path = img_file.relative_to(CATALOG_DIR)
                            image_map[product_id][size] = str(rel_path).replace('\\', '/')

        print(f"   ✓ {len(image_map)} produtos com imagens mapeados")
        return image_map

    def extract_id_from_filename(self, filename: str) -> Optional[str]:
        """Extrai ID do arquivo de imagem"""
        name = filename.replace('.webp', '').replace('.jpg', '').replace('.png', '')

        # Padrões
        patterns = [
            r'(FOTUS-[A-Z0-9-]+)',
            r'(sku[_-]\d+)',
            r'(neosolar_\w+_\d+)',
            r'(\d{5,})',
        ]

        for pattern in patterns:
            match = re.search(pattern, name, re.IGNORECASE)
            if match:
                return match.group(1)

        return name

    def normalize_power(self, text: str) -> Optional[float]:
        """Normaliza potência para kW"""
        if not text:
            return None

        text = str(text).upper().replace(',', '.')

        # Padrões
        if match := re.search(r'(\d+\.?\d*)\s*KW', text):
            return float(match.group(1))
        elif match := re.search(r'(\d+\.?\d*)\s*W(?!I)', text):
            return float(match.group(1)) * 0.001
        elif match := re.search(r'(\d+\.?\d*)', text):
            val = float(match.group(1))
            return val if val < 100 else val * 0.001

        return None

    def normalize_voltage(self, text: str) -> Optional[str]:
        """Normaliza tensão"""
        if not text:
            return None

        text = str(text).upper()

        if '220' in text and '127' in text:
            return '220/127V'
        elif '220' in text:
            return '220V'
        elif '127' in text:
            return '127V'
        elif '380' in text:
            return '380V'
        elif match := re.search(r'(\d+)V', text):
            return f"{match.group(1)}V"

        return None

    def normalize_phases(self, text: str) -> Optional[str]:
        """Normaliza fases"""
        if not text:
            return None

        text = str(text).upper()

        if any(x in text for x in ['MONO', '1F', 'SINGLE']):
            return 'Monofásico'
        elif any(x in text for x in ['TRI', '3F', 'THREE']):
            return 'Trifásico'
        elif any(x in text for x in ['BI', '2F']):
            return 'Bifásico'

        return None

    def normalize_efficiency(self, text: str) -> Optional[float]:
        """Normaliza eficiência para %"""
        if not text:
            return None

        text = str(text).replace(',', '.')

        if match := re.search(r'(\d+\.?\d*)\s*%', text):
            return float(match.group(1))
        elif match := re.search(r'(\d+\.?\d*)', text):
            val = float(match.group(1))
            return val if val > 1 else val * 100

        return None

    def normalize_inverter(self, product: Dict) -> Dict:
        """Normaliza especificações de inversores"""
        specs = {}
        name = product.get('name', '')
        desc = product.get('description', '')
        combined = f"{name} {desc}"

        # Potência
        if power := self.normalize_power(combined):
            specs['power_kw'] = round(power, 2)

        # Tipo
        combined_upper = combined.upper()
        if 'MICRO' in combined_upper:
            specs['type'] = 'MICROINVERSOR'
        elif 'HÍBRIDO' in combined or 'HYBRID' in combined_upper:
            specs['type'] = 'HÍBRIDO'
        elif 'OFF GRID' in combined_upper:
            specs['type'] = 'OFF-GRID'
        else:
            specs['type'] = 'STRING'

        # Tensão e fases
        if voltage := self.normalize_voltage(combined):
            specs['voltage'] = voltage
        if phases := self.normalize_phases(combined):
            specs['phases'] = phases

        # Eficiência
        if efficiency := self.normalize_efficiency(combined):
            specs['efficiency'] = round(efficiency, 1)

        # MPPT
        if match := re.search(r'(\d+)\s*MPPT', combined.upper()):
            specs['mppt_trackers'] = int(match.group(1))

        return specs

    def normalize_panel(self, product: Dict) -> Dict:
        """Normaliza especificações de painéis"""
        specs = {}
        name = product.get('name', '')
        desc = product.get('description', '')
        combined = f"{name} {desc}"

        # Potência em W
        if match := re.search(r'(\d+)\s*W(?!I)', combined):
            specs['power_w'] = int(match.group(1))

        # Tecnologia
        combined_upper = combined.upper()
        if 'MONO' in combined_upper:
            specs['technology'] = 'Monocristalino'
        elif 'POLI' in combined_upper or 'POLY' in combined_upper:
            specs['technology'] = 'Policristalino'
        else:
            specs['technology'] = 'Monocristalino'

        # Eficiência
        if efficiency := self.normalize_efficiency(combined):
            specs['efficiency'] = round(efficiency, 1)

        # Bifacial
        if 'BIFACIAL' in combined_upper or 'BIFAC' in combined_upper:
            specs['bifacial'] = True

        return specs

    def link_images(self, product: Dict, product_id: str) -> bool:
        """Vincula imagens ao produto"""
        if not product_id:
            self.stats['missing_images'] += 1
            return False

        images = self.image_map.get(product_id)

        if not images:
            # Tenta variações
            variations = []
            if '-' in product_id:
                variations.append(product_id.split('-')[0])
                variations.append(re.sub(r'-\d+kWp', '', product_id))
                variations.append(product_id.replace('-kits', ''))

            for var in variations:
                if var in self.image_map:
                    images = self.image_map[var]
                    break

        if images:
            product['images_processed'] = {
                'thumb': f"/catalog/{images.get('thumb', '')}",
                'medium': f"/catalog/{images.get('medium', '')}",
                'large': f"/catalog/{images.get('large', '')}",
                'original': images.get('large', '')
            }
            self.stats['images_linked'] += 1
            return True

        self.stats['missing_images'] += 1
        return False

    def normalize_product(self, product: Dict, category: str) -> Dict:
        """Normaliza produto completo"""
        product_id = product.get('id', '')

        if 'technical_specs' not in product:
            product['technical_specs'] = {}

        # Normaliza por categoria
        if category == 'inverters':
            specs = self.normalize_inverter(product)
            product['technical_specs'].update(specs)
        elif category == 'panels':
            specs = self.normalize_panel(product)
            product['technical_specs'].update(specs)

        # Vincula imagens
        self.link_images(product, product_id)

        # Metadados
        if 'metadata' not in product:
            product['metadata'] = {}

        product['metadata']['normalized'] = True
        product['metadata']['normalized_at'] = datetime.now().isoformat()

        self.stats['products_normalized'] += 1

        return product

    def process_category(self, category: str):
        """Processa uma categoria"""
        json_file = SCHEMAS_DIR / f"{category}_unified.json"

        if not json_file.exists():
            return

        print(f"\n📦 Processando: {category}")

        products = self.load_json(json_file)
        if not products or not isinstance(products, list):
            print(f"   ⚠️  Formato inválido")
            return

        normalized = []
        for product in products:
            norm_prod = self.normalize_product(product, category)
            normalized.append(norm_prod)
            self.stats['total_products'] += 1
            self.stats['by_category'][category]['total'] += 1
            if norm_prod.get('technical_specs'):
                self.stats['by_category'][category]['normalized'] += 1
            if norm_prod.get('images_processed'):
                self.stats['by_category'][category]['images_linked'] += 1

        self.save_json(normalized, json_file)

        cat_stats = self.stats['by_category'][category]
        print(f"   ✓ {len(normalized)} produtos processados")
        print(f"   ✓ {cat_stats['normalized']} normalizados")
        print(f"   ✓ {cat_stats['images_linked']} com imagens")

    def generate_report(self):
        """Gera relatório"""
        print(f"\n{'='*80}")
        print(f"📊 RELATÓRIO DE NORMALIZAÇÃO")
        print(f"{'='*80}")

        total = self.stats['total_products']
        normalized = self.stats['products_normalized']
        images = self.stats['images_linked']

        print(f"\nTotal: {total}")
        print(f"Normalizados: {normalized} ({normalized/total*100:.1f}%)")
        print(f"Com imagens: {images} ({images/total*100:.1f}%)")
        print(f"Sem imagens: {self.stats['missing_images']}")

        print(f"\nPor categoria:")
        for cat, stats in sorted(self.stats['by_category'].items()):
            t = stats['total']
            n = stats['normalized']
            i = stats['images_linked']
            print(f"\n{cat.upper()}:")
            print(f"   Total: {t}")
            print(f"   Normalizados: {n} ({n/t*100:.1f}%)")
            print(f"   Com imagens: {i} ({i/t*100:.1f}%)")

        # Salva relatório
        report = {
            'timestamp': datetime.now().isoformat(),
            'statistics': self.stats,
            'image_map_size': len(self.image_map)
        }
        self.save_json(report, SCHEMAS_DIR / 'NORMALIZATION_REPORT.json')

        print(f"\n✓ Relatório salvo: NORMALIZATION_REPORT.json")

    def run(self):
        """Executa normalização"""
        print("="*80)
        print("🔧 NORMALIZAÇÃO DE ESPECIFICAÇÕES E VINCULAÇÃO DE IMAGENS")
        print("="*80)

        categories = [
            'inverters', 'panels', 'kits', 'batteries', 'ev_chargers',
            'controllers', 'cables', 'structures', 'stringboxes',
            'accessories', 'posts', 'others'
        ]

        for cat in categories:
            self.process_category(cat)

        self.generate_report()

        print(f"\n{'='*80}")
        print(f"✅ NORMALIZAÇÃO CONCLUÍDA!")
        print(f"{'='*80}\n")


def main():
    normalizer = SpecsAndImagesNormalizer()
    normalizer.run()


if __name__ == "__main__":
    main()
