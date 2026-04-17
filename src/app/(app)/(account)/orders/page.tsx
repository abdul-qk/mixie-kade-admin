import type { Order } from '@/payload-types'
import type { Metadata } from 'next'

import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  description: 'Your Mixie Kadai order history.',
  openGraph: mergeOpenGraph({ title: 'My Orders', url: '/orders' }),
  title: 'My Orders — Mixie Kadai',
}

const statusColours: Record<string, string> = {
  processing: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-200 text-gray-800',
}

const paymentMethodLabel: Record<string, string> = {
  cod: 'Cash on Delivery',
  bank_transfer: 'Bank Transfer',
}

export default async function OrdersPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your orders.')}`)
  }

  let orders: Order[] = []
  try {
    const result = await payload.find({
      collection: 'orders',
      limit: 0,
      pagination: false,
      user,
      overrideAccess: false,
      where: { customer: { equals: user.id } },
    })
    orders = result?.docs || []
  } catch {}

  return (
    <div className="bg-white border border-brand-surface p-8">
      <h2 className="font-display text-2xl font-semibold text-brand-navy mb-6">Order History</h2>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-body text-brand-muted mb-6">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/shop"
            className="font-body text-sm font-medium bg-brand-navy text-white px-8 py-3 hover:bg-brand-gold transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => {
            const status = (order as any).shipmentStatusLabel || (order as any).status || 'processing'
            const badgeCls = statusColours[status] || 'bg-gray-100 text-gray-700'
            const paymentMethod = (order as any).paymentMethod || 'cod'
            const createdAt = new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })
            // Parse items from codItemsJson snapshot
            let orderItems: any[] = []
            try {
              if ((order as any).codItemsJson) {
                orderItems = JSON.parse((order as any).codItemsJson)
              }
            } catch {}

            return (
              <li key={order.id} className="border border-brand-surface p-6">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-3">
                    <p className="font-body text-sm font-semibold text-brand-navy">Order #{order.id}</p>
                    <span className={`font-body text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${badgeCls}`}>
                      {status}
                    </span>
                    <span className="font-body text-xs font-medium px-2.5 py-0.5 rounded-full bg-brand-gold-light text-brand-navy">
                      {paymentMethodLabel[paymentMethod] || 'Payment Pending'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-body text-xs text-brand-muted">{createdAt}</p>
                    {(order as any).amount != null && (
                      <p className="font-body font-bold text-brand-navy">
                        Rs. {Number((order as any).amount).toLocaleString()}
                      </p>
                    )}
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-body text-xs font-medium border border-brand-navy text-brand-navy px-3 py-1.5 hover:bg-brand-navy hover:text-white transition-colors"
                    >
                      Track your order
                    </Link>
                  </div>
                </div>

                {/* Items */}
                {orderItems.length > 0 && (
                  <div className="space-y-1 mb-3">
                    {orderItems.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between font-body text-xs text-brand-muted">
                        <span>{item.productName || `Item ${i + 1}`} × {item.quantity}</span>
                        <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Delivery address */}
                {(order as any).deliveryAddress && (
                  <p className="font-body text-xs text-brand-muted border-t border-brand-surface pt-3 mt-3">
                    📍 {(order as any).deliveryAddress}
                    {(order as any).deliveryCity ? `, ${(order as any).deliveryCity}` : ''}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
