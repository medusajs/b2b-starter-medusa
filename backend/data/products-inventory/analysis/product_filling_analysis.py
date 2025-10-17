#!/usr/bin/env python3
"""
📊 Análise de Preenchimento por Tipo de Produto
===============================================

Analisa o percentual de preenchimento dos schemas por cada distribuidor
e tipo de produto com métricas detalhadas e recommendations.

Usage:
    python product_filling_analysis.py
"""

import json
from pathlib import Path
from typing import Dict, List, Any

def analyze_field_filling():
    """Analisa o preenchimento de campos por produto"""
    
    # Carregar catálogo
    catalog_path = Path("medusa-catalog")
    catalog_files = list(catalog_path.glob("complete_catalog_*.json"))
    latest_file = max(catalog_files, key=lambda f: f.stat().st_mtime)
    
    with open(latest_file, 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    
    products = catalog.get("products", [])
    
    print("🔍 ANÁLISE DE PREENCHIMENTO DOS SCHEMAS POR DISTRIBUIDOR")
    print("=" * 70)
    
    # Categorizar produtos
    categories = {
        "NeoSolar": [],
        "FOTUS": [],
        "FortLev": [], 
        "ODEX": [],
        "Outros": []
    }
    
    for product in products:
        distributor = product.get("metadata", {}).get("distributor", "").upper()
        if "NEOSOLAR" in distributor or "NEO" in distributor:
            categories["NeoSolar"].append(product)
        elif "FOTUS" in distributor:
            categories["FOTUS"].append(product)
        elif "FORTLEV" in distributor:
            categories["FortLev"].append(product)
        elif "ODEX" in distributor:
            categories["ODEX"].append(product)
        else:
            categories["Outros"].append(product)
    
    # Analisar cada categoria
    for category, products_list in categories.items():
        if not products_list:
            continue
            
        print(f"\n📦 {category.upper()}")
        print("-" * 40)
        print(f"Total de Produtos: {len(products_list)}")
        
        # Analisar campos essenciais
        essential_fields = {
            "title": 0,
            "description": 0, 
            "handle": 0,
            "thumbnail": 0,
            "weight": 0,
            "categories": 0,
            "tags": 0,
            "variants": 0,
            "variants_with_sku": 0,
            "variants_with_prices": 0,
            "metadata": 0,
            "images": 0
        }
        
        advanced_fields = {
            "external_id": 0,
            "hs_code": 0,
            "origin_country": 0,
            "seo_metadata": 0,
            "inventory_items": 0,
            "price_rules": 0,
            "options": 0
        }
        
        distributor_specific = {
            "system_type": 0,
            "power_specs": 0,
            "components": 0,
            "applications": 0,
            "source_data": 0
        }
        
        for product in products_list:
            # Campos essenciais
            if product.get("title"):
                essential_fields["title"] += 1
            if product.get("description"):
                essential_fields["description"] += 1
            if product.get("handle"):
                essential_fields["handle"] += 1
            if product.get("thumbnail"):
                essential_fields["thumbnail"] += 1
            if product.get("weight"):
                essential_fields["weight"] += 1
            if product.get("categories"):
                essential_fields["categories"] += 1
            if product.get("tags"):
                essential_fields["tags"] += 1
            if product.get("variants"):
                essential_fields["variants"] += 1
            if product.get("metadata"):
                essential_fields["metadata"] += 1
            if product.get("images"):
                essential_fields["images"] += 1
                
            # Verificar variants com SKU e prices
            variants = product.get("variants", [])
            for variant in variants:
                if variant.get("sku"):
                    essential_fields["variants_with_sku"] += 1
                    break
            
            for variant in variants:
                if variant.get("prices"):
                    essential_fields["variants_with_prices"] += 1
                    break
            
            # Campos avançados
            if product.get("external_id"):
                advanced_fields["external_id"] += 1
            if product.get("hs_code"):
                advanced_fields["hs_code"] += 1
            if product.get("origin_country"):
                advanced_fields["origin_country"] += 1
            if product.get("options"):
                advanced_fields["options"] += 1
                
            # SEO metadata
            metadata = product.get("metadata", {})
            if metadata.get("seo"):
                advanced_fields["seo_metadata"] += 1
                
            # Inventory items em variants
            for variant in variants:
                if variant.get("inventory_items"):
                    advanced_fields["inventory_items"] += 1
                    break
                    
            # Price rules em variants
            for variant in variants:
                prices = variant.get("prices", [])
                for price in prices:
                    if price.get("rules"):
                        advanced_fields["price_rules"] += 1
                        break
                if advanced_fields["price_rules"] > 0:
                    break
            
            # Campos específicos do distribuidor
            specs = metadata.get("neosolar_specs") or metadata.get("system_specs") or {}
            if specs.get("system_type"):
                distributor_specific["system_type"] += 1
            if specs.get("potencia_kwp") or specs.get("total_power_kwp"):
                distributor_specific["power_specs"] += 1
            if specs.get("components"):
                distributor_specific["components"] += 1
            if specs.get("ideal_applications"):
                distributor_specific["applications"] += 1
            if metadata.get("source_data"):
                distributor_specific["source_data"] += 1
        
        # Calcular percentuais e imprimir
        total = len(products_list)
        
        print(f"\n📋 Campos Essenciais:")
        for field, count in essential_fields.items():
            pct = (count / total) * 100 if total > 0 else 0
            status = "✅" if pct >= 80 else "⚠️" if pct >= 50 else "❌"
            print(f"  {status} {field:<20}: {pct:5.1f}% ({count}/{total})")
        
        print(f"\n🔧 Campos Avançados:")
        for field, count in advanced_fields.items():
            pct = (count / total) * 100 if total > 0 else 0
            status = "✅" if pct >= 80 else "⚠️" if pct >= 50 else "❌"
            print(f"  {status} {field:<20}: {pct:5.1f}% ({count}/{total})")
            
        print(f"\n🏷️ Campos Específicos:")
        for field, count in distributor_specific.items():
            pct = (count / total) * 100 if total > 0 else 0
            status = "✅" if pct >= 80 else "⚠️" if pct >= 50 else "❌"
            print(f"  {status} {field:<20}: {pct:5.1f}% ({count}/{total})")
        
        # Calcular score geral
        all_fields = {**essential_fields, **advanced_fields, **distributor_specific}
        total_possible = len(all_fields) * total
        total_filled = sum(all_fields.values())
        overall_score = (total_filled / total_possible) * 100 if total_possible > 0 else 0
        
        print(f"\n🎯 Score Geral: {overall_score:.1f}%")
        
        # Recomendações
        print(f"\n💡 Recomendações Prioritárias:")
        
        critical_missing = []
        for field, count in essential_fields.items():
            pct = (count / total) * 100 if total > 0 else 0
            if pct < 50:
                critical_missing.append(f"{field} ({pct:.1f}%)")
        
        if critical_missing:
            print(f"  🔴 Crítico: {', '.join(critical_missing[:3])}")
        
        advanced_missing = []
        for field, count in advanced_fields.items():
            pct = (count / total) * 100 if total > 0 else 0
            if pct < 30:
                advanced_missing.append(f"{field} ({pct:.1f}%)")
        
        if advanced_missing:
            print(f"  🟡 Melhorar: {', '.join(advanced_missing[:3])}")
    
    # Resumo geral
    print(f"\n📊 RESUMO GERAL")
    print("=" * 50)
    
    total_products = len(products)
    print(f"Total de Produtos Processados: {total_products}")
    
    # Distribuição por categoria
    for category, products_list in categories.items():
        if products_list:
            pct = (len(products_list) / total_products) * 100
            print(f"  • {category}: {len(products_list)} ({pct:.1f}%)")
    
    # Próximos passos
    print(f"\n🚀 PRÓXIMOS PASSOS")
    print("-" * 30)
    print("1. 🖼️ Implementar thumbnails automáticos (0% cobertura)")
    print("2. ⚖️ Adicionar peso estimado dos kits (0% cobertura)")  
    print("3. 🏷️ Configurar external_id do distribuidor")
    print("4. 📊 Implementar SEO metadata automático")
    print("5. 💰 Configurar price rules por região/cliente")
    print("6. 📦 Expandir para 2.600+ produtos NeoSolar")

if __name__ == "__main__":
    analyze_field_filling()