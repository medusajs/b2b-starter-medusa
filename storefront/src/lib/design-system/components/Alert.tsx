import { Alert as MedusaAlert } from "@medusajs/ui"
import { forwardRef } from "react"

/**
 * Yello Solar Hub Alert Component
 * Wrapper around Medusa UI Alert component
 *
 * @example
 * <Alert variant="success">Operação realizada com sucesso!</Alert>
 * <Alert variant="error">Erro ao processar solicitação</Alert>
 */

export interface AlertProps extends React.ComponentProps<typeof MedusaAlert> { }

const Alert = forwardRef<HTMLDivElement, AlertProps>(
    ({ ...props }, ref) => {
        return (
            <MedusaAlert
                ref={ref}
                {...props}
            />
        )
    }
)
Alert.displayName = "Alert"

export { Alert }