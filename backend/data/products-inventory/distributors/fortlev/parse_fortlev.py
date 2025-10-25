#!/usr/bin/env python3
"""Parse FortLev CSV files and generate structured JSON products."""

import csv
import json
import re
from pathlib import Path
from typing import Dict, List, Any

def clean_price(price_str: str) -> float:
    """Convert Brazilian price format to float."""
    if not price_str or price_str == "De:":
        return 0.0
    
    # Remove R$ and spaces
    cleaned = price_str.replace("R$", "").replace(" ", "").strip()
    # Replace dot (thousands) and comma (decimal)
    cleaned = cleaned.replace(".", "").replace(",", ".")
    
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def extract_manufacturer(name: str) -> str:
    """Extract manufacturer from product name."""
    manufacturers = [
        "HUAWEI", "GROWATT", "SOLIS", "FOXESS", "SUNGROW", "FRONIUS",
        "ENPHASE", "DEYE", "SAJ", "GOODWE", "LONGI", "BYD", "DMEGC",
        "RISEN", "CANADIAN", "JA SOLAR", "JINKO", "EBARA", "NEP",
        "CLAMPER", "FLS"
    ]
    
    name_upper = name.upper()
    for mfg in manufacturers:
        if mfg in name_upper:
            return mfg.title()
    
    return "Unknown"

def categorize_product(code: str, name: str) -> str:
    """Determine product category from code and name."""
    code = code.upper()
    name_upper = name.upper()
    
    # Category mappings by prefix
    if code.startswith("IIN"):
        if any(x in name_upper for x in ["MICRO", "MICROINVERSOR"]):
            return "microinverters"
        elif any(x in name_upper for x in ["HIBRIDO", "HYBRID"]):
            return "hybrid_inverters"
        return "inverters"
    elif code.startswith("IMO"):
        return "panels"
    elif code.startswith("IEF") or code.startswith("ILS"):
        return "structures"
    elif code.startswith("ITR"):
        return "accessories"
    elif code.startswith("IBS"):
        return "pumps"
    elif code.startswith("IBT"):
        return "batteries"
    elif code.startswith("ISB"):
        return "stringboxes"
    elif code.startswith("ICV"):
        return "ev_chargers"
    elif code.startswith("IDT"):
        return "conduits"
    elif code.startswith("ICP"):
        return "boxes"
    elif code.startswith("ITF"):
        return "transformers"
    elif code.startswith("IMS"):
        return "security"
    
    # Fallback to name-based detection
    if any(x in name_upper for x in ["INVERSOR", "INVERTER"]):
        return "inverters"
    elif any(x in name_upper for x in ["PAINEL", "PANEL", "MODULO"]):
        return "panels"
    elif any(x in name_upper for x in ["ESTRUTURA", "PERFIL", "GANCHO"]):
        return "structures"
    elif any(x in name_upper for x in ["BATERIA", "BATTERY"]):
        return "batteries"
    elif any(x in name_upper for x in ["BOMBA", "PUMP"]):
        return "pumps"
    
    return "miscellaneous"

def parse_csv_file(csv_path: Path) -> List[Dict[str, Any]]:
    """Parse a single CSV file and extract products."""
    products = []
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                # Get product code - try different column names
                code = row.get('card-title', '') or row.get('" src"', '') or row.get('2', '')
                if not code or code.strip() == '':
                    continue
                
                # Skip header-like rows
                if 'card-title' in code or 'img-content' in code:
                    continue
                
                # Get product name
                name = row.get('fw-semibold', '') or row.get('card-content', '')
                if not name or name.strip() == '':
                    continue
                
                # Get price
                price_str = row.get('text-orders-price', '') or row.get('details-card', '')
                price_float = clean_price(price_str)
                
                # Get image
                image = row.get('img-content-orders src', '') or row.get('img-content-orders src 2', '')
                
                # Categorize
                category = categorize_product(code, name)
                manufacturer = extract_manufacturer(name)
                
                product = {
                    "id": f"fortlev_{category}_{code}",
                    "name": name.strip(),
                    "manufacturer": manufacturer,
                    "category": category,
                    "price": price_str.strip() if price_str else "",
                    "image": image.strip() if image else "",
                    "source": "fortlevsolar.app",
                    "availability": "Disponível",
                    "description": name.strip(),
                    "pricing": {
                        "price": price_float,
                        "currency": "BRL"
                    }
                }
                
                products.append(product)
    
    except Exception as e:
        print(f"Error parsing {csv_path}: {e}")
    
    return products

def main():
    """Main function to process all FortLev CSV files."""
    base_dir = Path(__file__).parent
    
    # Find all CSV files
    csv_files = list(base_dir.glob("*.csv"))
    print(f"Found {len(csv_files)} CSV files")
    
    # Parse all products
    all_products = []
    for csv_file in csv_files:
        print(f"Parsing {csv_file.name}...")
        products = parse_csv_file(csv_file)
        all_products.extend(products)
        print(f"  Extracted {len(products)} products")
    
    print(f"\nTotal products extracted: {len(all_products)}")
    
    # Group by category
    by_category = {}
    for product in all_products:
        category = product['category']
        if category not in by_category:
            by_category[category] = []
        by_category[category].append(product)
    
    # Save each category to separate JSON file
    for category, products in by_category.items():
        output_file = base_dir / f"fortlev-{category}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2, ensure_ascii=False)
        print(f"Created {output_file.name} with {len(products)} products")
    
    # Save all products to unified file
    output_all = base_dir / "fortlev-all-products.json"
    with open(output_all, 'w', encoding='utf-8') as f:
        json.dump(all_products, f, indent=2, ensure_ascii=False)
    print(f"\nCreated {output_all.name} with {len(all_products)} total products")
    
    # Print summary
    print("\n=== Category Summary ===")
    for category in sorted(by_category.keys()):
        count = len(by_category[category])
        print(f"{category}: {count} products")

if __name__ == "__main__":
    main()
