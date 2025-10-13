/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'yello-solar': 'var(--ysh-start)',
            },
        },
    },
    plugins: [],
}