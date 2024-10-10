"use client"

import Button from "@modules/common/components/button"
import Input from "@modules/common/components/input"
import { Container, Text } from "@medusajs/ui"
import { QueryCompany } from "@starter/types"

const InviteEmployeeCard = ({ company }: { company: QueryCompany }) => {
  return (
    <Container className="p-0 overflow-hidden">
      <div className="grid grid-cols-4 gap-x-4 p-4 border-b border-neutral-200">
        <div className="flex flex-col gap-y-2">
          <Text className="font-medium text-neutral-950">Name</Text>
          <Input name="first_name" label="First name" />
        </div>
        <div className="flex flex-col gap-y-2 justify-end">
          <Input name="last_name" label="Last name" />
        </div>
        <div className="flex flex-col col-span-2 gap-y-2">
          <Text className="font-medium text-neutral-950">Email</Text>
          <Input name="email" label="Enter an email" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 bg-neutral-50 p-4">
        <Button variant="primary">Send Invite</Button>
      </div>
    </Container>
  )
}

export default InviteEmployeeCard
