# SEO Audit Report — mixiekadai.lk
**Date:** 2026-06-07  
**Scope:** Full pre-launch audit  
**Site:** https://www.mixiekadai.lk  
**Stack:** Next.js 16 App Router · PayloadCMS 3 · Vercel Blob · SQLite

---

## Overall Score: 58 / 100 — Needs Improvement

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Technical SEO | 48/100 | 25% | 12.0 |
| On-Page SEO | 72/100 | 15% | 10.8 |
| Schema / Structured Data | 55/100 | 15% | 8.3 |
| Content Quality (E-E-A-T) | 62/100 | 20% | 12.4 |
| Image Optimization | 65/100 | 10% | 6.5 |
| Performance (CWV) | Unknown | 10% | — |
| AI Search Readiness (GEO) | 20/100 | 5% | 1.0 |
| **Total** | | | **51.0 / ~85** |

> Performance score excluded (PageSpeed API rate limited during audit). Fix the Critical items first — they block indexing.

---

## Severity Key
| Icon | Severity | Action |
|---|---|---|
| 🔴 | Critical | Blocks indexing or rich results — fix before launch |
| ⚠️ | Warning | Missed ranking opportunity — fix within 2 weeks |
| ✅ | Pass | Meets standard |
| ℹ️ | Info | Informational or low priority |

---

## 1. Technical SEO

### 1.1 robots.txt — 🔴 CRITICAL

**Finding:** `https://www.mixiekadai.lk/robots.txt` returns HTTP **404**.  
**Evidence:** Live HTTP check → `Status: 404`. Next.js error shell returned instead of crawl rules.  
**Root Cause:** `robots.ts` is located at `src/app/(app)/robots.ts`. While route groups should be transparent, testing confirms the file is not being served. It should be moved to `src/app/robots.ts` (top-level, same level as `sitemap.ts`).  
**Impact:** Googlebot and all crawlers operate without any crawl directives. Crawler budget wasted on admin/API routes. Sitemap URL hint not served.  
**Fix:** Move file.

```
src/app/(app)/robots.ts  →  src/app/robots.ts
```

No code changes needed inside the file — just the path.

---

### 1.2 Favicon files missing — 🔴 CRITICAL

**Finding:** `layout.tsx` references `/favicon.ico` and `/favicon.svg` but neither file exists in `public/`.  
**Evidence:**
- `/favicon.ico` → HTTP 404 (23 KB error page returned)
- `/favicon.svg` → HTTP 404
- `public/` directory contains only: `hero-bg.mp4`, `logo.jpeg`, `media/`, `owner.png`, `reviews/`, `shop/`, `spare-parts.pdf`

**Impact:** Browser tab shows no icon. Mobile bookmarks show blank icon. Minor trust signal to users.  
**Fix:** Create `public/favicon.ico` (32×32 px) and `public/favicon.svg` from the logo. Also add `public/apple-touch-icon.png` (180×180 px) — not referenced in layout but needed for iOS.

---

### 1.3 robots.ts — AI crawler rules missing — ⚠️ Warning

**Finding:** Once robots.txt is fixed, it will only contain a single `User-Agent: *` block. No AI-specific crawler rules.  
**Evidence:** `src/app/(app)/robots.ts` — one rule, `userAgent: '*'`.  
**Impact:** GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended can crawl and train on content without explicit consent/direction. Also a GEO (AI search) readiness gap.  
**Fix:** Add explicit AI crawler rules (allow all, or selectively manage):

```ts
rules: [
  {
    allow: '/',
    disallow: ['/api/', '/admin'],
    userAgent: '*',
  },
  // Allow AI crawlers so content appears in AI search answers
  { userAgent: 'GPTBot', allow: '/' },
  { userAgent: 'ClaudeBot', allow: '/' },
  { userAgent: 'PerplexityBot', allow: '/' },
  { userAgent: 'Google-Extended', allow: '/' },
  { userAgent: 'Applebot-Extended', allow: '/' },
],
```

---

### 1.4 Apex → WWW redirect is 307 (Temporary) — ⚠️ Warning

