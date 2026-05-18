/**
 * fix-products.ts
 *
 * Fixes products from the first scrape run:
 * - Deletes products 15-19 (bad/missing data)
 * - Updates product #14 (Akita) description
 * - Creates 10 failed products with corrected scrapers
 *
 * Run with:
 *   node --env-file=.env --import tsx/esm scripts/fix-products.ts
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

// ─── URLs that need to be created (failed/bad data from first run) ────────────

const FAILED_URLS = [
  'https://www.amazon.in/Bajaj-DuraCut%C2%AE-Lifetime-Warranty-Stainless/dp/B0BPYR1CYD?th=1',
  'https://www.amazon.in/Butterfly-Insta-Mixer-Grinder-Marine/dp/B0F4M65L7G',
  'https://www.amazon.in/Butterfly-Stallion-Grinder-750Watts-Warranty/dp/B08TWY5X2F',
  'https://www.amazon.in/Greenchef-Mixer-Grinder-Mercury-Plus/dp/B074Z78WDJ',
  'https://www.flipkart.com/greenchef-pink-600-w-mixer-grinder/p/itm2d50edca5fb7a',
  'https://catchme.lk/p/orange-mixer-grinder-elegant-750w-19264/',
  'https://bigdeals.lk/blendersngrinders/bdlorange-mixer-grinder-550w-turbo',
  'https://bigdeals.lk/blendersngrinders/bdlorange-mixer-grinder-750w-victus',
  'https://www.singersl.com/product/panasonic-av-super-wet-and-dry-mixer-grinder-mx-av425-4-jars-charcoal-black',
  'https://www.amazon.in/Pigeon-Powerful-Stainless-Grinding-Polycarbonate/dp/B09Y358DZQ?th=1',
]

// IDs from first run that have bad/incomplete data - will be deleted before re-creating
const DELETE_IDS = [15, 16, 17, 18, 19]

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScrapedProduct {
  title: string
  price: number
  originalPrice?: number
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

function parsePrice(raw: string): number {
  const n = parseFloat(raw.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : Math.round(n)
}

function parseWattage(text: string): number | undefined {
  const m = text.match(/(\d+)\s*[Ww](?:atts?)?/)
  return m ? parseInt(m[1]) : undefined
}

function parseJars(text: string): number | undefined {
  const m = text.match(/(\d+)\s*[Jj]ar/)
  return m ? parseInt(m[1]) : undefined
}

function inferBrandFromTitle(title: string): string {
  const brands = ['Akita', 'Bajaj', 'Butterfly', 'Greenchef', 'GreenChef', 'Orange', 'Panasonic', 'National', 'Pigeon']
  for (const b of brands) {
    if (title.toLowerCase().includes(b.toLowerCase())) return b === 'GreenChef' ? 'Greenchef' : b
  }
  return title.split(/\s+/)[0]
}

// ─── Fixed: Amazon Scraper ────────────────────────────────────────────────────

async function scrapeAmazon(page: Page, url: string): Promise<ScrapedProduct> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(4000)

  // Use span#productTitle (not input#productTitle — avoids strict mode violation)
  const title = await page.locator('span#productTitle').first().textContent().then(t => t?.trim() ?? 'Unknown')

  let priceRaw = ''
  for (const sel of [
    '.a-price .a-offscreen',
    '.priceToPay .a-offscreen',
    '#corePriceDisplay_desktop_feature_div .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
  ]) {
    const el = page.locator(sel).first()
    if (await el.count() > 0) {
      priceRaw = (await el.textContent()) ?? ''
      if (priceRaw.trim()) break
    }
  }

  const features: string[] = []
  const bulletItems = page.locator('#feature-bullets .a-list-item')
  const count = await bulletItems.count()
  for (let i = 0; i < Math.min(count, 8); i++) {
    const text = await bulletItems.nth(i).textContent()
    if (text?.trim()) features.push(text.trim())
  }

  const imageUrls: string[] = []
  // Try JS eval to get high-res images from Amazon's image data
  try {
    const imgs = await page.evaluate(() => {
      const urls: string[] = []
      const main = document.querySelector('#landingImage') as HTMLImageElement
      if (main?.src) urls.push(main.src.replace(/\._[A-Z0-9_,]+_\./, '.'))
      // Try getting from data attribute
      const imgData = document.querySelector('#imgTagWrappingDiv img') as HTMLImageElement
      if (imgData?.src && !urls.includes(imgData.src)) urls.push(imgData.src.replace(/\._[A-Z0-9_,]+_\./, '.'))
      return [...new Set(urls)].filter(u => u && u.startsWith('http'))
    })
    imageUrls.push(...imgs.slice(0, 3))
  } catch {}

  // Fallback: thumb strip
  if (imageUrls.length === 0) {
    const thumbImgs = page.locator('#altImages .a-button-thumbnail img')
    const thumbCount = await thumbImgs.count()
    for (let i = 0; i < Math.min(thumbCount, 3); i++) {
      const src = await thumbImgs.nth(i).getAttribute('src')
      if (src && !src.includes('play-button')) {
        imageUrls.push(src.replace(/\._[A-Z0-9_,]+_\./, '.'))
      }
    }
  }

  let wattage: number | undefined
  let jars: number | undefined
  let warranty: string | undefined

  const specRows = page.locator('#productDetails_techSpec_section_1 tr, #productDetails_db_sections tr')
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
    price: parsePrice(priceRaw),
    brand: inferBrandFromTitle(title),
    description: features.slice(0, 3).join('. '),
    features,
    imageUrls,
    wattage,
    jars,
    warranty,
  }
}

// ─── Fixed: Flipkart Scraper ──────────────────────────────────────────────────

async function scrapeFlipkart(page: Page, url: string): Promise<ScrapedProduct> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(3000)

  const title = await page.locator('h1').first().textContent().then(t => t?.trim() ?? 'Unknown')

  // Use JS eval to find ₹ price since Flipkart obfuscates class names
  const priceData = await page.evaluate(() => {
    const allLeafEls = [...document.querySelectorAll('*')].filter(el => {
      const t = el.textContent?.trim()
      return t && t.match(/^[₹]\s*[\d,]+$/) && el.children.length === 0
    })
    const prices = allLeafEls.map(el => parseInt(el.textContent!.replace(/[^0-9]/g, ''))).filter(n => n > 100)
    prices.sort((a, b) => a - b)
    return { min: prices[0] ?? 0, all: prices.slice(0, 5) }
  })

  // Get rukminim (Flipkart CDN) images
  const imageUrls = await page.evaluate(() => {
    return [...document.querySelectorAll('img')]
      .filter(i => i.src.includes('rukminim') && i.width > 100)
      .slice(0, 4)
      .map(i => i.src)
  })

  const features: string[] = []
  const specEls = page.locator('table tr td, ._2418kt li, ._1133i0')
  const specCount = await specEls.count()
  for (let i = 0; i < Math.min(specCount, 8); i++) {
    const text = await specEls.nth(i).textContent()
    if (text?.trim() && text.trim().length > 2) features.push(text.trim())
  }

  return {
    title,
    price: priceData.min,
    brand: inferBrandFromTitle(title),
    description: features.slice(0, 3).join('. '),
    features,
    imageUrls,
    wattage: parseWattage(title + ' ' + features.join(' ')),
    jars: parseJars(title + ' ' + features.join(' ')),
  }
}

// ─── Fixed: WooCommerce / catchme.lk ────────────────────────────────────────

async function scrapeWooCommerce(page: Page, url: string): Promise<ScrapedProduct> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  // Wait for product title to appear (handles Cloudflare delay)
  try {
    await page.waitForSelector('h1.product_title, h1.entry-title', { timeout: 10000 })
  } catch {}

  const title = await page.locator('h1.product_title, h1.entry-title').first().textContent().then(t => t?.trim() ?? 'Unknown')

  // Current price is in <ins>, original in <del>
  const priceRaw = await page.locator('ins .woocommerce-Price-amount, .woocommerce-Price-amount bdi').first().textContent().catch(() => '') ?? ''
  const origPriceRaw = await page.locator('del .woocommerce-Price-amount').first().textContent().catch(() => '') ?? ''

  const features: string[] = []
  // Prefer description tab, fall back to entry-content
  const liEls = page.locator('.woocommerce-product-details__short-description li, .entry-content li, .description li')
  const liCount = await liEls.count()
  for (let i = 0; i < Math.min(liCount, 10); i++) {
    const text = await liEls.nth(i).textContent()
    if (text?.trim()) features.push(text.trim())
  }

  // Image: prefer data-large_image attribute on gallery link
  const imageUrls: string[] = []
  const galleryLinks = page.locator('.woocommerce-product-gallery__image a, .woocommerce-product-gallery__image')
  const linkCount = await galleryLinks.count()
  for (let i = 0; i < Math.min(linkCount, 4); i++) {
    const href = await galleryLinks.nth(i).getAttribute('href')
    const src = await galleryLinks.nth(i).locator('img').getAttribute('src')
    const large = await galleryLinks.nth(i).locator('img').getAttribute('data-large_image')
    const url = href ?? large ?? src
    if (url && !url.includes('placeholder')) imageUrls.push(url)
  }

  // Fallback image via wp-content uploads
  if (imageUrls.length === 0) {
    const imgs = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter(i => i.src.includes('wp-content/uploads') && i.width > 100)
        .slice(0, 3)
        .map(i => i.src)
    )
    imageUrls.push(...imgs)
  }

  const description = features.slice(0, 3).join('. ')

  return {
    title,
    price: parsePrice(priceRaw),
    originalPrice: origPriceRaw ? parsePrice(origPriceRaw) : undefined,
    brand: inferBrandFromTitle(title),
    description,
    features,
    imageUrls,
    wattage: parseWattage(title + ' ' + features.join(' ')),
    jars: parseJars(title + ' ' + features.join(' ')),
  }
}

// ─── New: bigdeals.lk Scraper ─────────────────────────────────────────────────

async function scrapeBigDeals(page: Page, url: string): Promise<ScrapedProduct> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2000)

  const title = await page.locator('h1').first().textContent().then(t => t?.trim() ?? 'Unknown')

  const priceRaw = await page.locator('.sell-price').first().textContent().catch(() => '') ?? ''
  const origPriceRaw = await page.locator('.market-price, .m-price').first().textContent().catch(() => '') ?? ''

  // Features: spec list items
  const features: string[] = []
  const specEls = await page.evaluate(() =>
    [...document.querySelectorAll('li')].filter(li =>
      li.closest('.specification, .spec, .features, .product-spec, .product-description, .product-detail')
    ).slice(0, 8).map(li => li.textContent?.trim()).filter(Boolean) as string[]
  )
  features.push(...specEls)

  // Fallback features
  if (features.length === 0) {
    const liEls = page.locator('ul li')
    const liCount = await liEls.count()
    for (let i = 0; i < Math.min(liCount, 8); i++) {
      const text = await liEls.nth(i).textContent()
      if (text?.trim() && text.length < 200) features.push(text.trim())
    }
  }

  // Product image from /uploads/product/normal/
  const imageUrls = await page.evaluate(() =>
    [...new Set(
      [...document.querySelectorAll('img')]
        .filter(i => i.src.includes('/uploads/product/normal/'))
        .map(i => i.src)
    )].slice(0, 3)
  )

  return {
    title,
    price: parsePrice(priceRaw),
    originalPrice: origPriceRaw ? parsePrice(origPriceRaw) : undefined,
    brand: inferBrandFromTitle(title),
    description: features.slice(0, 3).join('. '),
    features,
    imageUrls,
    wattage: parseWattage(title + ' ' + features.join(' ')),
    jars: parseJars(title + ' ' + features.join(' ')),
  }
}

// ─── New: Singer SL Scraper ───────────────────────────────────────────────────

async function scrapeSingerSL(page: Page, url: string): Promise<ScrapedProduct> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(2000)

  // Singer doesn't have a product h1 — parse from page title
  const rawTitle = await page.evaluate(() => document.title)
  const title = rawTitle
    .replace(/^Buy\s+/i, '')
    .replace(/\s+Online\s+.*$/i, '')
    .trim() || 'Unknown'

  const priceRaw = await page.evaluate(() => {
    const el = document.querySelector('.emi-bank-offer-price, .product-price, .sell-price')
    return el?.textContent?.trim() ?? ''
  })
  const origPriceRaw = await page.evaluate(() => {
    const el = document.querySelector('.text-decoration-line-through')
    return el?.textContent?.trim() ?? ''
  })

  // Features from specs table
  const features = await page.evaluate(() =>
    [...document.querySelectorAll('table tr')]
      .map(tr => tr.textContent?.replace(/\s+/g, ' ').trim())
      .filter((t): t is string => !!t && t.length > 3 && t.length < 200)
      .slice(0, 10)
  )

  // Images: Singer CDN normal images (deduplicated)
  const imageUrls = await page.evaluate(() =>
    [...new Set(
      [...document.querySelectorAll('img')]
        .filter(i => i.src.includes('singerwebcdn') && i.src.includes('/normal/'))
        .map(i => i.src)
    )].slice(0, 4)
  )

  const brand = inferBrandFromTitle(title) || 'Panasonic'

  return {
    title,
    price: parsePrice(priceRaw),
    originalPrice: origPriceRaw ? parsePrice(origPriceRaw) : undefined,
    brand,
    description: features.slice(0, 3).join('. '),
    features,
    imageUrls,
    wattage: parseWattage(title + ' ' + features.join(' ')),
    jars: parseJars(title + ' ' + features.join(' ')),
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────

async function scrapeUrl(page: Page, url: string): Promise<ScrapedProduct> {
  const host = new URL(url).hostname
  if (host.includes('amazon.')) return scrapeAmazon(page, url)
  if (host.includes('flipkart.')) return scrapeFlipkart(page, url)
  if (host.includes('helashopping.') || host.includes('catchme.')) return scrapeWooCommerce(page, url)
  if (host.includes('bigdeals.')) return scrapeBigDeals(page, url)
  if (host.includes('singersl.')) return scrapeSingerSL(page, url)
  return scrapeWooCommerce(page, url)  // generic fallback
}

// ─── Image downloader ────────────────────────────────────────────────────────

async function downloadImage(url: string, dest: string): Promise<void> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
}

// ─── Payload helpers ──────────────────────────────────────────────────────────

async function findOrCreateCategory(payload: Awaited<ReturnType<typeof getPayload>>, title: string) {
  const existing = await payload.find({ collection: 'categories', where: { title: { equals: title } }, limit: 1, overrideAccess: true })
  if (existing.docs.length > 0) return existing.docs[0].id as number
  const cat = await payload.create({ collection: 'categories', data: { title }, overrideAccess: true })
  return cat.id as number
}

async function findOrCreateBrand(payload: Awaited<ReturnType<typeof getPayload>>, title: string) {
  const existing = await payload.find({ collection: 'brands', where: { title: { equals: title } }, limit: 1, overrideAccess: true })
  if (existing.docs.length > 0) return existing.docs[0].id as number
  const brand = await payload.create({ collection: 'brands', data: { title }, overrideAccess: true })
  return brand.id as number
}

async function uploadImages(payload: Awaited<ReturnType<typeof getPayload>>, productSlug: string, imageUrls: string[]): Promise<number[]> {
  const mediaIds: number[] = []
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i]!
    const ext = extFromUrl(url)
    const filename = `${productSlug}-${i + 1}${ext}`
    const destPath = path.join(MEDIA_DIR, filename)
    process.stdout.write(`    [img ${i + 1}/${imageUrls.length}] ${filename}... `)
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
        collection: 'media', overrideAccess: true,
        data: { alt: `${productSlug} image ${i + 1}` },
        file: { data: fileBuffer, mimetype: mimeType, name: filename, size: fileBuffer.length },
      })
      mediaIds.push(media.id as number)
    } catch (err: any) {
      console.log(`    ✗ Media failed: ${err.message}`)
    }
  }
  return mediaIds
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const payload = await getPayload({ config })
const categoryId = await findOrCreateCategory(payload, 'Mixer Grinders')

// Step 1: Delete bad products from first run
console.log(`\nDeleting products ${DELETE_IDS.join(', ')}...`)
for (const id of DELETE_IDS) {
  try {
    await payload.delete({ collection: 'products', id, overrideAccess: true })
    console.log(`  ✔ Deleted #${id}`)
  } catch (err: any) {
    console.log(`  ✗ Delete #${id} failed: ${err.message}`)
  }
}

// Step 2: Fix Akita (#14) description — it was set to the price string
console.log('\nFixing Akita #14 description...')
try {
  await payload.update({
    collection: 'products', id: 14, overrideAccess: true,
    data: {
      description: toLexicalRichText(
        '900W Heavy Duty Mixer Grinder with 4 Stainless Steel Jars. Octa-4 Metallic Series with powerful copper wound motor, 18000 RPM, suitable for wet and dry grinding.'
      ) as any,
    },
  })
  console.log('  ✔ Akita description updated')
} catch (err: any) {
  console.log(`  ✗ Akita update failed: ${err.message}`)
}

// Step 3: Scrape and create all failed products
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

for (const url of FAILED_URLS) {
  console.log(`\n► ${url}`)
  let scraped: ScrapedProduct | null = null
  try {
    scraped = await scrapeUrl(page, url)
    console.log(`  Title:   ${scraped.title}`)
    console.log(`  Price:   ${scraped.price}  Brand: ${scraped.brand}  Wattage: ${scraped.wattage ?? '?'}W  Jars: ${scraped.jars ?? '?'}`)
    console.log(`  Images:  ${scraped.imageUrls.length}`)
  } catch (err: any) {
    console.log(`  ✗ Scrape failed: ${err.message}`)
    results.push({ url, status: 'failed', error: err.message })
    continue
  }

  const slug = slugify(scraped.title)
  const brandId = await findOrCreateBrand(payload, scraped.brand)
  const mediaIds = await uploadImages(payload, slug, scraped.imageUrls)

  try {
    const product = await payload.create({
      collection: 'products',
      overrideAccess: true,
      data: {
        title: scraped.title,
        slug,
        description: toLexicalRichText(scraped.description) as any,
        price: scraped.price,
        ...(scraped.originalPrice ? { originalPrice: scraped.originalPrice } : {}),
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
console.log('\n✅ Done!\n')
process.exit(0)
