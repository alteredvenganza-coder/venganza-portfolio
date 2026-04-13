/**
 * POST /api/analyze-brief
 * Body: { files: [{ fileData: string (base64), mimeType: string }] }
 * Returns: { notes: string, steps: string[] }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GOOGLE_AI_API_KEY non configurata' });

  const { files } = req.body ?? {};
  if (!files?.length) return res.status(400).json({ error: 'Nessun file ricevuto' });

  const parts = files.map(({ fileData, mimeType }) => ({
    inline_data: { mime_type: mimeType, data: fileData },
  }));

  parts.push({ text: `Sei l'assistente di uno studio creativo italiano. Analizza questi screenshot/documenti (potrebbero essere conversazioni WhatsApp, email, brief, specifiche tecniche, note del cliente).

Estrai le informazioni rilevanti e restituisci SOLO un JSON valido in questo formato:
{
  "notes": "Riassunto dettagliato delle richieste del cliente, tono, obiettivi, vincoli e tutto ciò che è importante sapere per il progetto. Scrivi in italiano, in modo chiaro.",
  "steps": [
    "Step operativo 1 (azione concreta da fare)",
    "Step operativo 2",
    "Step operativo 3"
  ]
}

Gli step devono essere azioni concrete e specifiche, non generiche. Max 10 step. Scrivi in italiano.` });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body:    JSON.stringify({ contents: [{ parts }] }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: 'Gemini API error: ' + err });
    }

    const data  = await response.json();
    const text  = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
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
