import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getRegion } from "@/lib/data/regions"
import { listCatalog, listManufacturers, getCategoryInfo } from "@/lib/data/catalog"
import CategoryTemplate from "@/modules/catalog/templates/category-template"
import { LeadQuoteProvider } from "@/modules/lead-quote/context"
import CategoryTracker from "@/modules/catalog/components/CategoryTracker"

type Props = {
    params: Promise<{ countryCode: string; category: string }>
    searchParams: Promise<{ [key: string]: string | undefined }>
}

export const revalidate = 600 // ISR: 10 minutes

export async function generateMetadata({ params }: { params: Props['params'] }): Promise<Metadata> {
    const { category, countryCode } = await params
    const categoryInfo = await getCategoryInfo(category)

    const title = `${categoryInfo.title} - Yello Solar Hub`
    const description = categoryInfo.description

    return {
        title,
        description,
        keywords: categoryInfo.keywords?.join(', '),
        openGraph: {
            title,
            description,
            siteName: "Yello Solar Hub",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
        alternates: {
            canonical: `/${countryCode}/categories/${category}`,
            languages: {
                'pt-BR': `/br/categories/${category}`,
                'en-US': `/us/categories/${category}`,
            },
        },
    }
}

export default async function CategoryPage({ params, searchParams }: Props) {
    const p = await params
    const sp = await searchParams
    const region = await getRegion(p.countryCode)

    if (!region) {
        notFound()
    }

    // Validate category exists
    const categoryInfo = await getCategoryInfo(p.category)
    if (!categoryInfo) {
        notFound()
    }

    // Data loading via lib/data loaders
    const [catalogData, manufacturers] = await Promise.all([
        listCatalog(p.category, sp),
        listManufacturers(),
    ])

    return (
        <LeadQuoteProvider>
            <CategoryTracker category={p.category} />
            <CategoryTemplate
                category={p.category}
                categoryInfo={categoryInfo}
                region={region}
                countryCode={p.countryCode}
                products={catalogData.products}
                total={catalogData.total}
                currentPage={catalogData.page}
                pageSize={catalogData.limit}
                manufacturers={manufacturers}
                searchParams={sp}
            />
        </LeadQuoteProvider>
    )
}
