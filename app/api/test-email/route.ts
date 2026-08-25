import { NextResponse } from 'next/server';
import { sendWaxReminderEmail } from '@/lib/email';

export async function GET() {
  await sendWaxReminderEmail({
    to: 'sebineagu6@gmail.com',
    customerName: 'Sarah Johnson',
    productNames: 'Solid Oak Dining Table',
  });

  return NextResponse.json({ sent: true });
}
