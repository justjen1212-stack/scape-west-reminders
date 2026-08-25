import nodemailer from 'nodemailer';
import { getEmailTemplate } from '@/lib/db';

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendWaxReminderEmail({
  to,
  customerName,
  productNames,
}: {
  to: string;
  customerName: string;
  productNames: string;
}) {
  const firstName = customerName.split(' ')[0];
  const t = await getEmailTemplate();

  const intro = t.intro.replace('[product]', productNames);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Time to care for your furniture</title>
      </head>
      <body style="margin:0;padding:0;background-color:#f9f6f1;font-family:Georgia,serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f6f1;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

                <!-- Header -->
                <tr>
                  <td style="background-color:#2c1a0e;padding:32px 40px;text-align:center;">
                    <h1 style="color:#f5e6c8;margin:0;font-size:24px;letter-spacing:2px;text-transform:uppercase;">Scape West</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="color:#5c3d1e;font-size:16px;line-height:1.6;margin:0 0 16px;">Hi ${firstName},</p>

                    <p style="color:#5c3d1e;font-size:16px;line-height:1.6;margin:0 0 16px;">
                      ${intro}
                    </p>

                    <p style="color:#5c3d1e;font-size:16px;line-height:1.6;margin:0 0 24px;">
                      ${t.main_paragraph}
                    </p>

                    <!-- How to wax box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f6f1;border-left:4px solid #8b5e3c;border-radius:4px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <p style="color:#2c1a0e;font-size:15px;font-weight:bold;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">How to apply</p>
                          <ol style="color:#5c3d1e;font-size:15px;line-height:1.8;margin:0;padding-left:20px;">
                            <li>${t.step1}</li>
                            <li>${t.step2}</li>
                            <li>${t.step3}</li>
                            <li>${t.step4}</li>
                          </ol>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#5c3d1e;font-size:16px;line-height:1.6;margin:0 0 16px;">
                      ${t.recommendation}
                    </p>

                    <p style="color:#5c3d1e;font-size:16px;line-height:1.6;margin:0 0 32px;">
                      ${t.closing}
                    </p>

                    <p style="color:#5c3d1e;font-size:16px;line-height:1.6;margin:0;">
                      With care,<br />
                      <strong>The Scape West Team</strong>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color:#f0e8d8;padding:24px 40px;text-align:center;">
                    <p style="color:#8b7355;font-size:13px;margin:0;">
                      You're receiving this because you purchased from <a href="https://scape-west.co.uk" style="color:#8b5e3c;">scape-west.co.uk</a>.<br/>
                      Questions? Email us at <a href="mailto:hello@scape-west.co.uk" style="color:#8b5e3c;">hello@scape-west.co.uk</a>
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return getTransporter().sendMail({
    from: `"Scape West" <${process.env.GMAIL_USER}>`,
    to,
    subject: t.subject,
    html,
  });
}

export async function sendOwnerApprovalEmail({
  customers,
  token,
}: {
  customers: { customerName: string; customerEmail: string; productNames: string }[];
  token: string;
}) {
  const approveUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approve?token=${token}`;

  const rows = customers
    .map(
      (c) => `
      <tr>
        <td style="padding:10px 12px;color:#5c3d1e;font-size:14px;border-bottom:1px solid #f0e8d8;">${c.customerName}</td>
        <td style="padding:10px 12px;color:#5c3d1e;font-size:14px;border-bottom:1px solid #f0e8d8;">${c.customerEmail}</td>
        <td style="padding:10px 12px;color:#5c3d1e;font-size:14px;border-bottom:1px solid #f0e8d8;">${c.productNames}</td>
      </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8" /><title>Wax Reminder Approval</title></head>
      <body style="margin:0;padding:0;background-color:#f9f6f1;font-family:Georgia,serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f6f1;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="620" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

                <tr>
                  <td style="background-color:#2c1a0e;padding:28px 40px;text-align:center;">
                    <h1 style="color:#f5e6c8;margin:0;font-size:20px;letter-spacing:2px;text-transform:uppercase;">Scape West</h1>
                    <p style="color:#c9a87a;margin:6px 0 0;font-size:13px;letter-spacing:1px;">Wax Reminder Approval</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:32px 40px;">
                    <p style="color:#5c3d1e;font-size:16px;line-height:1.6;margin:0 0 8px;">
                      The following <strong>${customers.length} customer${customers.length > 1 ? 's' : ''}</strong> purchased furniture 90 days ago and are due to receive a wax care reminder:
                    </p>

                    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid #e8ddd0;border-radius:6px;overflow:hidden;">
                      <tr style="background-color:#f0e8d8;">
                        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">Name</th>
                        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">Email</th>
                        <th style="padding:10px 12px;text-align:left;font-size:12px;color:#8b7355;text-transform:uppercase;letter-spacing:1px;">Product</th>
                      </tr>
                      ${rows}
                    </table>

                    <p style="color:#5c3d1e;font-size:15px;margin:0 0 24px;">Click below to approve and send the wax reminder emails to all of them:</p>

                    <a href="${approveUrl}" style="display:inline-block;background-color:#2c1a0e;color:#f5e6c8;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;letter-spacing:1px;">
                      Approve &amp; Send Emails
                    </a>

                    <p style="color:#8b7355;font-size:13px;margin:24px 0 0;">If you don't want to send these emails, just ignore this message.</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return getTransporter().sendMail({
    from: `"Scape West" <${process.env.GMAIL_USER}>`,
    to: process.env.OWNER_EMAIL!,
    subject: `Action needed: ${customers.length} wax reminder${customers.length > 1 ? 's' : ''} ready to send`,
    html,
  });
}
