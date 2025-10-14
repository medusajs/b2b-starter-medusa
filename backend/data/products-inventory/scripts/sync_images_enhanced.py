"""
Enhanced Image Synchronization with Title Standardization
Maps downloaded images to products and standardizes image filenames
"""

import json
import shutil
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from PIL import Image
import hashlib


@dataclass
class ImageSyncResult:
    total_products: int
    products_with_images: int
    products_without_images: int
    images_found: int
    images_renamed: int
    images_copied: int
    errors: List[str]


class EnhancedImageSynchronizer:
    """Synchronize and standardize product images"""
    
    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.images_output = base_path / "images_catalog"
        self.images_output.mkdir(exist_ok=True)
    
    def standardize_filename(
        self,
        sku: str,
        title: str,
        original_ext: str,
        index: int = 0
    ) -> str:
        """
        Standardize image filename based on SKU and title
        Format: SKU-TITLE-INDEX.ext
        Example: FLV-KIT-563KWP-LONGI-001-painel-longi-630w-01.png
        """
        # Clean title: lowercase, remove special chars, max 50 chars
        clean_title = re.sub(r'[^a-z0-9\s-]', '', title.lower())
        clean_title = re.sub(r'\s+', '-', clean_title.strip())
        clean_title = clean_title[:50]
        
        # Remove trailing hyphens
        clean_title = clean_title.rstrip('-')
        
        # Build filename
        if index > 0:
            filename = f"{sku}-{clean_title}-{str(index).zfill(2)}{original_ext}"
        else:
            filename = f"{sku}-{clean_title}{original_ext}"
        
        return filename
    
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
    
    def sync_distributor(
        self,
        distributor: str,
        products_file: str,
        images_dir: str
    ) -> ImageSyncResult:
        """Sync and standardize images for a distributor"""
        
        print(f"\n[Sync] Processing {distributor}...")
        
        # Load products
        products_path = self.base_path / distributor / products_file
        
        if not products_path.exists():
            print(f"[Sync] ⚠️  Products file not found: {products_file}")
            return ImageSyncResult(0, 0, 0, 0, 0, 0, [f"File not found: {products_file}"])
        
        with open(products_path, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        # Images directory
        images_path = self.base_path / distributor / images_dir
        
        # Scan available images
        available_images = {}
        if images_path.exists():
            print(f"[Sync] Scanning {images_path}...")
            for img_file in images_path.rglob("*"):
                if img_file.is_file() and img_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.webp', '.svg']:
                    # Create multiple search keys
                    stem = img_file.stem.lower()
                    available_images[stem] = img_file
                    
                    # Also try without special characters
                    clean_stem = re.sub(r'[^a-z0-9]', '', stem)
                    if clean_stem:
                        available_images[clean_stem] = img_file
        
        print(f"[Sync] Found {len(set(available_images.values()))} unique images")
        
        # Sync results
        result = ImageSyncResult(
            total_products=len(products),
            products_with_images=0,
            products_without_images=0,
            images_found=0,
            images_renamed=0,
            images_copied=0,
            errors=[]
        )
        
        # Create output directory
        output_dir = self.images_output / distributor
        output_dir.mkdir(exist_ok=True)
        
        # Process each product
        for idx, product in enumerate(products, 1):
            sku = product.get('sku', '')
            kit_id = product.get('kit_id', '')
            title = product.get('title', '')
            
            if not sku:
                result.errors.append(f"Product {idx} has no SKU")
                result.products_without_images += 1
                continue
            
            # Try to find image
            image_file = self._find_image_for_product(
                sku, kit_id, title, available_images
            )
            
            if image_file:
                # Standardize filename
                original_ext = image_file.suffix.lower()
                new_filename = self.standardize_filename(sku, title, original_ext, 0)
                dest_file = output_dir / new_filename
                
                # Copy and rename
                try:
                    if not dest_file.exists():
                        shutil.copy2(image_file, dest_file)
                        result.images_copied += 1
                    
                    if image_file.name != new_filename:
                        result.images_renamed += 1
                    
                    # Get metadata
                    metadata = self.get_image_metadata(dest_file)
                    
                    # Add image to product
                    if 'images' not in product:
                        product['images'] = []
                    
                    # Check if already exists
                    exists = any(
                        img.get('url', '').endswith(new_filename)
                        for img in product['images']
                    )
                    
                    if not exists:
                        product['images'].append({
                            "url": str(dest_file.relative_to(self.base_path)),
                            "type": "primary",
                            "alt": title,
                            "width": metadata.get('width'),
                            "height": metadata.get('height'),
                            "format": metadata.get('format'),
                            "size_kb": metadata.get('size_kb'),
                            "source": "csv_download",
                            "standardized": True
                        })
                    
                    result.products_with_images += 1
                    result.images_found += 1
                    
                except Exception as e:
                    result.errors.append(f"Error processing {sku}: {e}")
                    result.products_without_images += 1
            else:
                result.products_without_images += 1
            
            # Progress
            if idx % 100 == 0:
                print(f"[Sync] Processed {idx}/{len(products)} products...")
        
        # Save updated products
        output_file = products_path.parent / f"{distributor}-kits-synced.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        
        print(f"[Sync] ✅ Saved to {output_file.name}")
        
        return result
    
    def _find_image_for_product(
        self,
        sku: str,
        kit_id: str,
        title: str,
        available_images: Dict[str, Path]
    ) -> Optional[Path]:
        """Find image file for product using multiple strategies"""
        
        # Strategy 1: Exact SKU match
        sku_clean = re.sub(r'[^a-z0-9]', '', sku.lower())
        if sku_clean in available_images:
            return available_images[sku_clean]
        
        # Strategy 2: Kit ID match
        if kit_id:
            kit_clean = re.sub(r'[^a-z0-9]', '', kit_id.lower())
            if kit_clean in available_images:
                return available_images[kit_clean]
        
        # Strategy 3: Partial SKU match
        for key, img_file in available_images.items():
            if sku_clean in key or key in sku_clean:
                return img_file
        
        # Strategy 4: Title-based match (extract brand/model)
        title_words = re.findall(r'[a-z0-9]+', title.lower())
        for word in title_words:
            if len(word) > 3:  # Skip very short words
                for key, img_file in available_images.items():
                    if word in key:
                        return img_file
        
        return None
    
    def sync_all(self) -> Dict[str, ImageSyncResult]:
        """Sync all distributors"""
        
        distributors = [
            ('fortlev', 'fortlev-kits-with-skus.json', 'images_downloaded'),
            ('neosolar', 'neosolar-kits-with-skus.json', 'images_downloaded'),
            ('fotus', 'fotus-kits-with-skus.json', 'images_downloaded'),
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
                    images_renamed=0,
                    images_copied=0,
                    errors=[str(e)]
                )
        
        return results
    
    def generate_report(self, results: Dict[str, ImageSyncResult]) -> str:
        """Generate sync report"""
        
        report = []
        report.append("\n" + "="*70)
        report.append("ENHANCED IMAGE SYNCHRONIZATION REPORT")
        report.append("="*70 + "\n")
        
        total_products = 0
        total_with_images = 0
        total_images_found = 0
        total_renamed = 0
        
        for dist, result in results.items():
            total_products += result.total_products
            total_with_images += result.products_with_images
            total_images_found += result.images_found
            total_renamed += result.images_renamed
            
            coverage = (result.products_with_images/result.total_products*100) if result.total_products > 0 else 0
            
            report.append(f"📦 {dist.upper()}")
            report.append(f"   Products: {result.total_products}")
            report.append(f"   With Images: {result.products_with_images} ({coverage:.1f}%)")
            report.append(f"   Without Images: {result.products_without_images}")
            report.append(f"   Images Found: {result.images_found}")
            report.append(f"   Images Standardized: {result.images_renamed}")
            report.append(f"   Images Copied: {result.images_copied}")
            
            if result.errors:
                report.append(f"   ❌ Errors: {len(result.errors)}")
                for error in result.errors[:5]:  # Show first 5 errors
                    report.append(f"      - {error}")
            
            report.append("")
        
        report.append("-"*70)
        report.append(f"📊 TOTAL")
        report.append(f"   Products: {total_products}")
        
        total_coverage = (total_with_images/total_products*100) if total_products > 0 else 0
        report.append(f"   With Images: {total_with_images} ({total_coverage:.1f}%)")
        report.append(f"   Images Found: {total_images_found}")
        report.append(f"   Images Standardized: {total_renamed}")
        report.append("="*70 + "\n")
        
        report.append("✅ IMAGE FILENAME STANDARDIZATION COMPLETE")
        report.append(f"   Format: SKU-TITLE-INDEX.ext")
        report.append(f"   Example: FLV-KIT-563KWP-LONGI-001-painel-longi-01.png")
        
        return "\n".join(report)


def main():
    """Run enhanced image synchronization"""
    
    base_path = Path(__file__).parent.parent / "distributors"
    
    synchronizer = EnhancedImageSynchronizer(base_path)
    results = synchronizer.sync_all()
    
    report = synchronizer.generate_report(results)
    print(report)
    
    # Save report
    report_file = Path(__file__).parent.parent / "IMAGE_SYNC_REPORT_ENHANCED.md"
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\n[Sync] 📄 Report saved to {report_file}")


if __name__ == "__main__":
    main()
