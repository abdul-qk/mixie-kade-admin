'use client'

import { X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'

type Category = { slug: string; title: string }

type BrandOption = { slug: string; title: string }

const filterLabelTextClass =
  'font-body text-[11px] font-semibold uppercase tracking-widest text-brand-navy/70'

const filterLabelRowClass = 'flex items-center justify-between gap-2 mb-2'

const clearIconBtnClass =
  'shrink-0 rounded-sm p-1 text-brand-navy/45 transition-colors hover:bg-brand-navy/8 hover:text-brand-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/25'

const controlClass =
  'w-full border border-brand-surface bg-white font-body text-sm text-brand-navy px-3 py-2.5 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition-colors'

const categoryButtonClass = (active: boolean) =>
  [
    'w-full text-left px-3 py-2 font-body text-sm border transition-colors duration-200 rounded-sm',
    active
      ? 'bg-brand-navy text-white border-brand-navy'
      : 'bg-white text-brand-navy border-brand-surface hover:border-brand-navy/40',
  ].join(' ')

function shopBasePath(activeCategorySlug: string | null): string {
  if (activeCategorySlug) {
    return `/shop/${activeCategorySlug}`
  }
  return '/shop'
}

export function ShopFilters({
  categories,
  activeCategorySlug,
  brands,
  wattages,
}: {
  categories: Category[]
  activeCategorySlug: string | null
  brands: BrandOption[]
  wattages: number[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeSearch = searchParams.get('q') ?? ''
  const activeWattage = searchParams.get('wattage') ?? ''
  const activeBrand = searchParams.get('brand') ?? ''
  const hasActiveFilters = useMemo(() => {
    const q = (searchParams.get('q') ?? '').trim()
    const cols = searchParams.get('cols')
    return (
      q.length > 0 ||
      Boolean(activeCategorySlug) ||
      Boolean(searchParams.get('wattage')) ||
      Boolean(searchParams.get('brand')) ||
      Boolean((searchParams.get('sort') ?? '').trim()) ||
      cols === '2' ||
      cols === '4'
    )
  }, [searchParams, activeCategorySlug])

  const clearAllFilters = () => {
    router.push('/shop')
  }

  const appendFilterParams = (params: URLSearchParams) => {
    const sort = searchParams.get('sort')
    const cols = searchParams.get('cols')
    const q = searchParams.get('q')
    const wattage = searchParams.get('wattage')
    const brand = searchParams.get('brand')
    if (sort) params.set('sort', sort)
    if (cols) params.set('cols', cols)
    if (q) params.set('q', q)
    if (wattage) params.set('wattage', wattage)
    if (brand) params.set('brand', brand)
  }

  const push = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === '') params.delete(key)
        else params.set(key, val)
      })
      const qs = params.toString()
      const base = shopBasePath(activeCategorySlug)
      router.push(base + (qs ? `?${qs}` : ''))
    },
    [searchParams, activeCategorySlug, router],
  )

  const goToCategory = (slug: string | null) => {
    const base = shopBasePath(slug)
    const params = new URLSearchParams()
    appendFilterParams(params)
    const qs = params.toString()
    router.push(base + (qs ? `?${qs}` : ''))
  }

  const clearCategoryOnly = () => {
    const params = new URLSearchParams()
    appendFilterParams(params)
    const qs = params.toString()
    router.push('/shop' + (qs ? `?${qs}` : ''))
  }

  return (
    <nav
      aria-label="Filter products"
      className="rounded-lg border border-brand-surface bg-white p-5 shadow-sm"
    >
      <p className="font-display text-base font-semibold text-brand-navy border-b border-brand-surface pb-4 mb-5">
        Filters
      </p>

      <div className="flex flex-col gap-7">
        <div>
          <div className={filterLabelRowClass}>
            <label className={filterLabelTextClass} htmlFor="shop-filter-search">
              Search
            </label>
            {activeSearch.trim() ? (
              <button
                aria-label="Clear search"
                className={clearIconBtnClass}
                onClick={() => push({ q: null })}
                type="button"
              >
                <X aria-hidden className="size-4" strokeWidth={2} />
              </button>
            ) : null}
          </div>
          <form
            className="flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const val = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim()
              const base = shopBasePath(activeCategorySlug)
              const params = new URLSearchParams()
              if (val) params.set('q', val)
              const sort = searchParams.get('sort')
              if (sort) params.set('sort', sort)
              const cols = searchParams.get('cols')
              if (cols) params.set('cols', cols)
              const wattage = searchParams.get('wattage')
              if (wattage) params.set('wattage', wattage)
              const brand = searchParams.get('brand')
              if (brand) params.set('brand', brand)
              const qs = params.toString()
              router.push(base + (qs ? `?${qs}` : ''))
            }}
          >
            <input
              className={controlClass}
              defaultValue={activeSearch}
              id="shop-filter-search"
              key={activeSearch || '_empty'}
              name="q"
              placeholder="Search products…"
            />
            <button
              className="w-full py-2.5 bg-brand-navy hover:bg-brand-gold text-white font-body text-sm font-medium transition-colors duration-200"
              type="submit"
            >
              Search
            </button>
          </form>
        </div>

        <div>
          <div className={filterLabelRowClass}>
            <span className={filterLabelTextClass} id="shop-filter-category-heading">
              Category
            </span>
            {activeCategorySlug ? (
              <button
                aria-label="Clear category — show all products"
                className={clearIconBtnClass}
                onClick={clearCategoryOnly}
                type="button"
              >
                <X aria-hidden className="size-4" strokeWidth={2} />
              </button>
            ) : null}
          </div>
          <div
            aria-labelledby="shop-filter-category-heading"
            className="flex flex-col gap-1.5"
            role="group"
          >
            <button
              aria-pressed={!activeCategorySlug}
              className={categoryButtonClass(!activeCategorySlug)}
              onClick={() => goToCategory(null)}
              type="button"
            >
              All products
            </button>
            {categories.map((cat) => (
              <button
                aria-pressed={activeCategorySlug === cat.slug}
                className={categoryButtonClass(activeCategorySlug === cat.slug)}
                key={cat.slug}
                onClick={() =>
                  goToCategory(activeCategorySlug === cat.slug ? null : cat.slug)
                }
                type="button"
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>

        {wattages.length > 0 && (
          <div>
            <div className={filterLabelRowClass}>
              <label className={filterLabelTextClass} htmlFor="shop-filter-wattage">
                Wattage
              </label>
              {activeWattage ? (
                <button
                  aria-label="Clear wattage filter"
                  className={clearIconBtnClass}
                  onClick={() => push({ wattage: null })}
                  type="button"
                >
                  <X aria-hidden className="size-4" strokeWidth={2} />
                </button>
              ) : null}
            </div>
            <select
              className={`${controlClass} cursor-pointer`}
              id="shop-filter-wattage"
              onChange={(e) => push({ wattage: e.target.value || null })}
              value={activeWattage}
            >
              <option value="">All wattages</option>
              {wattages.map((w) => (
                <option key={w} value={String(w)}>
                  {w}W
                </option>
              ))}
            </select>
          </div>
        )}

        {brands.length > 0 && (
          <div>
            <div className={filterLabelRowClass}>
              <label className={filterLabelTextClass} htmlFor="shop-filter-brand">
                Brand
              </label>
              {activeBrand ? (
                <button
                  aria-label="Clear brand filter"
                  className={clearIconBtnClass}
                  onClick={() => push({ brand: null })}
                  type="button"
                >
                  <X aria-hidden className="size-4" strokeWidth={2} />
                </button>
              ) : null}
            </div>
            <select
              className={`${controlClass} cursor-pointer`}
              id="shop-filter-brand"
              onChange={(e) => push({ brand: e.target.value || null })}
              value={activeBrand}
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {hasActiveFilters ? (
        <button
          className="mt-6 w-full border border-brand-surface bg-white py-2.5 font-body text-xs font-medium text-brand-navy transition-colors hover:border-brand-navy hover:bg-brand-cream"
          onClick={clearAllFilters}
          type="button"
        >
          Clear all filters
        </button>
      ) : null}
    </nav>
  )
}
