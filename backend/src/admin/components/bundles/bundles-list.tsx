import { useAdminCustomQuery } from "medusa-react"
import { Table, Text } from "@medusajs/ui"
import { Product } from "@medusajs/medusa"

interface Bundle {
  id: string
  title: string
  items: {
    id: string
    quantity: number
    product: Product
  }[]
}

type BundlesListRes = {
  bundles: Bundle[]
}

export const BundlesList = () => {
  const { data, isLoading } = useAdminCustomQuery<never, BundlesListRes>(
    `/api/admin/bundles`,
    ["bundles"]
  )

  return (
    <div>
      {isLoading && <Text>Loading...</Text>}
      {data?.bundles && data.bundles.length > 0 ? (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Components</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.bundles.map((bundle) => (
              <Table.Row key={bundle.id}>
                <Table.Cell>{bundle.title}</Table.Cell>
                <Table.Cell>
                  <ul>
                    {bundle.items.map((item) => (
                      <li key={item.id}>
                        {item.quantity}x {item.product?.title || "N/A"}
                      </li>
                    ))}
                  </ul>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        !isLoading && <Text>No bundles found.</Text>
      )}
    </div>
  )
}
