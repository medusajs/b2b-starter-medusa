import { Textarea as MedusaTextarea } from "@medusajs/ui"
import { forwardRef } from "react"

/**
 * Yello Solar Hub Textarea Component
 * Wrapper around Medusa UI Textarea component
 *
 * @example
 * <Textarea placeholder="Digite sua mensagem..." />
 * <Textarea rows={4} />
 */

export interface TextareaProps extends React.ComponentProps<typeof MedusaTextarea> { }

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ ...props }, ref) => {
        return (
            <MedusaTextarea
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }