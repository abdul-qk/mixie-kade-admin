/**
 * add-batch-3-retry.ts
 *
 * Retries the 7 products from add-batch-3 that failed:
 *   - 4 Amazon products: fix strict-mode violation on #productTitle (use .first())
 *   - 3 Sujata products: site timed out on WooCommerce selectors, use generic fallback
 *
 * Run:
 *   node --env-file=.env --import tsx/esm scripts/add-batch-3-retry.ts
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

const FAILED: { url: string; price: number }[] = [
  // Amazon — fixed with .first()
  { url: 'https://www.amazon.in/Preethi-Extractor-Warranty-Acrylonitrile-Butadiene/dp/B08N6CKD87?th=1', price: 26750 },
  { url: 'https://www.amazon.in/Preethi-grinder-Technology-grinding-Storage/dp/B08N6FVGW3?th=1', price: 39750 },
  { url: 'https://www.amazon.in/Preethi-Prime-Grinder-Kitchen-MG-286/dp/B08N6G4MJM', price: 19750 },
  { url: 'https://www.amazon.in/Sumeet-Traditional-Hotel-Grinder-Stainless/dp/B0DV4NMB77', price: 39500 },
  // Sujata — generic scraper with longer timeout
  { url: 'https://sujataappliances.com/product/frootmix-the-smart-mixer-blender/', price: 29800 },
  { url: 'https://sujataappliances.com/product/dynamix-the-smart-choice-for-grinding/', price: 36800 },
  { url: 'https://sujataappliances.com/product/supermix-the-specialist-mixer-grinder/', price: 32800 },
]

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

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function extFromUrl(url: string) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase().split('?')[0]
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'].includes(ext) ? ext : '.jpg'
  } catch { return '.jpg' }
}

function parseWattage(text: string) {
  const m = text.match(/(\d{3,4})\s*[Ww](?:atts?)?/)
  return m ? parseInt(m[1]) : undefined
}

function parseJars(text: string) {
  const m = text.match(/(\d+)\s*[Jj]ar/)
  return m ? parseInt(m[1]) : undefined
}

function inferBrand(title: string, host: string) {
  const brands = ['Preethi', 'Prestige', 'Sujata', 'Sumeet', 'Bajaj', 'Butterfly', 'Greenchef', 'Orange', 'Panasonic', 'National', 'Pigeon']
  for (const b of brands) {
    if (title.toLowerCase().includes(b.toLowerCase())) return b
  }
  if (host.includes('sujata')) return 'Sujata'
  return title.split(/\s+/)[0]
}

// Fixed Amazon scraper — use .first() to avoid strict mode violation on #productTitle
async function scrapeAmazon(page: Page, url: string): Promise<ScrapedProduct> {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(3000)

  const titleEl = page.locator('span#productTitle').first()
  const title = ((await titleEl.textContent()) ?? 'Unknown').trim()

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
    brand: inferBrand(title, new URL(url).hostname),
    description: features.slice(0, 3).join('. '),
    features,
    imageUrls,
    wattage,
    jars,
    warranty,
  }
}

// Generic scraper with longer timeout and broader title selectors for Sujata
async function scrapeGeneric(page: Page, url: string): Promise<ScrapedProduct> {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(3000)

  let title = 'Unknown'
  for (const sel of [
    'h1.product_title', 'h1.product-title', 'h1.page-title', 'h1.entry-title',
    '.product-details h1', '.product-name h1', '.product-single__title',
    'h1[itemprop="name"]', '.product__title', 'h1',
  ]) {
    try {
      const el = page.locator(sel).first()
      if (await el.count() > 0) {
        const t = (await el.textContent({ timeout: 5000 }))?.trim()
        if (t && t !== 'Unknown') { title = t; break }
      }
    } catch { /* continue */ }
  }

  const features: string[] = []
  for (const sel of [
    '.product-description ul li', '.woocommerce-product-details__short-description li',
    '.entry-content ul li', '.description ul li', '.product__description li',
    '.tab-content ul li', '.product-detail ul li', '.rte ul li',
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
    '.woocommerce-product-gallery img', '.product__media img',
    '.product-images img', '.product-image img', '.product-gallery img',
    'img.wp-post-image', '[data-fancybox] img',
  ]) {
    const els = page.locator(sel)
    const c = await els.count()
    if (c > 0) {
      for (let i = 0; i < Math.min(c, 4); i++) {
        const src = await els.nth(i).getAttribute('data-large_image') ??
                    await els.nth(i).getAttribute('data-src') ??
                    await els.nth(i).getAttribute('src')
        if (src && !src.includes('placeholder') && !src.includes('logo')) imageUrls.push(src)
      }
      if (imageUrls.length > 0) break
    }
  }

  const description = features.slice(0, 3).join('. ') ||
    (await page.locator('.product-description p, .description p, .entry-content p').first().textContent().catch(() => '') ?? '')

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

