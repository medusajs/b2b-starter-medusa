#!/usr/bin/env python3
"""
📊 Análise dos Schemas Enriquecidos
===================================

Analisa e consolida os dados enriquecidos pelo GPT OSS 20B
gerando relatórios por fabricante, certificações e KPIs.
"""

import json
from pathlib import Path
from typing import Dict, List, Any
from collections import defaultdict

def analyze_enriched_catalog():
    """Analisa catálogo enriquecido"""
    
    # Encontrar arquivo mais recente
    enriched_path = Path("enriched-products")
    files = list(enriched_path.glob("focused_enriched_*.json"))
    
    if not files:
        print("❌ Nenhum arquivo enriquecido encontrado")
        return
    
    latest_file = max(files, key=lambda f: f.stat().st_mtime)
    print(f"📁 Analisando: {latest_file.name}\n")
    
    with open(latest_file, 'r', encoding='utf-8') as f:
        catalog = json.load(f)
    
    products = catalog.get("products", [])
    
    # Estatísticas gerais
    total = len(products)
    enriched = sum(1 for p in products if p.get("metadata", {}).get("focused_enrichment"))
    
    print("=" * 60)
    print("📊 ANÁLISE DE SCHEMAS ENRIQUECIDOS")
    print("=" * 60)
    print(f"\n📦 Total de Produtos: {total}")
    print(f"✅ Produtos Enriquecidos: {enriched}")
    print(f"📈 Taxa de Enriquecimento: {(enriched/total)*100:.1f}%\n")
    
    # Análise por fabricante
    fabricantes = defaultdict(lambda: {"count": 0, "tier": None, "produtos": []})
    
    # Análise de certificações
    cert_stats = defaultdict(int)
    
    # Análise de preços
    precos_wp = []
    
    # Análise de KPIs
    kpis_data = []
    
    for product in products:
        enrichment = product.get("metadata", {}).get("focused_enrichment", {})
        
        if not enrichment:
            continue
        
        # Fabricante
        fab_info = enrichment.get("fabricante", {})
        fab_nome = fab_info.get("fabricante", "Desconhecido")
        fab_tier = fab_info.get("tier", "N/A")
        
        fabricantes[fab_nome]["count"] += 1
        fabricantes[fab_nome]["tier"] = fab_tier
        fabricantes[fab_nome]["produtos"].append(product.get("title", ""))
        
        # Certificações
        cert_info = enrichment.get("certificacoes", {})
        for cert_type, cert_status in cert_info.items():
            if cert_status and cert_status != "Não informado":
                cert_stats[f"{cert_type}:{cert_status}"] += 1
        
        # KPIs
        kpis = enrichment.get("kpis_solares", {})
        if kpis and kpis.get("preco_por_wp", 0) > 0:
            precos_wp.append(kpis["preco_por_wp"])
            kpis_data.append({
                "produto": product.get("title", "")[:50],
                "preco_wp": kpis.get("preco_por_wp", 0),
                "payback": kpis.get("payback_anos", 0),
                "roi": kpis.get("roi_anual_pct", 0)
            })
    
    # Relatório de Fabricantes
    print("🏭 FABRICANTES IDENTIFICADOS")
    print("-" * 40)
    
    for fab, data in sorted(fabricantes.items(), key=lambda x: x[1]["count"], reverse=True):
        tier = data["tier"]
        count = data["count"]
        tier_emoji = "🥇" if tier == "Tier 1" else "🥈" if tier == "Tier 2" else "🥉"
        print(f"{tier_emoji} {fab:<25} | {tier:<10} | {count} produtos")
    
    # Relatório de Certificações
    print(f"\n📜 CERTIFICAÇÕES ENCONTRADAS")
    print("-" * 40)
    
    if cert_stats:
        for cert, count in sorted(cert_stats.items(), key=lambda x: x[1], reverse=True):
            print(f"  ✓ {cert:<35}: {count} produtos")
    else:
        print("  ⚠️ Nenhuma certificação informada nos produtos")
    
    # Análise de Preços
    if precos_wp:
        print(f"\n💰 ANÁLISE DE PREÇOS POR WP")
        print("-" * 40)
        media = sum(precos_wp) / len(precos_wp)
        minimo = min(precos_wp)
        maximo = max(precos_wp)
        
        print(f"  Média:  R$ {media:.2f}/Wp")
        print(f"  Mínimo: R$ {minimo:.2f}/Wp")
        print(f"  Máximo: R$ {maximo:.2f}/Wp")
        
        # Classificação de competitividade
        excelente = sum(1 for p in precos_wp if p < 1.5)
        bom = sum(1 for p in precos_wp if 1.5 <= p < 2.5)
        regular = sum(1 for p in precos_wp if 2.5 <= p < 3.5)
        alto = sum(1 for p in precos_wp if p >= 3.5)
        
        print(f"\n  Distribuição:")
        print(f"    🟢 Excelente (<R$1.50/Wp): {excelente} produtos")
        print(f"    🟡 Bom (R$1.50-2.50/Wp):    {bom} produtos")
        print(f"    🟠 Regular (R$2.50-3.50/Wp): {regular} produtos")
        print(f"    🔴 Alto (>R$3.50/Wp):        {alto} produtos")
    
    # Top 5 melhores ROI
    if kpis_data:
        print(f"\n⭐ TOP 5 MELHORES ROI")
        print("-" * 40)
        
        top_roi = sorted(kpis_data, key=lambda x: x["roi"], reverse=True)[:5]
        for i, item in enumerate(top_roi, 1):
            print(f"{i}. {item['produto']}")
            print(f"   💰 R$ {item['preco_wp']:.2f}/Wp | ⏱️ Payback: {item['payback']:.1f} anos | 📈 ROI: {item['roi']:.1f}%/ano")
    
    # Resumo de Vida Útil
    vida_util_data = []
    for product in products:
        enrichment = product.get("metadata", {}).get("focused_enrichment", {})
        vida_util = enrichment.get("vida_util", {})
        if vida_util:
            vida_util_data.append(vida_util)
    
    if vida_util_data:
        print(f"\n🛡️ VIDA ÚTIL E GARANTIAS")
        print("-" * 40)
        
        avg_garantia_produto = sum(int(v.get("garantia_produto_anos", 0)) for v in vida_util_data) / len(vida_util_data)
        avg_garantia_performance = sum(int(v.get("garantia_performance_anos", 0)) for v in vida_util_data) / len(vida_util_data)
        avg_vida_util = sum(int(v.get("vida_util_anos", 0)) for v in vida_util_data) / len(vida_util_data)
        
        print(f"  Garantia Produto (média):     {avg_garantia_produto:.1f} anos")
        print(f"  Garantia Performance (média): {avg_garantia_performance:.1f} anos")
        print(f"  Vida Útil Total (média):      {avg_vida_util:.1f} anos")
        
        # Confiabilidade
        confiabilidade_counts = defaultdict(int)
        for v in vida_util_data:
            conf = v.get("confiabilidade", "N/A")
            confiabilidade_counts[conf] += 1
        
        print(f"\n  Distribuição de Confiabilidade:")
        for conf, count in sorted(confiabilidade_counts.items(), key=lambda x: x[1], reverse=True):
            emoji = "🟢" if conf == "Alta" else "🟡" if conf == "Média" else "🔴"
            print(f"    {emoji} {conf}: {count} produtos")
    
    print("\n" + "=" * 60)
    print("✅ Análise concluída!")
    print("=" * 60)

if __name__ == "__main__":
    analyze_enriched_catalog()