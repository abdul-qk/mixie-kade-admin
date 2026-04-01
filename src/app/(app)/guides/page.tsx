import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/guides') },
  description:
    'Practical guides for buying mixer grinders in Sri Lanka — wattage, jars, brands, and maintenance. From Mixie Kadai.',
  openGraph: { url: '/guides' },
  title: 'Guides',
}

const guides = [
  {
    href: '/guides/how-to-choose-mixer-grinder-sri-lanka',
    title: 'How to Choose a Mixer Grinder in Sri Lanka',
    excerpt: 'Family size, wattage, jars, and what to look for before you buy.',
  },
]

export default function GuidesHubPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="bg-brand-navy text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-brand-gold text-xs font-semibold tracking-widest uppercase mb-3">
            Learn
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">Guides</h1>
          <p className="font-body text-white/70 max-w-2xl">
            Honest buying advice for mixer grinders and kitchen appliances — written for Sri Lankan
            homes.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <ul className="grid gap-6 md:grid-cols-2 list-none m-0 p-0">
          {guides.map((g) => (
            <li key={g.href}>
              <Link
                className="block bg-white border border-brand-surface p-8 hover:border-brand-navy transition-colors h-full"
                href={g.href}
              >
                <h2 className="font-display text-xl font-semibold text-brand-navy mb-2">{g.title}</h2>
                <p className="font-body text-sm text-brand-muted">{g.excerpt}</p>
                <span className="inline-block mt-4 font-body text-sm text-brand-gold font-medium">
                  Read guide →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
