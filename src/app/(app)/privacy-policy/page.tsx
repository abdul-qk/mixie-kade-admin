import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/privacy-policy') },
  description:
    'Privacy policy for Mixie Kadai (mixiekadai.lk) — how we collect, use, and protect your information when you shop with us.',
  openGraph: { url: '/privacy-policy' },
  title: 'Privacy Policy',
}

export default function PrivacyPolicyPage() {
  return (
    <article className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Privacy policy</h1>
          <p className="font-body text-white/70 mt-3 text-sm">English · mixiekadai.lk</p>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-12 font-body text-brand-muted space-y-6 leading-relaxed">
        <p>
          Mixie Kadai respects your privacy. This policy explains what we collect when you
          browse, contact us, or place an order, and how we use it.
        </p>
        <section>
          <h2 className="font-display text-xl text-brand-navy mb-2">Information we collect</h2>
          <p>
            We may collect your name, phone number, delivery address, email (if provided), order
            details, and messages you send via forms or WhatsApp.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-brand-navy mb-2">How we use</h2>
          <p>
            We use this information to fulfil orders, arrange delivery, respond to enquiries, and
            improve our service. We do not sell your personal data to third parties.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-brand-navy mb-2">Cookies & analytics</h2>
          <p>
            Our website may use cookies or similar technologies for essential functionality and
            analytics. You can control cookies through your browser settings.
          </p>
        </section>
        <section>
          <h2 className="font-display text-xl text-brand-navy mb-2">Contact</h2>
          <p>
            For privacy-related questions, contact us via the details on our{' '}
            <a className="text-brand-navy underline" href="/contact">
              contact page
            </a>
            .
          </p>
        </section>
      </div>
    </article>
  )
}
