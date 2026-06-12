/**
 * clear-shipping-costs.ts
 *
 * Sets shippingCost to null on all products so the global default
 * from Shop Settings is used at checkout.
 *
 * Run with:
 *   node --env-file=.env --import tsx/esm scripts/clear-shipping-costs.ts
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'

const payload = await getPayload({ config })

const { docs: products, totalDocs } = await payload.find({
  collection: 'products',
  limit: 1000,
  overrideAccess: true,
  select: { id: true, title: true, shippingCost: true },
})

console.log(`Found ${totalDocs} product(s)`)

let updated = 0
let skipped = 0

const failed: { id: number; title: string; error: string }[] = []

for (const product of products) {
  if (product.shippingCost == null) {
    console.log(`  — #${product.id} "${product.title}" already empty, skip`)
    skipped++
    continue
  }
  try {
    await payload.update({
      collection: 'products',
      id: product.id,
      overrideAccess: true,
      data: { shippingCost: null },
    })
    console.log(`  ✔ #${product.id} "${product.title}" cleared (was ${product.shippingCost})`)
    updated++
  } catch (err: any) {
    console.log(`  ✗ #${product.id} "${product.title}" FAILED: ${err.message}`)
    failed.push({ id: product.id, title: product.title, error: err.message })
  }
}

console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}, Failed: ${failed.length}`)
if (failed.length > 0) {
  console.log('\nFailed products:')
  for (const f of failed) console.log(`  #${f.id} "${f.title}": ${f.error}`)
}
process.exit(failed.length > 0 ? 1 : 0)
