'use client'

import { useReveal } from '@/hooks/useReveal'
import React from 'react'

const usps = [
  {
    label: '20+ Mixer Grinder Models',
    sub: 'Widest range in one store',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="2" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="2" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2" y="14" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="14" y="14" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Genuine Spare Parts',
    sub: 'For every major brand',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Free Delivery Over Rs. 5,000',
    sub: 'Island-wide shipping',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17H3.5A1.5 1.5 0 0 1 2 15.5v-9A1.5 1.5 0 0 1 3.5 5H15a1.5 1.5 0 0 1 1.5 1.5V9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 9h3l3 3v3.5A1.5 1.5 0 0 1 20.5 17H20M9 17h7" />
        <circle cx="6.5" cy="17.5" r="1.5" />
        <circle cx="17.5" cy="17.5" r="1.5" />
      </svg>
    ),
  },
  {
    label: 'Trusted by Repair Technicians',
    sub: 'Professional-grade stock',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
]

export function USPStrip() {
  const sectionRef = useReveal()

  return (
    <section ref={sectionRef as React.RefObject<HTMLElement>} className="bg-brand-surface py-10 border-y border-brand-navy/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6 list-none m-0 p-0">
          {usps.map(({ label, sub, icon }, i) => (
            <li key={label} className={`reveal delay-${i + 1} flex items-start gap-4`}>
              <span className="text-brand-gold flex-shrink-0 mt-0.5">{icon}</span>
              <div>
                <p className="font-body font-semibold text-sm text-brand-navy leading-snug">{label}</p>
                <p className="font-body text-xs text-brand-muted mt-0.5">{sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
