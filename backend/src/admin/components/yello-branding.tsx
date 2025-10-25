import { Container, Heading } from "@medusajs/ui"
import YelloLogoBlack from "../assets/yello-black_logomark.svg"
import YelloLogoWhite from "../assets/yello-white_logomark.svg"

/**
 * Yello Solar Hub Branding Component
 * 
 * Este componente exibe o branding da Yello Solar Hub no admin dashboard.
 * Como o Medusa não permite alterar o logo principal do admin, este componente
 * pode ser usado em widgets e páginas customizadas.
 * 
 * Referência: https://docs.medusajs.com/learn/fundamentals/admin
 * - "You can't customize the login page, the authentication flow, or change 
 *    the Medusa logo used in the admin dashboard."
 */
export const YelloBranding = ({
    size = "medium",
    variant = "black",
    showText = true
}: {
    size?: "small" | "medium" | "large"
    variant?: "black" | "white"
    showText?: boolean
}) => {
    const logoSrc = variant === "black" ? YelloLogoBlack : YelloLogoWhite

    const dimensions = {
        small: { width: 32, height: 32 },
        medium: { width: 48, height: 48 },
        large: { width: 64, height: 64 },
    }

    return (
        <Container className="flex items-center gap-3">
            <img
                src={logoSrc}
                alt="Yello Solar Hub"
                width={dimensions[size].width}
                height={dimensions[size].height}
                className="object-contain"
            />
            {showText && (
                <div className="flex flex-col">
                    <Heading level="h3" className="font-bold">
                        Yello Solar Hub
                    </Heading>
                    <p className="text-xs text-ui-fg-subtle">
                        Energia Solar Inteligente
                    </p>
                </div>
            )}
        </Container>
    )
}

/**
 * Compact Branding Badge
 * Para uso em headers ou espaços limitados
 */
export const YelloBrandingBadge = ({ variant = "black" }: { variant?: "black" | "white" }) => {
    const logoSrc = variant === "black" ? YelloLogoBlack : YelloLogoWhite

    return (
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-ui-bg-subtle rounded-lg">
            <img
                src={logoSrc}
                alt="YSH"
                width={24}
                height={24}
                className="object-contain"
            />
            <span className="text-sm font-medium">Yello Solar Hub</span>
        </div>
    )
}
