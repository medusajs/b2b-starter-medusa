"""
Image Synchronization System
Syncs product images with database and validates availability
"""

import json
import shutil
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class ImageSyncResult:
    total_products: int
    products_with_images: int
    products_without_images: int
    images_found: int
    images_missing: int
    images_copied: int
    errors: List[str]


class ImageSynchronizer:
    """Synchronize images with product catalog"""
    
    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.images_output = base_path / "images_catalog"
        self.images_output.mkdir(exist_ok=True)
    
    def sync_distributor(
        self,
        distributor: str,
        products_file: str,
        images_dir: str
    ) -> ImageSyncResult:
        """Sync images for a distributor"""
        
        print(f"\n[Sync] Processing {distributor}...")
        
        # Load products
        products_path = self.base_path / distributor / products_file
        with open(products_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        # Images directory
        images_path = self.base_path / distributor / images_dir
        
        # Scan available images
        available_images = {}
        if images_path.exists():
            for img_file in images_path.rglob("*"):
                if img_file.is_file() and img_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp', '.svg']:
                    available_images[img_file.stem.lower()] = img_file
        
        # Sync results
        result = ImageSyncResult(
            total_products=len(products),
            products_with_images=0,
            products_without_images=0,
            images_found=0,
            images_missing=0,
            images_copied=0,
            errors=[]
        )
        
        # Process each product
        for product in products:
            sku = product.get('sku', '')
            kit_id = product.get('kit_id', '')
            
            # Check if product already has images
            if product.get('images') and len(product.get('images', [])) > 0:
                result.products_with_images += 1
                continue
            
            # Try to find image by SKU or kit_id
            image_file = self._find_image_file(
                sku, kit_id, available_images
            )
            
            if image_file:
                # Copy image to catalog
                dest_file = self._copy_image_to_catalog(
                    distributor, sku, image_file
                )
                
                if dest_file:
                    # Add image to product
                    if 'images' not in product:
                        product['images'] = []
                    
                    product['images'].append({
                        "url": str(dest_file.relative_to(self.base_path)),
                        "type": "primary",
                        "alt": product.get('title', ''),
                        "format": dest_file.suffix[1:].lower(),
                        "size_kb": round(dest_file.stat().st_size / 1024, 2)
                    })
                    
                    result.products_with_images += 1
                    result.images_found += 1
                    result.images_copied += 1
                else:
                    result.errors.append(f"Failed to copy image for {sku}")
                    result.products_without_images += 1
            else:
                result.products_without_images += 1
                result.images_missing += 1
        
        # Save updated products
        output_file = self.base_path / distributor / f"{distributor}-kits-synced.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
        print(f"[Sync] ✅ Saved to {output_file.name}")
        
        return result
    
    def _find_image_file(
        self,
        sku: str,
        kit_id: str,
        available_images: Dict[str, Path]
    ) -> Optional[Path]:
        """Find image file by SKU or kit_id"""
        
        search_keys = [
            sku.lower(),
            kit_id.lower(),
            sku.replace('-', '').lower() if sku else '',
            kit_id.replace('-', '').lower() if kit_id else '',
        ]
        
        for key in search_keys:
            if key and key in available_images:
                return available_images[key]
        
        return None
    
    def _copy_image_to_catalog(
        self,
        distributor: str,
        sku: str,
        source: Path
    ) -> Optional[Path]:
        """Copy image to catalog directory"""
        
        try:
            dest_dir = self.images_output / distributor
            dest_dir.mkdir(exist_ok=True)
            
            dest_file = dest_dir / f"{sku}{source.suffix}"
            
            if not dest_file.exists():
                shutil.copy2(source, dest_file)
            
            return dest_file
        
        except Exception as e:
            print(f"[Sync] ❌ Error copying {source}: {e}")
            return None
    
    def sync_all(self) -> Dict[str, ImageSyncResult]:
        """Sync all distributors"""
        
        distributors = [
            ('fortlev', 'fortlev-kits-with-skus.json', 'organized_images'),
            ('neosolar', 'neosolar-kits-with-skus.json', 'images'),
            ('fotus', 'fotus-kits-with-skus.json', 'images'),
        ]
        
        results = {}
        
        for dist, products_file, images_dir in distributors:
            try:
                result = self.sync_distributor(dist, products_file, images_dir)
                results[dist] = result
            except Exception as e:
                print(f"[Sync] ❌ Error processing {dist}: {e}")
                results[dist] = ImageSyncResult(
                    total_products=0,
                    products_with_images=0,
                    products_without_images=0,
                    images_found=0,
                    images_missing=0,
                    images_copied=0,
                    errors=[str(e)]
                )
        
        return results
    
    def generate_report(self, results: Dict[str, ImageSyncResult]) -> str:
        """Generate sync report"""
        
        report = []
        report.append("\n" + "="*60)
        report.append("IMAGE SYNCHRONIZATION REPORT")
        report.append("="*60 + "\n")
        
        total_products = 0
        total_with_images = 0
        total_images_found = 0
        
        for dist, result in results.items():
            total_products += result.total_products
            total_with_images += result.products_with_images
            total_images_found += result.images_found
            
            coverage = (result.products_with_images/result.total_products*100) if result.total_products > 0 else 0
            
            report.append(f"📦 {dist.upper()}")
            report.append(f"   Products: {result.total_products}")
            report.append(f"   With Images: {result.products_with_images} ({coverage:.1f}%)")
            report.append(f"   Without Images: {result.products_without_images}")
            report.append(f"   Images Found: {result.images_found}")
            report.append(f"   Images Copied: {result.images_copied}")
            
            if result.errors:
                report.append(f"   ❌ Errors: {len(result.errors)}")
            
            report.append("")
        
        report.append("-"*60)
        report.append(f"📊 TOTAL")
        report.append(f"   Products: {total_products}")
        
        total_coverage = (total_with_images/total_products*100) if total_products > 0 else 0
        report.append(f"   With Images: {total_with_images} ({total_coverage:.1f}%)")
        report.append(f"   Images Found: {total_images_found}")
        report.append("="*60 + "\n")
        
        return "\n".join(report)


def main():
    """Run image synchronization"""
    
    base_path = Path(__file__).parent.parent / "distributors"
    
    synchronizer = ImageSynchronizer(base_path)
    results = synchronizer.sync_all()
    
    report = synchronizer.generate_report(results)
    print(report)
    
    # Save report
    report_file = Path(__file__).parent.parent / "IMAGE_SYNC_REPORT.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"[Sync] 📄 Report saved to {report_file}")


if __name__ == "__main__":
    main()
