# 🚀 Guia de Enriquecimento Completo do Catálogo YSH Store

**Data**: 13 de outubro de 2025  
**Status**: ✅ Sistema Implementado e Operacional

---

## 📋 Visão Geral

Sistema completo de enriquecimento de catálogo que integra:

1. **Llama 3.2 Vision** - Extração visual de metadados
2. **Gemma 3** - Normalização e estruturação de dados
3. **GPT-OSS** - Validação e enriquecimento adicional
4. **PVLib/CEC/Sandia** - Validação de especificações técnicas
5. **NREL Database** - Dados de referência
6. **UI Standardization** - Padronização para componentes da store

---

## 🔄 Arquitetura do Pipeline

```
┌─────────────────────────────────────────────────────────┐
│  ENTRADA                                                │
│  • Imagem do produto (JPEG/PNG)                         │
│  • SKU identificador                                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  ETAPA 1: ANÁLISE VISUAL (Llama 3.2 Vision:11b)        │
│  • Extrai texto visível                                 │
│  • Identifica fabricante e modelo                       │
│  • Detecta especificações técnicas                      │
│  • Avalia qualidade da imagem                           │
│  ⏱️  Tempo: ~107s por imagem                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  ETAPA 2: MATCHING PVLIB                                │
│  • Busca em normalized_inverters_sandia_clean.json      │
│  • Busca em normalized_panels_cec_clean.json            │
│  • Match por fabricante + modelo                        │
│  • Enriquece com dados validated_pvlib/                 │
│  ⏱️  Tempo: <1s                                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  ETAPA 3: NORMALIZAÇÃO (Gemma 3:4b)                     │
│  • Combina dados visuais + PVLib                        │
│  • Normaliza fabricantes e modelos                      │
│  • Estrutura especificações técnicas                    │
│  • Gera dados para UI components                        │
│  • Cria descrições curtas                               │
│  • Define tags e categorias                             │
│  ⏱️  Tempo: ~10-20s                                      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  SAÍDA FINAL                                            │
│  • Produto completamente enriquecido                    │
│  • Formato padronizado para Medusa/Store                │
│  • Metadados estruturados                               │
│  • UI components ready                                  │
└─────────────────────────────────────────────────────────┘
```

**Tempo total**: ~120-130s por produto  
**Processamento paralelo**: 3 workers (reduz 3x o tempo total)

---

## 🚀 Como Usar

### 1. Executar em Foreground (ver progresso)

```bash
# Processar 10 inversores
python scripts/enrich-catalog-complete.py \
  --category inverters \
  --max 10 \
  --workers 3

# Processar 10 painéis
python scripts/enrich-catalog-complete.py \
  --category panels \
  --max 10 \
  --workers 3

# Processar todas as categorias
python scripts/enrich-catalog-complete.py \
  --max 50 \
  --workers 3
```

### 2. Executar em Background (PowerShell)

```powershell
# Iniciar job em background
Start-Job -ScriptBlock {
    Set-Location "C:\Users\fjuni\ysh_medusa\ysh-store\backend"
    python scripts/enrich-catalog-complete.py `
      --category inverters `
      --max 20 `
      --workers 3 `
      --output output/enriched-catalog-full
}

# Ver jobs rodando
Get-Job

# Ver progresso
Get-Job | Receive-Job -Keep

# Ver resultado final
Get-Job | Receive-Job

# Limpar jobs concluídos
Get-Job | Remove-Job
```

### 3. Executar em Background (Bash/Linux)

```bash
# Iniciar em background
nohup python scripts/enrich-catalog-complete.py \
  --category inverters \
  --max 50 \
  --workers 5 \
  --output output/enriched-catalog-full \
  > enrichment.log 2>&1 &

# Ver progresso
tail -f enrichment.log

# Ver PID
ps aux | grep enrich-catalog

# Parar se necessário
kill <PID>
```

---

## 📊 Estrutura de Dados Gerada

### Formato de Saída (JSON)

