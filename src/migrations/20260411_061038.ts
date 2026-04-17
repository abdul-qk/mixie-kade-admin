import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`orders_shipment_events\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`status_date\` text,
  	\`status_code\` text,
  	\`status\` text,
  	\`remark\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`orders\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`orders_shipment_events_order_idx\` ON \`orders_shipment_events\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`orders_shipment_events_parent_id_idx\` ON \`orders_shipment_events\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`shipping_carrier\` text DEFAULT 'domex';`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`tracking_no\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`domex_customer_code\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`dispatched_at\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`delivered_at\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`shipment_status_code\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`shipment_status_label\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`shipment_sync_meta_last_synced_at\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`shipment_sync_meta_last_error\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`shipment_sync_meta_retry_count\` numeric DEFAULT 0;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`category\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_category\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`orders_shipment_events\`;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`category\` text DEFAULT 'mixer-grinders';`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_category\` text DEFAULT 'mixer-grinders';`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`shipping_carrier\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`tracking_no\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`domex_customer_code\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`dispatched_at\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`delivered_at\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`shipment_status_code\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`shipment_status_label\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`shipment_sync_meta_last_synced_at\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`shipment_sync_meta_last_error\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`shipment_sync_meta_retry_count\`;`)
}
