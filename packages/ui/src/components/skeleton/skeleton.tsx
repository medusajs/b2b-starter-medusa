import * as React from "react"

import { clx } from "@/utils/clx"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clx(
        "bg-ui-bg-component animate-pulse rounded-md relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-ui-bg-base-hover before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
