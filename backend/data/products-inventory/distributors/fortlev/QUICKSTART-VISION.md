# YSH Vision AI Quick Start

## 🚀 Fast Setup Guide

### Step 1: Install Python Dependencies

```bash
cd products-inventory/distributors/fortlev
pip install -r requirements.txt
```

### Step 2: Deploy Vision Models

#### Option A: Quick Test (CPU Only)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh  # Linux/Mac
# or download from https://ollama.com/download for Windows

# Pull Gemma3
ollama pull gemma3:latest

# Start Ollama (usually runs automatically)
ollama serve
```

#### Option B: Full Setup (GPU Recommended)

Follow detailed instructions in `VISION-SETUP.md`

### Step 3: Test Connection

```bash
python test_vision.py
```

Expected output:

```
✓ Gemma3 (Ollama) is running
✓ GPT OSS 20B is running
✓ Image download working
✓ All systems ready!
```

### Step 4: Process First Kit (Test)

```python
from vision_processor import KitVisionProcessor
import json

processor = KitVisionProcessor()

# Load kits
with open('fortlev-kits.json') as f:
    kits = json.load(f)

# Process one kit
result = processor.process_kit(kits[0])

# View results
print(json.dumps(result['components']['panel']['vision_analysis'], indent=2))
```

### Step 5: Process All Kits

```bash
python vision_processor.py
```

This will:

- Download 434 images (217 kits × 2 components)
- Process with Gemma3 vision analysis
- Extract text with GPT OSS OCR
- Generate `fortlev-kits-enhanced.json`

**Time estimate**: ~36-87 minutes (depends on hardware)

### Step 6: Merge Results

```bash
python merge_vision_data.py
```

Generates:

- `fortlev-kits-final.json` - Updated kit data
- `vision-stats.json` - Processing statistics

## 📊 Expected Results

### Before Vision Processing

```
Unknown panel manufacturers: 73
Unknown inverter manufacturers: 165
Total unknown: 238 (54.8%)
```

### After Vision Processing

```
✓ Panel manufacturers identified: ~65-70
✓ Inverter manufacturers identified: ~150-160
✓ Models extracted: ~200+
✓ Power ratings validated: ~210+
```

## 🔧 Troubleshooting

### Gemma3 Not Found

```bash
# Check if running
curl http://localhost:11434/api/tags

# Restart
ollama serve
```

### Memory Error

Reduce image size in `vision_processor.py`:

```python
max_size = (640, 640)  # Line 110
```

### Slow Processing

Enable parallel processing (advanced):

```python
# In vision_processor.py, modify process_all_kits()
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=4) as executor:
    futures = [executor.submit(self.process_kit, kit) for kit in kits]
    enhanced_kits = [f.result() for f in futures]
```

## 📝 Workflow Summary

```
1. fortlev-kits.json (original)
   ↓
2. vision_processor.py → fortlev-kits-enhanced.json (with vision_analysis)
   ↓
3. merge_vision_data.py → fortlev-kits-final.json (merged)
```

## 🎯 Next Steps

1. **Validate Results**: Review `vision-stats.json`
2. **Manual Fixes**: Update remaining "Unknown" entries
3. **Medusa Import**: Load into vector store
4. **RAG Integration**: Enable semantic search

## 📚 Documentation

- `VISION-SETUP.md` - Complete setup guide
- `README.md` - FortLev inventory overview
- Test script: `test_vision.py`

## 🆘 Support

If tests fail, check:

1. Models are running: `ollama list`
2. Network access to S3: `curl [image-url]`
3. Python version: `python --version` (3.8+ required)

---

**Ready to start?** Run `python test_vision.py` now!
