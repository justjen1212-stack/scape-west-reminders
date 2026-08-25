import { NextResponse } from 'next/server';
import { sendOwnerApprovalEmail } from '@/lib/email';

export async function GET() {
  await sendOwnerApprovalEmail({
    customers: [
      {
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.johnson@example.com',
        productNames: 'Solid Oak Dining Table',
      },
      {
        customerName: 'James Carter',
        customerEmail: 'james.carter@example.com',
        productNames: 'Walnut Bedside Cabinet',
      },
    ],
    token: 'test-token-do-not-click',
  });

  return NextResponse.json({ sent: true });
}
