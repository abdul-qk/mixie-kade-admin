'use client'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

import { DeleteItemButton } from './DeleteItemButton'
import { EditItemQuantityButton } from './EditItemQuantityButton'
import { OpenCartButton } from './OpenCart'
import { Button } from '@/components/ui/button'
import type { Product, Variant } from '@/payload-types'
import {
  computeCartOrderTotals,
  formatStorefrontMoney,
  resolveUnitPrice,
} from '@/lib/productPrice'

function formatCartTotal(grand: number, sampleProduct: Partial<Product> | undefined): string {
  if (sampleProduct && typeof (sampleProduct as Product).price === 'number') {
    return `Rs. ${grand.toLocaleString()}`
  }
  return `$${grand.toFixed(2)}`
}

export function CartModal() {
  const { cart } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const totalQuantity = useMemo(() => {
    if (!cart || !cart.items || !cart.items.length) return undefined
    return cart.items.reduce((quantity, item) => (item.quantity || 0) + quantity, 0)
  }, [cart])

  const orderTotals = useMemo(() => {
    if (!cart?.items?.length) return null
    return computeCartOrderTotals(cart.items)
  }, [cart?.items])

  const sampleProductForTotal = useMemo(() => {
    const first = cart?.items?.find((i) => i.product && typeof i.product === 'object')?.product
    return typeof first === 'object' ? first : undefined
  }, [cart?.items])

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger asChild>
        <OpenCartButton quantity={totalQuantity} />
      </SheetTrigger>

      <SheetContent className="flex flex-col border-brand-surface">
        <SheetHeader>
          <SheetTitle className="text-brand-navy">My Cart</SheetTitle>

          <SheetDescription className="text-brand-muted">
            Review items and proceed to checkout. Shipping is included in the estimated total when
            applicable.
          </SheetDescription>
        </SheetHeader>

        {!cart || cart?.items?.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-2">
            <ShoppingCart className="h-16 text-brand-navy/40" aria-hidden />
            <p className="text-center text-2xl font-bold text-brand-navy">Your cart is empty.</p>
          </div>
        ) : (
          <div className="grow flex px-4">
            <div className="flex flex-col justify-between w-full">
              <ul className="grow overflow-auto py-4">
                {cart?.items?.map((item, i) => {
                  const product = item.product
                  const variant = item.variant

                  if (typeof product !== 'object' || !item || !product || !product.slug)
                    return <React.Fragment key={i} />

                  const metaImage =
                    product.meta?.image && typeof product.meta?.image === 'object'
                      ? product.meta.image
                      : undefined

                  const firstGalleryImage =
                    typeof product.gallery?.[0]?.image === 'object'
                      ? product.gallery?.[0]?.image
                      : undefined

                  let image = firstGalleryImage || metaImage
                  const unitPrice = resolveUnitPrice(product, variant && typeof variant === 'object' ? variant : null)

                  const isVariant = Boolean(variant) && typeof variant === 'object'

                  if (isVariant && variant && typeof variant === 'object') {
                    const v = variant as Variant
                    const imageVariant = product.gallery?.find(
                      (galleryItem: NonNullable<Product['gallery']>[number]) => {
                        if (!galleryItem.variantOption) return false
                        const variantOptionID =
                          typeof galleryItem.variantOption === 'object' &&
                          galleryItem.variantOption !== null &&
                          'id' in galleryItem.variantOption
                            ? (galleryItem.variantOption as { id: number }).id
                            : (galleryItem.variantOption as number)

                        const hasMatch = v.options?.some((option) => {
                          if (typeof option === 'object' && option !== null && 'id' in option) {
                            return option.id === variantOptionID
                          }
                          return option === variantOptionID
                        })

                        return hasMatch
                      },
                    )

                    if (imageVariant && typeof imageVariant.image === 'object') {
                      image = imageVariant.image
                    }
                  }

                  const qty = item.quantity ?? 1
                  const lineTotal = unitPrice * qty

                  return (
                    <li className="flex w-full flex-col border-b border-brand-surface/80 last:border-0" key={i}>
                      <div className="relative flex w-full flex-row justify-between px-1 py-4">
                        <div className="absolute z-40 -mt-2 ml-[55px]">
                          <DeleteItemButton item={item} />
                        </div>
                        <Link
                          className="z-30 flex flex-row space-x-4 min-w-0"
                          href={`/products/${(item.product as Product)?.slug}`}
                        >
                          <div className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-md border border-brand-surface bg-brand-surface/30">
                            {image?.url && (
                              <Image
                                alt={image?.alt || product?.title || ''}
                                className="h-full w-full object-cover"
                                height={94}
                                src={image.url}
                                width={94}
                              />
                            )}
                          </div>

                          <div className="flex flex-1 flex-col text-base min-w-0">
                            <span className="leading-tight text-brand-navy font-medium">{product?.title}</span>
                            {isVariant && variant && typeof variant === 'object' ? (
                              <p className="text-sm text-brand-muted capitalize truncate">
                                {(variant as Variant).options
                                  ?.map((option) => {
                                    if (typeof option === 'object' && option !== null) return option.label
                                    return null
                                  })
                                  .filter(Boolean)
                                  .join(', ')}
                              </p>
                            ) : null}
                          </div>
                        </Link>
                        <div className="flex h-16 flex-col justify-between items-end shrink-0">
                          <span className="text-right text-sm font-semibold text-brand-navy tabular-nums">
                            {formatStorefrontMoney(lineTotal, product)}
                          </span>
                          <div className="ml-auto flex h-9 flex-row items-center rounded-lg border border-brand-surface">
                            <EditItemQuantityButton item={item} type="minus" />
                            <p className="w-8 text-center">
                              <span className="w-full text-sm text-brand-navy">{item.quantity}</span>
                            </p>
                            <EditItemQuantityButton item={item} type="plus" />
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <div className="px-4 pb-2">
                <div className="py-4 text-sm text-brand-muted space-y-2">
                  {orderTotals && (
                    <>
                      <div className="flex items-center justify-between border-b border-brand-surface pb-2">
                        <span className="text-brand-navy">Items subtotal</span>
                        <span className="text-right text-brand-navy font-medium tabular-nums">
                          {formatCartTotal(orderTotals.itemSubtotal, sampleProductForTotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-brand-surface pb-2">
                        <span className="text-brand-navy">Shipping (est.)</span>
                        <span className="text-right text-brand-navy font-medium tabular-nums">
                          {formatCartTotal(orderTotals.shippingTotal, sampleProductForTotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-brand-navy font-semibold">Estimated total</span>
                        <span className="text-right text-base font-bold text-brand-navy tabular-nums">
                          {formatCartTotal(orderTotals.grandTotal, sampleProductForTotal)}
                        </span>
                      </div>
                    </>
                  )}

                  <Button asChild className="w-full mt-2">
                    <Link className="w-full" href="/checkout">
                      Proceed to Checkout
                    </Link>
                  </Button>

                  <Link
                    className="block w-full text-center font-body text-sm text-brand-navy underline underline-offset-4 hover:text-brand-gold transition-colors py-2"
                    href="/cart"
                  >
                    View full cart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
