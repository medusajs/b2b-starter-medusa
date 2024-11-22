import { XMark } from "@medusajs/icons"
import { Button } from "@medusajs/ui"
import * as Dialog from "@radix-ui/react-dialog"
import { useState } from "react"

export const PromptModal = ({
  title,
  description,
  handleAction,
  children,
  isLoading,
}: {
  title: string
  description: string
  handleAction: () => void
  children: React.ReactNode
  isLoading: boolean
}) => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-[75]" />
        <Dialog.Content className="z-[100] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none txt-compact-medium">
          <Dialog.Title className="font-sans font-medium h2-core text-ui-fg-base">
            {title}
          </Dialog.Title>

          <Dialog.Description className="py-3">
            {description}
          </Dialog.Description>

          <div className="flex gap-x-2 items-end justify-end self-end">
            <Dialog.Close asChild>
              <Button variant="secondary" size="small">
                Cancel
              </Button>
            </Dialog.Close>
            <Button
              isLoading={isLoading}
              size="small"
              onClick={async () => {
                await handleAction()

                setOpen(false)
              }}
            >
              Continue
            </Button>
          </div>

          <Dialog.Close asChild>
            <XMark className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[12px] right-[10px] inline-flex h-[17px] w-[17px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] outline-none cursor-pointer" />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
