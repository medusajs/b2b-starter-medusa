/**
 * Yello Solar Hub Design System - Typography
 * Based on Vercel Geist font family with custom presets
 */

export const typography = {
    // Font Families
    fontFamily: {
        sans: ["Geist Sans", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "Fira Code", "monospace"],
    },

    // Font Sizes & Line Heights
    fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],      // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }],  // 14px
        base: ["1rem", { lineHeight: "1.5rem" }],     // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }],  // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],   // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],    // 24px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
        "5xl": ["3rem", { lineHeight: "1" }],         // 48px
        "6xl": ["3.75rem", { lineHeight: "1" }],      // 60px
    },

    // Font Weights
    fontWeight: {
        thin: "100",
        extralight: "200",
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
    },

    // Letter Spacing
    letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0em",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
    },

    // Line Heights
    lineHeight: {
        none: "1",
        tight: "1.25",
        snug: "1.375",
        normal: "1.5",
        relaxed: "1.625",
        loose: "2",
    },
} as const;

/**
 * Typography Presets
 * Predefined text styles for consistent usage
 */
export const typographyPresets = {
    // Display Text
    "display-xl": {
        fontSize: "6xl",
        fontWeight: "bold",
        lineHeight: "none",
        letterSpacing: "tighter",
    },
    "display-lg": {
        fontSize: "5xl",
        fontWeight: "bold",
        lineHeight: "none",
        letterSpacing: "tighter",
    },
    "display-md": {
        fontSize: "4xl",
        fontWeight: "bold",
        lineHeight: "none",
        letterSpacing: "tighter",
    },
    "display-sm": {
        fontSize: "3xl",
        fontWeight: "bold",
        lineHeight: "none",
        letterSpacing: "tighter",
    },

    // Headlines
    "headline-xl": {
        fontSize: "2xl",
        fontWeight: "semibold",
        lineHeight: "tight",
        letterSpacing: "tight",
    },
    "headline-lg": {
        fontSize: "xl",
        fontWeight: "semibold",
        lineHeight: "tight",
        letterSpacing: "tight",
    },
    "headline-md": {
        fontSize: "lg",
        fontWeight: "semibold",
        lineHeight: "tight",
        letterSpacing: "tight",
    },
    "headline-sm": {
        fontSize: "base",
        fontWeight: "semibold",
        lineHeight: "tight",
        letterSpacing: "tight",
    },

    // Body Text
    "body-xl": {
        fontSize: "lg",
        fontWeight: "normal",
        lineHeight: "relaxed",
        letterSpacing: "normal",
    },
    "body-lg": {
        fontSize: "base",
        fontWeight: "normal",
        lineHeight: "relaxed",
        letterSpacing: "normal",
    },
    "body-md": {
        fontSize: "sm",
        fontWeight: "normal",
        lineHeight: "relaxed",
        letterSpacing: "normal",
    },
    "body-sm": {
        fontSize: "xs",
        fontWeight: "normal",
        lineHeight: "snug",
        letterSpacing: "normal",
    },

    // Labels & UI Text
    "label-lg": {
        fontSize: "sm",
        fontWeight: "medium",
        lineHeight: "normal",
        letterSpacing: "wide",
    },
    "label-md": {
        fontSize: "xs",
        fontWeight: "medium",
        lineHeight: "normal",
        letterSpacing: "wide",
    },
    "label-sm": {
        fontSize: "xs",
        fontWeight: "normal",
        lineHeight: "normal",
        letterSpacing: "wide",
    },

    // Code & Technical
    "code-lg": {
        fontSize: "sm",
        fontWeight: "normal",
        lineHeight: "normal",
        letterSpacing: "normal",
        fontFamily: "mono",
    },
    "code-md": {
        fontSize: "xs",
        fontWeight: "normal",
        lineHeight: "normal",
        letterSpacing: "normal",
        fontFamily: "mono",
    },
    "code-sm": {
        fontSize: "xs",
        fontWeight: "normal",
        lineHeight: "tight",
        letterSpacing: "normal",
        fontFamily: "mono",
    },
} as const;

/**
 * Medusa UI Typography Mapping
 * Maps Yello typography to Medusa UI CSS variables
 */
export const medusaTypographyTokens = {
    // Font Families
    "--medusa-font-family-sans": typography.fontFamily.sans.join(", "),
    "--medusa-font-family-mono": typography.fontFamily.mono.join(", "),

    // Font Sizes
    "--medusa-font-size-xs": typography.fontSize.xs[0],
    "--medusa-font-size-sm": typography.fontSize.sm[0],
    "--medusa-font-size-base": typography.fontSize.base[0],
    "--medusa-font-size-lg": typography.fontSize.lg[0],
    "--medusa-font-size-xl": typography.fontSize.xl[0],
    "--medusa-font-size-2xl": typography.fontSize["2xl"][0],
    "--medusa-font-size-3xl": typography.fontSize["3xl"][0],

    // Line Heights
    "--medusa-line-height-xs": typography.fontSize.xs[1].lineHeight,
    "--medusa-line-height-sm": typography.fontSize.sm[1].lineHeight,
    "--medusa-line-height-base": typography.fontSize.base[1].lineHeight,
    "--medusa-line-height-lg": typography.fontSize.lg[1].lineHeight,
    "--medusa-line-height-xl": typography.fontSize.xl[1].lineHeight,
    "--medusa-line-height-2xl": typography.fontSize["2xl"][1].lineHeight,
    "--medusa-line-height-3xl": typography.fontSize["3xl"][1].lineHeight,

    // Font Weights
    "--medusa-font-weight-normal": typography.fontWeight.normal,
    "--medusa-font-weight-medium": typography.fontWeight.medium,
    "--medusa-font-weight-semibold": typography.fontWeight.semibold,
    "--medusa-font-weight-bold": typography.fontWeight.bold,
} as const;

export type Typography = typeof typography;
export type TypographyPresets = typeof typographyPresets;
export type MedusaTypographyTokens = typeof medusaTypographyTokens;