const { loadEnv } = require("@medusajs/framework/utils");
loadEnv("test", process.cwd());

module.exports = {
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
  module.exports.testMatch = ["**/integration-tests/http/**/*.spec.[jt]s"];
  module.exports.setupFilesAfterEnv = ["./integration-tests/setup-enhanced.js"];
} else if (process.env.TEST_TYPE === "integration:modules") {
  module.exports.testMatch = ["**/src/modules/*/__tests__/**/*.[jt]s"];
  module.exports.setupFilesAfterEnv = ["./integration-tests/setup-enhanced.js"];
} else if (process.env.TEST_TYPE === "integration:solar") {
  module.exports.testMatch = ["**/integration-tests/modules/solar/**/*.spec.[jt]s"];
  module.exports.setupFilesAfterEnv = ["./integration-tests/setup-enhanced.js"];
} else if (process.env.TEST_TYPE === "unit") {
  module.exports.testMatch = ["**/src/**/__tests__/**/*.unit.spec.[jt]s"];
  // Unit tests don't need database setup
  module.exports.setupFilesAfterEnv = [];
} else if (process.env.TEST_TYPE === "pact") {
  module.exports.testMatch = ["**/pact/**/*.pact.test.[jt]s"];
  module.exports.testTimeout = 60000;
  module.exports.setupFilesAfterEnv = [];
}
