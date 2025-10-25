export function YshLogoMark({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const src = variant === "dark" ? "/yello-white_logomark.svg" : "/yello-black_logomark.svg"
  return (
    <div className="ysh-border-gradient inline-flex items-center justify-center rounded-lg p-2">
      <img src={src} alt="YSH" className="h-6 w-auto" />
    </div>
  )
}

