"use client"

import { XCircle } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import * as Dialog from "@radix-ui/react-dialog"

export const RequestQuotePrompt = ({
  children,
}: {
  children: React.ReactNode
}) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>{children}</Dialog.Trigger>

    <Dialog.Portal>
      <Dialog.Overlay className="bg-black/50 data-[state=open]:animate-overlayShow fixed inset-0 z-[75]" />
      <Dialog.Content className="z-[100] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
        <Dialog.Title className="text-xl">Request a quote</Dialog.Title>

        <div className="p-1">
          <ol className="list-decimal ml-8 my-5">
            <li>
              <Dialog.Close asChild>
                <LocalizedClientLink
                  className="text-blue-500 cursor-pointer"
                  href="/account"
                >
                  Log in
                </LocalizedClientLink>
              </Dialog.Close>
              {" or "}
              <Dialog.Close>
                <LocalizedClientLink
                  className="text-blue-500 cursor-pointer"
                  href="/account"
                >
                  create an account
                </LocalizedClientLink>
              </Dialog.Close>
            </li>
            <li>
              Open cart & click {'"'}Request a quote{'"'}
            </li>
          </ol>

          <p>We will then get back to you as soon as possible over email</p>
        </div>

        <Dialog.Close asChild>
          <XCircle className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] outline-none cursor-pointer" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)
