# 🚀 Quick Start - YSH Data Pipeline

Complete real-time Brazilian energy data processing system.

## ⚡ Fast Setup (5 minutes)

### 1. Install Python Dependencies

```powershell
# Install all requirements
pip install -r requirements.txt

# Install Playwright browsers (for Crawlee)
playwright install chromium
```

### 2. Deploy Infrastructure (Optional)

```powershell
# Navigate to infrastructure
cd infrastructure

# Deploy with OpenTofu
tofu init
tofu apply

# Wait for containers to start (~2 minutes)
```

### 3. Initialize Ollama Models

```powershell
# Pull required model
docker exec -it ysh-ollama-service ollama pull llama3.2

# Verify model
docker exec -it ysh-ollama-service ollama list
```

### 4. Test Components

```powershell
# Test ANEEL data fetcher
python aneel_data_fetcher.py

# Test scraper
python crawlee_scraper.py

# Test realtime processor
python realtime_processor.py

# Test PDF extractor
python pdf_latex_extractor.py

# Test Ollama integration
python enhanced_ollama.py
```

### 5. Run Full Pipeline

```powershell
# Execute integrated pipeline
python integrated_data_pipeline.py

# Check output
ls pipeline_output/
```

## 📋 Component Overview

| Component | File | Purpose |
|-----------|------|---------|
| ANEEL Fetcher | `aneel_data_fetcher.py` | Fetch data from ANEEL APIs |
| Utility Scraper | `crawlee_scraper.py` | Scrape utility portals |
| Realtime Processor | `realtime_processor.py` | Real-time AI processing |
| PDF Extractor | `pdf_latex_extractor.py` | Extract formulas from PDFs |
| Ollama Integration | `enhanced_ollama.py` | Vector search & enrichment |
| Infrastructure | `infrastructure/main.tf` | Deploy services |
| Orchestrator | `integrated_data_pipeline.py` | Full pipeline |

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
# OpenAI (optional)
OPENAI_API_KEY=sk-your-key-here

# Services (if deployed)
REDIS_URL=redis://localhost:6379
POSTGRES_URL=postgresql://ysh_user:password@localhost:5432/ysh_pipeline
OLLAMA_URL=http://localhost:11434
QDRANT_URL=http://localhost:6333

# ANEEL API
ANEEL_API_BASE=https://dadosabertos-aneel.opendata.arcgis.com
```

## 📊 Usage Examples

### Fetch ANEEL Data

```python
from aneel_data_fetcher import ANEELDataFetcher

async def main():
    fetcher = ANEELDataFetcher()
    data = await fetcher.fetch_all_data()
    print(f"Fetched {len(data['datasets'])} datasets")
```

### Scrape Utilities

```python
from crawlee_scraper import UtilityPortalScraper

async def main():
    scraper = UtilityPortalScraper()
    results = await scraper.scrape_all_utilities()
    print(f"Scraped {len(results)} portals")
```

### Semantic Search

```python
from enhanced_ollama import EnhancedOllamaIntegration

async def main():
    ollama = EnhancedOllamaIntegration()
    
    # Index documents
    docs = [{'id': '1', 'title': 'Inversor 5kW', 'description': '...'}]
    await ollama.index_documents(docs)
    
    # Search
    results = await ollama.search_similar("inversor eficiente", top_k=5)
    for result in results:
        print(f"Match: {result['text']} ({result['similarity']:.3f})")
```

### Process PDFs

```python
from pdf_latex_extractor import IntegratedPDFProcessor

async def main():
    processor = IntegratedPDFProcessor()
    
    # Process single PDF
    result = await processor.process_pdf(Path("standard.pdf"))
    print(f"Extracted {len(result.formulas)} formulas")
```

## 🧪 Testing

```powershell
# Run all tests
pytest

# Run specific test
pytest test_aneel_fetcher.py

# Run with coverage
pytest --cov=. --cov-report=html
```

## 📈 Monitoring

Access dashboards:

- **Grafana**: <http://localhost:3000>
- **Prometheus**: <http://localhost:9090>
- **Qdrant**: <http://localhost:6333/dashboard>

## 🔄 Scheduled Ingestion

### Windows Task Scheduler

```powershell
# Create scheduled task for daily ingestion at 2 AM
$action = New-ScheduledTaskAction -Execute "python" -Argument "C:\path\to\integrated_data_pipeline.py"
$trigger = New-ScheduledTaskTrigger -Daily -At 2am
Register-ScheduledTask -Action $action -Trigger $trigger -TaskName "YSH Data Pipeline"
```

### Cron (Linux/Mac)

```bash
# Add to crontab for daily at 2 AM
0 2 * * * cd /path/to/data-pipeline && python integrated_data_pipeline.py
```

## 🛠️ Troubleshooting

### Ollama Connection Error

```powershell
# Check if Ollama is running
docker ps | findstr ollama

# Restart Ollama
docker restart ysh-ollama-service

# Test connection
curl http://localhost:11434/api/tags
```

### Crawlee/Playwright Issues

```powershell
# Reinstall Playwright browsers
playwright install --force chromium

# Check Playwright installation
playwright --version
```

### Redis Connection Error

```powershell
# Check Redis
docker exec ysh-redis-cache redis-cli ping

# Clear cache
docker exec ysh-redis-cache redis-cli FLUSHALL
```

## 📚 Integration with Existing System

### Link with Validation System

```python
# Import validation system
import sys
sys.path.append('../schemas/technical-validation')

from integrated_pipeline import TechnicalPipeline
from integrated_data_pipeline import DataPipelineOrchestrator

# Fetch latest certifications
orchestrator = DataPipelineOrchestrator()
aneel_data = await orchestrator._fetch_aneel_data()

# Validate products
pipeline = TechnicalPipeline()
products = [...] # Your products
results = await pipeline.process_catalog(products)
```

## 🎯 Next Steps

1. **Production Deployment**
   - Set strong passwords in `infrastructure/main.tf`
   - Configure SSL/TLS
   - Set up backup strategy

2. **Advanced Features**
   - Add custom scrapers for more utilities
   - Configure alerts in Grafana
   - Implement ML classification models

3. **Optimization**
   - Tune batch sizes
   - Configure caching policies
   - Set up distributed processing

## 🤝 Support

For issues:

1. Check component logs: `python <component>.py`
2. Verify infrastructure: `docker ps`
3. Review documentation: See full `README.md`

## 📝 Quick Commands Reference

```powershell
# Infrastructure
tofu init && tofu apply          # Deploy
docker ps                        # Check services
docker logs ysh-ollama-service   # View logs

# Pipeline
python integrated_data_pipeline.py                    # Run full pipeline
python aneel_data_fetcher.py                          # Fetch ANEEL data
python crawlee_scraper.py                             # Scrape utilities

# Monitoring
start http://localhost:3000      # Open Grafana
start http://localhost:9090      # Open Prometheus

# Cleanup
tofu destroy                     # Remove infrastructure
rm -rf pipeline_output/          # Clear outputs
```

---

**Ready to go!** 🎉 Run `python integrated_data_pipeline.py` to start processing Brazilian energy data.
