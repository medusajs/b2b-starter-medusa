# ====================================================================
# Script: Criar Publishable API Key para Medusa
# Descricao: Cria uma publishable key e associa ao Default Sales Channel
# Uso: .\scripts\create-publishable-key.ps1
# ====================================================================

Write-Host "[INFO] Criando Publishable API Key para Medusa Store..." -ForegroundColor Cyan
Write-Host ""

# Configuracoes
$CONTAINER_NAME = "ysh-b2b-postgres"
$DB_USER = "postgres"
$DB_NAME = "medusa-backend"

# Verificar se container esta rodando
Write-Host "[VERIFICANDO] Container PostgreSQL..." -ForegroundColor Yellow
$containerRunning = docker ps --filter "name=$CONTAINER_NAME" --format "{{.Names}}" | Select-String -Pattern $CONTAINER_NAME

if (-not $containerRunning) {
    Write-Host "[ERRO] Container $CONTAINER_NAME nao esta rodando!" -ForegroundColor Red
    Write-Host "Execute: docker compose -f docker/docker-compose.yml up -d postgres" -ForegroundColor Yellow
    exit 1
}
Write-Host "[OK] Container PostgreSQL encontrado" -ForegroundColor Green
Write-Host ""

# SQL para criar publishable key
$SQL_CREATE_KEY = @"
DO \$\$
DECLARE
    v_key_id TEXT;
    v_token TEXT;
    v_sales_channel_id TEXT;
    v_store_id TEXT;
BEGIN
    -- Gerar ID único para a key
    v_key_id := 'apk_' || REPLACE(gen_random_uuid()::TEXT, '-', '');
    
    -- Gerar token (64 caracteres hexadecimais)
    v_token := 'pk_' || encode(gen_random_bytes(32), 'hex');
    
    -- Obter Default Sales Channel ID
    SELECT id INTO v_sales_channel_id 
    FROM sales_channel 
    WHERE name = 'Default Sales Channel' 
    LIMIT 1;
    
    -- Obter Store ID
    SELECT id INTO v_store_id 
    FROM store 
    LIMIT 1;
    
    -- Verificar se sales channel existe
    IF v_sales_channel_id IS NULL THEN
        RAISE EXCEPTION 'Sales Channel não encontrado';
    END IF;
    
    -- Inserir API Key
    INSERT INTO api_key (
        id,
        token,
        type,
        title,
        created_at,
        updated_at
    ) VALUES (
        v_key_id,
        v_token,
        'publishable',
        'Store Frontend Key (Auto-generated)',
        NOW(),
        NOW()
    );
    
    -- Associar key ao sales channel
    INSERT INTO publishable_api_key_sales_channel (
        id,
        publishable_key_id,
        sales_channel_id,
        created_at,
        updated_at
    ) VALUES (
        'pksc_' || REPLACE(gen_random_uuid()::TEXT, '-', ''),
        v_key_id,
        v_sales_channel_id,
        NOW(),
        NOW()
    );
    
    -- Retornar informações
    RAISE NOTICE '';
    RAISE NOTICE '╔════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║  ✅ PUBLISHABLE KEY CRIADA COM SUCESSO!                       ║';
    RAISE NOTICE '╚════════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Key ID: %', v_key_id;
    RAISE NOTICE '🎯 Token: %', v_token;
    RAISE NOTICE '📦 Sales Channel: % (%)', (SELECT name FROM sales_channel WHERE id = v_sales_channel_id), v_sales_channel_id;
    RAISE NOTICE '🏪 Store: % (%)', (SELECT name FROM store WHERE id = v_store_id), v_store_id;
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Copie o token acima (pk_...)';
    RAISE NOTICE '2. Adicione ao storefront/.env:';
    RAISE NOTICE '   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=%', v_token;
    RAISE NOTICE '3. Reinicie o storefront:';
    RAISE NOTICE '   docker compose restart storefront';
    RAISE NOTICE '';
    
END \$\$;
"@

Write-Host "🔧 Executando SQL para criar publishable key..." -ForegroundColor Yellow

# Executar SQL
$output = docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c $SQL_CREATE_KEY 2>&1

# Verificar se houve erro
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao criar publishable key!" -ForegroundColor Red
    Write-Host $output -ForegroundColor Red
    exit 1
}

# Extrair o token do output
$token = ""
foreach ($line in $output) {
    if ($line -match "Token: (pk_[a-f0-9]+)") {
        $token = $matches[1]
        break
    }
}

Write-Host $output -ForegroundColor Cyan
Write-Host ""

