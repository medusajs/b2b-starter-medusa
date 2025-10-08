import { SVGProps } from "react"

const LogoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Yello Solar Hub Logo - Sun/Wheel Design */}
    <circle cx="100" cy="100" r="100" fill="url(#yelloPaint)" />
    
    {/* 16 raios do sol */}
    <g transform="translate(100, 100)">
      {[...Array(16)].map((_, i) => {
        const angle = (i * 22.5 * Math.PI) / 180;
        const x1 = 0;
        const y1 = 0;
        const x2 = Math.cos(angle) * 100;
        const y2 = Math.sin(angle) * 100;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="white"
            strokeWidth="8"
            strokeLinecap="round"
          />
        );
      })}
    </g>
    
    {/* Centro branco */}
    <circle cx="100" cy="100" r="20" fill="white" />
    
    <defs>
      <radialGradient id="yelloPaint" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%" stopColor="#FFC107" />
        <stop offset="50%" stopColor="#FF9800" />
        <stop offset="100%" stopColor="#FF5722" />
      </radialGradient>
    </defs>
  </svg>
)

export default LogoIcon
