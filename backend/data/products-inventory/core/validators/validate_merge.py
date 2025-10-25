#!/usr/bin/env python3
"""
✅ Validação de Integridade do Merge
====================================

Valida catálogo merged para garantir integridade dos dados
"""

import json
from pathlib import Path
from collections import Counter


def validate_merged_catalog():
    print("✅ VALIDAÇÃO DE INTEGRIDADE DO MERGE")
    print("=" * 70)
    print()
    
    # Load merged catalog
    catalog_path = Path('medusa-catalog')
    merged_files = list(catalog_path.glob('complete_catalog_enriched_*.json'))
    
    if not merged_files:
        print("❌ Nenhum catálogo merged encontrado!")
        return False
    
    latest = max(merged_files, key=lambda p: p.stat().st_mtime)
    print(f"📂 Carregando: {latest.name}\n")
    
    with open(latest, 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    
    products = catalog.get('products', [])
    
    # Validations
    issues = []
    
    print("🔍 VALIDAÇÕES")
    print("-" * 70)
    
    # 1. SKUs únicos
    skus = []
    for product in products:
        for variant in product.get('variants', []):
            if variant.get('sku'):
                skus.append(variant['sku'])
    
    sku_counts = Counter(skus)
    duplicates = [sku for sku, count in sku_counts.items() if count > 1]
    
    if duplicates:
        issues.append(f"❌ SKUs duplicados: {len(duplicates)}")
        print(f"❌ SKUs duplicados encontrados: {len(duplicates)}")
        for sku in duplicates[:5]:
            print(f"   • {sku} ({sku_counts[sku]}x)")
    else:
        print(f"✅ SKUs únicos: {len(skus)} SKUs validados")
    
    # 2. Preços preservados
    products_without_price = []
    for product in products:
        has_price = False
        for variant in product.get('variants', []):
            if variant.get('prices'):
                has_price = True
                break
        if not has_price:
            products_without_price.append(product.get('title', 'N/A'))
    
    if products_without_price:
        issues.append(f"⚠️  Produtos sem preço: {len(products_without_price)}")
        print(f"⚠️  Produtos sem preço: {len(products_without_price)}")
    else:
        print(f"✅ Preços preservados: {len(products)} produtos")
    
    # 3. Metadata enriquecido
    enriched_count = sum(1 for p in products 
                        if p.get('metadata', {}).get('llm_enriched'))
    
    print(f"✅ Produtos enriquecidos: {enriched_count}/{len(products)}")
    
    # 4. Images e thumbnails
    with_images = sum(1 for p in products if p.get('images'))
    with_thumbnail = sum(1 for p in products if p.get('thumbnail'))
    
    print(f"✅ Produtos com images: {with_images}/{len(products)}")
    print(f"✅ Produtos com thumbnail: {with_thumbnail}/{len(products)}")
    
    # 5. Quality scores
    with_scores = sum(1 for p in products 
                     if p.get('metadata', {}).get('quality_scores'))
    
    print(f"✅ Produtos com quality_scores: {with_scores}/{len(products)}")
    
    # 6. Certifications
    with_certs = sum(1 for p in products 
                    if p.get('metadata', {}).get('certifications'))
    
    print(f"✅ Produtos com certifications: {with_certs}/{len(products)}")
    
    # 7. Warranty
    with_warranty = sum(1 for p in products 
                       if p.get('metadata', {}).get('warranty'))
    
    print(f"✅ Produtos com warranty: {with_warranty}/{len(products)}")
    
    # 8. KPIs
    with_kpis = sum(1 for p in products 
                   if p.get('metadata', {}).get('technical_kpis'))
    
    print(f"✅ Produtos com technical_kpis: {with_kpis}/{len(products)}")
    
    print()
    print("=" * 70)
    
    # Summary
    if not issues:
        print("✅ VALIDAÇÃO PASSOU! Nenhum problema encontrado.")
        print()
        print("📊 ESTATÍSTICAS")
        print(f"   • Total de produtos: {len(products)}")
        print(f"   • Taxa de enriquecimento: {enriched_count/len(products)*100:.1f}%")
        print(f"   • SKUs únicos: {len(skus)}")
        print(f"   • Produtos com metadata completo: {with_scores}")
        return True
    else:
        print("⚠️  VALIDAÇÃO COM ISSUES:")
        for issue in issues:
            print(f"   • {issue}")
        return False


if __name__ == "__main__":
    validate_merged_catalog()
