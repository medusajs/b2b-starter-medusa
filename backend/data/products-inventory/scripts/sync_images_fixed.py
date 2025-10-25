"""
Fixed Image Synchronization with Proper Component Mapping
Maps downloaded images to products using component image_filename
"""

import json
import shutil
import re
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
from PIL import Image


@dataclass
class ImageSyncResult:
    total_products: int
    products_with_images: int
    products_without_images: int
    images_found: int
    images_renamed: int
    images_copied: int
    mapping_method_stats: Dict[str, int]
    errors: List[str]


class FixedImageSynchronizer:
    """Synchronize images using actual component data"""
    
    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.images_output = base_path / "images_catalog"
        self.images_output.mkdir(exist_ok=True)
    
    def standardize_filename(
        self,
        sku: str,
        component_type: str,
        original_filename: str,
        index: int = 0
    ) -> str:
        """
        Standardize filename: SKU-TYPE-ORIGINAL.ext
        Example: FLV-KIT-563KWP-LONGI-001-panel-IMO00135.png
        """
        # Get extension
        ext = Path(original_filename).suffix.lower()
        stem = Path(original_filename).stem.lower()
        
        # Clean stem (remove special chars, limit length)
        clean_stem = re.sub(r'[^a-z0-9\-]', '-', stem)
        clean_stem = clean_stem[:40]
        clean_stem = clean_stem.strip('-')
        
        # Build filename
        if index > 0:
            return f"{sku}-{component_type}-{clean_stem}-{str(index).zfill(2)}{ext}"
        else:
            return f"{sku}-{component_type}-{clean_stem}{ext}"
    
    def get_image_metadata(self, image_path: Path) -> Dict:
        """Extract image metadata"""
        try:
            with Image.open(image_path) as img:
                return {
                    "width": img.width,
                    "height": img.height,
                    "format": img.format.lower() if img.format else None,
                    "mode": img.mode,
                    "size_kb": round(image_path.stat().st_size / 1024, 2)
                }
        except Exception as e:
            return {
                "width": None,
                "height": None,
                "format": image_path.suffix[1:].lower(),
                "mode": None,
                "size_kb": round(image_path.stat().st_size / 1024, 2) if image_path.exists() else 0,
                "error": str(e)
            }
    
    def find_image_by_filename(
        self,
        target_filename: str,
        available_images: Dict[str, Path]
    ) -> Optional[Path]:
        """Find image by exact or partial filename match"""
        
        if not target_filename:
            return None
        
        # Strategy 1: Exact match (with extension)
        target_lower = target_filename.lower()
        if target_lower in available_images:
            return available_images[target_lower]
        
        # Strategy 2: Exact stem match (without extension)
        target_stem = Path(target_filename).stem.lower()
        if target_stem in available_images:
            return available_images[target_stem]
        
        # Strategy 3: Partial stem match
        target_clean = re.sub(r'[^a-z0-9]', '', target_stem)
        for key, img_path in available_images.items():
            key_clean = re.sub(r'[^a-z0-9]', '', key)
            if target_clean == key_clean:
                return img_path
        
        return None
    
    def sync_fortlev(
        self,
        products_file: str,
        images_dir: str
    ) -> ImageSyncResult:
        """Sync FortLev images using component image_filename"""
        
        print(f"\n[FortLev] Processing...")
        
        # Load products
        products_path = self.base_path / "distributors" / "fortlev" / products_file
        
        if not products_path.exists():
            return ImageSyncResult(
                0, 0, 0, 0, 0, 0, {},
                [f"File not found: {products_file}"]
            )
        
        with open(products_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        # Scan available images
        images_path = self.base_path / "distributors" / "fortlev" / images_dir
        
        available_images = {}
        if images_path.exists():
            print(f"[FortLev] Scanning {images_path.name}...")
            for img_file in images_path.rglob("*"):
                if img_file.is_file() and img_file.suffix.lower() in [
                    '.jpg', '.jpeg', '.png', '.webp', '.svg'
                ]:
                    # Index by full filename
                    available_images[img_file.name.lower()] = img_file
                    # Also index by stem
                    available_images[img_file.stem.lower()] = img_file
        
        print(f"[FortLev] Found {len(set(available_images.values()))} unique images")
        
        # Results
        result = ImageSyncResult(
            total_products=len(products),
            products_with_images=0,
            products_without_images=0,
            images_found=0,
            images_renamed=0,
            images_copied=0,
            mapping_method_stats={
                'panel_image_filename': 0,
                'inverter_image_filename': 0,
                'component_id': 0,
                'not_found': 0
            },
            errors=[]
        )
        
        # Output directory
        output_dir = self.images_output / "fortlev"
        output_dir.mkdir(exist_ok=True)
        
        # Process each product
        for idx, product in enumerate(products, 1):
            sku = product.get('sku', '')
            
            if not sku:
                result.errors.append(f"Product {idx} has no SKU")
                result.products_without_images += 1
                continue
            
            # Initialize images list
            if 'images' not in product:
                product['images'] = []
            
            product_has_image = False
            
            # Get components
            components = product.get('components', {})
            
            # Process panel image
            panel = components.get('panel', {})
            panel_filename = panel.get('image_filename')
            
            if panel_filename:
                panel_image = self.find_image_by_filename(
                    panel_filename,
                    available_images
                )
                
                if panel_image:
                    # Standardize filename
                    new_filename = self.standardize_filename(
                        sku, 'panel', panel_filename, 0
                    )
                    dest_file = output_dir / new_filename
                    
                    try:
                        if not dest_file.exists():
                            shutil.copy2(panel_image, dest_file)
                            result.images_copied += 1
                        
                        if panel_image.name != new_filename:
                            result.images_renamed += 1
                        
                        # Get metadata
                        metadata = self.get_image_metadata(dest_file)
                        
                        # Add to product
                        product['images'].append({
                            "url": str(dest_file.relative_to(self.base_path)),
                            "type": "component_panel",
                            "component_type": "panel",
                            "alt": f"{panel.get('manufacturer', 'Panel')} {panel.get('power_w', '')}W",
                            "width": metadata.get('width'),
                            "height": metadata.get('height'),
                            "format": metadata.get('format'),
                            "size_kb": metadata.get('size_kb'),
                            "source": "csv_download",
                            "standardized": True,
                            "original_filename": panel_filename
                        })
                        
                        product_has_image = True
                        result.mapping_method_stats['panel_image_filename'] += 1
                        
                    except Exception as e:
                        result.errors.append(f"Error copying panel image for {sku}: {e}")
            
            # Process inverter image
            inverter = components.get('inverter', {})
            inverter_filename = inverter.get('image_filename')
            
            if inverter_filename:
                inverter_image = self.find_image_by_filename(
                    inverter_filename,
                    available_images
                )
                
                if inverter_image:
                    # Standardize filename
                    new_filename = self.standardize_filename(
                        sku, 'inverter', inverter_filename, 0
                    )
                    dest_file = output_dir / new_filename
                    
                    try:
                        if not dest_file.exists():
                            shutil.copy2(inverter_image, dest_file)
                            result.images_copied += 1
                        
                        if inverter_image.name != new_filename:
                            result.images_renamed += 1
                        
                        # Get metadata
                        metadata = self.get_image_metadata(dest_file)
                        
                        # Add to product
                        product['images'].append({
                            "url": str(dest_file.relative_to(self.base_path)),
                            "type": "component_inverter",
                            "component_type": "inverter",
                            "alt": f"{inverter.get('manufacturer', 'Inverter')} {inverter.get('power_kw', '')}kW",
                            "width": metadata.get('width'),
                            "height": metadata.get('height'),
                            "format": metadata.get('format'),
                            "size_kb": metadata.get('size_kb'),
                            "source": "csv_download",
                            "standardized": True,
                            "original_filename": inverter_filename
                        })
                        
                        product_has_image = True
                        result.mapping_method_stats['inverter_image_filename'] += 1
                        
                    except Exception as e:
                        result.errors.append(f"Error copying inverter image for {sku}: {e}")
            
            if product_has_image:
                result.products_with_images += 1
                result.images_found += len(product['images'])
            else:
                result.products_without_images += 1
                result.mapping_method_stats['not_found'] += 1
            
            # Progress
            if idx % 50 == 0:
                print(f"[FortLev] Processed {idx}/{len(products)} products...")
        
        # Save updated products
        output_file = products_path.parent / "fortlev-kits-synced-fixed.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
        print(f"[FortLev] ✅ Saved to {output_file.name}")
        
        return result
    
    def generate_report(self, results: Dict[str, ImageSyncResult]) -> str:
        """Generate detailed sync report"""
        
        report = []
        report.append("\n" + "="*70)
        report.append("FIXED IMAGE SYNCHRONIZATION REPORT")
        report.append("="*70 + "\n")
        
        total_products = 0
        total_with_images = 0
        total_images_found = 0
        total_renamed = 0
        total_copied = 0
        
        for dist, result in results.items():
            total_products += result.total_products
            total_with_images += result.products_with_images
            total_images_found += result.images_found
            total_renamed += result.images_renamed
            total_copied += result.images_copied
            
            coverage = (
                result.products_with_images/result.total_products*100
            ) if result.total_products > 0 else 0
            
            report.append(f"📦 {dist.upper()}")
            report.append(f"   Products: {result.total_products}")
            report.append(f"   With Images: {result.products_with_images} ({coverage:.1f}%)")
            report.append(f"   Without Images: {result.products_without_images}")
            report.append(f"   Total Images: {result.images_found}")
            report.append(f"   Images Standardized: {result.images_renamed}")
            report.append(f"   Images Copied: {result.images_copied}")
            
            if result.mapping_method_stats:
                report.append(f"   Mapping Methods:")
                for method, count in result.mapping_method_stats.items():
                    report.append(f"      - {method}: {count}")
            
            if result.errors:
                report.append(f"   ❌ Errors: {len(result.errors)}")
                for error in result.errors[:3]:
                    report.append(f"      - {error}")
            
            report.append("")
        
        report.append("-"*70)
        report.append(f"📊 TOTAL")
        report.append(f"   Products: {total_products}")
        
        total_coverage = (
            total_with_images/total_products*100
        ) if total_products > 0 else 0
        
        report.append(f"   With Images: {total_with_images} ({total_coverage:.1f}%)")
        report.append(f"   Total Images: {total_images_found}")
        report.append(f"   Images Standardized: {total_renamed}")
        report.append(f"   Images Copied: {total_copied}")
        report.append("="*70 + "\n")
        
        report.append("✅ IMAGE SYNCHRONIZATION COMPLETE")
        report.append(f"   Filename Format: SKU-TYPE-ORIGINAL.ext")
        report.append(f"   Example: FLV-KIT-563KWP-LONGI-001-panel-imo00135.png")
        
        return "\n".join(report)


def main():
    """Run fixed image synchronization"""
    
    base_path = Path(__file__).parent.parent
    
    synchronizer = FixedImageSynchronizer(base_path)
    
    # Sync FortLev
    fortlev_result = synchronizer.sync_fortlev(
        'fortlev-kits-with-skus.json',
        'images_downloaded'
    )
    
    results = {'fortlev': fortlev_result}
    
    report = synchronizer.generate_report(results)
    print(report)
    
    # Save report
    report_file = base_path / "IMAGE_SYNC_REPORT_FIXED.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n[Sync] 📄 Report saved to {report_file.name}")


if __name__ == "__main__":
    main()
