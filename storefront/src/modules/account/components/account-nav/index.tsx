"use client"

import { signout } from "@/lib/data/customer"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import ChevronDown from "@/modules/common/icons/chevron-down"
import FilePlus from "@/modules/common/icons/file-plus"
import MapPin from "@/modules/common/icons/map-pin"
import Package from "@/modules/common/icons/package"
import User from "@/modules/common/icons/user"
import { B2BCustomer } from "@/types/global"
import { ArrowRightOnRectangle, BuildingStorefront } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useParams, usePathname } from "next/navigation"

const AccountNav = ({
  customer,
  numPendingApprovals,
}: {
  customer: B2BCustomer | null
  numPendingApprovals: number
}) => {
  const route = usePathname()

  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout(countryCode, customer?.id as string)
  }

  return (
    <div>
      <div className="small:hidden" data-testid="mobile-account-nav">
        {route !== `/${countryCode}/account` ? (
          <LocalizedClientLink
            href="/account"
            className="flex items-center gap-x-2 text-small-regular py-2"
            data-testid="account-main-link"
          >
            <>
              <ChevronDown className="transform rotate-90" />
              <span>Account</span>
            </>
          </LocalizedClientLink>
        ) : (
          <>
            <div className="text-xl-semi mb-4 px-8">
              Hello {customer?.first_name}
            </div>
            <div className="text-base-regular">
              <ul>
                <li>
                  <LocalizedClientLink
                    href="/account/profile"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="profile-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <User size={20} />
                        <span>Profile</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/company"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="company-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <BuildingStorefront width={20} />
                        <span>Company</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/addresses"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="addresses-link"
                  >
                    <>
                      <div className="flex items-center gap-x-2">
                        <MapPin size={20} />
                        <span>Addresses</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </>
                  </LocalizedClientLink>
                </li>
                <li>
                  <LocalizedClientLink
                    href="/account/orders"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="orders-link"
                  >
                    <div className="flex items-center gap-x-2">
                      <Package size={20} />
                      <span>Orders</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                {customer?.employee?.is_admin && (
                  <li>
                    <LocalizedClientLink
                      href="/account/approvals"
                      className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                      data-testid="approvals-link"
                    >
                      <div className="flex items-center gap-x-2">
                        <FilePlus size={16} />
                        <span>Approvals</span>
                      </div>
                      <ChevronDown className="transform -rotate-90" />
                    </LocalizedClientLink>
                  </li>
                )}
                <li>
                  <LocalizedClientLink
                    href="/account/quotes"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8"
                    data-testid="quotes-link"
                  >
                    <div className="flex items-center gap-x-2">
                      <FilePlus size={16} />
                      <span>Quotes</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </LocalizedClientLink>
                </li>
                <li>
                  <button
                    type="button"
                    className="flex items-center justify-between py-4 border-b border-gray-200 px-8 w-full"
                    onClick={handleLogout}
                    data-testid="logout-button"
                  >
                    <div className="flex items-center gap-x-2">
                      <ArrowRightOnRectangle />
                      <span>Log out</span>
                    </div>
                    <ChevronDown className="transform -rotate-90" />
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
      <div className="hidden small:block" data-testid="account-nav">
        <div className="text-lg">
          <ul className="flex mb-0 justify-start items-start flex-col gap-y-4">
            <li>
              <AccountNavLink
                href="/account"
                route={route!}
                data-testid="overview-link"
              >
                Overview
              </AccountNavLink>
            </li>
            <li>
              <AccountNavLink
                href="/account/profile"
                route={route!}
                data-testid="profile-link"
              >
                Profile
              </AccountNavLink>
            </li>
            <li>
              <AccountNavLink
                href="/account/company"
                route={route!}
                data-testid="company-link"
              >
                Company
              </AccountNavLink>
            </li>
            <li>
              <AccountNavLink
                href="/account/addresses"
                route={route!}
                data-testid="addresses-link"
              >
                Addresses
              </AccountNavLink>
            </li>
            <li>
              <AccountNavLink
                href="/account/orders"
                route={route!}
                data-testid="orders-link"
              >
                Orders
              </AccountNavLink>
            </li>
            {customer?.employee?.is_admin && (
              <li>
                <AccountNavLink
                  href="/account/approvals"
                  route={route!}
                  data-testid="approvals-link"
                >
                  Approvals{" "}
                  {numPendingApprovals > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-1.5 py-px rounded-full">
                      {numPendingApprovals}
                    </span>
                  )}
                </AccountNavLink>
              </li>
            )}
            <li>
              <AccountNavLink
                href="/account/quotes"
                route={route!}
                data-testid="quotes-link"
              >
                Quotes
              </AccountNavLink>
            </li>
            <li className="text-neutral-400 hover:text-neutral-950">
              <button
                type="button"
                onClick={handleLogout}
                data-testid="logout-button"
              >
                Log out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

type AccountNavLinkProps = {
  href: string
  route: string
  children: React.ReactNode
  "data-testid"?: string
}

const AccountNavLink = ({
  href,
  route,
  children,
  "data-testid": dataTestId,
}: AccountNavLinkProps) => {
  const { countryCode }: { countryCode: string } = useParams()

  const active = route.split(countryCode)[1] === href
  return (
    <LocalizedClientLink
      href={href}
      className={clx(
        "text-neutral-400 hover:text-neutral-950 flex items-center gap-x-2",
        {
          "text-neutral-950": active,
        }
      )}
      data-testid={dataTestId}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
