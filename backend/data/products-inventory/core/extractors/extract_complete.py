#!/usr/bin/env python3
"""
COMPLETE INVENTORY EXTRACTION - ALL PRODUCT CATEGORIES
=======================================================

This script extracts ALL product categories from all distributors, including:
- Core categories: panels, inverters, kits, batteries, structures, stringboxes, cables, accessories
- SPECIALIZED categories:
  * EV Chargers (carregadores veiculares)
  * Solar Water Pumps (bombas solares)
  * Microinverters (microinversores)
  * Solar Trackers (rastreadores solares)
  * Smart Meters/Monitoring (medidores inteligentes)
  * Transformers (transformadores)
  * Security Equipment (equipamentos de segurança)
  * Miscellaneous Products (produtos diversos)

Author: YSH Medusa Data Team
Date: 2025-01-14
"""

import json
import re
import csv
from pathlib import Path
from dataclasses import dataclass, asdict
from collections import defaultdict
from typing import List, Dict, Optional, Set
import unicodedata
from datetime import datetime

@dataclass
class Product:
    """Complete product data structure."""
    id: str
    name: str
    manufacturer: str
    category: str
    sub_category: Optional[str]
    price: str
    distributor: str
    availability: str
    image: Optional[str] = None
    source: Optional[str] = None
    description: Optional[str] = None
    technical_specs: Optional[Dict] = None
    sku: Optional[str] = None
    model: Optional[str] = None
    series: Optional[str] = None
    power: Optional[str] = None

