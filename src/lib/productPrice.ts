import type { Cart, Product, Variant } from '@/payload-types'

/** Cart line item shape from Payload (avoids circular import via `@/components/Cart`). */
export type CartLineItem = NonNullable<NonNullable<Cart['items']>[number]>

/**
 * Resolves the storefront unit price for a line item.
 * Prefer LKR `price` when present on product/variant, then fall back to `priceInUSD`.
 */
/** List price for shop sorting (LKR `price` first, then `priceInUSD`). Null = no fixed price. */
export function getSortableListPrice(product: Partial<Product>): number | null {
  const p = product as Product & { price?: number | null }
  if (typeof p.price === 'number') return p.price
  if (typeof p.priceInUSD === 'number') return p.priceInUSD
  return null
}

export function resolveUnitPrice(
  product: Partial<Product>,
  variant?: Partial<Variant> | null,
): number {
  const isVariant = Boolean(variant && typeof variant === 'object')
  if (isVariant && variant) {
    const v = variant as Variant & { price?: number | null }
    const fromVariant =
      typeof v.price === 'number' ? v.price : typeof v.priceInUSD === 'number' ? v.priceInUSD : undefined
    if (typeof fromVariant === 'number') return fromVariant
  }

  const p = product as Product & { price?: number | null }
  if (typeof p.price === 'number') return p.price
  if (typeof p.priceInUSD === 'number') return p.priceInUSD
  return 0
}

/** Compare-at/original price for sale display. Variant value takes precedence when present. */
export function resolveCompareAtPrice(
  product: Partial<Product>,
  variant?: Partial<Variant> | null,
): number | null {
  const isVariant = Boolean(variant && typeof variant === 'object')
  if (isVariant && variant) {
    const v = variant as Variant & { originalPrice?: number | null }
    if (typeof v.originalPrice === 'number') return v.originalPrice
  }

  const p = product as Product & { originalPrice?: number | null }
  if (typeof p.originalPrice === 'number') return p.originalPrice
  return null
}

export function resolveShippingPerUnit(product: Partial<Product>): number {
  const s = (product as Product).shippingCost
  return typeof s === 'number' ? s : 0
}

/** Format a single amount using the same rules as the product grid (LKR vs USD). */
export function formatStorefrontMoney(amount: number, product: Partial<Product>): string {
  if (typeof (product as Product).price === 'number') {
    return `Rs. ${amount.toLocaleString()}`
  }
  return `$${amount.toFixed(2)}`
}

export function computeCartOrderTotals(items: CartLineItem[]): {
  itemSubtotal: number
  shippingTotal: number
  grandTotal: number
} {
  return items.reduce(
    (acc, item) => {
      const product = item.product
      if (!product || typeof product !== 'object') return acc
      const variant = item.variant && typeof item.variant === 'object' ? item.variant : null
      const qty = item.quantity ?? 1
      const unit = resolveUnitPrice(product, variant)
      const ship = resolveShippingPerUnit(product)
      return {
        itemSubtotal: acc.itemSubtotal + unit * qty,
        shippingTotal: acc.shippingTotal + ship * qty,
        grandTotal: acc.grandTotal + unit * qty + ship * qty,
      }
    },
    { itemSubtotal: 0, shippingTotal: 0, grandTotal: 0 },
  )
}
