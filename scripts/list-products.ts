import { createClient } from '@libsql/client/node'
import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

const db = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
})

const r = await db.execute('SELECT id, title, slug FROM products ORDER BY title')
r.rows.forEach(row => console.log(`${row.id} | ${row.slug} | ${row.title}`))
