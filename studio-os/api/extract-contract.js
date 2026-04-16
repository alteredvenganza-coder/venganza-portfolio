/**
 * POST /api/extract-contract
 * Body: { fileData: string (base64), mimeType: string }
 * Returns: { client: {...}, project: {...} }
 *
 * Uses Claude Haiku for contract/document analysis and data extraction.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurata' });

  const { fileData, mimeType } = req.body ?? {};
  if (!fileData || !mimeType) return res.status(400).json({ error: 'fileData e mimeType sono obbligatori' });

  const isImage = mimeType.startsWith('image/');
  const isPdf   = mimeType === 'application/pdf';
  if (!isImage && !isPdf) return res.status(400).json({ error: 'Formato non supportato. Usa PNG, JPG, WEBP o PDF.' });

  const content = [];

  if (isImage) {
    content.push({
      type: 'image',
      source: { type: 'base64', media_type: mimeType, data: fileData },
    });
  } else {
    content.push({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: fileData },
    });
  }

  content.push({
    type: 'text',
    text: `Sei un assistente per uno studio creativo italiano chiamato "Altered Venganza". Analizza questo contratto/documento e estrai le informazioni del cliente e del progetto.

Restituisci SOLO un oggetto JSON valido, senza testo aggiuntivo, in questo formato esatto:
{
  "client": {
    "name": "nome completo del cliente o referente",
    "brand": "nome azienda/brand (se presente, altrimenti stringa vuota)",
    "email": "email (se presente, altrimenti stringa vuota)",
    "phone": "telefono (se presente, altrimenti stringa vuota)",
    "language": "Italiano o English o Español o Français o Deutsch (in base alla lingua del documento)",
    "notes": "informazioni aggiuntive rilevanti sul cliente (indirizzo, P.IVA, ecc)"
  },
  "project": {
    "title": "titolo descrittivo del progetto",
    "description": "descrizione del lavoro da fare, max 3 righe",
    "type": "fashion oppure branding oppure edilizia oppure app oppure premade oppure retainer oppure other",
    "price": numero intero o null (se non specificato),
    "deadline": "YYYY-MM-DD oppure null (se non specificata)",
    "nextAction": "prima cosa da fare dopo la firma del contratto"
  }
}

Se un campo non è presente nel documento, usa stringa vuota per stringhe o null per numeri/date. Non inventare informazioni.`,
  });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: 'Claude API error: ' + err });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '';
    const clean = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    let extracted;
    try {
      extracted = JSON.parse(clean);
    } catch {
      return res.status(500).json({ error: 'Impossibile parsare la risposta AI', raw: text });
    }

    return res.status(200).json(extracted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
