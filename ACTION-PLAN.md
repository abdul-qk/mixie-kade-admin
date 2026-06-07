# SEO Action Plan — mixiekadai.lk
**Generated:** 2026-06-07  
**Target:** Basic SEO standard before launch

Items ordered by impact × effort. Fix **Phase 1** before going live.

---

## Phase 1 — Fix Before Launch (Blockers)

### P1-1 🔴 Move `robots.ts` to root app directory

**File:** `src/app/(app)/robots.ts` → `src/app/robots.ts`  
**Effort:** 2 min  
**Why:** robots.txt currently returns 404. Googlebot has no crawl directives.

```bash
# From project root
mv src/app/\(app\)/robots.ts src/app/robots.ts
```

No content changes needed.

---

### P1-2 🔴 Fix product meta description fallback

**File:** `src/app/(app)/products/[slug]/page.tsx`  
**Effort:** 5 min  
**Why:** Products without admin-set `meta.description` output no `<meta name="description">`.

Change in `generateMetadata`:
```ts
// BEFORE
const description = product.meta?.description || ''

// AFTER
const description =
  product.meta?.description?.trim() ||
  `${product.title} — mixer grinder from Mixie Kadai, Sri Lanka. Islandwide delivery, COD available.`
```

---

### P1-3 🔴 Create favicon files

**Files to create:** `public/favicon.ico`, `public/favicon.svg`, `public/apple-touch-icon.png`  
**Effort:** 15 min  
**Why:** Browser tabs show no icon. Referenced in layout but files missing.

Steps:
1. Export logo as 32×32px ICO → `public/favicon.ico`
2. Export logo as SVG → `public/favicon.svg`
3. Export logo as 180×180px PNG → `public/apple-touch-icon.png`
4. Add to `src/app/(app)/layout.tsx` `<head>`:
   ```tsx
   <link href="/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
   ```

---

### P1-4 🔴 Fix Twitter card type (decouple from env vars)

**File:** `src/app/(app)/layout.tsx`  
**Effort:** 3 min  
**Why:** Twitter shows `summary` (small) card instead of `summary_large_image`.

```ts
// BEFORE — twitter block only added when env vars exist
...(twitterCreator && twitterSite ? { twitter: { card: 'summary_large_image', ... } } : {})

// AFTER — always set card type; conditionally add creator/site
twitter: {
  card: 'summary_large_image',
  ...(twitterCreator ? { creator: twitterCreator } : {}),
  ...(twitterSite ? { site: twitterSite } : {}),
},
```

---

### P1-5 🔴 Create default OG image

**File:** `public/og-default.jpg` (new) + update `src/app/(app)/layout.tsx`  
**Effort:** 20 min (design) + 5 min (code)  
**Why:** Most pages have no OG image. Social shares show blank previews.

1. Design a 1200×630px image: Mixie Kadai logo + tagline on brand-navy background.
2. Save as `public/og-default.jpg`.
3. Add to root layout metadata:
   ```ts
   openGraph: {
     locale: 'en_LK',
     siteName: SITE_NAME,
     type: 'website',
     url: '/',
     images: [{
       url: '/og-default.jpg',
       width: 1200,
       height: 630,
       alt: 'Mixie Kadai — Mixer Grinders & Spare Parts Sri Lanka',
     }],
   },
   ```

---

### P1-6 ⚠️ Fix apex redirect to permanent (Vercel Dashboard)

**Location:** Vercel Dashboard → Project → Settings → Domains  
**Effort:** 2 min  
**Why:** Apex (`mixiekadai.lk`) redirects to www with HTTP 307 (temporary). Should be 301/308 permanent to consolidate PageRank.

Steps:
1. Vercel Dashboard → your project → Settings → Domains
2. For `mixiekadai.lk`, ensure redirect to `www.mixiekadai.lk` is set to **permanent (308)**

---

## Phase 2 — First Week After Launch

### P2-1 ⚠️ Add LocalBusiness schema

**File:** `src/components/seo/SiteJsonLd.tsx`  
**Effort:** 15 min  
**Why:** Physical store. Missing local SEO structured data (Knowledge Panel, local pack).

Add `Store` JSON-LD block (see full example in `FULL-AUDIT-REPORT.md` §3.2). Key fields:
- `@type: 'Store'`
- `telephone`, `email`, `address`
- `openingHoursSpecification` (Mon–Sat 09:00–18:30)
- `geo` (exact GPS coords from Google Maps)

---

### P2-2 ⚠️ Add AggregateRating to Product schema

**File:** `src/app/(app)/products/[slug]/page.tsx`  
**Effort:** 20 min  
**Why:** Reviews exist in DB but not in JSON-LD → no star ratings in Google SERPs.

Compute after `reviewsData` is fetched (see full snippet in `FULL-AUDIT-REPORT.md` §3.1). Only emit when `reviewCount >= 1`.

---

### P2-3 ⚠️ Add Organization contact fields to SiteJsonLd

**File:** `src/components/seo/SiteJsonLd.tsx`  
**Effort:** 5 min  
**Why:** Organization schema missing telephone, email, address.

