#!/usr/bin/env python3
"""
COMPLETE PIPELINE ORCHESTRATOR
===============================

Executes the full end-to-end pipeline:
1. Extract complete inventory (all 18 categories)
2. Enrich with LLM analysis
3. Validate data quality
4. Generate reports and documentation
5. Prepare for Medusa.js import

Author: YSH Medusa Data Team
Date: 2025-01-14
"""

import json
import subprocess
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import time

class PipelineOrchestrator:
    """Orchestrates the complete data pipeline."""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.results: Dict = {}
        self.start_time = None
        self.errors: List[str] = []
        
    def print_header(self, title: str):
        """Print formatted section header."""
        print("\n" + "=" * 80)
        print(f"  {title}")
        print("=" * 80 + "\n")
    
    def print_step(self, step: str, status: str = ""):
        """Print step information."""
        if status:
            print(f"📍 {step}... {status}")
        else:
            print(f"📍 {step}...")
    
    def run_command(self, command: List[str], step_name: str) -> Dict:
        """Run a command and capture results."""
        self.print_step(step_name, "RUNNING")
        
        start = time.time()
        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                encoding='utf-8',
                cwd=self.base_path
            )
            
            duration = time.time() - start
            
            if result.returncode == 0:
                print(f"  ✅ {step_name} completed in {duration:.1f}s")
                return {
                    'success': True,
                    'duration': duration,
                    'stdout': result.stdout,
                    'stderr': result.stderr
                }
            else:
                print(f"  ❌ {step_name} failed!")
                print(f"  Error: {result.stderr[:500]}")
                self.errors.append(f"{step_name}: {result.stderr[:200]}")
                return {
                    'success': False,
                    'duration': duration,
                    'error': result.stderr
                }
                
        except Exception as e:
            duration = time.time() - start
            print(f"  ❌ Exception in {step_name}: {str(e)}")
            self.errors.append(f"{step_name}: {str(e)}")
            return {
                'success': False,
                'duration': duration,
                'error': str(e)
            }
    
    def step_1_extract_inventory(self) -> bool:
        """Step 1: Extract complete inventory."""
        self.print_header("STEP 1: EXTRACT COMPLETE INVENTORY")
        
        python_exe = self.base_path.parent / ".venv" / "Scripts" / "python.exe"
        
        result = self.run_command(
            [str(python_exe), "extract_COMPLETE_inventory.py"],
            "Complete Inventory Extraction"
        )
        
        self.results['extraction'] = result
        
        if result['success']:
            # Find the generated file
            inventory_dir = self.base_path / "complete-inventory"
            json_files = list(inventory_dir.glob("complete_products_*.json"))
            
            if json_files:
                latest_file = max(json_files, key=lambda x: x.stat().st_mtime)
                self.results['inventory_file'] = str(latest_file)
                
                # Load and count products
                with open(latest_file, 'r', encoding='utf-8') as f:
                    products = json.load(f)
                    self.results['total_products'] = len(products)
                    
                print(f"\n  📊 Extracted {len(products):,} products")
                print(f"  📂 Output: {latest_file.name}")
                return True
        
        return False
    
    def step_2_enrich_data(self) -> bool:
        """Step 2: Enrich data with LLM analysis."""
        self.print_header("STEP 2: ENRICH DATA WITH LLM ANALYSIS")
        
        if 'inventory_file' not in self.results:
            print("  ⚠️  No inventory file found. Skipping enrichment.")
            return False
        
        python_exe = self.base_path.parent / ".venv" / "Scripts" / "python.exe"
        
        # Create enrichment script that uses complete inventory
        enrichment_script = self.base_path / "enrich_complete_inventory.py"
        
        if not enrichment_script.exists():
            print("  📝 Creating enrichment adapter...")
            self.create_enrichment_adapter()
        
        result = self.run_command(
            [str(python_exe), "enrich_complete_inventory.py"],
            "LLM Data Enrichment"
        )
        
        self.results['enrichment'] = result
        
        if result['success']:
            # Find enriched files
            enriched_dir = self.base_path / "enriched-complete"
            if enriched_dir.exists():
                json_files = list(enriched_dir.glob("enriched_products_*.json"))
                if json_files:
                    latest_file = max(json_files, key=lambda x: x.stat().st_mtime)
                    self.results['enriched_file'] = str(latest_file)
                    
                    with open(latest_file, 'r', encoding='utf-8') as f:
                        products = json.load(f)
                        self.results['enriched_count'] = len(products)
                    
                    print(f"\n  📊 Enriched {len(products):,} products")
                    print(f"  📂 Output: {latest_file.name}")
                    return True
        
        return False
    
    def step_3_validate_quality(self) -> bool:
        """Step 3: Validate data quality."""
        self.print_header("STEP 3: VALIDATE DATA QUALITY")
        
        if 'enriched_file' not in self.results:
            print("  ⚠️  No enriched file found. Skipping validation.")
            return False
        
        print("  📊 Running quality checks...")
        
        enriched_file = Path(self.results['enriched_file'])
        with open(enriched_file, 'r', encoding='utf-8') as f:
            products = json.load(f)
        
        # Quality metrics
        total = len(products)
        with_inmetro = sum(1 for p in products if p.get('certifications', {}).get('inmetro'))
        with_warranty = sum(1 for p in products if p.get('warranty', {}).get('product_warranty_years'))
        with_kpis = sum(1 for p in products if p.get('kpis', {}).get('efficiency_pct'))
        high_scores = sum(1 for p in products if p.get('scores', {}).get('overall_score', 0) >= 70)
        
        quality_stats = {
            'total_products': total,
            'inmetro_coverage': (with_inmetro / total) * 100,
            'warranty_coverage': (with_warranty / total) * 100,
            'kpi_coverage': (with_kpis / total) * 100,
            'high_score_pct': (high_scores / total) * 100
        }
        
        self.results['quality'] = quality_stats
        
        print(f"\n  ✅ Quality Validation Complete:")
        print(f"     - INMETRO Coverage: {quality_stats['inmetro_coverage']:.1f}%")
        print(f"     - Warranty Coverage: {quality_stats['warranty_coverage']:.1f}%")
        print(f"     - KPI Coverage: {quality_stats['kpi_coverage']:.1f}%")
        print(f"     - High Scores (≥70): {quality_stats['high_score_pct']:.1f}%")
        
        # Quality check passed if at least some enrichment present
        return quality_stats['warranty_coverage'] > 10
    
    def step_4_generate_reports(self) -> bool:
        """Step 4: Generate final reports."""
        self.print_header("STEP 4: GENERATE FINAL REPORTS")
        
        print("  📄 Generating comprehensive reports...")
        
        # Generate final summary report
        report_path = self.base_path / "PIPELINE_EXECUTION_REPORT.md"
        
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write("# PIPELINE EXECUTION REPORT\n\n")
            f.write(f"**Execution Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            f.write("## Pipeline Summary\n\n")
            f.write(f"- **Total Products Extracted:** {self.results.get('total_products', 0):,}\n")
            f.write(f"- **Products Enriched:** {self.results.get('enriched_count', 0):,}\n")
            f.write(f"- **Execution Time:** {(time.time() - self.start_time):.1f}s\n")
            f.write(f"- **Status:** {'✅ SUCCESS' if not self.errors else '⚠️ WITH WARNINGS'}\n\n")
            
            f.write("## Step Results\n\n")
            for step, result in self.results.items():
                if isinstance(result, dict) and 'success' in result:
                    status = "✅ PASS" if result['success'] else "❌ FAIL"
                    f.write(f"- **{step}:** {status}\n")
            
            if self.results.get('quality'):
                f.write("\n## Quality Metrics\n\n")
                quality = self.results['quality']
                f.write(f"- **INMETRO Coverage:** {quality['inmetro_coverage']:.1f}%\n")
                f.write(f"- **Warranty Coverage:** {quality['warranty_coverage']:.1f}%\n")
                f.write(f"- **KPI Coverage:** {quality['kpi_coverage']:.1f}%\n")
                f.write(f"- **High Scores (≥70):** {quality['high_score_pct']:.1f}%\n")
            
            if self.errors:
                f.write("\n## Warnings/Errors\n\n")
                for error in self.errors:
                    f.write(f"- {error}\n")
            
            f.write("\n## Output Files\n\n")
            if 'inventory_file' in self.results:
                f.write(f"- **Raw Inventory:** `{Path(self.results['inventory_file']).name}`\n")
            if 'enriched_file' in self.results:
                f.write(f"- **Enriched Data:** `{Path(self.results['enriched_file']).name}`\n")
            
            f.write("\n## Next Steps\n\n")
            f.write("1. Review enriched data quality\n")
            f.write("2. Import to Medusa.js using integration guide\n")
            f.write("3. Configure admin dashboard\n")
            f.write("4. Set up automated updates\n")
        
        print(f"  ✅ Report generated: {report_path.name}")
        self.results['report_file'] = str(report_path)
        
        return True
    
    def create_enrichment_adapter(self):
        """Create adapter script for enriching complete inventory."""
        adapter_script = self.base_path / "enrich_complete_inventory.py"
        
        adapter_code = '''#!/usr/bin/env python3
"""
Adapter script to enrich complete inventory using existing enrichment engine.
"""

import sys
import json
from pathlib import Path

# Find the latest complete inventory file
inventory_dir = Path("complete-inventory")
json_files = list(inventory_dir.glob("complete_products_*.json"))

if not json_files:
    print("❌ No complete inventory file found!")
    sys.exit(1)

latest_file = max(json_files, key=lambda x: x.stat().st_mtime)

print(f"📂 Loading: {latest_file.name}")

# Load complete products
with open(latest_file, 'r', encoding='utf-8') as f:
    products = json.load(f)

print(f"📊 Loaded {len(products):,} products")

# Import and run enrichment engine
from enrich_schemas_with_llm import SchemaEnricher

print("🔄 Starting enrichment...")

enricher = SchemaEnricher(input_file=str(latest_file))
enricher.output_dir = "enriched-complete"

# Run enrichment
enricher.enrich_all()

print("✅ Enrichment complete!")
'''
        
        with open(adapter_script, 'w', encoding='utf-8') as f:
            f.write(adapter_code)
        
        print(f"  ✅ Created: {adapter_script.name}")
    
    def run_pipeline(self) -> bool:
        """Execute the complete pipeline."""
        self.start_time = time.time()
        
        self.print_header("COMPLETE PIPELINE EXECUTION")
        print(f"  Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"  Working Directory: {self.base_path}")
        
        # Execute steps
        steps = [
            ("Extract Inventory", self.step_1_extract_inventory),
            ("Enrich Data", self.step_2_enrich_data),
            ("Validate Quality", self.step_3_validate_quality),
            ("Generate Reports", self.step_4_generate_reports)
        ]
        
        all_success = True
        for step_name, step_func in steps:
            try:
                success = step_func()
                if not success:
                    print(f"\n  ⚠️  {step_name} completed with warnings")
                    all_success = False
            except Exception as e:
                print(f"\n  ❌ Exception in {step_name}: {str(e)}")
                self.errors.append(f"{step_name} exception: {str(e)}")
                all_success = False
        
        # Final summary
        duration = time.time() - self.start_time
        
        self.print_header("PIPELINE EXECUTION SUMMARY")
        print(f"  Total Duration: {duration:.1f}s ({duration/60:.1f} minutes)")
        print(f"  Products Extracted: {self.results.get('total_products', 0):,}")
        print(f"  Products Enriched: {self.results.get('enriched_count', 0):,}")
        
        if self.errors:
            print(f"\n  ⚠️  Warnings/Errors: {len(self.errors)}")
            for error in self.errors[:5]:
                print(f"     - {error[:80]}")
        
        if all_success:
            print("\n  ✅ PIPELINE COMPLETED SUCCESSFULLY!")
        else:
            print("\n  ⚠️  PIPELINE COMPLETED WITH WARNINGS")
        
        print(f"\n  📄 Full report: {self.results.get('report_file', 'N/A')}")
        
        return all_success


def main():
    """Main execution."""
    orchestrator = PipelineOrchestrator()
    
    try:
        success = orchestrator.run_pipeline()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Pipeline interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Fatal error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
