# ====================================================================
# Script: Criar Publishable API Key via Admin API
# Descricao: Cria uma publishable key usando a API HTTP do Medusa Admin
# Uso: .\scripts\create-publishable-key-admin.ps1
# ====================================================================

Write-Host "[INFO] Criando Publishable API Key via Admin API..." -ForegroundColor Cyan
Write-Host ""

# Configuracoes
$BACKEND_URL = "http://localhost:9000"
$ADMIN_EMAIL = "admin@test.com"
$ADMIN_PASSWORD = "supersecret"

# 1. Login no Admin
Write-Host "[AUTENTICANDO] Login como admin..." -ForegroundColor Yellow

try {
    $loginBody = @{
        email    = $ADMIN_EMAIL
        password = $ADMIN_PASSWORD
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod `
        -Uri "$BACKEND_URL/auth/user/emailpass" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -ErrorAction Stop

    $adminToken = $loginResponse.token
    Write-Host "[OK] Autenticado com sucesso" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "[ERRO] Falha na autenticacao!" -ForegroundColor Red
    Write-Host "Mensagem: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifique:" -ForegroundColor Yellow
    Write-Host "  1. Backend esta rodando em $BACKEND_URL" -ForegroundColor White
    Write-Host "  2. Credenciais corretas: $ADMIN_EMAIL / $ADMIN_PASSWORD" -ForegroundColor White
    exit 1
}

# 2. Verificar publishable keys existentes
Write-Host "[VERIFICANDO] Publishable keys existentes..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type"  = "application/json"
    }

    $existingKeys = Invoke-RestMethod `
        -Uri "$BACKEND_URL/admin/publishable-api-keys" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop

    if ($existingKeys.publishable_api_keys -and $existingKeys.publishable_api_keys.Count -gt 0) {
        $activeKeys = $existingKeys.publishable_api_keys | Where-Object { -not $_.revoked_at }
        
        if ($activeKeys.Count -gt 0) {
            $key = $activeKeys[0]
            Write-Host "[OK] Publishable key ja existe!" -ForegroundColor Green
            Write-Host "Key ID: $($key.id)" -ForegroundColor Cyan
            Write-Host ""
            
            # Salvar token no .env
            $envFile = "storefront\.env"
            $backupFile = "storefront\.publishable-key.txt"
            
            # Ler token (precisa buscar detalhes da key)
            $keyDetails = Invoke-RestMethod `
                -Uri "$BACKEND_URL/admin/publishable-api-keys/$($key.id)" `
                -Method GET `
                -Headers $headers `
                -ErrorAction Stop
            
            $token = $keyDetails.publishable_api_key.id
            
            Write-Host "[SALVANDO] Token em arquivo..." -ForegroundColor Yellow
            
            $envContent = ""
            if (Test-Path $envFile) {
                $envContent = Get-Content $envFile -Raw
            }
            
            if ($envContent -match "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=") {
                $envContent = $envContent -replace "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*", "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$token"
                Write-Host "[OK] Variavel NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY atualizada" -ForegroundColor Green
            }
            else {
                if ($envContent -and -not $envContent.EndsWith("`n")) {
                    $envContent += "`n"
                }
                $envContent += "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$token`n"
                Write-Host "[OK] Variavel NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY adicionada" -ForegroundColor Green
            }
            
            Set-Content -Path $envFile -Value $envContent -NoNewline
            Set-Content -Path $backupFile -Value $token
            
            Write-Host "[ARQUIVO] Atualizado: $envFile" -ForegroundColor Cyan
            Write-Host "[BACKUP] Token salvo em: $backupFile" -ForegroundColor Cyan
            Write-Host ""
            
            Write-Host "================================================================" -ForegroundColor Cyan
            Write-Host "  KEY EXISTENTE CONFIGURADA!" -ForegroundColor Cyan
            Write-Host "================================================================" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Token: $token" -ForegroundColor White
            Write-Host ""
            
            exit 0
        }
    }
    
    Write-Host "[INFO] Nenhuma key existente encontrada, criando nova..." -ForegroundColor Yellow
    Write-Host ""
}
catch {
    Write-Host "[AVISO] Nao foi possivel verificar keys existentes: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "[INFO] Tentando criar nova key..." -ForegroundColor Yellow
    Write-Host ""
}

# 3. Obter Default Sales Channel
Write-Host "[VERIFICANDO] Default Sales Channel..." -ForegroundColor Yellow

try {
    $salesChannels = Invoke-RestMethod `
        -Uri "$BACKEND_URL/admin/sales-channels" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop

    $defaultChannel = $salesChannels.sales_channels | Where-Object { $_.name -eq "Default Sales Channel" } | Select-Object -First 1
    
    if (-not $defaultChannel) {
        throw "Default Sales Channel nao encontrado"
    }
    
    Write-Host "[OK] Sales Channel: $($defaultChannel.name) ($($defaultChannel.id))" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "[ERRO] Falha ao obter Sales Channel!" -ForegroundColor Red
    Write-Host "Mensagem: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Criar Publishable Key
Write-Host "[EXECUTANDO] Criando publishable key..." -ForegroundColor Yellow

try {
    $createKeyBody = @{
        title = "Store Frontend Key (Auto-generated)"
    } | ConvertTo-Json

    $createKeyResponse = Invoke-RestMethod `
        -Uri "$BACKEND_URL/admin/publishable-api-keys" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $createKeyBody `
        -ErrorAction Stop

    $keyId = $createKeyResponse.publishable_api_key.id
    Write-Host "[OK] Key criada: $keyId" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "[ERRO] Falha ao criar publishable key!" -ForegroundColor Red
    Write-Host "Mensagem: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

# 5. Associar ao Sales Channel
Write-Host "[EXECUTANDO] Associando key ao sales channel..." -ForegroundColor Yellow

try {
    $linkBody = @{
        sales_channel_ids = @($defaultChannel.id)
    } | ConvertTo-Json

    $linkResponse = Invoke-RestMethod `
        -Uri "$BACKEND_URL/admin/publishable-api-keys/$keyId/sales-channels/batch" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $linkBody `
        -ErrorAction Stop

    Write-Host "[OK] Key associada ao Default Sales Channel" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "[AVISO] Falha ao associar ao sales channel: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "[INFO] Key foi criada, mas pode precisar associacao manual" -ForegroundColor Yellow
    Write-Host ""
}

# 6. Salvar token no .env
Write-Host "[SALVANDO] Token em arquivo..." -ForegroundColor Yellow

$envFile = "storefront\.env"
$backupFile = "storefront\.publishable-key.txt"
$token = $keyId

try {
    $envContent = ""
    
    if (Test-Path $envFile) {
        $envContent = Get-Content $envFile -Raw
    }
    
    if ($envContent -match "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=") {
        $envContent = $envContent -replace "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=.*", "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$token"
        Write-Host "[OK] Variavel NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY atualizada" -ForegroundColor Green
    }
    else {
        if ($envContent -and -not $envContent.EndsWith("`n")) {
            $envContent += "`n"
        }
        $envContent += "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$token`n"
        Write-Host "[OK] Variavel NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY adicionada" -ForegroundColor Green
    }
    
    Set-Content -Path $envFile -Value $envContent -NoNewline
    Write-Host "[ARQUIVO] Atualizado: $envFile" -ForegroundColor Cyan
    Write-Host ""
    
    Set-Content -Path $backupFile -Value $token
    Write-Host "[BACKUP] Token salvo em: $backupFile" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        Set-Clipboard -Value $token
        Write-Host "[CLIPBOARD] Token copiado!" -ForegroundColor Green
    }
    catch {
        Write-Host "[AVISO] Nao foi possivel copiar para clipboard" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "[AVISO] Nao foi possivel salvar em .env: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Token: $token" -ForegroundColor White
    Write-Host "Por favor, adicione manualmente ao storefront/.env:" -ForegroundColor Yellow
    Write-Host "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$token" -ForegroundColor White
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  PUBLISHABLE KEY CONFIGURADA COM SUCESSO!" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Token: $token" -ForegroundColor White
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Reinicie o storefront:" -ForegroundColor Yellow
Write-Host "   docker compose -f docker/docker-compose.yml restart storefront" -ForegroundColor White
Write-Host ""
Write-Host "2. Teste a API:" -ForegroundColor Yellow
Write-Host "   `$headers = @{`"x-publishable-api-key`" = `"$token`"}" -ForegroundColor White
Write-Host "   Invoke-RestMethod -Uri `"$BACKEND_URL/store/products?limit=1`" -Headers `$headers" -ForegroundColor White
Write-Host ""
Write-Host "3. Acesse o PDP:" -ForegroundColor Yellow
Write-Host "   http://localhost:8000/br/products/kit-solar-5kw" -ForegroundColor White
Write-Host ""

# 7. Sugerir teste imediato
Write-Host "[TESTE] Deseja testar a key agora? (S/N): " -NoNewline -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "S" -or $response -eq "s") {
    Write-Host ""
    Write-Host "[TESTANDO] Publishable key..." -ForegroundColor Yellow
    
    try {
        $testHeaders = @{
            "x-publishable-api-key" = $token
        }
        
        $testResult = Invoke-RestMethod -Uri "$BACKEND_URL/store/products?limit=1" -Headers $testHeaders -Method Get
        
        Write-Host "[SUCESSO] API respondeu com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "[PRODUTOS] Retornados: $($testResult.products.Count)" -ForegroundColor Cyan
        
        if ($testResult.products.Count -gt 0) {
            $product = $testResult.products[0]
            Write-Host "   - ID: $($product.id)" -ForegroundColor White
            Write-Host "   - Title: $($product.title)" -ForegroundColor White
            Write-Host "   - Handle: $($product.handle)" -ForegroundColor White
        }
        else {
            Write-Host "[AVISO] Nenhum produto encontrado (normal se nao rodou seed)" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "[ERRO] Falha ao testar API:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "[CONCLUIDO] Script finalizado!" -ForegroundColor Green
