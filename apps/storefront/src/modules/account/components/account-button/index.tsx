import { retrieveCustomer } from "@lib/data/customer"
import User from "@modules/common/icons/user"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default async function AccountButton() {
  const customer = await retrieveCustomer().catch(() => null)

  return (
    <LocalizedClientLink className="hover:text-ui-fg-base" href="/account">
      <button className="flex gap-1.5 items-center rounded-2xl bg-none shadow-none border-none hover:bg-neutral-100 px-2 py-1">
        <User />
        <span className="hidden small:inline-block">
          {customer ? customer.first_name : "Log in"}
        </span>
      </button>
    </LocalizedClientLink>
  )
}