**Finding:** `https://mixiekadai.lk` redirects to `https://www.mixiekadai.lk/` with HTTP **307** (temporary).  
**Evidence:** Live check → `apex chain: [(307, 'https://www.mixiekadai.lk/')] -> https://www.mixiekadai.lk/`  
**Root Cause:** Vercel handles the apex redirect at CDN level (before Next.js), defaulting to 307. The `permanent: true` in `redirects.ts` is irrelevant because Next.js never sees the apex request.  
**Impact:** Search engines treating the redirect as temporary may re-evaluate it periodically. Not permanently consolidating PageRank.  
**Fix:** In Vercel Dashboard → Domains → configure `mixiekadai.lk` to redirect to `www.mixiekadai.lk` permanently (Vercel sets 301/308).

---

### 1.5 sitemap.xml — ✅ Pass

- Returns HTTP 200
- 88 URLs: 71 products, 6 categories, 11 static pages
- Includes `lastModified`, `changeFrequency`, `priority`
- Products at `priority: 0.78`, categories at `0.85`, homepage at `1.0`

---

### 1.6 Canonical tags — ✅ Pass

All pages checked use `canonicalUrl()` utility returning absolute URLs with `https://www.mixiekadai.lk`. Consistent.

---

### 1.7 Noindex on private pages — ✅ Pass

- `/cart` → `noindex, nofollow` ✅
- `/account` → `noindex, nofollow` ✅
- `/checkout` → `noindex, nofollow` ✅
- `/shop?q=*` (search) → `noindex, follow` ✅

---

### 1.8 `lang` attribute — ✅ Pass

`<html lang="en">` set in root layout. Consider `lang="ta"` alternate for Tamil content if added later.

---

### 1.9 Font loading — ✅ Pass

`display: 'swap'` set on Cormorant Garamond and DM Sans. No render-blocking fonts.

---

## 2. On-Page SEO

### 2.1 Product pages — missing meta description — 🔴 CRITICAL

**Finding:** Products without `meta.description` set in Payload admin output **no meta description tag**.  
**Evidence:** Live check on `/products/supermix-the-affordable-mixer-grinder` → `DESC: MISSING`.  
**Root Cause:** In `products/[slug]/page.tsx`:
```ts
const description = product.meta?.description || ''
// → description = '' for products with no admin-set description
return { description, ... }
// → Next.js omits the <meta name="description"> for empty string
```
The fallback `metaDesc` string used in JSON-LD is **not** used in the page `<Metadata>`.  
**Impact:** Every product page without manually entered meta description gets no meta description. Google writes its own snippets — often poor ones for product pages. Affects CTR.  
**Fix:**

```ts
// products/[slug]/page.tsx — generateMetadata
const description =
  product.meta?.description?.trim() ||
  `${product.title} — mixer grinder from Mixie Kadai, Sri Lanka. Islandwide delivery, COD available.`

return {
  ...
  description,
  ...
}
```

---

### 2.2 Homepage title and description — ✅ Pass

- Title: `Sri Lanka's Home for Mixer Grinders` — keyword-rich, unique, 45 chars ✅
- Description: `Shop 20+ mixer grinder models, genuine spare parts, and kitchen accessories. Islandwide delivery from Jaffna, Sri Lanka.` — 121 chars, CTA-oriented ✅

---

### 2.3 Title template — ✅ Pass

`%s | Mixie Kadai` applied consistently. All audited pages have unique, descriptive titles.

---

### 2.4 Shop category metadata — ✅ Pass

`/shop/mixer-grinders`:
- Title: `Mixer Grinders — Shop | Mixie Kadai` ✅
- Description: `Buy Mixer Grinders in Sri Lanka — genuine products, COD, islandwide delivery from Mixie Kadai, Jaffna.` ✅

---

### 2.5 Open Graph image — ⚠️ Warning

**Finding:** Most pages have **no OG image**. The `mergeOpenGraph` utility sets a fallback of `logo.jpeg`, but only pages that call `mergeOpenGraph()` benefit from it. The root layout metadata has no image.  
**Evidence:**
- `/about` → `og:image: MISSING`
- Homepage → no `og:image` found
- Products → OG image pulled from product image URLs (often external domains like `sujataappliances.com`)

**Impact:** Social shares (Facebook, WhatsApp, LinkedIn) show no preview image for most pages. Twitter shows `summary` card (small), not `summary_large_image`.

