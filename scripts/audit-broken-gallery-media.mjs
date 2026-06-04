/**
 * Find products whose Payload gallery points at missing `/api/media/file/…` assets.
 *
 * Usage:
 *   node scripts/audit-broken-gallery-media.mjs
 *   node scripts/audit-broken-gallery-media.mjs --url https://www.mixiekadai.lk
 *   SITE_URL=http://localhost:3000 node scripts/audit-broken-gallery-media.mjs
 *
 * Options:
 *   --url <origin>     Site to check (default: SITE_URL or NEXT_PUBLIC_SERVER_URL or production)
 *   --json             Print machine-readable JSON only
 *   --concurrency <n>  Parallel HEAD requests (default: 8)
 */

const args = process.argv.slice(2)

function readArg(name, fallback) {
  const i = args.indexOf(name)
  if (i >= 0 && args[i + 1]) return args[i + 1]
  return fallback
}

const SITE = (
  readArg('--url', null) ||
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  'https://www.mixiekadai.lk'
).replace(/\/$/, '')

const JSON_OUT = args.includes('--json')
const CONCURRENCY = Math.max(1, Number(readArg('--concurrency', '8')) || 8)

function isPayloadMediaPath(url) {
  if (!url) return false
  const t = String(url).trim()
  if (t.startsWith('/api/media/file/')) return true
  try {
    return new URL(t).pathname.startsWith('/api/media/file/')
  } catch {
    return false
  }
}

function toAbsoluteMediaUrl(url) {
  const t = String(url || '').trim()
  if (!t) return ''
  if (/^https?:\/\//i.test(t)) return t
  return `${SITE}${t.startsWith('/') ? t : `/${t}`}`
}

async function fetchAllProducts() {
  const docs = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const res = await fetch(
      `${SITE}/api/products?limit=100&depth=2&page=${page}&where[_status][equals]=published`,
    )
    if (!res.ok) {
      throw new Error(`Products API HTTP ${res.status} ${res.statusText}`)
    }
    const data = await res.json()
    docs.push(...(data.docs || []))
    totalPages = data.totalPages || 1
    page += 1
  }

  return docs
}

async function headOk(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    if (res.status === 405) {
      const getRes = await fetch(url, { method: 'GET', redirect: 'follow' })
      return getRes.ok
    }
    return res.ok
  } catch (err) {
    return false
  }
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length)
  let i = 0

  async function worker() {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx], idx)
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

function collectGalleryMediaUrls(product) {
  const urls = []
  for (const row of product.gallery || []) {
    const image = row?.image
    if (typeof image === 'object' && image?.url && isPayloadMediaPath(image.url)) {
      urls.push({
        mediaId: image.id,
        filename: image.filename,
        path: image.url,
        absolute: toAbsoluteMediaUrl(image.url),
      })
    }
  }

  const meta = product.meta?.image
  if (typeof meta === 'object' && meta?.url && isPayloadMediaPath(meta.url)) {
    urls.push({
      mediaId: meta.id,
      filename: meta.filename,
      path: meta.url,
      absolute: toAbsoluteMediaUrl(meta.url),
      source: 'meta.image',
    })
  }

  return urls
}

async function main() {
  if (!JSON_OUT) {
    console.log(`Auditing gallery media on ${SITE}\n`)
  }

  const products = await fetchAllProducts()
  const checks = []

  for (const product of products) {
    const mediaUrls = collectGalleryMediaUrls(product)
    if (!mediaUrls.length) continue

    const hasUrlField = Boolean(product.images?.some((r) => (r?.url || '').trim()))

    for (const media of mediaUrls) {
      checks.push({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        hasUrlFieldImages: hasUrlField,
        ...media,
      })
    }
  }

  const uniqueByUrl = new Map()
  for (const c of checks) {
    if (!uniqueByUrl.has(c.absolute)) uniqueByUrl.set(c.absolute, c)
  }

  const urlList = [...uniqueByUrl.keys()]
  const statusByUrl = new Map()

  await mapPool(urlList, CONCURRENCY, async (url) => {
    statusByUrl.set(url, await headOk(url))
  })

  const brokenProducts = new Map()

  for (const check of checks) {
    const ok = statusByUrl.get(check.absolute)
    if (ok) continue

    const key = check.slug || String(check.productId)
    if (!brokenProducts.has(key)) {
      brokenProducts.set(key, {
        id: check.productId,
        slug: check.slug,
        title: check.title,
        hasUrlFieldImages: check.hasUrlFieldImages,
        brokenMedia: [],
      })
    }
    const entry = brokenProducts.get(key)
    const row = {
      mediaId: check.mediaId,
      filename: check.filename,
      path: check.path,
      url: check.absolute,
      source: check.source || 'gallery',
    }
    if (!entry.brokenMedia.some((m) => m.url === row.url)) {
      entry.brokenMedia.push(row)
    }
  }

  const report = {
    site: SITE,
    productsScanned: products.length,
    galleryMediaChecked: urlList.length,
    brokenProductCount: brokenProducts.size,
    brokenProducts: [...brokenProducts.values()].sort((a, b) =>
      String(a.slug).localeCompare(String(b.slug)),
    ),
  }

  if (JSON_OUT) {
    console.log(JSON.stringify(report, null, 2))
    process.exit(report.brokenProductCount > 0 ? 1 : 0)
    return
  }

  console.log(`Products scanned: ${report.productsScanned}`)
  console.log(`Unique gallery media URLs checked: ${report.galleryMediaChecked}`)
  console.log(`Products with broken gallery media: ${report.brokenProductCount}\n`)

  if (report.brokenProductCount === 0) {
    console.log('No broken gallery media found.')
    return
  }

  for (const p of report.brokenProducts) {
    const fallback = p.hasUrlFieldImages ? ' (has URL-field images — may still show)' : ' (no URL fallback)'
    console.log(`• [${p.id}] ${p.slug}${fallback}`)
    for (const m of p.brokenMedia) {
      console.log(`    ✗ ${m.path} → ${m.url}`)
    }
    console.log('')
  }

  console.log(
    'Re-upload missing files in Payload admin or run your import scripts, then re-run this audit.',
  )
  process.exit(1)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
