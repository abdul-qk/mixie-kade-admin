import configPromise from '@payload-config'
import { getSortableListPrice } from '@/lib/productPrice'
import { getPayload } from 'payload'
import type { Where } from 'payload'
import React, { Suspense } from 'react'
import Link from 'next/link'
import { ShopFilters } from '@/components/storefront/ShopFilters'
import { ShopToolbar } from '@/components/storefront/ShopToolbar'
import { ProductGridItem } from '@/components/ProductGridItem'
import { Grid } from '@/components/Grid'
import {
  SHOP_CATEGORY_LABELS,
  type ShopCategorySlug,
} from '@/constants/shopCategories'
import type { Product } from '@/payload-types'

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  categorySlug: ShopCategorySlug | null
  searchParams: SearchParams
}

const SHOP_SORT_MODES = ['', '-createdAt', 'priceInUSD', '-priceInUSD'] as const
type ShopSortMode = (typeof SHOP_SORT_MODES)[number]

function normalizeShopSort(raw: string): ShopSortMode {
  const v = (raw ?? '').trim()
  return (SHOP_SORT_MODES as readonly string[]).includes(v) ? (v as ShopSortMode) : ''
}

/** Payload `sort` for modes that sort correctly in the database. */
function payloadSortForMode(mode: ShopSortMode): string {
  switch (mode) {
    case '-createdAt':
      return '-createdAt'
    case 'priceInUSD':
    case '-priceInUSD':
      return 'title'
    default:
      return 'title'
  }
}

function sortDocsByListPrice(docs: Product[], direction: 'asc' | 'desc'): Product[] {
  return [...docs].sort((a, b) => {
    const av = getSortableListPrice(a)
    const bv = getSortableListPrice(b)
    if (av === null && bv === null) return 0
    if (av === null) return 1
    if (bv === null) return -1
    const cmp = av - bv
    return direction === 'asc' ? cmp : -cmp
  })
}

function searchWhereClause(q: string): Where {
  return {
    or: [{ title: { contains: q } }, { slug: { contains: q } }],
  }
}

const SHOP_COL_OPTIONS = [2, 3, 4] as const
type ShopColCount = (typeof SHOP_COL_OPTIONS)[number]

function normalizeShopCols(raw: string): ShopColCount {
  const t = raw.trim()
  if (t === '2' || t === '3' || t === '4') return Number(t) as ShopColCount
  return 3
}

const SHOP_GRID_BY_COLS: Record<ShopColCount, string> = {
  2: 'grid-cols-2 gap-5 lg:grid-cols-2',
  3: 'grid-cols-2 gap-5 lg:grid-cols-3',
  4: 'grid-cols-2 gap-5 lg:grid-cols-4',
}

