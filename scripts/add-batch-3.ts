/**
 * add-batch-3.ts
 *
 * Scrapes 30 Preethi, Prestige, Sujata, and Sumeet mixer grinder products.
 * Prices are taken from the PRODUCT_URLS list below — NOT from the scraped page.
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json scripts/add-batch-3.ts
 */

import dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env') })

import { chromium, type Page } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MEDIA_DIR = path.resolve(__dirname, '../public/media')
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true })

// ─── Product list (price in LKR, from user specification) ─────────────────────

const PRODUCT_URLS: { url: string; price: number }[] = [
  { url: 'https://www.amazon.in/Preethi-Extractor-Warranty-Acrylonitrile-Butadiene/dp/B08N6CKD87?th=1', price: 26750 },
  { url: 'https://maxbo.lk/product/preethi-blue-leaf-platinum/', price: 29750 },
  { url: 'https://maxbo.lk/product/preethi-crown-mixer-grinder/', price: 12750 },
  { url: 'https://maxbo.lk/product/preethi-crown-plus-mixer-grinder/', price: 19750 },
  { url: 'https://www.amazon.in/Preethi-grinder-Technology-grinding-Storage/dp/B08N6FVGW3?th=1', price: 39750 },
  { url: 'https://stopnshop.lk/product/preethi-galaxy-750w-mixer-grinder-mg225/', price: 22750 },
  { url: 'https://www.shop.preethi.in/products/preethi-peeppy-pro-mg-247', price: 34750 },
  { url: 'https://www.amazon.in/Preethi-Prime-Grinder-Kitchen-MG-286/dp/B08N6G4MJM', price: 19750 },
  { url: 'https://maxbo.lk/product/preethi-steel-supreme-mg-208/', price: 32750 },
  { url: 'https://www.shop.preethi.in/products/preethi-taurus-plus-1000-w-mg257', price: 36750 },
  { url: 'https://maxbo.lk/product/preethi-titan-mixer-grinder-1000w/', price: 29750 },
  { url: 'https://www.shop.preethi.in/products/preethi-xpro-duo-mg-198', price: 47500 },
  { url: 'https://www.shop.preethi.in/products/preethi-zodiac-2-0-1000w-mg255', price: 64500 },
  { url: 'https://www.shop.preethi.in/products/preethi-zodiac-black-mg261', price: 38750 },
  { url: 'https://www.shop.preethi.in/products/preethi-zodiac-glitter-mg-264', price: 39750 },
  { url: 'https://www.shop.preethi.in/products/preethi-zodiac-stardust-mg-265', price: 39750 },
  { url: 'https://shop.ttkprestige.com/prestige-grace-750w-mixer-grinder-with-stainless-steel-jars-3-unit.html', price: 19800 },
  { url: 'https://shop.ttkprestige.com/prestige-nakshatra-v2-mixer-grinder-550w-with-3-stainless-steel-jars.html', price: 17800 },
  { url: 'https://shop.ttkprestige.com/prestige-prism-mixer-grinder-with-3-stainless-steel-jars-1-juicer-jar.html', price: 25800 },
  { url: 'https://shop.ttkprestige.com/prestige-regal-750w-mixer-grinder-with-3-stainless-steel-jars-appealing-design-black-and-red.html', price: 19800 },
  { url: 'https://shop.ttkprestige.com/prestige-regal-750-juicer-mixer-grinder-4-jars-red-and-black.html', price: 23800 },
  { url: 'https://sujataappliances.com/product/frootmix-the-smart-mixer-blender/', price: 29800 },
  { url: 'https://sujataappliances.com/product/dynamix-the-smart-choice-for-grinding/', price: 36800 },
  { url: 'https://sujataappliances.com/product/supermix-the-specialist-mixer-grinder/', price: 32800 },
  { url: 'https://supersavings.lk/shop-products/sumeet-alexa-mixer-grinder/', price: 19500 },
  { url: 'https://supersavings.lk/shop-products/sumeet-avion-mixer-grinder/', price: 17500 },
  { url: 'https://supersavings.lk/shop-products/sumeet-domestic-dxe-plus-mixer-grinder/', price: 29500 },
  { url: 'https://www.amazon.in/Sumeet-Traditional-Hotel-Grinder-Stainless/dp/B0DV4NMB77', price: 39500 },
  { url: 'https://supersavings.lk/shop-products/sanghini-sumeet-traditional-mixer-grinder/', price: 23500 },
  { url: 'https://bigdeals.lk/blendersngrinders/bdlsumeet-mixer-grinder-900w-zenith', price: 29500 },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScrapedProduct {
  title: string
  brand: string
  description: string
  features: string[]
  imageUrls: string[]
  wattage?: number
  jars?: number
  warranty?: string
}

// ─── Lexical helper ───────────────────────────────────────────────────────────

function toLexicalRichText(text: string) {
  return {
    root: {
      type: 'root', version: 1, direction: null, format: '', indent: 0,
      children: [{
        type: 'paragraph', version: 1, direction: null, format: '', indent: 0,
        textFormat: 0, textStyle: '',
        children: [{ type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text }],
      }],
    },
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function extFromUrl(url: string): string {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase().split('?')[0]
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'].includes(ext) ? ext : '.jpg'
  } catch { return '.jpg' }
}

function parseWattage(text: string): number | undefined {
  const m = text.match(/(\d{3,4})\s*[Ww](?:atts?)?/)
  return m ? parseInt(m[1]) : undefined
}

function parseJars(text: string): number | undefined {
  const m = text.match(/(\d+)\s*[Jj]ar/)
  return m ? parseInt(m[1]) : undefined
}

function inferBrand(title: string, host: string): string {
  const brands = [
    'Preethi', 'Prestige', 'Sujata', 'Sumeet',
    'Bajaj', 'Butterfly', 'Greenchef', 'Orange', 'Panasonic', 'National', 'Pigeon', 'Akita',
  ]
  for (const b of brands) {
    if (title.toLowerCase().includes(b.toLowerCase())) return b
  }
  if (host.includes('preethi')) return 'Preethi'
  if (host.includes('prestige') || host.includes('ttkprestige')) return 'Prestige'
  if (host.includes('sujata')) return 'Sujata'
  return title.split(/\s+/)[0]
}

// ─── Site Scrapers ────────────────────────────────────────────────────────────

async function scrapeAmazon(page: Page, url: string): Promise<ScrapedProduct> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(3000)

  const title = await page.locator('#productTitle').textContent().then(t => t?.trim() ?? 'Unknown')

  const features: string[] = []
  const bulletItems = page.locator('#feature-bullets .a-list-item')
  const count = await bulletItems.count()
  for (let i = 0; i < Math.min(count, 8); i++) {
    const text = await bulletItems.nth(i).textContent()
    if (text?.trim()) features.push(text.trim())
  }

  const imageUrls: string[] = []
  const mainImg = page.locator('#landingImage, #imgBlkFront').first()
  if (await mainImg.count() > 0) {
    const src = await mainImg.getAttribute('src')
    if (src) imageUrls.push(src.replace(/\._[A-Z0-9_,]+_\./, '.'))
  }
  const thumbImgs = page.locator('#altImages .a-button-thumbnail img')
  const thumbCount = await thumbImgs.count()
  for (let i = 0; i < Math.min(thumbCount, 3); i++) {
    const src = await thumbImgs.nth(i).getAttribute('src')
    if (src && !src.includes('play-button')) {
      imageUrls.push(src.replace(/\._[A-Z0-9_,]+_\./, '.'))
    }
  }

  let wattage: number | undefined
  let jars: number | undefined
  let warranty: string | undefined

  const specRows = page.locator('#productDetails_techSpec_section_1 tr, #productDetails_db_sections tr, .product-facts-detail tr')
  const rowCount = await specRows.count()
  for (let i = 0; i < rowCount; i++) {
    const th = await specRows.nth(i).locator('th, td:first-child').textContent()
    const td = await specRows.nth(i).locator('td:last-child').textContent()
    const key = (th ?? '').toLowerCase()
    const val = (td ?? '').trim()
    if (key.includes('watt') && !wattage) wattage = parseWattage(val)
    if (key.includes('jar') && !jars) jars = parseJars(val)
    if (key.includes('warrant') && !warranty) warranty = val
  }

  if (!wattage) wattage = parseWattage(title + ' ' + features.join(' '))
  if (!jars) jars = parseJars(title + ' ' + features.join(' '))

  return {
    title,
    brand: inferBrand(title, new URL(url).hostname),
    description: features.slice(0, 3).join('. '),
    features,
    imageUrls,
    wattage,
    jars,
    warranty,
  }
}

async function scrapeShopify(page: Page, url: string): Promise<ScrapedProduct> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2000)

  let title = 'Unknown'
  for (const sel of ['h1.product__title', 'h1.product-title', '.product__title h1', 'h1']) {
    const el = page.locator(sel).first()
    if (await el.count() > 0) {
      title = (await el.textContent())?.trim() ?? 'Unknown'
      if (title && title !== 'Unknown') break
    }
  }

  const features: string[] = []
  for (const sel of [
    '.product__description ul li', '.product-single__description ul li',
    '.product-description ul li', '.rte ul li', '.description ul li',
  ]) {
    const els = page.locator(sel)
    const c = await els.count()
    if (c > 0) {
      for (let i = 0; i < Math.min(c, 10); i++) {
        const t = await els.nth(i).textContent()
        if (t?.trim()) features.push(t.trim())
      }
      break
    }
  }

  let description = features.slice(0, 3).join('. ')
  if (!description) {
    for (const sel of ['.product__description p', '.product-single__description p', '.rte p']) {
      const el = page.locator(sel).first()
      if (await el.count() > 0) {
        description = (await el.textContent())?.trim() ?? ''
        if (description) break
      }
    }
  }

  const imageUrls: string[] = []
  for (const sel of [
    '.product__media img', '.product-single__photos img',
    '.product__photo img', '[data-product-featured-media] img',
    '.product-gallery__image img',
  ]) {
    const els = page.locator(sel)
    const c = await els.count()
    if (c > 0) {
      for (let i = 0; i < Math.min(c, 4); i++) {
        const src = await els.nth(i).getAttribute('src') ??
                    await els.nth(i).getAttribute('data-src')
        if (src && !src.includes('placeholder') && !src.includes('logo')) {
          const clean = src.startsWith('//') ? `https:${src}` : src
          if (!imageUrls.includes(clean)) imageUrls.push(clean)
        }
      }
      if (imageUrls.length > 0) break
    }
  }

  return {
    title,
    brand: inferBrand(title, new URL(url).hostname),
    description,
    features,
    imageUrls,
    wattage: parseWattage(title + ' ' + features.join(' ')),
    jars: parseJars(title + ' ' + features.join(' ')),
  }
}

