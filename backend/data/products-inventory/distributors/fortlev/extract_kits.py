#!/usr/bin/env python3
"""Extract solar kits (panel + inverter combinations) from FortLev CSVs."""

import csv
import json
import re
from pathlib import Path
from typing import Dict, List, Any, Optional


def clean_price(price_str: str) -> float:
    """Convert Brazilian price format to float."""
    if not price_str or price_str in ["De:", ""]:
        return 0.0
    
    cleaned = price_str.replace("R$", "").replace(" ", "").strip()
    cleaned = cleaned.replace(".", "").replace(",", ".")
    
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def extract_power_from_description(desc: str) -> Optional[float]:
    """Extract power rating in kWp from description."""
    # Match patterns like "2,44 kWp" or "2.44 kWp"
    match = re.search(r'(\d+[,.]?\d*)\s*kWp', desc, re.IGNORECASE)
    if match:
        power_str = match.group(1).replace(',', '.')
        return float(power_str)
    return None


def extract_price_per_wp(details: str) -> Optional[float]:
    """Extract price per Wp from details like '2.44kWp - R$ 1,20/ Wp'."""
    match = re.search(r'R\$\s*(\d+[,.]?\d*)\s*/\s*Wp', details)
    if match:
        price_str = match.group(1).replace(',', '.')
        return float(price_str)
    return None


def extract_component_id(image_url: str) -> Optional[str]:
    """Extract component ID from S3 image URL."""
    match = re.search(r'/components/([^/]+)/', image_url)
    return match.group(1) if match else None


def identify_component_type(image_url: str, filename: str) -> str:
    """Identify if component is panel or inverter from image filename."""
    filename_lower = filename.lower()
    
    # Panel indicators
    if any(x in filename_lower for x in ['painel', 'panel', 'longi', 'byd', 'dmegc', 'risen', 'canadian', 'ja solar']):
        return 'panel'
    
    # Inverter indicators
    if any(x in filename_lower for x in ['inv', 'growatt', 'huawei', 'solis', 'fronius', 'sungrow', 'foxess', 'enphase']):
        return 'inverter'
    
    # Try to extract from image URL path
    if 'IMO' in image_url:
        return 'panel'
    elif 'IIN' in image_url:
        return 'inverter'
    
    return 'unknown'


def extract_manufacturer_from_filename(filename: str) -> Optional[str]:
    """Extract manufacturer name from image filename."""
    manufacturers = {
        'LONGI': 'Longi',
        'BYD': 'BYD',
        'DMEGC': 'DMEGC',
        'RISEN': 'Risen',
        'CANADIAN': 'Canadian Solar',
        'GROWATT': 'Growatt',
        'HUAWEI': 'Huawei',
        'SOLIS': 'Solis',
        'SUNGROW': 'Sungrow',
        'FRONIUS': 'Fronius',
        'FOXESS': 'FoxESS',
        'ENPHASE': 'Enphase'
    }
    
    filename_upper = filename.upper()
    for key, value in manufacturers.items():
        if key in filename_upper:
            return value
    
    return None


def extract_power_from_filename(filename: str) -> Optional[float]:
    """Extract power rating from filename like 'LONGI-585W' or 'GROWATT-NEO-2000M'."""
    # Try Wp pattern
    match = re.search(r'(\d+)W(?:p)?', filename, re.IGNORECASE)
    if match:
        watts = int(match.group(1))
        return watts / 1000.0  # Convert to kW
    
    # Try kW pattern
    match = re.search(r'(\d+)K(?:W)?', filename, re.IGNORECASE)
    if match:
        return float(match.group(1))
    
    return None


