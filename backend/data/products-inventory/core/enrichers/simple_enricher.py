#!/usr/bin/env python3
"""
🤖 Enriquecimento Simples com GPT OSS 20B
========================================

Versão simplificada para teste com prompts menores
"""

import json
import requests
import time
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

class SimpleEnricher:
    def __init__(self):
        self.base_url = "http://localhost:11434"
        self.model = "gpt-oss:20b"
        self.catalog_path = Path("medusa-catalog")
        
    def test_simple_prompt(self) -> None:
        """Testa com prompt simples"""
        
        # Carregar um produto de teste
        catalog_files = list(self.catalog_path.glob("complete_catalog_*.json"))
        latest_file = max(catalog_files, key=lambda f: f.stat().st_mtime)
        
        with open(latest_file, 'r', encoding='utf-8') as f:
            catalog = json.load(f)
        
        product = catalog["products"][0]  # Primeiro produto
        title = product.get("title", "")
        
        print(f"🔍 Testando com produto: {title}")
        print()
        
        # Prompt simples para extrair fabricante
        simple_prompt = f"""
Analise este produto solar e responda APENAS com JSON válido:

PRODUTO: {title}

Extraia informações básicas e responda no formato:
{{
    "fabricante": "nome do fabricante identificado",
    "categoria": "tipo de produto (Kit/Painel/Inversor/Bateria)",
    "potencia": "potência em Wp se identificada",
    "aplicacao": "Residencial/Comercial/Industrial",
    "qualidade": "Premium/Intermediário/Econômico"
}}
"""

        try:
            print("🚀 Enviando prompt simples...")
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": simple_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.1,
                        "num_ctx": 1024
                    }
                },
                timeout=90
            )
            
            if response.status_code == 200:
                result = response.json()
                answer = result.get("response", "").strip()
                
                print("✅ Resposta recebida:")
                print(answer)
                print()
                
                # Tentar parsear JSON
                try:
                    if answer.startswith("```"):
                        answer = answer.replace("```json", "").replace("```", "").strip()
                    
                    data = json.loads(answer)
                    print("🎉 JSON válido parseado:")
                    print(json.dumps(data, indent=2, ensure_ascii=False))
                    
                except json.JSONDecodeError as e:
                    print(f"❌ Erro no JSON: {e}")
                    print("📄 Texto recebido:", answer[:300])
            
            else:
                print(f"❌ Erro HTTP: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Erro: {e}")
    
    def enrich_specific_fields(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """Enriquece campos específicos de forma incremental"""
        
        title = product.get("title", "")
        description = product.get("description", "")
        
        print(f"🔄 Enriquecendo: {title[:50]}...")
        
        # 1. Extrair fabricante
        fabricante_prompt = f"""
Produto: {title}

Identifique o FABRICANTE principal dos painéis/equipamentos. Responda apenas o nome:
"""
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": fabricante_prompt,
                    "stream": False,
                    "options": {"temperature": 0.1, "num_ctx": 512}
                },
                timeout=30
            )
            
            if response.status_code == 200:
                fabricante = response.json().get("response", "").strip()
                print(f"   📋 Fabricante: {fabricante}")
                
                # 2. Análise de preço
                variants = product.get("variants", [])
                if variants and variants[0].get("prices"):
                    price_brl = variants[0]["prices"][0].get("amount", 0) / 100
                    
                    # Extrair potência
                    power_prompt = f"""
Produto: {title}

Extraia a potência em kWp ou Wp. Responda apenas o número com unidade (ex: "1.2kWp" ou "400Wp"):
"""
                    
                    power_response = requests.post(
                        f"{self.base_url}/api/generate",
                        json={
                            "model": self.model,
                            "prompt": power_prompt,
                            "stream": False,
                            "options": {"temperature": 0.1, "num_ctx": 512}
                        },
                        timeout=30
                    )
                    
                    if power_response.status_code == 200:
                        power_str = power_response.json().get("response", "").strip()
                        print(f"   ⚡ Potência: {power_str}")
                        
                        # Calcular preço por Wp se possível
                        try:
                            if "kwp" in power_str.lower():
                                power_kw = float(power_str.lower().replace("kwp", "").replace(",", "."))
                                power_w = power_kw * 1000
                            elif "wp" in power_str.lower():
                                power_w = float(power_str.lower().replace("wp", "").replace(",", "."))
                            else:
                                power_w = None
                            
                            if power_w and power_w > 0:
                                price_per_wp = price_brl / power_w
                                print(f"   💰 Preço: R$ {price_brl:.2f} (R$ {price_per_wp:.2f}/Wp)")
                        except:
                            pass
                
                # Retornar dados enriquecidos
                enrichment = {
                    "fabricante_identificado": fabricante,
                    "preco_analisado": price_brl if 'price_brl' in locals() else 0,
                    "potencia_extraida": power_str if 'power_str' in locals() else "",
                    "enriched_at": datetime.now().isoformat()
                }
                
                return enrichment
                
        except Exception as e:
            print(f"   ❌ Erro: {e}")
            return {}
    
    def process_sample_products(self, count: int = 3):
        """Processa alguns produtos de exemplo"""
        print("🎯 Processando produtos de exemplo")
        print("=" * 40)
        
        # Carregar catálogo
        catalog_files = list(self.catalog_path.glob("complete_catalog_*.json"))
        latest_file = max(catalog_files, key=lambda f: f.stat().st_mtime)
        
        with open(latest_file, 'r', encoding='utf-8') as f:
            catalog = json.load(f)
        
        products = catalog["products"][:count]
        
        enriched_products = []
        
        for i, product in enumerate(products):
            print(f"\n📦 Produto {i+1}/{count}")
            
            enrichment = self.enrich_specific_fields(product)
            
            if enrichment:
                # Adicionar enriquecimento ao produto
                if "metadata" not in product:
                    product["metadata"] = {}
                product["metadata"]["simple_enrichment"] = enrichment
                
            enriched_products.append(product)
            
            # Pausa entre requests
            time.sleep(3)
        
        # Salvar resultado
        output_file = f"simple_enriched_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(enriched_products, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Resultado salvo em: {output_file}")

def main():
    enricher = SimpleEnricher()
    
    print("🤖 Teste de Enriquecimento Simples com GPT OSS 20B")
    print("=" * 50)
    
    # Teste 1: Prompt simples
    print("\n1️⃣ TESTE DE PROMPT SIMPLES")
    enricher.test_simple_prompt()
    
    # Teste 2: Enriquecimento incremental
    print("\n2️⃣ TESTE DE ENRIQUECIMENTO INCREMENTAL")
    enricher.process_sample_products(count=2)

if __name__ == "__main__":
    main()