**Fix:** Create a proper 1200×630 OG image (`public/og-default.jpg`) and add to root layout:
```ts
// src/app/(app)/layout.tsx
export const metadata: Metadata = {
  ...
  openGraph: {
    ...
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Mixie Kadai — Mixer Grinders Sri Lanka' }],
  },
}
```

---

### 2.6 Twitter card — ⚠️ Warning

**Finding:** Twitter card is `summary` (small image). Code configures `summary_large_image` only when `TWITTER_CREATOR` and `TWITTER_SITE` env vars are set.  
**Evidence:** Live scrape → `twitter:card = summary`.  
**Impact:** Twitter/X shares show small thumbnail instead of large card. Lower CTR from social.  
**Fix:** Decouple twitter:card type from env vars:

```ts
// src/app/(app)/layout.tsx
export const metadata: Metadata = {
  ...
  twitter: {
    card: 'summary_large_image', // Always set
    ...(twitterCreator ? { creator: twitterCreator } : {}),
    ...(twitterSite ? { site: twitterSite } : {}),
  },
}
```

---

### 2.7 H1 tags — ✅ Pass

All audited pages have exactly one `<h1>`. Product pages use `<h1>{product.title}</h1>` ✅.

---

## 3. Schema / Structured Data

### 3.1 Product AggregateRating missing — ⚠️ Warning

**Finding:** Product JSON-LD has no `aggregateRating` property.  
**Evidence:** Live check on product page → `aggregateRating: MISSING`.  
**Context:** The site fetches approved reviews at render time (`product-reviews` collection, status: approved). The data is available but not added to JSON-LD.  
**Impact:** No star ratings visible in Google search results (rich snippets). Significant CTR difference — products with stars typically get 15–30% higher CTR.  
**Fix:** In `products/[slug]/page.tsx`, compute and inject into `productJsonLd`:

```ts
// After fetching reviewsData...
const approvedReviews = reviewsData.docs
const reviewCount = approvedReviews.length
const avgRating = reviewCount
  ? approvedReviews.reduce((sum, r: any) => sum + (r.rating ?? 5), 0) / reviewCount
  : null

const productJsonLd = {
  ...
  ...(avgRating && reviewCount >= 1
    ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: avgRating.toFixed(1),
          reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }
    : {}),
}
```

> Note: Google requires `ratingValue` + `reviewCount` or `ratingCount`. Do NOT show aggregateRating for products with 0 reviews.

---

### 3.2 No LocalBusiness schema — ⚠️ Warning

**Finding:** No `LocalBusiness` (or `Store`) JSON-LD anywhere on the site. The business has a physical address, phone number, and opening hours.  
**Evidence:** Contact page, About page, SiteJsonLd — all checked. No LocalBusiness type found.  
**Impact:** Google can't populate a Knowledge Panel or local pack entry. Contact info not eligible for rich results.  
**Fix:** Add to `SiteJsonLd.tsx` alongside the existing Organization schema:

