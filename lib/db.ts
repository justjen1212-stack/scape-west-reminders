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
}
