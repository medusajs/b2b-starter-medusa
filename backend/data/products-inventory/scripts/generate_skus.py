"""
SKU Generator for YSH B2B Solar Products
Generates unique, semantic SKUs for all products
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional
from collections import defaultdict


class SKUGenerator:
    """Generate consistent SKUs for solar products"""
    
    DISTRIBUTOR_CODES = {
        'fortlev': 'FLV',
        'neosolar': 'NEO',
        'fotus': 'FTS'
    }
    
    CATEGORY_CODES = {
        'kit': 'KIT',
        'panel': 'PANEL',
        'inverter': 'INV',
        'battery': 'BAT',
        'structure': 'STRUCT',
        'charger': 'CHARGE'
    }
    
    BRAND_ABBREVIATIONS = {
        'longi': 'LONGI',
        'byd': 'BYD',
        'canadian solar': 'CANADIAN',
        'canadian': 'CANADIAN',
        'trina': 'TRINA',
        'jinko': 'JINKO',
        'hoymiles': 'HOYMILES',
        'growatt': 'GROWATT',
        'deye': 'DEYE',
        'apsystems': 'APS',
        'enphase': 'ENPHASE',
        'fronius': 'FRONIUS',
        'sma': 'SMA',
        'huawei': 'HUAWEI',
        'sungrow': 'SUNGROW',
        'risen': 'RISEN',
        'ja solar': 'JASOLAR',
        'dah solar': 'DAH',
        'dah': 'DAH'
    }
    
    def __init__(self):
        self.sku_counters = defaultdict(int)
        self.existing_skus = set()
    
    def clean_brand_name(self, brand: str) -> str:
        """Clean and abbreviate brand name"""
        brand_lower = brand.lower().strip()
        
        for full_name, abbrev in self.BRAND_ABBREVIATIONS.items():
            if full_name in brand_lower:
                return abbrev
        
        # Fallback: use first 3-6 letters
        clean = re.sub(r'[^a-zA-Z]', '', brand)
        return clean[:6].upper() if clean else 'GENERIC'
    
    def generate_kit_sku(
        self,
        distributor: str,
        power_kwp: float,
        brand: str,
        kit_id: Optional[str] = None
    ) -> str:
        """Generate SKU for solar kit"""
        
        dist_code = self.DISTRIBUTOR_CODES.get(distributor.lower(), 'UNK')
        category = 'KIT'
        
        # Format power with KWP suffix, remove decimal point
        power_str = f"{power_kwp:.2f}KWP".replace('.', '')
        
        brand_code = self.clean_brand_name(brand)
        
        # Base SKU without sequence
        base_sku = f"{dist_code}-{category}-{power_str}-{brand_code}"
        
        # Generate unique sequence
        self.sku_counters[base_sku] += 1
        sequence = str(self.sku_counters[base_sku]).zfill(3)
        
        sku = f"{base_sku}-{sequence}"
        
        # Ensure uniqueness
        while sku in self.existing_skus:
            self.sku_counters[base_sku] += 1
            sequence = str(self.sku_counters[base_sku]).zfill(3)
            sku = f"{base_sku}-{sequence}"
        
        self.existing_skus.add(sku)
        return sku
    
    def generate_component_sku(
        self,
        distributor: str,
        category: str,
        power: float,
        unit: str,
        brand: str,
        model: Optional[str] = None
    ) -> str:
        """Generate SKU for component (panel, inverter, etc)"""
        
        dist_code = self.DISTRIBUTOR_CODES.get(distributor.lower(), 'UNK')
        cat_code = self.CATEGORY_CODES.get(category.lower(), 'COMP')
        
        # Power with unit
        if unit.lower() in ['w', 'watt']:
            power_str = f"{int(power)}W"
        elif unit.lower() in ['kw', 'kwp']:
            power_str = f"{power:.1f}KW".replace('.', '')
        else:
            power_str = f"{int(power)}{unit.upper()}"
        
        brand_code = self.clean_brand_name(brand)
        
        # Include model if available
        model_code = ""
        if model:
            model_clean = re.sub(r'[^a-zA-Z0-9]', '', model)[:4].upper()
            model_code = f"-{model_clean}"
        
        base_sku = f"{dist_code}-{cat_code}-{power_str}-{brand_code}{model_code}"
        
        # Generate sequence
        self.sku_counters[base_sku] += 1
        sequence = str(self.sku_counters[base_sku]).zfill(3)
        
        sku = f"{base_sku}-{sequence}"
        
        while sku in self.existing_skus:
            self.sku_counters[base_sku] += 1
            sequence = str(self.sku_counters[base_sku]).zfill(3)
            sku = f"{base_sku}-{sequence}"
        
        self.existing_skus.add(sku)
        return sku
    
    def process_normalized_kits(
        self,
        input_file: Path,
        output_file: Path,
        distributor: str
    ):
        """Process normalized kits and add SKUs"""
        
        with open(input_file, 'r', encoding='utf-8') as f:
            kits = json.load(f)
        
        print(f"\n[SKU Generator] Processing {len(kits)} kits from {distributor}")
        
        for kit in kits:
            # Generate kit SKU
            power = kit.get('power_kwp', 0)
            
            # Get primary brand from panels or inverter
            brand = "GENERIC"
            if 'components' in kit:
                if 'panels' in kit['components'] and kit['components']['panels']:
                    brand = kit['components']['panels'][0].get('brand', 'GENERIC')
                elif 'inverter' in kit['components']:
                    brand = kit['components']['inverter'].get('brand', 'GENERIC')
            
            sku = self.generate_kit_sku(
                distributor=distributor,
                power_kwp=power,
                brand=brand,
                kit_id=kit.get('kit_id')
            )
            
            kit['sku'] = sku
            kit['sku_generated'] = True
            
            # Generate component SKUs
            if 'components' in kit:
                # Panels
                if 'panels' in kit['components']:
                    for panel in kit['components']['panels']:
                        if 'sku' not in panel:
                            panel['sku'] = self.generate_component_sku(
                                distributor=distributor,
                                category='panel',
                                power=panel.get('power_w', 0),
                                unit='W',
                                brand=panel.get('brand', 'GENERIC'),
                                model=panel.get('model')
                            )
                
                # Inverter
                if 'inverter' in kit['components']:
                    inv = kit['components']['inverter']
                    if 'sku' not in inv:
                        inv['sku'] = self.generate_component_sku(
                            distributor=distributor,
                            category='inverter',
                            power=inv.get('power_kw', 0),
                            unit='KW',
                            brand=inv.get('brand', 'GENERIC'),
                            model=inv.get('model')
                        )
                
                # Batteries
                if 'batteries' in kit['components']:
                    for battery in kit['components']['batteries']:
                        if 'sku' not in battery:
                            battery['sku'] = self.generate_component_sku(
                                distributor=distributor,
                                category='battery',
                                power=battery.get('capacity_kwh', 0),
                                unit='KWH',
                                brand=battery.get('brand', 'GENERIC'),
                                model=battery.get('model')
                            )
        
        # Save with SKUs
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(kits, f, ensure_ascii=False, indent=2)
        
        print(f"[SKU Generator] ✅ Saved {len(kits)} kits with SKUs to {output_file.name}")
        print(f"[SKU Generator] 📊 Total unique SKUs generated: {len(self.existing_skus)}")


def main():
    """Generate SKUs for all distributors"""
    
    base_path = Path(__file__).parent.parent
    
    generator = SKUGenerator()
    
    # Process each distributor
    distributors = [
        ('fortlev', 'fortlev/fortlev-kits-normalized.json', 'fortlev/fortlev-kits-with-skus.json'),
        ('neosolar', 'neosolar/neosolar-kits-normalized.json', 'neosolar/neosolar-kits-with-skus.json'),
        ('fotus', 'fotus/fotus-kits-normalized.json', 'fotus/fotus-kits-with-skus.json'),
        ('fotus', 'fotus/fotus-kits-hibridos-normalized.json', 'fotus/fotus-kits-hibridos-with-skus.json'),
    ]
    
    for dist_name, input_rel, output_rel in distributors:
        input_path = base_path / input_rel
        output_path = base_path / output_rel
        
        if input_path.exists():
            generator.process_normalized_kits(input_path, output_path, dist_name)
        else:
            print(f"[SKU Generator] ⚠️  File not found: {input_path}")
    
    print(f"\n[SKU Generator] 🎉 SKU generation complete!")
    print(f"[SKU Generator] 📊 Total SKUs: {len(generator.existing_skus)}")


if __name__ == "__main__":
    main()