```ts
const localBusiness = {
  '@context': 'https://schema.org',
  '@id': `${base}/#localbusiness`,
  '@type': 'Store',
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
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 9.6615,   // approximate — update with exact coords
    longitude: 80.0255,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      opens: '09:00',
      closes: '18:30',
    },
  ],
  sameAs: [
    'https://www.instagram.com/mixie_kadai',
    'https://www.facebook.com/share/18cTEreLXk/?mibextid=wwXIfr',
  ],
}
```

---

### 3.3 Organization schema missing contact fields — ⚠️ Warning

**Finding:** `SiteJsonLd.tsx` Organization schema has `name`, `url`, `logo`, `sameAs` only.  
**Missing:** `telephone`, `email`, `address`, `contactPoint`.  
**Fix:** Add to the organization object in `SiteJsonLd.tsx`:

```ts
const organization = {
  ...
  telephone: '+94776952531',
  email: 'mixiekadai@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '771 Jaffna-Kankesanturai Rd',
    addressLocality: 'Jaffna',
    postalCode: '40000',
    addressCountry: 'LK',
  },
}
```

---

### 3.4 WebSite schema missing SearchAction — ℹ️ Info

**Finding:** `WebSite` JSON-LD has no `potentialAction` (Sitelinks Searchbox).  
**Impact:** Google may not show a search box within the sitelink for the site. Low priority for an e-commerce site with few pages.  
**Fix (optional):**
```ts
const website = {
  ...
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${base}/shop?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
}
```

---

### 3.5 No Article schema on guide pages — ⚠️ Warning

**Finding:** `/guides/how-to-choose-mixer-grinder-sri-lanka` has no JSON-LD. No `Article` or `BlogPosting` schema.  
**Impact:** Guide content not eligible for article rich results. No `datePublished`/`dateModified` signals to Google.  
**Fix:** Add to the guide page:

```ts
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Choose a Mixer Grinder in Sri Lanka',
  description: metadata.description,
  url: canonicalUrl('/guides/how-to-choose-mixer-grinder-sri-lanka'),
  datePublished: '2025-01-01',  // actual publish date
  dateModified: new Date().toISOString(),
  author: {
    '@type': 'Person',
    name: 'Hashim Huzefa',
    url: `${base}/about`,
  },
  publisher: { '@id': `${base}/#organization` },
}
```

---

### 3.6 Product schema — priceCurrency fallback bug — ⚠️ Warning

**Finding:** In `products/[slug]/page.tsx`:
```ts
priceCurrency: typeof (product as any).price === 'number' ? 'LKR' : 'USD',
```
If `price` field is not present but `priceInUSD` is used, currency falls to `'USD'`. However products appear to sell in LKR. A USD currency with an LKR price amount would fail Google's structured data validation.  
**Fix:** Default to `'LKR'` unless confirmed USD:
```ts
priceCurrency: typeof product.priceInUSD === 'number' ? 'USD' : 'LKR',
```

---

### 3.7 Product and Breadcrumb schema — ✅ Pass

Product pages output:
- `Organization` (from layout) ✅
- `WebSite` (from layout) ✅
- `BreadcrumbList` (Home → Shop → Product) ✅
- `Product` with `Offer` (price, currency, availability, url) ✅

---

## 4. Content Quality (E-E-A-T)

### 4.1 Guide content is thin — ⚠️ Warning

**Finding:** `/guides/how-to-choose-mixer-grinder-sri-lanka` contains ~280 words across 4 short sections.  
**Impact:** For competitive queries like "mixer grinder Sri Lanka" or "best mixer grinder for Sri Lankan kitchen", thin content ranks poorly. Google's E-E-A-T requires demonstrable expertise through substantial, unique content.  
**Fix:** Expand to 800+ words. Add sections: brand comparison table, wattage chart, jar size guide, maintenance tips, price ranges in LKR, specific model recommendations linking to product pages.

---

### 4.2 About page — strong E-E-A-T signals — ✅ Pass

- Owner name + photo + bio (Hashim Huzefa) ✅
- Founding story ✅
- Physical address ✅
- Mission/Vision/Values ✅
- Customer reviews ✅

---

### 4.3 Only 1 guide article — ⚠️ Warning

**Finding:** Guides hub lists 1 article.  
**Impact:** Thin content hub. No topical authority in the mixer grinder / kitchen appliances niche for Sri Lankan queries.  
**Opportunities (high-intent Sri Lankan search queries):**
- "Preethi mixer grinder price in Sri Lanka"
- "mixer grinder spare parts Sri Lanka"
- "best mixer grinder under 10000 in Sri Lanka"
- "mixer grinder repair Jaffna"

---

### 4.4 Contact/About pages are `'use client'` — ℹ️ Info

**Finding:** Both pages are `'use client'` components. Metadata is correctly exported from layout files.  
**Note:** Next.js App Router still SSR-renders `'use client'` components on the server for initial HTML, so content IS indexable. No direct SEO harm. However, the scroll-animation hooks (`useReveal`) add JavaScript dependency for visual presentation.

---

### 4.5 Spare parts page is thin — ⚠️ Warning

**Finding:** `/spare-parts` has ~80 words of body text plus a PDF iframe. No structured list of parts, no product links, no brand names.  
**Impact:** Low value for queries like "Preethi mixer jar Sri Lanka" or "mixer grinder blade replacement".  
**Fix:** Add a proper parts category landing page or link to `/shop/spare-parts` category. Replace the PDF-only approach with an HTML parts catalogue (crawlable).

---

## 5. Image Optimization

### 5.1 OG images from external domains — ⚠️ Warning

**Finding:** Product OG images are pulled from manufacturer URLs (e.g., `https://sujataappliances.com/...`). These are URL-field images stored in Payload.  
**Evidence:** `/products/supermix-the-affordable-mixer-grinder` → `og:image: https://sujataappliances.com/wp-content/...`  
**Impact:** If the external URL goes down, the OG image breaks. Google may also give less trust to OG images from third-party domains.  
**Fix:** Ensure products use Vercel Blob-hosted images (already configured via `@payloadcms/storage-vercel-blob`) as the primary media. Use `meta.image` in Payload admin for each product.

