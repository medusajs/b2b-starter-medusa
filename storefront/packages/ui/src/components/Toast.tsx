import React, { forwardRef, useEffect, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
        error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
        info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
      },
      size: {
        sm: 'p-3 pr-6',
        md: 'p-4 pr-8',
        lg: 'p-6 pr-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

const toastIconVariants = cva('h-5 w-5 flex-shrink-0', {
  variants: {
    variant: {
      default: '',
      success: 'text-green-600 dark:text-green-400',
      error: 'text-red-600 dark:text-red-400',
      warning: 'text-yellow-600 dark:text-yellow-400',
      info: 'text-blue-600 dark:text-blue-400',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const toastCloseVariants = cva(
  'absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100',
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

export interface ToastProps extends VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  duration?: number;
  className?: string;
}

const Toast = forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'default', size, title, description, icon, onClose, duration = 5000, ...props }, ref) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          onClose?.();
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [duration, onClose]);

    const getIcon = () => {
      if (icon) return icon;

      switch (variant) {
        case 'success':
          return <CheckCircle className={cn(toastIconVariants({ variant }))} />;
        case 'error':
          return <AlertCircle className={cn(toastIconVariants({ variant }))} />;
        case 'warning':
          return <AlertTriangle className={cn(toastIconVariants({ variant }))} />;
        case 'info':
          return <Info className={cn(toastIconVariants({ variant }))} />;
        default:
          return null;
      }
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant, size }), className)}
        {...props}
      >
        {getIcon() && (
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
        )}

        <div className="grid gap-1">
          {title && (
            <div className="text-sm font-semibold">
              {title}
            </div>
          )}
          {description && (
            <div className="text-sm opacity-90">
              {description}
            </div>
          )}
        </div>

        {onClose && (
          <button
            className={cn(toastCloseVariants())}
            onClick={() => {
              setIsVisible(false);
              onClose();
            }}
            aria-label="Close toast"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

Toast.displayName = 'Toast';

// Toast Container Component
export interface ToastContainerProps {
  toasts: Array<ToastProps & { id: string }>;
  onRemove: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  position = 'top-right',
  className
}) => {
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2',
  };

  return (
    <div
      className={cn(
        'fixed z-50 w-full max-w-sm p-4',
        positionClasses[position],
        className
      )}
    >
      <div className="flex flex-col space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

ToastContainer.displayName = 'ToastContainer';

// Toast Hook for managing toasts
export const useToastState = () => {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

  const addToast = (toast: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };
};

export {
  Toast,
  ToastContainer,
  toastVariants,
  toastIconVariants,
  toastCloseVariants,
};