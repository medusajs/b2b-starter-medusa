import Image from "next/image"
import { HTMLAttributes } from "react"

/**
 * Yello Solar Hub - Ícone apenas (círculo solar)
 * Para uso em footer, favicon, e elementos pequenos
 * Usa o logomark oficial da marca (adapta ao tema claro/escuro)
 */
interface YelloIconProps extends HTMLAttributes<HTMLDivElement> {
    width?: number
    height?: number
    variant?: "light" | "dark" | "auto"
}

const YelloIcon = ({ width = 48, height = 15, variant = "auto", className, ...props }: YelloIconProps) => (
    <div className={className} {...props}>
        <Image
            src="/yello-black_logomark.png"
            alt="Yello"
            width={width}
            height={height}
            className="object-contain dark:hidden"
        />
        <Image
            src="/yello-white_logomark.png"
            alt="Yello"
            width={width}
            height={height}
            className="object-contain hidden dark:block"
        />
    </div>
)

export default YelloIcon
