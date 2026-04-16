/**
 * POST /api/mat-ai-chat
 * Body: { prompt: string, system?: string, max_tokens?: number }
 * Returns: { text: string }
 *
 * Lightweight chat completion against Claude for the MAT AI panel.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurata' });

  const { prompt, system, max_tokens = 600 } = req.body ?? {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt mancante' });
  }

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens,
        system: system || 'Sei MAT AI, assistente creativo per brand di moda. Rispondi in italiano, conciso e ispirazionale.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!resp.ok) {
      const err = await resp.text();
      return res.status(resp.status).json({ error: 'Claude API error', detail: err.slice(0, 500) });
    }

    const data = await resp.json();
    const text = data?.content?.[0]?.text || '';
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: 'Errore interno', detail: String(e).slice(0, 200) });
  }
}
