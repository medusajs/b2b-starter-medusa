"use client"

import Button from "@/modules/common/components/button"
import React from "react"
import { useFormStatus } from "react-dom"

export function SubmitButton({
  children,
  variant = "primary",
  className,
  "data-testid": dataTestId,
  disabled,
}: {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "transparent" | "danger" | null
  className?: string
  "data-testid"?: string
  disabled?: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      size="large"
      className={className}
      type="submit"
      isLoading={pending}
      disabled={disabled}
      variant={variant || "primary"}
      data-testid={dataTestId}
    >
      {children}
    </Button>
  )
}
