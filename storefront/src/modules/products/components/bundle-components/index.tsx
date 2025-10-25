"use client"

import { HttpTypes } from "@medusajs/types"
import { Table, Text, Thumbnail } from "@medusajs/ui"
import React, { useEffect, useState } from "react"

interface Bundle {
  id: string
  title: string
  items: {
    id: string
    quantity: number
    product: HttpTypes.StoreProduct
  }[]
}

const BundleComponentsTab = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  const [bundle, setBundle] = useState<Bundle | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBundle = async () => {
      // Assuming the bundle ID is stored in the product's metadata
      const bundleId = product.metadata?.bundle_id as string | undefined

      if (!bundleId) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/store/bundles/${bundleId}`)
        const data: { bundle: Bundle } = await res.json()
        setBundle(data.bundle)
      } catch (error) {
        console.error("Failed to fetch bundle:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBundle()
  }, [product.metadata?.bundle_id])

  if (isLoading) {
    return <Text>Loading bundle components...</Text>
  }

  if (!bundle) {
    return <Text>This bundle has no components.</Text>
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Component</Table.HeaderCell>
          <Table.HeaderCell>Quantity</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {bundle.items.map((item) => (
          <Table.Row key={item.id}>
            <Table.Cell className="flex items-center gap-x-2">
              <Thumbnail
                src={item.product.thumbnail}
                alt={item.product.title}
              />
              <span>{item.product.title}</span>
            </Table.Cell>
            <Table.Cell>{item.quantity}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export default BundleComponentsTab
