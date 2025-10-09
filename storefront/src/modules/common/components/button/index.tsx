/**
 * Button Component - RE-EXPORT
 * This file now re-exports from the unified design system
 * 
 * DEPRECATED: Import directly from '@/lib/design-system/components/Button'
 * This file maintained for backward compatibility during migration
 */

import { Button as DesignSystemButton } from '@/lib/design-system/components/Button'
import { forwardRef } from 'react'

// Re-export with default export for backward compatibility
const Button = forwardRef<HTMLButtonElement, React.ComponentProps<typeof DesignSystemButton>>(
  (props, ref) => {
    // Apply rounded-full by default for legacy compatibility
    return <DesignSystemButton rounded="full" ref={ref} {...props} />
  }
)

Button.displayName = 'Button'

export default Button
