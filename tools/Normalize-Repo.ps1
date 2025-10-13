# Normalize-Repo.ps1
# Normalização automatizada Medusa v2 + Next.js 15
# Uso: .\tools\Normalize-Repo.ps1 [-WhatIf]

param(
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Root = Split-Path -Parent $ScriptDir
$Server = Join-Path $Root "server"
$Client = Join-Path $Root "client"

Write-Host "`n=== YSH Repo Normalizer - Medusa v2 + Next.js 15 ===" -ForegroundColor Cyan
if ($WhatIf) { Write-Host "[DRY-RUN MODE - Nenhuma alteração será feita]`n" -ForegroundColor Yellow }

function New-Dir {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        if ($WhatIf) { 
            Write-Host "[DRY] Criar diretório: $Path" -ForegroundColor Yellow 
        }
        else { 
            Write-Host "[CREATE] Diretório: $Path" -ForegroundColor Green
            New-Item -ItemType Directory -Force -Path $Path | Out-Null 
        }
    }
}

function Write-IfAbsent {
    param([string]$Path, [string]$Content)
    if (-not (Test-Path $Path)) {
        if ($WhatIf) { 
            Write-Host "[DRY] Criar arquivo: $Path" -ForegroundColor Yellow 
        }
        else {
            Write-Host "[CREATE] Arquivo: $Path" -ForegroundColor Green
            $dir = Split-Path -Parent $Path
            if ($dir -and -not (Test-Path $dir)) {
                New-Item -ItemType Directory -Force -Path $dir | Out-Null
            }
            Set-Content -Path $Path -Value $Content -Encoding UTF8
        }
    }
    else {
        Write-Host "[SKIP] Já existe: $Path" -ForegroundColor DarkGray
    }
}

function Patch-Regex {
    param([string]$Path, [hashtable]$Replacements)
    if (-not (Test-Path $Path)) { return }
  
    try {
        $txt = Get-Content -Path $Path -Raw -Encoding UTF8
        $orig = $txt
        $changed = $false
    
        foreach ($pattern in $Replacements.Keys) {
            $replacement = $Replacements[$pattern]
            if ($txt -match $pattern) {
                $txt = [Regex]::Replace($txt, $pattern, $replacement, [System.Text.RegularExpressions.RegexOptions]::Multiline)
                $changed = $true
            }
        }
    
        if ($changed) {
            if ($WhatIf) { 
                Write-Host "[DRY] Patch imports: $Path" -ForegroundColor Yellow 
            }
            else {
                Write-Host "[PATCH] Imports: $Path" -ForegroundColor Cyan
                # Backup
                Copy-Item $Path "$Path.bak" -Force -ErrorAction SilentlyContinue
                Set-Content -Path $Path -Value $txt -Encoding UTF8
            }
        }
    }
    catch {
        Write-Host "[WARN] Erro ao processar $Path : $_" -ForegroundColor Red
    }
}

Write-Host "`n--- FASE 1: Estrutura Backend (server/) ---`n" -ForegroundColor Magenta

# 1) Estrutura mínima backend
$backendDirs = @(
    "src/admin",
    "src/api",
    "src/jobs",
    "src/links",
    "src/modules",
    "src/scripts",
    "src/subscribers",
    "src/workflows",
    "src/compat/http"
)

foreach ($dir in $backendDirs) {
    New-Dir (Join-Path $Server $dir)
}

Write-Host "`n--- FASE 2: Arquivos Base Backend ---`n" -ForegroundColor Magenta

# 2) Health route
$healthContent = @'
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const API_VERSION = "v2.0"

async function pingDb(): Promise<"ok" | "down"> {
  // TODO: implement actual database ping
  return "ok"
}

async function pingRedis(): Promise<"ok" | "down"> {
  // TODO: implement actual Redis ping
  return "ok"
}

async function pingExternal(): Promise<"ok" | "degraded" | "down"> {
  // TODO: implement external services ping
  return "ok"
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  res.setHeader("X-API-Version", API_VERSION)
  
  try {
    const [db, redis, ext] = await Promise.all([
      pingDb(),
      pingRedis(),
      pingExternal()
    ])
    
    const status = 
      db === "ok" && redis === "ok" && (ext === "ok" || ext === "degraded")
        ? "ok"
        : "degraded"
    
    return res.status(status === "ok" ? 200 : 206).json({
      success: true,
      data: {
        status,
        deps: { db, redis, external: ext }
      },
      meta: { stale: false }
    })
  } catch (e: any) {
    return res.status(503).json({
      success: false,
      error: {
        code: "HEALTH_CHECK_FAILED",
        message: e?.message ?? "unavailable"
      }
    })
  }
}
'@

Write-IfAbsent (Join-Path $Server "src/api/health/route.ts") $healthContent

# Response helpers
$responseContent = @'
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const API_VERSION = "v2.0"

export type Meta = {
  limit?: number
  offset?: number
  page?: number
  count?: number
  total?: number
  stale?: boolean
}

function setHeaders(req: MedusaRequest, res: MedusaResponse) {
  const requestId = (req as any).requestId || (req.headers?.["x-request-id"] as string) || `req_${Date.now()}`
  res.setHeader("X-API-Version", API_VERSION)
  res.setHeader("X-Request-ID", requestId)
  return requestId
}

