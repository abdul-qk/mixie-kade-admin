/**
 * patch-prices.ts
 *
 * Final fixes:
 * - Update #27 Orange Turbo: price + images
 * - Update #28 Orange Victus: price + images
 * - Update #29 Panasonic: price
 * - Create catchme.lk Orange Elegant 750W (hardcoded — Cloudflare blocks headless)
 *
 * Run with:
 *   node --env-file=.env --import tsx/esm scripts/patch-prices.ts
 */

import dotenv from 'dotenv'
import { resolve } from 'path'
dotenv.config({ path: resolve(process.cwd(), '.env') })

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

function extFromUrl(url: string): string {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase().split('?')[0]
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'].includes(ext) ? ext : '.jpg'
  } catch { return '.jpg' }
}

async function downloadImage(url: string, dest: string): Promise<void> {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
}

async function uploadImage(payload: any, slug: string, imgUrl: string, idx: number): Promise<number | null> {
  const ext = extFromUrl(imgUrl)
  const filename = `${slug}-${idx}${ext}`
  const destPath = path.join(MEDIA_DIR, filename)
  process.stdout.write(`  Downloading ${filename}... `)
  try {
    if (!fs.existsSync(destPath)) await downloadImage(imgUrl, destPath)
    console.log('ok')
  } catch (err: any) {
    console.log(`FAILED: ${err.message}`)
    return null
  }
  const fileBuffer = fs.readFileSync(destPath)
  const mimeType = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'image/jpeg'
  try {
    const media = await payload.create({
      collection: 'media', overrideAccess: true,
      data: { alt: `${slug} image ${idx}` },
      file: { data: fileBuffer, mimetype: mimeType, name: filename, size: fileBuffer.length },
    })
    return media.id as number
  } catch (err: any) {
    console.log(`  ✗ Media failed: ${err.message}`)
    return null
  }
}

async function findOrCreateBrand(payload: any, title: string): Promise<number> {
  const existing = await payload.find({ collection: 'brands', where: { title: { equals: title } }, limit: 1, overrideAccess: true })
  if (existing.docs.length > 0) return existing.docs[0].id as number
  const brand = await payload.create({ collection: 'brands', data: { title }, overrideAccess: true })
  return brand.id as number
}

async function findOrCreateCategory(payload: any, title: string): Promise<number> {
  const existing = await payload.find({ collection: 'categories', where: { title: { equals: title } }, limit: 1, overrideAccess: true })
  if (existing.docs.length > 0) return existing.docs[0].id as number
  const cat = await payload.create({ collection: 'categories', data: { title }, overrideAccess: true })
  return cat.id as number
}

const payload = await getPayload({ config })
const categoryId = await findOrCreateCategory(payload, 'Mixer Grinders')

// ─── Update #27: Orange Turbo 550W ───────────────────────────────────────────
console.log('\n[#27] Orange Mixer Grinder 550W Turbo — updating price...')
{
  const turboImg = 'https://bigdeals.lk/uploads/product/normal/bdlpturbon.webp'
  const mediaId = await uploadImage(payload, 'orange-mixer-grinder-550w-turbo', turboImg, 1)
  await payload.update({
    collection: 'products', id: 27, overrideAccess: true,
    data: {
      price: 11850,
      originalPrice: 13000,
      ...(mediaId ? { gallery: [{ image: mediaId }] } : {}),
      images: [{ url: turboImg, alt: 'Orange Mixer Grinder 550W Turbo' }],
    },
  })
  console.log('  ✔ Updated')
}

// ─── Update #28: Orange Victus 750W ──────────────────────────────────────────
console.log('\n[#28] Orange 750W Mixer Grinder Victus — updating price...')
{
  const victusImg = 'https://bigdeals.lk/uploads/product/normal/bdlpvictusn.webp'
  const mediaId = await uploadImage(payload, 'orange-750w-mixer-grinder-victus', victusImg, 1)
  await payload.update({
    collection: 'products', id: 28, overrideAccess: true,
    data: {
      price: 19250,
      originalPrice: 21500,
      ...(mediaId ? { gallery: [{ image: mediaId }] } : {}),
      images: [{ url: victusImg, alt: 'Orange 750W Mixer Grinder Victus' }],
    },
  })
  console.log('  ✔ Updated')
}

// ─── Update #29: Panasonic MX-AV425 ──────────────────────────────────────────
console.log('\n[#29] Panasonic MX-AV425 — updating price...')
await payload.update({
  collection: 'products', id: 29, overrideAccess: true,
  data: { price: 35699, originalPrice: 41999 },
})
console.log('  ✔ Updated')

// ─── Create: Orange Elegant 750W (catchme.lk) ─────────────────────────────────
// Scraped via MCP browser — Cloudflare blocks headless Playwright
console.log('\n[NEW] Orange Mixer Grinder Elegant 750W (catchme.lk) — creating...')
{
  const imgUrl = 'https://catchme.lk/wp-content/uploads/orange-mixer-grinder-elegant-750w-1614754340078.webp'
  const slug = 'orange-mixer-grinder-elegant-750w'
  const brandId = await findOrCreateBrand(payload, 'Orange')
  const mediaId = await uploadImage(payload, slug, imgUrl, 1)

  const features = [
    'Brand – Orange',
    'Model Name/Number – Elegant 750',
    'Usage/Application – Wet & Dry Grinding',
    'Certification – ISI',
    'Grinder Type – Grinder, Mixer, Juicer',
    'Country of Origin – Made in India',
    '230 V.Ac. only 50 Hz, 750 Watts',
    '30 Min. Rating (5 min ON / 2 min OFF)',
    '18000 R.P.M (No Load)',
    '3 Stainless Steel Jars',
    '1 Polycarbonate Juicer Jar',
  ]

  const product = await payload.create({
    collection: 'products', overrideAccess: true,
    data: {
      title: 'Orange Mixer Grinder Elegant 750W',
      slug,
      description: toLexicalRichText('750W Orange Elegant Mixer Grinder with 3 stainless steel jars and 1 polycarbonate juicer jar. ISI certified, 18000 RPM motor for wet and dry grinding.') as any,
      price: 27650,
      originalPrice: 34500,
      inStock: true,
      brand: brandId,
      categories: [categoryId],
      wattage: 750,
      jars: 4,
      features: features.map(f => ({ feature: f })),
      ...(mediaId ? { gallery: [{ image: mediaId }] } : {}),
      images: [{ url: imgUrl, alt: 'Orange Mixer Grinder Elegant 750W' }],
      _status: 'published',
    },
  })
  console.log(`  ✔ Product #${product.id} created`)
}

console.log('\n✅ All patches applied!\n')
process.exit(0)
