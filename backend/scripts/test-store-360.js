#!/usr/bin/env node
/**
 * 🧪 YSH Store 360º - Test Runner
 * Executa todos os testes de validação e preload
 * 
 * Usage: node test-store-360.js [--skip-preload] [--skip-validation]
 */

const { spawn } = require('child_process');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const TESTS = [
    {
        name: 'Internal Catalog Validation',
        command: 'node',
        args: ['scripts/validate-catalog-apis.js'],
        cwd: path.join(__dirname, '..')
    },
    {
        name: 'Store 360º Validation',
        command: 'node',
        args: ['scripts/validate-store-360.js'],
        cwd: path.join(__dirname, '..')
    },
    {
        name: 'Internal Catalog Preload',
        command: 'node',
        args: ['scripts/preload-catalog.js'],
        cwd: path.join(__dirname, '..')
    },
    {
        name: 'Store 360º Preload',
        command: 'node',
        args: ['scripts/preload-store-360.js'],
        cwd: path.join(__dirname, '..')
    }
];

// ============================================================================
// Test Runner
// ============================================================================

class TestRunner {
    constructor(options = {}) {
        this.options = {
            skipPreload: options.skipPreload || false,
            skipValidation: options.skipValidation || false,
            verbose: options.verbose || false
        };
        this.results = [];
        this.startTime = Date.now();
    }

    log(message, level = 'info') {
        const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
        const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : 'ℹ️ ';
        console.log(`[${elapsed}s] ${prefix} ${message}`);
    }

    async runTest(test) {
        // Skip if configured
        if (this.options.skipPreload && test.name.includes('Preload')) {
            this.log(`Skipping ${test.name} (--skip-preload)`, 'info');
            return { name: test.name, status: 'skipped' };
        }
        if (this.options.skipValidation && test.name.includes('Validation')) {
            this.log(`Skipping ${test.name} (--skip-validation)`, 'info');
            return { name: test.name, status: 'skipped' };
        }

        this.log(`Running ${test.name}...`);
        const testStartTime = Date.now();

        return new Promise((resolve) => {
            const proc = spawn(test.command, test.args, {
                cwd: test.cwd,
                stdio: this.options.verbose ? 'inherit' : 'pipe'
            });

            let stdout = '';
            let stderr = '';

            if (!this.options.verbose) {
                proc.stdout?.on('data', (data) => {
                    stdout += data.toString();
                });
                proc.stderr?.on('data', (data) => {
                    stderr += data.toString();
                });
            }

            proc.on('close', (code) => {
                const duration = Date.now() - testStartTime;
                const result = {
                    name: test.name,
                    status: code === 0 ? 'passed' : 'failed',
                    exitCode: code,
                    durationMs: duration,
                    stdout: this.options.verbose ? null : stdout,
                    stderr: this.options.verbose ? null : stderr
                };

                if (code === 0) {
                    this.log(`${test.name} passed (${duration}ms)`, 'success');
                } else {
                    this.log(`${test.name} failed with exit code ${code} (${duration}ms)`, 'error');
                    if (!this.options.verbose && stderr) {
                        console.log('\nError output:');
                        console.log(stderr);
                    }
                }

                resolve(result);
            });

            proc.on('error', (err) => {
                const duration = Date.now() - testStartTime;
                this.log(`${test.name} error: ${err.message} (${duration}ms)`, 'error');
                resolve({
                    name: test.name,
                    status: 'error',
                    error: err.message,
                    durationMs: duration
                });
            });
        });
    }

    async runAll() {
        this.log('🧪 Starting YSH Store 360º Test Suite...');
        this.log('═'.repeat(80));

        for (const test of TESTS) {
            const result = await this.runTest(test);
            this.results.push(result);
        }

        return this.generateReport();
    }

    generateReport() {
        const passed = this.results.filter(r => r.status === 'passed');
        const failed = this.results.filter(r => r.status === 'failed');
        const skipped = this.results.filter(r => r.status === 'skipped');
        const errors = this.results.filter(r => r.status === 'error');

        const totalDuration = this.results.reduce((sum, r) => sum + (r.durationMs || 0), 0);

        return {
            timestamp: new Date().toISOString(),
            totalTimeMs: Date.now() - this.startTime,
            summary: {
                total: this.results.length,
                passed: passed.length,
                failed: failed.length,
                skipped: skipped.length,
                errors: errors.length,
                successRate: this.results.length > 0 ?
                    `${((passed.length / (this.results.length - skipped.length)) * 100).toFixed(1)}%` :
                    '0%'
            },
            performance: {
                totalTestDurationMs: totalDuration,
                avgTestDurationMs: this.results.length > 0 ? Math.round(totalDuration / this.results.length) : 0
            },
            results: this.results
        };
    }

    printReport(report) {
        this.log('\n📊 Test Suite Report:');
        this.log('═'.repeat(80));

        // Summary
        this.log(`\n📦 Summary:`);
        this.log(`   Total Tests: ${report.summary.total}`);
        this.log(`   ✅ Passed: ${report.summary.passed}`);
        this.log(`   ❌ Failed: ${report.summary.failed}`);
        this.log(`   ⏭️  Skipped: ${report.summary.skipped}`);
        this.log(`   ⚠️  Errors: ${report.summary.errors}`);
        this.log(`   📈 Success Rate: ${report.summary.successRate}`);

        // Performance
        this.log(`\n⚡ Performance:`);
        this.log(`   Total Time: ${(report.totalTimeMs / 1000).toFixed(2)}s`);
        this.log(`   Avg Test Duration: ${report.performance.avgTestDurationMs}ms`);

        // Test details
        this.log(`\n📋 Test Details:`);
        this.log('─'.repeat(80));

        for (const result of report.results) {
            const icon = result.status === 'passed' ? '✅' :
                result.status === 'failed' ? '❌' :
                    result.status === 'skipped' ? '⏭️ ' : '⚠️ ';
            const duration = result.durationMs ? `${result.durationMs}ms` : 'N/A';
            this.log(`${icon} ${result.name.padEnd(35)} ${duration.padStart(8)}`);
        }

        this.log('═'.repeat(80));

        // Overall result
        if (report.summary.failed === 0 && report.summary.errors === 0) {
            this.log('\n🎉 All tests passed!', 'success');
        } else {
            this.log(`\n⚠️  ${report.summary.failed + report.summary.errors} test(s) failed`, 'error');
        }
    }
}

// ============================================================================
// CLI
// ============================================================================

async function main() {
    const args = process.argv.slice(2);
    const options = {
        skipPreload: args.includes('--skip-preload'),
        skipValidation: args.includes('--skip-validation'),
        verbose: args.includes('--verbose') || args.includes('-v')
    };

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
YSH Store 360º Test Runner

Usage: node test-store-360.js [options]

Options:
  --skip-preload      Skip preload tests
  --skip-validation   Skip validation tests
  --verbose, -v       Show detailed output from tests
  --help, -h          Show this help message

Tests:
  1. Internal Catalog Validation
  2. Store 360º Validation
  3. Internal Catalog Preload
  4. Store 360º Preload
        `);
        process.exit(0);
    }

    const runner = new TestRunner(options);

    try {
        const report = await runner.runAll();
        runner.printReport(report);

        if (report.summary.failed === 0 && report.summary.errors === 0) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { TestRunner };
