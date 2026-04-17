import configPromise from '@payload-config'
import { ShopPageContent } from '@/components/storefront/ShopPageContent'
import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React from 'react'

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  params: Promise<{ category: string }>
  searchParams: Promise<SearchParams>
}

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'categories',
    limit: 500,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return docs
    .filter((c): c is typeof c & { slug: string } => typeof c.slug === 'string' && c.slug.length > 0)
    .map((c) => ({ category: c.slug }))
}

async function getCategoryBySlug(slug: string) {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'categories',
    limit: 1,
    overrideAccess: false,
    where: { slug: { equals: slug } },
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: raw } = await params
  const categoryDoc = await getCategoryBySlug(raw)
  if (!categoryDoc?.slug) {
    return {}
  }
  const sp = await searchParams
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q
  const hasSearch = Boolean(q?.trim())

  const path = `/shop/${categoryDoc.slug}`

  return {
    alternates: {
      canonical: canonicalUrl(path),
    },
    description: `Buy ${categoryDoc.title} in Sri Lanka — genuine products, COD, islandwide delivery from Mixie Kadai, Jaffna.`,
    openGraph: {
      url: path,
    },
    robots: hasSearch ? { follow: true, index: false } : { follow: true, index: true },
    title: `${categoryDoc.title} — Shop`,
  }
}

export default async function ShopCategoryPage({ params, searchParams }: Props) {
  const { category: raw } = await params
  const categoryDoc = await getCategoryBySlug(raw)
  if (!categoryDoc?.slug) {
    notFound()
  }
  const sp = await searchParams
  return <ShopPageContent categorySlug={categoryDoc.slug} searchParams={sp} />
}
