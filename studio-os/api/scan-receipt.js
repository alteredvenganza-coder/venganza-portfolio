/**
 * POST /api/scan-receipt
 * Body: { files: [{ fileData: string (base64), mimeType: string }] }
 * Returns: { entries: [{ type, amount, category, description, date }] }
 *
 * Uses Claude Sonnet to extract financial entries from receipt/invoice images or PDFs.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurata' });

  const { files } = req.body ?? {};
  if (!files?.length) return res.status(400).json({ error: 'Nessun file ricevuto' });

  // Build Claude messages with images/PDFs
  const content = [];

  for (const { fileData, mimeType } of files) {
    const mediaType = mimeType || 'image/png';
    if (mediaType.startsWith('image/')) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: fileData },
      });
    } else if (mediaType === 'application/pdf') {
      content.push({
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: fileData },
      });
    }
  }

  content.push({
    type: 'text',
    text: `Sei un assistente finanziario AI. Analizza queste immagini/documenti di ricevute, fatture, estratti conto, email di pagamento o screenshot finanziari.

Estrai TUTTE le transazioni finanziarie visibili e restituisci SOLO un JSON valido (nessun testo prima o dopo) in questo formato:

{
  "entries": [
    {
      "type": "entrata" o "uscita",
      "amount": numero (solo il valore, senza simboli valuta),
      "category": "categoria appropriata (vedi sotto)",
      "description": "descrizione breve: venditore/fornitore + cosa e' stato pagato/ricevuto",
      "date": "YYYY-MM-DD"
    }
  ]
}

TIPO:
- "uscita" per acquisti, pagamenti, abbonamenti, spese, bollette, tasse
- "entrata" per pagamenti ricevuti (Stripe, bonifici in entrata, fatture pagate dal cliente, rimborsi)

CATEGORIE per uscite: 'Software & Tools', 'Marketing', 'Attrezzatura', 'Formazione', 'Fisco & Tasse', 'Ristoranti & Food', 'Spesa alimentare', 'Shopping', 'Trasporti', 'Casa & Utenze', 'Salute & Farmacia', 'Svago & Sport', 'Abbonamenti', 'Altro'
CATEGORIE per entrate: 'Fattura cliente', 'Acconto', 'Saldo', 'Retainer mensile', 'Vendita prodotto', 'Rimborso', 'Altro'

REGOLE:
- Puoi estrarre PIU' voci da un singolo documento (es. estratto conto con piu' righe).
- amount deve essere un numero positivo (es: 29.99, non -29.99 o "29,99").
- Se la data non e' visibile, usa la data odierna: ${new Date().toISOString().split('T')[0]}.
- description deve essere breve e utile (es: "Netflix - abbonamento mensile", "Esselunga - spesa settimanale").
- Restituisci SOLO il JSON, niente altro.`,
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
        max_tokens: 4096,
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

    const entries = Array.isArray(extracted.entries) ? extracted.entries : [];

    return res.status(200).json({
      entries: entries.map(e => ({
        type:        e.type === 'entrata' ? 'entrata' : 'uscita',
        amount:      Math.abs(Number(e.amount)) || 0,
        category:    e.category || 'Altro',
        description: e.description || '',
        date:        e.date || new Date().toISOString().split('T')[0],
      })).filter(e => e.amount > 0),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
