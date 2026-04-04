import type { Product } from '@/payload-types'
import { formatStorefrontMoney, resolveUnitPrice } from '@/lib/productPrice'

import Link from 'next/link'
import React from 'react'
import { Media } from '@/components/Media'
import { getServerSideURL } from '@/utilities/getURL'
import { getProductPrimarySlide } from '@/utilities/productImages'

type Props = {
  product: Partial<Product>
}

export const ProductGridItem: React.FC<Props> = ({ product }) => {
  const { title, slug, inStock } = product
  const hasNumericPrice =
    typeof product.price === 'number' || typeof product.priceInUSD === 'number'
  const displayPrice = resolveUnitPrice(product, null)

  const slide = getProductPrimarySlide(product as Product, null, getServerSideURL())

  const inStockBool = inStock !== false // treat undefined as in-stock

  return (
    <Link
      href={`/products/${slug}`}
      className="group flex flex-col bg-white border border-brand-surface hover:border-brand-gold hover:shadow-md transition-all duration-200"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-brand-surface">
        {slide?.url ? (
          <Media
            alt={slide.alt || title || ''}
            className="w-full h-full"
            fill
            imgClassName="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={slide.url}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-brand-surface">
            <svg
              width="40"
              height="40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1"
              className="text-brand-surface/70"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
          </div>
        )}

        {/* Out of stock overlay */}
        {!inStockBool && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="font-body text-xs font-semibold text-brand-muted bg-white border border-brand-surface px-3 py-1">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <p className="font-body text-sm font-medium text-brand-navy leading-snug line-clamp-2">
          {title}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2">
          {hasNumericPrice ? (
            <p className="font-body text-sm font-bold text-brand-navy tabular-nums">
              {formatStorefrontMoney(displayPrice, product)}
            </p>
          ) : (
            <p className="font-body text-xs text-brand-muted">Contact for price</p>
          )}

          <span className="font-body text-xs text-brand-gold font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            View →
          </span>
        </div>
      </div>
    </Link>
  )
}
