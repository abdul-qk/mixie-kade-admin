'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'

type Category = { slug: string; title: string }

type SortOption = { slug: string | null; title: string }

const sortOptions: SortOption[] = [
  { slug: null, title: 'A–Z' },
  { slug: '-createdAt', title: 'Latest' },
  { slug: 'priceInUSD', title: 'Price: Low → High' },
  { slug: '-priceInUSD', title: 'Price: High → Low' },
]

function shopBasePath(activeCategorySlug: string | null): string {
  if (activeCategorySlug) {
    return `/shop/${activeCategorySlug}`
  }
  return '/shop'
}

export function ShopFilters({
  categories,
  activeCategorySlug,
}: {
  categories: Category[]
  activeCategorySlug: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeSort = searchParams.get('sort') ?? ''
  const activeSearch = searchParams.get('q') ?? ''

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
    const sort = searchParams.get('sort')
    const q = searchParams.get('q')
    if (sort) params.set('sort', sort)
    if (q) params.set('q', q)
    const qs = params.toString()
    router.push(base + (qs ? `?${qs}` : ''))
  }

  return (
    <div className="bg-white border-b border-brand-surface sticky top-20 z-30">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4">
        <form
          className="flex gap-2 mb-4"
          onSubmit={(e) => {
            e.preventDefault()
            const val = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value.trim()
            const base = shopBasePath(activeCategorySlug)
            const params = new URLSearchParams()
            if (val) params.set('q', val)
            const sort = searchParams.get('sort')
            if (sort) params.set('sort', sort)
            const qs = params.toString()
            router.push(base + (qs ? `?${qs}` : ''))
          }}
        >
          <input
            className="flex-1 border border-brand-surface focus:border-brand-navy outline-none px-4 py-2.5 font-body text-sm text-brand-navy bg-white transition-colors"
            defaultValue={activeSearch}
            name="q"
            placeholder="Search products…"
          />
          <button
            className="px-5 py-2.5 bg-brand-navy hover:bg-brand-gold text-white font-body text-sm font-medium transition-colors duration-200"
            type="submit"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              aria-pressed={!activeCategorySlug}
              className={[
                'px-4 py-1.5 font-body text-xs font-medium border transition-colors duration-200',
                !activeCategorySlug
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white text-brand-navy border-brand-surface hover:border-brand-navy',
              ].join(' ')}
              onClick={() => goToCategory(null)}
              type="button"
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                aria-pressed={activeCategorySlug === cat.slug}
                className={[
                  'px-4 py-1.5 font-body text-xs font-medium border transition-colors duration-200',
                  activeCategorySlug === cat.slug
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-white text-brand-navy border-brand-surface hover:border-brand-navy',
                ].join(' ')}
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

          <select
            aria-label="Sort products"
            className="border border-brand-surface bg-white font-body text-xs text-brand-navy px-3 py-1.5 outline-none focus:border-brand-navy transition-colors cursor-pointer"
            onChange={(e) => push({ sort: e.target.value || null })}
            value={activeSort}
          >
            {sortOptions.map((opt) => (
              <option key={opt.slug ?? 'default'} value={opt.slug ?? ''}>
                {opt.title}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
