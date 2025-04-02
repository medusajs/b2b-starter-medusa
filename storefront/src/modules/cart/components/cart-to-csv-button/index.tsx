"use client"

import { cartToCsv } from "@/lib/util/convert-cart-to-csv"
import Button from "@/modules/common/components/button"
import { B2BCart } from "@/types"
import { Text } from "@medusajs/ui"
import { useState } from "react"

type CartToCsvButtonProps = {
  cart: B2BCart
}

const CartToCsvButton = ({ cart }: CartToCsvButtonProps) => {
  const [isExportingCart, setIsExportingCart] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExportCart = async () => {
    setIsExportingCart(true)
    setError(null)

    const csv = cartToCsv(cart)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })

    try {
      if (window.showSaveFilePicker) {
        const fileHandle = await window.showSaveFilePicker({
          suggestedName: "cart.csv",
          startIn: "downloads",
          types: [
            { description: "CSV File", accept: { "text/csv": [".csv"] } },
          ],
        })
        const writable = await fileHandle.createWritable()
        await writable.write(blob)
        await writable.close()
      } else {
        // Fallback for browsers that don't support the File System Access API
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = "cart.csv"
        link.click()
        URL.revokeObjectURL(url)
      }
    } catch (error: any) {
      setError(error.message)
    }

    setIsExportingCart(false)
  }

  return (
    <div className="flex flex-col gap-y-2 items-center">
      <Button
        className="w-full h-10 rounded-full shadow-borders-base"
        variant="secondary"
        onClick={handleExportCart}
        isLoading={isExportingCart}
      >
        Export Cart (.csv)
      </Button>
      {error && <Text className="text-red-500">{error}</Text>}
    </div>
  )
}

export default CartToCsvButton
