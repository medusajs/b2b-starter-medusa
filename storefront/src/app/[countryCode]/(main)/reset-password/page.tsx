import { HttpTypes } from "@medusajs/types"
import { getRegion } from "@/lib/data/regions"
import LoginTemplate from "@/modules/account/templates/login-template"

type Props = {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({ params, searchParams }: Props) {
  const { countryCode } = await params
  const regions: HttpTypes.StoreRegion[] = await getRegion(countryCode)

  return <LoginTemplate regions={regions} />
}
