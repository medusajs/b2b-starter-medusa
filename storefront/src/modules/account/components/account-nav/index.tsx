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
              <span>Conta</span>
            </>
          </LocalizedClientLink>
        ) : (
          <>
            <div className="text-xl-semi mb-4 px-8">
              Olá {customer?.first_name}
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
                        <span>Perfil</span>
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
                        <span>Empresa</span>
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
                        <span>Endereços</span>
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
                      <span>Pedidos</span>
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
                        <span>Aprovações</span>
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
                      <span>Cotações</span>
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
                      <span>Sair</span>
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
                Visão Geral
              </AccountNavLink>
            </li>
            <li>
              <AccountNavLink
                href="/account/profile"
                route={route!}
                data-testid="profile-link"
              >
                Perfil
              </AccountNavLink>
            </li>
            <li>
              <AccountNavLink
                href="/account/company"
                route={route!}
                data-testid="company-link"
              >
                Empresa
              </AccountNavLink>
            </li>
            <li>
              <AccountNavLink
                href="/account/employees"
                route={route!}
                data-testid="employees-link"
              >
                Colaboradores
              </AccountNavLink>
            </li>
            <li>
              <AccountNavLink
                href="/account/addresses"
                route={route!}
                data-testid="addresses-link"
              >
                Endereços
              </AccountNavLink>
            </li>
            <li>
              <AccountNavLink
                href="/account/security"
                route={route!}
                data-testid="security-link"
              >
                Segurança
              </AccountNavLink>
            </li>
            <li>
              <AccountNavLink
                href="/account/preferences"
                route={route!}
                data-testid="preferences-link"
              >
                Preferências
              </AccountNavLink>
            </li>
            <li>
              <AccountNavLink
                href="/account/orders"
                route={route!}
                data-testid="orders-link"
              >
                Pedidos
              </AccountNavLink>
            </li>
            {customer?.employee?.is_admin && (
              <li>
                <AccountNavLink
                  href="/account/approvals"
                  route={route!}
                  data-testid="approvals-link"
                >
                  Aprovações{" "}
                  {numPendingApprovals > 0 && (
                    <span className="bg-gradient-to-r from-yello-yellow-400 to-yello-orange-400 text-white text-xs px-2 py-1 rounded-full font-medium shadow-sm">
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
                Cotações
              </AccountNavLink>
            </li>
            <li className="text-yello-gray-500 hover:text-yello-magenta-500 transition-colors duration-200">
              <button
                type="button"
                onClick={handleLogout}
                data-testid="logout-button"
                className="flex items-center gap-x-2 w-full text-left"
              >
                Sair
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
        "text-yello-gray-500 hover:text-yello-magenta-500 flex items-center gap-x-2 transition-colors duration-200 font-medium",
        {
          "text-yello-yellow-600 bg-gradient-to-r from-yello-yellow-50 to-yello-orange-50 px-3 py-2 rounded-lg border border-yello-yellow-100": active,
        }
      )}
      data-testid={dataTestId}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </LocalizedClientLink>
  )
}

export default AccountNav
