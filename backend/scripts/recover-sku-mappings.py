#!/usr/bin/env python3
"""
SKU Recovery Script
Recovers SKU mappings from distributor datasets to enable image synchronization
"""

import json
import csv
import re
from pathlib import Path
from collections import defaultdict

# Paths
DATA_DIR = Path(__file__).parent.parent / "data" / "catalog" / "data" / "catalog"
DISTRIBUTOR_DIR = DATA_DIR / "distributor_datasets"
UNIFIED_DIR = DATA_DIR.parent / "unified_schemas"
OUTPUT_FILE = DATA_DIR.parent / "SKU_MAPPING.json"

def extract_sku_from_image_path(image_path):
    """Extract SKU from image path"""
    if not image_path:
        return None
    
    # Pattern 1: /catalog/images/DISTRIBUTOR/123456.jpg
    match = re.search(r'/(\d+)\.(jpg|png|webp|jpeg)', image_path)
    if match:
        return match.group(1)
    
    # Pattern 2: distributor_category_123456.jpg
    match = re.search(r'_(\d+)\.(jpg|png|webp|jpeg)', image_path)
    if match:
        return match.group(1)
    
    return None

def extract_sku_from_url(url):
    """Extract SKU from URL"""
    if not url:
        return None
    
    # NeoSolar: /produto/12345
    match = re.search(r'/produto/(\d+)', url)
    if match:
        return match.group(1)
    
    return None

