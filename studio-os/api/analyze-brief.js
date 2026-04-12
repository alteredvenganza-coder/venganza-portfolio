/**
 * POST /api/analyze-brief
 * Body: { files: [{ fileData: string (base64), mimeType: string }] }
 * Returns: { notes: string, steps: string[] }
 *
 * Analizza screenshot di chat, documenti, brief del cliente
 * e restituisce un riassunto + lista di step da fare.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurata' });

  const { files } = req.body ?? {};
  if (!files?.length) return res.status(400).json({ error: 'Nessun file ricevuto' });

  // Build content blocks — one per file
  const contentBlocks = files.map(({ fileData, mimeType }) => {
    const isImage = mimeType.startsWith('image/');
    const isPdf   = mimeType === 'application/pdf';
    if (isImage) return { type: 'image',    source: { type: 'base64', media_type: mimeType,          data: fileData } };
    if (isPdf)   return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: fileData } };
    return null;
  }).filter(Boolean);

  if (!contentBlocks.length) {
    return res.status(400).json({ error: 'Formato non supportato. Usa PNG, JPG, WEBP o PDF.' });
  }

  const prompt = `Sei l'assistente di uno studio creativo italiano. Analizza questi screenshot/documenti (potrebbero essere conversazioni WhatsApp, email, brief, specifiche tecniche, note del cliente).

Estrai le informazioni rilevanti e restituisci SOLO un JSON valido in questo formato:
{
  "notes": "Riassunto dettagliato delle richieste del cliente, tono, obiettivi, vincoli e tutto ciò che è importante sapere per il progetto. Scrivi in italiano, in modo chiaro.",
  "steps": [
    "Step operativo 1 (azione concreta da fare)",
    "Step operativo 2",
    "Step operativo 3"
  ]
}

Gli step devono essere azioni concrete e specifiche, non generiche. Max 10 step. Scrivi in italiano.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-opus-4-6',
        max_tokens: 2048,
        messages: [{
          role:    'user',
          content: [...contentBlocks, { type: 'text', text: prompt }],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: 'Anthropic API error: ' + err });
    }

    const data  = await response.json();
    const text  = data.content?.[0]?.text ?? '';
    const clean = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    let extracted;
    try {
      extracted = JSON.parse(clean);
    } catch {
      return res.status(500).json({ error: 'Impossibile parsare la risposta AI', raw: text });
    }

    return res.status(200).json({
      notes: extracted.notes ?? '',
      steps: Array.isArray(extracted.steps) ? extracted.steps : [],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
