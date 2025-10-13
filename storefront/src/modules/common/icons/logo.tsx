import Image from "next/image"
import { HTMLAttributes } from "react"

/**
 * Yello Solar Hub - Logo Icon
 * Usa o logo PNG oficial da marca
 */
interface LogoIconProps extends HTMLAttributes<HTMLDivElement> {
  width?: number
  height?: number
}

const LogoIcon = ({ width = 32, height = 32, className, ...props }: LogoIconProps) => (
  <div className={className} {...props}>
    <Image
      src="/yello-icon.jpg"
      alt="Yello Solar Hub"
      width={width}
      height={height}
      className="object-contain"
      priority
    />
  </div>
)

export default LogoIcon

