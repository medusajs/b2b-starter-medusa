import { Avatar as MedusaAvatar } from "@medusajs/ui"
import { forwardRef } from "react"

/**
 * Yello Solar Hub Avatar Component
 * Wrapper around Medusa UI Avatar component
 *
 * @example
 * <Avatar src="/avatar.jpg" fallback="JD" />
 * <Avatar fallback="João Silva" />
 */

export interface AvatarProps extends React.ComponentProps<typeof MedusaAvatar> { }

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
    ({ ...props }, ref) => {
        return (
            <MedusaAvatar
                ref={ref}
                {...props}
            />
        )
    }
)
Avatar.displayName = "Avatar"

export { Avatar }