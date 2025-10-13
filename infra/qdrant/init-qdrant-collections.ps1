# Script PowerShell para inicializar collections Qdrant - YSH B2B
# Uso: .\init-qdrant-collections.ps1

param(
    [string]$QdrantUrl = "http://localhost:6333",
    [string]$ApiKey = "qdrant_dev_key_foss_2025"
)

Write-Host "`n🚀 Inicializando Qdrant Collections para YSH B2B" -ForegroundColor Cyan
Write-Host "   URL: $QdrantUrl" -ForegroundColor White
Write-Host ""

# Função auxiliar para criar collection
function Create-Collection {
    param(
        [string]$Name,
        [string]$Description
    )
    
    Write-Host "📦 Criando collection: $Name" -ForegroundColor Yellow
    Write-Host "   Descrição: $Description" -ForegroundColor Gray
    
    $body = @{
        vectors           = @{
            size     = 3072
            distance = "Cosine"
        }
        optimizers_config = @{
            indexing_threshold = 20000
        }
        hnsw_config       = @{
            m            = 16
            ef_construct = 100
        }
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri "$QdrantUrl/collections/$Name" `
            -Method Put `
            -Headers @{ "api-key" = $ApiKey; "Content-Type" = "application/json" } `
            -Body $body
        
        Write-Host "✅ Collection $Name criada com sucesso!" -ForegroundColor Green
        Write-Host ""
    }
    catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 409) {
            Write-Host "⚠️  Collection $Name já existe (ignorando)" -ForegroundColor Yellow
            Write-Host ""
        }
        else {
            Write-Host "❌ Erro ao criar collection $Name : $_" -ForegroundColor Red
            Write-Host ""
        }
    }
}

# Criar collections
Create-Collection -Name "ysh-catalog" -Description "Catálogo de produtos (painéis, inversores, baterias)"
Create-Collection -Name "ysh-regulations" -Description "Regulamentações ANEEL e normas técnicas"
Create-Collection -Name "ysh-tariffs" -Description "Tarifas de energia por região e classe"
Create-Collection -Name "ysh-technical" -Description "Especificações técnicas e guias de instalação"

Write-Host "🎉 Processo de criação de collections concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Popular collections com dados reais" -ForegroundColor White
Write-Host "      cd backend" -ForegroundColor Gray
Write-Host "      node scripts/seed-qdrant-collections.js" -ForegroundColor Gray
Write-Host "   2. Testar endpoints RAG" -ForegroundColor White
Write-Host "      Consulte: backend/API_KEYS_GUIDE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 Para verificar as collections:" -ForegroundColor Cyan
Write-Host "   curl -H `"api-key: $ApiKey`" $QdrantUrl/collections" -ForegroundColor Gray
Write-Host ""
