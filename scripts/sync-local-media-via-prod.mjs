/**
 * Upload local public/media files to production Payload via the REST API.
 * Production Vercel has BLOB_READ_WRITE_TOKEN at runtime — no local blob token needed.
 *
 * Prerequisites:
 *   - Admin user email/password (admin role)
 *   - Files in public/media/
 *
 * Usage:
 *   # .env: PAYLOAD_ADMIN_EMAIL, PAYLOAD_ADMIN_PASSWORD
 *   node scripts/sync-local-media-via-prod.mjs
 *   node scripts/sync-local-media-via-prod.mjs --url https://www.mixiekadai.lk
 *   node scripts/sync-local-media-via-prod.mjs --dry-run
 *   node scripts/sync-local-media-via-prod.mjs --filename 1_12-1.jpg
 */

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MEDIA_DIR = path.resolve(__dirname, '../public/media')

const args = process.argv.slice(2).filter((a) => a !== '--')

const DEFAULT_PROD_URL = 'https://www.mixiekadai.lk'

function readArg(name, fallback) {
  const i = args.indexOf(name)
  if (i >= 0 && args[i + 1]) return args[i + 1]
  return fallback
}

function resolveSiteUrl() {
  const fromFlag = readArg('--url', null)
  if (fromFlag) return fromFlag.replace(/\/$/, '')

  const candidates = [
    process.env.SITE_URL,
    process.env.PRODUCTION_URL,
    process.env.NEXT_PUBLIC_SERVER_URL,
  ].filter(Boolean)

  for (const raw of candidates) {
    if (/localhost|127\.0\.0\.1/i.test(raw)) continue
    return raw.replace(/\/$/, '')
  }

  return DEFAULT_PROD_URL
}

const SITE = resolveSiteUrl()

const DRY_RUN = args.includes('--dry-run')
const filenameFilter = readArg('--filename', null)
const EMAIL = process.env.PAYLOAD_ADMIN_EMAIL || readArg('--email', null)
const PASSWORD = process.env.PAYLOAD_ADMIN_PASSWORD || readArg('--password', null)

function mimeFromExt(ext) {
  const e = ext.toLowerCase()
  if (e === '.png') return 'image/png'
  if (e === '.webp') return 'image/webp'
  if (e === '.gif') return 'image/gif'
  if (e === '.avif') return 'image/avif'
  return 'image/jpeg'
}

async function login() {
  const loginUrl = `${SITE}/api/users/login`
  let res
  try {
    res = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    })
  } catch (err) {
    throw new Error(
      `Cannot reach ${loginUrl}. Use --url https://www.mixiekadai.lk (not localhost). ${err?.message || err}`,
    )
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(`Login failed (${res.status}): ${data?.errors?.[0]?.message || res.statusText}`)
  }
  if (data.errors?.length) {
    throw new Error(data.errors[0].message)
  }

  const cookieParts = []
  if (typeof res.headers.getSetCookie === 'function') {
    for (const c of res.headers.getSetCookie()) {
      cookieParts.push(c.split(';')[0])
    }
  } else {
    const raw = res.headers.get('set-cookie')
    if (raw) cookieParts.push(raw.split(';')[0])
  }

  return {
    cookieHeader: cookieParts.join('; '),
    token: data.token,
    user: data.user,
  }
}

async function fetchAllMedia() {
  const docs = []
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    const res = await fetch(`${SITE}/api/media?limit=100&page=${page}&depth=0`)
    if (!res.ok) {
      throw new Error(`Media list failed: HTTP ${res.status}`)
    }
    const data = await res.json()
    docs.push(...(data.docs || []))
    totalPages = data.totalPages || 1
    page += 1
  }

  return docs
}

async function uploadFile(auth, doc, filePath) {
  const filename = doc.filename
  const buffer = fs.readFileSync(filePath)
  const blob = new Blob([buffer], { type: mimeFromExt(path.extname(filename)) })
  const form = new FormData()
  form.append('file', blob, filename)
  form.append('_payload', JSON.stringify({ alt: doc.alt || filename }))

  const headers = {}
  if (auth.token) headers.Authorization = `JWT ${auth.token}`
  if (auth.cookieHeader) headers.Cookie = auth.cookieHeader

  const res = await fetch(`${SITE}/api/media/${doc.id}`, {
    method: 'PATCH',
    headers,
    body: form,
  })

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText)
    throw new Error(`HTTP ${res.status}: ${err.slice(0, 200)}`)
  }
}

async function main() {
  if (!EMAIL || !PASSWORD) {
    console.error('Set PAYLOAD_ADMIN_EMAIL and PAYLOAD_ADMIN_PASSWORD in .env')
    console.error('Or pass --email and --password')
    process.exit(1)
  }

  if (!fs.existsSync(MEDIA_DIR)) {
    console.error(`Media directory not found: ${MEDIA_DIR}`)
    process.exit(1)
  }

  console.log(`Site: ${SITE}`)
  console.log(`Admin: ${EMAIL}`)
  if (DRY_RUN) console.log('DRY RUN — no uploads\n')

  const auth = await login()
  if (!auth.user?.roles?.includes('admin')) {
    console.error('That user is not an admin. Use an admin account.')
    process.exit(1)
  }
  console.log('Logged in.\n')

  const mediaDocs = await fetchAllMedia()
  let updated = 0
  let skipped = 0
  let missing = 0
  let failed = 0

  for (const doc of mediaDocs) {
    const filename = doc.filename
    if (!filename) continue
    if (filenameFilter && filename !== filenameFilter) continue

    const filePath = path.join(MEDIA_DIR, filename)
    if (!fs.existsSync(filePath)) {
      missing += 1
      continue
    }

    if (DRY_RUN) {
      console.log(`  ○ would upload: ${filename} (media #${doc.id})`)
      skipped += 1
      continue
    }

    process.stdout.write(`  Uploading ${filename} ... `)
    try {
      await uploadFile(auth, doc, filePath)
      updated += 1
      console.log('ok')
    } catch (err) {
      failed += 1
      console.log(`FAILED: ${err?.message || err}`)
    }
  }

  console.log(
    `\nDone. uploaded=${updated} dry-run=${skipped} missing-on-disk=${missing} failed=${failed}`,
  )
  if (missing > 0) {
    console.log(`${missing} DB media rows have no matching file in public/media/`)
  }

  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err?.message || err)
  process.exit(1)
})