```json
{
  "sku": "112369",
  "image_path": "static/images-catálogo_distribuidores/...",
  "processed_at": "2025-10-13T14:00:00",
  "processing_time_seconds": 125.5,
  
  "visual_analysis": {
    "manufacturer": "Deye",
    "model": "SMA-10K-3-40",
    "product_type": "inverter",
    "specifications": {
      "power_w": 10000,
      "voltage": "220V",
      "efficiency": 95.0
    },
    "visible_text": "Deye SMA-10K-3-40...",
    "certifications": ["CE", "IEC"],
    "image_quality_score": 8
  },
  
  "pvlib_match": {
    "source": "sandia_inverters",
    "manufacturer": "Deye",
    "model": "SMA-10K-3-40",
    "pac0": 10000,
    "vdco": 850,
    "mppt_channels": 3,
    "efficiency": 95.8
  },
  
  "normalized_data": {
    "product": {
      "sku": "DEYE-INV-SMA10K340",
      "title": "Inversor String Deye SMA-10K-3-40 10kW Trifásico",
      "manufacturer": "Deye",
      "model": "SMA-10K-3-40",
      "category": "inverters/string",
      "type": "gridtie"
    },
    "specifications": {
      "power_nominal_w": 10000,
      "efficiency_percent": 95.8,
      "voltage_nominal_v": 220,
      "current_max_a": 40,
      "mppt_channels": 3,
      "dimensions_mm": "420x370x175",
      "weight_kg": 18.5,
      "warranty_years": 10,
      "certifications": ["INMETRO", "IEC", "CE"]
    },
    "compatibility": {
      "recommended_for": [
        "Sistemas residenciais até 13kWp",
        "Sistemas comerciais até 15kWp"
      ],
      "system_voltage": ["220V trifásico", "380V"],
      "installation_type": ["residencial", "comercial"]
    },
    "ui_data": {
      "display_name": "Inversor Deye 10kW String",
      "short_description": "Inversor string trifásico 10kW com 3 MPPTs, eficiência 95.8%, ideal para sistemas até 15kWp",
      "tags": ["inversor", "string", "trifásico", "10kw", "deye"],
      "highlight_features": [
        "3 canais MPPT independentes",
        "Eficiência 95.8%",
        "Proteção IP65",
        "Monitoramento WiFi",
        "Garantia 10 anos"
      ],
      "technical_level": "intermediate"
    }
  },
  
  "data_sources": {
    "visual": "llama3.2-vision:11b",
    "normalization": "gemma3:4b",
    "pvlib": true,
    "validated": true,
    "enriched": true
  }
}
```

---

## 📁 Estrutura de Dados Integrada

### Dados PVLib Carregados

```
data/catalog/data/catalog/
├── normalized_pvlib/
│   ├── normalized_inverters_sandia_clean.json  ✅ Carregado
│   ├── normalized_panels_cec_clean.json        ✅ Carregado
│   └── normalization_report.json
├── validated_pvlib/
│   ├── validated_inverters_unified.json        ✅ Carregado
│   ├── validated_panels_unified.json           ✅ Carregado
│   └── cec_validation_report.txt
└── enriched_pvlib/
    ├── enriched_inverters_unified.json         ✅ Carregado
    ├── enriched_panels_unified.json            ✅ Carregado
    └── pvlib_enrichment_report.txt
```

### Saída Gerada

```
output/enriched-catalog-full/
├── enrichment_summary.json          # Resumo completo
├── ENRICHMENT_REPORT.md             # Relatório markdown
├── sku_112369_enriched.json         # Produto 1
├── sku_135720_enriched.json         # Produto 2
├── sku_145763_enriched.json         # Produto 3
└── ...
```

---

## 🎯 Casos de Uso

### 1. Enriquecer Catálogo Completo

```bash
# Background job processando tudo
Start-Job -ScriptBlock {
    cd C:\Users\fjuni\ysh_medusa\ysh-store\backend
    python scripts/enrich-catalog-complete.py \
      --workers 5 \
      --output output/enriched-catalog-complete-$(Get-Date -Format 'yyyyMMdd')
} -Name "CatalogEnrichment"

# Monitorar
while ((Get-Job -Name "CatalogEnrichment").State -eq "Running") {
    Clear-Host
    Get-Job -Name "CatalogEnrichment" | Receive-Job -Keep | Select-Object -Last 20
    Start-Sleep -Seconds 30
}
```

### 2. Processar Nova Categoria

```bash
# Adicionar novos produtos
python scripts/enrich-catalog-complete.py \
  --category batteries \
  --workers 3 \
  --output output/enriched-batteries
```

### 3. Re-processar com Atualização

```bash
# Re-processar produtos específicos
python scripts/enrich-catalog-complete.py \
  --max 20 \
  --workers 3 \
  --output output/enriched-reprocess-$(date +%Y%m%d)
```

---

## 📊 Performance Esperada

### Hardware Recomendado

