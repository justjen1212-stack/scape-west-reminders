import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb, initDb } from '@/lib/db';
import { sendOwnerApprovalEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await initDb();
  const sql = getDb();

  // Find customers at 90 days who haven't been emailed and haven't had an approval request sent yet
  const due = await sql`
    SELECT id, customer_email, customer_name, product_names
    FROM wax_reminders
    WHERE email_sent = FALSE
      AND approval_sent_at IS NULL
      AND purchase_date BETWEEN NOW() - INTERVAL '91 days' AND NOW() - INTERVAL '89 days'
  `;

  if (due.length === 0) {
    return NextResponse.json({ message: 'No reminders due today' });
  }

  // Generate a single token for this batch
  const token = crypto.randomBytes(32).toString('hex');

  // Tag all due records with this token
  const ids = due.map((r) => r.id);
  await sql`
    UPDATE wax_reminders
    SET approval_token = ${token}, approval_sent_at = NOW()
    WHERE id = ANY(${ids})
  `;

  // Send one approval email to the owner
  await sendOwnerApprovalEmail({
    customers: due.map((r) => ({
      customerName: r.customer_name ?? 'Unknown',
      customerEmail: r.customer_email,
      productNames: r.product_names ?? 'furniture',
    })),
    token,
  });

  return NextResponse.json({ message: `Approval email sent for ${due.length} customer(s)` });
}
