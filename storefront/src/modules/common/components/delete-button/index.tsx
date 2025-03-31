import { useCart } from "@/lib/context/cart-context"
import { clx } from "@medusajs/ui"
import Spinner from "@/modules/common/icons/spinner"
import { useState } from "react"

const DeleteButton = ({
  id,
  className,
  disabled,
}: {
  id: string
  className?: string
  disabled?: boolean
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const { handleDeleteItem } = useCart()

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    await handleDeleteItem(id)
  }

  return (
    <div
      className={clx(
        "flex items-center justify-between text-small-regular",
        className
      )}
    >
      <button
        className={clx(
          "text-neutral-950 text-xs shadow-[0_0_0_1px_rgba(0,0,0,0.1)] rounded-full px-2 py-1 hover:bg-neutral-100 min-w-20 flex items-center justify-center",
          disabled ? "opacity-50 pointer-events-none" : "opacity-100"
        )}
        onClick={() => handleDelete(id)}
        disabled={disabled}
      >
        {isDeleting ? <Spinner size={12} /> : "Remove"}
      </button>
    </div>
  )
}

export default DeleteButton
