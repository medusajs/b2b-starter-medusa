"use client"

import { HttpTypes } from "@medusajs/types"
import { Table, Text, Link } from "@medusajs/ui"
import React, { useEffect, useState } from "react"

type TechnicalSheet = {
  id: string
  url: string
  file_type: string
  version: string
}

type TechnicalSheetsRes = {
  technicalSheets: TechnicalSheet[]
}

const TechnicalSheetsTab = ({
  product,
}: {
  product: HttpTypes.StoreProduct
}) => {
  const [technicalSheets, setTechnicalSheets] = useState<TechnicalSheet[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTechnicalSheets = async () => {
      try {
        const res = await fetch(
          `/api/store/technical-sheets?product_id=${product.id}`
        )
        const data: TechnicalSheetsRes = await res.json()
        setTechnicalSheets(data.technicalSheets)
      } catch (error) {
        console.error("Failed to fetch technical sheets:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTechnicalSheets()
  }, [product.id])

  if (isLoading) {
    return <Text>Loading technical sheets...</Text>
  }

  if (technicalSheets.length === 0) {
    return <Text>No technical sheets available for this product.</Text>
  }

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Document</Table.HeaderCell>
          <Table.HeaderCell>File Type</Table.HeaderCell>
          <Table.HeaderCell>Version</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {technicalSheets.map((sheet) => (
          <Table.Row key={sheet.id}>
            <Table.Cell>
              <Link href={sheet.url} target="_blank">
                View Document
              </Link>
            </Table.Cell>
            <Table.Cell>{sheet.file_type}</Table.Cell>
            <Table.Cell>{sheet.version}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

export default TechnicalSheetsTab
