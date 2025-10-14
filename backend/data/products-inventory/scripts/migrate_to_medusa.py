"""
YSH B2B - Migrate Products to Medusa.js with Dynamic Pricing
Converts normalized JSON data to Medusa-compatible format with:
- Multi-tier pricing (Bronze/Silver/Gold/Platinum)
- INMETRO certification tracking
- Dynamic SKU generation
- Sales channel association
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime
import re


class ProductMigrationService:
    """Migrates YSH product data to Medusa.js format"""
    
    DISTRIBUTOR_CODES = {
        'fortlev': 'FLV',
        'neosolar': 'NEO',
        'fotus': 'FTS'
    }
    
    TIER_MULTIPLIERS = {
        'bronze': 1.0,
        'silver': 0.95,  # 5% discount
        'gold': 0.90,    # 10% discount
        'platinum': 0.85  # 15% discount
    }
    
    VOLUME_TIERS = {
        'tier_1': {'min': 1, 'max': 10, 'discount': 0.0},
        'tier_2': {'min': 11, 'max': 50, 'discount': 0.05},
        'tier_3': {'min': 51, 'max': 999999, 'discount': 0.10}
    }
    
    def __init__(self, base_path: Path):
        self.base_path = base_path
        self.distributors_dir = base_path / "distributors"
        self.output_dir = base_path / "medusa_import"
        self.output_dir.mkdir(exist_ok=True)
    
    def generate_sku(
        self, 
        distributor: str, 
        product_type: str,
        power_kwp: float,
        brand: str,
        tier: str,
        inmetro_certified: bool,
        sequence: int
    ) -> str:
        """Generate dynamic SKU with tier and certification"""
        
        dist_code = self.DISTRIBUTOR_CODES.get(distributor.lower(), 'UNK')
        
        # Product type code
        type_code = {
            'kit': 'KIT',
            'panel': 'PNL',
            'inverter': 'INV'
        }.get(product_type.lower(), 'PRD')
        
        # Format power
        if power_kwp < 1:
            power_str = f"{int(power_kwp * 1000)}W"
        else:
            power_int = int(power_kwp * 100)
            power_str = f"{power_int}KWP" if power_int % 100 == 0 else f"{power_int}KWP"
        
        # Sanitize brand
        brand_clean = re.sub(r'[^A-Z0-9]', '', brand.upper())[:8]
        if not brand_clean:
            brand_clean = "GENERIC"
        
        # Tier code
        tier_code = {
            'bronze': 'BRZ',
            'silver': 'SLV',
            'gold': 'GLD',
            'platinum': 'PLT'
        }.get(tier.lower(), 'BRZ')
        
        # Certification flag
        cert_flag = 'CERT' if inmetro_certified else 'NONE'
        
        # Sequence
        seq_str = f"{sequence:03d}"
        
        return f"{dist_code}-{type_code}-{power_str}-{brand_clean}-{tier_code}-{cert_flag}-{seq_str}"
    
    def calculate_tiered_pricing(
        self, 
        base_price: float, 
        tier: str
    ) -> Dict[str, float]:
        """Calculate price for specific tier"""
        
        multiplier = self.TIER_MULTIPLIERS.get(tier, 1.0)
        tier_price = base_price * multiplier
        
        # Volume pricing
        volume_prices = {}
        for vol_tier, config in self.VOLUME_TIERS.items():
            vol_multiplier = 1.0 - config['discount']
            volume_prices[vol_tier] = {
                'min_qty': config['min'],
                'max_qty': config['max'],
                'price': round(tier_price * vol_multiplier, 2)
            }
        
        return {
            'base_price': round(base_price, 2),
            'tier_price': round(tier_price, 2),
            'tier_multiplier': multiplier,
            'volume_tiers': volume_prices
        }
    
    def extract_inmetro_data(self, product: Dict) -> Dict:
        """Extract INMETRO certification data"""
        
        # Check if product has INMETRO certification
        # (This would be based on actual certification data)
        has_cert = False
        cert_number = None
        kpi_score = 0
        
        # Placeholder logic - would be replaced with actual data
        title_lower = product.get('title', '').lower()
        if 'inmetro' in title_lower or 'certificado' in title_lower:
            has_cert = True
            kpi_score = 95
        
        return {
            'inmetro_certified': has_cert,
            'inmetro_certificate_number': cert_number,
            'inmetro_certification_date': datetime.now().isoformat() if has_cert else None,
            'inmetro_kpi_score': kpi_score
        }
    
    def migrate_product(
        self, 
        product: Dict, 
        distributor: str, 
        sequence: int
    ) -> Dict:
        """Migrate single product to Medusa format with multi-tier pricing"""
        
        # Extract power from product
        power_kwp = product.get('power_kwp', 0) or product.get('potencia_kwp', 0)
        
        # Extract brand (panel or inverter)
        brand = "GENERIC"
        if product.get('panels') and len(product['panels']) > 0:
            brand = product['panels'][0].get('brand', 'GENERIC')
        elif product.get('inverters') and len(product['inverters']) > 0:
            brand = product['inverters'][0].get('brand', 'GENERIC')
        
        # INMETRO data
        inmetro_data = self.extract_inmetro_data(product)
        
        # Base price (from product)
        base_price = product.get('price', 0) or product.get('preco', 0)
        if base_price == 0:
            # Estimate from components
            if product.get('pricing'):
                base_price = product['pricing'].get('total', 0)
        
        # Generate SKUs and pricing for each tier
        variants = []
        for tier in ['bronze', 'silver', 'gold', 'platinum']:
            sku = self.generate_sku(
                distributor=distributor,
                product_type='kit',
                power_kwp=power_kwp,
                brand=brand,
                tier=tier,
                inmetro_certified=inmetro_data['inmetro_certified'],
                sequence=sequence
            )
            
            pricing = self.calculate_tiered_pricing(base_price, tier)
            
            variants.append({
                'sku': sku,
                'tier': tier,
                'title': f"{product.get('title', 'Solar Kit')} - {tier.capitalize()} Tier",
                'pricing': pricing,
                'inventory_quantity': product.get('stock', 100),
                'allow_backorder': False,
                'options': [
                    {
                        'title': 'Tier',
                        'value': tier.capitalize()
                    }
                ]
            })
        
        # Build Medusa product
        medusa_product = {
            'title': product.get('title', 'Solar Kit'),
            'subtitle': f"{power_kwp}kWp Solar Kit",
            'description': product.get('description', ''),
            'handle': product.get('id', f"{distributor}-{sequence}").lower(),
            'is_giftcard': False,
            'discountable': True,
            'status': 'published',
            
            # Custom fields - Product Extension
            'extension': {
                'distributor_code': self.DISTRIBUTOR_CODES[distributor],
                'distributor_sku': product.get('id', ''),
                'power_kwp': power_kwp,
                'panel_brand': brand,
                'panel_power_w': product['panels'][0].get('power_w') if product.get('panels') else None,
                'panel_quantity': product['panels'][0].get('quantity') if product.get('panels') else None,
                'inverter_brand': product['inverters'][0].get('brand') if product.get('inverters') else None,
                'inverter_power_kw': product['inverters'][0].get('power_kw') if product.get('inverters') else None,
                'structure_type': product.get('estrutura', product.get('structure_type')),
                'base_price_brl': base_price,
                'normalized_title': product.get('normalized_title', ''),
                'search_tags': product.get('tags', []),
                **inmetro_data
            },
            
            # Variants (one per tier)
            'variants': variants,
            
            # Images
            'images': [
                {
                    'url': img.get('url', ''),
                    'metadata': {
                        'type': img.get('type', 'product'),
                        'filename': img.get('filename', '')
                    }
                }
                for img in product.get('images', [])
            ],
            
            # Metadata
            'metadata': {
                'original_id': product.get('id', ''),
                'distributor': distributor,
                'components': {
                    'panels': product.get('panels', []),
                    'inverters': product.get('inverters', [])
                },
                'migration_date': datetime.now().isoformat()
            }
        }
        
        return medusa_product
    
    def migrate_distributor_products(self, distributor: str) -> None:
        """Migrate all products from a distributor"""
        
        print(f"\n[MIGRATE] Processing distributor: {distributor.upper()}")
        
        # Find normalized JSON file
        dist_dir = self.distributors_dir / distributor
        normalized_file = None
        
        for filename in [
            f"{distributor}-kits-normalized.json",
            f"{distributor}-kits-extracted-with-skus.json",
            f"{distributor}-kits-with-skus.json"
        ]:
            file_path = dist_dir / filename
            if file_path.exists():
                normalized_file = file_path
                break
        
        if not normalized_file:
            print(f"[MIGRATE] ⚠️  No normalized file found for {distributor}")
            return
        
        print(f"[MIGRATE] Loading: {normalized_file.name}")
        
        with open(normalized_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        print(f"[MIGRATE] Found {len(products)} products")
        
        # Migrate each product
        migrated_products = []
        for idx, product in enumerate(products, 1):
            try:
                medusa_product = self.migrate_product(product, distributor, idx)
                migrated_products.append(medusa_product)
                
                if idx % 50 == 0 or idx <= 5:
                    print(f"[MIGRATE] [{idx}/{len(products)}] ✅ {medusa_product['title'][:50]}")
            
            except Exception as e:
                print(f"[MIGRATE] [{idx}/{len(products)}] ❌ Error: {str(e)}")
        
        # Save to output
        output_file = self.output_dir / f"{distributor}_medusa_products.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(migrated_products, f, ensure_ascii=False, indent=2)
        
        print(f"[MIGRATE] ✅ Saved {len(migrated_products)} products to {output_file.name}")
        
        # Generate import summary
        self.generate_summary(distributor, migrated_products)
    
    def generate_summary(self, distributor: str, products: List[Dict]) -> None:
        """Generate migration summary report"""
        
        total_variants = sum(len(p['variants']) for p in products)
        total_images = sum(len(p.get('images', [])) for p in products)
        
        certified = sum(
            1 for p in products 
            if p['extension'].get('inmetro_certified', False)
        )
        
        summary = {
            'distributor': distributor.upper(),
            'migration_date': datetime.now().isoformat(),
            'statistics': {
                'total_products': len(products),
                'total_variants': total_variants,
                'variants_per_product': round(total_variants / len(products), 2) if products else 0,
                'total_images': total_images,
                'inmetro_certified_products': certified,
                'certification_rate': f"{(certified / len(products) * 100):.1f}%" if products else "0%"
            },
            'tier_distribution': {
                'bronze_variants': total_variants // 4,
                'silver_variants': total_variants // 4,
                'gold_variants': total_variants // 4,
                'platinum_variants': total_variants // 4
            },
            'sample_skus': [
                {
                    'product': p['title'][:50],
                    'skus': [v['sku'] for v in p['variants'][:2]]
                }
                for p in products[:3]
            ]
        }
        
        summary_file = self.output_dir / f"{distributor}_migration_summary.json"
        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, ensure_ascii=False, indent=2)
        
        print(f"[MIGRATE] 📊 Summary saved to {summary_file.name}")
    
    def migrate_all_distributors(self) -> None:
        """Migrate all distributors"""
        
        print("\n" + "="*70)
        print("YSH B2B - MEDUSA.JS MIGRATION")
        print("Multi-Tier Pricing + INMETRO Certification + Dynamic SKUs")
        print("="*70)
        
        distributors = ['fortlev', 'neosolar', 'fotus']
        
        for distributor in distributors:
            try:
                self.migrate_distributor_products(distributor)
            except Exception as e:
                print(f"[MIGRATE] ❌ Failed to migrate {distributor}: {str(e)}")
        
        print("\n" + "="*70)
        print("✅ MIGRATION COMPLETE")
        print(f"📁 Output directory: {self.output_dir}")
        print("="*70)


def main():
    """Run migration"""
    
    base_path = Path(__file__).parent.parent
    
    service = ProductMigrationService(base_path)
    service.migrate_all_distributors()


if __name__ == "__main__":
    main()
