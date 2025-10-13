import Image from "next/image"
import { HTMLAttributes } from "react"

/**
 * Yello Solar Hub - Ícone apenas (círculo solar)
 * Para uso em footer, favicon, e elementos pequenos
 * Usa o logo PNG oficial da marca
 */
interface YelloIconProps extends HTMLAttributes<HTMLDivElement> {
    width?: number
    height?: number
}

const YelloIcon = ({ width = 48, height = 48, className, ...props }: YelloIconProps) => (
    <div className={className} {...props}>
        <Image
            src="/yello-icon.jpg"
            alt="Yello"
            width={width}
            height={height}
            className="object-contain"
        />
    </div>
)

export default YelloIcon
