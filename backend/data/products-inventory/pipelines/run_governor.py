"""
Integration script to run SKU Governor as part of the data processing pipeline.

This script:
1. Discovers all raw JSON files from distributors
2. Processes each file through SKU Governor
3. Aggregates validation reports
4. Outputs normalized data ready for Medusa import

Usage:
    python run-governor-pipeline.py [--distributors neosolar,fortlev] [--categories panel,inverter]
"""

import json
import subprocess
import sys
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import argparse
from datetime import datetime


@dataclass
class PipelineResult:
    """Results from processing a single distributor/category combination."""
    distributor: str
    category: str
    input_file: str
    output_file: str
    report_file: str
    total_processed: int
    total_valid: int
    total_invalid: int
    total_warnings: int
    success: bool
    error_message: Optional[str] = None


class GovernorPipeline:
    """Pipeline orchestrator for SKU Governor processing."""
    
    # Mapping of category names to file patterns
    CATEGORY_PATTERNS = {
        "panel": ["panels", "paineis", "painel"],
        "inverter": ["inverters", "inversores", "inversor"],
        "battery": ["batteries", "baterias", "bateria"],
        "structure": ["structures", "estruturas", "estrutura"],
        "cable": ["cables", "cabos", "cabo"],
        "connector": ["connectors", "conectores", "conector"]
    }
    
    def __init__(
        self,
        base_dir: Path,
        output_dir: Path,
        distributors: Optional[List[str]] = None,
        categories: Optional[List[str]] = None
    ):
        self.base_dir = base_dir
        self.output_dir = output_dir
        self.distributors_dir = base_dir / "distributors"
        self.governor_script = base_dir / "sku-governor.py"
        
        # Filter distributors
        if distributors:
            self.distributors = distributors
        else:
            # Auto-discover distributors
            self.distributors = [
                d.name for d in self.distributors_dir.iterdir() 
                if d.is_dir() and not d.name.startswith(".")
            ]
        
        # Filter categories
        self.categories = categories or list(self.CATEGORY_PATTERNS.keys())
        
        # Results storage
        self.results: List[PipelineResult] = []
    
    def discover_files(self) -> List[tuple]:
        """
        Discover all distributor JSON files to process.
        
        Returns:
            List of tuples (distributor, category, file_path)
        """
        files_to_process = []
        
        for distributor in self.distributors:
            dist_dir = self.distributors_dir / distributor
            
            if not dist_dir.exists():
                print(f"⚠️  Distributor directory not found: {dist_dir}")
                continue
            
            # Find JSON files
            for json_file in dist_dir.glob("*.json"):
                # Match file to category
                filename_lower = json_file.stem.lower()
                
                for category, patterns in self.CATEGORY_PATTERNS.items():
                    if category not in self.categories:
                        continue
                    
                    if any(pattern in filename_lower for pattern in patterns):
                        files_to_process.append((distributor, category, json_file))
                        break
        
        return files_to_process
    
    def process_file(
        self,
        distributor: str,
        category: str,
        input_file: Path
    ) -> PipelineResult:
        """
        Process a single file through SKU Governor.
        
        Args:
            distributor: Distributor name
            category: Product category
            input_file: Path to input JSON file
        
        Returns:
            PipelineResult with processing outcome
        """
        print(f"\n📦 Processing: {distributor} / {category}")
        print(f"   Input: {input_file.name}")
        
        # Create output directory
        output_dir = self.output_dir / distributor
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Run SKU Governor
        try:
            cmd = [
                sys.executable,
                str(self.governor_script),
                str(input_file),
                "--category", category,
                "--distributor", distributor,
                "--output-dir", str(output_dir)
            ]
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=False
            )
            
            # Expected output files
            output_file = output_dir / f"{distributor}-{category}-normalized.json"
            report_file = output_dir / f"{distributor}-{category}-normalized-report.json"
            
            # Parse report
            if report_file.exists():
                with open(report_file, 'r', encoding='utf-8') as f:
                    report = json.load(f)
                
                summary = report["summary"]
                
                return PipelineResult(
                    distributor=distributor,
                    category=category,
                    input_file=str(input_file),
                    output_file=str(output_file),
                    report_file=str(report_file),
                    total_processed=summary["total_processed"],
                    total_valid=summary["total_valid"],
                    total_invalid=summary["total_invalid"],
                    total_warnings=summary["total_warnings"],
                    success=(result.returncode == 0),
                    error_message=result.stderr if result.returncode != 0 else None
                )
            else:
                return PipelineResult(
                    distributor=distributor,
                    category=category,
                    input_file=str(input_file),
                    output_file="",
                    report_file="",
                    total_processed=0,
                    total_valid=0,
                    total_invalid=0,
                    total_warnings=0,
                    success=False,
                    error_message=f"Report file not created. stderr: {result.stderr}"
                )
        
        except Exception as e:
            return PipelineResult(
                distributor=distributor,
                category=category,
                input_file=str(input_file),
                output_file="",
                report_file="",
                total_processed=0,
                total_valid=0,
                total_invalid=0,
                total_warnings=0,
                success=False,
                error_message=str(e)
            )
    
    def run(self) -> bool:
        """
        Run the complete pipeline.
        
        Returns:
            True if all files processed successfully, False otherwise
        """
        print("=" * 80)
        print("SKU GOVERNOR PIPELINE")
        print("=" * 80)
        print(f"Base Directory: {self.base_dir}")
        print(f"Output Directory: {self.output_dir}")
        print(f"Distributors: {', '.join(self.distributors)}")
        print(f"Categories: {', '.join(self.categories)}")
        print()
        
        # Discover files
        files_to_process = self.discover_files()
        
        if not files_to_process:
            print("❌ No files found to process!")
            return False
        
        print(f"📋 Found {len(files_to_process)} files to process")
        print()
        
        # Process each file
        for distributor, category, input_file in files_to_process:
            result = self.process_file(distributor, category, input_file)
            self.results.append(result)
            
            # Print immediate result
            if result.success:
                print(f"   ✅ Success: {result.total_valid}/{result.total_processed} valid")
                if result.total_warnings > 0:
                    print(f"   ⚠️  Warnings: {result.total_warnings}")
            else:
                print(f"   ❌ Failed: {result.error_message}")
        
        # Print summary
        self._print_summary()
        
        # Save aggregated report
        self._save_pipeline_report()
        
        # Return overall success
        return all(r.success for r in self.results)
    
    def _print_summary(self):
        """Print pipeline summary statistics."""
        print("\n" + "=" * 80)
        print("PIPELINE SUMMARY")
        print("=" * 80)
        
        total_processed = sum(r.total_processed for r in self.results)
        total_valid = sum(r.total_valid for r in self.results)
        total_invalid = sum(r.total_invalid for r in self.results)
        total_warnings = sum(r.total_warnings for r in self.results)
        
        successful_runs = sum(1 for r in self.results if r.success)
        failed_runs = len(self.results) - successful_runs
        
        print(f"Files Processed: {len(self.results)}")
        print(f"  ✅ Successful: {successful_runs}")
        print(f"  ❌ Failed: {failed_runs}")
        print()
        print(f"Products Processed: {total_processed}")
        print(f"  ✅ Valid: {total_valid} ({total_valid/total_processed*100:.1f}%)")
        print(f"  ❌ Invalid: {total_invalid} ({total_invalid/total_processed*100:.1f}%)")
        print(f"  ⚠️  Warnings: {total_warnings}")
        
        # Breakdown by distributor
        print("\nBy Distributor:")
        for distributor in self.distributors:
            dist_results = [r for r in self.results if r.distributor == distributor]
            if dist_results:
                dist_valid = sum(r.total_valid for r in dist_results)
                dist_total = sum(r.total_processed for r in dist_results)
                print(f"  {distributor}: {dist_valid}/{dist_total} valid ({dist_valid/dist_total*100:.1f}%)")
        
        # Breakdown by category
        print("\nBy Category:")
        for category in self.categories:
            cat_results = [r for r in self.results if r.category == category]
            if cat_results:
                cat_valid = sum(r.total_valid for r in cat_results)
                cat_total = sum(r.total_processed for r in cat_results)
                print(f"  {category}: {cat_valid}/{cat_total} valid ({cat_valid/cat_total*100:.1f}%)")
    
    def _save_pipeline_report(self):
        """Save aggregated pipeline report to JSON."""
        timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
        report_file = self.output_dir / f"pipeline-report-{timestamp}.json"
        
        report = {
            "timestamp": timestamp,
            "distributors": self.distributors,
            "categories": self.categories,
            "results": [asdict(r) for r in self.results],
            "summary": {
                "total_files": len(self.results),
                "successful_files": sum(1 for r in self.results if r.success),
                "failed_files": sum(1 for r in self.results if not r.success),
                "total_products": sum(r.total_processed for r in self.results),
                "total_valid": sum(r.total_valid for r in self.results),
                "total_invalid": sum(r.total_invalid for r in self.results),
                "total_warnings": sum(r.total_warnings for r in self.results)
            }
        }
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        print(f"\n📊 Pipeline report saved: {report_file}")


def main():
    parser = argparse.ArgumentParser(
        description="Run SKU Governor pipeline for all distributors and categories"
    )
    parser.add_argument(
        "--base-dir",
        type=Path,
        default=Path(__file__).parent,
        help="Base directory containing distributors folder (default: script directory)"
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).parent / "normalized",
        help="Output directory for normalized data (default: ./normalized)"
    )
    parser.add_argument(
        "--distributors",
        type=str,
        help="Comma-separated list of distributors to process (default: all)"
    )
    parser.add_argument(
        "--categories",
        type=str,
        help="Comma-separated list of categories to process (default: all)"
    )
    
    args = parser.parse_args()
    
    # Parse comma-separated lists
    distributors = args.distributors.split(",") if args.distributors else None
    categories = args.categories.split(",") if args.categories else None
    
    # Run pipeline
    pipeline = GovernorPipeline(
        base_dir=args.base_dir,
        output_dir=args.output_dir,
        distributors=distributors,
        categories=categories
    )
    
    success = pipeline.run()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
