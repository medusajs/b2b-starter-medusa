import React, { useState } from "react"
import { useAdminCustomMutation, useAdminProducts } from "medusa-react"
import {
  Button,
  Input,
  Label,
  Toaster,
  toast,
  Select,
  Text,
} from "@medusajs/ui"
import { Product } from "@medusajs/medusa"

interface BundleItem {
  product_id: string
  quantity: number
}

interface SelectOption {
  value: string
  label: string
}

export const CreateBundleForm = () => {
  const [title, setTitle] = useState("")
  const [items, setItems] = useState<BundleItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { products, isLoading: isLoadingProducts } = useAdminProducts({
    q: searchTerm,
    limit: 10,
  })

  const mutation = useAdminCustomMutation(`/api/admin/bundles`, ["POST"])

  const productOptions: SelectOption[] =
    products?.map((p: Product) => ({
      value: p.id,
      label: p.title,
    })) || []

  const handleProductSelect = (selectedOptions: SelectOption[]) => {
    const newItems = selectedOptions.map((opt) => {
      const existingItem = items.find((item) => item.product_id === opt.value)
      return {
        product_id: opt.value,
        quantity: existingItem?.quantity || 1, // Keep existing quantity or default to 1
      }
    })
    setItems(newItems)
  }

  const handleQuantityChange = (productId: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: Math.max(1, quantity) } // Ensure quantity is at least 1
          : item
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || items.length === 0) {
      toast.error("Please provide a title and at least one component product.")
      return
    }

    mutation.mutate(
      { title, items },
      {
        onSuccess: () => {
          toast.success("Bundle created successfully!")
          setTitle("")
          setItems([])
        },
        onError: () => {
          toast.error("Failed to create bundle.")
        },
      }
    )
  }

  return (
    <>
      <Toaster />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="bundle-title">Bundle Title</Label>
          <Input
            id="bundle-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Starter Kit"
            required
          />
        </div>
        <div>
          <Label>Component Products</Label>
          <Select
            isMulti
            onSearchChange={setSearchTerm}
            options={productOptions}
            value={items.map((item) => ({
              value: item.product_id,
              label:
                products?.find((p) => p.id === item.product_id)?.title ||
                item.product_id,
            }))}
            onChange={handleProductSelect}
          />
          <Text size="small" className="text-ui-fg-subtle mt-1">
            Search for products to add to the bundle.
          </Text>
        </div>

        {items.length > 0 && (
          <div className="flex flex-col gap-y-4">
            <Label>Component Quantities</Label>
            {items.map((item) => (
              <div
                key={item.product_id}
                className="grid grid-cols-3 items-center gap-x-4"
              >
                <Text className="truncate col-span-2">
                  {products?.find((p) => p.id === item.product_id)?.title}
                </Text>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(
                      item.product_id,
                      parseInt(e.target.value, 10)
                    )
                  }
                />
              </div>
            ))}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          isLoading={mutation.isLoading}
          className="mt-4"
        >
          Create Bundle
        </Button>
      </form>
    </>
  )
}
