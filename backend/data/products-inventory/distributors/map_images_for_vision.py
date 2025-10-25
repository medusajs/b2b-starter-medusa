"""
Map existing images to kit IDs and prepare for Vision AI processing
"""

import json
from pathlib import Path
import re
from typing import Dict, List


def map_fortlev_images(base_path: Path) -> Dict:
    """Map FortLev organized images to kit IDs."""
    image_dir = base_path / "organized_images" / "kit_combinations"
    kits_file = base_path / "fortlev-kits-normalized.json"
    
    # Load kits
    with open(kits_file, 'r', encoding='utf-8') as f:
        kits = json.load(f)
    
    # Map images
    mapping = []
    images_found = 0
    
    for kit in kits:
        kit_id = kit.get('id', '')
        
        # Try to find matching image
        # Pattern: fortlev_kit_XXX_combination.png
        kit_num_match = re.search(r'(\d+)', kit_id)
        if kit_num_match:
            kit_num = kit_num_match.group(1)
            pattern = f"fortlev_kit_{kit_num:0>3}_combination.png"
            image_path = image_dir / pattern
            
            if image_path.exists():
                mapping.append({
                    "kit_id": kit_id,
                    "kit_sku": kit.get('variant_sku', ''),
                    "kit_title": kit.get('title', ''),
                    "image_path": str(image_path.relative_to(base_path)),
                    "image_exists": True
                })
                images_found += 1
            else:
                mapping.append({
                    "kit_id": kit_id,
                    "kit_sku": kit.get('variant_sku', ''),
                    "kit_title": kit.get('title', ''),
                    "image_path": None,
                    "image_exists": False
                })
    
    return {
        "distributor": "FortLev",
        "total_kits": len(kits),
        "images_found": images_found,
        "missing_images": len(kits) - images_found,
        "mapping": mapping
    }


def map_fotus_images(base_path: Path) -> Dict:
    """Map FOTUS images (if they exist locally)."""
    kits_file = base_path / "fotus-kits-normalized.json"
    
    # Load kits
    with open(kits_file, 'r', encoding='utf-8') as f:
        kits = json.load(f)
    
    # Check for images directory
    image_dir = base_path / "images"
    images_exist = image_dir.exists()
    
    mapping = []
    for kit in kits:
        kit_id = kit.get('id', '')
        mapping.append({
            "kit_id": kit_id,
            "kit_sku": kit.get('variant_sku', ''),
            "kit_title": kit.get('title', ''),
            "image_path": None,
            "image_exists": False,
            "note": "Images need to be scraped from FOTUS portal"
        })
    
    return {
        "distributor": "FOTUS",
        "total_kits": len(kits),
        "images_found": 0,
        "missing_images": len(kits),
        "mapping": mapping
    }


def map_neosolar_images(base_path: Path) -> Dict:
    """Map NeoSolar downloaded images."""
    image_dir = base_path / "images"
    kits_file = base_path / "neosolar-kits-normalized.json"
    
    # Load kits
    with open(kits_file, 'r', encoding='utf-8') as f:
        kits = json.load(f)
    
    # Check for image mapping
    mapping_file = base_path / "image_mapping.json"
    if mapping_file.exists():
        with open(mapping_file, 'r', encoding='utf-8') as f:
            image_mapping = json.load(f)
    else:
        image_mapping = []
    
    # Create dict for quick lookup
    image_dict = {item['kit_id']: item for item in image_mapping}
    
    mapping = []
    images_found = 0
    
    for kit in kits:
        kit_id = kit.get('id', '')
        image_info = image_dict.get(kit_id, {})
        images = image_info.get('images', [])
        
        if images:
            mapping.append({
                "kit_id": kit_id,
                "kit_sku": kit.get('variant_sku', ''),
                "kit_title": kit.get('title', ''),
                "image_path": images[0]['local_path'] if images else None,
                "image_url": images[0]['url'] if images else None,
                "image_exists": True,
                "total_images": len(images)
            })
            images_found += 1
        else:
            mapping.append({
                "kit_id": kit_id,
                "kit_sku": kit.get('variant_sku', ''),
                "kit_title": kit.get('title', ''),
                "image_path": None,
                "image_exists": False
            })
    
    return {
        "distributor": "NeoSolar",
        "total_kits": len(kits),
        "images_found": images_found,
        "missing_images": len(kits) - images_found,
        "mapping": mapping
    }