async function scrapeWooCommerce(page: Page, url: string): Promise<ScrapedProduct> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2000)

  const title = await page.locator('h1.product_title, h1.entry-title').first().textContent().then(t => t?.trim() ?? 'Unknown')

  const features: string[] = []
  const liEls = page.locator('.woocommerce-product-details__short-description ul li, .entry-content ul li, .product-description ul li')
  const liCount = await liEls.count()
  for (let i = 0; i < Math.min(liCount, 10); i++) {
    const text = await liEls.nth(i).textContent()
    if (text?.trim()) features.push(text.trim())
  }

  const desc = await page.locator('.woocommerce-product-details__short-description p, .entry-summary p').first().textContent().catch(() => '') ?? features.join('. ')

  const imageUrls: string[] = []
  const imgs = page.locator('.woocommerce-product-gallery img')
  const imgCount = await imgs.count()
  for (let i = 0; i < Math.min(imgCount, 4); i++) {
    const src = await imgs.nth(i).getAttribute('data-large_image') ?? await imgs.nth(i).getAttribute('src')
    if (src && !src.includes('placeholder')) imageUrls.push(src)
  }

  return {
    title,
    brand: inferBrand(title, new URL(url).hostname),
    description: desc.trim() || features.slice(0, 3).join('. '),
    features,
    imageUrls,
    wattage: parseWattage(title + ' ' + features.join(' ')),
    jars: parseJars(title + ' ' + features.join(' ')),
  }
}

