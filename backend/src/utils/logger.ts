import pino from "pino";

/**
 * Structured logger configuration
 * Uses pino for high-performance JSON logging
 */
const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";

export const logger = pino({
    level: process.env.LOG_LEVEL || (isProduction ? "info" : "debug"),

    // Pretty print in development
    transport: isDevelopment
        ? {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
            },
        }
        : undefined,

    // Production: structured JSON
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },

    // Add timestamp
    timestamp: pino.stdTimeFunctions.isoTime,

    // Serialize errors properly
    serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
    },

    // Base fields for all logs
    base: {
        service: "medusa-backend",
        env: process.env.NODE_ENV || "development",
    },
});

/**
 * Create child logger with context
 * @example
 * const log = createLogger({ module: 'company', action: 'create' });
 * log.info({ companyId: '123' }, 'Company created');
 */
export function createLogger(context: Record<string, any>) {
    return logger.child(context);
}

/**
 * Log levels:
 * - trace: Very detailed, typically not enabled
 * - debug: Detailed info for debugging
 * - info: General information
 * - warn: Warning messages
 * - error: Error messages
 * - fatal: Fatal errors, app should exit
 * 
 * @example
 * logger.info({ userId: '123' }, 'User logged in');
 * logger.error({ err, orderId: '456' }, 'Failed to process order');
 * logger.debug({ query, results: data.length }, 'Database query executed');
 */

export default logger;
