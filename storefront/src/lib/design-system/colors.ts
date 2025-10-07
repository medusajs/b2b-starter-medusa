/**
 * Yello Solar Hub Design System - Color Tokens
 * Based on the brand gradient: #FFCE00 → #FF6600 → #FF0066
 */

export const yello = {
    // Primary Brand Colors - Solar Energy Theme
    yellow: {
        50: "#FFFBF0",
        100: "#FFF3CD",
        200: "#FFE59C",
        300: "#FFD666",
        400: "#FFCE00", // Primary Yellow
        500: "#E6B800",
        600: "#CC9900",
        700: "#B38600",
        800: "#996600",
        900: "#804D00",
    },
    orange: {
        50: "#FFF8F5",
        100: "#FFE8E0",
        200: "#FFD1C2",
        300: "#FFB59C",
        400: "#FF8F66",
        500: "#FF6600", // Primary Orange
        600: "#E65C00",
        700: "#CC5200",
        800: "#B34700",
        900: "#993D00",
    },
    magenta: {
        50: "#FFF5F8",
        100: "#FFE0E8",
        200: "#FFC2D1",
        300: "#FF99B3",
        400: "#FF6699",
        500: "#FF0066", // Primary Magenta
        600: "#E6005C",
        700: "#CC0052",
        800: "#B30047",
        900: "#99003D",
    },

    // Neutral Colors
    gray: {
        50: "#F8F9FA",
        100: "#E9ECEF",
        200: "#DEE2E6",
        300: "#CED4DA",
        400: "#ADB5BD",
        500: "#6C757D",
        600: "#495057",
        700: "#343A40",
        800: "#212529",
        900: "#000000",
    },

    // Semantic Colors
    success: "#00AA44",
    warning: "#FFCE00",
    error: "#DC3545",
    info: "#0066CC",
} as const;

/**
 * Medusa UI Token Mapping
 * Maps Yello colors to Medusa UI CSS variables for seamless integration
 */
export const medusaYelloTokens = {
    // Primary Colors
    "--medusa-color-primary": yello.yellow[400],
    "--medusa-color-primary-hover": yello.yellow[500],
    "--medusa-color-primary-pressed": yello.yellow[600],

    // Secondary Colors
    "--medusa-color-secondary": yello.orange[400],
    "--medusa-color-secondary-hover": yello.orange[500],
    "--medusa-color-secondary-pressed": yello.orange[600],

    // Accent Colors
    "--medusa-color-accent": yello.magenta[400],
    "--medusa-color-accent-hover": yello.magenta[500],
    "--medusa-color-accent-pressed": yello.magenta[600],

    // Neutral Colors
    "--medusa-color-neutral-50": yello.gray[50],
    "--medusa-color-neutral-100": yello.gray[100],
    "--medusa-color-neutral-200": yello.gray[200],
    "--medusa-color-neutral-300": yello.gray[300],
    "--medusa-color-neutral-400": yello.gray[400],
    "--medusa-color-neutral-500": yello.gray[500],
    "--medusa-color-neutral-600": yello.gray[600],
    "--medusa-color-neutral-700": yello.gray[700],
    "--medusa-color-neutral-800": yello.gray[800],
    "--medusa-color-neutral-900": yello.gray[900],

    // Semantic Colors
    "--medusa-color-success": yello.success,
    "--medusa-color-warning": yello.warning,
    "--medusa-color-error": yello.error,
    "--medusa-color-info": yello.info,

    // Background Colors
    "--medusa-color-bg-base": "#FFFFFF",
    "--medusa-color-bg-subtle": yello.gray[50],
    "--medusa-color-bg-overlay": "rgba(0, 0, 0, 0.5)",

    // Border Colors
    "--medusa-color-border-base": yello.gray[200],
    "--medusa-color-border-strong": yello.gray[300],
    "--medusa-color-border-focus": yello.yellow[400],

    // Text Colors
    "--medusa-color-text-primary": yello.gray[900],
    "--medusa-color-text-secondary": yello.gray[600],
    "--medusa-color-text-tertiary": yello.gray[500],
    "--medusa-color-text-inverse": "#FFFFFF",
} as const;

/**
 * Tailwind Color Extension
 * Extends Tailwind config with Yello colors
 */
export const tailwindYelloColors = {
    yello: yello,
    yellow: yello.yellow,
    orange: yello.orange,
    magenta: yello.magenta,
    gray: yello.gray,
} as const;

export type YelloColors = typeof yello;
export type MedusaYelloTokens = typeof medusaYelloTokens;
export type TailwindYelloColors = typeof tailwindYelloColors;