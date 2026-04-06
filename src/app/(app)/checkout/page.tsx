'use client'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useAuth } from '@/providers/Auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import type { Product } from '@/payload-types'
import {
  computeCartOrderTotals,
  resolveCompareAtPrice,
  resolveUnitPrice,
  resolveShippingPerUnit,
} from '@/lib/productPrice'

type FormState = {
  customerName: string
  phone: string
  address: string
  city: string
  notes: string
  paymentMethod: 'cod' | 'bank_transfer'
}

export default function CheckoutPage() {
  const { cart, clearCart } = useCart()
  const { user }            = useAuth()
  const router              = useRouter()

  const items = cart?.items ?? []
  const orderTotals = computeCartOrderTotals(items)
  const grandTotal = orderTotals.grandTotal

  const [form, setForm] = useState<FormState>({
    customerName: '',
    phone:        '',
    address:      '',
    city:         '',
    notes:        '',
    paymentMethod: 'cod',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  // Pre-fill from logged-in user
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        customerName: f.customerName || user.name  || '',
        phone:        f.phone        || (user as any).phone || '',
      }))
    }
  }, [user])

  if (!items.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-brand-cream">
        <p className="font-body text-brand-muted">Your cart is empty.</p>
        <Link href="/shop" className="font-body text-sm text-brand-navy underline">
          Browse products
        </Link>
      </div>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const orderItems = items
        .filter(item => item.product && typeof item.product === 'object')
        .map(item => {
          const product = item.product as Product
          const variant = item.variant && typeof item.variant === 'object' ? item.variant : null
          const unitPrice = resolveUnitPrice(product, variant)
          const shippingCost = resolveShippingPerUnit(product)
          const quantity = item.quantity ?? 1

          return {
            product:  product.id,
            quantity,
            price:    unitPrice,
            shippingCost,
            shippingTotal: shippingCost * quantity,
          }
        })

      const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity + i.shippingTotal, 0)

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customer:        user?.id ?? null,
          customerName:    form.customerName,
          customerPhone:   form.phone,
          deliveryAddress: form.address,
          deliveryCity:    form.city,
          codNotes:        form.notes || '',
          codItemsJson:    JSON.stringify(orderItems),
          paymentMethod:   form.paymentMethod,
          items:           orderItems,
          total,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(
          err?.errors?.[0]?.message || err?.message || 'Failed to place order',
        )
      }

      const data = await res.json()
      const orderId = data?.doc?.id || data?.id
      await clearCart()
      router.push(`/checkout/confirm-order?id=${orderId}&paymentMethod=${encodeURIComponent(form.paymentMethod)}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full border border-brand-surface focus:border-brand-navy outline-none px-4 py-3 font-body text-sm text-brand-navy bg-white transition-colors min-h-[44px]'

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12">
        <h1 className="font-display text-4xl font-semibold text-brand-navy mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* ── Delivery form ──────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            <h2 className="font-display text-xl font-semibold text-brand-navy">Delivery Details</h2>

            {/* Name */}
            <div>
              <label htmlFor="field-customerName" className="block font-body text-sm font-medium text-brand-navy mb-1">
                Full Name <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                id="field-customerName"
                type="text"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                required
                placeholder="Your full name"
                autoComplete="name"
                className={inputClass}
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="field-phone" className="block font-body text-sm font-medium text-brand-navy mb-1">
                Phone Number <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                id="field-phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="07X XXX XXXX"
                autoComplete="tel"
                className={inputClass}
              />
            </div>

            {/* City */}
            <div>
              <label htmlFor="field-city" className="block font-body text-sm font-medium text-brand-navy mb-1">
                City
              </label>
              <input
                id="field-city"
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Colombo"
                autoComplete="address-level2"
                className={inputClass}
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="field-address"
                className="block font-body text-sm font-medium text-brand-navy mb-1"
              >
                Delivery Address <span className="text-brand-gold" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <textarea
                id="field-address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                rows={3}
                placeholder="House no, street, area..."
                className={`${inputClass} resize-none min-h-[88px]`}
              />
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="field-notes"
                className="block font-body text-sm font-medium text-brand-navy mb-1"
              >
                Order Notes <span className="font-normal text-brand-muted">(optional)</span>
              </label>
              <textarea
                id="field-notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Any special instructions?"
                className={`${inputClass} resize-none min-h-[72px]`}
              />
            </div>

            {/* Payment method */}
            <div>
              <p className="block font-body text-sm font-medium text-brand-navy mb-2">
                Payment Method <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </p>
              <div className="space-y-2">
                <label className="flex items-start gap-3 border border-brand-surface bg-white px-4 py-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={form.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <span className="font-body text-sm text-brand-navy">
                    Cash on Delivery
                  </span>
                </label>
                <label className="flex items-start gap-3 border border-brand-surface bg-white px-4 py-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={form.paymentMethod === 'bank_transfer'}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <span className="font-body text-sm text-brand-navy">
                    Online Bank Transfer
                  </span>
                </label>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="bg-red-50 border border-red-200 px-4 py-3"
              >
                <p className="font-body text-sm text-red-700">{error}</p>
              </div>
            )}

            {form.paymentMethod === 'cod' ? (
              <div className="bg-brand-gold-light border-l-4 border-brand-gold px-4 py-3">
                <p className="font-body text-sm font-semibold text-brand-navy">Cash on Delivery</p>
                <p className="font-body text-xs text-brand-muted mt-0.5">
                  No online payment needed. Pay when your order arrives.
                </p>
              </div>
            ) : (
              <div className="bg-brand-gold-light border-l-4 border-brand-gold px-4 py-3 space-y-1">
                <p className="font-body text-sm font-semibold text-brand-navy">Online Bank Transfer</p>
                <p className="font-body text-xs text-brand-muted">
                  Account Number: <span className="font-semibold text-brand-navy">111000285346</span>
                </p>
                <p className="font-body text-xs text-brand-muted">
                  Account Name: <span className="font-semibold text-brand-navy">Hakimi Appliances</span>
                </p>
                <p className="font-body text-xs text-brand-muted">
                  Bank: <span className="font-semibold text-brand-navy">Ndb manipay</span>
                </p>
                <p className="font-body text-xs text-brand-muted pt-1">
                  After payment, send your screenshot via WhatsApp with your order number as the reference.
                  Your order will be dispatched only after payment proof is verified.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-navy hover:bg-brand-gold text-white font-body font-semibold text-sm py-4 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? 'Placing Order...'
                : form.paymentMethod === 'bank_transfer'
                  ? 'Place Order (Online Bank Transfer)'
                  : 'Place Order (Cash on Delivery)'}
            </button>
          </form>

          {/* ── Order summary ───────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-brand-surface p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold text-brand-navy mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item, i) => {
                  if (!item.product || typeof item.product !== 'object') return null
                  const product = item.product as Product
                  const variant = item.variant && typeof item.variant === 'object' ? item.variant : null
                  const price = resolveUnitPrice(product, variant)
                  const compareAtPrice = resolveCompareAtPrice(product, variant)
                  const shippingCost = resolveShippingPerUnit(product)
                  const qty     = item.quantity ?? 1
                  const lineTotal = price * qty
                  const compareLineTotal =
                    typeof compareAtPrice === 'number' ? compareAtPrice * qty : null
                  const hasCompare =
                    typeof compareLineTotal === 'number' && compareLineTotal > lineTotal
                  return (
                    <div key={i} className="flex justify-between gap-2">
                      <span className="font-body text-sm text-brand-navy leading-snug flex flex-col">
                        <span>
                          {product.title}
                          {qty > 1 && <span className="text-brand-muted"> ×{qty}</span>}
                        </span>
                        {shippingCost > 0 && (
                          <span className="text-xs text-brand-muted">
                            Shipping: Rs. {(shippingCost * qty).toLocaleString()}
                          </span>
                        )}
                      </span>
                      <span className="font-body text-sm font-semibold text-brand-navy whitespace-nowrap text-right">
                        <span>Rs. {lineTotal.toLocaleString()}</span>
                        {hasCompare ? (
                          <span className="ml-2 text-xs text-brand-muted line-through tabular-nums">
                            Rs. {compareLineTotal.toLocaleString()}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="border-t border-brand-surface pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="font-body text-sm text-brand-navy">Items subtotal</span>
                  <span className="font-body text-sm font-semibold text-brand-navy">
                    Rs. {orderTotals.itemSubtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-body text-sm text-brand-navy">Shipping</span>
                  <span className="font-body text-sm font-semibold text-brand-navy">
                    Rs. {orderTotals.shippingTotal.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="border-t border-brand-surface mt-4 pt-4 flex justify-between">
                <span className="font-body font-semibold text-brand-navy">Total</span>
                <span className="font-body font-bold text-xl text-brand-navy">
                  Rs. {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
