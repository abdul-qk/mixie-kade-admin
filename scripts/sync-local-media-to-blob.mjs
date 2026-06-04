/**
 * Re-upload files from public/media into Payload so they land in Vercel Blob
 * (when BLOB_READ_WRITE_TOKEN is set). Fixes broken `/api/media/file/…` URLs on Vercel.
 *
 * Prerequisites:
 *   - .env with DATABASE_URL (+ DATABASE_AUTH_TOKEN for Turso) pointing at the target DB
 *   - BLOB_READ_WRITE_TOKEN from your Vercel Blob store
 *   - Image files present under public/media/ (from import scripts or admin exports)
 *
 * Usage:
 *   node scripts/sync-local-media-to-blob.mjs
 *   node scripts/sync-local-media-to-blob.mjs --dry-run
 *   node scripts/sync-local-media-to-blob.mjs --filename 1_12-1.jpg
 */

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MEDIA_DIR = path.resolve(__dirname, '../public/media')

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const filenameFilter = (() => {
  const i = args.indexOf('--filename')
  return i >= 0 && args[i + 1] ? args[i + 1] : null
})()

function mimeFromExt(ext) {
  const e = ext.toLowerCase()
  if (e === '.png') return 'image/png'
  if (e === '.webp') return 'image/webp'
  if (e === '.gif') return 'image/gif'
  if (e === '.avif') return 'image/avif'
  return 'image/jpeg'
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('Missing BLOB_READ_WRITE_TOKEN. Add Vercel Blob to the project and set the token in .env')
    process.exit(1)
  }

  if (!fs.existsSync(MEDIA_DIR)) {
    console.error(`Media directory not found: ${MEDIA_DIR}`)
    console.error('Run import scripts locally first, or copy files into public/media/')
    process.exit(1)
  }

  const { getPayload } = await import('payload')
  const { default: config } = await import('../src/payload.config.ts')

  const payload = await getPayload({ config })

  let page = 1
  let totalPages = 1
  let updated = 0
  let skipped = 0
  let missing = 0

  while (page <= totalPages) {
    const result = await payload.find({
      collection: 'media',
      limit: 100,
      page,
      depth: 0,
      overrideAccess: true,
    })
    totalPages = result.totalPages || 1

    for (const doc of result.docs) {
      const filename = doc.filename
      if (!filename) continue
      if (filenameFilter && filename !== filenameFilter) continue

      const filePath = path.join(MEDIA_DIR, filename)
      if (!fs.existsSync(filePath)) {
        missing += 1
        console.log(`  ✗ missing on disk: ${filename} (media #${doc.id})`)
        continue
      }

      if (DRY_RUN) {
        console.log(`  ○ would upload: ${filename} (media #${doc.id})`)
        skipped += 1
        continue
      }

      const buffer = fs.readFileSync(filePath)
      try {
        await payload.update({
          collection: 'media',
          id: doc.id,
          overrideAccess: true,
          data: {
            alt: doc.alt || filename,
          },
          file: {
            data: buffer,
            mimetype: mimeFromExt(path.extname(filename)),
            name: filename,
            size: buffer.length,
          },
        })
        updated += 1
        console.log(`  ✓ uploaded: ${filename} (media #${doc.id})`)
      } catch (err) {
        console.log(`  ✗ failed ${filename}: ${err?.message || err}`)
      }
    }

    page += 1
  }

  console.log(`\nDone. uploaded=${updated} dry-run/missing-on-disk=${skipped + missing} missing=${missing}`)
  if (missing > 0) {
    console.log('Re-run import scripts for products whose files are not in public/media/, then run this again.')
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err?.message || err)
  process.exit(1)
})
