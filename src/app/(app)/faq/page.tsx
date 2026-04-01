import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/faq') },
  description:
    'Frequently asked questions about ordering mixer grinders and spare parts from Mixie Kadai — delivery, warranty, COD, and returns.',
  openGraph: { url: '/faq' },
  title: 'FAQ',
}

const items: { q: string; a: string }[] = [
  {
    q: 'Do you deliver outside Jaffna?',
    a: 'Yes. We offer islandwide delivery across Sri Lanka. Dispatch times and courier options are confirmed when you place your order.',
  },
  {
    q: 'Is cash on delivery available?',
    a: 'Yes — many orders can be placed with cash on delivery. You’ll see available options at checkout.',
  },
  {
    q: 'Are spare parts genuine?',
    a: 'We focus on genuine parts for the brands we stock. If you are unsure which part fits your model, message us before ordering.',
  },
  {
    q: 'How do I choose the right mixer grinder?',
    a: 'See our guide on wattage, jars, and family size, or WhatsApp us with your cooking habits and budget.',
  },
]

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-navy text-white py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-body text-brand-gold text-xs font-semibold tracking-widest uppercase mb-3">
            Help
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">
            Frequently asked questions
          </h1>
          <p className="font-body text-white/70">
            Quick answers about orders, delivery, and spare parts. No FAQ schema — just clear
            content for customers and search.
          </p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-14 space-y-10">
        {items.map((item) => (
          <section key={item.q}>
            <h2 className="font-display text-xl font-semibold text-brand-navy mb-2">{item.q}</h2>
            <p className="font-body text-brand-muted leading-relaxed">{item.a}</p>
          </section>
        ))}
        <p className="font-body text-sm text-brand-muted pt-4">
          Still stuck?{' '}
          <Link className="text-brand-navy font-medium underline underline-offset-4" href="/contact">
            Contact us
          </Link>{' '}
          or WhatsApp — we reply as fast as we can.
        </p>
      </div>
    </div>
  )
}
