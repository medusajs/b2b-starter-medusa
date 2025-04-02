import { listCategories } from "@/lib/data/categories"
import MegaMenu from "./mega-menu"

export async function MegaMenuWrapper() {
  const categories = await listCategories().catch(() => [])

  return <MegaMenu categories={categories} />
}

export default MegaMenuWrapper
