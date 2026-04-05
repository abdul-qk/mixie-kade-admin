import { ShopPageContent } from '@/components/storefront/ShopPageContent'
import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import React from 'react'

type SearchParams = { [key: string]: string | string[] | undefined }
type Props = { searchParams: Promise<SearchParams> }

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q
  const hasSearch = Boolean(q?.trim())

  return {
    alternates: {
      canonical: canonicalUrl('/shop'),
    },
    description: 'Browse mixer grinders, spare parts & kitchen accessories. Islandwide delivery in Sri Lanka.',
    openGraph: {
      url: '/shop',
    },
    robots: hasSearch ? { follow: true, index: false } : { follow: true, index: true },
    title: 'Shop',
  }
}

export default async function ShopPage({ searchParams }: Props) {
  const sp = await searchParams
  return <ShopPageContent categorySlug={null} searchParams={sp} />
}
