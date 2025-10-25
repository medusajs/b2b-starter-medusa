import React, { useState } from "react"
import { ProductDetailsWidgetProps, WidgetConfig } from "@medusajs/admin"
import { useAdminCustomQuery, useAdminCustomMutation } from "medusa-react"
import {
  Container,
  Heading,
  Button,
  Input,
  Label,
  Table,
  Toaster,
  toast,
} from "@medusajs/ui"

type TechnicalSheet = {
  id: string
  url: string
  file_type: string
  version: string
}

type TechnicalSheetsRes = {
  technicalSheets: TechnicalSheet[]
}

const TechnicalSheetsWidget = ({ product }: ProductDetailsWidgetProps) => {
  const { data, isLoading, refetch } = useAdminCustomQuery<
    never,
    TechnicalSheetsRes
  >(`/api/admin/technical-sheets?product_id=${product.id}`, [
    "technical-sheets",
    product.id,
  ])

  const mutation = useAdminCustomMutation(`/api/admin/technical-sheets`, ["POST"])

  const [url, setUrl] = useState("")
  const [fileType, setFileType] = useState("")
  const [version, setVersion] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(
      {
        url,
        file_type: fileType,
        version,
        product_id: product.id,
      },
      {
        onSuccess: () => {
          toast.success("Technical Sheet Added")
          refetch()
          setUrl("")
          setFileType("")
          setVersion("")
        },
        onError: (error) => {
          toast.error("Failed to add technical sheet")
        },
      }
    )
  }

  return (
    <>
      <Toaster />
      <Container>
        <Heading level="h2" className="mb-4">
          Technical Sheets
        </Heading>

        <form
          onSubmit={handleSubmit}
          className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4"
        >
          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="fileType">File Type</Label>
            <Input
              id="fileType"
              type="text"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />
          </div>
          <div className="self-end">
            <Button type="submit" variant="primary" isLoading={mutation.isLoading}>
              Add Sheet
            </Button>
          </div>
        </form>

        {isLoading && <div>Loading...</div>}
        {data && data.technicalSheets.length > 0 ? (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>URL</Table.HeaderCell>
                <Table.HeaderCell>File Type</Table.HeaderCell>
                <Table.HeaderCell>Version</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data.technicalSheets.map((sheet) => (
                <Table.Row key={sheet.id}>
                  <Table.Cell>
                    <a href={sheet.url} target="_blank" rel="noopener noreferrer">
                      {sheet.url}
                    </a>
                  </Table.Cell>
                  <Table.Cell>{sheet.file_type}</Table.Cell>
                  <Table.Cell>{sheet.version}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          !isLoading && <div>No technical sheets found.</div>
        )}
      </Container>
    </>
  )
}

export const config: WidgetConfig = {
  zone: "product.details.after",
}

export default TechnicalSheetsWidget
