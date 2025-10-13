# Fix all query-config.ts files by removing invalid import

$files = Get-ChildItem -Path "src\api" -Filter "query-config.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    if ($content -match "defineQueryConfig") {
        Write-Host "Fixing: $($file.FullName)"
        
        # Remove import line
        $content = $content -replace 'import \{ defineQueryConfig \} from "@medusajs/medusa/api/utils/define-query-config";\r?\n', ''
        
        # Replace defineQueryConfig( with plain object
        $content = $content -replace 'defineQueryConfig\(', ''
        
        # Remove closing parenthesis before semicolon
        $content = $content -replace '\)\;$', ';'
        
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}

Write-Host "Done! Fixed $($files.Count) files"
