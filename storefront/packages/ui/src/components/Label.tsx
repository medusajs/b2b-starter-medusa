import React from 'react';

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement> & {
    required?: boolean;
    disabled?: boolean;
};

/**
 * Label component
 * 
 * Form label with required indicator support
 * 
 * @example
 * ```tsx
 * <Label htmlFor="email" required>
 *   Email Address
 * </Label>
 * ```
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
    ({ required = false, disabled = false, children, className = '', ...props }, ref) => {
        const base = 'block text-sm font-medium transition-colors duration-200';
        const stateClass = disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700';

        const classes = [base, stateClass, className].filter(Boolean).join(' ');

        return (
            <label ref={ref} className={classes} {...props}>
                {children}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
        );
    }
);

Label.displayName = 'Label';

export default Label;