def process_odex_files():
    """Process ODEX JSON files"""
    mappings = {}
    stats = defaultdict(int)
    
    odex_files = [
        'odex-inverters.json',
        'odex-panels.json', 
        'odex-stringboxes.json',
        'odex-structures.json'
    ]
    
    for filename in odex_files:
        filepath = DISTRIBUTOR_DIR / 'odex' / filename
        if not filepath.exists():
            continue
            
        print(f"📄 Processing {filename}...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        for product in products:
            product_id = product.get('id')
            image = product.get('image', '')
            
            if not product_id:
                continue
            
            # Extract SKU from image path
            sku = extract_sku_from_image_path(image)
            
            if sku:
                mappings[product_id] = {
                    'sku': sku,
                    'distributor': 'ODEX',
                    'image': image,
                    'source_file': filename
                }
                stats['odex'] += 1
                stats['total'] += 1
    
    return mappings, stats

def process_neosolar_csv():
    """Process NeoSolar CSV file"""
    mappings = {}
    stats = defaultdict(int)
    
    csv_file = DISTRIBUTOR_DIR / 'neosolar' / 'neosolar_catalog.csv'
    
    if not csv_file.exists():
        print(f"⚠️  NeoSolar CSV not found: {csv_file}")
        return mappings, stats
    
    print(f"📄 Processing neosolar_catalog.csv...")
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        
        for row in reader:
            if len(row) < 2:
                continue
            
            url = row[0]  # Column 0: URL with SKU
            image_url = row[-1] if len(row) > 1 else ''  # Last column: image
            
            # Extract SKU from URL
            sku = extract_sku_from_url(url)
            
            if sku:
                # Generate product ID in consolidated format
                product_id = f"neosolar_inverters_{sku}"
                
                mappings[product_id] = {
                    'sku': sku,
                    'distributor': 'NEOSOLAR',
                    'image_url': image_url,
                    'source_url': url,
                    'source_file': 'neosolar_catalog.csv'
                }
                stats['neosolar'] += 1
                stats['total'] += 1
    
    return mappings, stats

def process_solfacil_files():
    """Process Solfácil JSON files"""
    mappings = {}
    stats = defaultdict(int)
    
    solfacil_files = [
        'solfacil-inverters.json',
        'solfacil-batteries.json',
        'solfacil-cables.json',
        'solfacil-accessories.json',
        'solfacil-structures.json',
        'solfacil-panels.json'
    ]
    
    for filename in solfacil_files:
        filepath = DISTRIBUTOR_DIR / 'solfacil' / filename
        if not filepath.exists():
            continue
            
        print(f"📄 Processing {filename}...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        for product in products:
            product_id = product.get('id')
            image = product.get('image', '')
            
            if not product_id:
                continue
            
            # Extract SKU from image path
            sku = extract_sku_from_image_path(image)
            
            if sku:
                mappings[product_id] = {
                    'sku': sku,
                    'distributor': 'SOLFACIL',
                    'image': image,
                    'source_file': filename
                }
                stats['solfacil'] += 1
                stats['total'] += 1
    
    return mappings, stats

def process_fotus_files():
    """Process FOTUS JSON files"""
    mappings = {}
    stats = defaultdict(int)
    
    fotus_files = [
        'fotus-kits.json',
        'fotus-kits-hibridos.json'
    ]
    
    for filename in fotus_files:
        filepath = DISTRIBUTOR_DIR / 'fotus' / filename
        if not filepath.exists():
            continue
            
        print(f"📄 Processing {filename}...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        for product in products:
            product_id = product.get('id')
            image = product.get('image', '')
            
            if not product_id:
                continue
            
            # Extract SKU from image path
            sku = extract_sku_from_image_path(image)
            
            if sku:
                mappings[product_id] = {
                    'sku': sku,
                    'distributor': 'FOTUS',
                    'image': image,
                    'source_file': filename
                }
                stats['fotus'] += 1
                stats['total'] += 1
    
    return mappings, stats

def process_root_files():
    """Process root inverters.json and kits.json files"""
    mappings = {}
    stats = defaultdict(int)
    
    root_files = [
        'inverters.json',
        'kits.json',
        'panels.json'
    ]
    
    for filename in root_files:
        filepath = DATA_DIR / filename
        if not filepath.exists():
            continue
            
        print(f"� Processing {filename}...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        for product in products:
            product_id = product.get('id')
            image = product.get('image', '')
            
            if not product_id:
                continue
            
            # Extract SKU from multiple sources
            sku = None
            
            # Try image path first
            if image:
                sku = extract_sku_from_image_path(image)
            
            # Try extracting from ID
            if not sku and product_id:
                parts = product_id.split('_')
                last_part = parts[-1]
                if re.match(r'^\d+$', last_part):
                    sku = last_part
            
            if sku:
                mappings[product_id] = {
                    'sku': sku,
                    'distributor': 'ROOT',
                    'image': image,
                    'source_file': filename
                }
                stats['root'] += 1
                stats['total'] += 1
    
    return mappings, stats


def main():
    print("�🚀 Starting SKU Recovery Process...\n")
    
    all_mappings = {}
    all_stats = defaultdict(int)
    
    # Process each distributor
    print("📦 Processing ODEX files...")
    odex_mappings, odex_stats = process_odex_files()
    all_mappings.update(odex_mappings)
    for k, v in odex_stats.items():
        all_stats[k] += v
    print(f"   ✅ Found {odex_stats.get('odex', 0)} SKUs\n")
    
    print("📦 Processing NeoSolar CSV...")
    neosolar_mappings, neosolar_stats = process_neosolar_csv()
    all_mappings.update(neosolar_mappings)
    for k, v in neosolar_stats.items():
        all_stats[k] += v
    print(f"   ✅ Found {neosolar_stats.get('neosolar', 0)} SKUs\n")
    
    print("📦 Processing Solfácil files...")
    solfacil_mappings, solfacil_stats = process_solfacil_files()
    all_mappings.update(solfacil_mappings)
    for k, v in solfacil_stats.items():
        all_stats[k] += v
    print(f"   ✅ Found {solfacil_stats.get('solfacil', 0)} SKUs\n")
    
    print("📦 Processing FOTUS files...")
    fotus_mappings, fotus_stats = process_fotus_files()
    all_mappings.update(fotus_mappings)
    for k, v in fotus_stats.items():
        all_stats[k] += v
    print(f"   ✅ Found {fotus_stats.get('fotus', 0)} SKUs\n")
    
    print("📦 Processing root catalog files...")
    root_mappings, root_stats = process_root_files()
    all_mappings.update(root_mappings)
    for k, v in root_stats.items():
        all_stats[k] += v
    print(f"   ✅ Found {root_stats.get('root', 0)} SKUs\n")
    
    # Save mappings
    output_data = {
        'version': '1.0',
        'generated_at': '2025-10-12T20:30:00.000Z',
        'total_mappings': len(all_mappings),
        'stats': dict(all_stats),
        'mappings': all_mappings
    }
    
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"✅ SKU mapping saved to: {OUTPUT_FILE}")
    print(f"\n📊 Summary:")
    print(f"   - Total mappings: {len(all_mappings)}")
    print(f"   - ODEX: {all_stats.get('odex', 0)}")
    print(f"   - NeoSolar: {all_stats.get('neosolar', 0)}")
    print(f"   - Solfácil: {all_stats.get('solfacil', 0)}")
    print(f"   - FOTUS: {all_stats.get('fotus', 0)}")
    print(f"   - Root files: {all_stats.get('root', 0)}")
    print(f"\n🎯 SKU mapping updated with {len(all_mappings)} total mappings!")

if __name__ == '__main__':
    main()
