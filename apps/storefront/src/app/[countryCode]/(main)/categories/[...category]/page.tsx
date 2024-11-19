import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { getRegion, listRegions } from "@lib/data/regions"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { listProductsWithSort } from "@lib/data/products"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params

  try {
    const product_category = await getCategoryByHandle(params.category)

    const title = product_category.name

    const description = product_category.description ?? `${title} category.`

    return {
      title: `${title} | Medusa Store`,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    notFound()
  }
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then(
    (regions) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  if (!countryCodes) {
    return null
  }

  const categories = await listCategories()

  return countryCodes
    .map((countryCode) =>
      categories.map((category) => ({
        countryCode,
        category: category.handle.split("/"),
      }))
    )
    .flat()
}

export default async function CategoryPage(props: Props) {
  const searchParams = await props.searchParams
  const params = await props.params
  const { sortBy, page, ...queryParams } = searchParams

  const categories = await listCategories()

  const currentCategory = categories.find(
    (category) => category.handle === params.category.join("/")
  )

  if (!currentCategory) {
    notFound()
  }

  let {
    response: { products, count },
  } = await listProductsWithSort({
    page: page ? parseInt(page) : 1,
    queryParams: {
      category_id: [currentCategory?.id],
      ...queryParams,
    },
    sortBy,
    countryCode: params.countryCode,
  })

  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  return (
    <CategoryTemplate
      categories={categories}
      currentCategory={currentCategory}
      sortBy={sortBy}
      page={page}
      countryCode={params.countryCode}
      products={products}
      count={count}
      region={region}
    />
  )
}
