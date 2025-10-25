"""
SKU Synchronization Gap Analysis

This script analyzes why we have 1,251 mappings but only 6.3% coverage.
It compares:
1. What SKUs we have mapped
2. What products exist in unified schemas
3. What's missing from the matching process
"""

import json
from pathlib import Path
from collections import defaultdict

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
UNIFIED_DIR = PROJECT_ROOT / 'src' / 'data' / 'catalog' / 'unified_schemas'
SKU_MAPPING_PATH = PROJECT_ROOT / 'data' / 'catalog' / 'data' / 'SKU_MAPPING.json'
IMAGE_MAP_PATH = PROJECT_ROOT / 'static' / 'images-catálogo_distribuidores' / 'IMAGE_MAP.json'

def main():
    print("🔍 SKU Synchronization Gap Analysis\n")
    print("=" * 80)
    
    # Load SKU mapping
    with open(SKU_MAPPING_PATH, 'r', encoding='utf-8') as f:
        sku_data = json.load(f)
    
    mappings = sku_data.get('mappings', {})
    print(f"\n📦 SKU Mapping:")
    print(f"   - Total entries: {len(mappings)}")
    print(f"   - With SKU field: {len([m for m in mappings.values() if 'sku' in m])}")
    print(f"   - With product_number field: {len([m for m in mappings.values() if 'product_number' in m])}")
    
    # Load IMAGE_MAP
    with open(IMAGE_MAP_PATH, 'r', encoding='utf-8') as f:
        image_map = json.load(f)
    
    image_skus = set(image_map.get('mappings', {}).keys())
    print(f"\n📸 IMAGE_MAP:")
    print(f"   - Total SKUs: {len(image_skus)}")
    
    # Analyze unified schemas
    print(f"\n📊 Unified Schemas Analysis:")
    
    total_products = 0
    products_by_category = {}
    products_with_sku_in_mapping = 0
    products_with_images = 0
    sample_missing = []
    
    for schema_file in sorted(UNIFIED_DIR.glob('*_unified.json')):
        category = schema_file.stem.replace('_unified', '')
        
        with open(schema_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        total_products += len(products)
        products_by_category[category] = len(products)
        
        # Check how many can be matched
        matched = 0
        with_images = 0
        
        for product in products[:5]:  # Sample first 5
            product_id = product.get('id')
            image = product.get('image') or product.get('image_url', '')
            
            if image and image != '/images/placeholder-inverter.jpg':
                with_images += 1
            
            # Check if product ID is in mapping
            if product_id in mappings:
                matched += 1
            else:
                # Sample missing products
                if len(sample_missing) < 20:
                    sample_missing.append({
                        'id': product_id,
                        'name': product.get('name', '')[:60],
                        'image': image[:80] if image else 'NO IMAGE',
                        'category': category
                    })
        
        if matched > 0:
            products_with_sku_in_mapping += matched
        if with_images > 0:
            products_with_images += with_images
        
        print(f"   - {category:20s}: {len(products):4d} products")
    
    print(f"\n📈 Coverage Analysis:")
    print(f"   - Total products in unified schemas: {total_products}")
    print(f"   - Products in SKU mapping: {len([k for k in mappings.keys() if k in [p.get('id') for schema in UNIFIED_DIR.glob('*_unified.json') for p in json.load(open(schema))] ])}")
    
    print(f"\n🔍 Sample Missing Products (first 20):")
    for item in sample_missing:
        print(f"\n   ID: {item['id']}")
        print(f"   Name: {item['name']}")
        print(f"   Image: {item['image']}")
        print(f"   Category: {item['category']}")
    
    print(f"\n💡 Gap Analysis:")
    print(f"   - We have {len(mappings)} mapping entries")
    print(f"   - But unified products use different IDs")
    print(f"   - The mapping needs to match product IDs exactly")
    print(f"   - IMAGE_MAP has {len(image_skus)} SKUs but products may not have SKUs in their IDs")
    
    print(f"\n🎯 Solution: Need to match IMAGE_MAP SKUs to product metadata/source files")

if __name__ == '__main__':
    main()
