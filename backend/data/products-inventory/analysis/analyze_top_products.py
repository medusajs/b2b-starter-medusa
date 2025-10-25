#!/usr/bin/env python3
"""
🏆 Análise de Top Produtos para Destaque
=========================================

Analisa produtos enriquecidos e gera recomendações de badges/tags
"""

import json
from pathlib import Path
from typing import Dict, List, Any


class TopProductsAnalyzer:
    def __init__(self):
        self.enriched_path = Path('enriched-complete')
        self.output_path = Path('enriched-complete')
    
    def load_data(self) -> Dict[str, Any]:
        """Carrega dados"""
        # Top products
        top_files = list(self.enriched_path.glob('top_products_*.json'))
        latest_top = max(top_files, key=lambda p: p.stat().st_mtime)
        
        with open(latest_top, 'r', encoding='utf-8') as f:
            top_products = json.load(f)
        
        # Enriched products
        enriched_files = list(self.enriched_path.glob('enriched_products_*.json'))
        latest_enriched = max(enriched_files, key=lambda p: p.stat().st_mtime)
        
        with open(latest_enriched, 'r', encoding='utf-8') as f:
            all_products = json.load(f)
        
        return {
            'top': top_products,
            'all': all_products
        }
    
    def assign_badges(self, product: Dict[str, Any]) -> List[str]:
        """Atribui badges ao produto"""
        badges = []
        
        # Overall Score
        overall = product.get('overall_score', 0)
        if overall >= 75:
            badges.append('⭐ Top Rated')
        elif overall >= 65:
            badges.append('✅ Highly Rated')
        
        # Value Score
        value = product.get('value_score', 0)
        if value >= 80:
            badges.append('🌟 Best Value')
        elif value >= 70:
            badges.append('💎 Great Deal')
        
        # Price Recommendation
        price_rec = product.get('price_analysis', {}).get('price_recommendation')
        if price_rec == 'excellent_deal':
            badges.append('🔥 Hot Deal')
        
        # Certifications
        certs = product.get('certifications', {})
        cert_count = sum([
            certs.get('inmetro', False),
            certs.get('ce_marking', False),
            certs.get('tuv_certified', False),
            len(certs.get('iec_standards', []))
        ])
        
        if cert_count >= 3:
            badges.append('🛡️ Fully Certified')
        elif cert_count >= 1:
            badges.append('✅ Certified')
        
        # Warranty
        warranty = product.get('warranty', {})
        perf_warranty = warranty.get('performance_warranty_years') or 0
        if perf_warranty >= 25:
            badges.append('🏆 Extended Warranty')
        elif perf_warranty >= 20:
            badges.append('📋 Long Warranty')
        
        # Quality Score
        quality = product.get('quality_score', 0)
        if quality >= 70:
            badges.append('💪 Premium Quality')
        
        # Reliability
        reliability = product.get('reliability_score', 0)
        if reliability >= 75:
            badges.append('🔒 Highly Reliable')
        
        return badges
    
    def categorize_products(self, products: List[Dict[str, Any]]) -> Dict[str, List]:
        """Categoriza produtos por tipo de destaque"""
        categories = {
            'premium': [],      # Overall > 75
            'best_value': [],   # Value > 80
            'certified': [],    # Certified products
            'hot_deals': [],    # Excellent price
            'new_arrivals': [], # Recentes (se houver data)
            'top_sellers': []   # Pode ser baseado em metadata futura
        }
        
        for product in products:
            overall = product.get('overall_score', 0)
            value = product.get('value_score', 0)
            price_rec = product.get('price_analysis', {}).get('price_recommendation')
            
            if overall >= 75:
                categories['premium'].append(product)
            
            if value >= 80:
                categories['best_value'].append(product)
            
            if price_rec == 'excellent_deal':
                categories['hot_deals'].append(product)
            
            certs = product.get('certifications', {})
            if any([certs.get('inmetro'), certs.get('ce_marking'), 
                   certs.get('tuv_certified')]):
                categories['certified'].append(product)
        
        return categories
    
    def generate_recommendations(self, data: Dict[str, Any]):
        """Gera recomendações"""
        print("🏆 ANÁLISE DE TOP PRODUTOS PARA DESTAQUE")
        print("=" * 70)
        print()
        
        top_10 = data['top'].get('top_overall_score', [])[:10]
        all_products = data['all']
        
        # Assign badges to top 10
        print("📌 TOP 10 PRODUTOS COM BADGES")
        print("-" * 70)
        
        for i, product in enumerate(top_10, 1):
            badges = self.assign_badges(product)
            title = product.get('title', 'N/A')[:50]
            overall = product.get('overall_score', 0)
            value = product.get('value_score', 0)
            price = product.get('price_analysis', {}).get('best_price', 0)
            
            print(f"\n{i}. {title}...")
            print(f"   Overall: {overall:.1f} | Value: {value:.1f} | R$ {price:.2f}")
            print(f"   Badges: {' '.join(badges)}")
        
        print("\n" + "=" * 70)
        
        # Categorize all products
        categories = self.categorize_products(all_products)
        
        print("\n📊 DISTRIBUIÇÃO POR CATEGORIA DE DESTAQUE")
        print("-" * 70)
        
        for cat_name, products in categories.items():
            if products:
                print(f"\n🏷️  {cat_name.upper().replace('_', ' ')}: {len(products)} produtos")
                
                # Show top 3 in each category
                for p in products[:3]:
                    title = p.get('title', 'N/A')[:40]
                    score = p.get('overall_score', 0)
                    print(f"   • {title}... (Score: {score:.1f})")
        
        print("\n" + "=" * 70)
        
        # Recommendations summary
        print("\n💡 RECOMENDAÇÕES PARA FRONTEND")
        print("-" * 70)
        
        print(f"""
1. 🌟 HERO SECTION (Homepage):
   • Featured: Top 3 produtos premium (score > 75)
   • {len([p for p in top_10[:3]])} produtos identificados
   
2. 🔥 HOT DEALS SECTION:
   • Excellent Deals: {len(categories['hot_deals'])} produtos
   • Ordenar por value_score descendente
   
3. ✅ CERTIFIED PRODUCTS:
   • {len(categories['certified'])} produtos certificados
   • Filtro sidebar: INMETRO, CE, TÜV
   
4. 💎 BEST VALUE:
   • {len(categories['best_value'])} produtos com value > 80
   • Badge "Best Value" destacado
   
5. 🏆 PREMIUM COLLECTION:
   • {len(categories['premium'])} produtos overall > 75
   • Seção dedicada com filtros avançados
   
6. 📋 PRODUCT CARDS:
   • Badges dinâmicos baseados em scores
   • Max 3 badges por produto para não poluir
   • Priority: Best Value > Top Rated > Certified
        """)
        
        print("\n" + "=" * 70)
        
        # Save badge assignments
        self.save_badge_assignments(all_products)
    
    def save_badge_assignments(self, products: List[Dict[str, Any]]):
        """Salva atribuições de badges"""
        badge_data = []
        
        for product in products:
            badges = self.assign_badges(product)
            
            if badges:
                badge_data.append({
                    'id': product.get('id'),
                    'title': product.get('title'),
                    'badges': badges,
                    'overall_score': product.get('overall_score'),
                    'value_score': product.get('value_score'),
                    'price_recommendation': product.get('price_analysis', {}).get('price_recommendation')
                })
        
        output_file = self.output_path / 'product_badges.json'
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump({
                'total_products': len(products),
                'products_with_badges': len(badge_data),
                'badges': badge_data
            }, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Badges salvos: {output_file.name}")
        print(f"📊 {len(badge_data)} produtos com badges atribuídos")
    
    def run(self):
        """Executa análise"""
        data = self.load_data()
        self.generate_recommendations(data)


def main():
    analyzer = TopProductsAnalyzer()
    analyzer.run()


if __name__ == "__main__":
    main()
