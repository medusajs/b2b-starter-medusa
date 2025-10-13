const path = require("path")
const uiPath = path.resolve(
  require.resolve("@medusajs/ui"),
  "../..",
  "**/*.{js,jsx,ts,tsx}"
)

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@medusajs/ui-preset")],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    uiPath,
  ],
  theme: {
    extend: {
      colors: {
        ysh: {
          start: "var(--ysh-start)",
          end: "var(--ysh-end)",
        },
      },
      strokeWidth: { 1: "1px" },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