| Componente | Mínimo | Recomendado | Ideal |
|------------|--------|-------------|-------|
| **CPU** | 4 cores | 8 cores | 16+ cores |
| **RAM** | 16 GB | 32 GB | 64 GB |
| **GPU** | - | RTX 3060 | RTX 4090 |
| **Storage** | SSD | NVMe SSD | NVMe RAID |

### Throughput Estimado

| Workers | CPU | GPU | Produtos/hora |
|---------|-----|-----|---------------|
| 1 | Sim | Não | ~30 |
| 3 | Sim | Não | ~85 |
| 5 | Sim | Não | ~135 |
| 3 | Sim | Sim | ~180 |
| 5 | Sim | Sim | ~280 |

### Tempo Estimado (854 produtos)

| Configuração | Tempo Total |
|--------------|-------------|
| 1 worker, sem GPU | ~28 horas |
| 3 workers, sem GPU | ~10 horas |
| 5 workers, sem GPU | ~6 horas |
| 3 workers, com GPU | ~4.5 horas |
| 5 workers, com GPU | ~3 horas |

**Recomendação**: Executar overnight com 5 workers.

---

## 🔧 Monitoramento

### Script de Monitoramento (PowerShell)

```powershell
# monitor-enrichment.ps1

$OutputDir = "output/enriched-catalog-full"
$SummaryFile = "$OutputDir/enrichment_summary.json"

while ($true) {
    Clear-Host
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  MONITORAMENTO DE ENRIQUECIMENTO DO CATÁLOGO  " -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    
    # Ver jobs
    $jobs = Get-Job
    if ($jobs) {
        Write-Host "📊 Jobs Ativos:" -ForegroundColor Yellow
        $jobs | Format-Table -Property Id, Name, State, HasMoreData
    }
    
    # Ver arquivos gerados
    if (Test-Path $OutputDir) {
        $files = Get-ChildItem $OutputDir -Filter "*_enriched.json"
        Write-Host "📁 Arquivos gerados: $($files.Count)" -ForegroundColor Green
        
        if (Test-Path $SummaryFile) {
            $summary = Get-Content $SummaryFile | ConvertFrom-Json
            Write-Host "✅ Processados: $($summary.successful)" -ForegroundColor Green
            Write-Host "❌ Erros: $($summary.failed)" -ForegroundColor Red
            Write-Host "📊 Total: $($summary.total_images)" -ForegroundColor Cyan
        }
    }
    
    Write-Host ""
    Write-Host "Atualizando em 30s... (Ctrl+C para sair)" -ForegroundColor Gray
    Start-Sleep -Seconds 30
}
```

### Usar Monitor

```powershell
# Executar monitor
.\monitor-enrichment.ps1

# Ou one-liner
while ($true) { Clear-Host; Get-Job | Format-Table; Get-ChildItem output/enriched-catalog-full/*_enriched.json | Measure-Object | Select-Object -ExpandProperty Count | ForEach-Object { Write-Host "Arquivos: $_" -ForegroundColor Green }; Start-Sleep -Seconds 30 }
```

---

## 🎯 Próximos Passos

### Fase 1: Validação (Concluído ✅)

- [x] Testar Llama 3.2 Vision com 5 imagens
- [x] Validar extração de metadados
- [x] Confirmar integração PVLib

### Fase 2: Processamento em Lote (Em Andamento 🔄)

- [x] Script de enriquecimento completo criado
- [ ] Processar 50 produtos de teste
- [ ] Validar qualidade dos dados
- [ ] Ajustar prompts se necessário

### Fase 3: Produção (Próxima)

- [ ] Processar catálogo completo (854 produtos)
- [ ] Gerar relatórios de qualidade
- [ ] Importar para banco Medusa
- [ ] Validação manual de 10% dos produtos

### Fase 4: Automação (Futuro)

- [ ] CI/CD para novos produtos
- [ ] Auto-processamento de uploads
- [ ] Dashboard de monitoramento
- [ ] API de enriquecimento

---

## 📚 Documentação Relacionada

- `docs/LLAMA32_VISION_GUIDE.md` - Guia do Llama 3.2 Vision
- `docs/LLAMA32_TEST_RESULTS.md` - Resultados dos testes
- `docs/GEMMA3_CAPABILITIES.md` - Capacidades do Gemma 3
- `data/catalog/data/catalog/normalized_pvlib/PVLIB_INTEGRATION_VALIDATED.md` - PVLib
- `data/catalog/data/catalog/reports/EXECUTIVE_SUMMARY.md` - Resumo executivo

---

**Atualizado em**: 13/10/2025 14:30  
**Versão**: 1.0  
**Status**: ✅ Operacional
