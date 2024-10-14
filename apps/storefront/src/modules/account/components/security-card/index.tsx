"use client"

import { updateCustomer } from "@lib/data/customer"
import { HttpTypes } from "@medusajs/types"
import { Container, Text, Toaster, clx, toast } from "@medusajs/ui"
import Button from "@modules/common/components/button"
import Input from "@modules/common/components/input"
import { QueryEmployee } from "@starter/types"
import { useState } from "react"

const SecurityCard = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer & { employee: QueryEmployee }
}) => {
  return (
    <div className="h-fit">
      <Container className="p-0 overflow-hidden">
        <div className="grid grid-cols-2 gap-4 border-b border-neutral-200 p-4">
          <div className="flex flex-col gap-y-2">
            <Text className="font-medium text-neutral-950">Password</Text>
            <Text className=" text-neutral-500">***************</Text>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 bg-neutral-50 p-4">
          <Button
            variant="secondary"
            onClick={() => toast.info("Not implemented")}
          >
            Edit
          </Button>
        </div>
      </Container>
      <Toaster />
    </div>
  )
}

export default SecurityCard
