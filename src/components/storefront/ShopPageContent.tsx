import configPromise from '@payload-config'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import React, { Suspense } from 'react'
import Link from 'next/link'
import { ShopFilters } from '@/components/storefront/ShopFilters'
import { ProductGridItem } from '@/components/ProductGridItem'
import { Grid } from '@/components/Grid'
import {
  SHOP_CATEGORY_LABELS,
  type ShopCategorySlug,
} from '@/constants/shopCategories'

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  categorySlug: ShopCategorySlug | null
  searchParams: SearchParams
}

export async function ShopPageContent({ categorySlug, searchParams }: Props) {
  const { q: rawQ, sort: rawSort } = searchParams

  const searchValue = Array.isArray(rawQ) ? rawQ[0] : (rawQ ?? '')
  const sort = Array.isArray(rawSort) ? rawSort[0] : (rawSort ?? '')

  const payload = await getPayload({ config: configPromise })

  const andConditions: Where[] = [{ _status: { equals: 'published' } }]
  if (searchValue) {
    andConditions.push({
      or: [
        { title: { like: searchValue } },
        { description: { like: searchValue } },
      ],
    })
  }
  if (categorySlug) {
    andConditions.push({ category: { equals: categorySlug } })
  }

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    select: {
      title: true,
      slug: true,
      gallery: true,
      categories: true,
      priceInUSD: true,
      price: true,
      inStock: true,
    },
    sort: sort || 'title',
    where: { and: andConditions },
  })

  const resultsText = products.docs.length === 1 ? 'result' : 'results'

  const heroLabel = categorySlug ? SHOP_CATEGORY_LABELS[categorySlug] : 'All Products'
  const heroTitle = searchValue ? `Search: "${searchValue}"` : categorySlug ? heroLabel : 'Shop'

  const filterCategories = (
    Object.entries(SHOP_CATEGORY_LABELS) as [ShopCategorySlug, string][]
  ).map(([slug, title]) => ({ slug, title }))

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-navy text-white py-14 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-brand-gold text-xs font-semibold tracking-widest uppercase mb-3">
            {heroLabel}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-2">{heroTitle}</h1>
          <p className="font-body text-white/60 text-sm">
            {products.docs.length} {resultsText}
          </p>
        </div>
      </div>

      <Suspense fallback={null}>
        <ShopFilters activeCategorySlug={categorySlug} categories={filterCategories} />
      </Suspense>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        {products.docs.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-2xl text-brand-navy mb-3">No products found</p>
            <p className="font-body text-sm text-brand-muted mb-6">
              Try a different search or category filter.
            </p>
            <Link
              className="inline-block font-body text-sm text-brand-navy border border-brand-navy px-6 py-2.5 hover:bg-brand-navy hover:text-white transition-colors duration-200"
              href={categorySlug ? `/shop/${categorySlug}` : '/shop'}
            >
              Clear filters
            </Link>
          </div>
        ) : (
          <Grid className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products.docs.map((product) => (
              <ProductGridItem key={product.id} product={product} />
            ))}
          </Grid>
        )}
      </div>
    </div>
  )
}
