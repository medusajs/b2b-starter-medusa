#!/usr/bin/env tsx
/**
 * API Validation Script
 * Valida conformidade com padrões Medusa.js
 */

import fs from "fs";
import path from "path";

const API_DIR = path.join(__dirname, "../src/api");

interface ValidationCheck {
  name: string;
  check: (content: string, dir: string) => boolean;
  severity: "error" | "warning";
}

const checks: ValidationCheck[] = [
  {
    name: "Possui validators.ts",
    check: (_, dir) => fs.existsSync(path.join(dir, "validators.ts")),
    severity: "error",
  },
  {
    name: "Possui query-config.ts",
    check: (_, dir) => fs.existsSync(path.join(dir, "query-config.ts")),
    severity: "warning",
  },
  {
    name: "Não usa AuthenticatedMedusaRequest",
    check: (content) => !content.includes("AuthenticatedMedusaRequest"),
    severity: "error",
  },
  {
    name: "Não usa validatedQuery/validatedBody",
    check: (content) =>
      !content.includes("validatedQuery") && !content.includes("validatedBody"),
    severity: "error",
  },
  {
    name: "Não usa req.scope.resolve",
    check: (content) => !content.includes("req.scope.resolve"),
    severity: "error",
  },
  {
    name: "Não usa try-catch desnecessário",
    check: (content) => !content.match(/try\s*{\s*[\s\S]*?res\.json/),
    severity: "warning",
  },
  {
    name: "Resposta padronizada",
    check: (content) =>
      content.includes("res.json({") &&
      (content.includes("count:") || content.includes("metadata")),
    severity: "warning",
  },
];

interface ValidationResult {
  file: string;
  passed: number;
  failed: number;
  warnings: number;
  issues: string[];
}

function validateFile(filePath: string): ValidationResult {
  const content = fs.readFileSync(filePath, "utf-8");
  const dir = path.dirname(filePath);
  const result: ValidationResult = {
    file: path.relative(API_DIR, filePath),
    passed: 0,
    failed: 0,
    warnings: 0,
    issues: [],
  };

  for (const check of checks) {
    const passed = check.check(content, dir);
    if (passed) {
      result.passed++;
    } else {
      if (check.severity === "error") {
        result.failed++;
        result.issues.push(`❌ ${check.name}`);
      } else {
        result.warnings++;
        result.issues.push(`⚠️  ${check.name}`);
      }
    }
  }

  return result;
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

async function main() {
  console.log("🔍 Validando conformidade de APIs...\n");

  const routeFiles = scanDirectory(API_DIR);
  const results: ValidationResult[] = [];

  for (const file of routeFiles) {
    const result = validateFile(file);
    results.push(result);
  }

  // Estatísticas
  const totalChecks = checks.length * results.length;
  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings, 0);

  const conformityRate = ((totalPassed / totalChecks) * 100).toFixed(1);

  // Exibir resultados
  console.log("📊 Resultados por arquivo:\n");

  const nonCompliant = results.filter((r) => r.failed > 0 || r.warnings > 0);

  if (nonCompliant.length === 0) {
    console.log("✅ Todos os arquivos estão conformes!\n");
  } else {
    for (const result of nonCompliant) {
      const status =
        result.failed === 0
          ? "⚠️ "
          : result.failed > 2
          ? "❌"
          : "⚠️ ";
      console.log(`${status} ${result.file}`);
      for (const issue of result.issues) {
        console.log(`   ${issue}`);
      }
      console.log();
    }
  }

  // Resumo
  console.log("=".repeat(60));
  console.log("📈 Resumo Geral:");
  console.log(`   Taxa de Conformidade: ${conformityRate}%`);
  console.log(`   ✅ Checks Passados: ${totalPassed}/${totalChecks}`);
  console.log(`   ❌ Erros: ${totalFailed}`);
  console.log(`   ⚠️  Avisos: ${totalWarnings}`);
  console.log(`   📁 Arquivos Analisados: ${results.length}`);
  console.log("=".repeat(60));

  // Status final
  if (totalFailed === 0) {
    console.log("\n✅ Validação concluída com sucesso!");
    process.exit(0);
  } else {
    console.log(
      `\n⚠️  Validação concluída com ${totalFailed} erros e ${totalWarnings} avisos.`
    );
    console.log("Execute 'npm run normalize:apis' para corrigir automaticamente.\n");
    process.exit(1);
  }
}

main().catch(console.error);
