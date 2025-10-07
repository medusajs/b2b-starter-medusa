/**
 * Yello Solar Hub Design System - Spacing
 * Consistent spacing scale for margins, padding, and layout
 */

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

/**
 * Semantic Spacing
 * Named spacing values for specific use cases
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

    // Typography Spacing
    heading: {
        marginBottom: spacing[4], // 16px
    },
    paragraph: {
        marginBottom: spacing[4], // 16px
    },
    list: {
        gap: spacing[2],          // 8px
    },
} as const;

/**
 * Medusa UI Spacing Mapping
 * Maps Yello spacing to Medusa UI CSS variables
 */
export const medusaSpacingTokens = {
    // Spacing Scale
    "--medusa-space-1": spacing[1],
    "--medusa-space-2": spacing[2],
    "--medusa-space-3": spacing[3],
    "--medusa-space-4": spacing[4],
    "--medusa-space-5": spacing[5],
    "--medusa-space-6": spacing[6],
    "--medusa-space-8": spacing[8],
    "--medusa-space-10": spacing[10],
    "--medusa-space-12": spacing[12],
    "--medusa-space-16": spacing[16],
    "--medusa-space-20": spacing[20],
    "--medusa-space-24": spacing[24],

    // Layout Spacing
    "--medusa-space-container-padding": semanticSpacing.container.padding,
    "--medusa-space-section-padding": semanticSpacing.section.padding,
    "--medusa-space-section-gap": semanticSpacing.section.gap,
    "--medusa-space-card-padding": semanticSpacing.card.padding,
    "--medusa-space-card-gap": semanticSpacing.card.gap,
} as const;

export type Spacing = typeof spacing;
export type SemanticSpacing = typeof semanticSpacing;
export type MedusaSpacingTokens = typeof medusaSpacingTokens;