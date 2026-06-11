import { canonicalUrl } from '@/utilities/canonicalUrl'
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/terms') },
  description:
    'Terms and conditions for shopping at Mixie Kadai (mixiekadai.lk) — orders, payments, delivery, returns, and your rights as a customer in Sri Lanka.',
  openGraph: { url: '/terms' },
  title: 'Terms & Conditions',
}

function DevNote({ children }: { children: React.ReactNode }) {
  return (
    <aside className="bg-amber-50 border border-amber-300 rounded px-4 py-3 text-sm text-amber-900 font-body my-4">
      <span className="font-semibold">DEV NOTE: </span>
      {children}
    </aside>
  )
}

export default function TermsPage() {
  return (
    <article className="min-h-screen bg-white">
      <div className="bg-brand-navy text-white py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-semibold">Terms &amp; Conditions</h1>
          <p className="font-body text-white/70 mt-3 text-sm">
            Last updated: June 2026 · mixiekadai.lk
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-12 font-body text-brand-muted space-y-8 leading-relaxed">

        <p>
          By browsing or placing an order on mixiekadai.lk, you agree to these terms and
          conditions. Please read them carefully before making a purchase. These terms apply to all
          sales made through our website.
        </p>

        <p>
          These terms are governed by the laws of Sri Lanka. Our registered business is{' '}
          <span className="text-brand-navy font-medium">Hakimi Appliances</span>, trading as Mixie
          Kadai, located at 771 Jaffna-Kankesanturai Rd, Jaffna 40000, Sri Lanka.
        </p>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">1. Products &amp; descriptions</h2>
          <p>
            We make every effort to ensure product descriptions, images, and specifications are
            accurate. Minor variations in colour or appearance may occur due to photography and
            screen settings. Specifications such as wattage, jar count, and warranty periods are
            sourced from manufacturers and are subject to change.
          </p>
          <p>
            Availability is not guaranteed. If an item goes out of stock after your order is placed,
            we will contact you to arrange a substitute, backorder, or full refund.
          </p>
          <DevNote>
            Add a note here if any products are sold as-is (e.g. display units, refurbished items)
            and confirm whether those are clearly labelled on the product page.
          </DevNote>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">2. Pricing</h2>
          <p>
            All prices are displayed in Sri Lankan Rupees (LKR) and are inclusive of any applicable
            taxes unless stated otherwise. Shipping fees are shown at checkout and are charged per
            item.
          </p>
          <p>
            We reserve the right to correct pricing errors. If a pricing error is identified after
            your order is placed, we will notify you and give you the option to proceed at the
            correct price or cancel for a full refund.
          </p>
          <DevNote>
            Confirm VAT registration status. If VAT-registered, state whether prices are VAT-inclusive
            or exclusive and add your VAT number here.
          </DevNote>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">3. Ordering</h2>
          <p>
            Placing an order constitutes an offer to purchase. Your order is confirmed when you
            receive an order reference number. We reserve the right to cancel or refuse any order
            at our discretion, in which case a full refund will be issued if payment has been made.
          </p>
          <p>
            You are responsible for providing accurate delivery details. We cannot be held liable
            for failed deliveries due to incorrect information provided at checkout.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">4. Payment</h2>
          <p>We accept the following payment methods:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="text-brand-navy font-medium">Cash on Delivery (COD)</span> — payment
              is collected when your order is delivered. Orders not paid on delivery may be returned.
            </li>
            <li>
              <span className="text-brand-navy font-medium">Online Bank Transfer</span> — payment
              must be made to the account details provided at checkout. Orders are dispatched only
              after payment proof (screenshot) is verified via WhatsApp. Account: 111000285346,
              Hakimi Appliances, NDB Manipay.
            </li>
          </ul>
          <DevNote>
            If additional payment methods are added (e.g. PayHere, card payments), update this
            section and include any relevant payment processing terms.
          </DevNote>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">5. Delivery</h2>
          <p>
            We deliver island-wide across Sri Lanka from our base in Jaffna via Domex courier.
            Estimated delivery time is 2–3 business days, though this may vary based on your
            location and courier availability. We are not liable for delays caused by the courier
            or circumstances outside our control.
          </p>
          <p>
            Tracking information is shared with you when available. Delivery is to the address
            provided at checkout; re-delivery charges may apply if delivery is missed.
          </p>
          <DevNote>
            Confirm whether there are any delivery exclusions (e.g. remote areas, islands) and
            whether express delivery or same-day options are available. Update accordingly.
          </DevNote>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">6. Returns &amp; refunds</h2>
          <p>
            Please review our full{' '}
            <Link className="text-brand-navy underline" href="/shipping-returns">
              Shipping &amp; Returns policy
            </Link>{' '}
            for detailed information. In summary:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Report damaged or incorrect items within 48 hours of delivery with photos and your
              order reference.
            </li>
            <li>
              Spare parts and opened electrical items are generally non-returnable unless faulty.
            </li>
            <li>
              Approved refunds are processed within a reasonable timeframe via the original payment
              method where possible.
            </li>
          </ul>
          <DevNote>
            Define "reasonable timeframe" for refunds (e.g. 5–7 business days for bank transfers).
            Confirm the process for COD refunds (cash handback on collection, or bank transfer).
          </DevNote>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">7. Warranty</h2>
          <p>
            Warranty periods vary by product and brand. Where a warranty is listed on a product
            page, it refers to the manufacturer's warranty. Warranty claims must be directed to us
            in the first instance; we will liaise with the manufacturer or supplier on your behalf.
          </p>
          <p>
            Warranty is void if the product shows signs of misuse, unauthorised repair, or physical
            damage not reported at the time of delivery.
          </p>
          <DevNote>
            Add a link to a warranty claim process page or WhatsApp contact once that flow is
            defined. Also confirm whether Mixie Kadai offers any additional warranty beyond the
            manufacturer's terms.
          </DevNote>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">8. Intellectual property</h2>
          <p>
            All content on this website — including text, images, logos, and design — is the
            property of Hakimi Appliances (Mixie Kadai) or its licensors. You may not reproduce,
            redistribute, or use any content for commercial purposes without written permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">9. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by Sri Lankan law, Hakimi Appliances shall not be
            liable for any indirect, incidental, or consequential damages arising from the use of
            our website or products. Our total liability for any claim related to a purchase shall
            not exceed the price paid for the item in question.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">10. Governing law</h2>
          <p>
            These terms are governed by and construed in accordance with the laws of Sri Lanka.
            Any disputes arising from these terms or your use of our website shall be subject to
            the exclusive jurisdiction of the courts of Sri Lanka.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">11. Changes to these terms</h2>
          <p>
            We may update these terms from time to time. Changes will be posted on this page with
            an updated date. Your continued use of our website after changes constitutes acceptance
            of the revised terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl text-brand-navy">12. Contact</h2>
          <p>
            For questions about these terms, contact us at:
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
