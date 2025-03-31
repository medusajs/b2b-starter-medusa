import { retrieveCustomer } from "@/lib/data/customer"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  const customer = await retrieveCustomer().catch(() => null)

  return <>{customer ? dashboard : login}</>
}