# Consultar key criada para confirmar
Write-Host "🔍 Verificando key criada..." -ForegroundColor Yellow
$verifySQL = @"
SELECT 
    ak.id as key_id,
    ak.token,
    ak.title,
    ak.type,
    sc.name as sales_channel_name,
    ak.created_at
FROM api_key ak
LEFT JOIN publishable_api_key_sales_channel pksc ON ak.id = pksc.publishable_key_id
LEFT JOIN sales_channel sc ON pksc.sales_channel_id = sc.id
WHERE ak.type = 'publishable'
ORDER BY ak.created_at DESC
LIMIT 1;
"@

$result = docker exec $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c $verifySQL

Write-Host $result -ForegroundColor Green
Write-Host ""

# Se conseguimos extrair o token, salvar em arquivo
if ($token) {
    Write-Host "💾 Salvando token em arquivo..." -ForegroundColor Yellow
    
    $envFile = "storefront\.env"
    $envContent = ""
    
    # Ler conteúdo atual do .env se existir
    if (Test-Path $envFile) {
        $envContent = Get-Content $envFile -Raw
    }
    
    # Verificar se já existe a variável
    if ($envContent -match "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=") {
        # Substituir valor existente
        $envContent = $envContent -replace "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*", "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$token"
        Write-Host "   ✅ Variável NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY atualizada" -ForegroundColor Green
    }
    else {
        # Adicionar nova variável
        if ($envContent -and -not $envContent.EndsWith("`n")) {
            $envContent += "`n"
        }
        $envContent += "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$token`n"
        Write-Host "   ✅ Variável NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY adicionada" -ForegroundColor Green
    }
    
    # Salvar arquivo
    Set-Content -Path $envFile -Value $envContent -NoNewline
    
    Write-Host ""
    Write-Host "📁 Arquivo atualizado: $envFile" -ForegroundColor Cyan
    Write-Host ""
    
    # Criar arquivo de backup com apenas o token
    $backupFile = "storefront\.publishable-key.txt"
    Set-Content -Path $backupFile -Value $token
    Write-Host "💾 Backup do token salvo em: $backupFile" -ForegroundColor Cyan
    Write-Host ""
    
    # Copiar para clipboard se possível
    try {
        Set-Clipboard -Value $token
        Write-Host "📋 Token copiado para clipboard!" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Não foi possível copiar para clipboard (não crítico)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🎉 PUBLISHABLE KEY CONFIGURADA COM SUCESSO!                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. ✅ Token já foi adicionado ao storefront/.env" -ForegroundColor Green
Write-Host ""
Write-Host "2. Reinicie o storefront:" -ForegroundColor Yellow
Write-Host "   docker compose -f docker/docker-compose.yml restart storefront" -ForegroundColor White
Write-Host ""
Write-Host "3. Teste a API:" -ForegroundColor Yellow
Write-Host "   `$headers = @{`"x-publishable-api-key`" = `"$token`"}" -ForegroundColor White
Write-Host "   Invoke-RestMethod -Uri `"http://localhost:9000/store/products?limit=1`" -Headers `$headers" -ForegroundColor White
Write-Host ""
Write-Host "4. Acesse o PDP:" -ForegroundColor Yellow
Write-Host "   http://localhost:8000/br/products/kit-solar-5kw" -ForegroundColor White
Write-Host ""

# Sugerir teste imediato
Write-Host "🧪 Deseja testar a key agora? (S/N): " -NoNewline -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "S" -or $response -eq "s") {
    Write-Host ""
    Write-Host "🧪 Testando publishable key..." -ForegroundColor Yellow
    
    if ($token) {
        try {
            $headers = @{
                "x-publishable-api-key" = $token
            }
            
            $testResult = Invoke-RestMethod -Uri "http://localhost:9000/store/products?limit=1" -Headers $headers -Method Get
            
            Write-Host "✅ API respondeu com sucesso!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📦 Produtos retornados: $($testResult.products.Count)" -ForegroundColor Cyan
            
            if ($testResult.products.Count -gt 0) {
                $product = $testResult.products[0]
                Write-Host "   • ID: $($product.id)" -ForegroundColor White
                Write-Host "   • Title: $($product.title)" -ForegroundColor White
                Write-Host "   • Handle: $($product.handle)" -ForegroundColor White
            }
            else {
                Write-Host "⚠️  Nenhum produto encontrado no banco (normal se não rodou seed)" -ForegroundColor Yellow
            }
            
        }
        catch {
            Write-Host "❌ Erro ao testar API:" -ForegroundColor Red
            Write-Host $_.Exception.Message -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "✨ Script concluído!" -ForegroundColor Green
