import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/about') },
  description:
    'Mixie Kadai — trusted mixer grinder and spare parts retailer in Sri Lanka. Islandwide delivery from Jaffna since 2020.',
  openGraph: { url: '/about' },
  title: 'About Us',
}

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children
}
