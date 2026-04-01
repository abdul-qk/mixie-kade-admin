#!/usr/bin/env node
/**
 * Runs `payload migrate` during builds. On CI (Vercel, GitHub Actions, etc.) there is no TTY,
 * so Payload's Drizzle adapter cannot show the "dev mode / data loss" confirm prompt — the build
 * would hang. When CI or VERCEL is set, we answer `y` once so migrations can proceed.
 *
 * Long-term fix: remove the dev migration marker from your database (see Payload issue #7986):
 * delete the `payload-migrations` row with batch -1, or avoid `push`/dev schema sync against prod.
 */
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const isCi = Boolean(process.env.CI || process.env.VERCEL)

const nodeOpts =
  process.env.NODE_OPTIONS || '--no-deprecation --max-old-space-size=8000'
const env = { ...process.env, NODE_OPTIONS: nodeOpts }

const payloadBin = path.join(root, 'node_modules', 'payload', 'dist', 'bin', 'index.js')

const result = spawnSync(process.execPath, [payloadBin, 'migrate'], {
  cwd: root,
  env,
  ...(isCi
    ? { stdio: ['pipe', 'inherit', 'inherit'], input: 'y\n' }
    : { stdio: 'inherit' }),
})

if (result.error) {
  console.error(result.error)
  process.exit(1)
}

process.exit(result.status === null ? 1 : result.status)
