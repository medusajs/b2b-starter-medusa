#!/usr/bin/env node

/**
 * 🔍 YSH Monorepo - PR Checklist Validator
 * Validates PR quality gates automatically
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHECKS = {
    eslint: {
        name: 'ESLint',
        command: 'yarn lint',
        description: 'Code linting passes'
    },
    typecheck: {
        name: 'TypeScript',
        command: 'yarn typecheck',
        description: 'Type checking passes'
    },
    format: {
        name: 'Prettier',
        command: 'yarn format:check',
        description: 'Code formatting is correct'
    },
    test: {
        name: 'Tests',
        command: 'yarn test:unit',
        description: 'Unit tests pass'
    }
};

const WORKSPACES = ['server', 'client'];

function runCommand(command, cwd = process.cwd()) {
    try {
        execSync(command, { cwd, stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error(`❌ Failed: ${command}`);
        return false;
    }
}

function checkImports(workspace) {
    const srcPath = path.join(workspace, 'src');
    if (!fs.existsSync(srcPath)) return true;

    let hasIssues = false;
    const files = getAllFiles(srcPath);

    files.forEach(file => {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                // Check for relative imports
                if (line.includes('from \'../') || line.includes('from "../../')) {
                    console.error(`❌ Relative import in ${file}:${index + 1}: ${line.trim()}`);
                    hasIssues = true;
                }
            });
        }
    });

    return !hasIssues;
}

function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

function checkEnvFiles() {
    const requiredFiles = [
        '.env.example',
        'server/.env.example',
        'client/.env.example'
    ];

    let allPresent = true;
    requiredFiles.forEach(file => {
        if (!fs.existsSync(file)) {
            console.error(`❌ Missing environment file: ${file}`);
            allPresent = false;
        }
    });

    return allPresent;
}

function main() {
    console.log('🚀 YSH Monorepo - PR Quality Gate Check\n');

    let allPassed = true;

    // Run quality checks
    Object.entries(CHECKS).forEach(([key, check]) => {
        console.log(`🔍 Running ${check.name}...`);
        const passed = runCommand(check.command);
        if (passed) {
            console.log(`✅ ${check.description}\n`);
        } else {
            console.log(`❌ ${check.description}\n`);
            allPassed = false;
        }
    });

    // Check imports in workspaces
    console.log('🔍 Checking import patterns...');
    WORKSPACES.forEach(workspace => {
        if (fs.existsSync(workspace)) {
            const importsOk = checkImports(workspace);
            if (importsOk) {
                console.log(`✅ ${workspace}: Absolute imports OK`);
            } else {
                console.log(`❌ ${workspace}: Found relative imports`);
                allPassed = false;
            }
        }
    });
    console.log('');

    // Check environment files
    console.log('🔍 Checking environment configuration...');
    const envOk = checkEnvFiles();
    if (envOk) {
        console.log('✅ Environment files present\n');
    } else {
        console.log('❌ Missing environment files\n');
        allPassed = false;
    }

    // Final result
    if (allPassed) {
        console.log('🎉 All quality gates passed! PR is ready.');
        process.exit(0);
    } else {
        console.log('❌ Some quality gates failed. Please fix issues before merging.');
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}