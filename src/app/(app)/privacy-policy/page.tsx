import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/privacy-policy') },
  description:
    'Privacy policy for Mixie Kadai (mixiekadai.lk) — how we collect, use, and protect your information when you shop with us.',
  openGraph: { url: '/privacy-policy' },
  title: 'Privacy Policy',
}

function DevNote({ children }: { children: React.ReactNode }) {
  return (
    <aside className="bg-amber-50 border border-amber-300 rounded px-4 py-3 text-sm text-amber-900 font-body my-4">
      <span className="font-semibold">DEV NOTE: </span>
      {children}
    </aside>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <article className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Privacy Policy</h1>
          <p className="font-body text-white/70 mt-3 text-sm">
            Last updated: June 2026 · mixiekadai.lk
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-12 font-body text-brand-muted space-y-8 leading-relaxed">

        <p>
          Mixie Kadai (operated by Hakimi Appliances, 771 Jaffna-Kankesanturai Rd, Jaffna 40000,
          Sri Lanka) respects your privacy. This policy explains what personal information we
          collect, how we use it, and your rights regarding that data.
        </p>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">1. Information we collect</h2>
          <p>We collect information you provide directly when you:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Place an order — name, phone number, delivery address, and order details</li>
            <li>Contact us via WhatsApp, the contact form, or email</li>
            <li>Create an account — email address, name, and saved delivery details</li>
            <li>Submit a product review — name (or display name) and review content</li>
          </ul>
          <p>
            We also collect usage data automatically, such as pages visited, browser type, device
            type, and referring URL, through our hosting and analytics provider (Vercel).
          </p>
          <DevNote>
            Confirm whether any additional data is collected (e.g. via Facebook Pixel, Google
            Analytics, or other third-party scripts). Add those here if applicable.
          </DevNote>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">2. How we use your information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Process and fulfil your orders</li>
            <li>Arrange delivery and share tracking information</li>
            <li>Respond to enquiries and provide customer support</li>
            <li>Verify bank transfer payments</li>
            <li>Improve our website and product range</li>
            <li>Communicate order updates via WhatsApp or phone</li>
          </ul>
          <p>We do not sell or rent your personal data to third parties.</p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">3. Sharing your information</h2>
          <p>We share your information only where necessary:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="text-brand-navy font-medium">Domex Courier</span> — your name,
              phone, and delivery address are shared with our logistics partner to fulfil delivery.
            </li>
            <li>
              <span className="text-brand-navy font-medium">Vercel</span> — our hosting provider
              processes web traffic and usage analytics on our behalf.
            </li>
          </ul>
          <DevNote>
            If bank transfer payments are ever processed via a third-party gateway (e.g. PayHere,
            Stripe), add them here with a description of what data is shared.
          </DevNote>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">4. Cookies &amp; analytics</h2>
          <p>
            Our website uses cookies and similar technologies for essential functionality (e.g.
            keeping items in your cart) and performance monitoring via Vercel Speed Insights. No
            advertising or tracking cookies are set by us.
          </p>
          <p>
            You can control or delete cookies through your browser settings. Disabling cookies may
            affect cart and login functionality.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">5. Data retention</h2>
          <p>
            Order records are retained for as long as required to fulfil legal and accounting
            obligations under Sri Lanka law. Account data is retained until you request deletion.
            Inactive accounts may be removed after an extended period of inactivity.
          </p>
          <DevNote>
            Specify exact retention periods (e.g. "orders retained for 7 years for tax purposes")
            and confirm with your accountant or legal adviser.
          </DevNote>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">6. Your rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Request access to the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data (subject to legal retention requirements)</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p>
            To exercise any of these rights, contact us using the details on our{' '}
            <Link className="text-brand-navy underline" href="/contact">contact page</Link>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">7. Security</h2>
          <p>
            We use industry-standard practices to protect your data, including encrypted connections
            (HTTPS) and access-controlled systems. No method of transmission over the internet is
            100% secure; we cannot guarantee absolute security but take reasonable precautions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">8. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Changes will be posted on this page with
            an updated date. Continued use of our website after changes constitutes acceptance of
            the revised policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">9. Contact</h2>
          <p>
            For privacy-related questions or requests, reach us at:
          </p>
          <address className="not-italic space-y-1 text-sm">
            <p className="font-medium text-brand-navy">Hakimi Appliances (Mixie Kadai)</p>
            <p>771 Jaffna-Kankesanturai Rd, Jaffna 40000, Sri Lanka</p>
            <p>
              Email:{' '}
              <a className="text-brand-navy underline" href="mailto:mixiekadai@gmail.com">
                mixiekadai@gmail.com
              </a>
            </p>
            <p>
              Phone:{' '}
              <a className="text-brand-navy underline" href="tel:+94776952531">
                +94 77 695 2531
              </a>
            </p>
          </address>
        </section>

      </div>
    </article>
  )
}
