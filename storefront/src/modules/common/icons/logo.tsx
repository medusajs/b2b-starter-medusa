import { SVGProps } from "react"

/**
 * Yello Solar Hub - Logo Icon
 * Backwards compatible wrapper - uses YelloIcon
 */
const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g transform="translate(100, 100)">
      {/* Círculo com gradiente */}
      <circle r="90" fill="url(#yelloIconGradient)" />

      {/* 16 raios brancos do centro */}
      {[...Array(16)].map((_, i) => {
        const angle = (i * 22.5 * Math.PI) / 180
        const x = Math.cos(angle) * 90
        const y = Math.sin(angle) * 90
        return (
          <line
            key={i}
            x1="0"
            y1="0"
            x2={x}
            y2={y}
            stroke="white"
            strokeWidth="10"
            strokeLinecap="round"
          />
        )
      })}

      {/* Centro branco */}
      <circle r="25" fill="white" />
    </g>

    <defs>
      <radialGradient id="yelloIconGradient" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#FDD835" />
        <stop offset="25%" stopColor="#FFC107" />
        <stop offset="50%" stopColor="#FF9800" />
        <stop offset="75%" stopColor="#FF6F00" />
        <stop offset="100%" stopColor="#FF5252" />
      </radialGradient>
    </defs>
  </svg>
)

export default LogoIcon
