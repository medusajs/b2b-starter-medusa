module.exports = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: false,
    printWidth: 100,
    tabWidth: 2,
    useTabs: false,
    arrowParens: 'always',
    endOfLine: 'lf',
    bracketSpacing: true,
    overrides: [
        {
            files: '*.json',
            options: {
                printWidth: 80,
            },
        },
    ],
};
