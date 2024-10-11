import { clx, Button as MedusaButton } from "@medusajs/ui"

type ButtonProps = React.ComponentProps<typeof MedusaButton>

const Button = ({
  children,
  className: classNameProp,
  ...props
}: ButtonProps): React.ReactNode => {
  const variant = props.variant ?? "primary"

  const className = clx({
    "!shadow-borders-base border-none":
      variant === "secondary" || props.disabled,
    "!shadow-none bg-neutral-900 text-white": variant === "primary",
    "!shadow-none bg-transparent text-neutral-900": variant === "transparent",
  })

  return (
    <MedusaButton
      className={`!rounded-full text-sm font-normal ${className} ${classNameProp}`}
      variant={variant}
      {...props}
    >
      {children}
    </MedusaButton>
  )
}

export default Button
