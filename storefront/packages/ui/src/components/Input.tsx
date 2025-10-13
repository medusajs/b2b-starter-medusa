import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    error?: string;
    helperText?: string;
    fullWidth?: boolean;
};

/**
 * Input component
 * 
 * Form input with label, error, and helper text support
 * 
 * @example
 * ```tsx
 * <Input 
 *   label="Email" 
 *   type="email" 
 *   placeholder="your@email.com"
 *   error="Invalid email format"
 * />
 * ```
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, fullWidth = false, className = '', ...props }, ref) => {
        const inputBase = 'px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-all duration-200';
        const inputStates = error 
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
            : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500';
        const widthClass = fullWidth ? 'w-full' : '';
        
        const inputClasses = [inputBase, inputStates, widthClass, className].filter(Boolean).join(' ');
        
        const containerClass = fullWidth ? 'w-full' : '';

        return (
            <div className={containerClass}>
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={inputClasses}
                    {...props}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600">
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1 text-sm text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
