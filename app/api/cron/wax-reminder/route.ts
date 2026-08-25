import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendWaxReminderEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  // Verify this is called by Vercel Cron
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getDb();

  // Find customers who purchased 90 days ago (±1 day window) and haven't been emailed
  const reminders = await sql`
    SELECT id, customer_email, customer_name, product_names
    FROM wax_reminders
    WHERE email_sent = FALSE
      AND purchase_date BETWEEN NOW() - INTERVAL '91 days' AND NOW() - INTERVAL '89 days'
  `;

  const results = [];

  for (const reminder of reminders) {
    try {
      await sendWaxReminderEmail({
        to: reminder.customer_email,
        customerName: reminder.customer_name ?? 'there',
        productNames: reminder.product_names ?? 'furniture',
      });

      await sql`
        UPDATE wax_reminders
        SET email_sent = TRUE, email_sent_at = NOW()
        WHERE id = ${reminder.id}
      `;

      results.push({ email: reminder.customer_email, status: 'sent' });
    } catch (err) {
      console.error(`Failed to send to ${reminder.customer_email}:`, err);
      results.push({ email: reminder.customer_email, status: 'failed' });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
