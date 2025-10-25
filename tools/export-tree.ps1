# Parâmetros ajustáveis
param(
    [string]$Root = (Get-Location).Path,
    [string[]]$Exclude = @('node_modules', '.git', 'dist', '.next', 'coverage', 'build', 'tmp', '.turbo', 'out', '.cache'),
    [int]$MaxDepth = 50,
    [switch]$GitTrackedOnly,
    [string]$MdOut = "tree.md",
    [string]$JsonOut = "tree.json"
)

# Util: normaliza e torna relativo ao Root
function Get-RelativePath {
    param([string]$FullPath, [string]$Base)
    $p = $FullPath
    if ($p.StartsWith($Base, [System.StringComparison]::OrdinalIgnoreCase)) {
        $p = $p.Substring($Base.Length)
    }
    return $p.TrimStart('\', '/')
}

function New-ExcludeRegex {
    param([string[]]$Items)
    $escaped = $Items | ForEach-Object { [Regex]::Escape($_) }
    $body = [string]::Join('|', $escaped)
    return "(?:^|[\\/\\])($body)(?:$|[\\/\\])"
}

# Gera linhas indentadas estilo Markdown
function New-MdLine {
    param([string]$Rel)
    if ([string]::IsNullOrWhiteSpace($Rel)) { return $null }
    $parts = $Rel -split '[\\/]'
    $depth = [Math]::Max(0, $parts.Length - 1)
    $name = $parts[-1]
    return ('  ' * $depth) + '- ' + $name
}

# Coleta caminhos (Git-only OU sistema de arquivos)
function Get-RepoPaths {
    param([string]$Root, [string]$ExcludeRegex, [int]$MaxDepth, [switch]$GitTrackedOnly)

    if ($GitTrackedOnly) {
        # Requer git instalado e repo inicializado; ignora não rastreados
        $tracked = git -C $Root ls-tree --full-tree --name-only -r HEAD 2>$null
        if (-not $tracked) { return @() }
        # Filtra exclusões e profundidade
        $rel = $tracked | Where-Object {
            $_ -and ($_ -notmatch $ExcludeRegex) -and (($_ -split '[\\/]')).Count -le ($MaxDepth + 1)
        }
        # Reconstrói diretórios a partir dos arquivos rastreados
        $dirs = @()
        foreach ($p in $rel) {
            $parts = $p -split '[\\/]'
            for ($i = 0; $i -lt $parts.Length - 1; $i++) {
                $dirs += [string]::Join('/', $parts[0..$i])
            }
        }
        return ($dirs + $rel) | Sort-Object -Unique
    }
    else {
        # Caminho absoluto do Root
        $rootAbs = (Resolve-Path -LiteralPath $Root).Path

        # Recurso: PS 5.1 não tem -Depth; usamos filtro por profundidade no relativo
        $items = Get-ChildItem -LiteralPath $rootAbs -Recurse -Force -ErrorAction SilentlyContinue

        $rels = foreach ($it in $items) {
            $rel = Get-RelativePath -FullPath $it.FullName -Base $rootAbs
            if ([string]::IsNullOrWhiteSpace($rel)) { continue }
            if ($rel -match $ExcludeRegex) { continue }
            # Limita profundidade
            $seg = ($rel -split '[\\/]')
            if ($seg.Count -le ($MaxDepth + 1)) { $rel }
        }

        # Garante diretórios pais (caso GCI pule alguns)
        $all = @()
        foreach ($p in $rels) {
            $parts = $p -split '[\\/]'
            for ($i = 0; $i -lt $parts.Length - 1; $i++) {
                $all += [string]::Join('/', $parts[0..$i])
            }
            $all += $p
        }
        return $all | Sort-Object -Unique
    }
}

# Execução principal
$old = Get-Location
try {
    Set-Location -LiteralPath $Root

    $regex = New-ExcludeRegex -Items $Exclude
    $paths = Get-RepoPaths -Root $Root -ExcludeRegex $regex -MaxDepth $MaxDepth -GitTrackedOnly:$GitTrackedOnly

    # Gera tree.md
    $md = $paths | ForEach-Object { New-MdLine -Rel $_ } | Where-Object { $_ }
    if (-not $md) { $md = @("- (vazio)") }
    Set-Content -Path (Join-Path $Root $MdOut) -Value ($md -join [Environment]::NewLine) -Encoding UTF8

    # Gera tree.json (lista plana de paths)
    $json = $paths | Sort-Object
    $json | ConvertTo-Json -Depth 5 | Set-Content -Path (Join-Path $Root $JsonOut) -Encoding UTF8

    Write-Host "Gerados:" -ForegroundColor Green
    Write-Host "  $MdOut"
    Write-Host "  $JsonOut"
}
finally {
    Set-Location $old
}