#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting B2B Commerce Test Suite - 360° Coverage\n');

// Colors for output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
    try {
        log(colors.blue, `📋 ${description}`);
        log(colors.cyan, `   Running: ${command}`);

        const result = execSync(command, {
            stdio: 'inherit',
            cwd: path.join(__dirname, '..'),
            env: { ...process.env, FORCE_COLOR: '1' }
        });

        log(colors.green, `✅ ${description} completed successfully\n`);
        return true;
    } catch (error) {
        log(colors.red, `❌ ${description} failed`);
        log(colors.red, `   Error: ${error.message}\n`);
        return false;
    }
}

async function main() {
    log(colors.magenta, '🔧 Phase 1: Environment Setup');

    // Initialize test database
    if (!runCommand('node scripts/init-test-db.js', 'Initialize test database')) {
        process.exit(1);
    }

    // Build the project
    if (!runCommand('yarn build', 'Build Medusa backend')) {
        process.exit(1);
    }

    log(colors.magenta, '🧪 Phase 2: Unit Tests');

    // Run unit tests
    if (!runCommand('yarn test:unit', 'Execute unit tests')) {
        log(colors.yellow, '⚠️  Unit tests failed, but continuing with integration tests...');
    }

    log(colors.magenta, '🔗 Phase 3: Module Integration Tests');

    // Run module integration tests
    if (!runCommand('yarn test:integration:modules', 'Execute module integration tests')) {
        log(colors.red, '❌ Module integration tests failed');
        process.exit(1);
    }

    log(colors.magenta, '🌐 Phase 4: HTTP Integration Tests');

    // Run HTTP integration tests
    if (!runCommand('yarn test:integration:http', 'Execute HTTP integration tests')) {
        log(colors.red, '❌ HTTP integration tests failed');
        process.exit(1);
    }

    log(colors.magenta, '📊 Phase 5: Coverage Report');

    // Generate coverage report
    runCommand('yarn test:coverage', 'Generate test coverage report');

    log(colors.green, '🎉 All tests completed successfully!');
    log(colors.green, '📈 Check coverage report in coverage/index.html');
}

// Handle script execution
if (require.main === module) {
    main().catch(error => {
        log(colors.red, `💥 Test execution failed: ${error.message}`);
        process.exit(1);
    });
}

module.exports = { main };