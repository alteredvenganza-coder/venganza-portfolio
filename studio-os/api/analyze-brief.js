/**
 * POST /api/analyze-brief
 * Body: { files: [{ fileData: string (base64), mimeType: string }] }
 * Returns: { notes, steps[], budget, deadline, projectType, clientInfo, materials, toneOfVoice, references }
 *
 * Uses Claude Haiku for fast, cheap, accurate extraction from any document/screenshot.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurata' });

  const { files } = req.body ?? {};
  if (!files?.length) return res.status(400).json({ error: 'Nessun file ricevuto' });

  // Build Claude messages with images
  const content = [];

  for (const { fileData, mimeType } of files) {
    const mediaType = mimeType || 'image/png';
    // Claude supports image/jpeg, image/png, image/gif, image/webp
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
    text: `Sei l'assistente AI di uno studio creativo italiano chiamato "Altered Venganza". Analizza questi screenshot/documenti con estrema attenzione. Potrebbero essere: conversazioni WhatsApp, email, brief, contratti, specifiche tecniche, moodboard, note del cliente, PDF.

Estrai TUTTE le informazioni utili e restituisci SOLO un JSON valido (nessun testo prima o dopo) in questo formato:

{
  "notes": "Riassunto dettagliato e ben organizzato di tutto ciò che emerge: richieste, obiettivi, vincoli, preferenze, contesto. Scrivi in italiano, chiaro e professionale.",
  "steps": [
    "Step operativo concreto 1 (es: Raccogliere materiali fotografici dal cliente)",
    "Step operativo concreto 2",
    "..."
  ],
  "budget": null o numero (se viene menzionato un prezzo/budget/compenso),
  "deadline": null o "YYYY-MM-DD" (se viene menzionata una scadenza/data di consegna),
  "projectType": null o uno tra "fashion", "branding", "edilizia", "app", "premade", "retainer", "other",
  "clientInfo": {
    "name": null o "nome del cliente/referente",
    "brand": null o "nome brand/azienda",
    "email": null o "email",
    "phone": null o "telefono"
  },
  "materials": ["lista di materiali/deliverable richiesti, es: lookbook, logo, sito web, rendering"],
  "toneOfVoice": null o "descrizione breve del tono/stile richiesto (es: minimal, lusso, urban, streetwear)",
  "references": null o "descrizione di riferimenti visivi/stilistici menzionati"
}

REGOLE:
- Gli step devono essere azioni concrete e specifiche, non generiche. Max 12 step.
- Se un campo non è presente nei documenti, metti null (non inventare).
- budget deve essere un numero intero senza simboli (es: 800, non "€800").
- Scrivi tutto in italiano.
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
        model: 'claude-haiku-4-20250414',
        max_tokens: 2048,
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

    return res.status(200).json({
      notes:       extracted.notes ?? '',
      steps:       Array.isArray(extracted.steps) ? extracted.steps : [],
      budget:      extracted.budget ?? null,
      deadline:    extracted.deadline ?? null,
      projectType: extracted.projectType ?? null,
      clientInfo:  extracted.clientInfo ?? null,
      materials:   Array.isArray(extracted.materials) ? extracted.materials : [],
      toneOfVoice: extracted.toneOfVoice ?? null,
      references:  extracted.references ?? null,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
