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

async function hasFurnitureProduct(productIds: number[]): Promise<{ found: boolean; names: string[] }> {
  const auth = Buffer.from(
    `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
  ).toString('base64');

  const furnitureNames: string[] = [];

  for (const productId of productIds) {
    const res = await fetch(`https://scape-west.co.uk/wp-json/wc/v3/products/${productId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) continue;

    const product = await res.json();
    const categories: { name: string; slug: string }[] = product.categories ?? [];
    const isFurniture = categories.some(
      (c) => c.slug.toLowerCase().includes('furniture') || c.name.toLowerCase().includes('furniture')
    );

    if (isFurniture) furnitureNames.push(product.name);
  }

  return { found: furnitureNames.length > 0, names: furnitureNames };
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
    const purchaseDate = new Date(order.date_created);

    if (!customerEmail) {
      return NextResponse.json({ error: 'No customer email' }, { status: 400 });
    }

    // Only process completed orders
    if (order.status !== 'completed') {
      return NextResponse.json({ success: true, skipped: `order status is ${order.status}` });
    }

    // Check if any product in the order is furniture
    const productIds = (order.line_items ?? []).map((item: { product_id: number }) => item.product_id);
    const { found, names } = await hasFurnitureProduct(productIds);

    if (!found) {
      return NextResponse.json({ success: true, skipped: 'no furniture products in order' });
    }

    await initDb();
    const sql = getDb();

    await sql`
      INSERT INTO wax_reminders (order_id, customer_email, customer_name, product_names, purchase_date)
      VALUES (${orderId}, ${customerEmail}, ${customerName}, ${names.join(', ')}, ${purchaseDate})
      ON CONFLICT (order_id) DO NOTHING
    `;

    return NextResponse.json({ success: true, furnitureProducts: names });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
