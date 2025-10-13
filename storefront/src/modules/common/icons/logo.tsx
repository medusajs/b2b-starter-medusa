import Image from "next/image"
import { HTMLAttributes } from "react"

/**
 * Yello Solar Hub - Logo Icon
 * Usa o logomark oficial da marca (adapta ao tema claro/escuro)
 */
interface LogoIconProps extends HTMLAttributes<HTMLDivElement> {
  width?: number
  height?: number
  variant?: "light" | "dark" | "auto"
}

const LogoIcon = ({ width = 120, height = 37, variant = "auto", className, ...props }: LogoIconProps) => {
  // Auto detecta o tema via CSS
  const logoSrc = variant === "auto" 
    ? "/yello-black_logomark.png" // Padrão para light mode
    : variant === "dark" 
      ? "/yello-white_logomark.png"
      : "/yello-black_logomark.png"

  return (
    <div className={className} {...props}>
      <Image
        src={logoSrc}
        alt="Yello Solar Hub"
        width={width}
        height={height}
        className="object-contain dark:hidden"
        priority
      />
      <Image
        src="/yello-white_logomark.png"
        alt="Yello Solar Hub"
        width={width}
        height={height}
        className="object-contain hidden dark:block"
        priority
      />
    </div>
  )
}

export default LogoIcon

