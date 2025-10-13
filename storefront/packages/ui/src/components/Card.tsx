"use client";

import React, { forwardRef } from 'react';
import { Container } from '@medusajs/ui';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return <Container ref={ref} className={className} {...props} />;
});

Card.displayName = 'Card';

export default Card;
