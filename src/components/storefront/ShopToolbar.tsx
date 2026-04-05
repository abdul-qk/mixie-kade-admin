'use client'

import { X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback } from 'react'

import type { ShopCategorySlug } from '@/constants/shopCategories'

type SortOption = { slug: string | null; title: string }

const sortOptions: SortOption[] = [
  { slug: null, title: 'A–Z' },
  { slug: '-createdAt', title: 'Latest' },
  { slug: 'priceInUSD', title: 'Price: Low → High' },
  { slug: '-priceInUSD', title: 'Price: High → Low' },
]

const COL_OPTIONS = [2, 3, 4] as const

const labelTextClass =
  'font-body text-[11px] font-semibold uppercase tracking-widest text-brand-navy/70'

const labelRowClass =
  'mb-1.5 flex items-center justify-between gap-2 text-left sm:justify-end sm:text-right'

const clearIconBtnClass =
  'shrink-0 rounded-sm p-1 text-brand-navy/45 transition-colors hover:bg-brand-navy/8 hover:text-brand-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/25'

const selectClass =
  'w-full min-w-0 border border-brand-surface bg-white font-body text-sm text-brand-navy px-3 py-2 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition-colors cursor-pointer sm:min-w-[11rem]'

const colsSelectClass =
  'w-full border border-brand-surface bg-white font-body text-sm text-brand-navy px-3 py-2 outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy/20 transition-colors cursor-pointer sm:w-auto sm:min-w-[4.5rem]'

function shopBasePath(activeCategorySlug: ShopCategorySlug | null): string {
  if (activeCategorySlug) {
    return `/shop/${activeCategorySlug}`
  }
  return '/shop'
}

export function ShopToolbar({ activeCategorySlug }: { activeCategorySlug: ShopCategorySlug | null }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeSort = searchParams.get('sort') ?? ''
  const activeColsParam = searchParams.get('cols')
  const activeCols = activeColsParam === '2' || activeColsParam === '4' ? activeColsParam : '3'
  const sortIsNonDefault = activeSort.trim().length > 0
  const colsIsNonDefault = activeCols === '2' || activeCols === '4'

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

  const onSortChange = (value: string) => {
    push({ sort: value || null })
  }

  const onColsChange = (value: string) => {
    if (value === '3') {
      push({ cols: null })
      return
    }
    push({ cols: value })
  }

  return (
    <div className="mb-6 flex flex-wrap justify-end gap-6 sm:gap-8">
      <div className="w-full sm:w-auto">
        <div className={labelRowClass}>
          <label className={labelTextClass} htmlFor="shop-toolbar-sort">
            Sort by
          </label>
          {sortIsNonDefault ? (
            <button
              aria-label="Reset sort to A–Z"
              className={clearIconBtnClass}
              onClick={() => push({ sort: null })}
              type="button"
            >
              <X aria-hidden className="size-4" strokeWidth={2} />
            </button>
          ) : null}
        </div>
        <select
          className={selectClass}
          id="shop-toolbar-sort"
          onChange={(e) => onSortChange(e.target.value)}
          value={activeSort}
        >
          {sortOptions.map((opt) => (
            <option key={opt.slug ?? 'default'} value={opt.slug ?? ''}>
              {opt.title}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full sm:w-auto">
        <div className={labelRowClass}>
          <label className={labelTextClass} htmlFor="shop-toolbar-cols">
            Per row
          </label>
          {colsIsNonDefault ? (
            <button
              aria-label="Reset columns to 3 per row"
              className={clearIconBtnClass}
              onClick={() => push({ cols: null })}
              type="button"
            >
              <X aria-hidden className="size-4" strokeWidth={2} />
            </button>
          ) : null}
        </div>
        <select
          className={colsSelectClass}
          id="shop-toolbar-cols"
          onChange={(e) => onColsChange(e.target.value)}
          value={activeCols}
        >
          {COL_OPTIONS.map((n) => (
            <option key={n} value={String(n)}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
