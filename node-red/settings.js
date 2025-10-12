/**
 * Node-RED Settings Configuration
 * YSH B2B Store - Automation Engine
 */

module.exports = {
    // Flow file settings
    flowFile: 'flows/flows.json',
    flowFilePretty: true,

    // Credentials encryption
    credentialSecret: process.env.NODE_RED_CREDENTIAL_SECRET || "ysh-b2b-nodered-secret-key",

    // User directory
    userDir: '/data',

    // Admin HTTP settings
    uiPort: process.env.PORT || 1880,
    uiHost: "0.0.0.0",

    // HTTP Node settings
    httpNodeRoot: '/api',
    httpAdminRoot: '/',
    httpStatic: '/data/static',

    // Security
    adminAuth: {
        type: "credentials",
        users: [{
            username: "admin",
            password: "$2b$08$XnZP8zKq3Y5x9X5x9X5x9.X5x9X5x9X5x9X5x9X5x9X5x9X5x9X5x",
            permissions: "*"
        }]
    },

    // Editor settings
    editorTheme: {
        projects: {
            enabled: true
        },
        palette: {
            catalogues: [
                'https://catalogue.nodered.org/catalogue.json'
            ]
        },
        header: {
            title: "YSH B2B - Automation Engine",
            image: "/absolute/path/to/icon.png"
        }
    },

    // Logging
    logging: {
        console: {
            level: "info",
            metrics: false,
            audit: false
        }
    },

    // Context storage
    contextStorage: {
        default: {
            module: "memory"
        },
        file: {
            module: "localfilesystem"
        }
    },

    // Function node settings (100% FOSS Stack)
    functionGlobalContext: {
        // Environment variables
        BACKEND_URL: process.env.BACKEND_URL || 'http://backend:9000',
        STOREFRONT_URL: process.env.STOREFRONT_URL || 'http://storefront:8000',
        POSTGRES_URL: process.env.DATABASE_URL || 'postgres://postgres:postgres@postgres:5432/medusa-backend',
        REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379',

        // GitHub settings
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        GITHUB_REPO: process.env.GITHUB_REPO || 'own-boldsbrain/ysh-b2b',

        // Pact Broker settings (FOSS - self-hosted)
        PACT_BROKER_URL: process.env.PACT_BROKER_URL || 'http://pact-broker:9292',
        PACT_BROKER_USERNAME: process.env.PACT_BROKER_USERNAME || 'pact',
        PACT_BROKER_PASSWORD: process.env.PACT_BROKER_PASSWORD || 'pact',

        // BackstopJS settings (FOSS - visual regression)
        BACKSTOP_CONFIG_PATH: process.env.BACKSTOP_CONFIG_PATH || '/workspace/storefront/backstop/backstop.json',
        BACKSTOP_DOCKER_IMAGE: process.env.BACKSTOP_DOCKER_IMAGE || 'backstopjs/backstopjs:latest',

        // Mailhog settings (FOSS - email testing)
        MAILHOG_SMTP_HOST: process.env.MAILHOG_SMTP_HOST || 'mailhog',
        MAILHOG_SMTP_PORT: process.env.MAILHOG_SMTP_PORT || 1025,
        MAILHOG_UI_URL: process.env.MAILHOG_UI_URL || 'http://mailhog:8025',

        // Notification settings (FOSS alternatives)
        SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
        EMAIL_CONFIG: {
            host: process.env.SMTP_HOST || 'mailhog',
            port: process.env.SMTP_PORT || 1025,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || ''
            }
        }
    },

    // Export settings
    exportGlobalContextKeys: false,

    // Debug settings
    debugMaxLength: 1000,
    debugUseColors: true,

    // Exec node settings (allow command execution)
    execMaxBufferSize: 10000000,

    // Function timeout
    functionTimeout: 0
}
