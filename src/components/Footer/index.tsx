import Link from 'next/link'
import React from 'react'

const shopLinks = [
  { label: 'Mixer Grinders',              href: '/shop/mixer-grinders'   },
  { label: 'Blenders & Juicers',          href: '/shop/blenders-juicers' },
  { label: 'Coconut Scrapers & Grinders', href: '/shop/coconut-scrapers' },
  { label: 'Jars',                        href: '/shop/jars'             },
  { label: 'Spare Parts',                 href: '/shop/spare-parts'      },
  { label: 'Accessories',                 href: '/shop/accessories'      },
  { label: 'Offers',                      href: '/shop'                  },
]

const companyLinks = [
  { label: 'About Us', href: '/about'   },
  { label: 'Contact',  href: '/contact' },
  { label: 'Guides',   href: '/guides'  },
  { label: 'Delivery', href: '/delivery/sri-lanka' },
  { label: 'FAQ',      href: '/faq'     },
]

const policyLinks: { label: string; href: string }[] = [
  { label: 'Shipping & Returns', href: '/shipping-returns' },
  { label: 'Privacy Policy',     href: '/privacy-policy'  },
]

export async function Footer() {
  return (
    <footer className="bg-brand-navy text-white">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* Shop */}
        <div>
          <h3 className="font-body text-xs font-semibold tracking-widest uppercase text-brand-gold mb-5">Shop</h3>
          <ul className="space-y-3 list-none m-0 p-0">
            {shopLinks.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="font-body text-sm text-white/80 hover:text-white transition-colors duration-200">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-body text-xs font-semibold tracking-widest uppercase text-brand-gold mb-5">Company</h3>
          <ul className="space-y-3 list-none m-0 p-0">
            {companyLinks.map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="font-body text-sm text-white/80 hover:text-white transition-colors duration-200">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h3 className="font-body text-xs font-semibold tracking-widest uppercase text-brand-gold mb-5">Policies</h3>
          <ul className="space-y-3 list-none m-0 p-0">
            {policyLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="font-body text-sm text-white/80 hover:text-white transition-colors duration-200"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social + brand */}
        <div>
          <img src="/logo.jpeg" alt="Mixie Kadai" className="h-12 w-auto object-contain mb-3 brightness-0 invert" />
          <p className="font-body text-sm text-white/70 mb-6">Sri Lanka's home for mixer grinders.</p>

          <h3 className="font-body text-xs font-semibold tracking-widest uppercase text-brand-gold mb-4">Follow Us</h3>
          <div className="flex items-center gap-1">
            <a
              href="https://www.instagram.com/mixie_kadai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Mixie Kadai on Instagram"
              className="flex items-center justify-center w-11 h-11 text-white/80 hover:text-brand-gold transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/share/18cTEreLXk/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Mixie Kadai on Facebook"
              className="flex items-center justify-center w-11 h-11 text-white/80 hover:text-brand-gold transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-body text-xs text-white/60">
            &copy; 2026 Mixie Kadai. All rights reserved.
          </p>
          <p className="font-body text-xs text-white/60">
            Built by <span className="text-brand-gold">Qadir Studios</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
