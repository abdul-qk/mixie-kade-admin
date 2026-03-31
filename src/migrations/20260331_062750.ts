import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`products_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`feature\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_features_order_idx\` ON \`products_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_features_parent_id_idx\` ON \`products_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`url\` text,
  	\`alt\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_images_order_idx\` ON \`products_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_images_parent_id_idx\` ON \`products_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_features\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`feature\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_features_order_idx\` ON \`_products_v_version_features\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_features_parent_id_idx\` ON \`_products_v_version_features\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`url\` text,
  	\`alt\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_images_order_idx\` ON \`_products_v_version_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_images_parent_id_idx\` ON \`_products_v_version_images\` (\`_parent_id\`);`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`category\` text DEFAULT 'mixer-grinders';`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`in_stock\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`price\` numeric;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`original_price\` numeric;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`wattage\` numeric;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`jars\` numeric;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`warranty\` text;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_category\` text DEFAULT 'mixer-grinders';`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_in_stock\` integer DEFAULT true;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_price\` numeric;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_original_price\` numeric;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_wattage\` numeric;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_jars\` numeric;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_warranty\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`customer_name\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`customer_phone\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`delivery_address\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`delivery_city\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`cod_items_json\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`cod_notes\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`products_features\`;`)
  await db.run(sql`DROP TABLE \`products_images\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_features\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_images\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`category\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`in_stock\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`price\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`original_price\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`wattage\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`jars\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`warranty\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_category\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_in_stock\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_price\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_original_price\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_wattage\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_jars\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_warranty\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`customer_name\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`customer_phone\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`delivery_address\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`delivery_city\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`cod_items_json\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`cod_notes\`;`)
}
