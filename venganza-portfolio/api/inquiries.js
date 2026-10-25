import { randomBytes } from 'node:crypto';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[c]));
const plain = (value, max) => String(value ?? '').trim().slice(0, max);
const allowedMime = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
const formatPrice = value => plain(value, 80);
const deliver = async (key, message) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('Inquiry email provider rejected the request:', response.status, data.name || 'provider error');
    throw new Error('Email delivery is temporarily unavailable.');
  }
  return data;
};

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') {
    return res.status(200).json({ available: Boolean(process.env.RESEND_API_KEY && process.env.INQUIRY_FROM_EMAIL) });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.INQUIRY_FROM_EMAIL;
  const recipient = process.env.INQUIRY_TO_EMAIL || 'studio@alteredvenganza.com';
  if (!apiKey || !sender) return res.status(503).json({ error: 'Inquiry delivery is not yet configured. Please contact studio@alteredvenganza.com.' });

  const input = req.body || {};
  if (input.company) return res.status(200).json({ ok: true, reference: 'RECEIVED', confirmationSent: false });
  const name = plain(input.name, 120);
  const email = plain(input.email, 200);
  const phone = plain(input.phone, 40);
  const budget = plain(input.budget, 80);
  const message = plain(input.message, 5000);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message || !budget)
    return res.status(400).json({ error: 'Please enter name, a valid email, budget and project description.' });
  if (!Array.isArray(input.services) || input.services.length > 12 || !Array.isArray(input.attachments) || input.attachments.length > 3)
    return res.status(400).json({ error: 'Too many services or attachments.' });
  const services = input.services.map(s => ({ title: plain(s?.title, 120), tier: plain(s?.tier, 100), priceDisplay: formatPrice(s?.priceDisplay) }));
  if (services.some(s => !s.title)) return res.status(400).json({ error: 'Invalid service.' });
  let total = 0;
  const attachments = [];
  for (const attachment of input.attachments) {
    if (!allowedMime.has(attachment?.mime) || !/^[a-zA-Z0-9+/]*={0,2}$/.test(String(attachment.content || '')))
      return res.status(400).json({ error: 'Unsupported attachment format.' });
    const raw = Buffer.from(attachment.content, 'base64');
    total += raw.byteLength;
    if (raw.length === 0 || total > 2 * 1024 * 1024) return res.status(413).json({ error: 'Attachments exceed the 2 MB limit.' });
    const filename = plain(attachment.name, 90).replace(/[\\/\x00-\x1f]/g, '_') || 'reference';
    attachments.push({ filename, content: raw.toString('base64') });
  }

  const reference = 'AV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + randomBytes(3).toString('hex').toUpperCase();
  const rows = services.length ? services.map(s =>
    '<tr><td style="padding:8px;border-bottom:1px solid #ddd">' + esc(s.title) + '</td><td style="padding:8px;border-bottom:1px solid #ddd">' + esc(s.tier || s.priceDisplay || 'Quote on request') + '</td></tr>'
  ).join('') : '<tr><td colspan="2" style="padding:8px">General project inquiry</td></tr>';
  const receipt = '<div style="font-family:Arial,sans-serif;color:#162127;max-width:600px;margin:auto">' +
    '<p style="font-size:11px;letter-spacing:2px;color:#7b1f24">ALTERED VENGANZA / INQUIRY RECEIPT</p>' +
    '<h1 style="font-size:28px">New studio inquiry</h1><p>Reference: <strong>' + esc(reference) + '</strong></p>' +
    '<hr style="border:0;border-top:1px dashed #aaa"/><table style="width:100%;border-collapse:collapse">' +
    '<tr><td>Name</td><td>' + esc(name) + '</td></tr>' +
    '<tr><td>Email</td><td>' + esc(email) + '</td></tr>' +
    '<tr><td>Phone</td><td>' + esc(phone || 'Not provided') + '</td></tr>' +
    '<tr><td>Budget</td><td>' + esc(budget) + '</td></tr>' +
    '</table><h2 style="font-size:15px;margin-top:25px">Selected services</h2>' +
    '<table style="width:100%;border-collapse:collapse">' + rows + '</table>' +
    '<h2 style="font-size:15px;margin-top:25px">Project brief</h2><p style="white-space:pre-wrap;line-height:1.6">' + esc(message) + '</p>' +
    '<p style="font-size:11px;color:#777">This is a request for information, not an order or a payment. Estimated prices are indicative.</p></div>';

  try {
    await deliver(apiKey, {
      from: sender, to: [recipient], reply_to: email,
      subject: '[' + reference + '] New inquiry — ' + name,
      html: receipt, attachments
    });
    let confirmationSent = false;
    try {
      await deliver(apiKey, {
        from: sender, to: [email], reply_to: recipient,
        subject: 'Your inquiry receipt — ' + reference,
        html: receipt.replace('<h1 style="font-size:28px">New studio inquiry</h1>', '<h1 style="font-size:28px">We received your inquiry.</h1>')
      });
      confirmationSent = true;
    } catch (err) {
      console.error('Client confirmation email could not be delivered:', err.message);
    }
    return res.status(200).json({ ok: true, reference, confirmationSent });
  } catch (err) {
    console.error('Inquiry delivery error:', err.message);
    return res.status(502).json({ error: 'Unable to send your inquiry. Please retry or email studio@alteredvenganza.com.' });
  }
}