class CompleteInventoryExtractor:
    """Extract complete inventory with ALL product categories."""
    
    # Extended category mapping - 16 categories total
    CATEGORIES = {
        'panels': ['painel', 'módulo fotovoltaico', 'panel', 'solar panel', 'placa solar'],
        'inverters': ['inversor', 'inverter', 'on-grid', 'grid-tie'],
        'hybrid_inverters': ['híbrido', 'hybrid', 'off-grid'],
        'microinverters': ['microinversor', 'microinverter', 'micro inversor', 'micro-inversor'],
        'kits': ['kit', 'sistema completo', 'sistema solar'],
        'batteries': ['bateria', 'battery', 'armazenamento', 'storage', 'energia'],
        'structures': ['estrutura', 'structure', 'suporte', 'fixação', 'mounting', 'lastro'],
        'stringboxes': ['string box', 'stringbox', 'quadro', 'caixa de junção'],
        'cables': ['cabo', 'cable', 'wire', 'fio'],
        'accessories': ['acessório', 'accessory', 'conector', 'connector'],
        'ev_chargers': ['carregador veicular', 'ev charger', 'wallbox', 'carregador ev', 'veículo elétrico'],
        'water_pumps': ['bomba solar', 'bomba', 'pump', 'solar pump', 'irrigação', 'irrigation'],
        'solar_trackers': ['rastreador', 'tracker', 'seguidor solar'],
        'smart_meters': ['medidor', 'meter', 'smart meter', 'monitoramento', 'monitoring', 'ezlogger'],
        'transformers': ['transformador', 'transformer', 'trafo'],
        'security': ['segurança', 'security', 'proteção', 'dps', 'varistor', 'disjuntor', 'fusível']
    }
    
    # Manufacturer normalization map (extended)
    MANUFACTURER_MAP = {
        'canadian': 'Canadian Solar',
        'canadian solar': 'Canadian Solar',
        'jinko': 'JinkoSolar',
        'jinkosolar': 'JinkoSolar',
        'longi': 'Longi Solar',
        'longi solar': 'Longi Solar',
        'ja solar': 'JA Solar',
        'jasolar': 'JA Solar',
        'trina': 'Trina Solar',
        'trina solar': 'Trina Solar',
        'risen': 'Risen Energy',
        'risen energy': 'Risen Energy',
        'byd': 'BYD',
        'goodwe': 'GoodWe',
        'growatt': 'Growatt',
        'solis': 'Ginlong Solis',
        'ginlong': 'Ginlong Solis',
        'deye': 'Deye',
        'hoymiles': 'Hoymiles',
        'apsystems': 'APsystems',
        'ap systems': 'APsystems',
        'enphase': 'Enphase',
        'fronius': 'Fronius',
        'sma': 'SMA',
        'huawei': 'Huawei',
        'foxess': 'FoxESS',
        'fox ess': 'FoxESS',
        'k2': 'K2 Systems',
        'k2 systems': 'K2 Systems',
        'neosolar': 'Neosolar',
        'fortlev': 'Fortlev',
        'odex': 'ODEX',
        'fotus': 'FOTUS',
        'solfacil': 'Solfacil',
        'ebara': 'Ebara',
        'grundfos': 'Grundfos',
        'schneider': 'Schneider Electric',
        'weg': 'WEG',
        'intelbras': 'Intelbras',
        'epever': 'EPsolar',
        'victron': 'Victron Energy',
        'must': 'Must Solar',
        'luxpower': 'LuxPower'
    }
    
    def __init__(self, base_path: str = "distributors"):
        self.base_path = Path(base_path)
        self.products: List[Product] = []
        self.stats = defaultdict(int)
        self.manufacturers: Set[str] = set()
        
    def normalize_text(self, text: str) -> str:
        """Normalize text for comparison."""
        if not text:
            return ""
        text = unicodedata.normalize('NFKD', text)
        text = text.encode('ASCII', 'ignore').decode('ASCII')
        return text.lower().strip()
    
    def extract_manufacturer(self, name: str, category: str = "") -> str:
        """Extract and normalize manufacturer name."""
        normalized = self.normalize_text(name)
        
        # Direct match from map
        for key, value in self.MANUFACTURER_MAP.items():
            if key in normalized:
                return value
        
        # Extract from name patterns
        patterns = [
            r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)',  # Capital words at start
            r'([A-Z]{2,})',  # All caps words
        ]
        
        for pattern in patterns:
            match = re.search(pattern, name)
            if match:
                manufacturer = match.group(1).strip()
                normalized_mfr = self.normalize_text(manufacturer)
                if normalized_mfr in self.MANUFACTURER_MAP:
                    return self.MANUFACTURER_MAP[normalized_mfr]
                return manufacturer
        
        return "Unknown"
    
    def categorize_product(self, name: str, description: str = "") -> tuple:
        """Categorize product by name and description - returns (category, sub_category)."""
        text = self.normalize_text(f"{name} {description}")
        
        for category, keywords in self.CATEGORIES.items():
            for keyword in keywords:
                if keyword.lower() in text:
                    # For accessories, try to identify sub-category
                    if category == 'accessories':
                        if any(k in text for k in ['conector', 'connector']):
                            return ('accessories', 'connectors')
                        elif any(k in text for k in ['cabo', 'cable']):
                            return ('cables', None)
                        elif any(k in text for k in ['ferramenta', 'tool']):
                            return ('accessories', 'tools')
                    return (category, None)
        
        return ('miscellaneous', None)
    
    def extract_power(self, name: str) -> Optional[str]:
        """Extract power rating from product name."""
        # Match patterns like: 550W, 10kW, 10.5 kW, etc.
        patterns = [
            r'(\d+(?:\.\d+)?)\s*kW',
            r'(\d+(?:\.\d+)?)\s*W',
            r'(\d+)W'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, name, re.IGNORECASE)
            if match:
                return match.group(0)
        return None
    
    def load_fortlev_json_files(self) -> List[Product]:
        """Load all FortLev JSON category files."""
        products = []
        fortlev_path = self.base_path / "fortlev"
        
        # List of JSON files to load (all categories)
        json_files = [
            'fortlev-panels.json',
            'fortlev-inverters.json',
            'fortlev-hybrid_inverters.json',
            'fortlev-microinverters.json',
            'fortlev-kits.json',
            'fortlev-batteries.json',
            'fortlev-structures.json',
            'fortlev-stringboxes.json',
            'fortlev-accessories.json',
            'fortlev-ev_chargers.json',  # NEW: EV chargers
            'fortlev-transformers.json',  # NEW: Transformers
            'fortlev-security.json',  # NEW: Security equipment
            'fortlev-boxes.json',  # NEW: Boxes
            'fortlev-conduits.json',  # NEW: Conduits
            'fortlev-miscellaneous.json'  # NEW: Misc products
        ]
        
        for json_file in json_files:
            file_path = fortlev_path / json_file
            if not file_path.exists():
                print(f"  ⚠️  FortLev file not found: {json_file}")
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                if isinstance(data, list):
                    for item in data:
                        category, sub_cat = self.categorize_product(
                            item.get('name', ''),
                            item.get('description', '')
                        )
                        
                        product = Product(
                            id=item.get('id', ''),
                            name=item.get('name', ''),
                            manufacturer=self.extract_manufacturer(item.get('name', ''), category),
                            category=item.get('category', category),
                            sub_category=sub_cat,
                            price=item.get('price', 'N/A'),
                            distributor='FortLev',
                            availability=item.get('availability', 'Unknown'),
                            image=item.get('image'),
                            source=item.get('source'),
                            description=item.get('description'),
                            sku=item.get('sku'),
                            power=self.extract_power(item.get('name', ''))
                        )
                        products.append(product)
                        self.stats[f'fortlev_{category}'] += 1
                        
                print(f"  ✅ Loaded {len(data)} products from {json_file}")
            except Exception as e:
                print(f"  ❌ Error loading {json_file}: {e}")
        
        return products
    
    def load_fortlev_csv_pumps(self) -> List[Product]:
        """Extract water pumps from FortLev documentation CSV."""
        products = []
        csv_path = self.base_path / "fortlev" / "https___fortlevsolar.app_docum.csv"
        
        if not csv_path.exists():
            return products
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.reader(f)
                next(reader)  # Skip header
                
                for row in reader:
                    if len(row) < 3:
                        continue
                    
                    # Check if it's a pump product
                    product_id = row[1] if len(row) > 1 else ''
                    product_name = row[2] if len(row) > 2 else ''
                    
                    if not product_id.startswith('IBS'):
                        continue
                    
                    if 'bomba' not in product_name.lower():
                        continue
                    
                    product = Product(
                        id=f"fortlev_pumps_{product_id}",
                        name=product_name,
                        manufacturer=self.extract_manufacturer(product_name, 'water_pumps'),
                        category='water_pumps',
                        sub_category='submersible',
                        price='N/A',  # Price not in documentation CSV
                        distributor='FortLev',
                        availability='Available',
                        image=row[0] if len(row) > 0 else None,
                        source='fortlevsolar.app',
                        description=product_name,
                        sku=product_id,
                        power=self.extract_power(product_name)
                    )
                    products.append(product)
                    self.stats['fortlev_water_pumps'] += 1
            
            print(f"  ✅ Extracted {len(products)} water pumps from documentation CSV")
        except Exception as e:
            print(f"  ❌ Error loading pumps from CSV: {e}")
        
        return products
    
    def load_odex_products(self) -> List[Product]:
        """Load ODEX products including microinverters and trackers."""
        products = []
        odex_path = self.base_path / "odex"
        
        json_files = [
            ('odex-panels.json', 'panels'),
            ('odex-inverters.json', 'inverters'),
            ('odex-structures.json', 'structures'),
            ('odex-stringboxes.json', 'stringboxes')
        ]
        
        for json_file, default_category in json_files:
            file_path = odex_path / json_file
            if not file_path.exists():
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                if isinstance(data, list):
                    for item in data:
                        name = item.get('name', '')
                        category, sub_cat = self.categorize_product(name, item.get('description', ''))
                        
                        # Override if default category is more specific
                        if category == 'miscellaneous':
                            category = default_category
                        
                        product = Product(
                            id=item.get('id', ''),
                            name=name,
                            manufacturer=self.extract_manufacturer(name, category),
                            category=category,
                            sub_category=sub_cat,
                            price=item.get('price', 'N/A'),
                            distributor='ODEX',
                            availability=item.get('availability', 'Unknown'),
                            image=item.get('image'),
                            source='odexsolar.com.br',
                            description=item.get('description'),
                            sku=item.get('sku'),
                            power=self.extract_power(name)
                        )
                        products.append(product)
                        self.stats[f'odex_{category}'] += 1
                
                print(f"  ✅ Loaded {len(data)} products from ODEX {json_file}")
            except Exception as e:
                print(f"  ❌ Error loading {json_file}: {e}")
        
        return products
    
    def load_solfacil_products(self) -> List[Product]:
        """Load Solfacil products including microinverters and smart meters."""
        products = []
        solfacil_path = self.base_path / "solfacil"
        
        csv_files = list(solfacil_path.glob("*.csv"))
        
        for csv_file in csv_files:
            try:
                with open(csv_file, 'r', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    next(reader)  # Skip header
                    
                    for row in reader:
                        if len(row) < 5:
                            continue
                        
                        name = row[3] if len(row) > 3 else ''
                        if not name:
                            continue
                        
                        category, sub_cat = self.categorize_product(name, row[4] if len(row) > 4 else '')
                        
                        product = Product(
                            id=f"solfacil_{row[2]}_{row[1]}" if len(row) > 2 else '',
                            name=name,
                            manufacturer=self.extract_manufacturer(name, category),
                            category=category,
                            sub_category=sub_cat,
                            price=row[4] if len(row) > 4 else 'N/A',
                            distributor='Solfacil',
                            availability='Available',
                            image=row[0] if len(row) > 0 else None,
                            source='loja.solfacil.com.br',
                            description=name,
                            sku=row[2] if len(row) > 2 else None,
                            power=self.extract_power(name)
                        )
                        products.append(product)
                        self.stats[f'solfacil_{category}'] += 1
                
                print(f"  ✅ Loaded products from Solfacil {csv_file.name}")
            except Exception as e:
                print(f"  ❌ Error loading {csv_file.name}: {e}")
        
        return products
    
    def load_neosolar_products(self) -> List[Product]:
        """Load NeoSolar products from CSV files."""
        products = []
        neosolar_path = self.base_path / "neosolar"
        
        csv_files = list(neosolar_path.glob("*.csv"))
        
        for csv_file in csv_files:
            try:
                with open(csv_file, 'r', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    header = next(reader)  # Read header
                    
                    for row in reader:
                        if len(row) < 4:
                            continue
                        
                        # NeoSolar format: URL, ???, Title, Description, Full Description, Price, ???, Status
                        name = row[2] if len(row) > 2 else ''
                        description = row[3] if len(row) > 3 else ''
                        
                        if not name or 'teste' in name.lower():
                            continue
                        
                        category, sub_cat = self.categorize_product(name, description)
                        
                        product = Product(
                            id=f"neosolar_{hash(name) % 100000}",
                            name=name,
                            manufacturer=self.extract_manufacturer(name, category),
                            category=category,
                            sub_category=sub_cat,
                            price=row[5] if len(row) > 5 else 'N/A',
                            distributor='NeoSolar',
                            availability=row[7] if len(row) > 7 else 'Unknown',
                            image=row[0] if len(row) > 0 else None,
                            source='portalb2b.neosolar.com.br',
                            description=description,
                            power=self.extract_power(name)
                        )
                        products.append(product)
                        self.stats[f'neosolar_{category}'] += 1
                
                print(f"  ✅ Loaded products from NeoSolar {csv_file.name}")
            except Exception as e:
                print(f"  ❌ Error loading {csv_file.name}: {e}")
        
        return products
    
    def load_fotus_products(self) -> List[Product]:
        """Load FOTUS products from CSV files."""
        products = []
        fotus_path = self.base_path / "fotus"
        
        csv_files = list(fotus_path.glob("*.csv"))
        
        for csv_file in csv_files:
            try:
                with open(csv_file, 'r', encoding='utf-8') as f:
                    reader = csv.reader(f)
                    header = next(reader)
                    
                    for row in reader:
                        if len(row) < 3:
                            continue
                        
                        name = row[1] if len(row) > 1 else ''
                        if not name:
                            continue
                        
                        category, sub_cat = self.categorize_product(name)
                        
                        # FOTUS is mostly kits
                        if category == 'miscellaneous':
                            category = 'kits'
                        
                        product = Product(
                            id=f"fotus_{row[0]}_{hash(name) % 10000}" if len(row) > 0 else '',
                            name=name,
                            manufacturer=self.extract_manufacturer(name, category),
                            category=category,
                            sub_category=sub_cat,
                            price=row[2] if len(row) > 2 else 'N/A',
                            distributor='FOTUS',
                            availability='Available',
                            source='fotus.com.br',
                            description=name,
                            power=self.extract_power(name)
                        )
                        products.append(product)
                        self.stats[f'fotus_{category}'] += 1
                
                print(f"  ✅ Loaded products from FOTUS {csv_file.name}")
            except Exception as e:
                print(f"  ❌ Error loading {csv_file.name}: {e}")
        
        return products
    
    def extract_all(self) -> Dict:
        """Extract all products from all distributors with ALL categories."""
        print("\n" + "="*80)
        print("COMPLETE INVENTORY EXTRACTION - ALL PRODUCT CATEGORIES")
        print("="*80)
        
        # Extract from all distributors
        print("\n📦 FortLev Products:")
        self.products.extend(self.load_fortlev_json_files())
        self.products.extend(self.load_fortlev_csv_pumps())
        
        print("\n📦 ODEX Products:")
        self.products.extend(self.load_odex_products())
        
        print("\n📦 Solfacil Products:")
        self.products.extend(self.load_solfacil_products())
        
        print("\n📦 NeoSolar Products:")
        self.products.extend(self.load_neosolar_products())
        
        print("\n📦 FOTUS Products:")
        self.products.extend(self.load_fotus_products())
        
        # Collect manufacturers
        for product in self.products:
            if product.manufacturer != "Unknown":
                self.manufacturers.add(product.manufacturer)
        
        # Generate statistics
        category_stats = defaultdict(int)
        distributor_stats = defaultdict(int)
        
        for product in self.products:
            category_stats[product.category] += 1
            distributor_stats[product.distributor] += 1
        
        return {
            'total_products': len(self.products),
            'total_manufacturers': len(self.manufacturers),
            'total_categories': len(category_stats),
            'total_distributors': len(distributor_stats),
            'by_category': dict(category_stats),
            'by_distributor': dict(distributor_stats),
            'manufacturers': sorted(list(self.manufacturers))
        }
    
    def save_results(self, output_dir: str = "complete-inventory"):
        """Save extraction results."""
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        
        # Save complete product list
        all_products_file = output_path / f"complete_products_{timestamp}.json"
        with open(all_products_file, 'w', encoding='utf-8') as f:
            json.dump(
                [asdict(p) for p in self.products],
                f,
                ensure_ascii=False,
                indent=2
            )
        
        # Save by category
        category_products = defaultdict(list)
        for product in self.products:
            category_products[product.category].append(asdict(product))
        
        for category, products in category_products.items():
            category_file = output_path / f"complete_{category}_{timestamp}.json"
            with open(category_file, 'w', encoding='utf-8') as f:
                json.dump(products, f, ensure_ascii=False, indent=2)
        
        print(f"\n💾 Saved complete inventory to: {output_path}")
        print(f"   - Complete products: {all_products_file.name}")
        print(f"   - Category files: {len(category_products)} files")
        
        return str(output_path)

def main():
    """Main execution."""
    extractor = CompleteInventoryExtractor()
    
    # Extract all products
    stats = extractor.extract_all()
    
    # Print statistics
    print("\n" + "="*80)
    print("EXTRACTION COMPLETE - STATISTICS")
    print("="*80)
    print(f"\n📊 Total Products: {stats['total_products']:,}")
    print(f"🏭 Total Manufacturers: {stats['total_manufacturers']}")
    print(f"📁 Total Categories: {stats['total_categories']}")
    print(f"🏪 Total Distributors: {stats['total_distributors']}")
    
    print("\n📁 Products by Category:")
    for category, count in sorted(stats['by_category'].items(), key=lambda x: x[1], reverse=True):
        print(f"   {category:20s}: {count:6,} products")
    
    print("\n🏪 Products by Distributor:")
    for distributor, count in sorted(stats['by_distributor'].items(), key=lambda x: x[1], reverse=True):
        print(f"   {distributor:15s}: {count:6,} products")
    
    print("\n🏭 Top 20 Manufacturers:")
    manufacturer_counts = defaultdict(int)
    for product in extractor.products:
        manufacturer_counts[product.manufacturer] += 1
    
    for manufacturer, count in sorted(manufacturer_counts.items(), key=lambda x: x[1], reverse=True)[:20]:
        print(f"   {manufacturer:25s}: {count:5,} products")
    
    # Save results
    output_dir = extractor.save_results()
    
    # Generate summary report
    report_file = Path(output_dir) / "COMPLETE_EXTRACTION_REPORT.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write("# COMPLETE INVENTORY EXTRACTION REPORT\n\n")
        f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("## Overview\n\n")
        f.write(f"- **Total Products:** {stats['total_products']:,}\n")
        f.write(f"- **Manufacturers:** {stats['total_manufacturers']}\n")
        f.write(f"- **Categories:** {stats['total_categories']}\n")
        f.write(f"- **Distributors:** {stats['total_distributors']}\n\n")
        
        f.write("## Products by Category\n\n")
        f.write("| Category | Count | Percentage |\n")
        f.write("|----------|------:|-----------:|\n")
        total = stats['total_products']
        for category, count in sorted(stats['by_category'].items(), key=lambda x: x[1], reverse=True):
            pct = (count / total) * 100
            f.write(f"| {category} | {count:,} | {pct:.1f}% |\n")
        
        f.write("\n## Products by Distributor\n\n")
        f.write("| Distributor | Count | Percentage |\n")
        f.write("|-------------|------:|-----------:|\n")
        for distributor, count in sorted(stats['by_distributor'].items(), key=lambda x: x[1], reverse=True):
            pct = (count / total) * 100
            f.write(f"| {distributor} | {count:,} | {pct:.1f}% |\n")
        
        f.write("\n## All Manufacturers\n\n")
        for i, manufacturer in enumerate(sorted(stats['manufacturers']), 1):
            count = manufacturer_counts[manufacturer]
            f.write(f"{i}. **{manufacturer}** ({count:,} products)\n")
        
        f.write("\n## New Categories Added\n\n")
        new_categories = ['ev_chargers', 'water_pumps', 'microinverters', 'solar_trackers', 
                         'smart_meters', 'transformers', 'security']
        f.write("This extraction includes the following specialized categories:\n\n")
        for cat in new_categories:
            if cat in stats['by_category']:
                f.write(f"- **{cat}:** {stats['by_category'][cat]:,} products\n")
    
    print(f"\n📄 Report saved: {report_file}")
    print("\n✅ COMPLETE EXTRACTION FINISHED!")

if __name__ == "__main__":
    main()
