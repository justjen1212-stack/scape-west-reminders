import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb, initDb } from '@/lib/db';
import { sendOwnerApprovalEmail } from '@/lib/email';

export async function GET() {
  await initDb();
  const sql = getDb();

  // Insert a fake order dated 90 days ago
  const fakeOrderId = `test-${Date.now()}`;
  await sql`
    INSERT INTO wax_reminders (order_id, customer_email, customer_name, product_names, purchase_date)
    VALUES (${fakeOrderId}, 'sebineagu6@gmail.com', 'Sarah Johnson', 'Solid Oak Dining Table', NOW() - INTERVAL '90 days')
    ON CONFLICT (order_id) DO NOTHING
  `;

  // Generate approval token and tag the record
  const token = crypto.randomBytes(32).toString('hex');
  await sql`
    UPDATE wax_reminders
    SET approval_token = ${token}, approval_sent_at = NOW()
    WHERE order_id = ${fakeOrderId}
  `;

  // Send approval email to owner
  await sendOwnerApprovalEmail({
    customers: [
      {
        customerName: 'Sarah Johnson',
        customerEmail: 'sebineagu6@gmail.com',
        productNames: 'Solid Oak Dining Table',
      },
    ],
    token,
  });

  return NextResponse.json({ sent: true, message: 'Approval email sent to justjen1212@gmail.com' });
}
