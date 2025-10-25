#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
normalize_repo.py - Repo Normalizer para Medusa v2 + Next.js 15

Reorganiza /server e /client seguindo as melhores práticas:
- Estrutura de pastas Medusa v2
- Normalização de imports (@medusajs/framework/*)
- App Router Next.js 15
- Configs Tailwind + PostCSS

Uso:
  python tools/normalize_repo.py --dry-run  # Simular
  python tools/normalize_repo.py            # Aplicar
"""
from __future__ import annotations
import argparse
import re
import sys
from pathlib import Path
from typing import List, Tuple

# Caminhos base
ROOT = Path(__file__).resolve().parents[1]
SERVER = ROOT / "server"
CLIENT = ROOT / "client"

# Cores ANSI para output
class Colors:
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    MAGENTA = '\033[95m'
    GRAY = '\033[90m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def colored(text: str, color: str) -> str:
    """Adiciona cor ao texto se o terminal suportar"""
    return f"{color}{text}{Colors.RESET}" if sys.stdout.isatty() else text

def ensure_dir(path: Path, dry: bool) -> None:
    """Cria diretório se não existir"""
    if not path.exists():
        action = colored("[DRY]", Colors.YELLOW) if dry else colored("[CREATE]", Colors.GREEN)
        print(f"{action} Diretório: {path.relative_to(ROOT)}")
        if not dry:
            path.mkdir(parents=True, exist_ok=True)

def write_if_absent(path: Path, content: str, dry: bool) -> None:
    """Escreve arquivo apenas se não existir"""
    if not path.exists():
        action = colored("[DRY]", Colors.YELLOW) if dry else colored("[CREATE]", Colors.GREEN)
        print(f"{action} Arquivo: {path.relative_to(ROOT)}")
        if not dry:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(content, encoding="utf-8")
    else:
        print(f"{colored('[SKIP]', Colors.GRAY)} Já existe: {path.relative_to(ROOT)}")

def patch_regex(path: Path, rules: List[Tuple[str, str]], dry: bool) -> None:
    """Aplica substituições regex em arquivo"""
    if not path.exists():
        return
    
    try:
        txt = path.read_text(encoding="utf-8", errors="ignore")
        original = txt
        changed = False
        
        for pattern, replacement in rules:
            if re.search(pattern, txt, re.MULTILINE):
                txt = re.sub(pattern, replacement, txt, flags=re.MULTILINE)
                changed = True
        
        if changed:
            action = colored("[DRY]", Colors.YELLOW) if dry else colored("[PATCH]", Colors.CYAN)
            print(f"{action} Imports: {path.relative_to(ROOT)}")
            if not dry:
                # Backup
                backup = path.with_suffix(path.suffix + ".bak")
                backup.write_text(original, encoding="utf-8")
                path.write_text(txt, encoding="utf-8")
    except Exception as e:
        print(f"{colored('[WARN]', Colors.RED)} Erro ao processar {path.relative_to(ROOT)}: {e}")

def list_code_files(base: Path) -> List[Path]:
    """Lista todos os arquivos de código TypeScript/JavaScript"""
    files = []
    if not base.exists():
        return files
    
    for ext in (".ts", ".tsx", ".js", ".jsx"):
        files.extend(base.rglob(f"*{ext}"))
    return files

def normalize_imports_server(dry: bool) -> None:
    """Normaliza imports Medusa v2 no backend"""
    if not SERVER.exists():
        print(f"{colored('[WARN]', Colors.YELLOW)} server/ não encontrado — ignorando backend")
        return
    
    rules = [
        (r'from\s+"@medusajs/(medusa|framework)"(?!/)', r'from "@medusajs/framework/http"'),
        (r'from\s+"@medusajs/types"', r'from "@medusajs/framework/types"'),
        (r'from\s+"@medusajs/workflows-sdk"', r'from "@medusajs/framework/workflows-sdk"'),
        (r'from\s+"@medusajs/utils"', r'from "@medusajs/framework/utils"'),
    ]
    
    src_path = SERVER / "src"
    if src_path.exists():
        for file in list_code_files(src_path):
            patch_regex(file, rules, dry)

def ensure_backend_skeleton(dry: bool) -> None:
    """Cria estrutura de pastas e arquivos base do backend"""
    print(f"\n{colored('--- FASE 1: Estrutura Backend (server/) ---', Colors.MAGENTA)}\n")
    
    # Estrutura de diretórios
    dirs = [
        "src/admin",
        "src/api",
        "src/jobs",
        "src/links",
        "src/modules",
        "src/scripts",
        "src/subscribers",
        "src/workflows",
        "src/compat/http"
    ]
    
    for d in dirs:
        ensure_dir(SERVER / d, dry)
    
    print(f"\n{colored('--- FASE 2: Arquivos Base Backend ---', Colors.MAGENTA)}\n")
    
    # Health check route
    health_content = '''import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

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
'''
    
    write_if_absent(SERVER / "src/api/health/route.ts", health_content, dry)
    
    # Response helpers
    response_content = '''import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

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
'''
    
    write_if_absent(SERVER / "src/compat/http/response.ts", response_content, dry)
    
    # Publishable key middleware
    publishable_content = '''import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
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
'''
    
    write_if_absent(SERVER / "src/compat/http/publishable.ts", publishable_content, dry)

def ensure_client_skeleton(dry: bool) -> None:
    """Cria estrutura App Router e configs Next.js 15"""
    print(f"\n{colored('--- FASE 4: Client App Router + Configs ---', Colors.MAGENTA)}\n")
    
    ensure_dir(CLIENT / "src/app", dry)
    
    # Layout
    layout_content = '''import type { Metadata } from "next"
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
'''
    
    write_if_absent(CLIENT / "src/app/layout.tsx", layout_content, dry)
    
    # Page
    page_content = '''export default function HomePage() {
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
'''
    
    write_if_absent(CLIENT / "src/app/page.tsx", page_content, dry)
    
    # Next config
    next_config = '''/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@medusajs/ui", "@medusajs/icons"]
}
module.exports = nextConfig
'''
    
    write_if_absent(CLIENT / "next.config.js", next_config, dry)
    
    # PostCSS config
    postcss_config = '''module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
'''
    
    write_if_absent(CLIENT / "postcss.config.js", postcss_config, dry)
    
    # .env.example
    env_example = '''NEXT_PUBLIC_API_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_XXXXXXXXXXXXXXXXXXXX
'''
    
    write_if_absent(CLIENT / ".env.example", env_example, dry)

def print_summary(dry: bool) -> None:
    """Imprime resumo da normalização"""
    print(f"\n{colored('--- RESUMO ---', Colors.MAGENTA)}\n")
    print(f"{colored('✓', Colors.GREEN)} Estrutura backend normalizada")
    print(f"{colored('✓', Colors.GREEN)} Health check criado")
    print(f"{colored('✓', Colors.GREEN)} Helpers de response/publishable key prontos")
    print(f"{colored('✓', Colors.GREEN)} Imports Medusa v2 normalizados")
    print(f"{colored('✓', Colors.GREEN)} Client App Router configurado")
    print(f"{colored('✓', Colors.GREEN)} Next.js 15 configs criados")
    
    if dry:
        print(f"\n{colored('[DRY-RUN]', Colors.YELLOW)} Execute sem --dry-run para aplicar as mudanças")
    else:
        print(f"\n{colored('[OK]', Colors.GREEN)} Normalização concluída com sucesso!")
        print(f"\n{colored('Próximos passos:', Colors.CYAN)}")
        print(f"  1. cd server && yarn build")
        print(f"  2. cd client && yarn dev")
        print(f"  3. Testar GET /health e rotas /store com x-publishable-api-key")

def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description="Normaliza repositório YSH para Medusa v2 + Next.js 15"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simula as operações sem fazer alterações"
    )
    args = parser.parse_args()
    
    print(f"\n{colored('=== YSH Repo Normalizer - Medusa v2 + Next.js 15 ===', Colors.CYAN)}")
    if args.dry_run:
        print(f"{colored('[DRY-RUN MODE - Nenhuma alteração será feita]', Colors.YELLOW)}\n")
    
    # Executa normalização
    ensure_backend_skeleton(args.dry_run)
    
    print(f"\n{colored('--- FASE 3: Normalização de Imports ---', Colors.MAGENTA)}\n")
    normalize_imports_server(args.dry_run)
    
    ensure_client_skeleton(args.dry_run)
    
    print_summary(args.dry_run)

if __name__ == "__main__":
    main()