---

### 5.2 No dedicated OG/social image — ⚠️ Warning

See section 2.5. Most pages have no OG image at all.

---

### 5.3 `apple-touch-icon` missing — ⚠️ Warning

**Finding:** No `<link rel="apple-touch-icon">` in layout.tsx. No `public/apple-touch-icon.png`.  
**Fix:** Add `public/apple-touch-icon.png` (180×180 px) and:
```tsx
<link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
```

---

### 5.4 Alt text on pages — ✅ Pass

All `<Image>` components in About, Homepage, etc., use descriptive alt text:
- `"Mixie Kadai retail store — mixer grinders and spare parts on display in Jaffna"` ✅
- `"Hashim Huzefa, owner of Mixie Kadai"` ✅

---

### 5.5 Next.js Image component used throughout — ✅ Pass

`next/image` with `fill`, `sizes`, and quality settings used for all images. Automatic WebP conversion and responsive sizing active.

---

## 6. Performance (Core Web Vitals)

PageSpeed API was rate-limited during this audit. No CWV data collected.

**Known risks to investigate:**
- Hero video (`hero-bg.mp4`) — autoplay video above the fold is a common LCP blocker
- `'use client'` pages with `useReveal` animation hooks add JS weight
- `@payloadcms/next` bundle may add overhead

**Recommendation:** Run PageSpeed Insights manually at https://pagespeed.web.dev/ after launch and target:
- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

---

## 7. AI Search Readiness (GEO)

### 7.1 No `llms.txt` — ⚠️ Warning

**Finding:** `https://www.mixiekadai.lk/llms.txt` returns 404.  
**Impact:** AI search engines (ChatGPT, Perplexity, Claude) have no structured content brief. Reduces chances of appearing in AI-generated answers for "best mixer grinder Sri Lanka" or "mixer grinder spare parts Jaffna".  
**Fix:** Create `public/llms.txt`:

```
# Mixie Kadai
> Sri Lanka's home for mixer grinders, genuine spare parts, and kitchen accessories.
> Based in Jaffna, delivering islandwide since 2020.

## About
Mixie Kadai is a specialist retailer of mixer grinders and kitchen appliances in Sri Lanka.
We stock 20+ models and 50+ genuine spare parts, with islandwide cash-on-delivery.

## Products
- Mixer grinders: /shop/mixer-grinders
- Spare parts: /spare-parts
- All products: /shop

## Guides
- How to Choose a Mixer Grinder in Sri Lanka: /guides/how-to-choose-mixer-grinder-sri-lanka
```

---

## 8. What's Already Good ✅

| Area | Status |
|---|---|
| Sitemap generation (88 URLs, products + categories) | ✅ |
| Canonical URLs — absolute, consistent | ✅ |
| noindex on cart, account, checkout, search results | ✅ |
| Title template `%s | Mixie Kadai` | ✅ |
| H1 on every page | ✅ |
| Breadcrumb JSON-LD on product pages | ✅ |
| Product availability in schema (InStock/OutOfStock) | ✅ |
| Font swap (display: swap) | ✅ |
| `next/image` with alt text throughout | ✅ |
| Apex → WWW redirect exists (needs to be made permanent) | ✅ |
| `@payloadcms/plugin-seo` for per-product meta in admin | ✅ |
| `metadataBase` set correctly | ✅ |
| Vercel Analytics installed | ✅ |
| `reactStrictMode: true` | ✅ |

---

## Environment Notes

- PageSpeed Insights API rate limited — CWV not measured
- robots.txt confirmed 404 on live site
- All other HTTP checks successful (200 responses for all public pages tested)
- No broken links found during navigation checks
