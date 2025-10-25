"""
Unified Vision AI Pipeline with Gemma3
Process all distributor images and generate enhanced schemas
"""

import json
import requests
import base64
from pathlib import Path
from typing import Dict, List, Optional
import time
from datetime import datetime


class VisionAIProcessor:
    """Process product images with Gemma3 Vision AI."""
    
    def __init__(self, ollama_url: str = "http://localhost:11434"):
        self.ollama_url = ollama_url
        self.model = "gemma3:12b-instruct-q4_K_M"
        self.processed = 0
        self.failed = 0
        self.checkpoint_interval = 10
    
    def encode_image(self, image_path: Path) -> Optional[str]:
        """Encode image to base64."""
        try:
            with open(image_path, 'rb') as f:
                return base64.b64encode(f.read()).decode('utf-8')
        except Exception as e:
            print(f"      ❌ Image encoding failed: {e}")
            return None
    
    def analyze_kit_image(self, image_base64: str, kit_info: Dict) -> Optional[Dict]:
        """Analyze kit image with Gemma3 Vision."""
        
        prompt = f"""Analyze this solar energy kit image and provide detailed information.

Kit Context:
- Title: {kit_info.get('kit_title', 'Unknown')}
- SKU: {kit_info.get('kit_sku', 'Unknown')}
- Distributor: {kit_info.get('distributor', 'Unknown')}

Please analyze and provide:

1. **Visual Components**: What solar components are visible? (panels, inverters, batteries, mounting hardware)

2. **Quality Assessment**: 
   - Image quality (excellent/good/fair/poor)
   - Component visibility
   - Professional presentation

3. **Technical Details**:
   - Panel characteristics (if visible: color, frame, connectors)
   - Inverter/controller details (if visible: brand, model, display)
   - Battery specifications (if visible: type, capacity indicators)
   - Mounting structure details

4. **Marketing Attributes**:
   - Key visual selling points
   - Professional photography quality
   - Completeness of kit presentation

5. **SEO-Optimized Description** (2-3 sentences):
   Write a compelling product description focusing on visual aspects

6. **Visual Tags** (5-10):
   Generate tags based on what you see (colors, component types, configurations)

Format your response as JSON:
{{
  "components_visible": ["panel", "inverter", "battery", "structure"],
  "image_quality": "excellent/good/fair/poor",
  "quality_score": 0-10,
  "technical_details": {{
    "panel_type": "monocrystalline/polycrystalline/thin-film",
    "panel_color": "black/blue/silver",
    "frame_color": "black/silver/white",
    "inverter_visible": true/false,
    "battery_visible": true/false,
    "mounting_visible": true/false
  }},
  "marketing_highlights": ["highlight1", "highlight2", "highlight3"],
  "visual_description": "SEO-optimized description text",
  "visual_tags": ["tag1", "tag2", "tag3"],
  "completeness": "complete/partial/minimal"
}}
"""
        
        try:
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "images": [image_base64],
                    "stream": False,
                    "options": {
                        "temperature": 0.7,
                        "num_predict": 800
                    }
                },
                timeout=120
            )
            
            if response.status_code == 200:
                result = response.json()
                response_text = result.get('response', '')
                
                # Try to extract JSON from response
                try:
                    # Find JSON block
                    json_start = response_text.find('{')
                    json_end = response_text.rfind('}') + 1
                    if json_start >= 0 and json_end > json_start:
                        json_str = response_text[json_start:json_end]
                        vision_data = json.loads(json_str)
                        return vision_data
                    else:
                        print(f"      ⚠️  No JSON found in response")
                        return {"raw_response": response_text}
                except json.JSONDecodeError as e:
                    print(f"      ⚠️  JSON parsing error: {e}")
                    return {"raw_response": response_text}
            else:
                print(f"      ❌ API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"      ❌ Vision AI error: {e}")
            return None
    
    def process_distributor(self, 
                          base_path: Path,
                          distributor_name: str,
                          mapping_file: str = "image_mapping_vision.json",
                          checkpoint_file: str = "vision_checkpoint.json") -> Dict:
        """Process all images for one distributor."""
        
        print(f"\n{'='*80}")
        print(f"🔍 Processing {distributor_name} with Vision AI")
        print(f"{'='*80}")
        
        # Load mapping
        mapping_path = base_path / mapping_file
        if not mapping_path.exists():
            print(f"❌ Mapping file not found: {mapping_path}")
            return {}
        
        with open(mapping_path, 'r', encoding='utf-8') as f:
            mapping_data = json.load(f)
        
        kits_with_images = [k for k in mapping_data['mapping'] if k['image_exists']]
        
        print(f"✓ Total kits: {mapping_data['total_kits']}")
        print(f"✓ Kits with images: {len(kits_with_images)}")
        
        # Check for checkpoint
        checkpoint_path = base_path / checkpoint_file
        start_idx = 0
        vision_results = []
        
        if checkpoint_path.exists():
            with open(checkpoint_path, 'r', encoding='utf-8') as f:
                checkpoint = json.load(f)
                start_idx = checkpoint.get('last_processed_index', 0)
                vision_results = checkpoint.get('results', [])
            print(f"📍 Resuming from checkpoint: kit {start_idx + 1}")
        
        print(f"🔄 Processing images with Gemma3...\n")
        
        # Process each kit
        for i, kit in enumerate(kits_with_images[start_idx:], start=start_idx):
            print(f"   [{i+1}/{len(kits_with_images)}] {kit['kit_title'][:60]}...")
            
            image_path = base_path / kit['image_path']
            
            # Encode image
            image_b64 = self.encode_image(image_path)
            if not image_b64:
                self.failed += 1
                continue
            
            # Analyze with Vision AI
            vision_data = self.analyze_kit_image(image_b64, {
                **kit,
                "distributor": distributor_name
            })
            
            if vision_data:
                result = {
                    **kit,
                    "vision_analysis": vision_data,
                    "processed_at": datetime.now().isoformat(),
                    "model": self.model
                }
                vision_results.append(result)
                self.processed += 1
                print(f"      ✓ Quality: {vision_data.get('image_quality', 'N/A')}")
                print(f"      ✓ Score: {vision_data.get('quality_score', 'N/A')}/10")
            else:
                self.failed += 1
            
            # Checkpoint every N kits
            if (i + 1) % self.checkpoint_interval == 0:
                checkpoint = {
                    "last_processed_index": i + 1,
                    "results": vision_results,
                    "processed": self.processed,
                    "failed": self.failed,
                    "timestamp": datetime.now().isoformat()
                }
                with open(checkpoint_path, 'w', encoding='utf-8') as f:
                    json.dump(checkpoint, f, ensure_ascii=False, indent=2)
                print(f"      💾 Checkpoint saved at kit {i+1}")
            
            # Rate limiting
            time.sleep(0.5)
        
        # Save final results
        output_file = base_path / f"{distributor_name.lower()}-vision-enhanced.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(vision_results, f, ensure_ascii=False, indent=2)
        
        print(f"\n✓ Processing complete!")
        print(f"   • Processed: {self.processed}")
        print(f"   • Failed: {self.failed}")
        print(f"💾 Saved: {output_file}")
        
        # Remove checkpoint
        if checkpoint_path.exists():
            checkpoint_path.unlink()
        
        return {
            "distributor": distributor_name,
            "total_kits": len(kits_with_images),
            "processed": self.processed,
            "failed": self.failed,
            "output_file": str(output_file)
        }


def main():
    """Main execution."""
    print("\n" + "="*80)
    print("🤖 UNIFIED VISION AI PIPELINE - GEMMA3")
    print("="*80)
    print(f"🕐 Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    processor = VisionAIProcessor()
    base_dir = Path(__file__).parent
    
    stats = []
    
    # Check Ollama connection
    try:
        response = requests.get(f"{processor.ollama_url}/api/version", timeout=5)
        if response.status_code == 200:
            print(f"✓ Connected to Ollama")
            print(f"✓ Using model: {processor.model}")
        else:
            print(f"❌ Ollama not responding properly")
            return
    except Exception as e:
        print(f"❌ Cannot connect to Ollama: {e}")
        print(f"   Please start Ollama first: ollama serve")
        return
    
    # Process each distributor
    distributors = [
        ("FortLev", "fortlev"),
        ("NeoSolar", "neosolar"),
        # FOTUS has no images yet
    ]
    
    for dist_name, dist_folder in distributors:
        dist_path = base_dir / dist_folder
        if dist_path.exists():
            # Reset counters
            processor.processed = 0
            processor.failed = 0
            
            result = processor.process_distributor(dist_path, dist_name)
            stats.append(result)
        else:
            print(f"⚠️  {dist_name} directory not found: {dist_path}")
    
    # Summary
    print("\n" + "="*80)
    print("📊 VISION AI SUMMARY")
    print("="*80)
    
    total_kits = sum(s.get('total_kits', 0) for s in stats)
    total_processed = sum(s.get('processed', 0) for s in stats)
    total_failed = sum(s.get('failed', 0) for s in stats)
    
    for stat in stats:
        success_rate = (stat['processed'] / stat['total_kits'] * 100) if stat['total_kits'] > 0 else 0
        print(f"\n{stat['distributor']}:")
        print(f"   • Total kits: {stat['total_kits']}")
        print(f"   • Processed: {stat['processed']}")
        print(f"   • Failed: {stat['failed']}")
        print(f"   • Success: {success_rate:.1f}%")
        print(f"   • Output: {stat['output_file']}")
    
    print(f"\n{'='*80}")
    print(f"TOTALS:")
    print(f"   • Total kits with images: {total_kits}")
    print(f"   • Successfully processed: {total_processed}")
    print(f"   • Failed: {total_failed}")
    success_pct = (total_processed / total_kits * 100) if total_kits > 0 else 0
    print(f"   • Success rate: {success_pct:.1f}%")
    print(f"{'='*80}\n")
    
    print(f"🕐 Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("✅ Vision AI processing complete!")
    
    print("\n🎯 Next steps:")
    print("   1. Review vision-enhanced JSON files")
    print("   2. Merge with normalized kit data")
    print("   3. Generate final Medusa.js schemas with visual attributes")
    print("   4. Update SKUs with vision-derived tags")


if __name__ == "__main__":
    main()
