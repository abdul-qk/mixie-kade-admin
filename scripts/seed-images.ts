/**
 * seed-images.ts
 *
 * Downloads images from each product's `images[]` field (Shopify CDN URLs),
 * uploads them to Payload's Media collection, and links them to the product's
 * `gallery` field.
 *
 * Run with:  npx tsx --tsconfig tsconfig.json scripts/seed-images.ts
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
const MEDIA_DIR  = path.resolve(__dirname, '../public/media')

// Ensure media directory exists
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true })

// ─── helpers ─────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function extFromUrl(url: string): string {
  const u    = new URL(url)
  const ext  = path.extname(u.pathname).toLowerCase()
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'].includes(ext) ? ext : '.jpg'
}

async function downloadFile(url: string, destPath: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  const buf = await res.arrayBuffer()
  fs.writeFileSync(destPath, Buffer.from(buf))
}

// ─── main ────────────────────────────────────────────────────────────────────

const payload = await getPayload({ config })

// Fetch all products including their custom images[] field
const { docs: products } = await payload.find({
  collection: 'products',
  limit: 200,
  depth: 0,
  overrideAccess: true,
})

console.log(`\nFound ${products.length} products.\n`)

for (const product of products) {
  const images = (product as any).images as Array<{ id: string; url: string; alt: string }> | undefined

  if (!images || images.length === 0) {
    console.log(`  ⚠  ${product.title} — no images, skipping`)
    continue
  }

  // Skip if gallery already populated
  const gallery = product.gallery as any[] | undefined
  if (gallery && gallery.length > 0) {
    console.log(`  ✓  ${product.title} — gallery already has ${gallery.length} image(s), skipping`)
    continue
  }

  console.log(`\n► ${product.title} (${images.length} image(s))`)

  const mediaIds: number[] = []

  for (let i = 0; i < images.length; i++) {
    const img     = images[i]!
    const ext     = extFromUrl(img.url)
    const slug    = slugify(`${product.slug}-${i + 1}`)
    const filename = `${slug}${ext}`
    const destPath = path.join(MEDIA_DIR, filename)

    // Download image
    process.stdout.write(`  [${i + 1}/${images.length}] Downloading ${filename} ... `)
    try {
      if (fs.existsSync(destPath)) {
        console.log('already exists, reusing')
      } else {
        await downloadFile(img.url, destPath)
        console.log('done')
      }
    } catch (err: any) {
      console.log(`FAILED: ${err.message}`)
      continue
    }

    // Create Media record in Payload
    const fileBuffer = fs.readFileSync(destPath)
    const mimeType   = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'

    try {
      const media = await payload.create({
        collection: 'media',
        overrideAccess: true,
        data: { alt: img.alt || product.title },
        file: {
          data:     fileBuffer,
          mimetype: mimeType,
          name:     filename,
          size:     fileBuffer.length,
        },
      })
      mediaIds.push(media.id as number)
      console.log(`     → Media #${media.id} created`)
    } catch (err: any) {
      console.log(`  ✗  Failed to create media record: ${err.message}`)
    }
  }

  if (mediaIds.length === 0) {
    console.log(`  ✗  No media created for ${product.title}`)
    continue
  }

  // Update product gallery
  await payload.update({
    collection: 'products',
    id:          product.id as number,
    overrideAccess: true,
    data: {
      gallery: mediaIds.map((id) => ({ image: id })),
    },
  })

  console.log(`  ✔  Gallery updated with ${mediaIds.length} image(s)`)
}

console.log('\n✅  All done!\n')
process.exit(0)
