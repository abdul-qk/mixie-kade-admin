import { Hero } from '@/components/storefront/Hero'
import { USPStrip } from '@/components/storefront/USPStrip'
import { CategoryGrid } from '@/components/storefront/CategoryGrid'
import { AboutSnippet } from '@/components/storefront/AboutSnippet'
import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  alternates: {
    canonical: canonicalUrl('/'),
  },
  description:
    'Shop 20+ mixer grinder models, genuine spare parts, and kitchen accessories. Islandwide delivery from Jaffna, Sri Lanka.',
  openGraph: {
    url: '/',
  },
  title: "Sri Lanka's Home for Mixer Grinders",
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <USPStrip />
      <CategoryGrid />
      <AboutSnippet />
    </>
  )
}
