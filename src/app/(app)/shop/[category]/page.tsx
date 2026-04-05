import { ShopPageContent } from '@/components/storefront/ShopPageContent'
import {
  SHOP_CATEGORY_LABELS,
  SHOP_CATEGORY_SLUGS,
  isShopCategorySlug,
  type ShopCategorySlug,
} from '@/constants/shopCategories'
import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<SearchParams>
}

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return SHOP_CATEGORY_SLUGS.map((category) => ({ category }))
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: raw } = await params
  if (!isShopCategorySlug(raw)) {
    return {}
  }
  const category = raw as ShopCategorySlug
  const sp = await searchParams
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q
  const hasSearch = Boolean(q?.trim())

  const label = SHOP_CATEGORY_LABELS[category]
  const path = `/shop/${category}`

  return {
    alternates: {
      canonical: canonicalUrl(path),
    },
    description: `Buy ${label} in Sri Lanka — genuine products, COD, islandwide delivery from Mixie Kadai, Jaffna.`,
    openGraph: {
      url: path,
    },
    robots: hasSearch ? { follow: true, index: false } : { follow: true, index: true },
    title: `${label} — Shop`,
  }
}

export default async function ShopCategoryPage({ params, searchParams }: Props) {
  const { category: raw } = await params
  if (!isShopCategorySlug(raw)) {
    notFound()
  }
  const sp = await searchParams
  return <ShopPageContent categorySlug={raw as ShopCategorySlug} searchParams={sp} />
}
