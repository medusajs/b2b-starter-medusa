#!/usr/bin/env python3
"""
🚀 Enriquecimento Focado de Produtos Solares
===========================================

Enriquece produtos com foco específico em:
✓ Fabricante e origem
✓ Produto, modelo, série  
✓ KPIs solares (potência, eficiência, geração)
✓ Preço e competitividade
✓ Certificações e conformidades
✓ Vida útil e garantia
✓ Distribuidor e reputação
"""

import json
import requests
import time
from pathlib import Path
from typing import Dict, Any
from datetime import datetime

class FocusedEnricher:
    def __init__(self):
        self.base_url = "http://localhost:11434"
        self.model = "gpt-oss:20b" 
        self.catalog_path = Path("medusa-catalog")
        self.output_path = Path("enriched-products")
        self.output_path.mkdir(exist_ok=True)
        
        self.stats = {
            "processed": 0,
            "enriched": 0,
            "errors": 0
        }
    
    def extract_manufacturer(self, title: str, description: str) -> Dict[str, Any]:
        """Extrai informações do fabricante"""
        prompt = f"""
Produto: {title}
Descrição: {description[:200]}

Identifique o FABRICANTE principal dos painéis solares e responda em JSON:
{{
    "fabricante": "Nome da marca/fabricante",
    "pais_origem": "País de origem (CN/BR/DE/US/etc)",
    "tier": "Tier 1/Tier 2/Tier 3 conforme mercado solar",
    "reputacao": "Excelente/Boa/Regular/Desconhecida"
}}
"""
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.1, "num_ctx": 1024}
                },
                timeout=60  # Aumentado de 45s para 60s
            )
            
            if response.status_code == 200:
                result = response.json().get("response", "").strip()
                if result.startswith("```"):
                    result = result.replace("```json", "").replace("```", "").strip()
                
                return json.loads(result)
        except Exception as e:
            print(f"   ❌ Erro fabricante: {e}")
        
        return {}
    
    def extract_product_specs(self, title: str, description: str) -> Dict[str, Any]:
        """Extrai especificações do produto"""
        prompt = f"""
Produto: {title}
Descrição: {description[:300]}

Extraia especificações técnicas em JSON:
{{
    "categoria": "Kit Solar Off-Grid/On-Grid/Híbrido/Painel/Inversor/Bateria",
    "modelo": "Modelo específico identificado",
    "serie": "Série do produto se mencionada",
    "potencia_wp": "Potência em Watts (apenas número)",
    "eficiencia_pct": "Eficiência em % se mencionada",
    "aplicacao": "Residencial/Comercial/Industrial/Rural"
}}
"""
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate", 
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.1, "num_ctx": 1024}
                },
                timeout=60  # Aumentado de 45s para 60s
            )
            
            if response.status_code == 200:
                result = response.json().get("response", "").strip()
                if result.startswith("```"):
                    result = result.replace("```json", "").replace("```", "").strip()
                
                return json.loads(result)
        except Exception as e:
            print(f"   ❌ Erro specs: {e}")
        
        return {}
    
    def analyze_certifications(self, title: str, description: str) -> Dict[str, Any]:
        """Analisa certificações e conformidades"""
        prompt = f"""
Produto: {title}
Descrição: {description[:300]}

Analise certificações brasileiras em JSON:
{{
    "inmetro": "Sim/Não/Não informado",
    "aneel": "Homologado/Pendente/Não informado", 
    "iec61215": "Sim/Não/Não informado",
    "iec61730": "Sim/Não/Não informado",
    "abnt": "Conforme/Não conforme/Não informado",
    "status_geral": "Totalmente conforme/Parcialmente conforme/Não conforme/Não informado"
}}
"""
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.1, "num_ctx": 1024}
                },
                timeout=60  # Aumentado de 45s para 60s
            )
            
            if response.status_code == 200:
                result = response.json().get("response", "").strip()
                if result.startswith("```"):
                    result = result.replace("```json", "").replace("```", "").strip()
                
                return json.loads(result)
        except Exception as e:
            print(f"   ❌ Erro certificações: {e}")
        
        return {}
    
    def analyze_warranty_lifespan(self, title: str, description: str) -> Dict[str, Any]:
        """Analisa vida útil e garantia"""
        prompt = f"""
Produto: {title}
Descrição: {description[:300]}

Estime garantia e vida útil em JSON:
{{
    "garantia_produto_anos": "Anos de garantia do produto",
    "garantia_performance_anos": "Anos de garantia de performance", 
    "vida_util_anos": "Vida útil estimada total",
    "degradacao_anual_pct": "% degradação anual estimada",
    "confiabilidade": "Alta/Média/Baixa"
}}
"""
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model, 
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.1, "num_ctx": 1024}
                },
                timeout=60  # Aumentado de 45s para 60s
            )
            
            if response.status_code == 200:
                result = response.json().get("response", "").strip()
                if result.startswith("```"):
                    result = result.replace("```json", "").replace("```", "").strip()
                
                return json.loads(result)
        except Exception as e:
            print(f"   ❌ Erro garantia: {e}")
        
        return {}
    
    def analyze_distributor(self, distributor: str, title: str) -> Dict[str, Any]:
        """Analisa informações do distribuidor"""
        prompt = f"""
Distribuidor: {distributor}
Produto: {title}

Avalie o distribuidor no mercado solar brasileiro:
{{
    "nome": "{distributor}",
    "tipo": "Fabricante/Distribuidor/Integrador/Marketplace",
    "reputacao": "Excelente/Boa/Regular/Ruim/Desconhecida",
    "cobertura": "Nacional/Regional/Local",
    "tempo_mercado": "Anos estimados no mercado solar",
    "suporte_tecnico": "Excelente/Bom/Básico/Limitado/Desconhecido"
}}
"""
        
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {"temperature": 0.1, "num_ctx": 1024}
                },
                timeout=60  # Aumentado de 45s para 60s
            )
            
            if response.status_code == 200:
                result = response.json().get("response", "").strip()
                if result.startswith("```"):
                    result = result.replace("```json", "").replace("```", "").strip()
                
                return json.loads(result)
        except Exception as e:
            print(f"   ❌ Erro distribuidor: {e}")
        
        return {}
    
    def calculate_kpis(self, product_specs: Dict, price_info: Dict) -> Dict[str, Any]:
        """Calcula KPIs solares"""
        try:
            potencia_wp = product_specs.get("potencia_wp", 0)
            if isinstance(potencia_wp, str):
                potencia_wp = float(potencia_wp.replace(",", "."))
            
            preco_brl = price_info.get("preco_brl", 0)
            
            kpis = {
                "potencia_wp": potencia_wp,
                "geracao_mensal_kwh": round(potencia_wp * 4.5 * 30 / 1000, 1) if potencia_wp > 0 else 0,
                "preco_por_wp": round(preco_brl / potencia_wp, 2) if potencia_wp > 0 and preco_brl > 0 else 0,
                "payback_anos": round(preco_brl / (potencia_wp * 4.5 * 30 * 0.7 / 1000 * 12), 1) if potencia_wp > 0 and preco_brl > 0 else 0,
                "roi_anual_pct": round(100 / (preco_brl / (potencia_wp * 4.5 * 30 * 0.7 / 1000 * 12)), 1) if potencia_wp > 0 and preco_brl > 0 else 0
            }
            
            return kpis
        except:
            return {}
    
    def enrich_product(self, product: Dict[str, Any]) -> Dict[str, Any]:
        """Enriquece um produto completo"""
        title = product.get("title", "")
        description = product.get("description", "")
        metadata = product.get("metadata", {})
        distributor = metadata.get("distributor", "")
        
        # Extrair preço
        variants = product.get("variants", [])
        price_brl = 0
        if variants and variants[0].get("prices"):
            price_brl = variants[0]["prices"][0].get("amount", 0) / 100
        
        print(f"🔄 {title[:60]}...")
        
        enrichment = {
            "enriched_at": datetime.now().isoformat(),
            "model_used": self.model
        }
        
        # 1. Fabricante
        print("   📋 Analisando fabricante...")
        manufacturer_info = self.extract_manufacturer(title, description)
        if manufacturer_info:
            enrichment["fabricante"] = manufacturer_info
        
        time.sleep(1)
        
        # 2. Especificações do produto  
        print("   ⚙️ Extraindo especificações...")
        product_specs = self.extract_product_specs(title, description)
        if product_specs:
            enrichment["produto"] = product_specs
        
        time.sleep(1)
        
        # 3. Certificações
        print("   📜 Verificando certificações...")
        certifications = self.analyze_certifications(title, description)
        if certifications:
            enrichment["certificacoes"] = certifications
        
        time.sleep(1)
        
        # 4. Garantia e vida útil
        print("   🛡️ Analisando garantias...")
        warranty = self.analyze_warranty_lifespan(title, description)
        if warranty:
            enrichment["vida_util"] = warranty
        
        time.sleep(1)
        
        # 5. Distribuidor
        if distributor:
            print("   🏢 Avaliando distribuidor...")
            distributor_info = self.analyze_distributor(distributor, title)
            if distributor_info:
                enrichment["distribuidor"] = distributor_info
        
        # 6. KPIs calculados
        price_info = {"preco_brl": price_brl}
        kpis = self.calculate_kpis(product_specs, price_info)
        if kpis:
            enrichment["kpis_solares"] = kpis
            print(f"   💰 Preço: R$ {price_brl:.2f} | R$ {kpis.get('preco_por_wp', 0):.2f}/Wp")
        
        return enrichment
    
    def process_catalog(self, max_products: int = 10):
        """Processa catálogo com enriquecimento focado"""
        print("🚀 ENRIQUECIMENTO FOCADO DE PRODUTOS SOLARES")
        print("=" * 60)
        
        # Carregar catálogo
        catalog_files = list(self.catalog_path.glob("complete_catalog_*.json"))
        latest_file = max(catalog_files, key=lambda f: f.stat().st_mtime)
        
        with open(latest_file, 'r', encoding='utf-8') as f:
            catalog = json.load(f)
        
        products = catalog["products"][:max_products]
        print(f"📦 Processando {len(products)} produtos")
        print()
        
        enriched_products = []
        
        for i, product in enumerate(products):
            print(f"📋 Produto {i+1}/{len(products)}")
            
            try:
                enrichment = self.enrich_product(product)
                
                # Adicionar enriquecimento ao produto
                if "metadata" not in product:
                    product["metadata"] = {}
                product["metadata"]["focused_enrichment"] = enrichment
                
                enriched_products.append(product)
                self.stats["enriched"] += 1
                
                # Mostrar resumo
                fab = enrichment.get("fabricante", {}).get("fabricante", "N/A")
                tier = enrichment.get("fabricante", {}).get("tier", "N/A") 
                cert = enrichment.get("certificacoes", {}).get("status_geral", "N/A")
                
                print(f"   ✅ {fab} ({tier}) | Cert: {cert}")
                
            except Exception as e:
                print(f"   ❌ Erro no produto: {e}")
                enriched_products.append(product)
                self.stats["errors"] += 1
            
            self.stats["processed"] += 1
            
            # 💾 CHECKPOINT: Salvar a cada 5 produtos
            if (i + 1) % 5 == 0:
                checkpoint_file = self.output_path / f"checkpoint_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
                checkpoint_catalog = catalog.copy()
                checkpoint_catalog["products"] = enriched_products
                checkpoint_catalog["metadata"]["checkpoint"] = {
                    "saved_at": datetime.now().isoformat(),
                    "processed": self.stats["processed"],
                    "enriched": self.stats["enriched"],
                    "errors": self.stats["errors"]
                }
                with open(checkpoint_file, 'w', encoding='utf-8') as f:
                    json.dump(checkpoint_catalog, f, indent=2, ensure_ascii=False)
                print(f"💾 Checkpoint salvo: {checkpoint_file.name}")
            
            print()
        
        # Salvar resultado
        output_file = self.output_path / f"focused_enriched_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        enriched_catalog = catalog.copy()
        enriched_catalog["products"] = enriched_products
        enriched_catalog["metadata"]["focused_enrichment"] = {
            "enriched_at": datetime.now().isoformat(),
            "stats": self.stats,
            "focus_areas": [
                "Fabricante e origem",
                "Especificações técnicas", 
                "Certificações",
                "Vida útil e garantia",
                "Avaliação do distribuidor",
                "KPIs solares calculados"
            ]
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(enriched_catalog, f, indent=2, ensure_ascii=False)
        
        # Relatório final
        print("🎉 ENRIQUECIMENTO CONCLUÍDO!")
        print("=" * 40)
        print(f"📊 Produtos processados: {self.stats['processed']}")
        print(f"✅ Enriquecidos: {self.stats['enriched']}")
        print(f"❌ Erros: {self.stats['errors']}")
        print(f"📁 Arquivo: {output_file}")
        
        if self.stats["enriched"] > 0:
            success_rate = (self.stats["enriched"] / self.stats["processed"]) * 100
            print(f"📈 Taxa de sucesso: {success_rate:.1f}%")

def main():
    enricher = FocusedEnricher()
    
    try:
        # Processar 20 produtos para análise mais ampla
        enricher.process_catalog(max_products=20)
        
    except KeyboardInterrupt:
        print("\n⏹️ Interrompido pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro: {e}")

if __name__ == "__main__":
    main()