"""
Hybrid SKU Mapping Builder

This script creates a comprehensive SKU mapping that includes:
1. Original product IDs from distributor datasets
2. Consolidated product IDs from unified schemas
3. Direct SKU-to-image mappings from IMAGE_MAP.json

This ensures maximum coverage by mapping ALL possible product identifiers.
"""

import json
import re
from pathlib import Path
from collections import defaultdict

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / 'data' / 'catalog' / 'data'
UNIFIED_SCHEMAS_DIR = PROJECT_ROOT / 'src' / 'data' / 'catalog' / 'unified_schemas'
IMAGE_MAP_PATH = PROJECT_ROOT / 'static' / 'images-catálogo_distribuidores' / 'IMAGE_MAP.json'
OUTPUT_FILE = DATA_DIR / 'SKU_MAPPING.json'

def extract_sku_from_text(text):
    """Extract numeric SKU from text"""
    if not text:
        return None
    
    patterns = [
        r'/(\d{6,})\.(?:jpg|png|webp)',
        r'[-_](\d{6,})(?:[-_.]|$)',
        r'^(\d{6,})$',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, str(text))
        if match:
            return match.group(1)
    
    return None

def load_image_map():
    """Load IMAGE_MAP.json and create SKU-to-image mappings"""
    print("📸 Loading IMAGE_MAP.json...")
    
    with open(IMAGE_MAP_PATH, 'r', encoding='utf-8') as f:
        image_map = json.load(f)
    
    # Create direct SKU mappings from IMAGE_MAP
    sku_to_image = {}
    for sku, data in image_map.get('mappings', {}).items():
        images = data.get('images', {})
        if isinstance(images, dict):
            # Get original image path
            image_path = images.get('original', '')
            if image_path:
                sku_to_image[sku] = {
                    'image': image_path,
                    'distributor': data.get('distributor', 'UNKNOWN'),
                    'category': data.get('category', '')
                }
    
    print(f"   ✅ Found {len(sku_to_image)} SKU→image mappings")
    return sku_to_image

def process_distributor_datasets():
    """Process original distributor datasets to get original IDs"""
    print("\n📦 Processing distributor datasets...")
    
    mappings = {}
    dataset_dirs = [
        ('ODEX', DATA_DIR / 'distributor_datasets' / 'ODEX'),
        ('NeoSolar', DATA_DIR / 'distributor_datasets' / 'neosolar'),
        ('Solfácil', DATA_DIR / 'distributor_datasets' / 'solfacil'),
        ('FOTUS', DATA_DIR / 'distributor_datasets' / 'FOTUS'),
    ]
    
    for distributor, dir_path in dataset_dirs:
        if not dir_path.exists():
            continue
        
        for file_path in dir_path.glob('*.json'):
            with open(file_path, 'r', encoding='utf-8') as f:
                try:
                    products = json.load(f)
                    if not isinstance(products, list):
                        continue
                    
                    for product in products:
                        product_id = product.get('id')
                        if not product_id:
                            continue
                        
                        # Extract SKU
                        sku = None
                        image = product.get('image') or product.get('image_url', '')
                        
                        if image:
                            sku = extract_sku_from_text(image)
                        
                        if not sku:
                            sku = extract_sku_from_text(product_id)
                        
                        if not sku and 'sku' in product:
                            sku = str(product['sku'])
                        
                        if sku:
                            mappings[product_id] = {
                                'sku': sku,
                                'distributor': distributor,
                                'image': image,
                                'source': 'original'
                            }
                
                except Exception as e:
                    print(f"   ⚠️  Error processing {file_path.name}: {e}")
    
    print(f"   ✅ Found {len(mappings)} original product IDs")
    return mappings

def process_unified_schemas():
    """Process unified schemas to get consolidated IDs"""
    print("\n📦 Processing unified schemas...")
    
    mappings = {}
    
    for file_path in UNIFIED_SCHEMAS_DIR.glob('*_unified.json'):
        with open(file_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        for product in products:
            product_id = product.get('id')
            if not product_id:
                continue
            
            # Extract SKU from image or ID
            sku = None
            image = product.get('image') or product.get('image_url', '')
            
            if image:
                sku = extract_sku_from_text(image)
            
            if not sku:
                sku = extract_sku_from_text(product_id)
            
            if not sku and 'sku' in product:
                sku = str(product['sku'])
            
            # Determine distributor
            distributor = 'UNKNOWN'
            if 'neosolar' in product_id.lower():
                distributor = 'NeoSolar'
            elif 'odex' in product_id.lower():
                distributor = 'ODEX'
            elif 'solfacil' in product_id.lower():
                distributor = 'Solfácil'
            elif 'fotus' in product_id.lower():
                distributor = 'FOTUS'
            
            if sku:
                mappings[product_id] = {
                    'sku': sku,
                    'distributor': distributor,
                    'image': image,
                    'source': 'unified'
                }
    
    print(f"   ✅ Found {len(mappings)} consolidated product IDs")
    return mappings

def main():
    print("🚀 Building Hybrid SKU Mapping...\n")
    
    # Load all data sources
    sku_to_image = load_image_map()
    original_mappings = process_distributor_datasets()
    unified_mappings = process_unified_schemas()
    
    # Merge all mappings (unified takes precedence over original)
    all_mappings = {}
    all_mappings.update(original_mappings)
    all_mappings.update(unified_mappings)
    
    # Enhance with IMAGE_MAP data
    enhanced = 0
    for product_id, mapping in all_mappings.items():
        sku = mapping['sku']
        if sku in sku_to_image:
            img_data = sku_to_image[sku]
            if not mapping.get('image') or mapping['image'] == '':
                mapping['image'] = img_data['image']
                enhanced += 1
            # Always update distributor if missing
            if mapping.get('distributor') == 'UNKNOWN' and img_data.get('distributor'):
                mapping['distributor'] = img_data['distributor']
    
    print(f"\n✨ Enhanced {enhanced} mappings with IMAGE_MAP data")
    
    # Create output
    output = {
        'version': '3.0-hybrid',
        'generated_at': '2025-01-20T00:00:00Z',
        'total_mappings': len(all_mappings),
        'sources': {
            'original_datasets': len(original_mappings),
            'unified_schemas': len(unified_mappings),
            'image_map': len(sku_to_image)
        },
        'stats': {
            'enhanced_with_images': enhanced,
            'unique_skus': len(set(m['sku'] for m in all_mappings.values()))
        },
        'mappings': all_mappings
    }
    
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Hybrid mapping saved to: {OUTPUT_FILE}")
    print(f"\n📊 Summary:")
    print(f"   - Total mappings: {len(all_mappings)}")
    print(f"   - From original datasets: {len(original_mappings)}")
    print(f"   - From unified schemas: {len(unified_mappings)}")
    print(f"   - From IMAGE_MAP: {len(sku_to_image)}")
    print(f"   - Enhanced with images: {enhanced}")
    print(f"   - Unique SKUs: {output['stats']['unique_skus']}")
    
    print(f"\n🎯 Hybrid SKU mapping complete!")

if __name__ == '__main__':
    main()