```ts
const organization = {
  ...existing fields...
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

### P2-4 ⚠️ Add Article schema to guide pages

**File:** `src/app/(app)/guides/how-to-choose-mixer-grinder-sri-lanka/page.tsx`  
**Effort:** 10 min  
**Why:** No structured data on content pages. Missing article rich results.

See `FULL-AUDIT-REPORT.md` §3.5 for full JSON-LD snippet.

---

### P2-5 ⚠️ Add `llms.txt` for AI search readiness

**File:** `public/llms.txt` (new)  
**Effort:** 10 min  
**Why:** AI crawlers (ChatGPT, Perplexity, Claude) have no structured brief. Affects AI-answer inclusion.

See full template in `FULL-AUDIT-REPORT.md` §7.1.

---

### P2-6 ⚠️ Add explicit AI crawler rules to robots.ts

**File:** `src/app/robots.ts` (after P1-1 move)  
**Effort:** 5 min  
**Why:** Explicit allow for AI crawlers improves GEO (AI search) inclusion.

See snippet in `FULL-AUDIT-REPORT.md` §1.3.

---

### P2-7 ⚠️ Fix Product priceCurrency fallback

**File:** `src/app/(app)/products/[slug]/page.tsx`  
**Effort:** 2 min  
**Why:** If `price` field absent, currency defaults to `'USD'` which is wrong for LKR products. Fails structured data validation.

```ts
// BEFORE
priceCurrency: typeof (product as any).price === 'number' ? 'LKR' : 'USD',

// AFTER
priceCurrency: typeof product.priceInUSD === 'number' ? 'USD' : 'LKR',
```

---

### P2-8 ⚠️ Set up Google Search Console

**Effort:** 10 min  
**Why:** Can't monitor indexing, crawl errors, or Core Web Vitals without GSC.

Steps:
1. https://search.google.com/search-console → Add Property → `https://www.mixiekadai.lk`
2. Verify via HTML meta tag — add to `layout.tsx`:
   ```ts
   verification: { google: 'YOUR_VERIFICATION_CODE' }
   ```
3. Submit sitemap: `https://www.mixiekadai.lk/sitemap.xml`

---

## Phase 3 — Within 1 Month

### P3-1 ⚠️ Expand guide content

**File:** `src/app/(app)/guides/how-to-choose-mixer-grinder-sri-lanka/page.tsx`  
**Effort:** 1–2 hours (writing)  
**Why:** ~280 words won't rank for competitive informational queries. Target 800+ words.

Add sections:
- Brand comparison table (Preethi, Butterfly, Sujata, Akita, etc.)
- Wattage guide (500W / 750W / 900W+ for Sri Lankan cooking)
- Price ranges in LKR
- What to look for in spare parts availability
- Internal links to specific product categories

---

### P3-2 ⚠️ Expand spare parts page

**File:** `src/app/(app)/spare-parts/page.tsx`  
**Effort:** 30 min  
**Why:** ~80 words + PDF only. Not crawlable by Google (PDF content partially indexed).

Replace PDF-primary approach with HTML parts list. Link to shop categories for parts.

---

### P3-3 ⚠️ Add WebSite SearchAction (Sitelinks Searchbox)

**File:** `src/components/seo/SiteJsonLd.tsx`  
**Effort:** 5 min  
**Why:** Enables Sitelinks Searchbox in Google branded results.

See snippet in `FULL-AUDIT-REPORT.md` §3.4.

---

### P3-4 ℹ️ Add more guide articles

**Target:** 3–5 guides covering high-intent Sri Lankan queries  
**Effort:** 2–4 hours per article

Priority queries:
1. "Preethi mixer grinder price in Sri Lanka" → product-focused buying guide
2. "mixer grinder spare parts Sri Lanka" → parts guide linking to spare parts
3. "best mixer grinder for small family Sri Lanka" → comparison article
4. "mixer grinder maintenance tips" → evergreen how-to

---

### P3-5 ℹ️ Investigate Core Web Vitals

Run PageSpeed Insights after launch:
- https://pagespeed.web.dev/?url=https://www.mixiekadai.lk
- Focus: LCP (hero video may be slow), CLS (font/image loading), INP

Key risk: `hero-bg.mp4` autoplay video — consider a static image fallback for initial paint.

---

## Quick Reference — File Checklist

| File | Change |
|---|---|
| `src/app/robots.ts` | Move from `(app)/robots.ts` — **P1-1** |
| `src/app/(app)/products/[slug]/page.tsx` | Description fallback — **P1-2** |
| `src/app/(app)/products/[slug]/page.tsx` | AggregateRating — **P2-2** |
| `src/app/(app)/products/[slug]/page.tsx` | priceCurrency fix — **P2-7** |
| `src/app/(app)/layout.tsx` | Twitter card, OG image — **P1-4, P1-5** |
| `src/components/seo/SiteJsonLd.tsx` | LocalBusiness, Organization contact, SearchAction — **P2-1, P2-3, P3-3** |
| `src/app/(app)/guides/how-to-choose-mixer-grinder-sri-lanka/page.tsx` | Article schema, expand content — **P2-4, P3-1** |
| `public/favicon.ico` | Create — **P1-3** |
| `public/favicon.svg` | Create — **P1-3** |
| `public/apple-touch-icon.png` | Create — **P1-3** |
| `public/og-default.jpg` | Create — **P1-5** |
| `public/llms.txt` | Create — **P2-5** |
| Vercel Dashboard | Permanent apex redirect — **P1-6** |
| Google Search Console | Verify + submit sitemap — **P2-8** |
