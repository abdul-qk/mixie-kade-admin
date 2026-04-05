import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Adds `brands` collection and optional `brand` relationship on products.
 * (Scoped migration — avoids re-applying unrelated schema from a stale local DB snapshot.)
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`brands\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`generate_slug\` integer DEFAULT true,
  	\`slug\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`brands_slug_idx\` ON \`brands\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`brands_updated_at_idx\` ON \`brands\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`brands_created_at_idx\` ON \`brands\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`brand_id\` integer REFERENCES brands(id);`)
  await db.run(sql`CREATE INDEX \`products_brand_idx\` ON \`products\` (\`brand_id\`);`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_brand_id\` integer REFERENCES brands(id);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_brand_idx\` ON \`_products_v\` (\`version_brand_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`brands_id\` integer REFERENCES brands(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_brands_id_idx\` ON \`payload_locked_documents_rels\` (\`brands_id\`);`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`payload_locked_documents_rels_brands_id_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`_products_v_version_version_brand_idx\`;`)
  await db.run(sql`DROP INDEX IF EXISTS \`products_brand_idx\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` DROP COLUMN \`brands_id\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_brand_id\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`brand_id\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`DROP TABLE IF EXISTS \`brands\`;`)
}
