import tokens from './tokens.json';

export type DesignTokens = typeof tokens;

export type ColorTokens = DesignTokens['color'];
export type SpacingTokens = DesignTokens['spacing'];
export type FontTokens = DesignTokens['font'];
export type BorderRadiusTokens = DesignTokens['borderRadius'];
export type ShadowTokens = DesignTokens['shadow'];
export type TransitionTokens = DesignTokens['transition'];
export type BreakpointTokens = DesignTokens['breakpoint'];
export type ComponentTokens = DesignTokens['component'];

// Brand colors
export type BrandColors = ColorTokens['brand'];
export type PrimaryColors = BrandColors['primary'];
export type SecondaryColors = BrandColors['secondary'];
export type AccentColors = BrandColors['accent'];

// Text colors
export type TextColors = ColorTokens['text'];

// Background colors
export type BackgroundColors = ColorTokens['background'];

// Border colors
export type BorderColors = ColorTokens['border'];

// Status colors
export type StatusColors = ColorTokens['status'];
export type SuccessColors = StatusColors['success'];
export type WarningColors = StatusColors['warning'];
export type ErrorColors = StatusColors['error'];
export type InfoColors = StatusColors['info'];

// Interactive colors
export type InteractiveColors = ColorTokens['interactive'];

// Font families
export type FontFamilies = FontTokens['family'];

// Font sizes
export type FontSizes = FontTokens['size'];

// Font weights
export type FontWeights = FontTokens['weight'];

// Font line heights
export type LineHeights = FontTokens['lineHeight'];

// Font letter spacing
export type LetterSpacing = FontTokens['letterSpacing'];

// Border widths
export type BorderWidths = DesignTokens['borderWidth'];

// Opacity values
export type OpacityValues = DesignTokens['opacity'];

// Z-index values
export type ZIndexValues = DesignTokens['zIndex'];

// Transition properties
export type TransitionProperties = TransitionTokens['property'];

// Transition durations
export type TransitionDurations = TransitionTokens['duration'];

// Transition timing functions
export type TransitionTiming = TransitionTokens['timing'];

// Component specific tokens
export type ButtonTokens = ComponentTokens['button'];
export type InputTokens = ComponentTokens['input'];
export type CardTokens = ComponentTokens['card'];

// Utility types for component variants
export type ButtonSizes = keyof ButtonTokens['height'];
export type ButtonVariants = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
export type InputSizes = keyof InputTokens['height'];
export type CardSizes = keyof CardTokens['padding'];

// Generic token value type
export type TokenValue<T> = T extends Record<string, infer U> ? U : never;

// Color value type
export type ColorValue = string;

// Spacing value type
export type SpacingValue = string;

// Font size value type
export type FontSizeValue = string;

// Font weight value type
export type FontWeightValue = string;

// Border radius value type
export type BorderRadiusValue = string;

// Shadow value type
export type ShadowValue = string;

// Transition value type
export type TransitionValue = string;

// Breakpoint value type
export type BreakpointValue = string;

// Utility function types
export interface TokenResolver {
    (path: string): string | undefined;
    color: (path: keyof ColorTokens | string) => string;
    spacing: (path: keyof SpacingTokens | string) => string;
    font: {
        size: (path: keyof FontSizes | string) => string;
        weight: (path: keyof FontWeights | string) => string;
        family: (path: keyof FontFamilies | string) => string;
    };
    borderRadius: (path: keyof BorderRadiusTokens | string) => string;
    shadow: (path: keyof ShadowTokens | string) => string;
    transition: {
        duration: (path: keyof TransitionDurations | string) => string;
        timing: (path: keyof TransitionTiming | string) => string;
    };
    breakpoint: (path: keyof BreakpointTokens | string) => string;
}