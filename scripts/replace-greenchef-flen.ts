/**
 * replace-greenchef-flen.ts
 *
 * Scrapes https://www.greenlifesl.lk/collections/green-life/products/electric-coffee-spice-grinder-price-sri-lanka-300w
 * and replaces the "Greenchef Flen Mixer Grinder 1HP with 3 Jars" Payload record with the scraped data.
 *
 * Run:
 *   node --env-file=.env --import tsx/esm scripts/replace-greenchef-flen.ts
 */

import dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env') })

import { chromium } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../src/payload.config'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MEDIA_DIR = path.resolve(__dirname, '../public/media')
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true })

const TARGET_URL = 'https://www.greenlifesl.lk/collections/green-life/products/electric-coffee-spice-grinder-price-sri-lanka-300w'
const EXISTING_SLUG = 'greenchef-flen-mixer-grinder-1hp-3-jars'

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

function parsePrice(raw: string): number {
  const n = parseFloat(raw.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : Math.round(n)
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

// ─── Scrape ───────────────────────────────────────────────────────────────────

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  viewport: { width: 1280, height: 800 },
})
const page = await context.newPage()

console.log(`\n► Scraping ${TARGET_URL}`)
await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(2000)

// Title
let title = 'Unknown'
for (const sel of ['h1.product__title', 'h1.product-title', '.product__title', 'h1']) {
  const el = page.locator(sel).first()
  if (await el.count() > 0) {
    const t = (await el.textContent())?.trim()
    if (t) { title = t; break }
  }
}

// Price
let price = 0
for (const sel of ['.price__current .money', '.price--large .money', '.product__price .money', '[data-product-price]', '.price .money']) {
  const el = page.locator(sel).first()
  if (await el.count() > 0) {
    const raw = (await el.textContent()) ?? ''
    if (raw.trim()) { price = parsePrice(raw); break }
  }
}

// Features / description
const features: string[] = []
for (const sel of ['.product__description ul li', '.product-single__description ul li', '.rte ul li', '.description ul li']) {
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

// Images
const imageUrls: string[] = []
for (const sel of ['.product__media img', '.product-single__photos img', '.product-gallery__image img', '[data-product-featured-media] img']) {
  const els = page.locator(sel)
  const c = await els.count()
  if (c > 0) {
    for (let i = 0; i < Math.min(c, 5); i++) {
      const src = await els.nth(i).getAttribute('src') ?? await els.nth(i).getAttribute('data-src')
      if (src && !src.includes('placeholder') && !src.includes('logo')) {
        const clean = src.startsWith('//') ? `https:${src}` : src
        if (!imageUrls.includes(clean)) imageUrls.push(clean)
      }
    }
    if (imageUrls.length > 0) break
  }
}

await browser.close()

console.log(`  Title:   ${title}`)
console.log(`  Price:   ${price}`)
console.log(`  Images:  ${imageUrls.length}`)
console.log(`  Features: ${features.length}`)

// ─── Payload ──────────────────────────────────────────────────────────────────

const payload = await getPayload({ config })

// Find existing product by slug
const existing = await payload.find({
  collection: 'products',
  where: { slug: { equals: EXISTING_SLUG } },
  limit: 1,
  overrideAccess: true,
})

if (existing.docs.length === 0) {
  console.error(`\n✗ Product with slug "${EXISTING_SLUG}" not found in Payload.`)
  process.exit(1)
}

const productId = existing.docs[0].id as number
console.log(`\n  Found existing product #${productId} — "${existing.docs[0].title}"`)

// Upload new images
const newSlug = slugify(title)
const mediaIds: number[] = []

for (let i = 0; i < imageUrls.length; i++) {
  const url = imageUrls[i]!
  const ext = extFromUrl(url)
  const filename = `${newSlug}-${i + 1}${ext}`
  const destPath = path.join(MEDIA_DIR, filename)
  process.stdout.write(`  [img ${i + 1}/${imageUrls.length}] ${filename}... `)
  try {
    if (!fs.existsSync(destPath)) await downloadImage(url, destPath)
    console.log('ok')
    const buf = fs.readFileSync(destPath)
    const mime = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg'
    const media = await payload.create({
      collection: 'media', overrideAccess: true,
      data: { alt: `${newSlug} image ${i + 1}` },
      file: { data: buf, mimetype: mime, name: filename, size: buf.length },
    })
    mediaIds.push(media.id as number)
  } catch (err: any) { console.log(`FAILED: ${err.message}`) }
}

const brandId = await findOrCreate(payload, 'brands', 'Greenlife')
const categoryId = await findOrCreate(payload, 'categories', 'Mini Grinders & Veg Choppers')

// Update the existing product record
await payload.update({
  collection: 'products',
  id: productId,
  overrideAccess: true,
  data: {
    title,
    slug: newSlug,
    description: toLexicalRichText(description) as any,
    ...(price > 0 ? { price } : {}),
    inStock: true,
    brand: brandId,
    categories: [categoryId],
    ...(parseWattage(title + ' ' + features.join(' ')) ? { wattage: parseWattage(title + ' ' + features.join(' ')) } : {}),
    ...(parseJars(title + ' ' + features.join(' ')) ? { jars: parseJars(title + ' ' + features.join(' ')) } : {}),
    features: features.map(f => ({ feature: f })),
    ...(mediaIds.length > 0 ? { gallery: mediaIds.map(id => ({ image: id })) } : {}),
    images: imageUrls.map(u => ({ url: u, alt: title })),
    _status: 'published',
  },
})

console.log(`\n  ✔ Product #${productId} updated → "${title}"`)
console.log('\n✅ Done!\n')
process.exit(0)