def main():
    """Main execution."""
    print("\n" + "="*80)
    print("🗺️  IMAGE MAPPER - ALL DISTRIBUTORS")
    print("="*80)
    
    base_dir = Path(__file__).parent
    
    results = []
    
    # 1. FortLev
    print("\n📦 Mapping FortLev images...")
    fortlev_dir = base_dir / "fortlev"
    if fortlev_dir.exists():
        result = map_fortlev_images(fortlev_dir)
        results.append(result)
        
        # Save mapping
        output_file = fortlev_dir / "image_mapping_vision.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"   ✓ Total kits: {result['total_kits']}")
        print(f"   ✓ Images found: {result['images_found']}")
        print(f"   ✓ Missing: {result['missing_images']}")
        print(f"   💾 Saved: {output_file}")
    
    # 2. FOTUS
    print("\n📦 Mapping FOTUS images...")
    fotus_dir = base_dir / "fotus"
    if fotus_dir.exists():
        result = map_fotus_images(fotus_dir)
        results.append(result)
        
        # Save mapping
        output_file = fotus_dir / "image_mapping_vision.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"   ✓ Total kits: {result['total_kits']}")
        print(f"   ⚠️  Images found: {result['images_found']}")
        print(f"   ⚠️  Missing: {result['missing_images']}")
        print(f"   💾 Saved: {output_file}")
    
    # 3. NeoSolar
    print("\n📦 Mapping NeoSolar images...")
    neosolar_dir = base_dir / "neosolar"
    if neosolar_dir.exists():
        result = map_neosolar_images(neosolar_dir)
        results.append(result)
        
        # Save mapping
        output_file = neosolar_dir / "image_mapping_vision.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"   ✓ Total kits: {result['total_kits']}")
        print(f"   ✓ Images found: {result['images_found']}")
        print(f"   ✓ Missing: {result['missing_images']}")
        print(f"   💾 Saved: {output_file}")
    
    # Summary
    print("\n" + "="*80)
    print("📊 MAPPING SUMMARY")
    print("="*80)
    
    total_kits = sum(r['total_kits'] for r in results)
    total_images = sum(r['images_found'] for r in results)
    total_missing = sum(r['missing_images'] for r in results)
    
    for result in results:
        coverage = (result['images_found'] / result['total_kits'] * 100) if result['total_kits'] > 0 else 0
        print(f"\n{result['distributor']}:")
        print(f"   • Total kits: {result['total_kits']}")
        print(f"   • Images found: {result['images_found']}")
        print(f"   • Missing: {result['missing_images']}")
        print(f"   • Coverage: {coverage:.1f}%")
    
    print(f"\n{'='*80}")
    print(f"TOTALS:")
    print(f"   • Total kits: {total_kits}")
    print(f"   • Images available: {total_images}")
    print(f"   • Missing images: {total_missing}")
    coverage_pct = (total_images / total_kits * 100) if total_kits > 0 else 0
    print(f"   • Overall coverage: {coverage_pct:.1f}%")
    print(f"{'='*80}\n")
    
    print("✅ Image mapping complete!")
    print("\n🎯 Next steps:")
    print("   1. Run Vision AI enrichment on kits with images")
    print("   2. Generate vision-enhanced schemas")
    print("   3. Update SKUs with visual attributes")
    print("\n📝 Ready for Gemma3 Vision processing!")


if __name__ == "__main__":
    main()
