import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb, initDb } from '@/lib/db';

function verifyWooCommerceSignature(payload: string, signature: string, secret: string): boolean {
  const computed = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('base64');
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature));
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('x-wc-webhook-signature') ?? '';
    const secret = process.env.WC_WEBHOOK_SECRET!;

    if (!verifyWooCommerceSignature(payload, signature, secret)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const order = JSON.parse(payload);

    const orderId = String(order.id);
    const customerEmail = order.billing?.email;
    const customerName = `${order.billing?.first_name ?? ''} ${order.billing?.last_name ?? ''}`.trim();
    const productNames = (order.line_items ?? [])
      .map((item: { name: string }) => item.name)
      .join(', ');
    const purchaseDate = new Date(order.date_created);

    if (!customerEmail) {
      return NextResponse.json({ error: 'No customer email' }, { status: 400 });
    }

    await initDb();
    const sql = getDb();

    await sql`
      INSERT INTO wax_reminders (order_id, customer_email, customer_name, product_names, purchase_date)
      VALUES (${orderId}, ${customerEmail}, ${customerName}, ${productNames}, ${purchaseDate})
      ON CONFLICT (order_id) DO NOTHING
    `;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
