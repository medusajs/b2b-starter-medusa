import tokens from './tokens.json';
import type { TokenResolver, ColorTokens, SpacingTokens, FontSizes, FontWeights, FontFamilies, BorderRadiusTokens, ShadowTokens, TransitionDurations, TransitionTiming, BreakpointTokens } from './tokens';

/**
 * Utility function to get nested object value by path
 */
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Token resolver utility for programmatic access to design tokens
 */
export const tokenResolver: TokenResolver = Object.assign(
    (path: string) => getNestedValue(tokens, path),
    {
        color: (path: keyof ColorTokens | string) => getNestedValue(tokens.color, path as string),
        spacing: (path: keyof SpacingTokens | string) => getNestedValue(tokens.spacing, path as string),
        font: {
            size: (path: keyof FontSizes | string) => getNestedValue(tokens.font.size, path as string),
            weight: (path: keyof FontWeights | string) => getNestedValue(tokens.font.weight, path as string),
            family: (path: keyof FontFamilies | string) => getNestedValue(tokens.font.family, path as string),
        },
        borderRadius: (path: keyof BorderRadiusTokens | string) => getNestedValue(tokens.borderRadius, path as string),
        shadow: (path: keyof ShadowTokens | string) => getNestedValue(tokens.shadow, path as string),
        transition: {
            duration: (path: keyof TransitionDurations | string) => getNestedValue(tokens.transition.duration, path as string),
            timing: (path: keyof TransitionTiming | string) => getNestedValue(tokens.transition.timing, path as string),
        },
        breakpoint: (path: keyof BreakpointTokens | string) => getNestedValue(tokens.breakpoint, path as string),
    }
);

/**
 * Get color token value
 */
export const getColor = (path: string) => tokenResolver.color(path);

/**
 * Get spacing token value
 */
export const getSpacing = (path: string) => tokenResolver.spacing(path);

/**
 * Get font size token value
 */
export const getFontSize = (path: string) => tokenResolver.font.size(path);

/**
 * Get font weight token value
 */
export const getFontWeight = (path: string) => tokenResolver.font.weight(path);

/**
 * Get font family token value
 */
export const getFontFamily = (path: string) => tokenResolver.font.family(path);

/**
 * Get border radius token value
 */
export const getBorderRadius = (path: string) => tokenResolver.borderRadius(path);

/**
 * Get shadow token value
 */
export const getShadow = (path: string) => tokenResolver.shadow(path);

/**
 * Get transition duration token value
 */
export const getTransitionDuration = (path: string) => tokenResolver.transition.duration(path);

/**
 * Get transition timing token value
 */
export const getTransitionTiming = (path: string) => tokenResolver.transition.timing(path);

/**
 * Get breakpoint token value
 */
export const getBreakpoint = (path: string) => tokenResolver.breakpoint(path);

/**
 * Get component-specific token value
 */
export const getComponentToken = (component: string, property: string, variant?: string) => {
    const path = variant ? `${component}.${property}.${variant}` : `${component}.${property}`;
    return getNestedValue(tokens.component, path);
};

/**
 * Type-safe token getter with fallback
 */
export const getToken = (path: string, fallback?: string): string => {
    const value = tokenResolver(path);
    return value !== undefined ? value : (fallback ?? '');
};

/**
 * Check if a token path exists
 */
export const hasToken = (path: string): boolean => {
    return tokenResolver(path) !== undefined;
};

/**
 * Get all tokens for a specific category
 */
export const getTokensByCategory = (category: keyof typeof tokens) => {
    return tokens[category];
};

/**
 * Get all color tokens
 */
export const getColorTokens = () => tokens.color;

/**
 * Get all spacing tokens
 */
export const getSpacingTokens = () => tokens.spacing;

/**
 * Get all font tokens
 */
export const getFontTokens = () => tokens.font;

/**
 * Get all component tokens
 */
export const getComponentTokens = () => tokens.component;