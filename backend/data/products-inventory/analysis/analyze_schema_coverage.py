#!/usr/bin/env python3
"""
🔍 Análise de Cobertura dos Schemas NeoSolar
==========================================

Analisa o percentual de campos preenchidos pelos scripts de conversão
em cada tipo de produto (Kits, Baterias) conforme os schemas definidos.

Usage:
    python analyze_schema_coverage.py
"""

import json
import os
from typing import Dict, List, Any, Tuple
from pathlib import Path

class SchemaCoverageAnalyzer:
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.schemas_path = self.base_path / "schemas"
        self.catalog_path = self.base_path / "medusa-catalog"
        
    def load_schema(self, schema_file: str) -> Dict[str, Any]:
        """Carrega um arquivo de schema JSON"""
        schema_path = self.schemas_path / schema_file
        with open(schema_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def load_latest_catalog(self) -> Dict[str, Any]:
        """Carrega o catálogo mais recente"""
        catalog_files = list(self.catalog_path.glob("complete_catalog_*.json"))
        if not catalog_files:
            raise FileNotFoundError("Nenhum arquivo de catálogo encontrado")
        
        latest_file = max(catalog_files, key=os.path.getctime)
        print(f"📁 Carregando catálogo: {latest_file.name}")
        
        with open(latest_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def extract_schema_fields(self, schema_properties: Dict[str, Any], prefix: str = "") -> List[str]:
        """Extrai todos os campos possíveis do schema recursivamente"""
        fields = []
        
        for field_name, field_def in schema_properties.items():
            full_field = f"{prefix}.{field_name}" if prefix else field_name
            fields.append(full_field)
            
            # Se tem propriedades aninhadas, extrair recursivamente
            if isinstance(field_def, dict):
                if "properties" in field_def:
                    nested_fields = self.extract_schema_fields(
                        field_def["properties"], 
                        full_field
                    )
                    fields.extend(nested_fields)
                
                # Para arrays de objetos
                elif "items" in field_def and isinstance(field_def["items"], dict):
                    if "properties" in field_def["items"]:
                        nested_fields = self.extract_schema_fields(
                            field_def["items"]["properties"], 
                            f"{full_field}[]"
                        )
                        fields.extend(nested_fields)
        
        return fields
    
    def check_field_presence(self, data: Any, field_path: str) -> bool:
        """Verifica se um campo específico está presente nos dados"""
        if not data or not field_path:
            return False
            
        parts = field_path.split('.')
        current = data
        
        for i, part in enumerate(parts):
            if part.endswith('[]'):
                # Campo de array
                array_field = part[:-2]
                if not isinstance(current, dict) or array_field not in current:
                    return False
                
                current = current[array_field]
                if not isinstance(current, list) or len(current) == 0:
                    return False
                
                # Para arrays, verificar se pelo menos um item tem os campos restantes
                remaining_path = '.'.join(parts[i+1:]) if i+1 < len(parts) else ""
                if remaining_path:
                    return any(self.check_field_presence(item, remaining_path) for item in current)
                else:
                    return True
            else:
                if not isinstance(current, dict) or part not in current:
                    return False
                current = current[part]
        
        # Verificar se o valor não é nulo/vazio
        return current is not None and current != "" and current != []
    
    def analyze_product_coverage(self, products: List[Dict], schema_fields: List[str], product_type: str) -> Dict[str, Any]:
        """Analisa a cobertura de campos para um tipo de produto"""
        if not products:
            return {
                "total_products": 0,
                "coverage_percentage": 0,
                "field_analysis": {},
                "missing_fields": []
            }
        
        field_stats = {}
        total_products = len(products)
        
        # Analisar cada campo
        for field in schema_fields:
            present_count = sum(1 for product in products if self.check_field_presence(product, field))
            field_stats[field] = {
                "present": present_count,
                "missing": total_products - present_count,
                "percentage": (present_count / total_products) * 100 if total_products > 0 else 0
            }
        
        # Calcular estatísticas gerais
        total_fields = len(schema_fields)
        total_possible = total_products * total_fields
        total_present = sum(stats["present"] for stats in field_stats.values())
        
        overall_coverage = (total_present / total_possible) * 100 if total_possible > 0 else 0
        
        # Identificar campos frequentemente ausentes
        missing_fields = [
            field for field, stats in field_stats.items() 
            if stats["percentage"] < 50
        ]
        
        return {
            "total_products": total_products,
            "total_fields": total_fields,
            "coverage_percentage": overall_coverage,
            "field_analysis": field_stats,
            "missing_fields": missing_fields,
            "well_covered_fields": [
                field for field, stats in field_stats.items() 
                if stats["percentage"] >= 80
            ]
        }
    
    def categorize_products(self, products: List[Dict]) -> Dict[str, List[Dict]]:
        """Categoriza produtos por distribuidor e tipo"""
        categories = {
            "neosolar_kits": [],
            "fotus_kits": [],
            "odex_products": [],
            "fortlev_kits": [],
            "batteries": [],
            "other": []
        }
        
        for product in products:
            metadata = product.get("metadata", {})
            distributor = metadata.get("distributor", "").lower()
            product_type = metadata.get("product_type", "")
            
            if distributor == "neosolar":
                categories["neosolar_kits"].append(product)
            elif distributor == "fotus":
                categories["fotus_kits"].append(product)
            elif distributor == "odex":
                categories["odex_products"].append(product)
            elif distributor == "fortlev":
                categories["fortlev_kits"].append(product)
            elif product_type == "battery":
                categories["batteries"].append(product)
            else:
                categories["other"].append(product)
        
        return categories
    
    def generate_report(self) -> Dict[str, Any]:
        """Gera relatório completo de cobertura dos schemas"""
        print("🔍 Iniciando análise de cobertura dos schemas...")
        
        # Carregar schemas
        print("\n📋 Carregando schemas...")
        neosolar_kits_schema = self.load_schema("bundles/neosolar-kits-medusa-schema.json")
        neosolar_batteries_schema = self.load_schema("batteries/neosolar-batteries-medusa-schema.json")
        
        # Extrair campos dos schemas
        kit_fields = self.extract_schema_fields(neosolar_kits_schema["properties"])
        battery_fields = self.extract_schema_fields(neosolar_batteries_schema["properties"])
        
        print(f"   ✓ Schema NeoSolar Kits: {len(kit_fields)} campos")
        print(f"   ✓ Schema Baterias: {len(battery_fields)} campos")
        
        # Carregar catálogo
        print("\n📦 Carregando catálogo...")
        catalog = self.load_latest_catalog()
        products = catalog.get("products", [])
        
        print(f"   ✓ Total de produtos no catálogo: {len(products)}")
        
        # Categorizar produtos
        print("\n🏷️ Categorizando produtos...")
        categories = self.categorize_products(products)
        
        for category, items in categories.items():
            print(f"   ✓ {category}: {len(items)} produtos")
        
        # Analisar cobertura por categoria
        print("\n📊 Analisando cobertura...")
        
        analysis = {
            "catalog_stats": catalog.get("stats", {}),
            "schema_info": {
                "neosolar_kits": {
                    "total_fields": len(kit_fields),
                    "field_list": kit_fields
                },
                "batteries": {
                    "total_fields": len(battery_fields),
                    "field_list": battery_fields
                }
            },
            "coverage_analysis": {}
        }
        
        # Analisar NeoSolar Kits usando schema de kits
        if categories["neosolar_kits"]:
            analysis["coverage_analysis"]["neosolar_kits"] = self.analyze_product_coverage(
                categories["neosolar_kits"], 
                kit_fields, 
                "neosolar_kits"
            )
        
        # Analisar outros kits usando schema de kits (FOTUS, FortLev)
        for kit_type in ["fotus_kits", "fortlev_kits"]:
            if categories[kit_type]:
                analysis["coverage_analysis"][kit_type] = self.analyze_product_coverage(
                    categories[kit_type], 
                    kit_fields, 
                    kit_type
                )
        
        # Analisar baterias usando schema de baterias
        if categories["batteries"]:
            analysis["coverage_analysis"]["batteries"] = self.analyze_product_coverage(
                categories["batteries"], 
                battery_fields, 
                "batteries"
            )
        
        # Analisar produtos ODEX (usar schema básico de produtos)
        if categories["odex_products"]:
            # Para ODEX, usar campos básicos do schema de kits
            basic_fields = [f for f in kit_fields if not f.startswith("metadata.neosolar_specs")]
            analysis["coverage_analysis"]["odex_products"] = self.analyze_product_coverage(
                categories["odex_products"], 
                basic_fields, 
                "odex_products"
            )
        
        return analysis
    
    def print_detailed_report(self, analysis: Dict[str, Any]):
        """Imprime relatório detalhado formatado"""
        print("\n" + "="*80)
        print("📊 RELATÓRIO DE COBERTURA DOS SCHEMAS")
        print("="*80)
        
        # Estatísticas gerais do catálogo
        stats = analysis["catalog_stats"]
        print(f"\n📈 ESTATÍSTICAS GERAIS")
        print(f"   • Inventory Items: {stats.get('inventory_items', 0)}")
        print(f"   • Products: {stats.get('products', 0)}")
        print(f"   • Variants: {stats.get('variants', 0)}")
        print(f"   • Bundles: {stats.get('bundles', 0)}")
        
        # Análise por categoria
        coverage_data = analysis["coverage_analysis"]
        
        print(f"\n📋 COBERTURA POR CATEGORIA")
        print("-" * 50)
        
        for category, data in coverage_data.items():
            if data["total_products"] == 0:
                continue
                
            print(f"\n🏷️  {category.upper().replace('_', ' ')}")
            print(f"   Produtos: {data['total_products']}")
            print(f"   Campos do Schema: {data['total_fields']}")
            print(f"   Cobertura Geral: {data['coverage_percentage']:.1f}%")
            
            # Top 10 campos bem preenchidos
            well_covered = data.get("well_covered_fields", [])[:10]
            if well_covered:
                print(f"   ✅ Bem Preenchidos ({len(well_covered)}): {', '.join(well_covered[:5])}...")
            
            # Top 10 campos ausentes
            missing = data.get("missing_fields", [])[:10]
            if missing:
                print(f"   ❌ Frequentemente Ausentes ({len(missing)}): {', '.join(missing[:5])}...")
        
        # Resumo de campos críticos
        print(f"\n🎯 CAMPOS CRÍTICOS AUSENTES")
        print("-" * 50)
        
        critical_missing = {}
        for category, data in coverage_data.items():
            if data["total_products"] == 0:
                continue
            
            # Identificar campos críticos (obrigatórios pelo schema) que estão ausentes
            field_analysis = data.get("field_analysis", {})
            for field, stats in field_analysis.items():
                if stats["percentage"] < 30 and any(keyword in field.lower() for keyword in 
                    ["title", "sku", "price", "description", "handle"]):
                    if field not in critical_missing:
                        critical_missing[field] = []
                    critical_missing[field].append(f"{category}: {stats['percentage']:.1f}%")
        
        for field, categories in critical_missing.items():
            print(f"   ⚠️  {field}: {', '.join(categories)}")
        
        # Recomendações
        print(f"\n💡 RECOMENDAÇÕES")
        print("-" * 50)
        
        total_products = sum(data["total_products"] for data in coverage_data.values())
        avg_coverage = sum(data["coverage_percentage"] * data["total_products"] 
                          for data in coverage_data.values() if data["total_products"] > 0) / total_products if total_products > 0 else 0
        
        print(f"   • Cobertura Média Geral: {avg_coverage:.1f}%")
        
        if avg_coverage < 70:
            print(f"   🔧 AÇÃO NECESSÁRIA: Cobertura abaixo do ideal (70%)")
            print(f"      → Implementar preenchimento automático de campos obrigatórios")
            print(f"      → Melhorar parsing de dados dos distribuidores")
        elif avg_coverage < 85:
            print(f"   📈 BOM: Cobertura adequada, mas há margem para melhoria")
            print(f"      → Focar em campos específicos frequentemente ausentes")
        else:
            print(f"   ✅ EXCELENTE: Cobertura muito boa!")
            
        print(f"   📝 Próximos passos:")
        print(f"      → Expandir de {total_products} para 2.600+ produtos NeoSolar")
        print(f"      → Implementar extração de metadados via Vision AI")
        print(f"      → Configurar Price Rules por região/cliente")

def main():
    analyzer = SchemaCoverageAnalyzer()
    
    try:
        # Gerar análise
        analysis = analyzer.generate_report()
        
        # Imprimir relatório
        analyzer.print_detailed_report(analysis)
        
        # Salvar análise em JSON
        output_file = analyzer.base_path / "schema_coverage_analysis.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Análise salva em: {output_file}")
        print("✅ Análise de cobertura concluída!")
        
    except Exception as e:
        print(f"❌ Erro durante análise: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()