export async function ShopPageContent({ categorySlug, searchParams }: Props) {
  const { q: rawQ, sort: rawSort, wattage: rawWattage, brand: rawBrand, cols: rawCols } =
    searchParams

  const searchValue = Array.isArray(rawQ) ? rawQ[0] : (rawQ ?? '')
  const sortMode = normalizeShopSort(Array.isArray(rawSort) ? (rawSort[0] ?? '') : (rawSort ?? ''))
  const wattageParam = Array.isArray(rawWattage) ? rawWattage[0] : (rawWattage ?? '')
  const brandSlugParam = Array.isArray(rawBrand) ? rawBrand[0] : (rawBrand ?? '')
  const colsParam = Array.isArray(rawCols) ? rawCols[0] : (rawCols ?? '')
  const shopCols = normalizeShopCols(typeof colsParam === 'string' ? colsParam : '')

  const payload = await getPayload({ config: configPromise })

  const andConditions: Where[] = [{ _status: { equals: 'published' } }]
  const qTrimmed = searchValue.trim()
  if (qTrimmed) {
    andConditions.push(searchWhereClause(qTrimmed))
  }
  if (categorySlug) {
    andConditions.push({ category: { equals: categorySlug } })
  }

  const wattageNum =
    wattageParam !== '' && Number.isFinite(Number(wattageParam)) ? Number(wattageParam) : null
  if (wattageNum !== null) {
    andConditions.push({ wattage: { equals: wattageNum } })
  }

  if (brandSlugParam) {
    const brandMatch = await payload.find({
      collection: 'brands',
      limit: 1,
      overrideAccess: false,
      where: { slug: { equals: brandSlugParam } },
    })
    const brandId = brandMatch.docs[0]?.id
    if (brandId) {
      andConditions.push({ brand: { equals: brandId } })
    } else {
      andConditions.push({ id: { in: [] } })
    }
  }

  const scopeForFacets: Where[] = [{ _status: { equals: 'published' } }]
  if (qTrimmed) {
    scopeForFacets.push(searchWhereClause(qTrimmed))
  }
  if (categorySlug) {
    scopeForFacets.push({ category: { equals: categorySlug } })
  }

  const [facetProducts, allBrands] = await Promise.all([
    payload.find({
      collection: 'products',
      draft: false,
      limit: 500,
      overrideAccess: false,
      pagination: false,
      select: { wattage: true, brand: true },
      where: { and: scopeForFacets },
    }),
    payload.find({
      collection: 'brands',
      limit: 200,
      overrideAccess: false,
      pagination: false,
      sort: 'title',
    }),
  ])

  const wattageOptions = Array.from(
    new Set(
      facetProducts.docs
        .map((d) => d.wattage)
        .filter((w): w is number => typeof w === 'number' && Number.isFinite(w)),
    ),
  ).sort((a, b) => a - b)

  const brandIdsInScope = new Set(
    facetProducts.docs
      .map((d) => {
        const b = d.brand
        if (b == null) return null
        return typeof b === 'object' ? b.id : b
      })
      .filter((id): id is number => typeof id === 'number'),
  )
  const filterBrands = allBrands.docs
    .filter((b) => brandIdsInScope.has(b.id))
    .map((b) => ({ slug: b.slug, title: b.title }))

  const products = await payload.find({
    collection: 'products',
    draft: false,
    overrideAccess: false,
    pagination: false,
    select: {
      title: true,
      slug: true,
      gallery: true,
      images: true,
      categories: true,
      priceInUSD: true,
      price: true,
      inStock: true,
    },
    sort: payloadSortForMode(sortMode),
    where: { and: andConditions },
  })

  let docs = products.docs as Product[]
  if (sortMode === 'priceInUSD') {
    docs = sortDocsByListPrice(docs, 'asc')
  } else if (sortMode === '-priceInUSD') {
    docs = sortDocsByListPrice(docs, 'desc')
  }

  const resultsText = docs.length === 1 ? 'result' : 'results'

  const heroLabel = categorySlug ? SHOP_CATEGORY_LABELS[categorySlug] : 'All Products'
  const heroTitle = searchValue ? `Search: "${searchValue}"` : categorySlug ? heroLabel : 'Shop'

  const filterCategories = (
    Object.entries(SHOP_CATEGORY_LABELS) as [ShopCategorySlug, string][]
  ).map(([slug, title]) => ({ slug, title }))

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="relative overflow-hidden py-16 px-6 text-white md:py-20">
        <div
          aria-hidden
          className="absolute inset-0 bg-[url('/shop/shop-10.jpeg')] bg-cover bg-center"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-brand-navy/88 via-brand-navy/78 to-brand-navy/92"
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="mb-3 font-body text-xs font-semibold uppercase tracking-widest text-brand-gold">
            {heroLabel}
          </p>
          <h1 className="mb-2 font-display text-4xl font-semibold drop-shadow-sm md:text-5xl">
            {heroTitle}
          </h1>
          <p className="font-body text-sm text-white/85">
            {docs.length} {resultsText}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-10">
          <aside className="w-full lg:w-64 xl:w-72 shrink-0 lg:sticky lg:top-24 lg:z-20">
            <Suspense fallback={<div className="h-48 rounded-lg border border-brand-surface bg-white animate-pulse" />}>
              <ShopFilters
                activeCategorySlug={categorySlug}
                brands={filterBrands}
                categories={filterCategories}
                wattages={wattageOptions}
              />
            </Suspense>
          </aside>

          <div className="min-w-0 flex-1">
            <Suspense fallback={null}>
              <ShopToolbar activeCategorySlug={categorySlug} />
            </Suspense>
            {docs.length === 0 ? (
              <div className="text-center py-16 lg:py-24 rounded-lg border border-dashed border-brand-surface bg-white/50 px-4">
                <p className="font-display text-2xl text-brand-navy mb-3">No products found</p>
                <p className="font-body text-sm text-brand-muted mb-6 max-w-md mx-auto">
                  Try adjusting filters in the sidebar, or clear them to see everything in this
                  category.
                </p>
                <Link
                  className="inline-block font-body text-sm text-brand-navy border border-brand-navy px-6 py-2.5 hover:bg-brand-navy hover:text-white transition-colors duration-200"
                  href={categorySlug ? `/shop/${categorySlug}` : '/shop'}
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <Grid className={SHOP_GRID_BY_COLS[shopCols]}>
                {docs.map((product) => (
                  <ProductGridItem key={product.id} product={product} />
                ))}
              </Grid>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