async function scrapeUrl(page: Page, url: string): Promise<ScrapedProduct> {
  const host = new URL(url).hostname
  if (host.includes('amazon.')) return scrapeAmazon(page, url)
  return scrapeGeneric(page, url)
}

async function downloadImage(url: string, dest: string) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
}

async function findOrCreate(payload: Awaited<ReturnType<typeof getPayload>>, collection: string, title: string): Promise<number> {
  const r = await payload.find({ collection, where: { title: { equals: title } }, limit: 1, overrideAccess: true })
  if (r.docs.length > 0) return r.docs[0].id as number
  const d = await payload.create({ collection, data: { title }, overrideAccess: true })
  return d.id as number
}

async function uploadImages(payload: Awaited<ReturnType<typeof getPayload>>, slug: string, imageUrls: string[]): Promise<number[]> {
  const mediaIds: number[] = []
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i]!
    const ext = extFromUrl(url)
    const filename = `${slug}-${i + 1}${ext}`
    const destPath = path.join(MEDIA_DIR, filename)
    process.stdout.write(`    [img ${i + 1}/${imageUrls.length}] Downloading... `)
    try {
      if (!fs.existsSync(destPath)) await downloadImage(url, destPath)
      console.log('ok')
    } catch (err: any) { console.log(`FAILED: ${err.message}`); continue }
    const fileBuffer = fs.readFileSync(destPath)
    const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
    try {
      const media = await payload.create({
        collection: 'media', overrideAccess: true,
        data: { alt: `${slug} image ${i + 1}` },
        file: { data: fileBuffer, mimetype: mimeType, name: filename, size: fileBuffer.length },
      })
      mediaIds.push(media.id as number)
    } catch (err: any) { console.log(`    ✗ Media: ${err.message}`) }
  }
  return mediaIds
}

const payload = await getPayload({ config })
const categoryId = await findOrCreate(payload, 'categories', 'Mixer Grinders')
console.log(`\nCategory "Mixer Grinders" id=${categoryId}`)

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 800 },
})
const page = await context.newPage()

const results: { url: string; status: 'ok' | 'failed'; title?: string; error?: string }[] = []

for (const { url, price } of FAILED) {
  console.log(`\n► ${url}`)
  let scraped: ScrapedProduct | null = null

  try {
    scraped = await scrapeUrl(page, url)
    console.log(`  Title:   ${scraped.title}`)
    console.log(`  Price:   ${price} LKR  Brand: ${scraped.brand}  Wattage: ${scraped.wattage ?? '?'}W  Jars: ${scraped.jars ?? '?'}`)
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

console.log('\n━━━ Retry Summary ━━━')
results.forEach(r => {
  const icon = r.status === 'ok' ? '✔' : '✗'
  console.log(`${icon} ${r.title ?? r.url}${r.error ? ` — ${r.error}` : ''}`)
})
const ok = results.filter(r => r.status === 'ok').length
console.log(`\n✅ Done! ${ok}/${results.length} retry products created.\n`)
process.exit(0)
