import { updateLineItem } from "@/lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Input, clx } from "@medusajs/ui"
import { useState, useRef, useEffect } from "react"

const AddNoteButton = ({
  item,
  disabled,
}: {
  item: HttpTypes.StoreCartLineItem
  disabled?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [note, setNote] = useState((item.metadata?.note as string) || "")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const setNoteMetadata = async (newNote: string) => {
    setIsOpen(false)
    await updateLineItem({
      lineId: item.id,
      data: { quantity: item.quantity, metadata: { note: newNote?.trim() } },
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setNoteMetadata(note)
    }
  }

  const handleBlur = () => {
    setNoteMetadata(note)
    setIsOpen(false)
  }

  const deleteNote = () => {
    setNote("")
    setNoteMetadata("")
    setIsOpen(false)
  }

  return (
    <div className="relative w-fit flex items-center justify-center">
      {!note && !isOpen && (
        <button
          className={clx(
            "text-neutral-950 text-xs shadow-[0_0_0_1px_rgba(0,0,0,0.1)] rounded-full px-2 py-1 w-fit min-w-20 h-6 flex items-center justify-center hover:bg-neutral-100 transition-all duration-300",
            isOpen ? "opacity-0 pointer-events-none" : "opacity-100",
            disabled ? "opacity-50 pointer-events-none" : "opacity-100"
          )}
          onClick={() => setIsOpen(true)}
          disabled={disabled}
        >
          Add note
        </button>
      )}
      {note?.length > 0 && (
        <span
          className={clx(
            "flex transition-opacity duration-150 items-center justify-center gap-x-1 text-neutral-600 text-xs line-clamp-none",
            isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
          <span className="text-neutral-950">Note:&nbsp;</span>
          <span
            className="text-neutral-600 italic cursor-pointer hover:text-neutral-950 hover:underline"
            onClick={() => setIsOpen(true)}
          >
            {note}
          </span>
          <button
            className="text-neutral-600 text-xs ml-2 hover:text-ui-fg-interactive-hover"
            onClick={deleteNote}
          >
            x
          </button>
        </span>
      )}
      <div
        className={`absolute left-0 flex text-neutral-600 text-xs transition-all duration-150 items-center justify-center self-center ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <span className="text-neutral-950">Note:&nbsp;</span>

        <Input
          ref={inputRef}
          className="w-fit small:max-w-40 max-w-32 h-6 flex items-center justify-center text-neutral-950 text-xs rounded-full"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e)}
          onBlur={() => handleBlur()}
        />
      </div>
    </div>
  )
}

export default AddNoteButton
