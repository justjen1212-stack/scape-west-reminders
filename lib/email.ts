import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

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
                      It's been 3 months since your <strong>${productNames}</strong> arrived — and that's the perfect time to give it a little love.
                    </p>

                    <p style="color:#5c3d1e;font-size:16px;line-height:1.6;margin:0 0 24px;">
                      Applying a fresh coat of furniture wax every few months keeps the wood nourished, protected from moisture, and looking as beautiful as the day it arrived.
                    </p>

                    <!-- How to wax box -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f6f1;border-left:4px solid #8b5e3c;border-radius:4px;margin-bottom:24px;">
                      <tr>
                        <td style="padding:20px 24px;">
                          <p style="color:#2c1a0e;font-size:15px;font-weight:bold;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px;">How to apply</p>
                          <ol style="color:#5c3d1e;font-size:15px;line-height:1.8;margin:0;padding-left:20px;">
                            <li>Dust the surface with a clean, dry cloth</li>
                            <li>Apply a small amount of furniture wax with a soft cloth in circular motions</li>
                            <li>Leave for 5–10 minutes to absorb</li>
                            <li>Buff to a gentle shine with a clean cloth</li>
                          </ol>
                        </td>
                      </tr>
                    </table>

                    <p style="color:#5c3d1e;font-size:16px;line-height:1.6;margin:0 0 16px;">
                      We recommend a good quality beeswax or natural furniture wax — avoid silicone-based products as they can build up over time.
                    </p>

                    <p style="color:#5c3d1e;font-size:16px;line-height:1.6;margin:0 0 32px;">
                      If you have any questions about caring for your piece, just reply to this email — we're always happy to help.
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

  return resend.emails.send({
    from: 'Scape West <hello@scape-west.co.uk>',
    to,
    subject: 'Time to care for your furniture ✨',
    html,
  });
}
