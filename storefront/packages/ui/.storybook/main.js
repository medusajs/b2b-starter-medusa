module.exports = {
    stories: ['../stories/**/*.stories.@(ts|tsx|js|jsx)'],
    addons: ['@storybook/addon-essentials', '@storybook/addon-a11y'],
    framework: '@storybook/react',
    core: {
        builder: 'webpack5'
    }
};
