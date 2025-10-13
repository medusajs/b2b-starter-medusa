import * as React from "react"

export function YshGradientIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#yshGrad)"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <defs>
        <linearGradient id="yshGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--ysh-start)" />
          <stop offset="100%" stopColor="var(--ysh-end)" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12h8M12 8v8" />
    </svg>
  )
}

