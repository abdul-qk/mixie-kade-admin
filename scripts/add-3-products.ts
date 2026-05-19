/**
 * add-3-products.ts
 * Creates: National 650W (daraz.lk), Pigeon Swift 550W (amazon.in), Pigeon Prime Pro (justyuhi.com)
 * Run: node --env-file=.env --import tsx/esm scripts/add-3-products.ts
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

async function downloadImage(url: string, dest: string) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
}

async function uploadImages(payload: any, slug: string, imgUrls: string[]): Promise<number[]> {
  const ids: number[] = []
  for (let i = 0; i < imgUrls.length; i++) {
    const url = imgUrls[i]!
    const ext = extFromUrl(url)
    const filename = `${slug}-${i + 1}${ext}`
    const dest = path.join(MEDIA_DIR, filename)
    process.stdout.write(`  [img ${i + 1}/${imgUrls.length}] ${filename}... `)
    try {
      if (!fs.existsSync(dest)) await downloadImage(url, dest)
      console.log('ok')
    } catch (err: any) { console.log(`FAILED: ${err.message}`); continue }
    const buf = fs.readFileSync(dest)
    const mime = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg'
    try {
      const m = await payload.create({ collection: 'media', overrideAccess: true, data: { alt: `${slug} image ${i + 1}` }, file: { data: buf, mimetype: mime, name: filename, size: buf.length } })
      ids.push(m.id as number)
    } catch (err: any) { console.log(`  ✗ media: ${err.message}`) }
  }
  return ids
}

async function findOrCreate(payload: any, collection: string, title: string): Promise<number> {
  const r = await payload.find({ collection, where: { title: { equals: title } }, limit: 1, overrideAccess: true })
  if (r.docs.length > 0) return r.docs[0].id as number
  const d = await payload.create({ collection, data: { title }, overrideAccess: true })
  return d.id as number
}

async function createProduct(payload: any, data: {
  title: string; slug: string; price: number; originalPrice?: number
  brand: string; categoryId: number; wattage?: number; jars?: number
  warranty?: string; features: string[]; description: string
  imageUrls: string[]; mediaIds: number[]
}) {
  return payload.create({
    collection: 'products', overrideAccess: true,
    data: {
      title: data.title, slug: data.slug,
      description: toLexicalRichText(data.description) as any,
      price: data.price,
      ...(data.originalPrice ? { originalPrice: data.originalPrice } : {}),
      inStock: true,
      brand: data.brand,
      categories: [data.categoryId],
      ...(data.wattage ? { wattage: data.wattage } : {}),
      ...(data.jars ? { jars: data.jars } : {}),
      ...(data.warranty ? { warranty: data.warranty } : {}),
      features: data.features.map(f => ({ feature: f })),
      ...(data.mediaIds.length > 0 ? { gallery: data.mediaIds.map(id => ({ image: id })) } : {}),
      images: data.imageUrls.map(u => ({ url: u, alt: data.title })),
      _status: 'published',
    },
  })
}

// ─── Amazon scraper (fixed span#productTitle) ─────────────────────────────────
async function scrapeAmazon(page: Page, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(4000)
  const title = await page.locator('span#productTitle').first().textContent().then(t => t?.trim() ?? 'Unknown')
  let priceRaw = ''
  for (const sel of ['.a-price .a-offscreen', '.priceToPay .a-offscreen', '#corePriceDisplay_desktop_feature_div .a-offscreen', '#priceblock_ourprice']) {
    const el = page.locator(sel).first()
    if (await el.count() > 0) { priceRaw = (await el.textContent()) ?? ''; if (priceRaw.trim()) break }
  }
  const features: string[] = []
  const bullets = page.locator('#feature-bullets .a-list-item')
  for (let i = 0; i < Math.min(await bullets.count(), 8); i++) {
    const t = await bullets.nth(i).textContent()
    if (t?.trim()) features.push(t.trim())
  }
  const imageUrls = await page.evaluate(() => {
    const imgs: string[] = []
    const main = document.querySelector('#landingImage') as HTMLImageElement
    if (main?.src) imgs.push(main.src.replace(/\._[A-Z0-9_,]+_\./, '.'))
    return [...new Set(imgs)].filter(u => u.startsWith('http'))
  })
  let wattage: number | undefined, jars: number | undefined, warranty: string | undefined
  const rows = page.locator('#productDetails_techSpec_section_1 tr, #productDetails_db_sections tr')
  for (let i = 0; i < await rows.count(); i++) {
    const k = ((await rows.nth(i).locator('th, td:first-child').textContent()) ?? '').toLowerCase()
    const v = ((await rows.nth(i).locator('td:last-child').textContent()) ?? '').trim()
    if (k.includes('watt') && !wattage) wattage = parseInt(v.match(/(\d+)/)?.[1] ?? '0') || undefined
    if (k.includes('jar') && !jars) jars = parseInt(v.match(/(\d+)/)?.[1] ?? '0') || undefined
    if (k.includes('warrant') && !warranty) warranty = v
  }
  if (!wattage) { const m = (title + ' ' + features.join(' ')).match(/(\d+)\s*[Ww]/); wattage = m ? parseInt(m[1]) : undefined }
  if (!jars) { const m = (title + ' ' + features.join(' ')).match(/(\d+)\s*[Jj]ar/); jars = m ? parseInt(m[1]) : undefined }
  return { title, features, imageUrls, wattage, jars, warranty }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const payload = await getPayload({ config })
const categoryId = await findOrCreate(payload, 'categories', 'Mixer Grinders')

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', viewport: { width: 1280, height: 800 } })
const page = await context.newPage()

// ─── 1. National 650W (daraz.lk) — hardcoded from browser inspection ─────────
console.log('\n► National Mixer Grinder 650W (daraz.lk)')
{
  const slug = 'national-mixer-grinder-3-jar-650w'
  const brandId = await findOrCreate(payload, 'brands', 'National')
  const imageUrls = [
    'https://img.drz.lazcdn.com/static/lk/p/90d3c287d4a286e2d84987a8930565c1.jpg_720x720q80.jpg_.webp',
    'https://img.drz.lazcdn.com/static/lk/p/5b6b6dc50fc38f32bd4dddf92db565ac.jpg_720x720q80.jpg_.webp',
  ]
  const mediaIds = await uploadImages(payload, slug, imageUrls)
  const p = await createProduct(payload, {
    title: 'National Mixer Grinder 3 Jar 650W',
    slug,
    price: 9500,
    brand: brandId,
    categoryId,
    wattage: 650,
    jars: 3,
    features: ['650W Copper Motor', '3 Stainless Steel Jars', 'Wet & Dry Grinding', 'Mixer and Grinder Functions'],
    description: '650W National Mixer Grinder with 3 stainless steel jars. Copper motor for powerful wet and dry grinding.',
    imageUrls,
    mediaIds,
  })
  console.log(`  ✔ Product #${p.id} created`)
}

// ─── 2. Pigeon Swift 550W (amazon.in) ────────────────────────────────────────
console.log('\n► Pigeon Swift/Prime 550W (amazon.in)')
{
  const slug_url = 'https://www.amazon.in/Pigeon-Prime-Mixer-Grinder-White/dp/B08KHGCRWB'
  const scraped = await scrapeAmazon(page, slug_url)
  console.log(`  Title: ${scraped.title}`)
  const slug = slugify(scraped.title)
  const brandId = await findOrCreate(payload, 'brands', 'Pigeon')
  const mediaIds = await uploadImages(payload, slug, scraped.imageUrls)
  const p = await createProduct(payload, {
    title: scraped.title,
    slug,
    price: 10900,
    brand: brandId,
    categoryId,
    wattage: scraped.wattage,
    jars: scraped.jars,
    warranty: scraped.warranty,
    features: scraped.features,
    description: scraped.features.slice(0, 3).join('. '),
    imageUrls: scraped.imageUrls,
    mediaIds,
  })
  console.log(`  ✔ Product #${p.id} created`)
}

// ─── 3. Pigeon Prime Pro 500W 4-Jar (justyuhi.com) ───────────────────────────
console.log('\n► Pigeon Prime Pro 500W (justyuhi.com)')
{
  const slug = 'pigeon-prime-pro-mixer-grinder-500w-4-jars'
  const brandId = await findOrCreate(payload, 'brands', 'Pigeon')
  const imageUrls = [
    'https://justyuhi.com/cdn/shop/files/OCT180001076xx17OCT24_5_B.jpg?v=1740814863&width=1946',
    'https://justyuhi.com/cdn/shop/files/OCT180001073xx17OCT24_5_B.jpg?v=1740814846&width=533',
    'https://justyuhi.com/cdn/shop/files/OCT180000365xx25OCT22_5_B.jpg?v=1740814876&width=533',
  ]
  const mediaIds = await uploadImages(payload, slug, imageUrls)
  const p = await createProduct(payload, {
    title: 'Pigeon Prime Pro Mixer Grinder 500W 4 Jars',
    slug,
    price: 12750,
    brand: brandId,
    categoryId,
    wattage: 500,
    jars: 4,
    features: [
      '500W powerful motor',
      '4 Jars included',
      'Versatile wet and dry grinding',
      'Compact size',
      'Safety features',
      '220-240V',
    ],
    description: '500W Pigeon Prime Pro Mixer Grinder with 4 jars. Powerful performance with user-friendly design for wet and dry grinding.',
    imageUrls,
    mediaIds,
  })
  console.log(`  ✔ Product #${p.id} created`)
}

await browser.close()
console.log('\n✅ Done!\n')
process.exit(0)
