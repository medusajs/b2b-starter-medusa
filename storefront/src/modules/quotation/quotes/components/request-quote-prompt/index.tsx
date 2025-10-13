"use client"

import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { XCircle } from "@medusajs/icons"
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
      <Dialog.Content className="z-[100] data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[10px] bg-[var(--surface)] p-6 border border-[var(--border)] shadow-lg focus:outline-none txt-compact-medium">
        <Dialog.Title className="flex justify-between font-sans font-medium h2-core text-ui-fg-base">
          Solicitar cotação
          <Dialog.Close asChild>
            <XCircle className="text-violet11 hover:bg-violet4 focus:shadow-violet7 inline-flex appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] outline-none cursor-pointer" />
          </Dialog.Close>
        </Dialog.Title>

        <div className="p-1">
          <ol className="list-decimal ml-8 my-5">
            <li>
              <Dialog.Close asChild>
                <LocalizedClientLink
                  className="text-blue-500 cursor-pointer"
                  href="/account"
                >
                  Entrar na conta
                </LocalizedClientLink>
              </Dialog.Close>
              {" ou "}
              <Dialog.Close>
                <LocalizedClientLink
                  className="text-blue-500 cursor-pointer"
                  href="/account"
                >
                  criar uma conta
                </LocalizedClientLink>
              </Dialog.Close>
            </li>
            <li>Adicione produtos ao seu carrinho</li>
            <li>
              Abra o carrinho e clique em {'"'}Solicitar cotação{'"'}
            </li>
          </ol>

          <p>Retornaremos por e-mail o mais rápido possível.</p>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)
