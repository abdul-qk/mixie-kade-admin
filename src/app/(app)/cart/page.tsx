'use client'

import type { CartItem } from '@/components/Cart'
import { DeleteItemButton } from '@/components/Cart/DeleteItemButton'
import { EditItemQuantityButton } from '@/components/Cart/EditItemQuantityButton'
import type { Product, Variant } from '@/payload-types'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import {
  computeCartOrderTotals,
  formatStorefrontMoney,
  resolveCompareAtPrice,
  resolveUnitPrice,
} from '@/lib/productPrice'
import { Media } from '@/components/Media'
import { getProductPrimarySlide } from '@/utilities/productImages'
import Link from 'next/link'

function resolveItemDisplay(item: CartItem) {
  const product = item.product
  const variant = item.variant

  if (!product || typeof product !== 'object' || !product.slug) return null

  const price = resolveUnitPrice(product, variant && typeof variant === 'object' ? variant : null)

  const isVariant = Boolean(variant) && typeof variant === 'object'

  const slide = getProductPrimarySlide(
    product as Product,
    isVariant && variant && typeof variant === 'object' ? variant : null,
  )

  return {
    product: product as Product,
    slide,
    isVariant,
    variant,
    price: typeof price === 'number' ? price : 0,
  }
}

export default function CartPage() {
  const { cart } = useCart()
  const items = cart?.items ?? []

  const orderTotals = computeCartOrderTotals(items)

  const sampleProduct = items.find((i) => i.product && typeof i.product === 'object')?.product as
    | Product
    | undefined

  const formatTotal = (n: number) => {
    if (sampleProduct && typeof sampleProduct.price === 'number') {
      return `Rs. ${n.toLocaleString()}`
    }
    return `$${n.toFixed(2)}`
  }

  if (!items.length) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 py-16 text-center">
          <h1 className="font-display text-4xl font-semibold text-brand-navy mb-4">Your Cart</h1>
          <p className="font-body text-brand-muted mb-8">Your cart is currently empty.</p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-brand-navy hover:bg-brand-gold text-white font-body font-semibold text-sm px-6 py-3 transition-colors duration-200"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
        <h1 className="font-display text-4xl font-semibold text-brand-navy mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <section className="lg:col-span-3 bg-white border border-brand-surface">
            <ul className="divide-y divide-brand-surface">
              {items.map((item, i) => {
                const display = resolveItemDisplay(item)
                if (!display) return null

                const { product, slide, isVariant, variant, price } = display
                const quantity = item.quantity ?? 1
                const compareAtPrice = resolveCompareAtPrice(
                  product,
                  isVariant && variant && typeof variant === 'object' ? variant : null,
                )
                const lineTotal = price * quantity
                const compareLineTotal =
                  typeof compareAtPrice === 'number' ? compareAtPrice * quantity : null
                const hasCompare =
                  typeof compareLineTotal === 'number' && compareLineTotal > lineTotal

                return (
                  <li key={item.id ?? i} className="relative p-4 sm:p-5">
                    <div className="absolute right-5 top-4">
                      <DeleteItemButton item={item} />
                    </div>

                    <div className="flex gap-4 pr-6">
                      <Link href={`/products/${product.slug}`} className="shrink-0">
                        <div className="relative h-20 w-20 overflow-hidden bg-brand-surface/20 border border-brand-surface">
                          {slide?.url ? (
                            <Media
                              alt={slide.alt || product.title || 'Product image'}
                              className="h-full w-full"
                              fill
                              imgClassName="object-cover"
                              src={slide.url}
                            />
                          ) : null}
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${product.slug}`}
                          className="font-body text-brand-navy font-semibold hover:text-brand-gold transition-colors duration-200"
                        >
                          {product.title}
                        </Link>

                        {isVariant && variant && typeof variant === 'object' ? (
                          <p className="font-body text-sm text-brand-muted mt-1 capitalize">
                            {(variant as Variant).options
                              ?.map((option) => (typeof option === 'object' ? option.label : ''))
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        ) : null}

                        <div className="mt-3 flex flex-wrap items-center gap-4">
                          <div className="inline-flex items-center border border-brand-surface">
                            <EditItemQuantityButton item={item} type="minus" />
                            <span className="w-10 text-center font-body text-sm text-brand-navy">
                              {quantity}
                            </span>
                            <EditItemQuantityButton item={item} type="plus" />
                          </div>

                          <div className="text-right">
                            <span className="font-body text-sm font-semibold text-brand-navy tabular-nums">
                              {formatStorefrontMoney(lineTotal, product)}
                            </span>
                            {hasCompare ? (
                              <p className="font-body text-xs text-brand-muted line-through tabular-nums">
                                {formatStorefrontMoney(compareLineTotal, product)}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>

          <aside className="lg:col-span-2">
            <div className="bg-white border border-brand-surface p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold text-brand-navy mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 font-body text-sm text-brand-navy">
                <div className="flex justify-between gap-2">
                  <span>Items subtotal</span>
                  <span className="font-semibold tabular-nums">{formatTotal(orderTotals.itemSubtotal)}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span>Shipping (est.)</span>
                  <span className="font-semibold tabular-nums">{formatTotal(orderTotals.shippingTotal)}</span>
                </div>
                <p className="text-xs text-brand-muted leading-snug">
                  Final shipping matches checkout. Total includes per-item delivery fees where set on
                  products.
                </p>
              </div>

              <div className="flex justify-between border-t border-b border-brand-surface py-4 mb-5">
                <span className="font-body text-brand-navy font-semibold">Estimated total</span>
                <span className="font-body text-brand-navy font-bold text-xl tabular-nums">
                  {formatTotal(orderTotals.grandTotal)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full inline-flex items-center justify-center bg-brand-navy hover:bg-brand-gold text-white font-body font-semibold text-sm py-3 transition-colors duration-200"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/shop"
                className="w-full inline-flex items-center justify-center mt-3 border border-brand-surface text-brand-navy hover:text-brand-gold font-body font-medium text-sm py-3 transition-colors duration-200"
              >
                Continue Shopping
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
