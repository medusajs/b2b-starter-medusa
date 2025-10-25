import { listCategoriesCompat } from "@/lib/data/catalog"
import MegaMenu from "./mega-menu"

export async function MegaMenuWrapper() {
  const categories = await listCategoriesCompat().catch(() => [])

  return <MegaMenu categories={categories} />
}

export default MegaMenuWrapper
