"use client";

import React, { forwardRef } from 'react';
import { Button as MedusaButton } from '@medusajs/ui';

export interface ButtonProps extends React.ComponentProps<typeof MedusaButton> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return <MedusaButton ref={ref} {...props} />;
});

Button.displayName = 'Button';

export default Button;
