import { SVGProps } from "react"

/**
 * Yello Solar Hub - Logo Icon (Updated 2025)
 * Modern solar energy brand mark
 */
const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      {/* Gradiente amarelo-laranja vibrante */}
      <radialGradient id="ysh-solar-gradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="40%" stopColor="#FFA500" />
        <stop offset="100%" stopColor="#FF6B00" />
      </radialGradient>

      {/* Gradiente para raios */}
      <linearGradient id="ysh-ray-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#FFEB3B" stopOpacity="0.7" />
      </linearGradient>
    </defs>

    <g transform="translate(100, 100)">
      {/* Círculo externo (halo de energia) */}
      <circle r="95" fill="url(#ysh-solar-gradient)" opacity="0.15" />

      {/* Círculo principal do sol */}
      <circle r="75" fill="url(#ysh-solar-gradient)" />

      {/* 12 raios principais (mais grossos e visíveis) */}
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180
        const innerRadius = 50
        const outerRadius = 90
        const x1 = Math.cos(angle) * innerRadius
        const y1 = Math.sin(angle) * innerRadius
        const x2 = Math.cos(angle) * outerRadius
        const y2 = Math.sin(angle) * outerRadius

        return (
          <line
            key={`main-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#ysh-ray-gradient)"
            strokeWidth="8"
            strokeLinecap="round"
          />
        )
      })}

      {/* 12 raios secundários (mais finos, entre os principais) */}
      {[...Array(12)].map((_, i) => {
        const angle = ((i * 30 + 15) * Math.PI) / 180
        const innerRadius = 55
        const outerRadius = 85
        const x1 = Math.cos(angle) * innerRadius
        const y1 = Math.sin(angle) * innerRadius
        const x2 = Math.cos(angle) * outerRadius
        const y2 = Math.sin(angle) * outerRadius

        return (
          <line
            key={`secondary-${i}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="url(#ysh-ray-gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.7"
          />
        )
      })}

      {/* Núcleo central branco brilhante */}
      <circle r="35" fill="white" />

      {/* Detalhe interno (energia) */}
      <circle r="25" fill="#FFD700" opacity="0.3" />

      {/* Ponto central de energia */}
      <circle r="12" fill="white" />
    </g>
  </svg>
)

export default LogoIcon

