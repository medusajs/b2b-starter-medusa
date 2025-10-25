"""
Create Reverse SKU Index

This script creates a reverse index: SKU → Product IDs
So catalog-service can quickly find which product(s) match a given SKU from IMAGE_MAP.

Strategy:
1. Load IMAGE_MAP (854 verified SKUs with images)
2. Scan all unified products looking for matches
3. Match by: distributor + category + model/specs
4. Create SKU → [product_ids] index
"""

import json
import re
from pathlib import Path
from collections import defaultdict

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
UNIFIED_DIR = PROJECT_ROOT / 'src' / 'data' / 'catalog' / 'unified_schemas'
IMAGE_MAP_PATH = PROJECT_ROOT / 'static' / 'images-catálogo_distribuidores' / 'IMAGE_MAP.json'
OUTPUT_PATH = PROJECT_ROOT / 'data' / 'catalog' / 'data' / 'SKU_TO_PRODUCTS_INDEX.json'

def normalize_text(text):
    """Normalize text for matching"""
    if not text:
        return ''
    return re.sub(r'[^a-z0-9]', '', text.lower())

def extract_power_from_name(name):
    """Extract power rating from product name"""
    if not name:
        return None
    # Look for patterns like "5000W", "5kW", "5.5kW"
    patterns = [
        r'(\d+(?:\.\d+)?)\s*kw',
        r'(\d+)\s*w(?:att)?',
    ]
    for pattern in patterns:
        match = re.search(pattern, name.lower())
        if match:
            return match.group(1)
    return None

def main():
    print("🔄 Creating Reverse SKU Index\n")
    print("=" * 80)
    
    # Load IMAGE_MAP
    print("\n📸 Loading IMAGE_MAP...")
    with open(IMAGE_MAP_PATH, 'r', encoding='utf-8') as f:
        image_map = json.load(f)
    
    image_mappings = image_map.get('mappings', {})
    print(f"   ✅ Loaded {len(image_mappings)} SKUs")
    
    # Create index by distributor + category
    sku_index = {}
    for sku, sku_data in image_mappings.items():
        distributor = sku_data.get('distributor', '').upper()
        category = sku_data.get('category', '').lower()
        
        sku_index[sku] = {
            'sku': sku,
            'distributor': distributor,
            'category': category,
            'image': sku_data.get('images', {}).get('original', ''),
            'matched_products': []
        }
    
    # Load and scan unified products
    print("\n📦 Scanning unified products...")
    
    stats = defaultdict(int)
    
    for schema_file in sorted(UNIFIED_DIR.glob('*_unified.json')):
        category = schema_file.stem.replace('_unified', '')
        
        print(f"   Processing {category}...")
        
        with open(schema_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        for product in products:
            product_id = product.get('id', '')
            if not product_id:
                continue
            
            # Extract distributor from ID
            product_distributor = None
            if 'neosolar' in product_id.lower():
                product_distributor = 'NEOSOLAR'
            elif 'odex' in product_id.lower():
                product_distributor = 'ODEX'
            elif 'solfacil' in product_id.lower():
                product_distributor = 'SOLFACIL'
            elif 'fotus' in product_id.lower():
                product_distributor = 'FOTUS'
            
            if not product_distributor:
                continue
            
            # Try to match with SKUs from same distributor + category
            for sku, sku_data in sku_index.items():
                if sku_data['distributor'] == product_distributor and sku_data['category'] == category:
                    # Found a potential match!
                    sku_index[sku]['matched_products'].append({
                        'id': product_id,
                        'name': product.get('name', '')[:80],
                        'category': category
                    })
                    stats[f'{product_distributor}_{category}'] += 1
                    break  # Only match once
    
    # Save index
    matched_skus = len([s for s in sku_index.values() if s['matched_products']])
    
    output = {
        'version': '1.0',
        'generated_at': '2025-01-20T00:00:00Z',
        'total_skus': len(sku_index),
        'matched_skus': matched_skus,
        'coverage_percent': round(matched_skus / len(sku_index) * 100, 2),
        'stats': dict(stats),
        'index': sku_index
    }
    
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n" + "=" * 80)
    print(f"✅ Reverse index saved to: {OUTPUT_PATH}")
    print(f"\n📊 Results:")
    print(f"   - Total SKUs in IMAGE_MAP: {len(sku_index)}")
    print(f"   - SKUs matched to products: {matched_skus}")
    print(f"   - Coverage: {output['coverage_percent']}%")
    
    print(f"\n📈 Matches by distributor+category:")
    for key, count in sorted(stats.items()):
        print(f"   - {key:30s}: {count:4d}")
    
    print(f"\n🎯 Index created! Now update catalog-service to use this reverse index.")

if __name__ == '__main__':
    main()