async function scrapeGeneric(page: Page, url: string): Promise<ScrapedProduct> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2000)

  let title = 'Unknown'
  for (const sel of [
    'h1.product__title', 'h1.product-title', 'h1.page-title',
    '.product-details h1', '.product-name h1', '.product_title',
    'h1[itemprop="name"]', '.entry-title', 'h1',
  ]) {
    const el = page.locator(sel).first()
    if (await el.count() > 0) {
      title = (await el.textContent())?.trim() ?? 'Unknown'
      if (title && title !== 'Unknown') break
    }
  }

  const features: string[] = []
  for (const sel of [
    '.product-description ul li', '.woocommerce-product-details__short-description li',
    '.description ul li', '.product__description li', 'ul.product-features li',
    '.product-detail ul li', '.tab-content ul li',
  ]) {
    const els = page.locator(sel)
    const c = await els.count()
    if (c > 0) {
      for (let i = 0; i < Math.min(c, 10); i++) {
        const t = await els.nth(i).textContent()
        if (t?.trim()) features.push(t.trim())
      }
      break
    }
  }

  const imageUrls: string[] = []
  for (const sel of [
    '.product__media img', '.woocommerce-product-gallery img',
    '.product-images img', '[data-fancybox] img', '.product-image img',
    '.product-gallery img', 'img.wp-post-image', '.product-photo img',
    '.MagicZoom img', '.product-img-box img',
  ]) {
    const els = page.locator(sel)
    const c = await els.count()
    if (c > 0) {
      for (let i = 0; i < Math.min(c, 4); i++) {
        const src = await els.nth(i).getAttribute('data-src') ??
                    await els.nth(i).getAttribute('data-large_image') ??
                    await els.nth(i).getAttribute('src')
        if (src && !src.includes('placeholder') && !src.includes('logo')) imageUrls.push(src)
      }
      if (imageUrls.length > 0) break
    }
  }

  const description = features.slice(0, 3).join('. ') ||
    (await page.locator('.product-description p, .description p, .product-detail p').first().textContent().catch(() => '') ?? '')

  return {
    title,
    brand: inferBrand(title, new URL(url).hostname),
    description: description.trim(),
    features,
    imageUrls,
    wattage: parseWattage(title + ' ' + features.join(' ')),
    jars: parseJars(title + ' ' + features.join(' ')),
  }
}

