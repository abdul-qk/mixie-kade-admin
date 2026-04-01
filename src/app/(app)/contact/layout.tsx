import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/contact') },
  description:
    'Contact Mixie Kadai in Jaffna — phone, WhatsApp, email, and store address. Mixer grinders & spare parts across Sri Lanka.',
  openGraph: { url: '/contact' },
  title: 'Contact',
}

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children
}
