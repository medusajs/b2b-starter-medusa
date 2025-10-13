import { loadEnv } from "@medusajs/framework/utils";
loadEnv("test", process.cwd());

const config = {
  transform: {
    "^.+\\.[jt]s$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", decorators: true },
          target: "es2022",
        },
      },
    ],
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json"],
  modulePathIgnorePatterns: ["dist/", ".medusa/server", ".medusa/admin"],
  setupFiles: ["./integration-tests/setup.js"],
  setupFilesAfterEnv: ["./integration-tests/setup-enhanced.js"],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
  // Improve performance
  maxWorkers: process.env.CI ? 2 : '50%',
  // Better error reporting
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/scripts/**',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  // Environment variables for tests
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};

// Test type specific configuration
if (process.env.TEST_TYPE === "integration:http") {
  config.testMatch = ["**/integration-tests/http/**/*.spec.[jt]s"];
  config.setupFilesAfterEnv = ["./integration-tests/setup-enhanced.js"];
} else if (process.env.TEST_TYPE === "integration:modules") {
  config.testMatch = ["**/src/modules/*/__tests__/**/*.[jt]s"];
  config.setupFilesAfterEnv = ["./integration-tests/setup-enhanced.js"];
} else if (process.env.TEST_TYPE === "integration:solar") {
  config.testMatch = ["**/integration-tests/modules/solar/**/*.spec.[jt]s"];
  config.setupFilesAfterEnv = ["./integration-tests/setup-enhanced.js"];
} else if (process.env.TEST_TYPE === "unit") {
  config.testMatch = ["**/src/**/__tests__/**/*.unit.spec.[jt]s"];
  // Unit tests don't need database setup
  config.setupFilesAfterEnv = [];
} else if (process.env.TEST_TYPE === "pact") {
  config.testMatch = ["**/pact/**/*.pact.test.[jt]s"];
  config.testTimeout = 60000;
  config.setupFilesAfterEnv = [];
}

export default config;
