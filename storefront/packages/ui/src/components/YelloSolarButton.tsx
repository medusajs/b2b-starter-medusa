"use client";

import React, { forwardRef } from 'react';
import { Button } from '@medusajs/ui';
import { cn } from '../utils/cn';

export interface YelloSolarButtonProps extends React.ComponentProps<typeof Button> {
    gradient?: boolean;
}

const YelloSolarButton = forwardRef<HTMLButtonElement, YelloSolarButtonProps>(
    ({ className, gradient = true, children, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                className={cn(
                    gradient && 'bg-gradient-to-r from-[#FFCE00] via-[#FF6600] to-[#FF0066] hover:opacity-90 text-white font-semibold',
                    className
                )}
                {...props}
            >
                {children}
            </Button>
        );
    }
);

YelloSolarButton.displayName = 'YelloSolarButton';

export default YelloSolarButton;