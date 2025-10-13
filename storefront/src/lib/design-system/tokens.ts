/**
 * Yello Solar Hub Design System - Unified Design Tokens
 * Single source of truth for all design tokens and variants
 * Combines colors, spacing, typography, and component variants
 */

import { cva } from "class-variance-authority"

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
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

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
    // Base Spacing Scale (4px increments)
    0: "0px",
    1: "0.25rem",   // 4px
    2: "0.5rem",    // 8px
    3: "0.75rem",   // 12px
    4: "1rem",      // 16px
    5: "1.25rem",   // 20px
    6: "1.5rem",    // 24px
    7: "1.75rem",   // 28px
    8: "2rem",      // 32px
    9: "2.25rem",   // 36px
    10: "2.5rem",   // 40px
    12: "3rem",     // 48px
    14: "3.5rem",   // 56px
    16: "4rem",     // 64px
    18: "4.5rem",   // 72px
    20: "5rem",     // 80px
    24: "6rem",     // 96px
    28: "7rem",     // 112px
    32: "8rem",     // 128px
    36: "9rem",     // 144px
    40: "10rem",    // 160px
    44: "11rem",    // 176px
    48: "12rem",    // 192px
    52: "13rem",    // 208px
    56: "14rem",    // 224px
    60: "15rem",    // 240px
    64: "16rem",    // 256px
    72: "18rem",    // 288px
    80: "20rem",    // 320px
    96: "24rem",    // 384px
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

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
} as const;

// ============================================================================
// COMPONENT VARIANTS
// ============================================================================

/**
 * Button Variants - Unified button styling system
 */
export const buttonVariants = cva(
    "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yello-yellow-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                // Primary - Gradient amarelo-laranja (CTAs principais)
                primary: "bg-gradient-to-r from-yello-yellow-400 to-yello-yellow-500 text-gray-900 hover:from-yello-yellow-500 hover:to-yello-yellow-600 shadow-md hover:shadow-lg hover:-translate-y-0.5",
                // Secondary - Cinza escuro (ações secundárias neutras)
                secondary: "bg-neutral-900 text-white hover:bg-neutral-800 shadow-borders-base border-none",
                // Tertiary - Laranja sólido (ações de destaque)
                tertiary: "bg-yello-orange-500 text-white hover:bg-yello-orange-600 shadow-md hover:shadow-lg",
                // Outline - Borda amarela (ações não-destrutivas)
                outline: "border-2 border-yello-yellow-400 text-yello-yellow-600 hover:bg-yello-yellow-400 hover:text-gray-900 bg-transparent",
                // Ghost - Transparente (ações sutis)
                ghost: "text-yello-yellow-600 hover:bg-yello-yellow-50 bg-transparent shadow-none",
                // Danger - Vermelho (ações destrutivas)
                danger: "bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg",
                // Transparent - Completamente transparente (navegação)
                transparent: "bg-transparent text-neutral-900 hover:bg-neutral-100 shadow-none",
            },
            size: {
                sm: "h-9 px-3 text-sm rounded-lg",
                md: "h-10 px-4 py-2 text-sm rounded-lg",
                lg: "h-11 px-8 text-base rounded-lg",
                xl: "h-12 px-10 text-base rounded-lg",
                icon: "h-10 w-10 rounded-lg",
            },
            rounded: {
                default: "",
                full: "!rounded-full",
            }
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
            rounded: "default",
        },
    }
)

/**
 * Card Variants - Unified card styling system
 */
export const cardVariants = cva(
    "rounded-xl border bg-card text-card-foreground shadow-sm",
    {
        variants: {
            variant: {
                default: "border-gray-200 bg-white",
                solar: "border-yello-yellow-200 bg-gradient-to-br from-yello-yellow-50 to-yello-blue-50",
                elevated: "border-gray-200 bg-white shadow-lg",
                outlined: "border-2 border-yello-yellow-400 bg-transparent",
            },
            elevation: {
                none: "shadow-none",
                sm: "shadow-sm",
                md: "shadow-md",
                lg: "shadow-lg",
                xl: "shadow-xl",
            },
        },
        defaultVariants: {
            variant: "default",
            elevation: "sm",
        },
    }
)

/**
 * Input Variants - Unified input styling system
 */
export const inputVariants = cva(
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "border-gray-300 bg-white",
                filled: "border-gray-300 bg-gray-50",
                flushed: "border-0 border-b-2 border-gray-300 bg-transparent rounded-none px-0",
            },
            size: {
                sm: "h-8 px-2 py-1 text-xs",
                md: "h-10 px-3 py-2 text-sm",
                lg: "h-12 px-4 py-3 text-base",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
)

// ============================================================================
// SEMANTIC TOKENS
// ============================================================================

/**
 * Semantic Spacing - Named spacing values for specific use cases
 */
export const semanticSpacing = {
    // Layout Spacing
    container: {
        padding: spacing[6],      // 24px
        maxWidth: "1440px",
    },
    section: {
        padding: spacing[16],     // 64px
        gap: spacing[12],         // 48px
    },
    card: {
        padding: spacing[6],      // 24px
        gap: spacing[4],          // 16px
    },

    // Component Spacing
    button: {
        paddingX: spacing[6],     // 24px
        paddingY: spacing[3],     // 12px
        gap: spacing[2],          // 8px
    },
    input: {
        paddingX: spacing[4],     // 16px
        paddingY: spacing[3],     // 12px
    },
    badge: {
        paddingX: spacing[2],     // 8px
        paddingY: spacing[1],     // 4px
    },
} as const;

/**
 * Typography Presets - Predefined text styles for consistent usage
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
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type Colors = typeof colors;
export type Spacing = typeof spacing;
export type Typography = typeof typography;
export type SemanticSpacing = typeof semanticSpacing;
export type TypographyPresets = typeof typographyPresets;