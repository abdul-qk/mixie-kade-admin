/**
 * add-batch-2.ts
 *
 * Adds 12 new products across 4 new categories:
 *   Coconut Scrapers (3), Mini Grinders & Veg Choppers (5), Juice Blenders (2), Wet Grinders (2)
 *
 * Run: node --env-file=.env --import tsx/esm scripts/add-batch-2.ts
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
      const m = await payload.create({
        collection: 'media', overrideAccess: true,
        data: { alt: `${slug} image ${i + 1}` },
        file: { data: buf, mimetype: mime, name: filename, size: buf.length },
      })
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
  brand: number; categoryId: number; wattage?: number; jars?: number
  warranty?: string; features: string[]; description: string
  imageUrls: string[]; mediaIds: number[]
}) {
  return payload.create({
    collection: 'products', overrideAccess: true,
    data: {
      title: data.title,
      slug: data.slug,
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
      ...(data.imageUrls.length > 0 ? { images: data.imageUrls.map(u => ({ url: u, alt: data.title })) } : {}),
      _status: 'published',
    },
  })
}

const payload = await getPayload({ config })

const coconutCatId    = await findOrCreate(payload, 'categories', 'Coconut Scrapers')
const miniCatId       = await findOrCreate(payload, 'categories', 'Mini Grinders & Veg Choppers')
const blendersCatId   = await findOrCreate(payload, 'categories', 'Juice Blenders')
const wetGrinderCatId = await findOrCreate(payload, 'categories', 'Wet Grinders')

// ════════════════════════════════════════════════════════════════════════════
//  COCONUT SCRAPERS
// ════════════════════════════════════════════════════════════════════════════

// ─── 1. Odiris A8 (odiris.lk) ────────────────────────────────────────────
console.log('\n► Odiris A8 Coconut Scraper with Cover (odiris.lk)')
{
  const slug = 'odiris-a8-coconut-scraper-with-cover'
  const brandId = await findOrCreate(payload, 'brands', 'Odiris')
  const imageUrls = [
    'https://odiris.lk/wp-content/uploads/odiris-a8-coconut-scraper-with-cover-sri-lanka.jpg',
    'https://odiris.lk/wp-content/uploads/scraper-blade-cover200-1.jpg',
  ]
  const mediaIds = await uploadImages(payload, slug, imageUrls)
  const p = await createProduct(payload, {
    title: 'Odiris A8 Coconut Scraper with Cover',
    slug, price: 3850, brand: brandId, categoryId: coconutCatId,
    features: [
      'Stainless steel scraping blade — rust resistant and sharp',
      'Ergonomic hand-turned wooden handle for smooth operation',
      'Secure table clamp fits standard kitchen countertops',
      'Protective blade cover included for safe storage',
      'Compact dimensions: 22.35 x 16 x 6.6 cm',
      'Weight: 862 grams — sturdy yet easy to use',
      "Sri Lanka's original coconut scraper since 1952",
    ],
    description: "The Odiris A8 coconut scraper with protective blade cover — Sri Lanka's original hand-operated coconut grater since 1952. Stainless steel blade, table clamp mount, ergonomic wooden handle.",
    imageUrls, mediaIds,
  })
  console.log(`  ✔ Product #${p.id} created`)
}

// ─── 2. Brewine Coconut Scraper & Citrus Press 2-in-1 (brewine.in) ─────────
console.log('\n► Brewine Coconut Scraper & Citrus Press 2-in-1 (brewine.in)')
{
  const slug = 'brewine-coconut-scraper-citrus-press-2-in-1'
  const brandId = await findOrCreate(payload, 'brands', 'Brewine')
  const imageUrls = [
    'https://brewine.in/images/products/original/cb96597fc91d9ffc9e355153208afe67.png',
    'https://brewine.in/images/products/original/9c4aa7e342819f574eb8de9771aca6f6.png',
    'https://brewine.in/images/products/original/26fedf27e98280121701d3e2fb38f70f.png',
    'https://brewine.in/images/products/original/1cc8492fa735f2ea461daefb761dd5bb.png',
  ]
  const mediaIds = await uploadImages(payload, slug, imageUrls)
  const p = await createProduct(payload, {
    title: 'Brewine Coconut Scraper & Citrus Press 2-in-1',
    slug, price: 13750, brand: brandId, categoryId: coconutCatId, wattage: 200,
    features: [
      'Dual functionality: coconut scraping and citrus juicing in one appliance',
      '200W High Torque Copper Motor for efficient and powerful operation',
      'Two-Speed Options for coconut scraping or citrus juicing',
      '304 Stainless Steel Scraping Blade with rounded teeth edges',
      'Specially Designed Citrus Press Cone for maximum juice extraction',
      'Splash Cover with Pulp and Seed Collector keeps kitchen clean',
      'Super Suction Feet for superior stability on any surface',
      'Cooling Fan for Ventilation prevents motor overheating',
      'Shock-Proof ABS Body for kitchen durability and safety',
    ],
    description: '200W Brewine 2-in-1 Coconut Scraper and Citrus Press. Dual functionality with 304 stainless steel scraping blade, two-speed operation, and shock-proof ABS body.',
    imageUrls, mediaIds,
  })
  console.log(`  ✔ Product #${p.id} created`)
}

// ─── 3. Lakro LCS-009 (lakroinventions.com) ────────────────────────────────
console.log('\n► Lakro Electric Coconut Scraper Machine LCS-009 (lakroinventions.com)')
{
  const slug = 'lakro-electric-coconut-scraper-lcs-009'
  const brandId = await findOrCreate(payload, 'brands', 'Lakro')
  const imageUrls = [
    'https://lakroinventions.com/wp-content/uploads/2025/02/Coconut-Scraper-Machine-%E2%80%93-LCS-009-1-1.jpg',
    'https://lakroinventions.com/wp-content/uploads/2025/02/Coconut-Scraper-Machine-%E2%80%93-LCS-009-2.jpg',
    'https://lakroinventions.com/wp-content/uploads/2025/02/Coconut-Scraper-Machine-%E2%80%93-LCS-009-3.jpg',
    'https://lakroinventions.com/wp-content/uploads/2025/02/Coconut-Scraper-Machine-%E2%80%93-LCS-009-4.jpg',
  ]
  const mediaIds = await uploadImages(payload, slug, imageUrls)
  const p = await createProduct(payload, {
    title: 'Lakro Electric Coconut Scraper Machine (LCS-009)',
    slug, price: 13750, brand: brandId, categoryId: coconutCatId, wattage: 150,
    features: [
      "Housewives' friendly design for easy coconut scraping",
      'Saves time with fast electric operation',
      '100% safety with built-in safety control switch',
      'Easy to operate — press button start',
      'Low power consumption: 150W',
      'Stainless steel scraping blade',
      'Extracts more coconut milk efficiently',
      'Easy to carry, compact design',
      'Speed control switch',
      'Press button safety switch',
    ],
    description: '150W Lakro LCS-009 Electric Coconut Scraper Machine. Stainless steel blade, speed control, press-button safety switch, designed for household use.',
    imageUrls, mediaIds,
  })
  console.log(`  ✔ Product #${p.id} created`)
}

// ════════════════════════════════════════════════════════════════════════════
//  MINI GRINDERS & VEG CHOPPERS
// ════════════════════════════════════════════════════════════════════════════

// ─── 4. Greenlife Food Chopper 300W (greenlifesl.lk) ───────────────────────
console.log('\n► Greenlife 2L Electric Food Chopper & Meat Grinder 300W (greenlifesl.lk)')
{
  const slug = 'greenlife-2l-food-chopper-meat-grinder-300w'
  const brandId = await findOrCreate(payload, 'brands', 'Greenlife')
  const imageUrls = [
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/vegetable-chopper-box-front.png?v=1775832811',
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/best-food-chopper-sri-lanka.jpg?v=1775832811',
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/meat-grinder-price-sri-lanka.jpg?v=1775832811',
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/greenlife-2l-chopper-unit.png?v=1775830214',
  ]
  const mediaIds = await uploadImages(payload, slug, imageUrls)
  const p = await createProduct(payload, {
    title: 'Greenlife 2L Electric Food Chopper & Meat Grinder (300W)',
    slug, price: 3900, brand: brandId, categoryId: miniCatId, wattage: 300,
    features: [
      'Large 2L stainless steel bowl for family meals and batch processing',
      'Powerful 300W Motor handles soft vegetables to tough meats',
      'High-Quality 4-Blade System with stainless steel knives',
      'Two-Speed Control: Speed I and Speed II for different textures',
      'Steel Bearing Head for enhanced durability and longer lifespan',
      'Hygienic SUS Stainless Steel bowl — easy to clean and odor-resistant',
      'Double Cover Design prevents splashing during high-speed operation',
      '1-Year Warranty against manufacturing defects',
    ],
    description: '300W Greenlife 2L Electric Food Chopper and Meat Grinder. 4-blade stainless steel system, two-speed control, 2L SUS bowl, 1-year warranty.',
    imageUrls, mediaIds,
  })
  console.log(`  ✔ Product #${p.id} created`)
}

// ─── 5. Greenchef Flen Mixer Grinder 1HP (greenlifesl.lk) ──────────────────
console.log('\n► Greenchef Flen Mixer Grinder 1HP with 3 Jars (greenlifesl.lk)')
{
  const slug = 'greenchef-flen-mixer-grinder-1hp-3-jars'
  const brandId = await findOrCreate(payload, 'brands', 'Greenchef')
  const imageUrls = [
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/k3.jpg?v=1756635610',
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/GreenChef_Flen_Mixer_Grinder_1HP_Complete_Set_-_Greenlifesl.lk_Sri_Lanka_Kitchen_Appliances.jpg?v=1756635610',
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/GreenChef_Flen_1HP_Mixer_Grinder_Side_View_-_Premium_Kitchen_Appliance_Sri_Lanka_Greenlifesl.lk.jpg?v=1756635610',
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/GreenChef_Flen_Powerful_1HP_Motor_-_Authorized_Importer_Greenlifesl.lk_Colombo_Sri_Lanka.jpg?v=1756635610',
  ]
  const mediaIds = await uploadImages(payload, slug, imageUrls)
  const p = await createProduct(payload, {
    title: 'Greenchef Flen Mixer Grinder 1HP with 3 Jars',
    slug, price: 1950, brand: brandId, categoryId: miniCatId, wattage: 750, jars: 3,
    features: [
      'Powerful 1HP (750W) motor for efficient grinding',
      'Three stainless steel jars: grinding, chutney, and juicing',
      'Overload protection for motor safety',
      'Durable ABS body construction',
      'Perfect for Sri Lankan spice grinding and curry preparation',
      'Easy to clean and maintain',
    ],
    description: 'Greenchef Flen 1HP Mixer Grinder with 3 stainless steel jars. 750W motor with overload protection, ideal for spice grinding, chutneys, and juicing.',
    imageUrls, mediaIds,
  })
  console.log(`  ✔ Product #${p.id} created`)
}

// ─── 6. Greenlife Coffee Grinder 2-in-1 (greenlifesl.lk) ───────────────────
console.log('\n► Greenlife 2-in-1 Coffee Grinder & Juice Blender 300W (greenlifesl.lk)')
{
  const slug = 'greenlife-2-in-1-coffee-grinder-juice-blender-300w'
  const brandId = await findOrCreate(payload, 'brands', 'Greenlife')
  const imageUrls = [
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/greenlife-product-box-front.png?v=1775832861',
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/best-coffee-grinder-sri-lanka.jpg?v=1775832861',
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/juice-blender-price-sri-lanka.jpg?v=1775832861',
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/electric-spice-grinder-machine.jpg?v=1775832861',
  ]
  const mediaIds = await uploadImages(payload, slug, imageUrls)
  const p = await createProduct(payload, {
    title: 'Greenlife 2-in-1 Coffee Grinder & Juice Blender (300W)',
    slug, price: 3300, brand: brandId, categoryId: miniCatId, wattage: 300,
    features: [
      'Dual functionality: coffee/spice grinding and juice blending',
      '300W motor for efficient grinding and blending',
      'Stainless steel grinding blades for clean, precise results',
      'Separate grinding and blending attachments included',
      'Compact design suitable for any kitchen counter',
    ],
    description: '300W Greenlife 2-in-1 Coffee Grinder and Juice Blender. Versatile dual-function appliance for grinding coffee, spices, and blending fresh juices.',
    imageUrls, mediaIds,
  })
  console.log(`  ✔ Product #${p.id} created`)
}

// ─── 7. Premier Spice Grinder 350W (amazon.in) ─────────────────────────────
console.log('\n► Premier Spice Grinder 350W (amazon.in)')
{
  const slug = 'premier-spice-grinder-350w'
  const brandId = await findOrCreate(payload, 'brands', 'Premier')
  const imageUrls = [
    'https://m.media-amazon.com/images/I/61V9Y7ziARL.jpg',
  ]
  const mediaIds = await uploadImages(payload, slug, imageUrls)
  const p = await createProduct(payload, {
    title: 'Premier Spice Grinder 350W Wet & Dry Multifunction',
    slug, price: 8900, brand: brandId, categoryId: miniCatId, wattage: 350,
    features: [
      'Powerful 350W motor for efficient wet and dry grinding',
      'Stainless steel detachable jar and blades for durability',
      '350ml capacity — compact, easy to use for home and office',
      'Portable and lightweight design',
      'Interlocking safety feature — operates only when lid is secured',
      'Simple On/Off switch with clear polycarbonate lid',
      'Versatile: grinds coffee beans, spices, nuts, and herbs',
    ],
    description: '350W Premier Spice Grinder for wet and dry grinding. Stainless steel detachable jar, 350ml capacity, interlocking safety lid. Grinds coffee, spices, nuts, and herbs.',
    imageUrls, mediaIds,
  })
  console.log(`  ✔ Product #${p.id} created`)
}

// ─── 8. Brewine USB Cordless Vegetable Chopper (amazon.in) ─────────────────
console.log('\n► Brewine USB Cordless Vegetable Chopper & Garlic Peeler (amazon.in)')
{
  const slug = 'brewine-usb-cordless-vegetable-chopper'
  const brandId = await findOrCreate(payload, 'brands', 'Brewine')
  const imageUrls = [
    'https://m.media-amazon.com/images/I/51yY-e3L74L.jpg',
  ]
  const mediaIds = await uploadImages(payload, slug, imageUrls)
  const p = await createProduct(payload, {
    title: 'Brewine USB Cordless Vegetable Chopper & Garlic Peeler',
    slug, price: 12750, brand: brandId, categoryId: miniCatId, wattage: 75,
    warranty: '1 Year',
    features: [
      'Versatile: chop, mince, puree, and whisk with stainless steel blades',
      '400ml glass bowl + 3 x 200ml mini bowls included',
      'USB rechargeable — no batteries required (2000mAh x 2)',
      'One-touch operation with anti-skid pad for safe use',
      'Includes garlic peeler attachment for quick clove peeling',
      '1 charge = 10 cycles, each cycle 40 seconds',
    ],
    description: 'USB rechargeable Brewine cordless vegetable chopper with 400ml glass bowl and garlic peeler. 75W motor, stainless steel blades, 3 mini bowls included. 1-year warranty.',
    imageUrls, mediaIds,
  })
  console.log(`  ✔ Product #${p.id} created`)
}

// ════════════════════════════════════════════════════════════════════════════
//  JUICE BLENDERS
// ════════════════════════════════════════════════════════════════════════════

// ─── 9. Greenlife Juicer Blender 300W (greenlifesl.lk) ─────────────────────
console.log('\n► Green Life Electric Juicer Blender 300W (greenlifesl.lk)')
{
  const slug = 'greenlife-electric-juicer-blender-300w'
  const brandId = await findOrCreate(payload, 'brands', 'Greenlife')
  const imageUrls = [
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/green-life-electric-juicer-blender-300w-main-product-sri-lanka.jpg?v=1757507359',
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/green-life-300w-juicer-blender-side-view-sri-lanka.jpg?v=1757507386',
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/green-life-juicer-blender-jars-detail-smoothie-juice-sri-lanka.jpg?v=1757507398',
    'https://cdn.shopify.com/s/files/1/0686/0249/5152/files/green-life-300w-blender-in-use-kitchen-sri-lanka.jpg?v=1757507409',
  ]
  const mediaIds = await uploadImages(payload, slug, imageUrls)
  const p = await createProduct(payload, {
    title: 'Green Life Electric Juicer Blender 300W with 2 Jars',
    slug, price: 6750, brand: brandId, categoryId: blendersCatId, wattage: 300,
    features: [
      'Powerful 300W motor for juicing, blending, grinding, and mixing',
      '2 multipurpose jars: 2L blending jar and 800ml grinding jar',
      'Makes fresh juices, smoothies, and health drinks',
      'Simple to operate and easy to clean components',
      'Affordable all-in-one electric juicer blender',
    ],
    description: '300W Green Life Electric Juicer Blender with 2L blending jar and 800ml grinding jar. Makes juices, smoothies, and health drinks with ease.',
    imageUrls, mediaIds,
  })
  console.log(`  ✔ Product #${p.id} created`)
}

// ─── 10. Magic Bullet Complete 21-Piece (bamagate.com — Cloudflare blocked) ──
console.log('\n► Magic Bullet Complete 21-Piece Blender System (bamagate.com)')
{
  const slug = 'magic-bullet-complete-21-piece'
  const brandId = await findOrCreate(payload, 'brands', 'Magic Bullet')
  const p = await createProduct(payload, {
    title: 'Magic Bullet Complete 21-Piece Blender System',
    slug, price: 9800, brand: brandId, categoryId: blendersCatId, wattage: 200,
    features: [
      '21-piece complete blender and food processor system',
      '200W high-torque power base',
      'Multiple cups and mugs for different serving sizes',
      'Cross blade for blending, smoothies, and shakes',
      'Flat blade for food processing',
      'Dishwasher-safe components for easy cleaning',
      'Compact design fits on any countertop',
    ],
    description: '200W Magic Bullet Complete 21-Piece Blender System. Includes multiple cups, mugs, cross blade, flat blade, and accessories for blending, smoothies, and food processing.',
    imageUrls: [], mediaIds: [],
  })
  console.log(`  ✔ Product #${p.id} created  (⚠ no images — bamagate.com blocked headless browser, add via admin)`)
}

// ════════════════════════════════════════════════════════════════════════════
//  WET GRINDERS
// ════════════════════════════════════════════════════════════════════════════

// ─── 11. Preethi Lavender Mixer Grinder (maxbo.lk) ─────────────────────────
console.log('\n► Preethi Lavender Mixer Grinder (maxbo.lk)')
{
  const slug = 'preethi-lavender-mixer-grinder'
  const brandId = await findOrCreate(payload, 'brands', 'Preethi')
  const imageUrls = [
    'https://i0.wp.com/maxbo.lk/wp-content/uploads/2021/09/preethi_lavender-1a.jpg?fit=600%2C600&ssl=1',
    'https://i0.wp.com/maxbo.lk/wp-content/uploads/2021/09/preethi_lavender-2.jpg?fit=400%2C400&ssl=1',
  ]
  const mediaIds = await uploadImages(payload, slug, imageUrls)
  const p = await createProduct(payload, {
    title: 'Preethi Lavender Mixer Grinder 750W 3 Jars',
    slug, price: 27500, brand: brandId, categoryId: wetGrinderCatId, wattage: 750, jars: 3,
    features: [
      '750W powerful motor for heavy-duty grinding',
      '3 stainless steel jars for versatile grinding needs',
      'Elegant lavender design for the modern kitchen',
      'Suitable for wet and dry grinding',
      'ISI certified for safety and quality',
      'Compact footprint saves counter space',
    ],
    description: '750W Preethi Lavender Mixer Grinder with 3 stainless steel jars. ISI certified, powerful performance with elegant design for all wet and dry grinding needs.',
    imageUrls, mediaIds,
  })
  console.log(`  ✔ Product #${p.id} created`)
}

// ─── 12. Greenchef Turbojet Wet Grinder 2L (greenchef.in — SSL invalid) ─────
console.log('\n► Greenchef Turbojet Wet Grinder 2 Litre (greenchef.in)')
{
  const slug = 'greenchef-turbojet-wet-grinder-2l'
  const brandId = await findOrCreate(payload, 'brands', 'Greenchef')
  const p = await createProduct(payload, {
    title: 'Greenchef Turbojet Wet Grinder 2 Litre',
    slug, price: 24750, brand: brandId, categoryId: wetGrinderCatId, wattage: 150,
    features: [
      '2 Litre drum capacity for family-sized batches',
      '150W powerful motor for efficient wet grinding',
      'Ideal for idly batter, dosa batter, and rice preparations',
      'Stainless steel drum for hygiene and durability',
      'Compact and lightweight design',
      'Suitable for all traditional wet grinding needs',
    ],
    description: '150W Greenchef Turbojet 2L Wet Grinder. Ideal for idly, dosa batter, and rice preparations. Stainless steel drum with compact design.',
    imageUrls: [], mediaIds: [],
  })
  console.log(`  ✔ Product #${p.id} created  (⚠ no images — greenchef.in SSL expired, add via admin)`)
}

console.log('\n✅ Batch 2 complete — 12 products across 4 categories!\n')
process.exit(0)
