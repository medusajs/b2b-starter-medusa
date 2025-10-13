/**
 * 🔧 YSH Monorepo - Root ESLint Configuration
 * Governa consistência entre /server (Medusa) e /client (Next.js)
 */

module.exports = {
    root: true,
    env: {
        node: true,
        es2022: true,
    },
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'plugin:import/recommended',
        'plugin:import/typescript',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint', 'import'],
    settings: {
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true,
            },
        },
    },
    rules: {
        // TypeScript strict rules
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-empty-function': 'warn',

        // Import rules for absolute paths
        'import/no-unresolved': 'error',
        'import/order': [
            'error',
            {
                groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
                'newlines-between': 'always',
                alphabetize: { order: 'asc', caseInsensitive: true },
            },
        ],
        'import/no-relative-packages': 'error',

        // General rules
        'no-console': 'warn',
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-arrow-callback': 'error',
    },
    overrides: [
        // Server (Medusa) specific
        {
            files: ['server/**/*.ts', 'server/**/*.tsx'],
            env: { node: true },
            rules: {
                'no-console': 'off', // Allow console in server for logging
            },
        },
        // Client (Next.js) specific
        {
            files: ['client/**/*.ts', 'client/**/*.tsx'],
            env: { browser: true, node: false },
            extends: ['next/core-web-vitals'],
            rules: {
                'react-hooks/exhaustive-deps': 'warn',
            },
        },
        // Test files
        {
            files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.spec.ts'],
            env: { jest: true },
            rules: {
                '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
                'no-console': 'off',
            },
        },
    ],
    ignorePatterns: [
        'node_modules/',
        '.next/',
        'dist/',
        'build/',
        '*.js',
        '*.d.ts',
        '.yarn/',
    ],
};