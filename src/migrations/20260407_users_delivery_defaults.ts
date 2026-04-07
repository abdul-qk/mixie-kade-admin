import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-sqlite'

/**
 * Adds saved delivery city and address on users (account settings + checkout prefill).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` ADD \`delivery_city\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`delivery_address\` text;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`delivery_city\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`delivery_address\`;`)
}
