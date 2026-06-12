import type { Payload } from 'payload'

import { getServerSideURL } from '@/utilities/getURL'

type OrderEmailArgs = {
  payload: Payload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any
}

export async function sendOrderConfirmationToCustomer({ payload, order }: OrderEmailArgs) {
  const email = order.customerEmail
  if (!email) return

  const serverURL = getServerSideURL()
  const orderURL = `${serverURL}/orders/${order.id}?email=${encodeURIComponent(email)}&accessToken=${order.accessToken}`

  let itemsHtml = ''
  if (order.codItemsJson) {
    try {
      const items = JSON.parse(order.codItemsJson)
      if (Array.isArray(items) && items.length > 0) {
        itemsHtml = `
          <h3 style="margin-top:16px;">Items Ordered</h3>
          <ul style="padding-left:20px;">
            ${items.map((item: { title?: string; name?: string; quantity?: number }) => `<li>${item.title || item.name || 'Item'} × ${item.quantity || 1}</li>`).join('')}
          </ul>`
      }
    } catch {
      // codItemsJson malformed — skip items list
    }
  }

  const paymentLabel =
    order.paymentMethod === 'bank_transfer' ? 'Online Bank Transfer' : 'Cash on Delivery'

  await payload.sendEmail({
    to: email,
    subject: `Order Confirmed – #${order.id} | Mixie Kade`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
        <h1 style="color:#c8a96e;">Thank you for your order!</h1>
        <p>Hi ${order.customerName || 'there'},</p>
        <p>We've received your order and will process it shortly.</p>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#555;">Order #</td><td><strong>${order.id}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#555;">Payment</td><td>${paymentLabel}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Total</td><td><strong>LKR ${Number(order.amount || 0).toFixed(2)}</strong></td></tr>
        </table>

        ${itemsHtml}

        <p style="margin-top:24px;">
          <a href="${orderURL}" style="background:#c8a96e;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;">
            View Your Order
          </a>
        </p>

        <hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />
        <p style="color:#888;font-size:13px;">
          Questions? Reply to this email or reach us on WhatsApp.<br />
          – Mixie Kade
        </p>
      </div>
    `,
  })
}

export async function sendOrderNotificationToAdmin({ payload, order }: OrderEmailArgs) {
  const adminEmail = process.env.PAYLOAD_ADMIN_EMAIL
  if (!adminEmail) return

  const serverURL = getServerSideURL()
  const adminOrderURL = `${serverURL}/admin/collections/orders/${order.id}`
  const paymentLabel =
    order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash on Delivery'

  await payload.sendEmail({
    to: adminEmail,
    subject: `New Order #${order.id} – ${order.customerName || order.customerEmail || 'Unknown'}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a;">
        <h1 style="color:#c8a96e;">New Order Received</h1>

        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#555;width:140px;">Order #</td><td><strong>${order.id}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#555;">Customer</td><td>${order.customerName || '–'}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Email</td><td>${order.customerEmail || '–'}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Phone</td><td>${order.customerPhone || '–'}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">City</td><td>${order.deliveryCity || '–'}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Payment</td><td>${paymentLabel}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Total</td><td><strong>LKR ${Number(order.amount || 0).toFixed(2)}</strong></td></tr>
        </table>

        <p style="margin-top:24px;">
          <a href="${adminOrderURL}" style="background:#1a1a1a;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;display:inline-block;">
            Open in Admin
          </a>
        </p>
      </div>
    `,
  })
}
