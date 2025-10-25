#!/usr/bin/env tsx
/**
 * API Normalization Script
 * Aplica padronização Medusa.js em todas as APIs
 */

import fs from "fs";
import path from "path";

const API_DIR = path.join(__dirname, "../src/api");

interface NormalizationRule {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const rules: NormalizationRule[] = [
  // 1. Padronizar imports
  {
    pattern: /import\s+{\s*MedusaRequest,\s*MedusaResponse\s*}\s+from\s+"@medusajs\/framework\/http"/g,
    replacement: 'import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework"',
    description: "Padronizar imports de Request/Response",
  },
  // 2. Adicionar tipagem em handlers
  {
    pattern: /export\s+const\s+(GET|POST|DELETE)\s*=\s*async\s*\(\s*req:\s*MedusaRequest,/g,
    replacement: "export const $1 = async (\n  req: AuthenticatedMedusaRequest,",
    description: "Adicionar AuthenticatedMedusaRequest",
  },
  // 3. Padronizar respostas de erro
  {
    pattern: /res\.status\(500\)\.json\({[\s\S]*?}\)/g,
    replacement: 'throw new MedusaError(MedusaError.Types.INTERNAL_ERROR, error.message)',
    description: "Usar MedusaError para erros",
  },
  // 4. Remover try-catch desnecessários
  {
    pattern: /try\s*{\s*([\s\S]*?)\s*}\s*catch\s*\(error:?\s*any\)\s*{\s*console\.error[\s\S]*?res\.status\(500\)[\s\S]*?}\s*}/g,
    replacement: "$1",
    description: "Remover try-catch (Medusa trata automaticamente)",
  },
];

function normalizeFile(filePath: string): boolean {
  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  for (const rule of rules) {
    if (rule.pattern.test(content)) {
      content = content.replace(rule.pattern, rule.replacement);
      modified = true;
      console.log(`  ✓ ${rule.description}`);
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
  }

  return modified;
}

function scanDirectory(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...scanDirectory(fullPath));
    } else if (entry.name === "route.ts") {
      files.push(fullPath);
    }
  }

  return files;
}

function createMissingFiles(apiPath: string) {
  const routePath = path.join(apiPath, "route.ts");
  if (!fs.existsSync(routePath)) return;

  const validatorsPath = path.join(apiPath, "validators.ts");
  const queryConfigPath = path.join(apiPath, "query-config.ts");

  // Criar validators.ts se não existir
  if (!fs.existsSync(validatorsPath)) {
    const resourceName = path.basename(apiPath);
    const validatorsTemplate = `import { z } from "zod";
import { createSelectParams } from "@medusajs/medusa/api/utils/validators";

export type Get${capitalize(resourceName)}ParamsType = z.infer<typeof Get${capitalize(resourceName)}Params>;
export const Get${capitalize(resourceName)}Params = createSelectParams().extend({
  limit: z.coerce.number().default(50),
  offset: z.coerce.number().default(0),
});
`;
    fs.writeFileSync(validatorsPath, validatorsTemplate);
    console.log(`  ✓ Criado validators.ts`);
  }

  // Criar query-config.ts se não existir
  if (!fs.existsSync(queryConfigPath)) {
    const resourceName = path.basename(apiPath);
    const queryConfigTemplate = `import { defineQueryConfig } from "@medusajs/medusa/api/utils/define-query-config";

export const defaultStore${capitalize(resourceName)}Fields = [
  "id",
  "created_at",
  "updated_at",
];

export const list${capitalize(resourceName)}QueryConfig = defineQueryConfig({
  defaults: defaultStore${capitalize(resourceName)}Fields,
  allowed: defaultStore${capitalize(resourceName)}Fields,
  defaultLimit: 50,
});
`;
    fs.writeFileSync(queryConfigPath, queryConfigTemplate);
    console.log(`  ✓ Criado query-config.ts`);
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

async function main() {
  console.log("🔧 Iniciando normalização de APIs...\n");

  const routeFiles = scanDirectory(API_DIR);
  console.log(`📁 Encontrados ${routeFiles.length} arquivos route.ts\n`);

  let normalizedCount = 0;
  let filesCreated = 0;

  for (const file of routeFiles) {
    const relativePath = path.relative(API_DIR, file);
    console.log(`\n📄 ${relativePath}`);

    const apiDir = path.dirname(file);
    const beforeFiles = fs.readdirSync(apiDir).length;

    // Normalizar route.ts
    const wasNormalized = normalizeFile(file);
    if (wasNormalized) normalizedCount++;

    // Criar arquivos faltantes
    createMissingFiles(apiDir);

    const afterFiles = fs.readdirSync(apiDir).length;
    filesCreated += afterFiles - beforeFiles;
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Normalização concluída!");
  console.log(`📊 Estatísticas:`);
  console.log(`   - Arquivos normalizados: ${normalizedCount}`);
  console.log(`   - Arquivos criados: ${filesCreated}`);
  console.log(`   - Total processado: ${routeFiles.length}`);
  console.log("=".repeat(50) + "\n");
}

main().catch(console.error);
