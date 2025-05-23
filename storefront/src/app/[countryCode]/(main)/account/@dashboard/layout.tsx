import { retrieveCustomer } from "@/lib/data/customer"
import AccountLayout from "@/modules/account/templates/account-layout"
import Image from "next/image"
import { redirect } from "next/navigation"

export default async function AccountPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const customer = await retrieveCustomer()
    
    if (!customer) {
      redirect("/account/login")
    }

    return (
      <div className="flex flex-col gap-2 p-2">
        <Image
          src="/account-block.jpg"
          alt="Login banner background"
          className="object-cover transition-opacity duration-300 w-full h-44"
          width={2000}
          height={200}
        />
        <AccountLayout customer={customer}>{children}</AccountLayout>
      </div>
    )
  } catch (error) {
    console.error("Error in dashboard layout:", error)
    redirect("/account/login")
  }
}
