import { Button as MedusaButton } from "@medusajs/ui"

type ButtonProps = React.ComponentProps<typeof MedusaButton>

const Button = ({
  children,
  className: classNameProp,
  ...props
}: ButtonProps): React.ReactNode => {
  const variant = props.variant ?? "primary"

  const className =
    variant === "secondary" || props.disabled
      ? "!shadow-borders-base border-none"
      : "!shadow-none bg-neutral-900 text-white"

  return (
    <MedusaButton
      className={`!rounded-full text-sm font-normal ${className} ${classNameProp}`}
      {...props}
    >
      {children}
    </MedusaButton>
  )
}

export default Button
