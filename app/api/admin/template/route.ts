import { NextRequest, NextResponse } from 'next/server';
import { initDb, getEmailTemplate, saveEmailTemplate } from '@/lib/db';

export async function GET() {
  await initDb();
  const template = await getEmailTemplate();
  return NextResponse.json(template);
}

export async function POST(req: NextRequest) {
  const password = req.headers.get('x-admin-password');
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  await saveEmailTemplate(data);
  return NextResponse.json({ success: true });
}
