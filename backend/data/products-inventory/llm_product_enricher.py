#!/usr/bin/env python3
"""
🤖 Enriquecimento de Dados com GPT OSS 20B via Ollama
===================================================

Enriquece produtos do catálogo com foco em:
- Fabricante, Produto, Modelo, Série
- KPIs solares (potência, eficiência, geração)
- Preço e valor por Wp
- Certificações e conformidades
- Vida útil e garantia
- Distribuidor e origem

Usage:
    python llm_product_enricher.py
"""

import json
import requests
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

class OllamaEnricher:
    def __init__(self):
        self.base_url = "http://localhost:11434"
        self.model = "gpt-oss:20b"
        self.catalog_path = Path("medusa-catalog")
        self.output_path = Path("enriched-catalog")
        self.output_path.mkdir(exist_ok=True)
        
        # Estatísticas
        self.stats = {
            "processed": 0,
            "enriched": 0,
            "errors": 0,
            "skipped": 0
        }
    
    def test_connection(self) -> bool:
        """Testa conexão com Ollama"""
        try:
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": "Teste. Responda apenas: OK",
                    "stream": False
                },
                timeout=10
            )
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Erro na conexão: {e}")
            return False
    
    def create_enrichment_prompt(self, product: Dict[str, Any]) -> str:
        """Cria prompt para enriquecimento do produto"""
        
        # Extrair informações básicas do produto
        title = product.get("title", "")
        description = product.get("description", "")
        metadata = product.get("metadata", {})
        distributor = metadata.get("distributor", "")
        
        # Tentar extrair especificações existentes
        system_specs = metadata.get("system_specs", {})
        neosolar_specs = metadata.get("neosolar_specs", {})
        power_kwp = system_specs.get("total_power_kwp") or neosolar_specs.get("potencia_kwp", 0)
        
        # Extrair preço se disponível
        variants = product.get("variants", [])
        price_brl = 0
        if variants and variants[0].get("prices"):
            price_brl = variants[0]["prices"][0].get("amount", 0) / 100  # Converter de centavos
        
        prompt = f"""
Você é um especialista em energia solar. Analise este produto e enriqueça os dados seguindo EXATAMENTE a estrutura JSON solicitada.

PRODUTO PARA ANÁLISE:
Título: {title}
Descrição: {description}
Distribuidor: {distributor}
Potência atual: {power_kwp} kWp
Preço atual: R$ {price_brl:.2f}

INSTRUÇÕES:
1. FABRICANTE: Identifique o fabricante principal dos painéis/equipamentos
2. PRODUTO: Categorize o tipo de produto (Kit Solar, Painel, Inversor, etc.)
3. MODELO/SÉRIE: Extraia modelo específico e série se mencionado
4. KPIs SOLARES: Calcule métricas de performance
5. PREÇO: Analise competitividade e valor por Wp
6. CERTIFICAÇÕES: Identifique certificações e conformidades
7. VIDA ÚTIL: Estime durabilidade e garantia
8. DISTRIBUIDOR: Avalie reputação e origem

RESPONDA APENAS COM JSON VÁLIDO (sem markdown, sem explicações):
{{
    "fabricante": {{
        "nome": "Nome do fabricante principal",
        "pais_origem": "País de origem",
        "reputacao": "Tier 1/Tier 2/Tier 3",
        "confiabilidade": "Alta/Média/Baixa"
    }},
    "produto": {{
        "categoria": "Kit Solar Off-Grid/On-Grid/Híbrido/Painel/Inversor/Bateria",
        "modelo": "Modelo específico extraído",
        "serie": "Série se identificada",
        "aplicacao_principal": "Residencial/Comercial/Industrial/Rural"
    }},
    "kpis_solares": {{
        "potencia_wp": {power_kwp * 1000 if power_kwp > 0 else 'null'},
        "eficiencia_estimada": "Percentual estimado",
        "geracao_mensal_kwh": "Estimativa para região SE",
        "fator_capacidade": "Decimal entre 0-1",
        "payback_anos": "Anos estimados para ROI"
    }},
    "preco_analise": {{
        "valor_brl": {price_brl if price_brl > 0 else 'null'},
        "preco_por_wp": "R$/Wp calculado",
        "competitividade": "Excelente/Bom/Regular/Alto",
        "posicionamento": "Premium/Intermediário/Econômico"
    }},
    "certificacoes": {{
        "inmetro": "Sim/Não/Não informado",
        "iec_standards": ["IEC61215", "IEC61730"],
        "aneel": "Homologado/Não homologado/Não informado",
        "conformidades": ["ABNT", "ISO9001"],
        "status_regulatorio": "Conforme/Pendente/Não conforme"
    }},
    "vida_util": {{
        "garantia_produto_anos": "Anos de garantia",
        "garantia_performance_anos": "Anos garantia de performance",
        "vida_util_estimada_anos": "Vida útil total estimada",
        "degradacao_anual": "% de degradação anual",
        "confiabilidade": "Alta/Média/Baixa"
    }},
    "distribuidor_info": {{
        "nome": "{distributor}",
        "categoria": "Fabricante/Distribuidor/Integrador/Marketplace",
        "reputacao_mercado": "Excelente/Boa/Regular/Baixa",
        "cobertura_brasil": "Nacional/Regional/Local",
        "suporte_tecnico": "Completo/Básico/Limitado"
    }},
    "score_geral": {{
        "qualidade_produto": "1-10",
        "relacao_custo_beneficio": "1-10",
        "confiabilidade_marca": "1-10",
        "suporte_pos_venda": "1-10",
        "recomendacao": "Altamente Recomendado/Recomendado/Aceito/Não Recomendado"
    }}
}}
"""
        return prompt.strip()
    
    def enrich_product(self, product: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Enriquece um produto específico"""
        try:
            prompt = self.create_enrichment_prompt(product)
            
            print(f"🔄 Enriquecendo: {product.get('title', 'Produto sem título')[:50]}...")
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.1,  # Baixa temperatura para consistência
                        "top_k": 10,
                        "top_p": 0.9
                    }
                },
                timeout=60
            )
            
            if response.status_code != 200:
                print(f"❌ Erro HTTP: {response.status_code}")
                return None
            
            result = response.json()
            enrichment_text = result.get("response", "").strip()
            
            # Tentar fazer parse do JSON
            if enrichment_text.startswith("```json"):
                enrichment_text = enrichment_text.replace("```json", "").replace("```", "").strip()
            elif enrichment_text.startswith("```"):
                enrichment_text = enrichment_text.replace("```", "").strip()
            
            try:
                enrichment_data = json.loads(enrichment_text)
                return enrichment_data
            except json.JSONDecodeError as e:
                print(f"❌ Erro ao parsear JSON: {e}")
                print(f"📄 Resposta recebida: {enrichment_text[:200]}...")
                return None
                
        except Exception as e:
            print(f"❌ Erro no enriquecimento: {e}")
            return None
    
    def load_latest_catalog(self) -> Dict[str, Any]:
        """Carrega o catálogo mais recente"""
        catalog_files = list(self.catalog_path.glob("complete_catalog_*.json"))
        if not catalog_files:
            raise FileNotFoundError("Nenhum arquivo de catálogo encontrado")
        
        latest_file = max(catalog_files, key=lambda f: f.stat().st_mtime)
        print(f"📁 Carregando catálogo: {latest_file.name}")
        
        with open(latest_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def save_enriched_product(self, original_product: Dict[str, Any], enrichment: Dict[str, Any]) -> Dict[str, Any]:
        """Combina produto original com enriquecimento"""
        enriched_product = original_product.copy()
        
        # Adicionar enriquecimento aos metadados
        if "metadata" not in enriched_product:
            enriched_product["metadata"] = {}
        
        enriched_product["metadata"]["llm_enrichment"] = {
            "enriched_at": datetime.now().isoformat(),
            "model_used": self.model,
            "version": "1.0",
            **enrichment
        }
        
        # Atualizar campos específicos se melhorados
        try:
            # Atualizar título se for mais descritivo
            fabricante = enrichment.get("fabricante", {}).get("nome", "")
            produto_info = enrichment.get("produto", {})
            if fabricante and produto_info.get("modelo"):
                enhanced_title = f"{fabricante} {produto_info.get('modelo')} - {produto_info.get('categoria', '')}"
                if len(enhanced_title) > len(original_product.get("title", "")):
                    enriched_product["enhanced_title"] = enhanced_title
            
            # Adicionar tags enriquecidas
            new_tags = set(enriched_product.get("tags", []))
            
            # Tags do fabricante
            if fabricante:
                new_tags.add(f"tag_{fabricante.lower().replace(' ', '_')}")
            
            # Tags de certificação
            cert = enrichment.get("certificacoes", {})
            if cert.get("inmetro") == "Sim":
                new_tags.add("tag_inmetro")
            if cert.get("aneel") == "Homologado":
                new_tags.add("tag_aneel_homologado")
            
            # Tags de qualidade
            score = enrichment.get("score_geral", {})
            recomendacao = score.get("recomendacao", "")
            if "Altamente" in recomendacao:
                new_tags.add("tag_altamente_recomendado")
            elif "Recomendado" in recomendacao:
                new_tags.add("tag_recomendado")
            
            enriched_product["tags"] = list(new_tags)
            
        except Exception as e:
            print(f"⚠️ Erro ao aplicar melhorias: {e}")
        
        return enriched_product
    
    def process_catalog(self, max_products: int = 10) -> None:
        """Processa o catálogo completo"""
        print("🚀 Iniciando enriquecimento com GPT OSS 20B")
        print("=" * 60)
        
        # Testar conexão
        if not self.test_connection():
            print("❌ Falha na conexão com Ollama. Certifique-se de que está rodando.")
            return
        
        print("✅ Conexão com Ollama estabelecida")
        
        # Carregar catálogo
        catalog = self.load_latest_catalog()
        products = catalog.get("products", [])
        
        print(f"📦 Produtos encontrados: {len(products)}")
        print(f"🎯 Processando: {min(max_products, len(products))} produtos")
        print()
        
        # Processar produtos
        enriched_products = []
        
        for i, product in enumerate(products[:max_products]):
            print(f"📋 Produto {i+1}/{min(max_products, len(products))}")
            
            # Enriquecer produto
            enrichment = self.enrich_product(product)
            
            if enrichment:
                enriched_product = self.save_enriched_product(product, enrichment)
                enriched_products.append(enriched_product)
                self.stats["enriched"] += 1
                
                # Mostrar resumo do enriquecimento
                fabricante = enrichment.get("fabricante", {}).get("nome", "N/A")
                score = enrichment.get("score_geral", {}).get("recomendacao", "N/A")
                preco_wp = enrichment.get("preco_analise", {}).get("preco_por_wp", "N/A")
                
                print(f"   ✅ Fabricante: {fabricante}")
                print(f"   💰 Preço/Wp: {preco_wp}")
                print(f"   ⭐ Recomendação: {score}")
            else:
                enriched_products.append(product)
                self.stats["errors"] += 1
                print(f"   ❌ Falha no enriquecimento")
            
            self.stats["processed"] += 1
            print()
            
            # Pausa entre requests
            time.sleep(2)
        
        # Salvar catálogo enriquecido
        enriched_catalog = catalog.copy()
        enriched_catalog["products"] = enriched_products
        enriched_catalog["metadata"]["enriched_at"] = datetime.now().isoformat()
        enriched_catalog["metadata"]["enrichment_model"] = self.model
        enriched_catalog["metadata"]["enrichment_stats"] = self.stats
        
        output_file = self.output_path / f"enriched_catalog_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.json"
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(enriched_catalog, f, indent=2, ensure_ascii=False)
        
        # Relatório final
        print("🎉 ENRIQUECIMENTO CONCLUÍDO")
        print("=" * 40)
        print(f"📊 Produtos processados: {self.stats['processed']}")
        print(f"✅ Enriquecidos com sucesso: {self.stats['enriched']}")
        print(f"❌ Erros: {self.stats['errors']}")
        print(f"📁 Arquivo salvo: {output_file}")
        
        if self.stats["enriched"] > 0:
            success_rate = (self.stats["enriched"] / self.stats["processed"]) * 100
            print(f"📈 Taxa de sucesso: {success_rate:.1f}%")
        
        print("\n💡 Próximos passos:")
        print("   • Revisar produtos enriquecidos")
        print("   • Validar qualidade dos dados")
        print("   • Integrar ao catálogo principal")
        print("   • Expandir para todos os produtos")

def main():
    enricher = OllamaEnricher()
    
    try:
        # Processar 5 produtos inicialmente para teste
        enricher.process_catalog(max_products=5)
        
    except KeyboardInterrupt:
        print("\n⏹️ Processo interrompido pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro durante o processamento: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()