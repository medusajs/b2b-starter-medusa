"""Analisa por que produtos foram ignorados no enrichment"""
import json
from pathlib import Path
from collections import Counter

def main():
    print("🔍 Analisando razões de produtos ignorados...\n")
    
    with open('complete-inventory/valid_products_filtered.json', 'r', encoding='utf-8') as f:
        products = json.load(f)
    
    print(f"📊 Total de produtos: {len(products):,}\n")
    
    # Análise de fabricantes
    unknown_mfg = [p for p in products if not p.get('manufacturer') or p.get('manufacturer') == 'Unknown']
    print(f"❌ Manufacturer Unknown/vazio: {len(unknown_mfg):,}")
    
    # Top manufacturers
    manufacturers = Counter([p.get('manufacturer', 'None') for p in products])
    print(f"\n📈 Top 20 Manufacturers:")
    for mfg, count in manufacturers.most_common(20):
        pct = count / len(products) * 100
        print(f"  {mfg}: {count:,} ({pct:.1f}%)")
    
    # Análise de preços
    no_price = [p for p in products if not p.get('price')]
    zero_price = [p for p in products if p.get('price') == 'R$ 0,00']
    print(f"\n💰 Preços:")
    print(f"  Sem campo price: {len(no_price):,}")
    print(f"  Price = R$ 0,00: {len(zero_price):,}")
    
    # Produtos válidos para enrichment (mesmos critérios)
    valid_for_enrichment = []
    for p in products:
        mfg = p.get('manufacturer', '').strip()
        if not mfg or mfg == 'Unknown':
            continue
        
        price = p.get('price', '').strip()
        if not price or price == 'R$ 0,00':
            continue
        
        # Tenta converter preço
        clean_price = price.replace('R$', '').replace(' ', '').replace(',', '.').strip()
        try:
            price_val = float(clean_price)
            if price_val > 0:
                valid_for_enrichment.append(p)
        except:
            pass
    
    print(f"\n✅ Produtos válidos para enrichment: {len(valid_for_enrichment):,}")
    print(f"❌ Produtos que serão ignorados: {len(products) - len(valid_for_enrichment):,}")
    
    # Distribuição dos válidos
    if valid_for_enrichment:
        print(f"\n📊 Distribuição dos {len(valid_for_enrichment):,} produtos válidos:")
        
        dists = Counter([p.get('distributor', 'Unknown') for p in valid_for_enrichment])
        print(f"\n  Por Distribuidor:")
        for dist, count in dists.most_common():
            pct = count / len(valid_for_enrichment) * 100
            print(f"    {dist}: {count:,} ({pct:.1f}%)")
        
        cats = Counter([p.get('category', 'Unknown') for p in valid_for_enrichment])
        print(f"\n  Por Categoria:")
        for cat, count in cats.most_common():
            pct = count / len(valid_for_enrichment) * 100
            print(f"    {cat}: {count:,} ({pct:.1f}%)")

if __name__ == "__main__":
    main()
