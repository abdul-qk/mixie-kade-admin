import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Checkout',
}

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  return children
}
