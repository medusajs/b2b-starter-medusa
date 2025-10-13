import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
};

export const Button = ({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ...props
}: ButtonProps) => {
    const base = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants: Record<string, string> = {
        primary: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300',
        ghost: 'bg-transparent text-gray-900 hover:bg-gray-50'
    };
    const sizes: Record<string, string> = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-3 py-2 text-base',
        lg: 'px-4 py-3 text-lg'
    };
    const classes = [base, variants[variant], sizes[size], className].filter(Boolean).join(' ');

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
};

export default Button;