// ─── Route to correct scraper ─────────────────────────────────────────────────

async function scrapeUrl(page: Page, url: string): Promise<ScrapedProduct> {
  const host = new URL(url).hostname
  if (host.includes('amazon.')) return scrapeAmazon(page, url)
  if (host.includes('shop.preethi.in')) return scrapeShopify(page, url)
  if (host.includes('maxbo.lk') || host.includes('stopnshop.lk') ||
      host.includes('sujataappliances.com') || host.includes('supersavings.lk')) {
    return scrapeWooCommerce(page, url)
  }
  return scrapeGeneric(page, url)
}

// ─── Image downloader ─────────────────────────────────────────────────────────

async function downloadImage(url: string, dest: string): Promise<void> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
}

// ─── Payload helpers ──────────────────────────────────────────────────────────

async function findOrCreate(payload: Awaited<ReturnType<typeof getPayload>>, collection: string, title: string): Promise<number> {
  const r = await payload.find({ collection, where: { title: { equals: title } }, limit: 1, overrideAccess: true })
  if (r.docs.length > 0) return r.docs[0].id as number
  const d = await payload.create({ collection, data: { title }, overrideAccess: true })
  return d.id as number
}

async function uploadImages(
  payload: Awaited<ReturnType<typeof getPayload>>,
  productSlug: string,
  imageUrls: string[],
): Promise<number[]> {
  const mediaIds: number[] = []
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i]!
    const ext = extFromUrl(url)
    const filename = `${productSlug}-${i + 1}${ext}`
    const destPath = path.join(MEDIA_DIR, filename)

    process.stdout.write(`    [img ${i + 1}/${imageUrls.length}] Downloading... `)
    try {
      if (!fs.existsSync(destPath)) await downloadImage(url, destPath)
      console.log('ok')
    } catch (err: any) {
      console.log(`FAILED: ${err.message}`)
      continue
    }

    const fileBuffer = fs.readFileSync(destPath)
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
    try {
      const media = await payload.create({
        collection: 'media',
        overrideAccess: true,
        data: { alt: `${productSlug} image ${i + 1}` },
        file: { data: fileBuffer, mimetype: mimeType, name: filename, size: fileBuffer.length },
      })
      mediaIds.push(media.id as number)
    } catch (err: any) {
      console.log(`    ✗ Media create failed: ${err.message}`)
    }
  }
  return mediaIds
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const payload = await getPayload({ config })
const categoryId = await findOrCreate(payload, 'categories', 'Mixer Grinders')
console.log(`\nCategory "Mixer Grinders" id=${categoryId}`)

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 800 },
})
const page = await context.newPage()

