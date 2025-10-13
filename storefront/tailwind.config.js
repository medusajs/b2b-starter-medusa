const { tailwindYelloColors } = require("./src/lib/design-system/colors")
// Try to load tokens exported by the local UI package. If not available, fall back to empty.
let uiTokens = {};
try {
  uiTokens = require('./packages/ui/src/theme/tokens.json');
} catch (err) {
  uiTokens = {};
}
const path = require("path")
const uiPath = path.resolve(
  require.resolve("@medusajs/ui"),
  "../..",
  "**/*.{js,jsx,ts,tsx}"
)

module.exports = {
  darkMode: "class",
  presets: [require("@medusajs/ui-preset")],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/modules/**/*.{js,ts,jsx,tsx}",
    uiPath,
  ],
  theme: {
    extend: {
      maxWidth: {
        "8xl": "100rem",
      },
      screens: {
        "2xsmall": "320px",
        xsmall: "512px",
        small: "1024px",
        medium: "1280px",
        large: "1440px",
        xlarge: "1680px",
        "2xlarge": "1920px",
      },
      fontFamily: {
        sans: ["Geist Sans", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "Fira Code", "monospace"],
      },
      colors: {
        ...tailwindYelloColors,
        // Merge UI package color tokens as `brand` if present
        ...(uiTokens.color && uiTokens.color.brand ? { brand: uiTokens.color.brand } : {}),
        // Expose semantic text colors from tokens if present
        ...(uiTokens.color && uiTokens.color.text ? { text: uiTokens.color.text } : {}),
        ysh: {
          start: "var(--ysh-start)",
          end: "var(--ysh-end)",
        },
      },
      strokeWidth: { 1: "1px" },
      keyframes: {
        "accordion-open": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-close": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      // Map UI package spacing tokens under `ui-*` keys to avoid clashing with Tailwind defaults
      ...(uiTokens.spacing
        ? Object.fromEntries(Object.entries(uiTokens.spacing).map(([k, v]) => [`ui-${k}`, v]))
        : {}),
      // Map UI font tokens into theme fontFamily (if provided)
      ...(uiTokens.font
        ? {
          fontFamily: {
            ui: uiTokens.font.body ? uiTokens.font.body.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')) : undefined,
          },
        }
        : {}),
      animation: {
        "accordion-open": "accordion-open 0.3s ease-out",
        "accordion-close": "accordion-close 0.3s ease-out",
      },
    },
  },
}
