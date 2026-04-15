/**
 * POST /api/revolut-sync
 * Proxies Revolut Business API so the token is never exposed in client-side code.
 * Body: { token: string, from?: string, to?: string }
 * Returns: Revolut transaction array
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { token, from, to } = req.body ?? {};
  if (!token) return res.status(400).json({ error: 'Token mancante nel body' });

  try {
    const url = new URL('https://b2b.revolut.com/api/1.0/transactions');
    if (from) url.searchParams.set('from', from);
    if (to)   url.searchParams.set('to', to);
    url.searchParams.set('count', '1000');
    url.searchParams.set('type', 'transfer');

    const resp = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (resp.status === 401) {
      return res.status(401).json({ error: 'Token non valido o scaduto. Rigenera il Personal Access Token su Revolut Business.' });
    }

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: `Revolut API ${resp.status}: ${text.slice(0, 200)}` });
    }

    const data = await resp.json();
    return res.json(Array.isArray(data) ? data : []);
  } catch (err) {
    return res.status(500).json({ error: 'Errore di rete: ' + err.message });
  }
}
