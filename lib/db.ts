import { neon } from '@neondatabase/serverless';

export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return sql;
}

export async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS wax_reminders (
      id SERIAL PRIMARY KEY,
      order_id VARCHAR(255) UNIQUE NOT NULL,
      customer_email VARCHAR(255) NOT NULL,
      customer_name VARCHAR(255),
      product_names TEXT,
      purchase_date TIMESTAMP NOT NULL,
      email_sent BOOLEAN DEFAULT FALSE,
      email_sent_at TIMESTAMP,
      approval_token VARCHAR(255),
      approval_sent_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Add approval columns if they don't exist yet (for existing tables)
  await sql`ALTER TABLE wax_reminders ADD COLUMN IF NOT EXISTS approval_token VARCHAR(255)`;
  await sql`ALTER TABLE wax_reminders ADD COLUMN IF NOT EXISTS approval_sent_at TIMESTAMP`;

  await sql`
    CREATE TABLE IF NOT EXISTS email_template (
      id INT PRIMARY KEY DEFAULT 1,
      subject TEXT NOT NULL DEFAULT 'Time to care for your furniture ✨',
      intro TEXT NOT NULL DEFAULT 'It''s been 3 months since your [product] arrived — and that''s the perfect time to give it a little love.',
      main_paragraph TEXT NOT NULL DEFAULT 'Applying a fresh coat of furniture wax every few months keeps the wood nourished, protected from moisture, and looking as beautiful as the day it arrived.',
      step1 TEXT NOT NULL DEFAULT 'Dust the surface with a clean, dry cloth',
      step2 TEXT NOT NULL DEFAULT 'Apply a small amount of furniture wax with a soft cloth in circular motions',
      step3 TEXT NOT NULL DEFAULT 'Leave for 5–10 minutes to absorb',
      step4 TEXT NOT NULL DEFAULT 'Buff to a gentle shine with a clean cloth',
      recommendation TEXT NOT NULL DEFAULT 'We recommend a good quality beeswax or natural furniture wax — avoid silicone-based products as they can build up over time.',
      closing TEXT NOT NULL DEFAULT 'If you have any questions about caring for your piece, just reply to this email — we''re always happy to help.',
      CONSTRAINT single_row CHECK (id = 1)
    )
  `;

  // Insert default row if not exists
  await sql`
    INSERT INTO email_template (id) VALUES (1) ON CONFLICT (id) DO NOTHING
  `;
}

export async function getEmailTemplate() {
  const sql = getDb();
  const rows = await sql`SELECT * FROM email_template WHERE id = 1`;
  return rows[0];
}

export async function saveEmailTemplate(data: {
  subject: string;
  intro: string;
  main_paragraph: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  recommendation: string;
  closing: string;
}) {
  const sql = getDb();
  await sql`
    UPDATE email_template SET
      subject = ${data.subject},
      intro = ${data.intro},
      main_paragraph = ${data.main_paragraph},
      step1 = ${data.step1},
      step2 = ${data.step2},
      step3 = ${data.step3},
      step4 = ${data.step4},
      recommendation = ${data.recommendation},
      closing = ${data.closing}
    WHERE id = 1
  `;
}
