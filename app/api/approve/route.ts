import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { sendWaxReminderEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return new NextResponse('Missing token', { status: 400 });
  }

  const sql = getDb();

  const reminders = await sql`
    SELECT id, customer_email, customer_name, product_names
    FROM wax_reminders
    WHERE approval_token = ${token}
      AND email_sent = FALSE
  `;

  if (reminders.length === 0) {
    return new NextResponse(
      renderPage('Already sent', 'These emails have already been sent or the link is invalid.'),
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  let sent = 0;
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

      sent++;
    } catch (err) {
      console.error(`Failed to send to ${reminder.customer_email}:`, err);
    }
  }

  return new NextResponse(
    renderPage(
      'Emails sent!',
      `${sent} wax reminder email${sent !== 1 ? 's' : ''} successfully sent to your customers.`
    ),
    { headers: { 'Content-Type': 'text/html' } }
  );
}

function renderPage(heading: string, message: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${heading} — Scape West</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f9f6f1;font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
    <div style="text-align:center;padding:40px;">
      <h1 style="color:#2c1a0e;font-size:22px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Scape West</h1>
      <div style="background:#fff;border-radius:8px;padding:32px 40px;box-shadow:0 2px 8px rgba(0,0,0,0.06);max-width:420px;margin:24px auto 0;">
        <p style="color:#2c1a0e;font-size:18px;font-weight:bold;margin:0 0 12px;">${heading}</p>
        <p style="color:#5c3d1e;font-size:15px;line-height:1.6;margin:0;">${message}</p>
      </div>
    </div>
  </body>
</html>`;
}
