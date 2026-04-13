import { Resend } from 'resend';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, text, projectTitle, price, files, sharedLink } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti: to, subject, text' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RESEND_API_KEY non configurata nelle variabili d\'ambiente Vercel' });
  }

  const resend = new Resend(apiKey);

  // ── HTML email ─────────────────────────────────────────────────────────────
  const fileListHtml = files && files.length > 0
    ? `<ul style="padding-left:20px;margin:8px 0;">${
        files.map(f => `<li style="margin:4px 0;font-size:14px;">${f.name}</li>`).join('')
      }</ul>`
    : '';

  const linkSection = sharedLink
    ? `<div style="margin:24px 0;text-align:center;">
        <a href="${sharedLink}"
           style="background:#7b1f24;color:#fff;padding:12px 28px;border-radius:6px;
                  text-decoration:none;font-size:15px;font-weight:600;display:inline-block;">
          Scarica i file →
        </a>
        <p style="font-size:11px;color:#999;margin-top:8px;">Il link scade tra 7 giorni</p>
      </div>`
    : '';

  const priceSection = price
    ? `<p style="margin:0;font-size:14px;color:#444;">
        <strong>Totale progetto:</strong> €${Number(price).toLocaleString('it-IT')}
      </p>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f9f7f4;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:8px;overflow:hidden;
                      border:1px solid #e8e4dc;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#7b1f24;padding:28px 32px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.12em;
                        text-transform:uppercase;color:rgba(255,255,255,0.7);">
                Altered Venganza
              </p>
              <h1 style="margin:6px 0 0;font-size:22px;color:#fff;font-weight:600;">
                ${projectTitle || 'Progetto completato'}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:15px;color:#1a1a1a;line-height:1.6;
                        white-space:pre-wrap;">${text}</p>
              ${fileListHtml ? `
              <div style="background:#f9f7f4;border-radius:6px;padding:16px;margin:20px 0;">
                <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.08em;
                          text-transform:uppercase;color:#7b7270;">File inclusi</p>
                ${fileListHtml}
              </div>` : ''}
              ${linkSection}
              ${priceSection}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9f7f4;padding:20px 32px;
                       border-top:1px solid #e8e4dc;">
              <p style="margin:0;font-size:11px;color:#999;text-align:center;">
                Altered Venganza Studio · alteredvenganza@gmail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Altered Venganza <onboarding@resend.dev>',
      to: [to],
      subject,
      html,
      text,
    });

    if (error) throw error;

    return res.status(200).json({ success: true, id: data?.id });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: err.message || 'Errore invio email' });
  }
}
