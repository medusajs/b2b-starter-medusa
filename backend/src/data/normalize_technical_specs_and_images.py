#!/usr/bin/env python3
"""
NORMALIZAÇÃO DE ESPECIFICAÇÕES TÉCNICAS E VINCULAÇÃO DE IMAGENS
YSH Solar Hub - Data Normalization & Image Linking

Padroniza especificações técnicas e vincula imagens processadas aos produtos.
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

# Schemas de especificações técnicas padronizadas
TECHNICAL_SPECS_SCHEMA = {
    'inverters': {
        'required': ['power_kw', 'type', 'voltage', 'phases', 'efficiency'],
        'optional': ['mppt_trackers', 'max_input_power_w', 'max_input_voltage',
                    'certifications', 'warranty_years', 'dimensions', 'weight_kg']
    },
    'panels': {
        'required': ['power_w', 'technology', 'efficiency', 'dimensions'],
        'optional': ['voltage_voc', 'current_isc', 'voltage_vmp', 'current_imp',
                    'temperature_coefficient', 'certifications', 'warranty_years', 'weight_kg']
    },
    'batteries': {
        'required': ['capacity_ah', 'voltage_v', 'technology', 'cycle_life'],
        'optional': ['depth_of_discharge', 'charge_efficiency', 'dimensions',
                    'weight_kg', 'warranty_years', 'certifications']
    },
    'ev_chargers': {
        'required': ['power_kw', 'connector_type', 'voltage', 'current_a'],
        'optional': ['cable_length_m', 'protection_rating', 'certifications',
                    'warranty_years', 'dimensions', 'weight_kg']
    },
    'controllers': {
        'required': ['power_w', 'voltage', 'current_a', 'type'],
        'optional': ['mppt_efficiency', 'max_input_voltage', 'certifications',
                    'warranty_years', 'dimensions', 'weight_kg']
    }
}


class TechnicalSpecsNormalizer:
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
        """Constrói mapa de imagens processadas por ID/SKU do produto"""
        print("\n📸 Construindo mapa de imagens...")
        image_map = {}

        if not IMAGES_DIR.exists():
            print("⚠️  Diretório de imagens não encontrado")
            return image_map

        # Percorre distribuidores (FOTUS, NEOSOLAR, etc.)
        for distributor_dir in IMAGES_DIR.iterdir():
            if not distributor_dir.is_dir() or distributor_dir.name == 'reports':
                continue

            # Percorre categorias dentro do distribuidor (KITS, PANELS, etc.)
            for category_dir in distributor_dir.iterdir():
                if not category_dir.is_dir():
                    continue

                # Percorre thumb, medium, large
                for size in ['thumb', 'medium', 'large']:
                    size_dir = category_dir / size
                    if not size_dir.exists():
                        continue

                    for img_file in size_dir.glob('*.webp'):
                        # Extrai ID do nome do arquivo
                        product_id = self.extract_product_id_from_filename(img_file.name)

                        if product_id:
                            if product_id not in image_map:
                                image_map[product_id] = {}

                            # Caminho relativo a partir de catalog/
                            rel_path = img_file.relative_to(CATALOG_DIR)
                            image_map[product_id][size] = str(rel_path).replace('\\', '/')

        print(f"   ✓ {len(image_map)} produtos com imagens mapeados")
        return image_map

    def extract_product_id_from_filename(self, filename: str) -> Optional[str]:
        """Extrai ID do produto do nome do arquivo"""
        # Remove extensão
        name = filename.replace('.webp', '').replace('.jpg', '').replace('.png', '')

        # Padrões comuns de ID
        patterns = [
            r'FOTUS-([A-Z0-9-]+)',  # FOTUS-KP02-120kWp-Ceramico-kits
            r'sku[_-](\d+)',         # sku_289244
            r'neosolar_\w+_(\d+)',   # neosolar_inverters_22916
            r'(\d{5,})',             # 289244 (5+ dígitos)
        ]

        for pattern in patterns:
            match = re.search(pattern, name)
            if match:
                return match.group(0)

        # Se não encontrou, usa o nome completo sem extensão
        return name

    def normalize_power(self, text: str) -> Optional[float]:
        """Normaliza valores de potência"""
        if not text:
            return None

        text = str(text).upper().replace(',', '.')

        # Extrai número com unidade
        patterns = [
            (r'(\d+\.?\d*)\s*KW', 1.0),      # kW
            (r'(\d+\.?\d*)\s*W', 0.001),     # W
            (r'(\d+\.?\d*)\s*MW', 1000.0),   # MW
        ]

        for pattern, multiplier in patterns:
            match = re.search(pattern, text)
            if match:
                return float(match.group(1)) * multiplier

        # Tenta extrair apenas número
        match = re.search(r'(\d+\.?\d*)', text)
        if match:
            val = float(match.group(1))
            # Inferir unidade pelo valor
            if val < 10:  # Provavelmente kW
                return val
            elif val < 10000:  # Provavelmente W
                return val * 0.001

        return None

    def normalize_voltage(self, text: str) -> Optional[str]:
        """Normaliza tensão"""
        if not text:
            return None

        text = str(text).upper()

        # Padrões de tensão
        if '220' in text or '127' in text:
            if '/' in text or 'OU' in text:
                return '220/127V'
            elif '220' in text:
                return '220V'
            elif '127' in text:
                return '127V'
        elif '380' in text:
            return '380V'
        elif '12' in text:
            return '12V'
        elif '24' in text:
            return '24V'
        elif '48' in text:
            return '48V'

        return text.strip()

    def normalize_phases(self, text: str) -> Optional[str]:
        """Normaliza tipo de fase"""
        if not text:
            return None

        text = str(text).upper()

        if 'MONO' in text or '1F' in text or 'SINGLE' in text:
            return 'Monofásico'
        elif 'TRI' in text or '3F' in text or 'THREE' in text:
            return 'Trifásico'
        elif 'BI' in text or '2F' in text:
            return 'Bifásico'

        return None

    def normalize_efficiency(self, text: str) -> Optional[float]:
        """Normaliza eficiência (%)"""
        if not text:
            return None

        text = str(text).replace(',', '.')

        match = re.search(r'(\d+\.?\d*)\s*%', text)
        if match:
            return float(match.group(1))

        match = re.search(r'(\d+\.?\d*)', text)
        if match:
            val = float(match.group(1))
            # Se maior que 1, já está em porcentagem
            if val > 1:
                return val
            # Se menor que 1, converter (0.96 -> 96%)
            return val * 100

        return None

    def normalize_inverter_specs(self, product: Dict) -> Dict:
        """Normaliza especificações de inversores"""
        specs = {}

        # Extrai dados do nome e descrição
        name = product.get('name', '')
        desc = product.get('description', '')
        combined = f"{name} {desc}"

        # Potência
        power_kw = self.normalize_power(combined)
        if power_kw:
            specs['power_kw'] = round(power_kw, 2)

        # Tipo de inversor
        if 'MICRO' in combined.upper():
            specs['type'] = 'MICROINVERSOR'
        elif 'STRING' in combined.upper() or 'ON GRID' in combined.upper():
            specs['type'] = 'STRING'
        elif 'HÍBRIDO' in combined or 'HYBRID' in combined.upper():
            specs['type'] = 'HÍBRIDO'
        elif 'OFF GRID' in combined.upper():
            specs['type'] = 'OFF-GRID'
        else:
            specs['type'] = 'STRING'  # Default

        # Tensão
        voltage = self.normalize_voltage(combined)
        if voltage:
            specs['voltage'] = voltage

        # Fases
        phases = self.normalize_phases(combined)
        if phases:
            specs['phases'] = phases

        # Eficiência
        efficiency = self.normalize_efficiency(combined)
        if efficiency:
            specs['efficiency'] = round(efficiency, 1)

        # MPPT
        if 'MPPT' in combined.upper():
            mppt_match = re.search(r'(\d+)\s*MPPT', combined.upper())
            if mppt_match:
                specs['mppt_trackers'] = int(mppt_match.group(1))

        return specs

    def normalize_panel_specs(self, product: Dict) -> Dict:
        """Normaliza especificações de painéis"""
        specs = {}

        name = product.get('name', '')
        desc = product.get('description', '')
        combined = f"{name} {desc}"

        # Potência (W)
        power_match = re.search(r'(\d+)\s*W(?!I)', combined)
        if power_match:
            specs['power_w'] = int(power_match.group(1))

        # Tecnologia
        if 'MONO' in combined.upper():
            specs['technology'] = 'Monocristalino'
        elif 'POLI' in combined.upper() or 'POLY' in combined.upper():
            specs['technology'] = 'Policristalino'
        else:
            specs['technology'] = 'Monocristalino'  # Default moderno

        # Eficiência
        efficiency = self.normalize_efficiency(combined)
        if efficiency:
            specs['efficiency'] = round(efficiency, 1)

        # Bifacial
        if 'BIFACIAL' in combined.upper() or 'BIFAC' in combined.upper():
            specs['bifacial'] = True

        return specs

    def link_images_to_product(self, product: Dict, product_id: str) -> bool:
        """Vincula imagens processadas ao produto"""
        # Se product_id é None ou vazio, não pode vincular
        if not product_id:
            self.stats['missing_images'] += 1
            return False

        # Tenta encontrar imagens pelo ID
        images = self.image_map.get(product_id)

        if not images:
            # Tenta variações do ID
            variations = [
                product_id.replace('-kits', ''),
                product_id.split('-')[0] if '-' in product_id else None,
                re.sub(r'-\d+kWp', '', product_id),
            ]

            for var in variations:
                if var and var in self.image_map:
                    images = self.image_map[var]
                    break

        if images:
            product['images_processed'] = {
                'thumb': f"/catalog/{images.get('thumb', '')}",
                'medium': f"/catalog/{images.get('medium', '')}",
                'large': f"/catalog/{images.get('large', '')}",
                'original': images.get('large', '')  # Large como original
            }
            self.stats['images_linked'] += 1
            return True

        self.stats['missing_images'] += 1
        return False    def normalize_product(self, product: Dict, category: str) -> Dict:
        """Normaliza um produto completo"""
        product_id = product.get('id', '')

        # Cria seção de specs técnicas se não existir
        if 'technical_specs' not in product:
            product['technical_specs'] = {}

        # Normaliza baseado na categoria
        if category == 'inverters':
            specs = self.normalize_inverter_specs(product)
            product['technical_specs'].update(specs)
        elif category == 'panels':
            specs = self.normalize_panel_specs(product)
            product['technical_specs'].update(specs)

        # Vincula imagens
        self.link_images_to_product(product, product_id)

        # Atualiza metadados
        if 'metadata' not in product:
            product['metadata'] = {}

        product['metadata']['normalized'] = True
        product['metadata']['normalized_at'] = datetime.now().isoformat()

        self.stats['products_normalized'] += 1

        return product

    def process_category(self, category: str):
        """Processa uma categoria completa"""
        json_file = SCHEMAS_DIR / f"{category}_unified.json"

        if not json_file.exists():
            print(f"⚠️  {json_file.name} não encontrado")
            return

        print(f"\n📦 Processando: {category}")

        products = self.load_json(json_file)
        if not products or not isinstance(products, list):
            print(f"   ⚠️  Formato inválido")
            return

        normalized_products = []
        for product in products:
            normalized = self.normalize_product(product, category)
            normalized_products.append(normalized)
            self.stats['total_products'] += 1
            self.stats['by_category'][category]['total'] += 1
            if normalized.get('technical_specs'):
                self.stats['by_category'][category]['normalized'] += 1
            if normalized.get('images_processed'):
                self.stats['by_category'][category]['images_linked'] += 1

        # Salva arquivo normalizado
        self.save_json(normalized_products, json_file)

        print(f"   ✓ {len(normalized_products)} produtos processados")
        print(f"   ✓ {self.stats['by_category'][category]['normalized']} normalizados")
        print(f"   ✓ {self.stats['by_category'][category]['images_linked']} com imagens vinculadas")

    def generate_report(self):
        """Gera relatório de normalização"""
        print(f"\n{'='*80}")
        print(f"📊 RELATÓRIO DE NORMALIZAÇÃO")
        print(f"{'='*80}")

        print(f"\nTotal de produtos: {self.stats['total_products']}")
        print(f"Produtos normalizados: {self.stats['products_normalized']} ({self.stats['products_normalized']/self.stats['total_products']*100:.1f}%)")
        print(f"Imagens vinculadas: {self.stats['images_linked']} ({self.stats['images_linked']/self.stats['total_products']*100:.1f}%)")
        print(f"Sem imagens: {self.stats['missing_images']}")

        print(f"\nPor categoria:")
        for category, stats in sorted(self.stats['by_category'].items()):
            print(f"\n{category.upper()}:")
            print(f"   Total: {stats['total']}")
            print(f"   Normalizados: {stats['normalized']} ({stats['normalized']/stats['total']*100:.1f}%)")
            print(f"   Com imagens: {stats['images_linked']} ({stats['images_linked']/stats['total']*100:.1f}%)")

        # Salva relatório JSON
        report_file = SCHEMAS_DIR / 'NORMALIZATION_REPORT.json'
        self.save_json({
            'timestamp': datetime.now().isoformat(),
            'statistics': self.stats,
            'image_map_size': len(self.image_map)
        }, report_file)

        print(f"\n✓ Relatório salvo em: {report_file}")

    def run(self):
        """Executa normalização completa"""
        print("="*80)
        print("🔧 NORMALIZAÇÃO DE ESPECIFICAÇÕES TÉCNICAS E VINCULAÇÃO DE IMAGENS")
        print("="*80)

        # Categorias prioritárias
        categories = [
            'inverters',
            'panels',
            'kits',
            'batteries',
            'ev_chargers',
            'controllers',
            'cables',
            'structures',
            'stringboxes',
            'accessories',
            'posts',
            'others'
        ]

        for category in categories:
            self.process_category(category)

        self.generate_report()

        print(f"\n{'='*80}")
        print(f"✅ NORMALIZAÇÃO CONCLUÍDA!")
        print(f"{'='*80}\n")


def main():
    normalizer = TechnicalSpecsNormalizer()
    normalizer.run()


if __name__ == "__main__":
    main()
