import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration
 * YSH Solar - Storefront E2E Tests
 * 
 * @see https://playwright.dev/docs/test-configuration
 */

export default defineConfig({
    // Test directory
    testDir: './e2e',

    // Glob patterns for test files
    testMatch: '**/*.spec.ts',

    // Maximum time one test can run (30s)
    timeout: 30 * 1000,

    // Maximum time for expect() assertions (5s)
    expect: {
        timeout: 5 * 1000,
    },

    // Run tests in files in parallel
    fullyParallel: true,

    // Fail the build on CI if you accidentally left test.only in the source code
    forbidOnly: !!process.env.CI,

    // Retry on CI only
    retries: process.env.CI ? 2 : 0,

    // Opt out of parallel tests on CI
    workers: process.env.CI ? 1 : undefined,

    // Reporter to use
    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['list'],
        process.env.CI ? ['github'] : ['line'],
    ],

    // Shared settings for all projects
    use: {
        // Base URL to use in actions like `await page.goto('/')`
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',

        // Collect trace when retrying the failed test
        trace: 'on-first-retry',

        // Capture screenshot after each test failure
        screenshot: 'only-on-failure',

        // Record video only when retrying a test for the first time
        video: 'retain-on-failure',

        // Maximum time for each action (10s)
        actionTimeout: 10 * 1000,

        // Maximum time for navigation (30s)
        navigationTimeout: 30 * 1000,

        // Viewport size
        viewport: { width: 1280, height: 720 },

        // Emulate color scheme
        colorScheme: 'light',

        // Locale
        locale: 'pt-BR',

        // Timezone
        timezoneId: 'America/Sao_Paulo',

        // Permissions
        permissions: ['geolocation'],

        // Geolocation (São Paulo)
        geolocation: { latitude: -23.5505, longitude: -46.6333 },
    },

    // Configure projects for major browsers
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                // Disable headless to see browser (debug)
                // headless: false,
            },
        },

        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },

        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },

        // Mobile browsers
        {
            name: 'Mobile Chrome',
            use: {
                ...devices['Pixel 5'],
                // Override viewport for consistency
                viewport: { width: 375, height: 667 },
            },
        },

        {
            name: 'Mobile Safari',
            use: {
                ...devices['iPhone 12'],
                viewport: { width: 390, height: 844 },
            },
        },

        // Tablet
        {
            name: 'iPad',
            use: {
                ...devices['iPad Pro'],
                viewport: { width: 1024, height: 1366 },
            },
        },

        // Edge
        {
            name: 'Microsoft Edge',
            use: {
                ...devices['Desktop Edge'],
                channel: 'msedge',
            },
        },

        // Chrome Beta (cutting edge testing)
        {
            name: 'Chrome Beta',
            use: {
                ...devices['Desktop Chrome'],
                channel: 'chrome-beta',
            },
        },
    ],

    // Run your local dev server before starting the tests
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000, // 2 minutes to start server
        stdout: 'ignore',
        stderr: 'pipe',
    },

    // Folder for test artifacts such as screenshots, videos, traces, etc.
    outputDir: 'test-results/',

    // Global setup/teardown
    // globalSetup: require.resolve('./e2e/global-setup'),
    // globalTeardown: require.resolve('./e2e/global-teardown'),
})