def parse_kit_csv(csv_path: Path) -> List[Dict[str, Any]]:
    """Parse kit CSV file and extract panel+inverter combinations."""
    kits = []
    kit_id = 1
    
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                # Get panel image (first image column)
                panel_image = row.get('img-content-orders src', '').strip()
                if not panel_image or 'http' not in panel_image:
                    continue
                
                # Get inverter image (second image column)
                inverter_image = row.get('img-content-orders src 2', '').strip()
                if not inverter_image or 'http' not in inverter_image:
                    continue
                
                # Get kit specifications
                power_kwp_str = row.get('fw-semibold', '').strip()
                price_str = row.get('text-orders-price', '').strip()
                details = row.get('details-card', '').strip()
                
                # Extract power rating
                power_kwp = extract_power_from_description(power_kwp_str)
                if not power_kwp:
                    continue
                
                # Extract pricing
                total_price = clean_price(price_str)
                price_per_wp = extract_price_per_wp(details)
                
                # Extract panel info from image URL
                panel_filename = panel_image.split('/')[-1]
                panel_manufacturer = extract_manufacturer_from_filename(panel_filename)
                panel_power = extract_power_from_filename(panel_filename)
                
                # Extract inverter info from image URL
                inverter_filename = inverter_image.split('/')[-1]
                inverter_manufacturer = extract_manufacturer_from_filename(inverter_filename)
                inverter_power = extract_power_from_filename(inverter_filename)
                
                # Calculate number of panels (approximate)
                num_panels = None
                if panel_power and panel_power > 0:
                    num_panels = int(round(power_kwp / panel_power))
                
                # Build kit object
                kit = {
                    "id": f"fortlev_kit_{kit_id:03d}",
                    "name": f"Kit {power_kwp}kWp - {panel_manufacturer or 'Panel'} + {inverter_manufacturer or 'Inverter'}",
                    "distributor": "fortlev",
                    "category": "kits",
                    "system_power_kwp": power_kwp,
                    "total_price": price_str,
                    "price_per_wp": price_per_wp,
                    "components": {
                        "panel": {
                            "image": panel_image,
                            "image_filename": panel_filename,
                            "manufacturer": panel_manufacturer,
                            "power_w": int(panel_power * 1000) if panel_power else None,
                            "quantity": num_panels,
                            "component_id": extract_component_id(panel_image)
                        },
                        "inverter": {
                            "image": inverter_image,
                            "image_filename": inverter_filename,
                            "manufacturer": inverter_manufacturer,
                            "power_kw": inverter_power,
                            "quantity": 1,
                            "component_id": extract_component_id(inverter_image)
                        }
                    },
                    "pricing": {
                        "total": total_price,
                        "per_wp": price_per_wp if price_per_wp else total_price / (power_kwp * 1000) if power_kwp > 0 else 0,
                        "currency": "BRL"
                    },
                    "metadata": {
                        "source_csv": csv_path.name,
                        "details": details
                    }
                }
                
                kits.append(kit)
                kit_id += 1
    
    except Exception as e:
        print(f"Error parsing {csv_path}: {e}")
    
    return kits


def main():
    """Main function to extract kits from FortLev CSVs."""
    base_dir = Path(__file__).parent
    
    # Files that contain kit configurations
    kit_csv_files = [
        "https___fortlevsolar.app_old.csv"
    ]
    
    all_kits = []
    
    for csv_file in kit_csv_files:
        csv_path = base_dir / csv_file
        if not csv_path.exists():
            print(f"File not found: {csv_file}")
            continue
        
        print(f"Parsing {csv_file}...")
        kits = parse_kit_csv(csv_path)
        all_kits.extend(kits)
        print(f"  Extracted {len(kits)} kits")
    
    print(f"\nTotal kits extracted: {len(all_kits)}")
    
    # Save to JSON
    output_file = base_dir / "fortlev-kits.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_kits, f, indent=2, ensure_ascii=False)
    print(f"Created {output_file.name} with {len(all_kits)} kits")
    
    # Generate summary statistics
    print("\n=== Kit Statistics ===")
    
    # Group by panel manufacturer
    by_panel_mfg = {}
    for kit in all_kits:
        mfg = kit['components']['panel']['manufacturer'] or 'Unknown'
        by_panel_mfg[mfg] = by_panel_mfg.get(mfg, 0) + 1
    
    print("\nBy Panel Manufacturer:")
    for mfg, count in sorted(by_panel_mfg.items()):
        print(f"  {mfg}: {count} kits")
    
    # Group by inverter manufacturer
    by_inv_mfg = {}
    for kit in all_kits:
        mfg = kit['components']['inverter']['manufacturer'] or 'Unknown'
        by_inv_mfg[mfg] = by_inv_mfg.get(mfg, 0) + 1
    
    print("\nBy Inverter Manufacturer:")
    for mfg, count in sorted(by_inv_mfg.items()):
        print(f"  {mfg}: {count} kits")
    
    # Power range
    if all_kits:
        powers = [k['system_power_kwp'] for k in all_kits if k['system_power_kwp']]
        if powers:
            print(f"\nPower Range: {min(powers):.2f} - {max(powers):.2f} kWp")
    
    # Price range
    prices = [k['pricing']['total'] for k in all_kits if k['pricing']['total'] > 0]
    if prices:
        print(f"Price Range: R$ {min(prices):,.2f} - R$ {max(prices):,.2f}")
        print(f"Average Price: R$ {sum(prices)/len(prices):,.2f}")


if __name__ == "__main__":
    main()
