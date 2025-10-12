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

    // Function node settings
    functionGlobalContext: {
        // Environment variables
        BACKEND_URL: process.env.BACKEND_URL || 'http://backend:9000',
        STOREFRONT_URL: process.env.STOREFRONT_URL || 'http://storefront:8000',
        POSTGRES_URL: process.env.DATABASE_URL || 'postgres://postgres:postgres@postgres:5432/medusa-backend',
        REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379',

        // GitHub settings
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
        GITHUB_REPO: process.env.GITHUB_REPO || 'own-boldsbrain/ysh-b2b',

        // Chromatic settings
        CHROMATIC_PROJECT_TOKEN: process.env.CHROMATIC_PROJECT_TOKEN,

        // Pact Broker settings
        PACT_BROKER_URL: process.env.PACT_BROKER_URL || 'http://localhost:9292',
        PACT_BROKER_TOKEN: process.env.PACT_BROKER_TOKEN,

        // Notification settings
        SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
        EMAIL_CONFIG: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
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
