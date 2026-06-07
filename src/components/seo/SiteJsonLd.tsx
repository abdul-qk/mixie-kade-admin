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
    url: base,
    telephone: '+94776952531',
    email: 'mixiekadai@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '771 Jaffna-Kankesanturai Rd',
      addressLocality: 'Jaffna',
      postalCode: '40000',
      addressCountry: 'LK',
    },
    sameAs: [
      'https://www.instagram.com/mixie_kadai',
      'https://www.facebook.com/share/18cTEreLXk/?mibextid=wwXIfr',
    ],
  }

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: base,
    publisher: { '@id': `${base}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${base}/shop?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }

  const localBusiness = {
    '@context': 'https://schema.org',
    '@id': `${base}/#localbusiness`,
    '@type': 'Store',
    name: SITE_NAME,
    url: base,
    telephone: '+94776952531',
    email: 'mixiekadai@gmail.com',
    image: `${base}/logo.jpeg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '771 Jaffna-Kankesanturai Rd',
      addressLocality: 'Jaffna',
      postalCode: '40000',
      addressCountry: 'LK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 9.6747,
      longitude: 80.0166,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:30',
      },
    ],
    sameAs: [
      'https://www.instagram.com/mixie_kadai',
      'https://www.facebook.com/share/18cTEreLXk/?mibextid=wwXIfr',
    ],
    parentOrganization: { '@id': `${base}/#organization` },
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
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }}
        type="application/ld+json"
      />
    </>
  )
}
