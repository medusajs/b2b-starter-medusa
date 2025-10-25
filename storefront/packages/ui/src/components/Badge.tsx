"use client";

import React, { forwardRef } from 'react';
import { Badge as MedusaBadge } from '@medusajs/ui';

export interface BadgeProps extends React.ComponentProps<typeof MedusaBadge> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>((props, ref) => {
  return <MedusaBadge ref={ref} {...props} />;
});

Badge.displayName = 'Badge';

export default Badge;
