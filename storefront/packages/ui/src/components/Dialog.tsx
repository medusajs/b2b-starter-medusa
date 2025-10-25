"use client";

import React, { forwardRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';
import { X } from 'lucide-react';

const dialogVariants = cva(
    'fixed inset-0 z-50 flex items-center justify-center',
    {
        variants: {
            variant: {
                default: '',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const dialogBackdropVariants = cva(
    'fixed inset-0 bg-black/50 backdrop-blur-sm',
    {
        variants: {
            variant: {
                default: '',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const dialogContentVariants = cva(
    'relative grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg',
    {
        variants: {
            variant: {
                default: '',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const dialogHeaderVariants = cva(
    'flex flex-col space-y-1.5 text-center sm:text-left',
    {
        variants: {
            variant: {
                default: '',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const dialogTitleVariants = cva(
    'text-lg font-semibold leading-none tracking-tight',
    {
        variants: {
            variant: {
                default: '',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const dialogDescriptionVariants = cva(
    'text-sm text-muted-foreground',
    {
        variants: {
            variant: {
                default: '',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const dialogFooterVariants = cva(
    'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
    {
        variants: {
            variant: {
                default: '',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

const dialogCloseVariants = cva(
    'absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground',
    {
        variants: {
            variant: {
                default: '',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface DialogProps extends VariantProps<typeof dialogVariants> {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export interface DialogContentProps extends VariantProps<typeof dialogContentVariants> {
    children: React.ReactNode;
    className?: string;
}

export interface DialogHeaderProps extends VariantProps<typeof dialogHeaderVariants> {
    children: React.ReactNode;
    className?: string;
}

export interface DialogTitleProps extends VariantProps<typeof dialogTitleVariants> {
    children: React.ReactNode;
    className?: string;
}

export interface DialogDescriptionProps extends VariantProps<typeof dialogDescriptionVariants> {
    children: React.ReactNode;
    className?: string;
}

export interface DialogFooterProps extends VariantProps<typeof dialogFooterVariants> {
    children: React.ReactNode;
    className?: string;
}

export interface DialogCloseProps extends VariantProps<typeof dialogCloseVariants> {
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && open && onOpenChange) {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [open, onOpenChange]);

    if (!open) return null;

    return (
        <div className={dialogVariants()}>
            <div
                className={dialogBackdropVariants()}
                onClick={() => onOpenChange?.(false)}
            />
            {children}
        </div>
    );
};

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(dialogContentVariants(), className)}
            {...props}
        >
            {children}
        </div>
    )
);

DialogContent.displayName = 'DialogContent';

const DialogHeader: React.FC<DialogHeaderProps> = ({ className, children }) => (
    <div className={cn(dialogHeaderVariants(), className)}>
        {children}
    </div>
);

DialogHeader.displayName = 'DialogHeader';

const DialogTitle: React.FC<DialogTitleProps> = ({ className, children }) => (
    <h2 className={cn(dialogTitleVariants(), className)}>
        {children}
    </h2>
);

DialogTitle.displayName = 'DialogTitle';

const DialogDescription: React.FC<DialogDescriptionProps> = ({ className, children }) => (
    <p className={cn(dialogDescriptionVariants(), className)}>
        {children}
    </p>
);

DialogDescription.displayName = 'DialogDescription';

const DialogFooter: React.FC<DialogFooterProps> = ({ className, children }) => (
    <div className={cn(dialogFooterVariants(), className)}>
        {children}
    </div>
);

DialogFooter.displayName = 'DialogFooter';

const DialogClose: React.FC<DialogCloseProps> = ({ className, children, onClick }) => (
    <button
        className={cn(dialogCloseVariants(), className)}
        onClick={onClick}
    >
        {children || <X className="h-4 w-4" />}
    </button>
);

DialogClose.displayName = 'DialogClose';

export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
    dialogVariants,
    dialogContentVariants,
    dialogHeaderVariants,
    dialogTitleVariants,
    dialogDescriptionVariants,
    dialogFooterVariants,
    dialogCloseVariants,
};