const results: { url: string; status: 'ok' | 'failed'; title?: string; error?: string }[] = []

for (const { url, price } of PRODUCT_URLS) {
  console.log(`\n► ${url}`)
  let scraped: ScrapedProduct | null = null

  try {
    scraped = await scrapeUrl(page, url)
    console.log(`  Title:   ${scraped.title}`)
    console.log(`  Price:   ${price} LKR (override)  Brand: ${scraped.brand}  Wattage: ${scraped.wattage ?? '?'}W  Jars: ${scraped.jars ?? '?'}`)
    console.log(`  Images:  ${scraped.imageUrls.length}`)
  } catch (err: any) {
    console.log(`  ✗ Scrape failed: ${err.message}`)
    results.push({ url, status: 'failed', error: err.message })
    continue
  }

  const slug = slugify(scraped.title)
  const brandId = await findOrCreate(payload, 'brands', scraped.brand)
  const mediaIds = await uploadImages(payload, slug, scraped.imageUrls)

  try {
    const product = await payload.create({
      collection: 'products',
      overrideAccess: true,
      data: {
        title: scraped.title,
        slug,
        description: toLexicalRichText(scraped.description) as any,
        price,
        inStock: true,
        brand: brandId,
        categories: [categoryId],
        ...(scraped.wattage ? { wattage: scraped.wattage } : {}),
        ...(scraped.jars ? { jars: scraped.jars } : {}),
        ...(scraped.warranty ? { warranty: scraped.warranty } : {}),
        features: scraped.features.map(f => ({ feature: f })),
        ...(mediaIds.length > 0 ? { gallery: mediaIds.map(id => ({ image: id })) } : {}),
        images: scraped.imageUrls.map(u => ({ url: u, alt: scraped!.title })),
        _status: 'published',
      },
    })
    console.log(`  ✔ Product #${product.id} created`)
    results.push({ url, status: 'ok', title: scraped.title })
  } catch (err: any) {
    console.log(`  ✗ Product create failed: ${err.message}`)
    results.push({ url, status: 'failed', title: scraped.title, error: err.message })
  }
}

await browser.close()

console.log('\n━━━ Summary ━━━')
results.forEach(r => {
  const icon = r.status === 'ok' ? '✔' : '✗'
  console.log(`${icon} ${r.title ?? r.url}${r.error ? ` — ${r.error}` : ''}`)
})

const ok = results.filter(r => r.status === 'ok').length
console.log(`\n✅ Done! ${ok}/${results.length} products created.\n`)
process.exit(0)
