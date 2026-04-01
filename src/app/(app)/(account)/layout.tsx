import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { headers as getHeaders } from 'next/headers.js'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { RenderParams } from '@/components/RenderParams'

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Account',
}

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Page hero */}
      <div className="bg-brand-navy text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-brand-gold text-xs font-semibold tracking-widest uppercase mb-3">
            My Account
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold">
            {user ? `Welcome, ${user.name?.split(' ')[0] || 'back'}` : 'Account'}
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12">
        <RenderParams className="mb-6" />
        {children}
      </div>
    </div>
  )
}
