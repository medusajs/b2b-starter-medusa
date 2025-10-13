#!/usr/bin/env node

/**
 * Script de validação de API Keys
 * Verifica se todas as chaves de API necessárias estão configuradas
 */

require('dotenv').config();

const chalk = require('chalk');

const REQUIRED_API_KEYS = [
  {
    name: 'OPENAI_API_KEY',
    env: process.env.OPENAI_API_KEY,
    description: 'OpenAI API for embeddings and GPT-4',
    required: true,
    pattern: /^sk-[a-zA-Z0-9\-_]{20,}$/,
    getUrl: 'https://platform.openai.com/api-keys',
  },
  {
    name: 'QDRANT_API_KEY',
    env: process.env.QDRANT_API_KEY,
    description: 'Qdrant Vector Database API key',
    required: true,
    pattern: /^[a-zA-Z0-9\-_]{10,}$/,
    getUrl: 'https://cloud.qdrant.io/',
  },
  {
    name: 'QDRANT_URL',
    env: process.env.QDRANT_URL,
    description: 'Qdrant Vector Database URL',
    required: true,
    pattern: /^https?:\/\/.+/,
    default: 'http://localhost:6333',
    getUrl: 'https://cloud.qdrant.io/',
  },
];

const OPTIONAL_API_KEYS = [
  {
    name: 'JWT_SECRET',
    env: process.env.JWT_SECRET,
    description: 'JWT secret for authentication',
    pattern: /.{10,}/,
  },
  {
    name: 'COOKIE_SECRET',
    env: process.env.COOKIE_SECRET,
    description: 'Cookie secret for session management',
    pattern: /.{10,}/,
  },
];

console.log(chalk.bold.blue('\n🔑 Validando API Keys do Backend YSH\n'));

let hasErrors = false;
let hasWarnings = false;

// Validar chaves obrigatórias
console.log(chalk.bold('📋 Chaves Obrigatórias:'));
REQUIRED_API_KEYS.forEach((key) => {
  const isConfigured = !!key.env;
  const isValid = isConfigured && key.pattern.test(key.env);

  if (!isConfigured) {
    console.log(chalk.red(`  ❌ ${key.name}: NÃO CONFIGURADA`));
    console.log(chalk.gray(`     ${key.description}`));
    console.log(chalk.gray(`     Obter em: ${key.getUrl}`));
    if (key.default) {
      console.log(chalk.gray(`     Valor padrão: ${key.default}`));
    }
    hasErrors = true;
  } else if (!isValid) {
    console.log(chalk.yellow(`  ⚠️  ${key.name}: FORMATO INVÁLIDO`));
    console.log(chalk.gray(`     ${key.description}`));
    console.log(chalk.gray(`     Formato esperado: ${key.pattern}`));
    hasWarnings = true;
  } else {
    const maskedValue = key.env.substring(0, 8) + '...' + key.env.substring(key.env.length - 4);
    console.log(chalk.green(`  ✅ ${key.name}: ${maskedValue}`));
  }
});

// Validar chaves opcionais
console.log(chalk.bold('\n📋 Chaves Opcionais:'));
OPTIONAL_API_KEYS.forEach((key) => {
  const isConfigured = !!key.env;
  const isValid = isConfigured && key.pattern.test(key.env);

  if (!isConfigured) {
    console.log(chalk.gray(`  ⓘ  ${key.name}: não configurada`));
    console.log(chalk.gray(`     ${key.description}`));
  } else if (!isValid) {
    console.log(chalk.yellow(`  ⚠️  ${key.name}: FORMATO INVÁLIDO`));
    console.log(chalk.gray(`     ${key.description}`));
    hasWarnings = true;
  } else {
    const maskedValue = key.env.substring(0, 4) + '...' + key.env.substring(key.env.length - 2);
    console.log(chalk.green(`  ✅ ${key.name}: ${maskedValue}`));
  }
});

// Resumo
console.log(chalk.bold('\n📊 Resumo:\n'));

if (hasErrors) {
  console.log(chalk.red.bold('❌ Validação FALHOU - Chaves obrigatórias não configuradas'));
  console.log(chalk.yellow('\n💡 Como configurar:'));
  console.log(chalk.gray('   1. Copie .env.template para .env:'));
  console.log(chalk.gray('      cp .env.template .env'));
  console.log(chalk.gray('   2. Adicione suas chaves no arquivo .env'));
  console.log(chalk.gray('   3. Consulte API_KEYS_GUIDE.md para mais detalhes\n'));
  process.exit(1);
}

if (hasWarnings) {
  console.log(chalk.yellow.bold('⚠️  Validação OK com AVISOS - Verifique os formatos acima'));
  console.log(chalk.gray('\n💡 Os endpoints RAG podem não funcionar corretamente\n'));
  process.exit(0);
}

console.log(chalk.green.bold('✅ Validação OK - Todas as chaves estão configuradas corretamente'));
console.log(chalk.gray('\n💡 Os endpoints RAG estão prontos para uso:'));
console.log(chalk.gray('   - POST /store/rag/ask-helio (chat conversacional)'));
console.log(chalk.gray('   - POST /store/rag/recommend-products (recomendações)'));
console.log(chalk.gray('   - POST /store/rag/search (busca semântica)\n'));
process.exit(0);
