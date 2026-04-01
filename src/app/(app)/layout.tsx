import type { ReactNode } from 'react'

import type { Metadata } from 'next'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { SiteJsonLd } from '@/components/seo/SiteJsonLd'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { getServerSideURL } from '@/utilities/getURL'
import { SITE_NAME } from '@/utilities/site'
import { ensureStartsWith } from '@/utilities/ensureStartsWith'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import React from 'react'
import './globals.css'

const cormorant = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmSans = DM_Sans({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const baseUrl = getServerSideURL()
const twitterCreator = process.env.TWITTER_CREATOR
  ? ensureStartsWith(process.env.TWITTER_CREATOR, '@')
  : undefined
const twitterSite = process.env.TWITTER_SITE
  ? ensureStartsWith(process.env.TWITTER_SITE, 'https://')
  : undefined

export const metadata: Metadata = {
  description:
    'Shop mixer grinders, genuine spare parts, and kitchen accessories. Islandwide delivery from Jaffna, Sri Lanka.',
  metadataBase: new URL(baseUrl),
  openGraph: {
    locale: 'en_LK',
    siteName: SITE_NAME,
    type: 'website',
    url: '/',
  },
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  ...(twitterCreator && twitterSite
    ? {
        twitter: {
          card: 'summary_large_image',
          creator: twitterCreator,
          site: twitterSite,
        },
      }
    : {}),
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      className={[cormorant.variable, dmSans.variable].filter(Boolean).join(' ')}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <SiteJsonLd />
        <Providers>
          <AdminBar />
          <LivePreviewListener />

          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
