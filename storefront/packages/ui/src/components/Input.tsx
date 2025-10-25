import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    /** Size of the input following Medusa UI scale */
    size?: 'small' | 'base';
};

/**
 * Input Component
 * 
 * Based on native HTML input element, following Medusa UI design system.
 * Label and error handling should be done with separate Label component.
 * Use aria-invalid for error states.
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <Input placeholder="Enter email" id="email" />
 * 
 * // With size
 * <Input size="small" placeholder="Search..." />
 * 
 * // Error state (use with Label component)
 * <div>
 *   <Label htmlFor="password">Password</Label>
 *   <Input 
 *     id="password" 
 *     type="password"
 *     aria-invalid={true}
 *   />
 * </div>
 * 
 * // Controlled
 * <Input 
 *   value={value} 
 *   onChange={(e) => setValue(e.target.value)}
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({
        size = 'base',
        className = '',
        type = 'text',
        ...props
    }, ref) => {
        // Base styles following Medusa UI principles
        const base = 'flex w-full rounded-md border border-gray-300 bg-white px-3 text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors';

        // Size variants matching Medusa UI (small, base)
        const sizes: Record<string, string> = {
            small: 'h-8 text-sm',
            base: 'h-10 text-base'
        };

        // Error state styling via aria-invalid
        const errorStyles = 'aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus-visible:ring-red-500';

        const classes = [
            base,
            sizes[size],
            errorStyles,
            className
        ].filter(Boolean).join(' ');

        return (
            <input
                ref={ref}
                type={type}
                className={classes}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';

export default Input;
