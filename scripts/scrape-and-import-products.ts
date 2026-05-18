/**
 * scrape-and-import-products.ts
 *
 * Visits each product URL with Playwright, extracts data, uploads images
 * to Payload Media, and creates product records.
 *
 * Run with:
 *   npx tsx --tsconfig tsconfig.json scripts/scrape-and-import-products.ts
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

// ─── Product URLs ─────────────────────────────────────────────────────────────

const PRODUCT_URLS = [
  'https://helashopping.lk/product/akita-octa-4-900w-heavy-duty-mixer-grinder-with-4-jars-metallic-series/',
  'https://www.amazon.in/Bajaj-DuraCut%C2%AE-Lifetime-Warranty-Stainless/dp/B0BPYR1CYD?th=1',
  'https://www.amazon.in/Butterfly-Insta-Mixer-Grinder-Marine/dp/B0F4M65L7G',
  'https://www.amazon.in/Butterfly-Stallion-Grinder-750Watts-Warranty/dp/B08TWY5X2F',
  'https://www.amazon.in/Greenchef-Mixer-Grinder-Mercury-Plus/dp/B074Z78WDJ',
  'https://www.flipkart.com/greenchef-pink-600-w-mixer-grinder/p/itm2d50edca5fb7a',
  'https://catchme.lk/p/orange-mixer-grinder-elegant-750w-19264/',
  'https://bigdeals.lk/blendersngrinders/bdlorange-mixer-grinder-550w-turbo',
  'https://bigdeals.lk/blendersngrinders/bdlorange-mixer-grinder-750w-victus',
  'https://www.singersl.com/product/panasonic-av-super-wet-and-dry-mixer-grinder-mx-av425-4-jars-charcoal-black',
  'https://giftvision.in/product/orange-nexo-series-winzo-electric-portable-hand-blender-200w/',
  'https://tns-go.com/p/national-mixer-grinder-550w-1-year-warranty/',
  'https://www.amazon.in/Pigeon-Powerful-Stainless-Grinding-Polycarbonate/dp/B09Y358DZQ?th=1',
]

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

// ─── Lexical helper (mirrors src/collections/Products/index.ts) ───────────────

function toLexicalRichText(text: string) {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: null,
      format: '',
      indent: 0,
      children: [
        {
          type: 'paragraph',
          version: 1,
          direction: null,
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          children: [
            { type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text },
          ],
        },
      ],
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
  } catch {
    return '.jpg'
  }
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
  const brands = ['Akita', 'Bajaj', 'Butterfly', 'Greenchef', 'Orange', 'Panasonic', 'National', 'Pigeon']
  for (const b of brands) {
    if (title.toLowerCase().includes(b.toLowerCase())) return b
  }
  return title.split(/\s+/)[0]
}

// ─── Site Scrapers ────────────────────────────────────────────────────────────

async function scrapeAmazon(page: Page, url: string): Promise<ScrapedProduct> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(3000)

  const title = await page.locator('#productTitle').textContent().then(t => t?.trim() ?? 'Unknown')

  let priceRaw = ''
  for (const sel of [
    '.a-price .a-offscreen',
    '#priceblock_ourprice',
    '#priceblock_dealprice',
    '.priceToPay .a-offscreen',
    '#corePriceDisplay_desktop_feature_div .a-offscreen',
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
  const mainImg = page.locator('#landingImage, #imgBlkFront').first()
  if (await mainImg.count() > 0) {
    const src = await mainImg.getAttribute('src')
    if (src) {
      imageUrls.push(src.replace(/\._[A-Z0-9_,]+_\./, '.'))
    }
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

async function scrapeFlipkart(page: Page, url: string): Promise<ScrapedProduct> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(3000)

  const title = await page.locator('h1.yhB1nd span, h1.B_NuCI, span.B_NuCI, h1').first().textContent().then(t => t?.trim() ?? 'Unknown')

  let priceRaw = ''
  for (const sel of ['._30jeq3._16Jk6d', '._30jeq3', '.Nx9bqj.CxhGGd', '.CEmiEU ._30jeq3']) {
    const el = page.locator(sel).first()
    if (await el.count() > 0) { priceRaw = (await el.textContent()) ?? ''; if (priceRaw.trim()) break }
  }

  const features: string[] = []
  const specs = page.locator('._1133i0, .W4edtJ ._6_jQQe tr td:last-child, ._2418kt li')
  const specCount = await specs.count()
  for (let i = 0; i < Math.min(specCount, 8); i++) {
    const text = await specs.nth(i).textContent()
    if (text?.trim()) features.push(text.trim())
  }

  const imageUrls: string[] = []
  const imgEls = page.locator('._396cs4 img, ._2r_T1I img, .CXW8mj img')
  const imgCount = await imgEls.count()
  for (let i = 0; i < Math.min(imgCount, 4); i++) {
    const src = await imgEls.nth(i).getAttribute('src')
    if (src) imageUrls.push(src.replace(/128\/128/, '832/832'))
  }

  return {
    title,
    price: parsePrice(priceRaw),
    brand: inferBrandFromTitle(title),
    description: features.slice(0, 3).join('. '),
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
  const priceRaw = await page.locator('.price .woocommerce-Price-amount, .woocommerce-Price-amount').first().textContent() ?? ''

  const features: string[] = []
  const liEls = page.locator('.woocommerce-product-details__short-description ul li, .entry-content ul li')
  const liCount = await liEls.count()
  for (let i = 0; i < Math.min(liCount, 8); i++) {
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
    price: parsePrice(priceRaw),
    brand: inferBrandFromTitle(title),
    description: desc.trim(),
    features,
    imageUrls,
    wattage: parseWattage(title + ' ' + features.join(' ')),
    jars: parseJars(title + ' ' + features.join(' ')),
  }
}

async function scrapeGenericShop(page: Page, url: string): Promise<ScrapedProduct> {
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

  let priceRaw = ''
  for (const sel of [
    '.price', '.product-price', '.regular-price', '[itemprop="price"]',
    '.woocommerce-Price-amount', '.product__price', '.amount',
  ]) {
    const el = page.locator(sel).first()
    if (await el.count() > 0) {
      priceRaw = (await el.textContent()) ?? ''
      if (priceRaw.trim()) break
    }
  }

  const features: string[] = []
  for (const sel of [
    '.product-description ul li', '.woocommerce-product-details__short-description li',
    '.description ul li', '.product__description li', 'ul.product-features li',
  ]) {
    const els = page.locator(sel)
    const c = await els.count()
    if (c > 0) {
      for (let i = 0; i < Math.min(c, 8); i++) {
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
    '.product-gallery img', 'img.wp-post-image',
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
    (await page.locator('.product-description p, .description p').first().textContent().catch(() => '') ?? '')

  return {
    title,
    price: parsePrice(priceRaw),
    brand: inferBrandFromTitle(title),
    description: description.trim(),
    features,
    imageUrls,
    wattage: parseWattage(title + ' ' + features.join(' ')),
    jars: parseJars(title + ' ' + features.join(' ')),
  }
}

// ─── Route to correct scraper ────────────────────────────────────────────────

async function scrapeUrl(page: Page, url: string): Promise<ScrapedProduct> {
  const host = new URL(url).hostname
  if (host.includes('amazon.')) return scrapeAmazon(page, url)
  if (host.includes('flipkart.')) return scrapeFlipkart(page, url)
  if (host.includes('helashopping.')) return scrapeWooCommerce(page, url)
  return scrapeGenericShop(page, url)
}

// ─── Image downloader ────────────────────────────────────────────────────────

async function downloadImage(url: string, dest: string): Promise<void> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
}

// ─── Payload helpers ─────────────────────────────────────────────────────────

async function findOrCreateCategory(payload: Awaited<ReturnType<typeof getPayload>>, title: string) {
  const existing = await payload.find({
    collection: 'categories',
    where: { title: { equals: title } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) return existing.docs[0].id as number
  const cat = await payload.create({
    collection: 'categories',
    data: { title },
    overrideAccess: true,
  })
  return cat.id as number
}

async function findOrCreateBrand(payload: Awaited<ReturnType<typeof getPayload>>, title: string) {
  const existing = await payload.find({
    collection: 'brands',
    where: { title: { equals: title } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) return existing.docs[0].id as number
  const brand = await payload.create({
    collection: 'brands',
    data: { title },
    overrideAccess: true,
  })
  return brand.id as number
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
      if (!fs.existsSync(destPath)) {
        await downloadImage(url, destPath)
      }
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

// ─── Main ────────────────────────────────────────────────────────────────────

const payload = await getPayload({ config })
const categoryId = await findOrCreateCategory(payload, 'Mixer Grinders')
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

for (const url of PRODUCT_URLS) {
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
