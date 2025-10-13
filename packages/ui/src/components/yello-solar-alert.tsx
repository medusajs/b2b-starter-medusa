// yello-solar-alert.tsx - Alert component com tom Hélio
"use client"

import { clx } from "@/utils/clx"
import {
  CheckCircleSolid,
  ExclamationCircleSolid,
  InformationCircleSolid,
  XCircleSolid,
  XMarkMini,
} from "@medusajs/icons"
import * as React from "react"

import { IconButton } from "@/components/icon-button"

interface YelloSolarAlertProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: "error" | "success" | "warning" | "info"
  dismissible?: boolean
  showIcon?: boolean
}

/**
 * Alert component otimizado para Yello Solar Hub com tom de voz Hélio
 * Número primeiro, adjetivo depois. Sem drama, só resultado.
 */
export const YelloSolarAlert = React.forwardRef<HTMLDivElement, YelloSolarAlertProps>(
  (
    {
      /**
       * The variant of the alert
       */
      variant = "info",
      /**
       * Whether the alert is dismissible
       */
      dismissible = false,
      /**
       * Whether to show the icon
       */
      showIcon = true,
      className,
      children,
      ...props
    }: YelloSolarAlertProps,
    ref
  ) => {
    const [dismissed, setDismissed] = React.useState(false)

    const Icon = {
      info: InformationCircleSolid,
      error: XCircleSolid,
      success: CheckCircleSolid,
      warning: ExclamationCircleSolid,
    }[variant]

    const handleDismiss = () => {
      setDismissed(true)
    }

    if (dismissed) {
      return null
    }

    return (
      <div
        ref={ref}
        className={clx(
          "bg-ui-bg-subtle text-pretty txt-compact-small grid items-start gap-x-2 rounded-lg border p-3",
          {
            "grid-cols-[20px_1fr]": !dismissible && showIcon,
            "grid-cols-[1fr]": !showIcon,
            "grid-cols-[20px_1fr_20px]": dismissible && showIcon,
            "grid-cols-[1fr_20px]": dismissible && !showIcon,
          },
          className
        )}
        {...props}
      >
        {showIcon && (
          <Icon
            className={clx({
              "text-ui-tag-red-icon": variant === "error",
              "text-ui-tag-green-icon": variant === "success",
              "text-ui-tag-orange-icon": variant === "warning",
              "text-ui-tag-neutral-icon": variant === "info",
            })}
          />
        )}
        <div>{children}</div>
        {dismissible && (
          <IconButton
            size="2xsmall"
            variant="transparent"
            type="button"
            onClick={handleDismiss}
          >
            <XMarkMini className="text-ui-fg-muted" />
          </IconButton>
        )}
      </div>
    )
  }
)
YelloSolarAlert.displayName = "YelloSolarAlert"

// Componentes pré-configurados para casos comuns
export const SuccessAlert: React.FC<Omit<YelloSolarAlertProps, 'variant'>> = (props) => (
  <YelloSolarAlert variant="success" {...props} />
)

export const ErrorAlert: React.FC<Omit<YelloSolarAlertProps, 'variant'>> = (props) => (
  <YelloSolarAlert variant="error" {...props} />
)

export const InfoAlert: React.FC<Omit<YelloSolarAlertProps, 'variant'>> = (props) => (
  <YelloSolarAlert variant="info" {...props} />
)

export const WarningAlert: React.FC<Omit<YelloSolarAlertProps, 'variant'>> = (props) => (
  <YelloSolarAlert variant="warning" {...props} />
)