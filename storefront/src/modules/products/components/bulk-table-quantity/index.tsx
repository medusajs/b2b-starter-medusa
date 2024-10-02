import { Input } from "@medusajs/ui"
import { useState } from "react"

type BulkTableQuantityProps = {
  variantId: string
  onChange: (variantId: string, quantity: number) => void
}

const BulkTableQuantity = ({ variantId, onChange }: BulkTableQuantityProps) => {
  const [quantity, setQuantity] = useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(e.target.value))
    onChange(variantId, Number(e.target.value))
  }

  return <Input value={quantity} onChange={handleChange} type="number" />
}

export default BulkTableQuantity
