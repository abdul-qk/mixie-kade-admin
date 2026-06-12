import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

dotenv.config({ path: '.env' })

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function main() {
  const to = process.argv[2] || process.env.PAYLOAD_ADMIN_EMAIL
  if (!to) {
    console.error('Usage: npx tsx scripts/test-email.ts your@email.com')
    process.exit(1)
  }

  console.log(`Sending test email to ${to} via ${process.env.SMTP_HOST}…`)

  await transport.sendMail({
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
    to,
    subject: 'Mixie Kade – SMTP test',
    html: '<p>SMTP is working. Order confirmation emails are ready.</p>',
  })

  console.log('Done.')
}

main().catch((err) => {
  console.error('Failed:', err.message)
  process.exit(1)
})
