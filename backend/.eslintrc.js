module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    plugins: ['@typescript-eslint'],
    env: {
        node: true,
        es2021: true,
        jest: true,
    },
    rules: {
        // Warnings for gradual adoption
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
        }],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'warn',

        // Medusa-specific
        '@typescript-eslint/ban-ts-comment': 'warn',
        'no-console': ['warn', { allow: ['warn', 'error'] }],

        // Code quality
        'no-debugger': 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        'prefer-arrow-callback': 'warn',
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        '.medusa/',
        '*.js',
        'jest.config.js',
        'mikro-orm.config.ts',
    ],
};
