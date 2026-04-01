import type { Metadata } from 'next'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import Link from 'next/link'
import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { AccountForm } from '@/components/forms/AccountForm'
import { Order } from '@/payload-types'
import { getPayload } from 'payload'
import { redirect } from 'next/navigation'
import React from 'react'

export const metadata: Metadata = {
  description: 'Manage your Mixie Kadai account.',
  openGraph: mergeOpenGraph({ title: 'Account', url: '/account' }),
  title: 'Account — Mixie Kadai',
}

const statusColours: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped:   'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default async function AccountPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(`/login?warning=${encodeURIComponent('Please login to access your account.')}`)
  }

  let orders: Order[] = []
  try {
    const result = await payload.find({
      collection: 'orders',
      limit: 5,
      user,
      overrideAccess: false,
      pagination: false,
      where: { customer: { equals: user.id } },
    })
    orders = result?.docs || []
  } catch {}

  return (
    <div className="flex flex-col gap-10">

      {/* Profile card */}
      <div className="bg-white border border-brand-surface p-8">
        <h2 className="font-display text-2xl font-semibold text-brand-navy mb-6">Profile Settings</h2>
        <AccountForm />
      </div>

      {/* Recent orders card */}
      <div className="bg-white border border-brand-surface p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold text-brand-navy">Recent Orders</h2>
          <Link href="/orders" className="font-body text-sm text-brand-gold underline underline-offset-4 hover:text-brand-navy transition-colors">
            View all →
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="font-body text-brand-muted mb-4">You haven&apos;t placed any orders yet.</p>
            <Link href="/shop" className="font-body text-sm font-medium bg-brand-navy text-white px-6 py-2.5 hover:bg-brand-gold transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {orders.map((order) => {
              const status = (order as any).status || 'pending'
              const badgeCls = statusColours[status] || 'bg-gray-100 text-gray-700'
              const createdAt = new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
              return (
                <li key={order.id} className="border border-brand-surface p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-body text-sm font-semibold text-brand-navy">Order #{order.id}</p>
                      <span className={`font-body text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${badgeCls}`}>
                        {status}
                      </span>
                    </div>
                    <p className="font-body text-xs text-brand-muted">{createdAt}</p>
                    {(order as any).deliveryAddress && (
                      <p className="font-body text-xs text-brand-muted mt-0.5 line-clamp-1">
                        {(order as any).deliveryAddress}
                      </p>
                    )}
                  </div>
                  {(order as any).total != null && (
                    <p className="font-body font-bold text-brand-navy whitespace-nowrap">
                      Rs. {Number((order as any).total).toLocaleString()}
                    </p>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

    </div>
  )
}
