import OrderCard from "@/modules/account/components/order-card"
import PreviouslyPurchasedProducts from "@/modules/account/components/previously-purchased"
import { B2BCustomer } from "@/types/global"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"

type OverviewProps = {
  customer: B2BCustomer | null
  orders: HttpTypes.StoreOrder[] | null
  region?: HttpTypes.StoreRegion | null
}

const Overview = ({ customer, orders }: OverviewProps) => {
  return (
    <div data-testid="overview-page-wrapper">
      <div className="hidden small:block">
        <div className="text-xl-semi flex justify-between items-center mb-4">
          <span data-testid="welcome-message" data-value={customer?.first_name}>
            Hello {customer?.first_name}
          </span>
          <span className="text-small-regular text-ui-fg-base">
            Signed in as:{" "}
            <span
              className="font-semibold"
              data-testid="customer-email"
              data-value={customer?.email}
            >
              {customer?.email}
            </span>
          </span>
        </div>
        <div className="flex flex-col gap py-8 border-t border-gray-200">
          <div className="flex flex-col gap-y-8 h-full col-span-1 row-span-2 flex-1">
            <div className="flex items-start gap-x-16 mb-6">
              <div className="flex flex-col gap-y-4">
                <h3 className="text-large-semi">Profile</h3>
                <div className="flex items-end gap-x-2">
                  <span
                    className="text-3xl-semi leading-none"
                    data-testid="customer-profile-completion"
                    data-value={getProfileCompletion(customer)}
                  >
                    {getProfileCompletion(customer)}%
                  </span>
                  <span className="uppercase text-base-regular text-ui-fg-subtle">
                    Completed
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-y-4">
                <h3 className="text-large-semi">Addresses</h3>
                <div className="flex items-end gap-x-2">
                  <span
                    className="text-3xl-semi leading-none"
                    data-testid="addresses-count"
                    data-value={customer?.addresses?.length || 0}
                  >
                    {customer?.addresses?.length || 0}
                  </span>
                  <span className="uppercase text-base-regular text-ui-fg-subtle">
                    Saved
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-y-4">
              <div className="flex items-center gap-x-2">
                <Heading level="h3" className="text-xl text-neutral-950">
                  Recent orders
                </Heading>
              </div>
              <div
                className="flex flex-col gap-y-2"
                data-testid="orders-wrapper"
              >
                {orders && orders.length > 0 ? (
                  orders
                    .slice(0, 5)
                    .map((order) => <OrderCard order={order} key={order.id} />)
                ) : (
                  <span data-testid="no-orders-message">No recent orders</span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-y-4">
              <div className="flex items-center gap-x-2">
                <Heading level="h3" className="text-xl text-neutral-950">
                  Previously purchased items
                </Heading>
              </div>
              <div
                className="flex flex-col gap-y-2"
                data-testid="previously-purchased-items-wrapper"
              >
                {orders && orders.length > 0 ? (
                  <PreviouslyPurchasedProducts orders={orders} />
                ) : (
                  <span data-testid="no-previously-purchased-items-message">
                    No previously purchased items
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const getProfileCompletion = (customer: B2BCustomer | null) => {
  let count = 0

  if (!customer) {
    return 0
  }

  if (customer.email) {
    count++
  }

  if (customer.first_name && customer.last_name) {
    count++
  }

  if (customer.phone) {
    count++
  }

  const billingAddress = customer.addresses?.find(
    (addr) => addr.is_default_billing
  )

  if (billingAddress) {
    count++
  }

  return (count / 4) * 100
}

export default Overview
