#!/usr/bin/env python3
"""
Batch processor with progress tracking and error recovery.
Optimized for processing large kit datasets with retry logic.
"""

import json
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime
import sys

# Import main processor
from vision_processor import KitVisionProcessor, VisionModelConfig


class ProgressTracker:
    """Track processing progress and save checkpoints."""
    
    def __init__(self, checkpoint_file: Path):
        self.checkpoint_file = checkpoint_file
        self.processed_ids = set()
        self.failed_ids = set()
        self.start_time = time.time()
        self.load_checkpoint()
    
    def load_checkpoint(self):
        """Load previous progress if exists."""
        if self.checkpoint_file.exists():
            with open(self.checkpoint_file, 'r') as f:
                data = json.load(f)
                self.processed_ids = set(data.get('processed', []))
                self.failed_ids = set(data.get('failed', []))
                print(f"Resuming: {len(self.processed_ids)} already processed")
    
    def save_checkpoint(self):
        """Save current progress."""
        with open(self.checkpoint_file, 'w') as f:
            json.dump({
                'processed': list(self.processed_ids),
                'failed': list(self.failed_ids),
                'last_update': datetime.now().isoformat()
            }, f, indent=2)
    
    def mark_processed(self, kit_id: str):
        """Mark kit as successfully processed."""
        self.processed_ids.add(kit_id)
        self.save_checkpoint()
    
    def mark_failed(self, kit_id: str):
        """Mark kit as failed."""
        self.failed_ids.add(kit_id)
        self.save_checkpoint()
    
    def is_processed(self, kit_id: str) -> bool:
        """Check if kit already processed."""
        return kit_id in self.processed_ids
    
    def get_stats(self, total: int) -> Dict[str, Any]:
        """Get current statistics."""
        processed = len(self.processed_ids)
        failed = len(self.failed_ids)
        remaining = total - processed - failed
        elapsed = time.time() - self.start_time
        
        if processed > 0:
            avg_time = elapsed / processed
            eta_seconds = avg_time * remaining
        else:
            eta_seconds = 0
        
        return {
            'total': total,
            'processed': processed,
            'failed': failed,
            'remaining': remaining,
            'elapsed_seconds': elapsed,
            'eta_seconds': eta_seconds,
            'progress_pct': (processed / total * 100) if total > 0 else 0
        }


