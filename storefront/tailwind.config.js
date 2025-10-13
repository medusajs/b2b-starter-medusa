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
        // Expose background colors from tokens
        ...(uiTokens.color && uiTokens.color.background ? { bg: uiTokens.color.background } : {}),
        // Expose border colors from tokens
        ...(uiTokens.color && uiTokens.color.border ? { border: uiTokens.color.border } : {}),
        // Expose status colors from tokens
        ...(uiTokens.color && uiTokens.color.status ? { status: uiTokens.color.status } : {}),
        // Expose interactive colors from tokens
        ...(uiTokens.color && uiTokens.color.interactive ? { interactive: uiTokens.color.interactive } : {}),
        ysh: {
          start: "var(--ysh-start)",
          end: "var(--ysh-end)",
        },
      },
      spacing: {
        // Merge UI package spacing tokens
        ...(uiTokens.spacing || {}),
      },
      fontSize: {
        // Merge UI package font size tokens
        ...(uiTokens.font && uiTokens.font.size ? uiTokens.font.size : {}),
      },
      fontWeight: {
        // Merge UI package font weight tokens
        ...(uiTokens.font && uiTokens.font.weight ? uiTokens.font.weight : {}),
      },
      lineHeight: {
        // Merge UI package line height tokens
        ...(uiTokens.font && uiTokens.font.lineHeight ? uiTokens.font.lineHeight : {}),
      },
      letterSpacing: {
        // Merge UI package letter spacing tokens
        ...(uiTokens.font && uiTokens.font.letterSpacing ? uiTokens.font.letterSpacing : {}),
      },
      borderRadius: {
        // Merge UI package border radius tokens
        ...(uiTokens.borderRadius || {}),
      },
      borderWidth: {
        // Merge UI package border width tokens
        ...(uiTokens.borderWidth || {}),
      },
      boxShadow: {
        // Merge UI package shadow tokens
        ...(uiTokens.shadow || {}),
      },
      opacity: {
        // Merge UI package opacity tokens
        ...(uiTokens.opacity || {}),
      },
      zIndex: {
        // Merge UI package z-index tokens
        ...(uiTokens.zIndex || {}),
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
        "toast-progress": {
          from: { width: "100%" },
          to: { width: "0%" },
        },
      },
      // Map UI font tokens into theme fontFamily (if provided)
      ...(uiTokens.font
        ? {
          fontFamily: {
            ui: uiTokens.font.family?.sans ? uiTokens.font.family.sans.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')) : undefined,
            'ui-mono': uiTokens.font.family?.mono ? uiTokens.font.family.mono.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')) : undefined,
            'ui-display': uiTokens.font.family?.display ? uiTokens.font.family.display.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')) : undefined,
          },
        }
        : {}),
      animation: {
        "accordion-open": "accordion-open 0.3s ease-out",
        "accordion-close": "accordion-close 0.3s ease-out",
        "toast-progress": "toast-progress linear forwards",
      },
      transitionDuration: {
        // Merge UI package transition duration tokens
        ...(uiTokens.transition && uiTokens.transition.duration ? uiTokens.transition.duration : {}),
      },
      transitionTimingFunction: {
        // Merge UI package transition timing tokens
        ...(uiTokens.transition && uiTokens.transition.timing ? uiTokens.transition.timing : {}),
      },
    },
  },
}
