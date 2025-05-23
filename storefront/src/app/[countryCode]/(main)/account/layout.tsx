import { retrieveCustomer } from "@/lib/data/customer"
import { redirect } from "next/navigation"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  try {
    const customer = await retrieveCustomer()
    return <>{customer ? dashboard : login}</>
  } catch (error) {
    console.error("Error in account layout:", error)
    return <>{login}</>
  }
}
export const dynamic = "force-dynamic"
