import { Text, clx } from "@medusajs/ui"
import CircleMinus from "@modules/common/icons/circle-minus"
import CirclePlus from "@modules/common/icons/circle-plus"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import React from "react"

type AccordionItemProps = AccordionPrimitive.AccordionItemProps & {
  title: string
  subtitle?: string
  description?: string
  required?: boolean
  tooltip?: string
  forceMountContent?: true
  headingSize?: "small" | "medium" | "large"
  customTrigger?: React.ReactNode
  complete?: boolean
  active?: boolean
  triggerable?: boolean
  children: React.ReactNode
}

type AccordionProps =
  | (AccordionPrimitive.AccordionSingleProps &
      React.RefAttributes<HTMLDivElement>)
  | (AccordionPrimitive.AccordionMultipleProps &
      React.RefAttributes<HTMLDivElement>)

const Accordion: React.FC<AccordionProps> & {
  Item: React.FC<AccordionItemProps>
} = ({ children, ...props }) => {
  return (
    /* @ts-expect-error */
    <AccordionPrimitive.Root {...props}>{children}</AccordionPrimitive.Root>
  )
}

const Item: React.FC<AccordionItemProps> = ({
  title,
  subtitle,
  description,
  children,
  className,
  headingSize = "large",
  customTrigger = undefined,
  forceMountContent = undefined,
  triggerable,
  ...props
}) => {
  return (
    /* @ts-expect-error */
    <AccordionPrimitive.Item
      {...props}
      className={clx("border-grey-20 group", "py-3", className)}
    >
      {/* @ts-expect-error */}
      <AccordionPrimitive.Header className="px-1 radix-state-open:pt-8 transition-all duration-300">
        <div className="flex flex-col">
          <div className="flex w-full items-center gap-3">
            {/* @ts-expect-error */}
            <AccordionPrimitive.Trigger>
              <div className="flex items-center gap-4">
                {customTrigger || <MorphingTrigger />}
                <Text className="text-xl text-neutral-950 font-normal">
                  {title}
                </Text>
              </div>
            </AccordionPrimitive.Trigger>
          </div>
          {subtitle && (
            <Text as="span" size="small" className="mt-1">
              {subtitle}
            </Text>
          )}
        </div>
      </AccordionPrimitive.Header>
      {/* @ts-expect-error */}
      <AccordionPrimitive.Content
        forceMount={forceMountContent}
        className={clx(
          "radix-state-closed:animate-accordion-close radix-state-open:animate-accordion-open radix-state-closed:pointer-events-none px-1 h-fit"
        )}
      >
        <div className="inter-base-regular group-radix-state-closed:animate-accordion-close">
          {description && <Text>{description}</Text>}
          <div className="w-full">{children}</div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}

Accordion.Item = Item

const MorphingTrigger = () => {
  return (
    <div className="relative w-[18px] h-[18px] rounded-full">
      <CirclePlus className="absolute z-10 inset-0 transition-opacity duration-300 group-radix-state-closed:opacity-100 group-radix-state-open:opacity-50" />
      <CircleMinus className="absolute z-10 inset-0 transition-opacity duration-300 group-radix-state-closed:opacity-0 group-radix-state-open:opacity-100" />
    </div>
  )
}

export default Accordion
