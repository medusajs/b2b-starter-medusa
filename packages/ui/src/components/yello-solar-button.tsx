import { cva } from "class-variance-authority"
import { cn } from "../../utils/cn"

const yelloSolarVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-yello-solar text-white hover:bg-yello-solar/90",
        outline: "border-2 border-transparent bg-transparent text-yello-solar hover:bg-yello-solar/10",
        stroke: "border-2 bg-transparent text-yello-solar",
        ghost: "hover:bg-yello-solar/10 text-yello-solar",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface YelloSolarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "stroke" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
}

const YelloSolarButton = ({
  className,
  variant,
  size,
  ...props
}: YelloSolarButtonProps) => {
  return (
    <button
      className={cn(
        yelloSolarVariants({ variant, size }),
        // Apply stroke gradient for stroke variant
        variant === "stroke" && "border-image: linear-gradient(135deg, #FFCE00 0%, #FF6600 50%, #FF0066 100%) 1",
        className
      )}
      {...props}
    />
  )
}

export { YelloSolarButton, yelloSolarVariants }