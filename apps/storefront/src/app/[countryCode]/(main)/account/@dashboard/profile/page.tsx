import { Metadata } from "next"

import { retrieveCustomer } from "@lib/data/customer"
import { listRegions } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import ProfileCard from "@modules/account/components/profile-card"
import SecurityCard from "@modules/account/components/security-card"
import { QueryEmployee } from "@starter/types"
import { notFound } from "next/navigation"
import { B2BCustomer } from "types/global"

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your Medusa Store profile.",
}

export default async function Profile() {
  const customer = await retrieveCustomer()
  const regions = await listRegions()

  if (!customer || !regions) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="profile-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <Heading level="h2" className="text-lg text-neutral-950">
          Details
        </Heading>
        <ProfileCard customer={customer} />
      </div>
      <div className="mb-8 flex flex-col gap-y-4">
        <Heading level="h2" className="text-lg text-neutral-950">
          Security
        </Heading>
        <SecurityCard customer={customer} />
      </div>
    </div>
  )
}

const Divider = () => {
  return <div className="w-full h-px bg-gray-200" />
}