export function ok(req: MedusaRequest, res: MedusaResponse, data: any, meta?: Meta) {
  setHeaders(req, res)
  return res.json({ success: true, data, ...(meta ? { meta } : {}) })
}

export function err(
  req: MedusaRequest,
  res: MedusaResponse,
  status: number,
  code: string,
  message: string,
  details?: any,
  meta?: Meta
) {
  setHeaders(req, res)
  return res
    .status(status)
    .json({ 
      success: false, 
      error: { code, message, ...(details ? { details } : {}) }, 
      ...(meta ? { meta } : {}) 
    })
}
'@

Write-IfAbsent (Join-Path $Server "src/compat/http/response.ts") $responseContent

# Publishable Key middleware
$publishableContent = @'
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { err } from "./response"

export function requirePublishableKey(
  req: MedusaRequest,
  res: MedusaResponse
): string | undefined {
  const key = (req.headers["x-publishable-api-key"] || req.headers["x-publishable-key"]) as string | undefined
  if (!key) {
    return err(req, res, 401, "MISSING_PUBLISHABLE_KEY", "Missing x-publishable-api-key header") as any
  }
  // TODO: optionally validate key -> sales channel mapping
  return key
}

export function requireJWT(
  req: MedusaRequest,
  res: MedusaResponse
): string | undefined {
  const auth = (req.headers["authorization"] as string | undefined) || ""
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : undefined
  if (!token) {
    return err(req, res, 401, "UNAUTHORIZED", "Unauthorized") as any
  }
  return token
}
'@

Write-IfAbsent (Join-Path $Server "src/compat/http/publishable.ts") $publishableContent

Write-Host "`n--- FASE 3: Normalização de Imports ---`n" -ForegroundColor Magenta

# 3) Normalização de imports Medusa v2
$importReplacements = @{
    'from\s+"@medusajs/(medusa|framework)"(?!\/)' = 'from "@medusajs/framework/http"'
    'from\s+"@medusajs/types"'                    = 'from "@medusajs/framework/types"'
    'from\s+"@medusajs/workflows-sdk"'            = 'from "@medusajs/framework/workflows-sdk"'
    'from\s+"@medusajs/utils"'                    = 'from "@medusajs/framework/utils"'
}

if (Test-Path (Join-Path $Server "src")) {
    Get-ChildItem -Path (Join-Path $Server "src") -Recurse -Include *.ts, *.tsx, *.js, *.jsx -File |
    ForEach-Object { 
        Patch-Regex -Path $_.FullName -Replacements $importReplacements 
    }
}

Write-Host "`n--- FASE 4: Client App Router + Configs ---`n" -ForegroundColor Magenta

# 4) Client App Router structure
New-Dir (Join-Path $Client "src/app")

$layoutContent = @'
import type { Metadata } from "next"
import "../styles/globals.css"

export const metadata: Metadata = {
  title: "YSH - Yello Solar Hub",
  description: "Plataforma B2B para Energia Solar",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
'@

Write-IfAbsent (Join-Path $Client "src/app/layout.tsx") $layoutContent

$pageContent = @'
export default function HomePage() {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        Hello App Router - YSH
      </h1>
      <p className="text-gray-600">
        Next.js 15 App Router ativo. Pronto para desenvolvimento.
      </p>
    </main>
  )
}
'@

Write-IfAbsent (Join-Path $Client "src/app/page.tsx") $pageContent

$nextConfigContent = @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@medusajs/ui", "@medusajs/icons"]
}
module.exports = nextConfig
'@

Write-IfAbsent (Join-Path $Client "next.config.js") $nextConfigContent

$postcssContent = @'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
'@

Write-IfAbsent (Join-Path $Client "postcss.config.js") $postcssContent

$envExampleContent = @'
NEXT_PUBLIC_API_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_XXXXXXXXXXXXXXXXXXXX
'@

Write-IfAbsent (Join-Path $Client ".env.example") $envExampleContent

Write-Host "`n--- RESUMO ---`n" -ForegroundColor Magenta
Write-Host "✓ Estrutura backend normalizada" -ForegroundColor Green
Write-Host "✓ Health check criado" -ForegroundColor Green
Write-Host "✓ Helpers de response/publishable key prontos" -ForegroundColor Green
Write-Host "✓ Imports Medusa v2 normalizados" -ForegroundColor Green
Write-Host "✓ Client App Router configurado" -ForegroundColor Green
Write-Host "✓ Next.js 15 configs criados" -ForegroundColor Green

if ($WhatIf) {
    Write-Host "`n[DRY-RUN] Execute sem -WhatIf para aplicar as mudanças" -ForegroundColor Yellow
}
else {
    Write-Host "`n[OK] Normalização concluída com sucesso!" -ForegroundColor Green
    Write-Host "`nPróximos passos:" -ForegroundColor Cyan
    Write-Host "  1. cd server && yarn build" -ForegroundColor White
    Write-Host "  2. cd client && yarn dev" -ForegroundColor White
    Write-Host "  3. Testar GET /health e rotas /store com x-publishable-api-key" -ForegroundColor White
}
