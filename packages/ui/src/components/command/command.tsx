"use client"

import { Copy } from "@/components/copy"
import { clx } from "@/utils/clx"
import React from "react"

/**
 * This component is based on the div element and supports all of its props
 */
const CommandComponent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={clx(
        "bg-ui-contrast-bg-base shadow-elevation-code-block flex items-center rounded-lg px-4 py-1.5",
        "[&>code]:text-ui-contrast-fg-primary [&>code]:code-body [&>code]:mx-2",
        className
      )}
      {...props}
    />
  )
}
CommandComponent.displayName = "Command"

const CommandCopy = React.forwardRef<
  React.ElementRef<typeof Copy>,
  React.ComponentPropsWithoutRef<typeof Copy>
>(({ className, ...props }, ref) => {
  return (
    <Copy
      {...props}
      ref={ref}
      className={clx("!text-ui-contrast-fg-secondary ml-auto", className)}
    />
  )
})
CommandCopy.displayName = "Command.Copy"

const Command = Object.assign(CommandComponent, { Copy: CommandCopy })

export { Command }