class BatchProcessor:
    """Batch processor with error handling and retry logic."""
    
    def __init__(
        self,
        processor: KitVisionProcessor,
        tracker: ProgressTracker,
        max_retries: int = 2,
        retry_delay: int = 5
    ):
        self.processor = processor
        self.tracker = tracker
        self.max_retries = max_retries
        self.retry_delay = retry_delay
    
    def process_kit_with_retry(self, kit: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Process kit with retry logic."""
        kit_id = kit['id']
        
        for attempt in range(self.max_retries + 1):
            try:
                enhanced = self.processor.process_kit(kit)
                return enhanced
            
            except Exception as e:
                if attempt < self.max_retries:
                    print(f"  Retry {attempt + 1}/{self.max_retries} after error: {e}")
                    time.sleep(self.retry_delay)
                else:
                    print(f"  Failed after {self.max_retries + 1} attempts: {e}")
                    return None
        
        return None
    
    def process_batch(
        self,
        kits: List[Dict[str, Any]],
        output_file: Path,
        save_interval: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Process kits in batch with periodic saves.
        
        Args:
            kits: List of kits to process
            output_file: Where to save results
            save_interval: Save every N kits
        
        Returns:
            List of enhanced kits
        """
        enhanced_kits = []
        total = len(kits)
        
        # Load existing results if resuming
        if output_file.exists():
            with open(output_file, 'r', encoding='utf-8') as f:
                enhanced_kits = json.load(f)
            print(f"Loaded {len(enhanced_kits)} existing results")
        
        for idx, kit in enumerate(kits, 1):
            kit_id = kit['id']
            
            # Skip if already processed
            if self.tracker.is_processed(kit_id):
                # Find in enhanced_kits
                existing = next((k for k in enhanced_kits if k['id'] == kit_id), None)
                if existing:
                    continue
            
            # Display progress
            stats = self.tracker.get_stats(total)
            eta_min = stats['eta_seconds'] / 60
            print(f"\n[{idx}/{total}] {kit_id}")
            print(f"Progress: {stats['progress_pct']:.1f}% | ETA: {eta_min:.1f} min")
            
            # Process kit
            enhanced = self.process_kit_with_retry(kit)
            
            if enhanced:
                enhanced_kits.append(enhanced)
                self.tracker.mark_processed(kit_id)
                print(f"  ✓ Success")
            else:
                # Keep original on failure
                enhanced_kits.append(kit)
                self.tracker.mark_failed(kit_id)
                print(f"  ✗ Failed (kept original)")
            
            # Periodic save
            if idx % save_interval == 0:
                self._save_results(enhanced_kits, output_file)
                print(f"  💾 Saved checkpoint")
        
        # Final save
        self._save_results(enhanced_kits, output_file)
        
        return enhanced_kits
    
    def _save_results(self, kits: List[Dict[str, Any]], output_file: Path):
        """Save results to file."""
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(kits, f, indent=2, ensure_ascii=False)


def main():
    """Main batch processing execution."""
    print("=== YSH Batch Vision Processor ===\n")
    
    # Paths
    base_dir = Path(__file__).parent
    input_file = base_dir / "fortlev-kits.json"
    output_file = base_dir / "fortlev-kits-enhanced.json"
    checkpoint_file = base_dir / ".progress.json"
    
    if not input_file.exists():
        print(f"Error: {input_file} not found")
        sys.exit(1)
    
    # Load kits
    print("Loading kit data...")
    with open(input_file, 'r', encoding='utf-8') as f:
        kits = json.load(f)
    print(f"Loaded {len(kits)} kits\n")
    
    # Initialize components
    processor = KitVisionProcessor()
    tracker = ProgressTracker(checkpoint_file)
    batch_processor = BatchProcessor(
        processor=processor,
        tracker=tracker,
        max_retries=2,
        retry_delay=5
    )
    
    # Process
    print("Starting batch processing...")
    print(f"Results will be saved to: {output_file}")
    print(f"Progress tracked in: {checkpoint_file}")
    print(f"Image cache: {VisionModelConfig.IMAGE_CACHE_DIR}\n")
    
    try:
        enhanced_kits = batch_processor.process_batch(
            kits=kits,
            output_file=output_file,
            save_interval=10
        )
        
        # Final statistics
        stats = tracker.get_stats(len(kits))
        print("\n=== Processing Complete ===")
        print(f"Total Kits: {stats['total']}")
        print(f"Successfully Processed: {stats['processed']}")
        print(f"Failed: {stats['failed']}")
        print(f"Total Time: {stats['elapsed_seconds'] / 60:.1f} minutes")
        print(f"\n✓ Results saved to: {output_file}")
        
        if stats['failed'] > 0:
            print(f"\n⚠ {stats['failed']} kits failed processing")
            print(f"Failed IDs: {list(tracker.failed_ids)[:10]}...")
        
        # Clean up checkpoint on success
        if stats['failed'] == 0:
            checkpoint_file.unlink(missing_ok=True)
            print("\n✓ Checkpoint cleaned up")
    
    except KeyboardInterrupt:
        print("\n\n⚠ Processing interrupted by user")
        print(f"Progress saved to: {checkpoint_file}")
        print("Run again to resume from checkpoint")
        sys.exit(1)
    
    except Exception as e:
        print(f"\n\n✗ Fatal error: {e}")
        print(f"Progress saved to: {checkpoint_file}")
        print("Check error and run again to resume")
        sys.exit(1)


if __name__ == "__main__":
    main()
