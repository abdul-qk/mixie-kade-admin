'use client'

import { useAuth } from '@/providers/Auth'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useMemo, useState } from 'react'

const navLinks = [
  { label: 'Home',       href: '/'            },
  { label: 'Shop',       href: '/shop'        },
  { label: 'Spare Parts', href: '/spare-parts' },
  { label: 'Guides',     href: '/guides'      },
  { label: 'About',      href: '/about'       },
  { label: 'Contact',    href: '/contact'     },
]

export function Header() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const { user, status }          = useAuth()
  const { cart }                  = useCart()
  const pathname                  = usePathname()
  const loading                   = status === undefined

  const cartQuantity = useMemo(() => {
    if (!cart?.items?.length) return 0
    return cart.items.reduce((n, item) => n + (item.quantity || 0), 0)
  }, [cart?.items])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const isHomePage = pathname === '/'
  const floating   = isHomePage && !scrolled

  const headerCls = [
    'fixed top-0 inset-x-0 z-50 transition-all duration-500',
    floating
      ? 'md:px-6 md:pt-5'
      : 'bg-white shadow-md border-b border-brand-surface/40',
  ].join(' ')

  const navCls = [
    'flex items-center justify-between px-6 bg-white transition-all duration-500',
    floating
      ? `h-16 shadow-lg md:max-w-5xl md:mx-auto md:rounded-full ${
          menuOpen ? 'rounded-t-2xl' : 'rounded-b-2xl'
        }`
      : 'h-20',
  ].join(' ')

  const dropdownCls = [
    'animate-slide-down md:hidden bg-white px-6 pb-5',
    floating
      ? 'rounded-b-2xl shadow-lg md:max-w-5xl md:mx-auto'
      : 'border-t border-brand-surface shadow-sm',
  ].join(' ')

  return (
    <>
      <header className={headerCls}>
        <nav className={navCls}>
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <img src="/logo.jpeg" alt="Mixie Kadai" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center gap-8 list-none m-0 p-0">
            {navLinks.map(({ label, href }) => (
              <li key={label}>
                <Link
                  href={href}
                  className="font-body text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors duration-200"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Account + Cart + hamburger */}
          <div className="flex items-center gap-4">
            {/* Account link — desktop, hidden while loading */}
            {!loading && (
              <Link
                href={user ? '/account' : '/login'}
                aria-label={user ? 'My Account' : 'Sign In'}
                className="hidden md:flex items-center gap-1.5 font-body text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                </svg>
                {user ? (user.name?.split(' ')[0] || 'Account') : 'Login'}
              </Link>
            )}

            {/* Cart — full cart page */}
            <Link
              href="/cart"
              aria-label={
                cartQuantity > 0
                  ? `Shopping cart, ${cartQuantity} items`
                  : 'Shopping cart'
              }
              className="relative flex items-center justify-center text-brand-navy hover:text-brand-gold transition-colors duration-200 p-1"
            >
              <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden />
              {cartQuantity > 0 ? (
                <span className="absolute -top-0.5 -right-1 min-w-[18px] h-[18px] rounded-full bg-brand-navy text-[10px] font-semibold text-white flex items-center justify-center px-1 tabular-nums">
                  {cartQuantity > 99 ? '99+' : cartQuantity}
                </span>
              ) : null}
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden text-brand-navy hover:text-brand-gold transition-colors duration-200"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className={dropdownCls}>
            <ul className="flex flex-col gap-1 list-none m-0 p-0 pt-2">
              {navLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="block py-2.5 font-body text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {!loading && (
                <li>
                  <Link
                    href={user ? '/account' : '/login'}
                    className="block py-2.5 font-body text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors duration-200"
                  >
                    {user ? `Account (${user.name?.split(' ')[0] || 'Me'})` : 'Login'}
                  </Link>
                </li>
              )}
              <li>
                <Link
                  href="/cart"
                  className="block py-2.5 font-body text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors duration-200"
                >
                  Cart{cartQuantity > 0 ? ` (${cartQuantity})` : ''}
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="block py-2.5 font-body text-sm font-medium text-brand-navy hover:text-brand-gold transition-colors duration-200"
                >
                  Checkout
                </Link>
              </li>
            </ul>
          </div>
        )}
      </header>

      {/* Spacer so content isn't hidden under fixed header (except on homepage which uses -mt-20) */}
      {!isHomePage && <div className="h-20" />}
    </>
  )
}
