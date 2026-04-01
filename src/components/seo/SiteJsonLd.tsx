import { getServerSideURL } from '@/utilities/getURL'
import { SITE_NAME } from '@/utilities/site'

/**
 * Site-wide Organization + WebSite JSON-LD (English, single domain).
 */
export function SiteJsonLd() {
  const base = getServerSideURL().replace(/\/$/, '')

  const organization = {
    '@context': 'https://schema.org',
    '@id': `${base}/#organization`,
    '@type': 'Organization',
    logo: `${base}/logo.jpeg`,
    name: SITE_NAME,
    sameAs: [
      'https://www.instagram.com/mixie_kadai',
      'https://www.facebook.com/share/18cTEreLXk/?mibextid=wwXIfr',
    ],
    url: base,
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    publisher: { '@id': `${base}/#organization` },
    url: base,
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
        type="application/ld+json"
      />
    </>
  )
}
