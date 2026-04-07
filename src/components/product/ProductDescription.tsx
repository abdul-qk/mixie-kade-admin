'use client'
import type { Product } from '@/payload-types'

import { RichText } from '@/components/RichText'
import { ProductCartActions } from '@/components/Cart/ProductCartActions'
import React, { Suspense } from 'react'

import { VariantSelector } from './VariantSelector'
import { StockIndicator } from '@/components/product/StockIndicator'
import { BadgeCheck, Banknote, Check, RotateCcw, Truck } from 'lucide-react'

const productUSPs = [
  {
    title: '2-3 Day Delivery',
    subtitle: 'Islandwide tracked shipping',
    icon: Truck,
  },
  {
    title: 'Genuine Warranty',
    subtitle: 'Manufacturer guarantee',
    icon: BadgeCheck,
  },
  {
    title: 'Cash on Delivery',
    subtitle: 'Pay when it arrives',
    icon: Banknote,
  },
  {
    title: 'Easy Returns',
    subtitle: '7-day return policy',
    icon: RotateCcw,
  },
]

export function ProductDescription({ product }: { product: Product }) {
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)
  const features = product.features?.filter((item) => Boolean(item?.feature)) ?? []

  return (
    <div className="flex flex-col gap-5">
      {product.description ? (
        <RichText
          className="text-black/70 [&_p]:text-black/70 [&_li]:text-black/70 [&_p]:leading-relaxed"
          data={product.description}
          enableGutter={false}
        />
      ) : null}
      {features.length > 0 ? (
        <ul className="space-y-2 m-0 p-0 list-none">
          {features.map((item) => (
            <li key={item.id ?? item.feature} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-brand-gold mt-[2px] shrink-0" strokeWidth={2.5} aria-hidden />
              <span className="font-body text-[15px] md:text-base text-brand-navy/85 leading-snug">
                {item.feature}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-brand-surface pt-5">
        {productUSPs.map((item) => {
          const Icon = item.icon

          return (
            <div key={item.title} className="flex items-start gap-3">
              <Icon className="w-5 h-5 text-brand-gold mt-0.5" />
              <div>
                <p className="font-body text-sm font-semibold text-brand-navy leading-tight">
                  {item.title}
                </p>
                <p className="font-body text-xs text-brand-muted leading-tight mt-0.5">
                  {item.subtitle}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      <hr />
      {hasVariants && (
        <>
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>
        </>
      )}
      <div className="flex items-center justify-between">
        <Suspense fallback={null}>
          <StockIndicator product={product} />
        </Suspense>
      </div>

      <div className="flex items-stretch justify-between">
        <Suspense fallback={null}>
          <ProductCartActions product={product} />
        </Suspense>
      </div>
    </div>
  )
}
